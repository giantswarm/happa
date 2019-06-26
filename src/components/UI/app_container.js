import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div(props => ({
  width: 'calc(25% - 15px)',
  flexShrink: '0',
  margin: '0 20px 20px 0',
  '&:nth-of-type(4n + 0)': {
    marginRight: '0px'
  },

  [`@media only screen and (max-width: ${props.theme.breakpoints.large})`]: {
    width: 'calc(33.333% - 13.333px)',
    '&:nth-of-type(4n + 0)': { // we are unsetting the 4n + 0 rule one above
      marginRight: '20px'
    },
    '&:nth-of-type(3n + 0)': {
      marginRight: '0px'
    }
  },

  [`@media only screen and (max-width: ${props.theme.breakpoints.small})`]: {
    width: '100%',
    marginRight: '0px'
  }
}));

const AppContainer = props => {
  const { appVersions, catalog, searchQuery, iconErrors, imgError } = props;
  const to = `/apps/${catalog.metadata.name}/${appVersions[0].name}?q=${searchQuery}`;

  return (
    <Wrapper>
      <Link className='app' to={to}>
        {appVersions[0].repoName === 'managed' && ( // This is always false. Is this ok?
          <div className='badge'>MANAGED</div>
        )}
        <div className='app-icon'>
          {appVersions[0].icon && !iconErrors[appVersions[0].icon] ? (
            <img src={appVersions[0].icon} onError={imgError} />
          ) : (
              <h3>{appVersions[0].name}</h3>
            )}
        </div>
        <div className='app-details'>
          <h3>{appVersions[0].name}</h3>
          <span className='app-version'>{appVersions[0].version}</span>
        </div>
      </Link>
    </Wrapper>
  );
};

AppContainer.propTypes = {
  appVersions: PropTypes.array,
  catalog: PropTypes.object,
  searchQuery: PropTypes.string,
  iconErrors: PropTypes.object,
  imgError: PropTypes.func,
};

export default AppContainer;
