import { PublicKey } from "@solana/web3.js";
import { PDA_SEEDS } from "./constants.js";

/**
 * Derive the request PDA for a given user and request nonce
 * Seeds: ["qnx_req", userPubkey, requestNonce(u64 LE)]
 */
export function deriveRequestPda(
  programId: PublicKey,
  userPubkey: PublicKey,
  requestNonce: bigint
): [PublicKey, number] {
  const nonceBuf = Buffer.alloc(8);
  nonceBuf.writeBigUInt64LE(requestNonce, 0);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(PDA_SEEDS.Request), userPubkey.toBuffer(), nonceBuf],
    programId
  );
}

/**
 * Derive the response PDA for a given request PDA
 * Seeds: ["qnx_res", requestPda]
 */
export function deriveResponsePda(
  programId: PublicKey,
  requestPda: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PDA_SEEDS.Response), requestPda.toBuffer()],
    programId
  );
}
