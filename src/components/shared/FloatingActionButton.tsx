import React from "react";
import { Plus } from "lucide-react";
import AppButton from "./AppButton";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export default function FloatingActionButton({ onClick, label }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AppButton
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        aria-label={label || "Add"}
      >
        <Plus className="h-6 w-6" />
      </AppButton>
    </div>
  );
}
