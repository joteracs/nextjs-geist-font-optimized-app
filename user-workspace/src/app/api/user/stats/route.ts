import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's answer statistics
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId },
    });

    const totalAnswered = userAnswers.length;
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

    // Get total questions available
    const totalQuestions = await prisma.question.count();

    return NextResponse.json({
      totalAnswered,
      correctAnswers,
      accuracy,
      totalQuestions,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
