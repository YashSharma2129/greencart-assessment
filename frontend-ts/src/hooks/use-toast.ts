import { toast } from 'sonner';

export const useToast = () => {
  const showToast = {
    success: (message: string, description?: string) => {
      toast.success(message, {
        description,
        duration: 4000,
      });
    },
    error: (message: string, description?: string) => {
      toast.error(message, {
        description,
        duration: 6000,
      });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, {
        description,
        duration: 4000,
      });
    },
    info: (message: string, description?: string) => {
      toast.info(message, {
        description,
        duration: 4000,
      });
    },
    loading: (message: string, description?: string) => {
      return toast.loading(message, {
        description,
      });
    },
    dismiss: (toastId: string | number) => {
      toast.dismiss(toastId);
    },
  };

  return showToast;
};

// Export individual functions for direct use
export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, { description, duration: 4000 });
};

export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, { description, duration: 6000 });
};

export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, { description, duration: 4000 });
};

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, { description, duration: 4000 });
};

export const showLoadingToast = (message: string, description?: string) => {
  return toast.loading(message, { description });
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};
