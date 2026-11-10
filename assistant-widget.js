// Floating AI button for the SahadatLabs dashboard.
// Opens assistant.html (password-locked) in a panel on top of the page.
(function () {
  var SRC = "assistant.html";

  var css = document.createElement("style");
  css.textContent =
    "#sl-ai-btn{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));width:56px;height:56px;border-radius:50%;border:0;background:#e09f3e;color:#14213d;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer;z-index:99998;display:grid;place-items:center;padding:0}" +
    "#sl-ai-btn svg{width:34px;height:34px}" +
    "#sl-ai-btn:focus-visible,#sl-ai-close:focus-visible{outline:3px solid #14213d;outline-offset:2px}" +
    "#sl-ai-panel{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.45);display:none}" +
    "#sl-ai-panel.on{display:block}" +
    "#sl-ai-box{position:absolute;right:0;bottom:0;top:0;width:100%;max-width:440px;background:#101a2e;box-shadow:-4px 0 20px rgba(0,0,0,.4)}" +
    "#sl-ai-box iframe{width:100%;height:100%;border:0;display:block}" +
    "#sl-ai-close{position:absolute;top:calc(8px + env(safe-area-inset-top,0px));right:12px;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:#e09f3e;color:#14213d;font-size:20px;line-height:1;cursor:pointer}" +
    "@media(min-width:700px){#sl-ai-box{top:16px;bottom:16px;right:16px;width:420px;border-radius:14px;overflow:hidden}}";
  document.head.appendChild(css);

  var ICONS = {
    robot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 4V2.6"/><circle cx="12" cy="2" r="0.9" fill="currentColor" stroke="none"/>' +
    '<rect x="5" y="4" width="14" height="9" rx="3"/>' +
    '<circle cx="9.3" cy="8.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.7" cy="8.5" r="1.2" fill="currentColor" stroke="none"/>' +
    '<path d="M3 7v3M21 7v3"/><path d="M12 13v2"/>' +
    '<path d="M4.5 22v-2a4.5 4.5 0 0 1 4.5-4.5h6a4.5 4.5 0 0 1 4.5 4.5v2"/>' +
    '<circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.3L20.5 10l-6.3 1.7L12 18l-2.2-6.3L3.5 10l6.3-1.7L12 2zM19 15l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1 1-2.6z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><circle cx="8.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="11" r="1" fill="currentColor" stroke="none"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c3 2 5 5.5 5 9l-2 3H9l-2-3c0-3.5 2-7 5-9z"/><circle cx="12" cy="9" r="1.6"/><path d="M7 12l-3 3 3 1M17 12l3 3-3 1M10 17l2 4 2-4"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>'
  };

  var btn = document.createElement("button");
  btn.id = "sl-ai-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Open AI assistant");
  btn.innerHTML = ICONS.robot;

  var panel = document.createElement("div");
  panel.id = "sl-ai-panel";
  panel.innerHTML =
    '<div id="sl-ai-box"><button id="sl-ai-close" type="button" aria-label="Close assistant">&times;</button></div>';

  var frame = null;

  function open() {
    if (!frame) {
      frame = document.createElement("iframe");
      frame.src = SRC;
      frame.title = "AI assistant";
      frame.setAttribute("allow", "microphone");
      document.getElementById("sl-ai-box").appendChild(frame);
    }
    panel.classList.add("on");
  }
  function close() {
    panel.classList.remove("on");
  }

  btn.addEventListener("click", open);
  panel.addEventListener("click", function (e) {
    if (e.target === panel) close();
  });
  panel.querySelector("#sl-ai-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // Icon and color can be changed from the assistant (saved in data.json -> profile)
  fetch("data.json?v=" + Date.now())
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var p = (d && d.profile) || {};
      var svg = p.assistant_icon_svg;
      if (
        p.assistant_icon === "custom" && typeof svg === "string" && svg.indexOf("<svg") === 0 &&
        !/<script|<foreignObject|<image|<style|\son[a-z]+\s*=|javascript:|href\s*=/i.test(svg)
      ) {
        btn.innerHTML = svg;
      } else if (p.assistant_icon && ICONS[p.assistant_icon]) {
        btn.innerHTML = ICONS[p.assistant_icon];
      }
      var svg = p.assistant_icon_svg;
      if (typeof svg === "string" && /^<svg[\s>]/.test(svg) && svg.length < 8000 &&
          !/<script|\son\w+\s*=|href|<foreignObject|<image/i.test(svg)) {
        btn.innerHTML = svg;
      }
      var c = p.assistant_color;
      if (c && /^#[0-9a-fA-F]{6}$/.test(c)) {
        var n = parseInt(c.slice(1), 16);
        var lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
        btn.style.background = c;
        btn.style.color = lum > 0.6 ? "#14213d" : "#ffffff";
      }
    })
    .catch(function () {});
})();
