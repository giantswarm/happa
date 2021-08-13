export enum AccessControlSubjectTypes {
  Group,
  User,
  ServiceAccount,
}

export interface IAccessControlRoleSubjectRoleBinding {
  name: string;
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
  namespace: string;
  managedBy: string;
  groups: Record<string, IAccessControlRoleSubjectItem>;
  users: Record<string, IAccessControlRoleSubjectItem>;
  serviceAccounts: Record<string, IAccessControlRoleSubjectItem>;
  permissions: IAccessControlRoleItemPermission[];
}

export interface IAccessControlSubjectPermissions {
  canAdd: boolean;
  canDelete: boolean;
  canList: boolean;
}

export interface IAccessControlPermissions {
  subjects: Record<AccessControlSubjectTypes, IAccessControlSubjectPermissions>;
}

export enum AccessControlRoleSubjectStatus {
  Created,
  Updated,
}

export interface IAccessControlServiceAccount {
  name: string;
  status: AccessControlRoleSubjectStatus;
}
