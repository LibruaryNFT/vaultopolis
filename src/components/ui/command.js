import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "../../lib/utils";

export const Command = React.forwardRef(function Command(
  { className, ...props },
  ref
) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-lg bg-brand-primary text-brand-text",
        className
      )}
      {...props}
    />
  );
});

export const CommandInput = React.forwardRef(function CommandInput(
  { className, ...props },
  ref
) {
  return (
    <div className="flex items-center border-b border-brand-border px-2">
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex-1 bg-transparent py-2 text-xs placeholder:text-brand-text/50 focus:outline-none",
          className
        )}
        {...props}
      />
    </div>
  );
});

export function CommandList({ className, ...props }) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-64 overflow-auto text-sm text-brand-text", className)}
      {...props}
    />
  );
}

export const CommandEmpty = React.forwardRef(function CommandEmpty(
  props,
  ref
) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className="py-6 text-center text-xs text-brand-text/60"
      {...props}
    />
  );
});

export function CommandGroup({ className, ...props }) {
  return (
    <CommandPrimitive.Group
      className={cn("px-2 py-1 text-xs text-brand-text", className)}
      {...props}
    />
  );
}

export const CommandItem = React.forwardRef(function CommandItem(
  { className, ...props },
  ref
) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs text-brand-text",
        "aria-selected:bg-brand-secondary/60 aria-selected:text-brand-text",
        className
      )}
      {...props}
    />
  );
});

