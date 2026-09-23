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
// ターン終了効果
//======================================

function onTurnEnd(){

    //----------------------------------
    // 現在のターンプレイヤー
    //----------------------------------

    const turnPlayer =
        game.currentPlayer;


    //----------------------------------
    // 現在のターンプレイヤーの場
    //----------------------------------

    const turnPlayerField =
        turnPlayer === PLAYER
            ? playerField
            : enemyField;


    //==================================
    // フェアリー
    //==================================

    //----------------------------------
    // フェアリー能力確認
    //
    // 現在持っている能力を見る
    //----------------------------------

    const fairy =
        turnPlayerField.find(
            summon =>
                summon &&
                summon.card &&
                !summon.destroyed &&
                summon.ability?.type ===
                    "fairyTurnEndReady"
        );


    //----------------------------------
    // フェアリー効果
    //----------------------------------

    if(fairy){

        console.log(
            "フェアリー能力：ターン終了効果発動",
            "能力保持サモン=",
            fairy.card.name
        );


        //----------------------------------
        // すべてのサモンをタテ向きにする
        //----------------------------------

        for(
            const summon
            of turnPlayerField
        ){

            if(
                !summon ||
                summon.destroyed
            ){

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


    //==================================
    // ファイアドレイク
    //
    // ターン終了時
    // 現在のターンプレイヤーにダメージ
    //==================================

    //----------------------------------
    // PLAYER・CPU両方の場を確認
    //----------------------------------

    const allSummons = [
        ...playerField,
        ...enemyField
    ];


    //----------------------------------
    // ターン終了時ダメージ能力を
    // 現在持っているサモンを取得
    //----------------------------------

    const damageSummons =
        allSummons.filter(
            summon => {

                if(
                    !summon ||
                    !summon.card
                ){

                    return false;

                }


                if(summon.destroyed){

                    return false;

                }


                //----------------------------------
                // 現在持っている能力
                //----------------------------------

                return (
                    summon.ability?.type ===
                        "turnEndDamageCurrentPlayer"
                );

            }
        );


    //----------------------------------
    // 1体ずつ能力発動
    //----------------------------------

    for(
        const summon
        of damageSummons
    ){

        //----------------------------------
        // 現在持っている能力
        //----------------------------------

        const ability =
            summon.ability;


        //----------------------------------
        // 念のため確認
        //----------------------------------

        if(
            !ability ||
            ability.type !==
                "turnEndDamageCurrentPlayer"
        ){

            continue;

        }


        //----------------------------------
        // ダメージ値
        //----------------------------------

        const damage =
            Number(
                ability.value
            ) || 1;


        //----------------------------------
        // 対象表示
        //----------------------------------

        const targetName =
            turnPlayer === PLAYER
                ? "PLAYER"
                : "CPU";


        console.log(
            "ターン終了時ダメージ能力発動",
            "能力保持サモン=",
            summon.card.name,
            "対象=",
            targetName,
            "ダメージ=",
            damage
        );


        //----------------------------------
        // バトルログ
        //----------------------------------

        addBattleLog(
            `${summon.card.name}：${targetName}に${damage}ダメージ`
        );


        //----------------------------------
        // 通常のプレイヤーダメージ処理
        //
        // ガーゴイル等の軽減
        // レジスト
        // も通常処理に任せる
        //----------------------------------

        damagePlayer(
            turnPlayer,
            damage,
            false,
            summon.card
        );


        //----------------------------------
        // ゲーム終了確認
        //----------------------------------

        if(
            game.playerLife <= 0 ||
            game.enemyLife <= 0
        ){

            console.log(
                "ターン終了時ダメージによりゲーム終了"
            );


            return;

        }

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

    battleGameConceded = false;

    //----------------------------------
    // CPUデッキ決定
    //----------------------------------

    selectRandomCpuDeck();

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

const matchLife =
    Number(
        currentGameSettings?.life
    ) || 5;


game.playerLife =
    matchLife;

game.enemyLife =
    matchLife;


console.log(
    "★ マッチ開始時LIFE設定：",
    matchLife
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
    // 後攻決定
    //----------------------------------

    secondPlayer =
        firstPlayer === PLAYER
            ? ENEMY
            : PLAYER;


    //----------------------------------
    // 確認ログ
    //----------------------------------

    console.log(
        "★ 先攻：",
        firstPlayer
    );

    console.log(
        "★ 後攻：",
        secondPlayer
    );

}

//======================================
// 次のゲームの先攻決定
// 負けた方が次の先攻
//======================================

function setNextFirstPlayer(winner){

    //----------------------------------
    // 今回の勝者
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "★ setNextFirstPlayer 実行"
    );

    console.log(
        "★ winner =",
        winner
    );

    console.log(
        "★ PLAYER =",
        PLAYER
    );

    console.log(
        "★ ENEMY =",
        ENEMY
    );


    //----------------------------------
    // 勝者の反対側が次の先攻
    //----------------------------------

    nextFirstPlayer =
        winner === PLAYER
            ? ENEMY
            : PLAYER;


    console.log(
        "★ 次の先攻 nextFirstPlayer =",
        nextFirstPlayer
    );

    console.log(
        "================================"
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
