import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';

const Wrapper = styled.div`
  margin-top: ${({ theme }) => theme.spacingPx * 4}px;
`;

interface IReleaseDetailsModalSectionProps
  extends React.ComponentPropsWithoutRef<'div'> {
  title?: string;
}

const ReleaseDetailsModalSection: React.FC<IReleaseDetailsModalSectionProps> = ({
  title,
  children,
}) => {
  return (
    <Wrapper>
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
