//======================================
// ターン開始
//======================================
function startTurn(){

    game.turn++;

    game.state = TURN_STATE.START;


    console.log(
        "ターン開始：" +
        game.currentPlayer
    );


    //----------------------------------
    // ターン開始時の状態リセット
    //----------------------------------

    clearHandSelection();

    clearFieldSelection();


    closeHandModal();

    closeSummonActionModal();

    resetAttackState();


    // 状態リセット

    summonUsedThisTurn = false;

    summonCard = null;

    selectedCostCards = [];

    costConfirm = false;

    closeCostView();


    //----------------------------------
// ターン開始表示
//----------------------------------

showTurnMessage(

    game.currentPlayer,

    ()=>{

        //----------------------------------
        // ターン開始時 一時効果解除
        //----------------------------------

        resetTemporaryPower(
            game.currentPlayer
        );

        //----------------------------------
        // ① サモンを起こす
        //----------------------------------

        readySummons(
            game.currentPlayer
        );


        //----------------------------------
        // ② コスト回収
        //----------------------------------

        recoverCostCards();

        updateCostZoneView();


//----------------------------------
// ③ クール回収
//----------------------------------

const coolCards =
    getCoolCards(
        game.currentPlayer
    );


//----------------------------------
// クールゾーンにカードがある場合
//----------------------------------

if(coolCards.length > 0){

    startCoolRecovery();

    return;

}


//----------------------------------
// クールが空
//----------------------------------

finishCoolRecovery();

    }

);

}


//======================================
// クール回収完了
//======================================

function finishCoolRecovery(){

    //----------------------------------
    // 回収モード終了
    //----------------------------------

    coolRecoveryMode = false;

    selectedCoolCard = null;


    //----------------------------------
    // クール回収用CSSクラスを解除
    //----------------------------------

    const modal =
        document.getElementById(
            "cool-modal"
        );


    if(modal){

        modal.classList.remove(
            "cool-recovery-mode"
        );

        modal.classList.remove(
            "cool-view-mode"
        );

        modal.style.display =
            "none";

    }


    //----------------------------------
    // クールカードの選択・発光を解除
    //----------------------------------

    document
        .querySelectorAll(
            "#cool-list .cool-card"
        )
        .forEach(card => {

            card.classList.remove(
                "selected"
            );

            card.style.animation =
                "none";

            card.style.outline =
                "none";

        });


    //----------------------------------
    // 〇を解除
    //----------------------------------

    document
        .querySelectorAll(
            "#cool-list .card-marker"
        )
        .forEach(marker => {

            marker.style.display =
                "none";

        });


    //----------------------------------
    // 手札選択解除
    //----------------------------------

    clearHandSelection();


    //----------------------------------
    // 表示更新
    //----------------------------------

    updateGameState();

    updateCostZoneView();


    //----------------------------------
    // ターン開始
    //----------------------------------

    onTurnStart(
        game.currentPlayer
    );


    //----------------------------------
    // プレイ開始
    //----------------------------------

    beginPlaying();

}

//======================================
// プレイ開始
//======================================

function beginPlaying(){

    game.state = TURN_STATE.PLAYING;

    console.log(
        "プレイ開始：" +
        game.currentPlayer
    );

}



//======================================
// ターン終了
//======================================

function endTurn(){

    if(game.currentPlayer !== PLAYER){

    return;

    }


    resetMagiaState();

        //----------------------------------
    // モーダルを閉じる
    //----------------------------------

    closeHandModal();

    closeSummonActionModal();

    closeCoolModal();

    closeEnemyCoolModal();

    // コストモーダルを開いたままにできるなら
    closeCostView();

    //----------------------------------
    // クール回収中はターン終了不可
    //----------------------------------

    if(coolRecoveryMode){

        console.log(
            "クール回収中のためターン終了不可"
        );

        return;

    }

    //----------------------------------
    // 攻撃状態リセット
    //----------------------------------
    resetAttackState();

    //----------------------------------
    // 選択カード解除
    //----------------------------------

    selectedHandCard = null;
    selectedSummon = null;


    //----------------------------------
    // 行動ボタン解除
    //----------------------------------
    resetActionButtons();
    updateButtons();


    game.state = TURN_STATE.END;

    console.log(
        "ターン終了：" +
        game.currentPlayer
    );

//----------------------------------
// 一時効果解除
// 両プレイヤー分確認
//----------------------------------

resetTemporaryPower(
    PLAYER
);


resetTemporaryPower(
    ENEMY
);


    //-------------------------
    // ターン終了効果
    //-------------------------

    onTurnEnd();

//----------------------------------
// カード表示状態を全解除
//----------------------------------

board.handCards.forEach(card=>{

    card.clearEffects();

});

playerField.forEach(summon=>{

    summon.view.clearEffects();

});

enemyField.forEach(summon=>{

    summon.view.clearEffects();

});

    //-------------------------
    // プレイヤー交代
    //-------------------------

    switchPlayer();

    //-------------------------
    // 次のターン
    //-------------------------

    if(game.currentPlayer === PLAYER){

        startTurn();

    }else{

        startCpuTurn();

    }


}    


