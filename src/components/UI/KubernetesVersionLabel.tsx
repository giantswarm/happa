import { compareDates, getRelativeDateFromNow } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { Overlay } from 'react-bootstrap';
import Tooltip from 'react-bootstrap/lib/Tooltip';

interface IKubernetesVersionLabelProps {
  version?: string;
  hidePatchVersion?: boolean;
  eolDate?: string;
}

const KubernetesVersionLabel: React.FC<IKubernetesVersionLabelProps> = ({
  version,
  hidePatchVersion,
  eolDate,
}) => {
  let versionLabel = version || 'n/a';
  if (version && hidePatchVersion) {
    const v = version.split('.');
    versionLabel = [v[0], v[1]].join('.');
  }

  const labelRef = useRef<HTMLSpanElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const { message: tooltipMessage, isEol } = getReleaseStatus(
    eolDate as string
  );
  if (isEol && version) {
    versionLabel += ' (EOL)';
  }

  const tryToToggleTooltip = (open: boolean) => () => {
    if (open && tooltipMessage) {
      setIsTooltipVisible(true);

      return;
    }

    setIsTooltipVisible(false);
  };

  return (
    <>
      <span
        ref={labelRef}
        onMouseEnter={tryToToggleTooltip(true)}
        onMouseLeave={tryToToggleTooltip(false)}
        onFocus={tryToToggleTooltip(true)}
        onBlur={tryToToggleTooltip(false)}
      >
        <i className='fa fa-kubernetes' title='Kubernetes version' />{' '}
        {versionLabel}
      </span>
      <Overlay
        placement='top'
        target={labelRef.current as HTMLSpanElement}
        show={isTooltipVisible}
      >
        <Tooltip id='tooltip'>{tooltipMessage}</Tooltip>
      </Overlay>
    </>
  );
};

KubernetesVersionLabel.propTypes = {
  version: PropTypes.string,
  hidePatchVersion: PropTypes.bool,
  eolDate: PropTypes.string,
};

KubernetesVersionLabel.defaultProps = {
  version: '',
  hidePatchVersion: true,
  eolDate: '',
};

export default KubernetesVersionLabel;

function getReleaseStatus(
  eolDate: string
): { message: string; isEol: boolean } {
  const result = {
    message: '',
    isEol: false,
  };

  if (!eolDate) return result;

  const date = new Date();
  // The date today, in `RFC-3339FullDate` format.
  const now = `${date.getUTCFullYear()}-${
    date.getUTCMonth() + 1
  }-${date.getUTCDate()}`;

  const relativeDate = getRelativeDateFromNow(eolDate);
  switch (compareDates(now, eolDate)) {
    case -1:
      result.message = `This version will reach its end of life ${relativeDate}.`;
      break;
    case 0:
      result.message = 'This version reached its end of life today.';
      result.isEol = true;
      break;
    case 1:
      result.message = `This version reached its end of life ${relativeDate}.`;
      result.isEol = true;
      break;
  }

  return result;
}
