import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';

const Wrapper = styled.div`
  text-align: center;
  padding: 20px 30px;
  margin: 100px auto 0 auto;
  border-radius: 4px;
  font-size: 18px;
`;

interface IAppListPlaceholderProps
  extends React.ComponentPropsWithoutRef<'div'> {
  searchQuery?: string;
}

const AppListPlaceholder: React.FC<IAppListPlaceholderProps> = ({
  searchQuery,
  ...rest
}) => {
  return (
    <Wrapper {...rest}>
      No apps matched your search query: &quot;{searchQuery}&quot;
    </Wrapper>
  );
};

AppListPlaceholder.propTypes = {
  searchQuery: PropTypes.string,
};

AppListPlaceholder.defaultProps = {
  searchQuery: '',
};

export default AppListPlaceholder;
