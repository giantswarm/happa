import {
  AccountSettingsRoutes,
  AppsRoutes,
  ExceptionNotificationTestRoutes,
  MainRoutes,
  OrganizationsRoutes,
} from 'model/constants/routes';
import { matchPath } from 'react-router';

/**
 * Recursively collects all route pattern strings from the (possibly nested)
 * route definition objects in `model/constants/routes`.
 */
function collectRoutePatterns(routes: Record<string, unknown>): string[] {
  return Object.values(routes).flatMap((value) => {
    if (typeof value === 'string') {
      return [value];
    }

    if (value !== null && typeof value === 'object') {
      return collectRoutePatterns(value as Record<string, unknown>);
    }

    return [];
  });
}

const ROUTE_PATTERNS = Array.from(
  new Set(
    [
      MainRoutes,
      AppsRoutes,
      AccountSettingsRoutes,
      ExceptionNotificationTestRoutes,
      OrganizationsRoutes,
    ].flatMap(collectRoutePatterns)
  )
);

function countParams(pattern: string): number {
  return pattern.split('/').filter((segment) => segment.startsWith(':')).length;
}

function countSegments(pattern: string): number {
  return pattern.split('/').filter(Boolean).length;
}

/**
 * Patterns ordered from most to least specific, so that the first exact match
 * found is the best one. When several patterns match the same concrete path
 * (e.g. a static segment vs. an optional parameter), fewer parameters wins;
 * ties are broken by the longer pattern.
 */
const SORTED_PATTERNS = [...ROUTE_PATTERNS].sort((a, b) => {
  const paramDiff = countParams(a) - countParams(b);
  if (paramDiff !== 0) {
    return paramDiff;
  }

  return countSegments(b) - countSegments(a);
});

/**
 * Maps a concrete pathname to its route pattern, e.g.
 * `/organizations/acme/clusters/abc123` ->
 * `/organizations/:orgId/clusters/:clusterId`.
 *
 * Returning the pattern (never the concrete path) keeps real resource names
 * out of analytics and avoids high-cardinality noise. Returns `null` for paths
 * that don't correspond to a known route (e.g. bot probes like
 * `/horde/login.php`), so those are never tracked.
 */
export function normalizePath(pathname: string): string | null {
  const match = SORTED_PATTERNS.find((pattern) =>
    Boolean(matchPath(pathname, { path: pattern, exact: true }))
  );

  return match ?? null;
}
