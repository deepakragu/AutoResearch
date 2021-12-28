import spacy
from spacy.lang.en.stop_words import STOP_WORDS
import os
import sys
from string import punctuation
from collections import Counter
from heapq import nlargest


url_list = []
extracted_data = []

def paragraph_nlp(extracted_data_filename : str, url_list_filename : str):
    global url_list
    global extracted_data # or nonlocal?
    url_list = read_from_file(path=url_list_filename, root=os.getcwd()).split("\n")
    extracted_data = read_from_file(path=extracted_data_filename, root=os.getcwd()).split("\n")

    word_frequencies, doc_list = clean_up_information()
    compiled_info = compile_information(word_frequencies, doc_list)
    info_to_write = format_information(compiled_info)
    write_output_to_file(info_to_write=info_to_write, filename="summary.txt")
    print("~Summary~")
    print(info_to_write)
    

def clean_up_information():
    global extracted_data

    for i in range(len(extracted_data)):
        extracted_data[i] = extracted_data[i].split("\t")
        article = extracted_data[i]
        for j in range(len(article)):
            sentence = article[j]
            extracted_data[i][j] = sentence.replace("<[^>]*>", "") # remove HTML Tags


    nlp = spacy.load('en_core_web_sm')
    doc_list = [[nlp(word) for word in article] for article in extracted_data]

    keyword = []
    stopwords = list(STOP_WORDS)
    pos_tags = ["PROPN", "ADJ", "NOUN", "VERB"]
    for article in doc_list:
        for sentence in article:
            for word in sentence:
                if word.text.lower() not in stopwords and word.text.lower() not in punctuation and word.pos_ in pos_tags:
                    # print("Here!")
                    keyword.append(word.text)
    word_frequencies = Counter(keyword)
    # print("keyword: ", keyword)
    # print("word_frequencies: ", word_frequencies)
    max_frequency = max(word_frequencies.values())
    for word in word_frequencies.keys():
        word_frequencies[word]=word_frequencies[word]/max_frequency

    return word_frequencies, doc_list


def compile_information(word_freq : dict, cleaned_info : list) -> list:
    global extracted_data

    citation_list = create_citations()


    for i in range(len(extracted_data)):
        article = extracted_data[i]
        for j in range(len(article)):
            sentence = article[j]
            remove_period = sentence[0:len(sentence)-1]

            citation_to_use = citation_list[i]
            extracted_data[i][j] = remove_period + " (" + citation_to_use + ")."

    nlp = spacy.load('en_core_web_sm')
    doc_list = [[nlp(word) for word in article] for article in extracted_data]

    weighted_doc_list = []        
    for i in range(len(doc_list)):
        article = doc_list[i]
        # print("article: ", article)
        sentence_tokens = [sent for sent in article]
        sentence_scores = {}
        for sent in sentence_tokens:
            for word in sent:
                if word.text.lower() in word_freq.keys():
                    if sent not in sentence_scores.keys():                            
                        sentence_scores[sent]=word_freq[word.text.lower()]
                    else:
                        sentence_scores[sent]+=word_freq[word.text.lower()]
        # print("sentence_tokens: ", sentence_tokens)
        # print("sentence_scores: ", sentence_scores)
        sentence_tokens.sort(key=lambda sent: sentence_scores[sent] if sent in sentence_scores else -1, reverse=True)
        weighted_doc_list.append(sentence_tokens)
    
    # print("weighted_doc_list: ", weighted_doc_list)
    compiled_info = []
    for i in range(len(extracted_data)): 
        compiled_info.append(weighted_doc_list[i][min(i, len(weighted_doc_list[i])-1)])

    return compiled_info




def create_citations() -> list:
    # TODO: Implement method
    global url_list
    return [str(i+1) for i in range(len(url_list))]

def format_information(compiled_info : list) -> str:
    print("compiled_info: ", compiled_info)
    formatted_info = []
    for i in range(len(compiled_info)):
        formatted_info.append(compiled_info[i].text)
        if (i%3 == 2):
            formatted_info[len(formatted_info)-1] += "\n\n"
    return " ".join(formatted_info)

def write_output_to_file(filename : str, info_to_write : str):
    write_to_file(info_to_write, path=filename, root=os.getcwd())



def read_from_file(path, root=""):
    "Read file from disk at specified path and return as string"
    with open(os.path.join(root, path), 'r') as read_file:
        return read_file.read()

def write_to_file(contents, path, root=""):
    # try:
    #     with open(os.path.join(root, path), 'x') as open_file:
    #         with open(os.path.join(root, path), 'w') as write_file:
    #             write_file.write(contents + '\n')
    #             write_file.close()
    # except Exception:
    with open(os.path.join(root, path), 'w') as write_file:
        write_file.write(contents + '\n')
        write_file.close()
    return True



if __name__ == '__main__':
    args = list(sys.argv) 
    if (len(args) != 3):
        print("Wrong number of arguments detected")
        exit()
    paragraph_nlp(args[1], args[2])
