function trimText(text, maxLength = 4000) {
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function extractPageContent() {
  const bodyText = document.body?.innerText || "";
  const htmlText = document.documentElement?.innerText || "";
  const fullText = (bodyText + "\n" + htmlText).trim();
  const trimmed = trimText(fullText);
  const url = window.location.href;

  console.log("🔍 Sending to Veritas AI backend...");

  sendToBackend(trimmed, url);
}

function sendToBackend(content, url) {
  fetch("http://localhost:8000/api/analyze/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: content, url: url }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Veritas AI Response");
      console.log("Summary:", data.summary);
      console.log("Type:", data.page_type);
    })
    .catch((err) => {
      console.error("Backend API error:", err);
    });
}

window.addEventListener("load", extractPageContent);
