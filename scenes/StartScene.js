export default class StartScene extends Phaser.Scene {
  constructor() {
    super('start');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0f172a');

    const { width, height } = this.scale;
    this.startButtons = [];

    this.add.text(width / 2, height / 2 - 120, 'VEHICULAR \n HAMBURGUER \n HELPER ', {
      fontFamily: 'Arial',
      fontSize: '48px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    this.createButton(width / 2, height / 2 + 40, 'Jugar', () => {
      this.scene.start('level-select');
    });

    this.createButton(width / 2, height / 2 + 120, 'Controles', () => {
      this.showControls();
    });

    this.controlsPanel = this.add.container(0, 0).setVisible(false);
    const panel = this.add.rectangle(width / 2, 320, 520, 180, 0x111827, 0.95);
    const panelText = this.add.text(width / 2, 280, 'Usa las flechas para moverse:\nIZQUIERDA ←  → DERECHA', {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    const closeButton = this.createButton(width / 2, 360, 'Cerrar', () => {
      this.controlsPanel.setVisible(false);
      this.startButtons.forEach((button) => button.setInteractive({ useHandCursor: true }));
    }, false);

    closeButton.setScale(0.9);
    this.controlsPanel.add([panel, panelText, closeButton]);
  }

  createButton(x, y, label, callback, addToMenuButtons = true) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#2563eb',
      padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', callback);
    button.on('pointerover', () => button.setStyle({ backgroundColor: '#1d4ed8' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#2563eb' }));

    if (addToMenuButtons) {
      this.startButtons.push(button);
    }

    return button;
  }

  showControls() {
    this.startButtons.forEach((button) => button.disableInteractive());
    this.controlsPanel.setVisible(true);
  }
}
