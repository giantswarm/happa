import styled from '@emotion/styled';
import React from 'react';
import App from 'UI/AppList/App';

const ListAndFacets = styled.div`
  display: flex;
`;

const Facets = styled.div`
  width: 230px;
  flex-shrink: 0;
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 20px;
  border-left: 1px solid ${({ theme }) => theme.colors.darkBlueLighter1};
  width: 100%;
  padding-left: 20px;
`;
const ONE_HUNDRED = 100;

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

      <ListAndFacets>
        <Facets />
        <List>
          {Array(ONE_HUNDRED)
            .fill(1)
            .map((i) => (
              <App
                key={i}
                name='g8s-prometheus'
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
