import { IMetaV1List, IMetaV1ObjectMeta } from '../meta/types';

export interface IOrganizationSpec {}

export interface IOrganization {
  apiVersion: string;
  kind: string;
  metadata: IMetaV1ObjectMeta;
  spec: IOrganizationSpec;
}

export interface IOrganizationList extends IMetaV1List<IOrganization> {}
