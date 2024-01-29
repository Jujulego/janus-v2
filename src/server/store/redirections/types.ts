// Types
export interface RedirectionOutputState {
  name: string;
  target: string;
  enabled: boolean;
  changeOrigin: boolean;
  secure: boolean;
  ws: boolean;
}

export interface RedirectionState {
  id: string;
  url: string;
  outputs: string[];
  outputsByName: Record<string, RedirectionOutputState>;
}

export interface RedirectionsState {
  ids: string[];
  byId: Record<string, RedirectionState>;
}