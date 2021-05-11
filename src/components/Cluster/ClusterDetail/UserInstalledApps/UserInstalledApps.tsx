import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
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
    transform: translate3d(-50px, 0, 0);
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
    transform: translate3d(-50px, 0, 0);
    transition: 0.4s cubic-bezier(1, 0, 0, 1);
  }
`;

interface IUserInstalledApp {
  name: string;
  version: string;
  logoUrl?: string;
  deletionTimestamp?: string;
}

interface IUserInstalledAppsProps extends React.PropsWithChildren<{}> {
  apps: IUserInstalledApp[];
  error: string | null;
  onShowDetail: (appName: string) => void;
}

const UserInstalledApps: React.FC<IUserInstalledAppsProps> = ({
  apps,
  error,
  onShowDetail,
  children,
  ...rest
}) => {
  const [iconErrors, setIconErrors] = useState({});

  const onIconError = (e: React.BaseSyntheticEvent) => {
    const imageUrl = e.target.src;
    const errors = Object.assign({}, iconErrors, {
      [imageUrl]: true,
    });

    setIconErrors(errors);
  };

  return (
    <InstalledAppsWrapper {...rest}>
      <h3 className='table-label'>Installed Apps</h3>
      <>
        {error && (
          <p className='well'>
            <b>Error Loading Apps:</b>
            <br />
            We had some trouble loading the list of apps you&apos;ve installed
            on this cluster. Please refresh the page to try again.
          </p>
        )}

        {apps.length === 0 && !error && (
          <p className='well'>
            <b>No apps installed on this cluster</b>
            <br />
            Browse the App Catalogs to find any apps to install.
          </p>
        )}

        {apps.length > 0 && (
          <InstalledApps aria-label='Apps installed by user'>
            <TransitionGroup>
              {apps.map((app) => {
                return (
                  <BaseTransition
                    in={false}
                    key={app.name}
                    appear={true}
                    exit={true}
                    timeout={{ enter: 500, appear: 500, exit: 500 }}
                    classNames='app'
                  >
                    <InstalledApp
                      name={app.name}
                      version={app.version}
                      deletionTimestamp={app.deletionTimestamp}
                      iconErrors={iconErrors}
                      onIconError={onIconError}
                      onClick={() => onShowDetail(app.name)}
                    />
                  </BaseTransition>
                );
              })}
            </TransitionGroup>
          </InstalledApps>
        )}

        {children}
      </>
    </InstalledAppsWrapper>
  );
};

UserInstalledApps.propTypes = {
  apps: PropTypes.arrayOf(
    PropTypes.object as PropTypes.Validator<IUserInstalledApp>
  ).isRequired,
  onShowDetail: PropTypes.func.isRequired,
  error: PropTypes.string,
  children: PropTypes.node,
};

export default UserInstalledApps;
