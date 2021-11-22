interface IKeyPair {
  certificate_organizations: string;
  cn_prefix: string;
  description: string;
  ttl_hours: number;
  certificate_authority_data: string;
  client_certificate_data: string;
  client_key_data: string;
}
