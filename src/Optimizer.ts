import {Child, FullConfig, Data, GenePool, Event} from './Types';
import {visit} from './Visitor';


function fit(data: Data, config: FullConfig) {
  let best: Child | undefined;
  let population: Child[];
  let newGenes: Array<Map<string, number>> | undefined;
  for(let i = 0; i < config.generationAmt; i++) {
    population = getGeneration(data, newGenes, config);
    for(const child of population) {
      if(!best || child.loss < best.loss) {
        best = child;
        if(config.verbose) {
          console.log(best);
        }
      }
    }
    const parents = select(population, config);
    newGenes = mate(parents, config);
    newGenes = mutate(data, newGenes, config);
  }
  if(best) {
    return {events: best.events, actors: data.actors};
  }
}


function getGeneration(data: Data, yEntryPoints: Array<Map<string, number>> | undefined, config: FullConfig): Child[] {
  const population: Child[] = [];
  // Compute new generation
  for(let i = 0; i < config.populationSize; i++) {
    const entryPoints = yEntryPoints ? yEntryPoints[i] : undefined;
    const result: [Event[], GenePool] = visit(data, entryPoints, config);
    const loss = getLoss(result, config);
    const child: Child = {loss, gene: result[1], events: result[0]};
    population.push(child);
  }
  return population.sort((a, b) => a.loss - b.loss);
}


function select(population: Child[], config: FullConfig): Child[] {
  const parents = [];
  const length = population.length * config.selectionRate;
  for(let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() ** config.selectionSeverity * population.length);
    const parent = population[index];
    population.splice(index, 1);
    parents.push(parent);
  }
  return parents;
}


function mate(parents: Child[], config: FullConfig): GenePool[] {
  const genes = [];
  for(let i = 0; i < parents.length / config.selectionRate; i++) {
    const index = Math.floor(Math.random() ** 5 * parents.length);
    const parent1 = parents[index] as Child;
    const parent2 = parents[index] as Child;
    const gene1 = Array.from(parent1.gene);
    const gene2 = Array.from(parent2.gene);
    const newGene = gene1.reduce<GenePool>((map, gene, j) => {
      if(Math.random() < 0.5) {
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
    data.events.forEach(x => {
      if(!x.isHidden) {
        x.add.forEach(y => {
          if(Math.random() < config.mutationProbability) {
            const newY = Math.random();
            genes[i].set(y, newY);
          }
        });
      }
    });
  });
  return genes;
}


function getLoss(child: [Event[], GenePool], config: FullConfig): number {
  let score = 0;
  score += getSwitchAmountLoss(child, config);
  score += getSwitchSizeLoss(child, config);
  if(config.compact) {
    score += getLinearLoss(child, config)
  } else {
    score += getYExtentLoss(child, config)
  }
  return score;
}

function getSwitchAmountLoss(child: [Event[], GenePool], config: FullConfig): number {
  return (child[0].reduce<number>((acc, xLayer) => {
    // Penalty for the amount of switches
    return (acc += xLayer.switch.length);
  }, 0)
  ) * config.amtLoss;
}

function getSwitchSizeLoss(child: [Event[], GenePool], config: FullConfig): number {
  return child[0].reduce<number>((acc, xLayer) => {
    // Penalty for the amount of switches
    return (acc +=
      xLayer.switch.reduce((a, switches) => {
        if(!xLayer.add.includes(xLayer.state[switches.prev])) {
          a += Math.abs(switches.target - switches.prev);
        }
        return a;
      }, 0));
  }, 0) * config.lengthLoss;
}

function getYExtentLoss(child: [Event[], GenePool], config: FullConfig): number {
  return child[0].reduce((max, x) => {
    return Math.max(max, x.state.length)
  }, 0) * config.yExtentLoss
}

function getLinearLoss(child: [Event[], GenePool], config: FullConfig): number {
  let score = 0;
  const xLayers: Event[] = child[0];
  const maxLen = xLayers.reduce((acc, c) => Math.max(acc, c.state.length), 0);
  let prevVector = getStateVector(xLayers[0], maxLen, config);
  for(let i = 1; i < xLayers.length; i++) {
    const vector = getStateVector(xLayers[i], maxLen, config);
    for(let j = 0; j < maxLen; j++) {
      if(prevVector[j] != vector[j]) score++;
    }
    prevVector = vector;
  }
  return score;
}

function getStateVector(xLayer: Event, maxLen: number, config: FullConfig): string[] {
  const stateVector: string[] = [];
  for(let i = 0; i < maxLen; i++) {
    let yPoint = '';
    // todo should be config.centered, must be implemented
    if(config.compact) {
      const stateLen = xLayer.state.length;
      const entry = Math.floor((maxLen - stateLen - (stateLen % 2)) / 2);
      if(i >= entry || i <= maxLen - entry) {
        yPoint = xLayer.state[i - entry];
      }
    } else {
      yPoint = xLayer.state[i];
    }
    if(!yPoint) {
      yPoint = '';
    }
    stateVector.push(yPoint);
  }
  return stateVector;
}

export {fit};
