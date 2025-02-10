const ws = new WebSocket(`ws://${window.location.hostname}/ws`);
const rooms = document.querySelectorAll(".room");
let lightStates = [false, false, false, false];

function toggleLight(index) {
  lightStates[index] = !lightStates[index];
  rooms[index].classList.toggle("on");
  ws.send(`${index}${lightStates[index] ? 1 : 0}`);
}

ws.onopen = () => console.log("connected to esp32");
ws.onerror = (error) => console.log("websocket error:", error);
ws.onclose = () => console.log("disconnected from esp32");
