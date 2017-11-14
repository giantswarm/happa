'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import { CodeBlock, Prompt } from './codeblock';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import {connect} from 'react-redux';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import { flashAdd } from '../../actions/flashMessageActions';
import platform from '../../lib/platform';
import ConfigureKubeCtlAlternative from './2_configure_kubectl_alternative';
import request from 'superagent-bluebird-promise';
import ClusterIDLabel from '../shared/cluster_id_label';
import {clustersForOrg} from '../../lib/helpers';

class ConfigKubeCtl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      selectedPlatform: platform,
      alternativeOpen: false,
      gsctlVersion: '0.2.0'
    };
  }

  componentDidMount() {
    request.get('https://downloads.giantswarm.io/gsctl/VERSION')
    .then((response) => {
      if (response.text) {
        this.setState({
          gsctlVersion: response.text
        });
      }
    });


    if (this.props.selectedCluster.nullObject) {
      this.props.dispatch(flashAdd({
        message: <span><b>This organization has no clusters</b><br/>We've inserted values for a sample cluster.</span>,
        class: 'info',
        ttl: 3000
      }));

      this.setState({
        loading: 'failed'
      });
    } else {
      this.setState({
        loading: true
      });

      this.props.actions.clusterLoadDetails(this.props.selectedCluster.id)
      .then(() => {
        this.setState({
          loading: false
        });
      })
      .catch(() => {
        this.props.dispatch(flashAdd({
          message: 'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
          class: 'danger',
          ttl: 3000
        }));

        this.setState({
          loading: 'failed'
        });
      });
    }
  }

  selectCluster(clusterId) {
    this.props.actions.clusterSelect(clusterId);
  }

  selectPlatform(platform) {
    this.setState({
      selectedPlatform: platform
    });
  }

  selectedInstallInstructions() {
    switch(this.state.selectedPlatform) {
      case 'Windows':
        return <div>
          <p>Download <a href={'http://downloads.giantswarm.io/gsctl/' + this.state.gsctlVersion + '/gsctl-' + this.state.gsctlVersion + '-windows-amd64.zip'}><code>gsctl</code> for Windows (64 Bit)</a> or <a href={'http://downloads.giantswarm.io/gsctl/' + this.state.gsctlVersion + '/gsctl-' + this.state.gsctlVersion + '-windows-386.zip'}>32 Bit</a></p>
          <p>Copy the contained <code>gsctl.exe</code> to a convenient location</p>
        </div>;
      case 'MacWithoutBrew':
        return <div>
          <CodeBlock>
            <Prompt>{`curl -O http://downloads.giantswarm.io/gsctl/` + this.state.gsctlVersion + `/gsctl-` + this.state.gsctlVersion + `-darwin-amd64.tar.gz`}</Prompt>
            <Prompt>{`tar xzf gsctl-` + this.state.gsctlVersion + `-darwin-amd64.tar.gz`}</Prompt>
            <Prompt>{`sudo cp gsctl-` + this.state.gsctlVersion + `-darwin-amd64/gsctl /usr/local/bin/`}</Prompt>
          </CodeBlock>
        </div>;
      case 'Mac':
        return <div>
          <p>Installation via <a href='http://brew.sh/' target='_blank'>homebrew</a>:</p>

          <CodeBlock>
            <Prompt>{`brew tap giantswarm/giantswarm`}</Prompt>
            <Prompt>{`brew install gsctl`}</Prompt>
          </CodeBlock>

        </div>;
      case 'Linux':
        return <div>
          <CodeBlock>
            <Prompt>{`curl -O http://downloads.giantswarm.io/gsctl/` + this.state.gsctlVersion + `/gsctl-` + this.state.gsctlVersion + `-linux-amd64.tar.gz`}</Prompt>
            <Prompt>{`tar xzf gsctl-` + this.state.gsctlVersion + `-linux-amd64.tar.gz`}</Prompt>
            <Prompt>{`sudo cp gsctl-` + this.state.gsctlVersion + `-linux-amd64/gsctl /usr/local/bin/`}</Prompt>
          </CodeBlock>
        </div>;
      default:
        <p>Shouldn't be here</p>;

    }
  }

  isSelectedPlatform(platform) {
    return (this.state.selectedPlatform === platform);
  }

  toggleAlternative = () => {
    this.setState({
      alternativeOpen: ! this.state.alternativeOpen
    });
  }

  friendlyClusterName = (cluster) => {
    return cluster.name + ' ' + '(' + cluster.id + ')';
  }

  render() {
    return (
      <Slide>
        <h1>Configure kubectl for cluster: {this.props.selectedCluster.name} <ClusterIDLabel clusterID={this.props.selectedCluster.id} /></h1>

        {
          this.props.selectedOrgClusters.length > 1 ?
          <div>
            <p>Before we continue, make sure that you have the right cluster selected to configure access to:</p>
            <div className='well select-cluster'>
              <div className="select-cluster--dropdown-container">
                <label>Select Cluster:</label>
                <DropdownButton id="cluster-slect-dropdown" title={this.friendlyClusterName(this.props.selectedCluster)}>
                  {
                    _.map(this.props.selectedOrgClusters,
                      cluster => <MenuItem key={cluster.id} onClick={this.selectCluster.bind(this, cluster.id)}>
                        {this.friendlyClusterName(cluster)}
                      </MenuItem>
                    )
                  }
                </DropdownButton>
              </div>

              <p>You might have access to additional clusters after switching to a different organization.</p>
            </div>
          </div>
          :
          undefined
        }

        <p>The <code>gsctl</code> command line utility provides access to your Giant Swarm resources. It's perfectly suited to create credentials for <code>kubectl</code> in one step. Let's install <code>gsctl</code> quickly.</p>

        <p>In case you can't install <code>gsctl</code> right now, we provide an <a href="#alternative">alternative solution below.</a></p>

        <div className="platform_selector">
          <ul className='platform_selector--tabs'>
            <li className={this.isSelectedPlatform('Linux') ? 'active' : null}
                onClick={this.selectPlatform.bind(this, 'Linux')}>Linux</li>

            <li className={this.isSelectedPlatform('Mac') ? 'active' : null}
                onClick={this.selectPlatform.bind(this, 'Mac')}>Mac Homebrew</li>

            <li className={this.isSelectedPlatform('MacWithoutBrew') ? 'active' : null}
                onClick={this.selectPlatform.bind(this, 'MacWithoutBrew')}>Mac</li>

            <li className={this.isSelectedPlatform('Windows') ? 'active' : null}
                onClick={this.selectPlatform.bind(this, 'Windows')}>Windows</li>
          </ul>

          <div className="platform_selector--content">
            {this.selectedInstallInstructions()}
          </div>
        </div>

        <p>Run this command to make sure the installation succeeded:</p>

        <CodeBlock>
          <Prompt>
            {`gsctl --endpoint ` + window.config.apiEndpoint + ` info`}
          </Prompt>
        </CodeBlock>

        <p>Next, we let <code>gsctl</code> do several things in one step:</p>

        <ul>
          <li>Create a new key pair (certificate and private key) for you to access this cluster</li>
          <li>Download your key pair</li>
          <li>Download the CA certificate for your cluster</li>
          <li>Update your kubectl configuration to add settings and credentials for the cluster</li>
        </ul>

        <p>Here is the command that you need to execute for all this:</p>

        <CodeBlock>
          <Prompt>
            {`
              gsctl --endpoint ` + window.config.apiEndpoint + ` \\
                create kubeconfig \\
                --cluster ` + this.props.selectedCluster.id + ` \\
                --certificate-organizations system:masters \\
                --auth-token ` + this.props.user.authToken
            }
          </Prompt>
        </CodeBlock>

        <p>In case you wonder:</p>

        <ul>
          <li><code>--endpoint</code> sets the right API endpoint to use for your installation.</li>
          <li><code>--cluster &lt;cluster_id&gt;</code> selects the cluster to provide access to.</li>
          <li><code>--certificate-organizations system:masters</code> ensures that you will be authorized as an administrator when using this keypair.</li>
          <li><code>--auth-token &lt;token&gt;</code> saves you from having to enter you password again in <code>gsctl</code>, by re-using the token from your current web UI session.</li>
        </ul>

        <div className="aside">
          <p><i className='fa fa-graduation-cap' title='For learners'></i> <code>--certificate-organizations</code> is a flag that sets what group you belong to when authenticating against the Kubernetes API. The default superadmin group on RBAC (Role Based Access Control) enabled clusters is <code>system:masters</code> . All clusters on AWS have RBAC enabled, some of our on-prem (KVM) clusters do not.</p>
        </div>

        <div className="well" id="alternative">
          <div onClick={this.toggleAlternative} className="toggle-alternative">
            {
              this.state.alternativeOpen ? <i className="fa fa-caret-down"></i> : <i className="fa fa-caret-right"></i>
            }

            &nbsp; Show alternative method to configure kubectl without gsctl
          </div>
          {
            this.state.alternativeOpen ? <ConfigureKubeCtlAlternative /> : undefined
          }
        </div>

        <p>After execution, you should see what happened in detail. After credentials and settings have been added, the context matching your Giant Swarm Kubernetes cluster has been selected for use in <code>kubectl</code>. You can now check things using these commands:</p>

        <CodeBlock>
          <Prompt>
            {`kubectl cluster-info`}
          </Prompt>
        </CodeBlock>

        <p>This should print some information on your cluster.</p>

        <CodeBlock>
          <Prompt>
            {`kubectl get nodes`}
          </Prompt>
        </CodeBlock>

        <p>Here you should see a list of the worker nodes in your cluster.</p>

        <p>Now that this is done, let's deploy some software on your cluster and dig a little deeper.</p>

        <div className="component_slider--nav">
          <button onClick={this.props.goToSlide.bind(null, 'download')}><i className="fa fa-caret-left"></i> Back</button>
          <button className='primary' onClick={this.props.goToSlide.bind(null, 'example')}>Continue <i className="fa fa-caret-right"></i></button>
        </div>
      </Slide>
    );
  }
}

