export enum AccessControlSubjectTypes {
  Group,
  User,
  ServiceAccount,
}

export interface IAccessControlRoleSubjectItem {
  name: string;
  isEditable: boolean;
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
  groups: IAccessControlRoleSubjectItem[];
  users: IAccessControlRoleSubjectItem[];
  serviceAccounts: IAccessControlRoleSubjectItem[];
  permissions: IAccessControlRoleItemPermission[];
}
