/**
 * TODO List (In order of highest to lowest priority)
 * Google JSON API
 *    Scrape URLS for 2 levels
 *    Make sure returned URLs are not from same domain as start URL i.e. customsearch.googleapis.com (use string contains method) (also possibly parent URL?) 
 *      Look @ checkDomain if statements (console.log("I got here ... thats not good"))
 * Return URLList
 *    Write URL links to scrape to file
 * Scraping URLs
 *    Look into using "snipped" attribute of returned JSON data (for NLP parser)
 *    Make sure URLs are better matches (i.e. no ads)
 *    More filtering (i.e. probably filter social media websites, make sure we don't scrape two URLs w/ same domain)
 *    Figure out how  to filter out URLs for images and videos
 * Clean Up Code + Delete TODO List
 * Refactor code
 */




// SearchClientAPI.js
// See appendix section of Design Document for purpose and usage
// Code sourced from https://www.scraping-bot.io/how-to-build-a-web-crawler/

const request = require("request");
const util = require("util");
const utilreq = util.promisify(request);
const timeout = util.promisify(setTimeout);
const cheerio = require('cheerio');
const { URL } = require('url');
const fetch = require('node-fetch').default;

let seenLinks = {};

let rootLink = {};
let currentLink = {};

let linksQueue = [];
let printList = [];

let prevDepth = 0;
let maxCrawlingDepth = 5;
let maxLinkQueueSize = 5;

let options = null;
let mainDomain = null;
let mainParsedUrl = null;

class LinkURLObject {
  constructor(linkURL, depth, parent) {
    this.url = linkURL;
    this.depth = depth;
    this.parent = parent;
    this.children = [];
  }
}

let query = "climate+change";
let googleApiKey = "AIzaSyBivkcA_75yfS4lH5OPz5byhik_ce9p5tM";
let googlecx = "a1c32e1f1fd1e7fbf";
let googlecseURL = "https://cse.google.com/cse?cx=a1c32e1f1fd1e7fbf";
let googleCustomSearchAPIURL = "https://customsearch.googleapis.com/customsearch/v1?";
let googleCustomSearchDiscoveryDoc = "http://www.googleapis.com/discovery/v1/apis/customsearch/v1/rest";
let googleNormalSearch = "https://www.google.com/search?q="+query+"&aqs=chrome.0.69i59j0i433j0i395i433j0i395l2j0i395i433j69i60l2.1824j1j7&sourceid=chrome&ie=UTF-8";
let googleCSESearch = googlecseURL+"&key="+googleApiKey+"&q="+query;

let scrapingBotURL = "http://www.scraping-bot.io"


//Start Application put here the adress where you want to start your crawling with
//second parameter is depth with 1 it will scrape all the links found on the first page but not the ones found on other pages
//if you put 2 it will scrape all links on first page and all links found on second level pages be careful with this on a huge website it will represent tons of pages to scrape
// it is recommanded to limit to 5 levels
//crawlBFS(googleCSESearch + "&callback=googleCustomHandler", 1);
//crawlBFS("https://cse.google.com/cse?cx=a1c32e1f1fd1e7fbf&key=AIzaSyBivkcA_75yfS4lH5OPz5byhik_ce9p5tM&q=climate+change" , 1);





crawlBFS(googleCustomSearchAPIURL+"cx="+googlecx+"&key="+googleApiKey+"&q="+query, 1);
// async function someFunc(url, i = 7) {
//   const urlJSON = await fetchAsync(url, i);
//   console.log(urlJSON);
// }

// Async Function for fetch to potentially use to create GET Request to CSE
async function fetchAsync(url, i = 5) {
  // fetch(url)
  // .then(safeParseJSON);
  // .then(data => console.log(data));
  // .then(response => response.json())
  // .then(data => console.log(data));
  let response = await fetch(url);
  let data = await safeParseJSON(response);
  console.log(data[0].link);
}

