import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./ui/command";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";

export default function FilterPopover({
  label,
  selectedValue = "All",
  onChange,
  options = [],
  placeholder = "Search...",
  formatOption = (option) => option,
  getCount = null,
  align = "start",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedOptions = useMemo(
    () => options.map((opt) => String(opt)),
    [options]
  );
  const normalizedSelected =
    selectedValue === null || selectedValue === undefined
      ? "All"
      : String(selectedValue);

  const filteredOptions = useMemo(() => {
    let opts = normalizedOptions;
    
    // Filter out options with 0 count (unless currently selected)
    if (getCount) {
      opts = opts.filter((opt) => {
        // Always show "All" option
        if (opt === "All") return true;
        const count = getCount(opt);
        const isSelected = opt === normalizedSelected;
        // Hide if count is 0 AND not selected
        if (count === 0 && !isSelected) return false;
        return true; // Show if selected (even at 0) or count > 0
      });
    }
    
    // Apply search filter
    if (query.trim()) {
      const lower = query.toLowerCase();
      opts = opts.filter((opt) =>
        formatOption(opt).toLowerCase().includes(lower)
      );
    }
    
    return opts;
  }, [normalizedOptions, query, formatOption, getCount, normalizedSelected]);

  const handleSelect = (value) => {
    if (disabled) return;
    onChange(value);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("All");
  };

  const summary =
    normalizedSelected === "All" ? "All" : formatOption(normalizedSelected);
  const isAllSelected = normalizedSelected === "All";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border text-xs sm:text-sm px-3 py-1.5 transition-all shadow-sm",
            "bg-brand-secondary text-brand-text hover:border-opolis focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opolis",
            "flex-shrink-0 whitespace-nowrap",
            isAllSelected ? "border-2 border-opolis" : (normalizedSelected !== "All" ? "border-2 border-opolis" : "border border-brand-border"),
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="font-semibold">{label}:</span>
          <span
            className={cn(
              "truncate max-w-[120px] sm:max-w-[160px]",
              (isAllSelected || normalizedSelected !== "All") ? "text-opolis" : "text-brand-text/80"
            )}
          >
            {summary}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-brand-text/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 p-0">
        <div className="flex items-center justify-between px-3 py-2 text-brand-text">
          <p className="text-xs font-semibold">{label}</p>
          {normalizedSelected !== "All" && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-opolis hover:opacity-80"
            >
              Clear
            </button>
          )}
        </div>
        <Separator />
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            className="text-brand-text"
          />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <ScrollArea className="h-60 px-1">
              <CommandGroup heading="Options">
                <CommandItem
                  value="All"
                  onSelect={() => handleSelect("All")}
                  className="flex items-center"
                >
                  <Checkbox checked={normalizedSelected === "All"} readOnly />
                  <span className="ml-2 flex-1 text-xs">All</span>
                  {getCount && (
                    <span className="text-[11px] text-brand-text/60">
                      ({getCount("All")})
                    </span>
                  )}
                </CommandItem>
                {filteredOptions.map((option) => {
                  const key = option;
                  const isSelected = normalizedSelected === option;
                  const count = getCount ? getCount(option) : null;
                  const hasZeroCount = count !== null && count === 0;
                  const isDisabled = isSelected && hasZeroCount;
                  return (
                    <CommandItem
                      key={key}
                      value={formatOption(option)}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        "flex items-center",
                        isDisabled && "opacity-50"
                      )}
                      title={isDisabled ? "No results due to current filters" : undefined}
                    >
                      <Checkbox checked={isSelected} readOnly />
                      <span className={cn("ml-2 flex-1 text-xs", isDisabled && "cursor-not-allowed")}>
                        {formatOption(option)}
                      </span>
                      {getCount && (
                        <span className="text-[11px] text-brand-text/60">
                          ({getCount(option)})
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

