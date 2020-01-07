import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Providers } from 'shared/constants';
import React from 'react';
import styled from '@emotion/styled';

const StyledTableDataCell = styled.td`
  text-align: ${({ centered }) => (centered ? 'center' : 'initial')};
`;

const OrganizationListRow = ({
  clusters,
  organization,
  onDelete,
  getViewURL,
  provider,
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

      {provider !== Providers.KVM && (
        <StyledTableDataCell centered={true}>
          {hasCredentials && (
            <Link to={organizationDetailURL}>
              <i className='fa fa-done' />
            </Link>
          )}
        </StyledTableDataCell>
      )}

      <StyledTableDataCell>
        <div className='contextual'>
          <i
            className='fa fa-delete clickable'
            data-orgid={orgID}
            onClick={onDelete}
            title='Delete this organization'
            data-testid={`${orgID}-delete`}
          />
        </div>
      </StyledTableDataCell>
    </tr>
  );
};

OrganizationListRow.propTypes = {
  getViewURL: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  organization: PropTypes.object,
  clusters: PropTypes.array,
  provider: PropTypes.string,
};

export default OrganizationListRow;
