export interface ServiceRuntimeConfig {
  name: string;
  defaultPort: number;
  portEnv?: string;
}

export function resolveServicePort(config: ServiceRuntimeConfig): number {
  const rawPort = config.portEnv ? process.env[config.portEnv] : process.env.PORT;
  const port = Number(rawPort ?? config.defaultPort);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`${config.name} received an invalid port: ${rawPort}`);
  }

  return port;
}
