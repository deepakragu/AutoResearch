import spacy
from spacy.lang.en.stop_words import STOP_WORDS
from spacy_langdetect import LanguageDetector
from spacy.language import Language
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

    clean_up_information()

    # ToDo: Modify below two lines to get better textual summarization or NLG
    word_frequencies, doc_list = get_word_freq()
    compiled_info = compile_information(word_frequencies, doc_list)

    info_to_write = format_information(compiled_info)
    write_output_to_file(info_to_write=info_to_write, filename="summary.txt")
    print("~Summary~")
    print(info_to_write)
    

def clean_up_information(): # Include language filters so only english shows up, non-english texts filtered
    global extracted_data
    global url_list

    for i in range(len(extracted_data)):
        extracted_data[i] = extracted_data[i].split("\t")
        article = extracted_data[i]#.split(". ")
        for j in range(len(article)):
            sentence = article[j]
            extracted_data[i][j] = sentence.replace("<[^>]*>", "").replace("\[[0-9]*\]", "") # remove HTML Tags, square brackets

    nlp = spacy.load('en_core_web_sm')
    Language.factory("language_detector", func= lambda nlp, name : LanguageDetector())
    nlp.add_pipe('language_detector', last=True)
    # nlp.add_pipe('language_detector', last=True)

    doc_list = [[nlp(word) for word in article] for article in extracted_data]
    is_eng_lang = [[word._.language["language"] == "en" for word in article] for article in doc_list]
    print("len(is_eng_lang): ", len(is_eng_lang))
    print("len(doc_list): ", len(doc_list))
    # print("is_eng_lang: ", is_eng_lang)

    # print(doc_list)
    url_list = [url_list[i] for i in range(len(url_list)) if sum(is_eng_lang[i]) >= 0.7*len(is_eng_lang[i])]
    extracted_data = [extracted_data[i] for i in range(len(extracted_data)) if sum(is_eng_lang[i]) >= 0.7*len(is_eng_lang[i])]

    for i in range(len(extracted_data)):
        for j in range(len(extracted_data[i])):
            print(extracted_data[i][j]) 

    # url_list = 


def get_word_freq():
    global extracted_data

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

    # weighted_doc_list = []        
    # for i in range(len(doc_list)):
    #     article = doc_list[i]
    #     sentence_tokens = [sent for sent in article]
    #     sentence_scores = {}
    #     for sent in sentence_tokens:
    #         for word in sent:
    #             if word.text.lower() in word_freq.keys():
    #                 if sent not in sentence_scores.keys():                            
    #                     sentence_scores[sent]=word_freq[word.text.lower()]
    #                 else:
    #                     sentence_scores[sent]+=word_freq[word.text.lower()]
    #     sentence_tokens.sort(key=lambda sent: sentence_scores[sent] if sent in sentence_scores else -1, reverse=True)
    #     weighted_doc_list.append(sentence_tokens)
    
    # compiled_info = []
    # for i in range(len(extracted_data)): 
    #     compiled_info.append(weighted_doc_list[i][min(i, len(weighted_doc_list[i])-1)])

    # return compiled_info




    weighted_doc_list = []       
    sentence_scores = {}
    all_sentences = []

    for i in range(len(doc_list)):
        article = doc_list[i]
        sentence_tokens = [sent for sent in article]
        all_sentences += sentence_tokens
        
        for sent in sentence_tokens:
            for word in sent:
                if word.text.lower() in word_freq.keys():
                    if sent not in sentence_scores.keys():                            
                        sentence_scores[sent]=word_freq[word.text.lower()]
                    else:
                        sentence_scores[sent]+=word_freq[word.text.lower()]

        sentence_tokens.sort(key=lambda sent: sentence_scores[sent] if sent in sentence_scores else -1, reverse=True)
        weighted_doc_list.append(sentence_tokens)
    
    # compiled_info = []
    # for i in range(0.3*len(extracted_data)): 
    #     compiled_info.append(weighted_doc_list[i][min(i, len(weighted_doc_list[i])-1)])

    # return compiled_info

    # print("word_freq: ", word_freq)
    # print("sentence_scores: ", sentence_scores)



    all_sentences.sort(key=lambda sent: sentence_scores[sent] if sent in sentence_scores else -1, reverse=True)
    return all_sentences[0:min(8, len(all_sentences))]















def create_citations() -> list:
    # TODO: Implement method
    global url_list
    return [str(i+1) for i in range(len(url_list))]

def format_information(compiled_info : list) -> str:
    # print("compiled_info: ", compiled_info)
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
