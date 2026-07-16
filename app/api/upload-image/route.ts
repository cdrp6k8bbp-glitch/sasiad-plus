import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function getExtension(contentType: string): string {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";

  return "bin";
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: "Zaloguj się, aby dodać zdjęcie." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { error: "Nie wybrano zdjęcia." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(image.type)) {
      return NextResponse.json(
        { error: "Dozwolone są tylko pliki JPG, PNG i WEBP." },
        { status: 400 },
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Zdjęcie może mieć maksymalnie 5 MB." },
        { status: 400 },
      );
    }

    const { env } = await getCloudflareContext({ async: true });

    const extension = getExtension(image.type);
    const imageKey = `listings/${crypto.randomUUID()}.${extension}`;
    const imageBuffer = await image.arrayBuffer();

    await env.sasiad_plus_images.put(imageKey, imageBuffer, {
      httpMetadata: {
        contentType: image.type,
      },
      customMetadata: {
        originalName: image.name.slice(0, 200),
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({
      imageKey,
    });
  } catch (error) {
    console.error("Błąd wysyłania zdjęcia:", error);

    return NextResponse.json(
      { error: "Nie udało się wysłać zdjęcia." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 401 });
    }

    const body = (await request.json()) as { imageKey?: unknown };
    const imageKey = body.imageKey;

    if (typeof imageKey !== "string" || !imageKey.startsWith("listings/")) {
      return NextResponse.json({ error: "Nieprawidłowe zdjęcie." }, { status: 400 });
    }

    const { env } = await getCloudflareContext({ async: true });
    const image = await env.sasiad_plus_images.head(imageKey);

    if (!image || image.customMetadata?.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
    }

    await env.sasiad_plus_images.delete(imageKey);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Błąd usuwania zdjęcia:", error);
    return NextResponse.json(
      { error: "Nie udało się usunąć zdjęcia." },
      { status: 500 },
    );
  }
}
