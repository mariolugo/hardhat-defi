import { ethers, getNamedAccounts, network } from "hardhat";
import { networkConfig } from "../helper-hardhat-config";

export const AMOUNT = ethers.parseEther("10");
export async function getWeth() {
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const iWeth = await ethers.getContractAt(
    "IWeth",
    networkConfig[network?.config?.chainId as any].wethToken,
    signer
  );

  const tx = await iWeth.deposit({ value: AMOUNT });
  await tx.wait(1);
  const wethBalance = await iWeth.balanceOf(deployer);
  console.log("wethBalance", ethers.formatEther(wethBalance.toString()));
}
