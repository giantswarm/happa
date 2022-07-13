import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForOrgCredentials } from 'MAPI/clusters/permissions/usePermissionsForOrgCredentials';
import { ProviderCluster } from 'MAPI/types';
import * as providers from 'model/constants/providers';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { IMainState } from 'model/stores/main/types';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import React from 'react';
import { useParams } from 'react-router';
import { SWRConfig } from 'swr';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as infrav1alpha3Mocks from 'test/mockHttpCalls/infrastructurev1alpha3';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailWidgetProvider from '../ClusterDetailWidgetProvider';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn(),
}));

jest.mock('MAPI/clusters/permissions/usePermissionsForOrgCredentials');

jest.mock('model/services/mapi/legacy/credentials', () => ({
  ...jest.requireActual('model/services/mapi/legacy/credentials'),
  getCredentialList: jest.fn(),
}));

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetProvider>,
  state: IState
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetProvider {...p} />
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

const defaultState: IState = {
  main: {
    selectedOrganization: 'org1',
  } as IMainState,
  entities: {
    organizations: {
      lastUpdated: 0,
      isFetching: false,
      credentials: {
        lastUpdated: 0,
        isFetching: false,
        items: [],
        showForm: false,
      },
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

function setup(
  cluster?: capiv1beta1.ICluster,
  providerCluster?: ProviderCluster
) {
  (useParams as jest.Mock).mockReturnValue({
    orgId: defaultState.main.selectedOrganization,
    clusterId: cluster?.metadata.name,
  });

  const utils = render(
    getComponent(
      {
        cluster,
        providerCluster,
      },
      defaultState
    )
  );

  return {
    ...utils,
  };
}

async function setupAWS() {
  const utils = setup(
    capiv1beta1Mocks.randomClusterAWS1,
    infrav1alpha3Mocks.randomClusterAWS1
  );

  if (screen.queryAllByText('Loading...').length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));
  }

  return {
    ...utils,
  };
}

async function setupAzure() {
  const utils = setup(
    capiv1beta1Mocks.randomCluster1,
    capzv1beta1Mocks.randomAzureCluster1
  );

  if (screen.queryAllByText('Loading...').length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));
  }

  return {
    ...utils,
  };
}

describe('ClusterDetailWidgetProvider on AWS when user can not list credentials', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AWS;

    (usePermissionsForOrgCredentials as jest.Mock).mockReturnValue({
      canList: false,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    setup();
    expect(screen.getAllByLabelText('Loading...').length).toEqual(4);
  });

  it('displays cluster region and account ID', async () => {
    await setupAWS();
    const groups = screen.getAllByTestId('provider-group');
    expect(groups.length).toEqual(2);
    expect(within(groups[0]).getByText('AWS region')).toBeInTheDocument();
    expect(within(groups[0]).getByText('eu-west-1')).toBeInTheDocument();
    expect(within(groups[1]).getByText('Account ID')).toBeInTheDocument();
    expect(within(groups[1]).getByText('n/a')).toBeInTheDocument();
    expect(within(groups[1]).queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetProvider on AWS when user can list credentials', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AWS;

    (usePermissionsForOrgCredentials as jest.Mock).mockReturnValue({
      canList: true,
    });

    (legacyCredentials.getCredentialList as jest.Mock).mockReturnValue({
      items: [
        {
          awsOperatorRole: 'credential-account-id',
        },
      ],
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    setup();
    expect(screen.getAllByLabelText('Loading...').length).toEqual(4);
  });

  it('displays cluster region and account ID', async () => {
    await setupAWS();
    const groups = screen.getAllByTestId('provider-group');
    expect(groups.length).toEqual(2);
    expect(within(groups[0]).getByText('AWS region')).toBeInTheDocument();
    expect(within(groups[0]).getByText('eu-west-1')).toBeInTheDocument();
    expect(within(groups[1]).getByText('Account ID')).toBeInTheDocument();
    expect(
      within(groups[1]).getByText('credential-account-id')
    ).toBeInTheDocument();
    expect(within(groups[1]).getByRole('link')).toHaveAttribute(
      'href',
      'https://credential-account-id.signin.aws.amazon.com/console'
    );
  });
});

describe('ClusterDetailWidgetProvider on Azure when user can not list credentials', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AZURE;

    (usePermissionsForOrgCredentials as jest.Mock).mockReturnValue({
      canList: false,
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    setup();
    expect(screen.getAllByLabelText('Loading...').length).toEqual(6);
  });

  it('displays cluster region, subscription ID and tenant ID', async () => {
    await setupAzure();
    const groups = screen.getAllByTestId('provider-group');
    expect(groups.length).toEqual(3);
    expect(within(groups[0]).getByText('Azure region')).toBeInTheDocument();
    expect(within(groups[0]).getByText('westeurope')).toBeInTheDocument();
    expect(within(groups[1]).getByText('Subscription ID')).toBeInTheDocument();
    expect(
      within(groups[1]).getByText('test-subscription')
    ).toBeInTheDocument();
    expect(within(groups[1]).queryByRole('link')).not.toBeInTheDocument();
    expect(within(groups[2]).getByText('Tenant ID')).toBeInTheDocument();
    expect(within(groups[2]).getByText('n/a')).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetProvider on Azure when user can list credentials', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AZURE;

    (usePermissionsForOrgCredentials as jest.Mock).mockReturnValue({
      canList: true,
    });

    (legacyCredentials.getCredentialList as jest.Mock).mockReturnValue({
      items: [
        {
          azureSubscriptionID: 'credential-subscription-id',
          azureTenantID: 'credential-tenant-id',
        },
      ],
    });
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    setup();
    expect(screen.getAllByLabelText('Loading...').length).toEqual(6);
  });

  it('displays cluster region, subscription ID and tenant ID', async () => {
    await setupAzure();
    const groups = screen.getAllByTestId('provider-group');
    expect(groups.length).toEqual(3);
    expect(within(groups[0]).getByText('Azure region')).toBeInTheDocument();
    expect(within(groups[0]).getByText('westeurope')).toBeInTheDocument();
    expect(within(groups[1]).getByText('Subscription ID')).toBeInTheDocument();
    expect(
      within(groups[1]).getByText('credential-subscription-id')
    ).toBeInTheDocument();
    expect(within(groups[1]).queryByRole('link')).not.toBeInTheDocument();
    expect(within(groups[2]).getByText('Tenant ID')).toBeInTheDocument();
    expect(
      within(groups[2]).getByText('credential-tenant-id')
    ).toBeInTheDocument();
  });
});
