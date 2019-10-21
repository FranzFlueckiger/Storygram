import vega from 'vega-embed';
import { KnotDiagram } from './typescript/KnotDiagram';
import {Templates} from './typescript/Templates'

/**
* Testing
* Gui: Highlighting, Stability
*/

async function main() {
  const template = Templates.getTemplate3()
  const KD = new KnotDiagram(template[0], template[1])
  await vega("#viz", KD.spec);
}
 
main();
