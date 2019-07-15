import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  background-color: #30556a;
  border-radius: 5px;
  height: 380px;
  position: relative;
`;

const Inner = styled.div`
  text-align: center;
  opacity: 1;
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;

  & > :last-child {
    margin-bottom: 0px;
  }
`;

class ClusterEmptyState extends React.Component {
  render() {
    return (
      <Wrapper>
        <Inner>
          {(() => {
            if (!this.props.selectedOrganization) {
              return (
                <>
                  <h1>Welcome to Giant Swarm!</h1>
                  <p>There are no organizations yet in your installation.</p>
                  <p>
                    Go to <Link to='organizations'>Manage Organizations</Link>{' '}
                    to create your first organization, then come back to this
                    screen to create your first cluster!
                  </p>
                </>
              );
            } else if (this.props.errorLoadingClusters) {
              return (
                <>
                  <h1>
                    Error loading clusters for organization{' '}
                    <code>{this.props.selectedOrganization}</code>
                  </h1>
                  <p>
                    We&apos;re probably getting things set up for you right now.
                    Come back later or contact our support!
                  </p>
                  <p>
                    You can switch to a different organization by using the
                    organization selector at the top right of the page.
                  </p>
                </>
              );
            } else {
              return (
                <>
                  <h1>
                    Couldn&apos;t find any clusters in organization{' '}
                    <code>{this.props.selectedOrganization}</code>
                  </h1>
                  <p>
                    Make your first cluster by pressing the green &quot;Launch
                    New Cluster&quot; button above.
                  </p>
                  <p>
                    You can switch to a different organization by using the
                    organization selector at the top right of the page.
                  </p>
                </>
              );
            }
          })()}
        </Inner>
      </Wrapper>
    );
  }
}

ClusterEmptyState.propTypes = {
  errorLoadingClusters: PropTypes.bool,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
};

export default ClusterEmptyState;
