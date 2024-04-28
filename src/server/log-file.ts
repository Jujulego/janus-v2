import { qjson } from '@jujulego/quick-tag';
import { Log, toStream } from '@kyrielle/logger';
import { flow$, Observable, Subscription } from 'kyrielle';
import { createWriteStream, WriteStream } from 'node:fs';

// Class
export class LogFile {
  // Attributes
  private _stream?: WriteStream;
  private _subscription: Subscription;

  // Methods
  open(path: string, logger: Observable<Log>) {
    // Open new file
    if (this._stream?.path !== path) {
      this._stream?.close();
      this._stream = createWriteStream(path, { encoding: 'utf-8', flags: 'w' });
    }

    // Subscribe to logger
    this._subscription?.unsubscribe();
    this._subscription = flow$(logger, toStream(this._stream, (log) => qjson(log)!));
  }

  async close(): Promise<void> {
    if (this._stream) {
      await new Promise<void>(((resolve, reject) => this._stream!.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })));
    }
  }
}
