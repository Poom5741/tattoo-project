/**
 * Passkey — WebAuthn registration and authentication wrappers.
 *
 * These functions require the WebAuthn API (navigator.credentials),
 * available in modern browsers. They are not testable in vitest
 * without mocking the full Credential Management API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
 */

/** Check if the browser supports WebAuthn. */
export function isWebAuthnSupported(): boolean {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined";
}

/** Check if a platform authenticator (Face ID / Touch ID) is available. */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

/** Register a new passkey credential. Returns the credential. */
export async function registerPasskey(
  challenge: Uint8Array,
  rpName: string,
  rpId: string,
  userId: Uint8Array,
  userName: string,
): Promise<PublicKeyCredential | null> {
  if (!isWebAuthnSupported()) return null;
  try {
    return await navigator.credentials.create({
      publicKey: {
        challenge: challenge as Uint8Array<ArrayBuffer>,
        rp: { name: rpName, id: rpId },
        user: {
          id: userId as Uint8Array<ArrayBuffer>,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        extensions: { prf: {} },
      },
    }) as PublicKeyCredential | null;
  } catch {
    return null;
  }
}

/** Authenticate with an existing passkey credential. Returns the assertion. */
export async function authenticateWithPasskey(
  challenge: Uint8Array,
  rpId: string,
): Promise<PublicKeyCredential | null> {
  if (!isWebAuthnSupported()) return null;
  try {
    return await navigator.credentials.get({
      publicKey: {
        challenge: challenge as Uint8Array<ArrayBuffer>,
        rpId,
        userVerification: "required",
        extensions: { prf: {} },
      },
    }) as PublicKeyCredential | null;
  } catch {
    return null;
  }
}
