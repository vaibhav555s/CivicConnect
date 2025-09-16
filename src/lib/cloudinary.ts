import CryptoJS from "crypto-js";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export type GenerateSignature = (params: Record<string, any>) => string;

export function createSignatureGenerator(apiSecret: string): GenerateSignature {
  return (params: Record<string, any>) => {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
    const toSign = `${paramString}${apiSecret}`;
    return CryptoJS.SHA1(toSign).toString();
  };
}

export async function uploadImageToCloudinary(
  file: File,
  options: {
    cloudName: string;
    apiKey: string;
    folder: string;
    generateSignature: GenerateSignature;
  }
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, folder, generateSignature } = options;

  const timestamp = Math.floor(Date.now() / 1000);

  const signatureParams = {
    folder,
    timestamp,
  };

  const signature = generateSignature(signatureParams);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const secureUrl: string | undefined = data?.secure_url;
  const publicId: string | undefined = data?.public_id;

  if (!secureUrl || !publicId) {
    throw new Error("Cloudinary upload response missing secure_url or public_id");
  }

  return { url: secureUrl, publicId };
}
