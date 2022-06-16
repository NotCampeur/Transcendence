import React, { useState } from "react";
import styles from "../../styles/Home.module.css";
import { EmptyFriendList } from "../Social/emptyPages";

import { ChannelMenu } from "./Menus";
import { useSessionContext } from "../../context/SessionContext";
import { IUserPublicInfos, Channel, Message } from "../interfaces/users";
import channelService from "../../services/channel";
import { CardUserDM } from "../Cards/CardUserDM";

import Image from "next/image";
import Rocket from "../../public/no_dm_content.png";

import { SendMessageField } from "../Inputs/SendMessageField";
import { useSocketContext } from "../../context/SocketContext";

function Messages({ channel }: { channel: Channel }) {
  const sessionContext = useSessionContext();

  if (typeof channel === "undefined" || channel.messages.length === 0) {
    return (
      <div className={styles.social_empty_page}>
        <Image src={Rocket} />
        Be the first one to send a message !
      </div>
    );
  }

  const getStyle = (author: string) => {
    if (author === sessionContext.userLogin) {
      return styles.message_author;
    } else {
      return styles.message_friend;
    }
  };

  const setScroll = () => {
    if (typeof window !== "undefined") {
      var elem = document.getElementById("channelMsgArea");
      if (elem) {
        elem.scrollTop = elem.scrollHeight;
      }
    }
  };

  return (
    <>
      <div className={styles.messages_area} id="channelMsgArea">
        {channel.messages.map((message, index) => (
          <div className={getStyle(message.author)} key={index}>
            {message.content}
          </div>
        ))}
      </div>
      {setScroll()}
    </>
  );
}

function ChannelContent({ channel }: { channel: Channel }) {
  const [input, setInput] = React.useState("");

  return (
    <div className={styles.chat_direct_message_content}>
      <SendMessageField
        input={input}
        setInput={setInput}
        channel={channel?.id}
      />
      <Messages channel={channel} />
    </div>
  );
}

export function Channel({ id }: { id: string }) {
  const sessionContext = useSessionContext();
  const socketContext = useSocketContext();
  const [channel, setChannel] = useState<Channel>();

  React.useEffect(() => {
    channelService
      .getChannelById(sessionContext.userLogin, id)
      .then((channel: Channel) => {
        setChannel(channel);
      });

    socketContext.socket.on("update-channel-content", () => {
      channelService
        .getChannelById(sessionContext.userLogin, id)
        .then((channel: Channel) => {
          setChannel(channel);
        });
    });
  }, []);

  console.log("channel: ", channel);
  return (
    <>
      <ChannelMenu channel={channel} />
      <ChannelContent channel={channel} />
    </>
  );
}
