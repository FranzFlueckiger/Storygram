import { KnotDiagram, Config } from './src/index'
import { testTableData } from './test/testData'
import vega from 'vega-embed';

async function drawKD() {
    const config: Config = {
        dataFormat: 'table',
        verbose: true,
        xField: 'id',
        yField: ['a', 'b', 'c', 'd'],
        continuousStart: false,
        continuousEnd: false,
        populationSize: 50,
        generationAmt: 50
    }
    const KD = new KnotDiagram(testTableData(), config)
    await vega("#viz", KD.getSpec());
}

drawKD()
