'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import moment from 'moment';

class ClusterDetail extends React.Component {
  componentDidMount() {
    this.props.actions.clusterLoadKeyPairs(this.props.cluster.id);
  }

  formatDate(ISO8601DateString) {
    // http://momentjs.com/docs/#/displaying/
    return moment(ISO8601DateString).utc().format('D MMM YYYY, h:mm z');
  }

  render() {
    return (
      <div>
        <div className='row'>
          <div className='col-12'>
            <h1>Details for cluster: {this.props.cluster.name}</h1>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Cluster Name</h3>
          </div>
          <div className='col-9'>
            <p>A meaningful cluster name will make your life easier once you work with multiple clusters.</p>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Key Pairs</h3>
          </div>
          <div className='col-9'>
            <p>Key pairs consist of an RSA private key and certificate, signed by the certificate authority (CA) belonging to this cluster. They are used for access to the cluster via the Kubernetes API.</p>
            <br/>
            {
              this.props.cluster.keyPairs.length === 0 ?
              <p>No key pairs yet. Why don't you create your first?</p>
              :
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>ID</th>
                    <th>Created</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.cluster.keyPairs.map((keyPair) => {
                      console.log(keyPair);
                      return <tr key={keyPair.id}>
                        <td>{keyPair.description}</td>
                        <td>{keyPair.id}</td>
                        <td>{this.formatDate(keyPair.create_date)}</td>
                        <td>{this.formatDate(keyPair.expire_date)}</td>
                      </tr>;
                    })
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
    );
  }
}



function mapStateToProps(state, ownProps) {
  var cluster = state.entities.clusters.items[ownProps.params.clusterId];

  return {
    clusters: state.entities.clusters,
    cluster: cluster
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClusterDetail);

