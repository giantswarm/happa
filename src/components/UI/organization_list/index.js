import { clustersForOrg } from '../../../lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import Row from './row';

const OrganizationList = props => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Clusters</th>
          <th>Members</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {props.organizations.map(organization => {
          return (
            <Row
              clusters={clustersForOrg(organization.id, props.clusters)}
              key={organization.id}
              onClick={props.viewOrganization}
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
  deleteOrganization: PropTypes.func,
  viewOrganization: PropTypes.func,
  organizations: PropTypes.array,
  clusters: PropTypes.object,
};

export default OrganizationList;
