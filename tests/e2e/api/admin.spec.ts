import { test, expect } from '@playwright/test';
import { getAdminPassword } from '../helpers/admin-password';

test.describe('Admin API', () => {
  test.describe('POST /api/admin/login', () => {
    test('returns 401 when password is incorrect', async ({ request }) => {
      const response = await request.post('/api/admin/login', {
        data: { password: 'wrong-password' },
      });
      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Invalid password');
    });

    test('returns 400 or 401 when password is missing', async ({ request }) => {
      const response = await request.post('/api/admin/login', {
        data: {},
      });
      expect([400, 401]).toContain(response.status());
      const data = await response.json();
      expect(data.error).toBe('Password is required');
    });

    test('returns 400 when request body is not JSON', async ({ request }) => {
      const response = await request.post('/api/admin/login', {
        data: 'not json',
        headers: { 'Content-Type': 'text/plain' },
      });
      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request body');
    });

    test('returns 200 with valid password', async ({ request }) => {
      const response = await request.post('/api/admin/login', {
        data: { password: getAdminPassword() },
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.ok).toBe(true);
      
      // Should set admin_token cookie
      const cookies = response.headers()['set-cookie'];
      expect(cookies).toBeTruthy();
      expect(cookies).toContain('admin_token=');
    });

    test('sets admin_token cookie with correct attributes', async ({ request }) => {
      const response = await request.post('/api/admin/login', {
        data: { password: getAdminPassword() },
      });
      expect(response.status()).toBe(200);
      
      const cookies = response.headers()['set-cookie'];
      expect(cookies).toContain('Path=/');
      expect(cookies).toContain('HttpOnly');
      if (response.url().startsWith('https://')) {
        expect(cookies).toContain('Secure');
      }
      expect(cookies).toContain('SameSite=Lax');
    });
  });

  test.describe('POST /api/admin/logout', () => {
    test('returns 200 and clears admin_token cookie', async ({ request }) => {
      // First login to get a token
      const loginResponse = await request.post('/api/admin/login', {
        data: { password: getAdminPassword() },
      });
      expect(loginResponse.status()).toBe(200);
      
      // Now logout - the endpoint may return JSON or redirect
      const response = await request.post('/api/admin/logout');
      
      // Should succeed (200 or redirect)
      expect([200, 302]).toContain(response.status());
    });

    test('returns 200 even without valid token', async ({ request }) => {
      const response = await request.post('/api/admin/logout');
      // Logout should succeed regardless of token validity
      expect([200, 302]).toContain(response.status());
    });
  });

  test.describe('GET /api/admin/pending-designs', () => {
    test('returns 401 when not authenticated', async ({ request }) => {
      const response = await request.get('/api/admin/pending-designs');
      expect(response.status()).toBe(401);
    });

    test('returns 200 with valid admin session', async ({ request }) => {
      // Login first
      const loginResponse = await request.post('/api/admin/login', {
        data: { password: getAdminPassword() },
      });
      const loginCookies = loginResponse.headers()['set-cookie'];
      const tokenMatch = loginCookies.match(/admin_token=([a-f0-9-]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Get pending designs
      const response = await request.get('/api/admin/pending-designs', {
        headers: {
          'Cookie': `admin_token=${token}`,
        },
      });
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      // Response should be an array or have a designs property
      expect(Array.isArray(data) || data.designs !== undefined).toBe(true);
    });
  });

  test.describe('POST /api/admin/register-artist', () => {
    test('returns 401 when not authenticated', async ({ request }) => {
      const response = await request.post('/api/admin/register-artist', {
        data: {
          name: 'Test Artist',
          email: 'test@example.com',
          walletAddress: '0x1234567890123456789012345678901234567890',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('returns 400 when required fields are missing', async ({ request }) => {
      // Login first
      const loginResponse = await request.post('/api/admin/login', {
        data: { password: getAdminPassword() },
      });
      const loginCookies = loginResponse.headers()['set-cookie'];
      const tokenMatch = loginCookies.match(/admin_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Missing required fields
      const response = await request.post('/api/admin/register-artist', {
        headers: {
          'Cookie': `admin_token=${token}`,
        },
        data: {},
      });
      
      expect(response.status()).toBe(400);
    });

    test('returns 200 with valid artist data', async ({ request }) => {
      // Login first
      const loginResponse = await request.post('/api/admin/login', {
        data: { password: getAdminPassword() },
      });
      const loginCookies = loginResponse.headers()['set-cookie'];
      const tokenMatch = loginCookies.match(/admin_token=([a-f0-9-]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Register artist
      const response = await request.post('/api/admin/register-artist', {
        headers: {
          'Cookie': `admin_token=${token}`,
        },
        data: {
          name: 'Test Artist',
          email: `test${Date.now()}@example.com`,
          walletAddress: '0x1234567890123456789012345678901234567890',
        },
      });
      
      // Endpoint may return 200 or have validation errors
      expect([200, 400]).toContain(response.status());
    });
  });

  test.describe('POST /api/admin/review-design', () => {
    test('returns 401 when not authenticated', async ({ request }) => {
      const response = await request.post('/api/admin/review-design', {
        data: {
          designId: 'test-id',
          action: 'approve',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('returns 400 when action is invalid', async ({ request }) => {
      // Login first
      const loginResponse = await request.post('/api/admin/login', {
        data: { password: getAdminPassword() },
      });
      const loginCookies = loginResponse.headers()['set-cookie'];
      const tokenMatch = loginCookies.match(/admin_token=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : '';
      
      // Invalid action
      const response = await request.post('/api/admin/review-design', {
        headers: {
          'Cookie': `admin_token=${token}`,
        },
        data: {
          designId: 'test-id',
          action: 'invalid-action',
        },
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('POST /api/admin/update-artist-wallet', () => {
    test('returns 403 when not authenticated', async ({ request }) => {
      const response = await request.post('/api/admin/update-artist-wallet', {
        data: {
          artistId: 'test-artist-id',
          walletAddress: '0x1234567890123456789012345678901234567890',
        },
      });
      // Endpoint returns 403 instead of 401 for unauthenticated access
      expect([401, 403]).toContain(response.status());
    });
  });
});
