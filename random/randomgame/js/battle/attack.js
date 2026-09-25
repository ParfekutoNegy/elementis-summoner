//======================================
// attack.js
// アタック処理
//======================================


//======================================
// 攻撃状態管理
//======================================

let attackingSummon = null;

let attackMode = false;

let attackTarget = null;

let waitingAttackAfterResist = false;

//----------------------------------
// 強制アタック
//----------------------------------

let forcedAttackMode = false;

let forcedAttackQueue = [];

let cpuTurnStartWaitingForForcedAttack =
    false;

let playerTurnStartWaitingForForcedAttack =
    false;

//======================================
// ターン開始時 強制アタック予約
//======================================

let turnStartForcedAttackSummons = [];

//======================================
// ブロック状態管理
//======================================

let blockMode = false;

// 選択可能なブロッカー
let selectableBlockSummons = [];

// 実際にブロックしたサモン
let blockingSummon = null;


function startAttack(summon){

    //----------------------------------
    // プレイヤーのターン以外は攻撃開始不可
    //----------------------------------

    if(
        game.currentPlayer !== PLAYER
    ){

        console.log(
            "プレイヤーのターンではないため攻撃不可"
        );

        return;

    }


    //----------------------------------
    // サモン確認
    //----------------------------------

    if(!summon){

        return;

    }


    //----------------------------------
    // 自分のサモン以外は攻撃開始不可
    //----------------------------------

    if(
        summon.owner !== PLAYER
    ){

        console.log(
            "自分のサモンではないため攻撃不可",
            summon.card.name
        );

        return;

    }


    //----------------------------------
    // 召喚ターン攻撃可能能力
    //----------------------------------

    const canAttackOnSummonTurn =
        hasSummonAbility(
            summon,
            "summonTurnAttack"
        );


    //----------------------------------
    // 召喚したターンは通常攻撃不可
    //
    // summonTurnAttack を現在持っている場合は
    // 召喚ターンでも攻撃可能
    //----------------------------------

    if(
        !summon.attackReady &&
        !canAttackOnSummonTurn
    ){

        console.log(
            "召喚したターンなので攻撃できません"
        );

        return;

    }


    //----------------------------------
    // 行動済みサモン
    //----------------------------------

    if(summon.isRest){

        console.log(
            "このサモンは攻撃できません"
        );

        return;

    }


    //----------------------------------
    // 強敵存在時
    // アタック不可能力
    //----------------------------------

    if(
        typeof isOgreBattleLocked ===
            "function" &&
        isOgreBattleLocked(
            summon
        )
    ){

        console.log(
            "能力により攻撃できません",
            summon.card.name
        );

        return;

    }


    //----------------------------------
    // 攻撃開始
    //----------------------------------

    attackingSummon =
        summon;


    attackMode =
        true;


//----------------------------------
// 攻撃対象選択案内
//----------------------------------

if(
    typeof forcedAttackMode !==
        "undefined" &&
    forcedAttackMode
){

    showActionGuide(
        `${summon.card.name}の強制アタック！<br>アタック対象を選んでください`
    );

}
else{

    showActionGuide(
        "アタック対象を選んでください"
    );

}


    //----------------------------------
    // 攻撃対象発光
    //----------------------------------

    highlightAttackTargets();


    //----------------------------------
    // 表示更新
    //----------------------------------

    updateGameState();


    console.log(
        "攻撃開始",
        summon.card.name,
        "summonTurnAttack=",
        canAttackOnSummonTurn
    );

}

function queueForcedAttacks(
    summons
){

    //----------------------------------
    // 対象確認
    //----------------------------------

    if(
        !Array.isArray(summons) ||
        summons.length === 0
    ){

        return;

    }


    //----------------------------------
    // キューへ追加
    //----------------------------------

    for(const summon of summons){

        if(
            !summon ||
            summon.destroyed
        ){

            continue;

        }


        if(
            !hasSummonAbility(
                summon,
                "forceAttackWhenReady"
            )
        ){

            continue;

        }


        //----------------------------------
        // 重複登録防止
        //----------------------------------

        if(
            forcedAttackQueue.includes(
                summon
            )
        ){

            continue;

        }


        forcedAttackQueue.push(
            summon
        );

    }


    console.log(
        "強制アタックキュー",
        forcedAttackQueue.map(
            summon =>
                summon.card.name
        )
    );


    //----------------------------------
    // 解決開始
    //----------------------------------

    startNextForcedAttack();

}

