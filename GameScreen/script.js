

let levelFromServer;
let levelUpdate = false;
let jumpPressed = false;
let leftPressed = false;
let rightPressed = false;
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
let playing = true;
let undoLastPlacement = false;
let playingJustStarted = false;
let updateCounter = 0;
let uploadLevelToServer = false;
document.addEventListener('keydown', (event) => {
  if (event.key == "w") {
    jumpPressed = true;
  }

  if (event.key == "a") {
    leftPressed = true;
  }

  if (event.key == "d") {
    rightPressed = true;
  }
}, false);

document.addEventListener('keyup', (event) => {
  if (event.key == "w") {
    jumpPressed = false;
  }

  if (event.key == "a") {
    leftPressed = false;
  }

  if (event.key == "d") {
    rightPressed = false;
  }
}, false);

document.getElementById("viewCanvas").addEventListener('pointerdown', function(event) {

  mouseX = event.clientX;
  mouseY = event.clientY;
  mouseDown = true;

}, false);


document.getElementById("viewCanvas").addEventListener('pointerup', function(event) {
  mouseDown = false;
}, false);






document.getElementById("viewCanvas").addEventListener('pointermove', function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  
}, false);


var lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  var now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

function togglePlaying() {
  if (playing) {
    playing = false;
  } else {
    playing = true;
    playingJustStarted = true;
  }




}

class canvasManager {
  constructor(id) {
    this.canvas = document.getElementById(id);
    this.ctx = viewCanvas.getContext('2d');
    this.scaleFactor = 1;
    this.blockImages = [];
    this.addBlockImage("Block.png");
    this.addBlockImage("lava-flow.jpg");
    this.addBlockImage("checkpoint.jpg");

  }

  addBlockImage(spritePath) {
    this.blockImages.push(document.createElement("img"));
    this.blockImages[this.blockImages.length - 1].src = spritePath;
    document.body.appendChild(this.blockImages[this.blockImages.length - 1]);
    this.blockImages[this.blockImages.length - 1].classList.add('sprite');
  }

  scaleCanvas() {
    this.scaleFactor = 1;
    if (window.innerHeight > window.innerWidth * (9 / 16)) {
      this.canvas.width = window.innerWidth * .9;
      this.canvas.height = window.innerWidth * .9 * (9 / 16);
      this.scaleFactor = (window.innerWidth * .9) / 1600;
    } else {
      this.canvas.width = window.innerHeight * .9 * (16 / 9);
      this.canvas.height = window.innerHeight * .9;
      this.scaleFactor = (window.innerHeight * .9) / 900
    }
    return this.scaleFactor;
  }

  drawSprite(sprite) {
    this.ctx.drawImage(sprite.image, sprite.transform.x * this.scaleFactor, this.canvas.height - (sprite.transform.y * this.scaleFactor) - (sprite.transform.height * this.scaleFactor), sprite.transform.width * this.scaleFactor, sprite.transform.height * this.scaleFactor);
  }

  drawBlock(block) {
    this.ctx.drawImage(this.blockImages[block.type], block.transform.x * this.scaleFactor, this.canvas.height - (block.transform.y * this.scaleFactor) - (block.transform.height * this.scaleFactor), block.transform.width * this.scaleFactor, block.transform.height * this.scaleFactor);

  }
}

class gameManager {
  constructor(gravity) {
    this.time;
    this.previousTime = performance.now();
    this.gravity = gravity / 50;
  }
}

class levelManager {
  constructor() {
    this.selectedLevel = 1;
    this.levels = {};
  }


  loadLevel(level) {
    this.levels[level[0].id] = {};
    this.levels[level[0].id].level = [];
    this.levels[level[0].id].currentSpawnX = level[0].spawnX;
    this.levels[level[0].id].currentSpawnY = level[0].spawnY;
    this.levels[level[0].id].spawnX = level[0].spawnX;
    this.levels[level[0].id].spawnY = level[0].spawnY;
    for (let i = 0; i < level.length - 1; i++) {
      this.levels[level[0].id].level.push(level[i + 1])
    }
    this.selectedLevel = (level[0].id);

  }
}

class sprite {
  constructor(spritePath, transform) {
    this.image = document.createElement("img");
    this.image.src = spritePath;
    document.body.appendChild(this.image);
    this.image.classList.add('sprite');
    this.transform = transform;
  }
}

