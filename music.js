// Tự phát nhạc nếu được phép; nếu bị chặn, hiện nút "Bật nhạc"
const audio = document.getElementById("bgm");
const btn = document.getElementById("musicBtn");

audio.volume = 0;
const targetVolume = 0.6;

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

async function tryAutoPlay() {
  try {
    await audio.play();
    fadeTo(targetVolume);
    showHint();
  } catch (e) {
    try {
      audio.muted = true;
      await audio.play();
      const unlock = () => {
        audio.muted = false;
        fadeTo(targetVolume);
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
        btn.classList.add("hidden");
        showHint();
      };
      btn.classList.remove("hidden");
      window.addEventListener("click", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
      btn.addEventListener("click", unlock, { once: true });
    } catch (_) {
      btn.classList.remove("hidden");
      btn.onclick = async () => {
        try {
          await audio.play();
          fadeTo(targetVolume);
          btn.classList.add("hidden");
          showHint();
        } catch (__) {
          audio.muted = true;
          await audio.play();
          audio.muted = false;
          fadeTo(targetVolume);
          btn.classList.add("hidden");
          showHint();
        }
      };
    }
  }
}
function showHint() {
  if (document.querySelector(".music-hint")) return;
  const hint = document.createElement("div");
  hint.className = "music-hint";
  hint.textContent = "Đang phát nhạc • bấm phím M để bật/tắt";
  document.body.appendChild(hint);
  setTimeout(() => hint.remove(), 6000);
}
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "m") {
    audio.muted = !audio.muted;
  }
});
window.addEventListener("DOMContentLoaded", tryAutoPlay);
