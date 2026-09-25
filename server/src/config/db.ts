import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;


export async function connectDB(): Promise<void> {
  if (isConnected) return;

  await mongoose.connect(env.mongoUri);
  isConnected = true;

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err);
  });
}