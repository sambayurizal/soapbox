import React from 'react';
import { HotKeys as _HotKeys } from 'react-hotkeys';

type IHotKeys = React.ComponentProps<typeof _HotKeys>;

/**
 * Wrapper component around `react-hotkeys`.
 * `react-hotkeys` is a legacy component, so confining its import to one place is beneficial.
 */
const HotKeys = React.forwardRef<any, IHotKeys>(({ children, ...rest }, ref) => {
  return (
    <_HotKeys {...rest} ref={ref}>
      {children}
    </_HotKeys>
  );
});

export { HotKeys, type IHotKeys };