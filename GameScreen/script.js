// Initalize variables
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
let levelComplete = false;
let uploadLevelToServer = false;
let inputInputed = false;
let restartTriggered = false;

// Check for key presses
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key == "w") {
      jumpPressed = true;
    }

    if (event.key == "a") {
      leftPressed = true;
    }

    if (event.key == "d") {
      rightPressed = true;
    }

    if (event.key == "r") {
      restartTriggered = true;
    }
    inputInputed = true;
  },
  false
);

// Check for key ups
document.addEventListener(
  "keyup",
  (event) => {
    if (event.key == "w") {
      jumpPressed = false;
    }

    if (event.key == "a") {
      leftPressed = false;
    }

    if (event.key == "d") {
      rightPressed = false;
    }
  },
  false
);

// Gets click position for level editing
document.getElementById("viewCanvas").addEventListener(
  "pointerdown",
  function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    mouseDown = true;
  },
  false
);

document.getElementById("viewCanvas").addEventListener(
  "pointerup",
  function (event) {
    mouseDown = false;
  },
  false
);

// Gets click position for level editing
document.getElementById("viewCanvas").addEventListener(
  "pointermove",
  function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  },
  false
);

// Gets click position for level editing
var lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    var now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

// Toggles level edit mode
function togglePlaying() {
  if (playing) {
    playing = false;
  } else {
    playing = true;
    playingJustStarted = true;
  }
}

// Manages the canvas
class canvasManager {
  constructor(id) {
    this.canvas = document.getElementById(id);
    this.ctx = viewCanvas.getContext("2d");
    this.scaleFactor = 1;
    this.blockImages = [];
    this.addBlockImage("Block.png");
    this.addBlockImage("Lava.png");
    this.addBlockImage("checkpoint.png");
    this.addBlockImage("finish.png");
  }

  // Adds possible image to be drawn
  addBlockImage(spritePath) {
    this.blockImages.push(document.createElement("img"));
    this.blockImages[this.blockImages.length - 1].src = spritePath;
    document.body.appendChild(this.blockImages[this.blockImages.length - 1]);
    this.blockImages[this.blockImages.length - 1].classList.add("sprite");
  }

  // Scales canvas for screen while maintaining resolution and scale
  scaleCanvas() {
    this.scaleFactor = 1;
    if (window.innerHeight > window.innerWidth * (9 / 16)) {
      this.canvas.width = window.innerWidth * 0.9;
      this.canvas.height = window.innerWidth * 0.9 * (9 / 16);
      this.scaleFactor = (window.innerWidth * 0.9) / 1600;
    } else {
      this.canvas.width = window.innerHeight * 0.9 * (16 / 9);
      this.canvas.height = window.innerHeight * 0.9;
      this.scaleFactor = (window.innerHeight * 0.9) / 900;
    }
    return this.scaleFactor;
  }

  // Draws a sprite
  drawSprite(sprite) {
    this.ctx.drawImage(
      sprite.image,
      sprite.transform.x * this.scaleFactor,
      this.canvas.height -
        sprite.transform.y * this.scaleFactor -
        sprite.transform.height * this.scaleFactor,
      sprite.transform.width * this.scaleFactor,
      sprite.transform.height * this.scaleFactor
    );
  }

  // Draws a block
  drawBlock(block) {
    this.ctx.drawImage(
      this.blockImages[block.type],
      block.transform.x * this.scaleFactor,
      this.canvas.height -
        block.transform.y * this.scaleFactor -
        block.transform.height * this.scaleFactor,
      block.transform.width * this.scaleFactor,
      block.transform.height * this.scaleFactor
    );
  }
}

// Manages game constants
class gameManager {
  constructor(gravity) {
    this.time;
    this.previousTime = performance.now();
    this.gravity = gravity / 50;
  }
}

// Manages levels
class levelManager {
  constructor() {
    this.selectedLevel = 1;
    this.levels = {};
  }

