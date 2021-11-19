import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as metav1 from 'model/services/mapi/metav1';
import { IMainState } from 'model/stores/main/types';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { SWRConfig } from 'swr';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';

import Clusters from '../Clusters';

const defaultState: IState = {
  ...preloginState,
  main: {
    ...preloginState.main,
    selectedOrganization: 'org1',
  } as IMainState,
  entities: {
    organizations: {
      ...preloginState.entities.organizations,
      items: {
        org1: {
          id: 'org1',
          name: 'org1',
          namespace: 'org-org1',
        },
      },
    } as IOrganizationState,
  } as IState['entities'],
} as IState;

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof Clusters>,
  state: Partial<IState> = defaultState
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <Clusters {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    state,
    undefined,
    history,
    auth
  );
}

describe('Clusters', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays a message if there are no organizations', async () => {
    render(
      getComponent(
        {},
        {
          entities: {
            organizations: {
              items: {},
            } as unknown as IOrganizationState,
          } as IState['entities'],
        }
      )
    );

    expect(
      await screen.findByText(
        'There are no organizations yet in your installation.'
      )
    ).toBeInTheDocument();
  });

  it('displays an error message if the list of clusters could not be fetched', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    render(getComponent({}));

    expect(
      await screen.findByText((_, node) => {
        return (
          node?.textContent === 'Error loading clusters for organization org1'
        );
      })
    ).toBeInTheDocument();
  });

  it('displays a placeholder if there are no clusters', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
        items: [],
        kind: 'ClusterList',
      });

    render(getComponent({}));

    expect(
      await screen.findByText((_, node) => {
        return (
          node?.textContent ===
          `Couldn't find any clusters in organization org1`
        );
      })
    ).toBeInTheDocument();
  });
});
