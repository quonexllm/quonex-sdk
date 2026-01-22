/**
 * Custom Borsh codec for QuonexAI instructions
 * Uses manual byte-level encoding/decoding for reliability in ESM
 */

import {
  readU8,
  readU16LE,
  readU32LE,
  readU64LE,
  readString,
  writeU8,
  writeU16LE,
  writeU32LE,
  writeU64LE,
  writeString,
  sizeofString,
} from "../utils/bytes.js";
import type { SerializedLLMRequest, SerializedLLMResponse } from "../types.js";
import { DeserializationError } from "../errors.js";

/**
 * Encode a SerializedLLMRequest to Buffer
 */
export function encodeSubmitLLMRequest(data: SerializedLLMRequest): Buffer {
  // Calculate total size
  let size = 1; // discriminator
  size += 8; // requestNonce
  size += sizeofString(data.model);
  size += sizeofString(data.prompt);
  size += 1; // maxTokens option tag
  if (data.maxTokens !== null) {
    size += 4; // maxTokens value
  }
  size += 1; // temperatureMilli option tag
  if (data.temperatureMilli !== null) {
    size += 2; // temperatureMilli value
  }
  size += 1; // topPMilli option tag
  if (data.topPMilli !== null) {
    size += 2; // topPMilli value
  }
  size += 4; // metadata vec length
  for (const [key, value] of data.metadata) {
    size += sizeofString(key) + sizeofString(value);
  }

  const buffer = Buffer.alloc(size);
  let offset = 0;

  // Write discriminator
  writeU8(buffer, offset, data.discriminator);
  offset += 1;

  // Write requestNonce
  writeU64LE(buffer, offset, data.requestNonce);
  offset += 8;

  // Write model
  offset = writeString(buffer, offset, data.model);

  // Write prompt
  offset = writeString(buffer, offset, data.prompt);

  // Write maxTokens
  if (data.maxTokens !== null) {
    writeU8(buffer, offset, 1);
    offset += 1;
    writeU32LE(buffer, offset, data.maxTokens);
    offset += 4;
  } else {
    writeU8(buffer, offset, 0);
    offset += 1;
  }

  // Write temperatureMilli
  if (data.temperatureMilli !== null) {
    writeU8(buffer, offset, 1);
    offset += 1;
    writeU16LE(buffer, offset, data.temperatureMilli);
    offset += 2;
  } else {
    writeU8(buffer, offset, 0);
    offset += 1;
  }

  // Write topPMilli
  if (data.topPMilli !== null) {
    writeU8(buffer, offset, 1);
    offset += 1;
    writeU16LE(buffer, offset, data.topPMilli);
    offset += 2;
  } else {
    writeU8(buffer, offset, 0);
    offset += 1;
  }

  // Write metadata vec
  writeU32LE(buffer, offset, data.metadata.length);
  offset += 4;
  for (const [key, value] of data.metadata) {
    offset = writeString(buffer, offset, key);
    offset = writeString(buffer, offset, value);
  }

  return buffer;
}

/**
 * Decode a Buffer to SerializedLLMRequest
 */
