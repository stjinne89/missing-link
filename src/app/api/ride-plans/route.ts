import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** PATCH /api/ride-plans — update ride plan status (accept/decline) */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { ridePlanId, status } = await req.json();

  if (!ridePlanId || !["accepted", "declined"].includes(status)) {
    return NextResponse.json({ error: "ridePlanId en geldige status zijn verplicht" }, { status: 400 });
  }

  // Verify user is the invitee
  const ridePlan = await prisma.ridePlan.findFirst({
    where: { id: ridePlanId, inviteeId: session.id },
  });

  if (!ridePlan) {
    return NextResponse.json({ error: "Ritplan niet gevonden" }, { status: 404 });
  }

  const updated = await prisma.ridePlan.update({
    where: { id: ridePlanId },
    data: { status },
  });

  // Stuur een systeem-bericht in de chat
  const statusText = status === "accepted" ? "✅ Ritvoorstel geaccepteerd!" : "❌ Ritvoorstel afgewezen.";
  await prisma.message.create({
    data: {
      matchId: ridePlan.matchId,
      senderId: session.id,
      content: statusText,
      type: "text",
    },
  });

  return NextResponse.json({ success: true, ridePlan: updated });
}
