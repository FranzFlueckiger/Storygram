import { Child, FullConfig, Data, GenePool, XLayer, XData } from './Types';
import { visit } from './Visitor';


function fit(data: Data, config: FullConfig) {
  let best: Child | undefined;
  let population: Child[];
  let newGenes: Array<Map<string, number>> | undefined;
  for (let i = 0; i < config.generationAmt; i++) {
    population = getGeneration(data, newGenes, config);
    for (const child of population) {
      if (!best || child.loss < best.loss) {
        best = child;
        console.log(best);
      }
    }
    const parents = select(population, config);
    newGenes = mate(parents, config);
    newGenes = mutate(data, newGenes, config);
  }
  if (best) {
    return { xData: best.x, yData: data.yData };
  }
}


function getGeneration(data: Data, yEntryPoints: Array<Map<string, number>> | undefined, config: FullConfig): Child[] {
  const population: Child[] = [];
  // Compute new generation
  for (let i = 0; i < config.populationSize; i++) {
    const entryPoints = yEntryPoints ? yEntryPoints[i] : undefined;
    const result: [XLayer[], GenePool] = visit(data, entryPoints);
    const loss = getLoss(result, config);
    const child: Child = { loss, gene: result[1], x: result[0] };
    population.push(child);
  }
  return population.sort((a, b) => a.loss - b.loss);
}


function select(population: Child[], config: FullConfig): Child[] {
  const parents = [];
  const length = population.length * config.selectionRate;
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() ** config.selectionSeverity * population.length);
    const parent = population[index];
    population.splice(index, 1);
    parents.push(parent);
  }
  return parents;
}


function mate(parents: Child[], config: FullConfig): GenePool[] {
  const genes = [];
  for (let i = 0; i < parents.length / config.selectionRate; i++) {
    const index = Math.floor(Math.random() ** 5 * parents.length);
    const parent1 = parents[index] as Child;
    const parent2 = parents[index] as Child;
    const gene1 = Array.from(parent1.gene);
    const gene2 = Array.from(parent2.gene);
    const newGene = gene1.reduce<GenePool>((map, gene, j) => {
      if (Math.random() < 0.5) {
        gene = gene2[j];
      }
      return map.set(gene[0], gene[1]);
    }, new Map());
    genes.push(newGene);
  }
  return genes;
}


function mutate(data: Data, genes: GenePool[], config: FullConfig) {
  genes.forEach((_, i) => {
    data.xData.forEach(x => {
      if (!x.isHidden) {
        x.add.forEach(y => {
          if (Math.random() < config.mutationProbability) {
            const newY = Math.random();
            genes[i].set(y, newY);
          }
        });
      }
    });
  });
  return genes;
}


function getLoss(child: [XData, GenePool], config: FullConfig): number {
  let score = 0;
  //score += getLinearLoss(child, config);
  score += getSwitchAmountLoss(child, config);
  score += getSwitchSizeLoss(child, config);
  return score;
}


function getSwitchAmountLoss(child: [XData, GenePool], config: FullConfig): number {
  return (
    child[0].reduce<number>((acc, xLayer) => {
      // Penalty for the amount of switches
      return (acc += xLayer.switch.length);
    }, 0) * config.amtLoss
  );
}


function getSwitchSizeLoss(child: [XData, GenePool], config: FullConfig): number {
  return child[0].reduce<number>((acc, xLayer) => {
    // Penalty for the amount of switches
    return (acc +=
      xLayer.switch.reduce((a, switches) => {
        if (!xLayer.add.includes(xLayer.state[switches.prev])) {
          a += Math.abs(switches.target - switches.prev);
        }
        return a;
      }, 0) * config.amtLoss);
  }, 0);
}


export { fit };
