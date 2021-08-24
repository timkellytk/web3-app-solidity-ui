import React, { useEffect, useState, useCallback } from "react";
import { getWaveContract } from "./util/waveContract";
import { checkIfWalletIsConnected, connectWallet } from "./util/wallet";
import FadeLoader from "react-spinners/FadeLoader";
import "./App.css";

export default function App() {
  const [currAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("");
  const [waveTxn, setWaveTxn] = useState(null);
  const [waveMessages, setWaveMessages] = useState([]);
  const [pendingTxn, setPendingTxn] = useState(false);
  const [waveText, setWaveText] = useState("");

  const updateWavesMessages = async (contract) => {
    const waves = await contract.getAllWaves();

    const wavesCleaned = [];
    waves.forEach((wave) => {
      wavesCleaned.push({
        address: wave.waver,
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

  const wave = async (message) => {
    const contract = getWaveContract();

    const waveTxn = await contract.wave(message);
    setPendingTxn(true);
    setWaveTxn(waveTxn.hash);

    await waveTxn.wait();
    setPendingTxn(false);

    await updateWaves(contract);
    await updateWavesMessages(contract);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!pendingTxn) {
      wave(waveText);
    }
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

        <div className="bio">
          Total waves on the contract{totalWaves ? `: ${totalWaves}` : "..."}
        </div>

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

        <form onSubmit={handleFormSubmit} className="form-block">
          <label htmlFor="wave-message">
            Message:
            <input
              type="text"
              id="wave-message"
              required
              value={waveText}
              onChange={(event) => setWaveText(event.target.value)}
            />
          </label>
          <input type="submit" className="waveButton" value="Wave at Me" />
        </form>

        {!currAccount && (
          <button
            className="waveButton"
            onClick={() => connectWallet(setCurrentAccount)}
          >
            Connect Wallet
          </button>
        )}

        <div className="header">
          <span role="img" aria-label="wave">
            🌊
          </span>{" "}
          The history of waves
        </div>
        {waveMessages
          .sort()
          .reverse()
          .map((wave, index) => {
            return (
              <div
                className="bio"
                key={wave.address + index}
                style={{ textAlign: "center" }}
              >
                {wave.message} from {wave.address} on{" "}
                {wave.timestamp.getDate() +
                  "/" +
                  (wave.timestamp.getMonth() + 1) +
                  "/" +
                  wave.timestamp.getFullYear() +
                  " " +
                  wave.timestamp.getHours() +
                  ":" +
                  wave.timestamp.getMinutes() +
                  ":" +
                  wave.timestamp.getSeconds()}
              </div>
            );
          })}
      </div>
    </div>
  );
}
