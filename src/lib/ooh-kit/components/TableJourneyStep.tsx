import { Check } from 'lucide-react'

export type JourneyStepVariant = 'Delivered' | 'Error' | 'Pending' | 'Right Now' | 'Success' | 'Warning' | 'Expired'

interface TableJourneyStepProps {
  step: JourneyStepVariant
  showConnectionLine?: boolean
}

function ExclamationIcon({ size = 8 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.0044 14.9297C12.7747 14.9297 13.3996 15.554 13.3999 16.3242C13.3999 17.0947 12.7748 17.7197 12.0044 17.7197C11.2342 17.7195 10.6099 17.0945 10.6099 16.3242C10.6101 15.5542 11.2343 14.9299 12.0044 14.9297ZM12.0005 6.28613C12.5525 6.2864 13.0005 6.73401 13.0005 7.28613V12.3936C13.0003 12.9455 12.5525 13.3933 12.0005 13.3936C11.4483 13.3936 11.0006 12.9457 11.0005 12.3936V7.28613C11.0005 6.73385 11.4482 6.28613 12.0005 6.28613Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function TableJourneyStep({ step, showConnectionLine = true }: TableJourneyStepProps) {
  return (
    <div className="flex flex-col items-center justify-center relative w-8 h-8">
      {/* Connection line above */}
      {showConnectionLine && (
        <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-px h-7 bg-border-default" />
      )}

      {/* Dot */}
      {step === 'Success' && (
        <div className="w-2 h-2 rounded-full bg-journey-success border-4 border-surface-bg box-content" />
      )}

      {step === 'Warning' && (
        <div className="w-2 h-2 rounded-full bg-journey-warning border-4 border-surface-bg box-content" />
      )}

      {step === 'Pending' && (
        <div className="w-2 h-2 rounded-full bg-text-light border-4 border-surface-bg box-content" />
      )}

      {step === 'Right Now' && (
        <div className="w-3 h-3 rounded-full bg-surface-primary border border-border-default shadow-[0px_0px_0px_4px_rgba(6,26,177,0.15),0px_0px_0px_8px_rgba(6,26,177,0.1)]" />
      )}

      {step === 'Delivered' && (
        <div className="w-3 h-3 rounded-full bg-journey-success border border-surface-success shadow-[0px_0px_0px_4px_rgba(3,152,85,0.15),0px_0px_0px_8px_rgba(3,152,85,0.1)] flex items-center justify-center">
          <Check size={8} strokeWidth={3} className="text-white" />
        </div>
      )}

      {step === 'Error' && (
        <div className="w-3 h-3 rounded-full bg-journey-error border border-surface-error shadow-[0px_0px_0px_4px_rgba(217,45,32,0.15),0px_0px_0px_8px_rgba(217,45,32,0.1)] flex items-center justify-center text-white">
          <ExclamationIcon />
        </div>
      )}

      {step === 'Expired' && (
        <div className="w-3 h-3 rounded-full bg-journey-expired border border-surface-warning shadow-[0px_0px_0px_4px_rgba(220,104,3,0.15),0px_0px_0px_8px_rgba(220,104,3,0.1)] flex items-center justify-center text-white">
          <ExclamationIcon />
        </div>
      )}
    </div>
  )
}
