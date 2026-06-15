from flask import Flask, render_template, request, jsonify
import tiktoken
import json
from datetime import datetime

app = Flask(__name__)

# OpenAI tokenizer
encoding = tiktoken.get_encoding("cl100k_base")

MAX_CONTEXT = 128000


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/tokenize", methods=["POST"])
def tokenize():

    try:
        data = request.get_json()

        text = data.get("text", "")

        token_ids = encoding.encode(text)

        token_objects = []

        for token_id in token_ids:

            try:
                decoded = encoding.decode([token_id])
            except:
                decoded = ""

            token_objects.append({
                "id": token_id,
                "text": decoded
            })

        context_percentage = round(
            (len(token_ids) / MAX_CONTEXT) * 100,
            2
        )

        response = {
            "success": True,
            "stats": {
                "characters": len(text),
                "words": len(text.split()) if text.strip() else 0,
                "tokens": len(token_ids),
                "context_limit": MAX_CONTEXT,
                "context_used_percentage": context_percentage
            },
            "tokens": token_objects
        }

        return jsonify(response)

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/api/export", methods=["POST"])
def export_json():

    try:

        data = request.get_json()

        text = data.get("text", "")

        token_ids = encoding.encode(text)

        export_data = {
            "generated_at": datetime.utcnow().isoformat(),
            "text": text,
            "token_count": len(token_ids),
            "tokens": token_ids
        }

        return jsonify(export_data)

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/api/health")
def health():

    return jsonify({
        "status": "running",
        "application": "Tokn"
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )