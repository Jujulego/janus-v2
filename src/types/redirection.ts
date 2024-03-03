export interface RedirectionOutput {
  id: string;
  name: string;
  target: string;
  enabled: boolean;
  changeOrigin: boolean;
  secure: boolean;
  ws: boolean;
}

export interface Redirection {
  id: string;
  url: string;
  outputs: RedirectionOutput[];
}
