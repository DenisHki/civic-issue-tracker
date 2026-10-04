import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { Issue } from '../models/Issue.model';
import { Comment } from '../models/Comment.model';

const app = createApp();
let mongod: MongoMemoryServer;
let token: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri());

  await request(app).post('/api/auth/register').send({
    email: 'voter@example.com',
    password: 'password123',
    municipality: 'Lappeenranta',
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'voter@example.com',
    password: 'password123',
  });
  token = login.body.token;
});

afterAll(async () => {
  await disconnectDB();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Issue.deleteMany({});
  await Comment.deleteMany({});
});

async function createTestIssue() {
  const res = await request(app)
    .post('/api/issues')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test issue',
      description: 'For upvote/comment tests',
      category: 'other',
      location: { lat: 61.05, lng: 28.18 },
      municipality: 'Lappeenranta',
    });
  return res.body.issue._id;
}

describe('POST /api/issues/:id/upvote', () => {
  it('adds an upvote on first call', async () => {
    const issueId = await createTestIssue();

    const res = await request(app)
      .post(`/api/issues/${issueId}/upvote`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.issue.upvoteCount).toBe(1);
  });

  it('removes the upvote on a second call (toggle)', async () => {
    const issueId = await createTestIssue();

    await request(app)
      .post(`/api/issues/${issueId}/upvote`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .post(`/api/issues/${issueId}/upvote`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.issue.upvoteCount).toBe(0);
  });
});

describe('POST /api/issues/:id/comments', () => {
  it('creates a comment when authenticated', async () => {
    const issueId = await createTestIssue();

    const res = await request(app)
      .post(`/api/issues/${issueId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'This affects my street too' });

    expect(res.status).toBe(201);
    expect(res.body.comment.text).toBe('This affects my street too');
  });

  it('rejects a comment without a token', async () => {
    const issueId = await createTestIssue();

    const res = await request(app)
      .post(`/api/issues/${issueId}/comments`)
      .send({ text: 'Should fail' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/issues/:id/comments', () => {
  it('lists comments for an issue', async () => {
    const issueId = await createTestIssue();

    await request(app)
      .post(`/api/issues/${issueId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'First comment' });

    const res = await request(app).get(`/api/issues/${issueId}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].text).toBe('First comment');
  });
});
