class Cardano {
  async load() {
    if (this._wasm) return;

    this._wasm = await import(
      "./@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib"
    );
  }

  get Instance() {
    return this._wasm;
  }
}

export default new Cardano();
