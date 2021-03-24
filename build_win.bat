pip install -r "./requirements.txt"
npm install --save-dev -g pkg
rmdir /s /q "./Build"
mkdir "./Build"
cd "./Build"
mkdir "./bin"
cd ..
pyinstaller --add-data "./source/python/chromedriver.exe;." --distpath "./Build/bin" -F -n "crawler" "./source/python/main.py"
rmdir /s /q "./Build/crawler"
pkg --out-path "./Build/" -t node14-win-x64 "./source/web/."