class transform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class collisionInfo {
  constructor(hitTop, hitBottom, hitLeft, hitRight) {
    this.hitTop = hitTop;
    this.hitBottom = hitBottom;
    this.hitLeft = hitLeft;
    this.hitRight = hitRight;
  }
}

class level {
  constructor(id) {
    this.level = [];
    this.level.push(id);
  }
}

function undoPlacement() {
  if (!playing) {
    undoLastPlacement = true;
  }
  
}

function uploadLevelToServerToggle() {
  uploadLevelToServer = true;
}


function uploadLevel(level) {
  let tempLevel = [...level]
  let levelName = window.prompt("Input Level Name","Level Name");
  let id= document.getElementById("levelid").value;
  let spawnx = document.getElementById("levelspawnx").value;
  let spawny = document.getElementById("levelspawny").value;
  tempLevel.unshift({"id":parseInt(id),"spawnX":parseInt(spawnx),"spawnY":parseInt(spawny)})
  fetch("/", {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({ "query": "uploadlevel", "levelname": levelName + ".json" ,"leveldata":tempLevel})
  })
    .then(response => response.json())
    .then(data =>  console.log(data.text));
}
function requestLevel(levelName) {
  
  fetch("/", {
    method: 'POST', // or 'PUT'
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({ "query": "requestlevel", "levelname": levelName + ".json" })
  })
    .then(response => response.json())
    .then(data => updateLevelFromServer(data));
  
}
function levelselect() {
  document.getElementById("game").style.display = "none";
  fetch("/", {
    method: 'POST', // or 'PUT'
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'access-control-allow-origin': '*'
    },
    body: JSON.stringify({ "query": "levelnames" })
  })
    .then(response => response.json())
    .then(data => showList(data));

}

function updateLevelFromServer(data) {
  levelFromServer = data;
  levelUpdate = true;
}
function showList(data) {

  let table = document.createElement('table');
  let thead = document.createElement('thead');
  let tbody = document.createElement('tbody');

  table.appendChild(thead);
  table.appendChild(tbody);

  let row_1 = document.createElement('tr');
  let heading_1 = document.createElement('th');
  heading_1.innerHTML = "Level Name";
  let heading_2 = document.createElement('th');
  heading_2.innerHTML = "Best Time";


  row_1.appendChild(heading_1);
  row_1.appendChild(heading_2);
  thead.appendChild(row_1);
  document.getElementById("leveltable").appendChild(table);
  let rows = [];
  let body = [];
  let buttons = [];
  for (let i = 0; i < data.levelNames.length; i++) {
    rows.push(document.createElement('tr'));
    body.push(document.createElement('td'));
    buttons.push(document.createElement("button"));
    buttons[i].onclick = function() { requestLevel(this.innerHTML); listenForLevel() };
    buttons[i].innerHTML = data.levelNames[i].slice(0, -5);
    buttons[i].classList.add("tablebutton");
    body[i].appendChild(buttons[i]);


    rows[i].appendChild(body[i]);

    thead.appendChild(rows[i]);
  }




}

function listenForLevel() {
  const interval = setInterval(function() {
    if (levelUpdate == true) {
      levelUpdate = false;
      start(levelFromServer);
      clearInterval(interval);
    }
  }, 10);
}



function start(selectedLevel) {
  document.getElementById("game").style.display = "inline";
  document.getElementById("leveltable").style.display = "none";
  canvasManager = new canvasManager("viewCanvas")
  gameManager = new gameManager(14);
  levelManager = new levelManager();
  levelManager.loadLevel(selectedLevel)
  gameManager.time = 0;
  player = new sprite("Player.png", new transform(10, 10, 40, 40))
  player.xVelocity = 0;
  player.yVelocity = 0;

  setTimeout(function() {
    update(canvasManager, player, gameManager, levelManager);
  }, 300);
}

