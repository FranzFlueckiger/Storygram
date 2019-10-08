import vega from 'vega-embed';
import { KnotDiagram } from './src/KnotDiagram';
import {DummyConfig} from './src/DummyConfig'

/**
* Artistnet Data
* Interacted with bug
*/

async function main() {
  const config = DummyConfig.getConfig1()
  const KD = new KnotDiagram(config[0], config[1])
  await vega("#viz", KD.spec);
}

main();
