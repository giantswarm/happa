import styled from '@emotion/styled';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AppCatalogRoutes } from 'shared/constants/routes';
import Button from 'UI/Button';
import CatalogTypeLabel from 'UI/CatalogTypeLabel';

const Repo = styled.div`
  flex: 0 0;
  margin-bottom: 15px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.shade4};
  flex-direction: row;
  display: flex;
  padding: 18px;

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

const BrowseButton = styled(Button)`
  margin: 0px;
`;

const CatalogRepo = ({ catalog }) => {
  const { name, labels } = catalog.metadata;
  const { logoURL, title, description } = catalog.spec;

  const appCatalogListPath = RoutePath.createUsablePath(
    AppCatalogRoutes.AppList,
    { repo: name }
  );

  return (
    <Repo>
      <Image src={logoURL} alt={name} />

      <Description>
        <Title>{title}</Title>
        <CatalogTypeLabel
          catalogType={labels['application.giantswarm.io/catalog-type']}
        />
        <ReactMarkdown>{description}</ReactMarkdown>
        <Link className='app-catalog--open-catalog' to={appCatalogListPath}>
          <BrowseButton>Browse Apps</BrowseButton>
        </Link>
      </Description>
    </Repo>
  );
};

CatalogRepo.propTypes = {
  catalog: PropTypes.object,
};

export default CatalogRepo;
