import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { FC, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import styled from 'styled-components';
import {
  ComponentsWrapper,
  TableButton,
} from 'UI/Controls/ExpandableSelector/Items';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import ReleaseComponentLabel from 'UI/Display/Cluster/ReleaseComponentLabel';
import { TableCell, TableRow } from 'UI/Display/Table';
import RadioInput from 'UI/Inputs/RadioInput';

import { IRelease } from './ReleaseSelector';

const INACTIVE_OPACITY = 0.4;

const FixedWidthTableButton = styled(TableButton)`
  width: 100px;
`;

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
  background: ${(props) =>
    props['aria-checked'] &&
    props.theme.global.colors['background-front'].dark};

  :hover {
    background: ${(props) =>
      !props['aria-checked'] &&
      props.theme.global.colors['background-contrast'].dark};
  }

  .button-wrapper {
    margin-right: 0;
  }
`;

const StyledTableCell = styled(TableCell)<{ active?: boolean }>`
  opacity: ${({ active }) => !active && INACTIVE_OPACITY};
`;

interface IReleaseRow extends IRelease {
  isSelected: boolean;

  selectRelease(releaseVersion: string): void;
}

const ReleaseRow: FC<IReleaseRow> = ({
  active,
  components,
  isSelected,
  kubernetesVersion,
  k8sVersionEOLDate,
  releaseNotesURL,
  selectRelease,
  timestamp,
  version,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  const handleTabSelect = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    // Handle tapping the space bar.
    if (e.key === ' ') {
      e.preventDefault();
      selectRelease(version);
    }
  };

  return (
    <>
      <StyledTableRow
        tabIndex={isSelected ? -1 : 0}
        role='radio'
        aria-checked={isSelected}
        onClick={() => selectRelease(version)}
        onKeyDown={handleTabSelect}
      >
        <TableCell>
          <RUMActionTarget name={RUMActions.SelectRelease}>
            <RadioInput
              id={`select-${version}`}
              title={`Select release ${version}`}
              checked={isSelected}
              value={isSelected ? 'true' : 'false'}
              name={`select-${version}`}
              onChange={() => selectRelease(version)}
              formFieldProps={{
                margin: 'none',
              }}
              tabIndex={-1}
            />
          </RUMActionTarget>
        </TableCell>
        <StyledTableCell active={active}>{version}</StyledTableCell>
        <StyledTableCell active={active} align='center'>
          {relativeDate(timestamp)}
        </StyledTableCell>
        <StyledTableCell active={active} align='center'>
          <KubernetesVersionLabel
            version={kubernetesVersion}
            eolDate={k8sVersionEOLDate}
            hideIcon={true}
            hidePatchVersion={false}
          />
        </StyledTableCell>
        <TableCell
          align='center'
          tabIndex={-1}
          onClick={(e: React.MouseEvent<HTMLTableCellElement>) =>
            e.stopPropagation()
          }
        >
          <RUMActionTarget
            name={
              collapsed
                ? RUMActions.ShowReleaseDetails
                : RUMActions.HideReleaseDetails
            }
          >
            <FixedWidthTableButton
              data-testid={`show-components-${version}`}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                setCollapsed(!collapsed);
              }}
            >
              <i className={`fa fa-${collapsed ? 'eye' : 'eye-with-line'}`} />
              {collapsed ? 'Show' : 'Hide'}
            </FixedWidthTableButton>
          </RUMActionTarget>
        </TableCell>
        <TableCell
          align='center'
          tabIndex={-1}
          onClick={(e: React.MouseEvent<HTMLTableCellElement>) =>
            e.stopPropagation()
          }
        >
          <TableButton
            data-testid={`open-changelog-${version}`}
            href={releaseNotesURL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <i className='fa fa-open-in-new' />
            Open
          </TableButton>
        </TableCell>
      </StyledTableRow>
      {!collapsed && (
        <TableRow>
          <TableCell colSpan={6}>
            <ComponentsWrapper data-testid={`components-${version}`}>
              {components
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((component) => (
                  <ReleaseComponentLabel
                    key={component.name}
                    name={component.name}
                    version={component.version}
                  />
                ))}
            </ComponentsWrapper>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

ReleaseRow.propTypes = {
  active: PropTypes.bool.isRequired,
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
  kubernetesVersion: PropTypes.string,
  k8sVersionEOLDate: PropTypes.string,
  releaseNotesURL: PropTypes.string,
};

export default ReleaseRow;
