import os
import requests
from bs4 import BeautifulSoup
import logging

# 設置 log 基本配置
logging.basicConfig(
    level=logging.INFO,  # 設定要記錄的最小級別
    format='%(asctime)s - %(levelname)s - %(message)s',  # 日誌格式
    handlers=[
        logging.FileHandler("crawler.log"),  # 記錄到檔案
        logging.StreamHandler()  # 同時輸出到終端
    ]
)

# 爬取 .gpx 檔案的函數
def fetch_gpx_files(url, max_files=100):
    try:
        response = requests.get(url)
        response.raise_for_status()  # 檢查是否有 HTTP 錯誤
        soup = BeautifulSoup(response.text, 'html.parser')

        # 找到所有的 .gpx 檔案連結
        gpx_links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.endswith('.gpx'):
                gpx_links.append(href)
            # 如果已經達到 max_files 的數量，停止爬取
            if len(gpx_links) >= max_files:
                break

        if not gpx_links:
            logging.warning(f"No .gpx files found on {url}")
        else:
            logging.info(f"Found {len(gpx_links)} .gpx files on {url}")

        return gpx_links

    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to retrieve data from {url}: {e}")
        return []

# 下載檔案的函數
def download_file(url, save_dir):
    try:
        filename = os.path.basename(url)
        response = requests.get(url)
        response.raise_for_status()  # 檢查是否有 HTTP 錯誤

        file_path = os.path.join(save_dir, filename)
        with open(file_path, 'wb') as f:
            f.write(response.content)
        logging.info(f"Downloaded: {filename}")

    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to download {url}: {e}")

# 設定你要爬取的網站 URL
target_urls = [
    "https://www.hiking.biji.co/",  # 登山補給站
    "https://hikingbook.net/",  # 健行筆記
    "https://www.backpackers.com.tw/forum/forumdisplay.php?f=31",  # 背包客棧 - 台灣山岳版
    "https://www.100mountain.com/",  # 台灣百岳資訊網
    "https://taiwanhiking.com/"  # 台灣登山地圖網
]

# 設定本地儲存檔案的資料夾
save_directory = 'gpx_files'

# 如果資料夾不存在，則創建資料夾
if not os.path.exists(save_directory):
    os.makedirs(save_directory)

# 爬取最多 100 筆 .gpx 檔案
gpx_files = fetch_gpx_files(target_urls, max_files=100)

# 將下載的 .gpx 檔案儲存到本地
if gpx_files:
    for gpx_url in gpx_files:
        download_file(gpx_url, save_directory)
else:
    logging.warning("No .gpx files to download.")
