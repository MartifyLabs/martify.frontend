class Cardano {
  async load() {
    if (this._wasm) return;

    try {
      this._wasm = await import("@emurgo/cardano-serialization-lib-browser");
    } catch (error) {
      console.error(`Unexpected error in load. [Message: ${error.message}]`);
    }
  }

  get Instance() {
    return this._wasm;
  }
}

export default new Cardano();
