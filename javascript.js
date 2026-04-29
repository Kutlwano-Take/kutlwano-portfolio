(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  var yearEl = document.getElementById("year");
  var header = document.querySelector(".nav-shell");
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var backToTop = document.getElementById("back-to-top");
  var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function setNavOpen(isOpen) {
    if (!header || !navToggle) {
      return;
    }

    header.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function getSectionContentTarget(section) {
    if (!section) {
      return null;
    }

    var firstChild = section.firstElementChild;
    if (firstChild && firstChild.classList.contains("container")) {
      return firstChild;
    }

    return section;
  }

  function getScrollPosition(section, targetId) {
    if (targetId === "#hero") {
      return 0;
    }

    var contentTarget = getSectionContentTarget(section);
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var shellHeight = header ? header.offsetHeight : 0;
    var safeTop = shellHeight + 24;
    var safeBottom = 32;
    var rect = contentTarget.getBoundingClientRect();
    var sectionTop = rect.top + window.scrollY - safeTop;
    var availableHeight = viewportHeight - safeTop - safeBottom;
    var centeredTop = rect.top + window.scrollY - ((viewportHeight - rect.height) / 2);

    if (rect.height <= availableHeight) {
      return Math.max(centeredTop, 0);
    }

    return Math.max(sectionTop, 0);
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = header ? !header.classList.contains("is-open") : false;
      setNavOpen(isOpen);
    });
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("a[href^='#']");

    if (!trigger) {
      if (header && !event.target.closest(".nav-shell")) {
        setNavOpen(false);
      }
      return;
    }

    var targetId = trigger.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    var target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();

    window.scrollTo({
      top: getScrollPosition(target, targetId),
      behavior: "smooth"
    });

    setNavOpen(false);
    updateActiveLink(targetId);
  });

  function updateActiveLink(activeHash) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === activeHash;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function onScroll() {
    var scrolled = window.scrollY > 18;

    if (header) {
      header.classList.toggle("is-scrolled", scrolled);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 480);
    }

    var offset = (header ? header.offsetHeight : 80) + 150;
    var current = "#hero";

    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - offset) {
        current = "#" + section.id;
      }
    });

    updateActiveLink(current);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.14,
      rootMargin: "0px 0px -60px 0px"
    });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }
})();
