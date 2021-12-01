import { Anchor, Box, Text } from 'grommet';
import { RUMActions } from 'model/constants/realUserMonitoring';
import { ReleaseState } from 'model/services/mapi/releasev1alpha1';
import React, { FC } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import styled from 'styled-components';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import Date from 'UI/Display/Date';
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

const StyledText = styled(Text)`
  text-transform: uppercase;
`;

function mapStateToBackgroundColor(state: ReleaseState) {
  switch (state) {
    case 'active':
      return '#8dc163';
    case 'wip':
      return '#CD8383';
    case 'preview':
      return '#F0DC70';
    case 'deprecated':
    default:
      return '#617d8d';
  }
}

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
  const handleTabSelect = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    // Handle tapping the space bar.
    if (e.key === ' ') {
      e.preventDefault();
      selectRelease(version);
    }
  };

  const stateBackground = mapStateToBackgroundColor(state);

  return (
    <StyledTableRow
      tabIndex={isSelected ? -1 : 0}
      role='radio'
      aria-checked={isSelected}
      onClick={() => selectRelease(version)}
      onKeyDown={handleTabSelect}
      aria-label={`Release version ${version}`}
    >
      <TableCell>
        {state !== 'preview' && (
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
        )}
      </TableCell>
      <TableCell size='medium'>
        <Text>{version}</Text>
      </TableCell>
      <TableCell size='small' align='center'>
        <Box
          pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}
          round='xxsmall'
          background={stateBackground}
        >
          <StyledText size='xsmall' color='background' weight='bold'>
            {state}
          </StyledText>
        </Box>
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
