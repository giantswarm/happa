import styled from '@emotion/styled';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AppCatalogRoutes } from 'shared/constants/routes';
import CatalogTypeLabel from 'UI/CatalogTypeLabel';

import CatalogExternalLink from './CatalogExternalLink';

const Repo = styled(Link)`
  flex: 0 0;
  display: flex;
  flex-direction: row;
  margin-bottom: 15px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.shade4};
  padding: 18px;
  border: 1px solid transparent;

  &:hover {
    text-decoration: none;
    border-color: ${({ theme }) => theme.colors.shade8};
  }

  p {
    max-width: 600px;
    font-size: 14px;
  }
`;

const Title = styled.h3`
  margin-bottom: 0px;
  margin-top: 0px;
`;

const Description = styled.div`
  flex: 1;
  padding-left: 14px;
  line-height: 12px;
`;

const Image = styled.img`
  width: 100px;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.white1};
  flex-shrink: 0;
  border-radius: 5px;
`;

const markdownRenderers = {
  link: CatalogExternalLink,
};

const CatalogRepo = ({ catalog }) => {
  const { name, labels } = catalog.metadata;
  const { logoURL, title, description } = catalog.spec;

  const appCatalogListPath = RoutePath.createUsablePath(
    AppCatalogRoutes.AppList,
    { repo: name }
  );

  return (
    <Repo to={appCatalogListPath}>
      <Image src={logoURL} alt={name} />
      <Description>
        <Title>{title}</Title>
        <CatalogTypeLabel
          catalogType={labels['application.giantswarm.io/catalog-type']}
        />
        <ReactMarkdown renderers={markdownRenderers}>
          {description}
        </ReactMarkdown>
      </Description>
    </Repo>
  );
};

CatalogRepo.propTypes = {
  catalog: PropTypes.object,
};

export default CatalogRepo;
