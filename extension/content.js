function showInOverlay(content = "", isLoading = true) {
  const existing = document.getElementById("veritas-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "veritas-popup";

  const displayContent = isLoading
    ? `<div id="veritas-message">
         🔍 <span class="dots">Analyzing the page<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>
       </div>`
    : `<div id="veritas-message">${content}</div>`;

  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: rgba(31, 31, 31, 0.75);
      border: 2px solid rgba(255, 255, 255, 0.25);
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      font-family: sans-serif;
      max-width: 400px;
      color: white;
      font-size: 16px;
      line-height: 1.5;
      overflow: auto;
      max-height: 50vh;
      backdrop-filter: blur(5px);
      ::-webkit-scrollbar {
        display: none;
      }
      

    ">
      ${displayContent}
      <div style="margin-top: 10px; text-align: right;">
        <button id="close-veritas" style="padding: 6px 16px;border-radius: 10px; border: none;">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  document.getElementById("close-veritas").onclick = () => {
    document.getElementById("veritas-popup").remove();
  };

  // Dot animation CSS
  const style = document.createElement("style");
  style.innerHTML = `
    .dots .dot {
      animation: blink 1s infinite steps(1);
      opacity: 0;
    }
    .dots .dot:nth-child(2) { animation-delay: 0.2s; }
    .dots .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes blink {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function typeSectionsSequentially(target, sections, delay = 20, gap = 400) {
  let i = 0;
  target.innerHTML = "";

  function typeNext() {
    if (i < sections.length) {
      const section = sections[i];
      const styledDiv = document.createElement("div");
      styledDiv.style = section.style;
      target.appendChild(styledDiv);

      let j = 0;
      function typeChar() {
        if (j < section.text.length) {
          styledDiv.innerHTML += section.text[j];
          j++;
          setTimeout(typeChar, delay);
        } else {
          i++;
          setTimeout(typeNext, gap);
        }
      }

      typeChar();
    }
  }

  typeNext();
}

function sendToBackend(content, url) {
  showInOverlay();
  fetch("http://localhost:8000/api/analyze/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: content, url: url }),
  })
    .then((res) => res.json())
    .then((data) => {
      const messageEl = document.getElementById("veritas-message");

      const sections = [
        {
          text: "Veritas Analysis",
          style: "font-size: 18px; font-weight: bold;",
        },
        {
          text: `📄 This page is ${data.page_type} page`,
          style: "font-size: 14px; margin-top: 10px;",
        },
        {
          text: `🧠 Summary`,
          style: "font-size: 14px; margin-top: 10px; font-weight: bold;",
        },
        {
          text: `${data.summary}`,
          style: "font-size: 14px; margin-top: 10px;",
        },
      ];

      typeSectionsSequentially(messageEl, sections);
    })
    .catch((err) => {
      console.error("Backend API error:", err);
      showInOverlay("Backend error. Please try again later.", false);
    });
}

// Auto-run on page load
window.addEventListener("load", () => {
  let pageText = document.body.innerText || "";
  const url = window.location.href;

  pageText = pageText.slice(0, 4000);
  if (pageText.length > 100) {
    sendToBackend(pageText, url);
  }
});
