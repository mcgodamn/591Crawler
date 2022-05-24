import crawler
import sys, os

test_args = {
    "kind": [ '2' ],
    "sex": [ '1' ],
    "patternMore": [ '1' ],
    "rentprice": [ '', '10000' ],
    "mrtcoods": [
        '4200', '4184',
        '4221', '4231',
        '4232', '4233',
        '4234'
    ],
    "distance": [ 0, 500 ]
}

# def resource_path(relative_path):
#     if hasattr(sys, '_MEIPASS'):
#         return os.path.join(sys._MEIPASS, relative_path)
#     return os.path.join(os.path.abspath("."), relative_path)
# print(resource_path("chromedriver.exe"))
m_crawler = crawler.Crawler()
m_crawler.setEventDelegate(lambda e, *arg: print(e))
m_crawler.startCrawler(test_args)