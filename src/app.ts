import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import cookieParser from 'cookie-parser';

import ApiRoute from './routes/apiRoute';
import { errorHandler } from './middlewares/errorhandler';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'],
  }),
);
app.disable('x-powered-by');
app.use(morgan('dev'));
app.use(multer().single('file'));

app.get('/', (req, res) => res.status(200).send('<h1>Sojo News App</h1>'));
app.use('/api', ApiRoute);
app.use(errorHandler);

export default app;
