export function getBackendEnvFilePaths(
  nodeEnv = process.env.NODE_ENV,
): string[] {
  const mode = nodeEnv?.trim();

  return [
    ...(mode ? [`.env.${mode}.local`] : []),
    ...(mode === 'test' ? [] : ['.env.local']),
    ...(mode ? [`.env.${mode}`] : []),
    '.env',
  ];
}
