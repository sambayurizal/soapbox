import React from 'react';

import PullToRefresh from './pull-to-refresh';

interface IPullable {
  children: JSX.Element,
}

/**
 * Pullable:
 * Basic "pull to refresh" without the refresh.
 * Just visual feedback.
 */
const Pullable: React.FC<IPullable> = ({ children }) =>(
  <PullToRefresh
    pullingContent={undefined}
    // @ts-ignore
    refreshingContent={null}
  >
    {children}
  </PullToRefresh>
);

export default Pullable;