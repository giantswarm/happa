import { Box, Keyboard, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { FC, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import styled from 'styled-components';
import { TableButton } from 'UI/Controls/ExpandableSelector/Items';
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

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  return (
    <>
      <StyledTableRow
        tabIndex={isSelected ? -1 : 0}
        role='radio'
        aria-checked={isSelected}
        onClick={() => selectRelease(version)}
        onKeyDown={handleTabSelect}
        aria-label={`Release version ${version}`}
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
                tabIndex: -1,
              }}
              tabIndex={-1}
            />
          </RUMActionTarget>
        </TableCell>
        <StyledTableCell size='small' active={active}>
          <Text>{version}</Text>
        </StyledTableCell>
        <StyledTableCell size='medium' active={active} align='center'>
          <Text>{relativeDate(timestamp)}</Text>
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
            <Keyboard
              onEnter={handleButtonKeyDown}
              onSpace={handleButtonKeyDown}
            >
              <FixedWidthTableButton
                data-testid={`show-components-${version}`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCollapsed(!collapsed);
                }}
              >
                <i
                  role='presentation'
                  aria-hidden={true}
                  className={`fa fa-${collapsed ? 'eye' : 'eye-with-line'}`}
                />
                {collapsed ? 'Show' : 'Hide'}
              </FixedWidthTableButton>
            </Keyboard>
          </RUMActionTarget>
        </TableCell>
        <TableCell
          align='center'
          tabIndex={-1}
          onClick={(e: React.MouseEvent<HTMLTableCellElement>) =>
            e.stopPropagation()
          }
        >
          <Keyboard onEnter={handleButtonKeyDown} onSpace={handleButtonKeyDown}>
            <TableButton
              data-testid={`open-changelog-${version}`}
              href={releaseNotesURL}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              disabled={!releaseNotesURL}
            >
              <i
                className='fa fa-open-in-new'
                aria-hidden={true}
                role='presentation'
              />
              Open
            </TableButton>
          </Keyboard>
        </TableCell>
      </StyledTableRow>
      {!collapsed && (
        <TableRow>
          <TableCell colSpan={6}>
            <Box
              wrap={true}
              direction='row'
              data-testid={`components-${version}`}
            >
              {components
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((component) => (
                  <Box
                    key={component.name}
                    margin={{ right: 'xsmall', bottom: 'xsmall' }}
                  >
                    <ReleaseComponentLabel
                      name={component.name}
                      version={component.version}
                    />
                  </Box>
                ))}
            </Box>
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
