import React from 'react';
import styled from 'styled-components';
import { FlexRowWithTwoBlocksOnEdges } from 'styles';

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
  if (
    cluster &&
    cluster.kvm &&
    cluster.kvm.port_mappings &&
    cluster.kvm.port_mappings.length !== 0
  ) {
    return (
      <PortMappings>
        <FlexRowWithTwoBlocksOnEdges>
          <div>
            Ingress ports:
            <dl>
              {cluster.kvm.port_mappings.map((mapping) => {
                return (
                  <div key={mapping.protocol}>
                    <dt>{mapping.protocol.toUpperCase()}</dt>
                    <dd>{mapping.port}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </FlexRowWithTwoBlocksOnEdges>
      </PortMappings>
    );
  }

  return null;
}

export default PortMappingsRow;
