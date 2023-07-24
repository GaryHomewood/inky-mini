function saveSketch(sketchName, sketchId) {
  var canvas = document.getElementById(sketchId) ;
  // @ts-ignore
  var dataURL = canvas.toDataURL();
  fetch('/api/v1/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'sketchName': sketchName,
      'dataURL': dataURL
    })
  });
}

// --------------------------------------------------------------------------------
// Sketch: jazz triangles
//
new p5(function(p) {
  let canvasContainerId = 'sketch-3'

  p.setup = function() {
    p.createCanvas(250, 122);
    p.noStroke()
    p.angleMode(p.DEGREES)

    let canvasContainer = document.getElementById(canvasContainerId)
    let canvas = canvasContainer.children[0]
    
    // add buttons for redrawing and flashing to the eink display
    p.actions = p.createDiv()
    p.actions.id('actions-1')
    p.actions.class('actions')
    p.actions.parent(canvasContainerId)
    p.buttonRefresh = p.createButton('refresh')
    p.buttonRefresh.class('material-icons mdc-icon-button')
    p.buttonRefresh.parent('actions-1')
    p.buttonRefresh.mousePressed(p.reload)
    p.buttonSave = p.createButton('present_to_all')
    p.buttonSave.class('material-icons mdc-icon-button')
    p.buttonSave.parent('actions-1')
    p.buttonSave.mousePressed(() => saveSketch('jazz-triangles', canvas.id))
  };

  p.draw = function() {
    p.reload()
    p.noLoop()
  };

  p.reload = function() {
    p.push()
      p.background('white');
      let originX = 0
      p.translate(4, p.height / 2);
      let containerW = p.random(10,30)

      while ((originX) < 200) {
        p.push()
          // randomly rotate triangles
          if (Math.round(p.random())) {
            p.translate(containerW, 0)
            p.rotate(180)
          }
          p.push()
            p.translate(0, -52)
            p.drawTri(
              p.random(5, 25), 2,
              containerW, p.random(10, 94),
              0, 102
            )
          p.pop()
        p.pop()
        p.translate(containerW, 0);
        containerW = p.random(20,40)
        originX += containerW
      }
    p.pop()
  };

  p.drawTri = function(x1, y1, x2, y2, x3, y3) {
    // draw the triangle, mostly black fill
    if (p.int(p.random(1, 3)) >= 2) {
      p.fill('red')
    } else {
      p.fill('black')
    }
    p.triangle(x1, y1, x2, y2, x3, y3)

    // side lengths
    const c = p.sqrt(p.pow(p.abs(x1 - x2), 2) + p.pow(p.abs(y1 - y2), 2))
    const a = p.sqrt(p.pow(p.abs(x2 - x3), 2) + p.pow(p.abs(y2 - y3), 2))
    const b = p.sqrt(p.pow(p.abs(x3 - x1), 2) + p.pow(p.abs(y3 - y1), 2))

    // incircle coordinates
    const centerX = ((a * x1) + (b * x2) + (c * x3)) / (a + b + c)
    const centerY = ((a * y1) + (b * y2) + (c * y3)) / (a + b + c)

    // incircle radius
    const perimiter = (a + b + c)
    const s = perimiter / 2
    const incircleRadius = (p.sqrt(s * (s - a) * (s - b) * (s - c))) / s

    // draw the triangles incircle
    p.fill('white')
    p.circle(centerX, centerY, (2 * incircleRadius) - 4)
  };
}, 'sketch-3');

