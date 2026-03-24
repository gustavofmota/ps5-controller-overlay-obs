function getGamepad() {
  const gamepads = navigator.getGamepads();
  return gamepads[0];
}

function update() {
  const gp = getGamepad();
  if (gp) {
    document.getElementById('btn-cross').classList.toggle('active', gp.buttons[0].pressed);
    document.getElementById('btn-circle').classList.toggle('active', gp.buttons[1].pressed);
    document.getElementById('btn-square').classList.toggle('active', gp.buttons[2].pressed);
    document.getElementById('btn-triangle').classList.toggle('active', gp.buttons[3].pressed);
  }
  requestAnimationFrame(update);
}

window.addEventListener('gamepadconnected', () => {
  console.log('Controller connected');
  update();
});
