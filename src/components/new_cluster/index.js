'use strict';

import React from 'react';
import {connect} from 'react-redux';
import DocumentTitle from 'react-document-title';
import Button from '../button';

class NewCluster extends React.Component {
  componentDidMount() {

  }

  render() {
    return (
      <DocumentTitle title={'Create Cluster | ' + this.props.selectedOrganization + ' | Giant Swarm'}>
        <div>
          <div className='row'>
            <div className='col-12'>
              <h1>Create a Cluster</h1>
            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Cluster Name</h3>
            </div>
            <div className='col-9'>
              <form>
                <p>Give your cluster a name so you can recognize it in a crowd.</p>
                <input ref='cluster_name' type="text"/>
              </form>
            </div>
          </div>

          <div className='row section'>
            <div className='col-12'>
              <h3 className='table-label'>Worker Configuration</h3>
            </div>
          </div>
          <div className='row'>
            <div className='col-4 new-cluster--worker'>
              <div className="new-cluster--worker-title">
                Worker 1
              </div>
            </div>

            <div className='col-4 new-cluster--worker'>
              <div className="new-cluster--worker-title">
                Worker 2
              </div>
            </div>

            <div className='col-4 new-cluster--add-worker'>

            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Kubernetes Version</h3>
            </div>
            <div className='col-9'>
              <p>1.4.6 (Default)</p>
            </div>
          </div>

          <div className='row'>
            <div className='col-3'>
              <h3 className='table-label'>Master Sizing</h3>
            </div>
            <div className='col-9'>
              <p>Auto Sized (Default)</p>
            </div>
          </div>

          <div className='row section'>
            <div className='col-3'>
              <h3 className='table-label'>Monthly Cost Preview</h3>
            </div>
            <div className='col-9'>
              <p>€150,00</p>
            </div>
          </div>

          <div className='row section'>
            <div className='col-12'>
              <p>Create this cluster now and it will be available for you to use as soon as possible</p>
              <Button type='button' bsSize='large' bsStyle='primary'>Create Cluster</Button>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

NewCluster.propTypes = {
  selectedOrganization: React.PropTypes.string
};

function mapStateToProps(state) {
  var selectedOrganization = state.app.selectedOrganization;

  return {
    selectedOrganization: selectedOrganization
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCluster);