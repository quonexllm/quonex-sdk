import { describe, it, expect } from "vitest";
import { deriveRequestPda, deriveResponsePda } from "../src/pdas.js";
import { DEFAULT_PROGRAM_ID } from "../src/constants.js";
import { PublicKey } from "@solana/web3.js";

describe("PDA derivation", () => {
  it("should derive consistent request PDA", () => {
    const userPubkey = new PublicKey("11111111111111111111111111111112");
    const requestNonce = 0n;

    const [pda1, bump1] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, requestNonce);
    const [pda2, bump2] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, requestNonce);

    expect(pda1.equals(pda2)).toBe(true);
    expect(bump1).toBe(bump2);
  });

  it("should derive different PDAs for different nonces", () => {
    const userPubkey = new PublicKey("11111111111111111111111111111112");
    const nonce1 = 1n;
    const nonce2 = 2n;

    const [pda1] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, nonce1);
    const [pda2] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, nonce2);

    expect(pda1.equals(pda2)).toBe(false);
  });

  it("should derive different PDAs for different users", () => {
    const user1 = new PublicKey("11111111111111111111111111111112");
    const user2 = new PublicKey("11111111111111111111111111111113");
    const nonce = 0n;

    const [pda1] = deriveRequestPda(DEFAULT_PROGRAM_ID, user1, nonce);
    const [pda2] = deriveRequestPda(DEFAULT_PROGRAM_ID, user2, nonce);

    expect(pda1.equals(pda2)).toBe(false);
  });

  it("should handle large u64 nonces", () => {
    const userPubkey = new PublicKey("11111111111111111111111111111112");
    const largeNonce = 0xffffffffffffffffn;

    const [pda, bump] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, largeNonce);
    expect(pda).toBeInstanceOf(PublicKey);
    expect(bump).toBeGreaterThanOrEqual(0);
    expect(bump).toBeLessThan(256);
  });

  it("should derive response PDA from request PDA", () => {
    const requestPda = new PublicKey("11111111111111111111111111111112");

    const [pda1, bump1] = deriveResponsePda(DEFAULT_PROGRAM_ID, requestPda);
    const [pda2, bump2] = deriveResponsePda(DEFAULT_PROGRAM_ID, requestPda);

    expect(pda1.equals(pda2)).toBe(true);
    expect(bump1).toBe(bump2);
  });

  it("should derive different response PDAs for different request PDAs", () => {
    const requestPda1 = new PublicKey("11111111111111111111111111111112");
    const requestPda2 = new PublicKey("11111111111111111111111111111113");

    const [pda1] = deriveResponsePda(DEFAULT_PROGRAM_ID, requestPda1);
    const [pda2] = deriveResponsePda(DEFAULT_PROGRAM_ID, requestPda2);

    expect(pda1.equals(pda2)).toBe(false);
  });

  it("should return valid bump factors", () => {
    const userPubkey = new PublicKey("11111111111111111111111111111112");
    const nonce = 42n;

    const [, bump] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, nonce);
    expect(bump).toBeGreaterThanOrEqual(0);
    expect(bump).toBeLessThanOrEqual(255);
  });

  it("should derive deterministic PDAs", () => {
    const userPubkey = new PublicKey("11111111111111111111111111111112");
    const nonce = 123n;

    const [pda1] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, nonce);
    const [pda2] = deriveRequestPda(DEFAULT_PROGRAM_ID, userPubkey, nonce);

    expect(pda1.toBase58()).toBe(pda2.toBase58());
  });
});
