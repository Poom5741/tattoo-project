/**
 * Wallet backup API tests
 * Covers issue #46: Wallet backup to D1 + cross-auth recovery
 */

import { test, expect } from '@playwright/test';

test.describe('POST /api/wallet/backup', () => {
  test('returns 401 when not authenticated', async ({ request }) => {
    const response = await request.post('/api/wallet/backup', {
      data: {
        address: '0x1234567890123456789012345678901234567890',
        encryptedBlob: 'encrypted-data',
        recoverySalt: 'salt-value',
      },
    });
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Not authenticated');
  });

  // Note: Validation tests (400 errors) require authentication.
  // The endpoint checks auth before parsing the payload, so we can't
  // test invalid JSON, missing fields, or invalid address format without
  // a real Better Auth session. These would be covered in integration
  // tests with proper auth setup.
});

test.describe('GET /api/wallet/backup', () => {
  test('returns 401 when not authenticated', async ({ request }) => {
    const response = await request.get('/api/wallet/backup');
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Not authenticated');
  });
});
