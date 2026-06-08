import { getLoggedInUser } from 'model/stores/main/selectors';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { normalizePath } from './normalizePath';
import TelemetryService from './TelemetryService';

/**
 * Sends a TelemetryDeck pageview signal for each authenticated navigation.
 *
 * Tracking is gated on a logged-in user, so bot probes and unauthenticated
 * pages (login, logout, OAuth callback) are never tracked. The effect runs
 * once the user becomes known and again on every route change, which covers
 * both the initial pageview and subsequent in-app navigation.
 */
export function usePageViewTracking(): void {
  const { pathname } = useLocation();
  const email = useSelector(getLoggedInUser)?.email;

  useEffect(() => {
    if (!email) {
      return;
    }

    const route = normalizePath(pathname);
    if (!route) {
      return;
    }

    TelemetryService.getInstance().trackPageView(route, email);
  }, [pathname, email]);
}
