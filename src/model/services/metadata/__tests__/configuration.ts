import { SelfClient } from 'model/clients/SelfClient';

import { getConfiguration } from '../configuration';

describe('SelfClient::configuration', () => {
  const setRequestMethodMock = jest.fn();
  const setURLMock = jest.fn();
  const executeMock = jest.fn();

  const mockClient = {
    setRequestMethod: setRequestMethodMock,
    setURL: setURLMock,
    execute: executeMock,
  };

  describe('getInstallationInfo', () => {
    it('configures the client correctly', async () => {
      await getConfiguration((mockClient as unknown) as SelfClient);

      expect(setRequestMethodMock).toBeCalledWith('GET');
      expect(setURLMock).toBeCalledWith('/metadata.json');
      expect(executeMock).toBeCalled();
    });
  });
});
