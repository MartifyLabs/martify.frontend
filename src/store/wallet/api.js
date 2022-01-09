import Cardano from "../../cardano/serialization-lib";
import Wallet from "../../cardano/wallet";
import {
  getAssets,
  lockAsset,
  unlockAsset,
  addAssetEvent,
} from "../../database/assets";
import { getCollection } from "../../database/collections";
import {
  getWallet,
  addWalletEvent,
  listWalletAsset,
  delistWalletAsset,
  relistWalletAsset,
  walletExists,
} from "../../database/wallets";
import { WALLET_STATE, MARKET_TYPE } from "./walletTypes";
import {
  walletConnected,
  setWalletLoading,
  setWalletData,
} from "./walletActions";
import { set_error } from "../error/errorActions";
import {
  listAsset,
  updateListing,
  cancelListing,
  purchaseAsset,
} from "../../cardano/market-contract/";
import { contractAddress } from "../../cardano/market-contract/validator";
import {
  createTxUnspentOutput,
  serializeTxUnspentOutput,
  valueToAssets,
} from "../../cardano/transaction";
import { getLockedUtxosByAsset } from "../../cardano/blockfrost-api";
import { collections_add_tokens } from "../collection/collectionActions";
import { fromBech32 } from "../../utils/converter";
import { createEvent, createDatum } from "../../utils/factory";
import { resolveError } from "../../utils/resolver";

export const availableWallets = (callback) => async (dispatch) => {
  await Cardano.load();

  callback({
    success: true,
    wallets: await Wallet.getAvailableWallets(),
    msg: "",
  });
};

export const connectWallet = (provider, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.CONNECTING));

    if (await Wallet.enable(provider)) {
      const usedNetworkId = parseInt(process.env.REACT_APP_CARDANO_NETWORK_ID);
      const walletNetworkId = await Wallet.getNetworkId();

      if (usedNetworkId === walletNetworkId) {
        const usedAddresses = await Wallet.getUsedAddresses();
        const walletAddress = await getWalletAddress(usedAddresses);

        const connectedWallet = {
          provider: {
            network: walletNetworkId,
            collateral: await Wallet.getCollateral(),
          },
          data: await getWallet(walletAddress),
        };

        dispatch(walletConnected(connectedWallet));
        callback({
          success: true,
          data: connectedWallet,
        });
      } else {
        dispatch(setWalletLoading(false));
        callback({
          success: false,
          msg: "Please switch your Nami Wallet's Network.",
        });
      }
    }
  } catch (error) {
    console.error(
      `Unexpected error in connectWallet. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({
      success: false,
      msg: "Wallet Could not Connect, Please try Again.",
    });
  }
};

export const loadAssets = (wallet, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.GETTING_ASSETS));

    const walletAssets = await getWalletAssets();

    const assets = (await getAssets(walletAssets)).reduce((map, asset) => {
      map[asset.details.asset] = asset;
      return map;
    }, {});

    dispatch(
      setWalletData({
        ...wallet.data,
        assets,
      })
    );

    callback({ success: true });
  } catch (error) {
    console.error(
      `Unexpected error in loadAssets. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false, error });
    dispatch(
      set_error({
        message: resolveError(error.message, "Loading Wallet Assets"),
        detail: error,
      })
    );
  }
};

export const listToken =
  (wallet, asset, price, callback) => async (dispatch) => {
    try {
      dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

      const collectionDetails = await getCollection(asset.details.policyId);
      const walletUtxos = await Wallet.getUtxos();

      const royaltiesAddress =
        collectionDetails?.royalties?.address ?? wallet.data.address;
      const royaltiesPercentage = collectionDetails?.royalties?.percentage ?? 0;

      const datum = createDatum(
        asset.details.assetName,
        asset.details.policyId,
        wallet.data.address,
        royaltiesAddress,
        royaltiesPercentage,
        price
      );

      const contractVersion = process.env.REACT_APP_MARTIFY_CONTRACT_VERSION;

      const listObj = await listAsset(
        datum,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        contractVersion
      );

      if (listObj && listObj.datumHash && listObj.txHash) {
        const updatedAsset = await lockAsset(asset, {
          datum: datum,
          datumHash: listObj.datumHash,
          txHash: listObj.txHash,
          address: wallet.data.address,
          artistAddress: royaltiesAddress,
          contractVersion,
        });

        const event = createEvent(
          MARKET_TYPE.NEW_LISTING,
          datum,
          listObj.txHash,
          wallet.data.address
        );

        const updatedWallet = await listWalletAsset(
          wallet.data,
          updatedAsset,
          event
        );

        const output = {
          policy_id: updatedAsset.details.policyId,
          listing: {
            [updatedAsset.details.asset]: updatedAsset,
          },
        };

        dispatch(setWalletLoading(false));
        dispatch(setWalletData(updatedWallet));
        dispatch(collections_add_tokens(output));
        callback({ success: true, type: MARKET_TYPE.NEW_LISTING });
      } else {
        callback({ success: false });
        dispatch(setWalletLoading(false));
        dispatch(
          set_error({
            message: resolveError("TRANSACTION_FAILED", "Listing Asset"),
            detail: null,
          })
        );
      }
    } catch (error) {
      console.error(
        `Unexpected error in listToken. [Message: ${error.message}]`
      );
      callback({ success: false });
      dispatch(setWalletLoading(false));
      dispatch(
        set_error({
          message: resolveError(error.message, "Listing Asset"),
          detail: error,
        })
      );
    }
  };

