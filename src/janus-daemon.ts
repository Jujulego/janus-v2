import { Logger, logger$ } from '@jujulego/logger';
import { ChildProcess, fork } from 'node:child_process';
import path from 'node:path';
import url from 'node:url';

import { ConfigService } from './config/config.service.ts';

export class JanusDaemon {
  // Attributes
  readonly logger: Logger;

  private readonly _configService: ConfigService;

  private _process?: ChildProcess;

  // Constructor
  constructor(
    logger: Logger = logger$(),
    configService?: ConfigService,
  ) {
    this.logger = logger;

    this._configService = configService ?? new ConfigService(this.logger);
  }

  // Methods
  /**
   * Starts proxy server inside a fork
   */
  fork() {
    const dirname = path.dirname(url.fileURLToPath(import.meta.url));

   this._process = fork(path.resolve(dirname, './daemon.js'), [], {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    // Print outputs
    this._process.stdout?.on('data', (msg: Buffer) => {
      process.stdout.write(msg);
    });

    this._process.stderr?.on('data', (msg: Buffer) => {
      process.stderr.write(msg);
    });

    // Handle end
    this._process.on('close', (code) => {
      process.exit(code ?? 0);
    });
  }
}