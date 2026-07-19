import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Пользователь не авторизован' });
      return;
    }

    const { firstName, lastName, middleName, phone } = req.body;
    const userId = req.user.userId;

    const updateData: any = {};

    if (firstName !== undefined) {
      if (typeof firstName === 'string' && firstName.trim().length === 0) {
        res.status(400).json({
          error: 'Имя не может быть пустой строкой',
        });
        return;
      }
      updateData.first_name = String(firstName);
    }

    if (lastName !== undefined) {
      if (typeof lastName === 'string' && lastName.trim().length === 0) {
        res.status(400).json({
          error: 'Фамилия не может быть пустой строкой',
        });
        return;
      }
      updateData.last_name = String(lastName);
    }

    if (middleName !== undefined) {
      updateData.middle_name = middleName ? String(middleName) : null;
    }

    if (phone !== undefined) {
      updateData.phone = phone ? String(phone) : null;
    }

    const updatedProfile = await prisma.user_profiles.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      message: 'Персональные данные успешно обновлены',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name,
        lastName: updatedProfile.last_name,
      },
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Пользователь не авторизован' });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        error: 'Поля oldPassword и newPassword обязательны',
      });
      return;
    }

    const userAccount = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!userAccount) {
      res.status(404).json({
        error: 'Учетная запись пользователя не найдена',
      });
      return;
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, userAccount.password_hash.trim());
    if (!isOldPasswordValid) {
      res.status(400).json({ error: 'Неверный текущий пароль' });
      return;
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.users.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Пользователь не авторизован' });
      return;
    }

    const userId = req.user.userId;

    const userProfile = await prisma.user_profiles.findUnique({
      where: { id: userId },
    });
    if (userProfile?.email === 'guest@coffeebar.ru') {
      res.status(403).json({
        error: 'Невозможно удалить системный аккаунт гостя',
      });
      return;
    }

    await prisma.users.delete({
      where: { id: userId },
    });

    res.json({
      message: 'Учетная запись и все связанные персональные данные успешно удалены из системы',
    });
  } catch (error) {
    console.error('Ошибка при удалении аккаунта:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
