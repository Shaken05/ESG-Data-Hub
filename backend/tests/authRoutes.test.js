import * as dns from 'dns/promises';
import request from 'supertest';
import app from '../server.js';
import { __mockPrismaClient } from '@prisma/client';

process.env.VERIFY_EMAIL_SMTP = 'false';
process.env.SKIP_EMAIL_DOMAIN_CHECK = 'false';

jest.mock('dns/promises', () => ({
  resolveMx: jest.fn(),
  resolve4: jest.fn(),
  resolve6: jest.fn(),
}));

const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => {
  const user = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  const mockPrismaClientObject = { user };

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClientObject),
    __mockPrismaClient: mockPrismaClientObject,
  };
});

describe('Auth routes', () => {
  beforeEach(() => {
    __mockPrismaClient.user.findUnique.mockReset();
    __mockPrismaClient.user.create.mockReset();
    dns.resolveMx.mockReset();
    dns.resolve4.mockReset();
    dns.resolve6.mockReset();
  });

  test('GET /api/auth/check-email requires email', async () => {
    const res = await request(app).get('/api/auth/check-email');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email query parameter is required');
  });

  test('GET /api/auth/check-email rejects invalid email', async () => {
    const res = await request(app).get('/api/auth/check-email?email=hello');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid email format');
  });

  test('GET /api/auth/check-email rejects non-kbtu email', async () => {
    const res = await request(app).get('/api/auth/check-email?email=test@example.com');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Registration allowed only for @kbtu.kz email addresses');
  });

  test('GET /api/auth/check-email returns availability false when exists', async () => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx1.kbtu.kz', priority: 10 }]);
    __mockPrismaClient.user.findUnique.mockResolvedValue({ id: 1, email: 'test@kbtu.kz' });
    const res = await request(app).get('/api/auth/check-email?email=test@kbtu.kz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true, available: false });
    expect(__mockPrismaClient.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@kbtu.kz' } });
  });

  test('GET /api/auth/check-email returns availability true when missing', async () => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx1.kbtu.kz', priority: 10 }]);
    __mockPrismaClient.user.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/auth/check-email?email=test@kbtu.kz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true, available: true });
  });

  test('POST /api/auth/register should require fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email, password and name are required');
  });

  test('POST /api/auth/register should create viewer user for kbtu email', async () => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx1.kbtu.kz', priority: 10 }]);
    __mockPrismaClient.user.findUnique.mockResolvedValue(null);
    __mockPrismaClient.user.create.mockResolvedValue({ id: 1, email: 'new@kbtu.kz', name: 'New', role: 'viewer' });

    const res = await request(app).post('/api/auth/register').send({ email: 'new@kbtu.kz', password: 'pass1234', name: 'New' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: 'new@kbtu.kz', role: 'viewer', name: 'New' });
    expect(__mockPrismaClient.user.create).toHaveBeenCalled();
  });
  test('POST /api/auth/register should reject duplicate user', async () => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx1.kbtu.kz', priority: 10 }]);
    __mockPrismaClient.user.findUnique.mockResolvedValue({ id: 2, email: 'new@kbtu.kz' });
    const res = await request(app).post('/api/auth/register').send({ email: 'new@kbtu.kz', password: 'pass1234', name: 'New' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('User with this email already exists');
  });
});
