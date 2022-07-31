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
    print(_parameters)
    if _parameters['type'] == "database":
        m_crawler.output()
    elif _parameters['type'] == "start_crawler":
        m_crawler.Start(_parameters['args'])
    elif _parameters['type'] == "cancel_crawler":
        m_crawler.Stop()
def onNodeInit(_parameters):
    m_crawler.Init(_parameters['chromedriverPath'])
m_crawler = crawler.Crawler()
m_crawler.setEventDelegate(onEvent)
m_crawler.setDatabase(database.Database())
socketIO = SocketIO('127.0.0.1', 3000, LoggingNamespace)
socketIO.on('command', onNodeCommand)
socketIO.on('init', onNodeInit)
socketIO.emit("whoamI", "crawler")
socketIO.wait()
