import { useEffect, useRef, useState } from "react";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { InputGroup, type InputGroupProps } from "./input-group";
import { type InputProps as BaseInputProps } from "./type";

export type AutocompleteInputProps<T extends FieldValues> =
  UseControllerProps<T> &
    Omit<BaseInputProps, "value" | "defaultValue" | "control" | "name"> &
    InputGroupProps & {
      options: string[];
    };

export function AutocompleteInput<T extends FieldValues>({
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
  options,
  placeholder,
  ...props
}: AutocompleteInputProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    field: { value, onChange: fieldOnChange },
    fieldState,
  } = useController<T>({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  useEffect(() => {
    const filtered = options.filter((opt) =>
      opt.toLowerCase().includes((value as string)?.toLowerCase() ?? ""),
    );
    setFilteredOptions(filtered);
  }, [value, options]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key !== "ArrowDown") return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0,
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const selectedOption = filteredOptions[highlightedIndex];
          fieldOnChange(selectedOption);
          if (onChange) {
            onChange({
              target: { value: selectedOption },
            } as React.ChangeEvent<HTMLInputElement>);
          }
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fieldOnChange(e.target.value);
    onChange?.(e);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <InputGroup
        ref={inputRef}
        value={value ?? ""}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Add delay to allow click events on dropdown items
          setTimeout(() => {
            setIsOpen(false);
          }, 200);
        }}
        error={fieldState.error?.message ?? error}
        label={label}
        helperText={helperText}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg">
          {filteredOptions.map((option, index) => (
            <div
              key={option}
              className={`cursor-pointer px-4 py-2 text-sm ${
                highlightedIndex === index
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-800 hover:bg-zinc-50"
              }`}
              onClick={() => {
                fieldOnChange(option);
                if (onChange) {
                  onChange({
                    target: { value: option },
                  } as React.ChangeEvent<HTMLInputElement>);
                }
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
