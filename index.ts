import type {
  ExtensionAPI,
  ProviderModelConfig,
} from "@earendil-works/pi-coding-agent";

const ecnuCompat: ProviderModelConfig["compat"] = {
  supportsStore: false,
  supportsDeveloperRole: false,
  supportsReasoningEffort: true,
  thinkingFormat: "deepseek",
  maxTokensField: "max_tokens",
  supportsStrictMode: false,
  requiresReasoningContentOnAssistantMessages: true,
};

export default function (pi: ExtensionAPI) {
  pi.registerProvider("ecnu", {
    name: "ECNU Chat",
    baseUrl: "https://chat.ecnu.edu.cn/open/api/v1",
    apiKey: "$ECNU_API_KEY",
    api: "openai-completions",
    models: [
      {
        id: "ecnu-max",
        name: "Deepseek V4 Flash",
        reasoning: true,
        thinkingLevelMap: {
          minimal: null,
          low: "low",
          medium: null,
          high: "high",
          xhigh: null,
          max: "max",
        },
        input: ["text"],
        cost: { input: 300, output: 1200, cacheRead: 60, cacheWrite: 0 },
        contextWindow: 512 * 1024,
        maxTokens: 384 * 1024,
        compat: ecnuCompat,
      },
      {
        id: "ecnu-plus",
        name: "Qwen3.8 27B",
        reasoning: true,
        thinkingLevelMap: {
          minimal: null,
          low: "low",
          medium: "medium",
          high: null,
          xhigh: "xhigh",
          max: null,
        },
        input: ["text", "image"],
        cost: { input: 100, output: 400, cacheRead: 20, cacheWrite: 0 },
        contextWindow: 256 * 1024,
        maxTokens: 128 * 1024,
        compat: ecnuCompat,
      },
    ],
  });
}
