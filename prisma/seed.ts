import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function seed() {
  const user = await db.user.create({
    data: {
      username: 'tino',
      // this is a hashed version of "123123"
      passwordHash:
        '$2a$10$/q7S.6sjxEeepQo/UYSFCecuhqWEAym3ZAhH73gXmJcR1bEXNQ84O',
    },
  });
  await Promise.all(
    getBlogs().map((blog) => {
      const data = {
        userId: user.id,
        ...blog,
        images: { create: blog.images },
        videos: { create: blog.videos },
      };
      return db.blog.create({ data });
    })
  );
}

seed();

function getBlogs() {
  return [
    {
      title: 'Stoicism',
      author: 'Epictetus',
      content:
        'I must die. Must I then die lamenting? I must be put in chains. Must I then also lament? I must go into exile. Does any man then hinder me from going with smiles and cheerfulness and contentment?',
      images: [
        {
          imageUrl:
            'https://as1.ftcdn.net/v2/jpg/06/69/02/48/1000_F_669024888_NYXsut9fCWIqM8syEtXrueu3A8ULG8UR.jpg',
        },
        {
          imageUrl:
            'https://as2.ftcdn.net/v2/jpg/05/99/67/07/1000_F_599670708_tOtuZrowfj4CmjkscjjZDwoVmrwCl7qS.jpg',
        },
      ],
      videos: [
        { videoUrl: 'https://www.youtube.com/shorts/IHLbw1fL3TM' },
        { videoUrl: 'https://www.youtube.com/shorts/PNUxQBK_9TQ' },
      ],
    },
  ];
}
