import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

const Wrapper = styled.div``;

const Header = styled.div`
  display: flex;
  margin-top: 25px;
  align-items: center;
  margin-bottom: 25px;
`;

const HeaderDetails = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
`;

const Upper = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkBlueLighter3};
  margin-bottom: 20px;

  div:last-child {
    margin-right: 0px;
  }
`;

const Lower = styled.div`
  color: ${({ theme }) => theme.colors.darkBlueLighter6};
`;

const AppIcon = styled.img`
  width: 125px;
  border-radius: 5px;
  margin-right: 25px;
`;

const Body = styled.div`
  display: flex;
`;

const Readme = styled.div`
  background-color: ${({ theme }) => theme.colors.darkBlueDarker2};
  width: 60%;
  height: 800px;
  border-radius: 5px;
  margin-right: 25px;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
`;

const Detail = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.darkBlueLighter3};
  padding-top: 10px;
  margin-bottom: 25px;

  small {
    font-size: 12px;
    margin-bottom: 6px;
  }
`;

const AppDetail: React.FC = () => {
  return (
    <Wrapper>
      <Link to='/apps'>
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to Apps
      </Link>

      <Header>
        <AppIcon src='/images/repo_icons/managed.png' />
        <HeaderDetails>
          <Upper>
            <h1>efk-stack-app</h1>
            <Button bsStyle='primary'>
              <i className='fa fa-add-circle' />
              Install in Cluster
            </Button>
          </Upper>
          <Lower>Giant Swarm Managed</Lower>
        </HeaderDetails>
      </Header>

      <Body>
        <Readme />
        <Details>
          <Detail>
            <small>CHART VERSION</small>
            v0.3.2
          </Detail>

          <Detail>
            <small>CREATED</small>1 month ago
          </Detail>

          <Detail>
            <small>INCLUDES VERSION</small>
            v1.9.0
          </Detail>

          <Detail>
            <small>DESCRIPTION</small>
            Open Distro for Elasticsearch
          </Detail>

          <Detail>
            <small>WEBSITE</small>
            github.com/giantswarm/efk-stack-app
          </Detail>

          <Detail>
            <small>SOURCES</small>
            Some sources
          </Detail>

          <Detail>
            <small>SOURCE URLS</small>
            Some sources
          </Detail>

          <Detail>
            <small>KEYWORDS</small>
            Some keywords
          </Detail>
        </Details>
      </Body>
    </Wrapper>
  );
};

export default AppDetail;
