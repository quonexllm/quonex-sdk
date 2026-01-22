/**
 * Byte manipulation utilities for Borsh encoding/decoding
 */

import { DeserializationError, SerializationError } from "../errors.js";

/**
 * Write a u8 to buffer at offset
 */
export function writeU8(buffer: Buffer, offset: number, value: number): void {
  if (offset + 1 > buffer.length) {
    throw new SerializationError("Buffer overflow writing u8");
  }
  buffer.writeUInt8(value, offset);
}

/**
 * Write a u16 (LE) to buffer at offset
 */
export function writeU16LE(buffer: Buffer, offset: number, value: number): void {
  if (offset + 2 > buffer.length) {
    throw new SerializationError("Buffer overflow writing u16");
  }
  buffer.writeUInt16LE(value, offset);
}

/**
 * Write a u32 (LE) to buffer at offset
 */
export function writeU32LE(buffer: Buffer, offset: number, value: number): void {
  if (offset + 4 > buffer.length) {
    throw new SerializationError("Buffer overflow writing u32");
  }
  buffer.writeUInt32LE(value, offset);
}

/**
 * Write a u64 (LE) to buffer at offset
 * JavaScript numbers lose precision for u64, so we use bigint
 */
export function writeU64LE(buffer: Buffer, offset: number, value: bigint): void {
  if (offset + 8 > buffer.length) {
    throw new SerializationError("Buffer overflow writing u64");
  }
  buffer.writeBigUInt64LE(value, offset);
}

/**
 * Write a string (u32 length prefix + bytes) to buffer at offset
 * Returns the new offset after writing
 */
export function writeString(buffer: Buffer, offset: number, value: string): number {
  const bytes = Buffer.from(value, "utf-8");
  if (offset + 4 + bytes.length > buffer.length) {
    throw new SerializationError("Buffer overflow writing string");
  }
  buffer.writeUInt32LE(bytes.length, offset);
  bytes.copy(buffer, offset + 4);
  return offset + 4 + bytes.length;
}

/**
 * Read a u8 from buffer at offset
 */
export function readU8(buffer: Buffer, offset: number): number {
  if (offset + 1 > buffer.length) {
    throw new DeserializationError("Buffer underflow reading u8");
  }
  return buffer.readUInt8(offset);
}

/**
 * Read a u16 (LE) from buffer at offset
 */
export function readU16LE(buffer: Buffer, offset: number): number {
  if (offset + 2 > buffer.length) {
    throw new DeserializationError("Buffer underflow reading u16");
  }
  return buffer.readUInt16LE(offset);
}

/**
 * Read a u32 (LE) from buffer at offset
 */
export function readU32LE(buffer: Buffer, offset: number): number {
  if (offset + 4 > buffer.length) {
    throw new DeserializationError("Buffer underflow reading u32");
  }
  return buffer.readUInt32LE(offset);
}

/**
 * Read a u64 (LE) from buffer at offset
 */
export function readU64LE(buffer: Buffer, offset: number): bigint {
  if (offset + 8 > buffer.length) {
    throw new DeserializationError("Buffer underflow reading u64");
  }
  return buffer.readBigUInt64LE(offset);
}

/**
 * Read a string (u32 length prefix + bytes) from buffer at offset
 * Returns [value, newOffset]
 */
export function readString(buffer: Buffer, offset: number): [string, number] {
  if (offset + 4 > buffer.length) {
    throw new DeserializationError("Buffer underflow reading string length");
  }
  const len = buffer.readUInt32LE(offset);
  const start = offset + 4;
  const end = start + len;
  if (end > buffer.length) {
    throw new DeserializationError("Buffer underflow reading string data");
  }
  const value = buffer.toString("utf-8", start, end);
  return [value, end];
}

/**
 * Calculate size needed for encoding a string
 */
export function sizeofString(value: string): number {
  return 4 + Buffer.byteLength(value, "utf-8");
}
