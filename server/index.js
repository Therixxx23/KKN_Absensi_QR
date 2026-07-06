import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import attendanceRoutes from './routes/attendances.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://localhost:5000'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendances', attendanceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
