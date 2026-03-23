interface SpinnerProps {
 readonly size?: 'sm' | 'md' | 'lg'
 readonly className?: string
}

const SIZES = {
 sm: 'h-6 w-6',
 md: 'h-10 w-10',
 lg: 'h-14 w-14',
} as const

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
 return (
  <div
   className={`animate-spin rounded-full border-2 border-white/20 border-t-transparent ${SIZES[size]} ${className}`}
  />
 )
}
