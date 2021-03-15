import json

FILE_NAME = 'database/database.json'

NO_OUTPUT = True

class Database():
    def __init__(self):
        self.m_database = {}
        self.hasLoad = False or NO_OUTPUT

        self.loadDB()

    def getData(self):
        return self.m_database

    def loadDB(self):
        if NO_OUTPUT:
            return

        try:
            with open(FILE_NAME) as json_file:
                self.m_database = json.load(json_file)
                self.hasLoad = True
        except FileNotFoundError:
            pass
        except Exception as e:
            print(e)

    def Save2DB(self, _allData):

        if not self.hasLoad:
            self.loadDB()

        for data in _allData:
            if data['url'] in self.m_database:
                continue
            else:
                self.m_database[data['url']] = data.copy()

        if NO_OUTPUT:
            return

        with open(FILE_NAME, 'w') as outfile:
            json.dump(self.m_database, outfile)
