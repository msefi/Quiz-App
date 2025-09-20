import React, { useState, useEffect } from "react"
import { Skeleton } from "./skeleton"

type DelayedSkeletonProps = {
  isLoading: boolean
  pageSize: number
  className?: string
}

export function DelayedSkeleton({ isLoading, pageSize, className }: DelayedSkeletonProps) {
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true)
      setLoadingStartTime(Date.now())
      if (loadingTimer) clearTimeout(loadingTimer)
      setLoadingTimer(null)
    } else {
      if (loadingStartTime) {
        const elapsed = Date.now() - loadingStartTime
        const remaining = Math.max(0, 300 - elapsed)
        const timer = setTimeout(() => {
          setShowSkeleton(false)
          setLoadingStartTime(null)
        }, remaining)
        setLoadingTimer(timer)
      } else {
        setShowSkeleton(false)
      }
    }
    return () => {
      if (loadingTimer) clearTimeout(loadingTimer)
    }
  }, [isLoading, loadingStartTime])

  if (!showSkeleton) return null

  return (
    <div className={className}>
      {Array.from({ length: pageSize }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
