"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "./select-icons";
import { getSelectOptionClassName, SELECT_LISTBOX_CLASSNAME, SELECT_TRIGGER_CLASSNAME } from "./select-styles";

export type SharedSelectOption = {
  value: string;
  label: string;
  renderLeading?: () => ReactNode;
};

type SharedSelectFieldProps = {
  id: string;
  value: string;
  options: readonly SharedSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
};

type InternalSelectOption = SharedSelectOption & {
  id: string;
  isPlaceholder?: boolean;
};

function getInitialActiveIndex(options: readonly InternalSelectOption[], value: string) {
  const selectedIndex = options.findIndex((option) => option.value === value);

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return 0;
}

export function SharedSelectField({ id, value, options, onChange, placeholder }: SharedSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const renderedOptions = useMemo<InternalSelectOption[]>(() => {
    const baseOptions = options.map((option) => ({
      ...option,
      id: `${id}-${option.value || "option"}`,
    }));

    if (!placeholder) {
      return baseOptions;
    }

    return [
      {
        id: `${id}-placeholder`,
        isPlaceholder: true,
        label: placeholder,
        value: "",
      },
      ...baseOptions,
    ];
  }, [id, options, placeholder]);

  const selectedIndex = getInitialActiveIndex(renderedOptions, value);
  const selectedOption = renderedOptions[selectedIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextOption = optionRefs.current[activeIndex];
    nextOption?.focus();
    nextOption?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const closeMenu = (focusTrigger = false) => {
    setIsOpen(false);

    if (focusTrigger) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  const openMenu = (nextIndex = selectedIndex) => {
    setActiveIndex(nextIndex);
    setIsOpen(true);
  };

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    closeMenu(true);
  };

  const moveActiveIndex = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      const nextIndex = current + direction;

      if (nextIndex < 0) {
        return renderedOptions.length - 1;
      }

      if (nextIndex >= renderedOptions.length) {
        return 0;
      }

      return nextIndex;
    });
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(selectedIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(selectedIndex >= 0 ? selectedIndex : renderedOptions.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen) {
        selectOption(renderedOptions[activeIndex]?.value ?? value);
        return;
      }

      openMenu(selectedIndex);
    }
  };

  const handleOptionKeyDown = (index: number, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveIndex(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveIndex(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(renderedOptions.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(renderedOptions[index]?.value ?? value);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "Tab") {
      closeMenu(false);
    }
  };

  const hasSelectedValue = value !== "" || !placeholder;

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        aria-controls={`${id}-listbox`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={SELECT_TRIGGER_CLASSNAME}
        id={id}
        onClick={() => {
          if (isOpen) {
            closeMenu(false);
            return;
          }

          openMenu(selectedIndex);
        }}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {selectedOption?.renderLeading ? selectedOption.renderLeading() : null}
          <span className={`truncate ${hasSelectedValue ? "font-medium text-white" : "font-normal text-white/64"}`.trim()}>
            {selectedOption?.label ?? placeholder ?? ""}
          </span>
        </span>
        <span className={`ml-3 shrink-0 text-white/64 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`.trim()}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen ? (
        <div className={SELECT_LISTBOX_CLASSNAME} id={`${id}-listbox`} role="listbox">
          {renderedOptions.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                aria-selected={isSelected}
                className={getSelectOptionClassName({ isActive, isSelected })}
                id={option.id}
                key={option.id}
                onClick={() => selectOption(option.value)}
                onKeyDown={(event) => handleOptionKeyDown(index, event)}
                onMouseEnter={() => setActiveIndex(index)}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  {option.renderLeading ? option.renderLeading() : null}
                  <span className={`min-w-0 truncate text-[14px] font-semibold leading-none ${option.isPlaceholder ? "text-white/80" : "text-white"}`.trim()}>
                    {option.label}
                  </span>
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