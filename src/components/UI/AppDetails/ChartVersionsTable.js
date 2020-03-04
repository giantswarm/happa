import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import Copyable from 'shared/Copyable';
import { Ellipsis } from 'styles/';

const StyledCopyable = styled(Copyable)``;

const ChartVersionTable = styled.table`
  border: 1px solid ${props => props.theme.colors.shade4};
  margin-top: 10px;
  max-width: 320px;
  table-layout: fixed;
  white-space: nowrap;
  float: right;

  td {
    vertical-align: top;
    code {
      ${Ellipsis}
      max-width: 150px;
      display: inline-block;
    }

    ${StyledCopyable} {
      float: left;
      margin-bottom: 10px;
    }
  }

  th.appVersion {
    width: 100px;
  }

  td.appVersion {
    border-left: 1px dashed ${props => props.theme.colors.shade1};
    text-align: center;

    ${StyledCopyable} {
      display: inline-block;
      float: none;
      position: relative;
      left: 8px;
      code {
        background-color: ${props => props.theme.colors.darkBlueLighter8};
        color: ${props => props.theme.colors.darkBlue};
      }
    }
  }

  tr:nth-of-type(even) {
    background-color: ${props => props.theme.colors.shade4};
  }
`;

const ChartVersionsTable = props => {
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
              <tr key={appVersionString}>
                <td>
                  {entries.map(appVersionObject => {
                    return (
                      <StyledCopyable
                        key={appVersionObject.version}
                        copyText={appVersionObject.version}
                      >
                        <code>{appVersionObject.version}</code>
                      </StyledCopyable>
                    );
                  })}
                </td>

                <td className='appVersion'>
                  <StyledCopyable copyText={appVersionString}>
                    <code>{appVersionString}</code>
                  </StyledCopyable>
                </td>
              </tr>
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
