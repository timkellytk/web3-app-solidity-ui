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

    contract.on("NewWave", (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setWaveMessages((oldArray) => [
        ...oldArray,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    });
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

    const waveTxn = await contract.wave(message, { gasLimit: 300000 });
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

  const connectWalletAndLoadData = () => {
    connectWallet(setCurrentAccount).then(() => {
      getTotalWaves();
      getWaveMessages();
    });
  };

  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount).then((_) => {
      getTotalWaves();
      getWaveMessages();
    });
  }, [getTotalWaves, getWaveMessages]);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave">
            ????
          </span>{" "}
          Basic wave smart contract
        </div>

        {currAccount && (
          <>
            <div className="bio">
              Total waves on the contract
              {totalWaves ? `: ${totalWaves}` : "..."}
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
            <div className="header">
              <span role="img" aria-label="wave">
                ????
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
          </>
        )}

        {!currAccount && (
          <>
            <div className="bio">How to play with the smart contract</div>
            <ul>
              <li>
                Set up a <a href="https://metamask.io/">MetaMask</a> wallet
              </li>
              <li>
                Get free Ethereum from the{" "}
                <a href="https://faucet.rinkeby.io/">Rinkeby Faucet</a>
              </li>
              <li>Connect your wallet and your ready to play</li>
            </ul>
            <button className="waveButton" onClick={connectWalletAndLoadData}>
              Connect Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
