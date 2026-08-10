import Link from "next/link";

interface SellerCardProps {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  district: string | null;
  ratingAvg: number;
  ratingCount: number;
  accountType: "individual" | "business";
}

export function SellerCard({ id, displayName, avatarUrl, district, ratingAvg, ratingCount, accountType }: SellerCardProps) {
  return (
    <Link href={`/seller/${id}`}>
      <div className="flex flex-col items-center gap-3 rounded-md border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:shadow-sm">
        <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-900">{displayName}</h3>
          {district && <p className="text-xs text-slate-500">{district}</p>}
          {accountType === "business" && (
            <p className="text-xs font-medium text-orange-600 mt-1">Business</p>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-yellow-500">⭐</span>
          <span className="font-semibold text-slate-700">{ratingAvg.toFixed(1)}</span>
          <span className="text-slate-500">({ratingCount})</span>
        </div>
      </div>
    </Link>
  );
}
