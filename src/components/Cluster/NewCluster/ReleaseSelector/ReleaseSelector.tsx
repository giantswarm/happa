import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useState } from 'react';
import {
  ListToggler,
  SelectedDescription,
  SelectedItem,
  SelectedWrapper,
  Table,
} from 'UI/ExpandableSelector/Selector';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';

import ReleaseRow from './ReleaseRow';

interface IReleaseSelector {
  releases: IReleases;
  selectRelease(releaseVersion: string): void;
  selectableReleases: IRelease[];
  selectedRelease: string;
}

const extractKubernetesVersion: (
  selectedRelease: string,
  releases: IReleases
) => string | undefined = (selectedRelease, releases) => {
  return releases[selectedRelease]?.components.find(
    (component) => component.name === 'kubernetes'
  )?.version;
};

const K8sReleaseComponentLabel = styled(ReleaseComponentLabel)`
  margin-left: ${({ theme }) => theme.spacingPx}px;
  margin-bottom: 0;
`;

const ReleaseSelector: FC<IReleaseSelector> = ({
  releases,
  selectRelease,
  selectableReleases,
  selectedRelease,
}) => {
  const selectedKubernetesVersion = useMemo(
    () => extractKubernetesVersion(selectedRelease, releases),
    [selectedRelease, releases]
  );
  const [collapsed, setCollapsed] = useState(true);

  if (!selectedKubernetesVersion) {
    return (
      <div>
        <p>There is no active release currently available for this platform.</p>
      </div>
    );
  }

  return (
    <>
      <SelectedWrapper>
        <SelectedItem>
          <i className='fa fa-version-tag' /> {selectedRelease}
        </SelectedItem>
        <SelectedDescription>
          This release contains:
          <K8sReleaseComponentLabel
            name='kubernetes'
            version={selectedKubernetesVersion}
          />
        </SelectedDescription>
      </SelectedWrapper>
      <div>
        <ListToggler role='button' onClick={() => setCollapsed(!collapsed)}>
          <i className={`fa fa-caret-${collapsed ? 'right' : 'bottom'}`} />
          Available releases
        </ListToggler>
      </div>
      {!collapsed && (
        <Table>
          <thead>
            <tr>
              <th>&nbsp;</th>
              <th>Version</th>
              <th>Released</th>
              <th>Kubernetes</th>
              <th>Components</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {selectableReleases.map((release) => (
              <ReleaseRow
                key={release.version}
                {...release}
                isSelected={release.version === selectedRelease}
                selectRelease={selectRelease}
              />
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

ReleaseSelector.propTypes = {
  // Version string to a release object i.e.: {"0.1.0": {...}, "0.2.0", {...}}
  // @ts-ignore
  releases: PropTypes.object.isRequired,
  selectRelease: PropTypes.func.isRequired,
  selectableReleases: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
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
    }).isRequired
  ).isRequired,
  selectedRelease: PropTypes.string.isRequired,
};

export default ReleaseSelector;
