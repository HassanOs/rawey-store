"use client";

import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEvent,
  type OptionHTMLAttributes,
  type ReactNode,
  type Ref
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectChangeEvent = {
  target: { name?: string; value: string };
  currentTarget: { name?: string; value: string };
  type: "change";
};

type SelectProps = {
  children: ReactNode;
  className?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: (event: SelectChangeEvent) => void;
  required?: boolean;
  value?: string | number;
};

type SelectOption = {
  disabled: boolean;
  label: string;
  value: string;
};

export const Select = forwardRef<HTMLInputElement, SelectProps>(function Select(
  { children, className, defaultValue = "", disabled = false, name, onBlur, onChange, required, value },
  forwardedRef
) {
  const options = useMemo(() => parseOptions(children), [children]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [internalValue, setInternalValue] = useState(String(defaultValue));
  const [isOpen, setIsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState({ left: 0, top: 0, width: 0 });
  const selectedValue = value === undefined ? internalValue : String(value);
  const selectedOption = options.find((option) => option.value === selectedValue);
  const selectedLabel = selectedOption?.label || options.find((option) => !option.disabled)?.label || "";

  useEffect(() => {
    if (!isOpen) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuRect({
        left: rect.left,
        top: rect.bottom + 8,
        width: rect.width
      });
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-rawey-select-menu]")) return;
      setIsOpen(false);
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function updateValue(nextValue: string) {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.({
      target: { name, value: nextValue },
      currentTarget: { name, value: nextValue },
      type: "change"
    });
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        ref={(node) => {
          hiddenInputRef.current = node;
          assignRef(forwardedRef, node);
        }}
        type="hidden"
        name={name}
        value={selectedValue}
        required={required}
        onBlur={onBlur}
        readOnly
      />
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onBlur={() => hiddenInputRef.current?.dispatchEvent(new FocusEvent("blur", { bubbles: true }))}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-2xl border border-rawey-line bg-white px-4 text-right text-sm text-rawey-text outline-none transition duration-200 hover:border-rawey-gold/70 hover:shadow-sm focus:border-rawey-gold focus:ring-4 focus:ring-rawey-gold/15 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
      >
        <span className={cn("truncate", selectedOption?.disabled && "text-rawey-muted")}>{selectedLabel}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-rawey-gold transition", isOpen && "rotate-180")} />
      </button>
      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              data-rawey-select-menu
              role="listbox"
              className="fixed z-[80] max-h-72 overflow-y-auto rounded-2xl border border-rawey-line bg-white p-1.5 text-sm shadow-soft outline-none animate-in fade-in-0 zoom-in-95"
              style={{ left: menuRect.left, top: menuRect.top, width: menuRect.width }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === selectedValue}
                  disabled={option.disabled}
                  onClick={() => updateValue(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right transition hover:bg-rawey-background focus:bg-rawey-background focus:outline-none disabled:cursor-not-allowed disabled:text-rawey-muted/70",
                    option.value === selectedValue && "bg-rawey-gold/10 text-rawey-text"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === selectedValue ? <Check className="h-4 w-4 shrink-0 text-rawey-gold" /> : null}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
});

function parseOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionHTMLAttributes<HTMLOptionElement>>(child) || child.type !== "option") {
      return [];
    }

    const label = Children.toArray(child.props.children).join("");
    const value = child.props.value === undefined ? label : String(child.props.value);

    return [{
      disabled: Boolean(child.props.disabled),
      label,
      value
    }];
  });
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}
