// Hiện nút LOVE BABE khi gõ xong
const loveBtn = document.getElementById("loveBtn");
document.addEventListener("typing:done", () => {
  loveBtn.classList.remove("hidden");
  requestAnimationFrame(() => loveBtn.classList.add("show"));
});

// Click: đóng thư, ẩn tim, hiện hoa, thả chữ bay
loveBtn.addEventListener("click", () => {
  loveBtn.classList.add("hidden");

  // Đóng thư
  const letter = document.getElementById("typewriter");
  letter.classList.add("closing");
  setTimeout(() => {
    letter.classList.add("hidden");
  }, 620);

  // Ẩn trái tim
  document.querySelectorAll(".love, .love-1, .love-2").forEach((el) => {
    el.classList.add("heart-vanish");
  });

  // Hiện bông hoa
  const flower = document.getElementById("flower");
  flower.classList.remove("hidden");
  requestAnimationFrame(() => flower.classList.add("show"));

  // Bắt đầu chữ bay
  startFloatingWords();
});

// ===== Chữ bay lên từ đáy màn hình =====
const WORDS = [
  "iu anh",
  "iu em",
  "babe",
  "love",
  "my love",
  "sunflower",
  "iuuuu",
  "meooo",
  "gauuu",
];
const COLORS = ["#fff", "#ffe5ef", "#ffd1e8", "#ffe7a8", "#d2f5ff"];
let floatTimer;

function startFloatingWords() {
  if (floatTimer) return;
  function spawn() {
    const span = document.createElement("span");
    span.className = "float-word";
    span.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];
    const left = Math.random() * 90 + 5; // %
    const dx = (Math.random() * 2 - 1) * 140; // trôi ngang
    const dur = 8 + Math.random() * 6; // 8-14s
    const size = 16 + Math.random() * 22; // font-size

    span.style.left = left + "vw";
    span.style.setProperty("--dx", dx + "px");
    span.style.setProperty("--dur", dur + "s");
    span.style.fontSize = size + "px";
    span.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    document.body.appendChild(span);
    span.addEventListener("animationend", () => span.remove());
  }
  // Bắn đều đặn
  spawn();
  floatTimer = setInterval(spawn, 420);
}
