package jar;


//import org.w3c.dom.Document;

//import javax.lang.model.util.Elements;
//import javax.swing.text.Document;
//import javax.swing.text.Element;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.io.IOException;


// import org.jsoup;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class Scraper {
    //Todo: probably make this a object instead of a main class (i.e. an object that can be created in Main.java)

    public static void main(String[] args) {
        // System.out.println("starting jsoup stuydd");
//         String html = "<html><head><title>First parse</title></head>"
//   + "<body><p>Parsed HTML into a doc.</p></body></html>";
        


        File CWD = new File(System.getProperty("user.dir"));
        // String filename = "sample_article.txt";
        // File file = Paths.get(CWD.getPath(), "src/main/java/jar/" + filename).toFile();
        // if (file == null) {
        //     System.out.println("issue with filename");
        //     return;
        // }
        // if (!file.exists()) {
        //     System.out.println("File does not exist:" + file.toString());
        //     return;

        // }

        // String html;
        // if (!file.isFile()) {
        //     throw new IllegalArgumentException("must be a normal file: " + file.getPath());
        // }
        // try {
        //     html = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
        // } catch (IOException excp) {
        //     throw new IllegalArgumentException(excp.getMessage());
        // }



        // Document doc1 = Jsoup.parse(html);
        // System.out.printf("Title: %s\n", doc1.title());
        // String s1 = doc1.attr("body"); //This line does nothing I think?
        // System.out.printf("Paragraph: %s\n", s1);
        // StringBuilder sb = new StringBuilder();
        // int counter = 0;
        // for (Element e : doc1.select("p")) { //ToDo: Figure out how to parse a JSoup Element
        //     String str = e.toString();
        //     // str.replace("<p>", " ");
        //     str = str.replaceAll("<[^>]*>", ""); //Todo: This is how to clean strings, use for ParagraphNLP 
        //     sb.append("Paragaph " + counter + ": ");
        //     counter++;
        //     sb.append(str + "\n");
        //     //System.out.println(str);
        //     // System.out.printf("Element: %s\n", e);
        // }
        // System.out.println(sb.toString());

//        Document doc = null;
//        try {
//            doc = Jsoup.connect("https://en.wikipedia.org/").get();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        System.out.println(doc.title());
//        Elements newsHeadlines = doc.select("#mp-itn b a");
//        for (Element headline : newsHeadlines) {
//            System.out.println(headline.attr("title") + "\n\t" + headline.absUrl("href"));
//        }

        

        // try {
        //     // Here we create a document object and use JSoup to fetch the website
        //     Document doc = Jsoup.connect("https://www.codetriage.com/?language=Java").get();

        //     // With the document fetched, we use JSoup's title() method to fetch the title
        //     System.out.printf("Title: %s\n", doc.title());

        //     // In case of any IO errors, we want the messages written to the console
        // } catch (IOException e) {
        //     //e.printStackTrace();    
        // }



//        String searchQuery = "Iphone 6s" ;

//        WebClient client = new WebClient();
//        client.getOptions().setCssEnabled(false);
//        client.getOptions().setJavaScriptEnabled(false);
//        try {
//            String searchUrl = "https://newyork.craigslist.org/search/sss?sort=rel&query="
//                    + URLEncoder.encode(searchQuery, "UTF-8");
//            HtmlPage page = client.getPage(searchUrl);
//        }catch(Exception e){
//            e.printStackTrace();
//        }


       ArrayList<String> URLList = readURLFile("urls.txt");
       ArrayList<ArrayList<String>> extractedData = new ArrayList<ArrayList<String>>();
       for (String url: URLList) {
           //System.out.println(url);
           extractedData.add(extractInfo(url));
       }
       writeInfoToFile(extractedData, "scrapedInfo.txt");


    }

    public static ArrayList<String> readURLFile(String filename) {

        File CWD = new File(System.getProperty("user.dir"));

        File file = Paths.get(CWD.getPath(), "src/main/java/jar/" + filename).toFile();
        if (file == null) {
            System.out.println("issue with filename");
            return null;
        }
        if (!file.exists()) {
            System.out.println("File does not exist:" + file.toString());
            return null;

        }

        String s;
        if (!file.isFile()) {
            throw new IllegalArgumentException("must be a normal file: " + file.getPath());
        }
        try {
            s = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
        } catch (IOException excp) {
            throw new IllegalArgumentException(excp.getMessage());
        }

        ArrayList<String> returnList = new ArrayList<String>();

        for (String url: s.split("\n")) {
            returnList.add(url);
        }

        return returnList;

    }

    public static ArrayList<String> extractInfo(String url) {

        Document doc = null;
        try {
            doc = Jsoup.connect(url).get();
        } catch (IOException e) {
            e.printStackTrace();
        }

        ArrayList<String> returnList = new ArrayList<String>();

        for (Element e : doc.select("p")) { //ToDo: Figure out how to parse a JSoup Element
            String str = e.toString();
            // str.replace("<p>", " ");
            str = str.replaceAll("<[^>]*>", "").trim(); //Todo: This is how to clean strings, use for ParagraphNLP 
            // sb.append("Paragaph " + counter + ": ");
            // counter++;
            // sb.append(str + "\n");
            //System.out.println(str);
            // System.out.printf("Element: %s\n", e);
            for (String sentence : str.split("\\. ")) {
                System.out.println(sentence);
                returnList.add(sentence);
            }
        }

        return returnList;

// //        Document doc1 = Jsoup.parse(html);
//         System.out.printf("Title: %s\n", doc.title());
//         String s1 = doc.attr("body"); //This line does nothing I think?
//         System.out.printf("Paragraph: %s\n", s1);
//         StringBuilder sb = new StringBuilder();
//         for (Element e : doc.select("p")) { //ToDo: Figure out how to parse a JSoup Element
//             String str = e.toString();
//             // str.replace("<p>", " ");
//             str = str.replaceAll("<[^>]*>", " ");
//             sb.append(str);
//             //System.out.println(str);
//             // System.out.printf("Element: %s\n", e);
//         }
//         System.out.println(sb.toString());

//         return "";


    }

    public static void writeInfoToFile(ArrayList<ArrayList<String>> infoToWrite, String fileName) {

        StringBuilder sb = new StringBuilder();

        for (ArrayList<String> article : infoToWrite) {
            for (String sentence: article) {
                sb.append(sentence);
                sb.append("\t");
            }
            sb.append("\n");
        }
        sb.deleteCharAt(sb.length()-1);

        File CWD = new File(System.getProperty("user.dir"));
        File writeFile = new File(CWD.getPath(), "src/main/java/jar/" + fileName);
        // writeFile.toFile();
        // writeFil

        if (writeFile == null) {
            System.out.println("issue with filename");
            return;
        }
        if (!writeFile.exists()) {
            try {
                writeFile.createNewFile();
            } catch (IOException excp) {
                System.out.println("Issue creating new file: " + fileName);
            }
            // System.out.println("File does not exist.");
            // return;
        }
        if (!writeFile.isFile()) {
            throw new IllegalArgumentException("must be a normal file: " + writeFile.getPath());
        }
        try {
            Files.write(writeFile.toPath(), sb.toString().getBytes(StandardCharsets.UTF_8));  
            // System.out.println("writing query " + query + " to file " + queryfile.toPath());
        } catch (IOException excp) {
            throw new IllegalArgumentException(excp.getMessage());
        }
        




    } 


}