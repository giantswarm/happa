import React from 'react';
import styled from 'styled-components';
import CachingColorHash from 'utils/cachingColorHash';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const OrgLabelSpan = styled.span`
  margin-right: 2px;
  font-family: Inconsolata, monospace;
  font-size: 0.95em;
  font-weight: 400;
  border-radius: 3px;
  padding: 3px 5px;
  margin-right: 3px;
  margin-bottom: 3px;
  white-space: nowrap;
  display: inline-block;
`;

const colorHash = new CachingColorHash({ lightness: 0.25, saturation: 0.6 });

class CertificateOrgsLabel extends React.Component {
  render() {
    return (
      <Wrapper>
        {this.props.value
          .split(',')
          .sort()
          .map((element, index) => {
            if (element !== '') {
              return (
                <OrgLabelSpan
                  data-testid={`orglabel-${index}`}
                  key={element}
                  style={{
                    backgroundColor: colorHash.calculateColor(element),
                  }}
                >
                  {element}
                </OrgLabelSpan>
              );
            }

            return null;
          })}
      </Wrapper>
    );
  }
}

export default CertificateOrgsLabel;
