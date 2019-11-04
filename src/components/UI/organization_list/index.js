import { clustersForOrg } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import Row from './row';

const OrganizationList = props => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th style={{ textAlign: 'center' }}>Clusters</th>
          <th style={{ textAlign: 'center' }}>Members</th>
          <th />
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
