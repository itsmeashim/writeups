import * as React from "react";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { Input } from "../ui/input";

export interface InputGroupProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean | string;
  helperText?: string;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  disabled?: boolean;
  inputComponent?: React.ElementType;
  withAsterisk?: boolean;
  transform?: (value: string) => string;
  classNames?: {
    label?: string;
    error?: string;
    helperText?: string;
    leftSection?: string;
    rightSection?: string;
    root?: string;
    wrapper?: string;
  };
}

const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftSection,
      rightSection,
      withAsterisk,
      disabled,
      inputComponent,
      id,
      classNames,
      transform,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const errorMessage = typeof error === "string" ? error : undefined;
    const hasError = !!error;

    const InputComponent = inputComponent ?? Input;

    return (
      <div className={cn("flex flex-col gap-1.5", classNames?.root)}>
        {label && (
          <Label htmlFor={inputId} className={classNames?.label}>
            {label} {withAsterisk && <span className="text-red-500">*</span>}
          </Label>
        )}
        <div className={cn("relative flex items-center", classNames?.wrapper)}>
          {leftSection && (
            <div
              className={cn(
                "absolute left-3 flex items-center justify-center text-muted-foreground",
                classNames?.leftSection,
              )}
            >
              {leftSection}
            </div>
          )}
          <InputComponent
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              leftSection && "pl-10",
              rightSection && "pr-10",
              hasError && "border-red-500 [&_input]:border-red-500",
              className,
            )}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (transform) {
                e.target.value = transform(e.target.value);
              }
              props.onChange?.(e);
            }}
            {...props}
          />
          {rightSection && (
            <div
              className={cn(
                "absolute right-0 flex items-center justify-center text-muted-foreground",
                classNames?.rightSection,
              )}
            >
              {rightSection}
            </div>
          )}
        </div>
        {(errorMessage ?? helperText) && (
          <p
            className={cn(
              "text-xs",
              hasError ? "text-red-500" : "text-muted-foreground",
              hasError ? classNames?.error : classNames?.helperText,
            )}
          >
            {errorMessage ?? helperText}
          </p>
        )}
      </div>
    );
  },
);

InputGroup.displayName = "InputGroup";

export { InputGroup };
