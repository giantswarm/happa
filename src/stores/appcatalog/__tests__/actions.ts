import nock from 'nock';
import { IState } from 'reducers/types';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StatusCodes } from 'shared/constants';
import { listCatalogs, loadAppReadme } from 'stores/appcatalog/actions';
import {
  CLUSTER_LOAD_APP_README_ERROR,
  CLUSTER_LOAD_APP_README_REQUEST,
  CLUSTER_LOAD_APP_README_SUCCESS,
} from 'stores/appcatalog/constants';
import { IAppCatalogsMap } from 'stores/appcatalog/types';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { appCatalogsResponse, getMockCall } from 'testUtils/mockHttpCalls';

describe('appcatalog::actions', () => {
  describe('listCatalogs', () => {
    it('does the api call to get catalogs', async () => {
      getMockCall('/v4/appcatalogs/', appCatalogsResponse);

      const dispatch: IAsynchronousDispatch<{}> = ((() => {}) as unknown) as IAsynchronousDispatch<{}>;
      const response = (await listCatalogs().doPerform(
        {} as IState,
        dispatch
      )) as IAppCatalogsMap;

      expect(response['giantswarm-incubator'].metadata.name).toEqual(
        'giantswarm-incubator'
      );
    });
  });

  describe('loadAppReadme', () => {
    const middlewares = [thunk];
    const mockStore = configureMockStore<IState, IAsynchronousDispatch<IState>>(
      middlewares
    );

    it('dispatches an error if receiving an appVersion without a sources field to check for README URLs', async () => {
      const initialState = {} as IState;
      const store = mockStore(initialState);
      const invalidAppVersion = {} as IAppCatalogApp;

      await store.dispatch(loadAppReadme('notUnderTest', invalidAppVersion));

      const expectedActions = [
        {
          type: CLUSTER_LOAD_APP_README_REQUEST,
          appVersion: invalidAppVersion,
          catalogName: 'notUnderTest',
        },
        {
          type: CLUSTER_LOAD_APP_README_ERROR,
          appVersion: invalidAppVersion,
          catalogName: 'notUnderTest',
          error: 'No list of sources to check for a README.',
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('dispatches an error if receiving an appVersion without a README URLs in its sources field', async () => {
      const initialState = {} as IState;
      const store = mockStore(initialState);
      const appVersionWithEmptySources = ({
        sources: [],
      } as unknown) as IAppCatalogApp;

      await store.dispatch(
        loadAppReadme('notUnderTest', appVersionWithEmptySources)
      );

      const expectedActions = [
        {
          type: CLUSTER_LOAD_APP_README_REQUEST,
          appVersion: appVersionWithEmptySources,
          catalogName: 'notUnderTest',
        },
        {
          type: CLUSTER_LOAD_APP_README_ERROR,
          appVersion: appVersionWithEmptySources,
          catalogName: 'notUnderTest',
          error: 'This app does not reference a README file.',
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('fetches a readme file and dispatches the success action if the appVersion has a README URLs in its sources', async () => {
      const initialState = {} as IState;
      const store = mockStore(initialState);
      nock('http://mockserver.fake')
        .get('/README.md')
        .reply(
          StatusCodes.Ok,
          'This is a sample readme, fetched from http://mockserver.fake/README.md'
        );

      const appVersionWithReadmeInSources = {
        sources: ['http://mockserver.fake/README.md'],
      } as IAppCatalogApp;

      await store.dispatch(
        loadAppReadme('notUnderTest', appVersionWithReadmeInSources)
      );

      const expectedActions = [
        {
          type: CLUSTER_LOAD_APP_README_REQUEST,
          appVersion: appVersionWithReadmeInSources,
          catalogName: 'notUnderTest',
        },
        {
          type: CLUSTER_LOAD_APP_README_SUCCESS,
          appVersion: appVersionWithReadmeInSources,
          catalogName: 'notUnderTest',
          readmeText:
            'This is a sample readme, fetched from http://mockserver.fake/README.md',
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('is able to fetch READMEs from test apps that arent tagged yet, but contain the SHA in the url', async () => {
      const initialState = {} as IState;
      const store = mockStore(initialState);

      nock('http://mockserver.fake')
        .get('/REALLY-LONG-COMMIT-SHA/README.md')
        .reply(
          StatusCodes.Ok,
          'This is a sample readme, fetched from http://mockserver.fake/REALLY-LONG-COMMIT-SHA/README.md'
        );

      const appVersionWithTestVersionReadmeInSources = {
        sources: [
          'http://mockserver.fake/1.2.3-REALLY-LONG-COMMIT-SHA/README.md',
        ],
      } as IAppCatalogApp;

      await store.dispatch(
        loadAppReadme('notUnderTest', appVersionWithTestVersionReadmeInSources)
      );

      const expectedActions = [
        {
          type: CLUSTER_LOAD_APP_README_REQUEST,
          appVersion: appVersionWithTestVersionReadmeInSources,
          catalogName: 'notUnderTest',
        },
        {
          type: CLUSTER_LOAD_APP_README_SUCCESS,
          appVersion: appVersionWithTestVersionReadmeInSources,
          catalogName: 'notUnderTest',
          readmeText:
            'This is a sample readme, fetched from http://mockserver.fake/REALLY-LONG-COMMIT-SHA/README.md',
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('is able to fetch READMEs from test apps that arent tagged yet, but contain the SHA in the url, also if they start with v', async () => {
      const initialState = {} as IState;
      const store = mockStore(initialState);

      nock('http://mockserver.fake')
        .get('/REALLY-LONG-COMMIT-SHA/README.md')
        .reply(
          StatusCodes.Ok,
          'This is a sample readme, fetched from http://mockserver.fake/REALLY-LONG-COMMIT-SHA/README.md'
        );

      const appVersionWithTestVersionReadmeInSources = {
        sources: [
          'http://mockserver.fake/v1.2.3-REALLY-LONG-COMMIT-SHA/README.md',
        ],
      } as IAppCatalogApp;

      await store.dispatch(
        loadAppReadme('notUnderTest', appVersionWithTestVersionReadmeInSources)
      );

      const expectedActions = [
        {
          type: CLUSTER_LOAD_APP_README_REQUEST,
          appVersion: appVersionWithTestVersionReadmeInSources,
          catalogName: 'notUnderTest',
        },
        {
          type: CLUSTER_LOAD_APP_README_SUCCESS,
          appVersion: appVersionWithTestVersionReadmeInSources,
          catalogName: 'notUnderTest',
          readmeText:
            'This is a sample readme, fetched from http://mockserver.fake/REALLY-LONG-COMMIT-SHA/README.md',
        },
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
