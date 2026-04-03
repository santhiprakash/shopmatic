import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : undefined}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface useConfirmDialogReturn {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  ConfirmDialogComponent: React.FC<ConfirmDialogProps>;
}

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function useConfirmDialog(): useConfirmDialogReturn {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmDialogOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setState((prev) => {
      if (!open && prev.resolve) {
        prev.resolve(false);
      }
      return { ...prev, open };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.resolve) {
      state.resolve(true);
    }
    setState({ open: false, options: null, resolve: null });
  }, [state.resolve]);

  const ConfirmDialogComponent: React.FC<Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm">> = (props) => (
    <ConfirmDialog
      open={state.open}
      onOpenChange={handleOpenChange}
      onConfirm={handleConfirm}
      title={state.options?.title || props.title}
      description={state.options?.description || props.description}
      confirmText={state.options?.confirmText || props.confirmText}
      cancelText={state.options?.cancelText || props.cancelText}
      variant={state.options?.variant || props.variant}
    />
  );

  return { confirm, ConfirmDialogComponent };
}