function startNextForcedAttack(){

    //----------------------------------
    // すでに強制アタック中
    //----------------------------------

    if(forcedAttackMode){

        return;

    }


//----------------------------------
// キューなし
//----------------------------------

if(
    forcedAttackQueue.length === 0
){

    console.log(
        "強制アタック全解決完了"
    );


    //==================================
    // CPUターンの場合
    //
    // ターン開始処理はすでに完了している。
    // ここから通常CPU行動へ進む。
    //==================================

    if(
        game.currentPlayer === ENEMY
    ){

        console.log(
            "CPU強制アタック完了 → 通常行動開始"
        );


        setTimeout(
            ()=>{

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


                startCpuAction();

            },
            500
        );


        return;

    }


    //==================================
    // PLAYER
    //
    // 強制アタック終了後は
    // そのまま通常行動へ戻る
    //==================================

    if(
        game.currentPlayer === PLAYER
    ){

        console.log(
            "PLAYER強制アタック完了 → 通常行動へ"
        );


        updateGameState();

        updateButtons();


        return;

    }


    return;

}


    //----------------------------------
    // 次のサモン
    //----------------------------------

    const summon =
        forcedAttackQueue.shift();


    //----------------------------------
    // サモン確認
    //----------------------------------

    if(!summon){

        startNextForcedAttack();

        return;

    }


    //----------------------------------
    // 現在も場にいるか
    //----------------------------------

    const onField =
        playerField.includes(
            summon
        ) ||
        enemyField.includes(
            summon
        );


    if(
        summon.destroyed ||
        !onField
    ){

        console.log(
            "強制アタック対象が場にいないためスキップ",
            summon.card?.name
        );


        startNextForcedAttack();

        return;

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

        console.log(
            "強制アタック能力を失っているためスキップ",
            summon.card.name
        );


        startNextForcedAttack();

        return;

    }


    //----------------------------------
    // 現在も攻撃可能状態か
    //----------------------------------

    if(
        !summon.attackReady ||
        summon.isRest
    ){

        console.log(
            "現在アタックできないためスキップ",
            summon.card.name
        );


        startNextForcedAttack();

        return;

    }


    //----------------------------------
    // オーガ等による攻撃禁止
    //----------------------------------

    if(
        typeof isOgreBattleLocked ===
            "function" &&
        isOgreBattleLocked(
            summon
        )
    ){

        console.log(
            "能力によりアタックできないためスキップ",
            summon.card.name
        );


        startNextForcedAttack();

        return;

    }


    //----------------------------------
    // 強制アタック開始
    //----------------------------------

    forcedAttackMode =
        true;


    console.log(
        "================================"
    );

    console.log(
        "強制アタック開始",
        summon.card.name,
        "owner=",
        summon.owner
    );

    console.log(
        "================================"
    );


    //==================================
    // PLAYER
    //==================================

    if(
        summon.owner === PLAYER
    ){

        //----------------------------------
        // PLAYERは攻撃対象を
        // 手動で選択する
        //----------------------------------

        startAttack(
            summon
        );


        return;

    }


    //==================================
    // CPU
    //==================================

    if(
        summon.owner === ENEMY
    ){

        //----------------------------------
        // 攻撃サモン設定
        //----------------------------------

        attackingSummon =
            summon;


        //----------------------------------
        // CPUの攻撃対象決定
        //----------------------------------

        const target =
            selectCpuAttackTarget(
                summon
            );


        //----------------------------------
        // 対象なし
        //----------------------------------

        if(!target){

            console.log(
                "CPUワーウルフ：",
                "攻撃対象なし"
            );


            forcedAttackMode =
                false;


            attackingSummon =
                null;


            startNextForcedAttack();


            return;

        }


        //----------------------------------
        // ログ
        //----------------------------------

        console.log(
            "CPUワーウルフ強制アタック",
            summon.card.name,
            "→",
            target instanceof Summon
                ? target.card.name
                : target
        );


        //----------------------------------
        // 少し間を置いてアタック
        //----------------------------------

        setTimeout(
            () => {

                //----------------------------------
                // ゲーム終了確認
                //----------------------------------

                if(
                    battleGameEnding ||
                    battleGameConceded
                ){

                    forcedAttackMode =
                        false;

                    attackingSummon =
                        null;


                    return;

                }


                //----------------------------------
                // サモンがまだ場にいるか
                //----------------------------------

                if(
                    summon.destroyed ||
                    !enemyField.includes(
                        summon
                    )
                ){

                    forcedAttackMode =
                        false;

                    attackingSummon =
                        null;


                    startNextForcedAttack();


                    return;

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

                    console.log(
                        "CPU強制アタック：",
                        "能力を失ったため中止",
                        summon.card.name
                    );


                    forcedAttackMode =
                        false;

                    attackingSummon =
                        null;


                    startNextForcedAttack();


                    return;

                }


                //----------------------------------
                // 現在も攻撃可能か
                //----------------------------------

                if(
                    !summon.attackReady ||
                    summon.isRest
                ){

                    console.log(
                        "CPU強制アタック：",
                        "アタックできないため中止",
                        summon.card.name
                    );


                    forcedAttackMode =
                        false;

                    attackingSummon =
                        null;


                    startNextForcedAttack();


                    return;

                }


                //----------------------------------
                // 強制アタック実行
                //----------------------------------

                executeAttack(
                    summon,
                    target
                );

            },
            500
        );


        return;

    }


    //----------------------------------
    // 所有者不明
    //----------------------------------

    console.warn(
        "強制アタック：所有者不明",
        summon.card?.name
    );


    forcedAttackMode =
        false;

    attackingSummon =
        null;


    startNextForcedAttack();

}

//======================================
// アタック対象選択キャンセル
//======================================

function cancelAttack(){

    console.log(
        "アタック対象選択キャンセル"
    );


    //----------------------------------
    // 攻撃対象発光解除
    //----------------------------------

    clearAttackHighlight();


    //----------------------------------
    // 攻撃状態解除
    //----------------------------------

    attackMode = false;

    attackingSummon = null;

    attackTarget = null;


    //----------------------------------
    // 案内を消す
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();


    //----------------------------------
    // ゲーム状態更新
    //----------------------------------

    updateGameState();

}

//======================================
// 攻撃中確認
//======================================

function isAttacking(){

    return attackingSummon !== null;

}



