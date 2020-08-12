import { IState } from 'reducers/types';
import { IAppCatalogsMap } from 'stores/appcatalog/types';
import { appCatalogsResponse, getMockCall } from 'testUtils/mockHttpCalls';

import { listCatalogs } from '../actions';

describe('listCatalogs', () => {
  it('does the api call to get catalogs', async () => {
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    const response = (await listCatalogs().doPerform(
      {} as IState,
      () => {}
    )) as IAppCatalogsMap;

    expect(response['giantswarm-incubator'].metadata.name).toEqual(
      'giantswarm-incubator'
    );
  });
});
