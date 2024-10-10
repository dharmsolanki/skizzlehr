// Event to run execute.js content when the extension's button is clicked
chrome.action.onClicked.addListener(execScript);
console.log("execute.js has been executed successfully.");

async function execScript() {
  const tabId = await getTabId();
  if (tabId) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["execute.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("chrome.runtime.lastError");
        } else {
          console.log("execute.js has been executed successfully.");
        }
      }
    );
  } else {
    console.error("No active tab found.");
  }
}

async function getTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs.length > 0 ? tabs[0].id : null;
}
