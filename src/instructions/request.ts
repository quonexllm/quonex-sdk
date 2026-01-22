/**
 * SubmitLLMRequest instruction builder
 */

import { TransactionInstruction, SystemProgram } from "@solana/web3.js";
import type { CreateSubmitLLMRequestArgs } from "../types.js";
import { DISCRIMINATORS, CONSTRAINTS } from "../constants.js";
import { assertNonEmptyString, assertMaxLen, assertU32, toU16Milli } from "../utils/assert.js";
import { encodeSubmitLLMRequest } from "../borsh/codec.js";
import { deriveRequestPda } from "../pdas.js";

/**
 * Create a SubmitLLMRequest instruction
 */
export function createSubmitLLMRequestIx(args: CreateSubmitLLMRequestArgs): TransactionInstruction {
  const { programId, payer, user, requestNonce, request } = args;

  // Validate model
  assertNonEmptyString("model", request.model);
  assertMaxLen("model", request.model, CONSTRAINTS.MODEL_ID_MAX_LEN);

  // Validate prompt
  assertNonEmptyString("prompt", request.prompt);
  assertMaxLen("prompt", request.prompt, CONSTRAINTS.PROMPT_MAX_LEN);

  // Validate optional numeric fields
  if (request.maxTokens !== undefined) {
    assertU32("maxTokens", request.maxTokens);
  }

  let temperatureMilli: number | null = null;
  if (request.temperature !== undefined) {
    temperatureMilli = toU16Milli("temperature", request.temperature);
  }

  let topPMilli: number | null = null;
  if (request.topP !== undefined) {
    topPMilli = toU16Milli("topP", request.topP);
  }

  // Validate metadata
  const metadata: Array<[string, string]> = [];
  if (request.metadata) {
    for (const [key, value] of Object.entries(request.metadata)) {
      assertNonEmptyString(`metadata key "${key}"`, key);
      assertMaxLen(`metadata key`, key, CONSTRAINTS.METADATA_KEY_MAX_LEN);
      assertNonEmptyString(`metadata value for "${key}"`, value);
      assertMaxLen(`metadata value for "${key}"`, value, CONSTRAINTS.METADATA_VALUE_MAX_LEN);
      metadata.push([key, value]);
    }
  }

  // Derive request PDA
  const [requestPda] = deriveRequestPda(programId, user, requestNonce);

  // Encode instruction data
  const data = encodeSubmitLLMRequest({
    discriminator: DISCRIMINATORS.SubmitLLMRequest,
    requestNonce,
    model: request.model,
    prompt: request.prompt,
    maxTokens: request.maxTokens ?? null,
    temperatureMilli,
    topPMilli,
    metadata,
  });

  // Build accounts
  const accounts = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: user, isSigner: true, isWritable: true },
    { pubkey: requestPda, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    programId,
    keys: accounts,
    data,
  });
}
