import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-3xl overflow-hidden border border-border-card shadow-sm p-0 flex flex-col h-full animate-pulse">
      {/* Shimmer Image */}
      <div className="aspect-[4/3] w-full shimmer-bg" />
      
      {/* Shimmer Content */}
      <div className="p-5 flex flex-col flex-grow space-y-3">
        {/* Title */}
        <div className="h-5 w-2/3 rounded-lg shimmer-bg" />
        
        {/* Description lines */}
        <div className="space-y-1.5 pt-2 flex-grow">
          <div className="h-3 w-full rounded-md shimmer-bg" />
          <div className="h-3 w-5/6 rounded-md shimmer-bg" />
          <div className="h-3 w-2/3 rounded-md shimmer-bg" />
        </div>

        {/* Price & Button */}
        <div className="pt-4 flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-2 w-10 rounded shimmer-bg" />
            <div className="h-5 w-16 rounded-md shimmer-bg" />
          </div>
          <div className="h-9 w-24 rounded-2xl shimmer-bg" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-3xl border border-border-card shadow-md p-6 space-y-6 animate-pulse">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-border-card pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 rounded-md shimmer-bg" />
            <div className="h-4 w-16 rounded-full shimmer-bg" />
          </div>
          <div className="flex gap-2">
            <div className="h-3 w-16 rounded shimmer-bg" />
            <div className="h-3 w-12 rounded shimmer-bg" />
          </div>
        </div>
        <div className="h-9 w-24 rounded-2xl shimmer-bg" />
      </div>

      {/* Progress timeline shimmers */}
      <div className="relative flex justify-between items-center max-w-xl mx-auto px-4 py-2">
        <div className="absolute top-6 left-6 right-6 h-1 bg-border-card -z-10 rounded" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full shimmer-bg border-2 border-border-card" />
            <div className="h-2.5 w-10 rounded shimmer-bg" />
          </div>
        ))}
      </div>
    </div>
  );
}
