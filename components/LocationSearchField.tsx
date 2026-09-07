"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  LOCALITIES,
  nearestLocality,
  nearbyLocalities,
  parseSearchRadius,
  resolveLocality,
  SEARCH_RADII,
  type SearchRadius,
} from "@/lib/locations";

const LOCATION_STORAGE_KEY = "sasiad-plus:last-location";

type LocationSearchFieldProps = {
  defaultRadius?: string | string[];
  defaultValue?: string;
  id: string;
  inputClassName: string;
  labelClassName?: string;
  required?: boolean;
  showRadius?: boolean;
};

export default function LocationSearchField({
  defaultRadius,
  defaultValue = "",
  id,
  inputClassName,
  labelClassName = "sr-only",
  required = false,
  showRadius = false,
}: LocationSearchFieldProps) {
  const listId = `${id}-${useId().replace(/:/g, "")}-miejscowosci`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [radius, setRadius] = useState<SearchRadius>(
    parseSearchRadius(defaultRadius),
  );
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (defaultValue) return;
    const remembered = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (remembered && inputRef.current) inputRef.current.value = remembered;
  }, [defaultValue]);

  const nearby = useMemo(
    () => nearbyLocalities(value, radius).filter((item) => item.name !== resolveLocality(value)?.name),
    [radius, value],
  );

  function rememberLocation(nextValue: string) {
    const canonical = resolveLocality(nextValue)?.name ?? nextValue.trim();
    setValue(canonical);
    if (inputRef.current) inputRef.current.value = canonical;
    if (canonical) window.localStorage.setItem(LOCATION_STORAGE_KEY, canonical);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Ta przeglądarka nie udostępnia lokalizacji.");
      return;
    }

    setLocating(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = nearestLocality(coords.latitude, coords.longitude);
        if (nearest.distance > 75) {
          setMessage("Jesteś poza obecnie obsługiwanym obszarem okolic Słupska.");
        } else {
          rememberLocation(nearest.locality.name);
          setMessage(`Wybrano najbliższą miejscowość: ${nearest.locality.name}.`);
        }
        setLocating(false);
      },
      () => {
        setMessage("Nie udało się odczytać lokalizacji. Wybierz miejscowość ręcznie.");
        setLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  }

  return (
    <div className="min-w-0">
      <label className={labelClassName} htmlFor={id}>Miasto lub miejscowość</label>
      <input
        id={id}
        ref={inputRef}
        name="location"
        list={listId}
        defaultValue={defaultValue}
        required={required}
        onChange={(event) => setValue(event.target.value)}
        onBlur={(event) => rememberLocation(event.currentTarget.value)}
        placeholder="Miasto lub miejscowość"
        autoComplete="address-level2"
        className={inputClassName}
      />
      <datalist id={listId}>
        {LOCALITIES.map((locality) => (
          <option key={locality.name} value={locality.name} />
        ))}
      </datalist>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {showRadius && (
          <label className="inline-flex items-center gap-2 font-semibold text-slate-600">
            Promień
            <select
              name="radius"
              value={radius}
              onChange={(event) => setRadius(parseSearchRadius(event.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-bold text-slate-800"
            >
              {SEARCH_RADII.map((distance) => (
                <option key={distance} value={distance}>{distance} km</option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 font-bold text-green-800 hover:bg-green-100 disabled:opacity-60"
        >
          {locating ? "Sprawdzam…" : "⌖ Użyj mojej lokalizacji"}
        </button>
      </div>

      {showRadius && value && nearby.length > 0 && (
        <p className="mt-2 line-clamp-2 text-xs text-slate-500">
          W pobliżu: {nearby.slice(0, 5).map((item) => item.name).join(", ")}
        </p>
      )}
      {message && <p className="mt-2 text-xs font-semibold text-slate-600" role="status">{message}</p>}
    </div>
  );
}
