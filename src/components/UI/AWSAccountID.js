import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.span`
  font-family: ${props => props.theme.fontFamilies.console};
`;

class AWSAccountID extends React.Component {
  render() {
    // get account ID from ARN like 'arn:aws:iam::<YOUR_ACCOUNT_ID>:role/GiantSwarmAdmin'
    const parts = this.props.roleARN.split(':');
    const accountID = parts[4];

    return (
      <Wrapper>
        {accountID}{' '}
        <a
          href={`https://${  accountID  }.signin.aws.amazon.com/console`}
          rel='noopener noreferrer'
          target='_blank'
        >
          <i className='fa fa-open-in-new' />
        </a>
      </Wrapper>
    );
  }
}

AWSAccountID.propTypes = {
  roleARN: PropTypes.string,
};

export default AWSAccountID;
