import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getReleases,
  getReleasesError,
  getReleasesIsFetching,
  getSortedReleaseVersions,
} from 'selectors/releaseSelectors';
import {
  ListToggler,
  SelectedDescription,
  SelectedItem,
  SelectedWrapper,
  Table,
} from 'UI/ExpandableSelector/Selector';
import LoadingOverlay from 'UI/LoadingOverlay';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';

import ReleaseRow from './ReleaseRow';

interface IReleaseSelector {
  selectRelease(releaseVersion: string): void;
  selectedRelease: string;
}

const K8sReleaseComponentLabel = styled(ReleaseComponentLabel)`
  margin-left: ${({ theme }) => theme.spacingPx}px;
  margin-bottom: 0;
`;

const ReleaseSelector: FC<IReleaseSelector> = ({
  selectRelease,
  selectedRelease,
}) => {
  const releases = useSelector(getReleases);
  const sortedReleaseVersions = useSelector(getSortedReleaseVersions);
  const releasesIsFetching = useSelector(getReleasesIsFetching);
  const releasesError = useSelector(getReleasesError);

  const selectedKubernetesVersion = useMemo(
    () => releases[selectedRelease]?.kubernetesVersion,
    [releases, selectedRelease]
  );

  useEffect(() => {
    if (sortedReleaseVersions.length !== 0) {
      selectRelease(sortedReleaseVersions[0]);
    }
  }, [selectRelease, sortedReleaseVersions]);

  const [collapsed, setCollapsed] = useState(true);

  if (releasesError) {
    return (
      <div>
        <p>
          There was an error loading releases.
          <br />
          {releasesError.toString()}
          <br />
          Please try again later or contact support: support@giantswarm.io
        </p>
      </div>
    );
  } else if (!selectedKubernetesVersion) {
    return (
      <div>
        <p>There is no active release currently available for this platform.</p>
      </div>
    );
  }

  return (
    <LoadingOverlay loading={releasesIsFetching}>
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
            {sortedReleaseVersions.map((version) => (
              <ReleaseRow
                key={version}
                {...releases[version]}
                isSelected={version === selectedRelease}
                selectRelease={selectRelease}
              />
            ))}
          </tbody>
        </Table>
      )}
    </LoadingOverlay>
  );
};

ReleaseSelector.propTypes = {
  selectRelease: PropTypes.func.isRequired,
  selectedRelease: PropTypes.string.isRequired,
};

export default ReleaseSelector;
