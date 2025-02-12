import axios from "axios";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, setSelectedChat } from "../../store/chat/chat.action";
import {
  selectMessages,
  selectSelectedChat,
} from "../../store/chat/chat.selector";
import { selectCurrentUser } from "../../store/user/user.selector";

import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";

import ProfileModal from "../profile-modal/profile-modal.component";
import ScrollableChat from "../scrollable-chat/scrollable-chat.component";
import UpdateGroupChatModal from "../update-groupchat-modal/update-groupchat-modal.component";

import { getSender, getSenderName } from "../../config/chatLogics";
import Lottie from "react-lottie";

import "./single-chat.styles.css";

const SingleChat = ({
  socket,
  socketConnected,
  setSelectedChatCompare,
}: any) => {
  const selectedChat = useSelector(selectSelectedChat);
  const messages = useSelector(selectMessages);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: require("../../animation/typing.json"),
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat.id}`);
      dispatch(setMessages(data));
      setLoading(false);

      socket?.emit("join chat", selectedChat.id);
    } catch (err) {
      setLoading(false);
      toast({
        title: "something went wrong",
        description: "Failed to load messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (e: any) => {
    if (e.key === "Enter" && newMessage) {
      socket?.emit("stop typing", selectedChat.id);
      try {
        setNewMessage("");
        const { data } = await axios.post("/api/message", {
          chatId: selectedChat.id,
          senderId: currentUser.id,
          content: newMessage,
        });
        socket?.emit("new message", data);
        dispatch(setMessages([...messages, data]));
      } catch (err) {
        toast({
          title: "Something went wrong",
          description: "Failed to send message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket?.on("typing", () => setIsTyping(true));
    socket?.on("stop typing", () => setIsTyping(false));
  }, [socket]);

  useEffect(() => {
    fetchMessages();
    setSelectedChatCompare(selectedChat);
  }, [selectedChat]);

  const typingHandler = (e: any) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket?.emit("typing", selectedChat.id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket?.emit("stop typing", selectedChat.id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            width="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              aria-label="back"
              icon={<ArrowBackIcon />}
              onClick={() => dispatch(setSelectedChat(null))}
            />

            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  <span style={{ color: "white" }}>
                    {getSenderName(currentUser, selectedChat.users)}
                  </span>
                  <ProfileModal
                    user={getSender(currentUser, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  <span style={{ color: "white" }}>
                    {selectedChat.chatName.toUpperCase()}
                  </span>
                  <UpdateGroupChatModal fetchMessages={fetchMessages} />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            justifyContent="flex-end"
            flexDirection="column"
            p={3}
            bg="gray.700"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignItems="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="gray.800"
                color="white"
                placeholder="Type a message..."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          color="white"
        >
          <Text fontSize="3xl" pb={3}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
