import * as PIXI from 'pixi.js'

import Application from '../Application'
import TitleScreen from './TitleScreen'
import EndGameScreen from './EndGameScreen'

import Board from '../components/Board'

export default class GameScreen extends PIXI.Container {

  constructor () {
    super()
    //var textureButton = PIXI.Texture.fromImage('../javascript-pixi/public/images/cu.jpg');

 
    //Bolean
    this.needtoStart = false
    let text = (colyseus.readyState === WebSocket.CLOSED)
      ? "Couldn't connect."
      : "En attente de joueur"
    
    this.waitingText = new PIXI.Text(text, {
      font: "100px JennaSue",
      fill: '#000',
      textAlign: 'center'
    })
    this.waitingText.pivot.x = this.waitingText.width / 2
    this.waitingText.pivot.y = this.waitingText.height / 2
    this.addChild(this.waitingText)

    this.on('dispose', this.onDispose.bind(this))

    this.board = new Board()
    this.connect();

    this.onResize()
  }

  async connect () {
    this.room = await colyseus.joinOrCreate('tictactoe');
    this.maxPlayers = 2
    let numPlayers = 0;
    this.room.state.players.onAdd = () => {
      numPlayers++;


      this.waitingText.text= "En attente de joueur "+ numPlayers.toString() + "/" + this.maxPlayers;


      if (numPlayers === this.maxPlayers || this.needtoStart == true) {
        this.onJoin();
      }
    }

    this.room.state.board.onChange = (value, index) => {
      const x = index % 3;
      const y = Math.floor(index / 3);
      this.board.set(x, y, value);
    }

    this.room.state.onChange = (changes) => {
      changes.forEach(change => {
        if (change.field === "currentTurn") {
          // go to next turn after a little delay, to ensure "onJoin" gets called before this.
          setTimeout(() => this.nextTurn(change.value), 10)

        } else if (change.field === "draw") {
          this.drawGame();

        } else if (change.field === "winner") {
          this.showWinner(change.value);

        }
      });
    }

    this.room.onError.once(() => this.emit('goto', TitleScreen));
  }

  transitionIn () {
    tweener.add(this.waitingText).from({ alpha: 0 }, 300, Tweener.ease.quintOut)
    return tweener.add(this.waitingText.scale).from({x: 1.5, y: 1.5}, 300, Tweener.ease.quintOut)
  }

  transitionOut () {
    if (this.timeIcon) {
      tweener.add(this.board).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
      return tweener.add(this.statusText).to({ y: this.statusText.y + 10, alpha: 0 }, 300, Tweener.ease.quintOut)

    } else {
      return tweener.add(this.waitingText).to({ alpha: 0 }, 300, Tweener.ease.quintOut)
    }
  }

  onJoin () {
    // not waiting anymore!
    this.removeChild(this.waitingText)


    this.board.pivot.x = this.board.width / 2
    this.board.pivot.y = this.board.height / 2
    this.board.on('select', this.onSelect.bind(this))
    this.addChild(this.board)



    this.onResize()
  }

  onSelect (x, y) {
    this.room.send("action", { x: x, y: y })
  }

  nextTurn (playerId) {
    tweener.add(this.statusText).to({
      y: Application.HEIGHT - Application.MARGIN + 10,
      alpha: 0
    }, 200, Tweener.ease.quintOut).then(() => {

      if (playerId == this.room.sessionId) {
        this.statusText.text = "Your move!"

      } else {
        this.statusText.text = "Opponent's turn..."
      }

      this.statusText.x = Application.WIDTH / 2 - this.statusText.width / 2

      tweener.add(this.statusText).to({
        y: Application.HEIGHT - Application.MARGIN,
        alpha: 1
      }, 200, Tweener.ease.quintOut)

    })

 
  }


  drawGame () {
    this.room.leave()
    this.emit('goto', EndGameScreen, { draw: true })
  }

  showWinner (clientId) {
    this.room.leave()
    this.emit('goto', EndGameScreen, {
      won: (this.room.sessionId == clientId)
    })
  }

  onResize () {
    this.waitingText.x = Application.WIDTH / 2
    this.waitingText.y = Application.HEIGHT / 2


  }

  onDispose () {
  }

}
