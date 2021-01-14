import { clustersForOrg } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import Row from './OrganizationListRow';

const StyledTableHeader = styled.th`
  text-align: ${({ centered }) => (centered ? 'center' : 'initial')};
`;

const OrganizationList = ({ supportsMultiAccount, ...props }) => {
  return (
    <table>
      <thead>
        <tr>
          <StyledTableHeader>Name</StyledTableHeader>
          <StyledTableHeader centered={true}>Clusters</StyledTableHeader>
          <StyledTableHeader centered={true}>Members</StyledTableHeader>

          {supportsMultiAccount && (
            <StyledTableHeader centered={true}>
              Provider Credentials
            </StyledTableHeader>
          )}
        </tr>
      </thead>
      <tbody>
        {props.organizations.map((organization) => {
          return (
            <Row
              key={organization.id}
              clusters={clustersForOrg(
                organization.id,
                props.organizations,
                props.clusters
              )}
              getViewURL={props.getViewURL}
              organization={organization}
              supportsMultiAccount={supportsMultiAccount}
            />
          );
        })}
      </tbody>
    </table>
  );
};

OrganizationList.propTypes = {
  getViewURL: PropTypes.func.isRequired,
  organizations: PropTypes.array,
  clusters: PropTypes.object,
  supportsMultiAccount: PropTypes.bool,
};

export default OrganizationList;
