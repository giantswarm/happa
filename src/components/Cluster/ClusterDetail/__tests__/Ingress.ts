import { within } from '@testing-library/react';
import { Providers } from 'shared/constants';
import { getComponentWithTheme, renderWithTheme } from 'testUtils/renderUtils';

import Ingress from '../Ingress/Ingress';

const getByTextInParent = (
  parent: HTMLElement,
  text: string
): HTMLElement | null => {
  return within(parent).getByText(text);
};

describe('Ingress', () => {
  it('renders without crashing', () => {
    renderWithTheme(Ingress, {});
  });

  it('formats all the ingress paths correctly', () => {
    const { getByText } = renderWithTheme(Ingress, {
      k8sEndpoint: 'https://api.t3st.k8s.giantswarm.io',
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
      kvmTCPHTTPPort: 10000,
      kvmTCPHTTPSPort: 10001,
    };

    const { queryByText, getByText, rerender } = renderWithTheme(Ingress, {
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
});
