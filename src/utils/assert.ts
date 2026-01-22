import { ValidationError } from "../errors.js";

/**
 * Assert that a string is non-empty
 */
export function assertNonEmptyString(name: string, value: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError(`${name} must be a non-empty string`);
  }
}

/**
 * Assert that a string does not exceed max length
 */
export function assertMaxLen(name: string, value: string, max: number): void {
  if (value.length > max) {
    throw new ValidationError(`${name} exceeds maximum length of ${max}. Got ${value.length}`);
  }
}

/**
 * Assert that a value is a valid u32 (0 to 2^32 - 1)
 */
export function assertU32(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new ValidationError(`${name} must be a valid u32 (0 to 4294967295). Got ${value}`);
  }
}

/**
 * Convert a float (0.0 to 1.0) to u16 millis (0 to 1000)
 * E.g., 0.7 => 700, 0.5 => 500
 */
export function toU16Milli(name: string, value: number): number {
  if (typeof value !== "number" || value < 0 || value > 1) {
    throw new ValidationError(`${name} must be a number between 0 and 1. Got ${value}`);
  }
  const milli = Math.round(value * 1000);
  if (milli > 0xffff) {
    throw new ValidationError(
      `${name} scaled to millis exceeds u16 max. Got ${milli} (${value} * 1000)`
    );
  }
  return milli;
}

/**
 * Convert u16 millis to a float
 * E.g., 700 => 0.7
 */
export function fromU16Milli(milli: number): number {
  return milli / 1000;
}
