export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-red-100 via-red-50 to-red-100 bg-[length:200%_100%] ${className}`}
    />
  )
}
