import "./style.css";
import LightController from "./lightController";

const initializeHamburgerMenu = () => {
  const hamburger = document.querySelector(".hamburger") as HTMLElement;
  const navMenu = document.querySelector(
    ".primary-navigation ul",
  ) as HTMLElement;

  const navItems = document.querySelectorAll(".primary-navigation li");

  hamburger.addEventListener("click", () => {
    const isActive = navMenu.classList.toggle("active");
    hamburger.classList.toggle("active", isActive);
  });

  document.querySelectorAll(".primary-navigation li a").forEach((link) => {
    const item = link.closest("li")!;
    const hasSubmenu = item.querySelector(".submenu");

    if (hasSubmenu) {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle("active");
        }
      });
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (!hamburger.contains(target) && !navMenu.contains(target)) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      navItems.forEach((item) => item.classList.remove("active"));
    }
  });

  const themeToggle = document.querySelector(".theme-toggle") as HTMLElement;
  const savedTheme = localStorage.getItem("theme");
  const sunIcon = document.querySelector(".sun-icon") as SVGElement;
  const moonIcon = document.querySelector(".moon-icon") as SVGElement;

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else {
    // Check system preference
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.documentElement.setAttribute(
      "data-theme",
      systemPrefersDark ? "dark" : "light",
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