//======================================
// 攻撃対象クリック
//======================================

function clickAttackTarget(target){


    if(!attackingSummon){

        return;

    }


    console.log(
        "攻撃対象決定",
        target
    );


    executeAttack(
        attackingSummon,
        target
    );


}


//==================================================
// 強敵存在時 アタック・ブロック不可能力
//
// ability:
// cannotBattleAgainstStrongEnemy
//
// 相手の場に、このサモン以上の
// 現在パワーを持つサモンがいる場合
// アタック・ブロック不可
//==================================================

function isOgreBattleLocked(summon){

    //----------------------------------
    // サモン確認
    //----------------------------------

    if(
        !summon ||
        !summon.card
    ){

        return false;

    }


    //----------------------------------
    // 対象能力を持っているか
    //----------------------------------

    if(
        !hasSummonAbility(
            summon,
            "cannotBattleAgainstStrongEnemy"
        )
    ){

        return false;

    }


    //----------------------------------
    // 相手フィールド取得
    //----------------------------------

    const opponentField =
        summon.owner === PLAYER
            ? enemyField
            : playerField;


    //----------------------------------
    // 自身の現在パワー
    //----------------------------------

    const ownPower =
        getPower(summon);


    //----------------------------------
    // デバッグ
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "cannotBattleAgainstStrongEnemy 判定"
    );

    console.log(
        "使用サモン=",
        summon.card.name
    );

    console.log(
        "owner=",
        summon.owner
    );

    console.log(
        "自身パワー=",
        ownPower
    );


    //----------------------------------
    // 相手フィールド確認
    //----------------------------------

    for(
        const opponentSummon
        of opponentField
    ){

        //----------------------------------
        // 存在確認
        //----------------------------------

        if(
            !opponentSummon ||
            !opponentSummon.card
        ){

            continue;

        }


        //----------------------------------
        // 破壊済み除外
        //----------------------------------

        if(
            opponentSummon.destroyed
        ){

            continue;

        }


        //----------------------------------
        // 相手の現在パワー
        //----------------------------------

        const opponentPower =
            getPower(
                opponentSummon
            );


        console.log(
            "相手サモン=",
            opponentSummon.card.name,
            "power=",
            opponentPower
        );


        //----------------------------------
        // 自分以上のパワーが存在
        //----------------------------------

        if(
            opponentPower >=
            ownPower
        ){

            console.log(
                "戦闘不可",
                summon.card.name,
                "相手=",
                opponentSummon.card.name
            );


            console.log(
                "================================"
            );


            return true;

        }

    }


    //----------------------------------
    // 戦闘可能
    //----------------------------------

    console.log(
        "戦闘可能",
        summon.card.name
    );

    console.log(
        "================================"
    );


    return false;

}

//======================================
// 攻撃可能判定
//======================================

function canAttack(target){

    if(!attackingSummon){

        return false;

    }


    //----------------------------------
    // 召喚ターン攻撃可能能力
    //----------------------------------

    const canAttackOnSummonTurn =
        hasSummonAbility(
            attackingSummon,
            "summonTurnAttack"
        );


    //----------------------------------
    // 召喚したターンは攻撃不可
    //----------------------------------

    if(
        !attackingSummon.attackReady &&
        !canAttackOnSummonTurn
    ){

        console.log(
            "召喚ターンのため攻撃不可"
        );

        return false;

    }


    //----------------------------------
    // 行動済みサモン
    //----------------------------------

    if(attackingSummon.isRest){

        console.log(
            "行動済みサモン"
        );

        return false;

    }


    //----------------------------------
    // サモン攻撃の場合
    //----------------------------------

    if(target instanceof Summon){

        //----------------------------------
        // 自分の場のサモンには攻撃不可
        //----------------------------------

        if(
            target.owner ===
            attackingSummon.owner
        ){

            console.log(
                "自分の場のサモンには攻撃不可",
                target.card.name
            );

            return false;

        }


        //----------------------------------
        // タテ向きサモンへの攻撃
        //----------------------------------

        if(!target.isRest){

            //----------------------------------
            // タテ向き攻撃可能能力
            //----------------------------------

            const canAttackVertical =
                hasSummonAbility(
                    attackingSummon,
                    "attackVerticalSummon"
                );


            //----------------------------------
            // タテ向き攻撃可能能力がない
            //----------------------------------

            if(
                !canAttackVertical
            ){

                console.log(
                    "待機状態サモンには攻撃不可"
                );

                return false;

            }


            console.log(
                "タテ向きサモンへの攻撃可能",
                attackingSummon.card.name
            );

        }

    }


    return true;

}

//======================================
// 戦闘実行
//======================================

