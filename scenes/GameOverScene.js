export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('game-over');
  }

  preload() {
    this.load.image('gameover', 'assetas/gameover.jpg');
  }

  init(data) {
    this.score = data.score || 0;
    this.totalSum = data.totalSum || 0;
    this.dropSpeedMultiplier = data.dropSpeedMultiplier || 1;
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'gameover').setDisplaySize(width, height);

    this.add.text(400, 140, 'Game Over', {
      fontFamily: 'Arial',
      fontSize: '44px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(400, 220, `Puntaje: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(400, 280, `Total de números caídos: ${this.totalSum}`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#cccccc',
    }).setOrigin(0.5);

    this.createButton(400, 360, 'Seleccionar nivel', () => {
      this.scene.start('level-select');
    });

    this.createButton(400, 440, 'Reiniciar nivel', () => {
      this.scene.start('hello-world', {
        dropSpeedMultiplier: this.dropSpeedMultiplier,
      });
    });
  }

  createButton(x, y, label, callback) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#ffffff',
      backgroundColor: '#dc2626',
      padding: { x: 20, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', callback);
    button.on('pointerover', () => button.setStyle({ backgroundColor: '#b91c1c' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#dc2626' }));

    return button;
  }
}