  // Gets a level and loads its values
  loadLevel(level) {
    this.levels[level[0].id] = {};
    this.levels[level[0].id].level = [];
    this.levels[level[0].id].currentSpawnX = level[0].spawnX;
    this.levels[level[0].id].currentSpawnY = level[0].spawnY;
    this.levels[level[0].id].spawnX = level[0].spawnX;
    this.levels[level[0].id].spawnY = level[0].spawnY;
    for (let i = 0; i < level.length - 1; i++) {
      this.levels[level[0].id].level.push(level[i + 1]);
    }
    this.selectedLevel = level[0].id;
  }
}

// Holds sprite information
class sprite {
  constructor(spritePath, transform) {
    this.image = document.createElement("img");
    this.image.src = spritePath;
    document.body.appendChild(this.image);
    this.image.classList.add("sprite");
    this.transform = transform;
  }
}

// Holds position and dimension information
class transform {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

// Provides info about a collision
class collisionInfo {
  constructor(hitTop, hitBottom, hitLeft, hitRight) {
    this.hitTop = hitTop;
    this.hitBottom = hitBottom;
    this.hitLeft = hitLeft;
    this.hitRight = hitRight;
  }
}

// Defines a level
class level {
  constructor(id) {
    this.level = [];
    this.level.push(id);
  }
}

// Removes last edit to level
function undoPlacement() {
  if (!playing) {
    undoLastPlacement = true;
  }
}

// Uploads level to server
function uploadLevelToServerToggle() {
  uploadLevelToServer = true;
}

// Uploads level to server
function uploadLevel(level) {
  let tempLevel = [...level];
  let levelName = window.prompt("Input Level Name", "Level Name");
  let id = 1;
  let spawnx = document.getElementById("levelspawnx").value;
  let spawny = document.getElementById("levelspawny").value;
  tempLevel.unshift({
    id: parseInt(id),
    spawnX: parseInt(spawnx),
    spawnY: parseInt(spawny),
  });
  fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      query: "uploadlevel",
      levelname: levelName + ".json",
      leveldata: tempLevel,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data.text));
}

// Gets level from server
function requestLevel(levelName) {
  fetch("/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({
      query: "requestlevel",
      levelname: levelName + ".json",
    }),
  })
    .then((response) => response.json())
    .then((data) => updateLevelFromServer(data));
}

// Gets a list of possible levels
function levelselect() {
  document.getElementById("game").style.display = "none";
  fetch("/", {
    method: "POST", // or 'PUT'
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({ query: "levelnames" }),
  })
    .then((response) => response.json())
    .then((data) => showList(data));
}

// Updates a level with new edits
function updateLevelFromServer(data) {
  levelFromServer = data;
  levelUpdate = true;
}

// Shows all levels and fastest times
function showList(data) {
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");

  table.appendChild(thead);
  table.appendChild(tbody);

  let row_1 = document.createElement("tr");
  let heading_1 = document.createElement("th");
  heading_1.innerHTML = "Level Name";
  let heading_2 = document.createElement("th");
  heading_2.innerHTML = "Best Time";

  row_1.appendChild(heading_1);
  row_1.appendChild(heading_2);
  thead.appendChild(row_1);
  document.getElementById("leveltable").appendChild(table);
  let rows = [];
  let body = [];
  let buttons = [];
  for (let i = 0; i < data.levelNames.length; i++) {
    rows.push(document.createElement("tr"));
    body.push(document.createElement("td"));
    buttons.push(document.createElement("button"));
    buttons[i].onclick = function () {
      requestLevel(this.innerHTML);
      listenForLevel();
    };
    buttons[i].innerHTML = data.levelNames[i].slice(0, -5);
    buttons[i].classList.add("tablebutton");
    body[i].appendChild(buttons[i]);

    rows[i].appendChild(body[i]);

    thead.appendChild(rows[i]);
  }
}

// Waits for level update
function listenForLevel() {
  const interval = setInterval(function () {
    if (levelUpdate == true) {
      levelUpdate = false;
      start(levelFromServer);
      clearInterval(interval);
    }
  }, 10);
}