function executeAttack(
    attacker,
    target
){

    //----------------------------------
    // 攻撃対象選択案内を消す
    //----------------------------------

    hideActionGuide();


    console.log(
        "=== executeAttack ===",
        {
            attacker:
                attacker.owner,

            attackerName:
                attacker.card.name,

            target:
                target
        }
    );


    attackingSummon =
        attacker;


    //----------------------------------
    // バトルログ用情報
    //----------------------------------

    const attackerName =
        attacker.card.name;


    const attackerOwner =
        attacker.owner === PLAYER
            ? "PLAYER"
            : "CPU";


    let targetName;


    //----------------------------------
    // 攻撃対象
    //----------------------------------

    if(target instanceof Summon){

        targetName =
            target.card.name;

    }

    else if(
        target === PLAYER ||
        target === "player"
    ){

        targetName =
            "PLAYER";

    }

    else if(
        target === ENEMY ||
        target === "enemy"
    ){

        targetName =
            "CPU";

    }

    else{

        targetName =
            "不明";

    }


//----------------------------------
// 攻撃可能確認
//----------------------------------

if(!canAttack(target)){

    console.log(
        "攻撃対象外",
        target?.card?.name ??
        target
    );


    //==================================
    // ワーウルフ強制アタック中
    //==================================

    if(
        typeof forcedAttackMode !==
            "undefined" &&
        forcedAttackMode
    ){

        console.log(
            "ワーウルフ：",
            "攻撃できない対象のため",
            "強制アタックを継続"
        );


        //----------------------------------
        // 攻撃状態は終了させない
        //----------------------------------

        showActionGuide(
            `${attacker.card.name}の強制アタック！<br>アタック対象を選んでください`
        );


        highlightAttackTargets();


        updateGameState();

        updateButtons();


        return false;

    }


    //==================================
    // 通常アタック
    //==================================

    finishAttack();


    return false;

}


    //----------------------------------
    // 攻撃ログ
    //----------------------------------

    addBattleLog(
        `${attackerOwner}：${attackerName} → ${targetName}を攻撃`
    );


    //==================================
    // 攻撃時能力
    //==================================

    if(
        target instanceof Summon &&
        target.isRest
    ){

        //----------------------------------
        // ヨコ向きサモンにアタックしたとき
        // このターン中パワーアップ
        //
        // 複数能力対応
        //----------------------------------

        const powerUpAbility =
            getSummonAbility(
                attackingSummon,
                "powerUpWhenAttackRestSummon"
            );


        if(
            powerUpAbility
        ){

            const value =
                Number(
                    powerUpAbility.value
                ) || 0;


            if(value > 0){

                addTemporaryPower(
                    attackingSummon,
                    value
                );


                console.log(
                    "サモン能力発動：",
                    attackingSummon.card.name,
                    "ヨコ向きサモンへの攻撃",
                    "パワー+",
                    value,
                    "現在パワー=",
                    getPower(
                        attackingSummon
                    )
                );


                addBattleLog(
                    `${attackingSummon.card.name}の能力発動：このターン中パワー＋${value}`
                );

            }

        }

    }


    //----------------------------------
    // 攻撃済み状態
    //----------------------------------

    attackingSummon.isRest =
        true;


    attackingSummon.view.setHorizontal(
        true
    );


    //----------------------------------
    // サモン同士の戦闘
    //----------------------------------

    if(target instanceof Summon){

        //----------------------------------
        // バジリスク：バトル相手を記録
        //----------------------------------

        setBasiliskBattleTarget(
            attackingSummon,
            target
        );


        //----------------------------------
        // ダメージ交換
        //----------------------------------

        dealDamage(
            target,
            getPower(
                attackingSummon
            )
        );


        dealDamage(
            attackingSummon,
            getPower(
                target
            )
        );

    }


    //----------------------------------
    // CPU → PLAYER
    //----------------------------------

    else if(
        target === PLAYER ||
        target === "player"
    ){

        console.log(
            "プレイヤーへの攻撃"
        );


        //----------------------------------
        // ブロッカー確認
        //----------------------------------

        const blockers =
            findBlockSummons();


        if(blockers.length > 0){

            console.log(
                "ブロック可能",
                blockers.length
            );


            startBlock(
                blockers
            );


            return "WAIT_BLOCK";

        }


        //----------------------------------
        // ブロックなし
        //----------------------------------

        damagePlayer(

            PLAYER,

            getPower(
                attackingSummon
            ),

            false,

            attackingSummon.card

        );


        //----------------------------------
        // レジスト中なら停止
        //----------------------------------

        if(resistMode){

            console.log(
                "レジスト中なので戦闘終了停止"
            );

            return "WAIT_RESIST";

        }

    }


    //----------------------------------
    // PLAYER → CPU
    //----------------------------------

    else if(
        target === ENEMY ||
        target === "enemy"
    ){

        console.log(
            "CPUへの攻撃"
        );


        //----------------------------------
        // CPUブロッカー確認
        //----------------------------------

        const blockers =
            findBlockSummons();


        if(blockers.length > 0){

            console.log(
                "CPUブロック可能",
                blockers.map(
                    summon =>
                        summon.card.name
                )
            );


            //----------------------------------
            // CPUがブロックするか判断
            //----------------------------------

            const shouldBlock =
                cpuShouldBlock(
                    blockers,
                    attackingSummon
                );


            if(shouldBlock){

                console.log(
                    "CPUブロック"
                );


                executeCpuBlock(
                    blockers,
                    attackingSummon
                );


                return;

            }


            console.log(
                "CPUブロックしない"
            );

        }


        //----------------------------------
        // CPUへのダメージ
        //----------------------------------

        damagePlayer(

            ENEMY,

            getPower(
                attackingSummon
            ),

            false,

            attackingSummon.card

        );


        //----------------------------------
        // レジスト待機
        //----------------------------------

        if(resistMode){

            console.log(
                "CPUへのダメージ：レジスト待機"
            );


            return "WAIT_RESIST";

        }

    }


    //----------------------------------
    // レジスト中なら戦闘終了しない
    //----------------------------------

    if(resistMode){

        console.log(
            "レジスト中なので戦闘終了停止"
        );


        return;

    }


    //----------------------------------
    // バトル解決
    //----------------------------------

    setTimeout(()=>{

        resolveBattle();

        finishAttack();

    },1000);

}

