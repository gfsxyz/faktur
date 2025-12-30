"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this item from the system.",
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    (() => void | Promise<void>) | null
  >(null);

  const confirm = (action: () => void | Promise<void>) => {
    setPendingAction(() => action);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingAction) {
      await Promise.resolve(pendingAction());
      setIsOpen(false);
      setPendingAction(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  return {
    isOpen,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

// Email confirmation delete dialog for clients
interface EmailConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  clientName: string;
  clientEmail: string;
}

export function EmailConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  clientName,
  clientEmail,
}: EmailConfirmDeleteDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isMatch = inputValue.toLowerCase() === clientEmail.toLowerCase();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInputValue("");
    }
    onOpenChange(open);
  };

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setInputValue("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {clientName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent. Deleting{" "}
            <span className="font-bold">{clientName}</span> will also remove all
            invoices associated with this client.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-2">
          <Label
            htmlFor="confirm-email"
            className="text-sm text-muted-foreground"
          >
            Confirm by typing{" "}
            <span className="font-mono font-semibold text-foreground">
              {clientEmail.toLocaleLowerCase()}
            </span>
          </Label>
          <Input
            id="confirm-email"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter client email"
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isMatch}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ClientToDelete {
  id: string;
  name: string;
  email: string;
}

export function useEmailConfirmDelete() {
  const [isOpen, setIsOpen] = useState(false);
  const [client, setClient] = useState<ClientToDelete | null>(null);
  const [pendingAction, setPendingAction] = useState<
    ((id: string) => void | Promise<void>) | null
  >(null);

  const confirm = (
    clientData: ClientToDelete,
    action: (id: string) => void | Promise<void>
  ) => {
    setClient(clientData);
    setPendingAction(() => action);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (pendingAction && client) {
      await Promise.resolve(pendingAction(client.id));
      setIsOpen(false);
      setClient(null);
      setPendingAction(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setClient(null);
    setPendingAction(null);
  };

  return {
    isOpen,
    client,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
