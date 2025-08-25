import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all answered questions for the user with question details
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId: session.user.id },
      include: {
        question: {
          select: {
            id: true,
            statement: true,
            alternatives: true,
            correctAnswer: true,
            subject: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Parse alternatives from JSON string and format the response
    const flashcards = userAnswers.map(answer => ({
      id: answer.id,
      question: {
        ...answer.question,
        alternatives: JSON.parse(answer.question.alternatives)
      },
      selectedAnswer: answer.selectedAnswer,
      isCorrect: answer.isCorrect,
      timestamp: answer.timestamp.toISOString()
    }));

    return NextResponse.json(flashcards);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
