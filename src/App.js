import React, { useEffect, useState, useCallback } from "react";
import { getWaveContract } from "./util/waveContract";
import { checkIfWalletIsConnected, connectWallet } from "./util/wallet";
import FadeLoader from "react-spinners/FadeLoader";
import "./App.css";

export default function App() {
  const [currAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("");
  const [waveTxn, setWaveTxn] = useState(null);
  const [pendingTxn, setPendingTxn] = useState(false);
  const [waveMessages, setWaveMessages] = useState(false);

  const updateWavesMessages = async (contract) => {
    const waves = await contract.getAllWaves();

    const wavesCleaned = [];
    waves.forEach((wave) => {
      wavesCleaned.push({
        address: wave.address,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message,
      });
    });

    setWaveMessages(wavesCleaned);
  };

  const getWaveMessages = useCallback(async () => {
    const contract = getWaveContract();
    await updateWavesMessages(contract);
  }, []);

  const updateWaves = async (wavePortalContract) => {
    const count = await wavePortalContract.getTotalWaves();
    setTotalWaves(count.toNumber());
  };

  const getTotalWaves = useCallback(async () => {
    const contract = getWaveContract();
    await updateWaves(contract);
  }, []);

  const wave = async () => {
    const contract = getWaveContract();

    const waveTxn = await contract.wave();
    setPendingTxn(true);
    setWaveTxn(waveTxn.hash);

    await waveTxn.wait();
    setPendingTxn(false);

    await updateWaves(contract);
    await updateWavesMessages(contract);
  };

  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount).then((_) => {
      getTotalWaves();
      getWaveMessages();
    });
  }, [getTotalWaves, getWaveMessages]);

  console.log("WaveMessages", waveMessages);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave">
            👋
          </span>{" "}
          Basic wave smart contract
        </div>

        {totalWaves && (
          <div className="bio">Total waves on the contract: {totalWaves}</div>
        )}

        {waveTxn && (
          <div className="loadingContainer">
            {pendingTxn && (
              <>
                <FadeLoader size={50} />
                <div className="bio">Pending transaction... {waveTxn}</div>
              </>
            )}
            {!pendingTxn && (
              <div className="bio">Wave transaction: {waveTxn}</div>
            )}
          </div>
        )}

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currAccount && (
          <button
            className="waveButton"
            onClick={() => connectWallet(setCurrentAccount)}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
