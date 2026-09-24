import { addToast } from "@heroui/toast";

export const toast = {
  success: (message: string) =>
    addToast({
      description: message,
      color: "success",
    }),
  error: (message: string) =>
    addToast({
      description: message,
      color: "danger",
    }),
  info: (message: string) =>
    addToast({
      description: message,
      color: "primary",
    }),
  warning: (message: string) =>
    addToast({
      description: message,
      color: "warning",
    }),
};
