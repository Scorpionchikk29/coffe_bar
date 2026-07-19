import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { prisma } from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsPath = path.join(__dirname, '../data/settings.json');

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items, pickupTime } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Доступ запрещен' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Корзина пуста' });
      return;
    }

    if (!pickupTime) {
      res.status(400).json({ error: 'Укажите время самовывоза' });
      return;
    }

    let workStart = '08:00';
    let workEnd = '21:00';
    try {
      const settingsData = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(settingsData);
      workStart = settings.workStart;
      workEnd = settings.workEnd;
    } catch (e) {}

    const orderDate = new Date(pickupTime);
    const currentDate = new Date();

    if (orderDate.getTime() <= currentDate.getTime()) {
      res.status(400).json({
        error: 'Невозможно оформить заказ на прошедшее время',
      });
      return;
    }

    const orderTimeStr = orderDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (orderTimeStr < workStart || orderTimeStr > workEnd) {
      res.status(400).json({
        error: `Кофейня закрыта. Пожалуйста, выберите время в диапазоне с ${workStart} до ${workEnd}`,
      });
      return;
    }

    const currentUserId = req.user.userId;

    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          user_id: currentUserId,
          status_id: 1,
          total_price: 0,
          pickup_time: orderDate,
        },
      });
      for (const item of items) {
        await tx.order_items.create({
          data: {
            order_id: order.id,
            product_id: Number(item.productId),
            quantity: Number(item.quantity),
            price: 0,
            customizations: item.customizations ? item.customizations : {},
          },
        });
      }
      return tx.orders.findUnique({
        where: { id: order.id },
        include: { order_items: true },
      });
    });

    res.status(201).json({
      message: 'Заказ успешно оформлен',
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Требуется авторизация для просмотра истории',
      });
      return;
    }

    const { userId, role } = req.user;
    let orders;

    if (role === 'admin') {
      orders = await prisma.orders.findMany({
        include: {
          statuses: true,
          users: {
            include: {
              user_profiles: true,
            },
          },
          order_items: { include: { products: true } },
        },
        orderBy: { created_at: 'desc' },
      });
    } else {
      orders = await prisma.orders.findMany({
        where: { user_id: userId },
        include: {
          statuses: true,
          order_items: { include: { products: true } },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    res.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status_id } = req.body;

    if (!status_id) {
      res.status(400).json({ error: 'Укажите новый status_id' });
      return;
    }

    const orderId = Number(id);

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });
    if (!existingOrder) {
      res.status(404).json({ error: 'Заказ не найден' });
      return;
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { status_id: Number(status_id) },
      include: { statuses: true },
    });

    res.json({ message: 'Статус заказа изменен', order: updatedOrder });
  } catch (error) {
    console.error('Ошибка при изменении статуса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const orderId = Number(id);

    if (!req.user) {
      res.status(401).json({ error: 'Пользователь не авторизован' });
      return;
    }

    const { userId, role } = req.user;

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      res.status(404).json({ error: 'Указанный заказ не найден' });
      return;
    }

    if (order.status_id === 4) {
      res.status(400).json({
        error: 'Невозможно отменить заказ, который уже выдан клиенту',
      });
      return;
    }
    if (order.status_id === 5) {
      res.status(400).json({
        error: 'Данный заказ уже имеет статус отмененного',
      });
      return;
    }

    if (role !== 'admin') {
      if (order.user_id !== userId) {
        res.status(403).json({
          error: 'Доступ запрещен. Вы не можете отменять чужие заказы',
        });
        return;
      }

      if (order.status_id !== 1) {
        res.status(400).json({
          error: 'Бариста уже начал готовить ваш напиток. Отмена заказа невозможна',
        });
        return;
      }
    }

    const cancelledOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { status_id: 5 },
      include: { statuses: true },
    });

    res.json({
      message:
        role === 'admin'
          ? 'Заказ успешно отменен администратором кофейни'
          : 'Вы успешно отменили свой заказ',
      order: cancelledOrder,
    });
  } catch (error) {
    console.error('Ошибка при отмене заказа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
