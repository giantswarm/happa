import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Keyboard,
  Text,
} from 'grommet';
import { useGettingStartedContext } from 'MAPI/clusters/GettingStarted/GettingStartedProvider';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  :hover {
    text-decoration: none;
  }
`;

const StyledCard = styled(Card)`
  transition: opacity 0.1s ease-out, box-shadow 0.1s ease-in-out;

  :hover,
  :focus {
    box-shadow: ${(props) =>
      `0 0 0 1px ${props.theme.global.colors.text.dark}`};
  }

  :active {
    opacity: 0.7;
  }
`;

interface IGettingStartedOverviewProps {}

const GettingStartedOverview: React.FC<IGettingStartedOverviewProps> = () => {
  const { steps } = useGettingStartedContext();

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();

    (e.target as HTMLElement).click();
  };

  return (
    <Box>
      <Heading level={1}>Get started with your Kubernetes cluster</Heading>
      <Box margin={{ top: 'medium' }} gap='small'>
        {steps.map((step, idx) => (
          <Keyboard key={step.path} onSpace={handleLinkKeyDown}>
            <StyledLink to={step.url}>
              <StyledCard
                pad={{ horizontal: 'medium', top: 'small', bottom: 'medium' }}
                round='xsmall'
                elevation='none'
                overflow='visible'
                background='background-front'
                aria-label={step.title}
              >
                <CardHeader>
                  <Box direction='row' align='center' gap='small'>
                    <Text size='xxlarge' weight='bold' color='text-xweak'>
                      {idx + 1}.
                    </Text>
                    <Text weight='bold'>{step.title}</Text>
                  </Box>
                </CardHeader>
                <CardBody>
                  <Text>{step.description}</Text>
                </CardBody>
              </StyledCard>
            </StyledLink>
          </Keyboard>
        ))}
      </Box>
    </Box>
  );
};

export default GettingStartedOverview;
