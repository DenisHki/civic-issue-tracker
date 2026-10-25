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

describe('GET /api/issues filters', () => {
  beforeEach(async () => {
    const user = await User.create({
      email: 'filter@example.com',
      passwordHash: 'not-used-in-this-test',
      municipality: 'Lahti',
    });

    const base = { reportedBy: user._id, location: { lat: 60.98, lng: 25.66 } };

    await Issue.create([
      {
        ...base,
        title: 'Deep pothole',
        description: 'Near the school',
        category: 'pothole',
        municipality: 'Lahti',
      },
      {
        ...base,
        title: 'Broken light',
        description: 'Dark corner',
        category: 'streetlight',
        municipality: 'Lahti',
        status: 'resolved',
      },
      {
        ...base,
        title: 'Graffiti on wall',
        description: 'Library entrance',
        category: 'graffiti',
        municipality: 'Helsinki',
      },
    ]);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/issues?category=pothole');
    expect(res.status).toBe(200);
    expect(res.body.issues).toHaveLength(1);
    expect(res.body.issues[0].title).toBe('Deep pothole');
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/issues?status=resolved');
    expect(res.body.issues).toHaveLength(1);
    expect(res.body.issues[0].title).toBe('Broken light');
  });

  it('filters by municipality, ignoring case', async () => {
    const res = await request(app).get('/api/issues?municipality=lahti');
    expect(res.body.issues).toHaveLength(2);
  });

  it('searches title and description', async () => {
    const res = await request(app).get('/api/issues?q=school');
    expect(res.body.issues).toHaveLength(1);
    expect(res.body.issues[0].title).toBe('Deep pothole');
  });

  it('combines filters', async () => {
    const res = await request(app).get('/api/issues?municipality=Lahti&status=reported');
    expect(res.body.issues).toHaveLength(1);
    expect(res.body.issues[0].title).toBe('Deep pothole');
  });

  it('treats search text literally, not as a regex', async () => {
    const res = await request(app).get('/api/issues?q=.*');
    expect(res.status).toBe(200);
    expect(res.body.issues).toHaveLength(0);
  });

  it('ignores NoSQL operator objects in query params', async () => {
    const res = await request(app).get('/api/issues?status[$ne]=resolved');
    expect(res.status).toBe(200);
    expect(res.body.issues).toHaveLength(3);
  });
});
