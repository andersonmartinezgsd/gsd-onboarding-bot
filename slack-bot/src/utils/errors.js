export class AppError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}

export class IntegrationError extends AppError {
  constructor(service, message, context = {}) {
    super(`[${service}] ${message}`, 'INTEGRATION_ERROR', context);
    this.name = 'IntegrationError';
    this.service = service;
  }
}

export class WorkflowError extends AppError {
  constructor(message, processId, context = {}) {
    super(message, 'WORKFLOW_ERROR', context);
    this.name = 'WorkflowError';
    this.processId = processId;
  }
}
