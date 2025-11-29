import { useMemo, useState } from "react";
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

function buildSummary(keys, formatOption, emptyMeansAll = false) {
  const { items, allSelected } = keys;
  // For filters, empty array means "All" (no filter applied)
  if (!items.length) return emptyMeansAll ? "All" : "None";
  if (allSelected) return "All";
  const [first, second, ...rest] = items;
  if (!second) return formatOption(first);
  const base = `${formatOption(first)}, ${formatOption(second)}`;
  return rest.length ? `${base} +${rest.length}` : base;
}

export default function MultiSelectFilterPopover({
  label,
  selectedValues = [],
  options = [],
  onChange,
  placeholder = "Search...",
  formatOption = (option) => option,
  getCount = null,
  align = "start",
  disabled = false,
  minSelection = 0,
  includeAllOption = true,
  emptyMeansAll = true, // New: when true, empty array displays as "All" instead of "None"
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedOptions = useMemo(
    () =>
      options.map((value) => ({
        key: String(value),
        value,
      })),
    [options]
  );

  const optionMap = useMemo(
    () =>
      normalizedOptions.reduce((acc, entry) => {
        acc[entry.key] = entry.value;
        return acc;
      }, {}),
    [normalizedOptions]
  );

  const normalizedSelected = useMemo(() => {
    const keys = selectedValues.map((value) => String(value));
    const unique = Array.from(new Set(keys)).filter(
      (key) => optionMap[key] !== undefined
    );
    
    // Check if all options are selected (allSelected)
    // Must match exactly - all options in normalizedOptions must be in unique
    const allSelected =
      normalizedOptions.length > 0 &&
      unique.length === normalizedOptions.length &&
      normalizedOptions.every(({ key }) => unique.includes(key));
    
    return {
      items: unique,
      allSelected,
    };
  }, [selectedValues, optionMap, normalizedOptions]);
  
  // Show "All" as selected if:
  // 1. All options (including hidden) are selected - user explicitly selected everything, OR
  // 2. Empty array with emptyMeansAll=true (empty means "All" for filters like Set/Team/Player/Parallel)
  // 
  // NOTE: We do NOT show "All" when only all visible options are selected, because:
  // - User may have explicitly selected specific values
  // - When filters are restrictive, only a few options are visible
  // - Showing "All" when user selected [2,3,4] is confusing
  const showAsAllSelected = normalizedSelected.allSelected || 
    (emptyMeansAll && normalizedSelected.items.length === 0 && normalizedOptions.length > 0);

  const filteredOptions = useMemo(() => {
    let opts = normalizedOptions;
    
    // Filter out options with 0 count (unless currently selected)
    if (getCount) {
      opts = opts.filter(({ key, value }) => {
        // Always show "All" option if includeAllOption is true
        if (includeAllOption && value === "All") return true;
        const count = getCount(value);
        const isSelected = normalizedSelected.items.includes(key);
        // Hide if count is 0 AND not selected
        if (count === 0 && !isSelected) return false;
        return true; // Show if selected (even at 0) or count > 0
      });
    }
    
    // Apply search filter
    if (query.trim()) {
      const lower = query.toLowerCase();
      opts = opts.filter(({ key, value }) =>
        formatOption(value).toLowerCase().includes(lower)
      );
    }
    
    return opts;
  }, [normalizedOptions, query, formatOption, getCount, normalizedSelected, includeAllOption]);

  const emit = (keys) => {
    const uniqueKeys = Array.from(new Set(keys));
    const restored = uniqueKeys
      .map((key) => optionMap[key] ?? key)
      .filter((v) => v !== undefined && v !== null && v !== ""); // Don't use filter(Boolean) as it filters out 0
    if (minSelection > 0 && restored.length < minSelection) {
      return;
    }
    onChange(restored);
  };

  const toggleValue = (key) => {
    // If "All" is effectively selected (all options or all visible options), start from empty
    const baseItems = showAsAllSelected
      ? []
      : [...normalizedSelected.items];
    const isSelected = baseItems.includes(key);
    if (isSelected) {
      const next = baseItems.filter((k) => k !== key);
      emit(next);
    } else {
      emit([...baseItems, key]);
    }
  };

  const handleSelectAll = () => {
    // Select all options from normalizedOptions (all available options, not just visible ones)
    // This ensures "All" truly means all series/options, even if some have 0 count
    emit(normalizedOptions.map(({ key }) => key));
  };

  const handleToggleAllOption = () => {
    // Always select all options when "All" is clicked
    // If all are already selected, clear selection (unless minSelection prevents it)
    if (showAsAllSelected) {
      if (minSelection > 0) return;
      emit([]);
    } else {
      // Select all options from normalizedOptions (all available options, not just visible ones)
      // This ensures "All" truly means all series/options, even if some have 0 count
      handleSelectAll();
    }
  };

  const handleClear = () => {
    if (minSelection > 0) return;
    emit([]);
  };

  // Use showAsAllSelected for summary display
  const summarySelected = {
    items: normalizedSelected.items,
    allSelected: showAsAllSelected,
  };
  
  const summary = buildSummary(
    summarySelected,
    (key) => formatOption(optionMap[key] ?? key),
    emptyMeansAll
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded border text-xs sm:text-sm px-3 py-1.5 transition-all",
            "bg-brand-secondary text-brand-text/80 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opolis",
            "flex-shrink-0 whitespace-nowrap",
            (showAsAllSelected || normalizedSelected.items.length > 0 || (emptyMeansAll && normalizedSelected.items.length === 0))
              ? "border-2 border-opolis"
              : "border-2 border-transparent",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="font-semibold">{label}:</span>
          <span
            className={cn(
              "truncate max-w-[140px] sm:max-w-[180px]",
              (showAsAllSelected || normalizedSelected.items.length > 0 || (emptyMeansAll && normalizedSelected.items.length === 0))
                ? "text-opolis"
                : "text-brand-text/80"
            )}
          >
            {summary}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-brand-text/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-80 p-0">
        <div className="flex flex-col gap-2 px-3 py-2 text-brand-text sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold">{label}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-opolis hover:opacity-80"
            >
              Select all
            </button>
            {normalizedSelected.items.length > minSelection && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  "text-opolis hover:opacity-80",
                  minSelection > 0 && "cursor-not-allowed opacity-50"
                )}
              >
                Clear
              </button>
            )}
          </div>
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
            <ScrollArea className="h-64 px-1">
              <CommandGroup heading="Options">
                {includeAllOption && (
                  <CommandItem
                    value="All"
                    onSelect={handleToggleAllOption}
                    className="flex items-center"
                  >
                    <Checkbox checked={showAsAllSelected} readOnly />
                    <span className="ml-2 flex-1 text-xs">All</span>
                    {getCount && (
                      <span className="text-[11px] text-brand-text/60">
                        ({getCount("All")})
                      </span>
                    )}
                  </CommandItem>
                )}
                {filteredOptions.map(({ key, value }) => {
                  const isSelected =
                    !showAsAllSelected &&
                    normalizedSelected.items.includes(key);
                  const count = getCount ? getCount(value) : null;
                  const hasZeroCount = count !== null && count === 0;
                  const isDisabled = isSelected && hasZeroCount;
                  return (
                    <CommandItem
                      key={key}
                      value={formatOption(value)}
                      onSelect={() => toggleValue(key)}
                      className={cn(
                        "flex items-center",
                        isDisabled && "opacity-50"
                      )}
                      title={isDisabled ? "No results due to current filters" : undefined}
                    >
                      <Checkbox checked={isSelected} readOnly />
                      <span className={cn("ml-2 flex-1 text-xs", isDisabled && "cursor-not-allowed")}>
                        {formatOption(value)}
                      </span>
                      {getCount && (
                        <span className="text-[11px] text-brand-text/60">
                          ({getCount(value)})
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

