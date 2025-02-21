import "./style.css";
import LightController from "./lightController";

const initializeHamburgerMenu = () => {
  const hamburger = document.querySelector(".hamburger") as HTMLElement;
  const navMenu = document.querySelector(
    ".primary-navigation ul",
  ) as HTMLElement;

  document.querySelector(".nav-wrapper")?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    // handle hamburger
    if (
      target.classList.contains("hamburger") ||
      target.closest(".hamburger")
    ) {
      const isActive = navMenu.classList.toggle("active");
      hamburger.classList.toggle("active", isActive);
      return;
    }

    // handle toggling menu mobile
    if (target.tagName === "A" && window.innerWidth <= 768) {
      const parentLi = target.closest("li") as HTMLElement;
      const hasSubmenu = parentLi.querySelector(".submenu");

      if (hasSubmenu) {
        e.preventDefault();
        parentLi.classList.toggle("active");
      }
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (!hamburger.contains(target) && !navMenu.contains(target)) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      document.querySelectorAll(".primary-navigation li").forEach((li) => {
        li.classList.remove("active");
      });
    }
  });

  const themeToggle = document.querySelector(".theme-toggle") as HTMLElement;
  const savedTheme = localStorage.getItem("theme");
  const sunIcon = document.querySelector(".sun-icon") as SVGElement;
  const moonIcon = document.querySelector(".moon-icon") as SVGElement;

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else {
    const systemPrefers = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.documentElement.setAttribute(
      "data-theme",
      systemPrefers ? "dark" : "light",
    );
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    sunIcon.style.display = newTheme === "dark" ? "block" : "none";
    moonIcon.style.display = newTheme === "light" ? "block" : "none";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    themeToggle.style.transform = "rotate(360deg)";
    setTimeout(() => {
      themeToggle.style.transform = "";
    }, 300);
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        document.documentElement.setAttribute(
          "data-theme",
          e.matches ? "dark" : "light",
        );
      }
    });
};

document.addEventListener("DOMContentLoaded", () => {
  (window as any).lights = new LightController();
  initializeHamburgerMenu();
});
