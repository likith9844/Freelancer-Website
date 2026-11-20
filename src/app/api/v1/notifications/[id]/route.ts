import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase } from "@/lib/db/store";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    if (!db.notifications) {
      db.notifications = [];
    }

    const notif = db.notifications.find((n) => n.id === id);
    if (!notif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notif.userId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your notification" }, { status: 403 });
    }

    notif.isRead = true;
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      notification: notif,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDatabase();
    if (!db.notifications) {
      db.notifications = [];
    }

    const index = db.notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (db.notifications[index].userId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your notification" }, { status: 403 });
    }

    db.notifications.splice(index, 1);
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: "Notification removed",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
