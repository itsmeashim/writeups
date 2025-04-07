import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { InputGroup, type InputGroupProps } from "./input-group";
import { type InputProps as BaseInputProps } from "./type";

export type TextInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<BaseInputProps, "value" | "defaultValue" | "control" | "name"> &
  InputGroupProps;

export function TextInput<T extends FieldValues>({
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
}: TextInputProps<T>) {
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
      value={value}
      type="text"
      onChange={(e) => {
        fieldOnChange(e);
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
