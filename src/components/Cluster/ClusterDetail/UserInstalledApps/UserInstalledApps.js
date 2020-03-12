import PropTypes from 'prop-types';
import React, { useState } from 'react';

const UserInstalledApps = ({
  apps,
  error,
  onShowDetail,
  children,
  ...rest
}) => {
  const [iconErrors, setIconErrors] = useState({});

  const onImgError = e => {
    const imageUrl = e.target.src;
    const errors = Object.assign({}, iconErrors, {
      [imageUrl]: true,
    });

    setIconErrors(errors);
  };

  return (
    <div
      data-testid='installed-apps-section'
      id='installed-apps-section'
      {...rest}
    >
      <h3 className='table-label'>Installed Apps</h3>
      <div className='row'>
        {apps.length === 0 && !error && (
          <p className='well' data-testid='no-apps-found' id='no-apps-found'>
            <b>No apps installed on this cluster</b>
            <br />
            Browse the app catalog below and pick an app to install.
          </p>
        )}

        {error && (
          <p
            className='well'
            data-testid='error-loading-apps'
            id='error-loading-apps'
          >
            <b>Error Loading Apps:</b>
            <br />
            We had some trouble loading the list of apps you&apos;ve installed
            on this cluster. Please refresh the page to try again.
          </p>
        )}
        {apps.length > 0 && (
          <div data-testid='installed-apps' id='installed-apps'>
            {apps.map(app => {
              return (
                <div
                  className='installed-apps--app'
                  key={app.metadata.name}
                  onClick={() => onShowDetail(app.metadata.name)}
                >
                  <div className='details'>
                    {app.logoUrl && !iconErrors[app.logoUrl] && (
                      <img
                        alt={`${app.metadata.name} icon`}
                        height='36'
                        onError={onImgError}
                        src={app.logoUrl}
                        width='36'
                      />
                    )}
                    {app.metadata.name}
                    <small>Chart Version: {app.spec?.version ?? 'n/a'}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

UserInstalledApps.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object),
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onShowDetail: PropTypes.func,
  children: PropTypes.node,
};

export default UserInstalledApps;
