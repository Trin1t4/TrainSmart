import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Snap points: array di percentuali es. [0.25, 0.5, 0.9] */
  snapPoints?: (number | string)[];
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  snapPoints,
}: BottomSheetProps) {
  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <DrawerPrimitive.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-slate-900 rounded-t-2xl border-t border-slate-700',
            'flex flex-col max-h-[96vh]',
            'focus:outline-none'
          )}
        >
          {/* Handle bar */}
          <div className="mx-auto mt-4 mb-2 h-1.5 w-12 rounded-full bg-slate-600" />

          {/* Header */}
          {(title || description) && (
            <div className="px-6 pb-4 border-b border-slate-800">
              {title && (
                <DrawerPrimitive.Title className="text-lg font-semibold text-white">
                  {title}
                </DrawerPrimitive.Title>
              )}
              {description && (
                <DrawerPrimitive.Description className="text-sm text-slate-400 mt-1">
                  {description}
                </DrawerPrimitive.Description>
              )}
            </div>
          )}

          {/* Content - scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
            {children}
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-safe-area-inset-bottom" />
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}

// Trigger component per aprire il bottom sheet
export function BottomSheetTrigger({ children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger {...props}>{children}</DrawerPrimitive.Trigger>;
}

// Footer per azioni nel bottom sheet
export function BottomSheetFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      'sticky bottom-0 px-6 py-4 bg-slate-900 border-t border-slate-800',
      'flex gap-3',
      className
    )}>
      {children}
    </div>
  );
}
