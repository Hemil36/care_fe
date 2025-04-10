import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import CareIcon from "@/CAREUI/icons/CareIcon";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  DOSAGE_UNITS_CODES,
  DosageQuantity,
} from "@/types/emr/medicationRequest";

interface Props {
  quantity?: DosageQuantity;
  onChange: (quantity: DosageQuantity) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  isMobile?: boolean;
}

export function ComboboxQuantityInput({
  quantity,
  onChange,
  disabled,
  placeholder = "Enter a number...",
  autoFocus,
  isMobile = false,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    quantity?.value?.toString() || "",
  );
  const [selectedUnit, setSelectedUnit] = React.useState(quantity?.unit);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [showMobileUnits, setShowMobileUnits] = React.useState(false);

  const showDropdown = /^\d+$/.test(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
      if (!isMobile) {
        setOpen(true);
        setActiveIndex(0);
      }

      if (value && selectedUnit) {
        onChange({
          value: parseInt(value, 10),
          unit: selectedUnit,
        });
      } else if (value && !selectedUnit && isMobile) {
        // Auto-select first unit for mobile
        const defaultUnit = DOSAGE_UNITS_CODES[0];
        setSelectedUnit(defaultUnit);
        onChange({
          value: parseInt(value, 10),
          unit: defaultUnit,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) =>
        prev === -1
          ? 0
          : prev < DOSAGE_UNITS_CODES.length - 1
            ? prev + 1
            : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < DOSAGE_UNITS_CODES.length) {
        const unit = DOSAGE_UNITS_CODES[activeIndex];
        setSelectedUnit(unit);
        setOpen(false);
        setActiveIndex(-1);
        onChange({ value: parseInt(inputValue, 10), unit });
      }
    }
  };

  // Update internal state when props change
  React.useEffect(() => {
    setInputValue(quantity?.value?.toString() || "");
  }, [quantity?.value]);

  React.useEffect(() => {
    setSelectedUnit(quantity?.unit);
  }, [quantity?.unit]);

  // For the mobile view
  if (isMobile) {
    const selectUnit = (unit: (typeof DOSAGE_UNITS_CODES)[number]) => {
      setSelectedUnit(unit);
      setShowMobileUnits(false);
      if (inputValue && /^\d+$/.test(inputValue)) {
        onChange({
          value: parseInt(inputValue, 10),
          unit,
        });
      }
    };

    return (
      <div className="space-y-2 w-full">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn("w-full text-sm", selectedUnit && "pr-16")}
            disabled={disabled}
            autoFocus={autoFocus}
            onFocus={() => {
              // Show units when input is focused, regardless of whether a unit is selected
              if (!disabled) {
                setShowMobileUnits(true);
              }
            }}
          />
          {selectedUnit && (
            <button
              type="button"
              onClick={() => setShowMobileUnits(!showMobileUnits)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 focus:outline-none flex items-center gap-0.5"
              disabled={disabled}
            >
              <span>{selectedUnit.display}</span>
              <CareIcon icon="l-angle-down" className="ml-0.5" />
            </button>
          )}
        </div>

        {showMobileUnits && !disabled && (
          <div className="border rounded-md shadow-sm">
            <ScrollArea className="h-40">
              <div className="p-1">
                {DOSAGE_UNITS_CODES.map((unit) => (
                  <button
                    key={unit.code}
                    type="button"
                    className={cn(
                      "flex items-center w-full p-2 text-sm rounded-sm hover:bg-gray-100",
                      selectedUnit?.code === unit.code &&
                        "bg-gray-100 font-medium",
                    )}
                    onClick={() => selectUnit(unit)}
                  >
                    <span className="flex-1 text-left">{unit.display}</span>
                    {selectedUnit?.code === unit.code && (
                      <Check className="size-4" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  }

  // Standard popover view for desktop
  return (
    <div className="relative flex w-full lg:max-w-[200px] flex-col gap-1">
      <Popover open={!disabled && open && showDropdown} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn("w-full text-sm", selectedUnit && "pr-16")}
              disabled={disabled}
              autoFocus={autoFocus}
            />
            {selectedUnit && (
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                {selectedUnit.display}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {DOSAGE_UNITS_CODES.map((unit, index) => (
                  <CommandItem
                    key={unit.code}
                    value={unit.code}
                    onSelect={() => {
                      setSelectedUnit(unit);
                      setOpen(false);
                      setActiveIndex(-1);
                      inputRef.current?.focus();
                      onChange({ value: parseInt(inputValue, 10), unit });
                    }}
                    className={cn(
                      "flex items-center gap-2",
                      activeIndex === index && "bg-gray-100",
                    )}
                  >
                    <div>
                      {inputValue} {unit.display}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        selectedUnit?.code === unit.code
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ComboboxQuantityInput;
