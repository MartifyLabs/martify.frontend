import Cardano from "../serialization-lib";
import { fromHex } from "../../utils/converter";

class Wallet {
  async enable(name) {
    if (name === "ccvault") {
      const instance = await window.cardano?.ccvault?.enable();
      if (instance) {
        this._provider = instance;
        return true;
      }
    } else if (name === "gerowallet") {
      const instance = await window.cardano?.gerowallet?.enable();
      if (instance) {
        this._provider = instance;
        return true;
      }
    } else if (name === "nami" || name === false) {
      const isEnabled = await window.cardano?.enable();
      if (isEnabled) {
        this._provider = window.cardano;
        return true;
      }
    }
    return false;
  }

  async getAvailableWallets() {
    let availableWallets = [];

    if (window.cardano === undefined) {
      return availableWallets;
    }

    if (window.cardano.ccvault) {
      availableWallets.push("ccvault");
    }

    if (window.cardano.gerowallet) {
      availableWallets.push("gerowallet");
    }

    if (window.cardano.enable) {
      availableWallets.push("nami");
    }

    return availableWallets;
  }

  async getBalance() {
    return await this._provider.getBalance();
  }

  async getCollateral() {
    return await this._provider.getCollateral();
  }

  async getNetworkId() {
    return await this._provider.getNetworkId();
  }

  async getUsedAddresses() {
    const usedAddresses = await this._provider.getUsedAddresses();

    return usedAddresses.map((address) =>
      Cardano.Instance.Address.from_bytes(fromHex(address)).to_bech32()
    );
  }

  async getUtxos() {
    return await this._provider.getUtxos();
  }

  async signTx(tx, partialSign = true) {
    return await this._provider.signTx(tx, partialSign);
  }

  async submitTx(tx) {
    return await this._provider.submitTx(tx);
  }
}

export default new Wallet();
