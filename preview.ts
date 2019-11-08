import vega from 'vega-embed';
import { KnotDiagram } from './src/index';
import { testTableData } from './test/testData';
import { Config } from './src/Types';

async function drawKD() {
  const config: Config = {
    dataFormat: 'table',
    yFields: ['a', 'b', 'c', 'd'],
    continuousStart: false,
    continuousEnd: false,
    verbose: true,
  };
  const KD = new KnotDiagram(testTableData(), config);
  await vega('#viz', KD.getSpec());
}

drawKD();
