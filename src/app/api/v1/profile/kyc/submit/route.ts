import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase } from "@/lib/db/store";
import { 
  validatePANFormat, 
  validateIFSCFormat, 
  maskAadhaarNumber, 
  executePennyDropVerification 
} from "@/lib/kyc/kyc-engine";

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      panNumber,
      panHolderName,
      aadhaarNumber,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
    } = body;

    // 1. Mandatory Validations
    if (!panNumber || !panHolderName || !aadhaarNumber || !accountNumber || !ifscCode || !bankName) {
      return NextResponse.json(
        { error: "PAN, Aadhaar, and complete Bank Account details are mandatory for Indian KYC" },
        { status: 400 }
      );
    }

    if (!validatePANFormat(panNumber)) {
      return NextResponse.json(
        { error: "Invalid PAN format. Must be 10 characters (5 letters, 4 digits, 1 letter e.g. ABCPS1234F)" },
        { status: 400 }
      );
    }

    if (!validateIFSCFormat(ifscCode)) {
      return NextResponse.json(
        { error: "Invalid bank IFSC code format (e.g. HDFC0001234)" },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const freelancer = db.freelancers.find((f) => f.userId === auth.user.id);

    if (!freelancer) {
      return NextResponse.json(
        { error: "Only registered Freelancers can submit KYC for payout clearance" },
        { status: 400 }
      );
    }

    // 2. Execute Penny-Drop Verification
    const pennyResult = await executePennyDropVerification(
      accountNumber,
      ifscCode,
      accountHolderName || panHolderName
    );

    if (pennyResult.status !== "SUCCESS") {
      return NextResponse.json(
        { error: `Penny drop bank validation failed: ${pennyResult.message}` },
        { status: 422 }
      );
    }

    // 3. Mask Aadhaar and update freelancer state
    const maskedAadhaar = maskAadhaarNumber(aadhaarNumber);
    const maskedAccount = "XXXXXX" + accountNumber.slice(-4);

    // Save Bank Account
    const newBank = {
      id: `bnk-${Date.now()}`,
      accountHolderName: accountHolderName || panHolderName,
      accountNumberMasked: maskedAccount,
      ifscCode: ifscCode.toUpperCase(),
      bankName,
      isPrimary: true,
      verificationStatus: "PENNY_DROP_VERIFIED" as const,
    };

    freelancer.bankAccounts = [newBank];
    freelancer.kycStatus = "APPROVED";
    freelancer.isVerifiedBadge = true;

    // Add Audit Log
    db.auditLogs.push({
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "KYC_VERIFIED_PENNY_DROP",
      entityType: "FREELANCER_KYC",
      entityId: freelancer.id,
      newState: {
        pan: panNumber.toUpperCase(),
        aadhaar: maskedAadhaar,
        bank: maskedAccount,
        pennyRef: pennyResult.pennyReference,
        nameMatchScore: pennyResult.nameMatchScorePercentage,
      },
      reason: "Automated CBDT PAN format validation and IMPS penny-drop verification succeeded.",
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Indian KYC and Bank Penny-Drop Verification completed successfully!",
      kycStatus: "APPROVED",
      pennyDrop: pennyResult,
      freelancer,
    });
  } catch (error: any) {
    console.error("KYC Submit API Error:", error);
    return NextResponse.json({ error: "Internal server error processing KYC" }, { status: 500 });
  }
}
