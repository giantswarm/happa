import '@testing-library/jest-dom/extend-expect';

import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import { appCatalogsResponse, getMockCall } from 'testUtils/mockHttpCalls';

import { listCatalogs } from '../actions';

describe('listCatalogs', () => {
  it('does the api call to get catalogs', async () => {
    getMockCall('/v4/appcatalogs/', appCatalogsResponse);

    const dispatch: IAsynchronousDispatch<{}> = ((() => {}) as unknown) as IAsynchronousDispatch<{}>;
    const response = await listCatalogs().doPerform({}, dispatch);

    expect(response['giantswarm-incubator'].metadata.name).toEqual(
      'giantswarm-incubator'
    );
  });
});
