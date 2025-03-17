// Type definitions for missing packages

declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
  }

  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    baseURL?: string;
    headers?: any;
    params?: any;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    responseType?: string;
  }

  export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  // Use 'del' instead of 'delete' since delete is a reserved word
  export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;

  const axios: {
    get: typeof get;
    post: typeof post;
    put: typeof put;
    delete: typeof del;
  };
  
  export default axios;
}

declare module 'cheerio' {
  export interface CheerioAPI {
    (selector: string): CheerioElement;
    load(html: string): CheerioAPI;
  }

  export interface CheerioElement {
    find(selector: string): CheerioElement;
    each(fn: (index: number, element: any) => void): CheerioElement;
    attr(name: string): string | undefined;
    text(): string;
  }

  export function load(html: string): CheerioAPI;
}

// Add definition for localStorage if needed in browser environment
interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
  [key: string]: any;
}

declare var localStorage: Storage;
declare var sessionStorage: Storage;
