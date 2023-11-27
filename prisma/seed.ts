import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function seed() {
  const kody = await db.user.create({
    data: {
      username: 'kody',
      // this is a hashed version of "twixrox"
      passwordHash:
        '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
    },
  });
  await Promise.all(
    getBlogs().map((blog) => {
      const data = { userId: kody.id, ...blog };
      return db.blog.create({ data });
    })
  );
}

seed();

function getBlogs() {
  return [
    {
      title: 'Stoicism',
      content:
        'I must die. Must I then die lamenting? I must be put in chains. Must I then also lament? I must go into exile. Does any man then hinder me from going with smiles and cheerfulness and contentment?',
    },
  ];
}
