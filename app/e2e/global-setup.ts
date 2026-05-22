import { EMU_AUTH, EMU_FIRESTORE, PROJECT_ID, TEST_EMAIL, TEST_PASSWORD } from './support';

/** Clears the Firestore emulator and seeds the E2E test user before the suite runs. */
export default async function globalSetup() {
  // Wipe Firestore so each run starts clean (notas dedup keys off Firestore).
  await fetch(`${EMU_FIRESTORE}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, {
    method: 'DELETE',
  }).catch(() => undefined);

  // Seed the test user (ignore "already exists").
  const res = await fetch(`${EMU_AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
  }).catch(() => undefined);

  if (res && !res.ok) {
    const body = await res.text();
    if (!body.includes('EMAIL_EXISTS')) {
      throw new Error(`Falha ao semear usuário E2E (HTTP ${res.status}): ${body}. Os emuladores estão rodando?`);
    }
  }
}
