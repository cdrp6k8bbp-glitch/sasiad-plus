type ReviewCardProps = {
  author: string;
  text: string;
  date: string;
};

export default function ReviewCard({
  author,
  text,
  date,
}: ReviewCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold">{author}</p>
          <p className="mt-1 text-sm text-slate-400">{date}</p>
        </div>

        <span aria-label="Ocena 5 na 5" className="text-amber-500">
          ★★★★★
        </span>
      </div>

      <p className="mt-5 leading-7 text-slate-600">{text}</p>
    </article>
  );
}
