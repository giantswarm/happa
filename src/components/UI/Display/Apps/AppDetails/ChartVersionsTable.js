import React from 'react';
import styled from 'styled-components';

import VersionsRow from './VersionsRow';

const ChartVersionTable = styled.table`
  border: 1px solid ${(props) => props.theme.colors.shade4};
  margin-top: 10px;
  table-layout: fixed;

  td {
    vertical-align: middle;
    line-height: 30px;
    code {
      max-width: 150px;
      display: inline-block;
    }
  }

  th.appVersion {
    width: 100px;
  }

  td.appVersion {
    vertical-align: top;
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
    let av = 'unknown';
    if (obj.appVersion) {
      av = obj.appVersion;
    }

    // Create a group if there isn't one yet.
    if (!groups.hasOwnProperty(av)) {
      groups[av] = [];
    }

    // Push the appVersion to the group.
    groups[av].push(obj);

    // Pass the object on to the next loop
    return groups;
  }, {});

  return (
    <ChartVersionTable>
      <thead>
        <tr>
          <th>Version</th>
          <th className='appVersion'>Provides</th>
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

export default ChartVersionsTable;
