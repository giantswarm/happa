import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: #30556a;
  border-radius: 5px;
  height: 380px;
  position: relative;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 30px;
  text-align: center;

  & > :last-child {
    margin-bottom: 0px;
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
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
            }

            return (
              <>
                <h1>
                  Couldn&apos;t find any clusters in organization{' '}
                  <code>{this.props.selectedOrganization}</code>
                </h1>
                <p>
                  Make your first cluster by pressing the green &quot;Launch New
                  Cluster&quot; button above.
                </p>
                <p>
                  You can switch to a different organization by using the
                  organization selector at the top right of the page.
                </p>
              </>
            );
          })()}
        </Inner>
      </Wrapper>
    );
  }
}

export default ClusterEmptyState;
