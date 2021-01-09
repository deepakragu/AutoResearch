# Any Variable name can be changed in command line with "variableName=desiredName" additional parameters in command line

folderName = AutoResearch
path = src/main/java/jar

args = ""
testargs = ""

default: test

test:
	#cd $(folderName) && mvn test
	cd $(folderName) && cd $(path) && javac Main.java && java Main $(args)
	cd $(folderName) && cd $(path) && node SearchClientAPI.js
	cd $(folderName) &&  mvn package && java -jar target/AutoResearch-1.0-SNAPSHOT.jar

# Example Usage
# (base) Ragus-MacBook-Pro:AutoResearch deepakragu$ make test args=wug.txt
