export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('level-select');
  }

  create() {
    this.cameras.main.setBackgroundColor('#111827');
    const { width } = this.scale;

    this.add.text(width / 2, 100, 'Selecciona nivel', {
      fontFamily: 'Arial',
      fontSize: '44px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.createButton(width / 2, 220, 'Nivel 1', () => {
      this.scene.start('hello-world', { dropSpeedMultiplier: 2 });
    });

    this.createButton(width / 2, 300, 'Nivel 2', () => {
      this.scene.start('hello-world', { dropSpeedMultiplier: 3 });
    });

    this.createButton(width / 2, 380, 'Nivel 3', () => {
      this.scene.start('hello-world', { dropSpeedMultiplier: 4 });
    });

    this.createButton(width / 2, 470, 'Volver al inicio', () => {
      this.scene.start('start');
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
