import argparse
import json
from pathlib import Path

from generate import DEFAULT_PDF_PATH, main as generate_questions, normalize_text


BASE_DIR = Path(__file__).resolve().parent
REFERENCE_PATH = BASE_DIR / "reference_questions_python.json"


def load_references():
    return json.loads(REFERENCE_PATH.read_text(encoding="utf-8"))


def option_for_answer(question):
    answer_letter = question.get("reponse", "").upper()
    options = question.get("options", [])
    index_map = {"A": 0, "B": 1, "C": 2, "D": 3}
    if answer_letter not in index_map:
        return ""
    index = index_map[answer_letter]
    if index >= len(options):
        return ""
    return options[index]


def match_reference(question, references):
    question_text = normalize_text(question.get("question", ""))
    answer_text = normalize_text(option_for_answer(question))
    best_reference = None
    best_score = 0
    for reference in references:
        keyword_score = sum(keyword in question_text for keyword in reference["keywords"])
        answer_score = sum(
            normalize_text(expected) == answer_text or normalize_text(expected) in answer_text
            for expected in reference["acceptedAnswers"]
        )
        score = keyword_score * 10 + answer_score * 5
        if score > best_score:
            best_score = score
            best_reference = reference
    return best_reference if best_score > 0 else None


def is_structurally_valid(question):
    options = question.get("options", [])
    if len(options) != 4:
        return False
    if len(set(normalize_text(option) for option in options)) != 4:
        return False
    if not question.get("question") or len(question["question"].strip()) < 12:
        return False
    if question.get("reponse") not in {"A", "B", "C", "D"}:
        return False
    return True


def is_answer_correct(question, reference):
    answer_text = normalize_text(option_for_answer(question))
    return any(normalize_text(expected) == answer_text for expected in reference["acceptedAnswers"])


def evaluate_run(questions, references):
    evaluated = []
    for question in questions:
        structure_ok = is_structurally_valid(question)
        reference = match_reference(question, references)
        answer_ok = bool(reference) and is_answer_correct(question, reference)
        evaluated.append(
            {
                "question": question["question"],
                "options": question["options"],
                "reponse": question["reponse"],
                "predictedAnswerText": option_for_answer(question),
                "structureOk": structure_ok,
                "referenceId": reference["id"] if reference else None,
                "answerOk": answer_ok,
            }
        )
    return evaluated


def summarize(all_runs):
    total_questions = sum(len(run) for run in all_runs)
    if total_questions == 0:
        return {
            "totalQuestions": 0,
            "validStructureRate": 0,
            "matchedReferenceRate": 0,
            "answerAccuracyOnAll": 0,
            "answerAccuracyOnMatched": 0,
        }

    structure_ok = sum(item["structureOk"] for run in all_runs for item in run)
    matched_reference = sum(item["referenceId"] is not None for run in all_runs for item in run)
    answer_ok = sum(item["answerOk"] for run in all_runs for item in run)

    return {
        "totalQuestions": total_questions,
        "validStructureRate": round(structure_ok / total_questions, 4),
        "matchedReferenceRate": round(matched_reference / total_questions, 4),
        "answerAccuracyOnAll": round(answer_ok / total_questions, 4),
        "answerAccuracyOnMatched": round(answer_ok / matched_reference, 4) if matched_reference else 0,
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate the Python QCM generation model.")
    parser.add_argument("--pdf", default=str(DEFAULT_PDF_PATH), help="PDF source path")
    parser.add_argument("--runs", type=int, default=5, help="Number of evaluation runs")
    parser.add_argument("--count", type=int, default=5, help="Questions generated per run")
    parser.add_argument("--seed", type=int, default=42, help="Base seed")
    parser.add_argument(
        "--mode",
        choices=["hybrid", "model", "heuristic"],
        default="hybrid",
        help="Generation strategy used by generate.py",
    )
    parser.add_argument(
        "--min-model-score",
        type=int,
        default=5,
        help="Minimum accepted model score in hybrid mode",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    references = load_references()
    all_runs = []
    for run_index in range(args.runs):
        questions = generate_questions(
            pdf_path=args.pdf,
            nb_questions_voulues=args.count,
            seed=args.seed + run_index,
            mode=args.mode,
            min_model_score=args.min_model_score,
        )
        all_runs.append(evaluate_run(questions, references))

    payload = {
        "config": {
            "mode": args.mode,
            "minModelScore": args.min_model_score,
        },
        "summary": summarize(all_runs),
        "runs": all_runs,
    }
    print(json.dumps(payload, indent=2, ensure_ascii=False))