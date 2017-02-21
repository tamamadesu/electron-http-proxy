"use strict";

let http    = require('http');
let connect = require('connect');
let request = require('request');
let url     = require('url');
let fs      = require('fs');
let mime    = require('mime');
let port    = 8000;

function comboRequestList(req,res){

    let parseUrl = url.parse(req.url);

    let list = {
        name: parseUrl.pathname == "/" ? parseUrl.href : parseUrl.pathname.split('/').pop(),
        statusCode: 'pendding',
        statusMessage: '',
        url:parseUrl.href,
        type: mime.lookup(req.url),
        size: 0
    };
    console.log(list);
    return list;
}

function watchProxy(self){

    let app = connect();

    app.use(function(req,res){

        let list = comboRequestList(req,res);

        self.list.push(list);

        let options = {
            url: req.url,
            method: req.method,
            headers: req.headers
        };

        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            console.log(res);
        });

        console.log(req);
        // console.log(res);

        request(options).on('response', function(response) {

            console.log(response);

            // let index = self.list.indexOf(list);
            // self.list[index].status = response.statusCode;
            list.statusCode = response.statusCode;
            list.statusMessage = response.statusMessage;
            list.size = (response.headers['content-length']/1000).toFixed(1) + ' KB';
            
        }).pipe(res);

        // if(options.url.lastIndexOf('.css') !== -1){
        //     let filePath = '*.css';
        //     fs.stat(filePath, function(err, stat){
        //         if(err){ throw err; }
        //         if(!stat.isFile()){
        //           throw new Error('The responder is not a file!');
        //         }

        //         AppRes.statusCode = 200;
        //         AppRes.setHeader('Content-Length', stat.size);
        //         AppRes.setHeader('Content-Type', mime.lookup(filePath));
        //         AppRes.setHeader('Server', 'nproxy');
        //         fs.createReadStream(filePath).pipe(AppRes);
        //     });
        // }else{
        
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
        // }

    });


    let server = http.createServer(function(req, res) {
        app(req, res);
    }).listen(port);

    // server.timeout = 10000;

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
