import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import * as rbacv1 from 'model/services/mapi/rbacv1';

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

export interface IRolesForNamespaces
  extends Record<
    string,
    | Omit<rbacv1.IClusterRole, 'apiVersion' | 'kind'>[]
    | Omit<rbacv1.IRole, 'apiVersion' | 'kind'>[]
  > {}

export interface INamespaceResourceRules
  extends Record<string, authorizationv1.IResourceRule[]> {}

export interface IRulesMaps {
  rolesRulesMap: INamespaceResourceRules;
  clusterRolesRulesMap: INamespaceResourceRules;
}

export interface IResourceRuleMap
  extends Record<string, INamespaceResourceRules> {}

export type Bindings =
  | Omit<rbacv1.IRoleBinding, 'apiVersion' | 'kind'>[]
  | Omit<rbacv1.IClusterRoleBinding, 'apiVersion' | 'kind'>[];

enum PermissionsSubjectTypes {
  Myself = 'Myself',
}

export type SubjectTypes = rbacv1.SubjectKinds | PermissionsSubjectTypes;
export const SubjectTypes = {
  ...rbacv1.SubjectKinds,
  ...PermissionsSubjectTypes,
};

export interface IPermissionsSubject {
  user?: string;
  groups?: string[];
  serviceAccount?: string;
}
