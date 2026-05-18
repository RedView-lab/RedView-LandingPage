"use client";

import Image from "next/image";
import { SharedSelectField } from "./SharedSelectField";

export type CountryOption = {
  value: string;
  flagCode: string;
};

type CountrySelectFieldProps = {
  id: string;
  value: string;
  options: CountryOption[];
  onChange: (value: string) => void;
};

const FLAG_BASE_PATH = "/landing/svg";

function CountryFlag({ country }: { country: CountryOption }) {
  return (
    <div className="size-5 overflow-hidden rounded-full border border-white/10 bg-black/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <Image
        alt={`Drapeau ${country.value}`}
        className="size-full object-cover"
        height={20}
        src={`${FLAG_BASE_PATH}/${country.flagCode}.svg`}
        unoptimized
        width={20}
      />
    </div>
  );
}

export function CountrySelectField({ id, value, options, onChange }: CountrySelectFieldProps) {
  return (
    <SharedSelectField
      id={id}
      onChange={onChange}
      options={options.map((option) => ({
        label: option.value,
        renderLeading: () => <CountryFlag country={option} />,
        value: option.value,
      }))}
      value={value}
    />
  );
}