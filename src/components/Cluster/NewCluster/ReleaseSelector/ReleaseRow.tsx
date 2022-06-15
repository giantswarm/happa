import { Box, Keyboard, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { RUMActions } from 'model/constants/realUserMonitoring';
import React, { FC, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import ReleaseComponentLabel from 'UI/Display/Cluster/ReleaseComponentLabel';
import Date from 'UI/Display/Date';
import { TableCell, TableRow } from 'UI/Display/Table';
import RadioInput from 'UI/Inputs/RadioInput';

import { IRelease } from './ReleaseSelector';

const INACTIVE_OPACITY = 0.4;

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
  background: ${(props) =>
    props['aria-checked'] && normalizeColor('background-front', props.theme)};

  :hover {
    background: ${(props) =>
      !props['aria-checked'] &&
      normalizeColor('background-contrast', props.theme)};
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

const ReleaseRow: FC<React.PropsWithChildren<IReleaseRow>> = ({
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
          <Date relative={true} value={timestamp} />
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
              <Button
                data-testid={`show-components-${version}`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCollapsed(!collapsed);
                }}
                icon={
                  <i
                    role='presentation'
                    aria-hidden={true}
                    className={`fa fa-${collapsed ? 'eye' : 'eye-with-line'}`}
                  />
                }
              >
                {collapsed ? 'Show' : 'Hide'}
              </Button>
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
            <Button
              data-testid={`open-changelog-${version}`}
              href={releaseNotesURL}
              target='_blank'
              rel='noopener noreferrer'
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              disabled={!releaseNotesURL}
              icon={
                <i
                  className='fa fa-open-in-new'
                  aria-hidden={true}
                  role='presentation'
                />
              }
            >
              Open
            </Button>
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

export default ReleaseRow;
