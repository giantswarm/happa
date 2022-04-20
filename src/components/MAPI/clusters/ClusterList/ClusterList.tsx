import { Keyboard } from 'grommet';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React from 'react';
import {
  CSSTransition,
  SwitchTransition,
  TransitionGroup,
} from 'react-transition-group';
import styled from 'styled-components';
import ClusterListEmptyPlaceholder from 'UI/Display/MAPI/clusters/ClusterList/ClusterListEmptyPlaceholder';

import { IProviderClusterForCluster } from '../utils';
import ClusterListItem from './ClusterListItem';
import ClusterListPreloader from './ClusterListPreloader';

const PRELOADER_TIMEOUT = 200;
const PRELOADER_DELAY = 300;
const AnimatedPreloader = styled(ClusterListPreloader)`
  .transition-container-enter & {
    opacity: 0;
  }

  .transition-container-enter-active & {
    opacity: 1;
    transition: opacity ${PRELOADER_TIMEOUT}ms ease-out ${PRELOADER_DELAY}ms;
  }
`;

const EMPTY_PLACEHOLDER_TIMEOUT = 200;
const AnimatedEmptyPlaceholder = styled(ClusterListEmptyPlaceholder)`
  .transition-container-enter & {
    opacity: 0;
  }

  .transition-container-enter-active & {
    opacity: 1;
    transition: opacity ${EMPTY_PLACEHOLDER_TIMEOUT}ms ease-in-out;
  }

  .transition-container-exit & {
    opacity: 1;
  }

  .transition-container-exit-active & {
    opacity: 0;
    transition: opacity ${EMPTY_PLACEHOLDER_TIMEOUT}ms ease-in-out;
  }
`;

const ITEM_TIMEOUT = 200;
const ITEM_DELAY = 30;
function getItemsEnterTransitions() {
  const MAX_ITEMS = 20;
  let str = '';
  for (let index = 0; index < MAX_ITEMS; index += 1) {
    str += `
      &:nth-child(${index + 1}) {
        transition-delay: ${ITEM_DELAY * index}ms;
      }
    `;
  }

  return str;
}
const AnimatedItem = styled(ClusterListItem)`
  .transition-container-enter & {
    opacity: 0;
    transform: translateX(-50px);
  }

  .transition-container-enter-active & {
    opacity: 1;
    transform: translateX(0);
    transition: ${ITEM_TIMEOUT}ms ease-out;
    transition-property: opacity, transform;
    ${getItemsEnterTransitions()}

    &:hover {
      box-shadow: none;
    }
  }

  .transition-container-exit & {
    opacity: 1;
  }

  .transition-container-exit-active & {
    opacity: 0;
    transform: translateX(-50px);
    transition: ${ITEM_TIMEOUT}ms ease-in;
    transition-property: opacity, transform;

    &:hover {
      box-shadow: none;
    }
  }

  &.transition-item-enter {
    opacity: 0;
    transform: translateX(-50px);
  }

  &.transition-item-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition: ${ITEM_TIMEOUT}ms ease-out;
    transition-property: opacity, transform;

    &:hover {
      box-shadow: none;
    }
  }

  &.transition-item-exit {
    opacity: 1;
  }

  &.transition-item-exit-active {
    opacity: 0;
    transform: translateX(-50px);
    transition: ${ITEM_TIMEOUT}ms ease-in;
    transition-property: opacity, transform;

    &:hover {
      box-shadow: none;
    }
  }
`;
interface IClusterListProps {
  isLoading: boolean;
  hasNoClusters: boolean;
  orgID: string;
  orgName: string;
  clustersWithProviderClusters?: IProviderClusterForCluster[];
  releases?: releasev1alpha1.IRelease[];
  organizations?: Record<string, IOrganization>;
  canCreateClusters: boolean;
  canListReleases: boolean;
}

const ClusterList: React.FC<React.PropsWithChildren<IClusterListProps>> = (
  props
) => {
  const {
    isLoading,
    hasNoClusters,
    orgID,
    orgName,
    clustersWithProviderClusters,
    releases,
    organizations,
    canCreateClusters,
    canListReleases,
  } = props;
  const itemsCount = clustersWithProviderClusters
    ? clustersWithProviderClusters.length
    : 0;
  const itemsEnterTimeout = ITEM_TIMEOUT + ITEM_DELAY * (itemsCount - 1);

  const key = isLoading
    ? `${orgID}-is-loading`
    : hasNoClusters
    ? `${orgID}-no-clusters`
    : orgID;

  const timeout = {
    enter: isLoading
      ? PRELOADER_TIMEOUT + PRELOADER_DELAY
      : hasNoClusters
      ? EMPTY_PLACEHOLDER_TIMEOUT
      : itemsEnterTimeout,
    exit: isLoading
      ? 0
      : hasNoClusters
      ? EMPTY_PLACEHOLDER_TIMEOUT
      : ITEM_TIMEOUT,
  };

  return (
    <SwitchTransition>
      <CSSTransition
        key={key}
        timeout={timeout}
        classNames='transition-container'
      >
        <div>
          {isLoading ? (
            <AnimatedPreloader />
          ) : hasNoClusters ? (
            <AnimatedEmptyPlaceholder
              organizationName={orgName}
              canCreateClusters={canCreateClusters}
            />
          ) : (
            <Keyboard
              onSpace={(e) => {
                e.preventDefault();

                (e.target as HTMLElement).click();
              }}
            >
              <TransitionGroup>
                {clustersWithProviderClusters?.map(
                  ({ cluster, providerCluster }) => (
                    <CSSTransition
                      key={cluster.metadata.name}
                      mountOnEnter={true}
                      unmountOnExit={true}
                      classNames='transition-item'
                      timeout={ITEM_TIMEOUT}
                    >
                      <AnimatedItem
                        key={cluster.metadata.name}
                        cluster={cluster}
                        providerCluster={providerCluster}
                        releases={releases}
                        organizations={organizations}
                        canCreateClusters={canCreateClusters}
                        canListReleases={canListReleases}
                        margin={{ bottom: 'medium' }}
                      />
                    </CSSTransition>
                  )
                )}
              </TransitionGroup>
            </Keyboard>
          )}
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default ClusterList;
