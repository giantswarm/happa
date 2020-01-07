import { installApp } from 'actions/appActions';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import ClusterPicker from './ClusterPicker';
import GenericModal from '../../Modals/GenericModal';
import InstallAppForm from './InstallAppForm';
import lunr from 'lunr';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import yaml from 'js-yaml';

const InstallAppModal = props => {
  const CLUSTER_PICKER_PAGE = 'CLUSTER_PICKER_PAGE';
  const APP_FORM_PAGE = 'APP_FORM_PAGE';

  const pages = [CLUSTER_PICKER_PAGE, APP_FORM_PAGE];
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);
  const [clusterID, setClusterID] = useState(props.selectedClusterID);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [namespace, setNamespace] = useState('');
  const [namespaceError, setNamespaceError] = useState('');

  const [valuesYAML, setValuesYAML] = useState({});
  const [valuesYAMLError, setValuesYAMLError] = useState('');

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const next = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    }
  };

  const previous = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const maxLength = 63;
  const validateCharacters = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
  const validateStartEnd = /^[a-z0-9](.*[a-z0-9])?$/;

  const onClose = () => {
    setVisible(false);
  };

  const openModal = () => {
    if (clusterID) {
      setPage(1);
    } else {
      setPage(0);
    }
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

  const lunrIndex = lunr(function() {
    this.ref('id');
    this.field('name');
    this.field('owner');
    this.field('id');

    props.clusters.forEach(function(cluster) {
      this.add(cluster);
    }, this);
  });

  let clusters = props.clusters;

  if (query !== '') {
    clusters = lunrIndex
      .search(`${query.trim()  } ${  query.trim()  }*`)
      .map(result => {
        return props.clusters.find(cluster => cluster.id === result.ref);
      });
  }

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

  const updateValuesYAML = files => {
    const reader = new FileReader();

    reader.onload = (function() {
      return function(e) {
        try {
          const parsedYAML = yaml.safeLoad(e.target.result);
          setValuesYAML(parsedYAML);
          setValuesYAMLError('');
        } catch (err) {
          setValuesYAMLError('Unable to parse valid YAML from this file.');
        }
      };
    })(files[0]);

    reader.readAsText(files[0]);
  };

  const validate = str => {
    if (str.length > maxLength) {
      return 'must not be longer than 253 characters';
    }

    if (!str.match(validateStartEnd)) {
      return 'must start and end with lower case alphanumeric characters';
    }

    if (!str.match(validateCharacters)) {
      return `must consist of lower case alphanumeric characters, '-' or '.'`;
    }

    return '';
  };

  const anyValidationErrors = () => {
    if (namespaceError != '' || nameError != '' || valuesYAMLError != '') {
      return true;
    }
  };

  const createApp = () => {
    setLoading(true);

    props
      .dispatch(
        installApp(
          {
            name: name,
            catalog: props.app.catalog,
            chartName: props.app.name,
            version: props.app.version,
            namespace: namespace,
            valuesYAML: valuesYAML,
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
      .catch(error => {
        setLoading(false);
        throw error;
      });
  };

  return (
    <>
      <Button bsStyle='primary' onClick={openModal}>
        Configure &amp; Install
      </Button>
      {(() => {
        switch (pages[page]) {
          case CLUSTER_PICKER_PAGE:
            return (
              <GenericModal
                {...props}
                footer={
                  <>
                    <Button bsStyle='primary' onClick={next}>
                      Next
                    </Button>
                    <Button bsStyle='link' onClick={onClose}>
                      Cancel
                    </Button>
                  </>
                }
                onClose={onClose}
                title={`Install ${props.app.name}: Pick a cluster`}
                visible={visible}
              >
                <ClusterPicker
                  clusters={clusters.filter(c => c.capabilities.canInstallApps)}
                  onChangeQuery={setQuery}
                  onSelectCluster={onSelectCluster}
                  query={query}
                  selectedClusterID={clusterID}
                />
              </GenericModal>
            );

          case APP_FORM_PAGE:
            return (
              <GenericModal
                {...props}
                footer={
                  <>
                    <Button
                      bsStyle='primary'
                      disabled={anyValidationErrors()}
                      loading={loading}
                      onClick={createApp}
                    >
                      Install App
                    </Button>
                    <Button bsStyle='link' onClick={previous}>
                      Pick a different Cluster
                    </Button>
                    <Button bsStyle='link' onClick={onClose}>
                      Cancel
                    </Button>
                  </>
                }
                onClose={onClose}
                title={
                  <>
                    {`Install ${props.app.name} on`}{' '}
                    <ClusterIDLabel clusterID={clusterID} />
                  </>
                }
                visible={visible}
              >
                <InstallAppForm
                  name={name}
                  nameError={nameError}
                  namespace={namespace}
                  namespaceError={namespaceError}
                  onChangeName={updateName}
                  onChangeNamespace={updateNamespace}
                  onChangeValuesYAML={updateValuesYAML}
                  valuesYAML={valuesYAML}
                  valuesYAMLError={valuesYAMLError}
                />
              </GenericModal>
            );
        }
      })()}
    </>
  );
};

InstallAppModal.propTypes = {
  app: PropTypes.object,
  clusters: PropTypes.array,
  dispatch: PropTypes.func,
  selectedClusterID: PropTypes.string,
};

function mapStateToProps(state) {
  const clusters = Object.keys(state.entities.clusters.items).map(clusterID => {
    return {
      id: clusterID,
      name: state.entities.clusters.items[clusterID].name,
      owner: state.entities.clusters.items[clusterID].owner,
      capabilities: state.entities.clusters.items[clusterID].capabilities,
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
