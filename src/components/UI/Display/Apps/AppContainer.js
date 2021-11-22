import { AppCatalogRoutes } from 'model/constants/routes';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Truncated from 'UI/Util/Truncated';
import RoutePath from 'utils/routePath';

export const APP_CONTAINER_HEIGHT = 200;
export const APP_CONTAINER_IMAGE_HEIGHT = 100;

const IMG_FAILED_LOADING_CLASSNAME = 'failed';
const IMG_NO_SRC_CLASSNAME = 'hidden';

const Wrapper = styled.div`
  padding: 10px;
`;

const StyledLink = styled(Link)`
  display: block;
  border: 1px solid transparent;
  width: 100%;
  height: 100%;
  border-radius: ${(props) => props.theme.border_radius};
  background-color: ${(props) => props.theme.colors.shade4};
  position: relative;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    z-index: 10;

    &,
    div:nth-of-type(1) {
      opacity: 1;
      border-color: ${({ theme }) => theme.colors.shade8};
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

  img {
    max-height: 75px;
    max-width: 60%;
  }

  &.${IMG_NO_SRC_CLASSNAME}, &.${IMG_FAILED_LOADING_CLASSNAME} {
    opacity: 0;
    z-index: -1;
  }

  &.${IMG_NO_SRC_CLASSNAME} {
    transition: 0;
  }

  &.${IMG_FAILED_LOADING_CLASSNAME} {
    img {
      display: none;
    }
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

const onImgFailLoading = (callback) => (event) => {
  const element = event.target;

  element.parentNode.classList.add(IMG_FAILED_LOADING_CLASSNAME);

  callback(event);
};

const AppContainer = ({
  appVersions,
  catalog,
  searchQuery,
  onImgError,
  hasIconError,
  ...props
}) => {
  const { icon, name, repoName, version } = appVersions[0];

  const appCatalogAppDetailPath = RoutePath.createUsablePath(
    AppCatalogRoutes.AppDetail,
    {
      catalogName: catalog.metadata.name,
      app: appVersions[0].name,
      version: appVersions[0].version,
    }
  );
  const to = `${appCatalogAppDetailPath}/?q=${searchQuery}`;

  return (
    <Wrapper {...props}>
      <StyledLink to={to}>
        {repoName === 'managed' && <Badge>MANAGED</Badge>}
        <AppIcon>
          {!hasIconError && (
            <StyledAppImage className={!icon && IMG_NO_SRC_CLASSNAME}>
              <img
                src={icon}
                alt={name}
                onError={onImgFailLoading(onImgError)}
              />
            </StyledAppImage>
          )}
          <h3>{name}</h3>
        </AppIcon>
        <AppDetails>
          <h3>{name}</h3>
          <Truncated>{version}</Truncated>
        </AppDetails>
      </StyledLink>
    </Wrapper>
  );
};

export default AppContainer;
