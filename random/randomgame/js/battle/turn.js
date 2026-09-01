//======================================
// バトル
// ターン追加処理
//======================================


//======================================
// ターン開始時処理
//======================================

function onTurnStart(player){
  


//======================================
// サモンを起こす
//======================================

function wakeupSummons(player){


    const field =

        player === PLAYER

        ?

        playerField

        :

        enemyField;


    for(const summon of field){


        summon.isRest = false;


        summon.view.setHorizontal(
            false
        );


    }


}

    // ドロー処理
    // drawCard();


    // マナ回復
    // recoverMana();


    // ターン開始効果
    // activateStartEffects();


}


//======================================
// ターン終了時処理
//======================================

//======================================
// ターン終了効果
//======================================

function onTurnEnd(){

    //----------------------------------
    // ターン終了プレイヤーの場
    //----------------------------------

    const field =
        game.currentPlayer === PLAYER
            ? playerField
            : enemyField;


    //----------------------------------
    // フェアリー確認
    //----------------------------------

    const fairy =
        field.find(
            summon =>
                summon &&
                summon.card &&
                summon.card.ability &&
                summon.card.ability.type ===
                "fairyTurnEndReady"
        );


    //----------------------------------
    // フェアリーがいなければ終了
    //----------------------------------

    if(!fairy){

        return;

    }


    console.log(
        "フェアリー：ターン終了効果発動"
    );


    //----------------------------------
    // すべてのサモンをタテ向きにする
    //----------------------------------

    for(const summon of field){

        if(!summon){

            continue;

        }


        summon.isRest =
            false;


        summon.view.setHorizontal(
            false
        );


        summon.attackReady =
            true;

    }

}


//======================================
// 一時パワー補正
//======================================

function addTemporaryPower(
    summon,
    value
){

    if(!summon){
        console.log(
            "パワーアップ対象なし"
        );       
        return;
    }


    summon.powerBonus += value;
    summon.view.updateCurrentPower(
        summon
    );

    console.log(
        "パワーアップ発動",
        summon.card.name,
        "元パワー",
        summon.card.power,
        "補正",
        summon.powerBonus,
        "現在パワー",
        getPower(summon)
    );


    if(summon.view){

        summon.view.refresh();

    }

}



function addTemporaryDamage(
    summon,
    value
){

    summon.damageBonus += value;

}


//======================================
// ターン開始演出
//======================================

function showTurnMessage(player,callback = null){

    const overlay =
    document.getElementById(
        "turn-overlay"
    );

    const number =
    document.getElementById(
        "turn-number"
    );

    const message =
    document.getElementById(
        "turn-message"
    );

    if(!overlay){

        return;

    }


    //----------------------------------
    // 演出開始
    //----------------------------------

    turnAnimation = true;


    //----------------------------------
    // ターン数
    //----------------------------------

    number.textContent =
    "TURN " + game.turn;


    //----------------------------------
    // 表示
    //----------------------------------

    if(player === PLAYER){

        message.textContent =
        "PLAYER TURN";

        addBattleLog(
    "プレイヤーのターン"
);

    }else{

        message.textContent =
        "ENEMY TURN";

        addBattleLog(
    "CPUのターン"
);

    }


    overlay.classList.add(
        "show"
    );


    //----------------------------------
    // 演出終了
    //----------------------------------

    setTimeout(()=>{

    overlay.classList.remove(
        "show"
    );

    turnAnimation = false;


    //----------------------------------
    // 演出終了後
    //----------------------------------

    if(callback){

        callback();

    }

},2500);

}


//======================================
// マッチ管理
//======================================

let matchGameNumber = 1;


// 次のゲームの先攻
// 前のゲームの敗者
let nextFirstPlayer = null;


// 現在のゲームの先攻
let firstPlayer = null;


// 現在のゲームの後攻
let secondPlayer = null;


//======================================
// マッチ開始
//======================================

function startMatch(){

    //----------------------------------
    // 新しいマッチのアイコン決定
    //----------------------------------

    selectRandomMatchIcons();

    updateMatchIcons();


    //----------------------------------
    // マッチ初期化
    //----------------------------------

    matchGameNumber = 1;

    nextFirstPlayer = null;

    firstPlayer = null;

    secondPlayer = null;


    //----------------------------------
    // 開始手札履歴をリセット
    //----------------------------------

    playerStartingCardIds = [];

    enemyStartingCardIds = [];


    //----------------------------------
    // 1戦目の先攻をランダム決定
    //----------------------------------

    decideFirstPlayerForMatch();


    //----------------------------------
    // 現在のターンプレイヤー
    //----------------------------------

    game.currentPlayer =
        firstPlayer;


    //----------------------------------
    // ターン数リセット
    //----------------------------------

    game.turn = 0;


    //----------------------------------
    // LIFEリセット
    //----------------------------------

    const restartLife = 5;


    game.playerLife =
        restartLife;

    game.enemyLife =
        restartLife;


    console.log(
        "★ リスタート時LIFE設定：",
        restartLife
    );

    //----------------------------------
    // 1戦目の盤面・手札を生成
    //----------------------------------

    setupGame();


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "マッチ開始"
    );

    console.log(
        "第" +
        matchGameNumber +
        "戦"
    );

    console.log(
        "先攻:",
        firstPlayer
    );

    console.log(
        "後攻:",
        secondPlayer
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // 先攻から開始
    //----------------------------------

    if(
        game.currentPlayer === PLAYER
    ){

        startTurn();

    }else{

        startCpuTurn();

    }

}


//======================================
// 現在のゲームの先攻を決定
//======================================

function decideFirstPlayerForMatch(){

    //----------------------------------
    // 1戦目
    //----------------------------------

    if(matchGameNumber === 1){

        firstPlayer =
            Math.random() < 0.5
                ? PLAYER
                : ENEMY;

    }


    //----------------------------------
    // 2戦目以降
    // 前のゲームの敗者が先攻
    //----------------------------------

    else{

        firstPlayer =
            nextFirstPlayer;

    }


    //----------------------------------
    // 念のため
    //----------------------------------

    if(!firstPlayer){

        firstPlayer =
            Math.random() < 0.5
                ? PLAYER
                : ENEMY;

    }


    //----------------------------------
    // 後攻
    //----------------------------------

    secondPlayer =
        firstPlayer === PLAYER
            ? ENEMY
            : PLAYER;


    console.log(
        "第" +
        matchGameNumber +
        "戦"
    );

    console.log(
        "先攻:",
        firstPlayer
    );

    console.log(
        "後攻:",
        secondPlayer
    );

}


//======================================
// 次のゲームの先攻決定
// 負けた方が次の先攻
//======================================

function setNextFirstPlayer(winner){

    //----------------------------------
    // 勝者の反対側が次の先攻
    //----------------------------------

    nextFirstPlayer =
        winner === PLAYER
            ? ENEMY
            : PLAYER;


    console.log(
        "今回の勝者:",
        winner
    );

    console.log(
        "次のゲームの先攻:",
        nextFirstPlayer
    );

}



//======================================
// マッチリセット
//======================================

function resetMatch(){

    matchGameNumber = 1;

    nextFirstPlayer = null;

    firstPlayer = null;

    secondPlayer = null;

}
