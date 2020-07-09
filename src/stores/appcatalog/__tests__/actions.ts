import '@testing-library/jest-dom/extend-expect';

import { appCatalogsResponse, getMockCall } from 'testUtils/mockHttpCalls';

import { listCatalogs } from '../actions';

describe('listCatalogs', () => {
  it('does the api call to get catalogs', async () => {
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    const response = await listCatalogs().doPerform({}, () => {});

    expect(response['giantswarm-incubator'].metadata.name).toEqual(
      'giantswarm-incubator'
    );
  });
});
