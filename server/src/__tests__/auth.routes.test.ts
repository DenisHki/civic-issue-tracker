import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { connectDB } from '../config/db'; // same path as in your other test files
import { User } from '../models/User.model';

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
  await User.deleteMany({});
});

const validUser = { email: 'a@example.com', password: 'secret123', municipality: 'Lahti' };

describe('auth routes', () => {
  it('registers a user and never returns the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('a@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('ignores a role sent in the register body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'moderator' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('resident');
  });

  it('rejects non-string register fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: { $ne: null }, password: 'secret123', municipality: 'Lahti' });
    expect(res.status).toBe(400);
  });

  it('logs in and the token works on /auth/me', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe('resident');
  });

  it('gives the same error for an unknown email and a wrong password', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });
    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrong-password' });

    expect(unknown.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(unknown.body.error).toBe('AUTH_INVALID_CREDENTIALS');
    expect(wrong.body.error).toBe('AUTH_INVALID_CREDENTIALS');
  });

  it('rejects an operator object as the login email', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: 'secret123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('AUTH_MISSING_FIELDS');
  });

  it('rejects a non-string login password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: { $ne: null } });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('AUTH_MISSING_FIELDS');
  });
});
