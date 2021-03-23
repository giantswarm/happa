export enum AccessControlSubjectTypes {
  Group,
  User,
  ServiceAccount,
}

export interface IAccessControlRoleSubjectRoleBinding {
  name: string;
  inCluster: boolean;
  namespace: string;
}

export interface IAccessControlRoleSubjectItem {
  name: string;
  isEditable: boolean;
  roleBindings: IAccessControlRoleSubjectRoleBinding[];
}

export type AccessControlRoleItemVerb =
  | 'get'
  | 'watch'
  | 'list'
  | 'create'
  | 'update'
  | 'patch'
  | 'delete'
  | '*'
  | string;

export interface IAccessControlRoleItemPermission {
  apiGroups: string[];
  resources: string[];
  resourceNames: string[];
  verbs: AccessControlRoleItemVerb[];
}

export interface IAccessControlRoleItem {
  name: string;
  inCluster: boolean;
  managedBy: string;
  groups: Record<string, IAccessControlRoleSubjectItem>;
  users: Record<string, IAccessControlRoleSubjectItem>;
  serviceAccounts: Record<string, IAccessControlRoleSubjectItem>;
  permissions: IAccessControlRoleItemPermission[];
}
