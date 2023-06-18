chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
});

chrome.browserAction.onClicked.addListener(buttonClicked);
function buttonClicked(tab) {
  let msg = {
    text: "go",
  };
  chrome.tabs.sendMessage(tab.id, msg);
}
