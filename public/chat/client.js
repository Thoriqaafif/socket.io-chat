const socket = io({
    auth: {
        token: getAuthCookie()
    }
});

const nameModal = document.querySelector("#name-modal");
const nameForm = document.querySelector("#name-form");
const nameInput = document.querySelector('#name-input');
const messageInput = document.querySelector('#message-input');
const messageForm = document.querySelector('#message-form');
const roomInput = document.querySelector('#room-input');
const roomForm = document.querySelector('#room-form');

let username = "";
let room = "";

// event listener
// create new user
nameForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if(nameInput.value) {
        username = nameInput.value;
        socket.emit("new user", {"username": nameInput.value});
        addNotificationMessage("You are join");
        nameInput.value = "";
        nameModal.style.display = "none";
    }
})
// submit new message
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (messageInput.value) {
        addOwnMessage(messageInput.value);
        socket.emit("chat message", {"sender": username, "message": messageInput.value, "room": room});
        messageInput.value = '';
    }
});
// enter a room
roomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    room = roomInput.value;
    if (roomInput.value) {
        addNotificationMessage("Join " + roomInput.value + " room");
        socket.emit("join room", {"user": username, "room": roomInput.value});
        roomInput.value = "";
    }
    else {
        addNotificationMessage("Join global room");
    }
});

// socket listener
// socket.on("connect", () => {
//     addNotificationMessage("socket id: " + socket.id);
// });

socket.on("new user", (data) => {
    addNotificationMessage(data.username + " joined");
});

socket.on('new message', (data) => {
    addOtherMessage(data.message, data.sender);
});

socket.on("user leave", (data) => {
    addNotificationMessage(data.username + " leave")
});

socket.on('connect_error', (err) => {
    addNotificationMessage("Connect Error: " + err.message);
});