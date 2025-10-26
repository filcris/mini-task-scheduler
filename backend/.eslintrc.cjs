/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2021: true, jest: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: undefined, // ativa isto se precisares de regras type-aware
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint', 'import', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      // Permite ao eslint-plugin-import entender TS (node_modules e paths)
      typescript: {
        project: ['./tsconfig.json'],
        alwaysTryTypes: true
      },
      node: {
        extensions: ['.js', '.ts']
      }
    }
  },
  rules: {
    // ordenar imports automaticamente
    'import/order': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',

    // menos ruído
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    'prisma/migrations/',
    '**/*.d.ts',
    // Ignora módulos opcionais (se não vais usar BullMQ, isto evita no-unresolved)
    'src/queue/**'
  ]
};
