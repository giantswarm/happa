import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import { HttpClientImpl } from 'model/clients/HttpClient';
import { StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';

import { createApp } from '../utils';

describe('utils', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let clientFactory: HttpClientFactory;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let authProvider: IOAuth2Provider;

  beforeEach(() => {
    clientFactory = () => new HttpClientImpl();

    authProvider = new TestOAuth2(undefined, true);
  });

  describe('createApp', () => {
    const app = {
      apiVersion: 'application.giantswarm.io/v1alpha1',
      kind: 'App',
      metadata: {
        name: 'cool-app',
        namespace: 'some-cluster',
        labels: { 'app-operator.giantswarm.io/version': '1.0.0' },
      },
      spec: {
        name: 'cool-app-chart',
        namespace: 'cool-app-ns',
        version: '1.2.3',
        catalog: 'cool-apps-123',
        config: {
          configMap: {
            name: 'some-cluster-cluster-values',
            namespace: 'some-cluster',
          },
        },
        kubeConfig: {
          context: {
            name: 'some-cluster',
          },
          inCluster: false,
          secret: {
            name: 'some-cluster-kubeconfig',
            namespace: 'some-cluster',
          },
        },
        userConfig: {
          configMap: {
            name: 'cool-app-user-values',
            namespace: 'some-cluster',
          },
          secret: {
            name: 'cool-app-user-secrets',
            namespace: 'some-cluster',
          },
        },
      },
    };

    it('creates an app and other required resources for a complete configuration', async () => {
      const configMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'cool-app-user-values', namespace: 'some-cluster' },
        data: {
          values: 'some-yaml',
        },
      };

      const secret = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: 'cool-app-user-secrets',
          namespace: 'some-cluster',
        },
        stringData: {
          values: 'some-yaml',
        },
      };

      nock(window.config.mapiEndpoint)
        .get('/api/v1/namespaces/some-cluster/configmaps/cool-app-user-values/')
        .reply(StatusCodes.NotFound, {
          apiVersion: 'v1',
          kind: 'Status',
          message: 'Lolz',
          status: metav1.K8sStatuses.Failure,
          reason: metav1.K8sStatusErrorReasons.NotFound,
          code: StatusCodes.NotFound,
        });

      nock(window.config.mapiEndpoint)
        .get('/api/v1/namespaces/some-cluster/secrets/cool-app-user-secrets/')
        .reply(StatusCodes.NotFound, {
          apiVersion: 'v1',
          kind: 'Status',
          message: 'Lolz',
          status: metav1.K8sStatuses.Failure,
          reason: metav1.K8sStatusErrorReasons.NotFound,
          code: StatusCodes.NotFound,
        });

      nock(window.config.mapiEndpoint)
        .post('/api/v1/namespaces/some-cluster/configmaps/', configMap)
        .reply(StatusCodes.Created, configMap);

      nock(window.config.mapiEndpoint)
        .post('/api/v1/namespaces/some-cluster/secrets/', secret)
        .reply(StatusCodes.Created, secret);

      nock(window.config.mapiEndpoint)
        .post(
          '/apis/application.giantswarm.io/v1alpha1/namespaces/some-cluster/apps/',
          app
        )
        .reply(StatusCodes.Created, app);

      await createApp(clientFactory, authProvider, 'some-cluster', {
        name: 'cool-app',
        namespace: 'cool-app-ns',
        version: '1.2.3',
        chartName: 'cool-app-chart',
        catalogName: 'cool-apps-123',
        configMapContents: 'some-yaml',
        secretContents: 'some-yaml',
      });
    });

    it('updates existing configmaps and secrets if they exist', async () => {
      const configMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: 'cool-app-user-values', namespace: 'some-cluster' },
        data: {
          values: 'some-yaml',
        },
      };

      const secret = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: 'cool-app-user-secrets',
          namespace: 'some-cluster',
        },
        stringData: {
          values: 'some-yaml',
        },
      };

      nock(window.config.mapiEndpoint)
        .get('/api/v1/namespaces/some-cluster/configmaps/cool-app-user-values/')
        .reply(StatusCodes.Ok, configMap);

      nock(window.config.mapiEndpoint)
        .get('/api/v1/namespaces/some-cluster/secrets/cool-app-user-secrets/')
        .reply(StatusCodes.Ok, secret);

      nock(window.config.mapiEndpoint)
        .put(
          '/api/v1/namespaces/some-cluster/configmaps/cool-app-user-values/',
          Object.assign({}, configMap, { data: { values: '' } })
        )
        .reply(StatusCodes.Ok, configMap);

      nock(window.config.mapiEndpoint)
        .put(
          '/api/v1/namespaces/some-cluster/secrets/cool-app-user-secrets/',
          Object.assign({}, secret, { stringData: { values: '' } })
        )
        .reply(StatusCodes.Ok, secret);

      nock(window.config.mapiEndpoint)
        .post(
          '/apis/application.giantswarm.io/v1alpha1/namespaces/some-cluster/apps/',
          app
        )
        .reply(StatusCodes.Created, app);

      await createApp(clientFactory, authProvider, 'some-cluster', {
        name: 'cool-app',
        namespace: 'cool-app-ns',
        version: '1.2.3',
        chartName: 'cool-app-chart',
        catalogName: 'cool-apps-123',
        configMapContents: '',
        secretContents: '',
      });
    });

    it('does not create configmaps or secrets if it is not necessary', async () => {
      nock(window.config.mapiEndpoint)
        .get('/api/v1/namespaces/some-cluster/configmaps/cool-app-user-values/')
        .reply(StatusCodes.NotFound, {
          apiVersion: 'v1',
          kind: 'Status',
          message: 'Lolz',
          status: metav1.K8sStatuses.Failure,
          reason: metav1.K8sStatusErrorReasons.NotFound,
          code: StatusCodes.NotFound,
        });

      nock(window.config.mapiEndpoint)
        .get('/api/v1/namespaces/some-cluster/secrets/cool-app-user-secrets/')
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
          '/apis/application.giantswarm.io/v1alpha1/namespaces/some-cluster/apps/',
          Object.assign({}, app, {
            spec: {
              ...app.spec,
              userConfig: {},
            },
          })
        )
        .reply(StatusCodes.Created, app);

      await createApp(clientFactory, authProvider, 'some-cluster', {
        name: 'cool-app',
        namespace: 'cool-app-ns',
        version: '1.2.3',
        chartName: 'cool-app-chart',
        catalogName: 'cool-apps-123',
        configMapContents: '',
        secretContents: '',
      });
    });
  });
});
