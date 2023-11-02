export interface RedirectionOutput {
  target: string;
  enabled: boolean;
  changeOrigin: boolean;
  secure: boolean;
  ws: boolean;
}

export interface Redirection {
  url: string;
  outputs: Record<string, RedirectionOutput>;
}