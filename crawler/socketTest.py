# import asyncio
# import websockets


# async def hello(uri):
#     async with websockets.connect(uri) as websocket:
#         await websocket.send("Hello world!")
#         await websocket.recv()

# asyncio.get_event_loop().run_until_complete(
#     hello('ws://localhost:3000'))

from datetime import datetime
from socketIO_client_nexus import SocketIO, LoggingNamespace
import sys


def node_response(*args):
    print(args)

while True:
    with SocketIO('localhost', 3000, LoggingNamespace) as socketIO:
        socketIO.on('node_response', node_response)
        socketIO.emit('python-message', "Hello there")
        socketIO.wait(seconds=1)
