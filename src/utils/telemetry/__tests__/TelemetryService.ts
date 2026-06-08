import TelemetryDeck from '@telemetrydeck/sdk';

import TelemetryService from '../TelemetryService';

jest.mock('@telemetrydeck/sdk', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const MockedTelemetryDeck = TelemetryDeck as jest.MockedClass<
  typeof TelemetryDeck
>;

const signal = jest.fn().mockResolvedValue(undefined);
const originalEnvironment = window.config.environment;

function setEnvironment(environment: GlobalEnvironment) {
  window.config.environment = environment;
}

beforeEach(() => {
  MockedTelemetryDeck.mockReset();
  signal.mockClear();
  MockedTelemetryDeck.mockImplementation(
    () => ({ clientUser: '', signal } as unknown as TelemetryDeck)
  );
});

afterEach(() => {
  setEnvironment(originalEnvironment);
});

describe('TelemetryService', () => {
  it('is a singleton', () => {
    expect(TelemetryService.getInstance()).toBe(TelemetryService.getInstance());
  });

  it('does not track in development', () => {
    setEnvironment('development');

    new TelemetryService().trackPageView('/', 'user@example.com');

    expect(MockedTelemetryDeck).not.toHaveBeenCalled();
    expect(signal).not.toHaveBeenCalled();
  });

  it('sends a pageview signal with route, host, installation and environment', () => {
    setEnvironment('kubernetes');

    new TelemetryService().trackPageView(
      '/organizations/:orgId',
      'user@example.com'
    );

    expect(MockedTelemetryDeck).toHaveBeenCalledWith({
      appID: expect.any(String),
      clientUser: 'user@example.com',
    });
    expect(signal).toHaveBeenCalledWith('pageview', {
      route: '/organizations/:orgId',
      host: 'localhost',
      installation: 'test',
      environment: 'kubernetes',
    });
  });

  it('reuses the client and updates clientUser across pageviews', () => {
    setEnvironment('kubernetes');

    const service = new TelemetryService();
    service.trackPageView('/', 'a@example.com');
    service.trackPageView('/apps', 'b@example.com');

    expect(MockedTelemetryDeck).toHaveBeenCalledTimes(1);
    expect(signal).toHaveBeenCalledTimes(2);
    expect(MockedTelemetryDeck.mock.results[0].value.clientUser).toBe(
      'b@example.com'
    );
  });
});
