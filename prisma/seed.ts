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
      const data = { userId: user.id, ...blog };
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
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      content:
        'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.',
    },
    {
      title: 'On the Shortness of Life',
      author: 'Seneca',
      content:
        "It's not that we have a short time to live, but that we waste much of it.",
    },
    {
      title: 'Letters from a Stoic',
      author: 'Seneca',
      content:
        'He who fears death will never do anything worth of a man who is alive.',
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      content:
        'The best revenge is to be unlike him who performed the injustice.',
    },
    {
      title: 'Enchiridion',
      author: 'Epictetus',
      content:
        'We cannot choose our external circumstances, but we can always choose how we respond to them.',
    },
    {
      title: 'Letters from a Stoic',
      author: 'Seneca',
      content:
        'True happiness is to enjoy the present, without anxious dependence upon the future.',
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      content:
        'Waste no more time arguing about what a good man should be. Be one.',
    },
    {
      title: 'Enchiridion',
      author: 'Epictetus',
      content: 'He who laughs at himself never runs out of things to laugh at.',
    },
    {
      title: 'On the Shortness of Life',
      author: 'Seneca',
      content:
        'It is not that we have so little time but that we lose so much.',
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      content:
        'The best revenge is to be unlike him who performed the injustice.',
    },
  ];
}
