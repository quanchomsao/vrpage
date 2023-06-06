// Gửi tin nhắn đến background script để lấy danh sách UID, Token và Tên
chrome.runtime.sendMessage({ action: 'getInfo' }, (response) => {
  if (response) {
    // Gửi danh sách UID, Token và Tên từ background script đến content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'setInfo', uidTokenNameList: response });
    });
  }
});

document.getElementById("updateButton").addEventListener("click", function() {
  // Đây là hàm bạn muốn thực thi khi nút Update được nhấn
});
