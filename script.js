document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeMenu = ({ returnFocus = false } = {}) => {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  if (returnFocus) menuButton.focus();
};

const openMenu = () => {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "true");
  navigation.classList.add("is-open");
  document.body.classList.add("menu-open");
  window.setTimeout(() => navLinks[0]?.focus(), 200);
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  if (isOpen) closeMenu({ returnFocus: true });
  else openMenu();
});

navLinks.forEach((link) => link.addEventListener("click", () => closeMenu()));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation?.classList.contains("is-open")) {
    closeMenu({ returnFocus: true });
  }

  if (event.key === "Tab" && navigation?.classList.contains("is-open")) {
    const firstLink = navLinks[0];
    const lastLink = navLinks.at(-1);
    if (event.shiftKey && document.activeElement === firstLink) {
      event.preventDefault();
      lastLink?.focus();
    } else if (!event.shiftKey && document.activeElement === lastLink) {
      event.preventDefault();
      firstLink?.focus();
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 960) closeMenu();
});

const headerObserver = new IntersectionObserver(
  ([entry]) => header?.classList.toggle("is-scrolled", !entry.isIntersecting),
  { rootMargin: "-24px 0px 0px 0px", threshold: 0 }
);

const hero = document.querySelector(".hero");
if (hero) headerObserver.observe(hero);
else setHeaderState();

const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion.matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const canvas = document.querySelector(".particle-canvas");
const canvasHost = document.querySelector(".hero-visual");

if (canvas instanceof HTMLCanvasElement && canvasHost && !reducedMotion.matches) {
  const context = canvas.getContext("2d");
  const particles = [];
  let animationFrame = 0;
  let isVisible = true;

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = canvasHost.getBoundingClientRect();
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    canvas.style.width = `${bounds.width}px`;
    canvas.style.height = `${bounds.height}px`;
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);

    const desiredCount = bounds.width < 600 ? 12 : 26;
    particles.length = 0;
    for (let index = 0; index < desiredCount; index += 1) {
      particles.push({
        x: Math.random() * bounds.width,
        y: Math.random() * bounds.height,
        radius: 0.8 + Math.random() * 1.4,
        speed: 0.08 + Math.random() * 0.14,
        opacity: 0.18 + Math.random() * 0.25,
      });
    }
  };

  const draw = () => {
    if (!context || !isVisible) return;
    const bounds = canvasHost.getBoundingClientRect();
    context.clearRect(0, 0, bounds.width, bounds.height);

    particles.forEach((particle) => {
      particle.y -= particle.speed;
      if (particle.y < -4) {
        particle.y = bounds.height + 4;
        particle.x = Math.random() * bounds.width;
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(160, 195, 255, ${particle.opacity})`;
      context.fill();
    });

    animationFrame = requestAnimationFrame(draw);
  };

  const particleObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting && !document.hidden;
    cancelAnimationFrame(animationFrame);
    if (isVisible) draw();
  });

  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden && canvasHost.getBoundingClientRect().bottom > 0;
    cancelAnimationFrame(animationFrame);
    if (isVisible) draw();
  });

  new ResizeObserver(resizeCanvas).observe(canvasHost);
  particleObserver.observe(canvasHost);
  resizeCanvas();
  draw();
}
