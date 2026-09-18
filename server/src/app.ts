import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { tareasRouter } from './routes/tareas.routes.js';
import { categoriasRouter } from './routes/categorias.routes.js';
import { etiquetasRouter } from './routes/etiquetas.routes.js';
import { estadisticasRouter } from './routes/estadisticas.routes.js';
import { apiLimiter } from './middlewares/rateLimit.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import { openapiDocument } from './docs/openapi.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(
  morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', {
    skip: () => env.NODE_ENV === 'test',
  }),
);

app.use('/api', apiLimiter);
app.get('/api/openapi.json', (_req, res) => {
  res.json(openapiDocument);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/api/auth', authRouter);
app.use('/api/tareas', tareasRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/etiquetas', etiquetasRouter);
app.use('/api/estadisticas', estadisticasRouter);

app.get('/api/health', (_req, res) => {
  res.json({ estado: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);