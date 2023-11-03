import Phaser from 'phaser';
import InputText from 'phaser3-rex-plugins/plugins/inputtext.js';
import config from '../config';
import createButton from '../utils/createButton';
import {setUsername} from '../utils/username';


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

    this.add.text(config.scale.width * 0.5 - 150, 100, 'Nickname:', {
      color: 'white',
      fontSize: '20px'
    }).setOrigin(0.5);

    // Ajout de textEntry pour la saisie du pseudo
    const textEntry = new InputText(this, config.scale.width * 0.5, 100, 200, 50);
    this.add.existing(textEntry);
    textEntry.on('textchange', function (inputText:any) {
      setUsername(inputText.text)
    })

    const worlds = ['World 1', 'World 2', 'World 3'];
    const worldScenes = ['World01', 'World02', 'World03'];
    worlds.forEach((world, index) => {
      createButton(this, config.scale.width / 2, 200 + index * 100, world, worldScenes[index]);
    });

    // Afficher le texte du titre du menu
    /*
    // Créer le bouton de la première scène
    const button1 = createButton(
      this,
      gameWidth / 2,
      200,
      'Maze 1',
      'Maze01'
    );

    // Créer le bouton de la deuxième scène
    const button2 = createButton(
      this,
      gameWidth / 2,
      300,
      'Maze 2',
      'Maze02'
    );

    // Créer le bouton de la troisième scène
    const button3 = createButton(
      this,
      gameWidth / 2,
      400,
      'Maze 3',
      'Maze03'
    );*/
  };
}
