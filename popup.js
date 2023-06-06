document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('startButton').addEventListener('click', () => {
    // Gửi tin nhắn đến background script để lấy danh sách UID, Token và Tên
    chrome.runtime.sendMessage({ action: 'getInfo' }, (response) => {
      if (response) {
        // Hiển thị trạng thái
        document.getElementById('status').innerText = `Cập nhật thông tin cho ${response.length} trang...`;
      } else {
        // Hiển thị lỗi
        document.getElementById('status').innerText = 'Không thể lấy thông tin từ background script';
      }
    });
  });
});
