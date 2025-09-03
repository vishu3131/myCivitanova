const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  // Configurazione per l'analisi del bundle
  plugins: [
    // Analizzatore del bundle (solo in modalità analyze)
    process.env.ANALYZE === 'true' && new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html',
    }),
    
    // Compressione gzip
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ].filter(Boolean),

  // Ottimizzazioni
  optimization: {
    // Split dei chunks per migliorare il caching
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunks separati
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        
        // React e librerie correlate
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        
        // Framer Motion
        framerMotion: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: 'framer-motion',
          chunks: 'all',
          priority: 15,
        },
        
        // Supabase
        supabase: {
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          name: 'supabase',
          chunks: 'all',
          priority: 15,
        },
        
        // Componenti admin
        admin: {
          test: /[\\/]src[\\/]components[\\/]admin[\\/]/,
          name: 'admin',
          chunks: 'all',
          priority: 5,
        },
        
        // Utilities comuni
        common: {
          test: /[\\/]src[\\/](lib|utils|hooks)[\\/]/,
          name: 'common',
          chunks: 'all',
          priority: 5,
        },
      },
    },
    
    // Minimizzazione
    minimize: true,
    
    // Rimozione di codice morto
    usedExports: true,
    sideEffects: false,
  },

  // Configurazione del resolver
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    
    // Estensioni da risolvere automaticamente
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    
    // Fallback per moduli Node.js
    fallback: {
      "crypto": false,
      "stream": false,
      "util": false,
    },
  },

  // Configurazione del modulo
  module: {
    rules: [
      // TypeScript e JSX
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
              plugins: [
                // Lazy loading per React
                '@babel/plugin-syntax-dynamic-import',
                
                // Ottimizzazioni per le importazioni
                ['babel-plugin-import', {
                  libraryName: 'lodash',
                  libraryDirectory: '',
                  camel2DashComponentName: false,
                }, 'lodash'],
                
                // Tree shaking per lucide-react
                ['babel-plugin-import', {
                  libraryName: 'lucide-react',
                  libraryDirectory: 'dist/esm/icons',
                  camel2DashComponentName: false,
                }, 'lucide'],
              ],
            },
          },
        ],
      },
      
      // CSS e SCSS
      {
        test: /\.(css|scss)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'tailwindcss',
                  'autoprefixer',
                  // Ottimizzazioni CSS
                  ['cssnano', {
                    preset: ['default', {
                      discardComments: { removeAll: true },
                      normalizeWhitespace: true,
                    }],
                  }],
                ],
              },
            },
          },
          'sass-loader',
        ],
      },
      
      // Immagini e asset
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
        generator: {
          filename: 'static/images/[name].[hash][ext]',
        },
      },
      
      // Font
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/fonts/[name].[hash][ext]',
        },
      },
    ],
  },

  // Configurazione della cache
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    buildDependencies: {
      config: [__filename],
    },
  },

  // Configurazione delle performance
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 500kb
    maxAssetSize: 512000, // 500kb
  },

  // Source maps per il debugging
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',

  // Configurazione del dev server
  devServer: {
    hot: true,
    compress: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },

  // Configurazione degli external (per ridurre il bundle size)
  externals: {
    // Esclude librerie pesanti se caricate via CDN
    // 'react': 'React',
    // 'react-dom': 'ReactDOM',
  },

  // Configurazione degli stats
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  },
};

// Configurazioni specifiche per l'ambiente
if (process.env.NODE_ENV === 'production') {
  module.exports.mode = 'production';
  
  // Ottimizzazioni aggiuntive per la produzione
  module.exports.optimization.concatenateModules = true;
  module.exports.optimization.providedExports = true;
  module.exports.optimization.usedExports = true;
  module.exports.optimization.sideEffects = false;
} else {
  module.exports.mode = 'development';
  
  // Configurazioni per lo sviluppo
  module.exports.optimization.removeAvailableModules = false;
  module.exports.optimization.removeEmptyChunks = false;
  module.exports.optimization.splitChunks = false;
}