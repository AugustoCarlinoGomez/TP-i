export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('level-complete');
  }

  preload() {
    this.load.image('win', 'assetas/win.jpg');
  }

  init(data) {
    this.score = data.score || 0;
    this.dropSpeedMultiplier = data.dropSpeedMultiplier || 1;
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'win').setDisplaySize(width, height);

    this.add.text(400, 140, '¡Nivel completado!', {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(400, 220, `Puntaje: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.createButton(400, 320, 'Seleccionar nivel', () => {
      this.scene.start('level-select');
    });

    this.createButton(400, 400, 'Reiniciar nivel', () => {
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
      backgroundColor: '#059669',
      padding: { x: 20, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', callback);
    button.on('pointerover', () => button.setStyle({ backgroundColor: '#047857' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#059669' }));

    return button;
  }
}
