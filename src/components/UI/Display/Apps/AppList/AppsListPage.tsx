import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import App, { IAppProps } from 'UI/Display/Apps/AppList/App';
import Facets, { IFacetOption } from 'UI/Inputs/Facets';

import Toolbar from './Toolbar';

const Wrapper = styled.div``;

const ListAndFacets = styled.div`
  display: flex;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
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
  facetOptions: IFacetOption[];
  apps: IAppProps[];
}

const AppsList: React.FC<IAppsListPageProps> = (props) => {
  return (
    <Wrapper>
      <h1 data-testid='apps-browser'>Apps</h1>
      <p>
        Managed apps for use in your clusters. Learn more in our{' '}
        <a
          target='_blank'
          rel='noopener noreferrer'
          href='https://docs.giantswarm.io/basics/app-platform/'
        >
          app platform documentation
          <i className='fa fa-open-in-new' />
        </a>
      </p>
      <hr />
      <Toolbar matchCount={props.matchCount} />
      <ListAndFacets>
        <Facets onChange={props.onChangeFacets} options={props.facetOptions} />

        {!props.apps && <EmptyState />}

        {props.apps && props.apps.length === 0 && (
          <EmptyState>
            <div>
              <h3>No apps found for your search</h3>
              <p>
                Please check your search term or check more catalogs to show
                apps from
              </p>
              <Button bsStyle='default'>RESET SEARCH</Button>
            </div>
          </EmptyState>
        )}

        {props.apps && props.apps.length > 0 && (
          <List>
            {props.apps.map((app) => (
              <App
                key={app.name}
                name={app.name}
                catalogName={app.catalogName}
                catalogIconUrl=''
                to='/apps/catalogName/appName/v1.2.3/'
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
  facetOptions: PropTypes.array.isRequired,
  apps: PropTypes.array.isRequired,
};

export default AppsList;
