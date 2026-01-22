# @quonexai/sdk
![quonexai](assets/background.png)
A production-grade Solana TypeScript SDK for QuonexAI LLM instructions. This package provides type-safe, validated builders for SubmitLLMRequest and SubmitLLMResponse instructions, along with Borsh serialization, PDA derivation, and comprehensive testing—all without requiring a running Solana cluster.

## Features

✅ **Type-Safe Instruction Builders** – Create SubmitLLMRequest and SubmitLLMResponse with full type safety  
✅ **Borsh Serialization** – Custom codec for reliable encoding/decoding  
✅ **Input Validation** – Enforce constraints on model IDs, prompts, token counts, and metadata  
✅ **PDA Derivation** – Deterministic Program-Derived Account seeds  
✅ **Zero Cluster Dependencies** – All tests run locally without solana-test-validator  
✅ **ESM + CJS** – Modern and legacy module support  
✅ **Full TypeScript** – Strict types, no `any`  

## Installation

```bash
npm install @quonexai/sdk
```

## Quick Start

### Create an LLM Request Instruction

```typescript
import {
  createSubmitLLMRequestIx,
  deriveRequestPda,
  DEFAULT_PROGRAM_ID,
} from "@quonexai/sdk";
import { PublicKey } from "@solana/web3.js";

const programId = DEFAULT_PROGRAM_ID; // or your custom program ID
const payer = new PublicKey("...");
const user = new PublicKey("...");
const requestNonce = 0n;

const instruction = createSubmitLLMRequestIx({
  programId,
  payer,
  user,
  requestNonce,
  request: {
    model: "qnx-llm-1",
    prompt: "What is the meaning of life?",
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    metadata: {
      userId: "user-123",
      sessionId: "session-456",
    },
  },
});

console.log("Instruction created:", instruction);
```

### Create an LLM Response Instruction

```typescript
import {
  createSubmitLLMResponseIx,
  deriveRequestPda,
  deriveResponsePda,
  DEFAULT_PROGRAM_ID,
} from "@quonexai/sdk";
import { PublicKey } from "@solana/web3.js";

const programId = DEFAULT_PROGRAM_ID;
const payer = new PublicKey("...");
const responder = new PublicKey("...");
const user = new PublicKey("...");
const requestNonce = 0n;

// Derive the request PDA
const [requestPda] = deriveRequestPda(programId, user, requestNonce);

const instruction = createSubmitLLMResponseIx({
  programId,
  payer,
  responder,
  requestPda,
  responsePdaBump: 250, // bump seed from on-chain
  response: {
    status: "ok",
    output: "The answer is 42.",
    usage: {
      inputTokens: 150,
      outputTokens: 12,
    },
  },
});

console.log("Response instruction created:", instruction);
```

### Working with PDAs

```typescript
import {
  deriveRequestPda,
  deriveResponsePda,
  DEFAULT_PROGRAM_ID,
} from "@quonexai/sdk";
import { PublicKey } from "@solana/web3.js";

const programId = DEFAULT_PROGRAM_ID;
const userPubkey = new PublicKey("...");
const requestNonce = 42n;

// Derive request PDA
const [requestPda, requestBump] = deriveRequestPda(
  programId,
  userPubkey,
  requestNonce
);
console.log("Request PDA:", requestPda.toBase58());
console.log("Bump:", requestBump);

// Derive response PDA from request PDA
const [responsePda, responseBump] = deriveResponsePda(programId, requestPda);
console.log("Response PDA:", responsePda.toBase58());
```

### Manual Encoding/Decoding

If you need to work with raw instruction data:

```typescript
import {
  encodeSubmitLLMRequest,
  decodeSubmitLLMRequest,
  encodeSubmitLLMResponse,
  decodeSubmitLLMResponse,
} from "@quonexai/sdk";

// Encode
const requestData = encodeSubmitLLMRequest({
  discriminator: 1,
  requestNonce: 0n,
  model: "qnx-llm-1",
  prompt: "Hello",
  maxTokens: null,
  temperatureMilli: 700,
  topPMilli: 950,
  metadata: [["key", "value"]],
});

// Decode
const decoded = decodeSubmitLLMRequest(requestData);
console.log(decoded);
```

### Validation Utilities

```typescript
import {
  assertNonEmptyString,
  assertMaxLen,
  assertU32,
  toU16Milli,
  fromU16Milli,
  ValidationError,
} from "@quonexai/sdk";

try {
  assertNonEmptyString("model", "qnx-llm-1");
  assertMaxLen("prompt", "hello world", 8000);
  assertU32("maxTokens", 2048);

  const tempMilli = toU16Milli("temperature", 0.7); // => 700
  const tempFloat = fromU16Milli(700); // => 0.7
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed:", error.message);
  }
}
```

## API Reference

### Constants

```typescript
export const DEFAULT_PROGRAM_ID: PublicKey;
export const DISCRIMINATORS: {
  SubmitLLMRequest: 1;
  SubmitLLMResponse: 2;
};
export const PDA_SEEDS: {
  Request: "qnx_req";
  Response: "qnx_res";
};
export const CONSTRAINTS: {
  MODEL_ID_MAX_LEN: 64;
  PROMPT_MAX_LEN: 8000;
  METADATA_KEY_MAX_LEN: 256;
  METADATA_VALUE_MAX_LEN: 4096;
};
export const RESPONSE_STATUS: {
  Ok: 1;
  Error: 2;
};
```

### Instruction Builders

#### `createSubmitLLMRequestIx(args: CreateSubmitLLMRequestArgs): TransactionInstruction`

Creates a SubmitLLMRequest instruction. Validates all inputs and derives the request PDA automatically.

**Arguments:**

