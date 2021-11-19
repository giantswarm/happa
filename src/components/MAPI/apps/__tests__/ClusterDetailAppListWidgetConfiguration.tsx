import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import yaml from 'js-yaml';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import { StatusCodes } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'test/renderUtils';

import ClusterDetailAppListWidgetConfiguration from '../ClusterDetailAppListWidgetConfiguration';

function generateApp(
  name: string = 'some-app',
  version: string = '1.2.1'
): applicationv1alpha1.IApp {
  const namespace = capiv1alpha3Mocks.randomCluster1.metadata.name;

  return {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'App',
    metadata: {
      annotations: {
        'chart-operator.giantswarm.io/force-helm-upgrade': 'true',
      },
      creationTimestamp: new Date().toISOString(),
      finalizers: ['operatorkit.giantswarm.io/app-operator-app'],
      generation: 1,
      labels: {
        app: name,
        'app-operator.giantswarm.io/version': '3.2.1',
        'giantswarm.io/cluster': namespace,
        'giantswarm.io/managed-by': 'Helm',
        'giantswarm.io/organization': 'org1',
        'giantswarm.io/service-type': 'managed',
      },
      name,
      namespace,
      resourceVersion: '294675096',
      selfLink: `/apis/application.giantswarm.io/v1alpha1/namespaces/${namespace}/apps/${name}`,
      uid: '859c4eb1-ece4-4eca-85b2-a4a456b6ae81',
    },
    spec: {
      catalog: 'default',
      config: {
        configMap: {
          name: `${namespace}-cluster-values`,
          namespace,
        },
        secret: {
          name: '',
          namespace: '',
        },
      },
      kubeConfig: {
        context: {
          name: `${namespace}-kubeconfig`,
        },
        inCluster: false,
        secret: {
          name: `${namespace}-kubeconfig`,
          namespace,
        },
      },
      name,
      namespace: 'giantswarm',
      userConfig: {
        configMap: {
          name: '',
          namespace: '',
        },
        secret: {
          name: '',
          namespace: '',
        },
      },
      version,
    },
    status: {
      appVersion: '0.4.1',
      release: {
        lastDeployed: '2021-04-27T16:21:37Z',
        status,
      },
      version,
    },
  };
}

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

describe('ClusterDetailAppListWidgetConfiguration', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays if the app has config values set up', () => {
    const app = generateApp();
    app.spec.userConfig!.configMap = {
      name: 'some-configmap',
      namespace: 'some-namespace',
    };

    render(
      getComponent({
        app,
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
    const app = generateApp();
    app.spec.userConfig!.secret = {
      name: 'some-secret',
      namespace: 'some-namespace',
    };

    render(
      getComponent({
        app,
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
    let app = generateApp();
    delete app.spec.userConfig!.configMap;

    render(
      getComponent({
        app,
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

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

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
      .put(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        app as unknown as nock.DataMatcherMap
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
    const app = generateApp();
    app.spec.userConfig!.configMap = {
      name: `${app.metadata.name}-user-values`,
      namespace: `${app.metadata.namespace}`,
    };

    render(
      getComponent({
        app,
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

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        app as unknown as nock.DataMatcherMap
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
    let app = generateApp();
    delete app.spec.userConfig!.secret;

    render(
      getComponent({
        app,
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

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

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

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        app as unknown as nock.DataMatcherMap
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
    const app = generateApp();
    app.spec.userConfig!.secret = {
      name: `${app.metadata.name}-user-secrets`,
      namespace: `${app.metadata.namespace}`,
    };

    render(
      getComponent({
        app,
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

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`
      )
      .reply(StatusCodes.Ok, app);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${app.metadata.namespace}/apps/${app.metadata.name}/`,
        app as unknown as nock.DataMatcherMap
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
});