export function decodeSubmitLLMRequest(buffer: Buffer): SerializedLLMRequest {
  let offset = 0;

  // Read discriminator
  const discriminator = readU8(buffer, offset);
  offset += 1;

  // Read requestNonce
  const requestNonce = readU64LE(buffer, offset);
  offset += 8;

  // Read model
  let model: string;
  [model, offset] = readString(buffer, offset);

  // Read prompt
  let prompt: string;
  [prompt, offset] = readString(buffer, offset);

  // Read maxTokens
  let maxTokens: number | null = null;
  const maxTokensTag = readU8(buffer, offset);
  offset += 1;
  if (maxTokensTag === 1) {
    maxTokens = readU32LE(buffer, offset);
    offset += 4;
  } else if (maxTokensTag !== 0) {
    throw new DeserializationError(`Invalid maxTokens option tag: ${maxTokensTag}`);
  }

  // Read temperatureMilli
  let temperatureMilli: number | null = null;
  const temperatureTag = readU8(buffer, offset);
  offset += 1;
  if (temperatureTag === 1) {
    temperatureMilli = readU16LE(buffer, offset);
    offset += 2;
  } else if (temperatureTag !== 0) {
    throw new DeserializationError(`Invalid temperatureMilli option tag: ${temperatureTag}`);
  }

  // Read topPMilli
  let topPMilli: number | null = null;
  const topPTag = readU8(buffer, offset);
  offset += 1;
  if (topPTag === 1) {
    topPMilli = readU16LE(buffer, offset);
    offset += 2;
  } else if (topPTag !== 0) {
    throw new DeserializationError(`Invalid topPMilli option tag: ${topPTag}`);
  }

  // Read metadata vec
  const metadataLen = readU32LE(buffer, offset);
  offset += 4;
  const metadata: Array<[string, string]> = [];
  for (let i = 0; i < metadataLen; i++) {
    let key: string;
    [key, offset] = readString(buffer, offset);
    let value: string;
    [value, offset] = readString(buffer, offset);
    metadata.push([key, value]);
  }

  return {
    discriminator,
    requestNonce,
    model,
    prompt,
    maxTokens,
    temperatureMilli,
    topPMilli,
    metadata,
  };
}

/**
 * Encode a SerializedLLMResponse to Buffer
 */
export function encodeSubmitLLMResponse(data: SerializedLLMResponse): Buffer {
  // Calculate total size
  let size = 1; // discriminator
  size += 1; // status
  size += sizeofString(data.output);
  size += 1; // errorMessage option tag
  if (data.errorMessage !== null) {
    size += sizeofString(data.errorMessage);
  }
  size += 1; // usage option tag
  if (data.usage !== null) {
    size += 4 + 4; // inputTokens + outputTokens
  }

  const buffer = Buffer.alloc(size);
  let offset = 0;

  // Write discriminator
  writeU8(buffer, offset, data.discriminator);
  offset += 1;

  // Write status
  writeU8(buffer, offset, data.status);
  offset += 1;

  // Write output
  offset = writeString(buffer, offset, data.output);

  // Write errorMessage
  if (data.errorMessage !== null) {
    writeU8(buffer, offset, 1);
    offset += 1;
    offset = writeString(buffer, offset, data.errorMessage);
  } else {
    writeU8(buffer, offset, 0);
    offset += 1;
  }

  // Write usage
  if (data.usage !== null) {
    writeU8(buffer, offset, 1);
    offset += 1;
    writeU32LE(buffer, offset, data.usage.inputTokens);
    offset += 4;
    writeU32LE(buffer, offset, data.usage.outputTokens);
    offset += 4;
  } else {
    writeU8(buffer, offset, 0);
    offset += 1;
  }

  return buffer;
}

/**
 * Decode a Buffer to SerializedLLMResponse
 */
export function decodeSubmitLLMResponse(buffer: Buffer): SerializedLLMResponse {
  let offset = 0;

  // Read discriminator
  const discriminator = readU8(buffer, offset);
  offset += 1;

  // Read status
  const status = readU8(buffer, offset);
  offset += 1;

  // Read output
  let output: string;
  [output, offset] = readString(buffer, offset);

  // Read errorMessage
  let errorMessage: string | null = null;
  const errorTag = readU8(buffer, offset);
  offset += 1;
  if (errorTag === 1) {
    [errorMessage, offset] = readString(buffer, offset);
  } else if (errorTag !== 0) {
    throw new DeserializationError(`Invalid errorMessage option tag: ${errorTag}`);
  }

  // Read usage
  let usage: { inputTokens: number; outputTokens: number } | null = null;
  const usageTag = readU8(buffer, offset);
  offset += 1;
  if (usageTag === 1) {
    const inputTokens = readU32LE(buffer, offset);
    offset += 4;
    const outputTokens = readU32LE(buffer, offset);
    offset += 4;
    usage = { inputTokens, outputTokens };
  } else if (usageTag !== 0) {
    throw new DeserializationError(`Invalid usage option tag: ${usageTag}`);
  }

  return {
    discriminator,
    status,
    output,
    errorMessage,
    usage,
  };
}
