import { FlexRowWithTwoBlocksOnEdges } from 'styles';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const PortMappings = styled.div`
  dl {
    margin-bottom: 0px;

    div {
      display: inline-block;
    }
  }

  dt,
  dd {
    display: inline-block;
  }

  dt {
    margin-left: 10px;
    margin-right: 8px;
  }

  dd {
    margin-right: 15px;
  }
`;

function PortMappingsRow({ cluster }) {
  if (cluster && cluster.kvm && cluster.kvm.port_mappings && cluster.kvm.port_mappings.length !== 0) {
    return (
      <PortMappings>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            Ingress Ports:
            <dl>
              {cluster.kvm.port_mappings.map(mapping => {
                return (
                  <div key={mapping.protocol}>
                    <dt>{mapping.protocol}</dt>
                    <dd>{mapping.port}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
      </PortMappings>
    );
  } else {
    return null;
  }
}

PortMappingsRow.propTypes = {
  cluster: PropTypes.object,
};

export default PortMappingsRow;
