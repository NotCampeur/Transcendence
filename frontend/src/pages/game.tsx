import styles from "../styles/Home.module.css";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Ball from "../components/Game/Ball";
import PlayerPaddle from "../components/Game/PlayerPaddle";
import ComputerPaddle from "../components/Game/ComputerPaddle";
import OpponentPaddle from "../components/Game/OpponentPaddle";

import Score from "../components/Game/Score";
import { io, Socket } from "socket.io-client";
import getConfig from "next/config";
import { useLoginContext } from "../context/LoginContext";
const { publicRuntimeConfig } = getConfig();

const Pong = () => {
  const computerLvl = 3; // peut aller de 1 a 3 EASY MEDIUM HARD

  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const gameSocket = useRef<Socket>();
  const LoginContext = useLoginContext();
  const toto = useRef(true);

  function updateScore(winner: string) {
    if (winner === "player") setPlayerScore((prevState) => prevState + 1);
    if (winner === "opponent") setOpponentScore((prevState) => prevState + 1);
  }

  if (gameSocket.current && toto.current) {
    console.log('toto', playerScore);
    gameSocket.current.emit("game:point", LoginContext.userLogin);
  toto.current = !toto.current;
  gameSocket.current.emit("game:toto", `event toto depuis ${LoginContext.userLogin}`);
  console.log(`${LoginContext.userLogin}, emitted toto`);
  } else {
  toto.current = !toto.current;
  }



  useEffect(() => {
    if (gameSocket.current === undefined) {
      gameSocket.current = io(
        `http://${publicRuntimeConfig.HOST}:${publicRuntimeConfig.WEBSOCKETS_PORT}/game`,
        { transports: ["websocket"] }
      );

      gameSocket.current.emit("game:enter", 'vlugand-', 'mvidal-a', LoginContext.userLogin);
	  gameSocket.current.on("game:toto", (userLogin : string) => {
		console.log('received toto from ', userLogin );
		
	  })
    }
  }, []);

  

  return (
    <>
      <div className={styles.mainLayout_left_background} />
      <div className={styles.mainLayout_right_background} />
      <Score player={playerScore} opponent={opponentScore} />
      <Ball updateScore={updateScore} />
      <PlayerPaddle />
      {/* <ComputerPaddle computerLvl={computerLvl} /> */}
      <OpponentPaddle/>
    </>
  );
};

export default dynamic(() => Promise.resolve(Pong), {
  ssr: false,
});
