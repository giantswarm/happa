import { IHttpClient } from 'model/clients';

import { getInstallationInfo } from '../info';

jest.unmock('model/services/giantSwarm/info');

describe('GiantSwarmService::info', () => {
  const setRequestMethodMock = jest.fn();
  const setURLMock = jest.fn();
  const executeMock = jest.fn();

  const skipFnImplMock = jest.fn();

  const mockClient: IHttpClient = {
    setRequestMethod: setRequestMethodMock,
    setURL: setURLMock,
    execute: executeMock,

    getRequestConfig: skipFnImplMock,
    setAuthorizationToken: skipFnImplMock,
    setBody: skipFnImplMock,
    setHeader: skipFnImplMock,
    setRequestConfig: skipFnImplMock,
  };

  it('configures the client correctly', async () => {
    await getInstallationInfo(mockClient);

    expect(setRequestMethodMock).toBeCalledWith('GET');
    expect(setURLMock).toBeCalledWith('/v4/info/');
    expect(executeMock).toBeCalled();
  });
});
