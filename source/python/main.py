from datetime import datetime
import crawler.crawler as crawler
import database.database as database
import socketio

def onEvent(event, *args):
    m_socket.emit(event, args)
def log(msg):
    onEvent('log', msg)
m_crawler = crawler.Crawler()
m_crawler.setEventDelegate(onEvent)
m_crawler.setDatabase(database.Database())

m_socket = socketio.Client()
m_socket.connect('http://localhost:3000')

@m_socket.event
def command(_parameters):
    if _parameters['type'] == "database":
        m_crawler.output()
    elif _parameters['type'] == "start_crawler":
        m_crawler.Start(_parameters['args'])
    elif _parameters['type'] == "cancel_crawler":
        m_crawler.Stop()

m_socket.emit("whoamI", "crawler")
m_socket.wait()