import vega from 'vega-embed';
import { KnotDiagram } from './src/index';
import { testRangeData } from './test/testData';
import { Config } from './src/Types';

async function drawKD() {
  const config: Config = {
    dataFormat: 'ranges',
    yField: 'id',
    startField: 'from',
    endField: 'to',
    verbose: true,
  };
  const KD = new KnotDiagram(testRangeData(), config);
  await vega('#viz', KD.getSpec());
}

drawKD();
