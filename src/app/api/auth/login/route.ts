import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email en wachtwoord zijn verplicht" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Ongeldige inloggegevens" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { error: "Ongeldige inloggegevens" },
        { status: 401 }
      );
    }

    // Create session cookie
    await createSession({ id: user.id, email: user.email, name: user.name });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      onboardingComplete: user.onboardingComplete,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Inloggen mislukt" },
      { status: 500 }
    );
  }
}