// Initializes level
function start(selectedLevel) {
  document.getElementById("game").style.display = "inline";
  document.getElementById("leveltable").style.display = "none";
  // Inits managers
  canvasManager = new canvasManager("viewCanvas");
  gameManager = new gameManager(14);
  levelManager = new levelManager();
  levelManager.loadLevel(selectedLevel);
  gameManager.time = 0;

  // Creates player
  player = new sprite("Player.png", new transform(10, 10, 40, 40));
  player.xVelocity = 0;
  player.yVelocity = 0;

  player.coyoteTime = 0;
  gameManager.speedrunTimer = 0;

  // Kills player
  playerDeath(
    player,
    levelManager.levels[levelManager.selectedLevel].currentSpawnX,
    levelManager.levels[levelManager.selectedLevel].currentSpawnY
  );

  // Starts game loop
  setTimeout(function () {
    update(canvasManager, player, gameManager, levelManager);
  }, 300);
}

// Main loop
function update(canvasManager, player, gameManager, levelManager) {
  updateCounter += 1;

  // Tries to upload level
  if (uploadLevelToServer) {
    uploadLevelToServer = false;
    uploadLevel(levelManager.levels[levelManager.selectedLevel].level);
  }

  // Selects size of block to place
  document.getElementById("sizeselectorvalue").innerHTML =
    "Size: " + document.getElementById("sizeselector").value;
  document.getElementById("typeselectorvalue").innerHTML =
    "Type: " + document.getElementById("typeselector").value;

  if (playingJustStarted) {
    gameManager.previousTime = performance.now();
    playingJustStarted = false;
  }
  // Clears canvas
  canvasManager.ctx.clearRect(
    0,
    0,
    canvasManager.canvas.width,
    canvasManager.canvas.height
  );

  // Scales canvas
  let scaleFactor = canvasManager.scaleCanvas();
  canvasManager.ctx.imageSmoothingEnabled = false;
  if (playing && levelComplete != true) {
    // Play mode
    if (restartTriggered) {
      restartTriggered = false;
      let restarted = restart(player, levelManager, gameManager);
      player = restarted[0];
      levelManager = restarted[1];
      gameManager = restarted[2];
    }

    // Handles deltaTime
    gameManager.time = performance.now();
    gameManager.deltaTime = (gameManager.time - gameManager.previousTime) / 10;
    if (updateCounter % 10 == 0) {
      document.getElementById("fps").innerHTML =
        "FPS: " + Math.round(1000 / (gameManager.deltaTime * 10));
    }
    if (inputInputed && !levelComplete) {
      gameManager.speedrunTimer += gameManager.deltaTime / 100;
    }

    document.getElementById("speedrunTimer").innerHTML =
      "Time: " + Math.round(gameManager.speedrunTimer * 100) / 100;

    // Updates player's position and draws player and blocks
    player = updatePositions(
      player,
      canvasManager.canvas,
      gameManager.deltaTime,
      gameManager.gravity,
      scaleFactor,
      levelManager,
      gameManager
    );
    for (
      let i = 0;
      i < levelManager.levels[levelManager.selectedLevel].level.length;
      i++
    ) {
      canvasManager.drawBlock(
        levelManager.levels[levelManager.selectedLevel].level[i]
      );
    }
    canvasManager.drawSprite(player);
  } else {
    // level edit mode
    let rect = canvasManager.canvas.getBoundingClientRect();
    let blockSize = parseInt(document.getElementById("sizeselector").value);
    let visualBlockSize = blockSize * canvasManager.scaleFactor;
    // Draws blocks
    for (
      let i = 0;
      i < levelManager.levels[levelManager.selectedLevel].level.length;
      i++
    ) {
      canvasManager.drawBlock(
        levelManager.levels[levelManager.selectedLevel].level[i]
      );
    }

    // Provides preview of block placement
    canvasManager.ctx.globalAlpha = 0.5;
    if (typeof screen.orientation != "undefined") {
      canvasManager.ctx.fillRect(
        Math.floor((mouseX - rect.left) / visualBlockSize) * visualBlockSize,
        canvasManager.canvas.height -
          Math.floor(
            (canvasManager.canvas.height - (mouseY - rect.top)) /
              visualBlockSize
          ) *
            visualBlockSize -
          visualBlockSize,
        visualBlockSize,
        visualBlockSize
      );
    }

    canvasManager.ctx.globalAlpha = 1;

    // Undoes last block placement
    if (undoLastPlacement) {
      undoLastPlacement = false;
      levelManager.levels[levelManager.selectedLevel].level.pop();
    }

    // Places new block
    if (mouseDown) {
      let blockData;
      let duplicateBlock = false;
      if (document.getElementById("typeselector").value == 1) {
        let shrinkValue = 0.5;
        blockData = {
          transform: new transform(
            Math.floor(
              ((1 / canvasManager.scaleFactor) * (mouseX - rect.left)) /
                blockSize
            ) *
              blockSize +
              shrinkValue / 2,
            Math.floor(
              ((1 / canvasManager.scaleFactor) *
                (canvasManager.canvas.height - (mouseY - rect.top))) /
                blockSize
            ) *
              blockSize +
              shrinkValue / 2,
            blockSize - shrinkValue,
            blockSize - shrinkValue
          ),
          type: document.getElementById("typeselector").value,
        };
      } else {
        blockData = {
          transform: new transform(
            Math.floor(
              ((1 / canvasManager.scaleFactor) * (mouseX - rect.left)) /
                blockSize
            ) * blockSize,
            Math.floor(
              ((1 / canvasManager.scaleFactor) *
                (canvasManager.canvas.height - (mouseY - rect.top))) /
                blockSize
            ) * blockSize,
            blockSize,
            blockSize
          ),
          type: document.getElementById("typeselector").value,
        };
      }

      // Stops duplicate blocks
      for (
        let i = 0;
        i < levelManager.levels[levelManager.selectedLevel].level.length;
        i++
      ) {
        if (
          JSON.stringify(
            levelManager.levels[levelManager.selectedLevel].level[i]
          ) == JSON.stringify(blockData)
        ) {
          duplicateBlock = true;
        }
      }

      if (!duplicateBlock) {
        levelManager.levels[levelManager.selectedLevel].level.push(blockData);
      }
    }
  }

  gameManager.previousTime = gameManager.time;
  window.requestAnimationFrame(function () {
    update(canvasManager, player, gameManager, levelManager);
  });
}

