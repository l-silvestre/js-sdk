import BigNumber from "bignumber.js";
import type { NodeToken } from "../types";
import ArweaveConfig from "./arweave";
import ERC20Config from "./erc20";
import EthereumConfig from "./ethereum";
import NearConfig from "./near";
import SolanaConfig from "./solana";
import AlgorandConfig from "./algorand";
import axios from "axios";
import utils from "../../common/utils";
import AptosConfig from "./aptos";
import MultiSignatureAptos from "./multiAptos";
import type NodeIrys from "../irys";

export default function getTokenConfig(
  Irys: NodeIrys,
  token: string,
  wallet: any,
  url: string,
  providerUrl?: string,
  contractAddress?: string,
  opts?: any,
): NodeToken {
  switch (token) {
    case "arweave":
      return new ArweaveConfig({
        irys: Irys,
        name: "arweave",
        ticker: "AR",
        minConfirm: 10,
        providerUrl: providerUrl ?? "https://arweave.net",
        wallet,
        isSlow: true,
        opts,
      });
    case "ethereum":
      return new EthereumConfig({
        irys: Irys,
        name: "ethereum",
        ticker: "ETH",
        providerUrl: providerUrl ?? "https://cloudflare-eth.com/",
        wallet,
        opts,
      });
    case "matic":
      return new EthereumConfig({
        irys: Irys,
        name: "matic",
        ticker: "MATIC",
        minConfirm: 1,
        providerUrl: providerUrl ?? "https://polygon-rpc.com/",
        wallet,
        opts,
      });
    case "bnb":
      return new EthereumConfig({
        irys: Irys,
        name: "bnb",
        ticker: "BNB",
        providerUrl: providerUrl ?? "https://bsc-dataseed.binance.org/",
        wallet,
        opts,
      });
    case "fantom":
      return new EthereumConfig({ irys: Irys, name: "fantom", ticker: "FTM", providerUrl: providerUrl ?? "https://rpc.ftm.tools/", wallet, opts });
    case "solana":
      return new SolanaConfig({
        irys: Irys,
        name: "solana",
        ticker: "SOL",
        providerUrl: providerUrl ?? "https://api.mainnet-beta.solana.com/",
        wallet,
        opts,
      });
    case "avalanche":
      return new EthereumConfig({
        irys: Irys,
        name: "avalanche",
        ticker: "AVAX",
        providerUrl: providerUrl ?? "https://api.avax-test.network/ext/bc/C/rpc/",
        wallet,
        opts,
      });
    case "boba-eth":
      return new EthereumConfig({
        irys: Irys,
        name: "boba-eth",
        ticker: "ETH",
        providerUrl: providerUrl ?? "https://mainnet.boba.network/",
        minConfirm: 1,
        wallet,
        opts,
      });
    case "boba": {
      const k = new ERC20Config({
        irys: Irys,
        name: "boba",
        ticker: "BOBA",
        providerUrl: providerUrl ?? "https://mainnet.boba.network/",
        contractAddress: contractAddress ?? "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7",
        minConfirm: 1,
        wallet,
        opts,
      });
      // for L1 mainnet: "https://main-light.eth.linkpool.io/" and "0x42bbfa2e77757c645eeaad1655e0911a7553efbc"
      k.price = async (): Promise<number> => {
        const res = await axios.post("https://api.livecoinwatch.com/coins/single", JSON.stringify({ currency: "USD", code: `${k.ticker}` }), {
          headers: { "x-api-key": "75a7a824-6577-45e6-ad86-511d590c7cc8", "content-type": "application/json" },
        });
        await utils.checkAndThrow(res, "Getting price data");
        if (!res?.data?.rate) {
          throw new Error(`unable to get price for ${k.name}`);
        }
        return +res.data.rate;
      };
      return k;
    }
    case "arbitrum":
      return new EthereumConfig({
        irys: Irys,
        name: "arbitrum",
        ticker: "ETH",
        providerUrl: providerUrl ?? "https://arb1.arbitrum.io/rpc/",
        wallet,
        opts,
      });
    case "chainlink":
      return new ERC20Config({
        irys: Irys,
        name: "chainlink",
        ticker: "LINK",
        providerUrl: providerUrl ?? "https://main-light.eth.linkpool.io/",
        contractAddress: contractAddress ?? "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        wallet,
        opts,
      });
    case "kyve": {
      const k = new ERC20Config({
        irys: Irys,
        name: "kyve",
        ticker: "KYVE",
        minConfirm: 0,
        providerUrl: providerUrl ?? "https://moonbeam-alpha.api.onfinality.io/public",
        contractAddress: contractAddress ?? "0x3cf97096ccdb7c3a1d741973e351cb97a2ede2c1",
        isSlow: true,
        wallet,
        opts,
      });
      k.price = async (): Promise<number> => {
        return 100;
      }; // TODO: replace for mainnet
      k.getGas = async (): Promise<[BigNumber, number]> => {
        return [new BigNumber(100), 1e18];
      };
      return k; // TODO: ensure units above are right
    }
    case "near": {
      return new NearConfig({
        irys: Irys,
        name: "near",
        ticker: "NEAR",
        providerUrl: providerUrl ?? "https://rpc.mainnet.near.org",
        wallet,
        IrysUrl: url,
        opts,
      });
    }
    case "algorand": {
      return new AlgorandConfig({
        irys: Irys,
        name: "algorand",
        ticker: "ALGO",
        providerUrl: providerUrl ?? "https://mainnet-api.algonode.cloud",
        wallet,
        opts: { indexerUrl: "https://mainnet-idx.algonode.cloud", ...opts },
      });
    }
    case "aptos": {
      return new AptosConfig({
        irys: Irys,
        name: "aptos",
        ticker: "APTOS",
        providerUrl: providerUrl ?? "https://fullnode.mainnet.aptoslabs.com",
        wallet,
        opts,
      });
    }
    case "multiaptos": {
      return new MultiSignatureAptos({
        irys: Irys,
        name: "aptos",
        ticker: "APTOS",
        providerUrl: providerUrl ?? "https://fullnode.mainnet.aptoslabs.com/v1",
        wallet,
        opts,
      });
    }
    default:
      throw new Error(`Unknown/Unsupported token ${token}`);
  }
}
