import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id } = req.query;

    const filter: { category_id?: number; is_available: boolean } = {
      is_available: true,
    };

    if (category_id) {
      filter.category_id = Number(category_id);
    }

    const products = await prisma.products.findMany({
      where: filter,
      include: {
        categories: true,
      },
      orderBy: { id: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id, name, description, price, image_url } = req.body;

    if (!category_id || !name || !price) {
      res.status(400).json({
        error: 'Поля category_id, name и price обязательны',
      });
      return;
    }

    if (Number(price) <= 0) {
      res.status(400).json({
        error: 'Цена должна быть строго больше нуля',
      });
      return;
    }

    const newProduct = await prisma.products.create({
      data: {
        category_id: Number(category_id),
        name: String(name),
        description: description ? String(description) : null,
        price: Number(price),
        image_url: image_url ? String(image_url) : null,
        is_available: true,
      },
    });

    res.status(201).json({
      message: 'Товар успешно добавлен',
      product: newProduct,
    });
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, is_available } = req.body;

    const productId = Number(id);

    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      res.status(404).json({ error: 'Товар не найден' });
      return;
    }

    if (price !== undefined && Number(price) <= 0) {
      res.status(400).json({
        error: 'Цена должна быть строго больше нуля',
      });
      return;
    }

    const updateData: any = {};

    if (category_id !== undefined) updateData.category_id = Number(category_id);
    if (name !== undefined) updateData.name = String(name);
    if (price !== undefined) updateData.price = Number(price);
    if (is_available !== undefined) updateData.is_available = Boolean(is_available);

    if (description !== undefined)
      updateData.description = description ? String(description) : null;
    if (image_url !== undefined) updateData.image_url = image_url ? String(image_url) : null;

    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: updateData,
    });

    res.json({
      message: 'Товар успешно обновлен',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    const existingProduct = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      res.status(404).json({ error: 'Товар не найден' });
      return;
    }

    await prisma.products.delete({ where: { id: productId } });

    res.json({ message: 'Товар успешно удален из базы данных' });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);

    res.status(400).json({
      error:
        'Невозможно удалить товар, так как он фигурирует в существующих заказах. Вместо удаления используйте флаг is_available = false.',
    });
  }
};
