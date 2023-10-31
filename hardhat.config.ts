import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-solhint";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-deploy";

const SEPOLIA_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const MAINNET_RPC_URL =
  process.env.MAINNET_RPC_URL || process.env.ALCHEMY_MAINNET_RPC_URL || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20'
      },
      {
        version: "0.8.19",
      },
      {
        version: "0.4.19",
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 11155111,
    },
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    localhost: {
      chainId: 31337,
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
};

export default config;
