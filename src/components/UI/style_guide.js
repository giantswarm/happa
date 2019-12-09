import ClusterEmptyState from './ClusterEmptyState';
import ComponentChangelog from './ComponentChangelog';
import PropTypes from 'prop-types';
import React from 'react';
import ReleaseComponentLabel from './release_component_label';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  h2 {
    font-size: 22px;
    margin-bottom: 20px;
  }
  p {
    margin-bottom: 20px;
  }
`;

const ExampleBox = styled.div`
  padding: 30px;
  margin: 20px 0;
  border: 1px dashed #999;
`;

const Header = props => {
  const { name } = props;
  return (
    <h2 id={name}>
      {name} <a href={`#${name}`}>¶</a>
    </h2>
  );
};

Header.propTypes = {
  name: PropTypes.string,
};

const StyleGuide = () => {
  return (
    <Wrapper className='main col-9'>
      <h1>Style Guide</h1>

      <hr />

      <Header name='ComponentChangelog' />

      <p>Displays changes on a component in a release context.</p>

      <ExampleBox>
        <dl>
          <ComponentChangelog
            changes={[
              'Fix update process node termination in http://example.com/.',
            ]}
            name='mycomponent'
          />
          <ComponentChangelog
            changes={[
              'Mount `/var/log` directory in an EBS Volume.',
              'Use proper hostname annotation for nodes.',
              'Update to 1.13.4 ([CVE-2019-1002100](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-1002100)).',
            ]}
            name='kubernetes'
          />
          <ComponentChangelog
            changes={[
              `Here is a long component change description that shows us how a changelog item consisting of several paragraphs would be rendered.

  Here is the second and last line of the markdown text.`,
            ]}
            name='multi-paragraph'
          />
          <ComponentChangelog
            changes={[
              'This is a very long component change description that has only one purpose: to demonstrate how very long descriptions are handled in our user interfae. While being long, this description is only one paragraph.',
            ]}
            name='verylong-description'
          />
        </dl>
      </ExampleBox>

      <hr />

      <Header name='ReleaseComponentLabel' />

      <p>
        Displays a release component&apos;s version number or the change of a
        version number in an upgrade.
      </p>

      <ExampleBox>
        <ReleaseComponentLabel name='calico' version='3.1.5' />
        <ReleaseComponentLabel
          name='kubernetes'
          oldVersion='1.14.1'
          version='1.13.3'
        />
        <ReleaseComponentLabel isRemoved name='outphased' />
        <ReleaseComponentLabel isAdded name='newbie' version='0.0.1' />
      </ExampleBox>

      <Header name='ClusterEmptyState' />

      <p>
        Displays a message that there are no clusters yet in a list of clusters.
      </p>

      <small>When there are no organizations:</small>
      <ExampleBox>
        <ClusterEmptyState />
      </ExampleBox>

      <small>When there was an error loading clusters:</small>
      <ExampleBox>
        <ClusterEmptyState
          errorLoadingClusters={true}
          selectedOrganization='organization'
        />
      </ExampleBox>

      <small>When there are no clusters:</small>
      <ExampleBox>
        <ClusterEmptyState
          errorLoadingClusters={false}
          selectedOrganization='organization'
        />
      </ExampleBox>
    </Wrapper>
  );
};

export default StyleGuide;
