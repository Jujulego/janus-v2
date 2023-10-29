/**
 * Possible proxy output
 */
export interface GateConfig {
  readonly target: string;
  readonly enabled?: boolean;
  readonly changeOrigin?: boolean;
  readonly secure?: boolean;
  readonly ws?: boolean;
}

/**
 * Redirected url inputs
 */
export interface ServiceConfig {
  readonly url: string;
  readonly gates: Readonly<Record<string, GateConfig>>;
}

/**
 * Janus configuration
 */
export interface Configuration {
  readonly services: Readonly<Record<string, ServiceConfig>>;
}
