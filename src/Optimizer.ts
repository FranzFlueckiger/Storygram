import { Child, Config, Data, GenePool, Switch, XLayer, XData } from "./Types";
import { visit } from "./Visitor";

function fit(data: Data, config: Config): Data {
  let best: Child | undefined,
    population: Child[],
    newGenes: Array<Map<string, number>> | undefined;
  for (let i = 0; i < config.generationAmt!; i++) {
    population = getGeneration(data, newGenes, config);
    for (let child of population) {
      if (!best || child.loss < best.loss) {
        best = child;
        console.log(best);
      }
    }
    const parents = select(population, config);
    newGenes = mate(parents, config);
    newGenes = mutate(data, newGenes, config);
  }
  return { xData: best!.x, yData: data.yData };
}

function getGeneration(data: Data, yEntryPoints: Array<Map<string, number>> | undefined, config: Config): Child[] {
  const population: Child[] = [];
  // Compute new generation
  for (let i = 0; i < config.populationSize!; i++) {
    const entryPoints = yEntryPoints ? yEntryPoints[i] : undefined;
    const result: [XLayer[], GenePool] = visit(data, entryPoints);
    const loss = getLoss(result, config);
    const child: Child = { loss: loss, gene: result[1], x: result[0] };
    population.push(child);
  }
  return population.sort((a, b) => a.loss - b.loss);;
}

function select(population: Child[], config: Config): Child[] {
  const parents = [];
  const length = population.length * config.selectionRate!;
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.pow(Math.random(), config.selectionSeverity!) * population.length);
    const parent = population[index];
    population.splice(index, 1);
    parents.push(parent);
  }
  return parents;
}

function mate(parents: Child[], config: Config): GenePool[] {
  const genes = [];
  for (let i = 0; i < parents.length / config.selectionRate!; i++) {
    let parent1: Child | undefined, parent2: Child | undefined, index: number;
    index = Math.floor(Math.pow(Math.random(), 5) * parents.length);
    parent1 = parents[index];
    index = Math.floor(Math.pow(Math.random(), 5) * parents.length);
    parent2 = parents[index];
    const gene1 = Array.from(parent1!.gene);
    const gene2 = Array.from(parent2!.gene);
    const newGene = gene1.reduce<GenePool>((map, gene, i) => {
      if (Math.random() < 0.5) {
        gene = gene2[i];
      }
      return map.set(gene[0], gene[1]);
    }, new Map());
    genes.push(newGene);
  }
  return genes;
}

function mutate(data: Data, genes: GenePool[], config: Config) {
  genes.forEach((_, i) => {
    data.xData.forEach((x) => {
      if (!x.isHidden) {
        x.add.forEach((y) => {
          if (Math.random() < config.mutationProbability!) {
            const newY = getRandomGene();
            genes[i].set(y, newY);
          }
        });
      }
    });
  },
  );
  return genes;
}

function getLoss(child: [XData, GenePool], config: Config): number {
  let score: number = 0
  score += getLinearLoss(child, config);
  score += getSwitchAmountLoss(child, config)
  score += getSwitchDistanceLoss(child, config)
  return score
}

function getLinearLoss(child: [XData, GenePool], config: Config): number {
  let score: number = 0
  const xLayers: XData = child[0]
  const maxLen = xLayers.reduce((acc, c) => Math.max(acc, c.state.length), 0)
  let prevVector = getStateVector(xLayers[0], maxLen, config)
  for (let i = 1; i < xLayers.length; i++) {
    let vector = getStateVector(xLayers[i], maxLen, config)
    for (let j = 0; j < maxLen; j++) {
      if (prevVector[j] != vector[j]) score++
    }
    prevVector = vector
  }
  return score
}

function getSwitchAmountLoss(child: [XData, GenePool], config: Config): number {
  return child[0].reduce<number>((acc, xLayer) => {
    // Penalty for the amount of switches
    return acc += xLayer.switch.length
  }, 0) * config.amtLoss!;
}

function getSwitchDistanceLoss(child: [XData, GenePool], config: Config): number {
  return child[0].reduce<number>((acc, xLayer) => {
    // Penalty for the amount of switches
    return acc += xLayer.switch.reduce((a, switches) => {
      if (!xLayer.add.includes(xLayer.state[switches.prev])) { a += Math.abs(switches.target - switches.prev); }
      return a;
    }, 0) * config.amtLoss!
  }, 0);
}

// todo implement config option isCentered
function getStateVector(xLayer: XLayer, maxLen: number, config: Config): string[] {
  let stateVector: string[] = []
  for (let i = 0; i < maxLen; i++) {
    let yPoint: string = ''
    if (config.centered) {
      let stateLen = xLayer.state.length
      let entry = Math.floor((maxLen - stateLen - stateLen % 2) / 2)
      if (i >= entry || i <= maxLen - entry) {
        yPoint = xLayer.state[i - entry]
      }
    } else {
      yPoint = xLayer.state[i]
    }
    if (!yPoint) {
      yPoint = ''
    }
    stateVector.push(yPoint)
  }
  return stateVector;
}

function getRandomGene(): number {
  return Math.pow(Math.random(), 0.2) * 2 - 1;
}

export { fit, getRandomGene };
