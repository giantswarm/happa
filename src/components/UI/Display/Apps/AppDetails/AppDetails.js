import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { CSSBreakpoints } from 'shared/constants';
import { AppCatalogRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import { mq } from 'styles';
import { Tab, Tabs } from 'UI/Display/Tabs';
import Truncated from 'UI/Util/Truncated';

import AppDetailsBody from './AppDetailsBody';
import AppDetailsItem from './AppDetailsItem';
import ChartVersionsTable from './ChartVersionsTable';

const Header = styled.div`
  border-bottom: 1px solid #2a5a74;
  padding-bottom: 15px;
  margin-bottom: 15px;
  display: flex;

  .keywords {
    margin-bottom: 15px;
  }

  small {
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 400;
  }

  .version {
    small {
      display: inline;
    }
    code: {
      margin-right: 15px;
    }
  }

  h1 {
    margin-top: 0;
    margin-bottom: 0;
    border-bottom: 0;
    padding-bottom: 0;
  }

  .keyword {
    font-size: 12px;
    margin-right: 5px;
    background-color: #fef8f5;
    color: #333;
    border-radius: 4px;
    padding: 7px;
  }
`;

const Icon = styled.div`
  height: 120px;
  width: 120px;
  background-color: #fff;
  padding: 10px;
  text-align: center;
  border-radius: 5px;
  margin-right: 15px;
  flex: 0 0 120px;

  img {
    max-width: 100px;
    max-height: 75px;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const Title = styled.div`
  flex: 1 100%;

  .appVersion {
    background-color: ${(props) => props.theme.colors.darkBlueLighter8};
    color: ${(props) => props.theme.colors.darkBlue};
  }
`;

const Install = styled.div`
  flex: 0 0 120px;
  text-align: center;

  .button-wrapper {
    margin-top: 0px;
    margin-bottom: 5px;
    margin-right: 0px;
  }

  small {
    font-size: 12px;
  }
`;

const About = styled.div`
  display: flex;

  ${mq(CSSBreakpoints.Large)} {
    flex-direction: column;
  }

  div:nth-of-type(1) {
    flex: 3;
    margin-right: 40px;
  }

  dl {
    flex: 1 1;
    min-width: 320px;

    ${mq(CSSBreakpoints.Large)} {
      flex: 1;
      margin-left: 0px;
      margin-top: 40px;
    }
  }
`;

const Readme = styled.div`
  width: 800px;

  .markdown pre {
    background-color: ${(props) => props.theme.colors.darkBlueDarker6};
    border: none;
    font-size: 16px;
    color: ${(props) => props.theme.colors.white2};
  }

  .markdown h1 {
    margin-top: 40px;
    margin-bottom: 10px;
    font-size: 24px;
    font-weight: 500;
  }

  .markdown h2 {
    margin-top: 40px;
    font-size: 20px;
  }
`;

const SmallLabel = styled.span`
  padding-left: 20px;
  padding-right: 10px;

  :nth-of-type(1) {
    padding-left: 0;
  }
`;

function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

function HeadingRenderer(headingProps) {
  const children = React.Children.toArray(headingProps.children);
  const text = children.reduce(flatten, '');
  const slug = text.toLowerCase().replace(/\W/g, '-');

  return React.createElement(
    `h${headingProps.level}`,
    { id: slug },
    headingProps.children
  );
}

// urlFor(url) turns relative links from the readme into absolute links that will
// work, and leaves absolute links alone.
function urlFor(href, readmeBaseURL) {
  const absoluteURLMatch = /^https?:\/\/|^\/\//i;
  if (absoluteURLMatch.test(href)) {
    return href;
  }

  return readmeBaseURL + href;
}

const AppDetails = (props) => {
  const {
    app,
    appVersions,
    params,
    q,
    imgErrorFlag,
    imgError,
    catalog,
    children,
    readmeBaseURL,
  } = props;

  const {
    name,
    icon,
    keywords,
    version,
    appVersion,
    description,
    home,
    sources,
    urls,
    readme,
  } = app;

  const appCatalogAppListPath = RoutePath.createUsablePath(
    AppCatalogRoutes.AppList,
    { catalogName: params.catalogName }
  );
  const to = `${appCatalogAppListPath}?q=${q}#${name}`;

  return (
    <>
      <Link to={to}>
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to &quot;{catalog.spec.title}&quot;
      </Link>
      <br />
      <br />
      <Header>
        {icon && icon !== '' && !imgErrorFlag && (
          <Icon>
            <img onError={imgError} src={icon} />
          </Icon>
        )}

        <Title>
          <h1>{name}</h1>
          <div className='keywords'>
            {keywords &&
              keywords.map((x) => (
                <span className='keyword' key={x}>
                  {x}
                </span>
              ))}
          </div>

          <div className='version'>
            <SmallLabel>
              <small>Version</small>
            </SmallLabel>
            <Truncated as='code'>{version}</Truncated>
            {appVersion && (
              <>
                <SmallLabel>
                  <small>Provides</small>
                </SmallLabel>
                <code className='appVersion'>{appVersion}</code>
              </>
            )}
          </div>
        </Title>

        <Install>{children}</Install>
      </Header>

      <Tabs>
        <Tab title='About'>
          <About>
            {readme && (
              <Readme>
                <small style={{ fontWeight: 'bold' }}>Readme</small>
                <ReactMarkdown
                  className='markdown'
                  renderers={{
                    heading: HeadingRenderer,
                    link: (p) => (
                      <a
                        href={urlFor(p.href, readmeBaseURL)}
                        target='_blank'
                        rel='noreferrer'
                      >
                        {p.children}
                      </a>
                    ),
                  }}
                >
                  {readme}
                </ReactMarkdown>
              </Readme>
            )}

            <AppDetailsBody description={description}>
              {home && home !== '' && (
                <AppDetailsItem data={home} label='Home' />
              )}
              {sources && <AppDetailsItem data={sources} label='Sources' />}
              {urls && <AppDetailsItem data={urls} label='URLS' />}
            </AppDetailsBody>
          </About>
        </Tab>

        <Tab title='Other Versions'>
          <ChartVersionsTable appVersions={appVersions} />
        </Tab>
      </Tabs>
    </>
  );
};

AppDetails.propTypes = {
  app: PropTypes.object,
  appVersions: PropTypes.array,
  params: PropTypes.object,
  q: PropTypes.string,
  imgErrorFlag: PropTypes.bool,
  imgError: PropTypes.func,
  catalog: PropTypes.object,
  children: PropTypes.any,
  readmeBaseURL: PropTypes.string,
};

export default AppDetails;