export const relistToken =
  (wallet, asset, price, callback) => async (dispatch) => {
    try {
      dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

      const walletUtxos = await Wallet.getUtxos();
      const currentVersion = resolveContractVersion(asset);
      const latestVersion = process.env.REACT_APP_MARTIFY_CONTRACT_VERSION;

      const assetUtxo = (
        await getLockedUtxosByAsset(
          contractAddress(currentVersion).to_bech32(),
          asset.details.asset
        )
      ).find((utxo) => utxo.data_hash === asset.status.datumHash);

      if (assetUtxo) {
        const datumNew = createDatum(
          asset.status.datum.tn,
          asset.status.datum.cs,
          wallet.data.address,
          asset.status.artistAddress,
          asset.status.datum.rp,
          price
        );
        const updateObj = await updateListing(
          asset.status.datum,
          datumNew,
          {
            address: fromBech32(wallet.data.address),
            utxos: walletUtxos,
          },
          createTxUnspentOutput(contractAddress(currentVersion), assetUtxo),
          currentVersion,
          latestVersion
        );

        if (updateObj && updateObj.datumHash && updateObj.txHash) {
          const updatedAsset = await lockAsset(asset, {
            datum: datumNew,
            datumHash: updateObj.datumHash,
            txHash: updateObj.txHash,
            address: wallet.data.address,
            artistAddress: asset.status.artistAddress,
            contractVersion: latestVersion,
          });

          const event = createEvent(
            MARKET_TYPE.PRICE_UPDATE,
            datumNew,
            updateObj.txHash,
            wallet.data.address
          );

          const updatedWallet = await relistWalletAsset(
            wallet.data,
            updatedAsset,
            event
          );

          const output = {
            policy_id: asset.details.policyId,
            listing: {
              [updatedAsset.details.asset]: updatedAsset,
            },
          };

          dispatch(setWalletLoading(false));
          dispatch(setWalletData(updatedWallet));
          dispatch(collections_add_tokens(output));
          callback({ success: true, type: MARKET_TYPE.PRICE_UPDATE });
        } else {
          callback({ success: false });
          dispatch(setWalletLoading(false));
          dispatch(
            set_error({
              message: resolveError(
                "TRANSACTION_FAILED",
                "Updating Asset Price"
              ),
              detail: null,
            })
          );
        }
      } else {
        callback({ success: false });
        dispatch(setWalletLoading(false));
        dispatch(
          set_error({
            message: resolveError(
              "TRANSACTION_NOT_CONFIRMED",
              "Updating Asset Price"
            ),
            detail: null,
          })
        );
      }
    } catch (error) {
      console.error(
        `Unexpected error in relistToken. [Message: ${error.message}]`
      );
      callback({ success: false });
      dispatch(setWalletLoading(false));
      dispatch(
        set_error({
          message: resolveError(error.message, "Updating Asset Price"),
          detail: error,
        })
      );
    }
  };

