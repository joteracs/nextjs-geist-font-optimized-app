import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get questions that the user hasn't answered yet
    const answeredQuestions = await prisma.userAnswer.findMany({
      where: { userId: session.user.id },
      select: { questionId: true }
    });

    const answeredQuestionIds = answeredQuestions.map(answer => answer.questionId);

    const questions = await prisma.question.findMany({
      where: {
        id: {
          notIn: answeredQuestionIds
        }
      },
      select: {
        id: true,
        statement: true,
        alternatives: true,
        correctAnswer: true,
        subject: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Parse alternatives from JSON string
    const parsedQuestions = questions.map(question => ({
      ...question,
      alternatives: JSON.parse(question.alternatives)
    }));

    return NextResponse.json(parsedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { statement, alternatives, correctAnswer, subject } = body;

    if (!statement || !alternatives || correctAnswer === undefined || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(alternatives) || alternatives.length < 4) {
      return NextResponse.json(
        { error: "Must provide at least 4 alternatives" },
        { status: 400 }
      );
    }

    if (correctAnswer < 0 || correctAnswer >= alternatives.length) {
      return NextResponse.json(
        { error: "Invalid correct answer index" },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        statement,
        alternatives: JSON.stringify(alternatives),
        correctAnswer,
        subject,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      ...question,
      alternatives: JSON.parse(question.alternatives)
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
