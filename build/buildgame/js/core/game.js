const PLAYER = "player";

const ENEMY = "enemy";

const TURN_STATE = {

    START:"turnStart",

    PLAYING:"playing",

    END:"turnEnd"

};

const game = {

    turn:0,

    currentPlayer:PLAYER,

    state:TURN_STATE.START,

    playerLife:5,

    enemyLife:5

};
const playerField = [];

const enemyField = [];

//======================================
// プレイヤー交代
//======================================

function switchPlayer(){

    game.currentPlayer =

        game.currentPlayer === PLAYER

        ? ENEMY

        : PLAYER;

}

