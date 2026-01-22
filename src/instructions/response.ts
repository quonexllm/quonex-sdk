/**
 * SubmitLLMResponse instruction builder
 */

import { TransactionInstruction, PublicKey, SystemProgram } from "@solana/web3.js";
import type { CreateSubmitLLMResponseArgs } from "../types.js";
import { DISCRIMINATORS, RESPONSE_STATUS } from "../constants.js";
import { assertNonEmptyString, assertU32 } from "../utils/assert.js";
import { encodeSubmitLLMResponse } from "../borsh/codec.js";

/**
 * Create a SubmitLLMResponse instruction
 */
export function createSubmitLLMResponseIx(
  args: CreateSubmitLLMResponseArgs
): TransactionInstruction {
  const { programId, payer, responder, requestPda, response } = args;

  // Validate response fields
  if (response.status !== "ok" && response.status !== "error") {
    throw new Error(`response.status must be "ok" or "error", got "${response.status}"`);
  }

  assertNonEmptyString("output", response.output);

  if (response.errorMessage !== undefined) {
    assertNonEmptyString("errorMessage", response.errorMessage);
  }

  if (response.usage !== undefined) {
    assertU32("usage.inputTokens", response.usage.inputTokens);
    assertU32("usage.outputTokens", response.usage.outputTokens);
  }

  // Derive response PDA
  const responsePda = new PublicKey(
    PublicKey.createProgramAddressSync(
      [Buffer.from("qnx_res"), requestPda.toBuffer()],
      programId
    )
  );

  // Encode instruction data
  const status = response.status === "ok" ? RESPONSE_STATUS.Ok : RESPONSE_STATUS.Error;

  const data = encodeSubmitLLMResponse({
    discriminator: DISCRIMINATORS.SubmitLLMResponse,
    status,
    output: response.output,
    errorMessage: response.errorMessage ?? null,
    usage: response.usage ?? null,
  });

  // Build accounts
  const accounts = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: responder, isSigner: true, isWritable: true },
    { pubkey: requestPda, isSigner: false, isWritable: false },
    { pubkey: responsePda, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    programId,
    keys: accounts,
    data,
  });
}