function update(canvasManager, player, gameManager, levelManager) {
  if (uploadLevelToServer) {
    uploadLevelToServer = false;
    uploadLevel(levelManager.levels[levelManager.selectedLevel].level)
  }
  updateCounter+=1;
  document.getElementById("sizeselectorvalue").innerHTML=("Size: " +document.getElementById("sizeselector").value)
  document.getElementById("typeselectorvalue").innerHTML=("Type: " +document.getElementById("typeselector").value)
  if (playingJustStarted) {
    playingJustStarted = false;
    
  }
  canvasManager.ctx.clearRect(0, 0, canvasManager.canvas.width, canvasManager.canvas.height);
  let scaleFactor = canvasManager.scaleCanvas();
  canvasManager.ctx.imageSmoothingEnabled = false;
  if (playing) {
    // play mode
    gameManager.previousTime = gameManager.time;
    gameManager.time = performance.now();
    gameManager.deltaTime = (gameManager.time - gameManager.previousTime) / 10;
    if (updateCounter%10==0) {
      document.getElementById("fps").innerHTML = "FPS: " + Math.round(1000/(gameManager.deltaTime*10))
    }
    
    player = updatePositions(player, canvasManager.canvas, gameManager.deltaTime, gameManager.gravity, scaleFactor, levelManager);
    for (let i = 0; i < levelManager.levels[levelManager.selectedLevel].level.length; i++) {
      canvasManager.drawBlock(levelManager.levels[levelManager.selectedLevel].level[i]);
    }
    canvasManager.drawSprite(player);

  } else {
    // level edit mode
    let rect = canvasManager.canvas.getBoundingClientRect();
    let blockSize = parseInt(document.getElementById("sizeselector").value);
    let visualBlockSize = blockSize * canvasManager.scaleFactor;
    console.log(JSON.stringify(levelManager.levels[levelManager.selectedLevel].level))
    for (let i = 0; i < levelManager.levels[levelManager.selectedLevel].level.length; i++) {
      
      canvasManager.drawBlock(levelManager.levels[levelManager.selectedLevel].level[i]);
    }
    
    canvasManager.ctx.globalAlpha = 0.5;
    if (typeof screen.orientation != 'undefined') {
      canvasManager.ctx.fillRect(Math.floor((mouseX - rect.left) /  visualBlockSize) * visualBlockSize, canvasManager.canvas.height-(Math.floor((canvasManager.canvas.height - (mouseY - rect.top)) / visualBlockSize) *visualBlockSize) -visualBlockSize,  visualBlockSize, visualBlockSize)
    }
    
    canvasManager.ctx.globalAlpha = 1;

    if (undoLastPlacement) {
      undoLastPlacement = false;
      levelManager.levels[levelManager.selectedLevel].level.pop()
    }
    if (mouseDown) {
      
      
      let duplicateBlock = false;

      let blockData = {"transform":new transform(Math.floor((1 / canvasManager.scaleFactor) * (mouseX - rect.left) / blockSize) * blockSize, Math.floor((1 / canvasManager.scaleFactor) * (canvasManager.canvas.height - (mouseY - rect.top)) / blockSize) * blockSize, blockSize, blockSize), "type": (document.getElementById("typeselector").value) };
      

      for (let i = 0; i < levelManager.levels[levelManager.selectedLevel].level.length; i++) {
        if (JSON.stringify(levelManager.levels[levelManager.selectedLevel].level[i]) == JSON.stringify(blockData)) {
          duplicateBlock = true;
        }
      }

      if (!duplicateBlock) {
        levelManager.levels[levelManager.selectedLevel].level.push(blockData);
      }

    }
    

  

    


  
  }



  window.requestAnimationFrame(function() {
    update(canvasManager, player, gameManager, levelManager);
  });
}

function restart(player, levelManager) {
  levelManager.levels[levelManager.selectedLevel].currentSpawnX = levelManager.levels[levelManager.selectedLevel].spawnX;
  levelManager.levels[levelManager.selectedLevel].currentSpawnY = levelManager.levels[levelManager.selectedLevel].spawnY;
  player = playerDeath(player, levelManager.levels[levelManager.selectedLevel].currentSpawnX, levelManager.levels[levelManager.selectedLevel].currentSpawnY)

  return [player, levelManager]
}

function playerDeath(player, spawnX, spawnY) {
  player.transform.x = spawnX;
  player.transform.y = spawnY;
  player.xVelocity = 0;
  player.yVelocity = 0;

  return player;
}



