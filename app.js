"use strict";

let http      = require('http');
let connect   = require('connect');
let request   = require('request');
let fs        = require('fs');
let mime      = require('mime');
let port      = 8000;

function watchProxy(self){

    let app = connect();


    app.use(function(req,AppRes){

        self.list.push(req.url);
        let options = {
            url: req.url,
            method: req.method,
            encoding:'utf-8',
            headers: req.headers
        };

        if(options.url.lastIndexOf('.css') !== -1){
            let filePath = '*.css';
            fs.stat(filePath, function(err, stat){
                if(err){ throw err; }
                if(!stat.isFile()){
                  throw new Error('The responder is not a file!');
                }

                AppRes.statusCode = 200;
                AppRes.setHeader('Content-Length', stat.size);
                AppRes.setHeader('Content-Type', mime.lookup(filePath));
                AppRes.setHeader('Server', 'nproxy');
                fs.createReadStream(filePath).pipe(AppRes);
            });
        }else{
            request.get(options.url).pipe(AppRes);
            // request.get(options.url,function(error,res,body){
            //     if(error) { console.error(error);}
            //     if(res.headers['content-type'] == 'image/jpeg'){
            //         res.pipe(AppRes);
            //     }else{
            //         AppRes.writeHead(res.statusCode, res.headers);
            //         AppRes.write(body);
            //         AppRes.end();
            //     }
            // });
        }

    });


    let server = http.createServer(function(req, res) {
        req.type = 'http';
        app(req, res);
    }).listen(port);

    console.log("listening on port "+ port);
}



new Vue({
    el: "#app",
    data: {
        list: [],
        data:[]
    },
    mounted:function(){
        watchProxy(this);
    }
});
