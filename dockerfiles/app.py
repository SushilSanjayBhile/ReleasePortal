from flask import Flask, request
import os

app = Flask(__name__)

@app.route('/createdb', methods = ['POST'])
def createDB():
    file1 = request.files['createdb.sh']
    string = file1.read()

    with open('createdb.sh', 'wb') as w:
        w.write(string)
    w.close()

    os.system("chmod +x createdb.sh")
    os.system("./createdb.sh")
    return "Database Created"

if __name__ == '__main__':
    app.run(host = "0.0.0.0", debug = True)
