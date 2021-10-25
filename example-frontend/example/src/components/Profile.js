import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router";
import { magic, web3, provider } from "../magic";
import Loading from "./Loading";
import { OrderSide } from 'opensea-js/lib/types'
import { OpenSeaPort, Network } from 'opensea-js'

const seaport = new OpenSeaPort(provider, {
  networkName: Network.Main
})

export default function Profile() {
  const [userMetadata, setUserMetadata] = useState();
  const [token, setToken] = useState();
  const [signedData, setSignedData] = useState();
  const history = useHistory();

  useEffect(() => {
    // On mount, we check if a user is logged in.
    // If so, we'll retrieve the authenticated user's profile.
    magic.user.isLoggedIn().then(magicIsLoggedIn => {
      if (magicIsLoggedIn) {
        magic.user.getMetadata().then(setUserMetadata);
        magic.user.generateIdToken()
      } else {
        // If no user is logged in, redirect to `/login`
        history.push("/login");
      }
    });
  }, []);

  /**
   * Perform logout action via Magic.
   */
  const logout = useCallback(() => {
    magic.user.logout().then(() => {
      history.push("/login");
    })
  }, [history]);

  const generateIdToken = useCallback(async () => {
    const token = await magic.user.generateIdToken({attachment: 'SOME_SECRET'})
    setToken(token)
  });

  const signServerToken = useCallback(async () => {
    const signed = await web3.eth.sign('0b3a1331-bdc2-a536-2100-992910d9de2c', userMetadata.publicAddress)
    setSignedData(signed)
  });

  return userMetadata ? <div className="container">
    <h1>Current user: {userMetadata.email}</h1>
    <h3>Current user: {userMetadata.issuer}</h3>
    <h3>Current user: {userMetadata.publicAddress}</h3>
    <button onClick={logout}>Logout</button>
    <button onClick={generateIdToken}>GenerateIDToken</button>
    <button onClick={signServerToken}>SignServerToken</button>
    <div>
      {token}
    </div>
    <div>
      {signedData}
    </div>
  </div>: <Loading />;
}

