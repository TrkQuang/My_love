// Nhạc nền: tự chạy muted, bỏ mute khi người dùng chạm lần đầu
const audio = document.getElementById("bgm");
const btn = document.getElementById("musicBtn");

audio.volume = 0; // sẽ fade-in
const targetVolume = 0.6; // chỉnh âm lượng mong muốn
const unlockEvents = ["pointerdown", "click", "touchstart", "keydown"];

function fadeTo(vol, ms = 1200) {
  const start = audio.volume;
  const diff = vol - start;
  if (diff === 0) return;
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

function cleanupUnlock() {
  unlockEvents.forEach((ev) =>
    window.removeEventListener(ev, unlock, { capture: false })
  );
  btn.classList.add("hidden");
}

async function playNow() {
  try {
    await audio.play();
    fadeTo(targetVolume);
    showHint();
    cleanupUnlock();
  } catch (e) {
    // nếu vẫn bị chặn thì hiện nút để user bấm
    btn.classList.remove("hidden");
  }
}

function unlock() {
  // gọi trong user-gesture: bỏ mute + play lại
  audio.muted = false;
  audio.currentTime = Math.max(0, audio.currentTime || 0);
  playNow();
}

function setUpUnlockUI() {
  // luôn gắn listener sớm để chắc chắn bắt được lần chạm đầu
  unlockEvents.forEach((ev) =>
    window.addEventListener(ev, unlock, { once: true, passive: true })
  );
  btn.classList.remove("hidden");
  btn.addEventListener("click", unlock, { once: true });
}

window.addEventListener("DOMContentLoaded", async () => {
  // Với autoplay+muted, nhiều trình duyệt sẽ tự chạy im lặng.
  // Ta thử phát (nếu chưa), rồi cố bỏ mute. Nếu không được -> chờ user chạm.
  try {
    if (audio.paused) await audio.play(); // muted autoplay
    // Thử bỏ mute mà không cần thao tác — iOS thường không cho, nên sẽ fallback
    audio.muted = false;
    await audio.play();
    fadeTo(targetVolume);
    showHint();
  } catch (_) {
    // Không cho bỏ mute/không cho play -> yêu cầu user gesture
    audio.muted = true; // giữ muted để autoplay không lỗi
    setUpUnlockUI();
  }
});

// Phím tắt M để bật/tắt nhanh
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "m") {
    audio.muted = !audio.muted;
    if (!audio.muted && audio.paused) playNow();
  }
});
