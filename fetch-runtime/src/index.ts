/*
 * WARNING:
 * Do not change the following signature without changing the call
 * inside shiftMacro in babel-macro/src/macro.ts
 */
export function createRuntime(methodNames: string[], fileId: Record<'filename', string>) {
  const runtime: Record<string, (...args: any[]) => any> = {};
  for (const method of methodNames) {
    if (runtime[method]) {
      throw new Error(`Can not redefine ${method}`);
    }
    runtime[method] = (...args) => {
      let response: Response;
      // TODO: allow customizing URL
      return fetch('/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handler: method,
          path: fileId.filename,
          args,
        }),
      }).then((fetchResponse) => {
        response = fetchResponse;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('application/json')) {
          return response.json();
        }
        return undefined;
      }).then((jsonMessage) => {
        if (response.status >= 200 && response.status < 300) {
          return jsonMessage;
        }
        if (jsonMessage && jsonMessage.error) {
          throw new Error(`Error calling ${method}: ${jsonMessage.error}`);
        }
        throw new Error(`Error calling ${method}: status ${response.status}`);
      });
    };
  }
  return runtime;
}