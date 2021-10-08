import { fireEvent, screen } from '@testing-library/react';
import UpgradeClusterModal from 'Cluster/ClusterDetail/UpgradeClusterModal';
import React from 'react';
import { IState } from 'stores/state';
import { v5ClusterResponse } from 'testUtils/mockHttpCalls';
import { renderWithStore } from 'testUtils/renderUtils';

function renderAndOpen(
  props: React.ComponentPropsWithoutRef<typeof UpgradeClusterModal> = {},
  state: Partial<IState> = {}
) {
  interface IComponent {
    show: () => void;
  }

  const elementRef = React.createRef<IComponent>();
  const defaultProps = Object.assign(
    {},
    { ref: elementRef, animate: false },
    props
  );
  const element = renderWithStore(UpgradeClusterModal, defaultProps, state);

  // Make modal visible.
  (elementRef.current as IComponent).show();

  return element;
}

describe('UpgradeClusterModal', () => {
  it('renders without crashing', () => {
    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
    });
    renderAndOpen({
      cluster,
    });
  });

  it('renders the inspect changes page by default', async () => {
    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
    });
    renderAndOpen({
      cluster,
    });

    expect(await screen.findByText(/Please read our/i)).toBeInTheDocument();
  });

  it(`can't change the upgrade release version if the user is not an admin`, async () => {
    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
    });
    const targetRelease = {
      version: '1.0.0',
      timestamp: '2020-06-11T12:34:56Z',
      components: [{ name: 'kubernetes', version: '1.16.3' }],
      changelog: [{ component: 'dummy', description: 'dummy' }],
      active: true,
      kubernetesVersion: '1.16.3',
      releaseNotesURL: 'dummy',
    };
    renderAndOpen({
      cluster,
      targetRelease,
    });

    fireEvent.click(await screen.findByText(/inspect changes/i));
  });
});
