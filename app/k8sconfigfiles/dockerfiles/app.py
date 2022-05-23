from flask import Flask
app = Flask(__name__)


@app.route('/')
def hello():
    return "This is server to replace pgpass file!"

@app.route('/replace', methods = ['GET', 'POST'])
def replacePgpass():
    if request.method == 'GET':
        fp = open("~/.pgpass", "r")

if __name__ == '__main__':
    app.run(host ='0.0.0.0', port = 5001, debug=True)
