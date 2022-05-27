// All assets of the game are defined in the preload

function preload() {
  this.load.image("bug1", "assets/asteroid.png");
  this.load.image("gem", "assets/bomb.png");
  this.load.image("background", "assets/planet.jpg");
  this.load.image("platform", "assets/platform.png");
  this.load.image("codey", "assets/player.png");
  this.load.audio("bgmusic", "assets/bgmusic.mp3");
  this.load.audio("jetpack", "assets/jetpack.wav");
  this.load.audio("lose", "assets/lose.wav");
  this.load.audio("collect", "assets/collect.wav");
  this.load.audio("exp", "assets/exp.wav");
}

// These are the global variables
const gameState = {
  topscore: 0,
  score: 0,
};

function create() {
  // I created here a game object for every asset I have imported
  this.bgmusic = this.sound.add("bgmusic", { volume: 0.4, loop: true });
  this.jetpack = this.sound.add("jetpack", { volume: 0.5 });
  this.collect = this.sound.add("collect", { volume: 0.15 });
  this.lose = this.sound.add("lose");
  this.exp = this.sound.add("exp");
  this.bgmusic.play();

  const myInterval = setInterval(incdif, 1000);

  function incdif() {
    if (bugGenLoop.delay > 150) {
      bugGenLoop.delay -= 10;
    }

    console.log(bugGenLoop.delay);
  }

  this.add.image(200, 100, "background");

  gameState.player = this.physics.add.sprite(225, 450, "codey").setScale(0.5);

  const platforms = this.physics.add.staticGroup();

  platforms.create(225, 490, "platform").setScale(1, 0.3).refreshBody();

  gameState.scoreText = this.add.text(195, 485, "Score: 0", {
    fontSize: "15px",
    fill: "#000000",
  });

  gameState.topscoreText = this.add.text(
    180,
    10,
    `Top score ${gameState.topscore}`,
    {
      fontSize: "15px",
      fill: "#ffffff",
    }
  );

  gameState.player.setCollideWorldBounds(true);

  this.physics.add.collider(gameState.player, platforms);

  gameState.cursors = this.input.keyboard.createCursorKeys();

  const bugs = this.physics.add.group();
  const gems = this.physics.add.group();

  function bugGen() {
    const xCoord = Math.random() * 450;
    bugs.create(xCoord, 10, "bug1").setScale((Math.random() + 0.5) * 2);
  }
  function gemGen() {
    const xCoord = Math.random() * 450;
    gems.create(xCoord, 10, "gem");
  }

  const bugGenLoop = this.time.addEvent({
    delay: 1000,
    callback: bugGen,
    callbackScope: this,
    loop: true,
  });

  const gemGenLoop = this.time.addEvent({
    delay: 5000,
    callback: gemGen,
    callbackScope: this,
    loop: true,
  });

  this.physics.add.collider(gems, gameState.player, (gem) => {
    gameState.score += 30;
    if (!this.collect.isPlaying) {
      this.collect.play();
    }
  });

  this.physics.add.collider(gems, platforms, (gem) => {
    gem.destroy();
    this.exp.play();
    gameState.score -= 500;
    gameState.scoreText.setText(`Score: ${gameState.score}`);
  });

  this.physics.add.collider(bugs, platforms, function (bug) {
    bug.destroy();
    gameState.score += 10;
    gameState.scoreText.setText(`Score: ${gameState.score}`);
  });

  // This is a collider will applied after hitting an asteroid
  this.physics.add.collider(gameState.player, bugs, () => {
    bugGenLoop.destroy();
    gemGenLoop.destroy();
    this.physics.pause();
    this.bgmusic.stop();
    this.jetpack.stop();
    this.lose.play();
    console.log(gameState.score);
    console.log(gameState.topscore);
    if (gameState.score > gameState.topscore) {
      console.log("new topscore");
      gameState.topscore = gameState.score;
      gameState.topscoreText.setText(`Top score: ${gameState.topscore}`);
    }

    this.add.text(180, 250, "Game Over", { fontSize: "15px", fill: "#ffffff" });
    this.add.text(152, 270, "Click to Restart", {
      fontSize: "15px",
      fill: "#ffffff",
    });

    this.input.on("pointerup", () => {
      gameState.score = 0;
      this.bgmusic.stop();
      clearInterval(myInterval);
      this.scene.restart();
    });
  });
}

// This function will trigger every game frame
function update() {
  if (gameState.cursors.left.isDown) {
    gameState.player.setVelocityX(-160);
  } else if (gameState.cursors.right.isDown) {
    gameState.player.setVelocityX(160);
  } else if (gameState.cursors.up.isDown) {
    gameState.player.setVelocityY(-160);
    if (!this.jetpack.isPlaying) {
      this.jetpack.play();
    }
  } else if (gameState.cursors.down.isDown) {
    gameState.player.setVelocityY(160);
    if (!this.jetpack.isPlaying) {
      this.jetpack.play();
    }
  } else {
    gameState.player.setVelocityX(0);
  }
}

// This is a main config of the game screen
const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      enableBody: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);
