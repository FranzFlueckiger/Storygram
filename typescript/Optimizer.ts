import { Visitor } from "./Visitor"
import { Child, GenePool, XLayer, Data, Config } from "./Types"

export class Optimizer {

  public static fit(data: Data, config: Config): Data {
    let best: Child,
      population: Child[],
      newGenes: Map<string, number>[]
    for (let i = 0; i < config.generationAmt; i++) {
      population = this.getGeneration(data, newGenes, config)
      if (!best || population[0].loss < best.loss) {
        best = population[0]
        console.log(best)
      }
      let parents = this.select(population, config)
      newGenes = this.mate(parents, config)
      newGenes = this.mutate(data, newGenes, config)
    }
    return [best.x, data[1]]
  }

  private static getGeneration(data: Data, yEntryPoints: Map<string, number>[], config: Config): Child[] {
    let population: Child[] = []
    // Compute new generation
    for (let i = 0; i < config.populationSize; i++) {
      let entryPoints = yEntryPoints ? yEntryPoints[i] : undefined
      let result: [XLayer[], GenePool] = Visitor.visit(data, entryPoints)
      let loss = this.getLoss(result, config)
      let child: Child = { loss: loss, gene: result[1], x: result[0] }
      population.push(child)
    }
    return population.sort((a, b) => a.loss - b.loss)
  }

  private static select(population: Child[], config: Config): Child[] {
    let parents = []
    let length = population.length * config.selectionRate
    for (let i = 0; i < length; i++) {
      let index = Math.floor(Math.pow(Math.random(), 8) * population.length)
      let parent = population[index]
      population.splice(index, 1)
      parents.push(parent)
    }
    return parents
  }

  private static mate(parents: Child[], config: Config): GenePool[] {
    let genes = []
    for (let i = 0; i < parents.length / config.selectionRate; i++) {
      let parent1: Child, parent2: Child, index: number
      while (parent1 === parent2) {
        index = Math.floor(Math.pow(Math.random(), 5) * parents.length)
        parent1 = parents[index]
        index = Math.floor(Math.pow(Math.random(), 5) * parents.length)
        parent2 = parents[index]
      }
      let gene1 = Array.from(parent1.gene)
      let gene2 = Array.from(parent2.gene)
      let newGene = gene1.reduce<GenePool>((map, gene, i) => {
        if (Math.random() < 0.5) {
          gene = gene2[i]
        }
        return map.set(gene[0], gene[1])
      }, new Map())
      genes.push(newGene)
    }
    return genes
  }

  private static mutate(data: Data, genes: GenePool[], config: Config) {
    genes.forEach((_, i) => {
      data[0].forEach(x => {
        if (!x.isHidden) {
          x.add.forEach(y => {
            if (Math.random() < config.mutationProbability) {
              let newY = this.getRandomGene()
              genes[i].set(y, newY)
            }
          })
        }
      })
    }
    )
    return genes
  }

  private static getLoss(child: [XLayer[], GenePool], config: Config): number {
    let acc = 0
    for (let i = 0; i < child[0].length; i++) {
      let center = child[0][i].state.length / 2
      // Penalty for adding ys in the middle
      acc += child[0][i].add.reduce((a, s) => {
        return a + Math.abs(child[1].get(s) - center)
      }, 0) * config.centeredAddLoss
      // Penalty for removing ys in the middle
      acc += child[0][i].remove.reduce((a, s) => {
        return a + Math.abs(child[1].get(s) - center)
      }, 0) * config.centeredRemoveLoss
      // Penalty for the amount of switches
      acc += child[0][i].switch.reduce((a, s) => {
        if (!child[0][i].add.includes(child[0][i].state[s.prev])) a++
        return a
      }, 0) * config.amtLoss
      // Penalty for the size of the switches
      acc += child[0][i].switch.reduce((a, s) => {
        if (!child[0][i].add.includes(child[0][i].state[s.prev])) a + Math.abs(s.target - s.prev)
        return a
      }, 0) * config.lengthLoss
    }
    return acc
  }

  public static getRandomGene(): number {
    return Math.pow(Math.random(), 1) * 2 - 1
  }

}
