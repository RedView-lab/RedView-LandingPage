"use client";

import { SharedSelectField } from "./SharedSelectField";

type TextSelectFieldProps = {
  id: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TextSelectField({ id, value, options, onChange, placeholder }: TextSelectFieldProps) {
  return (
    <SharedSelectField
      id={id}
      onChange={onChange}
      options={options.map((option) => ({ label: option, value: option }))}
      placeholder={placeholder}
      value={value}
    />
  );
}