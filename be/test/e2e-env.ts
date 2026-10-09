// Loaded by jest before the test files (and therefore before ConfigModule reads the environment).
// Fake Google credentials enable the OAuth routes; the e2e tests never reach Google itself.
process.env.GOOGLE_CLIENT_ID = 'e2e-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = 'e2e-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:8080/api/auth/google/callback';
process.env.FRONTEND_URL = 'http://frontend.e2e';

// Object storage: the local SeaweedFS of docker-compose.yml (`docker compose up -d seaweedfs storage-init`).
// Values already present in the environment (CI, another S3) win.
const storageDefaults: Record<string, string> = {
  STORAGE_ENDPOINT: 'http://localhost:8333',
  STORAGE_REGION: 'us-east-1',
  STORAGE_BUCKET: 'wrapfit',
  STORAGE_PRIVATE_BUCKET: 'wrapfit-private',
  STORAGE_ACCESS_KEY_ID: 'wrapfit-dev-access',
  STORAGE_SECRET_ACCESS_KEY: 'wrapfit-dev-secret-change-me',
  STORAGE_PUBLIC_URL: 'http://localhost:8333/wrapfit',
  STORAGE_FORCE_PATH_STYLE: 'true',
};
for (const [key, value] of Object.entries(storageDefaults)) process.env[key] ??= value;

// Never call the paid Claude API from tests: the AI module falls back to its procedural generator.
process.env.ANTHROPIC_API_KEY = '';
