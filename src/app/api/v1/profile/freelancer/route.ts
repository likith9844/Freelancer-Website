import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    const profile = db.freelancers.find((f) => f.userId === auth.user.id);

    if (!profile) {
      return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });
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
    const {
      professionalTitle,
      bio,
      hourlyRateINR,
      experienceYears,
      availabilityStatus,
      city,
      state,
      pincode,
      skills,
    } = body;

    const db = getDatabase();
    const profile = db.freelancers.find((f) => f.userId === auth.user.id);

    if (!profile) {
      return NextResponse.json({ error: "Freelancer profile not found" }, { status: 404 });
    }

    if (professionalTitle) profile.professionalTitle = professionalTitle;
    if (bio) profile.bio = bio;
    if (hourlyRateINR) profile.hourlyRateINR = Number(hourlyRateINR);
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (availabilityStatus) profile.availabilityStatus = availabilityStatus;
    if (city) profile.city = city;
    if (state) profile.state = state;
    if (pincode) profile.pincode = pincode;
    if (Array.isArray(skills)) profile.skills = skills;

    saveDatabase(db);

    return NextResponse.json({ success: true, message: "Profile updated successfully", profile });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
