import * as clusterLabelsActions from 'actions/clusterLabelsActions';
import { V5ClusterLabels } from 'giantswarm';
import PropTypes from 'prop-types';
import React, {
  Reducer,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { connect, DispatchProp } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import EditableValueLabel from 'UI/EditableValueLabel';

import GenericModal from '../../../Modals/GenericModal';
import AddClusterLabel from './AddClusterLabel';

interface IStateProps {
  loading: boolean;
}

interface IDispatchProps extends DispatchProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: Record<string, (...args: any[]) => Promise<any>>;
}

interface IEditClusterLabelsModalProps extends IDispatchProps, IStateProps {
  clusterId: string;
  labels: V5ClusterLabels;
}

interface IUpdateLabelReducerAction {
  label: string;
  value: string;
  reset?: boolean;
}

const EditClusterLabelsModal = ({
  clusterId,
  labels,
  actions,
  loading,
}: IEditClusterLabelsModalProps) => {
  const editableLabels = useMemo(() => {
    const editable: V5ClusterLabels = {};

    for (const labelKey of Object.keys(labels)) {
      if (labelKey.includes('giantswarm.io') === false) {
        editable[labelKey] = labels[labelKey];
      }
    }

    return editable;
  }, [labels]);

  const [modifiedLabels, updateLabel] = useReducer<
    Reducer<V5ClusterLabels, IUpdateLabelReducerAction>
  >((oldLabels, newLabel) => {
    if (newLabel.reset) {
      return {};
    }

    return {
      ...oldLabels,
      [newLabel.label]: newLabel.value,
    };
  }, {});

  const displayLabels = useMemo(
    () => ({ ...editableLabels, ...modifiedLabels }),
    [editableLabels, modifiedLabels]
  );

  const [open, setOpen] = useState(false);
  const closeModal = () => {
    setOpen(false);
    // supply label & value here, typescript demands it
    updateLabel({ label: '', value: '', reset: true });
  };

  const saveLabels = useCallback(() => {
    actions.clusterLabelsPatch(clusterId, modifiedLabels).then(() => {
      closeModal();
    });
  }, [actions, clusterId, modifiedLabels]);

  if (open) {
    return (
      <GenericModal
        visible={true}
        title={
          <>
            Edit labels for <ClusterIDLabel clusterID={clusterId} />
          </>
        }
        onClose={closeModal}
        footer={
          <>
            <Button
              bsStyle='primary'
              loading={loading}
              loadingPosition='left'
              onClick={saveLabels}
              type='submit'
              disabled={Object.keys(modifiedLabels).length === 0}
            >
              {loading ? 'Saving Labels' : 'Save Labels'}
            </Button>
            <Button bsStyle='link' onClick={closeModal}>
              Cancel
            </Button>
          </>
        }
      >
        <>
          <p>
            Here, you can edit the labels of cluster <code>{clusterId}</code>.
            <br />
            Modification or creation of labels with keys containing{' '}
            <code>giantswarm.io</code> is not allowed.
          </p>
          <div>
            {Object.entries(displayLabels).map(([label, value]) => (
              <EditableValueLabel
                key={label}
                label={label}
                value={value}
                onSave={updateLabel}
              />
            ))}
            <AddClusterLabel onSave={updateLabel} />
          </div>
        </>
      </GenericModal>
    );
  }

  return (
    <Button bsStyle='link' onClick={() => setOpen(true)}>
      Edit
    </Button>
  );
};

EditClusterLabelsModal.propTypes = {
  clusterId: PropTypes.string.isRequired,
  labels: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  actions: PropTypes.object,
};

function mapStateToProps(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>,
  ownProps: IEditClusterLabelsModalProps
) {
  return { loading: state.loadingFlags.CLUSTER_LABEL_UPDATE, ...ownProps };
}

function mapDispatchToProps(dispatch: Dispatch): IDispatchProps {
  return {
    // @ts-ignore
    actions: bindActionCreators(clusterLabelsActions, dispatch),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(EditClusterLabelsModal);
