import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { prisma } from '../lib/prisma.js';

export const getRevenueStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await prisma.orders.findMany({
      where: {
        status_id: 4,
        created_at: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        total_price: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    const revenueMap: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      });
      revenueMap[dateStr] = 0;
    }

    orders.forEach((order) => {
      const dateStr = new Date(order.created_at).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      });
      if (revenueMap[dateStr] !== undefined) {
        revenueMap[dateStr] += Number(order.total_price);
      }
    });

    const chartData = Object.entries(revenueMap).map(([date, amount]) => ({
      date,
      'Выручка (₽)': amount,
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Ошибка при расчете аналитики:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
