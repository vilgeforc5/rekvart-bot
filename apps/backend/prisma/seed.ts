import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from './generated/client';

config({ path: resolve(__dirname, '../../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  console.log('Starting seed...');

  await prisma.startContent.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      content: `🏠 Добро пожаловать в бот компании Рекварт

Ремонт квартир и домов в Москве и области.

Мы занимаемся строительством загородных домов и их отделкой уже 15 лет. Мы создаём дома под ключ, продумывая каждый этап, чтобы интерьер был таким же качественным и надёжным, как сам дом.

Этот опыт мы переносим и в городскую среду путем создания эксклюзивного интерьера в габаритах квартиры, тк все-таки большее время семья с детьми проводит в городе и есть простор, где мы можем приложить свои знания и опыт

Глубокий опыт в строительстве

Мы знаем о ремонте не только на уровне отделки, но и изнутри.

Выберите действие из меню ниже:`,
    },
    update: {},
  });
  console.log('✓ StartContent seeded');

  const commands = [
    {
      command: 'zamer',
      title: '✍️ Записаться на замер',
      description: 'Записаться на замер',
      index: 0,
    },
    {
      command: 'portfolio',
      title: '📸 Портфолио',
      description: 'Посмотреть наши работы',
      index: 1,
    },
    {
      command: 'calculate',
      title: '💰 Рассчитать стоимость',
      description: 'Узнать стоимость ремонта под ключ',
      index: 2,
    },
    {
      command: 'consultacya',
      title: '💬 Получить консультацию',
      description: 'Получить консультацию',
      index: 3,
    },
    {
      command: 'dizayn',
      title: '✨ Получить вариант дизайна бесплатно',
      description: 'Получить вариант дизайна бесплатно',
      index: 4,
    },
  ];

  for (const cmd of commands) {
    await prisma.command.upsert({
      where: { command: cmd.command },
      create: cmd,
      update: {
        title: cmd.title,
        description: cmd.description,
        index: cmd.index,
      },
    });
  }
  console.log('✓ Commands seeded');

  await prisma.zamerSummary.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      message: '✅ Спасибо! Мы свяжемся с вами в ближайшее время',
    },
    update: {},
  });
  console.log('✓ ZamerSummary seeded');

  const existingQuestions = await prisma.zamerQuestion.count();

  if (existingQuestions === 0) {
    const questions = [
      {
        text: 'Где планируется ремонт?',
        type: 'select',
        order: 1,
        variants: [
          { text: 'Квартира под ключ', needsPhone: false },
          { text: 'Загородный дом под ключ', needsPhone: false },
          { text: 'Танхаус под ключ', needsPhone: false },
          { text: 'Частичный ремонт (1-2 комнаты)', needsPhone: false },
          { text: 'Саунузел', needsPhone: false },
        ],
      },
      {
        text: 'Где находится ваш объект?',
        type: 'select',
        order: 2,
        variants: [
          { text: 'Внутри МКАД', needsPhone: false },
          { text: 'До 20 км', needsPhone: false },
          { text: '20-40 км', needsPhone: false },
          { text: 'Дальше 40 км', needsPhone: false },
        ],
      },
      {
        text: 'Метраж помещения (м2)?',
        type: 'text',
        order: 3,
        variants: [],
      },
      {
        text: 'Выберите предпочитаемый способ связи',
        type: 'select',
        order: 4,
        variants: [
          { text: 'Telegram', needsPhone: false },
          { text: 'WhatsApp', needsPhone: true },
          { text: 'Звонок по телефону', needsPhone: true },
        ],
      },
    ];

    for (const question of questions) {
      const createdQuestion = await prisma.zamerQuestion.create({
        data: {
          text: question.text,
          type: question.type,
          order: question.order,
        },
      });

      if (question.variants.length > 0) {
        await prisma.zamerVariant.createMany({
          data: question.variants.map((variant, index) => ({
            text: variant.text,
            order: index,
            needsPhone: variant.needsPhone,
            questionId: createdQuestion.id,
          })),
        });
      }
    }
    console.log('✓ ZamerQuestions seeded');
  } else {
    console.log('✓ ZamerQuestions already exist, skipping');
  }

  console.log('Seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
