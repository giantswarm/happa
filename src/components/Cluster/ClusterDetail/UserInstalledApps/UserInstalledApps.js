import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import BaseTransition from 'styles/transitions/BaseTransition';

import InstalledApp from './InstalledApp';

const InstalledAppsWrapper = styled.div`
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.shade6};
`;

const InstalledApps = styled.div`
  margin-bottom: 25px;
  p:last-child {
    margin: 0px;
  }

  .app-enter,
  .app-appear {
    opacity: 0.01;
    transform: translate3d(-20px, 0, 0);
  }
  .app-enter.app-enter-active,
  .app-appear.app-appear-active {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: 0.5s cubic-bezier(1, 0, 0, 1);
  }
  .app-exit {
    opacity: 1;
  }
  .app-exit.app-exit-active {
    opacity: 0.01;
    transform: translate3d(-20px, 0, 0);
    transition: 0.4s cubic-bezier(1, 0, 0, 1);
  }
`;

const UserInstalledApps = ({
  apps,
  error,
  onShowDetail,
  children,
  ...rest
}) => {
  const [iconErrors, setIconErrors] = useState({});

  const onIconError = e => {
    const imageUrl = e.target.src;
    const errors = Object.assign({}, iconErrors, {
      [imageUrl]: true,
    });

    setIconErrors(errors);
  };

  return (
    <InstalledAppsWrapper data-testid='installed-apps-section' {...rest}>
      <h3 className='table-label'>Installed Apps</h3>
      <div className='row'>
        {error && (
          <p className='well' data-testid='error-loading-apps'>
            <b>Error Loading Apps:</b>
            <br />
            We had some trouble loading the list of apps you&apos;ve installed
            on this cluster. Please refresh the page to try again.
          </p>
        )}

        {apps.length === 0 && !error && (
          <p className='well' data-testid='no-apps-found' id='no-apps-found'>
            <b>No apps installed on this cluster</b>
            <br />
            Browse the app catalog below and pick an app to install.
          </p>
        )}

        {apps.length > 0 && (
          <InstalledApps data-testid='installed-apps'>
            <TransitionGroup>
              {apps.map(app => {
                return (
                  <BaseTransition
                    key={app.metadata.name}
                    appear={true}
                    exit={true}
                    timeout={{ enter: 500, appear: 500, exit: 500 }}
                    classNames='app'
                  >
                    <InstalledApp
                      app={app}
                      onIconError={onIconError}
                      onClick={() => onShowDetail(app.metadata.name)}
                    />
                  </BaseTransition>
                );
              })}
            </TransitionGroup>
          </InstalledApps>
        )}

        {children}
      </div>
    </InstalledAppsWrapper>
  );
};

UserInstalledApps.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object),
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onShowDetail: PropTypes.func,
  children: PropTypes.node,
};

export default UserInstalledApps;
