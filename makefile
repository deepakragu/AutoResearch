# Any Variable name can be changed in command line with "variableName=desiredName" additional parameters in command line

folderName = AutoResearch
path = AutoResearch/src/main/java/jar

args = ""
testargs = ""

default: test

test:
	#cd $(folderName) && mvn test
	cd $(path) && javac *.java && java testJava $(args)

# Example Usage
# (base) Ragus-MacBook-Pro:AutoResearch deepakragu$ make test args=wug.txt