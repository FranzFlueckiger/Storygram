import { Child, Config, Data, GenePool, Switch, XLayer } from "./Types";
import { visit } from "./Visitor";

function fit(data: Data, config: Config): Data {
  let best: Child | undefined,
    population: Child[],
    newGenes: Array<Map<string, number>> | undefined;
  for (let i = 0; i < config.generationAmt!; i++) {
    population = getGeneration(data, newGenes, config);
    if (!best || population[0].loss < best.loss) {
      best = population[0];
      console.log(best);
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
    const child: Child = { loss, gene: result[1], x: result[0] };
    population.push(child);
  }
  return population.sort((a, b) => a.loss - b.loss);
}

function select(population: Child[], config: Config): Child[] {
  const parents = [];
  const length = population.length * config.selectionRate!;
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.pow(Math.random(), 8) * population.length);
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
    while (parent1 === parent2) {
      index = Math.floor(Math.pow(Math.random(), 5) * parents.length);
      parent1 = parents[index];
      index = Math.floor(Math.pow(Math.random(), 5) * parents.length);
      parent2 = parents[index];
    }
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

function getLoss(child: [XLayer[], GenePool], config: Config): number {
  let acc = 0;
  for (let i = 0; i < child[0].length; i++) {
    const center = child[0][i].state.length / 2;
    // Penalty for adding ys in the middle
    acc += child[0][i].add.reduce((a, s) => {
      return a + Math.abs(child[1].get(s)! - center);
    }, 0) * config.centeredAddLoss!;
    // Penalty for removing ys in the middle
    acc += child[0][i].remove.reduce((a, s) => {
      return a + Math.abs(child[1].get(s)! - center);
    }, 0) * config.centeredRemoveLoss!;
    // Penalty for the amount of switches
    acc += child[0][i].switch.reduce((a, s) => {
      if (!child[0][i].add.includes(child[0][i].state[s.prev])) { a++; }
      return a;
    }, 0) * config.amtLoss!;
    // Penalty for the size of the switches
    acc += child[0][i].switch.reduce((a, s) => {
      if (!child[0][i].add.includes(child[0][i].state[s.prev])) { a += Math.abs(s.target - s.prev); }
      return a;
    }, 0) * config.lengthLoss!;
    // todo check edit distance
    // if(i>0) acc += levenshtein(child[0][i].switch, child[0][i-1].switch)
  }
  return acc;
}

function getRandomGene(): number {
  return Math.pow(Math.random(), 1) * 2 - 1;
}

// code from https://gist.github.com/leo6104/fb4ff3d2938bd4f9fbbdff9127c810a7
function levenshtein(a: Switch[], b: Switch[]): number {
  if (a.length == 0) {
    return b.length;
  }
  if (b.length == 0) {
    return a.length;
  }
  const matrix = new Array<number[]>(b.length + 1);
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = new Array<number>(a.length + 1);
    matrix[i][0] = i;
  }
  for (let i = 1; i <= b.length; ++i) {
    for (let j = 1; j <= a.length; ++j) {
      matrix[i][j] = (b[i - 1] === a[j - 1]) ?
        matrix[i - 1][j - 1]
        :
        Math.min(
          matrix[i - 1][j - 1], // substitution
          matrix[i][j - 1], // insertion
          matrix[i - 1][j], // deletion
        ) + 1;
    }
  }
  return matrix[b.length][a.length];
}

export { fit, getRandomGene };
