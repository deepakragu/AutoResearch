folderName = AutoResearch
path = AutoResearch/src/main/java/jar

args = ""
testargs = ""

default: test

test:
	#cd $(folderName) && mvn test
	cd $(path) && javac *.java && java testJava $(args)