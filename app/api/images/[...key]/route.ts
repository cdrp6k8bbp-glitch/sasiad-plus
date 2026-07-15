import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = key.join("/");

  if (!objectKey) {
    return new Response("Brak klucza obrazu", { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const object = await env.sasiad_plus_images.get(objectKey);

  if (!object) {
    return new Response("Nie znaleziono obrazu", { status: 404 });
  }

  const imageBuffer = await object.arrayBuffer();

  return new Response(imageBuffer, {
    status: 200,
    headers: {
      "content-type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "content-length": String(imageBuffer.byteLength),
      etag: object.httpEtag,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}