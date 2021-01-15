import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Icon from './Icon';

const Wrapper = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 200px;
  flex-grow: 1;
  border-radius: ${({ theme }) => theme.border_radius};
  border: 1px solid transparent;

  &:hover {
    text-decoration: none;
    border: 1px solid ${({ theme }) => theme.colors.darkBlueLighter2};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker4};
  width: 100%;
  height: 55%;
  border-top-left-radius: ${({ theme }) => theme.border_radius};
  border-top-right-radius: ${({ theme }) => theme.border_radius};
`;

const DetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker1};
  width: 100%;
  height: 45%;
  border-bottom-left-radius: ${({ theme }) => theme.border_radius};
  border-bottom-right-radius: ${({ theme }) => theme.border_radius};
  padding: 10px 20px;
  padding-bottom: 17px;
`;

const Name = styled.div`
  font-size: 18px;
`;

const Catalog = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.darkBlueLighter5};
`;

interface IAppProps {
  name: string;
  catalog: string;
  to: string;
}

const App: React.FC<IAppProps> = ({ name, catalog, to }) => {
  return (
    <Wrapper to={to}>
      <IconWrapper>
        <Icon src='' name={name} />
      </IconWrapper>
      <DetailWrapper>
        <Name>{name}</Name>
        <Catalog>
          <i className='fa fa-done' /> {catalog}
        </Catalog>
      </DetailWrapper>
    </Wrapper>
  );
};

App.propTypes = {
  name: PropTypes.string.isRequired,
  catalog: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
};

export default App;
