import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

export async function connectDB(uri: string = env.mongoUri): Promise<void> {
  if (isConnected) return;

  await mongoose.connect(uri);
  isConnected = true;

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err);
  });
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}
