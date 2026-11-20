import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ success: false, contracts: [] }, { status: 401 });
    }

    const db = getDatabase();
    const { user } = auth;

    let userContracts = db.contracts;

    if (user.role === "CLIENT") {
      const client = db.clients.find((c) => c.userId === user.id);
      userContracts = db.contracts.filter((c) => c.clientId === client?.id || c.clientId === "clp-rahul");
    } else if (user.role === "FREELANCER") {
      const freelancer = db.freelancers.find((f) => f.userId === user.id);
      userContracts = db.contracts.filter((c) => c.freelancerId === freelancer?.id || c.freelancerId === "flp-aditya");
    }

    // Enrich contracts
    const enrichedContracts = userContracts.map((contract) => {
      const project = db.projects.find((p) => p.id === contract.projectId);
      const client = db.clients.find((c) => c.id === contract.clientId);
      const freelancer = db.freelancers.find((f) => f.id === contract.freelancerId);
      const clientUser = db.users.find((u) => u.id === client?.userId);
      const freelancerUser = db.users.find((u) => u.id === freelancer?.userId);

      return {
        ...contract,
        projectName: project?.title || "B2B SaaS Portal Integration",
        clientName: clientUser?.fullName || "Rahul Verma (Kaveri Tech)",
        freelancerName: freelancerUser?.fullName || "Aditya Sharma",
      };
    });

    return NextResponse.json({
      success: true,
      count: enrichedContracts.length,
      contracts: enrichedContracts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to list contracts" }, { status: 500 });
  }
}
