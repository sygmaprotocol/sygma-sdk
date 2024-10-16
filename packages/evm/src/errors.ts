import type { ResourceType } from '@buildwithsygma/core';

export class UnsupportedResourceTypeError extends Error {
  constructor(expected: ResourceType, given: ResourceType) {
    super();
    this.name = 'UnsupportedResourceType Error';
    this.message = `Expected Type: ${expected} but ${given} was provided.`;
  }
}

export class UnregisteredFeeHandlerError extends Error {
  constructor(sygmaDomainId: number, sygmaResourceId: string) {
    super();
    this.name = 'UnregisteredFeeHandler Error';
    this.message = `Fee Handler not found for Resource ID ${sygmaResourceId} to Domain ${sygmaDomainId}`;
  }
}

export class UnregisteredResourceHandlerError extends Error {
  constructor(resourceId: string) {
    super();
    this.name = 'UnregisteredHandlerAddress';
    this.message = `Handler for resource ${resourceId} not registered.`;
  }
}
