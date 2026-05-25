import axios, { type AxiosRequestConfig } from 'axios';

// Base URL comes from the app environment — Expo exposes it via EXPO_PUBLIC_*
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env['EXPO_PUBLIC_API_URL']) {
    return process.env['EXPO_PUBLIC_API_URL'];
  }
  return 'http://localhost:8787';
};

export const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Orval mutator signature
export const customAxiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = axiosInstance({ ...config, cancelToken: source.token }).then(
    ({ data }) => data as T,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (promise as any).cancel = () => {
    source.cancel('Query was cancelled by React Query');
  };
  return promise;
};

export default customAxiosInstance;
