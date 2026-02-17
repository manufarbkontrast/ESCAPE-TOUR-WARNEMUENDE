import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['__tests__/setup-component.ts'],
    environmentMatchGlobs: [
      ['__tests__/components/**/*.test.tsx', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'app/api/**/*.ts',
        'lib/utils/**/*.ts',
        'lib/demo/**/*.ts',
        'stores/**/*.ts',
        'components/**/*.tsx',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        'components/game/MapView.tsx',
        'components/game/StationView.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
})
