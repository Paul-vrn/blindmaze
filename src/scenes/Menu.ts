import Phaser from 'phaser';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';
import config from '../config';
import { getWorlds } from '../models/store';
import { getUsername, setUsername } from '../models/username';
import { createButton } from '../utils/createButton';

export default class Menu extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const titleText = this.add.text(
      config.scale.width / 2,
      50,
      'Menu Principal',
      {
        fontSize: '32px',
        color: '#fff',
      }
    );
    titleText.setOrigin(0.5);

    this.add
      .text(config.scale.width * 0.5 - 150, 100, 'Nickname:', {
        color: 'white',
        fontSize: '20px',
      })
      .setOrigin(0.5);

    // Ajout de textEntry pour la saisie du pseudo
    const textEntry = new InputText(
      this,
      config.scale.width * 0.5,
      100,
      200,
      50
    );
    this.add.existing(textEntry);
    textEntry.setText(getUsername());
    textEntry.on('textchange', function (inputText: any) {
      setUsername(inputText.text);
    });

    const worlds = ['World 1', 'World 2', 'World 3'];
    const worldScenes = ['World01', 'World02', 'World03'];
    const worldsAvancement = getWorlds();
    worlds.forEach((world, index) => {
      const previousWorld = worldsAvancement[worldScenes[index - 1]];
      let disable = false;
      if (index > 0) {
        disable = !previousWorld || previousWorld.size < 3;
      }
      createButton(
        this,
        config.scale.width / 2,
        200 + index * 100,
        world,
        worldScenes[index],
        disable
      );
    });
  }
}
