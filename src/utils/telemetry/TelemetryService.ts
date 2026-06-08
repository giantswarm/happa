import TelemetryDeck from '@telemetrydeck/sdk';
import { isExternalReportingEnabled } from 'utils/config';

/**
 * TelemetryDeck application ID. Not a secret; it only identifies the analytics
 * app to send signals to.
 */
const TELEMETRY_APP_ID = '746BB2DF-C3C7-4DE8-82A7-9848CEEE9585';

/**
 * A singleton wrapper around the TelemetryDeck SDK for sending pageview
 * signals. Tracking is disabled in development, mirroring the Sentry gate in
 * `src/components/index.tsx`.
 */
class TelemetryService {
  private static _instance: TelemetryService | null = null;

  public static getInstance(): TelemetryService {
    if (!TelemetryService._instance) {
      TelemetryService._instance = new TelemetryService();
    }

    return TelemetryService._instance;
  }

  private client: TelemetryDeck | null = null;

  /**
   * Lazily creates the SDK client (only when enabled) and keeps its
   * `clientUser` in sync. The SDK hashes `clientUser` before sending.
   */
  private getClient(clientUser: string): TelemetryDeck | null {
    if (!isExternalReportingEnabled()) {
      return null;
    }

    if (this.client) {
      this.client.clientUser = clientUser;
    } else {
      this.client = new TelemetryDeck({ appID: TELEMETRY_APP_ID, clientUser });
    }

    return this.client;
  }

  /**
   * Sends a pageview signal for an authenticated navigation. Best-effort:
   * failures are swallowed so analytics can never disrupt the app.
   *
   * @param route - normalized route pattern (no concrete resource IDs)
   * @param clientUser - stable user identifier, hashed by the SDK
   */
  public trackPageView(route: string, clientUser: string): void {
    const client = this.getClient(clientUser);
    if (!client) {
      return;
    }

    client
      .signal('pageview', {
        route,
        host: window.location.hostname,
        installation: window.config.info.general.installationName,
        environment: window.config.environment,
      })
      .catch(() => {
        // Analytics is best-effort; never surface failures to the user.
      });
  }
}

export default TelemetryService;
