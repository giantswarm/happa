import { appPlatformURL } from 'lib/docs';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import App, { IAppProps } from 'UI/Display/Apps/AppList/App';
import Facets, { IFacetOption } from 'UI/Inputs/Facets';

import AppListAppLoadingPlaceholder from './AppListAppLoadingPlaceholder';
import Toolbar from './Toolbar';

const LOADING_COMPONENTS = new Array(9).fill(0);

const Wrapper = styled.div``;

const ListAndFacets = styled.div`
  display: flex;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  grid-auto-rows: max-content;
  gap: 20px;
  border-left: 1px solid ${({ theme }) => theme.colors.darkBlueLighter1};
  width: 100%;
  padding-left: 20px;
`;

const EmptyState = styled.div`
  display: flex;
  text-align: center;
  width: 100%;
  height: 300px;
  border-left: 1px solid ${({ theme }) => theme.colors.darkBlueLighter1};
  align-items: center;
  justify-content: center;

  h3 {
    font-size: 18px;
    margin-bottom: 0px;
    font-weight: 400;
  }
`;

export interface IAppsListPageProps {
  matchCount: number;
  onChangeFacets: (value: string, checked: boolean) => void;
  onChangeSearchQuery: (value: string) => void;
  onChangeSortOrder: (value: string) => void;
  onResetSearch: () => void;
  facetOptions: IFacetOption[];
  searchQuery: string;
  sortOrder: string;
  apps: IAppProps[];
  facetsIsLoading?: boolean;
  appsIsLoading?: boolean;
}

const AppsList: React.FC<IAppsListPageProps> = (props) => {
  return (
    <Wrapper>
      <h1 data-testid='apps-browser'>Apps</h1>
      <p>
        Managed apps for use in your clusters. Learn more in our{' '}
        <a target='_blank' rel='noopener noreferrer' href={appPlatformURL}>
          app platform documentation
          <i className='fa fa-open-in-new' />
        </a>
      </p>
      <hr />
      <Toolbar
        onChangeSearchQuery={props.onChangeSearchQuery}
        searchQuery={props.searchQuery}
        matchCount={props.matchCount}
        onChangeSortOrder={props.onChangeSortOrder}
        sortOrder={props.sortOrder}
        isLoading={props.appsIsLoading}
      />
      <ListAndFacets>
        <Facets
          onChange={props.onChangeFacets}
          options={props.facetOptions}
          isLoading={props.facetsIsLoading}
        />

        {props.appsIsLoading && (
          <List>
            {LOADING_COMPONENTS.map((_, i) => (
              <AppListAppLoadingPlaceholder key={i} />
            ))}
          </List>
        )}

        {!props.appsIsLoading && props.apps.length === 0 && (
          <EmptyState>
            <div>
              <h3>No apps found for your search</h3>
              <p>
                Please check your search term or check more catalogs to show
                apps from
              </p>
              <Button bsStyle='default' onClick={props.onResetSearch}>
                Reset search
              </Button>
            </div>
          </EmptyState>
        )}

        {!props.appsIsLoading && props.apps.length > 0 && (
          <List>
            {props.apps.map((app, i) => (
              <App
                key={app.name + i.toString()}
                name={app.name}
                appIconURL={app.appIconURL}
                catalogTitle={app.catalogTitle}
                catalogIconUrl={app.catalogIconUrl}
                to={app.to}
              />
            ))}
          </List>
        )}
      </ListAndFacets>
    </Wrapper>
  );
};

AppsList.propTypes = {
  matchCount: PropTypes.number.isRequired,
  onChangeFacets: PropTypes.func.isRequired,
  onChangeSearchQuery: PropTypes.func.isRequired,
  onChangeSortOrder: PropTypes.func.isRequired,
  onResetSearch: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  facetOptions: PropTypes.array.isRequired,
  searchQuery: PropTypes.string.isRequired,
  apps: PropTypes.array.isRequired,
  appsIsLoading: PropTypes.bool,
  facetsIsLoading: PropTypes.bool,
};

export default AppsList;