function updatePositions(player, canvas, deltaTime, gravity, scaleFactor, levelManager) {
  //collision and move
  let loops = 50;
  let collisionTopBlocks = [];
  let collisionBottomBlocks = [];
  let collisionLeftBlocks = [];
  let collisionRightBlocks = [];
  let collisionWithCanvasResult;
  for (let j = 0; j < loops; j++) {
    collisionTopBlocks.length = 0;
    collisionBottomBlocks.length = 0;
    collisionLeftBlocks.length = 0;
    collisionRightBlocks.length = 0;

    collisionWithCanvasResult = collisionWithCanvas(player.transform, canvas, scaleFactor);

    if (collisionWithCanvasResult.hitBottom && player.yVelocity < 0) {
      player.yVelocity = 0;
    }

    if (collisionWithCanvasResult.hitTop && player.yVelocity > 0) {
      player.yVelocity = 0;
    }

    if (collisionWithCanvasResult.hitLeft && player.xVelocity < 0) {
      player.xVelocity = 0;
    }

    if (collisionWithCanvasResult.hitRight && player.xVelocity > 0) {
      player.xVelocity = 0;
    }
    for (let i = 0; i < levelManager.levels[levelManager.selectedLevel].level.length; i++) {
      let collision = collisionTwoTransforms(player.transform, levelManager.levels[levelManager.selectedLevel].level[i].transform);
      if (collision.hitTop) {
        collisionTopBlocks.push(levelManager.levels[levelManager.selectedLevel].level[i]);
      }

      if (collision.hitBottom) {
        collisionBottomBlocks.push(levelManager.levels[levelManager.selectedLevel].level[i]);
      }

      if (collision.hitLeft) {
        collisionLeftBlocks.push(levelManager.levels[levelManager.selectedLevel].level[i]);
      }

      if (collision.hitRight) {
        collisionRightBlocks.push(levelManager.levels[levelManager.selectedLevel].level[i]);
      }
    }

    for (let k = 0; k < collisionTopBlocks.length; k++) {
      if (collisionTopBlocks[k].type == 0 && player.yVelocity < 0) {
        player.yVelocity = 0;
      }

      if (collisionTopBlocks[k].type == 1) {
        player = playerDeath(player, levelManager.levels[levelManager.selectedLevel].currentSpawnX, levelManager.levels[levelManager.selectedLevel].currentSpawnY)

      }

      if (collisionTopBlocks[k].type == 2) {
        levelManager.levels[levelManager.selectedLevel].currentSpawnX = collisionTopBlocks[k].transform.x + (collisionTopBlocks[k].transform.width / 2) - (player.transform.width / 2)
        levelManager.levels[levelManager.selectedLevel].currentSpawnY = collisionTopBlocks[k].transform.y + (collisionTopBlocks[k].transform.height / 2) - (player.transform.height / 2)
      }

    }

    for (let k = 0; k < collisionBottomBlocks.length; k++) {
      if (collisionBottomBlocks[k].type == 0 && player.yVelocity > 0) {
        player.yVelocity = 0;
      }

      if (collisionBottomBlocks[k].type == 1) {
        player = playerDeath(player, levelManager.levels[levelManager.selectedLevel].currentSpawnX, levelManager.levels[levelManager.selectedLevel].currentSpawnY)
      }

      if (collisionBottomBlocks[k].type == 2) {
        levelManager.levels[levelManager.selectedLevel].currentSpawnX = collisionBottomBlocks[k].transform.x + (collisionBottomBlocks[k].transform.width / 2) - (player.transform.width / 2)
        levelManager.levels[levelManager.selectedLevel].currentSpawnY = collisionBottomBlocks[k].transform.y + (collisionBottomBlocks[k].transform.height / 2) - (player.transform.height / 2)
      }
    }



    for (let k = 0; k < collisionLeftBlocks.length; k++) {
      if (collisionLeftBlocks[k].type == 0 && player.xVelocity > 0) {
        player.xVelocity = 0;
      }

      if (collisionLeftBlocks[k].type == 1) {
        player = playerDeath(player, levelManager.levels[levelManager.selectedLevel].currentSpawnX, levelManager.levels[levelManager.selectedLevel].currentSpawnY)
      }

      if (collisionLeftBlocks[k].type == 2) {
        levelManager.levels[levelManager.selectedLevel].currentSpawnX = collisionLeftBlocks[k].transform.x + (collisionLeftBlocks[k].transform.width / 2) - (player.transform.width / 2)
        levelManager.levels[levelManager.selectedLevel].currentSpawnY = collisionLeftBlocks[k].transform.y + (collisionLeftBlocks[k].transform.height / 2) - (player.transform.height / 2)
      }
    }

    for (let k = 0; k < collisionRightBlocks.length; k++) {
      if (collisionRightBlocks[k].type == 0 && player.xVelocity < 0) {
        player.xVelocity = 0;
      }

      if (collisionRightBlocks[k].type == 1) {
        player = playerDeath(player, levelManager.levels[levelManager.selectedLevel].currentSpawnX, levelManager.levels[levelManager.selectedLevel].currentSpawnY)
      }

      if (collisionRightBlocks[k].type == 2) {
        levelManager.levels[levelManager.selectedLevel].currentSpawnX = collisionRightBlocks[k].transform.x + (collisionRightBlocks[k].transform.width / 2) - (player.transform.width / 2)
        levelManager.levels[levelManager.selectedLevel].currentSpawnY = collisionRightBlocks[k].transform.y + (collisionRightBlocks[k].transform.height / 2) - (player.transform.height / 2)
      }
    }
    player.transform.x += deltaTime *player.xVelocity / loops;
    player.transform.y += deltaTime * player.yVelocity / loops;


  }

  player.yVelocity -= gravity * deltaTime;

  //manage input
  if (jumpPressed && (collisionTopBlocks.length > 0 || collisionWithCanvasResult.hitBottom == true)) {

    jumpPressed = false;
    player.yVelocity = 8.1;
  }

  if (rightPressed) {
    player.xVelocity = 3.4;
  }

  if (leftPressed) {
    player.xVelocity = -3.4;
  }

  if (!leftPressed && !rightPressed) {
    player.xVelocity = 0;
  }
  return player;
}

