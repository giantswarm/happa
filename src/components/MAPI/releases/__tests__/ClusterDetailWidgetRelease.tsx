import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import add from 'date-fns/fp/add';
import format from 'date-fns/fp/format';
import { createMemoryHistory } from 'history';
import * as releasesUtils from 'MAPI/releases/utils';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import * as releasev1alpha1Mocks from 'test/mockHttpCalls/releasev1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import * as ui from 'UI/Display/MAPI/releases/types';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailWidgetRelease from '../ClusterDetailWidgetRelease';
import { usePermissionsForReleases } from '../permissions/usePermissionsForReleases';
import { getReleaseComponentsDiff } from '../utils';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetRelease>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetRelease {...p} />
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

jest.mock('MAPI/releases/permissions/usePermissionsForReleases');

describe('ClusterDetailWidgetRelease', () => {
  it('renders without crashing', () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    render(
      getComponent({
        cluster: undefined,
      })
    );

    expect(screen.getAllByLabelText('Loading...').length).toEqual(2);
  });

  it('displays the Kubernetes version used', async () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('1.19.10')).toBeInTheDocument();
  });

  it('displays details about the release when clicking on the release version', async () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    const version = screen.getByText('14.1.5');
    expect(version).toBeInTheDocument();
    fireEvent.click(version);

    expect(await screen.findByText('Details for release 14.1.5'));

    const components = releasesUtils.reduceReleaseToComponents(
      releasev1alpha1Mocks.v14_1_5
    );
    for (const component of Object.values(components)) {
      expect(
        screen.getByLabelText(`${component.name} version ${component.version}`)
      ).toBeInTheDocument();
    }

    expect(screen.getByText('Release notes')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'https://github.com/giantswarm/releases/tree/master/azure/v14.1.5',
      })
    );

    expect(
      screen.getByText(/This cluster can be upgraded to/)
    ).toBeInTheDocument();
    expect(screen.getByText('v15.0.0')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);

    await waitForElementToBeRemoved(() =>
      screen.queryByText('Details for release 14.1.5')
    );
  });

  it('displays information if an upgrade has been scheduled', async () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    const targetTime = `${format('dd MMM yy HH:mm')(
      add({ days: 1 })(new Date())
    )} UTC`;

    render(
      getComponent({
        cluster: {
          ...capiv1alpha3Mocks.randomCluster1,
          metadata: {
            ...capiv1alpha3Mocks.randomCluster1.metadata,
            annotations: {
              ...capiv1alpha3Mocks.randomCluster1.metadata.annotations,
              'alpha.giantswarm.io/update-schedule-target-release': '15.0.0',
              'alpha.giantswarm.io/update-schedule-target-time': targetTime,
            },
          },
        },
      })
    );

    expect(await screen.findByText('Upgrade scheduled')).toBeInTheDocument();
  });

  it('displays a warning when there is an upgrade available', async () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('Upgrade available')).toBeInTheDocument();
  });

  it('can upgrade a cluster', async () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...capiv1alpha3Mocks.randomCluster1,
        metadata: {
          ...capiv1alpha3Mocks.randomCluster1.metadata,
          labels: {
            ...capiv1alpha3Mocks.randomCluster1.metadata.labels,
            'release.giantswarm.io/version':
              releasev1alpha1Mocks.v15_0_0.metadata.name.slice(1),
          },
        },
      });

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
        canUpdateCluster: true,
      })
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'Upgrade cluster…' })
    );

    expect(await screen.findByText('Upgrade to 15.0.0')).toBeInTheDocument();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Inspect changes' })
    );

    expect(
      await screen.findByText('Changes from 14.1.5 to 15.0.0')
    ).toBeInTheDocument();

    expect(screen.getByText('Component changes')).toBeInTheDocument();
    const versionDiff = getReleaseComponentsDiff(
      releasev1alpha1Mocks.v14_1_5,
      releasev1alpha1Mocks.v15_0_0
    );
    for (const change of versionDiff.changes) {
      switch (change.changeType) {
        case ui.ReleaseComponentsDiffChangeType.Add:
          expect(
            screen.getByLabelText(
              `${change.component} version ${change.newVersion}`
            )
          ).toBeInTheDocument();
          break;
        case ui.ReleaseComponentsDiffChangeType.Update:
          expect(
            screen.getByLabelText(
              `${change.component} version ${change.oldVersion} is upgraded to version ${change.newVersion}`
            )
          ).toBeInTheDocument();
          break;
        case ui.ReleaseComponentsDiffChangeType.Delete:
          expect(
            screen.getByLabelText(
              `${change.component} version ${change.oldVersion} is removed`
            )
          ).toBeInTheDocument();
          break;
      }
    }

    expect(screen.getByText('Release notes')).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'https://github.com/giantswarm/releases/tree/master/azure/v15.0.0',
      })
    ).toBeInTheDocument();

    fireEvent.click(
      await screen.findByRole('button', { name: 'Start upgrade' })
    );

    expect(
      await screen.findByText('Cluster upgrade initiated.')
    ).toBeInTheDocument();
  });

  it('displays a warning message and the cluster upgrade button as disabled if the user does not have permissions to upgrade clusters', async () => {
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
        canUpdateCluster: false,
      })
    );

    expect(
      await screen.findByRole('button', { name: 'Upgrade cluster…' })
    ).toBeDisabled();

    expect(
      screen.getByText(
        'For upgrading this cluster, you need additional permissions. Please talk to your administrator.'
      )
    ).toBeInTheDocument();
  });
});
