export const connectWallet = (setCurrentAccount) => {
  return new Promise((resolve, reject) => {
    const { ethereum } = window;
    if (!ethereum) {
      reject("no metamask!");
    }

    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
          resolve(account);
        } else {
          reject("no ethereum account access");
        }
      })
      .catch((err) => {
        reject("error with ethereum request");
      });
  });
};
