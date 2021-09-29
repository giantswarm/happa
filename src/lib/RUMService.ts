import Bowser from 'bowser';
import { History } from 'history';
import { GraphQLClientImpl } from 'model/clients/GraphQLClient';
import { AthenaAnalyticsPayload } from 'model/services/athena';
import * as athena from 'model/services/athena';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { mergeActionNames } from 'utils/realUserMonitoringUtils';
import { v4 as uuid } from 'uuid';
import { getCLS, getFCP, getFID, getLCP, getTTFB, Metric } from 'web-vitals';

import ErrorReporter from './errors/ErrorReporter';

const RESIZE_DEBOUNCE_RATE = 1000; // In ms.

export type RUMServicePayload = AthenaAnalyticsPayload;

export class RUMService {
  public static isEnabled() {
    return window.config.enableRealUserMonitoring;
  }

  public constructor(
    protected history: History,
    protected athenaClient = new GraphQLClientImpl(
      `${window.config.athenaEndpoint}/graphql`
    )
  ) {
    this.reportWebVitals();
  }

  public async submitEvent(
    type: string,
    schemaVersion: number,
    payload: RUMServicePayload
  ) {
    if (!RUMService.isEnabled()) return;

    try {
      await athena.createAnalyticsEvent(this.athenaClient, {
        appID: 'happa',
        sessionID: this.sessionID,
        payloadType: type,
        payloadSchemaVersion: schemaVersion,
        payload,
        uri: location.pathname,
      });
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  public initEvents() {
    window.addEventListener('resize', this.reportResizeEvents.bind(this));
    window.addEventListener('load', this.reportWindowLoad.bind(this));

    this.reportURIChanges();
  }

  protected async submitWebVital(metric: Metric) {
    const actionName = mergeActionNames(RUMActions.WebVitals, metric.name);
    const payload = { [metric.name.toLowerCase()]: metric.value };

    return this.submitEvent(actionName, 1, payload);
  }

  protected reportWebVitals() {
    const handleReport = this.submitWebVital.bind(this);

    getCLS(handleReport, false);
    getFID(handleReport);
    getFCP(handleReport);
    getLCP(handleReport, false);
    getTTFB(handleReport);
  }

  protected reportResizeEvents() {
    window.clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(() => {
      const windowSizes = RUMService.getWindowSizes();
      this.submitEvent(RUMActions.WindowResize, 1, windowSizes);
    }, RESIZE_DEBOUNCE_RATE);
  }

  protected reportWindowLoad() {
    const windowSizes = RUMService.getWindowSizes();
    const clientInfo = Bowser.parse(window.navigator.userAgent);

    this.submitEvent(RUMActions.WindowLoad, 2, {
      sizes: windowSizes,
      client: clientInfo,
    });
  }

  protected reportURIChanges() {
    this.history.listen((e) => {
      if (this.prevURI === e.pathname) return;

      this.prevURI = e.pathname;
      this.submitEvent(RUMActions.URIChange, 1, { pathname: this.prevURI });
    });
  }

  protected sessionID = uuid();

  protected resizeTimeout = 0;

  protected prevURI = '';

  protected static getWindowSizes() {
    return {
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      screenAvailableHeight: window.screen.availHeight,
      screenAvailableWidth: window.screen.availWidth,
    };
  }
}
