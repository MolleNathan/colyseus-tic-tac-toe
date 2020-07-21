import { Room, Delayed, Client } from 'colyseus';
import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';

const TURN_TIMEOUT = 10
const BOARD_WIDTH = 3;

class State extends Schema {
  @type("string") currentTurn: string;
  @type({ map: "string" }) players = new MapSchema<boolean>();
  @type(["number"]) board: number[] = new ArraySchema<number>(0, 0, 0, 0, 0, 0, 0, 0, 0);
  @type("string") winner: string;
  @type("boolean") draw: boolean;
}

export class TicTacToe extends Room<State> {
  maxClients = 8;
  randomMoveTimeout: Delayed;

  onCreate () {
    this.setState(new State());
    this.onMessage("action", (client, message) => this.playerAction(client, message));
  }

  onJoin (client: Client) {
    this.state.players[client.sessionId] = client.sessionId;

    if (Object.keys(this.state.players).length === this.maxClients ) {
      this.state.currentTurn = client.sessionId;

      // lock this room for new users
      this.lock();
    }
  }

  playerAction (client: Client, data: any) {
    if (this.state.draw) {
      return false;
    }

    if (client.sessionId === this.state.currentTurn) {
      const playerIds = Object.keys(this.state.players);

      
          // switch turn
          const otherPlayerSessionId = (client.sessionId === playerIds[0]) ? playerIds[1] : playerIds[0];

          this.state.currentTurn = otherPlayerSessionId;

    }
  }

  checkBoardComplete () {
    return this.state.board
      .filter(item => item === 0)
      .length === 0;
  }


  checkWin (x, y, move) {
    let won = false;
    let board = this.state.board;

    return won;
  }

  onLeave (client) {
    delete this.state.players[ client.sessionId ];

    let remainingPlayerIds = Object.keys(this.state.players)
    if (remainingPlayerIds.length > 0) {
      this.state.winner = remainingPlayerIds[0]
    }
  }

}