//======================================
// サモンを起こす
//======================================
function readySummons(owner){

    const field =
        owner === PLAYER
        ?
        playerField
        :
        enemyField;


    for(const summon of field){

        //----------------------------------
        // 一時パワーをリセット
        //----------------------------------

        summon.powerBonus = 0;


        //----------------------------------
        // 行動可能
        //----------------------------------

        summon.isRest = false;


        //----------------------------------
        // 縦向き
        //----------------------------------

        summon.view.setHorizontal(
            false
        );


        //----------------------------------
        // 攻撃可能
        //----------------------------------

        summon.attackReady = true;


        //----------------------------------
        // サモン能力
        //----------------------------------

        applySummonAbility(
            summon
        );

    }

}



//======================================
// プレイヤー交代
//======================================

function switchPlayer(){

    if(game.currentPlayer === PLAYER){

        game.currentPlayer = ENEMY;

        updateButtons();

    }else{

        game.currentPlayer = PLAYER;

    }

}

//======================================
// CPUターン開始
//======================================

function startCpuTurn(){


    //----------------------------------
    // ゲーム終了後はCPUターン開始禁止
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPUターン開始中止：ゲーム終了"
        );

        return;

    }


    //----------------------------------
    // ターン数を進める
    //----------------------------------

    game.turn++;

    console.log(
        "CPUターン開始"
    );


    game.state =
    TURN_STATE.START;


    //----------------------------------
    // CPUターン状態初期化
    //----------------------------------

    resetCpuTurnState();


    //----------------------------------
    // ターン開始表示
    //----------------------------------

    showTurnMessage(

        ENEMY,

        ()=>{


            //----------------------------------
            // CPUサモン起こし
            //----------------------------------

            readySummons(
                ENEMY
            );


            //----------------------------------
            // CPUコスト回復
            //----------------------------------

            recoverEnemyCostCards();


            //----------------------------------
            // CPUクール回収
            //----------------------------------

            recoverEnemyCoolCard();


            //----------------------------------
            // ターン開始効果
            //----------------------------------

            onTurnStart(
                ENEMY
            );


            //----------------------------------
            // プレイ開始
            //----------------------------------

            beginPlaying();


            //----------------------------------
            // CPU行動開始
            //----------------------------------

            setTimeout(()=>{

                startCpuAction();

            },1000);

        }

    );

}

function finishTurn(){

    if(
        resistMode ||
        blockMode
    ){

        console.log(
            "ターン終了停止：選択待ち"
        );

        return;

    }


    console.log(
        "ターン終了",
        game.currentPlayer
    );


    emitGameEvent({

        type: GAME_EVENT.TURN_END,

        player: game.currentPlayer

    });


    //----------------------------------
    // 一時効果解除
    //----------------------------------

    resetTemporaryPower(
        game.currentPlayer
    );


    //----------------------------------
    // ターン終了効果
    //----------------------------------

    onTurnEnd();


    //----------------------------------
    // プレイヤー交代
    //----------------------------------

    switchPlayer();


    //----------------------------------
    // 次のターン
    //----------------------------------

    startTurn();

}

function resetTemporaryStatus(owner){

    const field =
    owner === PLAYER
    ? playerField
    : enemyField;


    field.forEach(summon=>{

        summon.damageBonus = 0;

        summon.powerBonus = 0;

        summon.view.updateCurrentPower(
            summon
        );

    });

}