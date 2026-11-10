/* Men Caring4 Men - shared behaviour.
   Two jobs: reveal-on-scroll, and the event registration form.

   FORM ENDPOINT: set MC4M_FORM_ENDPOINT to the live POST url (n8n webhook,
   Kit form action, whatever the funnel-access call settles on). While it is
   empty the form tells the visitor honestly that registrations are not open
   yet instead of silently swallowing the address. One line to swap. */

window.MC4M_FORM_ENDPOINT = window.MC4M_FORM_ENDPOINT || "";

(function () {
  "use strict";

  /* ---------- reveal on scroll ---------- */
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- registration form ---------- */
  var form = document.querySelector("form[data-mc4m-register]");
  if (!form) return;

  var msg = form.parentNode.querySelector(".form-msg");
  var btn = form.querySelector("button[type=submit]");
  var btnText = btn ? btn.textContent : "";

  function say(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.add("show");
    msg.classList.toggle("err", !!isError);
  }

  /* Same as say(), but the email address is a real tappable mailto link.
     Built from DOM nodes rather than innerHTML: the strings are static, and
     this keeps the one path a visitor actually hits today injection-proof. */
  function sayWithEmail(before, address, after) {
    if (!msg) return;
    msg.textContent = "";
    msg.appendChild(document.createTextNode(before));
    var a = document.createElement("a");
    a.href = "mailto:" + address;
    a.textContent = address;
    msg.appendChild(a);
    msg.appendChild(document.createTextNode(after));
    msg.classList.add("show");
    msg.classList.add("err");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var endpoint = window.MC4M_FORM_ENDPOINT;
    if (!endpoint) {
      sayWithEmail("Registrations are not open yet. Email ", "breathpj1234@gmail.com", " to be told the moment they are.");
      return;
    }

    var data = {
      first_name: form.first_name.value.trim(),
      email: form.email.value.trim(),
      event: form.getAttribute("data-mc4m-register") || "switch-off",
      page: location.pathname,
      submitted_at: new Date().toISOString()
    };

    if (btn) { btn.disabled = true; btn.textContent = "Saving your spot..."; }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) {
        if (!r.ok) throw new Error("bad status " + r.status);
        window.location.href = "thanks.html?name=" + encodeURIComponent(data.first_name);
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        sayWithEmail("That did not go through. Try again, or email ", "breathpj1234@gmail.com", " and Peter will add you by hand.");
      });
  });
})();
