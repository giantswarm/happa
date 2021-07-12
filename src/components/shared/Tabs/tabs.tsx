import { Tabs as GromTabs } from 'grommet';
import PropTypes from 'prop-types';
import React, { ReactNode, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import styled from 'styled-components';

const ActiveTabWrapper = styled('div')`
  border: 1px solid #fff;
  border-bottom: 2px solid ${({ theme }) => theme.colors.darkBlue};
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  position: relative;
  top: 1px;
`;

interface ITabsProps extends React.ComponentPropsWithoutRef<typeof GromTabs> {
  defaultActiveIndex: number;
  controlledActiveIndex?: number;
  children: ReactNode;
  useRoutes?: boolean;

  // This is to override the background color that the tab
  // is intended to be shown on. It is used primarily in the getting started guide
  // where the tabs need to be on top of a lighter background.
  backgroundColor?: string;
}

const Tabs: React.FC<ITabsProps> = ({
  defaultActiveIndex,
  controlledActiveIndex,
  children,
  backgroundColor,
  useRoutes,
  ...props
}) => {
  const history = useHistory();
  const { pathname: currentPath } = useLocation();

  const [activeIndex, setActiveIndex] = useState(
    controlledActiveIndex || defaultActiveIndex
  );

  const handleTabChange = (index: number) => {
    // Set the active index so the grommet tab updates to the right page.
    setActiveIndex(index);

    // Determine if we are using routes and need to set the path.
    if (!useRoutes) return;

    // A bit of type narrowing / hinting to satisfy the compiler.
    const tabs = React.Children.toArray(children);
    const currentTab = tabs[index] as React.ReactElement;
    const desiredPath = currentTab.props.path;

    // No need to replace the history if we're already on the path we want to be at.
    if (currentPath === desiredPath) return;

    // Replace the path to the desiredPath.
    history.replace(desiredPath);
  };

  const goToTabByPath = (path: string) => {
    // If we are not usingRoutes then skip.
    if (!useRoutes) return;

    // A bit of type narrowing / hinting to satisfy the compiler.
    const tabs = React.Children.toArray(children);

    let desiredIndex = 0;

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i] as React.ReactElement;

      if (tab.props.path === path) {
        desiredIndex = i;
      }
    }

    setActiveIndex(desiredIndex);
  };

  useEffect(() => {
    if (typeof controlledActiveIndex === 'number') {
      handleTabChange(controlledActiveIndex);
    }
  }, [controlledActiveIndex]);

  useEffect(() => {
    goToTabByPath(currentPath);
  }, []);

  return (
    <GromTabs
      activeIndex={activeIndex}
      onActive={handleTabChange as never}
      id='tabs'
      justify='start'
      {...props}
    >
      {React.Children.map(children, (Tab, i) => {
        if (React.isValidElement(Tab)) {
          if (i === activeIndex) {
            return (
              <ActiveTabWrapper
                style={{ borderBottom: `1px solid ${backgroundColor}` }}
              >
                {React.cloneElement(Tab, { plain: true })}
              </ActiveTabWrapper>
            );
          }

          return React.cloneElement(Tab, { plain: true });
        }

        return null;
      })}
    </GromTabs>
  );
};

Tabs.propTypes = {
  children: PropTypes.node,
  defaultActiveIndex: PropTypes.number.isRequired,
  controlledActiveIndex: PropTypes.number,
  useRoutes: PropTypes.bool,
  backgroundColor: PropTypes.string,
};

Tabs.defaultProps = {
  useRoutes: false,
};

export default Tabs;
