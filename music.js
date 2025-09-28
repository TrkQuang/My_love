// Nhạc nền: tối ưu cho Safari/iOS bằng Web Audio API
const audio = document.getElementById("bgm");
const btn = document.getElementById("musicBtn");

audio.volume = 0; // sẽ fade-in
const TARGET = 0.6; // âm lượng cuối
const UNLOCK_EVENTS = [
  "pointerdown",
  "touchstart",
  "click",
  "keydown",
  "pointerup",
];

let audioCtx = null;
let sourceNode = null;
let unlocked = false;

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
function fadeTo(vol, ms = 1200) {
  const start = audio.volume;
  const diff = vol - start;
  const t0 = performance.now();
  function tick(t) {
    const k = Math.min(1, (t - t0) / ms);
    audio.volume = start + diff * k;
    if (k < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function showHint() {
  if (document.querySelector(".music-hint")) return;
  const hint = document.createElement("div");
  hint.className = "music-hint";
  hint.textContent = "Đang phát nhạc • bấm phím M để bật/tắt";
  document.body.appendChild(hint);
  setTimeout(() => hint.remove(), 6000);
}

async function tryAutoplayMuted() {
  // Cho phép Safari/iOS autoplay khi muted
  audio.muted = true;
  try {
    if (audio.paused) await audio.play();
  } catch (_) {}
}

async function unlockAudio() {
  if (unlocked) return;
  unlocked = true;

  // Tạo AudioContext trong user-gesture cho iOS/Safari
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  // Kết nối audio element vào AudioContext (chỉ làm 1 lần)
  if (!sourceNode) {
    try {
      sourceNode = audioCtx.createMediaElementSource(audio);
      sourceNode.connect(audioCtx.destination);
    } catch (e) {
      // Nếu đã kết nối trước đó sẽ ném lỗi, bỏ qua
    }
  }

  audio.muted = false;
  try {
    await audio.play(); // gọi play() ngay trong handler tương tác
    fadeTo(TARGET, 1200);
    btn.classList.add("hidden");
    showHint();
  } catch (e) {
    // Nếu vẫn bị chặn, hiển thị nút để người dùng bấm thêm lần nữa
    unlocked = false;
    btn.classList.remove("hidden");
  }
}

function armUnlockListeners() {
  UNLOCK_EVENTS.forEach((ev) =>
    window.addEventListener(ev, unlockAudio, { once: true, passive: true })
  );
  btn.classList.remove("hidden");
  btn.addEventListener("click", unlockAudio, { once: true });
}

window.addEventListener("DOMContentLoaded", async () => {
  await tryAutoplayMuted();

  // Trên 1 số Safari, có thể tự bỏ mute nếu không yêu cầu gesture (hiếm).
  // Nếu không được, gắn listener chờ chạm để mở khóa.
  if (audio.muted || isIOS()) {
    armUnlockListeners();
  } else {
    // Trường hợp khác (Android/desktop) thử mở tiếng luôn
    try {
      audio.muted = false;
      await audio.play();
      fadeTo(TARGET, 1200);
      showHint();
    } catch (_) {
      armUnlockListeners();
    }
  }
});

// Giữ nhạc khi quay lại tab (iOS đôi lúc tạm dừng)
document.addEventListener("visibilitychange", async () => {
  if (
    !document.hidden &&
    !audio.paused &&
    audioCtx &&
    audioCtx.state === "suspended"
  ) {
    await audioCtx.resume();
  }
});

// Phím tắt M để mute/unmute nhanh
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "m") {
    audio.muted = !audio.muted;
    if (!audio.muted && audio.paused) unlockAudio();
  }
});
