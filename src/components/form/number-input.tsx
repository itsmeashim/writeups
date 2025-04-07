import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { InputGroup, type InputGroupProps } from "./input-group";
import { type InputProps as BaseInputProps } from "./type";

export type NumberInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<BaseInputProps, "value" | "defaultValue" | "control" | "name"> &
  InputGroupProps;

export function NumberInput<T extends FieldValues>({
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
}: NumberInputProps<T>) {
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

  return (
    <InputGroup
      value={value ?? ""}
      type="number"
      onChange={(e) => {
        const numValue =
          e.target.value === "" ? undefined : Number(e.target.value);
        fieldOnChange(numValue);
        onChange?.(e);
      }}
      error={fieldState.error?.message ?? error}
      label={label}
      helperText={helperText}
      disabled={disabled}
      {...field}
      {...props}
    />
  );
}
