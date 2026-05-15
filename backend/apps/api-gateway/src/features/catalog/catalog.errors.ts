export class InvalidCatalogFilterError extends Error {
  constructor() {
    super('invalid_catalog_filter');
  }
}

export class CatalogDependencyUnavailableError extends Error {
  constructor() {
    super('catalog_dependency_unavailable');
  }
}
