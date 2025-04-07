import {
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

export type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  control: Control<FieldValues, FieldPath<FieldValues>>;
  name: FieldPath<FieldValues>;
};
