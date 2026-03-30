import * as dns from 'dns/promises';
import { isValidEmail, isKbtuEmail, verifyEmailDomain, hashPassword, comparePassword, generateToken, registerPublic, checkEmail, prisma } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';

jest.mock('dns/promises', () => ({
  resolveMx: jest.fn(),
  resolve4: jest.fn(),
  resolve6: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const user = {
    findUnique: jest.fn(),
    create: jest.fn(),
  };

  const PrismaClient = jest.fn().mockImplementation(() => ({ user }));

  return {
    PrismaClient,
  };
});

describe('authController core utilities', () => {
  beforeEach(() => {
    dns.resolveMx.mockReset();
    dns.resolve4.mockReset();
    dns.resolve6.mockReset();
  });

  test('isValidEmail should validate email format', () => {
    expect(isValidEmail('something@kbtu.kz')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@example')).toBe(false);
  });

  test('isKbtuEmail should accept only @kbtu.kz', () => {
    expect(isKbtuEmail('user@kbtu.kz')).toBe(true);
    expect(isKbtuEmail('user@KBTU.KZ')).toBe(true);
    expect(isKbtuEmail('user@example.com')).toBe(false);
  });

  test('hashPassword and comparePassword should work properly', async () => {
    const password = 'Secret123!';
    const hashed = await hashPassword(password);
    expect(hashed).not.toBe(password);
    expect(await comparePassword(password, hashed)).toBe(true);
    expect(await comparePassword('wrong', hashed)).toBe(false);
  });

  test('generateToken should create valid JWT', () => {
    const token = generateToken(123);
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    expect(payload).toHaveProperty('userId', 123);
  });

  test('verifyEmailDomain should return false for invalid email', async () => {
    expect(await verifyEmailDomain('no-at-sign')).toBe(false);
  });

  test('verifyEmailDomain should return true when MX exists', async () => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx1.example.com', priority: 10 }]);
    expect(await verifyEmailDomain('user@kbtu.kz')).toBe(true);
  });

  test('verifyEmailDomain should fallback to A/AAAA when no MX', async () => {
    dns.resolveMx.mockRejectedValue(new Error('no mx'));
    dns.resolve4.mockResolvedValue(['1.1.1.1']);
    expect(await verifyEmailDomain('user@kbtu.kz')).toBe(true);
  });

  test('verifyEmailDomain should return false when domain does not exist', async () => {
    dns.resolveMx.mockRejectedValue(new Error('no mx'));
    dns.resolve4.mockRejectedValue(new Error('no a'));
    dns.resolve6.mockRejectedValue(new Error('no aaaa'));
    expect(await verifyEmailDomain('user@kbtu.kz')).toBe(false);
  });
});

describe('authController routes (unit)', () => {
  let userMock;

  beforeEach(() => {
    userMock = prisma.user;
    userMock.findUnique.mockReset();
    userMock.create.mockReset();
  });

  test('checkEmail: missing email param', async () => {
    const req = { query: {} };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    await checkEmail(req, { status });
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Email query parameter is required' });
  });

  test('checkEmail: non-kbtu email', async () => {
    const req = { query: { email: 'user@example.com' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    await checkEmail(req, { status });
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Registration allowed only for @kbtu.kz email addresses' });
  });

  test('checkEmail: available', async () => {
    userMock.findUnique.mockResolvedValue(null);
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx1.kbtu.kz', priority: 10 }]);
    const req = { query: { email: 'user@kbtu.kz' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    await checkEmail(req, { status, json });
    expect(json).toHaveBeenCalledWith({ valid: true, available: true });
  });

  test('registerPublic success', async () => {
    dns.resolveMx.mockResolvedValue([{ exchange: 'mx1.kbtu.kz', priority: 10 }]);
    userMock.findUnique.mockResolvedValue(null);
    userMock.create.mockResolvedValue({ id: 1, email: 'user@kbtu.kz', name: 'User', role: 'viewer' });

    const req = { body: { email: 'user@kbtu.kz', name: 'User', password: 'pwd1234' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    await registerPublic(req, { status });

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String), user: { id: 1, email: 'user@kbtu.kz', name: 'User', role: 'viewer' } }));
  });
});

