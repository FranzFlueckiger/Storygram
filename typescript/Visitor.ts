import { XLayer, Switch, Distance, GenePool, Data, XData } from './Types'
import { Optimizer } from './Optimizer'

export class Visitor {

  public static visit(d: Data, yEntryPoints: GenePool | undefined): [XData, GenePool] {
    let visitor: string[] = []
    yEntryPoints = yEntryPoints ? yEntryPoints : new Map()
    let prevIndex = 0
    return [d[0].reduce((acc, x: XLayer, i: number) => {
      // check if this x layer is hidden
      if (!x.isHidden) {
        // calculate the center
        let center = this.getCenter(x.group, visitor)
        if (i != 0) d[0][prevIndex].remove.forEach(a => visitor = this.remove(a, visitor))
        x.add.forEach(y => {
          let yVal = d[1].get(y)
          if (!yVal.isHidden) {
            let entryPoint = yEntryPoints.get(y)
            if (!entryPoint) {
              let entryPoint = Optimizer.getRandomGene()
              yEntryPoints.set(y, entryPoint)
            }
            this.add(y, center, entryPoint, visitor)
          }
        })
        x.switch = this.group(x.group, visitor)
        x.state = [...visitor]
        prevIndex = i
        acc.push(x)
      }
      return acc
    }, []), yEntryPoints]
  }

  private static add(a: string, center: number, gene: number, visitor: string[]) {
    // add the new object at the distance from the center indicated by the entryPoint
    let pos = 0
    if (visitor.length) {
      if (gene > 0) {
        pos = Math.round((visitor.length - center) * gene)
      } else {
        pos = Math.round(center * gene)
      }
    }
    return visitor.splice(pos, 0, a)
  }

  private static switchP(switchY: Switch, visitor: string[]) {
    // move the yObj to the group and shift all the others
    let temp = visitor.splice(switchY.prev, 1)
    visitor.splice(switchY.target, 0, ...temp)
  }

  private static remove(a: string, visitor: string[]) {
    // a contains the yObj
    return visitor.filter(p => p != a)
  }

  private static group(group: string[], visitor: string[]): Switch[] {
    // calculate the center
    let center: number = this.getCenter(group, visitor)
    // calculate the distance from the mass center
    let dists: Distance[] = this.getDistances(group, center, visitor)
    // array containing the switch operations
    let switches: Switch[] = []
    // array describing the outer boundary of the already-adiacent group elements
    let edges: [number, number] = [center, center]
    // looping strategies for backward and forward searching
    let strategies = new Map()
    // first element is the descending edge, the second one the ascending
    strategies.set(1, { 'init': 1, 'comp': (i: number) => i < visitor.length })
    strategies.set(-1, { 'init': 0, 'comp': (i: number) => i >= 0 })
    // Check for every y that has to be grouped if it is adjacent, else switch
    dists.forEach(p => {
      let direction: number = -Math.sign(p.distance)
      if (direction != 0) {
        let strategy = strategies.get(direction)
        let index: number = visitor.indexOf(p.p)
        for (let i = edges[strategy.init]; strategy.comp(i); i += direction) {
          if ((index >= edges[0] && index <= edges[1]) ||
            (edges[1] === 0 && direction === 1) ||
            (edges[0] === visitor.length - 1 && direction === -1)) {
            // if the index of p in the visitor is inside the edges, it is adjacent
            // if the edges are at the end of the visitor and the direction points 
            // to it, then p is adjacent
            break
          } else if (!dists.some(a => a.p === visitor[i])) {
            // if the visited y is a non-grouped element, then switch it 
            // with the current element p
            let switchY: Switch = { target: i, prev: index }
            switches.push(switchY)
            this.switchP(switchY, visitor)
            break
          } else {
            // extend adjacent edges
            edges[strategy.init] += direction
          }
        }
      }
    })
    return switches
  }

  private static getCenter(group: string[], visitor: string[]) {
    return Math.round(visitor.reduce((count: number, y: string, i: number) => {
      return group.includes(y) ? count + i : count
    }, 0) / group.length)
  }

  private static getDistances(group: string[], center: number, visitor: string[]) {
    return group
      .map(p => {
        let i = visitor.indexOf(p)
        let distance = center - i
        return { p, distance }
      })
      .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))
  }

}
