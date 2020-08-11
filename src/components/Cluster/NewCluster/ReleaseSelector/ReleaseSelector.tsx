import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getUserIsAdmin } from 'selectors/authSelectors';
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
  collapsible?: boolean;
  autoSelectLatest?: boolean;
}

const K8sReleaseComponentLabel = styled(ReleaseComponentLabel)`
  margin-left: ${({ theme }) => theme.spacingPx}px;
  margin-bottom: 0;
`;

const ReleaseSelector: FC<IReleaseSelector> = ({
  selectRelease,
  selectedRelease,
  collapsible,
  autoSelectLatest,
}) => {
  const releases = useSelector(getReleases);
  const sortedReleaseVersions = useSelector(getSortedReleaseVersions);
  const releasesIsFetching = useSelector(getReleasesIsFetching);
  const releasesError = useSelector(getReleasesError);

  const isAdmin = useSelector(getUserIsAdmin);

  const selectedKubernetesVersion = useMemo(
    () => releases[selectedRelease]?.kubernetesVersion,
    [releases, selectedRelease]
  );

  useEffect(() => {
    if (autoSelectLatest && sortedReleaseVersions.length !== 0) {
      selectRelease(sortedReleaseVersions[0]);
    }
  }, [selectRelease, sortedReleaseVersions, autoSelectLatest]);

  const [collapsed, setCollapsed] = useState(collapsible as boolean);

  const handleCollapse = () => {
    if (collapsible) {
      setCollapsed(!collapsed);
    }
  };

  const handleTabSelect = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    // Handle tapping the space bar.
    if (e.key === ' ') {
      e.preventDefault();
      handleCollapse();
    }
  };

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
        <ListToggler
          role='button'
          id='release-selector__toggler'
          aria-expanded={!collapsed}
          tabIndex={0}
          onClick={handleCollapse}
          collapsible={collapsible as boolean}
          onKeyDown={handleTabSelect}
        >
          {collapsible && (
            <i
              className={`fa fa-caret-${collapsed ? 'right' : 'bottom'}`}
              aria-hidden='true'
              aria-label='Toggle'
              role='presentation'
            />
          )}
          Available releases
        </ListToggler>
      </div>
      {!collapsed && (
        <>
          {isAdmin && (
            <p>
              <i className='fa fa-warning' /> Light font color indicates an
              inactive or wip release only available to Giant Swarm staff
            </p>
          )}
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
            <tbody
              role='radiogroup'
              tabIndex={-1}
              aria-labelledby='release-selector__toggler'
            >
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
        </>
      )}
    </LoadingOverlay>
  );
};

ReleaseSelector.propTypes = {
  selectRelease: PropTypes.func.isRequired,
  selectedRelease: PropTypes.string.isRequired,
  collapsible: PropTypes.bool,
  autoSelectLatest: PropTypes.bool,
};

ReleaseSelector.defaultProps = {
  collapsible: true,
  autoSelectLatest: true,
};

export default ReleaseSelector;
