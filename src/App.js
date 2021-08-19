import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
  const [currAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("make sure you have meta mask");
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("found ethereum acccount", account);
          setCurrentAccount(account);
        } else {
          console.log("no ethereum account access");
        }
      })
      .catch((err) => console.log("error with ethereum request", err));
  };

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!");
    }

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        if (accounts.length !== 0) {
          console.log("Connected", accounts[0]);
          setCurrentAccount(accounts[0]);
        }
      })
      .catch((err) => console.log(err));
  };

  const wave = () => {};

  useEffect(() => checkIfWalletIsConnected(), []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="wave">
            👋
          </span>{" "}
          HEY! This guy always skips CSS in tutorials :O
        </div>

        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool
          right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {!currAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
