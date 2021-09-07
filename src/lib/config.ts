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
