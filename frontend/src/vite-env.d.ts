
interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_API_URL: string;
  //  agregá acá todas las variables que uses con import.meta.env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}