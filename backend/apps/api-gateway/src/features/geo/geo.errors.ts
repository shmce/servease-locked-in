export class InvalidGeoRequestError extends Error {
  constructor() {
    super('invalid_geo_request');
  }
}

export class GeoDependencyUnavailableError extends Error {
  constructor() {
    super('geo_dependency_unavailable');
  }
}

