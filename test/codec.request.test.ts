import { describe, it, expect } from "vitest";
import {
  encodeSubmitLLMRequest,
  decodeSubmitLLMRequest,
} from "../src/borsh/codec.js";
import { DISCRIMINATORS } from "../src/constants.js";
import type { SerializedLLMRequest } from "../src/types.js";

describe("SubmitLLMRequest Codec", () => {
  it("should encode and decode with minimal fields", () => {
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 42n,
      model: "qnx-llm-1",
      prompt: "Hello, world!",
      maxTokens: null,
      temperatureMilli: null,
      topPMilli: null,
      metadata: [],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded).toEqual(original);
  });

  it("should encode and decode with all optional fields", () => {
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 999n,
      model: "qnx-llm-1.5",
      prompt: "This is a test prompt with special chars: üñíçødé",
      maxTokens: 2048,
      temperatureMilli: 700,
      topPMilli: 950,
      metadata: [
        ["key1", "value1"],
        ["temperature_preset", "creative"],
      ],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded).toEqual(original);
  });

  it("should handle large prompts", () => {
    const largePrompt = "x".repeat(4000);
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 0n,
      model: "qnx-llm-1",
      prompt: largePrompt,
      maxTokens: null,
      temperatureMilli: null,
      topPMilli: null,
      metadata: [],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded).toEqual(original);
  });

  it("should handle unicode strings", () => {
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 123n,
      model: "qnx-llm-1",
      prompt: "你好世界 🌍 مرحبا بالعالم",
      maxTokens: null,
      temperatureMilli: null,
      topPMilli: null,
      metadata: [
        ["emoji", "🚀"],
        ["chinese", "中文"],
      ],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded).toEqual(original);
  });

  it("should encode correct discriminator", () => {
    const data: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 0n,
      model: "test",
      prompt: "test",
      maxTokens: null,
      temperatureMilli: null,
      topPMilli: null,
      metadata: [],
    };

    const encoded = encodeSubmitLLMRequest(data);
    expect(encoded[0]).toBe(1);
  });

  it("should handle empty metadata", () => {
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 0n,
      model: "test",
      prompt: "test",
      maxTokens: 100,
      temperatureMilli: 500,
      topPMilli: null,
      metadata: [],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded.metadata).toEqual([]);
  });

  it("should handle partial optional fields", () => {
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 555n,
      model: "qnx-llm-2",
      prompt: "partial test",
      maxTokens: 512,
      temperatureMilli: null,
      topPMilli: 800,
      metadata: [["key", "value"]],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded).toEqual(original);
  });

  it("should handle max u32 value for maxTokens", () => {
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 0n,
      model: "test",
      prompt: "test",
      maxTokens: 0xffffffff,
      temperatureMilli: null,
      topPMilli: null,
      metadata: [],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded.maxTokens).toBe(0xffffffff);
  });

  it("should handle max u16 values for milli fields", () => {
    const original: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 0n,
      model: "test",
      prompt: "test",
      maxTokens: null,
      temperatureMilli: 0xffff,
      topPMilli: 0xffff,
      metadata: [],
    };

    const encoded = encodeSubmitLLMRequest(original);
    const decoded = decodeSubmitLLMRequest(encoded);

    expect(decoded.temperatureMilli).toBe(0xffff);
    expect(decoded.topPMilli).toBe(0xffff);
  });

  it("should be deterministic", () => {
    const data: SerializedLLMRequest = {
      discriminator: DISCRIMINATORS.SubmitLLMRequest,
      requestNonce: 12345n,
      model: "qnx-llm-1",
      prompt: "determinism test",
      maxTokens: 1000,
      temperatureMilli: 750,
      topPMilli: 900,
      metadata: [
        ["a", "1"],
        ["b", "2"],
      ],
    };

    const encoded1 = encodeSubmitLLMRequest(data);
    const encoded2 = encodeSubmitLLMRequest(data);

    expect(encoded1).toEqual(encoded2);
  });
});