// Completes level
function levelFinished() {
  levelComplete = true;
  alert("Level Complete");
}

// Restarts level
function restart(player, levelManager, gameManager) {
  inputInputed = false;
  levelManager.levels[levelManager.selectedLevel].currentSpawnX =
    levelManager.levels[levelManager.selectedLevel].spawnX;
  levelManager.levels[levelManager.selectedLevel].currentSpawnY =
    levelManager.levels[levelManager.selectedLevel].spawnY;
  player = playerDeath(
    player,
    levelManager.levels[levelManager.selectedLevel].currentSpawnX,
    levelManager.levels[levelManager.selectedLevel].currentSpawnY
  );
  gameManager.speedrunTimer = 0;
  return [player, levelManager, gameManager];
}

// Kills the player
function playerDeath(player, spawnX, spawnY) {
  player.transform.x = spawnX;
  player.transform.y = spawnY;
  player.xVelocity = 0;
  player.yVelocity = 0;

  return player;
}

// Updates the player position
function updatePositions(
  player,
  canvas,
  deltaTime,
  gravity,
  scaleFactor,
  levelManager,
  gameManager
) {
  //collision and move
  let loops = 50;
  let collisionTopBlocks = [];
  let collisionBottomBlocks = [];
  let collisionLeftBlocks = [];
  let collisionRightBlocks = [];
  let collisionWithCanvasResult;
  // Checks for collisions
  for (let j = 0; j < loops; j++) {
    collisionTopBlocks.length = 0;
    collisionBottomBlocks.length = 0;
    collisionLeftBlocks.length = 0;
    collisionRightBlocks.length = 0;

    collisionWithCanvasResult = collisionWithCanvas(
      player.transform,
      canvas,
      scaleFactor
    );

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
    for (
      let i = 0;
      i < levelManager.levels[levelManager.selectedLevel].level.length;
      i++
    ) {
      let collision = collisionTwoTransforms(
        player.transform,
        levelManager.levels[levelManager.selectedLevel].level[i].transform
      );
      if (collision.hitTop) {
        collisionTopBlocks.push(
          levelManager.levels[levelManager.selectedLevel].level[i]
        );
      }

      if (collision.hitBottom) {
        collisionBottomBlocks.push(
          levelManager.levels[levelManager.selectedLevel].level[i]
        );
      }

      if (collision.hitLeft) {
        collisionLeftBlocks.push(
          levelManager.levels[levelManager.selectedLevel].level[i]
        );
      }

      if (collision.hitRight) {
        collisionRightBlocks.push(
          levelManager.levels[levelManager.selectedLevel].level[i]
        );
      }
    }

    for (let k = 0; k < collisionTopBlocks.length; k++) {
      if (!levelComplete) {
        if (collisionTopBlocks[k].type == 0 && player.yVelocity < 0) {
          player.yVelocity = 0;
        }

        if (collisionTopBlocks[k].type == 1) {
          player = playerDeath(
            player,
            levelManager.levels[levelManager.selectedLevel].currentSpawnX,
            levelManager.levels[levelManager.selectedLevel].currentSpawnY
          );
        }

        if (collisionTopBlocks[k].type == 2) {
          levelManager.levels[levelManager.selectedLevel].currentSpawnX =
            collisionTopBlocks[k].transform.x +
            collisionTopBlocks[k].transform.width / 2 -
            player.transform.width / 2;
          levelManager.levels[levelManager.selectedLevel].currentSpawnY =
            collisionTopBlocks[k].transform.y +
            collisionTopBlocks[k].transform.height / 2 -
            player.transform.height / 2;
        }

        if (collisionTopBlocks[k].type == 3) {
          levelFinished();
        }
      }
    }

    for (let k = 0; k < collisionBottomBlocks.length; k++) {
      if (!levelComplete) {
        if (collisionBottomBlocks[k].type == 0 && player.yVelocity > 0) {
          player.yVelocity = 0;
        }

        if (collisionBottomBlocks[k].type == 1) {
          player = playerDeath(
            player,
            levelManager.levels[levelManager.selectedLevel].currentSpawnX,
            levelManager.levels[levelManager.selectedLevel].currentSpawnY
          );
        }

        if (collisionBottomBlocks[k].type == 2) {
          levelManager.levels[levelManager.selectedLevel].currentSpawnX =
            collisionBottomBlocks[k].transform.x +
            collisionBottomBlocks[k].transform.width / 2 -
            player.transform.width / 2;
          levelManager.levels[levelManager.selectedLevel].currentSpawnY =
            collisionBottomBlocks[k].transform.y +
            collisionBottomBlocks[k].transform.height / 2 -
            player.transform.height / 2;
        }
        if (collisionBottomBlocks[k].type == 3) {
          levelFinished();
        }
      }
    }

    for (let k = 0; k < collisionLeftBlocks.length; k++) {
      if (!levelComplete) {
        if (collisionLeftBlocks[k].type == 0 && player.xVelocity > 0) {
          player.xVelocity = 0;
        }

        if (collisionLeftBlocks[k].type == 1) {
          player = playerDeath(
            player,
            levelManager.levels[levelManager.selectedLevel].currentSpawnX,
            levelManager.levels[levelManager.selectedLevel].currentSpawnY
          );
        }

        if (collisionLeftBlocks[k].type == 2) {
          levelManager.levels[levelManager.selectedLevel].currentSpawnX =
            collisionLeftBlocks[k].transform.x +
            collisionLeftBlocks[k].transform.width / 2 -
            player.transform.width / 2;
          levelManager.levels[levelManager.selectedLevel].currentSpawnY =
            collisionLeftBlocks[k].transform.y +
            collisionLeftBlocks[k].transform.height / 2 -
            player.transform.height / 2;
        }

        if (collisionLeftBlocks[k].type == 3) {
          levelFinished();
        }
      }
    }

    for (let k = 0; k < collisionRightBlocks.length; k++) {
      if (!levelComplete) {
        if (collisionRightBlocks[k].type == 0 && player.xVelocity < 0) {
          player.xVelocity = 0;
        }

        if (collisionRightBlocks[k].type == 1) {
          player = playerDeath(
            player,
            levelManager.levels[levelManager.selectedLevel].currentSpawnX,
            levelManager.levels[levelManager.selectedLevel].currentSpawnY
          );
        }

        if (collisionRightBlocks[k].type == 2) {
          levelManager.levels[levelManager.selectedLevel].currentSpawnX =
            collisionRightBlocks[k].transform.x +
            collisionRightBlocks[k].transform.width / 2 -
            player.transform.width / 2;
          levelManager.levels[levelManager.selectedLevel].currentSpawnY =
            collisionRightBlocks[k].transform.y +
            collisionRightBlocks[k].transform.height / 2 -
            player.transform.height / 2;
        }
        if (collisionRightBlocks[k].type == 3) {
          levelFinished();
        }
      }
    }
    player.transform.x += (deltaTime * player.xVelocity) / loops;
    player.transform.y += (deltaTime * player.yVelocity) / loops;
  }

  player.yVelocity -= gameManager.gravity * deltaTime;

  //Moves player
  if (
    collisionTopBlocks.length > 0 ||
    collisionWithCanvasResult.hitBottom == true
  ) {
    player.coyoteTime = 2;
  } else {
    player.coyoteTime -= 0.2 * gameManager.deltaTime;
  }

  if (player.coyoteTime > 0 && jumpPressed) {
    player.coyoteTime = 0;
    jumpPressed = false;
    player.yVelocity = 8.5;
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

// Handles a collision with the canvas
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

  let collisionInfo1 = new collisionInfo(hitTop, hitBottom, hitLeft, hitRight);
  return collisionInfo1;
}

// Collision between two rectangles
function collisionTwoTransforms(transform1, transform2) {
  let hitTop = false;
  let hitBottom = false;
  let hitRight = false;
  let hitLeft = false;

  if (
    transform1.y <= transform2.y + transform2.height &&
    transform1.y >= transform2.y + (transform2.height - 5) &&
    transform1.x + transform1.width >= transform2.x + 1 &&
    transform1.x <= transform2.x + transform2.width - 1
  ) {
    // Hit top of transform 2
    hitTop = true;
  }

  if (
    transform1.x + transform1.width >= transform2.x &&
    transform1.x + transform1.width <= transform2.x + 5 &&
    transform1.y + transform1.height >= transform2.y + 1 &&
    transform1.y <= transform2.y + transform2.height - 1
  ) {
    // Hit left of transform 2
    hitLeft = true;
  }

  if (
    transform1.x <= transform2.x + transform2.width &&
    transform1.x >= transform2.x + (transform2.width - 5) &&
    transform1.y + transform1.height >= transform2.y + 1 &&
    transform1.y <= transform2.y + transform2.height - 1 - 1
  ) {
    // Hit right of transform 2
    hitRight = true;
  }

  if (
    transform1.y + transform1.height >= transform2.y &&
    transform1.y + transform1.height <= transform2.y + 5 &&
    transform1.x + transform1.width >= transform2.x + 1 &&
    transform1.x <= transform2.x + transform2.width - 1
  ) {
    // Hit botttom of transform 2
    hitBottom = true;
  }

  return new collisionInfo(hitTop, hitBottom, hitLeft, hitRight);
}
