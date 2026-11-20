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
    const myNotifications = (db.notifications || []).filter((n) => n.userId === auth.user.id);
    const unreadCount = myNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      count: myNotifications.length,
      notifications: myNotifications,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    if (db.notifications) {
      db.notifications.forEach((n) => {
        if (n.userId === auth.user.id) {
          n.isRead = true;
        }
      });
      saveDatabase(db);
    }

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
