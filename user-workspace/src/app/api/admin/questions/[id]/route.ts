import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const question = await prisma.question.update({
      where: { id },
      data: {
        statement,
        alternatives: JSON.stringify(alternatives),
        correctAnswer,
        subject,
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    return NextResponse.json({
      ...question,
      alternatives: JSON.parse(question.alternatives)
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First delete all related user answers
    await prisma.userAnswer.deleteMany({
      where: { questionId: id }
    });

    // Then delete the question
    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
