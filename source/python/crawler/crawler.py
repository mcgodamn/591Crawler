# coding=UTF-8
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
from datetime import datetime
from enum import IntEnum
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
        self.rootPath = "//div[@class=\"list-container-content\"]"
    
    def log(self, msg):
        self.eventDelegate("log", msg)

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
            para["searchtype"] = 4
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
    
    def find_element(self, baseEle, by, pattern):
        WebDriverWait(self.driver, 5).until(
            EC.presence_of_element_located((by, pattern)))
        return baseEle.find_element(by, pattern)
    
    def find_elements(self, baseEle, by, pattern):
        WebDriverWait(self.driver, 5).until(
            EC.presence_of_element_located((by, pattern)))
        return baseEle.find_elements(by, pattern)

    def openBrowser(self, link, waitTime=1):
        options = Options()
        options.headless = True
        self.driver = webdriver.Chrome(
            executable_path=ChromeDriverManager().install(), options=options)
        result = ResultType.DEFFAUT
        self.driver.get(link)
        self.log("getting: " + link)
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

        loading = self.driver.find_element(By.ID, "j-loading")
        WebDriverWait(self.driver, 5).until(
            (lambda d:
                EC.presence_of_element_located((By.XPATH, self.rootPath))(d)
                and loading.value_of_css_property("display") == 'none')
        )

    def goods(self, data, page = 0):
        def analysisRoom(ele):
            result = {}
            result['url'] = self.find_element(ele, By.TAG_NAME, 'a').get_attribute('href')
            roomEl = self.find_element(ele, By.CLASS_NAME, "rent-item-right")
            result['price'] = float(self.find_element(roomEl, By.CLASS_NAME,"item-price-text").find_element(By.TAG_NAME,"span").text.replace(',', ''))
            dist = self.find_element(roomEl, By.CLASS_NAME, "item-tip").text
            result['dist'] = float(dist.split()[-1][:-2])
            result['title'] = self.find_element(roomEl, By.CLASS_NAME, "item-title").text
            result['area'] = self.find_element(roomEl, By.CLASS_NAME, "item-style").find_elements(By.TAG_NAME, "li")[1].text
            
            minDis = 0 if (self.distance[0] == "") else float(self.distance[0])
            maxDis = float('inf') if (
                self.distance[1] == "" or self.distance[1] == 0) else float(self.distance[1])
            
            isPass = (result['dist'] <= maxDis) and (minDis <= result['dist'])

            return result if isPass else None

        self.openBrowser(data['url'] + f"&firstRow={page * 30}")
        el = self.driver.find_element(By.XPATH, self.rootPath)
        if el.value_of_css_property("display") == 'none':
            self.driver.quit()
            return

        canWeGoNextPage = False
        els = self.find_elements(el, By.XPATH, "//section[@class=\"vue-list-rent-item\"]")
        for room in els:
            res = analysisRoom(room)
            if res != None:
                canWeGoNextPage = True
                res.update(data['addon'])
                self.Data.append(res)
            else:
                canWeGoNextPage = False
                break
        self.driver.quit()
        if canWeGoNextPage:
            self.log("GO NEXT PAGE")
            self.goods(data, page + 1)

    def Start(self, _parameters):
        if not self.start:
            self.start = True
            threading.Thread(target=self.startCrawler, args=(_parameters,)).start()
    
    def startCrawler(self, _parameters):
        try:
            self.log("crawler started")
            self.stop = False
            datas = self.ProcessParameter(_parameters)
            self.eventDelegate("progress", {'progressAll': len(datas)})
            for i in range(len(datas)):
                if self.stop:
                    break
                self.goods(datas[i])
                self.eventDelegate("progress", {'progress': i+1})

            self.start = False
            self.log("crawler finished")
            if self.stop:
                self.eventDelegate("finish")
            else:
                self.output()
        except Exception as e:
            self.log(f"Error: {str(e)}")

    def Stop(self):
        def stop():
            self.stop = True
            self.log("cancel_crawler")
        threading.Thread(target=stop).start()