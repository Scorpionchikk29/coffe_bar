import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const settingsPath = path.join(__dirname, '../data/settings.json');

const readSettings = () => {
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { workStart: '08:00', workEnd: '21:00' };
  }
};

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = readSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось прочитать настройки' });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { workStart, workEnd } = req.body;

    if (!workStart || !workEnd) {
      res.status(400).json({
        error: 'Поля workStart и workEnd обязательны',
      });
      return;
    }

    const newSettings = { workStart, workEnd };

    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), 'utf-8');

    res.json({
      message: 'График работы кофейни успешно изменен',
      settings: newSettings,
    });
  } catch (error) {
    console.error('Ошибка записи настроек:', error);
    res.status(500).json({ error: 'Не удалось сохранить настройки' });
  }
};
