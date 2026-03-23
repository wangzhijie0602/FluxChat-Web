import { defineConfig } from 'orval'

const openApiTarget = process.env.ORVAL_OPENAPI_URL ?? 'http://localhost:8081/v3/api-docs'

export default defineConfig({
  fluxchat: {
    input: {
      target: openApiTarget,
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/index.ts',
      schemas: './src/api/generated/model',
      client: 'axios-functions',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
