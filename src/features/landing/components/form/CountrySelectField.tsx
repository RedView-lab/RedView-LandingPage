"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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

const FLAG_BASE_PATH = "/landing/svg/pays";
const TRIGGER_CLASSNAME =
  "flex h-10 w-full items-center justify-between rounded-[8px] border border-[rgba(213,215,218,0.16)] bg-white/8 px-3 text-left text-[16px] leading-6 text-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[background-color,border-color,box-shadow] duration-150 hover:bg-white/10 focus-visible:border-white/28 focus-visible:bg-white/10 focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]";

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 20 20">
      <path d="M6 8L10 12L14 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3.25 8.15L6.45 11.35L12.75 5.05" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function CountryFlag({ country }: { country: CountryOption }) {
  return (
    <div className="overflow-hidden rounded-[2px] border border-white/10 bg-black/20">
      <Image
        alt={`Drapeau ${country.value}`}
        className="h-[14px] w-5 object-cover"
        height={14}
        src={`${FLAG_BASE_PATH}/${country.flagCode}.svg`}
        unoptimized
        width={20}
      />
    </div>
  );
}

export function CountrySelectField({ id, value, options, onChange }: CountrySelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        aria-controls={`${id}-listbox`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={TRIGGER_CLASSNAME}
        id={id}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CountryFlag country={selectedOption} />
          <span className="truncate font-medium text-white">{selectedOption.value}</span>
        </span>
        <span className={`text-white/64 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`.trim()}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[5px] border border-white/10 bg-[#262626] shadow-[2px_2px_4px_rgba(0,0,0,0.24)]"
          id={`${id}-listbox`}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                aria-selected={isSelected}
                className={`flex h-[30px] w-full items-center gap-[8px] px-[10px] pr-[6px] text-left text-white transition-colors ${isSelected ? "bg-white/16" : "bg-transparent hover:bg-white/12"}`.trim()}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                <CountryFlag country={option} />
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold leading-none text-white">
                  {option.value}
                </span>
                <span className={`text-white ${isSelected ? "opacity-100" : "opacity-0"}`.trim()}>
                  <CheckIcon />
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}