# coding=UTF-8
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException
from selenium.webdriver.chrome.options import Options
import time
from datetime import datetime
import queue
from enum import IntEnum
import json
import sys
import os
import threading

URL_HEAD = "https://rent.591.com.tw/?"


class ResultType(IntEnum):
    DEFFAUT = 0
    SUCCESS = 1
    FAIL = 2
    TIMEOUT = 3

class Crawler():

    def __init__(self):
        self.start = False
        self.Data = []
        self.driver = None
        self.distance = [0,0]
        self.rootPath = "//div[@id=\"content\"]"

    def setDatabase(self, _db):
        self.database = _db

    def setEventDelegate(self, _dele):
        self.eventDelegate = _dele

    def output(self):
        self.database.Save2DB(self.Data)
        self.eventDelegate("finish", self.database.getData())
    
    def ProcessParameter(self, _para, _shareProperty=None):
        DUPLICATE_CATAGORIES = ["kind", "sex", "mrtcoods", ]
        ADDON_CATAGORIES = ["kind", "mrtcoods", "option"]
        EXTRA_OPTIONS = ["hasimg", "not_cover", "role"]
        SELF_DEFINED = ["distance"]

        para = _para

        def PathBuilder(parameters):
            def getMutiplePara(paras):
                res = ""
                for p in paras:
                    res += (str(p)+',')
                return res

            m_url = URL_HEAD
            for para in parameters:
                m_url += (
                    '&' + str(para) + '=' +
                    (getMutiplePara(parameters[para]) if (
                        type(parameters[para]) == list) else str(parameters[para]))
                )
            return m_url

        def getShareProperty():
            res = {
                "time": datetime.strftime(datetime.now(), '%Y-%m-%d-%H:%M:%S')
            }
            return res

        def getAddonData():
            res = {}
            for cata in ADDON_CATAGORIES:
                if cata in res:
                    res[cata] = para[cata]
            return res

        def handleSelfDefinePara():
            for selfDefine in SELF_DEFINED:
                if selfDefine in para:
                    if selfDefine == "distance":
                        self.distance = para[selfDefine]
                        del para[selfDefine]

        def splitExtraOptions():
            if "option" not in para:
                return
            for extra in EXTRA_OPTIONS:
                if extra in para["option"]:
                    para[extra] = 1
                    para["option"].remove(extra)

        def addStaticInfo():
            para["order"] = "nearby"
            para["orderType"] = "desc"

        shareProperty = _shareProperty if _shareProperty != None else getShareProperty()

        handleSelfDefinePara()
        addStaticInfo()
        splitExtraOptions()

        result = []

        for cata in DUPLICATE_CATAGORIES:
            if type(para[cata]) == list:
                for value in para[cata]:
                    newPara = para.copy()
                    newPara[cata] = value
                    result += self.ProcessParameter(newPara)
                return result
        return [{'url': PathBuilder(para), 'addon': getAddonData()}]

    def openBrowser(self, link, waitTime=1):
        def resource_path(relative_path):
            if hasattr(sys, '_MEIPASS'):
                return os.path.join(sys._MEIPASS, relative_path)
            return os.path.join(os.path.abspath("."), relative_path)
        options = Options()
        options.headless = True
        self.driver = webdriver.Chrome(
            executable_path=resource_path(".\chromedriver.exe"), options=options)
        result = ResultType.DEFFAUT
        self.driver.get(link)
        print("getting: " + link)
        try:
            self.waitForLoading(waitTime)
            return ResultType.SUCCESS
        except Exception as e:
            print(e)
            if ("HTTP ERROR" in self.driver.page_source):
                if waitTime < 180:
                    print("HTTP ERROR, retry")
                    self.driver.quit()
                    time.sleep(waitTime)
                    return self.openBrowser(link, waitTime * 2)
            return ResultType.FAIL

    # 取得網頁內容
    def waitForLoading(self, waitTime=1):
        while self.driver.execute_script("return document.readyState") != 'complete':
            time.sleep(0.5)

        loading = self.driver.find_element_by_id("j_loading")
        WebDriverWait(self.driver, 5).until(
            (lambda d:
                EC.presence_of_element_located(
                    (By.XPATH, self.rootPath))(d) and loading.value_of_css_property("display") == 'none')
        )

    def goods(self, data, page = 0):
        def AnalysisRoom(ele):
            result = {}
            roomEl = ele.find_element_by_class_name("infoContent")
            result['price'] = float(ele.find_element_by_class_name(
                "price").find_element_by_tag_name("i").text.replace(',', ''))
            result['dist'] = float(roomEl.find_element_by_class_name(
                "nearby").text.split()[2][:-1])

            titleAndUrl = roomEl.find_element_by_tag_name(
                "h3").find_element_by_tag_name("a")
            result['title'] = titleAndUrl.text
            result['url'] = titleAndUrl.get_attribute('href')

            allArea = roomEl.find_element_by_class_name(
                "lightBox").text
            areaPos = allArea.find('坪')
            result['area'] = float(allArea[:areaPos].split('  |  ')[-1])

            minDis = 0 if (self.distance[0] == "") else float(self.distance[0])
            maxDis = float('inf') if (
                self.distance[1] == "") else float(self.distance[1])

            return result if (result['dist'] <= maxDis) and (minDis <= result['dist']) else None

        self.openBrowser(data['url'] + f"&firstRow={page * 30}")
        el = self.driver.find_element_by_xpath(self.rootPath)
        if el.value_of_css_property("display") == 'none':
            self.driver.quit()
            return

        canWeGoNextPage = False
        els = el.find_elements_by_xpath(
            "//ul[contains(@class, 'listInfo') and contains(@class, 'clearfix')]")
        for room in els:
            res = AnalysisRoom(room)
            if res != None:
                canWeGoNextPage = True
                res.update(data['addon'])
                self.Data.append(res)
            else:
                canWeGoNextPage = False
                break
        self.driver.quit()
        if canWeGoNextPage:
            self.goods(data, page + 1)

    def Start(self, _parameters):
        if not self.start:
            self.start = True
            threading.Thread(target=self.startCrawler, args=(_parameters,)).start()
    
    def startCrawler(self, _parameters):
        self.stop = False
        datas = self.ProcessParameter(_parameters)
        self.eventDelegate("progress", {'progressAll': len(datas)})
        for i in range(len(datas)):
            if self.stop:
                break
            self.goods(datas[i])
            self.eventDelegate("progress", {'progress': i+1})

        self.start = False
        print("crawler finished")
        if self.stop:
            self.eventDelegate("finish")
        else:
            self.output()

    def Stop(self):
        def stop():
            self.stop = True
            print("cancel_crawler")
        threading.Thread(target=stop).start()

# c = Crawler()
# c.Start({'kind': [2, 3], 'sex': [1, 3], 'not_cover': 1, 'rentprice': [6000, 8000], 'mrtcoods': [
#         4232, 4231, 4184], 'order': 'nearby', 'orderType': 'desc', 'option': ['broadband'], 'hasimg': 1, 'area': [6]})
