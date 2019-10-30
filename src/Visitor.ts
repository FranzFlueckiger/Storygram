import { getRandomGene } from "./Optimizer";
import { Data, Distance, GenePool, Switch, XData, XLayer } from "./Types";

function visit(data: Data, yEntryPoints: GenePool | undefined): [XData, GenePool] {
  let visitor: string[] = [];
  yEntryPoints = yEntryPoints ? yEntryPoints : new Map();
  let prevIndex = 0;
  return [data.xData.reduce((acc: XData, x: XLayer, i: number) => {
    // todo remove this as it is redundant check if this x layer is hidden
    if (!x.isHidden) {
      // calculate the center
      const center = getCenter(x.group, visitor);
      if (i != 0) { data.xData[prevIndex].remove.forEach((a) => visitor = remove(a, visitor)); }
      x.add.forEach((y) => {
        const yVal = data.yData.get(y)!;
        if (!yVal.isHidden) {
          const entryPoint = yEntryPoints!.get(y);
          if (!entryPoint) {
            const entryPoint = getRandomGene();
            yEntryPoints!.set(y, entryPoint);
          }
          visitor = add(y, center, entryPoint!, visitor);
        }
      });
      x.switch = group(x.group, visitor);
      x.state = [...visitor];
      prevIndex = i;
      acc.push(x);
    }
    return acc;
  }, []), yEntryPoints];
}

function add(a: string, center: number, gene: number, visitor: string[]): string[] {
  // add the new object at the distance from the center indicated by the entryPoint
  let pos = 0;
  if (visitor.length) {
    if (gene > 0) {
      pos = Math.round((visitor.length - center) * gene);
    } else {
      pos = Math.round(center * gene);
    }
  }
  visitor.splice(pos, 0, a);
  return visitor
}

function switchP(switchY: Switch, visitor: string[]): string[] {
  // move the yObj to the group and shift all the others
  const temp = visitor.splice(switchY.prev, 1);
  visitor.splice(switchY.target, 0, ...temp);
  return visitor
}

function remove(a: string, visitor: string[]): string[] {
  // a contains the yObj
  return visitor.filter((p) => p != a);
}

function group(group: string[], visitor: string[]): Switch[] {
  // calculate the center
  const center: number = getCenter(group, visitor);
  // calculate the distance from the mass center
  const dists: Distance[] = getDistances(group, center, visitor);
  // array containing the switch operations
  const switches: Switch[] = [];
  // array describing the outer boundary of the already-adiacent group elements
  const edges: [number, number] = [center, center];
  // looping strategies for backward and forward searching
  const strategies = new Map();
  // first element is the descending edge, the second one the ascending
  strategies.set(1, { init: 1, comp: (i: number) => i < visitor.length });
  strategies.set(-1, { init: 0, comp: (i: number) => i >= 0 });
  // Check for every y that has to be grouped if it is adjacent, else switch
  dists.forEach((p) => {
    const direction: number = -Math.sign(p.distance);
    if (direction != 0) {
      const strategy = strategies.get(direction);
      const index: number = visitor.indexOf(p.p);
      for (let i = edges[strategy.init]; strategy.comp(i); i += direction) {
        if ((index >= edges[0] && index <= edges[1]) ||
          (edges[1] === 0 && direction === 1) ||
          (edges[0] === visitor.length - 1 && direction === -1)) {
          // if the index of p in the visitor is inside the edges, it is adjacent
          // if the edges are at the end of the visitor and the direction points
          // to it, then p is adjacent
          break;
        } else if (!dists.some((a) => a.p === visitor[i])) {
          // if the visited y is a non-grouped element, then switch it
          // with the current element p
          const switchY: Switch = { target: i, prev: index };
          switches.push(switchY);
          switchP(switchY, visitor);
          break;
        } else {
          // extend adjacent edges
          edges[strategy.init] += direction;
        }
      }
    }
  });
  return switches;
}

function getCenter(group: string[], visitor: string[]): number {
  return Math.round(visitor.reduce((count: number, y: string, i: number) => {
    return group.includes(y) ? count + i : count;
  }, 0) / group.length);
}

function getDistances(group: string[], center: number, visitor: string[]): Distance[] {
  return group
    .map((p) => {
      const i = visitor.indexOf(p);
      const distance = center - i;
      return { p, distance };
    })
    .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance));
}

export {visit, add, switchP, remove, group, getCenter, getDistances}
