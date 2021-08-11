import { replace } from 'connected-react-router';
import { Tabs as GromTabs } from 'grommet';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';

interface ITabsProps extends React.ComponentPropsWithoutRef<typeof GromTabs> {
  useRoutes?: boolean;
}

const Tabs: React.FC<ITabsProps> = ({
  children,
  useRoutes,
  activeIndex: controlledActiveIndex,
  ...props
}) => {
  const dispatch = useDispatch();
  const { pathname: currentPath } = useLocation();

  const [activeIndex, setActiveIndex] = useState(controlledActiveIndex);

  const handleTabChange = useCallback(
    (index: number) => {
      setActiveIndex(index);

      if (!useRoutes) return;

      const tabs = React.Children.toArray(children);
      const currentTab = tabs[index] as React.ReactElement;
      const desiredPath = currentTab?.props?.path;

      // No need to replace the history if we're already on the path we want to be at.
      if (typeof desiredPath === 'undefined' || currentPath === desiredPath) {
        return;
      }

      dispatch(replace(desiredPath));
    },
    [children, currentPath, useRoutes, dispatch]
  );

  const goToTabByPath = useCallback(
    (path: string) => {
      if (!useRoutes) return;

      const tabs = React.Children.toArray(children);
      const desiredIndex = tabs.findIndex(
        (tab) => (tab as React.ReactElement).props?.path === path
      );

      setActiveIndex(desiredIndex);
    },
    [children, useRoutes]
  );

  useEffect(() => {
    if (typeof controlledActiveIndex === 'number') {
      handleTabChange(controlledActiveIndex);
    }
  }, [controlledActiveIndex, handleTabChange]);

  useEffect(() => {
    goToTabByPath(currentPath);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToTabByPath]);

  return (
    <GromTabs
      activeIndex={activeIndex}
      onActive={handleTabChange}
      justify='start'
      {...props}
    >
      {children}
    </GromTabs>
  );
};

Tabs.propTypes = {
  children: PropTypes.node,
  activeIndex: PropTypes.number,
  useRoutes: PropTypes.bool,
};

Tabs.defaultProps = {
  useRoutes: false,
};

export default Tabs;
