import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User.model';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDB(mongod.getUri());
  await User.init();
});

afterAll(async () => {
  await disconnectDB();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User model', () => {
  it('creates a valid user with default role "resident"', async () => {
    const user = await User.create({
      email: 'resident@example.com',
      passwordHash: 'hashed',
      municipality: 'Lappeenranta',
    });

    expect(user.role).toBe('resident');
    expect(user.email).toBe('resident@example.com');
  });

  it('rejects a duplicate email', async () => {
    await User.create({ email: 'dup@example.com', passwordHash: 'x', municipality: 'Lahti' });

    await expect(
      User.create({ email: 'dup@example.com', passwordHash: 'y', municipality: 'Lahti' }),
    ).rejects.toThrow();
  });

  it('rejects an invalid email format', async () => {
    await expect(
      User.create({ email: 'not-an-email', passwordHash: 'x', municipality: 'Espoo' }),
    ).rejects.toThrow('USER_EMAIL_INVALID');
  });

  it('excludes passwordHash from the JSON output', async () => {
    const user = await User.create({
      email: 'secret@example.com',
      passwordHash: 'should-not-leak',
      municipality: 'Oulu',
    });

    const json = user.toJSON() as unknown as Record<string, unknown>;
    expect(json.passwordHash).toBeUndefined();
  });
});
