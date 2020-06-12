import '@testing-library/jest-dom/extend-expect';

import { IState } from 'reducers/types';
import { IAppCatalogsState } from 'stores/appcatalog/types';
import { appCatalogsResponse, getMockCall } from 'testUtils/mockHttpCalls';

import { listCatalogs } from '../actions';

describe('listCatalogs', () => {
  it('does the api call to get catalogs', async () => {
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    const response: IAppCatalogsState = (await listCatalogs().doPerform(
      {} as IState
    )) as IAppCatalogsState;

    expect(response['giantswarm-incubator'].metadata.name).toEqual(
      'giantswarm-incubator'
    );
  });
});
