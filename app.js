(() => {
  const params = new URLSearchParams(window.location.search);

  const skin = sanitizeSkin(params.get("skin") || "initiald-ae86");
  const panelOn = parseToggle(params.get("panel"), true);
  const compact = parseToggle(params.get("compact"), false);
  const scale = clampNum(params.get("scale"), 100, 60, 150);
  const glow = clampNum(params.get("glow"), 85, 0, 140);
  const deadzone = clampNum(params.get("deadzone"), 12, 0, 35);

  const app = document.getElementById("app");
  app.classList.add(`theme-${skin}`);
  app.classList.toggle("panel-off", !panelOn);
  app.classList.toggle("compact-on", compact);
  app.style.setProperty("--scale", String(scale / 100));

  const ui = {
    skin: document.getElementById("skinLabel"),
    scale: document.getElementById("scaleLabel"),
    glowText: document.getElementById("glowLabel"),
    pad: document.getElementById("padLabel"),
    badge: document.getElementById("connectionBadge"),
    status: document.getElementById("statusText"),
    ls: document.getElementById("leftStickValue"),
    rs: document.getElementById("rightStickValue"),
    l2Text: document.getElementById("l2Text"),
    r2Text: document.getElementById("r2Text"),
    l2Meter: document.getElementById("l2Fill"),
    r2Meter: document.getElementById("r2Fill"),
    l2Bar: document.getElementById("ltFill"),
    r2Bar: document.getElementById("rtFill"),
    glow: document.querySelector(".controller-glow"),
    speedlines: document.querySelector(".speedlines"),
  };

  const el = {
    cross: document.getElementById("cross"),
    circle: document.getElementById("circle"),
    square: document.getElementById("square"),
    triangle: document.getElementById("triangle"),

    dpadUp: document.getElementById("dpadUp"),
    dpadRight: document.getElementById("dpadRight"),
    dpadDown: document.getElementById("dpadDown"),
    dpadLeft: document.getElementById("dpadLeft"),

    l1: document.getElementById("lb"),
    r1: document.getElementById("rb"),
    l2: document.getElementById("ltCap"),
    r2: document.getElementById("rtCap"),

    share: document.getElementById("shareBtn"),
    options: document.getElementById("optionsBtn"),
    ps: document.getElementById("psBtn"),
    mic: document.getElementById("micBtn"),

    leftStick: document.getElementById("leftStick"),
    rightStick: document.getElementById("rightStick"),
  };

  ui.skin.textContent = skin;
  ui.scale.textContent = `${scale}%`;
  ui.glowText.textContent = `${glow}%`;

  const state = {
    leftX: 0,
    leftY: 0,
    rightX: 0,
    rightY: 0,
    l2: 0,
    r2: 0,
  };

  let connectedIndex = null;

  window.addEventListener("gamepadconnected", (event) => {
    connectedIndex = event.gamepad.index;
    setConnected(event.gamepad);
  });

  window.addEventListener("gamepaddisconnected", (event) => {
    if (event.gamepad.index === connectedIndex) {
      connectedIndex = null;
      setDisconnected();
    }
  });

  function loop() {
    const pad = getGamepad();

    if (!pad) {
      setDisconnected();
      requestAnimationFrame(loop);
      return;
    }

    setConnected(pad);

    state.leftX = lerp(state.leftX, applyDeadzone(pad.axes[0] || 0, deadzone), 0.4);
    state.leftY = lerp(state.leftY, applyDeadzone(pad.axes[1] || 0, deadzone), 0.4);
    state.rightX = lerp(state.rightX, applyDeadzone(pad.axes[2] || 0, deadzone), 0.4);
    state.rightY = lerp(state.rightY, applyDeadzone(pad.axes[3] || 0, deadzone), 0.4);

    state.l2 = lerp(state.l2, getTriggerValue(pad.buttons[6]), 0.35);
    state.r2 = lerp(state.r2, getTriggerValue(pad.buttons[7]), 0.35);

    updateStick(el.leftStick, state.leftX, state.leftY);
    updateStick(el.rightStick, state.rightX, state.rightY);

    updateMeter(ui.l2Meter, ui.l2Bar, ui.l2Text, state.l2);
    updateMeter(ui.r2Meter, ui.r2Bar, ui.r2Text, state.r2);

    toggleClass(el.cross, isPressed(pad.buttons[0]), "active-face");
    toggleClass(el.circle, isPressed(pad.buttons[1]), "active-face");
    toggleClass(el.square, isPressed(pad.buttons[2]), "active-face");
    toggleClass(el.triangle, isPressed(pad.buttons[3]), "active-face");

    toggleClass(el.l1, isPressed(pad.buttons[4]), "active-shoulder");
    toggleClass(el.r1, isPressed(pad.buttons[5]), "active-shoulder");

    toggleClass(el.l2, state.l2 > 0.03, "active-trigger");
    toggleClass(el.r2, state.r2 > 0.03, "active-trigger");

    toggleClass(el.share, isPressed(pad.buttons[8]), "active-system");
    toggleClass(el.options, isPressed(pad.buttons[9]), "active-system");

    toggleClass(el.leftStick, isPressed(pad.buttons[10]), "active-stick-press");
    toggleClass(el.rightStick, isPressed(pad.buttons[11]), "active-stick-press");

    toggleClass(el.dpadUp, isPressed(pad.buttons[12]), "active-dpad");
    toggleClass(el.dpadDown, isPressed(pad.buttons[13]), "active-dpad");
    toggleClass(el.dpadLeft, isPressed(pad.buttons[14]), "active-dpad");
    toggleClass(el.dpadRight, isPressed(pad.buttons[15]), "active-dpad");

    toggleClass(el.ps, isPressed(pad.buttons[16]), "active-system");
    toggleClass(el.mic, isPressed(pad.buttons[17]), "active-system");

    ui.ls.textContent = `${state.leftX.toFixed(2)} / ${state.leftY.toFixed(2)}`;
    ui.rs.textContent = `${state.rightX.toFixed(2)} / ${state.rightY.toFixed(2)}`;
    ui.status.textContent = describeInputState();

    const intensity =
      glow / 100 +
      state.r2 * 1.2 +
      state.l2 * 0.5 +
      (Math.abs(state.leftX) + Math.abs(state.leftY) + Math.abs(state.rightX) + Math.abs(state.rightY)) * 0.18;

    ui.glow.style.opacity = String(clamp(intensity * 0.52, 0.18, 1.2));
    ui.glow.style.filter = `blur(${Math.round(32 + intensity * 22)}px)`;
    ui.speedlines.style.opacity = String(clamp(0.25 + state.r2 * 0.85, 0.25, 1));

    requestAnimationFrame(loop);
  }

  function describeInputState() {
    const parts = [];

    if (state.r2 > 0.08) {
      parts.push(`Throttle ${Math.round(state.r2 * 100)}%`);
    }

    if (state.l2 > 0.08) {
      parts.push(`Brake ${Math.round(state.l2 * 100)}%`);
    }

    if (Math.abs(state.leftX) > 0.08) {
      parts.push(state.leftX > 0 ? "Steering Right" : "Steering Left");
    }

    return parts.length ? parts.join(" · ") : "Neutral input state";
  }

  function setConnected(pad) {
    app.classList.remove("disconnected");
    ui.badge.textContent = "LIVE";
    ui.pad.textContent = ((pad.id || "Controller").split("(")[0].trim().slice(0, 20)) || "Controller";

    if (connectedIndex === null) {
      connectedIndex = pad.index;
    }
  }

  function setDisconnected() {
    app.classList.add("disconnected");
    ui.badge.textContent = "NO PAD";
    ui.pad.textContent = "DualSense";
    ui.status.textContent = "Waiting for controller…";
  }

  function getGamepad() {
    if (!navigator.getGamepads) {
      return null;
    }

    if (connectedIndex !== null) {
      return navigator.getGamepads()[connectedIndex];
    }

    return Array.from(navigator.getGamepads()).find(Boolean) || null;
  }

  function updateStick(node, x, y) {
    node.style.transform = `translate(${(x * 18).toFixed(2)}px, ${(y * 18).toFixed(2)}px)`;
  }

  function updateMeter(primaryMeter, secondaryMeter, textNode, value) {
    const percentage = `${Math.round(value * 100)}%`;
    primaryMeter.style.width = percentage;
    secondaryMeter.style.width = percentage;
    textNode.textContent = percentage;
  }

  function isPressed(button) {
    return !!button && (button.pressed || button.value > 0.5);
  }

  function getTriggerValue(button) {
    if (!button) {
      return 0;
    }

    if (typeof button.value === "number") {
      return clamp(button.value, 0, 1);
    }

    return button.pressed ? 1 : 0;
  }

  function applyDeadzone(value, deadzonePercent) {
    const threshold = deadzonePercent / 100;
    const abs = Math.abs(value);

    if (abs <= threshold) {
      return 0;
    }

    return Math.sign(value) * clamp((abs - threshold) / (1 - threshold), 0, 1);
  }

  function toggleClass(node, enabled, className) {
    node.classList.toggle(className, Boolean(enabled));
  }

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clampNum(value, fallback, min, max) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  }

  function parseToggle(value, fallback) {
    if (value === null) {
      return fallback;
    }

    return !["0", "false", "off", "no"].includes(String(value).toLowerCase());
  }

  function sanitizeSkin(value) {
    const allowed = [
      "initiald-ae86",
      "initiald-redsuns",
      "midnight-touge",
      "racing-blacklight",
    ];

    return allowed.includes(value) ? value : "initiald-ae86";
  }

  loop();
})();