export const delistToken = (wallet, asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const walletUtxos = await Wallet.getUtxos();
    const contractVersion = resolveContractVersion(asset);

    const assetUtxo = (
      await getLockedUtxosByAsset(
        contractAddress(contractVersion).to_bech32(),
        asset.details.asset
      )
    ).find((utxo) => utxo.data_hash === asset.status.datumHash);

    if (assetUtxo) {
      const txHash = await cancelListing(
        asset.status.datum,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        createTxUnspentOutput(contractAddress(contractVersion), assetUtxo),
        contractVersion
      );

      if (txHash) {
        const updatedAsset = await unlockAsset(asset, {
          txHash: txHash,
          address: wallet.data.address,
        });

        const event = createEvent(
          MARKET_TYPE.DELIST,
          asset.status.datum,
          txHash,
          wallet.data.address
        );

        const updatedWallet = await delistWalletAsset(
          wallet.data,
          updatedAsset,
          event
        );

        const output = {
          policy_id: updatedAsset.details.policyId,
          listing: {
            [updatedAsset.details.asset]: updatedAsset,
          },
        };

        dispatch(setWalletLoading(false));
        dispatch(setWalletData(updatedWallet));
        dispatch(collections_add_tokens(output));
        callback({ success: true, type: MARKET_TYPE.DELIST });
      } else {
        callback({ success: false });
        dispatch(setWalletLoading(false));
        dispatch(
          set_error({
            message: resolveError("TRANSACTION_FAILED", "Unlisting Asset"),
            detail: null,
          })
        );
      }
    } else {
      callback({ success: false });
      dispatch(setWalletLoading(false));
      dispatch(
        set_error({
          message: resolveError("TRANSACTION_NOT_CONFIRMED", "Unlisting Asset"),
          detail: null,
        })
      );
    }
  } catch (error) {
    console.error(
      `Unexpected error in delistToken. [Message: ${error.message}]`
    );
    callback({ success: false });
    dispatch(setWalletLoading(false));
    dispatch(
      set_error({
        message: resolveError(error.message, "Unlisting Asset"),
        detail: error,
      })
    );
  }
};

export const purchaseToken = (wallet, asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const walletUtxos = await Wallet.getUtxos();
    const contractVersion = resolveContractVersion(asset);

    const assetUtxo = (
      await getLockedUtxosByAsset(
        contractAddress(contractVersion).to_bech32(),
        asset.details.asset
      )
    ).find((utxo) => utxo.data_hash === asset.status.datumHash);

    if (assetUtxo) {
      const txHash = await purchaseAsset(
        asset.status.datum,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        {
          seller: fromBech32(asset.status.submittedBy),
          artist: fromBech32(asset.status.artistAddress),
          market: fromBech32(process.env.REACT_APP_MARTIFY_ADDRESS),
        },
        createTxUnspentOutput(contractAddress(contractVersion), assetUtxo),
        contractVersion
      );

      if (txHash) {
        const unlockedAsset = await unlockAsset(asset, {
          txHash: txHash,
          address: wallet.data.address,
        });

        const event = createEvent(
          MARKET_TYPE.PURCHASE,
          asset.status.datum,
          txHash,
          wallet.data.address
        );

        const updatedWallet = await addWalletEvent(wallet.data, event);
        const updatedAsset = await addAssetEvent(unlockedAsset, event);

        // Update the seller's wallet
        const sellerWalletObj = await getWallet(asset.status.submittedBy);

        const soldEvent = createEvent(
          MARKET_TYPE.SOLD,
          asset.status.datum,
          txHash,
          wallet.data.address
        );

        await delistWalletAsset(sellerWalletObj, updatedAsset, soldEvent);
        // ----------------------------------------

        const output = {
          policy_id: asset.details.policyId,
          listing: {
            [updatedAsset.details.asset]: updatedAsset,
          },
        };

        dispatch(setWalletLoading(false));
        dispatch(setWalletData(updatedWallet));
        dispatch(collections_add_tokens(output));
        callback({ success: true, type: MARKET_TYPE.PURCHASE });
      } else {
        callback({ success: false });
        dispatch(setWalletLoading(false));
        dispatch(
          set_error({
            message: resolveError("TRANSACTION_FAILED", "Purchasing Asset"),
            detail: null,
          })
        );
      }
    } else {
      callback({ success: false });
      dispatch(setWalletLoading(false));
      dispatch(
        set_error({
          message: resolveError(
            "TRANSACTION_NOT_CONFIRMED",
            "Purchasing Asset"
          ),
          detail: null,
        })
      );
    }
  } catch (error) {
    console.error(
      `Unexpected error in purchaseToken. [Message: ${error.message}]`
    );
    callback({ success: false });
    dispatch(setWalletLoading(false));
    dispatch(
      set_error({
        message: resolveError(error.message, "Purchasing Asset"),
        detail: error,
      })
    );
  }
};

const getWalletAddress = async (usedAddresses) => {
  if (usedAddresses.length > 1) {
    for (const address of usedAddresses) {
      if (await walletExists(address)) return address;
    }
  }

  return usedAddresses[0];
};

const getWalletAssets = async () => {
  const utxos = await Wallet.getUtxos();

  const nativeAssets = utxos
    .map((utxo) => serializeTxUnspentOutput(utxo).output())
    .filter((txOut) => txOut.amount().multiasset() !== undefined)
    .map((txOut) => valueToAssets(txOut.amount()))
    .flatMap((assets) =>
      assets
        .filter((asset) => asset.unit !== "lovelace")
        .map((asset) => asset.unit)
    );

  return [...new Set(nativeAssets)];
};

const resolveContractVersion = (asset) => {
  if (asset.status.contractVersion) {
    return asset.status.contractVersion;
  }
  return "v1";
};
