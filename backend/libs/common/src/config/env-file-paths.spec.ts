import { getBackendEnvFilePaths } from './env-file-paths';

describe('getBackendEnvFilePaths', () => {
  it('prioritizes local and mode-specific backend env files', () => {
    expect(getBackendEnvFilePaths('production')).toEqual([
      '.env.production.local',
      '.env.local',
      '.env.production',
      '.env',
    ]);
  });

  it('omits .env.local during tests', () => {
    expect(getBackendEnvFilePaths('test')).toEqual([
      '.env.test.local',
      '.env.test',
      '.env',
    ]);
  });

  it('falls back to backend .env when NODE_ENV is blank', () => {
    expect(getBackendEnvFilePaths('')).toEqual(['.env.local', '.env']);
  });
});
