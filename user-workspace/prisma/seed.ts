import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create common user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'student',
      password: userPassword,
      role: UserRole.COMMON,
    },
  });

  // Create sample questions
  const questions = [
    {
      statement: "What is the capital of France?",
      alternatives: JSON.stringify([
        "London",
        "Berlin",
        "Paris",
        "Madrid"
      ]),
      correctAnswer: 2, // Paris (0-indexed)
      subject: "Geography",
      createdBy: admin.id,
    },
    {
      statement: "Which programming language is known for its use in web development and has a snake as its mascot?",
      alternatives: JSON.stringify([
        "Java",
        "Python",
        "JavaScript",
        "C++"
      ]),
      correctAnswer: 1, // Python
      subject: "Programming",
      createdBy: admin.id,
    },
    {
      statement: "What is 2 + 2?",
      alternatives: JSON.stringify([
        "3",
        "4",
        "5",
        "6"
      ]),
      correctAnswer: 1, // 4
      subject: "Mathematics",
      createdBy: admin.id,
    },
    {
      statement: "Who wrote 'Romeo and Juliet'?",
      alternatives: JSON.stringify([
        "Charles Dickens",
        "William Shakespeare",
        "Jane Austen",
        "Mark Twain"
      ]),
      correctAnswer: 1, // William Shakespeare
      subject: "Literature",
      createdBy: admin.id,
    },
    {
      statement: "What is the largest planet in our solar system?",
      alternatives: JSON.stringify([
        "Earth",
        "Mars",
        "Jupiter",
        "Saturn"
      ]),
      correctAnswer: 2, // Jupiter
      subject: "Astronomy",
      createdBy: admin.id,
    }
  ];

  for (const questionData of questions) {
    // Check if question already exists
    const existingQuestion = await prisma.question.findFirst({
      where: { statement: questionData.statement }
    });
    
    if (!existingQuestion) {
      await prisma.question.create({
        data: questionData,
      });
    }
  }

  console.log('Database seeded successfully!');
  console.log('Admin user: admin@example.com / admin123');
  console.log('Regular user: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