```typescript
interface CreateSubmitLLMRequestArgs {
  programId: PublicKey;
  payer: PublicKey; // signer, writable
  user: PublicKey; // signer, writable
  requestNonce: bigint; // u64 LE
  request: {
    model: string; // max 64 chars
    prompt: string; // max 8000 chars
    maxTokens?: number; // u32
    temperature?: number; // 0.0 to 1.0 (scaled to u16 millis)
    topP?: number; // 0.0 to 1.0
    metadata?: Record<string, string>;
  };
}
```

#### `createSubmitLLMResponseIx(args: CreateSubmitLLMResponseArgs): TransactionInstruction`

Creates a SubmitLLMResponse instruction.

**Arguments:**

```typescript
interface CreateSubmitLLMResponseArgs {
  programId: PublicKey;
  payer: PublicKey; // signer, writable
  responder: PublicKey; // signer, writable
  requestPda: PublicKey; // readonly
  responsePdaBump: number; // bump seed
  response: {
    status: "ok" | "error";
    output: string;
    errorMessage?: string;
    usage?: {
      inputTokens: number; // u32
      outputTokens: number; // u32
    };
  };
}
```

### PDA Helpers

#### `deriveRequestPda(programId: PublicKey, userPubkey: PublicKey, requestNonce: bigint): [PublicKey, number]`

Derives the request PDA for a given user and request nonce.

**Seeds:** `["qnx_req", userPubkey, requestNonce(u64 LE)]`

#### `deriveResponsePda(programId: PublicKey, requestPda: PublicKey): [PublicKey, number]`

Derives the response PDA for a given request PDA.

**Seeds:** `["qnx_res", requestPda]`

### Codec Functions

#### `encodeSubmitLLMRequest(data: SerializedLLMRequest): Buffer`

Encode a request to Borsh binary format.

#### `decodeSubmitLLMRequest(buffer: Buffer): SerializedLLMRequest`

Decode a request from Borsh binary format.

#### `encodeSubmitLLMResponse(data: SerializedLLMResponse): Buffer`

Encode a response to Borsh binary format.

#### `decodeSubmitLLMResponse(buffer: Buffer): SerializedLLMResponse`

Decode a response from Borsh binary format.

### Validation Functions

#### `assertNonEmptyString(name: string, value: string): void`

Throws `ValidationError` if the string is empty.

#### `assertMaxLen(name: string, value: string, max: number): void`

Throws `ValidationError` if the string exceeds max length.

#### `assertU32(name: string, value: number): void`

Throws `ValidationError` if the value is not a valid u32 (0 to 2^32 - 1).

#### `toU16Milli(name: string, value: number): number`

Converts a float (0.0 to 1.0) to u16 millis (0 to 1000).  
E.g., `0.7 => 700`, `0.5 => 500`.

#### `fromU16Milli(milli: number): number`

Converts u16 millis to a float.  
E.g., `700 => 0.7`.

### Error Classes

```typescript
export class QuonexSDKError extends Error;
export class ValidationError extends QuonexSDKError;
export class SerializationError extends QuonexSDKError;
export class DeserializationError extends QuonexSDKError;
```

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

Outputs to `dist/` with `.mjs`, `.cjs`, and `.d.ts` files.

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

Enforces strict TypeScript and ESLint rules.

### Test

```bash
npm run test
```

All tests run locally without any cluster or CLI tools.

### Watch Mode

```bash
npm run dev
```

Rebuilds on file changes.

### Format

```bash
npm run format
```

Runs Prettier on all source and test files.

## Testing

The SDK includes comprehensive unit tests for:

- **Codec Roundtrips** – Encode/decode invariants for both instruction types
- **Discriminators** – Correct discriminator bytes
- **PDA Derivation** – Deterministic PDA generation and validation
- **Instruction Building** – Account ordering, validation, and determinism
- **Edge Cases** – Unicode, large payloads, max values, boundary conditions

Run tests with:

```bash
npm run test          # Run all tests
npm run test:ui       # Open interactive UI
```

All tests are 100% deterministic and require no external services.

## Constraints & Validation

The SDK enforces the following constraints:

| Field               | Constraint                      |
| ------------------- | ------------------------------- |
| `model`             | Max 64 characters               |
| `prompt`            | Max 8000 characters             |
| `maxTokens`         | Valid u32 (0 to 2^32 - 1)      |
| `temperature`       | 0.0 to 1.0 (scaled to u16 millis) |
| `topP`              | 0.0 to 1.0                     |
| Metadata key        | Max 256 characters              |
| Metadata value      | Max 4096 characters             |

Attempting to create an instruction with invalid data throws a `ValidationError` with a clear message.

## Configuration

### Custom Program ID

By default, the SDK uses `DEFAULT_PROGRAM_ID`. To use a custom program:

```typescript
import { createSubmitLLMRequestIx } from "@quonexai/sdk";
import { PublicKey } from "@solana/web3.js";

const myProgramId = new PublicKey("YOUR_PROGRAM_ID_HERE");

const instruction = createSubmitLLMRequestIx({
  programId: myProgramId,
  // ... rest of args
});
```

## Borsh Encoding Details

The SDK uses a custom Borsh codec optimized for TypeScript ESM:

- **Discriminators:** u8 (1 for request, 2 for response)
- **Integers:** Little-endian (LE) byte order
  - u8: 1 byte
  - u16: 2 bytes
  - u32: 4 bytes
  - u64: 8 bytes
- **Strings:** u32 length prefix (LE) + UTF-8 bytes
- **Options:** u8 tag (0 = None, 1 = Some) + optional payload
- **Vectors:** u32 length (LE) + repeated elements

This format is compatible with Borsh and Anchor on-chain deserialization.

## License

MIT

## Support

For issues, questions, or contributions, please visit the [QuonexAI SDK repository](https://github.com/quonexllm/quonex-sdk).
