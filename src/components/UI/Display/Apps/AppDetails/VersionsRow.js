import React, { useState } from 'react';
import Copyable from 'shared/Copyable';
import styled from 'styled-components';
import Truncated from 'UI/Util/Truncated';

const INITIAL_MAX_CHART_VERSIONS = 5;

const ChartVersion = styled(Copyable)`
  display: inline-block;
  white-space: nowrap;
  line-height: 18px;
`;

const AppVersion = styled(Copyable)`
  line-height: 18px;
  display: inline-block;
  float: none;
  position: relative;
  left: 8px;
  code {
    background-color: ${(props) => props.theme.colors.darkBlueLighter8};
    color: ${(props) => props.theme.colors.darkBlue};
  }
`;

const ExpandVersions = styled.button`
  padding: 0px;
  border: 0px;
  background-color: inherit;
  margin-bottom: 0px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.darkBlueLighter6};

  &:hover {
    background-color: inherit;
  }
`;

const VersionsRow = ({ appVersion, entries, className }) => {
  const [expandVersions, setExpandVersions] = useState(
    INITIAL_MAX_CHART_VERSIONS
  );

  const expand = () => {
    setExpandVersions(entries.length);
  };

  return (
    <tr className={className}>
      <td>
        {entries.slice(0, expandVersions).map((appVersionObject) => {
          return (
            <ChartVersion
              key={appVersionObject.version}
              copyText={appVersionObject.version}
            >
              <Truncated numStart={12} as='code'>
                {appVersionObject.version}
              </Truncated>
            </ChartVersion>
          );
        })}

        {entries.length > expandVersions ? (
          <ExpandVersions onClick={expand}>
            + {(entries.length - expandVersions).toString()} more &hellip;
          </ExpandVersions>
        ) : undefined}
      </td>

      <td className='appVersion'>
        <AppVersion copyText={appVersion}>
          <Truncated numStart={8} as='code'>
            {appVersion}
          </Truncated>
        </AppVersion>
      </td>
    </tr>
  );
};

export default VersionsRow;
