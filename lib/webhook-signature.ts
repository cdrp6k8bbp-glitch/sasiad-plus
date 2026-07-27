type SvixHeaders = {
  "svix-id": string;
  "svix-timestamp": string;
  "svix-signature": string;
};

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

export async function verifySvixWebhook({
  payload,
  headers,
  secret,
  now = Date.now(),
}: {
  payload: string;
  headers: SvixHeaders;
  secret: string;
  now?: number;
}): Promise<boolean> {
  if (
    !headers["svix-id"] ||
    !headers["svix-timestamp"] ||
    !headers["svix-signature"] ||
    !secret.startsWith("whsec_")
  ) {
    return false;
  }

  const timestamp = Number(headers["svix-timestamp"]);
  if (
    !Number.isInteger(timestamp) ||
    Math.abs(now - timestamp * 1000) > 5 * 60 * 1000
  ) {
    return false;
  }

  let secretBytes: Uint8Array;
  try {
    secretBytes = decodeBase64(secret.slice("whsec_".length));
  } catch {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(secretBytes).buffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedPayload = `${headers["svix-id"]}.${headers["svix-timestamp"]}.${payload}`;
  const expected = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedPayload),
    ),
  );
  const signatures = headers["svix-signature"]
    .split(/\s+/)
    .map((signature) => signature.split(",", 2))
    .filter(([version, signature]) => version === "v1" && Boolean(signature));

  return signatures.some(([, signature]) => {
    try {
      return equalBytes(expected, decodeBase64(signature));
    } catch {
      return false;
    }
  });
}
