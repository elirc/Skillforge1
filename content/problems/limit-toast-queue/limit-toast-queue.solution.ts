type Toast = { id: string; message: string };

export function limitToastQueue(toasts: Toast[], nextToast: Toast, maxToasts: number): Toast[] {
  return [...toasts, nextToast].slice(-maxToasts);
}
