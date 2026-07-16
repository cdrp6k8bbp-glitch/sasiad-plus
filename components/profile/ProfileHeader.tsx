import TrustBadge from "./TrustBadge";

type ProfileHeaderProps = {
  name: string;
  email: string;
  createdAt: Date;
};

export default function ProfileHeader({ name, email, createdAt }: ProfileHeaderProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const joinedAt = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(createdAt);

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-400 text-3xl font-black text-white shadow-lg">
          {initials || "S+"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {name}
              </h1>

              <p className="mt-2 text-slate-500">
                ✉️ {email}
              </p>

              <p className="mt-1 text-slate-500">
                🏡 Sąsiad od {joinedAt}
              </p>
            </div>

            <TrustBadge level="Nowy Sąsiad" />
          </div>
        </div>
      </div>
    </section>
  );
}