function collisionWithCanvas(transform1, canvas, scaleFactor) {
  let hitTop = false;
  let hitBottom = false;
  let hitLeft = false;
  let hitRight = false;

  if (transform1.y < 0) {
    // Hit bottom of canvas
    hitBottom = true;
  }

  if (transform1.y + transform1.height > canvas.height * (1 / scaleFactor)) {
    // Hit top of canvas
    hitTop = true;
  }

  if (transform1.x < 0) {
    // Hit left of canvas
    hitLeft = true;
  }

  if (transform1.x + transform1.width > canvas.width * (1 / scaleFactor)) {
    // Hit right of canvas
    hitRight = true;
  }

  let collisionInfo1 = new collisionInfo(hitTop, hitBottom, hitLeft, hitRight)
  return collisionInfo1;
}

function collisionTwoTransforms(transform1, transform2) {
  let hitTop = false;
  let hitBottom = false;
  let hitRight = false;
  let hitLeft = false;

  if (transform1.y <= transform2.y + transform2.height && transform1.y >= transform2.y + (transform2.height - 5) && transform1.x + transform1.width >= transform2.x + 1 && transform1.x <= transform2.x + transform2.width - 1) {
    // Hit top of transform 2
    hitTop = true;
  }

  if (transform1.x + transform1.width >= transform2.x && transform1.x + transform1.width <= transform2.x + 5 && transform1.y + transform1.height >= transform2.y + 1 && transform1.y <= transform2.y + transform2.height - 1) {
    // Hit left of transform 2
    hitLeft = true;
  }

  if (transform1.x <= transform2.x + transform2.width && transform1.x >= transform2.x + (transform2.width - 5) && transform1.y + transform1.height >= transform2.y + 1 && transform1.y <= transform2.y + transform2.height - 1 - 1) {
    // Hit right of transform 2
    hitRight = true;
  }

  if (transform1.y + transform1.height >= transform2.y && transform1.y + transform1.height <= transform2.y + 5 && transform1.x + transform1.width >= transform2.x + 1 && transform1.x <= transform2.x + transform2.width - 1) {
    // Hit botttom of transform 2
    hitBottom = true;
  }

  return new collisionInfo(hitTop, hitBottom, hitLeft, hitRight);
}



