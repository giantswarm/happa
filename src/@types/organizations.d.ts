interface IOrganizationMember {
  email: string;
}

interface IOrganization {
  id: string;
  members?: IOrganizationMember[] | null;
}
