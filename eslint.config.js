import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // The app uses controlled dialog forms that intentionally reset local draft
      // state when opened. The React compiler rule is useful for app effects, but
      // too noisy for these local form-reset cases.
      'react-hooks/set-state-in-effect': 'off',
      // Vite entry/context files intentionally export non-component helpers.
      'react-refresh/only-export-components': 'off',
    },
  },
])
