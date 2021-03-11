import { clustersForOrg } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';

import Row from './OrganizationListRow';

const StyledTable = styled(Table)`
  width: 100%;
`;

const OrganizationList = ({ supportsMultiAccount, ...props }) => {
  return (
    <StyledTable margin={{ bottom: 'medium' }}>
      <TableHeader>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell align='center'>Clusters</TableCell>
          <TableCell align='center'>Members</TableCell>

          {supportsMultiAccount && (
            <TableCell align='center'>Provider Credentials</TableCell>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
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
      </TableBody>
    </StyledTable>
  );
};

OrganizationList.propTypes = {
  getViewURL: PropTypes.func.isRequired,
  organizations: PropTypes.array,
  clusters: PropTypes.object,
  supportsMultiAccount: PropTypes.bool,
};

export default OrganizationList;