// --------------------------------------------------------------------------------
// Sketch: oblique panels
//
new p5(function(p) {
  let canvasContainerId = 'sketch-2'

  p.setup = function() {
    p.createCanvas(250, 122);
    p.stroke('black')
    p.strokeWeight(1.5)
    p.background('black');

    let canvasContainer = document.getElementById(canvasContainerId)
    let canvas = canvasContainer.children[0]

    // add buttons for redrawing and flashing to the eink display
    p.actions = p.createDiv()
    p.actions.id('actions-2')
    p.actions.class('actions')
    p.actions.parent(canvasContainerId)
    p.buttonRefresh = p.createButton('refresh')
    p.buttonRefresh.class('material-icons mdc-icon-button')
    p.buttonRefresh.parent('actions-2')
    p.buttonRefresh.mousePressed(p.reload)
    p.buttonSave = p.createButton('present_to_all')
    p.buttonSave.class('material-icons mdc-icon-button')
    p.buttonSave.parent('actions-2')
    p.buttonSave.mousePressed(() => saveSketch('oblique-panels', canvas.id))
  };

  p.draw = function() {
    p.reload()
    p.noLoop()
  };

  p.reload = function() {
    p.background('white');

    let x = p.random(1, 10)
    let y = -7
    let poly_width = p.random(1, 7)
    const poly_height = 24

    while (y < 104) {
      while (x < 212) {
        // mostly white fill
        if ((p.random(1, 3)) > 2) {
          if (Math.round(p.random())) {
            p.fill('red')
          } else {
            p.fill('black')
          }
        } else {
          p.fill('white')
        }

        // skew the poly up or down equally random
        if (Math.round(p.random())) {
          const skew = p.random(1, 10)
          p.quad(
            x, y - skew,
            x + poly_width, y + skew,
            x + poly_width, y + poly_height + skew,
            x, y + poly_height - skew
          )
        } else {
          const skew = p.random(1, 10)
          p.quad(
            x, y + skew,
            x + poly_width, y - skew,
            x + poly_width, y + poly_height - skew,
            x, y + poly_height + skew
          )
        }

        x = x + poly_width + p.random(4, 26)
        poly_width = p.random(1, 20)
      }

      x = p.random(1, 10)
      y += poly_height
    }
  };
}, 'sketch-2');

// --------------------------------------------------------------------------------
// Sketch: molecule model
//
new p5(function(p) {
  let canvasContainerId = 'sketch-4'

  p.setup = function() {
    p.createCanvas(250, 122);

    let canvasContainer = document.getElementById(canvasContainerId)
    let canvas = canvasContainer.children[0]
    
    // add buttons for redrawing and flashing to the eink display
    p.actions = p.createDiv()
    p.actions.id('actions-3')
    p.actions.class('actions')
    p.actions.parent(canvasContainerId)
    p.buttonRefresh = p.createButton('refresh')
    p.buttonRefresh.class('material-icons mdc-icon-button')
    p.buttonRefresh.parent('actions-3')
    p.buttonRefresh.mousePressed(p.reload)
    p.buttonSave = p.createButton('present_to_all')
    p.buttonSave.class('material-icons mdc-icon-button')
    p.buttonSave.parent('actions-3')
    p.buttonSave.mousePressed(() => saveSketch('molecule-model', canvas.id))
  };

  p.draw = function() {
    p.reload()
    p.noLoop()
  };

  p.reload = function() {
    p.push()
    p.background('white');
    let loopCount = 0
    const numberOfLoops = 11

    while (loopCount < numberOfLoops) {
      const x1 = p.random(10, 50)
      const y1 = p.random(10, 90)
      const x2 = p.random(10, 50)
      const y2 = p.random(10, 90)
      const x3 = p.random(10, 50)
      const y3 = p.random(10, 90)
      p.drawGroup(x1, y1, x2, y2, x3, y3)
      p.translate(15, 0)
      loopCount++;
    }
    p.pop()
  };

  p.drawGroup = function(x1, y1, x2, y2, x3, y3) {
    p.fill('#ffffff00')
    p.stroke('black')
    p.strokeWeight(1.5)
    p.triangle(x1, y1, x2, y2, x3, y3)
    p.fill('red')
    p.stroke('white')
    p.circle(x1, y1, p.random(10, 20))
    p.fill('black')
    p.stroke('white')
    p.circle(x3, y3, p.random(10,20))
    p.fill('black')
    p.stroke('white')
    p.circle(x2, y2, p.random(10, 20))
  };
}, 'sketch-4');

