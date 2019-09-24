import { XLayer, Switch, Distance, Gene, Data, XData } from './Types'

export class Visitor {

  private visitor: string[]

  public constructor(private d: Data) { }

  public visit(yEntryPoints: Map<string, number> | undefined): [XData, Gene] {
    this.visitor = []
    yEntryPoints = yEntryPoints ? yEntryPoints : new Map()
    let prevIndex = 0
    return [this.d[0].reduce((acc, x: XLayer, i: number) => {
      // check if this x layer is hidden
      if (!x.hidden) {
        // calculate the center
        let center = this.getCenter(x.group)
        if (i != 0) this.d[0][prevIndex].remove.forEach(a => this.visitor = this.remove(a))
        x.add.forEach(a => {
          if (!this.d[1].get(a).hidden) {
            let entryPoint = yEntryPoints.get(a)
            if (!entryPoint) {
              // generate random entry point
              entryPoint = Math.floor(Math.random() * this.visitor.length)
              // entryPoint = Math.random() * 2 - 1
              yEntryPoints.set(a, entryPoint)
            }
            this.add(a, center, entryPoint)
          }
        })
        x.switch = this.group(x.group)
        x.state = [...this.visitor]
        prevIndex = i
        acc.push(x)
      }
      return acc
    }, []), yEntryPoints]
  }

  private group(group: string[]): Switch[] {
    // calculate the center
    let center: number = this.getCenter(group)
    // let center = 0
    // calculate the distance from the mass center
    let dists: Distance[] = this.getDistances(group, center)
    // array containing the switch operations
    let switches: Switch[] = []
    // array describing the outer boundary of the already-adiacent group elements
    let edges: [number, number] = [Math.ceil(center), Math.floor(center)]
    // looping strategies for backward and forward searching
    let proc = new Map()
    // first element is the descending edge, the second one the ascending
    proc.set(1, { 'init': 1, 'comp': (i) => i < this.visitor.length })
    proc.set(-1, { 'init': 0, 'comp': (i) => i >= 0 })
    // Check for every y that has to be grouped if it is adjacent, else switch
    dists.forEach(p => {
      let direction: number = -Math.sign(p.distance)
      if (direction != 0) {
        let strategy = proc.get(direction)
        let index: number = this.visitor.indexOf(p.p)
        for (let i = edges[strategy.init]; strategy.comp(i); i += direction) {
          if ((index >= edges[0] && index <= edges[1]) ||
            (edges[1] === 0 && direction === 1) ||
            (edges[0] === this.visitor.length - 1 && direction === -1)) {
            // if the index of p in the visitor is inside the edges, it is adjacent
            // if the edges are at the end of the visitor and the direction points 
            // to it, then p is adjacent
            break
          } else if (!dists.some(a => a.p === this.visitor[i])) {
            // if the visited y is a non-grouped element, then switch it 
            // with the current element p
            let switchY: Switch = { target: i, prev: index }
            switches.push(switchY)
            this.switchP(switchY)
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

  private getCenter(group: string[]) {
    return this.visitor.reduce((c: number, p: string, i: number) => {
      return group.includes(p) ? c + i : c
    }, 0) / group.length
  }

  private getDistances(group: string[], center: number) {
    return group
      .map(p => {
        let i = this.visitor.indexOf(p)
        let distance = center - i
        return { p, distance }
      })
      .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance))
  }

  private add(a: string, center: number, entryPoint: number) {
    // add the new object at the distance from the center indicated by the entryPoint
    let pos = 0
    if (this.visitor.length) {
      pos = center + (Math.sign(entryPoint) * - (this.visitor.length - 1) - center) * entryPoint
    }
    // console.log('pos', pos, 'center', center, 'entry', entryPoint, 'visitor length', visitor.length)
    return this.visitor.splice(entryPoint, 0, a)
  }

  private switchP(switchY: Switch) {
    // move the yObj to the group and shift all the others
    let temp = this.visitor.splice(switchY.prev, 1)
    this.visitor.splice(switchY.target, 0, ...temp)
  }

  private remove(a: string) {
    // a contains the yObj
    return this.visitor.filter(p => p != a)
  }

}
