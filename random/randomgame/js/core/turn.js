//======================================
// ターン開始
//======================================

function startTurn(){

    game.turn++;

    game.state =
        TURN_STATE.START;


    console.log(
        "ターン開始：" +
        game.currentPlayer
    );


//==================================================
// ターン開始
// 両プレイヤーのカードプレイ枚数リセット
//==================================================

resetCardPlayCount(
    PLAYER
);

resetCardPlayCount(
    ENEMY
);


    //----------------------------------
    // ターン開始時の状態リセット
    //----------------------------------

    clearHandSelection();

    clearFieldSelection();

    closeHandModal();

    closeSummonActionModal();

    resetAttackState();


    //----------------------------------
    // 状態リセット
    //----------------------------------

    summonUsedThisTurn =
        false;

    summonCard =
        null;

    selectedCostCards =
        [];

    costConfirm =
        false;

    closeCostView();


    //----------------------------------
    // ターン開始表示
    //----------------------------------

    showTurnMessage(

        game.currentPlayer,

        ()=>{

            //----------------------------------
            // 一時効果解除
            //----------------------------------

            resetTemporaryPower(
                game.currentPlayer
            );


            //----------------------------------
            // ① サモンをタテ向き
            //
            // ワーウルフはここでは
            // アタックせず予約のみ
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


            if(
                coolCards.length > 0
            ){

                startCoolRecovery();

                return;

            }


            //----------------------------------
            // クールなし
            //----------------------------------

            finishCoolRecovery();

        }

    );

}

function continuePlayerTurnStart(){

    //----------------------------------
    // ゲーム終了確認
    //----------------------------------

    if(
        battleGameEnding ||
        battleGameConceded
    ){

        playerTurnStartWaitingForForcedAttack =
            false;

        return;

    }


    //----------------------------------
    // PLAYERターン確認
    //----------------------------------

    if(
        game.currentPlayer !== PLAYER
    ){

        playerTurnStartWaitingForForcedAttack =
            false;

        return;

    }


    console.log(
        "PLAYERターン開始処理を継続"
    );


    playerTurnStartWaitingForForcedAttack =
        false;


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
    // クールゾーンにカードあり
    //----------------------------------

    if(
        coolCards.length > 0
    ){

        startCoolRecovery();

        return;

    }


    //----------------------------------
    // クールゾーンが空
    //----------------------------------

    finishCoolRecovery();

}

//======================================
// クール回収完了
//======================================

