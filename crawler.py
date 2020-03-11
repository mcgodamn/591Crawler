# coding=UTF-8
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException
from selenium.webdriver.chrome.options import Options
import time
from bs4 import BeautifulSoup
import threading
import queue
from enum import IntEnum

Datas = []
Urls = queue.Queue()


class ResultType(IntEnum):
    DEFFAUT = 0
    SUCCESS = 1
    FAIL = 2
    NOT_FOR_SALE = 3
    TIMEOUT = 4

# 取得網頁內容


def getContent(link, examPath, waitTime = 1):
    global driver
    try:
        options = Options()
        # options.headless = True
        # driver = webdriver.Chrome(
        #     executable_path="/Users/McGodamn/Documents/Cases/crawler/chromedriver",options=options)
        driver = webdriver.Chrome(
            executable_path="chromedriver.exe", chrome_options=options)
        result = ResultType.DEFFAUT
        driver.get(link)

        while driver.execute_script("return document.readyState") != 'complete':
            time.sleep(0.5)

        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, examPath))
        )
        return ResultType.SUCCESS
    except Exception as e:
        print(e)
        if ("HTTP ERROR" in driver.page_source):
            if waitTime < 180:
                print("HTTP ERROR, retey")
                driver.quit()
                time.sleep(waitTime)
                return getContent(link, examPath, waitTime * 2)
            else:
                return ResultType.TIMEOUT
        else:
            return ResultType.FAIL

def writeXls():
    global Datas
    print("Start outpuing xls")
    f = xlwt.Workbook()
    sheet = f.add_sheet(u'sheet1', cell_overwrite_ok=True)
    for i in range(len(Datas)):
        sheet.write(i, 0, Datas[i]['url'])
        sheet.write(i, 1, Datas[i]['price'] if 'price' in Datas[i] else '')

    f.save('output.xls')

def ReadXls():
    global Urls
    try:
        workbook = xlrd.open_workbook("source.xls")
        sheet = workbook.sheet_by_index(0)
        for row in range(sheet.nrows):
            data = sheet.cell(row, 0).value
            dataSet = dict()
            dataSet['url'] = data
            Urls.put(dataSet)

    except Exception as e:
        print(e)
        print("Can't read Xls. Please check file again.")

def goods(dataSet, re=False):
    global myDoc, Datas
    try:
        link = dataSet['url']
        result = getContent(link, "//ul[@class=\"price\"]")
        if result != ResultType.SUCCESS:
            if result == ResultType.NOT_FOR_SALE:
                dataSet['price'] = "Not sold"
            elif result == ResultType.TIMEOUT:
                dataSet['price'] = "Time out"
            elif result == ResultType.FAIL:
                dataSet['price'] = "Not available"
        else:
            dataSet['price'] = driver.find_element_by_xpath(
                "//ul[@class=\"price\"]//strong[@class=\"price01\"]//b").text
        print(dataSet['price'])
        Datas.append(dataSet)
        driver.quit()

    except (TypeError, AttributeError) as t:
        print(t)
        driver.quit()
        goods(dataSet, True)
    except Exception as e:
        print(e)
        Datas.append(dataSet)
        driver.quit()


# 主要進入點
# 讀json檔裡的大類別URL，存到陣列裡
# 再由URL陣列裡取得小類別URL，
# 再由小類別URL取得商品頁面，並取得商品資訊

# 程式主要是維護這些陣列，查詢過的就pop掉

def Main():
    global Urls, start, pause
    if start:
        return
    if not pause:
        ReadXls()
        print("start crawler")
    else:
        print("restart crawler")
    start = True
    pause = False
    # 取得商品資訊
    while Urls.qsize() != 0:
        if pause:
            break
        url = Urls.get()
        print("Getting " + (str)
              (url['url'] + " 's Item information."))
        goods(url)
    if pause:
        print("pause program completly")
    writeXls()

Main()
input("finished")