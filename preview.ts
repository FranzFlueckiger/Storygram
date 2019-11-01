import { KnotDiagram, Config } from './src/index'
import { testTableData } from './test/testData'
import vega from 'vega-embed';

async function drawKD() {
    const config: Config = {
        dataFormat: 'table',
        yField: ['a', 'b', 'c', 'd'],
        continuousStart: false,
        continuousEnd: false,
    }
    const KD = new KnotDiagram(testTableData(), config)
    await vega("#viz", KD.getSpec());
}

drawKD()
