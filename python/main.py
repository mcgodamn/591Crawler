from datetime import datetime
from socketIO_client_nexus import SocketIO, LoggingNamespace
import crawler.crawler as crawler
import database.database as database


def onEvent(event, *args):
    if event == 'finish':
        socketIO.emit('finish', args)
    elif event == 'progress':
        socketIO.emit('progress', args)


def onNodeCommand(_parameters):
    if _parameters['type'] == "database":
        m_crawler.output()
    elif _parameters['type'] == "start_crawler":
        m_crawler.Start(_parameters['args'])

def onStartCrawing(_parameters):
    # _parameters = '{"kind" : [2,3], "sex": [1,3], "not_cover":1, "rentprice" : [6000,9000], "mrtcoods": [4174,4175,4176,4177,4178,4179,4180,4181,4182,4183,4200,4184,4244,4245,66265,66266,66264,4242,4271,4272,4273],"order":"nearby", "orderType":"desc", "option":["broadband"], "hasimg":1, "area":[6]}'
    # _parameters = '{"kind" : [2,3], "sex": [1,3], "not_cover":1, "rentprice" : [6000,9000], "mrtcoods": [4246,4231,4173,4172],"order":"nearby", "orderType":"desc", "option":["broadband"], "hasimg":1, "area":[6]}'
    # _parameters = '{"kind" : [2], "sex": [1], "not_cover":1, "rentprice" : [6000,20000], "mrtcoods": [4180],"order":"nearby", "orderType":"desc"}'
    m_crawler.Start(_parameters)

m_crawler = crawler.Crawler()
m_crawler.setEventDelegate(onEvent)
m_crawler.setDatabase(database.Database())
socketIO = SocketIO('127.0.0.1', 3000, LoggingNamespace)
socketIO.on('command', onNodeCommand)
socketIO.emit("whoamI", "crawler")
socketIO.wait()
