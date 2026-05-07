@echo off
echo Starting Trust Corner Localhost Server...
echo Please wait, your browser will open automatically to localhost!
start http://localhost:8000
python -m http.server 8000
