import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { Issue } from '../models/Issue.model';
import { Comment } from '../models/Comment.model';
import { User } from '../models/User.model';
import { hashPassword } from '../utils/password';

const app = createApp();
let mongod: MongoMemoryServer;

let ownerToken: string;
let otherToken: string;
let moderatorToken: string;

async function registerAndLogin(email: string): Promise<string> {
  await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'password123', municipality: 'Lappeenranta' });
  const login = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return login.body.token;
}

async function createIssue(token: string = ownerToken): Promise<string> {
  const res = await request(app)
    .post('/api/issues')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Original title',
      description: 'Original description',
      category: 'pothole',
      location: { lat: 61.05, lng: 28.18 },
      municipality: 'Lappeenranta',
    });
  return res.body.issue._id;
}

async function createComment(issueId: string, token: string): Promise<string> {
  const res = await request(app)
    .post(`/api/issues/${issueId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ text: 'A comment' });
  return res.body.comment._id;
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri());

  ownerToken = await registerAndLogin('owner@example.com');
  otherToken = await registerAndLogin('other@example.com');

  // Moderators can't self-register, so this one is created directly.
  await User.create({
    email: 'mod@example.com',
    passwordHash: await hashPassword('password123'),
    municipality: 'Lappeenranta',
    role: 'moderator',
  });
  const modLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'mod@example.com', password: 'password123' });
  moderatorToken = modLogin.body.token;
});

afterAll(async () => {
  await disconnectDB();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Issue.deleteMany({});
  await Comment.deleteMany({});
});

describe('PATCH /api/issues/:id (edit content)', () => {
  it('lets the owner edit their own issue', async () => {
    const issueId = await createIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'New title', category: 'graffiti' });

    expect(res.status).toBe(200);
    expect(res.body.issue.title).toBe('New title');
    expect(res.body.issue.category).toBe('graffiti');
    expect(res.body.issue.description).toBe('Original description');
  });

  it("lets a moderator edit anyone's issue", async () => {
    const issueId = await createIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ description: 'Clarified by moderator' });

    expect(res.status).toBe(200);
    expect(res.body.issue.description).toBe('Clarified by moderator');
  });

  it('blocks a different resident and leaves the issue unchanged', async () => {
    const issueId = await createIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hijacked' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('AUTH_FORBIDDEN');

    const stored = await Issue.findById(issueId);
    expect(stored?.title).toBe('Original title');
  });

  it('rejects an edit without a token', async () => {
    const issueId = await createIssue();

    const res = await request(app).patch(`/api/issues/${issueId}`).send({ title: 'x' });

    expect(res.status).toBe(401);
  });

  it('ignores fields that are not editable (status cannot be changed here)', async () => {
    const issueId = await createIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Edited', status: 'resolved' });

    expect(res.status).toBe(200);
    expect(res.body.issue.title).toBe('Edited');
    expect(res.body.issue.status).toBe('reported');
  });

  it('rejects an invalid category', async () => {
    const issueId = await createIssue();

    const res = await request(app)
      .patch(`/api/issues/${issueId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ category: 'not-a-category' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/comments/:id', () => {
  it('lets the author delete their own comment', async () => {
    const issueId = await createIssue();
    const commentId = await createComment(issueId, ownerToken);

    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(await Comment.findById(commentId)).toBeNull();
  });

  it('blocks a different resident from deleting it', async () => {
    const issueId = await createIssue();
    const commentId = await createComment(issueId, ownerToken);

    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(await Comment.findById(commentId)).not.toBeNull();
  });

  it("lets a moderator delete anyone's comment", async () => {
    const issueId = await createIssue();
    const commentId = await createComment(issueId, ownerToken);

    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${moderatorToken}`);

    expect(res.status).toBe(200);
    expect(await Comment.findById(commentId)).toBeNull();
  });

  it('rejects deletion without a token', async () => {
    const issueId = await createIssue();
    const commentId = await createComment(issueId, ownerToken);

    const res = await request(app).delete(`/api/comments/${commentId}`);

    expect(res.status).toBe(401);
  });

  it('returns 404 for a comment that does not exist', async () => {
    const res = await request(app)
      .delete(`/api/comments/${new Types.ObjectId().toString()}`)
      .set('Authorization', `Bearer ${moderatorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('COMMENT_NOT_FOUND');
  });
});

describe('DELETE /api/issues/:id (cascade)', () => {
  it("removes the issue's comments but keeps other issues' comments", async () => {
    const doomedId = await createIssue();
    const survivorId = await createIssue();
    const doomedComment = await createComment(doomedId, ownerToken);
    const survivorComment = await createComment(survivorId, ownerToken);

    const res = await request(app)
      .delete(`/api/issues/${doomedId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(await Comment.findById(doomedComment)).toBeNull();
    expect(await Comment.findById(survivorComment)).not.toBeNull();
  });
});
