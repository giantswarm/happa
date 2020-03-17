import { getInstallationInfo } from '../info';

describe('GiantSwarmService::info', () => {
  const setRequestMethodMock = jest.fn();
  const setURLMock = jest.fn();
  const executeMock = jest.fn();

  const mockClient = {
    setRequestMethod: setRequestMethodMock,
    setURL: setURLMock,
    execute: executeMock,
  };

  it('configures the client correctly', async () => {
    await getInstallationInfo(mockClient);

    expect(setRequestMethodMock).toBeCalledWith('GET');
    expect(setURLMock).toBeCalledWith('/v4/info/');
    expect(executeMock).toBeCalled();
  });
});
