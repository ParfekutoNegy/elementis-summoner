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

function onTurnEnd(
    onComplete
){

    //----------------------------------
    // 現在のターンプレイヤー
    //----------------------------------

    const turnPlayer =
        game.currentPlayer;


    //----------------------------------
    // ターンプレイヤーの場
    //----------------------------------

    const turnPlayerField =
        turnPlayer === PLAYER
            ? playerField
            : enemyField;


    //----------------------------------
    // 非ターンプレイヤーの場
    //----------------------------------

    const nonTurnPlayerField =
        turnPlayer === PLAYER
            ? enemyField
            : playerField;


    //==================================
    // ターン終了時能力キュー
    //==================================

    const abilityQueue = [];


    //----------------------------------
    // 能力をキューへ追加する
    //----------------------------------

    const addAbilitiesToQueue =
        field => {

            for(
                const summon
                of field
            ){

                if(
                    !summon ||
                    !summon.card ||
                    summon.destroyed
                ){

                    continue;

                }


                //----------------------------------
                // 現在持っている能力
                //----------------------------------

                const ability =
                    summon.ability;


                if(!ability){

                    continue;

                }


                //----------------------------------
                // フェアリー
                //----------------------------------

                if(
                    ability.type ===
                    "fairyTurnEndReady"
                ){

                    abilityQueue.push({

                        summon:
                            summon,

                        ability:
                            ability,

                        type:
                            "fairyTurnEndReady"

                    });

                }


                //----------------------------------
                // ファイアドレイク
                //----------------------------------

                if(
                    ability.type ===
                    "turnEndDamageCurrentPlayer"
                ){

                    abilityQueue.push({

                        summon:
                            summon,

                        ability:
                            ability,

                        type:
                            "turnEndDamageCurrentPlayer"

                    });

                }

            }

        };


    //==================================
    // 解決順
    //
    // 1. ターンプレイヤー
    // 2. 非ターンプレイヤー
    //==================================

    addAbilitiesToQueue(
        turnPlayerField
    );

    addAbilitiesToQueue(
        nonTurnPlayerField
    );


    console.log(
        "ターン終了時能力キュー",
        abilityQueue.map(
            item => ({
                card:
                    item.summon.card.name,
                type:
                    item.type
            })
        )
    );


    //----------------------------------
    // キューが空
    //----------------------------------

    if(
        abilityQueue.length === 0
    ){

        if(
            typeof onComplete ===
            "function"
        ){

            onComplete();

        }

        return;

    }


    //==================================
    // 1つずつ解決
    //==================================

    let queueIndex = 0;


    const resolveNextAbility =
        () => {


            //----------------------------------
            // 全能力解決完了
            //----------------------------------

            if(
                queueIndex >=
                abilityQueue.length
            ){

                if(
                    typeof onComplete ===
                    "function"
                ){

                    onComplete();

                }

                return;

            }


            //----------------------------------
            // 今回解決する能力
            //----------------------------------

            const item =
                abilityQueue[
                    queueIndex
                ];


            queueIndex++;


            const summon =
                item.summon;


            //----------------------------------
            // 解決時点で
            // そのサモンが場にいるか確認
            //----------------------------------

            const stillOnField =
                !summon.destroyed &&
                (
                    playerField.includes(
                        summon
                    ) ||
                    enemyField.includes(
                        summon
                    )
                );


            //----------------------------------
            // 場から離れている場合
            // その能力は飛ばす
            //----------------------------------

            if(!stillOnField){

                setTimeout(
                    resolveNextAbility,
                    1500
                );

                return;

            }


            //==================================
            // フェアリー
            //==================================

            if(
                item.type ===
                "fairyTurnEndReady"
            ){

                console.log(
                    "フェアリー能力：ターン終了効果発動",
                    "能力保持サモン=",
                    summon.card.name
                );


                //----------------------------------
                // この能力のコントローラー
                //----------------------------------

                const ownerField =
                    summon.owner === PLAYER
                        ? playerField
                        : enemyField;


                //----------------------------------
                // 自分のサモンをすべて
                // タテ向きにする
                //----------------------------------

                for(
                    const target
                    of ownerField
                ){

                    if(
                        !target ||
                        target.destroyed
                    ){

                        continue;

                    }


                    target.isRest =
                        false;


                    target.view.setHorizontal(
                        false
                    );


                    target.attackReady =
                        true;

                }


                //----------------------------------
                // 次の能力へ
                //----------------------------------

                setTimeout(
                    resolveNextAbility,
                    1500
                );

                return;

            }


            //==================================
            // ファイアドレイク
            //==================================

            if(
                item.type ===
                "turnEndDamageCurrentPlayer"
            ){

                //----------------------------------
                // 現在の能力
                //----------------------------------

                const ability =
                    summon.ability;


                //----------------------------------
                // ダメージ値
                //----------------------------------

                const damage =
                    Number(
                        ability?.value
                    ) || 1;


                //----------------------------------
                // 対象
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
                // ダメージ
                //
                // ファイアドレイクの能力には
                // レジストが発生しない仕様
                //----------------------------------

                damagePlayer(
                    turnPlayer,
                    damage,
                    true,
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


                    if(
                        typeof onComplete ===
                        "function"
                    ){

                        onComplete();

                    }

                    return;

                }


                //----------------------------------
                // 次の能力へ
                //----------------------------------

                setTimeout(
                    resolveNextAbility,
                    1500
                );

                return;

            }


            //----------------------------------
            // 未対応能力
            //----------------------------------

            setTimeout(
                resolveNextAbility,
                1500
            );

        };


    //----------------------------------
    // 最初の能力を解決
    //----------------------------------

    resolveNextAbility();

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
