import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: number;
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: steps }, (_, i) => i + 1).map((step) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div
            key={step}
            className={cn(
              "flex h-8 w-8 items-center justify-center text-xs font-semibold transition-all",
              isActive &&
                "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background animate-in slide-in-from-left",
              isCompleted && "bg-primary/20 text-primary",
              !isActive &&
                !isCompleted &&
                "bg-muted opacity-50 text-muted-foreground"
            )}
          >
            {isCompleted ? (
              <Check className="w-4 h-4 animate-in zoom-in-5 duration-500 text-primary" />
            ) : (
              step
            )}
          </div>
        );
      })}
    </div>
  );
}
