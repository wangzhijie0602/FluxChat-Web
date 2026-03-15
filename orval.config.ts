import { defineConfig } from 'orval'

export default defineConfig({
  petstore: {
    output: {
      mode: 'tags-split',
      target: './src/api/petstore.ts',
      schemas: './src/model',
      mock: true,
      client: 'axios',
    },
    input: {
      target: './petstore.json',
    },
  },
})
