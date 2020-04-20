import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

import VersionsRow from './VersionsRow';

const ChartVersionTable = styled.table`
  border: 1px solid ${(props) => props.theme.colors.shade4};
  margin-top: 10px;
  max-width: 320px;
  table-layout: fixed;
  white-space: nowrap;
  float: right;

  td {
    vertical-align: top;
    code {
      max-width: 150px;
      display: inline-block;
    }
  }

  th.appVersion {
    width: 100px;
  }

  td.appVersion {
    border-left: 1px dashed ${(props) => props.theme.colors.shade1};
    text-align: center;
  }

  tr:nth-of-type(even) {
    background-color: ${(props) => props.theme.colors.shade4};
  }
`;

const ChartVersionsTable = (props) => {
  const { appVersions } = props;

  const groupedAppVersions = appVersions.reduce((groups, obj) => {
    // Create a group if there isn't one yet.
    if (!groups.hasOwnProperty(obj.appVersion)) {
      groups[obj.appVersion] = [];
    }

    // Push the appVersion to the group.
    groups[obj.appVersion].push(obj);

    // Pass the object on to the next loop
    return groups;
  }, {});

  return (
    <ChartVersionTable>
      <thead>
        <tr>
          <th>Chart Versions</th>
          <th className='appVersion'>App Version</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(groupedAppVersions).map(
          ([appVersionString, entries]) => {
            return (
              <VersionsRow
                appVersion={appVersionString}
                entries={entries}
                key={appVersionString}
              />
            );
          }
        )}
      </tbody>
    </ChartVersionTable>
  );
};

ChartVersionsTable.propTypes = {
  appVersions: PropTypes.array,
};

export default ChartVersionsTable;
