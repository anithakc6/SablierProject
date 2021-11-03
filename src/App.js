import React from "react";
import "./App.css";
import Home from "./components/pages/Home";
import Createstream from "./components/createstream/Createstream";
import Cancelstream from "./components/cancelstream/Cancelstream";
import Withdrawstream from "./components/withdrawstream/Withdrawstream";
import Getstream from "./components/getstream/Getstream";
import Balancestream from "./components/balancestream/Balancestream";
import Deltastream from "./components/deltastream/Deltastream";


import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default function App() {
  return (
    <Router>
      <div>
      <header class="title">WELCOME TO MONEY STREAMING</header>
        <nav>
          <ul>
            <li>
              <Link to="/" >Home</Link>
            </li>
            <li>
              <Link to="/createstream">Create Stream</Link>
            </li>
            <li>
              <Link to="/cancelstream">Cancel Stream</Link>
            </li>
            <li>
              <Link to="/withdrawstream">Withdraw Money</Link>
            </li>
            <li>
              <Link to="/getstream">View Streamed Money</Link>
            </li>
            <li>
              <Link to="/balancestream">View Balance</Link>
            </li>
            <li>
              <Link to="/deltastream">View Delta Time</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
            
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/createstream" component={Createstream} />
          <Route path="/cancelstream" component={Cancelstream} />
          <Route path="/withdrawstream" component={Withdrawstream} />
          <Route path="/getstream" component={Getstream} />
          <Route path="/balancestream" component={Balancestream} />
          <Route path="/deltastream" component={Deltastream} />
        </Switch>
      
        
      </div>
    </Router>
  );
}
