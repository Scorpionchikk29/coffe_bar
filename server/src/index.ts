import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import analyticsRouter from './routes/analytics.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';
import settingsRouter from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);

app.use((req, res, next) => {
  res.status(404).json({
    error: `Маршрут ${req.originalUrl} не найден на сервере`,
  });
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
