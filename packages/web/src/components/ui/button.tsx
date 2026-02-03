import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - NOTA: min-h-[48px] per touch target WCAG
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg
   text-sm font-medium transition-all duration-200
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   min-h-[48px] min-w-[48px]
   active:scale-[0.98]`,
  {
    variants: {
      variant: {
        // Azione primaria (workout start, CTA)
        primary: `
          bg-gradient-to-r from-emerald-500 to-emerald-600
          hover:from-emerald-600 hover:to-emerald-700
          text-white
          shadow-lg shadow-emerald-500/25
          hover:shadow-emerald-500/40
        `,
        // Azione secondaria
        secondary: `
          bg-slate-800 hover:bg-slate-700
          text-slate-100
          border border-slate-700
        `,
        // Azione distruttiva
        destructive: `
          bg-gradient-to-r from-red-500 to-red-600
          hover:from-red-600 hover:to-red-700
          text-white
          shadow-lg shadow-red-500/25
        `,
        // Outline (meno enfasi)
        outline: `
          border-2 border-slate-600
          bg-transparent
          hover:bg-slate-800
          text-slate-200
        `,
        // Ghost (minima enfasi)
        ghost: `
          hover:bg-slate-800
          text-slate-400
          hover:text-slate-200
        `,
        // Link style
        link: `
          text-emerald-400
          underline-offset-4
          hover:underline
          min-h-0
        `,
        // Running/Cardio
        cardio: `
          bg-gradient-to-r from-teal-500 to-teal-600
          hover:from-teal-600 hover:to-teal-700
          text-white
          shadow-lg shadow-teal-500/25
        `,
        // Warning (deload, attenzione)
        warning: `
          bg-gradient-to-r from-amber-500 to-orange-500
          hover:from-amber-600 hover:to-orange-600
          text-white
          shadow-lg shadow-amber-500/25
        `,
        // Backward compat: default maps to primary
        default: `
          bg-gradient-to-r from-emerald-500 to-emerald-600
          hover:from-emerald-600 hover:to-emerald-700
          text-white
          shadow-lg shadow-emerald-500/25
        `,
      },
      size: {
        sm: 'h-10 px-3 text-xs',
        md: 'h-12 px-4 text-sm',
        lg: 'h-14 px-6 text-base',
        xl: 'h-16 px-8 text-lg',
        icon: 'h-12 w-12 p-0', // Square, touch-friendly
        // Backward compat
        default: 'h-12 px-4 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
