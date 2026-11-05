/* Unlocks the password-protected preprint recap on its portfolio page.
   The recap is stored encrypted in assets/preprint/*.bin (AES-256-GCM, key from
   PBKDF2-SHA256); nothing readable about the paper is in this repository.
   Layout of the .bin: "PC1" | salt (16 bytes) | iv (12 bytes) | ciphertext+tag.
   On success the HTML goes into #pc-root and the bundled scripts run in order.
   The password is kept for the browser session only (sessionStorage). */
(function () {
  "use strict";
  var ITER = 600000, KEY = "pc-preprint-pw";
  var form = document.getElementById("pc-unlock");
  if (!form || !window.crypto || !crypto.subtle) return;
  var root = document.getElementById("pc-root");
  var input = document.getElementById("pc-pw");
  var btn = document.getElementById("pc-go");
  var err = document.getElementById("pc-err");

  async function unlock(pw) {
    var res = await fetch(form.getAttribute("data-payload"), { cache: "no-cache" });
    if (!res.ok) throw new Error("payload " + res.status);
    var buf = new Uint8Array(await res.arrayBuffer());
    var salt = buf.slice(3, 19), iv = buf.slice(19, 31), ct = buf.slice(31);
    var km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: ITER, hash: "SHA-256" },
                                            km, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    var gz = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ct);
    var text = await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
    return JSON.parse(text);
  }

  function show(p) {
    root.innerHTML = p.html;
    p.js.forEach(function (code) {
      var s = document.createElement("script");
      s.textContent = code;
      document.body.appendChild(s);
    });
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView();
    }
  }

  async function attempt(pw, quiet) {
    btn.disabled = true; btn.textContent = "Decrypting…"; err.textContent = "";
    try {
      var p = await unlock(pw);
      try { sessionStorage.setItem(KEY, pw); } catch (e) { /* storage blocked: fine */ }
      show(p);
    } catch (e) {
      try { sessionStorage.removeItem(KEY); } catch (x) { /* ignore */ }
      btn.disabled = false; btn.textContent = "Open";
      if (!quiet) err.textContent = e && e.name === "OperationError" ? "Wrong password." : "Could not open the page.";
    }
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); attempt(input.value, false); });

  var saved = null;
  try { saved = sessionStorage.getItem(KEY); } catch (e) { /* ignore */ }
  if (saved) attempt(saved, true);
})();
