import { defineConfig } from 'orval';

export default defineConfig({
  odysseyApi: {
    input: {
      target: './openapi.json',
      validation: false,
    },
    output: {
      target: './src/generated/api.ts',
      schemas: './src/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      override: {
        mutator: {
          path: './src/axios-instance.ts',
          name: 'customAxiosInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
