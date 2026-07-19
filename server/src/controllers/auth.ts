import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_coffee_key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, middleName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        error: 'Поля email, password, firstName и lastName обязательны',
      });
      return;
    }

    const existingProfile = await prisma.user_profiles.findUnique({
      where: { email },
    });

    if (existingProfile) {
      res.status(400).json({
        error: 'Пользователь с таким email уже зарегистрирован',
      });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          password_hash: passwordHash,
          role_id: 1,
        },
      });

      const newProfile = await tx.user_profiles.create({
        data: {
          id: newUser.id,
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName || null,
          email: email,
          phone: phone || null,
        },
      });

      return { newUser, newProfile };
    });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      userId: result.newUser.id,
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Введите email и password' });
      return;
    }

    const userProfile = await prisma.user_profiles.findUnique({
      where: { email },
      include: {
        users: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!userProfile || !userProfile.users) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, userProfile.users.password_hash.trim());
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    const token = jwt.sign(
      {
        userId: userProfile.id,
        role: userProfile.users.roles.title,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.json({
      message: 'Авторизация успешна',
      token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: userProfile.users.roles.title,
      },
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
