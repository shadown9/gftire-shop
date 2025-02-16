import { toast } from "sonner"

interface NotificationOptions {
  duration?: number
}

export function useNotifications() {
  const success = (message: string, options?: NotificationOptions) => {
    toast.success(message, options)
  }

  const error = (message: string, options?: NotificationOptions) => {
    toast.error(message, options)
  }

  const warning = (message: string, options?: NotificationOptions) => {
    toast.warning(message, options)
  }

  const info = (message: string, options?: NotificationOptions) => {
    toast.info(message, options)
  }

  return {
    success,
    error,
    warning,
    info,
  }
}

