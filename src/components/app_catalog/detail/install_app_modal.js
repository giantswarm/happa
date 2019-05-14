import { clusterInstallApp } from '../../../actions/clusterActions';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Button from '../../shared/button';
import ClusterIDLabel from '../../shared/cluster_id_label';
import ClusterPicker from './cluster_picker';
import GenericModal from '../../modals/generic_modal';
import InstallAppForm from './install_app_form';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const InstallAppModal = props => {
  const CLUSTER_PICKER_PAGE = 'CLUSTER_PICKER_PAGE';
  const APP_FORM_PAGE = 'APP_FORM_PAGE';

  const pages = [CLUSTER_PICKER_PAGE, APP_FORM_PAGE];
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [clusterID, setClusterID] = useState('');
  const [name, setName] = useState('');
  const [namespace, setNamespace] = useState('');
  const [nameError, setNameError] = useState('');
  const [namespaceError, setNamespaceError] = useState('');
  const [loading, setLoading] = useState(false);

  const next = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    }
  };

  // const previous = () => {
  //   if (page > 0) {
  //     setPage(page - 1);
  //   }
  // };

  const maxLength = 253;
  const validateCharacters = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
  const validateStartEnd = /^[a-z0-9](.*[a-z0-9])?$/;

  const onClose = () => {
    setVisible(false);
  };

  const openModal = () => {
    setPage(0);
    setName(props.app.name);
    setNameError('');
    setNamespace(props.app.name);
    setNamespaceError('');
    setVisible(true);
  };

  const onSelectCluster = clusterID => {
    setClusterID(clusterID);
    next();
  };

  const updateName = newName => {
    if (namespace === name) {
      // If name and namespace are synced up, keep them that way.
      updateNamespace(newName);
    }
    setName(newName);

    setNameError(validate(newName));
  };

  const updateNamespace = namespace => {
    setNamespace(namespace);
    setNamespaceError(validate(namespace));
  };

  const validate = str => {
    if (str.length > maxLength) {
      return 'must not be longer than 253 characters';
    }

    if (!str.match(validateStartEnd)) {
      return 'must start and end with lower case alphanumeric characters';
    }

    if (!str.match(validateCharacters)) {
      return 'must consist of lower case alphanumeric characters, \'-\' or \'.\'';
    }

    return '';
  };

  const anyValidationErrors = () => {
    if (namespaceError != '' || nameError != '') {
      return true;
    }
  };

  const createApp = () => {
    setLoading(true);
    props
      .dispatch(
        clusterInstallApp(
          {
            name: name,
            catalog: props.app.catalog,
            chartName: props.app.name,
            version: props.app.version,
            namespace: namespace,
          },
          clusterID
        )
      )
      .then(() => {
        onClose();
        props.dispatch(
          push(
            `/organizations/${
              props.clusters.find(c => c.id === clusterID).owner
            }/clusters/${clusterID}/`
          )
        );
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <React.Fragment>
      <Button onClick={openModal} bsStyle='primary'>
        Configure &amp; Install
      </Button>
      {(() => {
        switch (pages[page]) {
          case CLUSTER_PICKER_PAGE:
            return (
              <GenericModal
                {...props}
                visible={visible}
                onClose={onClose}
                title={`Install ${props.app.name}: Pick a cluster`}
                footer={
                  <React.Fragment>
                    <Button bsStyle='primary' onClick={next}>
                      Next
                    </Button>
                    <Button bsStyle='link' onClick={onClose}>
                      Cancel
                    </Button>
                  </React.Fragment>
                }
              >
                <ClusterPicker
                  selectedClusterID={clusterID}
                  clusters={props.clusters}
                  onSelectCluster={onSelectCluster}
                />
              </GenericModal>
            );

          case APP_FORM_PAGE:
            return (
              <GenericModal
                {...props}
                visible={visible}
                onClose={onClose}
                title={
                  <React.Fragment>
                    {`Install ${props.app.name} on`}{' '}
                    <ClusterIDLabel clusterID={clusterID} />
                  </React.Fragment>
                }
                footer={
                  <React.Fragment>
                    <Button
                      bsStyle='primary'
                      onClick={createApp}
                      loading={loading}
                      disabled={anyValidationErrors()}
                    >
                      Install App
                    </Button>
                    <Button bsStyle='link' onClick={onClose}>
                      Cancel
                    </Button>
                  </React.Fragment>
                }
              >
                <InstallAppForm
                  name={name}
                  namespace={namespace}
                  nameError={nameError}
                  namespaceError={namespaceError}
                  onChangeName={updateName}
                  onChangeNamespace={updateNamespace}
                />
              </GenericModal>
            );
        }
      })()}
    </React.Fragment>
  );
};

InstallAppModal.propTypes = {
  app: PropTypes.object,
  clusters: PropTypes.array,
  dispatch: PropTypes.func,
};

function mapStateToProps(state) {
  let clusters = Object.keys(state.entities.clusters.items).map(clusterID => {
    return {
      id: clusterID,
      name: state.entities.clusters.items[clusterID].name,
      owner: state.entities.clusters.items[clusterID].owner,
    };
  });

  return { clusters };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InstallAppModal);
