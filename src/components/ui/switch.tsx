import * as React from "react";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="checkbox"
    className={cn(
      "h-6 w-11 rounded-full bg-gray-200 checked:bg-blue-500 cursor-pointer",
      className,
    )}
    {...props}
    ref={ref}
  />
));
Switch.displayName = "Switch";

export { Switch };
