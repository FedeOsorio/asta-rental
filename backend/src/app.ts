import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/infrastructure/http/auth.routes.js';
import { propertyRouter } from './modules/properties/infrastructure/http/property.routes.js';
import { renterRouter } from './modules/renters/infrastructure/http/renter.routes.js';
import { contractRouter } from './modules/contracts/infrastructure/http/contract.routes.js';
import { paymentRouter } from './modules/payments/infrastructure/http/payment.routes.js';
import { dashboardRouter } from './modules/dashboard/infrastructure/http/dashboard.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app: Express = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRouter);
app.use('/properties', propertyRouter);
app.use('/renters', renterRouter);
app.use('/contracts', contractRouter);
app.use('/payments', paymentRouter);
app.use('/dashboard', dashboardRouter);

// Global Error Handler
app.use(errorHandler);
