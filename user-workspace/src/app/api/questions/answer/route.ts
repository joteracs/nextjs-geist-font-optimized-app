import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, selectedAnswer } = body;

    if (!questionId || selectedAnswer === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the question to check the correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { correctAnswer: true }
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Check if user has already answered this question
    const existingAnswer = await prisma.userAnswer.findUnique({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId: questionId
        }
      }
    });

    if (existingAnswer) {
      return NextResponse.json(
        { error: "Question already answered" },
        { status: 400 }
      );
    }

    // Save the user's answer
    const userAnswer = await prisma.userAnswer.create({
      data: {
        userId: session.user.id,
        questionId: questionId,
        selectedAnswer: selectedAnswer,
        isCorrect: isCorrect,
      },
    });

    return NextResponse.json({
      id: userAnswer.id,
      isCorrect: userAnswer.isCorrect,
      correctAnswer: question.correctAnswer
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
