import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div(props => ({
  width: 'calc(25% - 15px)',
  flexShrink: '0',
  margin: '0 20px 20px 0',
  '&:nth-of-type(4n + 0)': {
    marginRight: '0px',
  },

  [`@media only screen and (max-width: ${props.theme.breakpoints.large})`]: {
    width: 'calc(33.333% - 13.333px)',
    // we are unsetting the 4n + 0 rule one above
    '&:nth-of-type(4n + 0)': {
      marginRight: '20px',
    },
    '&:nth-of-type(3n + 0)': {
      marginRight: '0px',
    },
  },

  [`@media only screen and (max-width: ${props.theme.breakpoints.small})`]: {
    width: '100%',
    marginRight: '0px',
  },
}));

const StyledLink = styled(Link)({
  display: 'block',
  border: '1px solid #2a5974',
  width: '100%',
  borderRadius: '4px',
  height: '158px',
  backgroundColor: '#2f556a',
  position: 'relative',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    zIndex: 10,
    boxShadow: '0px 0px 5px #549ac3',
    // [`${AppIcon}`]: {
    'div:nth-of-type(1)': {
      opacity: 1,
      boxShadow: '0px 0px 5px #549ac3',
    },
  },
});

const Badge = styled.div({
  backgroundColor: '#ef6d3b',
  whiteSpace: 'nowrap',
  position: 'absolute',
  padding: '5px 100px',
  minWidth: '300px',
  transform: 'rotate(-45deg) translate(-37%, 0)',
  color: 'white',
  textAlign: 'center',
  textTransform: 'uppercase',
  fontSize: '12px',
  top: '-60px',
  left: '-40px',
  boxSizing: 'border-box',
  zIndex: 20,
});

const AppIcon = styled.div({
  borderRadius: '4px 4px 0 0',
  height: '100px',
  textAlign: 'center',
  padding: '10px',
  display: 'flex',
  backgroundColor: '#fff',
  opacity: '0.9',
  justifyContent: 'center',
  alignItems: 'center',

  h3: {
    color: '#2e556a',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '300',
  },

  img: {
    maxHeight: '75px',
    maxWidth: '60%',
    margin: 'auto',
    verticalAlign: 'middle',
  },
});

const AppDetails = styled.div({
  padding: '10px',

  h3: {
    margin: '0px',
    fontSize: '16px',
    lineHeight: '1em',
    top: '0px',
    fontWeight: '700',
  },

  span: {
    fontSize: '14px',
  },
});

class AppContainer extends React.Component {
  render() {
    const {
      appVersions,
      catalog,
      searchQuery,
      iconErrors,
      imgError,
    } = this.props;
    const { icon, name, repoName, version } = appVersions[0];
    const to = `/apps/${catalog.metadata.name}/${appVersions[0].name}?q=${searchQuery}`;

    return (
      <Wrapper>
        <StyledLink to={to}>
          {repoName === 'managed' && <Badge>MANAGED</Badge> // This is always false. Is this ok?
          }
          <AppIcon>
            {icon && !iconErrors[icon] ? (
              <img src={icon} onError={imgError} />
            ) : (
              <h3>{name}</h3>
            )}
          </AppIcon>
          <AppDetails>
            <h3>{name}</h3>
            <span>{version}</span>
          </AppDetails>
        </StyledLink>
      </Wrapper>
    );
  }
}

AppContainer.propTypes = {
  appVersions: PropTypes.array,
  catalog: PropTypes.object,
  searchQuery: PropTypes.string,
  iconErrors: PropTypes.object,
  imgError: PropTypes.func,
};

export default AppContainer;
