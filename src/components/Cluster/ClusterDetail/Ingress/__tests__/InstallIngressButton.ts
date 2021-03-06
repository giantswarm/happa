import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import InstallIngressButton from 'Cluster/ClusterDetail/Ingress/InstallIngressButton';
import nock from 'nock';
import { StatusCodes } from 'shared/constants';
import { catalogsState } from 'testUtils/ingressCatalogStateMocks';
import {
  API_ENDPOINT,
  appResponseWithCustomConfig,
  catalogIndexResponse,
  getMockCall,
  v4AWSClusterResponse,
} from 'testUtils/mockHttpCalls';
import { getComponentWithStore, renderWithStore } from 'testUtils/renderUtils';

const defaultCluster = {
  ...v4AWSClusterResponse,
  apps: [appResponseWithCustomConfig],
};

const icApp = {
  spec: {
    catalog: 'giantswarm',
    chartName: 'nginx-ingress-controller-app',
    namespace: 'kube-system',
    name: 'nginx-ingress-controller-app',
    version: '1.6.9',
  },
};

describe('InstallIngressButton', () => {
  it('renders without crashing', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      renderWithStore(InstallIngressButton, { cluster: defaultCluster });
    });
  });

  it('displays an install button if there is no IC installed', async () => {
    getMockCall(`/v4/clusters/${v4AWSClusterResponse.id}/apps/`, []);
    nock('https://catalogshost')
      .get('/giantswarm-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    renderWithStore(
      InstallIngressButton,
      {
        cluster: {
          ...v4AWSClusterResponse,
          conditions: [{ condition: 'Ready' }],
        },
      },
      catalogsState
    );

    expect(await screen.findByText(/this will install/i)).toBeInTheDocument();
    expect(
      screen.getByText(/nginx ingress controller app \d\.\d\.\d/i)
    ).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: /install ingress controller/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('displays a message if an IC is already installed', async () => {
    getMockCall(`/v4/clusters/${v4AWSClusterResponse.id}/apps/`, [icApp]);
    nock('https://catalogshost')
      .get('/giantswarm-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);

    renderWithStore(
      InstallIngressButton,
      {
        cluster: { ...v4AWSClusterResponse, apps: [icApp] },
      },
      catalogsState
    );

    expect(
      await screen.findByText(/ingress controller installed/i)
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: /install ingress controller/i,
      })
    ).not.toBeInTheDocument();
  });

  it('displays the loading state while apps are loading', async () => {
    getMockCall(`/v4/clusters/${v4AWSClusterResponse.id}/apps/`, []);
    nock('https://catalogshost')
      .get('/giantswarm-catalog/index.yaml')
      .reply(StatusCodes.Ok, catalogIndexResponse);
    renderWithStore(
      InstallIngressButton,
      {
        cluster: {
          ...v4AWSClusterResponse,
          conditions: [{ condition: 'Ready' }],
        },
      },
      catalogsState
    );

    expect(
      screen.queryByText(/ingress controller installed/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/this will install the nginx ingress controller app/i)
    ).not.toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: /install ingress controller/i,
    });
    expect(button).toBeDisabled();
    expect(
      screen.getByRole('progressbar', {
        hidden: false,
      })
    ).toBeInTheDocument();

    expect(await screen.findByText(/this will install/i)).toBeInTheDocument();
    expect(
      screen.getByText(/nginx ingress controller app \d\.\d\.\d/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', {
        hidden: true,
      })
    ).toBeInTheDocument();
  });

  it('installs an IC', async () => {
    getMockCall(`/v4/clusters/${v4AWSClusterResponse.id}/apps/`, []);
    nock('https://catalogshost')
      .get('/giantswarm-catalog/index.yaml')
      .times(2)
      .reply(StatusCodes.Ok, catalogIndexResponse);
    nock(API_ENDPOINT)
      .intercept(
        `/v4/clusters/${v4AWSClusterResponse.id}/apps/${icApp.spec.name}/`,
        'PUT'
      )
      .reply(StatusCodes.Ok);
    getMockCall(`/v4/clusters/${v4AWSClusterResponse.id}/apps/`, [icApp]);

    const { rerender } = renderWithStore(
      InstallIngressButton,
      {
        cluster: {
          ...v4AWSClusterResponse,
          conditions: [{ condition: 'Ready' }],
        },
      },
      catalogsState
    );

    const button = screen.getByRole('button', {
      name: /install ingress controller/i,
    });
    await waitFor(() => expect(button).not.toBeDisabled());
    fireEvent.click(button);

    // Assert that the loading animation started.
    expect(
      screen.getByRole('progressbar', {
        hidden: false,
      })
    ).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Assert that the loading animation ended.
    expect(
      await screen.findByRole('progressbar', {
        hidden: true,
      })
    ).toBeInTheDocument();

    rerender(
      getComponentWithStore(
        InstallIngressButton,
        {
          cluster: { ...v4AWSClusterResponse, apps: [icApp] },
        },
        catalogsState
      )
    );

    expect(
      await screen.findByText(/ingress controller installed/i)
    ).toBeInTheDocument();
    expect(button).not.toBeInTheDocument();
  });
});
