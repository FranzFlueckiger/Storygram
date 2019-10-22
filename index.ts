import vega from 'vega-embed';
import { KnotDiagram } from './src/KnotDiagram';
import {Templates} from './src/Templates'

/**
* Testing
* Gui: Highlighting, Stability
* xScaling
*/

async function main() {
  const template = Templates.getTemplate3()
  const KD = new KnotDiagram(template[0], template[1])
  await vega("#viz", KD.spec);
}
 
main();
