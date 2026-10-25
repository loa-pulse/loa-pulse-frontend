import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // 서식 규칙은 Prettier에 맡기므로 겹치는 ESLint 규칙을 끈다 (항상 마지막에 둔다)
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
  },
  {
    // shadcn/ui가 생성하는 컴포넌트는 variants 같은 헬퍼를 함께 내보낸다
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
