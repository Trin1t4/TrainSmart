import * as React from 'react';

/**
 * Nasconde visivamente il contenuto ma lo mantiene accessibile
 * per screen reader. Usare per ARIA labels su icon buttons.
 */
export function VisuallyHidden({
  children,
  asChild = false,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ style?: React.CSSProperties }>, { style });
  }

  return <span style={style}>{children}</span>;
}
