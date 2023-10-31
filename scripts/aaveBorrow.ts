import { error } from "console";
import { AMOUNT, getWeth } from "./getWeth";
import { ethers, getNamedAccounts, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";
import { Signer } from "ethers";
async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const lendingPool = await getLendingPool(signer);
  const wethTokenAddress =
    networkConfig[network?.config?.chainId as any].wethToken;

  await approveErc20(
    wethTokenAddress,
    await lendingPool.getAddress(),
    AMOUNT,
    signer
  );

  console.log("Depositing WETH on behalf...");
  await lendingPool.deposit(
    wethTokenAddress,
    AMOUNT,
    await signer.getAddress(),
    0
  );

  console.log("Deposited!");
  const { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    await signer.getAddress()
  );
  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / Number(daiPrice));
  const amountDaiToBorrowWei = ethers.parseEther(amountDaiToBorrow.toString());
  console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`);

  await borrowDai(
    networkConfig[network?.config?.chainId as any].daiToken,
    lendingPool,
    amountDaiToBorrowWei,
    await signer.getAddress()
  );

  await getBorrowUserData(lendingPool, await signer.getAddress());

  await repay(
    amountDaiToBorrowWei,
    networkConfig[network?.config?.chainId as any].daiToken,
    lendingPool,
    signer
  );

  await getBorrowUserData(lendingPool, await signer.getAddress());
}

async function getLendingPool(account: Signer) {
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    networkConfig[network?.config?.chainId as any].lendingPoolAddressesProvider,
    account
  );
  const lendingPoolAddress =
    await lendingPoolAddressesProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

async function approveErc20(
  erc20Address: string,
  spenderAddress: string,
  amount: bigint,
  signer: Signer
) {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer);
  const txResponse = await erc20Token.approve(spenderAddress, amount);
  await txResponse.wait(1);
  console.log("Approved!");
}

async function getBorrowUserData(lendingPool: any, account: any) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account);

  console.log(
    `You have ${ethers.formatEther(totalCollateralETH)} worth of ETH deposited.`
  );
  console.log(
    `You have ${ethers.formatEther(totalDebtETH)} worth of ETH borrowed.`
  );
  console.log(
    `You can borrow ${ethers.formatEther(availableBorrowsETH)} worth of ETH.`
  );

  return { totalCollateralETH, totalDebtETH, availableBorrowsETH };
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    networkConfig[network?.config?.chainId as any].daiEthPriceFeed
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
}

async function borrowDai(
  daiAddress: string,
  lendingPool: any,
  amountDaiToBorrow: bigint,
  account: string
) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrow,
    2,
    0,
    account
  );
  await borrowTx.wait(1);
  console.log("You've borrowed!");
}

async function repay(
  amount: any,
  daiAddress: any,
  lendingPool: any,
  account: any
) {
  await approveErc20(
    daiAddress,
    await lendingPool.getAddress(),
    amount,
    account
  );

  const repayTx = await lendingPool.repay(daiAddress, amount, 2, account);
  await repayTx.wait(1);
  console.log("Repaid!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
