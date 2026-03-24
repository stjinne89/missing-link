import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseCSV } from "@/lib/utils";

/** GET /api/matches — list all matches for current user */
export async function GET() {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const userId = session.id;

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: true,
      userB: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = matches.map((m) => {
    const partner = m.userAId === userId ? m.userB : m.userA;
    const lastMsg = m.messages[0] ?? null;

    return {
      id: m.id,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerPhotoUrl: partner.photoUrl,
      partnerCity: partner.city,
      partnerDisciplines: parseCSV(partner.disciplines),
      mode: m.mode,
      score: m.score,
      lastMessage: lastMsg?.content ?? null,
      lastMessageAt: lastMsg?.createdAt?.toISOString() ?? null,
      unreadCount: 0, // TODO: count unread messages
      createdAt: m.createdAt.toISOString(),
    };
  });

  return NextResponse.json({ matches: result });
}

/** POST /api/matches — send a like, check for mutual match */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { targetId, mode } = await req.json();

  if (!targetId || !mode) {
    return NextResponse.json({ error: "targetId en mode zijn verplicht" }, { status: 400 });
  }

  const userId = session.id;

  // Create like (upsert to avoid duplicates)
  await prisma.like.upsert({
    where: {
      fromId_toId_mode: { fromId: userId, toId: targetId, mode },
    },
    create: { fromId: userId, toId: targetId, mode },
    update: {},
  });

  // Check for mutual like
  const mutualLike = await prisma.like.findUnique({
    where: {
      fromId_toId_mode: { fromId: targetId, toId: userId, mode },
    },
  });

  if (mutualLike) {
    // Create match
    const [idA, idB] = [userId, targetId].sort();
    const match = await prisma.match.upsert({
      where: {
        userAId_userBId_mode: { userAId: idA, userBId: idB, mode },
      },
      create: {
        userAId: idA,
        userBId: idB,
        mode,
      },
      update: {},
    });

    return NextResponse.json({
      liked: true,
      matched: true,
      matchId: match.id,
    });
  }

  return NextResponse.json({ liked: true, matched: false });
}
