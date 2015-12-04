#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    buffer = require('buffer').Buffer;

var signCont = null,
    signPath = '_signature.txt', //自定义签名
    targetList = process.argv;

fs.exists(signPath, function (bo) {
    signCont = bo ? rFile(signPath) : rFile(path.join(__dirname, 'signature_def.txt'));
    for (var i = 2; i < targetList.length; i++) {
        var filePath = targetList[i],
            stat = fs.statSync(filePath);
        if (stat.isFile()) {
            actFile(filePath, signCont);
        }
        if (stat.isDirectory()) {
            var list = fs.readdirSync(filePath);
            list.forEach(function (item) {
                actFile(path.join(filePath, item), signCont);
            });
        }
    }
});

function rFile(path) {
    return fs.readFileSync(path, {
        encoding: "utf8"
    });
}

function getSuffix(path) {
    var arr = path.split('.');
    return arr[arr.length - 1];
}

function notes(cont, path) {
    var suffix = getSuffix(path);
    if (suffix === 'html') {
        return '<!--\r' + cont + '\r-->\r';
    } else {
        return '/*\r' + cont + '\r*/\r';
    }
}

function actFile(filePath, signCont) {
    fs.readFile(filePath, function (err, data) {
        var finalResult = buffer.concat([new buffer(notes(signCont, filePath)), data]);
        fs.unlinkSync(filePath);
        fs.writeFileSync(filePath, finalResult);
        process.stdout.write('done ! \r\n');
    });
}
