import { CheckIcon } from '../assets/icons'

type ToastProps = {
  message: string
  show: boolean
}

function Toast({ message, show }: ToastProps) {
  if (!show) return null

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success-bg px-4 py-3 shadow-lg backdrop-blur-md">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success">
          <CheckIcon className="h-2.5 w-2 text-white" />
        </span>
        <span className="text-sm font-bold text-success">{message}</span>
      </div>
    </div>
  )
}

export default Toast
