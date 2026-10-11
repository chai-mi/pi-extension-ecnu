import type {
  AssistantImages,
  ImageApi,
  ImageModel,
  ImagesContext,
  ImagesOptions,
} from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Buffer } from "node:buffer";
import { models } from "./models.ts";
import type { ImagesResponse } from "./types.ts";

export default function (pi: ExtensionAPI): void {
  pi.registerProvider("ecnu", {
    name: "ECNU Chat",
    baseUrl: "https://chat.ecnu.edu.cn/open/api/v1",
    apiKey: "$ECNU_API_KEY",
    api: "openai-completions",
    models,
    images: { "ecnu-images": { generateImages } },
  });
}

async function generateImages(
  model: ImageModel<ImageApi>,
  context: ImagesContext,
  options?: ImagesOptions,
): Promise<AssistantImages> {
  const resp = await editsOrGenerations(model, context, options);
  if (!resp.ok) {
    return {
      stopReason: "error",
      api: model.api,
      model: model.id,
      provider: model.provider,
      timestamp: Date.now(),
      errorMessage: `${resp.status} ${resp.statusText}`,
      output: [],
    };
  }

  const imagesResp = (await resp.json()) as ImagesResponse;
  if (imagesResp.err_message !== undefined) {
    return {
      stopReason: "error",
      api: model.api,
      model: model.id,
      provider: model.provider,
      timestamp: imagesResp.created,
      errorMessage: imagesResp.err_message,
      output: [],
    };
  }
  return {
    stopReason: "stop",
    api: model.api,
    model: model.id,
    provider: model.provider,
    timestamp: imagesResp.created,
    output: imagesResp.data.map((item) => ({
      type: "image",
      data: item.b64_json,
      mimeType: "image/png",
    })),
  };
}

function editsOrGenerations(
  model: ImageModel<ImageApi>,
  context: ImagesContext,
  options?: ImagesOptions,
): Promise<Response> {
  const fetcher = options?.fetch ?? globalThis.fetch;
  const prompt = context.input
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
  const images = context.input.filter((item) => item.type === "image");

  if (images.length > 0) {
    const form = new FormData();
    form.set("model", model.id);
    form.set("prompt", prompt);
    form.set("response_format", "b64_json");
    for (const image of images) {
      form.append(
        "image",
        new Blob([Buffer.from(image.data, "base64")], {
          type: image.mimeType,
        }),
      );
    }

    return fetcher(`${model.baseUrl}/images/edits`, {
      method: "POST",
      body: form,
      headers: {
        Authorization: `Bearer ${options?.apiKey}`,
      },
      signal: options?.signal,
    });
  } else {
    return fetcher(`${model.baseUrl}/images/generations`, {
      method: "POST",
      body: JSON.stringify({
        model: model.id,
        prompt: prompt,
        response_format: "b64_json",
      }),
      headers: {
        Authorization: `Bearer ${options?.apiKey}`,
        "Content-Type": "application/json",
      },
      signal: options?.signal,
    });
  }
}
