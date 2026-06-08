/**
 * Whether data may be sent to external reporting services (Sentry error
 * reporting, TelemetryDeck analytics). Disabled in development so local
 * traffic never reaches those services.
 */
export function isExternalReportingEnabled(): boolean {
  return window.config.environment !== 'development';
}

export function getK8sVersionEOLDate(version: string) {
  if (!version) return null;

  const k8sVersions = window.config.info.general.kubernetesVersions;
  if (!k8sVersions) return null;

  const versionParts = version.split('.');
  if (versionParts.length < 2) return null;
  const minor = `${versionParts[0]}.${versionParts[1]}`;

  const versionInfo = k8sVersions[minor];
  if (!versionInfo) return null;

  return versionInfo.eolDate;
}
