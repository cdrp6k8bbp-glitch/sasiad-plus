import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import CategoryFields from "@/components/CategoryFields";
import ImageUploader from "@/components/ImageUploader";
import { auth } from "@/lib/auth";
import { getListingById } from "@/lib/db";
import { parseListingImageKeys } from "@/lib/listing-images";
import { updateListing } from "@/app/ogloszenie/actions";

const fieldClassName =
  "w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = Number(id);

  if (!Number.isInteger(listingId) || listingId < 1) {
    notFound();
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/logowanie?redirect=/ogloszenie/${listingId}/edytuj`);
  }

  const listing = await getListingById(listingId);
  if (!listing || listing.owner_id !== session.user.id) {
    notFound();
  }

  const imageKeys = parseListingImageKeys(
    listing.image_keys,
    listing.image_key,
  );
  const updateListingWithId = updateListing.bind(null, listingId);

  return (
    <main className="min-h-screen bg-slate-50 p-4 py-10 text-slate-900 md:p-8">
      <div className="mx-auto max-w-xl">
        <Link
          href={`/ogloszenie/${listing.id}`}
          className="font-semibold text-green-700 hover:underline"
        >
          ← Anuluj i wróć do ogłoszenia
        </Link>

        <h1 className="mt-6 text-4xl font-black text-green-700">
          ✏️ Edytuj ogłoszenie
        </h1>
        <p className="mt-4 text-slate-600">
          Zmień treść, cenę, lokalizację lub zdjęcia swojej oferty.
        </p>

        <form
          action={updateListingWithId}
          className="mt-10 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-bold text-slate-700">
              Tytuł ogłoszenia
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={listing.title}
              className={fieldClassName}
            />
          </div>

          <CategoryFields
            initialCategory={listing.category}
            initialSubcategory={listing.subcategory}
          />

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-bold text-slate-700">
              Opis
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={listing.description}
              className={fieldClassName}
              rows={5}
            />
          </div>

          <ImageUploader initialImageKeys={imageKeys} />

          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-bold text-slate-700">
              Cena
            </label>
            <input
              id="price"
              name="price"
              required
              defaultValue={listing.price}
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-2 block text-sm font-bold text-slate-700">
              Miasto
            </label>
            <input
              id="location"
              name="location"
              required
              defaultValue={listing.location}
              className={fieldClassName}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Zapisz zmiany
          </button>
        </form>
      </div>
    </main>
  );
}
