const io = require("socket.io")(8800, {
  cors: {
    origin: "https://job-portal-gwu4.onrender.com",
  },
});
//http://localhost:3000
let activeUsers = [];
let notificationUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });
  socket.on("user-add", (newUserId) => {
    // if user is not added previously
    notificationUsers = notificationUsers.filter((user) => user.userId !== newUserId);
    if (!notificationUsers.some((user) => user.userId === newUserId)) {
      notificationUsers.push({ userId: newUserId, socketId: socket.id });
    }
    // send all active users to new user
    io.emit("notifications-users", activeUsers);
  });
  socket.on("remove-user", (removeUser) => {
    console.log(removeUser)
    activeUsers = activeUsers.filter((user) => user.userId !== removeUser);
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    // send all active users to all users
    io.emit("get-users", activeUsers);
  });

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });
  socket.on("apply-job", (data) => {
    const { userId } = data;
    const user = notificationUsers.find((user) => user.userId === userId);
    if (user) {
      io.to(user.socketId).emit("recieve-notification", 1);
    }
  });
});