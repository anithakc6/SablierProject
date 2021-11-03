import { useQuery } from "@apollo/react-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Body, Button, Header } from "../../components";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import { gql } from "apollo-boost";
import BigNumber from 'bignumber.js';
import erc20Abi from "../../abis/erc20.json";
import sablierAbi from "../../abis/sablier.json";
import "./withdrawstream.css";

const MY_STREAMS = gql`
query streams($account: String!) {
  senderStreams:streams(where: {sender: $account}){
	withdrawals {
      id
      amount
    }
    id
	cancellation {
      recipientBalance
      timestamp
      txhash
    }
    recipient
    deposit
    startTime
    stopTime
  }
  recipientStreams:streams(where: {recipient: $account}) {
    withdrawals {
      id
      amount
    }
	id
	cancellation {
      recipientBalance
      timestamp
      txhash
    }
    sender
    deposit
    startTime
    stopTime
  }
}
`
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
  const [account, setAccount] = useState({});
  const [inputs, setInputs] = useState({});
  const [amount, setAmount] = useState({});

  // Load the user's accounts.
  async function fetchAccount() {
    try {
      if (!provider) {
        return;
      }
    }
    catch (err) {
      setAccount("");
      console.error(err);
    }
    const accounts = await provider.listAccounts();

    setAccount(accounts[0]);
  }
  fetchAccount();
  const { loading, error, data } = useQuery(MY_STREAMS, {variables: {account},})
  
  React.useEffect(() => {
    if (!loading && !error && data && data.streams) {
      console.log({ streams: data.streams });
    } else {

      console.log(data)
	  
    }
  }, [loading, error, data]);

    function renderTableHeader() {
      return(<tr>
        <th><td>ID</td></th>
        <th><td>RECIPIENT</td></th>
        <th><td>DEPOSIT</td></th>
        <th><td>START TIME</td></th>
        <th><td>END TIME</td></th>
        <th><td>AMOUNT</td></th>
        <th><td>SELECTION</td></th>
    </tr>)
  }
    function renderRecipientStreams() {
    return data.recipientStreams.map((stream) => {
      return(
        <React.Fragment key={stream.id}>
          <tr key={stream.id}>
               <td>{stream.id}</td>
               <td>{stream.sender}</td>
               <td>{stream.deposit}</td>
               <td>{stream.startTime}</td>
               <td>{stream.stopTime}</td>
               <td>
               <input
                      class="input"
                      type="text"
                      onChange={e => setAmount(e.target.value)}
                      value={amount}
                    />
               </td>
              <td>
                <button class="withdraw-button" onClick={async() => {
                  try {
                    let convertedAmount = new BigNumber(amount).multipliedBy(10 ** 18).toFixed(0)
                    console.log(amount)
                    console.log(convertedAmount)
                    let signer = provider.getSigner();
                    const sablier = new ethers.Contract("0xcd79FFea8e2E6eFDAe92554Fdd1F154bB7c62D0f", sablierAbi, signer)
                    const token = new ethers.Contract("0x3ac1c6ff50007ee705f36e40F7Dc6f393b1bc5e7", erc20Abi, signer);             
                    const approveTx = await token.approve("0xcd79FFea8e2E6eFDAe92554Fdd1F154bB7c62D0f", amount); 
                    await approveTx.wait();
                    const withdrawTx = await sablier.withdrawFromStream(stream.id, convertedAmount); 
                    await withdrawTx.wait();
                  }
                  catch (err) {
                    console.error(err);
                  }
                }}>
                  Withdraw from Stream
                </button>
                </td>
          </tr>
        </React.Fragment>
      )
    })
  }

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
            <div class="streams-lists-container">
              <div class="streams-list">
                <h1 class='title'>Streams Dashboard</h1>
                <table class='stream' >
                  <tbody>
                      {renderTableHeader()}
                      {data ? renderRecipientStreams() : null}
                  </tbody>
                </table>
                
              </div>
            </div>
      </Body>
    </div>
  );
}

export default App;
