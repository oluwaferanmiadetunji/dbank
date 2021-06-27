import { Tabs, Tab } from "react-bootstrap";
import DBank from "../abis/dBank.json";
import React, { useState, useEffect } from "react";
import Token from "../abis/Token.json";
import Image from "../dbank.png";
import Web3 from "web3";
import "./App.css";

const App = props => {
  const [web3, setWeb3] = useState("");

  const [account, setAccount] = useState("");

  const [token, setToken] = useState(null);

  const [dbank, setDbank] = useState(null);

  const [balance, setBalance] = useState(0);

  const [dBankAddress, setDBankAddress] = useState(null);

  const [depositAmount, setDepositAmount] = useState(0);

  const deposit = async amount => {
    if (dbank !== "undefined") {
      try {
        await dbank.methods
          .deposit()
          .send({ value: amount.toString(), from: account });
      } catch (e) {
        console.log("Error depositing", e);
      }
    }
  };

  const withdraw = async e => {
    e.preventDefault();

    if (dbank !== "undefined") {
      try {
        await dbank.methods.withdraw().send({ from: account });
      } catch (e) {
        console.log("Error withdrawing", e);
      }
    }
  };

  useEffect(() => {
    (async () => {
      let web3Instance;

      if (window.ethereum) {
        web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
        } catch (e) {
          console.log(e);
          window.alert("Error connecting to metamask");
        }
      }
      // Legacy DApp Browsers
      else if (window.web3) {
        web3Instance = new Web3(window.web3.currentProvider);
      }
      // Non-DApp Browsers
      else {
        window.alert("Metamask not installed");
        const provider = new Web3.providers.HttpProvider(
          "https://rinkeby.infura.io/v3/595676e36ea14a5a90799e19834a3892"
        );
        web3Instance = new Web3(provider);
      }

      setWeb3(web3Instance);

      const netId = await web3Instance.eth.net.getId();
      const accounts = await web3Instance.eth.getAccounts();

      if (typeof accounts[0] !== "undefined") {
        const balance = await web3Instance.eth.getBalance(accounts[0]);
        setAccount(accounts[0]);
        setBalance(balance);
      } else {
        window.alert("Please login with Metamask");
      }

      try {
        setToken(
          new web3Instance.eth.Contract(
            Token.abi,
            Token.networks[netId].address
          )
        );

        setDbank(
          new web3Instance.eth.Contract(
            DBank.abi,
            DBank.networks[netId].address
          )
        );

        setDBankAddress(DBank.networks[netId].address);
      } catch (e) {
        console.log(e);
        window.alert("Contract not deployed to the current network");
      } finally {
      }
    })();
  }, [dbank, props.dispatch]);

  return (
    <div className="text-monospace">
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.dappuniversity.com/bootcamp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Image} className="App-logo" alt="logo" height="32" />
          <b>dBank</b>
        </a>
      </nav>
      <div className="container-fluid mt-5 text-center">
        <br></br>
        <h1>Welcome to dBank</h1>
        <h2>{account}</h2>
        <br></br>
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="deposit" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="Deposit">
                  <br />
                  <div>How much do you want to deposit?</div>
                  <br />
                  <p>
                    Minimum amount to deposit is 0.01 ETH and you can deposit
                    just once
                  </p>
                  <br />
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      deposit(depositAmount * 10 ** 8);
                    }}
                  >
                    <div className="form-group mr-sm-2">
                      <br />
                      <input
                        id="depositAmount"
                        step="0.01"
                        type="number"
                        min="0.01"
                        className="form-control form-control-md"
                        placeholder="Enter Amount to deposit ..."
                        required
                        value={depositAmount}
                        onChange={event => {
                          setDepositAmount(event.target.value);
                        }}
                      />

                      <button type="submit" className="btn btn-primary mt-4">
                        Deposit
                      </button>
                    </div>
                  </form>
                </Tab>

                <Tab eventKey="withdraw" title="Withdraw">
                  <br />
                  <div>How much do you want to withdraw and take interest?</div>
                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary mt-4"
                      onClick={async e => {
                        await withdraw(e);
                      }}
                    >
                      Withdraw
                    </button>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
