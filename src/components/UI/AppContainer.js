import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

export const APP_CONTAINER_HEIGHT = 200;
export const APP_CONTAINER_IMAGE_HEIGHT = 100;

const IMG_FAILED_LOADING_CLASSNAME = 'failed';
const IMG_NO_SRC_CLASSNAME = 'hidden';

const Wrapper = styled.div`
  padding: 10px;
`;

const StyledLink = styled(Link)`
  display: block;
  border: 1px solid #2a5974;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.border_radius};
  background-color: ${({ theme }) => theme.colors.shade4};
  position: relative;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    z-index: 10;

    &,
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
  padding: 5px ${APP_CONTAINER_IMAGE_HEIGHT}px;
  min-width: 300px;
  transform: rotate(-45deg) translate(-37%, 0);
  color: #fff;
  text-align: center;
  text-transform: uppercase;
  font-size: 12px;
  top: -60px;
  left: -40px;
  box-sizing: border-box;
  z-index: 20;
`;

const AppIcon = styled.div`
  height: ${APP_CONTAINER_IMAGE_HEIGHT}px;
  text-align: center;
  padding: 10px;
  display: flex;
  background-color: #fff;
  opacity: 0.9;
  justify-content: center;
  align-items: center;
  position: relative;

  h3 {
    color: #2e556a;
    text-align: center;
    font-size: 20px;
    font-weight: 300;
    z-index: 1;
  }
`;

const StyledAppImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  transition: opacity 0.3s ease-out;
  will-change: opacity;

  &.${IMG_NO_SRC_CLASSNAME}, &.${IMG_FAILED_LOADING_CLASSNAME} {
    opacity: 0;
  }

  &.${IMG_NO_SRC_CLASSNAME} {
    transition: 0;
  }

  img {
    max-height: 75px;
    max-width: 60%;
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

const onImgFailLoading = callback => event => {
  const element = event.target;

  element.parentNode.classList.add(IMG_FAILED_LOADING_CLASSNAME);
  element.style.display = 'none';

  callback(event);
};

const AppContainer = ({
  appVersions,
  catalog,
  searchQuery,
  onImgError,
  ...props
}) => {
  const { icon, name, repoName, version } = appVersions[0];
  const to = `/app-catalogs/${catalog.metadata.name}/${appVersions[0].name}?q=${searchQuery}`;

  return (
    <Wrapper {...props}>
      <StyledLink to={to}>
        {repoName === 'managed' && <Badge>MANAGED</Badge>}
        <AppIcon>
          <StyledAppImage className={!icon && IMG_NO_SRC_CLASSNAME}>
            <img src={icon} alt={name} onError={onImgFailLoading(onImgError)} />
          </StyledAppImage>
          <h3>{name}</h3>
        </AppIcon>
        <AppDetails>
          <h3>{name}</h3>
          <span>{version}</span>
        </AppDetails>
      </StyledLink>
    </Wrapper>
  );
};

// Needed because `AppContainer` loses its name when using `forwardRef()`
AppContainer.displayName = 'AppContainer';

AppContainer.propTypes = {
  appVersions: PropTypes.array,
  catalog: PropTypes.object,
  searchQuery: PropTypes.string,
  onImgError: PropTypes.func,
};

export default AppContainer;
