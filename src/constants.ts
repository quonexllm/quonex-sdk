import { PublicKey } from "@solana/web3.js";

/**
 * Default QuonexAI Program ID on Solana
 * This is a valid base58-encoded placeholder.
 */
export const DEFAULT_PROGRAM_ID = new PublicKey("QneMuJEwM9N7vZGXKqcbLW5NxCi3yd2rSTkJ5Hxnyyy");

/**
 * Instruction discriminators
 */
export const DISCRIMINATORS = {
  SubmitLLMRequest: 1,
  SubmitLLMResponse: 2,
} as const;

/**
 * PDA seed prefixes
 */
export const PDA_SEEDS = {
  Request: "qnx_req",
  Response: "qnx_res",
} as const;

/**
 * Validation constraints
 */
export const CONSTRAINTS = {
  MODEL_ID_MAX_LEN: 64,
  PROMPT_MAX_LEN: 8000,
  METADATA_KEY_MAX_LEN: 256,
  METADATA_VALUE_MAX_LEN: 4096,
} as const;

/**
 * Status codes for LLMResponse
 */
export const RESPONSE_STATUS = {
  Ok: 1,
  Error: 2,
} as const;
