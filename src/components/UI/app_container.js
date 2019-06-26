import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';


const AppContainer = props => {
  const { appVersions, catalog, searchQuery, iconErrors, imgError } = props;

  return (
    <div
      className='app-container'
    >
      <Link
        className='app'
        to={
          '/apps/' +
          catalog.metadata.name +
          '/' +
          appVersions[0].name +
          '?q=' +
          searchQuery
        }
      >
        {appVersions[0].repoName === 'managed' ? (
          <div className='badge'>MANAGED</div>
        ) : (
            undefined
          )}

        <div className='app-icon'>
          {appVersions[0].icon &&
            !iconErrors[
            appVersions[0].icon
            ] ? (
              <img
                src={appVersions[0].icon}
                onError={imgError}
              />
            ) : (
              <h3>{appVersions[0].name}</h3>
            )}
        </div>
        <div className='app-details'>
          <h3>{appVersions[0].name}</h3>
          <span className='app-version'>
            {appVersions[0].version}
          </span>
        </div>
      </Link>
    </div>
  );
};

AppContainer.propTypes = {
  appVersions: PropTypes.array,
  catalog: PropTypes.obj,
  searchQuery: PropTypes.string,
  iconErrors: PropTypes.obj,
  imgError: PropTypes.fn,
};

export default AppContainer;