import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  align = "start",
  side = "bottom",
  sideOffset = 8,
  ...props
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-lg border border-brand-border/60 bg-brand-primary shadow-lg outline-none",
          "focus-visible:ring-2 focus-visible:ring-opolis focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

