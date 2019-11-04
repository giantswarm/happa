import { Link } from 'react-router-dom';
import LazyLoadedImage from '../shared/LazyLoadedImage';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

export const APP_CONTAINER_HEIGHT = 180;
export const APP_CONTAINER_IMAGE_HEIGHT = 100;

const Wrapper = styled.div`
  padding: 10px;
`;

const StyledLink = styled(Link)`
  display: block;
  border: 1px solid #2a5974;
  width: 100%;
  border-radius: 4px;
  height: 100%;
  background-color: #2f556a;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  &:hover {
    z-index: 10;
    box-shadow: 0px 0px 5px #549ac3;
    div:nth-of-type(1) {
      opacity: 1;
      box-shadow: 0px 0px 5px #549ac3;
    }
  }
`;

const Badge = styled.div`
  background-color: #ef6d3b;
  white-space: nowrap;
  position: absolute;
  padding: 5px 100px;
  min-width: 300px;
  transform: rotate(-45deg) translate(-37%, 0);
  color: white;
  text-align: center;
  text-transform: uppercase;
  font-size: 12px;
  top: -60px;
  left: -40px;
  box-sizing: border-box;
  z-index: 20;
`;

const AppIcon = styled.div`
  border-radius: 4px 4px 0 0;
  height: ${APP_CONTAINER_IMAGE_HEIGHT}px;
  text-align: center;
  padding: 10px;
  display: flex;
  background-color: #fff;
  opacity: 0.9;
  justify-content: center;
  align-items: center;

  h3 {
    color: #2e556a;
    text-align: center;
    font-size: 20px;
    font-weight: 300;
  }

  img {
    max-height: 75px;
    max-width: 60%;
    margin: auto;
    vertical-align: middle;
  }
`;

const AppDetails = styled.div`
  padding: 10px;
  height: ${APP_CONTAINER_HEIGHT - APP_CONTAINER_IMAGE_HEIGHT}px;

  h3 {
    margin: 0px;
    font-size: 16px;
    line-height: 1em;
    top: 0px;
    font-weight: 700;
  }

  span {
    display: block;
    font-size: 14px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const AppContainer = React.forwardRef(
  (
    {
      appVersions,
      catalog,
      searchQuery,
      iconErrors,
      imgError
    },
    ref
  ) => {
    const { icon, name, repoName, version } = appVersions[0];
    const to = `/app-catalogs/${catalog.metadata.name}/${appVersions[0].name}?q=${searchQuery}`;

    return (
      <Wrapper ref={ref}>
        <StyledLink to={to}>
          {repoName === 'managed' && <Badge>MANAGED</Badge>}
          <AppIcon>
            {
              icon && !iconErrors[icon]
                ? (
                  <LazyLoadedImage src={icon} alt={name} onError={imgError} />
                ) : (
                  <h3>{name}</h3>
                )
            }
          </AppIcon>
          <AppDetails>
            <h3>{name}</h3>
            <span>{version}</span>
          </AppDetails>
        </StyledLink>
      </Wrapper>
    );
  }
);

// Needed because `AppContainer` loses its name when using `forwardRef()`
AppContainer.displayName = 'AppContainer';

AppContainer.propTypes = {
  appVersions: PropTypes.array,
  catalog: PropTypes.object,
  searchQuery: PropTypes.string,
  iconErrors: PropTypes.object,
  imgError: PropTypes.func,
};

export default AppContainer;