//======================================
// 攻撃終了
//======================================
function finishAttack(){

    //----------------------------------
    // 今回が強制アタックだったか保存
    //----------------------------------

    const wasForcedAttack =
        typeof forcedAttackMode !==
            "undefined" &&
        forcedAttackMode;


    //----------------------------------
    // 攻撃対象発光解除
    //----------------------------------

    clearAttackHighlight();


    //----------------------------------
    // 攻撃モード終了
    //----------------------------------

    attackMode = false;


    //----------------------------------
    // 攻撃終了ログ
    //----------------------------------

    if(attackingSummon){

        console.log(
            "攻撃終了",
            attackingSummon.card.name,
            "forced=",
            wasForcedAttack
        );

    }


    //----------------------------------
    // 攻撃状態解除
    //----------------------------------

    attackingSummon = null;

    attackTarget = null;


    //==================================
    // 重要
    //==================================
    //
    // ここではレジスト状態を解除しない。
    //
    // currentResistEvent
    // resistMode
    // selectableResistCards
    // resistUsingCard
    // selectedResistCostCards
    // resistCostConfirm
    //
    // は finishResist() 側で終了させる。
    //==================================


    //----------------------------------
    // ブロック発光解除
    //----------------------------------

    for(
        const summon of
        selectableBlockSummons
    ){

        summon.view.setHighlight(
            false
        );

    }


    //----------------------------------
    // ブロック状態終了
    //----------------------------------

    blockMode = false;

    selectableBlockSummons = [];

    blockingSummon = null;


    //----------------------------------
    // 強制アタック終了
    //----------------------------------

    if(wasForcedAttack){

        forcedAttackMode =
            false;

        console.log(
            "ワーウルフ：強制アタック終了"
        );

    }


    //----------------------------------
    // ゲーム状態更新
    //----------------------------------

    updateGameState();


    //==================================
    // 次の強制アタック
    //==================================

    if(wasForcedAttack){

        //----------------------------------
        // クール時誘発能力の解決中なら
        // ここでは開始しない
        //----------------------------------

        if(
            typeof coolTriggerResolving !==
                "undefined" &&
            coolTriggerResolving
        ){

            console.log(
                "ワーウルフ：",
                "クール時誘発能力の解決待ち"
            );

            return;

        }


        //----------------------------------
        // 次の強制アタックへ
        //----------------------------------

        setTimeout(
            () => {

                if(
                    typeof startNextForcedAttack ===
                        "function"
                ){

                    startNextForcedAttack();

                }

            },
            100
        );

    }

}


//======================================
// 攻撃対象表示
//======================================

function highlightAttackTargets(){

    //----------------------------------
    // タテ向きサモン攻撃可能能力
    //
    // 複数能力対応
    //----------------------------------

    const canAttackVertical =
        attackingSummon
            ? hasSummonAbility(
                attackingSummon,
                "attackVerticalSummon"
            )
            : false;


    //----------------------------------
    // 相手サモン
    //----------------------------------

    enemyField.forEach(
        summon => {

            //----------------------------------
            // 通常
            // ヨコ向きサモンのみ
            //----------------------------------

            if(summon.isRest){

                summon.view.setTarget(
                    true
                );

                return;

            }


            //----------------------------------
            // タテ向きサモンも攻撃可能
            //----------------------------------

            if(canAttackVertical){

                summon.view.setTarget(
                    true
                );

            }

        }
    );


    //----------------------------------
    // CPUプレイヤー
    //----------------------------------

    const icon =
        document.getElementById(
            "enemy-player-icon"
        );


    if(icon){

        icon.classList.add(
            "attack-target"
        );

    }

}


//======================================
// 表示解除
//======================================

function clearAttackHighlight(){


    enemyField.forEach(summon=>{


        summon.view.setTarget(false);


    });


    const icon =
    document.getElementById(
        "enemy-player-icon"
    );


    if(icon){

        icon.classList.remove(
            "attack-target"
        );

    }

}



//======================================
// プレイヤーダメージ
//======================================

