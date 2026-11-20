import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase } from "@/lib/db/store";
import { validateGSTINFormat } from "@/lib/kyc/kyc-engine";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    const profile = db.clients.find((c) => c.userId === auth.user.id);

    if (!profile) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile, user: auth.user });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, companyWebsite, clientType, gstin, city, state, pincode } = body;

    const db = getDatabase();
    const profile = db.clients.find((c) => c.userId === auth.user.id);

    if (!profile) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    if (companyName) profile.companyName = companyName;
    if (companyWebsite !== undefined) profile.companyWebsite = companyWebsite;
    if (clientType) profile.clientType = clientType;
    if (city) profile.city = city;
    if (state) profile.state = state;
    if (pincode) profile.pincode = pincode;

    if (gstin) {
      const isValid = validateGSTINFormat(gstin);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid 15-character Indian GSTIN format (e.g. 29AABCU9603R1ZM)" },
          { status: 400 }
        );
      }
      profile.gstin = gstin.trim().toUpperCase();
      profile.isGstVerified = true;
    }

    saveDatabase(db);

    return NextResponse.json({ success: true, message: "Client profile updated successfully", profile });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update client profile" }, { status: 500 });
  }
}
