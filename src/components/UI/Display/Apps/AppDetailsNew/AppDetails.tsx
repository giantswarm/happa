import { formatDistanceToNow } from 'date-fns';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

import { HeadingRenderer, urlFor } from './utils';

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
  border-radius: 5px;
  margin-right: 25px;
  padding: 20px;

  .markdown pre {
    background-color: ${(props) => props.theme.colors.darkBlueDarker6};
    border: none;
    font-size: 16px;
    color: ${(props) => props.theme.colors.white2};
  }

  .markdown h1 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 24px;
    font-weight: 500;
  }

  .markdown h2 {
    margin-top: 20px;
    font-size: 20px;
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  width: 40%;
`;

const DetailGroup = styled.div``;

const Detail = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.darkBlueLighter3};
  padding-top: 10px;
  margin-bottom: 25px;

  small {
    font-size: 12px;
    margin-bottom: 6px;
  }
`;

const Keyword = styled.span`
  margin-right: 10px;
  font-family: Inconsolata, monospace;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker2};
  padding: 5px 8px;
  border-radius: 5px;
`;

const Wrapper = styled.div`
  &.no-readme {
    max-width: 1000px;
    margin: auto;

    .shrinkable {
      width: 33%;
    }

    ${Body} {
      margin-left: 150px;
    }

    ${Details} {
      width: 100%;
    }

    ${DetailGroup} {
      display: flex;
      ${Detail} {
        width: 33%;
        margin-right: 25px;

        &:last-child {
          margin-right: 0px;
        }
      }
    }
  }
`;

interface IAppDetailProps {
  appTitle: string;
  appIconURL: string;
  catalogName: string;
  chartVersion: string;
  createDate: Date;
  includesVersion: string;
  description: string;
  website: string;
  keywords: string[];
  readme?: string;
}

const AppDetail: React.FC<IAppDetailProps> = (props) => {
  return (
    <Wrapper className={props.readme ? '' : 'no-readme'}>
      <Link to='/apps'>
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to Apps
      </Link>

      <Header>
        <AppIcon src={props.appIconURL} />
        <HeaderDetails>
          <Upper>
            <h1>{props.appTitle}</h1>
            <Button bsStyle='primary'>
              <i className='fa fa-add-circle' />
              Install in Cluster
            </Button>
          </Upper>
          <Lower>{props.catalogName}</Lower>
        </HeaderDetails>
      </Header>

      <Body>
        {props.readme && (
          <Readme>
            <ReactMarkdown
              className='markdown'
              renderers={{
                heading: HeadingRenderer,
                link: (p) => (
                  <a
                    href={urlFor(p.href, 'http://google.com')}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {p.children}
                  </a>
                ),
              }}
            >
              {props.readme}
            </ReactMarkdown>
          </Readme>
        )}
        <Details>
          <DetailGroup>
            <Detail>
              <small>CHART VERSION</small>
              {props.chartVersion}
            </Detail>

            <Detail>
              <small>CREATED</small>
              {formatDistanceToNow(props.createDate)} ago
            </Detail>

            <Detail>
              <small>INCLUDES VERSION</small>
              {props.includesVersion}
            </Detail>
          </DetailGroup>

          <Detail>
            <small>DESCRIPTION</small>
            {props.description}
          </Detail>

          <Detail>
            <small>WEBSITE</small>
            {props.website}
          </Detail>

          {props.keywords.length > 0 && (
            <Detail>
              <small>KEYWORDS</small>
              {props.keywords.map((k) => (
                <Keyword key={k}>{k}</Keyword>
              ))}
            </Detail>
          )}
        </Details>
      </Body>
    </Wrapper>
  );
};

AppDetail.propTypes = {
  appTitle: PropTypes.string.isRequired,
  appIconURL: PropTypes.string.isRequired,
  catalogName: PropTypes.string.isRequired,
  chartVersion: PropTypes.string.isRequired,
  createDate: PropTypes.instanceOf(Date).isRequired,
  includesVersion: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  website: PropTypes.string.isRequired,
  keywords: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  readme: PropTypes.string,
};

export default AppDetail;
