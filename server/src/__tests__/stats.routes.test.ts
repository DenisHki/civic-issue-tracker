import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { connectDB } from '../config/db';
import { User } from '../models/User.model';
import { Issue } from '../models/Issue.model';

const app = createApp();
let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Issue.deleteMany({})]);
});

describe('GET /api/stats', () => {
  it('returns zeros when there are no issues', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.stats).toEqual({
      reported: 0,
      in_progress: 0,
      resolved: 0,
      total: 0,
    });
  });

  it('counts issues by status', async () => {
    const user = await User.create({
      email: 'stats@example.com',
      passwordHash: 'not-used-in-this-test',
      municipality: 'Lahti',
    });

    const base = {
      reportedBy: user._id,
      location: { lat: 60.98, lng: 25.66 },
      description: 'Test',
      category: 'pothole' as const,
      municipality: 'Lahti',
    };

    await Issue.create([
      { ...base, title: 'One' },
      { ...base, title: 'Two' },
      { ...base, title: 'Three', status: 'in_progress' },
      { ...base, title: 'Four', status: 'resolved' },
    ]);

    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.stats).toEqual({
      reported: 2,
      in_progress: 1,
      resolved: 1,
      total: 4,
    });
  });
});