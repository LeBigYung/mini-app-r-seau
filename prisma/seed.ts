import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userData = [{
    name: "Alice",
    email: "alice@prisma.fr",
    posts: {
        create: [{
            title: "Join the Prismav Discord",
            content: "https://pris.ly/discord",
            published: true,

        },
        {
            title: "Prisma on Youtube",
            content: "https://pris.ly/youtube",
        },
    ],
    },
},
    {
        name: "Bob",
        email: "bob@prisma.fr",
        posts: {
            create: [
                {
                    title: "Follow prisma on Twitter",
                    content: "https://www.twitter.com/prisma",
                    published: true,
                },
            ],
        },
    },
];

export async function main() {
    for (const u of userData) {
        await prisma.user.create({ data: u});
    }
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("✅ Seed completed.");
  });