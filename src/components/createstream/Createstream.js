import { useQuery } from "@apollo/react-hooks";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

import { Body, Button, Header } from "../../components";

import useWeb3Modal from "../../hooks/useWeb3Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { gql } from "apollo-boost";
import BigNumber from 'bignumber.js';
import erc20Abi from "../../abis/erc20.json";
import sablierAbi from "../../abis/sablier.json";
import "./createstream.css";

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
  const [deposit, setDeposit] = useState('')
  const [recipient, setRecipient] = useState('')
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
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
        <h1 class='title'>STREAM MONEY NOW !!</h1>
        <form onSubmit={handleSubmit}>
          <label>Token to Use:
          <br/><select value="Dai">
          <option value="Dai">Dai Stable Coin</option>
          </select>
          <br /> 
          </label>
          <label>Stream value in total:
            <br/><input
                  class="input"
                  type="number"
                  min="0"
                  placeholder={'Enter deposit amount'}
                  onChange={e => setDeposit(e.target.value)}
                  value={deposit}
                /><br /> 
            </label>
            <label>Enter recipient address:
            <br/><input
                  class="input"
                  type="text"
                  placeholder={'Recipient address'}
                  onChange={e => setRecipient(e.target.value)}
                  value={recipient}
                /><br /> 
            </label>
            <label>Enter the start date:time for streaming:
              <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeInput
            />           
            </label><br/>
            <label>Enter the end date:time for streaming:
            <br/>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              showTimeInput
            /> 
            </label><br/>
                    
            <button class="stream-button" onClick={async() => {
                try {
                  console.log("startDate",startDate)
                  console.log("endDate",endDate)
                  let signer = provider.getSigner();
                  const sablier = new ethers.Contract("0xcd79FFea8e2E6eFDAe92554Fdd1F154bB7c62D0f", sablierAbi, signer)
                  let convertedStartTime = Math.round(startDate / 1000)
                  let convertedStopTime = Math.round(endDate / 1000)
                  let convertedDeposit = new BigNumber(deposit).multipliedBy(10 ** 18).toFixed(0)
                  let remainder = new BigNumber(convertedDeposit) % (convertedStopTime - convertedStartTime)
                  let amountToDeposit = new BigNumber(convertedDeposit).minus(remainder).toString()            
                  const token = new ethers.Contract("0x3ac1c6ff50007ee705f36e40F7Dc6f393b1bc5e7", erc20Abi, signer); 
                  const approveTx = await token.approve("0xcd79FFea8e2E6eFDAe92554Fdd1F154bB7c62D0f", amountToDeposit); 
                  await approveTx.wait();
                  console.log(recipient);
                  console.log(amountToDeposit);
                  console.log(convertedStartTime);
                  console.log(convertedStopTime);
                  const createStreamTx = await sablier.createStream(recipient, amountToDeposit, "0x3ac1c6ff50007ee705f36e40F7Dc6f393b1bc5e7", convertedStartTime, convertedStopTime);
                  await createStreamTx.wait();
                }
                catch (err) {
                  console.error(err);
                }
                          }}>Stream Money</button>      
        </form>           
      </Body>
    </div>
  );
}

export default App;
