import '@testing-library/jest-dom/extend-expect';

import * as types from 'actions/actionTypes';
import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StatusCodes } from 'shared/constants';

import { loadAppReadme } from '../appActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('readme loading', () => {
  afterEach(() => {});

  it('dispatches an error if receiving an appVersion with a sources to check for README URLs', async () => {
    const initialState = {};
    const store = mockStore(initialState);
    const invalidAppVersion = {};

    await store.dispatch(loadAppReadme('notUnderTest', invalidAppVersion));

    const expectedActions = [
      {
        type: types.CLUSTER_LOAD_APP_README_REQUEST,
        appVersion: invalidAppVersion,
        catalogName: 'notUnderTest',
      },
      {
        type: types.CLUSTER_LOAD_APP_README_ERROR,
        appVersion: invalidAppVersion,
        catalogName: 'notUnderTest',
        error: 'No list of sources to check for a README.',
      },
    ];

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches an error if receiving an appVersion without a README URLs in its sources', async () => {
    const initialState = {};
    const store = mockStore(initialState);
    const appVersionWithEmptySources = {
      sources: [],
    };

    await store.dispatch(
      loadAppReadme('notUnderTest', appVersionWithEmptySources)
    );

    const expectedActions = [
      {
        type: types.CLUSTER_LOAD_APP_README_REQUEST,
        appVersion: appVersionWithEmptySources,
        catalogName: 'notUnderTest',
      },
      {
        type: types.CLUSTER_LOAD_APP_README_ERROR,
        appVersion: appVersionWithEmptySources,
        catalogName: 'notUnderTest',
        error: 'This app does not reference a README file.',
      },
    ];

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fetches a readme file and dispatches the success action if the appVersion has a README URLs in its sources', async () => {
    const initialState = {};
    const store = mockStore(initialState);
    nock('http://mockserver.fake')
      .get('/README.md')
      .reply(
        StatusCodes.Ok,
        'This is a sample readme, fetched from http://mockserver.fake/README.md'
      );

    const appVersionWithEmptySources = {
      sources: ['http://mockserver.fake/README.md'],
    };

    await store.dispatch(
      loadAppReadme('notUnderTest', appVersionWithEmptySources)
    );

    const expectedActions = [
      {
        type: types.CLUSTER_LOAD_APP_README_REQUEST,
        appVersion: appVersionWithEmptySources,
        catalogName: 'notUnderTest',
      },
      {
        type: types.CLUSTER_LOAD_APP_README_SUCCESS,
        appVersion: appVersionWithEmptySources,
        catalogName: 'notUnderTest',
        readmeText:
          'This is a sample readme, fetched from http://mockserver.fake/README.md',
      },
    ];

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('is able to fetch READMEs from test apps that arent tagged yet, but contain the SHA in the url', async () => {
    const initialState = {};
    const store = mockStore(initialState);

    nock('http://mockserver.fake')
      .get('/REALLY-LONG-COMMIT-SHA/README.md')
      .reply(
        StatusCodes.Ok,
        'This is a sample readme, fetched from http://mockserver.fake/REALLY-LONG-COMMIT-SHA/README.md'
      );

    const appVersionWithEmptySources = {
      sources: [
        'http://mockserver.fake/1.2.3-REALLY-LONG-COMMIT-SHA/README.md',
      ],
    };

    await store.dispatch(
      loadAppReadme('notUnderTest', appVersionWithEmptySources)
    );

    const expectedActions = [
      {
        type: types.CLUSTER_LOAD_APP_README_REQUEST,
        appVersion: appVersionWithEmptySources,
        catalogName: 'notUnderTest',
      },
      {
        type: types.CLUSTER_LOAD_APP_README_SUCCESS,
        appVersion: appVersionWithEmptySources,
        catalogName: 'notUnderTest',
        readmeText:
          'This is a sample readme, fetched from http://mockserver.fake/REALLY-LONG-COMMIT-SHA/README.md',
      },
    ];

    expect(store.getActions()).toEqual(expectedActions);
  });
});
