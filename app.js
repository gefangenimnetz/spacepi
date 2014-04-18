var express = require('express');
var fs = require('fs');
var app = express();

app.use(express.static(__dirname + '/public'));

// Listen for the mjpeg stream request and send JPEG chunks to client.
app.get('/stream.mjpeg', function(request, res){
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=--jpegboundary',
        'Cache-Control': 'no-cache',
        'Connection': 'close',
        'Pragma': 'no-cache'
    });

    var connectionClosed = false;
    res.connection.on('close', function() { connectionClosed = true; });

    var sendjpeg = function(){
        if(connectionClosed){
            console.log("Connection has been closed");
            return;
        }
        fs.readFile('/dev/shm/mjpeg/cam.jpg', function(err, content){
            if (err) throw err;
            res.write("--jpegboundary\r\n");
            res.write("Content-Type: image/jpeg\r\n");
            res.write("Content-Length: " + content.length + "\r\n");
            res.write("\r\n");
            res.write(content, 'binary');
            res.write("\r\n");
            setTimeout(sendjpeg, 100); //10 fps 
        })
    };
    sendjpeg();
});

//XHR interface to recaive variuous commands
var fifopath = 'FIFO';
app.get('/xhr/camera', function(req, res){
    var command = req.param('cmd');
    console.log(command);

    var fifostream = fs.createWriteStream(fifopath, {'flags': 'a'});
    fifostream.end(command);
    fifostream.on('error', function (err) {
        console.log(err);
        res.send(500);
        return;
    });
    
    res.send(200);
});

var server = app.listen(3000, function(){
    console.log('Listening on port %d', server.address().port);
});
