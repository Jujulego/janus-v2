import { Log, toStream } from '@jujulego/logger';
import { qjson } from '@jujulego/quick-tag';
import { Observable, OffFn } from 'kyrielle';
import { flow$ } from 'kyrielle/pipe';
import { createWriteStream, WriteStream } from 'node:fs';

// Class
export class LogFile {
  // Attributes
  private _stream?: WriteStream;
  private _off: OffFn;

  // Methods
  open(path: string, logger: Observable<Log>) {
    // Open new file
    if (this._stream?.path !== path) {
      this._stream?.close();
      this._stream = createWriteStream(path, { encoding: 'utf-8', flags: 'w' });
    }

    // Subscribe to logger
    this._off?.();
    this._off = flow$(logger, toStream(this._stream, (log) => qjson(log)!));
  }
}