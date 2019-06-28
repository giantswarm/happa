import { Link } from 'react-router-dom';
import AppDetailsBody from './body';
import AppDetailsItem from './item';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Header = styled.div({
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

const Icon = styled.div({
  height: 120,
  width: 120,
  backgroundColor: '#fff',
  padding: 10,
  textAlign: 'center',
  borderRadius: 5,
  marginRight: 15,
  flex: '0 0 120px',

  img: {
    maxWidth: 100,
    maxHeight: 75,
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
  },
});

const Title = styled.div({
  flex: '1 100%',
});

const Install = styled.div({
  flex: '0 0 120px',
  textAlign: 'center',

  '.progress_button--container': {
    marginTop: 0,
    marginBottom: 5,
    marginRight: 0,
  },
  small: {
    fontSize: 12,
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
