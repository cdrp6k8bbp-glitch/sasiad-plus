"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type UploadResponse = {
  imageKey?: string;
  error?: string;
};

type UploadItem = {
  id: string;
  file?: File;
  previewUrl: string;
  imageKey: string;
  status: "uploading" | "ready" | "error";
  isExisting: boolean;
  error?: string;
};

function imageUrl(imageKey: string): string {
  return `/api/images/${imageKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export default function ImageUploader({
  initialImageKeys = [],
}: {
  initialImageKeys?: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<UploadItem[]>(() =>
    initialImageKeys.slice(0, MAX_IMAGES).map((imageKey, index) => ({
      id: `existing-${index}-${imageKey}`,
      previewUrl: imageUrl(imageKey),
      imageKey,
      status: "ready",
      isExisting: true,
    })),
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const readyImageKeys = items
    .filter((item) => item.status === "ready" && item.imageKey)
    .map((item) => item.imageKey);
  const isUploading = items.some((item) => item.status === "uploading");

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form || !isUploading) return;

    function preventSubmit(event: SubmitEvent) {
      event.preventDefault();
      setError("Poczekaj, aż wszystkie zdjęcia zostaną wysłane.");
    }

    form.addEventListener("submit", preventSubmit);
    return () => form.removeEventListener("submit", preventSubmit);
  }, [isUploading]);

  async function uploadFile(item: UploadItem) {
    if (!item.file) return;

    try {
      const formData = new FormData();
      formData.append("image", item.file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.imageKey) {
        throw new Error(result.error ?? "Nie udało się wysłać zdjęcia.");
      }

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, imageKey: result.imageKey!, status: "ready" }
            : currentItem,
        ),
      );
    } catch (uploadError) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                status: "error",
                error:
                  uploadError instanceof Error
                    ? uploadError.message
                    : "Nie udało się wysłać zdjęcia.",
              }
            : currentItem,
        ),
      );
    }
  }

  function addFiles(selectedFiles: File[]) {
    setError(null);

    const availableSlots = MAX_IMAGES - items.length;
    if (availableSlots <= 0) {
      setError(`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć.`);
      return;
    }

    const filesToAdd = selectedFiles.slice(0, availableSlots);
    if (selectedFiles.length > availableSlots) {
      setError(`Wybrano za dużo plików. Limit to ${MAX_IMAGES} zdjęć.`);
    }

    const validItems: UploadItem[] = [];

    for (const file of filesToAdd) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Pominięto plik w nieobsługiwanym formacie. Użyj JPG, PNG lub WEBP.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Pominięto plik większy niż 5 MB.");
        continue;
      }

      validItems.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        imageKey: "",
        status: "uploading",
        isExisting: false,
      });
    }

    if (validItems.length === 0) return;

    setItems((current) => [...current, ...validItems]);
    validItems.forEach((item) => void uploadFile(item));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  async function removeItem(item: UploadItem) {
    if (item.status === "uploading") return;

    setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    if (!item.isExisting) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setError(null);

    if (item.imageKey && !item.isExisting) {
      try {
        await fetch("/api/upload-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageKey: item.imageKey }),
        });
      } catch {
        // Usunięcie podglądu nie powinno blokować dalszej pracy formularza.
      }
    }
  }

  return (
    <div ref={containerRef}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-bold text-slate-700">
          Zdjęcia ogłoszenia
        </label>
        <span className="text-xs font-semibold text-slate-500">
          {items.length}/{MAX_IMAGES}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="sr-only"
      />
      <input type="hidden" name="image_keys" value={JSON.stringify(readyImageKeys)} />

      {items.length < MAX_IMAGES && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-3xl border-2 border-dashed p-6 text-center transition ${
            isDragging
              ? "border-green-600 bg-green-50"
              : "border-slate-300 bg-slate-50 hover:border-green-500 hover:bg-green-50/50"
          }`}
        >
          <div className="text-4xl">📷</div>
          <p className="mt-3 font-black text-slate-900">
            {items.length === 0 ? "Dodaj zdjęcia" : "Dodaj kolejne zdjęcia"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Wybierz kilka plików albo przeciągnij je tutaj
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            JPG · PNG · WEBP · maks. 5 MB każde
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-square">
                <Image
                  src={item.previewUrl}
                  alt={`Podgląd zdjęcia ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  unoptimized={item.previewUrl.startsWith("blob:")}
                  className="object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold uppercase text-white">
                    Okładka
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {item.file?.name ?? `Zdjęcie ${index + 1}`}
                </p>
                {item.status === "uploading" && (
                  <p className="mt-1 text-xs font-semibold text-blue-600">Wysyłanie…</p>
                )}
                {item.status === "ready" && (
                  <p className="mt-1 text-xs font-semibold text-green-700">
                    {item.isExisting ? "✓ Zapisane" : "✓ Gotowe"}
                  </p>
                )}
                {item.status === "error" && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {item.error ?? "Błąd wysyłania"}
                  </p>
                )}
                <button
                  type="button"
                  disabled={item.status === "uploading"}
                  onClick={() => void removeItem(item)}
                  className="mt-2 text-xs font-bold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <p className="mt-3 text-sm font-semibold text-blue-600">
          Poczekaj na wysłanie wszystkich zdjęć przed publikacją.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
