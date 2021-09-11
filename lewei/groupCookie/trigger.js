var https = require('https');

exports.nodePostGetRequest = function(HOST, PORT, method, bodydata, callBackFunction, path, cookie) {
    //把将要发送的body转换为json格式 
    var body = bodydata;
    var bodyString = JSON.stringify(body);
    //http 头部
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': bodyString.length,
        'Cookie': cookie
    };

    //用与发送的参数类型
    var options = {
        host: HOST,    //ip
        port: PORT,		//port
        path: path,		//get方式使用的地址
        method: method,	//get方式或post方式
        headers: headers
    };
    var req = https.request(options, function (res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            //这里接收的参数是字符串形式,需要格式化成json格式使用
            var resultObject = responseString
            // console.log('-----resBody-----', resultObject);
            callBackFunction(responseString);
        });

        req.on('error', function (e) {
            // TODO: handle error.
            console.log('-----error-------', e);
        });
    });
    req.write(bodyString);
    req.end();
}

