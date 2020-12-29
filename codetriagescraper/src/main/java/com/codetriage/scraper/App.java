package com.codetriage.scraper;

import java.io.IOException;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

/**
 * Copied from java-web-scraper. For more insight into how to use JSoup on a website, refer to App.java in that package
 * Link: https://github.com/ro6ley/java-web-scraper
 */

public class App {

  public static void main(String[] args) {
    testMethod1();
  }

  static void testMethod1() {
    try {
        // Here we create a document object and use JSoup to fetch the website
        Document doc = Jsoup.connect("https://www.codetriage.com/?language=Java").get();
 
        // With the document fetched, we use JSoup's title() method to fetch the title
        System.out.printf("Title: %s\n", doc.title());
 
      // In case of any IO errors, we want the messages written to the console
      } catch (IOException e) {
        e.printStackTrace();
      }
  }
}
