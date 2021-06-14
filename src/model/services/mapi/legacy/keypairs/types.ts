export interface IKeyPair {
  cluster_id: string;
  common_name: string;
  create_date: string;
  description: string;
  certificate_organizations: string;
  serial_number: string;
  ttl: number;
}

export interface IKeyPairList {
  items: IKeyPair[];
}
