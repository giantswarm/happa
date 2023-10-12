import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { ProviderFlavors, Providers, StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { useRouteMatch } from 'react-router';
import { SWRConfig } from 'swr';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as securityv1alpha1Mocks from 'test/mockHttpCalls/securityv1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailOverview from '../ClusterDetailOverview';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailOverview>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailOverview {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history,
    auth
  );
}

const defaultPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
};

const getRouteMatch = (clusterId: string, orgId: string = 'org1') => ({
  url: '',
  params: {
    orgId,
    clusterId,
  },
});

jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useRouteMatch: jest.fn(),
}));
jest.mock('MAPI/clusters/permissions/usePermissionsForClusters');

describe('ClusterDetailOverview', () => {
  beforeAll(() => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  it('renders without crashing', () => {
    (useRouteMatch as jest.Mock).mockReturnValue(getRouteMatch(''));
    render(getComponent({}));
  });

  it('displays the Releases widget', async () => {
    (useRouteMatch as jest.Mock).mockReturnValue(
      getRouteMatch(capiv1beta1Mocks.randomCluster1.metadata.name)
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster1);

    render(getComponent({}));

    expect(await screen.findByText('Release')).toBeInTheDocument();
  });

  describe('if the provider does not support releases', () => {
    const provider: PropertiesOf<typeof Providers> =
      window.config.info.general.provider;
    const providerFlavor: ProviderFlavors =
      window.config.info.general.providerFlavor;

    beforeAll(() => {
      window.config.info.general.provider = Providers.GCP;
      window.config.info.general.providerFlavor = ProviderFlavors.CAPI;
    });

    afterAll(() => {
      window.config.info.general.provider = provider;
      window.config.info.general.providerFlavor = providerFlavor;
    });

    it('displays the Versions widget', async () => {
      (useRouteMatch as jest.Mock).mockReturnValue(
        getRouteMatch(capiv1beta1Mocks.randomClusterGCP1.metadata.name)
      );

      nock(window.config.mapiEndpoint)
        .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
        .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
      nock(window.config.mapiEndpoint)
        .get(
          `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomClusterGCP1.metadata.name}/`
        )
        .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterGCP1);

      render(getComponent({}));

      expect(await screen.findByLabelText('Versions')).toBeInTheDocument();
    });
  });
});