async function safeParseJSON(response) {
  const body = await response.text();
  try {
      //console.log(JSON.parse(body));
      let data = JSON.parse(body);
      return data.items;
  } catch (err) {
      console.error("Error:", err);
      console.error("Response body:", body);
      // throw err;
      return ReE(response, err.message, 500)
  }
}


//httpGetAsync(googleCSESearch, 1);
function httpGetAsync(theUrl, callback=1)
{
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType = 'json';
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4) {
          if (xmlHttp.status === 200) {
              // check xmlHttp.responseText here;
              console.log(xmlHttp.response);
              console.log("error here1");
          } else {
              console.log(xmlHttp.response);
              console.log("error here2");
          }
          
      }
      //console.log("not error here3");
    };
    console.log("got here1");
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    console.log("got here2");
    xmlHttp.send(null);
    console.log("got here3");
    console.log(xmlHttp);
}


// Loads the JavaScript client library and invokes `start` afterwards.
// gapi.load('client', start);

// Attempting to use Google API Discovery
function start() {
  // Initializes the client with the API key and the Translate API.
  gapi.client.init({
    'apiKey': googleApiKey,
    'discoveryDocs': [googleCustomSearchDiscoveryDoc],
  }).then(function() {
    // Executes an API request, and returns a Promise.
    // The method name `language.translations.list` comes from the API discovery.
    return gapi.client.request({
      path: googlecseURL+"&key="+googleApiKey+"&q="+query
    });
  }).then(function(response) {
    console.log(response.result.data.translations[0].translatedText);
  }, function(reason) {
    console.log('Error: ' + reason.result.error.message);
  });
};





//Handler for GET HTTP Call to Google CSE
async function googleCustomHandler(response) {
  console.log(response);
  for (var i = 0; i < response.items.length; i++) {
    var item = response.items[i];
    console.log(item);
    // in production code, item.htmlTitle should have the HTML entities escaped.
    document.getElementById("content").innerHTML += "<br>" + item.htmlTitle;
    console.log(document.getElementById("content").innerHTML);
  }
  console.log(document.getElementById("content").innerHTML);
}


