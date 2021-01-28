import React from 'react';
import AppsListPage from 'UI/Display/Apps/AppList/AppsListPage';

const AppsList: React.FC = () => {
  return (
    <AppsListPage
      matchCount={0}
      onChangeFacets={(value, checked) => {
        console.log(value, checked);
      }}
      apps={[]}
      facetOptions={[]}
    />
  );
};

export default AppsList;
