import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { Issue } from '../models/Issue.model';
import { User } from '../models/User.model';

const app = createApp();
let mongod: MongoMemoryServer;

let residentToken: string;
let moderatorToken: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri());

  await request(app).post('/api/auth/register').send({
    email: 'resident@example.com',
    password: 'password123',
    municipality: 'Lappeenranta',
  });
  const residentLogin = await request(app).post('/api/auth/login').send({
    email: 'resident@example.com',
    password: 'password123',
  });
  residentToken = residentLogin.body.token;

  await User.create({
    email: 'moderator@example.com',
    passwordHash: await import('../utils/password').then((m) => m.hashPassword('password123')),
    municipality: 'Lappeenranta',
    role: 'moderator',
  });
  const moderatorLogin = await request(app).post('/api/auth/login').send({
    email: 'moderator@example.com',
    password: 'password123',
  });
  moderatorToken = moderatorLogin.body.token;
});

afterAll(async () => {
  await disconnectDB();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Issue.deleteMany({});
});

describe('POST /api/issues', () => {
  it('creates an issue when authenticated', async () => {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${residentToken}`)
      .send({
        title: 'Pothole on Main St',
        description: 'Large pothole near the crossing',
        category: 'pothole',
        location: { lat: 61.05, lng: 28.18 },
        municipality: 'Lappeenranta',
      });

    expect(res.status).toBe(201);
    expect(res.body.issue.status).toBe('reported');
    expect(res.body.issue.reportedBy).toBeDefined();
  });

  it('rejects creating an issue without a token', async () => {
    const res = await request(app)
      .post('/api/issues')
      .send({
        title: 'No auth issue',
        description: 'Should fail',
        category: 'pothole',
        location: { lat: 61.05, lng: 28.18 },
        municipality: 'Lappeenranta',
      });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/issues', () => {
  it('lists issues without requiring a token', async () => {
    await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${residentToken}`)
      .send({
        title: 'Streetlight out',
        description: 'Dark corner',
        category: 'streetlight',
        location: { lat: 61.05, lng: 28.18 },
        municipality: 'Lappeenranta',
      });

    const res = await request(app).get('/api/issues');

    expect(res.status).toBe(200);
    expect(res.body.issues).toHaveLength(1);
  });
});

describe('PATCH /api/issues/:id/status', () => {
  async function createTestIssue() {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${residentToken}`)
      .send({
        title: 'Broken bench',
        description: 'Needs repair',
        category: 'other',
        location: { lat: 61.05, lng: 28.18 },
        municipality: 'Lappeenranta',
      });
    return res.body.issue._id;
  }

  it('allows a moderator to update status', async () => {
    const issueId = await createTestIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}/status`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.issue.status).toBe('in_progress');
  });

  it('blocks a resident from updating status', async () => {
    const issueId = await createTestIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}/status`)
      .set('Authorization', `Bearer ${residentToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('AUTH_FORBIDDEN');
  });

  it('blocks status update with no token', async () => {
    const issueId = await createTestIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}/status`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(401);
  });
});
