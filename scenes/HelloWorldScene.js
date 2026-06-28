// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super('hello-world');
  }

  init(data) {
    this.score = 0;
    this.timeLeft = 30;
    this.activeBoxes = [];
    this.currentTickItems = [];
    this.currentTickCollected = false;
    this.dropSpeedMultiplier = data.dropSpeedMultiplier || 1;
    this.sumFallenNumbers = 0;
    this.collectedThisFrame = [];
    this.collectionQueued = false;
    this.playerCollectedThisFrame = [];
    this.netCollectedThisFrame = [];
    this.collectEffects = [];
  }

  preload() {
    this.load.image('baldosas', 'assetas/baldosas.png');
    this.load.image('hamburguesa', 'assetas/ham.png');
    this.load.image('pj', 'assetas/pj.png');
    this.load.image('suma', 'assetas/suma.png');
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'baldosas').setDisplaySize(width, height);

    this.player = this.add.image(width / 2, height - 40, 'pj').setDisplaySize(96, 57.6);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(false);
    this.player.body.setImmovable(true);
    this.player.body.setSize(96, 57.6);

    this.net = this.add.rectangle(width / 2, height - 58, width, 8, 0xffffff).setVisible(false);
    this.physics.add.existing(this.net);
    this.net.body.setAllowGravity(false);
    this.net.body.setImmovable(true);
    this.net.body.setSize(width, 8);

    this.boxes = this.physics.add.group();

    this.scoreText = this.add.text(16, 16, 'Puntaje: 0', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });

    this.timerText = this.add.text(16, 50, 'Tiempo: 30', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
    });

    this.spawnPair();
    this.startTickTimer();
    this.startCountdown();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.overlap(this.player, this.boxes, this.collectBox, null, this);
    this.physics.add.overlap(this.net, this.boxes, this.collectBox, null, this);
  }

  update() {
    const speed = 200;
    const body = this.player.body;

    if (this.cursors.left.isDown) {
      body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(speed);
    } else {
      body.setVelocityX(0);
    }

    this.net.body.reset(this.player.x, this.player.y + 20);

    this.activeBoxes.forEach((item) => {
      if (item.text && item.box) {
        item.text.setPosition(item.box.x, item.box.y);
      }
      if (item.box && item.box.y > this.scale.height + 40) {
        this.removeBox(item.box);
      }
    });

    this.collectEffects = this.collectEffects.filter((effect) => {
      if (!effect.active) {
        return false;
      }
      if (effect.y > this.scale.height + 80 || effect.x < -80 || effect.x > this.scale.width + 80) {
        effect.destroy();
        return false;
      }
      return true;
    });
  }

  spawnPair() {
    this.clearCurrentBoxes();
    this.currentTickItems = [];
    this.currentTickCollected = false;

    const { width } = this.scale;
    const minX = 80;
    const maxX = width - 80;
    const minDistance = 64 + 5;

    let x1 = Phaser.Math.Between(minX, maxX);
    let x2 = Phaser.Math.Between(minX, maxX);
    while (Math.abs(x2 - x1) < minDistance) {
      x2 = Phaser.Math.Between(minX, maxX);
    }

    const value1 = Phaser.Math.Between(1, 9);
    const value2 = Phaser.Math.Between(1, 9);

    this.createNumberBox(x1, value1);
    this.createNumberBox(x2, value2);
  }

  createNumberBox(x, value) {
    const y = -40;
    const box = this.add.image(x, y, 'hamburguesa').setDisplaySize(64, 64);
    this.physics.add.existing(box);
    box.body.setAllowGravity(false);
    box.body.setVelocityY(70 * this.dropSpeedMultiplier);
    box.body.setImmovable(true);
    box.body.setSize(64, 64);
    box.value = value;
    box.setDepth(1);

    const text = this.add.text(x, y, `${value}`, {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ff0000',
    }).setOrigin(0.5).setDepth(2);

    const item = {
      box,
      text,
      value,
      collected: false,
      removed: false,
    };

    this.boxes.add(box);
    this.activeBoxes.push(item);
    this.currentTickItems.push(item);
    this.sumFallenNumbers += value;
  }

  collectBox(collector, box) {
    if (!box.active) {
      return;
    }

    const item = this.activeBoxes.find((entry) => entry.box === box);
    if (!item || item.collected) {
      return;
    }

    const source = collector === this.net ? 'net' : 'player';
    item.collected = true;
    item.collectionSource = source;
    if (this.currentTickItems.includes(item)) {
      this.currentTickCollected = true;
    }

    this.collectedThisFrame.push(item);
    if (source === 'net') {
      this.netCollectedThisFrame.push(item);
    } else {
      this.playerCollectedThisFrame.push(item);
      this.spawnSumEffect(item.box.x, item.box.y, item.box.body.velocity);
    }

    if (!this.collectionQueued) {
      this.collectionQueued = true;
      this.time.addEvent({
        delay: 0,
        callback: this.flushCollectedBoxes,
        callbackScope: this,
      });
    }
  }

  spawnSumEffect(x, y, velocity) {
    const effect = this.add.image(x, y, 'suma').setDisplaySize(40, 40).setDepth(10);
    this.physics.add.existing(effect);
    effect.body.setAllowGravity(false);
    effect.body.setVelocity(velocity.x, velocity.y / 3);
    effect.body.setImmovable(true);
    this.collectEffects.push(effect);

    this.time.addEvent({
      delay: 600,
      callback: () => {
        if (effect.active) {
          effect.destroy();
        }
      },
      callbackScope: this,
    });
  }

  flushCollectedBoxes() {
    if (this.collectedThisFrame.length === 0) {
      this.collectionQueued = false;
      return;
    }

    const items = Array.from(new Set(this.collectedThisFrame));
    const playerItems = this.playerCollectedThisFrame.filter((item) => item.collectionSource === 'player');
    const netItems = this.netCollectedThisFrame.filter((item) => item.collectionSource === 'net');

    let scoreGain = 0;
    if (playerItems.length > 0) {
      playerItems.sort((a, b) => a.value - b.value);
      scoreGain += playerItems[0].value;
    }
    if (netItems.length > 0) {
      scoreGain += netItems.reduce((sum, item) => sum + item.value, 0);
    }

    this.score += scoreGain;
    this.updateScore();

    items.forEach((item) => {
      if (item.text) {
        item.text.destroy();
        item.text = null;
      }
      if (item.box) {
        item.box.destroy();
        item.box = null;
      }

      const activeIndex = this.activeBoxes.indexOf(item);
      if (activeIndex >= 0) {
        this.activeBoxes.splice(activeIndex, 1);
      }

      const tickIndex = this.currentTickItems.indexOf(item);
      if (tickIndex >= 0) {
        this.currentTickItems.splice(tickIndex, 1);
      }

      item.removed = true;
    });

    this.collectedThisFrame.length = 0;
    this.playerCollectedThisFrame.length = 0;
    this.netCollectedThisFrame.length = 0;
    this.collectionQueued = false;

    this.resetTickTimer();
    this.spawnPair();
  }

  onTick() {
    if (this.currentTickItems.length > 0 && !this.currentTickCollected) {
      const highestItem = this.currentTickItems.reduce((maxItem, item) => {
        return item.value > maxItem.value ? item : maxItem;
      }, this.currentTickItems[0]);

      this.score += highestItem.value;
      this.updateScore();
    }

    this.spawnPair();
  }

  startTickTimer() {
    if (this.tickEvent) {
      this.tickEvent.remove(false);
    }

    this.tickEvent = this.time.addEvent({
      delay: 5000,
      callback: this.onTick,
      callbackScope: this,
      loop: true,
    });
  }

  resetTickTimer() {
    if (this.tickEvent) {
      this.tickEvent.remove(false);
    }
    this.startTickTimer();
  }

  startCountdown() {
    this.updateTimer();
    this.countdownEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft -= 1;
        this.updateTimer();
        if (this.timeLeft <= 0) {
          this.completeLevel();
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  updateScore() {
    this.scoreText.setText(`Puntaje: ${this.score}`);
  }

  updateTimer() {
    this.timerText.setText(`Tiempo: ${this.timeLeft}`);
  }

  clearCurrentBoxes() {
    this.activeBoxes.forEach((item) => {
      if (item.text) {
        item.text.destroy();
      }
      if (item.box) {
        item.box.destroy();
      }
    });
    this.activeBoxes.length = 0;
    this.currentTickItems.length = 0;
    this.currentTickCollected = false;
    this.boxes.clear(true, true);
  }

  removeBox(box) {
    const index = this.activeBoxes.findIndex((item) => item.box === box);
    if (index >= 0) {
      const item = this.activeBoxes[index];
      if (item.text) {
        item.text.destroy();
        item.text = null;
      }
      if (item.box) {
        item.box.destroy();
        item.box = null;
      }
      item.removed = true;
      this.activeBoxes.splice(index, 1);

      const currentIndex = this.currentTickItems.indexOf(item);
      if (currentIndex >= 0) {
        this.currentTickItems.splice(currentIndex, 1);
      }
    }
  }

  completeLevel() {
    if (this.tickEvent) {
      this.tickEvent.remove(false);
    }
    if (this.countdownEvent) {
      this.countdownEvent.remove(false);
    }

    this.clearCurrentBoxes();

    if (this.sumFallenNumbers > 0 && this.score > this.sumFallenNumbers / 2) {
      this.scene.start('game-over', {
        score: this.score,
        totalSum: this.sumFallenNumbers,
        dropSpeedMultiplier: this.dropSpeedMultiplier,
      });
      return;
    }

    this.scene.start('level-complete', {
      score: this.score,
      dropSpeedMultiplier: this.dropSpeedMultiplier,
    });
  }
}
