import { IHttpClient } from 'model/clients/HttpClient';

import { getConfiguration } from '../configuration';

jest.unmock('model/services/metadata/configuration');

describe('MetadataService::configuration', () => {
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

  describe('getConfiguration', () => {
    it('configures the client correctly', async () => {
      await getConfiguration(mockClient);

      expect(setRequestMethodMock).toBeCalledWith('GET');
      expect(setURLMock).toBeCalledWith('/metadata.json');
      expect(executeMock).toBeCalled();
    });
  });
});
