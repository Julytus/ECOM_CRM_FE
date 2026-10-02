import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface VerticalStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function VerticalStepper({ steps, currentStep, onStepClick }: VerticalStepperProps) {
  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.completed;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick?.(step.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                isActive && "bg-accent",
                !isActive && "hover:bg-accent/50"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                  isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                  isActive && !isCompleted && "border-primary bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "border-border bg-background"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{step.description}</div>
              </div>
            </button>

            {!isLast && (
              <div className="flex items-center pl-[13px] py-1">
                <Separator
                  orientation="vertical"
                  className={cn(
                    "h-4 w-[2px]",
                    isCompleted ? "bg-emerald-500/50" : "bg-border"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
