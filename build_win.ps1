pip install -r ./requirements.txt
npm install -g pkg
cd .\source\web
npm install
cd ..\..
rm -Recurse "./Build"
md "./Build"
cd "./Build"
md "./bin"
cd ..
pyinstaller --distpath "./Build/bin" -F -n "crawler" "./source/python/main.py"
rm -Recurse "./Build/crawler"
pkg --out-path "./Build/" -t node14-win-x64 "./source/web/."

pause