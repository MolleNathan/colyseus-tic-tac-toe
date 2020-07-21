import * as PIXI from 'pixi.js'

import Application from '../Application'
import GameScreen from './GameScreen'

export default class TitleScreen extends PIXI.Container {

  constructor () {
    super()



    this.instructionText = new PIXI.Text("Les nuls on va perdre", {
      font: "62px JennaSue",
      fill: 0x000,
      textAlign: 'center'
    })
    this.instructionText.pivot.x = this.instructionText.width / 2
    this.instructionText.pivot.y = this.instructionText.height / 2
    this.addChild(this.instructionText)

    this.colyseus = new PIXI.Sprite.fromImage('images/colyseus.png')
    this.colyseus.pivot.x = this.colyseus.width / 2
    this.addChild(this.colyseus)

    this.interactive = true
    this.once('click', this.startGame.bind(this))
    this.once('touchstart', this.startGame.bind(this))

    this.on('dispose', this.onDispose.bind(this))
  }

  transitionIn () {
    tweener.add(this.colyseus).from({ y: this.colyseus.y + 10, alpha: 0 }, 300, Tweener.ease.quadOut)
    return tweener.add(this.instructionText).from({ alpha: 0 }, 300, Tweener.ease.quadOut)
  }

  transitionOut () {
    tweener.remove(this.colyseus)
    tweener.remove(this.instructionText)

    tweener.add(this.colyseus).to({ y: this.colyseus.y + 10, alpha: 0 }, 300, Tweener.ease.quintOut)
    return tweener.add(this.instructionText).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
  }

  startGame () {
    this.emit('goto', GameScreen)
  }

  onResize () {

    this.instructionText.x = Application.WIDTH / 2
    this.instructionText.y = Application.HEIGHT / 2 - this.instructionText.height / 3.8

    this.colyseus.x = Application.WIDTH / 2
    this.colyseus.y = Application.HEIGHT - this.colyseus.height - Application.MARGIN
  }

  onDispose () {
    window.removeEventListener('resize', this.onResizeCallback)
  }

}




