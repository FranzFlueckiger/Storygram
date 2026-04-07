// d3 v7+ and several other deps publish pure ESM. Jest runs in CJS mode, so we
// must opt those packages INTO babel-jest transformation rather than ignoring them.
//
// Two regex patterns are needed because npm and pnpm lay out node_modules differently:
//   npm/yarn  →  node_modules/<pkg>/...
//   pnpm      →  node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/...
//
// transformIgnorePatterns: if a file's path matches ANY pattern it is NOT transformed.
// We flip the logic with a negative lookahead so ESM packages are NOT ignored.
const ESM_PACKAGES = [
  'd3',
  'd3-array', 'd3-axis', 'd3-brush', 'd3-chord', 'd3-color',
  'd3-contour', 'd3-delaunay', 'd3-dispatch', 'd3-drag', 'd3-dsv',
  'd3-ease', 'd3-fetch', 'd3-force', 'd3-format', 'd3-geo',
  'd3-hierarchy', 'd3-interpolate', 'd3-path', 'd3-polygon',
  'd3-quadtree', 'd3-random', 'd3-scale', 'd3-scale-chromatic',
  'd3-selection', 'd3-shape', 'd3-time', 'd3-time-format', 'd3-timer',
  'd3-transition', 'd3-zoom',
  'internmap', 'delaunator', 'robust-predicates',
  'uuid', 'uuidv4',
];

// pnpm stores packages as `<name>@<version>` inside .pnpm, so prefix each name with '@'
const ESM_PNPM = ESM_PACKAGES.map(p => `${p}@`);

module.exports = {
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {tsconfig: 'tsconfig.json'}],
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // pnpm: skip transformation only for packages NOT in our ESM list
    `node_modules/\\.pnpm/(?!(${ESM_PNPM.join('|')}))`,
    // npm/yarn: same idea; also exempt .pnpm itself so the rule above applies instead
    `node_modules/(?!(\\.pnpm|${ESM_PACKAGES.join('|')}))`,
  ],
  testEnvironment: 'jsdom',
};
