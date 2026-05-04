import pkg from '@prisma/client';
const { PrismaClient } = pkg;

async function test() {
  try {
    const prisma = new PrismaClient({});
    console.log('Prisma instantiated');
    console.log('Has user model?', !!prisma.user);
    if (prisma.user) {
      const users = await prisma.user.findMany();
      console.log('Users:', users);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
