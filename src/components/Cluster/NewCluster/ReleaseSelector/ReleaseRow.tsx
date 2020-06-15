import { css, Global } from '@emotion/core';
import styled from '@emotion/styled';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useState } from 'react';
import Button from 'react-bootstrap/lib/Button';
import { useSelector } from 'react-redux';
import { getProvider } from 'selectors/mainInfoSelectors';
import RadioInput from 'UI/Inputs/RadioInput';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';

interface IReleaseRow extends IRelease {
  isSelected: boolean;
  selectRelease(releaseVersion: string): void;
}

const TableButton = styled(Button)`
  height: 24px;
  line-height: 24px;
  position: relative;
  top: -2px;
  margin-left: 5px;
  padding: 0px 15px;
  text-transform: uppercase;
  i {
    margin-right: 4px;
  }
`;

const ComponentsWrapper = styled.div`
  margin-left: ${({ theme }) => theme.spacingPx * 9}px;
`;

const Tr = styled.tr<{ isSelected: boolean }>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.foreground : 'transparent'};
  td {
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
`;

const BulletStyle = css`
  span.release-selection-bullet {
    margin-right: 0;
  }
  .release-selection-radio {
    margin-bottom: 0;
  }
`;

const ReleaseRow: FC<IReleaseRow> = ({
  components,
  isSelected,
  selectRelease,
  timestamp,
  version,
}) => {
  const provider = useSelector(getProvider);
  const [collapsed, setCollapsed] = useState(true);
  const kubernetesVersion = useMemo(
    () =>
      components.find((component) => component.name === 'kubernetes')?.version,
    [components]
  );

  return (
    <>
      <Global styles={BulletStyle} />
      <Tr isSelected={isSelected} onClick={() => selectRelease(version)}>
        <td>
          <RadioInput
            id={`select-${version}`}
            title={`Select release ${version}`}
            checked={isSelected}
            value={isSelected ? 'true' : 'false'}
            name={`select-${version}`}
            onChange={() => selectRelease(version)}
            rootProps={{ className: 'release-selection-radio' }}
            bulletProps={{ className: 'release-selection-bullet' }}
          />
        </td>
        <td>{version}</td>
        <td>{relativeDate(timestamp)}</td>
        <td>{kubernetesVersion}</td>
        <td>
          <TableButton
            data-testid={`show-components-${version}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setCollapsed(!collapsed);
            }}
          >
            <i className={`fa fa-${collapsed ? 'eye' : 'eye-with-line'}`} />
            {collapsed ? 'Show' : 'Hide'}
          </TableButton>
        </td>
        <td>
          <TableButton
            data-testid={`open-changelog-${version}`}
            href={`https://github.com/giantswarm/releases/blob/master/${provider}/v${version}/release-notes.md`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
          >
            <i className='fa fa-open-in-new' />
            Open
          </TableButton>
        </td>
      </Tr>
      {!collapsed && (
        <tr>
          <td colSpan={6}>
            <ComponentsWrapper data-testid={`components-${version}`}>
              {components
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((component) => (
                  <ReleaseComponentLabel
                    key={component.name}
                    name={component.name}
                    version={component.version}
                  />
                ))}
            </ComponentsWrapper>
          </td>
        </tr>
      )}
    </>
  );
};

ReleaseRow.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  isSelected: PropTypes.bool.isRequired,
  selectRelease: PropTypes.func.isRequired,
  timestamp: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
};

export default ReleaseRow;
