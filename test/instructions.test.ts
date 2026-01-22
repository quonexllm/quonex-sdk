import { describe, it, expect } from "vitest";
import { createSubmitLLMRequestIx, createSubmitLLMResponseIx } from "../src/index.js";
import { deriveRequestPda } from "../src/pdas.js";
import { DEFAULT_PROGRAM_ID } from "../src/constants.js";
import { PublicKey } from "@solana/web3.js";

describe("Instruction builders", () => {
  const programId = DEFAULT_PROGRAM_ID;
  const payer = new PublicKey("11111111111111111111111111111112");
  const user = new PublicKey("11111111111111111111111111111113");
  const responder = new PublicKey("11111111111111111111111111111114");
  const requestNonce = 42n;

  describe("createSubmitLLMRequestIx", () => {
    it("should create valid instruction with minimal fields", () => {
      const ix = createSubmitLLMRequestIx({
        programId,
        payer,
        user,
        requestNonce,
        request: {
          model: "qnx-llm-1",
          prompt: "Hello",
        },
      });

      expect(ix.programId.equals(programId)).toBe(true);
      expect(ix.keys.length).toBe(4);
      expect(ix.data.length).toBeGreaterThan(0);
    });

    it("should create valid instruction with all fields", () => {
      const ix = createSubmitLLMRequestIx({
        programId,
        payer,
        user,
        requestNonce,
        request: {
          model: "qnx-llm-1.5",
          prompt: "Test prompt",
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          metadata: {
            preset: "creative",
            version: "1.0",
          },
        },
      });

      expect(ix.programId.equals(programId)).toBe(true);
      expect(ix.keys.length).toBe(4);
      expect(ix.data.length).toBeGreaterThan(0);
    });

    it("should set correct account order", () => {
      const ix = createSubmitLLMRequestIx({
        programId,
        payer,
        user,
        requestNonce,
        request: { model: "qnx-llm-1", prompt: "test" },
      });

      expect(ix.keys[0].pubkey.equals(payer)).toBe(true);
      expect(ix.keys[0].isSigner).toBe(true);
      expect(ix.keys[0].isWritable).toBe(true);

      expect(ix.keys[1].pubkey.equals(user)).toBe(true);
      expect(ix.keys[1].isSigner).toBe(true);
      expect(ix.keys[1].isWritable).toBe(true);

      expect(ix.keys[2].isWritable).toBe(true);

      expect(ix.keys[3].pubkey.toBase58()).toBe("11111111111111111111111111111111");
    });

    it("should validate model is non-empty", () => {
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: { model: "", prompt: "test" },
        })
      ).toThrow();
    });

    it("should validate prompt is non-empty", () => {
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: { model: "test", prompt: "" },
        })
      ).toThrow();
    });

    it("should validate model max length", () => {
      const tooLongModel = "m".repeat(65);
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: { model: tooLongModel, prompt: "test" },
        })
      ).toThrow();
    });

    it("should validate prompt max length", () => {
      const tooLongPrompt = "p".repeat(8001);
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: { model: "test", prompt: tooLongPrompt },
        })
      ).toThrow();
    });

    it("should validate maxTokens is valid u32", () => {
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: {
            model: "test",
            prompt: "test",
            maxTokens: -1,
          },
        })
      ).toThrow();
    });

    it("should validate temperature range", () => {
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: {
            model: "test",
            prompt: "test",
            temperature: 1.5,
          },
        })
      ).toThrow();
    });

    it("should validate topP range", () => {
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: {
            model: "test",
            prompt: "test",
            topP: -0.1,
          },
        })
      ).toThrow();
    });

    it("should validate metadata keys and values", () => {
      expect(() =>
        createSubmitLLMRequestIx({
          programId,
          payer,
          user,
          requestNonce,
          request: {
            model: "test",
            prompt: "test",
            metadata: { "": "value" },
          },
        })
      ).toThrow();
    });

    it("should derive request PDA for accounts", () => {
      const ix = createSubmitLLMRequestIx({
        programId,
        payer,
        user,
        requestNonce,
        request: { model: "test", prompt: "test" },
      });

      const [expectedPda] = deriveRequestPda(programId, user, requestNonce);
      expect(ix.keys[2].pubkey.equals(expectedPda)).toBe(true);
    });

    it("should be deterministic", () => {
      const args = {
        programId,
        payer,
        user,
        requestNonce,
        request: {
          model: "qnx-llm-1",
          prompt: "test prompt",
          maxTokens: 1000,
          temperature: 0.5,
          topP: 0.9,
          metadata: { key: "value" },
        },
      };

      const ix1 = createSubmitLLMRequestIx(args);
      const ix2 = createSubmitLLMRequestIx(args);

      expect(ix1.data).toEqual(ix2.data);
      expect(ix1.keys.length).toBe(ix2.keys.length);
    });
  });

  describe("createSubmitLLMResponseIx", () => {
    const [requestPda] = deriveRequestPda(programId, user, requestNonce);

    it("should create valid instruction for ok status", () => {
      const ix = createSubmitLLMResponseIx({
        programId,
        payer,
        responder,
        requestPda,
        responsePdaBump: 250,
        response: {
          status: "ok",
          output: "The answer is 42",
          usage: { inputTokens: 100, outputTokens: 20 },
        },
      });

      expect(ix.programId.equals(programId)).toBe(true);
      expect(ix.keys.length).toBe(5);
      expect(ix.data.length).toBeGreaterThan(0);
    });

    it("should create valid instruction for error status", () => {
      const ix = createSubmitLLMResponseIx({
        programId,
        payer,
        responder,
        requestPda,
        responsePdaBump: 250,
        response: {
          status: "error",
          output: "",
          errorMessage: "Model timeout",
        },
      });

      expect(ix.programId.equals(programId)).toBe(true);
      expect(ix.keys.length).toBe(5);
    });

    it("should set correct account order", () => {
      const ix = createSubmitLLMResponseIx({
        programId,
        payer,
        responder,
        requestPda,
        responsePdaBump: 250,
        response: { status: "ok", output: "test" },
      });

      expect(ix.keys[0].pubkey.equals(payer)).toBe(true);
      expect(ix.keys[0].isSigner).toBe(true);
      expect(ix.keys[0].isWritable).toBe(true);

      expect(ix.keys[1].pubkey.equals(responder)).toBe(true);
      expect(ix.keys[1].isSigner).toBe(true);
      expect(ix.keys[1].isWritable).toBe(true);

      expect(ix.keys[2].pubkey.equals(requestPda)).toBe(true);
      expect(ix.keys[2].isSigner).toBe(false);
      expect(ix.keys[2].isWritable).toBe(false);

      expect(ix.keys[3].isWritable).toBe(true);

      expect(ix.keys[4].pubkey.toBase58()).toBe("11111111111111111111111111111111");
    });

    it("should validate output is non-empty", () => {
      expect(() =>
        createSubmitLLMResponseIx({
          programId,
          payer,
          responder,
          requestPda,
          responsePdaBump: 250,
          response: { status: "ok", output: "" },
        })
      ).toThrow();
    });

    it("should validate status is ok or error", () => {
      expect(() =>
        createSubmitLLMResponseIx({
          programId,
          payer,
          responder,
          requestPda,
          responsePdaBump: 250,
          response: {
            status: "pending" as unknown as "ok" | "error",
            output: "test",
          },
        })
      ).toThrow();
    });

    it("should validate usage tokens are u32", () => {
      expect(() =>
        createSubmitLLMResponseIx({
          programId,
          payer,
          responder,
          requestPda,
          responsePdaBump: 250,
          response: {
            status: "ok",
            output: "test",
            usage: { inputTokens: -1, outputTokens: 100 },
          },
        })
      ).toThrow();
    });

    it("should be deterministic", () => {
      const args = {
        programId,
        payer,
        responder,
        requestPda,
        responsePdaBump: 250,
        response: {
          status: "ok" as const,
          output: "test output",
          usage: { inputTokens: 500, outputTokens: 100 },
        },
      };

      const ix1 = createSubmitLLMResponseIx(args);
      const ix2 = createSubmitLLMResponseIx(args);

      expect(ix1.data).toEqual(ix2.data);
      expect(ix1.keys.length).toBe(ix2.keys.length);
    });
  });
});
