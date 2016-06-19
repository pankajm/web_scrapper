/**
 * Created by pankaj on 6/19/16.*/

/*
 ************ All Modules required to run this app ************
 */

var http = require('http');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var app = express();

// ************************************************************** //

// ****** creating Node server ***** //

var server = app.listen(8087, function() {
    console.log('Server listning on port 8087');
});

// ******************* Entry point of the app ******************* //

app.get('/crawlWeb', crawlWeb);

// ************************************************ //

var linksVisited = {};
var linksToVisit = ["https://medium.com"];
var externalLinksArray = [];
var callbackCount = 0; // to track number of callbacks returned

function crawlWeb(req, res) {
    visitFirstPage(req, res);
}


/**
 * First function to crawl the home page of website
 * @param req {Object}
 * @param res {Object}
 * @returns {*|ServerResponse}
 */
function visitFirstPage(req, res) {

    if(linksToVisit.length) {
        var url = linksToVisit.pop();
        if (!linksVisited[url]) {
            crawlThePage(url, function (error, response) {
                if(error){
                    console.log(error);
                    return res.send({flag:144, log:'operation Failed'});
                }
                callbackCount--;
                startScrapping(function(err, response){
                    if(err){
                        console.log(err);
                        return res.send({flag:144, log:'operation Failed'});
                    }
                    console.log("External Links are "+externalLinksArray);
                    console.log("Done with scrapping");
                    exportCsv(function(err, response){
                        return res.send({flag:143, log:'operation Successfull'});
                    });
                });
            });
        }
        else {
            visitFirstPage();
        }
    }
    else{
        console.log('Done with scrapping');
        return res.send({flag:143, log:'operation Successfull'});
    }
}

/**
 * This function is called after the first page is crawlled. This function is called recursively untill the stack of links in not empty. We havent used async library here
 * so the calles are getting triggered and the callback count is used to track number of callbacks returned.
 * @param callback
 */
function startScrapping(callback){

    for(var i = 0; i < 5 && linksToVisit.length != 0; i++){
        var url = linksToVisit.pop();
        if(!linksVisited[url])
            crawlThePage(url, function(){
                callbackCount--;
                if(callbackCount == 0)
                    startScrapping(callback);
            })
    }
    if(linksToVisit.length == 0)
        callback(null);
}

/**
 * Function to crawl the url and store domain links as well as external world link on the page in two seperate arrays
 * @param url {String}
 * @param callback
 */
function crawlThePage(url, callback){

    console.log('crawling page '+url);
    callbackCount++;
    request(url, function(error, response, body){
        if (error) {
            console.log(error);
            return callback(error);
        }
        else {
            var $ = cheerio.load(body);

            // get all medium.com domain links to crawl

            var domainLinks = $("a[href^='https://medium.com']");

            domainLinks.each(function(){
                linksToVisit.push($(this).attr('href'));
            });

            // get all external world + medium.com links

            var externalLinks = $("a[href^='http']");

            externalLinks.each(function(){
                externalLinksArray.push($(this).attr('href'));
            });
            linksVisited[url] = true;
            callback();
        }
    });
}

/**
 * Function to export the external links array into csv
 * @param cb
 */
function exportCsv(cb){

    var fileName = 'hyperlinks.csv';
    var tempArray = [];
    var csvContents = [];

    // Breaking array elements into group of 10 elements per line to make csv readable.

    for(var i = 0; i < externalLinksArray.length; i++){
        tempArray.push(externalLinksArray[i]);
        if(i%10 == 0) {
            csvContents.push(tempArray.join(','));
            tempArray = [];
        }
    }
    fs.writeFile(fileName, csvContents.join('\n'), function (err, data) {
        if (err) {
            console.log('Error while writing file');
            console.log(err);
            return cb(err);
        }
        else {
            console.log('Success Writing csv file');
            return cb(null);
        }
    });
}