import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { FC, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import styled from 'styled-components';
import {
  CenteredCell,
  ComponentsRow,
  ComponentsWrapper,
  CursorPointerCell,
  TableButton,
  Tr,
} from 'UI/ExpandableSelector/Items';
import RadioInput from 'UI/Inputs/RadioInput';
import KubernetesVersionLabel from 'UI/KubernetesVersionLabel';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';

const FixedWidthTableButton = styled(TableButton)`
  width: 100px;
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
      <Tr
        tabIndex={isSelected ? -1 : 0}
        role='radio'
        aria-checked={isSelected}
        isSelected={isSelected}
        onClick={() => selectRelease(version)}
        onKeyDown={handleTabSelect}
        toneDown={!active}
      >
        <CursorPointerCell>
          <RUMActionTarget name={RUMActions.SelectRelease}>
            <RadioInput
              id={`select-${version}`}
              title={`Select release ${version}`}
              checked={isSelected}
              value={isSelected ? 'true' : 'false'}
              name={`select-${version}`}
              onChange={() => selectRelease(version)}
              rootProps={{ className: 'selection-radio' }}
              bulletProps={{ className: 'selection-bullet' }}
            />
          </RUMActionTarget>
        </CursorPointerCell>
        <CursorPointerCell>{version}</CursorPointerCell>
        <CursorPointerCell>{relativeDate(timestamp)}</CursorPointerCell>
        <CursorPointerCell>
          <KubernetesVersionLabel
            version={kubernetesVersion}
            eolDate={k8sVersionEOLDate}
            hideIcon={true}
            hidePatchVersion={false}
          />
        </CursorPointerCell>
        <CenteredCell onClick={(e) => e.stopPropagation()}>
          <RUMActionTarget
            name={
              collapsed
                ? RUMActions.ShowReleaseDetails
                : RUMActions.HideReleaseDetails
            }
          >
            <FixedWidthTableButton
              data-testid={`show-components-${version}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCollapsed(!collapsed);
              }}
            >
              <i className={`fa fa-${collapsed ? 'eye' : 'eye-with-line'}`} />
              {collapsed ? 'Show' : 'Hide'}
            </FixedWidthTableButton>
          </RUMActionTarget>
        </CenteredCell>
        <CenteredCell onClick={(e) => e.stopPropagation()}>
          <TableButton
            data-testid={`open-changelog-${version}`}
            href={releaseNotesURL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
          >
            <i className='fa fa-open-in-new' />
            Open
          </TableButton>
        </CenteredCell>
      </Tr>
      {!collapsed && (
        <ComponentsRow>
          <td colSpan={6}>
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
          </td>
        </ComponentsRow>
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
