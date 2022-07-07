import * as metav1 from '../metav1';

export interface IObjectReference {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
}

export interface ILocalObjectReference {
  name?: string;
}

export const ServiceAccount = 'ServiceAccount';

export interface IServiceAccount {
  apiVersion: 'v1';
  kind: typeof ServiceAccount;
  metadata: metav1.IObjectMeta;
  secrets?: IObjectReference[];
  imagePullSecrets?: ILocalObjectReference[];
  automountServiceAccountToken?: boolean;
}

export const ServiceAccountList = 'ServiceAccountList';

export interface IServiceAccountList extends metav1.IList<IServiceAccount> {
  apiVersion: 'v1';
  kind: typeof ServiceAccountList;
}

export const ConfigMap = 'ConfigMap';

export interface IConfigMap {
  apiVersion: 'v1';
  kind: typeof ConfigMap;
  metadata: metav1.IObjectMeta;
  immutable?: boolean;
  data?: Record<string, string>;
  binaryData?: Record<string, string>;
}

export interface INodeAddress {
  type: string;
  address: string;
}

export type SecretType = string;

export const Secret = 'Secret';

export interface ISecret {
  apiVersion: 'v1';
  kind: typeof Secret;
  metadata: metav1.IObjectMeta;
  immutable?: boolean;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
  type?: SecretType;
}

export const SecretList = 'SecretList';

export interface ISecretList extends metav1.IList<ISecret> {
  apiVersion: 'v1';
  kind: typeof SecretList;
}

export interface INodeSystemInfo {
  /**
   * The Architecture reported by the node
   */
  architecture: string;
  /**
   * Boot ID reported by the node.
   */
  bootID: string;
  /**
   * ContainerRuntime Version reported by the node through runtime remote API (e.g. docker://1.5.0).
   */
  containerRuntimeVersion: string;
  /**
   * Kernel Version reported by the node from 'uname -r' (e.g. 3.16.0-0.bpo.4-amd64).
   */
  kernelVersion: string;
  /**
   * KubeProxy Version reported by the node.
   */
  kubeProxyVersion: string;
  /**
   * Kubelet Version reported by the node.
   */
  kubeletVersion: string;
  /**
   * MachineID reported by the node. For unique machine identification in the cluster this field is preferred. Learn more from man(5) machine-id: http://man7.org/linux/man-pages/man5/machine-id.5.html
   */
  machineID: string;
  /**
   * The Operating System reported by the node
   */
  operatingSystem: string;
  /**
   * OS Image reported by the node from /etc/os-release (e.g. Debian GNU/Linux 7 (wheezy)).
   */
  osImage: string;
  /**
   * SystemUUID reported by the node. For unique machine identification MachineID is preferred. This field is specific to Red Hat hosts https://access.redhat.com/documentation/en-us/red_hat_subscription_management/1/html/rhsm/uuid
   */
  systemUUID: string;
}
