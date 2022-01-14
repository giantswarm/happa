export type PermissionVerb =
  | 'get'
  | 'watch'
  | 'list'
  | 'create'
  | 'update'
  | 'patch'
  | 'delete'
  | '*'
  | string;

export interface INamespacePermissions
  extends Record<string, PermissionVerb[]> {}

export interface IPermissionMap extends Record<string, INamespacePermissions> {}

export interface IPermissions {
  canGet: boolean;
  canList: boolean;
  canUpdate: boolean;
  canCreate: boolean;
  canDelete: boolean;
}
