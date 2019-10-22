import AppContainer from 'UI/app_container';
import PropTypes from 'prop-types';
import React from 'react';

const AppListItems = props => {
  const { apps, searchQuery } = props;

  if (apps.length === 0) {
    return (
      <div className='emptystate'>
        No apps matched your search query: &quot;{searchQuery}&quot;
      </div>
    );
  }

  return apps.map(appVersions => {
    const key = `${appVersions[0].repoName}/${appVersions[0].name}`;

    return (
      <AppContainer
        key={key}
        appVersions={appVersions}
        catalog={props.catalog}
        iconErrors={props.iconErrors}
        imgError={props.onImgError}
        ref={ref => props.registerRef(appVersions[0].name, ref)}
        searchQuery={searchQuery}
      />
    );
  });
};

AppListItems.propTypes = {
  apps: PropTypes.array,
  iconErrors: PropTypes.object,
  catalog: PropTypes.object,
  searchQuery: PropTypes.string,
  onImgError: PropTypes.func,
  registerRef: PropTypes.func,
};

export default AppListItems;
