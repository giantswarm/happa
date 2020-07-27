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
  const getMessage = () => {
    if ((searchQuery as string).length > 0) {
      return `No apps matched your search query: "${searchQuery}"`;
    }

    return 'There are no apps available in this catalog, please try again in a few moments and if the problem persists, contact support: support@giantswarm.io';
  };

  return <Wrapper {...rest}>{getMessage()}</Wrapper>;
};

AppListPlaceholder.propTypes = {
  searchQuery: PropTypes.string,
};

AppListPlaceholder.defaultProps = {
  searchQuery: '',
};

export default AppListPlaceholder;
