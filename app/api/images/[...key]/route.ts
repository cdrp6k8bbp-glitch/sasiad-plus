import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(
  request: Request,
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

  const requestUrl = new URL(request.url);
  const widthParam = requestUrl.searchParams.get("w");

  if (widthParam && env.IMAGES) {
    const width = Number(widthParam);
    const requestedQuality = Number(requestUrl.searchParams.get("q") ?? "75");

    if (!Number.isInteger(width) || width < 16 || width > 3840) {
      return new Response("Nieprawidłowa szerokość obrazu", { status: 400 });
    }

    const quality = Number.isInteger(requestedQuality)
      ? Math.min(100, Math.max(1, requestedQuality))
      : 75;
    const transformed = await env.IMAGES.input(object.body)
      .transform({ width, fit: "scale-down" })
      .output({ format: "image/webp", quality });
    const transformedResponse = transformed.response();
    const headers = new Headers(transformedResponse.headers);

    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("content-type", "image/webp");

    return new Response(transformedResponse.body, {
      status: transformedResponse.status,
      headers,
    });
  }

  return new Response(object.body, {
    status: 200,
    headers: {
      "content-type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "content-length": String(object.size),
      etag: object.httpEtag,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
