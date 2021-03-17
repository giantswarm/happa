export interface IAccessControlRoleItemGroup {
  name: string;
  editable: boolean;
}

export interface IAccessControlRoleItemUser {
  name: string;
  editable: boolean;
}

export interface IAccessControlRoleItemServiceAccount {
  name: string;
  editable: boolean;
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
  apiGroup: string;
  resources: string[];
  resourceNames: string[];
  verbs: AccessControlRoleItemVerb[];
}

export interface IAccessControlRoleItem {
  name: string;
  inCluster: boolean;
  groups: IAccessControlRoleItemGroup[];
  users: IAccessControlRoleItemUser[];
  serviceAccounts: IAccessControlRoleItemServiceAccount[];
  permissions: IAccessControlRoleItemPermission[];
}
