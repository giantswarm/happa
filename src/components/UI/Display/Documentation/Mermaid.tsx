import mermaid, { Config } from 'mermaid';
import React, { useEffect } from 'react';

const DEFAULT_CONFIG: Config = {
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'strict',
  themeCSS:
    '.node rect { fill: #EFEFEF; } .cluster rect { fill: #FFFFFF; stroke: #000000}',
  fontFamily: 'Roboto:300,400,700',
  flowchart: {
    htmlLabels: false,
    useMaxWidth: true,
  },
} as Config;

interface IMermaidProps extends React.ComponentPropsWithoutRef<'div'> {
  chart: string;
  config?: Config;
}

const Mermaid: React.FC<React.PropsWithChildren<IMermaidProps>> = ({
  chart,
  config,
  ...props
}) => {
  useEffect(() => {
    const configuration = Object.assign({}, DEFAULT_CONFIG, config);
    mermaid.initialize(configuration);
    mermaid.contentLoaded();
  }, [config]);

  return (
    <div {...props} className='mermaid'>
      {chart}
    </div>
  );
};

export default Mermaid;
