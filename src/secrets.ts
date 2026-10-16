export interface SecretStorageLike {
  get(key: string): Thenable<string | undefined> | Promise<string | undefined>;
  store(key: string, value: string): Thenable<void> | Promise<void>;
  delete(key: string): Thenable<void> | Promise<void>;
}

export function formatSecretKey(provider: string): string {
  return `anycommit.apiKey.${provider.trim().toLowerCase()}`;
}

export async function getApiKey(
  secrets: SecretStorageLike,
  provider: string
): Promise<string | undefined> {
  const secretKey = formatSecretKey(provider);
  const value = await secrets.get(secretKey);
  return value?.trim() || undefined;
}

export async function setApiKey(
  secrets: SecretStorageLike,
  provider: string,
  apiKey: string
): Promise<void> {
  const secretKey = formatSecretKey(provider);
  const trimmed = apiKey.trim();
  if (trimmed) {
    await secrets.store(secretKey, trimmed);
  } else {
    await secrets.delete(secretKey);
  }
}

export async function clearApiKey(
  secrets: SecretStorageLike,
  provider: string
): Promise<void> {
  const secretKey = formatSecretKey(provider);
  await secrets.delete(secretKey);
}
