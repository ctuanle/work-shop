const form = document.getElementById("form_msg");
const input = document.getElementById("form_msg_input");
const messagesDOM = document.getElementById("msg_list");
const scrollThing = document.getElementById("scrollThing");
const roomIdElem = document.getElementById("roomId");

scrollThing.scrollTop += scrollThing.clientHeight;

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value && us_info.uid && roomIdElem) {
        const msg = input.value;
        const senderid = us_info.uid;
        const receiverid = window.location.href.split("/").pop();
        const roomId = Number(roomIdElem.innerText);

        socket.emit("admin:send_msg", {
            msg: msg,
            sdid: senderid,
            rcid: receiverid,
            rid: roomId,
        });

        const item = document.createElement("li");
        item.setAttribute("class", "msg_right");
        item.textContent = input.value;
        messagesDOM.appendChild(item);
        scrollThing.scrollTop += scrollThing.clientHeight;
        input.value = "";
    }
});

socket.on("admin:receive_msg", (data) => {
    if (data.sid === window.location.href.split("/").pop()) {
        const item = document.createElement("li");
        item.setAttribute("class", "msg_left");
        item.textContent = data.msg;
        messagesDOM.appendChild(item);
        scrollThing.scrollTop += scrollThing.clientHeight;
    }
});

let offset = 1;
let scrolling = false;
let stop = false;

scrollThing.addEventListener("scroll", () => {
    scrolling = true;
});

setInterval(async () => {
    if (scrolling && !stop) {
        scrolling = false;
        const uid = window.location.href.split("/").pop();
        const url = "/admin/messages/" + uid + "/" + offset;
        const res = await fetch(url);
        if (res.status === 200) {
            offset += 1;
            const messages = await res.json();
            if (messages.length === 0) {
                stop = true;
            }
            messages.messages.forEach((element) => {
                const item = document.createElement("li");
                item.textContent = element.message;
                if (element.sid === uid) {
                    item.setAttribute("class", "msg_left");
                } else {
                    item.setAttribute("class", "msg_right");
                }
                messagesDOM.insertBefore(item, messagesDOM.firstChild);
            });
        }
    }
}, 3000);
