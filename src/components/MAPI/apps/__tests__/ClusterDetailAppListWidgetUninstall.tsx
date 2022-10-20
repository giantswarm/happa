import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { withMarkup } from 'test/assertUtils';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetUninstall from '../ClusterDetailAppListWidgetUninstall';
import { IAppsPermissions } from '../permissions/types';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetUninstall
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <ClusterDetailAppListWidgetUninstall {...p} />
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

const defaultPermissions: IAppsPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
  canConfigure: true,
};

describe('ClusterDetailAppWidgetUninstall', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays the button to uninstall an app', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(getComponent({ app }));
    expect(
      screen.getByRole('button', {
        name: /Uninstall/,
      })
    ).toBeInTheDocument();
  });

  it('displays the confirmation for uninstalling an app when the uninstall button is clicked', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(getComponent({ app, appsPermissions: defaultPermissions }));

    const uninstallButton = screen.getByRole('button', {
      name: /Uninstall/,
    });
    fireEvent.click(uninstallButton);

    expect(
      withMarkup(screen.getByText)(
        `Are you sure you want to uninstall ${app.metadata.name} from cluster ${app.metadata.namespace}?`
      )
    ).toBeInTheDocument();
  });

  it('uninstalls an app', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(
      getComponent({
        app,
        appsPermissions: defaultPermissions,
        isClusterApp: false,
      })
    );

    const uninstallButton = screen.getByRole('button', {
      name: /Uninstall/,
    });
    fireEvent.click(uninstallButton);

    await withMarkup(screen.findByText)(
      `Are you sure you want to uninstall ${app.metadata.name} from cluster ${app.metadata.namespace}?`
    );

    const confirmUninstallButton = screen.getByRole('button', {
      name: 'Uninstall',
    });
    fireEvent.click(confirmUninstallButton);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .delete(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Resource deleted.',
        status: metav1.K8sStatuses.Success,
        reason: '',
        code: StatusCodes.Ok,
      });

    expect(
      await withMarkup(screen.findByText)(
        `App ${app.metadata.name} will be uninstalled from cluster ${app.metadata.namespace}.`
      )
    ).toBeInTheDocument();
  });

  it('displays if the user does not have permissions to uninstall an app', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(
      getComponent({
        app,
        appsPermissions: { ...defaultPermissions, canDelete: false },
      })
    );

    expect(
      screen.getByRole('button', {
        name: /Uninstall/,
      })
    ).toBeDisabled();

    expect(
      screen.getByText(
        'For uninstalling this app, you need additional permissions. Please talk to your administrator.'
      )
    ).toBeInTheDocument();
  });
});