// --------------------------------------------------------------------------------
// Sketch: scrappy cube rotation
//
new p5(function(p) {
  let canvasContainerId = 'sketch-5'
  let x, y

  p.setup = function() {
    p.createCanvas(250, 122);
    p.fill('#00000000')
    p.stroke('black')
    p.strokeWeight(1.25)
    p.background('white');
    p.angleMode(p.DEGREES)

    let canvasContainer = document.getElementById(canvasContainerId)
    let canvas = canvasContainer.children[0]

    // add buttons for redrawing and flashing to the eink display
    p.actions = p.createDiv()
    p.actions.id('actions-5')
    p.actions.class('actions')
    p.actions.parent(canvasContainerId)
    p.buttonRefresh = p.createButton('refresh')
    p.buttonRefresh.class('material-icons mdc-icon-button')
    p.buttonRefresh.parent('actions-5')
    p.buttonRefresh.mousePressed(p.reload)
    p.buttonSave = p.createButton('present_to_all')
    p.buttonSave.class('material-icons mdc-icon-button')
    p.buttonSave.parent('actions-5')
    p.buttonSave.mousePressed(() => saveSketch('scrappy-cube-rotation', canvas.id))
  };

  p.draw = function() {
    p.reload()
    p.noLoop()
  };

  p.reload = function() {
    p.background('white');

    let lineCount = p.random(3, 5)
    let lineNumber = 0

    while (lineNumber < lineCount) {
      x = -20
      y = 0
      p.push()
      p.translate(p.random(20, 200), 0)
      p.rotate(p.random(60, 120))
      while (x < 212) {
          x += p.random(5, 10)
          p.drawSquare(x)
        }
        p.pop()
        lineNumber++
      }
    };

  p.drawSquare = function(x) {
    let w = p.random(5, p.random(8, 60))
    p.push()
    p.translate(x, y)
    p.rotate(p.random(-40, 40))
    p.rect(-w / 2, -w / 2, w, w)
    p.pop()
  };
}, 'sketch-5');

// --------------------------------------------------------------------------------
// Sketch: overclocked postit notes
//
new p5(function(p) {
  let canvasContainerId = 'sketch-6'
  let xOffset
  let yOffset

  p.setup = function() {
    p.createCanvas(250, 122);
    p.fill('#00000000')
    p.stroke('black')
    p.strokeWeight(1.25)
    p.background('white');
    p.angleMode(p.DEGREES)

    let canvasContainer = document.getElementById(canvasContainerId)
    let canvas = canvasContainer.children[0]

    // add buttons for redrawing and flashing to the eink display
    p.actions = p.createDiv()
    p.actions.id('actions-6')
    p.actions.class('actions')
    p.actions.parent(canvasContainerId)
    p.buttonRefresh = p.createButton('refresh')
    p.buttonRefresh.class('material-icons mdc-icon-button')
    p.buttonRefresh.parent('actions-6')
    p.buttonRefresh.mousePressed(p.reload)
    p.buttonSave = p.createButton('present_to_all')
    p.buttonSave.class('material-icons mdc-icon-button')
    p.buttonSave.parent('actions-6')
    p.buttonSave.mousePressed(() => saveSketch('overclocked-postit-notes', canvas.id))
  };

  p.draw = function() {
    p.push()
    p.reload()
    p.pop()
    p.noLoop()
  };

  p.reload = function() {
    p.background('white');

    let cellX
    let cellY
    let rows = 8
    let cols = 16
    let cellSize = 14.5
    let cellSpacing = p.random(-20, -90);
    
    xOffset = cellSize / 2 + (p.width - (cols * cellSize)) / 2
    yOffset = cellSize / 2 + (p.height - (rows * cellSize)) / 2
    p.translate(xOffset, yOffset);
    
    let angle = 90;
    let s;
    let idx;
    let drawThreshold = p.random();
    
    [...Array(rows)].forEach((val, row) => {
      cellY = cellSize * row;
      [...Array(cols)].forEach((val, col) => {
        drawThreshold = p.random();
        p.strokeWeight(p.random(3, 6))
        idx = row + col * cols
      
        cellX = cellSize * col
        const displace = 0
        if (p.random() > 0.8) {
          p.fill('red')
        } else {
          p.fill('white')
        }
      
        if (p.random() > drawThreshold) {
          s = p.cos(angle) * 1.34;
          p.push()
          p.translate(
            cellX + p.random(-displace, displace), 
            cellY + p.random(-displace, displace)
          )
          p.rotate(p.random(-4, 4))
          p.scale(s)
          p.rect(
            -cellSize/2 + cellSpacing, 
            -cellSize/2 + cellSpacing, 
            cellSize - cellSpacing, 
            cellSize  - cellSpacing
          )
          p.scale(-s)
          p.pop()
        }
        angle += p.random(7, 10)
      })
      angle = p.random(180)
      cellX = 0
      p.translate(0, 0)
    })
  };
}, 'sketch-6');

