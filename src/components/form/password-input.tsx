import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Button } from "../ui/button";
import { InputGroup, type InputGroupProps } from "./input-group";
import { type InputProps as BaseInputProps } from "./type";

export type PasswordInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<BaseInputProps, "value" | "defaultValue" | "control" | "name" | "type"> &
  Omit<InputGroupProps, "value" | "defaultValue" | "control" | "name" | "type">;

export function PasswordInput<T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  onChange,
  label,
  error,
  helperText,
  disabled,
  ...props
}: PasswordInputProps<T>) {
  const {
    field: { value, onChange: fieldOnChange, ...field },
    fieldState,
  } = useController<T>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup
      value={value}
      type={showPassword ? "text" : "password"}
      onChange={(e) => {
        fieldOnChange(e);
        onChange?.(e);
      }}
      error={fieldState.error?.message ?? error}
      label={label}
      helperText={helperText}
      disabled={disabled}
      rightSection={
        <Button
          variant="link"
          type="button"
          size="sm"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeIcon className="h-3.5 w-3.5" />
          ) : (
            <EyeOffIcon className="h-3.5 w-3.5" />
          )}
        </Button>
      }
      {...field}
      {...props}
    />
  );
}
