import Skeleton from "../common/Skeleton";

export default function ProductCardSkeleton({ view = "grid" }) {
  if (view === "list") {
    return (
      <div className="flex gap-6">
        <Skeleton className="h-56 w-40 shrink-0 sm:w-56" />
        <div className="flex flex-1 flex-col gap-3 py-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
