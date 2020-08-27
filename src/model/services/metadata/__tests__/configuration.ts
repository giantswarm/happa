import { IHttpClient } from 'model/clients';

import { getConfiguration } from '../configuration';

describe('MetadataService::configuration', () => {
  const setRequestMethodMock = jest.fn();
  const setURLMock = jest.fn();
  const executeMock = jest.fn();

  const mockClient: IHttpClient = ({
    setRequestMethod: setRequestMethodMock,
    setURL: setURLMock,
    execute: executeMock,
  } as unknown) as IHttpClient;

  describe('getInstallationInfo', () => {
    it('configures the client correctly', async () => {
      await getConfiguration(mockClient);

      expect(setRequestMethodMock).toBeCalledWith('GET');
      expect(setURLMock).toBeCalledWith('/metadata.json');
      expect(executeMock).toBeCalled();
    });
  });
});
