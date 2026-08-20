(function () {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  var root = document.documentElement;
  var yearEl = document.getElementById("year");
  var timeEl = document.getElementById("local-time");
  var siteHeader = document.querySelector(".site-header");
  var navShell = document.querySelector(".nav-shell");
  var navToggle = document.querySelector(".nav-toggle");
  var themeToggle = document.querySelector(".theme-toggle");
  var marqueeTrack = document.getElementById("marquee-track");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var backToTop = document.getElementById("back-to-top");
  var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));

  /* ----------------------------------------------------------
     Footer year
     ---------------------------------------------------------- */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ----------------------------------------------------------
     Local time in Johannesburg
     ---------------------------------------------------------- */
  function updateLocalTime() {
    if (!timeEl) {
      return;
    }

    try {
      timeEl.textContent = new Intl.DateTimeFormat("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Africa/Johannesburg"
      }).format(new Date()) + " SAST";
    } catch (e) {
      timeEl.textContent = "Johannesburg";
    }
  }

  updateLocalTime();
  setInterval(updateLocalTime, 30000);

  /* ----------------------------------------------------------
     Theme toggle (preference persisted; applied pre-paint in <head>)
     ---------------------------------------------------------- */
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);

      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute("content", next === "dark" ? "#0A0A0B" : "#F3F2EE");
      }

      try {
        localStorage.setItem("kt-theme", next);
      } catch (e) {
        /* private mode — theme still applies for this visit */
      }
    });
  }

  /* ----------------------------------------------------------
     Tech marquee
     ---------------------------------------------------------- */
  if (marqueeTrack) {
    var marqueeItems = [
      "AWS Serverless", "Terraform", "TypeScript", "React", "Angular",
      "Python", "DynamoDB", "Next.js", "Docker", "CI/CD", "Lambda", "Supabase"
    ];

    var markup = marqueeItems.map(function (item) {
      return "<span>" + item + "</span>";
    }).join("");

    // duplicated so the -50% translate loops seamlessly
    marqueeTrack.innerHTML = markup + markup;
  }

  /* ----------------------------------------------------------
     Navigation
     ---------------------------------------------------------- */
  function setNavOpen(isOpen) {
    if (!navShell || !navToggle) {
      return;
    }

    navShell.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function getSectionContentTarget(section) {
    if (!section) {
      return null;
    }

    var firstChild = section.querySelector(":scope > .container");
    return firstChild || section;
  }

  function getScrollPosition(section, targetId) {
    if (targetId === "#hero" || targetId === "#top") {
      return 0;
    }

    var contentTarget = getSectionContentTarget(section);
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var shellHeight = navShell ? navShell.offsetHeight : 0;
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
      var isOpen = navShell ? !navShell.classList.contains("is-open") : false;
      setNavOpen(isOpen);
    });
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("a[href^='#']");

    if (!trigger) {
      if (navShell && !event.target.closest(".nav-shell")) {
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

    // let the skip link behave natively so focus moves with it
    if (trigger.classList.contains("skip-link")) {
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

  /* ----------------------------------------------------------
     Scroll state
     ---------------------------------------------------------- */
  function onScroll() {
    var scrolled = window.scrollY > 18;

    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", scrolled);
    }

    if (navShell) {
      navShell.classList.toggle("is-scrolled", scrolled);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 480);
    }

    var offset = (navShell ? navShell.offsetHeight : 80) + 150;
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----------------------------------------------------------
     Scroll reveal
     ---------------------------------------------------------- */
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
