// SearchClientAPI.js
// See appendix section of Design Document for purpose and usage
// Code sourced from https://www.scraping-bot.io/how-to-build-a-web-crawler/


const request = require("request");
const util = require("util");
const utilreq = util.promisify(request);
const timeout = util.promisify(setTimeout);
const cheerio = require('cheerio');
const { URL } = require('url');

let seenLinks = {};

let rootLink = {};
let currentLink = {};

let linksQueue = [];
let printList = [];

let prevDepth = 0;
let maxCrawlingDepth = 5;

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
    //scraing-bot options
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

//Start Application put here the adress where you want to start your crawling with
//second parameter is depth with 1 it will scrape all the links found on the first page but not the ones found on other pages
//if you put 2 it will scrape all links on first page and all links found on second level pages be careful with this on a huge website it will represent tons of pages to scrape
// it is recommanded to limit to 5 levels
crawlBFS("https://www.scraping-bot.io/", 1);

async function crawlBFS(startURL, maxDepth = 5) {
  try {
    mainParsedUrl = new URL(startURL);
  } catch (e) {
    console.log("URL is not valid", e);
    return;
  }

  mainDomain = mainParsedUrl.hostname;

  maxCrawlingDepth = maxDepth;
  startLinkObj = new LinkURLObject(startURL, 0, null);
  rootLink = currentLink = startLinkObj;
  addToLinkQueue(currentLink);
  await findLinks(currentLink);
}

//
async function crawl(linkObj) {
  //Add logs here if needed!
  //console.log(`Checking URL: ${options.url}`);
  await findLinks(linkObj);
}

//The goal is to get the HTML and look for the links inside the page.
async function findLinks(linkObj) {
  //lets set the url we wnt to scrape
  requestOptions.json.url = linkObj.url
  console.log("Scraping URL : " + linkObj.url);
  let response
  try {
    response = await utilreq(requestOptions);
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
          if (reqLink != linkObj.url) {
            newLinkObj = new LinkURLObject(reqLink, linkObj.depth + 1, linkObj);
            addToLinkQueue(newLinkObj);
          }
        }
      });
    } else {
      console.log("No more links found for " + requestOptions.url);
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
  addToPrintDFS(rootLink);
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

  if (mainDomain == mainHostDomain) {
    //console.log("returning Full Link: " + linkURL);
    parsedUrl.hash = "";
    return parsedUrl.href;
  } else {
    return;
  }
}

function addToLinkQueue(linkobj) {
  if (!linkInSeenListExists(linkobj)) {
    if (linkobj.parent != null) {
      linkobj.parent.children.push(linkobj);
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