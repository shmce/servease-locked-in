export const API_MAJOR_VERSION = 'v1';

export function buildSharedApiPath(domain: string, resourcePath = ''): string {
  return `/api/shared/${domain}/${API_MAJOR_VERSION}${normalizeResourcePath(resourcePath)}`;
}

export function buildTribeApiPath(tribeId: number, domain: string, resourcePath = ''): string {
  return `/api/tribe${tribeId}/${domain}/${API_MAJOR_VERSION}${normalizeResourcePath(resourcePath)}`;
}

function normalizeResourcePath(resourcePath: string): string {
  if (!resourcePath) {
    return '';
  }

  return resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`;
}
