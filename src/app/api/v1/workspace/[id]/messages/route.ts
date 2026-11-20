import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase, saveDatabase, DBMessage } from "@/lib/db/store";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    const db = getDatabase();
    const contract = db.contracts.find((c) => c.id === id || c.contractNumber === id);
    if (!contract) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const newMessage: DBMessage = {
      id: `msg-${Date.now()}`,
      workspaceId: contract.id,
      senderUserId: auth.user.id,
      senderName: auth.user.fullName,
      senderRole: auth.user.role,
      content: content.trim(),
      isSystemMessage: false,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(newMessage);
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
