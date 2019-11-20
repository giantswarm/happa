import { clustersForOrg } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import Row from './row';
import styled from '@emotion/styled';

const StyledTableHeader = styled.th`
  text-align: ${({ centered }) => (centered ? 'center' : 'initial')};
`;

const OrganizationList = props => {
  return (
    <table>
      <thead>
        <tr>
          <StyledTableHeader>Name</StyledTableHeader>
          <StyledTableHeader centered={true}>Clusters</StyledTableHeader>
          <StyledTableHeader centered={true}>Members</StyledTableHeader>
          <StyledTableHeader centered={true}>Has Credentials</StyledTableHeader>
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
};

export default OrganizationList;
