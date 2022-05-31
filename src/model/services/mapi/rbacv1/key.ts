import { IClusterRole, IRole, ISubject, SubjectKinds } from './types';

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

export function getRoleDescription(
  role: IRole | IClusterRole
): string | undefined {
  if (!role.metadata.annotations) return undefined;

  return role.metadata.annotations['giantswarm.io/notes'];
}

export function isSubjectKindUser(subject: ISubject): boolean {
  return isSubjectKind(subject, SubjectKinds.User);
}

export function isSubjectKindGroup(subject: ISubject): boolean {
  return isSubjectKind(subject, SubjectKinds.Group);
}

export function isSubjectKindServiceAccount(subject: ISubject): boolean {
  return isSubjectKind(subject, SubjectKinds.ServiceAccount);
}

function isSubjectKind(subject: ISubject, kind: SubjectKinds): boolean {
  return subject.kind === kind;
}
