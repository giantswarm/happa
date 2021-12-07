import { Anchor, Text } from 'grommet';
import { RUMActions } from 'model/constants/realUserMonitoring';
import React, { FC } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import styled from 'styled-components';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import Date from 'UI/Display/Date';
import ReleaseStateLabel from 'UI/Display/MAPI/releases/ReleaseStateLabel';
import { TableCell, TableRow } from 'UI/Display/Table';
import RadioInput from 'UI/Inputs/RadioInput';

import { IRelease } from './CreateClusterReleaseSelector';

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

interface IReleaseRow extends IRelease {
  isSelected: boolean;

  selectRelease(releaseVersion: string): void;
}

const ReleaseRow: FC<IReleaseRow> = ({
  state,
  isSelected,
  kubernetesVersion,
  k8sVersionEOLDate,
  releaseNotesURL,
  selectRelease,
  timestamp,
  version,
}) => {
  const isPreviewRelease = state === 'preview';

  const handleSelectRelease = () => {
    if (isPreviewRelease) return;
    selectRelease(version);
  };

  const handleTabSelect = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    // Handle tapping the space bar.
    if (e.key === ' ') {
      e.preventDefault();
      handleSelectRelease();
    }
  };

  return (
    <StyledTableRow
      tabIndex={isSelected ? -1 : 0}
      role='radio'
      aria-checked={isSelected}
      onClick={handleSelectRelease}
      onKeyDown={handleTabSelect}
      aria-label={`Release version ${version}`}
    >
      <TableCell>
        {!isPreviewRelease && (
          <RUMActionTarget name={RUMActions.SelectRelease}>
            <RadioInput
              id={`select-${version}`}
              title={`Select release ${version}`}
              checked={isSelected}
              value={isSelected ? 'true' : 'false'}
              name={`select-${version}`}
              onChange={handleSelectRelease}
              formFieldProps={{
                margin: 'none',
                tabIndex: -1,
              }}
              tabIndex={-1}
            />
          </RUMActionTarget>
        )}
      </TableCell>
      <TableCell size='medium'>
        <Text>{version}</Text>
      </TableCell>
      <TableCell size='small' align='center'>
        <ReleaseStateLabel state={state} />
      </TableCell>
      <TableCell size='small' align='left'>
        <KubernetesVersionLabel
          version={kubernetesVersion}
          eolDate={k8sVersionEOLDate}
          hideIcon={true}
          hidePatchVersion={false}
        />
      </TableCell>
      <TableCell size='medium' align='left'>
        <Date relative={true} value={timestamp} size='small' />
      </TableCell>
      <TableCell
        size='small'
        align='center'
        tabIndex={-1}
        onClick={(e: React.MouseEvent<HTMLTableCellElement>) =>
          e.stopPropagation()
        }
      >
        <Anchor
          data-testid={`open-changelog-${version}`}
          href={releaseNotesURL}
          target='_blank'
          rel='noopener noreferrer'
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          disabled={!releaseNotesURL}
          weight='normal'
        >
          Notes{' '}
          <i
            className='fa fa-open-in-new'
            aria-hidden={true}
            role='presentation'
          />
        </Anchor>
      </TableCell>
    </StyledTableRow>
  );
};

export default ReleaseRow;
