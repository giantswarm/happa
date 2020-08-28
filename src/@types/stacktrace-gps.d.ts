declare module 'stacktrace-gps' {
  import { StackFrame } from 'stacktrace-js';

  export interface IStackTraceGPS {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): IStackTraceGPS;
    pinpoint(stackFrame: StackFrame): StackFrame;
  }

  const StackTrace: IStackTraceGPS;

  export = StackTrace;
}
