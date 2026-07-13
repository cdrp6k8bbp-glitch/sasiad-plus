type ListingProps = {
  icon: string;
  title: string;
  place: string;
  price: string;
};


export default function ListingCard({
  icon,
  title,
  place,
  price,
}: ListingProps) {

  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <div className="text-5xl">
        {icon}
      </div>


      <h3 className="mt-4 text-xl font-bold">
        {title}
      </h3>


      <div className="mt-2 text-yellow-500">
        ⭐⭐⭐⭐⭐
      </div>


      <p className="mt-2">
        📍 {place}
      </p>


      <p className="mt-2 font-bold text-green-600">
        {price}
      </p>


      <button className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-white">
        Zobacz
      </button>


    </div>
  );
}