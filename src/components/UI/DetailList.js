import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const Label = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  color: ${(props) => props.theme.colors.gray};
  font-weight: unset;
  line-height: unset;
`;

const Value = styled.div`
  margin-bottom: 1em;
  line-height: unset;

  &.code {
    font-family: 'Inconsolata';
  }

  &.breaking {
    word-break: break-all;
  }

  button {
    margin-top: 5px;
  }

  &.well {
    padding: 20px;
    border-radius: 5px;
    margin-top: 5px;
  }
`;

const DetailItem = styled.div``;

const DetailList = (props) => {
  return (
    <DetailItem>
      <Label>{props.title}</Label>
      <Value className={props.className}>{props.children}</Value>
    </DetailItem>
  );
};

DetailList.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default DetailList;
