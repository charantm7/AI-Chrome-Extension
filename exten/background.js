chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleSidebarResponsive,
  });
});

function toggleSidebarResponsive() {
  const existingSidebar = document.getElementById("my-extension-sidebar");
  const wrapper = document.getElementById("my-body-wrapper");

  if (existingSidebar) {
    existingSidebar.remove();
    if (wrapper) {
      wrapper.style.width = "100%";
      wrapper.style.marginRight = "0";
    }
    return;
  }

  // Wrap body content if not already wrapped
  if (!wrapper) {
    const bodyWrapper = document.createElement("div");
    bodyWrapper.id = "my-body-wrapper";

    // Move all body children to wrapper
    while (document.body.firstChild) {
      bodyWrapper.appendChild(document.body.firstChild);
    }

    document.body.appendChild(bodyWrapper);

    bodyWrapper.style.transition = "all 0.3s ease";
    bodyWrapper.style.boxSizing = "border-box";
    bodyWrapper.style.width = "100%";
  }

  // Create sidebar
  const sidebar = document.createElement("iframe");
  sidebar.src = chrome.runtime.getURL("sidebar.html");
  sidebar.id = "my-extension-sidebar";
  sidebar.style.position = "fixed";
  sidebar.style.top = "0";
  sidebar.style.right = "0";
  sidebar.style.height = "100%";
  sidebar.style.width = "300px";
  sidebar.style.zIndex = "999999";
  sidebar.style.border = "none";
  sidebar.style.transition = "right 0.3s ease";
  sidebar.style.background = "white";

  document.body.appendChild(sidebar);

  // Shrink body width to make room
  document.getElementById("my-body-wrapper").style.width = "calc(100% - 300px)";
  document.getElementById("my-body-wrapper").style.marginRight = "300px";
}
