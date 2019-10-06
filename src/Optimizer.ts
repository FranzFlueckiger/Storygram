import { Visitor } from "./Visitor"
import { Child, Gene, XLayer, Data } from "./Types"

export class Optimizer {

  private visitor: Visitor

  public constructor(private d, private config) {
    this.visitor = new Visitor(d)
  }

  public fit(): Data {
    let best: Child,
      population: Child[],
      newGenes: Map<string, number>[]
    for (let i = 0; i < this.config.generationAmt; i++) {
      population = this.getGeneration(newGenes)
      if (!best || population[0].loss < best.loss) {
        best = population[0]
        console.log(best)
      }
      let parents = this.select(population)
      newGenes = this.mate(parents)
      newGenes = this.mutate(newGenes)
    }
    return [best.x, this.d[1]]
  }

  private getGeneration(yEntryPoints: Map<string, number>[]): Child[] {
    let population: Child[] = []
    // Compute new generation
    for (let i = 0; i < this.config.populationSize; i++) {
      let entryPoints = yEntryPoints ? yEntryPoints[i] : undefined
      let result: [XLayer[], Gene] = this.visitor.visit(entryPoints)
      let loss = this.getLoss(result)
      let child: Child = { loss: loss, gene: result[1], x: result[0] }
      population.push(child)
    }
    return population.sort((a, b) => a.loss - b.loss)
  }

  private select(population: Child[]): Child[] {
    let parents = []
    let length = population.length * this.config.selectionRate
    for (let i = 0; i < length; i++) {
      let index = Math.floor(Math.pow(Math.random(), 8) * population.length)
      let parent = population[index]
      population.splice(index, 1)
      parents.push(parent)
    }
    return parents
  }

  private mate(parents: Child[]): Gene[] {
    let genes = []
    for (let i = 0; i < parents.length / this.config.selectionRate; i++) {
      let parent1: Child, parent2: Child, index: number
      while (parent1 === parent2) {
        index = Math.floor(Math.pow(Math.random(), 5) * parents.length)
        parent1 = parents[index]
        index = Math.floor(Math.pow(Math.random(), 5) * parents.length)
        parent2 = parents[index]
      }
      let gene1 = Array.from(parent1.gene)
      let gene2 = Array.from(parent2.gene)
      let newGene = gene1.reduce<Gene>((map, gene, i) => {
        if (Math.random() < 0.5) {
          gene = gene2[i]
        }
        return map.set(gene[0], gene[1])
      }, new Map())
      genes.push(newGene)
    }
    return genes
  }

  private mutate(genes: Gene[]) {
    genes.forEach((_, i) => {
      this.d[0].forEach(x => {
        if (!x.hidden) {
          x.add.forEach(y => {
            if (Math.random() < this.config.mutationProbability) {
              let newY = Math.floor(Math.random() * x.state.length)
              genes[i].set(y, newY)
            }
          })
        }
      })
    }
    )
    return genes
  }

  private getLoss(child: [XLayer[], Gene]): number {
    let acc = 0
    for (let i = 0; i < child[0].length; i++) {
      let center = child[0][i].state.length / 2
      // Penalty for adding ys in the middle
      acc += child[0][i].add.reduce((a, s) => {
        return a + Math.abs(child[1].get(s) - center)
      }, 0) * this.config.centeredAddLoss
      // Penalty for removing ys in the middle
      acc += child[0][i].remove.reduce((a, s) => {
        return a + Math.abs(child[1].get(s) - center)
      }, 0) * this.config.centeredRemoveLoss
      // Penalty for the amount of switches
      acc += child[0][i].switch.reduce((a, s) => {
        if (!child[0][i].add.includes(child[0][i].state[s.prev])) a++
        return a
      }, 0) * this.config.amtLoss
      // Penalty for the size of the switches
      acc += child[0][i].switch.reduce((a, s) => {
        if (!child[0][i].add.includes(child[0][i].state[s.prev])) a + Math.abs(s.target - s.prev)
        return a
      }, 0) * this.config.lengthLoss
    }
    return acc
  }

}