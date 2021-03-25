import { IClusterRole, IRole } from './types';

export function getManagedBy(role: IRole | IClusterRole): string | undefined {
  if (!role.metadata.labels) return undefined;

  let managedBy = role.metadata.labels['giantswarm.io/managed-by'];
  managedBy ||= role.metadata.labels['app.kubernetes.io/managed-by'];

  return managedBy;
}

export function getUiDisplay(role: IRole | IClusterRole): boolean | undefined {
  const label = role.metadata.labels?.['ui.giantswarm.io/display'];
  if (!label) return undefined;

  return label === 'true';
}

export function getAppBranch(role: IRole | IClusterRole): string | undefined {
  return role.metadata.labels?.['app.giantswarm.io/branch'];
}
