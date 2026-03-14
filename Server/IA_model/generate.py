import argparse
import json
import logging
import random
import re
from pathlib import Path

import nltk
import torch
from PyPDF2 import PdfReader
from tqdm import tqdm
from transformers import GPT2LMHeadModel, GPT2Tokenizer


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "gpt2-finetuned"
DEFAULT_PDF_PATH = BASE_DIR / "Python_Lesson_Dataset.pdf"
PYTHON_KEYWORDS = {
    "python",
    "variable",
    "variables",
    "function",
    "functions",
    "module",
    "modules",
    "import",
    "file",
    "fichier",
    "comment",
    "comments",
    "dictionary",
    "list",
    "tuple",
    "def",
    "open",
}
FRENCH_STOPWORDS = {
    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "de",
    "du",
    "dans",
    "sur",
    "pour",
    "avec",
    "par",
    "et",
    "ou",
    "est",
    "en",
    "que",
    "qui",
    "au",
    "aux",
    "a",
    "d",
    "l",
}
HEURISTIC_QUESTION_BANK = [
    {
        "keywords": ["langage", "programmation", "python"],
        "question": "Qu'est-ce que Python ?",
        "options": [
            "Un framework CSS",
            "Un langage de programmation",
            "Un serveur web",
            "Une base de donnees",
        ],
        "reponse": "B",
    },
    {
        "keywords": ["variable", "signe", "="],
        "question": "Quel symbole est utilise pour affecter une valeur a une variable en Python ?",
        "options": ["=", "==", ":=", "->"],
        "reponse": "A",
    },
    {
        "keywords": ["dictionary", "cle", "valeur"],
        "question": "Quelle structure stocke des paires cle-valeur en Python ?",
        "options": ["List", "Tuple", "Dictionary", "Set"],
        "reponse": "C",
    },
    {
        "keywords": ["def", "fonction"],
        "question": "Quel mot-cle permet de definir une fonction en Python ?",
        "options": ["func", "function", "def", "lambda"],
        "reponse": "C",
    },
    {
        "keywords": ["appelle", "parentheses", "fonction"],
        "question": "Comment execute-t-on une fonction en Python ?",
        "options": [
            "Avec son nom suivi de parentheses",
            "Avec la commande execute",
            "Avec return seulement",
            "Avec le mot-cle call",
        ],
        "reponse": "A",
    },
    {
        "keywords": ["import", "module"],
        "question": "Que fait l'instruction import en Python ?",
        "options": [
            "Elle supprime un fichier",
            "Elle charge un module",
            "Elle cree une variable",
            "Elle compile le code",
        ],
        "reponse": "B",
    },
    {
        "keywords": ["open", "fichier"],
        "question": "Quelle fonction permet d'ouvrir un fichier en Python ?",
        "options": ["read()", "open()", "load()", "file()"],
        "reponse": "B",
    },
    {
        "keywords": ["comment", "#"],
        "question": "Quel symbole est utilise pour un commentaire sur une ligne en Python ?",
        "options": ["//", "#", "/* */", "<!-- -->"],
        "reponse": "B",
    },
]


def ensure_nltk_resources():
    for resource_name, resource_path in (
        ("punkt", "tokenizers/punkt"),
        ("punkt_tab", "tokenizers/punkt_tab/english"),
    ):
        try:
            nltk.data.find(resource_path)
        except LookupError:
            nltk.download(resource_name, quiet=True)


ensure_nltk_resources()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

try:
    tokenizer = GPT2Tokenizer.from_pretrained(str(MODEL_DIR))
    model = GPT2LMHeadModel.from_pretrained(str(MODEL_DIR)).to(device)
    model.eval()
except Exception as exc:
    logging.error("Erreur lors du chargement du modele : %s", exc)
    raise


def nettoyer_question(text):
    text = re.sub(r"\?\s*Options\s*[:：]?", "?", text, flags=re.IGNORECASE)
    text = re.sub(r"Options\s*[:：]?\s*$", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r"\s+([:;,.!?])", r"\1", text)
    text = text.strip(" -:\n\t")
    if text and not text.endswith("?"):
        text = f"{text.rstrip('.')}?"
    return text.strip()


def normalize_text(text):
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9#=:+\-_/ ]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def meaningful_words(text):
    return {
        word
        for word in normalize_text(text).split()
        if len(word) > 2 and word not in FRENCH_STOPWORDS
    }


