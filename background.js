chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "popup.html" });
});

// Hàm để thay đổi thông tin cho một trang cụ thể
async function updatePageInfo(pageId, accessToken, updatedInfo) {
  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: accessToken,
        ...updatedInfo
      })
    });

    console.log(`Thay đổi thông tin thành công cho trang ${pageId}`);
  } catch (error) {
    console.error(`Lỗi khi thay đổi thông tin cho trang ${pageId}:`, error);
  }
}

// Hàm để un_publish trang
async function unPublishPage(pageId, accessToken) {
  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${pageId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: accessToken,
        is_published: false
      })
    });

    console.log(`Un_publish trang thành công: ${pageId}`);
  } catch (error) {
    console.error(`Lỗi khi un_publish trang: ${pageId}`, error);
  }
}

// Đọc danh sách UID, Token và Tên từ file
async function readUidTokenNameList() {
  const fileContent = await fetch(chrome.runtime.getURL('assets/uidtoken.txt'));
  const lines = await fileContent.text();
  const uidTokenNameList = [];

  lines.split('\n').forEach((line) => {
    const [uid, token, name] = line.trim().split('|');
    if (uid && token && name) {
      uidTokenNameList.push({ uid, token, name });
    }
  });

  return uidTokenNameList;
}

// Đọc danh sách từ file
async function readListFromFile(filePath) {
  const fileContent = await fetch(chrome.runtime.getURL(filePath));
  const lines = await fileContent.text();
  const list = lines.split('\n').map((item) => item.trim()).filter((item) => item !== '');
  return list;
}

// Lấy ngẫu nhiên một phần tử từ danh sách
function getRandomItem(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

// Cập nhật thông tin cho danh sách trang và un_publish trang
async function updatePageInfoBatch(uidTokenNameList, updatedInfo) {
  const streetList = await readListFromFile('assets/sonha.txt');
  const cityList = await readListFromFile('assets/city.txt');

  const updatePromises = uidTokenNameList.map(async ({ uid, token, name }) => {
    const infoToUpdate = { ...updatedInfo };
    infoToUpdate.location = {
      street: getRandomItem(streetList),
      city: getRandomItem(cityList),
      state: '',
      country: 'VN',
      zip: '100000'
    };
    await updatePageInfo(uid, token, infoToUpdate);
    await unPublishPage(uid, token);
  });

  await Promise.all(updatePromises);

  console.log('Cập nhật thông tin và un_publish trang thành công cho tất cả các trang.');
}

// Gửi tin nhắn đến tab hiện tại để thực hiện cập nhật
function sendMessageToTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

// Xử lý tin nhắn từ popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getInfo') {
    // Đọc danh sách UID, Token và Tên từ file
    readUidTokenNameList().then((uidTokenNameList) => {
      sendResponse(uidTokenNameList);
    });

    return true; // Bắt buộc trả về true để giữ kết nối tin nhắn mở
  }
});