function damagePlayer(
    player,
    damage,
    skipResist = false,
    sourceCard = null
){

    console.log(
        "damagePlayer source",
        sourceCard,
        sourceCard?.elementType
    );


    //----------------------------------
    // 元ダメージを保存
    //----------------------------------

    const originalDamage =
        damage;


    //==================================
    // プレイヤーダメージ軽減能力
    //
    // reducePlayerDamage を持つ
    // すべてのサモンの軽減値を合計する
    //
    // ガーゴイル複数体
    // ドッペルゲンガーによるコピー
    // の両方に対応
    //==================================

    const field =
        player === PLAYER
            ? playerField
            : enemyField;


    //----------------------------------
    // 軽減値合計
    //----------------------------------

    let totalReduction = 0;


    //----------------------------------
    // 能力保持サモン
    //----------------------------------

    const reducingSummons = [];


    field.forEach(
        summon => {

            //----------------------------------
            // 無効なサモン
            //----------------------------------

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return;

            }


            //----------------------------------
            // ダメージ軽減能力取得
            //----------------------------------

            const reduceAbility =
                getSummonAbility(
                    summon,
                    "reducePlayerDamage"
                );


            if(!reduceAbility){

                return;

            }


            //----------------------------------
            // 軽減値
            //----------------------------------

            const reduction =
                reduceAbility.value ?? 1;


            //----------------------------------
            // 合計
            //----------------------------------

            totalReduction +=
                reduction;


            reducingSummons.push({

                summon:
                    summon,

                reduction:
                    reduction

            });

        }
    );


    //----------------------------------
    // ダメージ軽減
    //----------------------------------

    if(totalReduction > 0){

        damage =
            Math.max(
                0,
                damage - totalReduction
            );


        console.log(
            "================================"
        );

        console.log(
            "プレイヤーダメージ軽減"
        );

        console.log(
            "元ダメージ=",
            originalDamage
        );


        reducingSummons.forEach(
            data => {

                console.log(
                    "能力保持サモン=",
                    data.summon.card.name,
                    "軽減=",
                    data.reduction
                );

            }
        );


        console.log(
            "合計軽減=",
            totalReduction
        );

        console.log(
            "軽減後=",
            damage
        );

        console.log(
            "================================"
        );

    }


    //----------------------------------
    // レジストをスキップする場合
    //----------------------------------

    if(skipResist){

        console.log(
            "レジストスキップ：確定ダメージ",
            damage
        );


        //----------------------------------
        // バトルログ
        //----------------------------------

        if(damage > 0){

            const damageTarget =
                player === PLAYER
                    ? "PLAYER"
                    : "CPU";


            addBattleLog(
                `${damageTarget}：${damage}ダメージ`
            );

        }


        //----------------------------------
        // ダメージ適用
        //----------------------------------

        applyPlayerDamage(
            player,
            damage
        );


        return;

    }


    //----------------------------------
    // レジスト用イベント作成
    //----------------------------------

    const event = {

        type:
            GAME_EVENT.BEFORE_PLAYER_DAMAGE,

        player:
            player,

        damage:
            damage,

        source:
            sourceCard,

        sourceType:
            sourceCard?.type,

        element:
            sourceCard?.elementType

    };


    //----------------------------------
    // レジスト確認
    //----------------------------------

    const resist =
        emitGameEvent(event);


    //----------------------------------
    // レジスト待機
    //----------------------------------

    if(resist){

        console.log(
            "レジスト待機",
            "軽減後ダメージ=",
            event.damage
        );


        pendingDamage = {

            event:
                event

        };


        return;

    }


    //----------------------------------
    // レジストなし
    //----------------------------------

    const finalDamage =
        event.damage;


    console.log(
        "レジストなし：確定ダメージ",
        finalDamage
    );


    //----------------------------------
    // バトルログ
    //----------------------------------

    if(finalDamage > 0){

        const damageTarget =
            player === PLAYER
                ? "PLAYER"
                : "CPU";


        addBattleLog(
            `${damageTarget}：${finalDamage}ダメージ`
        );

    }


    //----------------------------------
    // ダメージ適用
    //----------------------------------

    applyPlayerDamage(
        player,
        finalDamage
    );

}

function applyPlayerDamage(
    player,
    damage
){

    if(player === PLAYER){

        game.playerLife -= damage;


        showPlayerDamageNumber(
            "player",
            damage
        );


    }else{

        game.enemyLife -= damage;


        showPlayerDamageNumber(
            "enemy",
            damage
        );

    }


    updateLifeDisplay();

    checkGameOver();

}


//======================================
// ライフ表示更新
//======================================

function updateLifeDisplay(){

    const playerLife =
        document.getElementById(
            "player-life-value"
        );

    if(playerLife){

        playerLife.textContent =
            game.playerLife;

    }


    const enemyLife =
        document.getElementById(
            "enemy-life-value"
        );

    if(enemyLife){

        enemyLife.textContent =
            game.enemyLife;

    }

}



//======================================
// 勝敗判定
//======================================
function checkGameOver(){

    //----------------------------------
    // プレイヤー敗北
    //----------------------------------

    if(game.playerLife <= 0){

        //----------------------------------
        // CPU行動を強制停止
        //----------------------------------

        battleGameEnding = true;

        finishBattleGame(
            ENEMY
        );

        return;

    }


    //----------------------------------
    // プレイヤー勝利
    //----------------------------------

    if(game.enemyLife <= 0){

        //----------------------------------
        // CPU行動を強制停止
        //----------------------------------

        battleGameEnding = true;

        finishBattleGame(
            PLAYER
        );

        return;

    }

}


//======================================
// 完全リセット
//======================================

function resetAttackState(){

    hideActionGuide();
    
    attackingSummon = null;

    attackTarget = null;

    attackMode = false;


    clearAttackHighlight();


    console.log(
        "攻撃状態リセット"
    );

}

//======================================
// ブロックしない
//======================================

