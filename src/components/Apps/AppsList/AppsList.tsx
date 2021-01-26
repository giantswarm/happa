import React from 'react';
import styled from 'styled-components';
import App from 'UI/Display/Apps/AppList/App';
import Facets from 'UI/Inputs/Facets';

import Toolbar from './Toolbar';

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

const Icon = styled.img`
  width: 20px;
  margin-right: 6px;
`;

const CatalogType = styled.span`
  background-color: #8dc163;
  font-size: 10px;
  font-weight: 700;
  padding: 0px 6px;
  border-radius: 3px;
  margin-left: 8px;
  color: #222;
`;

const AppsList: React.FC = () => {
  return (
    <div>
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
      <Toolbar matchCount={10} />
      <ListAndFacets>
        <Facets
          onChange={(value, checked) => {
            console.log(value, checked);
          }}
          options={[
            {
              value: 'giantswarm',
              label: (
                <>
                  <Icon src='/images/repo_icons/managed.png' />
                  Giant Swarm <CatalogType>MANAGED</CatalogType>
                </>
              ),
              checked: true,
            },
            {
              value: 'giantswarm-playground',
              label: (
                <>
                  <Icon src='/images/repo_icons/incubator.png' />
                  Giant Swarm Playground
                </>
              ),
              checked: false,
            },
            {
              value: 'helm-stable',
              label: (
                <>
                  <Icon src='/images/repo_icons/community.png' />
                  Helm Stable
                </>
              ),
              checked: false,
            },
          ]}
        />
        <List>
          {[
            'g8s-prometheus',
            'apm-server',
            'elastabot',
            'elastic-stack',
            'elasticsearch-curator',
            'fluentd',
            'prometheus-mongodb-exporter',
            'prometheus-pushgateway',
            'prometheus-postgres-exporter',
          ].map((name) => (
            <App
              key={name}
              name={name}
              catalog='Giant Swarm Control Plane'
              to='https://google.com'
            />
          ))}
        </List>
      </ListAndFacets>
    </div>
  );
};

export default AppsList;
