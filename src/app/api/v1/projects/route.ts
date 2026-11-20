import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBProject, DBAuditLog } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const budgetType = searchParams.get("budgetType");
    const search = searchParams.get("q");
    const clientId = searchParams.get("clientId");

    const db = getDatabase();
    let projects = [...db.projects];

    if (clientId) {
      projects = projects.filter((p) => p.clientId === clientId);
    }
    if (category && category !== "All") {
      projects = projects.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (budgetType && budgetType !== "All") {
      projects = projects.filter((p) => p.budgetType === budgetType);
    }
    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skillsRequired.some((s) => s.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as a Client." }, { status: 401 });
    }

    if (auth.user.role !== "CLIENT" && auth.user.role !== "SUPER_ADMIN" && auth.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only verified Clients can post new projects." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, budgetType, budgetINR, duration, skillsRequired } = body;

    if (!title || title.trim().length < 5) {
      return NextResponse.json({ error: "Title must be at least 5 characters long." }, { status: 400 });
    }
    if (!description || description.trim().length < 20) {
      return NextResponse.json({ error: "Description must be at least 20 characters long." }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }
    if (!["FIXED", "HOURLY"].includes(budgetType)) {
      return NextResponse.json({ error: "Budget type must be FIXED or HOURLY." }, { status: 400 });
    }
    const numBudget = Number(budgetINR);
    if (isNaN(numBudget) || numBudget < 1000) {
      return NextResponse.json({ error: "Minimum project budget is ₹1,000." }, { status: 400 });
    }

    const db = getDatabase();
    const clientProfile = db.clients.find((c) => c.userId === auth.user.id) || db.clients[0];

    const projectId = `proj-${Date.now()}`;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 80);

    const newProject: DBProject = {
      id: projectId,
      clientId: clientProfile.id,
      clientName: auth.user.fullName,
      clientCompany: clientProfile.companyName || auth.user.fullName,
      clientCity: clientProfile.city || "Bengaluru",
      title: title.trim(),
      slug,
      description: description.trim(),
      category,
      budgetType,
      budgetINR: numBudget,
      duration: duration || "1 to 3 months",
      skillsRequired: Array.isArray(skillsRequired) && skillsRequired.length > 0 ? skillsRequired : ["General"],
      status: "PUBLISHED",
      proposalsCount: 0,
      isClientVerified: clientProfile.isGstVerified || clientProfile.isVerifiedBadge,
      createdAt: new Date().toISOString(),
    };

    db.projects.unshift(newProject);
    clientProfile.projectsPostedCount = (clientProfile.projectsPostedCount || 0) + 1;

    // Audit log
    const audit: DBAuditLog = {
      id: `aud-${Date.now()}`,
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorIp: req.headers.get("x-forwarded-for") || "127.0.0.1",
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: projectId,
      newState: { title: newProject.title, budgetINR: numBudget, category },
      reason: "Client published new marketplace project requirement",
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(audit);

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Project published successfully to KaryaSetu marketplace.",
      project: newProject,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}
