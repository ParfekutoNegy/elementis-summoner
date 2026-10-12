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

//==================================
// デリュージ使用履歴
// 1ゲームにつき各プレイヤー1回
//==================================

const delugeUsed = {
    player: false,
    enemy: false
};

// CPUがこのターンにデリュージを使用する予定か
let cpuDelugePlannedThisTurn = false;

