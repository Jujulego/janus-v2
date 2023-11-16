import { HttpError } from 'http-errors';
import { ServerResponse } from 'node:http';

/**
 * Send http error to response
 */
export function sendHttpError(res: ServerResponse, error: HttpError) {
  res.statusCode = error.statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify({
    status: error.statusCode,
    message: error.message
  }));
  res.end();
}

/**
 * Render as a valid http response
 */
export function renderHttpError(error: HttpError): string {
  const content = JSON.stringify({
    status: error.statusCode,
    message: error.message
  });

  return `HTTP/1.1 ${error.statusCode} ${error.name}\r\n`
       + `Content-Length: ${content.length}\r\n`
       + 'Content-Type: application/json\r\n'
       + '\r\n'
       + '\r\n'
       + content;
}
