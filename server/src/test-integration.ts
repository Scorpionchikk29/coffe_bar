import 'dotenv/config';
import { prisma } from './lib/prisma.js';

async function runIntegrationTest() {
  console.log('Запуск интеграционного тестирования триггеров БД...');

  try {
    const category = await prisma.categories.create({
      data: { title: 'Тестовый Кофе' },
    });

    const product = await prisma.products.create({
      data: {
        category_id: category.id,
        name: 'Тест Капучино',
        description: 'Для интеграционного теста',
        price: 150.0,
        is_available: true,
      },
    });

    const testUser = await prisma.users.create({
      data: {
        password_hash: 'TEST_HASH',
        role_id: 1,
      },
    });

    console.log(
      `Создан тестовый продукт (цена: ${product.price} ₽) и временный пользователь ID: ${testUser.id}`,
    );

    console.log('Отправка сложного заказа в БД (передаем цену = 0)...');

    const customizations = {
      volume: '0.4',
      milk: 'кокосовое',
      syrup: ['Ваниль'],
    };

    const expectedItemPrice = 310;
    const quantity = 2;
    const expectedTotalPrice = expectedItemPrice * quantity;

    const testOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          user_id: testUser.id,
          status_id: 1,
          total_price: 0,
        },
      });

      await tx.order_items.create({
        data: {
          order_id: order.id,
          product_id: product.id,
          quantity: quantity,
          price: 0,
          customizations: customizations,
        },
      });

      return order;
    });

    const finalOrder = await prisma.orders.findUnique({
      where: { id: testOrder.id },
      include: {
        order_items: true,
      },
    });

    const finalItem = finalOrder?.order_items[0];

    console.log('\nАНАЛИЗ РЕЗУЛЬТАТОВ ТРИГГЕРОВ POSTGRESQL:');
    console.log(
      `-> Цена за единицу, высчитанная триггером: ${Number(finalItem?.price)} ₽ (Ожидалось: ${expectedItemPrice} ₽)`,
    );
    console.log(
      `-> Общая сумма чека, посчитанная триггером: ${Number(finalOrder?.total_price)} ₽ (Ожидалось: ${expectedTotalPrice} ₽)`,
    );

    console.log('\n🧹 Очистка тестовых данных из базы...');
    await prisma.order_items.deleteMany({
      where: { order_id: testOrder.id },
    });
    await prisma.orders.delete({ where: { id: testOrder.id } });
    await prisma.users.delete({ where: { id: testUser.id } });
    await prisma.products.delete({ where: { id: product.id } });
    await prisma.categories.delete({ where: { id: category.id } });

    if (Number(finalOrder?.total_price) === expectedTotalPrice) {
      console.log('\nИНТЕГРАЦИОННЫЙ ТЕСТ ПРОЙДЕН!');
      console.log('Бэкенд Express и триггеры PostgreSQL работают абсолютно синхронно.');
    } else {
      console.error('\nТЕСТ ПРОВАЛЕН: Сумма триггера не совпала с ожидаемой.');
    }
  } catch (error) {
    console.error('Критическая ошибка при выполнении теста:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runIntegrationTest();
