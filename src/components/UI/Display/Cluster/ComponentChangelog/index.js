import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

/**
 * Displays changes for one component. Expects the context of a <dl>.
 */

const Wrapper = styled.div`
  margin-bottom: 10px;
`;

const ComponentName = styled.dt`
  margin-bottom: 5px;
  font-weight: 300;
`;

const ChangeItems = styled.dd`
  margin-left: 20px;
  p {
    margin-block-start: 6px;
    margin-block-end: 6px;
    line-height: 1.4;
  }
  p:first-of-type {
    text-indent: -14px;
  }
  p:first-of-type::before {
    content: '•';
    padding-right: 8px;
  }
`;

function LinkRenderer(p) {
  return (
    <a href={p.href} rel='noopener noreferrer' target='_blank'>
      {p.children}
    </a>
  );
}

const ComponentChangelog = (props) => {
  const { name, changes } = props;

  return (
    <Wrapper>
      <ComponentName>{name}</ComponentName>
      {changes.map((change, index) => {
        return (
          <ChangeItems key={index}>
            <ReactMarkdown components={{ a: LinkRenderer }}>
              {change}
            </ReactMarkdown>
          </ChangeItems>
        );
      })}
    </Wrapper>
  );
};

ComponentChangelog.propTypes = {
  name: PropTypes.string.isRequired,
  changes: PropTypes.array.isRequired,
};

export default ComponentChangelog;
