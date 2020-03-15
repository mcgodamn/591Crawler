import json
FILE_NAME = 'database.json'
m_database = {}

hasLoad = False

def loadDB():
    try:
        with open(FILE_NAME) as json_file:
            m_database = json.load(json_file)
    except FileNotFoundError:
        pass
    except Exception as e:
        print(e)

def Save2DB(_allData):
    global hasLoad, m_database
    if not hasLoad:
        loadDB()
        hasLoad = True

    for data in _allData:
        if data['url'] in m_database:
            continue
        else:
            m_database[data['url']] = data.copy()
    with open(FILE_NAME, 'w') as outfile:
        json.dump(m_database, outfile)