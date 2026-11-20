import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.toLowerCase();
    const skill = searchParams.get("skill")?.toLowerCase();
    const city = searchParams.get("city")?.toLowerCase();
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";

    const db = getDatabase();

    // Map each freelancer profile to an enriched object including user information
    let list = db.freelancers
      .map((f) => {
        const user = db.users.find((u) => u.id === f.userId);
        return {
          id: f.id,
          userId: f.userId,
          name: user?.fullName || "Freelancer",
          email: user?.email || "",
          userStatus: user?.status || "ACTIVE",
          title: f.professionalTitle,
          bio: f.bio,
          avatar: f.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
          hourlyRateINR: f.hourlyRateINR,
          rating: f.ratingAverage,
          reviewCount: f.ratingCount,
          completedProjects: f.completedProjectsCount,
          skills: f.skills || [],
          city: f.city,
          state: f.state,
          isKycVerified: f.kycStatus === "APPROVED",
          isTopRated: f.isTopRated,
          isVerifiedBadge: f.isVerifiedBadge,
          onTimeDeliveryRate: f.onTimeDeliveryRate,
          availabilityStatus: f.availabilityStatus,
          razorpayLinkedAccountId: (f as any).razorpayLinkedAccountId || null,
        };
      })
      .filter((f) => f.userStatus !== "SUSPENDED");

    if (search) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(search) ||
          f.title.toLowerCase().includes(search) ||
          f.bio.toLowerCase().includes(search) ||
          f.skills.some((s) => s.toLowerCase().includes(search))
      );
    }

    if (skill && skill !== "all") {
      list = list.filter((f) => f.skills.some((s) => s.toLowerCase().includes(skill)));
    }

    if (city && city !== "all") {
      list = list.filter((f) => f.city.toLowerCase() === city);
    }

    if (verifiedOnly) {
      list = list.filter((f) => f.isKycVerified);
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      freelancers: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch freelancers" },
      { status: 500 }
    );
  }
}
