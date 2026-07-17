type UserStatsProps = {
  activeListings: number;
  completedTotal: number;
  reviewCount: number;
  joinedYear: number;
};

export default function UserStats({
  activeListings,
  completedTotal,
  reviewCount,
  joinedYear,
}: UserStatsProps) {
  const stats = [
    { value: activeListings, label: "Aktywnych ogłoszeń" },
    { value: completedTotal, label: "Udanych transakcji" },
    { value: reviewCount, label: "Otrzymanych opinii" },
    { value: joinedYear, label: "Na Sąsiad+ od" },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-3xl font-black text-green-700">{stat.value}</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
}
