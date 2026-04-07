// d3 v7+ and its sub-packages publish pure ESM. Jest runs in CommonJS mode,
// so we must opt those packages into transformation (via babel-jest + @babel/preset-env)
// rather than leaving them in the default "ignore node_modules" bucket.
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

module.exports = {
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {tsconfig: 'tsconfig.json'}],
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    `node_modules/(?!(${ESM_PACKAGES.join('|')})/)`
  ],
  testEnvironment: 'jsdom',
};
