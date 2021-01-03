import java.nio.charset.StandardCharsets;
import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.File;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;



public class testJava {

    public static void main(String[] args) {
        File CWD = new File(System.getProperty("user.dir"));
        if (args.length > 1) {
            System.out.println("Please provide a single filename");
            return;
        }
        
        File file = Paths.get(CWD.getPath(), args[0]).toFile();
        if (file == null) {
            System.out.println("issue with filename");
            return;
        }
        if (!file.exists()) {
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

    }

}