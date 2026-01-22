/**
 * Core type definitions for QuonexAI SDK
 */

export interface LLMRequest {
  model: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  metadata?: Record<string, string>;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export interface LLMResponse {
  status: "ok" | "error";
  output: string;
  errorMessage?: string;
  usage?: Usage;
}

/**
 * Internal serialized form of LLMRequest for Borsh encoding
 */
export interface SerializedLLMRequest {
  discriminator: number;
  requestNonce: bigint;
  model: string;
  prompt: string;
  maxTokens: number | null;
  temperatureMilli: number | null;
  topPMilli: number | null;
  metadata: Array<[string, string]>;
}

/**
 * Internal serialized form of LLMResponse for Borsh encoding
 */
export interface SerializedLLMResponse {
  discriminator: number;
  status: number;
  output: string;
  errorMessage: string | null;
  usage: { inputTokens: number; outputTokens: number } | null;
}

/**
 * Arguments for creating SubmitLLMRequest instruction
 */
export interface CreateSubmitLLMRequestArgs {
  programId: import("@solana/web3.js").PublicKey;
  payer: import("@solana/web3.js").PublicKey;
  user: import("@solana/web3.js").PublicKey;
  requestNonce: bigint;
  request: LLMRequest;
}

/**
 * Arguments for creating SubmitLLMResponse instruction
 */
export interface CreateSubmitLLMResponseArgs {
  programId: import("@solana/web3.js").PublicKey;
  payer: import("@solana/web3.js").PublicKey;
  responder: import("@solana/web3.js").PublicKey;
  requestPda: import("@solana/web3.js").PublicKey;
  responsePdaBump: number;
  response: LLMResponse;
}
