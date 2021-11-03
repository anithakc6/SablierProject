import React from "react";
import "../../App.css";

import "../pages/home.css";

function Home() {
  return (
    <div className="home-div">
      <a
        style={{
          display: "flex",
          justifyContent: "center",
          color: "whitesmoke",
        }}
        href="https://ropsten.etherscan.io/address/0xcd79ffea8e2e6efdae92554fdd1f154bb7c62d0f"
      >
        Link to Sablier contract
      </a>
    </div>
  );
}

export default Home;
