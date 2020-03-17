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

URL_HEAD = "https://rent.591.com.tw/?"


class ResultType(IntEnum):
    DEFFAUT = 0
    SUCCESS = 1
    FAIL = 2
    TIMEOUT = 3


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


def ProcessParameter(_para, _shareProperty=None):
    DUPLICATE_CATAGORIES = ["kind", "sex", "mrtcoods", ]
    ADDON_CATAGORIES = ["kind", "mrtcoods", "option"]

    def getShareProperty():
        res = {
            "time": datetime.strftime(datetime.now(), '%Y-%m-%d-%H:%M:%S')
        }

    def getAddonData():
        res = {}
        for cata in ADDON_CATAGORIES:
            if cata in res:
                res[cata] = _para[cata]
        return res

    shareProperty = _shareProperty if _shareProperty != None else getShareProperty()

    result = []
    for cata in DUPLICATE_CATAGORIES:
        if type(_para[cata]) == list:
            for value in _para[cata]:
                newPara = _para.copy()
                newPara[cata] = value
                result += ProcessParameter(newPara)
            return result
    return [{'url': PathBuilder(_para), 'addon': getAddonData()}]


class Crawler():

    def __init__(self):
        self.Data = []
        self.driver = None

    def setDatabase(self, _db):
        self.database = _db

    def setEventDelegate(self, _dele):
        self.eventDelegate = _dele

    def output(self):
        self.database.Save2DB(self.Data)
        self.eventDelegate("finish", self.database.getData())

    # 取得網頁內容
    def getContent(self, link, examPath, waitTime=1):
        try:
            options = Options()
            options.headless = True
            self.driver = webdriver.Chrome(
                executable_path="chromedriver.exe", options=options)
            result = ResultType.DEFFAUT
            self.driver.get(link)

            while self.driver.execute_script("return document.readyState") != 'complete':
                time.sleep(0.5)

            loading = self.driver.find_element_by_id("j_loading")
            WebDriverWait(self.driver, 5).until(
                (lambda d:
                    EC.presence_of_element_located(
                        (By.XPATH, examPath))(d) and loading.value_of_css_property("display") == 'none')
            )

            return ResultType.SUCCESS
        except Exception as e:
            print(e)
            if ("HTTP ERROR" in self.driver.page_source):
                if waitTime < 180:
                    print("HTTP ERROR, retey")
                    self.driver.quit()
                    time.sleep(waitTime)
                    return self.getContent(link, examPath, waitTime * 2)
                else:
                    return ResultType.TIMEOUT
            else:
                return ResultType.FAIL

    def goods(self, data, re=False):
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

            return result if (result['dist'] <= 500) else None
        # try:
        canWeGoNextPage = True
        result = self.getContent(data['url'], "//div[@id=\"content\"]")
        el = self.driver.find_element_by_xpath("//div[@id=\"content\"]")
        if el.value_of_css_property("display") == 'none':
            self.driver.quit()
            return

        els = el.find_elements_by_xpath(
            "//ul[contains(@class, 'listInfo') and contains(@class, 'clearfix')]")
        for room in els:
            res = AnalysisRoom(room)
            if res != None:
                res.update(data['addon'])
                self.Data.append(res)
            else:
                canWeGoNextPage = False
                break
        self.driver.quit()

        # TODO handle next page

        # except (TypeError, AttributeError) as te:
        #     print(te)
        #     self.driver.quit()
        #     self.goods(data, True)
        # except Exception as e:
        #     print(e)
        #     self.driver.quit()

    def Start(self, _parameters):
        print(_parameters)
        # for data in ProcessParameter(json.loads(_parameters)):
        for data in ProcessParameter(_parameters):
            self.goods(data)
        self.output()

# c = Crawler()
# c.Start({'kind': [2, 3], 'sex': [1, 3], 'not_cover': 1, 'rentprice': [6000, 8000], 'mrtcoods': [
#         4232, 4231, 4184], 'order': 'nearby', 'orderType': 'desc', 'option': ['broadband'], 'hasimg': 1, 'area': [6]})
