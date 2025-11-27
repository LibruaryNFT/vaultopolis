import React from "react";

/**
 * Skeleton loader component that mimics MomentCard layout
 * Used during loading states to show placeholder content
 */
export const MomentCardSkeleton = () => (
  <div className="w-[80px] sm:w-28 min-h-[140px] sm:min-h-[196px] rounded overflow-hidden border border-brand-text/40 bg-black animate-pulse flex flex-col pt-1 px-1 pb-0">
    {/* Image placeholder - matches aspect-square from MomentCard */}
    <div className="relative overflow-hidden rounded mx-auto w-full aspect-square bg-brand-primary/30 mb-2" />
    {/* Content placeholder */}
    <div className="flex-1 flex flex-col justify-between pb-1">
      <div className="space-y-1">
        <div className="h-2.5 bg-brand-primary/30 rounded w-3/4 mx-auto" />
        <div className="h-2 bg-brand-primary/20 rounded w-1/2 mx-auto" />
        <div className="h-2 bg-brand-primary/20 rounded w-2/3 mx-auto" />
        <div className="h-2.5 bg-brand-primary/30 rounded w-3/5 mx-auto" />
        <div className="h-2 bg-brand-primary/20 rounded w-1/3 mx-auto" />
      </div>
    </div>
  </div>
);

export default MomentCardSkeleton;

