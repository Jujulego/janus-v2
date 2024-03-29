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
  readonly outputs: Readonly<Record<string, OutputConfig>>;
}

/**
 * Proxy server config
 */
export interface ServerConfig {
  readonly port: number;
  readonly pidfile: string;
  readonly logfile: string;
}

/**
 * Janus configuration
 */
export interface Config {
  readonly redirections: Readonly<Record<string, RedirectionConfig>>;
  readonly server: ServerConfig;
}
