import React from "react";
import styles from "../../styles/Home.module.css";

import { IUserPublicInfos } from "../../interfaces/users";

import userService from "../../services/user";

import { useLoginContext } from "../../context/LoginContext";

import { errorHandler } from "../../errors/errorHandler";

import { useErrorContext } from "../../context/ErrorContext";
import { useSocketContext } from "../../context/SocketContext";

export function ButtonCancelRequest({
  userInfos,
}: {
  userInfos: IUserPublicInfos;
}) {
  const errorContext = useErrorContext();
  const loginContext = useLoginContext();
  const socketContext = useSocketContext();

  const cancelRequest = async () => {
    if (
      loginContext.userLogin !== null &&
      loginContext.userLogin !== userInfos.login42
    ) {
      await userService
        .cancelFriendRequest(loginContext.userLogin, userInfos.login42).catch((error) => {
          errorContext.newError?.(errorHandler(error, loginContext));
        });

      socketContext.socket.emit("user:update-relations");
    }
  };

  return (
    <div className={styles.add_friend_button} onClick={cancelRequest}>
      Cancel request
    </div>
  );
}