// --------------------------------------------------------------------------------
// Sketch: Frieder Nacke version
//
new p5((p) => {
  let canvasContainerId = 'sketch-1'

  p.setup = () => {
    p.createCanvas(250, 122);
    p.fill('#00000000')
    p.stroke('black')
    p.strokeWeight(1.25)
    p.background('white');
    p.angleMode(p.DEGREES)

    let canvasContainer = document.getElementById(canvasContainerId)
    let canvas = canvasContainer.children[0]
    
    // add buttons for redrawing and flashing to the eink display
    p.actions = p.createDiv()
    p.actions.id('actions-7')
    p.actions.class('actions')
    p.actions.parent(canvasContainerId)
    p.buttonRefresh = p.createButton('refresh')
    p.buttonRefresh.class('material-icons mdc-icon-button')
    p.buttonRefresh.parent('actions-7')
    p.buttonRefresh.mousePressed(p.reload)
    p.buttonSave = p.createButton('present_to_all')
    p.buttonSave.class('material-icons mdc-icon-button')
    p.buttonSave.parent('actions-7')
    p.buttonSave.mousePressed(() => saveSketch('frieder-nacke-version', canvas.id))

    p.reload()
    p.noLoop()
  };

  p.drawBars = (x, y, w, h, spacing) => {
    for (let xLine = -w/2; xLine < w/2; xLine +=spacing) {
      p.line(xLine, -h, xLine, h)
    }
  }
  
  p.reload = (panelWidth = p.width, panelHeight = p.height) => {
    // Clear the canvas for a new sketch
    // let context = canvas.getContext('2d')
    // context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    
    p.background('white');

    // thin lines
    for (let i = 0; i < 6; i += 1) {
      p.push()
      p.translate(
        p.random(panelWidth * 0.1, panelWidth * 0.9), 
        p.random(panelHeight * 0.25, panelHeight * 0.75) 
      )
      p.rotate(p.radians(p.random([1, -1, 91, 89, 44, 46, -44, -46])))
      p.drawBars(0, 0, p.random(50), p.random(70), p.random([4, 3]))
      p.pop()
    }
    
    // circles
    p.noStroke()
    p.fill('red')
    for (let i = 0; i < 6; i += 1) {
      p.push()
      p.translate(
        p.random(panelWidth * 0.1, panelWidth * 0.9), 
        p.random(panelHeight * 0.25, panelHeight * 0.75) 
      )
      p.circle(0, 0, p.random(10, 40))
      p.pop()
    }
    p.stroke('black')
    p.noFill()
    
    // fat lines
    for (let i = 0; i < 6; i += 1) {
      p.push()
      p.translate(
        p.random(panelWidth * 0.25, panelWidth * 0.75), 
        p.random(panelHeight * 0.25, panelHeight * 0.75) 
      )
      p.rotate(p.radians(p.random([-1, 1,89, 91])))
      let x = p.random(50, 100)
      let y = 0
      p.strokeWeight(p.int(p.random(3, 6)))
      p.line(-x, -y, x, y)
      p.pop()
    }
  }
}, 'sketch-1')