ConfigKubeCtl.propTypes = {
  selectedCluster: React.PropTypes.object,
  clusters: React.PropTypes.object,
  dispatch: React.PropTypes.func,
  actions: React.PropTypes.object,
  selectedOrgClusters: React.PropTypes.array,
  user: React.PropTypes.object,
  goToSlide: React.PropTypes.func
};

function mapStateToProps(state) {
  var selectedCluster = state.entities.clusters.items[state.app.selectedCluster];
  var selectedOrgClusters = [];

  if(state.app.selectedOrganization) {
    selectedOrgClusters = clustersForOrg(state.app.selectedOrganization, state.entities.clusters.items);
  }

  // If we can't find the selected cluster
  // create a nullObject that acts like a selectedCluster
  // so most of the page will work
  if (selectedCluster === undefined) {
    if (selectedOrgClusters.length === 0) {
      selectedCluster = {
        id: '12345',
        name: 'Sample Cluster',
        nullObject: true
      };
    } else {
      selectedCluster = state.entities.clusters.items[selectedOrgClusters[0].id];
    }
  }

  return {
    selectedCluster: selectedCluster,
    selectedOrgClusters: selectedOrgClusters,
    clusters: state.entities.clusters,
    user: state.app.loggedInUser
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigKubeCtl);
