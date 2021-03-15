rmdir /s /q "Build"
mkdir "Build"
cd "./Build"
mkdir "bin"
cd ..
pyinstaller --add-data "./source/python/chromedriver.exe;." --distpath "./Build/bin" -F -n "crawler" "./source/python/main.py"
cd "./source/web"
pkg --out-path "../../Build" -t node14-win-x64 .