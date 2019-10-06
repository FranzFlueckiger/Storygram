import vega from 'vega-embed';
import { KnotDiagram } from './src/KnotDiagram';
import {DummyConfig} from './src/DummyConfig'

/**
* Advanced Filtering (interactedWith + depth)
* Artistnet Data
* Bug with single rect
* Describe
* Chart Title
*/

async function main() {
  const config = DummyConfig.getConfig1()
  const KD = new KnotDiagram(config[0], config[1])
  await vega("#viz", KD.spec);
}

main();
