import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import AZSelection from 'Cluster/AZSelection/AZSelection';
import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
  AZSelectionZonesUpdater,
  IUpdateZoneLabelsPayload,
  IUpdateZonePickerPayload,
} from 'Cluster/AZSelection/AZSelectionUtils';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { computeControlPlaneNodesStats } from 'MAPI/clusters/ClusterDetail/utils';
import { Cluster, ControlPlaneNodeList, NodePool } from 'MAPI/types';
import {
  determineRandomAZs,
  fetchMasterListForCluster,
  fetchMasterListForClusterKey,
  getSupportedAvailabilityZones,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { getProvider } from 'stores/main/selectors';
import useSWR from 'swr';
import InputGroup from 'UI/Inputs/InputGroup';

import {
  INodePoolPropertyProps,
  withNodePoolAvailabilityZones,
} from './patches';

interface IWorkerNodesCreateNodePoolAvailabilityZonesProps
  extends INodePoolPropertyProps,
    Omit<React.ComponentPropsWithoutRef<typeof InputGroup>, 'onChange' | 'id'> {
  cluster: Cluster;
}

const WorkerNodesCreateNodePoolAvailabilityZones: React.FC<IWorkerNodesCreateNodePoolAvailabilityZonesProps> = ({
  id,
  nodePool,
  onChange,
  readOnly,
  disabled,
  autoFocus,
  cluster,
  ...props
}) => {
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const controlPlaneNodeListKey = cluster
    ? fetchMasterListForClusterKey(cluster)
    : null;

  const {
    data: controlPlaneNodeList,
    error: controlPlaneNodeListError,
  } = useSWR<ControlPlaneNodeList, GenericResponseError>(
    controlPlaneNodeListKey,
    () => fetchMasterListForCluster(clientFactory, auth, cluster)
  );

  useEffect(() => {
    if (controlPlaneNodeListError) {
      ErrorReporter.getInstance().notify(controlPlaneNodeListError);
    }
  }, [controlPlaneNodeListError]);

  const controlPlaneZones = useMemo(() => {
    if (
      typeof controlPlaneNodeListError !== 'undefined' ||
      !controlPlaneNodeList
    ) {
      return undefined;
    }

    return computeControlPlaneNodesStats(controlPlaneNodeList.items)
      .availabilityZones;
  }, [controlPlaneNodeList, controlPlaneNodeListError]);

  const provider = useSelector(getProvider);
  const azStats = useSelector(getSupportedAvailabilityZones);

  const [azSelector, setAzSelector] = useState(
    AvailabilityZoneSelection.Automatic
  );
  const [autoZonesCount, setAutoZonesCount] = useState(1);
  const [autoZoneIsValid, setAutoZoneIsValid] = useState(true);
  const [manualZones, setManualZones] = useState<string[]>([]);
  const [manualZonesIsValid, setManualZonesIsValid] = useState(false);

  const handleChange = (selector: AvailabilityZoneSelection) => {
    setAzSelector(selector);
  };

  useEffect(() => {
    if (!controlPlaneZones) return;

    switch (azSelector) {
      case AvailabilityZoneSelection.Automatic:
        onChange({
          isValid: autoZoneIsValid,
          patch: withNodePoolAvailabilityZones(
            determineRandomAZs(autoZonesCount, azStats.all, controlPlaneZones)
          ),
        });
        break;

      case AvailabilityZoneSelection.Manual:
        onChange({
          isValid: manualZonesIsValid,
          patch: withNodePoolAvailabilityZones(manualZones),
        });
        break;

      case AvailabilityZoneSelection.NotSpecified:
        onChange({
          isValid: true,
          patch: withNodePoolAvailabilityZones(undefined),
        });
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    azSelector,
    autoZonesCount,
    autoZoneIsValid,
    manualZones,
    manualZonesIsValid,
    controlPlaneZones,
  ]);

  const handleZoneChange: AZSelectionZonesUpdater = (azSelection) => (
    payload
  ) => {
    switch (azSelection) {
      case AvailabilityZoneSelection.Automatic:
        setAutoZoneIsValid(payload.valid);
        setAutoZonesCount((payload as IUpdateZonePickerPayload).value);
        break;

      case AvailabilityZoneSelection.Manual:
        setManualZonesIsValid(payload.valid);
        setManualZones((payload as IUpdateZoneLabelsPayload).zonesArray);
        break;
    }
  };

  return (
    <InputGroup htmlFor={id} label='Availability zones' {...props}>
      {controlPlaneZones && (
        <AZSelection
          variant={AZSelectionVariants.NodePool}
          uniqueIdentifier={id}
          baseActionName={RUMActions.SelectAZSelection}
          value={azSelector}
          provider={provider}
          onChange={handleChange}
          minNumOfZones={azStats.minCount}
          maxNumOfZones={azStats.maxCount}
          defaultNumOfZones={azStats.defaultCount}
          allZones={azStats.all}
          numOfZones={autoZonesCount}
          selectedZones={manualZones}
          onUpdateZones={handleZoneChange}
        />
      )}
    </InputGroup>
  );
};

WorkerNodesCreateNodePoolAvailabilityZones.propTypes = {
  id: PropTypes.string.isRequired,
  nodePool: (PropTypes.object as PropTypes.Requireable<NodePool>).isRequired,
  cluster: (PropTypes.object as PropTypes.Requireable<Cluster>).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

export default WorkerNodesCreateNodePoolAvailabilityZones;
