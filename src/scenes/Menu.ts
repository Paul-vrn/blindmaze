import Phaser from 'phaser';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';
import config from '../config';
import { checkHintSpace, getWorlds } from '../models/store';
import { getUsername, setUsername } from '../models/username';
import { createButton } from '../utils/createButton';

export default class Menu extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    checkHintSpace();
    const titleText = this.add.text(config.scale.width / 2, 50, 'BlindMaze', {
      fontSize: '32px',
      color: '#fff',
    });
    titleText.setOrigin(0.5);

    const subTitle = this.add.text(
      config.scale.width / 2,
      75,
      'Find the green dots!',
      {
        fontSize: '16px',
        color: '#fff',
      }
    );
    subTitle.setOrigin(0.5);

    this.add
      .text(config.scale.width * 0.5 - 150, 120, 'Nickname:', {
        color: 'white',
        fontSize: '20px',
      })
      .setOrigin(0.5);

    // Input text for username
    const textEntry = new InputText(
      this,
      config.scale.width * 0.5,
      120,
      200,
      50
    );
    this.add.existing(textEntry);
    const username = getUsername();
    if (username !== 'Anonymous') {
      textEntry.setText(getUsername());
    }
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
