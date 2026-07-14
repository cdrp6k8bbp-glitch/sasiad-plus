"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [file]);

  function validateAndSetFile(nextFile: File | undefined) {
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
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    validateAndSetFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  }

  function removeFile() {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        Zdjęcie ogłoszenia
      </label>

      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="sr-only"
      />

      {previewUrl && file ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <img
            src={previewUrl}
            alt="Podgląd wybranego zdjęcia"
            className="aspect-[16/10] w-full object-cover"
          />

          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">{file.name}</p>
              <p className="text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Zmień
              </button>

              <button
                type="button"
                onClick={removeFile}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
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
          className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-green-600 bg-green-50"
              : "border-slate-300 bg-slate-50 hover:border-green-500 hover:bg-green-50/50"
          }`}
        >
          <div className="text-5xl">📷</div>
          <p className="mt-4 text-lg font-black text-slate-900">Dodaj zdjęcie</p>
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

      <p className="mt-3 text-sm text-slate-500">
        Na tym etapie zdjęcie służy tylko do podglądu. Zapis do R2 dodamy w następnym sprincie.
      </p>
    </div>
  );
}
