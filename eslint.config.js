import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', 'data/**', '**/playwright-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // O preset do Vue só faz sentido em SFC; sem o `files`, regras como one-component-per-file
  // também rodariam nos .ts da API e do scraper.
  ...pluginVue.configs['flat/vue2-recommended'].map((config) => ({
    ...config,
    files: ['**/*.vue'],
  })),
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      'vue/no-v-html': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['**/tests/**', '**/*.spec.ts'],
    languageOptions: { globals: { ...globals.vitest } },
  },
  prettier,
)
