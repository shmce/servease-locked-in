export class InvalidSharedGeoRequestError extends Error {
  constructor() {
    super('invalid_shared_geo_request');
  }
}

export class SharedGeoDependencyUnavailableError extends Error {
  constructor() {
    super('shared_geo_dependency_unavailable');
  }
}

