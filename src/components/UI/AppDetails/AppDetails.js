import styled from '@emotion/styled';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AppCatalogRoutes } from 'shared/constants/routes';
import Tabs from 'shared/Tabs';
import Truncated from 'UI/Truncated';

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

  .progress_button--container {
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

  div:nth-child(1) {
    flex: 1;
  }

  dl:nth-child(2) {
    flex: 0 0 320px;
    width: 320px;
    margin-left: 40px;
  }
`;

const Readme = styled.div`
  max-width: 800px;

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
    <div>
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
            <small>Version</small>&nbsp;
            <Truncated as='code'>{version}</Truncated> <small>Provides</small>
            &nbsp;
            <code className='appVersion'>{appVersion}</code>
          </div>
        </Title>

        <Install>{children}</Install>
      </Header>

      <Tabs>
        <Tab eventKey={1} title='About'>
          <About>
            {readme && (
              <Readme>
                <small style={{ 'font-weight': 'bold' }}>Readme</small>
                <ReactMarkdown
                  className='markdown'
                  renderers={{ heading: HeadingRenderer }}
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

        <Tab eventKey={2} title='Other Versions'>
          <ChartVersionsTable appVersions={appVersions} />
        </Tab>
      </Tabs>
    </div>
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
};

export default AppDetails;
