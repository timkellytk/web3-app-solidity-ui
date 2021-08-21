import { ethers } from "ethers";
import WAVE_CONTRACT from "./wavePortal.json";
import { CONTRACT_ADDRESS } from "./constants";

export const getWaveContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    WAVE_CONTRACT.abi,
    signer
  );
  return contract;
};
