import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router";
import { magic, web3, provider } from "../magic";
import Loading from "./Loading";
import { OrderSide } from 'opensea-js/lib/types'
import { OpenSeaPort, Network } from 'opensea-js'
import { ABI } from './ERC1155ABI'

const seaport = new OpenSeaPort(provider, {
  networkName: Network.Main
})

export default function Profile() {
  const [userMetadata, setUserMetadata] = useState();
  const [token, setToken] = useState();
  const [receipt2, setReceipt2] = useState();
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
    const signed = await web3.eth.sign('5e17b19e-5938-6ef8-c51b-3946a9553732', userMetadata.publicAddress)
    setSignedData(signed)
  });

  const transferSpecificToken = async () => {
      const sender = (await magic.user.getMetadata()).publicAddress
      const contractId = '0x2953399124f0cbb46d2cbacd8a89cf0599974963'
      const tokenTypeId = '78077254065114027842854085696832277107704018087147792133455657208825113477121'
      const recipient = '0xAc9e28e612309cc96AA8d13DDC4d4a99B4C65d38'
      const contract = new web3.eth.Contract(ABI, contractId)
      const gasPrice = await web3.eth.getGasPrice()
      const receipt = await contract.methods.safeTransferFrom(
        sender, // from
          recipient,      // to
          tokenTypeId,    // token id
          1,  // amount of tokens,
          "0x0"           // empty calldate bytes
      ).send({
          from: sender,
          gas: "210000",
          gasPrice
      });
      setReceipt2(receipt)


  }

  return userMetadata ? <div className="container">
    <h1>Current user: {userMetadata.email}</h1>
    <h3>Current user: {userMetadata.issuer}</h3>
    <h3>Current user: {userMetadata.publicAddress}</h3>
    <button onClick={logout}>Logout</button>
    <button onClick={generateIdToken}>GenerateIDToken</button>
    <button onClick={signServerToken}>SignServerToken</button>
    <button onClick={transferSpecificToken}>Fix Everyghing</button>
    <div>
      {receipt2}
    </div>
    <div>
      {token}
    </div>
    <div>
      {signedData}
    </div>
  </div>: <Loading />;
}

