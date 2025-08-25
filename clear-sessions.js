const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSessions() {
  try {
    const result = await prisma.session.deleteMany({});
    console.log(`Cleared ${result.count} sessions`);
  } catch (error) {
    console.error('Error clearing sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();
