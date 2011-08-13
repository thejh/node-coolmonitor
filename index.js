var charm = require('charm')

var WIDTH = 80
var HEIGHT = 25

function Monitor(bgcolor, title, titlecolor) {
  this.title = title
  this.titlecolor = titlecolor
  this.bgcolor = bgcolor
  this.categories = []
  this.listeners = []
  this.nextCategoryRow = 2
}

Monitor.prototype.addCategory = function(name, value, min, max, color, bgcolor, bgcolor2) {
  var line = min.toString()
  var nameBegin = Math.floor((WIDTH-name.length)/2)
  while (line.length < nameBegin) line += ' '
  line += name
  var lineEnd = max.toString()
  while (line.length+lineEnd.length < WIDTH) line += ' '
  line += lineEnd
  
  this.categories.push(
  { name: name
  , value: value
  , min: min
  , max: max
  , color: color
  , bgcolor: bgcolor
  , bgcolor2: bgcolor2
  , line: line
  , row: this.nextCategoryRow
  , border: Math.floor((value - min)/(max - min))
  })
  this.nextCategoryRow += 2
  if (this.listeners.length) throw new Error('addCategory doesnt work when people are connected, sorry')
}

Monitor.prototype.updateValue = function(name, value) {
  var category = this.categories.filter(function(cat){return cat.name===name})[0]
  if (!category) throw new Error("unknown category")
  if (value > category.max || value < category.min) throw new Error("value out of range")
  var oldBorder = Math.floor(WIDTH * (category.value - category.min) / (category.max - category.min))
  var newBorder = Math.floor(WIDTH * (         value - category.min) / (category.max - category.min))
  category.border = newBorder
  category.value = value
  if (oldBorder===newBorder) return
  if (newBorder > oldBorder)
    this._redraw(category, oldBorder, newBorder, category.bgcolor)
  else
    this._redraw(category, newBorder, oldBorder, category.bgcolor2)
}

Monitor.prototype._redraw = function(cat, x1, x2, bgcolor) {
  this.listeners.forEach(function(listener) {
    listener(cat, x1, x2, bgcolor)
  })
}

Monitor.prototype.changeValue = function(name, change) {
  var category = this.categories.filter(function(cat){return cat.name===name})[0]
  if (!category) throw new Error("unknown category")
  this.updateValue(name, category.value+change)
}

Monitor.prototype.addStream = function(streamIn, streamOut) {
  var self = this
  var l
  this.listeners.push(l = function(category, x1, x2, bgcolor) {
    pencil.position(x1, category.row)
    pencil.foreground(category.color)
    pencil.background(bgcolor)
    pencil.write(category.line.slice(x1, x2))
    pencil.position(0, 0)
  })
  streamIn.on('close', function() {
    self.listeners.splice(self.listeners.indexOf(l), 1)
  })
  var pencil = charm(streamOut)
  pencil.background(this.bgcolor)
  pencil.position(WIDTH, HEIGHT)
  pencil.erase('screen')
  pencil.position(Math.floor((WIDTH-this.title.length)/2), 0)
  pencil.foreground(this.titlecolor)
  pencil.write(this.title)
  for (var i=0; i<this.categories.length; i++) {
    var category = this.categories[i]
    pencil.position(0, category.row)
    pencil.foreground(category.color)
    pencil.background(category.bgcolor)
    pencil.write(category.line.slice(0, category.border))
    pencil.background(category.bgcolor2)
    pencil.write(category.line.slice(category.border))
    pencil.position(0, 0)
  }
}

module.exports = Monitor