// //Async function to perform HTTP GET Request in Javascript for Google JSON API
// async function httpGetAsync(theUrl) {
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.onreadystatechange = function() { 
//         if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
//           console.log("an error occurred check the URL" + theUrl);
//         }
//     }
//     xmlHttp.open("GET", theUrl, true); // true for asynchronous 
//     xmlHttp.send(null);
//     return xmlHttp.responseText;
// }

// Online example to use CSE w/ Javascript
// const fetch = require('node-fetch');

// //const apiKey = process.env.CSE_KEY;
// //const cx = process.env.CSE_CX;

// exports.handler = async function(event, context) {
//   let query = event.queryStringParameters.query;
//   if(!query) {
//     return {
//       statusCode: 500,
//       body:'Must pass query parameter in the query string.'
//     }
//   }

//   let start = event.queryStringParameters.start || 1;
//   if(start <= 0 || start > 91) start = 1;

//   let url = googleCSESearch;
//   let resp = await fetch(url);
//   let data = await resp.json();
//   // reduce the result a bit for simplification
//   let result = {};
//   result.info = data.searchInformation;
//   result.info.totalResults = parseInt(result.info.totalResults, 10);
//   result.items = data.items.map(d => {
//     delete d.kind;
//     if(d.pagemap && d.pagemap.cse_thumbnail) {
//       d.thumbnail = { 
//         src: d.pagemap.cse_thumbnail[0].src, 
//         width: d.pagemap.cse_thumbnail[0].width, 
//         height: d.pagemap.cse_thumbnail[0].height
//       } 
//     }
//     delete d.pagemap;
//     delete d.cacheId;
//     return d
//   });

//   return {
//     statusCode: 200,
//     headers : {
//       'Content-Type':'application/json'
//     },
//     body: JSON.stringify(result)
//   }

// }










//your scraping bot credentials
let username = "dragu",
    apiKey = "rbAxm19j9QPy9KxKkrwWGUtg2",
    apiEndPoint = "http://api.scraping-bot.io/scrape/raw-html",
    auth = "Basic " + Buffer.from(username + ":" + apiKey).toString("base64");

let requestOptions = {
  method: 'POST',
  url: apiEndPoint,
  json: {
    url: "this will be replaced in the findLinks function",
    //scraping-bot options
      options: {
          useChrome:false, //if you want to use headless chrome WARNING two api calls wiil be consumed for this option
          premiumProxy:false, //if you want to use premium proxies Unblock Amazon,linkedIn (consuming 10 calls)
      }
  },
  headers: {
      Accept: 'application/json',
      Authorization : auth
  }
}





async function crawlBFS(startURL, maxDepth = 5) {
  console.log("\nquery: " + query);
  console.log("Google Search URL: " + startURL + "\n");
  try {
    mainParsedUrl = new URL(startURL);
  } catch (e) {
    console.log("URL is not valid", e);
    return;
  }

  

  mainDomain = mainParsedUrl.hostname;

  maxCrawlingDepth = maxDepth;
  let startLinkObj = new LinkURLObject(startURL, 0, null);
  rootLink = startLinkObj;


  let response = await fetch(startURL);
  let data = await safeParseJSON(response);
  var i;
  for (i = 0; i < maxLinkQueueSize; i++) {
    let reqLink = checkDomain(data[i].link);
    if (reqLink) {
      if (reqLink != startLinkObj.url) {
        newLinkObj = new LinkURLObject(reqLink, startLinkObj.depth + 1, startLinkObj);
        if (newLinkObj.parent.children.length < maxLinkQueueSize) {
          addToLinkQueue(newLinkObj);
        }
      }
    }
  }
  

  currentLink = getNextInQueue();

  await findLinks(currentLink);

}

//
async function crawl(linkObj) {
  //Add logs here if needed!
  //console.log(`Checking URL: ${options.url}`);
  // if (linkObj.depth > 0 && linkObj.url.match("google")==null) {
  //   return;
  // }
  await findLinks(linkObj);
}

//The goal is to get the HTML and look for the links inside the page.
async function findLinks(linkObj) {
  //lets set the url we wnt to scrape
  //requestOptions.json.url = linkObj.url
  console.log("Scraping URL : " + linkObj.url);
  let response
  try {
    response = await utilreq(linkObj.url); //TODO: Might need to change this line to get the proper request (i.e. HTTP GET if using Google Custom Search Engine API)
    if (response.statusCode !== 200) {
      if (response.statusCode === 401 || response.statusCode === 405) {
        console.log("autentication failed check your credentials");
      } else {
        console.log("an error occurred check the URL" + response.statusCode, response.body);
      }
      return 
    }
    //response.body is the whole content of the page if you want to store some kind of data from the web page you should do it here
    let data = cheerio.load(response.body);
    let links = data('body').find('a').filter(function (i, el) {
      return data(this).attr('href') != null;
    }).map(function (i, x) {
      return data(this).attr('href');
    });
    if (links.length > 0) {
      links.map(function (i, x) {
        let reqLink = checkDomain(x);
        if (reqLink) {
          // console.log("reqLink: " + reqLink);
          // console.log("linkObj.url: " + linkObj.url);
          // if (reqLink != linkObj.url) { // This if statement checks that the link we're adding isn't the same link/domain as the link passed into the function
            newLinkObj = new LinkURLObject(reqLink, linkObj.depth + 1, linkObj);
            if (newLinkObj.parent.children.length < maxLinkQueueSize) { //If statement to limit size of queue
              console.log("Adding link to queue: " + newLinkObj.url);
              addToLinkQueue(newLinkObj);
            // }
          }
        }
      });
    } else {
      console.log("No more links found for " + linkObj.url);
      console.log("response:" + response);
      console.log("data:" + data);
      console.log("links:" + links);
    }
    let nextLinkObj = getNextInQueue();
    if (nextLinkObj && nextLinkObj.depth <= maxCrawlingDepth) {
      //random sleep
      //It is very important to make this long enough to avoid spamming the website you want to scrape
      //if you choose a short time you will potentially be blocked or kill the website you want to crawl
      //time is in milliseconds here
      let minimumWaitTime = 500; //half a second these values are very low on a real worl example you should use at least 30000 (30 seconds between each call) 
      let maximumWaitTime = 5000 //max five seconds
      let waitTime = Math.round(minimumWaitTime + (Math.random() * (maximumWaitTime-minimumWaitTime)));
      console.log("wait for " + waitTime + " milliseconds");
      await timeout(waitTime);
      //next url scraping
      await crawl(nextLinkObj);
    } else {
      setRootLink();
      printTree();
    }
  } catch (err) {
    console.log("Something Went Wrong...", err);
  }
}

//Go all the way up and set RootLink to the parent node
function setRootLink() {
  while (currentLink.parent != null) {
    currentLink = currentLink.parent;
  }
  rootLink = currentLink;
}

function printTree() {
  addToPrintDFS(rootLink);//TODO: Probably change this to empty 
  console.log(printList.join("\n|"));
}

function addToPrintDFS(node) {
  let spaces = Array(node.depth * 3).join("-");
  printList.push(spaces + node.url);
  if (node.children) {
    node.children.map(function (i, x) {
      {
        addToPrintDFS(i);
      }
    });
  }
}

//Check if the domain belongs to the site being checked
function checkDomain(linkURL) {
  let parsedUrl;
  let fullUrl = true;
  try {
    parsedUrl = new URL(linkURL);
  } catch (error) {
    fullUrl = false;
  }
  if (fullUrl === false) {
    console.log("I got here ... thats not good");
    if (linkURL.indexOf("/") === 0) {
      //relative to domain url
      return mainParsedUrl.protocol + "//" + mainParsedUrl.hostname + linkURL.split("#")[0];
    } else if (linkURL.indexOf("#") === 0) {
      //anchor avoid link
      return
    } else {
      //relative url
      let path = currentLink.url.match('.*\/')[0]
      return path + linkURL;
    }
  }

  let mainHostDomain = parsedUrl.hostname;
  console.log("checking if " + mainHostDomain.split(".")[1] + " includes " + mainDomain.split(".")[1]);
  console.log(mainHostDomain.includes(mainDomain));
  

  if (mainDomain != mainHostDomain 
    && mainDomain.split(".")[1] != mainHostDomain.split(".")[1] 
    && !mainHostDomain.includes("youtube") 
    && !mainHostDomain.includes("google")) {
    // console.log("returning Full Link: " + linkURL);
    parsedUrl.hash = "";
    return parsedUrl.href;
  } else {
    return;
  }
}

function addToLinkQueue(linkobj) {
  if (!linkInSeenListExists(linkobj)) {//Add check to ensure domain of link has not yet been seen either to ensure domain variety 
    if (linkobj.parent != null) { //Could add a parameter to linkobj w/ # of children that have been added to queue for capacity purposes
      linkobj.parent.children.push(linkobj); //Update linkobj parameter to show that child has been pushed
    }
    linksQueue.push(linkobj);
    addToSeen(linkobj);
  }
}

function getNextInQueue() {
  let nextLink = linksQueue.shift();
  if (nextLink && nextLink.depth > prevDepth) {
    prevDepth = nextLink.depth;
    console.log(`------- CRAWLING ON DEPTH LEVEL ${prevDepth} --------`);
  }
  return nextLink;
}

function peekInQueue() {
  return linksQueue[0];
}

//Adds links we've visited to the seenList
function addToSeen(linkObj) {
  seenLinks[linkObj.url] = linkObj;
}

//Returns whether the link has been seen.
function linkInSeenListExists(linkObj) {
  return seenLinks[linkObj.url] == null ? false : true;
}