function skipBlock(){

    hideActionGuide();


    console.log(
        "ブロックしない"
    );


    //----------------------------------
    // ブロック状態解除
    //----------------------------------

    blockMode =
        false;


    selectableBlockSummons =
        [];


    //----------------------------------
    // ハイライト解除
    //----------------------------------

    playerField.forEach(
        summon => {

            summon.view.setHighlight(
                false
            );

        }
    );


    //----------------------------------
    // 攻撃者確認
    //----------------------------------

    if(!attackingSummon){

        console.log(
            "ブロックなし：攻撃者なし"
        );


        finishAttack();

        return;

    }


    //----------------------------------
    // プレイヤーへのダメージ
    //
    // ★重要
    //
    // ここで必ず
    //
    // 攻撃力
    // ↓
    // ガーゴイル軽減
    // ↓
    // レジスト
    //
    // の順番にする
    //----------------------------------

    damagePlayer(

        PLAYER,

        getPower(attackingSummon),

        false,

        attackingSummon.card

    );


    //----------------------------------
    // レジスト待機
    //----------------------------------

    if(resistMode){

        console.log(
            "レジスト待機"
        );


        waitingAttackAfterResist =
            true;


        return;

    }


    //----------------------------------
    // レジストなし
    //----------------------------------

    resolveBattle();


    finishAttack();


    //----------------------------------
    // CPU攻撃なら次へ
    //----------------------------------

    if(
        game.currentPlayer === ENEMY
    ){

        cpuAttackIndex++;


        setTimeout(
            cpuNextAttack,
            2000
        );

    }

}

//======================================
// レジスト終了後に攻撃再開
//======================================

function resumePlayerDamage(){

    if(!currentResistEvent){

        console.log(
            "レジスト後ダメージ：イベントなし"
        );

        return;

    }


    //----------------------------------
    // イベント取得
    //----------------------------------

    const event =
        currentResistEvent;


    //----------------------------------
    // 最終ダメージ
    //
    // ガーゴイル軽減とレジスト処理は
    // すでにイベント側で完了している
    //----------------------------------

    const finalDamage =
        Math.max(
            0,
            event.damage
        );


    console.log(
        "レジスト後ダメージ",
        finalDamage
    );


    //----------------------------------
    // ダメージ0
    //----------------------------------

    if(finalDamage <= 0){

        console.log(
            "ダメージ無効"
        );


        currentResistEvent =
            null;


        resolveBattle();

        finishAttack();


        return;

    }


    //----------------------------------
    // プレイヤーへのダメージ
    //
    // ★ damagePlayer() は呼ばない
    //----------------------------------

    applyPlayerDamage(

        event.player,

        finalDamage

    );


    //----------------------------------
    // AFTERイベント
    //----------------------------------

    emitGameEvent({

        type:
            GAME_EVENT.AFTER_PLAYER_DAMAGE,

        player:
            event.player,

        damage:
            finalDamage

    });


    //----------------------------------
    // イベント終了
    //----------------------------------

    currentResistEvent =
        null;


    //----------------------------------
    // 戦闘解決
    //----------------------------------

    resolveBattle();

    finishAttack();

}

//======================================
// 場の使用可能表示更新
//======================================

function updateAttackHighlight(){

    playerField.forEach(
        summon => {

            //----------------------------------
            // オーガ等
            // 強敵存在時の戦闘不可確認
            //----------------------------------

            const battleLocked =
                typeof isOgreBattleLocked ===
                    "function"
                    ?
                    isOgreBattleLocked(
                        summon
                    )
                    :
                    false;


            //----------------------------------
            // 召喚ターン攻撃可能能力
            //----------------------------------

            const canAttackOnSummonTurn =
                hasSummonAbility(
                    summon,
                    "summonTurnAttack"
                );


            //----------------------------------
            // アタック可能判定
            //----------------------------------

            const canAttackNow =

                game.currentPlayer === PLAYER &&

                (
                    summon.attackReady ||
                    canAttackOnSummonTurn
                ) &&

                !summon.isRest &&

                !summon.destroyed &&

                !battleLocked &&

                !summonCard &&

                !magiaCard &&

                !resistUsingCard &&

                !attackMode;


            //----------------------------------
            // 起動能力使用可能判定
            //----------------------------------

            const canUseAbilityNow =

                !summonCard &&

                !magiaCard &&

                !resistUsingCard &&

                !attackMode &&

                typeof canUseSummonAbility ===
                    "function" &&

                canUseSummonAbility(
                    summon
                );


            //----------------------------------
            // 発光
            //
            // アタック可能
            // または
            // 起動能力使用可能
            //----------------------------------

            const canAct =

                canAttackNow ||
                canUseAbilityNow;


            summon.view.setHighlight(
                canAct
            );

        }
    );

}

function findBlockSummons(){

    //----------------------------------
    // 攻撃者確認
    //----------------------------------

    if(!attackingSummon){

        return [];

    }


    //----------------------------------
    // 攻撃者のブロック不可能力
    //
    // 複数能力対応
    //----------------------------------

    if(
        hasSummonAbility(
            attackingSummon,
            "cannotBeBlocked"
        )
    ){

        console.log(
            "ブロック不可",
            attackingSummon.card.name
        );


        return [];

    }


    const result = [];


    //----------------------------------
    // 攻撃者によってブロック側を変更
    //----------------------------------

    const field =
        attackingSummon.owner === PLAYER
            ? enemyField
            : playerField;


    //----------------------------------
    // ブロック可能サモンを確認
    //----------------------------------

    for(const summon of field){

        //----------------------------------
        // 横向きサモン除外
        //----------------------------------

        if(summon.isRest){

            continue;

        }


        //----------------------------------
        // 破壊済み除外
        //----------------------------------

        if(summon.destroyed){

            continue;

        }


        //----------------------------------
        // オーガ能力
        //
        // 相手の場に自身以上のパワーの
        // サモンがいる場合ブロック不可
        //----------------------------------

        if(
            isOgreBattleLocked(
                summon
            )
        ){

            console.log(
                "オーガ能力によりブロック不可",
                summon.card.name
            );


            continue;

        }


        //----------------------------------
        // ブロック可能
        //----------------------------------

        result.push(
            summon
        );

    }


    return result;

}
//======================================
// ブロック開始
//======================================

