import { Link } from 'react-router-dom';
import AppDetailsBody from './body';
import AppDetailsItem from './item';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const AppDetailHeader = styled.div({
  borderBottom: '1px solid #2a5a74',
  paddingBottom: 15,
  marginBottom: 15,
  display: 'flex',

  '.keywords': {
    marginBottom: 15,
  },

  small: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '400',
  },

  '.version': {
    small: {
      display: 'inline',
    },
    code: {
      marginRight: 15,
    },
  },

  h1: {
    marginTop: 0,
    marginBottom: 0,
    borderBottom: 0,
    paddingBottom: 0,
  },

  '.keyword': {
    fontSize: 12,
    marginRight: 5,
    backgroundColor: '#fef8f5',
    color: '#333',
    borderRadius: 4,
    padding: 7,
  },
});

const AppDetails = props => {
  const {
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
  } = appVersions[0];

  const to = `/apps/${params.repo}/?q=${q}#${name}`;

  return (
    <div className='app-detail'>
      {' '}
      {/* sense cap estil */}
      <Link to={to}>
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to &quot;{repo.spec.title}&quot;
      </Link>
      <br />
      <br />
      <AppDetailHeader>
        {icon && icon !== '' && !imgErrorFlag && (
          <div className='app-detail--icon'>
            <img onError={imgError} src={icon} />
          </div>
        )}

        <div className='app-detail--title'>
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
        </div>

        <div className='app-detail--install'>{children}</div>
      </AppDetailHeader>
      <AppDetailsBody description={description}>
        {home && home !== '' && <AppDetailsItem data={home} label='Home' />}
        {sources && <AppDetailsItem data={sources} label='Sources' />}
        {urls && <AppDetailsItem data={urls} label='URLS' />}
      </AppDetailsBody>
    </div>
  );
};

AppDetails.propTypes = {
  appVersions: PropTypes.array,
  params: PropTypes.object,
  q: PropTypes.string,
  imgErrorFlag: PropTypes.bool,
  imgError: PropTypes.func,
  repo: PropTypes.object,
  children: PropTypes.any,
};

export default AppDetails;
