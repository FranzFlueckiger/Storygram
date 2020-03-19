const { mergeWith } = require('lodash/fp')
const fs = require('fs-extra')

let custom = {}
const hasGatsbyConfig = fs.existsSync('./gatsby-config.custom.js')

if (hasGatsbyConfig) {
  try {
    custom = require('./gatsby-config.custom')
  } catch (err) {
    console.error(
      `Failed to load your gatsby-config.js file : `,
      JSON.stringify(err),
    )
  }
}

const config = {
  pathPrefix: '/',

  siteMetadata: {
    title: 'Storygram Docs',
    description: 'My awesome app using docz',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
    {
      resolve: 'gatsby-theme-docz',
      options: {
        themeConfig: {},
        themesDir: 'src',
        mdxExtensions: ['.md', '.mdx'],
        docgenConfig: {},
        menu: [],
        mdPlugins: [],
        hastPlugins: [],
        ignore: [],
        typescript: true,
        ts: false,
        propsParser: true,
        'props-parser': true,
        debug: false,
        native: false,
        openBrowser: false,
        o: false,
        open: false,
        'open-browser': false,
        root:
          'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz',
        base: '/',
        source: './',
        src: './',
        files: '**/*.{md,markdown,mdx}',
        public: '/public',
        dest: '.docz/dist',
        d: '.docz/dist',
        editBranch: 'master',
        eb: 'master',
        'edit-branch': 'master',
        config: '',
        title: 'Storygram Docs',
        description: 'My awesome app using docz',
        host: 'localhost',
        port: 3000,
        p: 3000,
        separator: '-',
        paths: {
          root: 'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc',
          templates:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\node_modules\\docz-core\\dist\\templates',
          docz:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz',
          cache:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz\\.cache',
          app:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz\\app',
          appPackageJson:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\package.json',
          gatsbyConfig:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\gatsby-config.js',
          gatsbyBrowser:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\gatsby-browser.js',
          gatsbyNode:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\gatsby-node.js',
          gatsbySSR:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\gatsby-ssr.js',
          importsJs:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz\\app\\imports.js',
          rootJs:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz\\app\\root.jsx',
          indexJs:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz\\app\\index.jsx',
          indexHtml:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz\\app\\index.html',
          db:
            'C:\\Users\\bassplayerch\\PROGRAMMING\\REACT\\Storygram\\doc\\.docz\\app\\db.json',
        },
      },
    },
  ],
}

const merge = mergeWith((objValue, srcValue) => {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
})

module.exports = merge(config, custom)
