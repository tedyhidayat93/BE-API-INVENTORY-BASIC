import express from 'express';
import cors from 'cors';
import router from './router/index';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

router(app);

export default app;