def extract_pdf_text(pdf_path):
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"Fichier PDF introuvable : {pdf_path}")
    reader = PdfReader(str(pdf_path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def split_into_sentences(text):
    return nltk.sent_tokenize(text)


def build_prompt(sentence):
    return (
        "Tu es un assistant qui genere des QCM sur Python. "
        "Utilise uniquement les informations de la phrase fournie. "
        "Respecte exactement ce format :\n"
        "Question: <question claire>\n"
        "A. <option 1>\n"
        "B. <option 2>\n"
        "C. <option 3>\n"
        "D. <option 4>\n"
        "Reponse: <A|B|C|D>\n"
        f"Phrase: {sentence}\n"
        "Question:"
    )


def extract_options(question_part):
    raw_options = re.findall(
        r"([A-D])\.\s*(.*?)\s*(?=(?:[A-D]\.|Reponse\s*:|$))",
        question_part,
        re.DOTALL | re.IGNORECASE,
    )
    options = {}
    for letter, text in raw_options:
        cleaned = text.strip().replace("\n", " ")
        cleaned = re.sub(r"\s{2,}", " ", cleaned).strip(" -")
        if cleaned:
            options[letter.upper()] = cleaned
    return options


def score_candidate(question_text, options_dict, answer_letter, sentence):
    score = 0
    if len(question_text) >= 20:
        score += 1
    if question_text.endswith("?"):
        score += 1
    if len(options_dict) == 4:
        score += 1
    if len(set(normalize_text(option) for option in options_dict.values())) == 4:
        score += 2
    if answer_letter in options_dict:
        score += 1

    sentence_words = meaningful_words(sentence)
    question_words = meaningful_words(question_text)
    overlap = sentence_words.intersection(question_words)
    if overlap:
        score += min(3, len(overlap))

    correct_option = options_dict.get(answer_letter, "")
    if meaningful_words(correct_option).intersection(sentence_words):
        score += 2

    if any(keyword in normalize_text(sentence) for keyword in PYTHON_KEYWORDS):
        score += 1

    return score


def parse_model_output(generated_text, sentence):
    question_part = generated_text.split("Question:")[-1].strip()
    if not question_part:
        return None

    question_text = question_part.split("A.")[0].strip()
    question_text = nettoyer_question(question_text)
    options_dict = extract_options(question_part)
    match = re.search(r"Reponse\s*:\s*([A-D])", question_part, re.IGNORECASE)
    if not match:
        return None

    answer_letter = match.group(1).upper()
    if len(options_dict) != 4 or answer_letter not in options_dict:
        return None

    return {
        "question": question_text,
        "options": [options_dict[letter] for letter in ["A", "B", "C", "D"]],
        "reponse": answer_letter,
        "score": score_candidate(question_text, options_dict, answer_letter, sentence),
    }


def fallback_question(sentence):
    normalized = normalize_text(sentence)
    best_item = None
    best_score = 0
    for item in HEURISTIC_QUESTION_BANK:
        score = sum(keyword in normalized for keyword in item["keywords"])
        if score > best_score:
            best_score = score
            best_item = item

    if not best_item:
        return None

    return {
        "question": best_item["question"],
        "options": best_item["options"],
        "reponse": best_item["reponse"],
        "matchScore": best_score,
    }


def collect_unique_heuristic_questions(sentences):
    best_by_question = {}
    for sentence in sentences:
        heuristic = fallback_question(sentence)
        if not heuristic or heuristic.get("matchScore", 0) <= 0:
            continue

        key = normalize_text(heuristic["question"])
        current = best_by_question.get(key)
        if not current or heuristic["matchScore"] > current["matchScore"]:
            best_by_question[key] = heuristic

    ranked = sorted(best_by_question.values(), key=lambda item: item["matchScore"], reverse=True)
    for item in ranked:
        item.pop("matchScore", None)
    return ranked


def generate_with_model(sentence, max_attempts=3):
    prompt = build_prompt(sentence)
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(device)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=160,
            temperature=0.65,
            top_k=30,
            top_p=0.88,
            do_sample=True,
            num_return_sequences=max_attempts,
            pad_token_id=tokenizer.eos_token_id,
        )

    candidates = []
    for output in outputs:
        generated_text = tokenizer.decode(output, skip_special_tokens=True)
        parsed = parse_model_output(generated_text, sentence)
        if parsed:
            candidates.append(parsed)

    if not candidates:
        return None

    return max(candidates, key=lambda item: item["score"])


def generate_question_from_sentence(
    sentence,
    max_attempts=3,
    mode="hybrid",
    min_model_score=5,
):
    heuristic_question = fallback_question(sentence)

    if mode == "heuristic":
        if heuristic_question:
            heuristic_question.pop("matchScore", None)
        return heuristic_question

    model_candidate = generate_with_model(sentence, max_attempts=max_attempts)

    if mode == "model":
        if not model_candidate:
            return None
        model_candidate.pop("score", None)
        return model_candidate

    # Hybrid: keep quality stable by accepting model output only above threshold,
    # otherwise fallback to deterministic question bank.
    if model_candidate and model_candidate.get("score", 0) >= min_model_score:
        model_candidate.pop("score", None)
        return model_candidate

    if heuristic_question:
        heuristic_question.pop("matchScore", None)
        return heuristic_question

    if model_candidate:
        model_candidate.pop("score", None)
        return model_candidate

    return None


def filter_sentences(text):
    sentences = []
    for sentence in split_into_sentences(text):
        normalized = normalize_text(sentence)
        if len(normalized) < 30:
            continue
        if not meaningful_words(normalized).intersection(PYTHON_KEYWORDS):
            continue
        sentences.append(sentence.strip())
    return sentences


def main(
    pdf_path=DEFAULT_PDF_PATH,
    nb_questions_voulues=5,
    seed=None,
    mode="hybrid",
    min_model_score=5,
    max_model_sentences=None,
):
    if seed is not None:
        random.seed(seed)
        torch.manual_seed(seed)

    try:
        text = extract_pdf_text(pdf_path)
    except Exception as exc:
        logging.error("Erreur de lecture PDF : %s", exc)
        return []

    sentences = filter_sentences(text)
    random.shuffle(sentences)

    questions = []
    seen_questions = set()

    # Fast path: collect deterministic unique heuristic questions first.
    if mode in {"hybrid", "heuristic"}:
        heuristic_questions = collect_unique_heuristic_questions(sentences)
        for question in heuristic_questions:
            if len(questions) >= nb_questions_voulues:
                break
            question_key = normalize_text(question["question"])
            if question_key in seen_questions:
                continue
            seen_questions.add(question_key)
            questions.append(question)

        if mode == "heuristic" or len(questions) >= nb_questions_voulues:
            return questions

    # Slow path: only if still needed, generate with the model on a limited set.
    if max_model_sentences is None and mode == "hybrid":
        max_model_sentences = max(nb_questions_voulues * 2, 4)

    checked_model_sentences = 0
    for sentence in tqdm(sentences, total=len(sentences), desc="🔄 Progression", ncols=100):
        if len(questions) >= nb_questions_voulues:
            break
        if max_model_sentences is not None and checked_model_sentences >= max_model_sentences:
            break

        heuristic_for_sentence = fallback_question(sentence)
        if heuristic_for_sentence:
            heuristic_key = normalize_text(heuristic_for_sentence["question"])
            if heuristic_key in seen_questions:
                continue

        checked_model_sentences += 1

        question = generate_question_from_sentence(
            sentence,
            mode="model" if mode == "hybrid" else mode,
            min_model_score=min_model_score,
        )
        if not question:
            continue

        question_key = normalize_text(question["question"])
        if question_key in seen_questions:
            continue

        seen_questions.add(question_key)
        questions.append(question)

    return questions


def parse_args():
    parser = argparse.ArgumentParser(description="Genere des QCM a partir d'un PDF Python.")
    parser.add_argument("--pdf", default=str(DEFAULT_PDF_PATH), help="Chemin du fichier PDF")
    parser.add_argument("--count", type=int, default=5, help="Nombre de questions a generer")
    parser.add_argument("--seed", type=int, default=None, help="Seed aleatoire")
    parser.add_argument(
        "--mode",
        choices=["hybrid", "model", "heuristic"],
        default="hybrid",
        help="Strategie de generation des questions",
    )
    parser.add_argument(
        "--min-model-score",
        type=int,
        default=5,
        help="Score minimal pour accepter la sortie du modele en mode hybrid",
    )
    parser.add_argument(
        "--max-model-sentences",
        type=int,
        default=None,
        help="Nombre maximal de phrases a traiter par le modele (mode hybrid)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    result = main(
        pdf_path=args.pdf,
        nb_questions_voulues=args.count,
        seed=args.seed,
        mode=args.mode,
        min_model_score=args.min_model_score,
        max_model_sentences=args.max_model_sentences,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))