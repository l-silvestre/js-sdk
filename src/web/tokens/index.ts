import type Basetoken from "../token";
import EthereumConfig from "./ethereum";
import NearConfig from "./near";
import SolanaConfig from "./solana";
import ERC20Config from "./erc20";
import axios from "axios";
import utils from "../../common/utils";
import AptosConfig from "./aptos";
import type WebIrys from "../irys";
import { EthereumEthersV5 } from "../providers/ethereum/ethersv5";
import { EthereumEthersV6 } from "../providers/ethereum/ethersv6";
import type { TokenConfig } from "src/common/types";
import type BaseWebToken from "../token";
import ArweaveConfig from "./arweave";

export default function getTokenConfig(config: {
  irys: WebIrys;
  token: string;
  wallet: any;
  providerUrl?: string;
  contractAddress?: string;
  providerName?: string;
}): Basetoken {
  switch (config.token) {
    case "ethereum":
      return resolveProvider("ethereum", config.providerName, {
        irys: config.irys,
        name: "ethereum",
        ticker: "ETH",
        providerUrl: config.providerUrl ?? "https://cloudflare-eth.com/",
        wallet: config.wallet,
      });
    case "matic":
      return resolveProvider("ethereum", config.providerName, {
        irys: config.irys,
        name: "matic",
        ticker: "MATIC",
        providerUrl: config.providerUrl ?? "https://polygon-rpc.com",
        wallet: config.wallet,
        minConfirm: 1,
      });
    case "arbitrum":
      return resolveProvider("ethereum", config.providerName, {
        irys: config.irys,
        name: "arbitrum",
        ticker: "ETH",
        providerUrl: config.providerUrl ?? "https://arb1.arbitrum.io/rpc",
        wallet: config.wallet,
      });
    case "bnb":
      return resolveProvider("ethereum", config.providerName, {
        irys: config.irys,
        name: "bnb",
        ticker: "BNB",
        providerUrl: config.providerUrl ?? "https://bsc-dataseed.binance.org",
        wallet: config.wallet,
      });
    case "avalanche":
      return resolveProvider("ethereum", config.providerName, {
        irys: config.irys,
        name: "avalanche",
        ticker: "AVAX",
        providerUrl: config.providerUrl ?? "https://api.avax.network/ext/bc/C/rpc",
        wallet: config.wallet,
      });
    case "boba-eth":
      return resolveProvider("ethereum", config.providerName, {
        irys: config.irys,
        name: "boba-eth",
        ticker: "ETH",
        providerUrl: config.providerUrl ?? "https://mainnet.boba.network/",
        minConfirm: 1,
        wallet: config.wallet,
      });
    case "boba": {
      const k = new ERC20Config({
        irys: config.irys,
        name: "boba",
        ticker: "BOBA",
        providerUrl: config.providerUrl ?? "https://mainnet.boba.network/",
        contractAddress: config.contractAddress ?? "0xa18bF3994C0Cc6E3b63ac420308E5383f53120D7",
        minConfirm: 1,
        wallet: config.wallet,
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

    case "solana":
      return new SolanaConfig({
        irys: config.irys,
        name: "solana",
        ticker: "SOL",
        providerUrl: config.providerUrl ?? "https://api.mainnet-beta.solana.com/",
        wallet: config.wallet,
      });
    // case "algorand":
    //     return new AlgorandConfig({ name: "algorand", ticker: "ALGO", providerUrl: config.providerUrl ?? "https://api.mainnet-beta.solana.com/", wallet: config.wallet })
    case "near":
      return new NearConfig({
        irys: config.irys,
        name: "near",
        ticker: "NEAR",
        providerUrl: config.providerUrl ?? "https://rpc.mainnet.near.org",
        wallet: config.wallet,
      });
    case "aptos":
      return new AptosConfig({
        irys: config.irys,
        name: "aptos",
        ticker: "APTOS",
        providerUrl: config.providerUrl ?? "https://fullnode.mainnet.aptoslabs.com/v1",
        wallet: config.wallet,
      });
    case "arweave":
      return new ArweaveConfig({
        irys: config.irys,
        name: "arweave",
        ticker: "AR",
        providerUrl: config.providerUrl ?? "https://arweave.net",
        wallet: config.wallet,
      });

    default:
      throw new Error(`Unknown/Unsupported token ${config.token}`);
  }
}

// @ts-expect-error todo fix
function resolveProvider(family: string, providerName: string | undefined, config: TokenConfig): BaseWebToken {
  switch (family) {
    case "ethereum":
      switch (providerName) {
        case "ethersv5":
          return new EthereumEthersV5(config);
        case "ethersv6":
          return new EthereumEthersV6(config);
        default:
          return new EthereumConfig(config);
      }
  }
}
