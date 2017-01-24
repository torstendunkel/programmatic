/*
 * CSS to JS for Grunt
 * git://github.com/mutian/grunt-css-to-js.git
 *
 * Copyright (c) 2015 Mutian Wang
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var b64Map = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
    'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '-', '_'
];

module.exports = function(grunt) {
    grunt.registerMultiTask('css_to_js', 'Convert CSS to JS', function() {
        var options = this.options({
            charset: '@charset "utf-8";',
            baseUrl: '/',       // base url
            baseDir: '.',       // local base dir
            regFn: 'jcssReg',   // js register function
            debug: false        // debug mode
        });

        var fileVersMap = {};

        var processCss = function(gruntRelPath) {
            var outputList = [];
            var importList = [];

            var combine = function(gruntRelPath) {
                var fileContent = grunt.file.read(gruntRelPath);

                // Remove BOM
                fileContent = fileContent.replace(/^\xef\xbb\xbf/, '');

                // Remove comments
                fileContent = fileContent.replace(/\/\*[\s\S]*?\*\//g, '');

                // Remove @charset
                fileContent = fileContent.replace(/@charset[^;]+;\s*/ig, '');

                // Remove whitespace
                fileContent = fileContent.replace(/\s*([\{\}:;,])\s*/g, '$1');

                // Remove space before !important
                fileContent = fileContent.replace(/\s+!important/ig, '!important');

                // Remove last ;
                fileContent = fileContent.replace(/;\}/g, '}');

                // Remove redundant space
                fileContent = fileContent.replace(/\s{2,}/g, ' ');

                // Trim
                fileContent = fileContent.replace(/^\s*(\S+(\s+\S+)*)\s*$/, '$1');

                // Keep @import as a single line
                fileContent = fileContent.replace(/\s*(@import[^;]+;)\s*/ig, '\n$1\n');

                // Process line by line
                fileContent.split('\n').forEach(function(lineCode) {
                    processLine(lineCode, gruntRelPath);
                });
            };

            var processLine = function(lineCode, gruntRelPath) {
                var dirPath = path.dirname(gruntRelPath);
                var importMatch = lineCode.match(/\s*@import\s*?(?: url\(\s*)?([\'\"])?((?!\/)[\w\-\.\/\?=&]+)\1\s*\)?\s*;?/i);
                if (importMatch) {
                    // @import
                    var importPath = path.join(dirPath, importMatch[2]).replace(/\\/g, '/');
                    if (! fs.existsSync(importPath)) {
                        throw new Error(gruntRelPath + ' Error!\n@import file not exist: ' + importPath);
                    }
                    if (importList[importPath]) {
                        // throw new Error(gruntRelPath + ' Error!\n@import a repeat file: ' + importPath);
                        return '';
                    } else {
                        importList.push(importPath);
                        return combine(importPath);
                    }
                } else {
                    // url()
                    lineCode = lineCode.replace(/url\(\s*(['"]?)((?!\/)[\w\-\.\/\?=&]+)(#[\w\-=&]+)?\1\s*\)/ig, function(matchString, quote, staticUrl) {
                        var staticPath = path.join(dirPath, staticUrl.replace(/(\.[A-Za-z0-9]+)(\?[\w\-=&]*)?$/, '$1'));
                        var baseRelUrl = path.relative(options.baseDir, staticPath).replace(/\\/g, '/') + '?v=' + getVersion(staticPath, gruntRelPath);
                        var absUrl = options.baseUrl + baseRelUrl;
                        return matchString.replace(staticUrl, absUrl);
                    });

                    outputList.push(lineCode);
                }
            };

            var getVersion = function(staticPath, cssPath) {
                if (fileVersMap[staticPath]) {
                    return fileVersMap[staticPath];
                }

                var fileVersion = '0';
                if (fs.existsSync(staticPath)) {
                    var fileContent = fs.readFileSync(staticPath);
                    var hexMd5 = crypto.createHash('md5').update(fileContent).digest('hex');
                    // 每16位（4位16进制）为一组，md5的值可分为8组
                    var hexArr = hexMd5.replace(/(\w)(?=(\w{4})+$)/g, '$1-').split('-');
                    var num = null;
                    var ver = [];
                    for (var i in hexArr) {
                        num = parseInt(hexArr[i], 16);
                        ver.push(b64Map[num >> 5 & 0x3F]);  // 取出中间6位转换为64进制
                    }
                    if (! options.debug) {
                        fileVersion = ver.join('');
                    } else {
                        fileVersion = 'debug_' + ver.reverse().join('');
                    }
                } else if (options.debug) {
                    throw new Error(cssPath + ' Error!\nFile not exist: ' + staticPath);
                }

                fileVersMap[staticPath] = fileVersion;
                return fileVersion;
            };

            combine(gruntRelPath);
            return options.charset + outputList.join('');
        };

        var css2js = function(cssContent, filePath) {
            var code = cssContent.replace(/\'/g, "\\'");
            var path = filePath.replace(/^(.*)\.css$/i, '$1');
            return options.regFn + "('" + path + "', '" + code + "');";
        };

        this.files.forEach(function(fileGroup) {
            var dirMode = fileGroup.cwd;
            fileGroup.src.map(function(filePath) {
                var gruntRelPath = (dirMode ? path.join(fileGroup.cwd, filePath) : filePath).replace(/\\/g, '/');
                var destPath = (dirMode ? path.join(fileGroup.dest, filePath) : fileGroup.dest).replace(/^(.*)\.css$/i, '$1.js');
                console.log('css2js:\t' + gruntRelPath);
                var cssContent = processCss(gruntRelPath);
                var jsContent = css2js(cssContent, filePath);
                grunt.file.write(destPath, jsContent);
            });
        });

    });
};