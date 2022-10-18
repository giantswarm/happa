import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import yaml from 'js-yaml';
import { StatusCodes } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import { generateApp } from 'test/mockHttpCalls/applicationv1alpha1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import { DeepPartial } from 'utils/helpers';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailAppListWidgetConfiguration from '../ClusterDetailAppListWidgetConfiguration';
import { IAppsPermissions } from '../permissions/types';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailAppListWidgetConfiguration
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailAppListWidgetConfiguration {...p} />
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

const defaultAppsPermissions: IAppsPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
  canConfigure: true,
};

describe('ClusterDetailAppListWidgetConfiguration', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays if the app has config values set up', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    app.spec.userConfig!.configMap = {
      name: 'some-configmap',
      namespace: 'some-namespace',
    };

    render(
      getComponent({
        app,
        appsPermissions: defaultAppsPermissions,
      })
    );

    expect(
      withMarkup(screen.getByText)(
        'User-level values are configured via the ConfigMap resource some-configmap in namespace some-namespace.'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Replace values' })
    ).toBeInTheDocument();
  });

  it('displays if the app has secret values set up', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    app.spec.userConfig!.secret = {
      name: 'some-secret',
      namespace: 'some-namespace',
    };

    render(
      getComponent({
        app,
        appsPermissions: defaultAppsPermissions,
      })
    );

    expect(
      withMarkup(screen.getByText)(
        'User-level secret values are configured via the Secret resource some-secret in namespace some-namespace.'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Replace secret values' })
    ).toBeInTheDocument();
  });

  it('can parse and upload config values for an app', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    let app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    delete app.spec.userConfig!.configMap;

    render(
      getComponent({
        app,
        appsPermissions: defaultAppsPermissions,
        isClusterApp: false,
      })
    );

    const configMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `${app.metadata.name}-user-values`,
        namespace: `${app.metadata.namespace}`,
      },
      data: {
        values: '|-\n  some-key:\n    some-value\n',
      },
    };

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${app.metadata.namespace}/configmaps/${app.metadata.name}-user-values/`
      )
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    nock(window.config.mapiEndpoint)
      .post(
        `/api/v1/namespaces/${app.metadata.namespace}/configmaps/`,
        configMap
      )
      .reply(StatusCodes.Created, configMap);

    const appPatch: DeepPartial<applicationv1alpha1.IApp> = {
      spec: {
        userConfig: {
          configMap: {
            name: `${app.metadata.name}-user-values`,
            namespace: app.metadata.namespace!,
          },
        },
      },
    };

    app = {
      ...app,
      spec: {
        ...app.spec,
        userConfig: {
          ...app.spec.userConfig,
          configMap: {
            name: `${app.metadata.name}-user-values`,
            namespace: app.metadata.namespace!,
          },
        },
      },
    };

    nock(window.config.mapiEndpoint)
      .patch(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        appPatch
      )
      .reply(StatusCodes.Ok, app);

    const uploadButton = screen.getByRole('button', { name: 'Upload values' });
    const fileInput =
      uploadButton.parentElement!.parentElement!.querySelector(
        `input[type='file']`
      )!;

    const file = new Blob(
      [
        yaml.dump(`some-key:
  some-value`),
      ],
      {
        type: 'application/yaml',
      }
    );

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await withMarkup(screen.findByText)(
        `A ConfigMap containing user level config values for ${app.metadata.name} on ${app.metadata.namespace} has successfully been created.`
      )
    ).toBeInTheDocument();
  });

  it('can update existing config values for an app', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    app.spec.userConfig!.configMap = {
      name: `${app.metadata.name}-user-values`,
      namespace: `${app.metadata.namespace}`,
    };

    render(
      getComponent({
        app,
        appsPermissions: defaultAppsPermissions,
        isClusterApp: false,
      })
    );

    let configMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `${app.metadata.name}-user-values`,
        namespace: `${app.metadata.namespace}`,
      },
      data: {
        values: '|-\n  some-key:\n    some-value\n',
      },
    };

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${app.metadata.namespace}/configmaps/${app.metadata.name}-user-values/`
      )
      .reply(StatusCodes.Ok, configMap);

    configMap = {
      ...configMap,
      data: {
        values: '',
      },
    };

    nock(window.config.mapiEndpoint)
      .put(
        `/api/v1/namespaces/${app.metadata.namespace}/configmaps/${app.metadata.name}-user-values/`,
        configMap
      )
      .reply(StatusCodes.Ok, configMap);

    const appPatch: DeepPartial<applicationv1alpha1.IApp> = {
      spec: {
        userConfig: {
          configMap: {
            name: `${app.metadata.name}-user-values`,
            namespace: app.metadata.namespace!,
          },
        },
      },
    };

    nock(window.config.mapiEndpoint)
      .patch(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        appPatch
      )
      .reply(StatusCodes.Ok, app);

    const uploadButton = screen.getByRole('button', { name: 'Replace values' });
    const fileInput =
      uploadButton.parentElement!.parentElement!.querySelector(
        `input[type='file']`
      )!;

    const file = new Blob([''], {
      type: 'application/yaml',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await withMarkup(screen.findByText)(
        `The ConfigMap containing user level config values for ${app.metadata.name} on ${app.metadata.namespace} has successfully been updated.`
      )
    ).toBeInTheDocument();
  });

  it('can parse and upload secret values for an app', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    let app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    delete app.spec.userConfig!.secret;

    render(
      getComponent({
        app,
        appsPermissions: defaultAppsPermissions,
        isClusterApp: false,
      })
    );

    const secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: `${app.metadata.name}-user-secrets`,
        namespace: `${app.metadata.namespace}`,
      },
      stringData: {
        values: '|-\n  some-key:\n    some-value\n',
      },
    };

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${app.metadata.namespace}/secrets/${app.metadata.name}-user-secrets/`
      )
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    nock(window.config.mapiEndpoint)
      .post(`/api/v1/namespaces/${app.metadata.namespace}/secrets/`, secret)
      .reply(StatusCodes.Created, secret);

    app = {
      ...app,
      spec: {
        ...app.spec,
        userConfig: {
          ...app.spec.userConfig,
          secret: {
            name: `${app.metadata.name}-user-secrets`,
            namespace: app.metadata.namespace!,
          },
        },
      },
    };

    const appPatch: DeepPartial<applicationv1alpha1.IApp> = {
      spec: {
        userConfig: {
          secret: {
            name: `${app.metadata.name}-user-secrets`,
            namespace: app.metadata.namespace!,
          },
        },
      },
    };

    nock(window.config.mapiEndpoint)
      .patch(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        appPatch
      )
      .reply(StatusCodes.Ok, app);

    const uploadButton = screen.getByRole('button', {
      name: 'Upload secret values',
    });
    const fileInput =
      uploadButton.parentElement!.parentElement!.querySelector(
        `input[type='file']`
      )!;

    const file = new Blob(
      [
        yaml.dump(`some-key:
  some-value`),
      ],
      {
        type: 'application/yaml',
      }
    );

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await withMarkup(screen.findByText)(
        `A Secret containing user level secret values for ${app.metadata.name} on ${app.metadata.namespace} has successfully been created.`
      )
    ).toBeInTheDocument();
  });

  it('can update existing secret values for an app', async () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });
    app.spec.userConfig!.secret = {
      name: `${app.metadata.name}-user-secrets`,
      namespace: `${app.metadata.namespace}`,
    };

    render(
      getComponent({
        app,
        appsPermissions: defaultAppsPermissions,
        isClusterApp: false,
      })
    );

    let secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: `${app.metadata.name}-user-secrets`,
        namespace: `${app.metadata.namespace}`,
      },
      stringData: {
        values: '|-\n  some-key:\n    some-value\n',
      },
    };

    nock(window.config.mapiEndpoint)
      .get(
        `/api/v1/namespaces/${app.metadata.namespace}/secrets/${app.metadata.name}-user-secrets/`
      )
      .reply(StatusCodes.Ok, secret);

    secret = {
      ...secret,
      stringData: {
        values: '',
      },
    };

    nock(window.config.mapiEndpoint)
      .put(
        `/api/v1/namespaces/${app.metadata.namespace}/secrets/${app.metadata.name}-user-secrets/`,
        secret
      )
      .reply(StatusCodes.Ok, secret);

    const appPatch: DeepPartial<applicationv1alpha1.IApp> = {
      spec: {
        userConfig: {
          secret: {
            name: `${app.metadata.name}-user-secrets`,
            namespace: app.metadata.namespace!,
          },
        },
      },
    };

    nock(window.config.mapiEndpoint)
      .patch(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        appPatch
      )
      .reply(StatusCodes.Ok, app);

    const uploadButton = screen.getByRole('button', {
      name: 'Replace secret values',
    });
    const fileInput =
      uploadButton.parentElement!.parentElement!.querySelector(
        `input[type='file']`
      )!;

    const file = new Blob([''], {
      type: 'application/yaml',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(
      await withMarkup(screen.findByText)(
        `The Secret containing user level secret values for ${app.metadata.name} on ${app.metadata.namespace} has successfully been updated.`
      )
    ).toBeInTheDocument();
  });

  it('displays if the user does not have permissions to configure apps', () => {
    const clusterId = capiv1beta1Mocks.randomCluster1.metadata.name;
    const app = generateApp({
      clusterId,
      namespace: clusterId,
    });

    render(
      getComponent({
        app,
        appsPermissions: { ...defaultAppsPermissions, canConfigure: false },
      })
    );

    // No permissions message is displayed twice: one for configMap values, one for secret values
    const permissionsWarningMessages = screen.getAllByText(
      'For setting those values, you need additional permissions.'
    );
    expect(permissionsWarningMessages).toHaveLength(2);

    expect(
      screen.getByRole('button', { name: 'Upload values' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Upload secret values' })
    ).toBeDisabled();
  });
});
