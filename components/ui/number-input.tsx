import * as React from "react";
import { Input } from "@/components/ui/input";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value?: number;
  onChange?: (value: number) => void;
  allowNegative?: boolean;
  suffix?: string;
  maxDecimals?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      allowNegative = false,
      suffix,
      className,
      placeholder = "0.00",
      step = "0.01",
      min,
      max,
      maxDecimals = 2,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (inputValue === "") {
        onChange?.(0);
        return;
      }

      // Prevent typing more than maxDecimals decimal places
      if (maxDecimals !== undefined) {
        const decimalParts = inputValue.split(".");
        if (decimalParts[1] && decimalParts[1].length > maxDecimals) {
          // Don't update - prevent the input
          return;
        }
      }

      const parsedValue = parseFloat(inputValue);

      if (!isNaN(parsedValue)) {
        // Prevent negative values if not allowed
        if (!allowNegative && parsedValue < 0) {
          onChange?.(0);
          return;
        }

        onChange?.(parsedValue);
      }
    };

    const displayValue = value === 0 ? "" : value;
    const computedMin = !allowNegative && min === undefined ? 0 : min;

    if (suffix) {
      return (
        <div className="relative">
          <Input
            ref={ref}
            type="number"
            step={step}
            min={computedMin}
            max={max}
            placeholder={placeholder}
            className={`pr-8 ${className || ""}`}
            value={displayValue}
            onChange={handleChange}
            {...props}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        </div>
      );
    }

    return (
      <Input
        ref={ref}
        type="number"
        step={step}
        min={computedMin}
        max={max}
        placeholder={placeholder}
        className={className}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
