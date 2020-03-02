import styled from '@emotion/styled';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { AppCatalogRoutes } from 'shared/constants/routes';
import Copyable from 'shared/Copyable';
import { Ellipsis } from 'styles/';

import AppDetailsBody from './AppDetailsBody';
import AppDetailsItem from './AppDetailsItem';

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

const ChartVersionTable = styled.table`
  border: 1px solid ${props => props.theme.colors.shade4};
  margin-top: 10px;
  max-width: 400px;
  table-layout: fixed;
  white-space: nowrap;

  td {
    code {
      ${Ellipsis}
      max-width: 130px;
      display: block;
    }
    word-break: keep-all;
  }

  tr:nth-child(even) {
    background-color: ${props => props.theme.colors.shade4};
  }
`;

const AppDetails = props => {
  const {
    app,
    appVersions,
    params,
    q,
    imgErrorFlag,
    imgError,
    repo,
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
  } = app;

  const appCatalogAppListPath = RoutePath.createUsablePath(
    AppCatalogRoutes.AppList,
    { repo: params.repo }
  );
  const to = `${appCatalogAppListPath}?q=${q}#${name}`;

  return (
    <div>
      <Link to={to}>
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to &quot;{repo.spec.title}&quot;
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
              keywords.map(x => (
                <span className='keyword' key={x}>
                  {x}
                </span>
              ))}
          </div>

          <div className='version'>
            <small>Chart&nbsp;Version</small>&nbsp;
            <code>{version}</code> <small>App&nbsp;Version</small>&nbsp;
            <code>{appVersion}</code>
          </div>
        </Title>

        <Install>{children}</Install>
      </Header>

      <ChartVersionTable style={{ float: 'right' }}>
        <thead>
          <tr>
            <th width='100'>Chart Version</th>
            <th width='100'>App Version</th>
          </tr>
        </thead>
        <tbody>
          {appVersions.map(av => {
            return (
              <tr key={av.version}>
                <td>
                  <Copyable copyText={av.version}>
                    <code>{av.version}</code>
                  </Copyable>
                </td>

                <td>
                  <Copyable copyText={av.appVersion}>
                    <code>{av.appVersion}</code>
                  </Copyable>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ChartVersionTable>

      <AppDetailsBody description={description}>
        {home && home !== '' && <AppDetailsItem data={home} label='Home' />}
        {sources && <AppDetailsItem data={sources} label='Sources' />}
        {urls && <AppDetailsItem data={urls} label='URLS' />}
      </AppDetailsBody>
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
  repo: PropTypes.object,
  children: PropTypes.any,
};

export default AppDetails;
