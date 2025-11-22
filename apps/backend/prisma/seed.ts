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
      content: `<strong>🏠 Добро пожаловать в бот компании Рекварт</strong>

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
      title: '📏 Записаться на замер',
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
      update: cmd,
    });
  }
  console.log('✓ Commands seeded');

  await prisma.calculateSummary.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      message: '✅ Спасибо! Мы свяжемся с вами в ближайшее время',
    },
    update: {},
  });
  console.log('✓ CalculateSummary seeded');

  const calculateQuestions = [
    {
      order: 1,
      text: 'Где находится ваш объект? ',
      type: 'select',
      variants: [
        { text: 'Внутри МКАД', order: 1, needsPhone: false },
        { text: 'До 20 км', order: 2, needsPhone: false },
        { text: '20-40 км', order: 3, needsPhone: false },
        { text: 'Дальше 40 км', order: 4, needsPhone: false },
      ],
    },
    {
      order: 2,
      text: 'Где планируется ремонт?',
      type: 'select',
      variants: [
        { text: 'Квартира под ключ', order: 1, needsPhone: false },
        { text: 'Загородный дом под ключ', order: 2, needsPhone: false },
        { text: 'Таунхаус под ключ', order: 3, needsPhone: false },
        {
          text: 'Частичный ремонт (1-2 жилые комнаты)',
          order: 4,
          needsPhone: false,
        },
        { text: 'Санузел', order: 5, needsPhone: false },
      ],
    },
    {
      order: 3,
      text: 'Метраж помещения (м2)?',
      type: 'text',
      variants: [],
    },
    {
      order: 4,
      text: 'Выберите предпочитаемый способ связи',
      type: 'select',
      variants: [
        { text: 'Telegram', order: 1, needsPhone: false },
        { text: 'WhatsApp', order: 2, needsPhone: true },
        { text: 'Звонок по телефону', order: 3, needsPhone: true },
      ],
    },
  ];

  for (const q of calculateQuestions) {
    const question = await prisma.question.upsert({
      where: {
        formType_order: {
          formType: 'CALCULATE',
          order: q.order,
        },
      },
      create: {
        text: q.text,
        type: q.type,
        order: q.order,
        formType: 'CALCULATE',
      },
      update: {
        text: q.text,
        type: q.type,
      },
    });

    if (q.variants.length > 0) {
      await prisma.questionVariant.deleteMany({
        where: { questionId: question.id },
      });

      await prisma.questionVariant.createMany({
        data: q.variants.map((v) => ({
          text: v.text,
          order: v.order,
          needsPhone: v.needsPhone,
          questionId: question.id,
        })),
      });
    }
  }
  console.log('✓ Calculate Questions seeded');

  await prisma.consultacyaSummary.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      message: '✅ Спасибо! Мы свяжемся с вами в ближайшее время',
    },
    update: {},
  });
  console.log('✓ ConsultacyaSummary seeded');

  const consultacyaQuestions = [
    {
      order: 1,
      text: 'Выберите предпочитаемый способ связи',
      type: 'select',
      variants: [
        { text: '✈️ Telegram', order: 1, needsPhone: false },
        { text: '💬 WhatsApp', order: 2, needsPhone: true },
        { text: '📞 Звонок по телефону', order: 3, needsPhone: true },
      ],
    },
  ];

  for (const q of consultacyaQuestions) {
    const question = await prisma.question.upsert({
      where: {
        formType_order: {
          formType: 'CONSULTACYA',
          order: q.order,
        },
      },
      create: {
        text: q.text,
        type: q.type,
        order: q.order,
        formType: 'CONSULTACYA',
      },
      update: {
        text: q.text,
        type: q.type,
      },
    });

    if (q.variants.length > 0) {
      await prisma.questionVariant.deleteMany({
        where: { questionId: question.id },
      });

      await prisma.questionVariant.createMany({
        data: q.variants.map((v) => ({
          text: v.text,
          order: v.order,
          needsPhone: v.needsPhone,
          questionId: question.id,
        })),
      });
    }
  }
  console.log('✓ Consultacya Questions seeded');

  await prisma.zamerSummary.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      message: '✅ Спасибо! Мы свяжемся с вами в ближайшее время',
    },
    update: {},
  });
  console.log('✓ ZamerSummary seeded');

  const zamerQuestions = [
    {
      order: 1,
      text: 'Пожалуйста введите адрес объекта',
      type: 'text',
      variants: [],
    },
    {
      order: 2,
      text: 'Выберите предпочитаемый способ связи',
      type: 'select',
      variants: [
        { text: '✈️ Telegram', order: 1, needsPhone: false },
        { text: '💬 WhatsApp', order: 2, needsPhone: true },
        { text: '📞 Звонок по телефону', order: 3, needsPhone: true },
      ],
    },
  ];

  for (const q of zamerQuestions) {
    const question = await prisma.question.upsert({
      where: {
        formType_order: {
          formType: 'ZAMER',
          order: q.order,
        },
      },
      create: {
        text: q.text,
        type: q.type,
        order: q.order,
        formType: 'ZAMER',
      },
      update: {
        text: q.text,
        type: q.type,
      },
    });

    if (q.variants.length > 0) {
      await prisma.questionVariant.deleteMany({
        where: { questionId: question.id },
      });

      await prisma.questionVariant.createMany({
        data: q.variants.map((v) => ({
          text: v.text,
          order: v.order,
          needsPhone: v.needsPhone,
          questionId: question.id,
        })),
      });
    }
  }
  console.log('✓ Zamer Questions seeded');

  const portfolioItems = [
    {
      id: 9,
      title: 'Пушкино, Московская область',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/eac/1000_1000_1/b6lfzpwnd6d15d9ff110cz9xw200k74m.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/423/1000_1000_1/veoo8pf5dqv33wda8nsdw6kkq140sfyx.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/d49/1000_1000_1/cvstafftz269f2evqyoeawn1s014r67u.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/e2e/1000_1000_1/59g5nj2wkqf97g17le4yal20a7mmr0br.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/1e2/1000_1000_1/a4os66iapyscxnmqe32egffzaoe3wduk.jpg',
      ],
    },
    {
      id: 10,
      title: 'Кутузовский проспект',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/5b5/1000_1000_1/ng1gch0ta6ka04fcnmrf3yf97kx8h091.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/1ea/1000_1000_1/qmps47jjf5tkq3nnsr5tbuvoj54vzetf.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/96a/1000_1000_1/8g3p5jmg7icbv38f2m2luyw5iznvb4vg.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/682/1000_1000_1/s2vdvn5ni2web0b1wivho9igt3d7n94i.jpg',
      ],
    },
    {
      id: 11,
      title: 'ЖК Доминион ',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/741/1000_1000_1/xa68s45waglsdwelfj3sgmuxjegvl4w3.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/72b/1000_1000_1/31igpcyjocq2l1rzuesxdqmjx7fm0d4v.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/1b4/1000_1000_1/j5hdw8pskhiraxw97iochyz3r3y4hz3x.jpg',
      ],
    },
    {
      id: 12,
      title: 'ЖК Матвеевский Парк 77 кв.м.',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/ee3/1000_1000_1/p10cz5u3k88bpftfh9kmzyxpoc0xasx1.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/dad/1000_1000_1/ca57zqptfqs1fz2g4faxqk7kvavr4v52.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/93b/1000_1000_1/t2as9xlkudr51h6ggi0iv8l2ycu10292.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/5dd/1000_1000_1/ttoh1iq3nvs08i129mcn15ubo87vpx9j.jpg',
      ],
    },
    {
      id: 13,
      title: 'ЖК Зиларт 89 кв.м.',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/50a/1000_1000_1/lvstsq578vy18wlisp9f3u55r6opoget.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/83a/1000_1000_1/sxnk4ccwvctd4vj3e812kgkcrihiolpn.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/b1b/1000_1000_1/todnsk5alcrmcq3nh40ooyg7jj1fwp2f.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/889/1000_1000_1/he6t7jdzv5m372oznnjrd1081co38zxn.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/c2d/1000_1000_1/k8d34k14jeilw9sokwo8vl3swjfek58w.jpg',
      ],
    },
    {
      id: 14,
      title: 'ЖК Вестердам 50 кв.м.',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/0fe/1000_1000_1/gxvnzwvdej7xxuww9y9cvvjz62qewy1e.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/1b5/1000_1000_1/5fk6y917vs1r6iw40pmkwn736rbm99zu.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/a39/1000_1000_1/ud0po27y2bq16xphjsoi32djy7xs1coy.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/59d/1000_1000_1/klq81ssmkzw0pkv8sx5z4pm2tiknmut5.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/8ea/1000_1000_1/vte7ihxcib1688gli25p2g79q3r81aj9.jpg',
      ],
    },
    {
      id: 15,
      title: 'Ул. Удальцова 84 кв.м.',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/2c4/1000_1000_1/cpp5c3864p5608q9ok0b2y2du6nscz0f.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/b03/1000_1000_1/ljfn77ffel3xgjyvm9cchcahlruojb3k.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/b20/1000_1000_1/mm6qug14i5r0eadxrqlat5bvv4pbt2wk.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/338/1000_1000_1/c21h6zmgrsbq6pjsmgb0fqsnpt22rs63.jpg',
        'https://rekvart.ru/upload/resize_cache/iblock/878/1000_1000_1/vm67nv9s8k27sn0sgivqlsn7by37mhb0.jpg',
      ],
    },
    {
      id: 16,
      title: 'ЖК Событие 75 кв.м.',
      imgSrc: [
        'https://rekvart.ru/upload/resize_cache/iblock/9b7/1000_1000_1/3d5psbqdlm5peuwhgd8q38hr3gascq5w.png',
        'https://rekvart.ru/upload/resize_cache/iblock/fdd/1000_1000_1/edqowv2doidw50elmzqhtxgwy174e7tf.png',
        'https://rekvart.ru/upload/resize_cache/iblock/f3c/1000_1000_1/w8btjffx018irvc9q1lk71i32g2cfdcv.png',
        'https://rekvart.ru/upload/resize_cache/iblock/a59/1000_1000_1/op9cemctupux6ek2jch8ez0m0lf6gouw.png',
      ],
    },
  ];

  for (const item of portfolioItems) {
    await prisma.portfolio.upsert({
      where: { id: item.id },
      create: item,
      update: {
        title: item.title,
        imgSrc: item.imgSrc,
      },
    });
  }
  console.log('✓ Portfolio seeded');

  await prisma.dizaynContent.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      title: '🎨 Дизайн интерьеров от Recvart',
      description:
        'Мы отправим варианты дизайна подходящие для вашей квартиры. Для этого отправьте поэтажный план предпочтительным способом:',
      telegramUrl: 'https://t.me/newizba_ru',
      whatsappUrl:
        'https://api.whatsapp.com/send/?phone=%2B79167892015&text&type=phone_number&app_absent=0',
      email: 'design@recvart.com',
    },
    update: {},
  });
  console.log('✓ DizaynContent seeded');

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
