import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useState } from 'react';
import {
  CenteredCell,
  ComponentsRow,
  ComponentsWrapper,
  CursorPointerCell,
  TableButton,
  Tr,
} from 'UI/ExpandableSelector/Items';
import RadioInput from 'UI/Inputs/RadioInput';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';

interface IReleaseRow extends IRelease {
  isSelected: boolean;
  selectRelease(releaseVersion: string): void;
}

const ReleaseRow: FC<IReleaseRow> = ({
  changelog,
  components,
  isSelected,
  kubernetesVersion,
  selectRelease,
  timestamp,
  version,
}) => {
  const releaseNotesURL = useMemo(() => changelog[0].description, [changelog]);
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <Tr isSelected={isSelected} onClick={() => selectRelease(version)}>
        <CursorPointerCell>
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
        </CursorPointerCell>
        <CursorPointerCell>{version}</CursorPointerCell>
        <CursorPointerCell>{relativeDate(timestamp)}</CursorPointerCell>
        <CursorPointerCell>{kubernetesVersion}</CursorPointerCell>
        <CenteredCell onClick={(e) => e.stopPropagation()}>
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
  changelog: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  components: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  kubernetesVersion: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  selectRelease: PropTypes.func.isRequired,
  timestamp: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
};

export default ReleaseRow;
