import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledTableDataCell = styled.td`
  text-align: ${({ centered }) => (centered ? 'center' : 'initial')};
`;

const OrganizationListRow = ({
  clusters,
  organization,
  getViewURL,
  supportsMultiAccount,
}) => {
  const orgID = organization.id;
  const organizationDetailURL = getViewURL(orgID);

  const hasCredentials = organization.credentials.length > 0;

  return (
    <tr>
      <StyledTableDataCell data-testid={`${orgID}-name`}>
        <Link to={organizationDetailURL}>{orgID}</Link>
      </StyledTableDataCell>
      <StyledTableDataCell centered={true} data-testid={`${orgID}-clusters`}>
        <Link to={organizationDetailURL}>{clusters.length}</Link>
      </StyledTableDataCell>
      <StyledTableDataCell centered={true} data-testid={`${orgID}-members`}>
        <Link to={organizationDetailURL}>{organization.members.length}</Link>
      </StyledTableDataCell>

      {supportsMultiAccount && (
        <StyledTableDataCell centered={true}>
          {hasCredentials && (
            <Link to={organizationDetailURL}>
              <i className='fa fa-done' />
            </Link>
          )}
        </StyledTableDataCell>
      )}
    </tr>
  );
};

OrganizationListRow.propTypes = {
  getViewURL: PropTypes.func.isRequired,
  organization: PropTypes.object,
  clusters: PropTypes.array,
  supportsMultiAccount: PropTypes.bool,
};

export default OrganizationListRow;
