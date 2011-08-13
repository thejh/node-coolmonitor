var http = require('http')
var os = require('os')
var Monitor = require('./index')
var monitor = new Monitor('black', 'CONNECTION STATISTICS', 'white')
monitor.addCategory("RANDOM", Math.random(), 0, 1, 'white', 'green', 'red')
monitor.addCategory("connected people", 0, 0, 80, 'white', 'green', 'red')

setInterval(function() {
  monitor.updateValue("RANDOM", Math.random())
}, 1000)

var looperValue = 0
monitor.addCategory("LOOPER", looperValue, 0, 100, 'red', 'white', 'black')
setInterval(function() {
  looperValue+=1
  if (looperValue === 101) looperValue = 0
  monitor.updateValue("LOOPER", looperValue)
}, 100)

monitor.addCategory("CPU", 0, 0, 1, 'white', 'green', 'red')
setInterval(function() {
  monitor.updateValue("CPU", os.loadavg()[0])
}, 100)

http.createServer(function (req, res) {
  res.writeHead(200)
  monitor.addStream(req, res)
  monitor.changeValue('connected people', 1)
  req.on('close', function() {
    monitor.changeValue('connected people', -1)
  })
}).listen(1232)