function startBlock(blockers){

    console.log(
        "ブロック開始"
    );

    //----------------------------------
    // 行動案内
    //----------------------------------

    showActionGuide(
        "ブロックを行いますか？"
    );

    //----------------------------------
    // ブロックモード開始
    //----------------------------------

    blockMode = true;
   
    //----------------------------------
    // 選択可能サモン保存
    //----------------------------------

    selectableBlockSummons = blockers;
    updateButtons();
 
    //----------------------------------
    // ブロック可能サモンを発光
    //----------------------------------

    for(const summon of blockers){

        summon.view.setHighlight(
            true
        );

    }

}

//======================================
// ブロック実行
//======================================

function executeBlock(blocker){

    hideActionGuide();


    console.log(
        "executeBlock ゴーレム確認",
        blocker?.card?.name,
        blocker?.ability
    );


    //----------------------------------
    // ブロッカー保存
    //----------------------------------

    blockingSummon =
        blocker;


    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `PLAYER：${blocker.card.name}が${attackingSummon.card.name}をブロック`
    );


    //----------------------------------
    // 横向きにする
    //----------------------------------

    blocker.isRest =
        true;


    blocker.view.setHorizontal(
        true
    );


    //----------------------------------
    // バジリスク：
    // バトル相手を記録
    //----------------------------------

    setBasiliskBattleTarget(
        attackingSummon,
        blocker
    );


    //----------------------------------
    // ブロッカーから攻撃者へのダメージ
    //----------------------------------

    dealDamage(
        attackingSummon,
        getPower(
            blocker
        )
    );


    //----------------------------------
    // ゴーレム
    // ブロック時はダメージを受けない
    //----------------------------------

    if(
        hasSummonAbility(
            blocker,
            "noDamageWhenBlocking"
        )
    ){

        console.log(
            "ゴーレム：ブロック時のダメージ無効",
            blocker.card.name
        );

    }
    else{

        dealDamage(
            blocker,
            getPower(
                attackingSummon
            )
        );

    }


    //==================================
    // 今回が強制アタックか保存
    //==================================

    const wasForcedAttack =
        typeof forcedAttackMode !==
            "undefined" &&
        forcedAttackMode;


    //----------------------------------
    // 戦闘解決
    //----------------------------------

    resolveBattle();


    //----------------------------------
    // 攻撃終了
    //----------------------------------

    finishAttack();

    hideActionGuide();


    //==================================
    // 強制アタックだった場合
    //
    // finishAttack() →
    // startNextForcedAttack()
    //
    // に任せる
    //==================================

    if(wasForcedAttack){

        console.log(
            "CPU強制アタック：",
            "ブロック後の通常攻撃継続処理をスキップ"
        );

        return;

    }


    //----------------------------------
    // 通常CPU攻撃なら次へ
    //----------------------------------

    if(
        game.currentPlayer === ENEMY
    ){

        console.log(
            "CPU：ブロック処理完了、次の攻撃へ"
        );


        setTimeout(
            cpuNextAttack,
            2000
        );

    }

}


function executeCpuBlock(
    blockers,
    attacker
){

    console.log(
        "=== CPUブロック実行 ===",
        {
            attacker:
                attacker.card.name,

            blockers:
                blockers.map(
                    summon =>
                        summon.card.name
                )
        }
    );


    //----------------------------------
    // 使用するブロッカーを決定
    //----------------------------------

    const blocker =
        cpuSelectedBlocker ||
        blockers[0];


    if(!blocker){

        console.log(
            "CPUブロッカーなし"
        );


        return false;

    }


    console.log(
        "executeCpuBlock ゴーレム確認",
        blocker?.card?.name,
        blocker?.ability
    );


    //----------------------------------
    // 攻撃者をブロック対象にする
    //----------------------------------

    console.log(
        "CPUブロッカー",
        blocker.card.name
    );


    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `CPU：${blocker.card.name}が${attacker.card.name}をブロック`
    );


    //----------------------------------
    // バジリスク：バトル相手を記録
    //----------------------------------

    setBasiliskBattleTarget(
        attacker,
        blocker
    );


    //----------------------------------
    // ブロッカーから攻撃者へのダメージ
    //----------------------------------

    dealDamage(
        attacker,
        getPower(blocker)
    );


    //----------------------------------
    // ゴーレム
    // ブロック時はダメージを受けない
    //
    // 複数能力対応
    //----------------------------------

    if(
        hasSummonAbility(
            blocker,
            "noDamageWhenBlocking"
        )
    ){

        console.log(
            "ゴーレム：ブロック時のダメージ無効",
            blocker.card.name
        );

    }

    else{

        dealDamage(
            blocker,
            getPower(attacker)
        );

    }


    //----------------------------------
    // ブロッカーも攻撃済みにする
    //----------------------------------

    blocker.isRest =
        true;


    blocker.view.setHorizontal(
        true
    );


    //----------------------------------
    // 戦闘解決
    //----------------------------------

    setTimeout(()=>{

        resolveBattle();


        //----------------------------------
        // CPUブロッカー選択をリセット
        //----------------------------------

        cpuSelectedBlocker =
            null;


        //----------------------------------
        // 攻撃終了
        //----------------------------------

        finishAttack();

    },1000);


    return true;

}