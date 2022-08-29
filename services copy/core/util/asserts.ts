export function assertDefined(v: any): asserts v {
    if (v === undefined) {
      throw new Error("Assertion failed: value is undefined");
    }
  }

export function assert(v: any): asserts v {
    if (!v){
        throw new Error("Assertion failed: value is nullish")
    }
}