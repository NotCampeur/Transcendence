import { useEffect, useState, useRef } from "react";
import { ICoordinates } from "../../interfaces/ICoordinates";
import styles from "./Ball.module.css";
import { io, Socket } from "socket.io-client";
import { IBallInfo } from "../../interfaces/IBallInfo";

const INITIAL_VELOCITY = 0.035;

const Ball = ({
  ballInfo,
  gameSocket,
  gameID,
  player1,
	player2,
}: {
  ballInfo: IBallInfo;
  gameSocket: Socket;
  gameID: string;
  player1: string;
  player2: string;

}) => {
  const firstRender = useRef(true);
  const [ballPosition, setBallPosition] = useState<ICoordinates>(ballInfo.position);
  let ballDirection = useRef<ICoordinates>(ballInfo.direction);
  let ballVelocity = INITIAL_VELOCITY;

  const requestRef = useRef(0);
  const previousTimeRef = useRef(0);

  const paddleCollision = (paddle: DOMRect, ball: DOMRect) => {
    return (
      paddle.left <= ball.right &&
      paddle.right >= ball.left &&
      paddle.top <= ball.bottom &&
      paddle.bottom >= ball.top
    );
  };

  const handleCollision = () => {
    let ballRect = document
      .getElementById("ball")
      ?.getBoundingClientRect() as DOMRect;
    let playerPaddle = document
      .getElementById("player-paddle")
      ?.getBoundingClientRect() as DOMRect;

    let paddleBorderRatio = (playerPaddle.right / window.innerWidth) * 100;

    const ballRadiusWidthRatio = window.innerHeight / window.innerWidth;
    const ballRadiusHeightRatio = 1;

    if (ballRect?.bottom > window.innerHeight) {
      ballDirection.current.y *= -1;
      setBallPosition((prevState) => ({
        x: prevState.x,
        y: 100 - ballRadiusHeightRatio,
      }));
    } else if (ballRect?.top < 0) {
      ballDirection.current.y *= -1;
      setBallPosition((prevState) => ({
        x: prevState.x,
        y: ballRadiusHeightRatio,
      }));
    } else if (paddleCollision(playerPaddle, ballRect)) {
      let collidePoint =
        ballRect.y - (playerPaddle.y + playerPaddle.height / 2);
      collidePoint /= playerPaddle.height / 2;

      let angleRad = (collidePoint * Math.PI) / 4;

		// En utilisant rect on assure d'avoir la position acutelle car ballPosition ne renvoie pas la valeur la plus à jour (cf le console log du back dans ballCountered)
	  let ballNowX = ballRect.x / window.innerHeight * 100;
	  let ballNowY =  ballRect.y / window.innerWidth * 100;
      gameSocket.emit("game:ballCountered", {position : {x: ballNowX, y: ballNowY}, direction : ballDirection.current}, angleRad, gameID, player1);

      setBallPosition((prevState) => ({
        x: paddleBorderRatio + ballRadiusWidthRatio,
        y: prevState.y,
      }));

    } else if (ballRect?.left <= 0) {
      gameSocket.emit("game:point-lost", gameID, player1);
    }
  };

  const animate: FrameRequestCallback = (time: number) => {
    if (previousTimeRef.current != 0) {
      const deltaTime = time - previousTimeRef.current;
      handleCollision();

      setBallPosition((prevState) => ({
        x: prevState.x + ballDirection.current.x * ballVelocity * deltaTime,
        y: prevState.y + ballDirection.current.y * ballVelocity * deltaTime,
      }));
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (firstRender.current === true) {
      document.body.style.overflow = "hidden";

      gameSocket.on(
        "game:newBallInfo",
        (ballInfo: IBallInfo, player: string) => {
          ballDirection.current.x = ballInfo.direction.x;
          ballDirection.current.y = ballInfo.direction.y;
          if (player === player2) {
            ballDirection.current.x *= -1;
			
            let playerPaddle = document
              .getElementById("player-paddle")
              ?.getBoundingClientRect() as DOMRect;

            let paddleBorderRatio =
              (playerPaddle.right / window.innerWidth) * 100;

            const ballRadiusWidthRatio = window.innerHeight / window.innerWidth;

            setBallPosition((prevState) => ({
              x: 100 - (paddleBorderRatio + ballRadiusWidthRatio),
              y: prevState.y,
            }));
          }
        }
      );
      firstRender.current = false;
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

// Utiliser un UseEffect pour recup les props et set pos et dir?

  useEffect(() => {
    const ballElem = document.getElementById("ball") as HTMLElement;
    ballElem.style.setProperty("--x", ballPosition.x.toString());
    ballElem.style.setProperty("--y", ballPosition.y.toString());
  });

  return <div className={styles.ball} id="ball"></div>;
};

export default Ball;
