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

export interface IPermissionsUseCase {
  name: string;
  description?: string;
  category?: string;
  scope: {
    cluster?: boolean;
    namespaces?: UseCaseScopeNamespace[];
  };
  permissions: IPermissionsForUseCase[];
}

export interface IPermissionsForUseCase {
  apiGroups: string[];
  resources: string[];
  resourceNames?: string[];
  verbs: PermissionVerb[];
}

type UseCaseScopeNamespace = 'default' | '*' | string;

export type PermissionsUseCaseStatuses = Record<
  string,
  Record<string, boolean>
>;
