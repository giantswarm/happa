import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

const OrganizationListRow = props => {
  const orgID = props.organization.id;
  const organizationDetailURL = props.getViewURL(orgID);

  return (
    <tr>
      <td>
        <Link to={organizationDetailURL}>{orgID}</Link>
      </td>
      <td style={{ textAlign: 'center' }}>
        <Link to={organizationDetailURL}>{props.clusters.length}</Link>
      </td>
      <td style={{ textAlign: 'center' }}>
        <Link to={organizationDetailURL}>
          {props.organization.members.length}
        </Link>
      </td>
      <td>
        <div className='contextual'>
          <i
            className='fa fa-delete clickable'
            data-orgid={orgID}
            onClick={props.onDelete}
            title='Delete this organization'
          />
        </div>
      </td>
    </tr>
  );
};

OrganizationListRow.propTypes = {
  getViewURL: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  organization: PropTypes.object,
  clusters: PropTypes.array,
};

export default OrganizationListRow;
