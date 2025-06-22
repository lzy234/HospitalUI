/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LLM_API_BASE: string;
  readonly VITE_LLM_API_KEY: string;
  readonly VITE_BACKEND_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 