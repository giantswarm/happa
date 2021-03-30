import { IList, IObjectMeta } from '../metav1/types';

export interface IOrganizationSpec {}

export interface IOrganization {
  apiVersion: string;
  kind: string;
  metadata: IObjectMeta;
  spec: IOrganizationSpec;
}

export interface IOrganizationList extends IList<IOrganization> {}
