const socket = io();

socket.on("countUpdated", (count) => {
  console.log("Count updated to : ", count);
});

//elements
//const incrementerBtn = document.querySelector(".incrementer");
const form = document.querySelector(".message-form");
const message = form.querySelector("input");
const sendBtn = form.querySelector("button");
const locationBtn = document.querySelector(".location-btn");
const messages = document.querySelector("#messages");

//templates
const messageTemplates = document.querySelector("#message-template").innerHTML;
const locationTemplates = document.querySelector("#location-template")
  .innerHTML;
const sidebarTemplates = document.querySelector("#sidebar-template").innerHTML;
// incrementerBtn.addEventListener("click", () => {
//   socket.emit("increment");
// });

const autoScroll = () => {
  //new message element
  const $newMessage = messages.lastElementChild;

  //height of new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = messages.offsetHeight;

  //container height
  const containerHeight = messages.scrollHeight;

  //how far have i scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplates, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplates, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  //disabling button while the message is sent
  sendBtn.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", message.value, (error) => {
    //re-enabling button once the message is processed by the server
    sendBtn.removeAttribute("disabled");
    message.value = "";
    message.focus();

    if (error) {
      return alert(error);
    }

    console.log("Message delivered!!");
  });
  //grabbing the value of textarea when name property is set
  // message = e.target.elements.message.value
});

locationBtn.addEventListener("click", () => {
  locationBtn.setAttribute("disabled", "disabled");
  if (!navigator.geolocation) {
    locationBtn.removeAttribute("disabled");
    return alert("Geolocation not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        locationBtn.removeAttribute("disabled");
      }
    );
  });
});

//Joining room event
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  console.log(room);
  console.log(users);
  const html = Mustache.render(sidebarTemplates, {
    room,
    users,
  });

  document.querySelector("#sidebar").innerHTML = html;
});
