import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import Web3 from 'web3';

export const socialLogins = ["facebook", "google"];

const customNodeOptions = { // Test network
  rpcUrl: 'https://rpc-mumbai.matic.today',
  chainId: 80001,
};

export const magic = new Magic("pk_live_2F5A5F02878460F4", {
  extensions: [new OAuthExtension()],
  network: customNodeOptions
});

magic.network = 'matic';
export const web3 = new Web3(magic.rpcProvider);