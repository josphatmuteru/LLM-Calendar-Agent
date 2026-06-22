/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Add other env variables here as your project grows...
  
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
