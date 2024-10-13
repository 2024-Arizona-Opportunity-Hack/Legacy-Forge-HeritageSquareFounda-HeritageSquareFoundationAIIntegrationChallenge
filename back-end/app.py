from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

@app.route('/api/query', methods=['POST'])
def query():
    time.sleep(2)
    data = request.get_json()
    query_param = data.get('query')

    response = {
        'response': query_param[::-1]
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5050)
