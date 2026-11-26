(function () {
  document.documentElement.classList.add("js");

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
  }

  if (toggle && nav) {
    toggle.hidden = false;
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  var textNodes = Array.prototype.map.call(document.querySelectorAll("[data-en]"), function (element) {
    return { element: element, original: element.textContent, translation: element.getAttribute("data-en") };
  });
  var attributes = ["aria-label", "alt", "content", "placeholder"].reduce(function (list, attribute) {
    var key = attribute === "aria-label" ? "data-en-label" : "data-en-" + attribute;
    Array.prototype.forEach.call(document.querySelectorAll("[" + key + "]"), function (element) {
      list.push({
        element: element,
        attribute: attribute,
        original: element.getAttribute(attribute),
        translation: element.getAttribute(key)
      });
    });
    return list;
  }, []);
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-language]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));

  function languageFromUrl() {
    return new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "zh-CN";
  }

  function renderLanguage(language) {
    var english = language === "en";
    document.documentElement.lang = language;
    textNodes.forEach(function (entry) {
      entry.element.textContent = english ? entry.translation : entry.original;
    });
    attributes.forEach(function (entry) {
      if (entry.original == null) return;
      entry.element.setAttribute(entry.attribute, english ? entry.translation : entry.original);
    });
    buttons.forEach(function (button) {
      var on = button.getAttribute("data-language") === language;
      button.setAttribute("aria-pressed", String(on));
    });
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var language = button.getAttribute("data-language");
      if (document.documentElement.lang === language) return;
      var readingLine = (header ? header.getBoundingClientRect().bottom : 0) + 28;
      var section = sections.find(function (item) { return item.getBoundingClientRect().bottom > readingLine; });
      var previousTop = section ? section.getBoundingClientRect().top : null;
      renderLanguage(language);
      var url = new URL(window.location.href);
      if (language === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      window.history.replaceState(window.history.state, "", url);
      if (section && previousTop != null) window.scrollBy(0, section.getBoundingClientRect().top - previousTop);
    });
  });

  renderLanguage(languageFromUrl());
  window.addEventListener("popstate", function () { renderLanguage(languageFromUrl()); });

  var links = Array.prototype.slice.call(document.querySelectorAll('#site-nav a[href^="#"]'));
  function markCurrent() {
    var line = (header ? header.offsetHeight : 0) + 80;
    var current = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    links.forEach(function (link) {
      var on = current && link.getAttribute("href") === "#" + current.id;
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }
  markCurrent();
  document.addEventListener("scroll", markCurrent, { passive: true });

  if ("IntersectionObserver" in window) {
    var motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var watched = document.querySelectorAll(".material-kw, .reveal");
    if (!motion) {
      var view = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          view.unobserve(entry.target);
        });
      }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
      Array.prototype.forEach.call(watched, function (node) { view.observe(node); });
    } else {
      Array.prototype.forEach.call(watched, function (node) { node.classList.add("in"); });
    }
  }

  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");
    var healthPattern = /我的血糖|本人血糖|我的胰岛素|胰岛素剂量|诊断为|病历|处方|用药史|糖化血红蛋白|mmol|mg\s*\/\s*dl|hba1c|blood sugar|my glucose|insulin dose|diagnos/i;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var message = (form.querySelector("[name='message']") || {}).value || "";
      form.classList.remove("is-error", "is-held");
      if (healthPattern.test(message)) {
        form.classList.add("is-error");
        status.textContent = document.documentElement.lang === "en"
          ? "Please don’t include personal health information. Remove readings, diagnoses, medicines, or history. Nothing was sent."
          : "请不要留下个人健康信息。请删去读数、诊断、用药或病历。内容没有发送。";
        return;
      }
      form.classList.add("is-held");
      form.reset();
      status.textContent = document.documentElement.lang === "en"
        ? "Thank you. This note was not sent or stored."
        : "谢谢。这条留言没有被发送，也没有被保存。";
    });
  }
})();
