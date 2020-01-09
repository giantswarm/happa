import styled from '@emotion/styled';
import { clustersForOrg } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import { Providers } from 'shared/constants';

import Row from './OrganizationListRow';

const StyledTableHeader = styled.th`
  text-align: ${({ centered }) => (centered ? 'center' : 'initial')};
`;

const OrganizationList = ({ provider, ...props }) => {
  return (
    <table>
      <thead>
        <tr>
          <StyledTableHeader>Name</StyledTableHeader>
          <StyledTableHeader centered={true}>Clusters</StyledTableHeader>
          <StyledTableHeader centered={true}>Members</StyledTableHeader>

          {provider !== Providers.KVM && (
            <StyledTableHeader centered={true}>
              Provider Credentials
            </StyledTableHeader>
          )}

          <StyledTableHeader />
        </tr>
      </thead>
      <tbody>
        {props.organizations.map(organization => {
          return (
            <Row
              key={organization.id}
              clusters={clustersForOrg(organization.id, props.clusters)}
              getViewURL={props.getViewURL}
              onDelete={props.deleteOrganization}
              organization={organization}
              provider={provider}
            />
          );
        })}
      </tbody>
    </table>
  );
};

OrganizationList.propTypes = {
  getViewURL: PropTypes.func.isRequired,
  deleteOrganization: PropTypes.func,
  organizations: PropTypes.array,
  clusters: PropTypes.object,
  provider: PropTypes.string,
};

export default OrganizationList;
