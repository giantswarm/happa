import { Accordion, AccordionPanel, Box, Keyboard, Text } from 'grommet';
import { RUMActions } from 'model/constants/realUserMonitoring';
import { ReleaseState } from 'model/services/mapi/releasev1alpha1';
import React, { FC, useMemo, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import styled from 'styled-components';
import { Dot } from 'styles';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import LoadingOverlay from 'UI/Display/Loading/LoadingOverlay';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';
import { compare } from 'utils/semver';

import CreateClusterReleaseRow from './CreateClusterReleaseRow';

const StyledDot = styled(Dot)`
  padding: 0;
`;

const Icon = styled(Text)<{ isActive?: boolean }>`
  margin-left: -5px;
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
`;

export interface IReleaseComponent {
  name: string;
  version: string;
}

export interface IRelease {
  version: string;
  state: ReleaseState;
  timestamp: string;
  kubernetesVersion?: string;
  releaseNotesURL?: string;
  k8sVersionEOLDate?: string;
}

interface ICreateClusterReleaseSelectorProps {
  selectRelease: (releaseVersion: string) => void;
  releases: Record<string, IRelease>;
  selectedRelease: string;
  isLoading?: boolean;
  errorMessage?: string;
  isAdmin?: boolean;
}

const CreateClusterReleaseSelector: FC<ICreateClusterReleaseSelectorProps> = ({
  selectRelease,
  selectedRelease,
  releases,
  isLoading,
  errorMessage,
  isAdmin,
}) => {
  const sortedReleaseVersions = useMemo(() => {
    const releaseCollection = Object.keys(releases);

    return releaseCollection.sort((a, b) => compare(b, a));
  }, [releases]);

  const allReleases = useMemo(() => {
    return sortedReleaseVersions.reduce(
      (acc: typeof releases, releaseVersion: string) => {
        acc[releaseVersion] = releases[releaseVersion];

        return acc;
      },
      {}
    );
  }, [releases, sortedReleaseVersions]);

  const selectedKubernetesVersion = useMemo(() => {
    const currentRelease = allReleases[selectedRelease];
    if (!currentRelease) return null;

    const { kubernetesVersion, k8sVersionEOLDate } = currentRelease;

    return [kubernetesVersion, k8sVersionEOLDate] as const;
  }, [allReleases, selectedRelease]);

  const [collapsed, setCollapsed] = useState(true);

  const handleCollapse = () => {
    setCollapsed((prevState) => !prevState);
  };

  const handleKeyDownCancel = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setCollapsed(true);
  };

  if (errorMessage) {
    return (
      <div>
        <Text>
          There was an error loading releases.
          <br />
          {errorMessage}
          <br />
          Please try again later or contact support: support@giantswarm.io
        </Text>
      </div>
    );
  } else if (!selectedKubernetesVersion) {
    return (
      <div>
        <Text>
          There is no active release currently available for this platform.
        </Text>
      </div>
    );
  }

  return (
    <LoadingOverlay loading={isLoading}>
      <Box
        direction='row'
        gap='xsmall'
        align='center'
        margin={{ bottom: 'small' }}
      >
        <Text aria-label={`Release version: ${selectedRelease}`}>
          <i
            className='fa fa-version-tag'
            role='presentation'
            aria-hidden='true'
          />{' '}
          {selectedRelease}
        </Text>
        <StyledDot />
        <KubernetesVersionLabel
          hidePatchVersion={false}
          version={selectedKubernetesVersion[0]}
          eolDate={selectedKubernetesVersion[1]}
        />
      </Box>
      <Accordion activeIndex={collapsed ? -1 : 0} onActive={handleCollapse}>
        <AccordionPanel
          header={
            <RUMActionTarget
              name={
                collapsed
                  ? RUMActions.ExpandReleases
                  : RUMActions.CollapseReleases
              }
            >
              <Box
                direction='row'
                align='center'
                gap='xsmall'
                role='button'
                title='Show/hide available releases'
              >
                <Icon
                  className='fa fa-chevron-down'
                  isActive={!collapsed}
                  role='presentation'
                  aria-hidden='true'
                  size='28px'
                />
                <Text>Available releases</Text>
              </Box>
            </RUMActionTarget>
          }
        >
          <Keyboard onEsc={handleKeyDownCancel}>
            <Table margin={{ vertical: 'xsmall' }}>
              <TableHeader>
                <TableRow>
                  <TableCell />
                  <TableCell>Version</TableCell>
                  <TableCell align='center'>Status</TableCell>
                  <TableCell align='left'>Kubernetes</TableCell>
                  <TableCell align='left'>Released</TableCell>
                  <TableCell align='left' />
                </TableRow>
              </TableHeader>
              <TableBody
                role='radiogroup'
                tabIndex={-1}
                aria-labelledby='release-selector__toggler'
              >
                {sortedReleaseVersions.map((version) => (
                  <CreateClusterReleaseRow
                    key={version}
                    {...allReleases[version]}
                    isSelected={version === selectedRelease}
                    selectRelease={selectRelease}
                  />
                ))}
              </TableBody>
            </Table>
          </Keyboard>
          {isAdmin && (
            <Box margin={{ vertical: 'xsmall' }}>
              <Text size='small' color='text-weak'>
                <i
                  className='fa fa-info'
                  aria-hidden={true}
                  role='presentation'
                />{' '}
                WIP and deprecated releases are only available to Giant Swarm
                staff.
              </Text>
            </Box>
          )}
        </AccordionPanel>
      </Accordion>
    </LoadingOverlay>
  );
};

export default CreateClusterReleaseSelector;
