import type { AxiosInstance } from 'axios';

export interface StubCall {
  url: string;
  params: Record<string, unknown>;
}

export interface StubAxios {
  instance: AxiosInstance;
  calls: StubCall[];
}

export function makeStubAxios(response: unknown = []): StubAxios {
  const calls: StubCall[] = [];
  const instance = {
    get: async (url: string, config?: { params?: Record<string, unknown> }) => {
      calls.push({ url, params: config?.params ?? {} });
      return { data: response };
    },
  } as unknown as AxiosInstance;
  return { instance, calls };
}
