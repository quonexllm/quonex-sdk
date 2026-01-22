import { describe, it, expect } from "vitest";
import {
  encodeSubmitLLMResponse,
  decodeSubmitLLMResponse,
} from "../src/borsh/codec.js";
import { DISCRIMINATORS, RESPONSE_STATUS } from "../src/constants.js";
import type { SerializedLLMResponse } from "../src/types.js";

describe("SubmitLLMResponse Codec", () => {
  it("should encode and decode with minimal fields", () => {
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: "Hello, response!",
      errorMessage: null,
      usage: null,
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded).toEqual(original);
  });

  it("should encode and decode with all fields", () => {
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: "The answer is 42",
      errorMessage: null,
      usage: {
        inputTokens: 150,
        outputTokens: 25,
      },
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded).toEqual(original);
  });

  it("should encode and decode error status", () => {
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Error,
      output: "",
      errorMessage: "Model not found",
      usage: null,
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded).toEqual(original);
  });

  it("should encode and decode with usage only", () => {
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: "Response text",
      errorMessage: null,
      usage: {
        inputTokens: 500,
        outputTokens: 100,
      },
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded.usage).toEqual({
      inputTokens: 500,
      outputTokens: 100,
    });
  });

  it("should encode and decode with error message only", () => {
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Error,
      output: "",
      errorMessage: "Server error: timeout",
      usage: null,
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded).toEqual(original);
  });

  it("should encode correct discriminator", () => {
    const data: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: "test",
      errorMessage: null,
      usage: null,
    };

    const encoded = encodeSubmitLLMResponse(data);
    expect(encoded[0]).toBe(2);
  });

  it("should handle unicode in output and error message", () => {
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Error,
      output: "你好 🌍",
      errorMessage: "错误: مرحبا",
      usage: null,
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded).toEqual(original);
  });

  it("should handle large outputs", () => {
    const largeOutput = "x".repeat(10000);
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: largeOutput,
      errorMessage: null,
      usage: {
        inputTokens: 1000,
        outputTokens: 5000,
      },
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded.output.length).toBe(10000);
    expect(decoded.output).toBe(largeOutput);
  });

  it("should handle max u32 values for usage tokens", () => {
    const original: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: "test",
      errorMessage: null,
      usage: {
        inputTokens: 0xffffffff,
        outputTokens: 0xffffffff,
      },
    };

    const encoded = encodeSubmitLLMResponse(original);
    const decoded = decodeSubmitLLMResponse(encoded);

    expect(decoded.usage).toEqual({
      inputTokens: 0xffffffff,
      outputTokens: 0xffffffff,
    });
  });

  it("should be deterministic", () => {
    const data: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: "determinism test",
      errorMessage: null,
      usage: {
        inputTokens: 123,
        outputTokens: 456,
      },
    };

    const encoded1 = encodeSubmitLLMResponse(data);
    const encoded2 = encodeSubmitLLMResponse(data);

    expect(encoded1).toEqual(encoded2);
  });

  it("should differentiate between Ok and Error status", () => {
    const okData: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Ok,
      output: "success",
      errorMessage: null,
      usage: null,
    };

    const errorData: SerializedLLMResponse = {
      discriminator: DISCRIMINATORS.SubmitLLMResponse,
      status: RESPONSE_STATUS.Error,
      output: "failed",
      errorMessage: "error",
      usage: null,
    };

    const okEncoded = encodeSubmitLLMResponse(okData);
    const errorEncoded = encodeSubmitLLMResponse(errorData);

    expect(okEncoded[1]).toBe(RESPONSE_STATUS.Ok);
    expect(errorEncoded[1]).toBe(RESPONSE_STATUS.Error);
    expect(okEncoded[1]).not.toBe(errorEncoded[1]);
  });
});
