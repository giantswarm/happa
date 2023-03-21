import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForProviderCredentials } from 'MAPI/clusters/permissions/usePermissionsForProviderCredentials';
import { ProviderCluster } from 'MAPI/types';
import { StatusCodes } from 'model/constants';
import * as providers from 'model/constants/providers';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { IMainState } from 'model/stores/main/types';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import nock from 'nock';
import React from 'react';
import { useParams } from 'react-router';
import { SWRConfig } from 'swr';
import * as capav1beta1Mocks from 'test/mockHttpCalls/capav1beta1';
import * as capgv1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
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

jest.mock('MAPI/clusters/permissions/usePermissionsForProviderCredentials');
jest.mock('MAPI/clusters/permissions/usePermissionsForProviderCredentials');

jest.mock('model/services/mapi/legacy/credentials', () => ({
  ...jest.requireActual('model/services/mapi/legacy/credentials'),
  getCredentialList: jest.fn(),
}));

const defaultPermissions = {
  canList: true,
  canGet: true,
};

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
    infrav1alpha3Mocks.randomAWSCluster1
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

async function setupGCP() {
  const utils = setup(
    capiv1beta1Mocks.randomClusterGCP1,
    capgv1beta1Mocks.randomGCPCluster1
  );

  if (screen.queryAllByText('Loading...').length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));
  }

  return {
    ...utils,
  };
}

async function setupCAPA() {
  const utils = setup(
    capiv1beta1Mocks.randomClusterCAPA1,
    capav1beta1Mocks.randomAWSCluster1
  );

  if (screen.queryAllByText('Loading...').length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));
  }

  return {
    ...utils,
  };
}

async function setupCAPZ() {
  const utils = setup(
    capiv1beta1Mocks.randomClusterCAPZ1,
    capzv1beta1Mocks.randomAzureClusterCAPZ1
  );

  if (screen.queryAllByText('Loading...').length > 0) {
    await waitForElementToBeRemoved(() => screen.queryAllByText('Loading...'));
  }

  return {
    ...utils,
  };
}

describe('ClusterDetailWidgetProvider when user can not list credentials on AWS', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AWS;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue({
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
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('AWS region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('eu-west-1')).toBeInTheDocument();
    expect(within(providerInfo).getByText('Account ID')).toBeInTheDocument();
    expect(within(providerInfo).getByText('n/a')).toBeInTheDocument();
    expect(within(providerInfo).queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetProvider when user can list credentials on AWS', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AWS;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue(
      defaultPermissions
    );

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
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('AWS region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('eu-west-1')).toBeInTheDocument();
    expect(within(providerInfo).getByText('Account ID')).toBeInTheDocument();
    expect(
      await within(providerInfo).findByText('credential-account-id')
    ).toBeInTheDocument();
    expect(within(providerInfo).getByRole('link')).toHaveAttribute(
      'href',
      'https://credential-account-id.signin.aws.amazon.com/console'
    );
  });
});

describe('ClusterDetailWidgetProvider when user can not list credentials on Azure', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AZURE;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue({
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
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('Azure region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('westeurope')).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('Subscription ID')
    ).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('test-subscription')
    ).toBeInTheDocument();
    expect(within(providerInfo).queryByRole('link')).not.toBeInTheDocument();
    expect(within(providerInfo).getByText('Tenant ID')).toBeInTheDocument();
    expect(within(providerInfo).getByText('n/a')).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetProvider when user can list credentials on Azure', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.AZURE;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue(
      defaultPermissions
    );

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
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('Azure region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('westeurope')).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('Subscription ID')
    ).toBeInTheDocument();
    expect(
      await within(providerInfo).findByText('credential-subscription-id')
    ).toBeInTheDocument();
    expect(within(providerInfo).queryByRole('link')).not.toBeInTheDocument();
    expect(within(providerInfo).getByText('Tenant ID')).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('credential-tenant-id')
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetProvider on GCP', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.GCP;
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    setup();
    expect(screen.getAllByLabelText('Loading...').length).toEqual(4);
  });

  it('displays cluster region and account ID', async () => {
    await setupGCP();
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('GCP region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('europe-west3')).toBeInTheDocument();
    expect(within(providerInfo).getByText('Project ID')).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('project-352614')
    ).toBeInTheDocument();
    expect(within(providerInfo).queryByRole('link')).toBeInTheDocument();
    expect(within(providerInfo).getByRole('link')).toHaveAttribute(
      'href',
      'https://console.cloud.google.com/home/dashboard?project=project-352614'
    );
  });
});

describe('ClusterDetailWidgetProvider when user can not get AWSClusterRoleIdentity on CAPA', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.CAPA;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue({
      canGet: false,
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
    await setupCAPA();
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('AWS region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('eu-west-2')).toBeInTheDocument();
    expect(within(providerInfo).getByText('Account ID')).toBeInTheDocument();
    expect(within(providerInfo).getByText('n/a')).toBeInTheDocument();
    expect(within(providerInfo).queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetProvider when user can get AWSClusterRoleIdentity on CAPA', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.CAPA;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    setup();
    expect(screen.getAllByLabelText('Loading...').length).toEqual(4);
  });

  it('displays cluster region and account ID', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/infrastructure.cluster.x-k8s.io/v1beta1/awsclusterroleidentities/default/'
      )
      .reply(StatusCodes.Ok, capav1beta1Mocks.defaultAWSClusterRoleIdentity);
    await setupCAPA();
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('AWS region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('eu-west-2')).toBeInTheDocument();
    expect(within(providerInfo).getByText('Account ID')).toBeInTheDocument();
    expect(
      await within(providerInfo).findByText('262033476510')
    ).toBeInTheDocument();
    expect(within(providerInfo).queryByRole('link')).toBeInTheDocument();
    expect(within(providerInfo).getByRole('link')).toHaveAttribute(
      'href',
      'https://262033476510.signin.aws.amazon.com/console'
    );
  });
});

describe('ClusterDetailWidgetProvider when user can not list credentials on CAPZ', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.CAPZ;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue({
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

  it('displays cluster region, subscription ID and tenant ID', async () => {
    await setupCAPZ();
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('Azure region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('westeurope')).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('Subscription ID')
    ).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('test-subscription')
    ).toBeInTheDocument();
    expect(within(providerInfo).getByText('Tenant ID')).toBeInTheDocument();
    expect(within(providerInfo).getByText('n/a')).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetProvider when user can list credentials on CAPZ', () => {
  const provider: PropertiesOf<typeof providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = providers.CAPZ;

    (usePermissionsForProviderCredentials as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays loading animations if the cluster is still loading', () => {
    setup();
    expect(screen.getAllByLabelText('Loading...').length).toEqual(4);
  });

  it('displays cluster region, subscription ID and tenant ID', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        '/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azureclusteridentities/test-identity/'
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.defaultAzureClusterIdentity);

    await setupCAPZ();
    const providerInfo = screen.getByTestId('provider-info');
    expect(within(providerInfo).getByText('Azure region')).toBeInTheDocument();
    expect(within(providerInfo).getByText('westeurope')).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('Subscription ID')
    ).toBeInTheDocument();
    expect(
      await within(providerInfo).findByText('test-subscription')
    ).toBeInTheDocument();
    expect(within(providerInfo).getByText('Tenant ID')).toBeInTheDocument();
    expect(
      within(providerInfo).getByText('test-tenant-id')
    ).toBeInTheDocument();
  });
});
