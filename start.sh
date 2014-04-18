
#!/bin/bash

# mjpeg config file is /etc/mjpegconfig 

mkdir /dev/shm/mjpeg &
raspimjpeg &
node /var/node/spacepi/app.js
