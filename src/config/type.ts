/**
 * Possible proxy output
 */
export interface OutputConfig {
  readonly target: string;
  readonly enabled: boolean;
  readonly changeOrigin: boolean;
  readonly secure: boolean;
  readonly ws: boolean;
}

/**
 * Redirected url inputs
 */
export interface RedirectionConfig {
  readonly url: string;
  readonly outputs: Readonly<Record<string, OutputConfig>>;
}

/**
 * Proxy server config
 */
export interface IProxyConfig {
  readonly port: number;
}

/**
 * Janus configuration
 */
export interface Config {
  readonly pidfile: string;
  readonly proxy: IProxyConfig;
  readonly redirections: readonly RedirectionConfig[];
}