function finishCoolRecovery(){

    //----------------------------------
    // 回収モード終了
    //----------------------------------

    coolRecoveryMode =
        false;

    selectedCoolCard =
        null;


    //----------------------------------
    // クール回収用CSS解除
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
    // クールカード表示解除
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
    // カードマーカー解除
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
    // ターン開始効果
    //----------------------------------

    onTurnStart(
        game.currentPlayer
    );


    //----------------------------------
    // ターン中の行動開始
    //----------------------------------

    beginPlaying();


    //==================================
    // ターン開始時に予約された
    // 強制アタックをここで開始
    //
    // コスト回収・クール回収が
    // すべて終了した後
    //==================================

    startTurnForcedAttacks();

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

    if(
        game.currentPlayer !== PLAYER
    ){

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


    game.state =
        TURN_STATE.END;


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


    //==================================
    // ターン終了効果
    //
    // ここから先は
    // onTurnEnd() の完了後に進む
    //==================================

    onTurnEnd(
        finishTurnEnd
    );

}

function finishTurnEnd(){

    console.log(
        "すべてのターン終了時能力の解決完了"
    );


    //==================================
    // カーススモーク
    // ターン終了で効果解除
    //==================================

    clearCurseSmokeStatus();


    //----------------------------------
    // カード表示状態を全解除
    //----------------------------------

    board.handCards.forEach(
        card => {

            card.clearEffects();

        }
    );


    playerField.forEach(
        summon => {

            summon.view.clearEffects();

        }
    );


    enemyField.forEach(
        summon => {

            summon.view.clearEffects();

        }
    );


    //----------------------------------
    // ゲーム終了している場合
    // 次のターンへ進まない
    //----------------------------------

    if(
        game.playerLife <= 0 ||
        game.enemyLife <= 0
    ){

        console.log(
            "ゲーム終了のため次のターンへ進まない"
        );

        return;

    }


    //----------------------------------
    // プレイヤー交代
    //----------------------------------

    switchPlayer();


    //----------------------------------
    // 次のターン
    //----------------------------------

    if(
        game.currentPlayer === PLAYER
    ){

        startTurn();

    }
    else{

        startCpuTurn();

    }

}

function readySummons(owner){

    const field =
        owner === PLAYER
        ?
        playerField
        :
        enemyField;


    //----------------------------------
    // 今回のターン開始時
    // 強制アタック予約をリセット
    //----------------------------------

    turnStartForcedAttackSummons = [];


    for(const summon of field){

        //----------------------------------
        // 破壊済みは除外
        //----------------------------------

        if(
            !summon ||
            summon.destroyed
        ){

            continue;

        }


        //----------------------------------
        // 一時パワーをリセット
        //----------------------------------

        summon.powerBonus = 0;


        //==================================
        // ターン開始時にタテ向きに
        // できない能力
        //
        // サイクロプス等
        //==================================

        const cannotReadyAtTurnStart =
            hasSummonAbility(
                summon,
                "cannotReadyAtTurnStart"
            );


        if(
            cannotReadyAtTurnStart
        ){

            //----------------------------------
            // 向きは変更しない
            //----------------------------------
            //
            // タテ向きならタテ向きのまま
            // ヨコ向きならヨコ向きのまま
            //----------------------------------

            console.log(
                "ターン開始時タテ向き不可",
                summon.card.name,
                "owner=",
                summon.owner,
                "isRest=",
                summon.isRest
            );


            //----------------------------------
            // 現在タテ向きなら
            // アタック可能
            //----------------------------------

            if(
                !summon.isRest
            ){

                summon.attackReady =
                    true;

            }


            //----------------------------------
            // 現在ヨコ向きなら
            // アタック不可
            //----------------------------------

            else{

                summon.attackReady =
                    false;

            }

        }

        else{

            //----------------------------------
            // 通常サモン
            // ターン開始時にタテ向き
            //----------------------------------

            summon.isRest =
                false;


            summon.view.setHorizontal(
                false
            );


            //----------------------------------
            // アタック可能
            //----------------------------------

            summon.attackReady =
                true;

        }


        //----------------------------------
        // ターン毎能力リセット
        //----------------------------------

        summon.abilityUsedThisTurn =
            false;


        //----------------------------------
        // サモン能力
        //
        // copySummonAbility は
        // 場に出たときのみ処理する
        //----------------------------------

        if(
            !hasSummonAbility(
                summon,
                "copySummonAbility"
            )
        ){

            applySummonAbility(
                summon
            );

        }


        //==================================
        // ワーウルフ系能力
        //
        // ここではアタックを開始しない。
        //
        // ターン開始処理がすべて
        // 終わったあとに実行するため
        // 予約だけしておく。
        //==================================

        if(
            summon.attackReady &&
            !summon.isRest &&
            hasSummonAbility(
                summon,
                "forceAttackWhenReady"
            )
        ){

            turnStartForcedAttackSummons.push(
                summon
            );


            console.log(
                "ターン開始時強制アタック予約",
                summon.card.name,
                "owner=",
                summon.owner
            );

        }

    }


    console.log(
        "ターン開始時強制アタック予約完了",
        turnStartForcedAttackSummons.map(
            summon =>
                summon.card.name
        )
    );

}

//======================================
// ターン開始時 強制アタック開始
//======================================

function startTurnForcedAttacks(){

    //----------------------------------
    // 予約なし
    //----------------------------------

    if(
        !Array.isArray(
            turnStartForcedAttackSummons
        ) ||
        turnStartForcedAttackSummons.length === 0
    ){

        console.log(
            "ターン開始時強制アタックなし"
        );

        return false;

    }


    //----------------------------------
    // 現在のターンプレイヤーだけ取得
    //----------------------------------

    const summons =
        turnStartForcedAttackSummons.filter(
            summon => {

                if(
                    !summon ||
                    summon.destroyed
                ){

                    return false;

                }


                //----------------------------------
                // 場にいるか
                //----------------------------------

                const onField =
                    playerField.includes(
                        summon
                    ) ||
                    enemyField.includes(
                        summon
                    );


                if(!onField){

                    return false;

                }


                //----------------------------------
                // 現在のターンプレイヤーか
                //----------------------------------

                if(
                    summon.owner !==
                    game.currentPlayer
                ){

                    return false;

                }


                //----------------------------------
                // 現在も能力を持っているか
                //----------------------------------

                if(
                    !hasSummonAbility(
                        summon,
                        "forceAttackWhenReady"
                    )
                ){

                    return false;

                }


                //----------------------------------
                // 現在もアタック可能か
                //----------------------------------

                if(
                    !summon.attackReady ||
                    summon.isRest
                ){

                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // 予約を消す
    //
    // 二重実行防止
    //----------------------------------

    turnStartForcedAttackSummons = [];


    //----------------------------------
    // 有効な対象なし
    //----------------------------------

    if(summons.length === 0){

        console.log(
            "ターン開始時強制アタック対象なし"
        );

        return false;

    }


    console.log(
        "================================"
    );

    console.log(
        "ターン開始処理完了 → 強制アタック開始",
        summons.map(
            summon =>
                summon.card.name
        )
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // 既存キューへ渡す
    //----------------------------------

    queueForcedAttacks(
        summons
    );


    return true;

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
    // ゲーム終了確認
    //----------------------------------

    if(
        battleGameEnding ||
        battleGameConceded
    ){

        console.log(
            "CPUターン開始中止：ゲーム終了"
        );

        return;

    }


    //----------------------------------
    // ターン数
    //----------------------------------

    game.turn++;


    console.log(
        "CPUターン開始"
    );


    game.state =
        TURN_STATE.START;


//==================================================
// ターン開始
// 両プレイヤーのカードプレイ枚数リセット
//==================================================

resetCardPlayCount(
    PLAYER
);

resetCardPlayCount(
    ENEMY
);


    //----------------------------------
    // CPU状態初期化
    //----------------------------------

    resetCpuTurnState();


    //----------------------------------
    // ターン開始表示
    //----------------------------------

    showTurnMessage(

        ENEMY,

        ()=>{

            //----------------------------------
            // サモンをタテ向き
            //
            // 強制アタックは予約のみ
            //----------------------------------

            readySummons(
                ENEMY
            );


            //----------------------------------
            // CPUターン開始処理へ
            //----------------------------------

            continueCpuTurnStart();

        }

    );

}

function continueCpuTurnStart(){

    //----------------------------------
    // ゲーム終了確認
    //----------------------------------

    if(
        battleGameEnding ||
        battleGameConceded
    ){

        return;

    }


    //----------------------------------
    // CPUターン確認
    //----------------------------------

    if(
        game.currentPlayer !== ENEMY
    ){

        return;

    }


    console.log(
        "CPUターン開始処理を継続"
    );


    //----------------------------------
    // CPUコスト回収
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
    // ターン中の行動開始
    //----------------------------------

    beginPlaying();


    //==================================
    // ターン開始処理完了後
    // ワーウルフ強制アタック開始
    //==================================

    const forcedAttackStarted =
        startTurnForcedAttacks();


    //----------------------------------
    // 強制アタックあり
    //
    // 通常CPU行動は
    // 強制アタック完了後に開始する
    //----------------------------------

    if(forcedAttackStarted){

        console.log(
            "CPU通常行動待機：",
            "強制アタック解決中"
        );

        return;

    }


    //----------------------------------
    // 強制アタックなし
    // 通常CPU行動開始
    //----------------------------------

    setTimeout(
        ()=>{

            startCpuAction();

        },
        1000
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


    //----------------------------------
    // 現在のプレイヤーを保存
    //----------------------------------
    //
    // switchPlayer() 前のプレイヤーが
    // 今ターンを終了するプレイヤー
    //----------------------------------

    const endingPlayer =
        game.currentPlayer;


    //----------------------------------
    // ターン終了イベント
    //----------------------------------

    emitGameEvent({

        type:
            GAME_EVENT.TURN_END,

        player:
            endingPlayer

    });


    //----------------------------------
    // 一時効果解除
    //----------------------------------

    resetTemporaryPower(
        endingPlayer
    );


    //----------------------------------
    // ターン終了効果
    //----------------------------------

    onTurnEnd();


    //----------------------------------
    // カーススモーク解除
    //
    // 「このターン中」の効果なので
    // ターン終了効果の解決後に解除
    //----------------------------------

    clearCurseSmokeStatus();


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