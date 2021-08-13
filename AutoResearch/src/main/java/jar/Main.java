//package jar;


import java.nio.charset.StandardCharsets;
import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.File;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;



public class Main {

    public static void main(String[] args) {
        //TODO: Clean up code, be consistent with errors/returns

        File CWD = new File(System.getProperty("user.dir"));
        if (args.length > 1) {
            System.out.println("Please provide a single filename");
            return;
        }
        
        File file = Paths.get(CWD.getPath(),"src/main/java/jar/" +  args[0]).toFile(); //ToDo: check if the extra 'src/main...' string is needed
        if (file == null) {
            System.out.println("issue with filename");
            return;
        }
        if (!file.exists()) {
            System.out.println();
            System.out.println(file.getPath());
            System.out.println("File does not exist.");
            return;

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
        System.out.println(s);

        //TODO: More syntax/parsing & intent deducing i.e. remove unneccessary words (what, the, etc.) and symbols (., ?, "", etc.)
        s = s.replace(" ", "+");
        System.out.println("replaced spaces with concat (+): " + s);
        
        //TODO: Write to query.txt
        File queryfile = new File(CWD.getPath(), "src/main/java/jar/" + "query.txt"); //ToDo: check if the extra 'src/main...' string is needed

        String [] queries = s.split("\n");

        for (String query : queries) {
            
            if (queryfile == null) {
                System.out.println("issue with filename");
                return;
            }
            if (!queryfile.exists()) {
                System.out.println("File does not exist.");
                return;
            }
            if (!queryfile.isFile()) {
                throw new IllegalArgumentException("must be a normal file: " + queryfile.getPath());
            }
            try {
                Files.write(queryfile.toPath(), ((String) query).getBytes(StandardCharsets.UTF_8)); 
            } catch (IOException excp) {
                throw new IllegalArgumentException(excp.getMessage());
            }
            System.out.println("writing query " + query + " to file query.txt");
            //TODO: Some type of javascript method call to prevent (over)writing all queries to file immediately
        }
        

    }

}