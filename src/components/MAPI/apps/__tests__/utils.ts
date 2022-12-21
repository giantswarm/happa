import { RJSFSchema } from '@rjsf/utils';
import { HttpClientImpl } from 'model/clients/HttpClient';
import { StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import { createApp, resolveExternalSchemaRef } from '../utils';

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
        labels: {
          'app-operator.giantswarm.io/version': '1.0.0',
          'giantswarm.io/cluster': 'some-cluster',
        },
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

      await createApp(
        clientFactory,
        authProvider,
        'some-cluster',
        'some-cluster',
        false,
        {
          name: 'cool-app',
          namespace: 'cool-app-ns',
          version: '1.2.3',
          chartName: 'cool-app-chart',
          catalogName: 'cool-apps-123',
          configMapContents: 'some-yaml',
          secretContents: 'some-yaml',
        }
      );
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

      await createApp(
        clientFactory,
        authProvider,
        'some-cluster',
        'some-cluster',
        false,
        {
          name: 'cool-app',
          namespace: 'cool-app-ns',
          version: '1.2.3',
          chartName: 'cool-app-chart',
          catalogName: 'cool-apps-123',
          configMapContents: '',
          secretContents: '',
        }
      );
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

      await createApp(
        clientFactory,
        authProvider,
        'some-cluster',
        'some-cluster',
        false,
        {
          name: 'cool-app',
          namespace: 'cool-app-ns',
          version: '1.2.3',
          chartName: 'cool-app-chart',
          catalogName: 'cool-apps-123',
          configMapContents: '',
          secretContents: '',
        }
      );
    });
  });

  describe('resolveExternalSchemaRef', () => {
    it('resolves external schema references into the parent schema', async () => {
      const schema: RJSFSchema = {
        $schema: 'http://json-schema.org/schema#',
        type: 'object',
        properties: {
          someProperty: {
            $ref: 'https://schema.giantswarm.io/someProperty/v0.0.1',
          },
          anotherProperty: {
            type: 'array',
            items: {
              $ref: 'https://schema.giantswarm.io/anotherProperty/v0.0.1',
            },
          },
        },
      };

      const externalSchema1 = {
        $id: 'https://schema.giantswarm.io/someProperty/v0.0.1',
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        description: 'Some test property.',
        properties: {
          name: {
            description: 'Some property name.',
            examples: ['example'],
            title: 'Name',
            type: 'string',
          },
        },
        required: ['name'],
        title: 'Some property for testing purposes',
        type: 'object',
      };

      const externalSchema2 = {
        $id: 'https://schema.giantswarm.io/anotherProperty/v0.0.1',
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        title: 'Another property for testing purposes',
        type: 'string',
      };

      nock('https://schema.giantswarm.io')
        .get('/someProperty/v0.0.1')
        .reply(StatusCodes.Ok, externalSchema1);

      nock('https://schema.giantswarm.io')
        .get('/anotherProperty/v0.0.1')
        .reply(StatusCodes.Ok, externalSchema2);

      expect(await resolveExternalSchemaRef(clientFactory(), schema)).toEqual({
        ...schema,
        $defs: {
          'https:schema.giantswarm.iosomePropertyv0.0.1': {
            $id: '/$defs/https:schema.giantswarm.iosomePropertyv0.0.1',
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            description: 'Some test property.',
            properties: {
              name: {
                description: 'Some property name.',
                examples: ['example'],
                title: 'Name',
                type: 'string',
              },
            },
            required: ['name'],
            title: 'Some property for testing purposes',
            type: 'object',
          },
          'https:schema.giantswarm.ioanotherPropertyv0.0.1': {
            $id: '/$defs/https:schema.giantswarm.ioanotherPropertyv0.0.1',
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            title: 'Another property for testing purposes',
            type: 'string',
          },
        },
      });
    });

    it('resolves duplicate external schema only once', async () => {
      const schema: RJSFSchema = {
        $schema: 'http://json-schema.org/schema#',
        type: 'object',
        properties: {
          someProperty: {
            $ref: 'https://schema.giantswarm.io/someProperty/v0.0.1',
          },
          someProperty2: {
            $ref: 'https://schema.giantswarm.io/someProperty/v0.0.1',
          },
        },
      };

      const externalSchema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://schema.giantswarm.io/someProperty/v0.0.1',
        description: 'Some test property.',
        properties: {
          name: {
            description: 'Some property name.',
            examples: ['example'],
            title: 'Name',
            type: 'string',
          },
        },
        required: ['name'],
        title: 'Some property for testing purposes',
        type: 'object',
      };

      nock('https://schema.giantswarm.io')
        .get('/someProperty/v0.0.1')
        .reply(StatusCodes.Ok, externalSchema);

      expect(await resolveExternalSchemaRef(clientFactory(), schema)).toEqual({
        ...schema,
        $defs: {
          'https:schema.giantswarm.iosomePropertyv0.0.1': {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            $id: '/$defs/https:schema.giantswarm.iosomePropertyv0.0.1',
            description: 'Some test property.',
            properties: {
              name: {
                description: 'Some property name.',
                examples: ['example'],
                title: 'Name',
                type: 'string',
              },
            },
            required: ['name'],
            title: 'Some property for testing purposes',
            type: 'object',
          },
        },
      });
    });

    it('resolves relative references within the external schema', async () => {
      const schema: RJSFSchema = {
        $schema: 'http://json-schema.org/schema#',
        type: 'object',
        properties: {
          someProperty: {
            anyOf: [
              { $ref: 'https://schema.giantswarm.io/someProperty/v0.0.1' },
            ],
          },
        },
      };

      const externalSchema = {
        $id: 'https://schema.giantswarm.io/someProperty/v0.0.1',
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $defs: {
          name: {
            description: 'Some property name.',
            examples: ['example'],
            title: 'Name',
            type: 'string',
          },
        },
        description: 'Some test property.',
        properties: {
          name: {
            $ref: '#/$defs/name',
          },
        },
        required: ['name'],
        title: 'Some property for testing purposes',
        type: 'object',
      };

      nock('https://schema.giantswarm.io')
        .get('/someProperty/v0.0.1')
        .reply(StatusCodes.Ok, externalSchema);

      expect(await resolveExternalSchemaRef(clientFactory(), schema)).toEqual({
        ...schema,
        $defs: {
          'https:schema.giantswarm.iosomePropertyv0.0.1': {
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            $id: '/$defs/https:schema.giantswarm.iosomePropertyv0.0.1',
            $defs: {
              name: {
                description: 'Some property name.',
                examples: ['example'],
                title: 'Name',
                type: 'string',
              },
            },
            description: 'Some test property.',
            properties: {
              name: {
                $ref: '#/$defs/https:schema.giantswarm.iosomePropertyv0.0.1/$defs/name',
              },
            },
            required: ['name'],
            title: 'Some property for testing purposes',
            type: 'object',
          },
        },
      });
    });
  });
});
