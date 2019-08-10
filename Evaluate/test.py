import requests
import sys

ip = sys.argv[1]
port = sys.argv[2]
#print ip
#print port
r = requests.post('http://140.113.207.54:8888/evaluate', data = {'ip':'49', 'port':'8545'})

print r.text