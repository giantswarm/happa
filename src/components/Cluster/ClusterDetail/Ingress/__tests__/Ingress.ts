import { screen, within } from '@testing-library/react';
import { Providers } from 'shared/constants';
import {
  appResponseWithCustomConfig,
  getMockCall,
  v5ClusterResponse,
} from 'testUtils/mockHttpCalls';
import { getComponentWithTheme, renderWithStore } from 'testUtils/renderUtils';

import Ingress from '../Ingress';

const getByTextInParent = (
  parent: HTMLElement,
  text: string
): HTMLElement | null => {
  return within(parent).getByText(text);
};

const defaultCluster = {
  ...v5ClusterResponse,
  apps: [appResponseWithCustomConfig],
};

describe('Ingress', () => {
  it('renders without crashing', () => {
    renderWithStore(Ingress, { cluster: defaultCluster });
  });

  it('formats all the ingress paths correctly', () => {
    const { getByText } = renderWithStore(Ingress, {
      k8sEndpoint: 'https://api.t3st.k8s.giantswarm.io',
      cluster: defaultCluster,
    });

    // Base domain
    let elParent = getByText(/base domain:/i).parentNode as HTMLDivElement;
    expect(
      getByTextInParent(elParent, '.t3st.k8s.giantswarm.io')
    ).toBeInTheDocument();

    // Load balancer DNS
    elParent = getByText(/load balancer dns name:/i)
      .parentNode as HTMLDivElement;
    expect(
      getByTextInParent(elParent, 'ingress.t3st.k8s.giantswarm.io')
    ).toBeInTheDocument();

    // Hostname pattern
    elParent = getByText(/hostname pattern:/i).parentNode as HTMLDivElement;
    expect(
      getByTextInParent(elParent, '.t3st.k8s.giantswarm.io')
    ).toBeInTheDocument();
    expect(within(elParent).getAllByText('YOUR_PREFIX').length).toBe(2);

    // Option A
    elParent = getByText(/pointing to the load balancer DNS name/i)
      .parentNode as HTMLDivElement;
    expect(
      getByTextInParent(elParent, 'ingress.t3st.k8s.giantswarm.io')
    ).toBeInTheDocument();

    // Option B
    elParent = getByText(/ingress resource to the according name/i)
      .parentNode as HTMLDivElement;
    expect(
      getByTextInParent(elParent, 'example.t3st.k8s.giantswarm.io')
    ).toBeInTheDocument();
  });

  it('displays the TCP ports for KVM installations', () => {
    const defaultProps = {
      cluster: defaultCluster,
      kvmTCPHTTPPort: 10000,
      kvmTCPHTTPSPort: 10001,
    };

    const { queryByText, getByText, rerender } = renderWithStore(Ingress, {
      ...defaultProps,
      provider: Providers.AWS,
    });

    expect(queryByText(/load balancer TCP ports:/i)).not.toBeInTheDocument();

    // Switch to KVM provider
    rerender(
      getComponentWithTheme(Ingress, {
        ...defaultProps,
        provider: Providers.KVM,
      })
    );

    const tcpParent = getByText(/load balancer TCP ports:/i)
      .parentNode as HTMLDivElement;
    expect(
      getByTextInParent(tcpParent, defaultProps.kvmTCPHTTPPort.toString())
    ).toBeInTheDocument();
    expect(
      getByTextInParent(tcpParent, defaultProps.kvmTCPHTTPSPort.toString())
    ).toBeInTheDocument();
  });

  it('displays ingress controller installation instructions, in case no ingress controller is installed', async () => {
    getMockCall(`/v4/clusters/${v5ClusterResponse.id}/apps/`, []);
    const cluster = { ...v5ClusterResponse, apps: [] };
    renderWithStore(Ingress, { cluster });

    expect(
      await screen.findByText(
        /in order to expose services via Ingress, you must have external-dns and an Ingress controller installed/i
      )
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        /this will install the nginx ingress controller app on cluster/i
      )
    ).toBeInTheDocument();
  });
});
