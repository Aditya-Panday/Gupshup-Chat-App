// This function calculates the margin for messages from the same sender to control spacing
export const isSameSenderMargin = (messages, m, i, userId) => {
  // Check if the current message is not the last one and has the same sender as the next message
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33; // If the conditions are met, return a fixed margin
  // Check if the current message is not the last one and has a different sender than the next message
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    // Or if it's the last message and has a different sender
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0; // If the conditions are met, return a margin of 0
  else return "auto"; // Otherwise, return 'auto' for automatic margin
};

// This function checks if the current message has a different sender than the next one it use in scrollable chat..
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

// This function checks if the current message is the last one from a different sender
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

// This function checks if the current message has the same sender as the previous one
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

// This function gets the name of the sender of a chat message
export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser?._id ? users[1].name : users[0].name;
};

// This function gets the full details of the sender of a chat message
export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};
