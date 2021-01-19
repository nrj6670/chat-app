const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validating data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  //validating username if the same username is in use in the same room
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

// addUser({ id: 22, username: "andrew", room: "south pHillY" });
// addUser({ id: 3, username: "jess", room: "south pHillY" });
// addUser({ id: 75, username: "mike", room: "center town" });
// addUser({ id: 21, username: "neeraj", room: "center town" });

// console.log(getUser(7));
// console.log(getUsersInRoom("south phillys"));

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
