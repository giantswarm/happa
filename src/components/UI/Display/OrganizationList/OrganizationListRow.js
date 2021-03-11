import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow } from 'UI/Display/Table';

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
    <TableRow>
      <TableCell data-testid={`${orgID}-name`}>
        <Link to={organizationDetailURL}>{orgID}</Link>
      </TableCell>
      <TableCell align='center' data-testid={`${orgID}-clusters`}>
        <Link to={organizationDetailURL}>{clusters.length}</Link>
      </TableCell>
      <TableCell align='center' data-testid={`${orgID}-members`}>
        <Link to={organizationDetailURL}>{organization.members.length}</Link>
      </TableCell>

      {supportsMultiAccount && (
        <TableCell align='center'>
          {hasCredentials && (
            <Link to={organizationDetailURL}>
              <i className='fa fa-done' />
            </Link>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

OrganizationListRow.propTypes = {
  getViewURL: PropTypes.func.isRequired,
  organization: PropTypes.object,
  clusters: PropTypes.array,
  supportsMultiAccount: PropTypes.bool,
};

export default OrganizationListRow;
