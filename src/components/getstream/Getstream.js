import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Body, Button, Header } from "../../components";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import sablierAbi from "../../abis/sablier.json";
import "./getstream.css";

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        if (!provider) {
          return;
        }

        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        // Resolve the ENS name for the first account.
        const name = await provider.lookupAddress(accounts[0]);

        // Render either the ENS name or the shortened account address.
        if (name) {
          setRendered(name);
        } else {
          setRendered(account.substring(0, 6) + "..." + account.substring(36));
        }
      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);

  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}


function App() {

  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [inputs, setInputs] = useState({});
  const [streamid, setStreamId] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(inputs);
  }
  return (
    <div>
      <Header>
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
      </Header>
      <Body>
        <h1 class='title'>STREAMED MONEY !!</h1>
        <form onSubmit={handleSubmit}>
            <label>Enter Stream ID:
            <br/><input
                  class="input"
                  type="text"
                  placeholder={'Stream ID'}
                  onChange={e => setStreamId(e.target.value)}
                  value={streamid}
                /><br /> 
            </label> 
            <br></br>     
            <button class="stream-button" onClick={async() => {
                try {
                  let signer = provider.getSigner();
                  
                  const sablier = new ethers.Contract("0xcd79FFea8e2E6eFDAe92554Fdd1F154bB7c62D0f", sablierAbi, signer)     
                  const getStreamTx = sablier.getStream(streamid);
                  console.log({getStreamTx});
                }
                catch (err) {
                  console.error(err);
                }
              }}>View</button>      
        </form>           
      </Body>
    </div>
  );
}

export default App;
