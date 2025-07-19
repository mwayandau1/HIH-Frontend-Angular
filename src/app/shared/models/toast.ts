export interface Toast {
  title: string;
  message?: string;
  type: ToastType;
  id: number;
  triggerBy?: {
    name: string;
    imageSrc: string;
  };
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';
