rm -Recurse "./Build"
md "./Build"
cd "./Build"
md "./bin"
cd ..
pyinstaller --add-data "./source/python/chromedriver.exe;." --distpath "./Build/bin" -F -n "crawler" "./source/python/main.py"
rm -Recurse "./Build/crawler"
pkg --out-path "./Build/" -t node14-win-x64 "./source/web/."