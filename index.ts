import vega from 'vega-embed';
import { KnotDiagram } from './typescript/KnotDiagram';
import {DummyConfig} from './typescript/DummyConfig'

/**
* Artistnet Data
* interactedWith bug and maybe redundant with mustContain
* Highlighting, YFilter Info
*/

async function main() {
  const config = DummyConfig.getConfig2()
  const KD = new KnotDiagram(config[0], config[1])
  await vega("#viz", KD.spec);
}
 
main();
