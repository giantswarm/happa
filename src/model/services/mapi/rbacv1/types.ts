import * as metav1 from '../metav1';

export interface IPolicyRule {
  verbs: string[];
  apiGroups?: string[];
  resources?: string[];
  resourcesNames?: string[];
  nonResourceURLs?: string[];
}

export interface IRoleRef {
  apiGroup: string;
  kind: string;
  name: string;
}

export enum SubjectKinds {
  User = 'User',
  Group = 'Group',
  ServiceAccount = 'ServiceAccount',
}

export interface ISubject {
  kind: SubjectKinds;
  name: string;
  namespace?: string;
  apiGroup?: string;
}

export const ClusterRole = 'ClusterRole';

export interface IClusterRole {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof ClusterRole;
  metadata: metav1.IObjectMeta;
  rules: IPolicyRule[] | null;
}

export const ClusterRoleList = 'ClusterRoleList';

export interface IClusterRoleList extends metav1.IList<IClusterRole> {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof ClusterRoleList;
}

export const ClusterRoleBinding = 'ClusterRoleBinding';

export interface IClusterRoleBinding {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof ClusterRoleBinding;
  metadata: metav1.IObjectMeta;
  roleRef: IRoleRef;
  subjects?: ISubject[];
}

export const ClusterRoleBindingList = 'ClusterRoleBindingList';

export interface IClusterRoleBindingList
  extends metav1.IList<IClusterRoleBinding> {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof ClusterRoleBindingList;
}

export const Role = 'Role';

export interface IRole {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof Role;
  metadata: metav1.IObjectMeta;
  rules: IPolicyRule[] | null;
}

export const RoleList = 'RoleList';

export interface IRoleList extends metav1.IList<IRole> {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof RoleList;
}

export const RoleBinding = 'RoleBinding';

export interface IRoleBinding {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof RoleBinding;
  metadata: metav1.IObjectMeta;
  roleRef: IRoleRef;
  subjects?: ISubject[];
}

export const RoleBindingList = 'RoleBindingList';

export interface IRoleBindingList extends metav1.IList<IRoleBinding> {
  apiVersion: 'rbac.authorization.k8s.io/v1';
  kind: typeof RoleBindingList;
}
