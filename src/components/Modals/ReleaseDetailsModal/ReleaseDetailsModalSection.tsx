import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacingPx * 9}px;
`;

interface IReleaseDetailsModalSectionProps
  extends React.ComponentPropsWithoutRef<'div'> {
  title?: string;
}

const ReleaseDetailsModalSection: React.FC<IReleaseDetailsModalSectionProps> = ({
  title,
  children,
  ...props
}) => {
  return (
    <Wrapper {...props}>
      {title && (
        <h5>
          <strong>{title}</strong>
        </h5>
      )}
      {children}
    </Wrapper>
  );
};

ReleaseDetailsModalSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

export default ReleaseDetailsModalSection;
