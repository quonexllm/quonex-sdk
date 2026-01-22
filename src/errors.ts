/**
 * Custom error classes for SDK operations
 */

export class QuonexSDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuonexSDKError";
  }
}

export class ValidationError extends QuonexSDKError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class SerializationError extends QuonexSDKError {
  constructor(message: string) {
    super(message);
    this.name = "SerializationError";
  }
}

export class DeserializationError extends QuonexSDKError {
  constructor(message: string) {
    super(message);
    this.name = "DeserializationError";
  }
}
