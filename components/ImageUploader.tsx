"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type UploadResponse = {
  imageKey?: string;
  error?: string;
};

export default function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [file]);

  async function uploadFile(nextFile: File) {
    setIsUploading(true);
    setError(null);
    setImageKey("");

    try {
      const formData = new FormData();
      formData.append("image", nextFile);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.imageKey) {
        throw new Error(result.error ?? "Nie udało się wysłać zdjęcia.");
      }

      setImageKey(result.imageKey);
    } catch (uploadError) {
      setFile(null);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Nie udało się wysłać zdjęcia.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function validateAndSetFile(nextFile: File | undefined) {
    if (!nextFile) return;

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError("Obsługiwane są tylko obrazy JPG, PNG i WEBP.");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setError("Plik jest zbyt duży. Maksymalny rozmiar to 5 MB.");
      return;
    }

    setError(null);
    setFile(nextFile);

    await uploadFile(nextFile);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void validateAndSetFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    void validateAndSetFile(event.dataTransfer.files?.[0]);
  }

  function removeFile() {
    setFile(null);
    setImageKey("");
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        Zdjęcie ogłoszenia
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="sr-only"
      />

      <input type="hidden" name="image_key" value={imageKey} />

      {previewUrl && file ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <img
            src={previewUrl}
            alt="Podgląd wybranego zdjęcia"
            className="aspect-[16/10] w-full object-cover"
          />

          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">
                {file.name}
              </p>

              <p className="text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              {isUploading && (
                <p className="mt-1 text-sm font-semibold text-blue-600">
                  Wysyłanie zdjęcia…
                </p>
              )}

              {!isUploading && imageKey && (
                <p className="mt-1 text-sm font-semibold text-green-700">
                  ✓ Zdjęcie wysłane
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zmień
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={removeFile}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isUploading) {
              inputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (
              !isUploading &&
              (event.key === "Enter" || event.key === " ")
            ) {
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
          className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-green-600 bg-green-50"
              : "border-slate-300 bg-slate-50 hover:border-green-500 hover:bg-green-50/50"
          }`}
        >
          <div className="text-5xl">📷</div>

          <p className="mt-4 text-lg font-black text-slate-900">
            Dodaj zdjęcie
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Kliknij albo przeciągnij zdjęcie tutaj
          </p>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            JPG · PNG · WEBP · maks. 5 MB
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}