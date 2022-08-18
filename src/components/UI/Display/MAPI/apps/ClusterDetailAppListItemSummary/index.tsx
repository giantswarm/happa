import { Box } from 'grommet';
import styled from 'styled-components';
import { mq } from 'styles';

import { TitleWrapper } from '../ClusterDetailAppListWidget';

const TWO_COLUMNS_BREAKPOINT = 980;
const ONE_COLUMN_BREAKPOINT = 650;

const FIRST_COLUMN_TITLE_WIDTH = 86;
const SECOND_COLUMN_TITLE_WIDTH = 127;
const THIRD_COLUMN_TITLE_WIDTH = 124;

const ClusterDetailAppListItemSummary = styled(Box)`
  & > * {
    flex-basis: 33.333%;

    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      flex-basis: 50%;
    }

    ${mq(ONE_COLUMN_BREAKPOINT)} {
      flex-basis: 100%;
    }
  }

  /* Name */
  & > :nth-child(1) {
    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      order: 1;
    }

    ${TitleWrapper} {
      min-width: ${FIRST_COLUMN_TITLE_WIDTH}px;

      ${mq(TWO_COLUMNS_BREAKPOINT)} {
        min-width: auto;
      }
    }
  }

  /* Catalog */
  & > :nth-child(2) {
    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      order: 5;
    }

    ${TitleWrapper} {
      min-width: ${SECOND_COLUMN_TITLE_WIDTH}px;

      ${mq(TWO_COLUMNS_BREAKPOINT)} {
        min-width: auto;
      }
    }
  }

  /* Version */
  & > :nth-child(3) {
    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      order: 2;
    }

    ${mq(ONE_COLUMN_BREAKPOINT)} {
      order: 3;
    }

    ${TitleWrapper} {
      min-width: ${THIRD_COLUMN_TITLE_WIDTH}px;

      ${mq(TWO_COLUMNS_BREAKPOINT)} {
        min-width: auto;
      }
    }
  }

  /* Installed as */
  & > :nth-child(4) {
    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      order: 3;
    }

    ${mq(ONE_COLUMN_BREAKPOINT)} {
      order: 2;
    }

    ${TitleWrapper} {
      min-width: ${FIRST_COLUMN_TITLE_WIDTH}px;

      ${mq(TWO_COLUMNS_BREAKPOINT)} {
        min-width: auto;
      }
    }
  }

  /* Namespace */
  & > :nth-child(5) {
    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      order: 6;
    }

    ${TitleWrapper} {
      min-width: ${SECOND_COLUMN_TITLE_WIDTH}px;

      ${mq(TWO_COLUMNS_BREAKPOINT)} {
        min-width: auto;
      }
    }
  }

  /* Upstream version */
  & > :nth-child(6) {
    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      order: 4;
    }

    ${TitleWrapper} {
      min-width: ${THIRD_COLUMN_TITLE_WIDTH}px;

      ${mq(TWO_COLUMNS_BREAKPOINT)} {
        min-width: auto;
      }
    }
  }

  /* Status */
  & > :nth-child(7) {
    ${mq(TWO_COLUMNS_BREAKPOINT)} {
      order: 7;
    }

    ${TitleWrapper} {
      min-width: ${FIRST_COLUMN_TITLE_WIDTH}px;

      ${mq(TWO_COLUMNS_BREAKPOINT)} {
        min-width: auto;
      }
    }
  }
`;

export default ClusterDetailAppListItemSummary;
