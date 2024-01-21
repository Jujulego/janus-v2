import { Logger, logger$, withLabel } from '@jujulego/logger';
import { q$ } from '@jujulego/quick-tag';
import { ChildProcess, fork } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import url from 'node:url';

import { ConfigService } from '../config/config.service.ts';

export class JanusDaemon {
  // Attributes
  readonly logger: Logger;

  private readonly _configService: ConfigService;

  // Constructor
  constructor(
    logger: Logger = logger$(),
    configService?: ConfigService,
  ) {
    this.logger = logger.child(withLabel('daemon'));

    this._configService = configService ?? new ConfigService(this.logger);
  }

  // Methods
  private _handleLogs(daemon: ChildProcess) {
    daemon.stdout!.on('data', (msg: Buffer) => {
      const logs = msg.toString().split(os.EOL);

      for (const log of logs) {
        if (log == '') continue;
        this.logger.next(JSON.parse(log));
      }
    });
  }

  /**
   * Starts proxy server inside a fork
   */
  fork(): Promise<boolean> {
    const dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const daemon = fork(path.resolve(dirname, './daemon.js'), [], {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    // Handle events
    this._handleLogs(daemon);

    daemon.stderr!.on('data', (msg: Buffer) => {
      this.logger.error(msg.toString('utf-8'));
    });

    daemon.send(this._configService.state);

    return new Promise<boolean>((resolve, reject) => {
      daemon.on('message', (msg) => {
        if (msg === 'started') {
          this.logger.verbose`Proxy successfully started in process ${daemon.pid}`;

          daemon.stdout!.destroy();
          daemon.stderr!.destroy();
          daemon.disconnect();
          daemon.unref();

          resolve(true);
        }
      });

      daemon.once('error', (err: Error) => {
        this.logger.error('Error while forking proxy server', err);

        reject(err);
      });

      daemon.once('exit', (code, signal) => {
        if (code) {
          this.logger.error`Proxy exited with code ${code}#?:${signal}, due to signal ${q$}?#`;
        } else {
          this.logger.warn`Proxy exited with code ${code}#?:${signal}, due to signal ${q$}?#`;
        }

        resolve(false);
      });
    });
  }
}
