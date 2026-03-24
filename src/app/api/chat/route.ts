import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/chat?matchId=xxx — get messages for a match */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const matchId = new URL(req.url).searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ error: "matchId is verplicht" }, { status: 400 });
  }

  // Verify user is part of the match
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [
        { userAId: session.id },
        { userBId: session.id },
      ],
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match niet gevonden" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      senderId: true,
      content: true,
      type: true,
      read: true,
      createdAt: true,
    },
  });

  // Mark unread messages from the other person as read
  await prisma.message.updateMany({
    where: {
      matchId,
      senderId: { not: session.id },
      read: false,
    },
    data: { read: true },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

/** POST /api/chat — send a message */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { matchId, content, type = "text" } = await req.json();

  if (!matchId || !content) {
    return NextResponse.json(
      { error: "matchId en content zijn verplicht" },
      { status: 400 }
    );
  }

  // Verify user is part of the match
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [
        { userAId: session.id },
        { userBId: session.id },
      ],
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match niet gevonden" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      matchId,
      senderId: session.id,
      content,
      type,
    },
  });

  return NextResponse.json({
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    type: message.type,
    read: message.read,
    createdAt: message.createdAt.toISOString(),
  });
}
