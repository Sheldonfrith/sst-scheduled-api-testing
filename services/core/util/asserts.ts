export function assertDefined(v: any, message?: string): asserts v {
  if (v === undefined) {
    throw new Error("Assertion failed: value is undefined. " + message);
  }
}

export function assert(v: any, message?: string): asserts v {
  if (!v) {
    throw new Error("Assertion failed: value is nullish. " + message);
  }
}
