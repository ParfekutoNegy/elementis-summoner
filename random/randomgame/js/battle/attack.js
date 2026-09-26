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

//======================================
// サモンへの攻撃に対するブロック
//======================================

// サモンへの攻撃をブロック確認中か
let summonAttackBlockMode = false;

// 本来の攻撃対象サモン
let originalAttackTargetSummon = null;

//======================================
// ネレイド
//
// 自分がダメージを受けるとき、
// このカードをクールゾーンに置き、
// 受けるダメージを0にしてもよい
//======================================

let nereidDamageWaiting = false;

let nereidDamageEvent = null;

let nereidSelectableSummons = [];

//==================================================
// メドゥーサ
//
// 相手のサモンは能力や効果にかかわらず、
// 場に出たターンはアタックできない
//==================================================

function isSummonTurnAttackPrevented(
    summon
){

    //----------------------------------
    // サモン確認
    //----------------------------------

    if(
        !summon ||
        !summon.card
    ){

        return false;

    }


    //==================================
    // すでに通常のアタック可能状態
    //
    // attackReady === true なら
    // 場に出たターンではないので
    // メドゥーサの影響を受けない
    //==================================

    if(summon.attackReady){

        return false;

    }


    //----------------------------------
    // 相手フィールド
    //----------------------------------

    const opponentField =
        summon.owner === PLAYER
            ? enemyField
            : playerField;


    //----------------------------------
    // メドゥーサ能力確認
    //----------------------------------

    const medusa =
        opponentField.find(
            opponentSummon => {

                if(
                    !opponentSummon ||
                    !opponentSummon.card ||
                    opponentSummon.destroyed
                ){

                    return false;

                }


                return hasSummonAbility(
                    opponentSummon,
                    "preventEnemySummonTurnAttack"
                );

            }
        );


    //----------------------------------
    // メドゥーサなし
    //----------------------------------

    if(!medusa){

        return false;

    }


    //----------------------------------
    // アタック禁止
    //----------------------------------

    console.log(
        "メドゥーサ：召喚ターンアタック禁止",
        {
            summon:
                summon.card.name,

            owner:
                summon.owner,

            source:
                medusa.card.name
        }
    );


    return true;

}


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
// メドゥーサ
// 召喚ターンアタック禁止
//----------------------------------

if(
    isSummonTurnAttackPrevented(
        summon
    )
){

    console.log(
        "メドゥーサの能力により",
        "場に出たターンはアタックできません",
        summon.card.name
    );

    return;

}


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
// メドゥーサ
// 召喚ターンアタック禁止
//----------------------------------

if(
    isSummonTurnAttackPrevented(
        attackingSummon
    )
){

    console.log(
        "メドゥーサの能力により",
        "場に出たターンは攻撃不可",
        attackingSummon.card.name
    );

    return false;

}



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


        //==================================
        // シーサーペント
        //
        // 相手のサモンは
        // このカードにアタックできない
        //==================================

        if(
            hasSummonAbility(
                target,
                "cannotBeAttacked"
            )
        ){

            console.log(
                "アタック対象不可：",
                target.card.name,
                "は相手サモンからアタックされない"
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


    //==================================
    // 攻撃成立
    //
    // 攻撃対象が確定した時点で
    // 攻撃者をヨコ向きにする
    //==================================

    attackingSummon.isRest =
        true;


    attackingSummon.view.setHorizontal(
        true
    );


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


        if(powerUpAbility){

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


    //==================================
    // スフィンクス
    //
    // このカードがアタックしたとき、
    // 相手は手札を1枚選び、
    // コストゾーンに伏せる
    //==================================

    const sphinxAbility =
        getSummonAbility(
            attackingSummon,
            "forceEnemyHandToCostOnAttack"
        );


if(sphinxAbility){

    //----------------------------------
    // 効果を受ける側
    //----------------------------------

    const forceTarget =
        attackingSummon.owner === PLAYER
            ? ENEMY
            : PLAYER;


    //----------------------------------
    // 対象側の手札
    //----------------------------------

    const targetHand =
        forceTarget === PLAYER
            ? board.handCards
            : enemyHandCards;


    //----------------------------------
    // 手札がある場合のみ発動
    //----------------------------------

    if(
        targetHand &&
        targetHand.length > 0
    ){

        console.log(
            "スフィンクス能力発動",
            {
                attacker:
                    attackingSummon.card.name,

                owner:
                    attackingSummon.owner,

                target:
                    forceTarget
            }
        );


        //----------------------------------
        // バトルログ
        //----------------------------------

        addBattleLog(
            `${attackingSummon.card.name}の能力発動`
        );


        //==================================
        // CPUのスフィンクスの場合
        //
        // PLAYERに能力を見せる
        //==================================

        if(
            attackingSummon.owner === ENEMY
        ){

            //----------------------------------
            // 右側にスフィンクスを表示
            //
            // CPUマギアと同じ表示システムを使用
            //----------------------------------

            showCpuCardAction(
                attackingSummon.card,
                "ABILITY",
                PLAYER
            );


            //----------------------------------
            // 中央案内
            //----------------------------------

            showActionGuide(
                "スフィンクスの能力が発動しました。<br>" +
                "コストゾーンに置くカードを<br>" +
                "1枚選んでください。"
            );

        }


//----------------------------------
// 攻撃処理を保存
//----------------------------------

sphinxAttackWaiting =
    true;

sphinxAttackAttacker =
    attacker;

sphinxAttackTarget =
    target;

forceCostSource =
    "sphinx";


        //----------------------------------
        // 強制コスト選択開始
        //----------------------------------

        startForceCostSelect(
            forceTarget
        );


        //----------------------------------
        // 攻撃処理をここで停止
        //----------------------------------

        return "WAIT_SPHINX";

    }


    //----------------------------------
    // 相手の手札が0枚
    //----------------------------------

    console.log(
        "スフィンクス：",
        "相手の手札が0枚のため効果なし"
    );

}


//==================================================
// カリュブディス
//
// 相手のサモンがアタックしたとき、
// 相手は手札を1枚選び、
// コストゾーンに伏せる。
//==================================================

const charybdisStarted =
    startCharybdisTriggers(
        attacker,
        target
    );


//----------------------------------
// カリュブディス誘発あり
//----------------------------------

if(charybdisStarted){

    console.log(
        "アタック処理待機：",
        "カリュブディス"
    );


    //----------------------------------
    // ここではブロック・ダメージへ
    // 進まない
    //----------------------------------

    return "WAIT_CHARYBDIS";

}


//==================================
// 攻撃時能力終了
//
// ブロック・ダメージ処理へ
//==================================

return continueAttackAfterAttackAbility(
    attacker,
    target
);

}


//==================================================
// 攻撃時能力解決後
//
// ここから
// ・トロールによるブロック
// ・通常ブロック
// ・ダメージ
// ・レジスト
// ・戦闘解決
//
// を行う
//
// スフィンクス実装時は
// 強制コスト効果の解決後に
// この関数から攻撃を再開する
//==================================================

function continueAttackAfterAttackAbility(
    attacker,
    target
){

    //----------------------------------
    // 攻撃者を保証
    //----------------------------------

    attackingSummon =
        attacker;


    //==================================
    // サモン同士の戦闘
    //==================================

    if(target instanceof Summon){

        //==================================
        // トロール
        //
        // 相手サモンから
        // 自分サモンへのアタックを
        // ブロックできる
        //==================================

        const trollBlockers =
            findSummonAttackBlockers(
                target
            );


        //----------------------------------
        // トロールによるブロック可能
        //----------------------------------

        if(trollBlockers.length > 0){

            console.log(
                "サモンへの攻撃：",
                "トロールでブロック可能",
                trollBlockers.map(
                    summon =>
                        summon.card.name
                )
            );


            //==================================
            // PLAYER側
            //==================================

            if(
                target.owner === PLAYER
            ){

                //----------------------------------
                // 元の攻撃対象を保存
                //----------------------------------

                summonAttackBlockMode =
                    true;


                originalAttackTargetSummon =
                    target;


                console.log(
                    "トロール：",
                    "ブロック確認開始",
                    "元の攻撃対象=",
                    target.card.name
                );


                //----------------------------------
                // ブロック選択開始
                //----------------------------------

                startBlock(
                    trollBlockers
                );


                return "WAIT_BLOCK";

            }


            //==================================
            // CPU側
            //==================================

            if(
                target.owner === ENEMY
            ){

                //----------------------------------
                // 元の攻撃対象を保存
                //----------------------------------

                summonAttackBlockMode =
                    true;


                originalAttackTargetSummon =
                    target;


                //----------------------------------
                // CPUがブロックするか判断
                //----------------------------------

                const shouldBlock =
                    cpuShouldBlock(
                        trollBlockers,
                        attackingSummon
                    );


                //----------------------------------
                // ブロックする
                //----------------------------------

                if(shouldBlock){

                    console.log(
                        "CPU：",
                        "サモンへの攻撃をブロック"
                    );


                    executeCpuBlock(
                        trollBlockers,
                        attackingSummon
                    );


                    return;

                }


                //----------------------------------
                // ブロックしない
                //----------------------------------

                summonAttackBlockMode =
                    false;


                originalAttackTargetSummon =
                    null;


                console.log(
                    "CPU：",
                    "サモンへの攻撃をブロックしない"
                );

            }

        }


        //==================================
        // 通常のサモン同士の戦闘
        //==================================


        //----------------------------------
        // バジリスク：
        // バトル相手を記録
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


    //==================================
    // CPU → PLAYER
    //==================================

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
// レジスト・ネレイド待機中なら停止
//----------------------------------

if(
    resistMode ||
    nereidDamageWaiting
){

    console.log(
        "ダメージ処理待機中なので戦闘終了停止"
    );


    return "WAIT_RESIST";

}

    }


    //==================================
    // PLAYER → CPU
    //==================================

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
// レジスト・ネレイド待機中なら
// 戦闘終了しない
//----------------------------------

if(
    resistMode ||
    nereidDamageWaiting
){

    console.log(
        "ダメージ処理待機中なので戦闘終了停止"
    );


    return;

}


    //----------------------------------
    // バトル解決
    //----------------------------------

    setTimeout(
        () => {

            resolveBattle();

            finishAttack();

        },
        1000
    );

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
// サモン攻撃ブロック状態終了
//----------------------------------

summonAttackBlockMode =
    false;

originalAttackTargetSummon =
    null;


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

            //==================================
            // シーサーペント
            //
            // 相手のサモンは
            // このカードにアタックできない
            //==================================

            if(
                hasSummonAbility(
                    summon,
                    "cannotBeAttacked"
                )
            ){

                //----------------------------------
                // 念のため既存の発光も解除
                //----------------------------------

                summon.view.setTarget(
                    false
                );


                console.log(
                    "攻撃対象発光から除外：",
                    summon.card.name,
                    "アタック対象不可"
                );


                return;

            }


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

//==================================================
// ネレイド
// ダメージ無効能力を使用できるサモンを取得
//==================================================

function getNereidDamagePreventSummons(
    player
){

    const field =
        player === PLAYER
            ? playerField
            : enemyField;


    if(!Array.isArray(field)){

        return [];

    }


    return field.filter(
        summon => {

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return false;

            }


            return hasSummonAbility(
                summon,
                "preventPlayerDamageByCoolingSelf"
            );

        }
    );

}

//==================================================
// ネレイド
// ダメージ無効能力の確認開始
//==================================================

//==================================================
// ネレイド
//
// 自分がダメージを受けるとき、
// このカードをクールゾーンに置き、
// 受けるダメージを0にしてもよい。
//==================================================

function checkNereidDamagePrevent(
    player,
    damage,
    event = null
){

    //----------------------------------
    // ダメージが0以下なら発動しない
    //----------------------------------

    if(damage <= 0){

        return false;

    }


    //----------------------------------
    // 使用可能なネレイド能力持ちを取得
    //----------------------------------

    const candidates =
        getNereidDamagePreventSummons(
            player
        );


    //----------------------------------
    // 候補なし
    //----------------------------------

    if(candidates.length === 0){

        return false;

    }


    //==================================================
    // PLAYER
    //==================================================

    if(player === PLAYER){

        console.log(
            "ネレイド能力確認",
            candidates.map(
                summon =>
                    summon.card.name
            ),
            "damage=",
            damage
        );


        //----------------------------------
        // ネレイド選択待機開始
        //----------------------------------

        nereidDamageWaiting =
            true;


        //----------------------------------
        // ダメージ情報保存
        //----------------------------------

        nereidDamageEvent = {

            player:
                player,

            damage:
                damage,

            event:
                event

        };


        //----------------------------------
        // 選択可能サモン保存
        //----------------------------------

        nereidSelectableSummons =
            candidates;


        //==================================================
        // 使用可能サモンを黄色発光
        //==================================================

        if(
            typeof updateNereidDamagePreventHighlight ===
                "function"
        ){

            updateNereidDamagePreventHighlight();

        }
        else{

            candidates.forEach(
                summon => {

                    if(
                        !summon ||
                        !summon.view
                    ){

                        return;

                    }


                    if(
                        typeof summon.view.setHighlight ===
                            "function"
                    ){

                        summon.view.setHighlight(
                            true
                        );

                    }

                }
            );

        }


        //----------------------------------
        // 行動案内
        //----------------------------------

        showActionGuide(
            "ネレイドの能力を使用できます。<br>" +
            "使用サモンか、「使わない」を選んでください。"
        );


        //----------------------------------
        // ボタン更新
        //----------------------------------

        updateButtons();


        console.log(
            "ネレイド能力選択待機"
        );


        //----------------------------------
        // ダメージ処理を一時停止
        //----------------------------------

        return true;

    }


    //==================================================
    // CPU
    //==================================================

    if(player === ENEMY){

        console.log(
            "CPUネレイド能力確認",
            {
                damage:
                    damage,

                enemyLife:
                    game.enemyLife,

                candidates:
                    candidates.map(
                        summon =>
                            summon.card.name
                    )
            }
        );


        //==================================================
        // 使用条件
        //
        // ① このダメージでライフが0以下
        //
        // または
        //
        // ② 3以上のダメージ
        //==================================================

        const lethalDamage =
            (
                game.enemyLife -
                damage
            ) <= 0;


        const heavyDamage =
            damage >= 3;


        const shouldUse =
            lethalDamage ||
            heavyDamage;


        //----------------------------------
        // 使用しない
        //----------------------------------

        if(!shouldUse){

            console.log(
                "CPUネレイド：使用しない",
                {
                    damage:
                        damage,

                    enemyLife:
                        game.enemyLife
                }
            );


            return false;

        }


        //==================================================
        // 使用するネレイドを決定
        //
        // 複数いる場合は先頭の1体
        //
        // ネレイド能力をコピーしている
        // ドッペルゲンガーも候補になる
        //==================================================

        const summon =
            candidates[0];


        if(
            !summon ||
            !summon.card
        ){

            return false;

        }


        console.log(
            "================================"
        );

        console.log(
            "CPU：ネレイド能力使用"
        );

        console.log(
            "使用サモン：",
            summon.card.name
        );

        console.log(
            "無効にするダメージ：",
            damage
        );

        console.log(
            "使用理由：",
            lethalDamage
                ?
                "致死ダメージ"
                :
                "3以上のダメージ"
        );

        console.log(
            "================================"
        );


        //==================================================
        // バトルログ
        //==================================================

        if(
            typeof addBattleLog ===
                "function"
        ){

            addBattleLog(
                `CPU：${summon.card.name}の能力を使用`
            );

            addBattleLog(
                `CPU：受ける${damage}ダメージを0`
            );

        }


        //==================================================
        // CPUカード使用演出
        //
        // 右側に能力を使用したサモンを表示
        //==================================================

        if(
            typeof showCpuCardAction ===
                "function"
        ){

            showCpuCardAction(
                summon.card,
                "ABILITY"
            );

        }


        //==================================================
        // 中央案内
        //==================================================

        if(
            typeof showActionGuide ===
                "function"
        ){

            showActionGuide(
                `${summon.card.name}の能力が発動しました。<br>` +
                `受ける${damage}ダメージを0にします。`
            );

        }


        //==================================================
        // 使用したサモンをクールゾーンへ
        //==================================================

        moveLamiaTargetToCool(
            summon
        );


        //==================================================
        // 中央案内を少し後に消す
        //
        // CPUカード表示側は
        // showCpuCardAction側の既存演出に任せる
        //==================================================

        setTimeout(
            ()=>{

                if(
                    typeof hideActionGuide ===
                        "function"
                ){

                    hideActionGuide();

                }

            },
            2000
        );


        //----------------------------------
        // true =
        // ネレイドを使用してダメージを無効化
        //----------------------------------

        return true;

    }


    //----------------------------------
    // その他
    //----------------------------------

    return false;

}

//==================================================
// ネレイド
// 能力を使用するサモンを選択
//==================================================

function selectNereidDamagePreventSummon(
    summon
){

    //----------------------------------
    // 選択待機中でない
    //----------------------------------

    if(!nereidDamageWaiting){

        return false;

    }


    //----------------------------------
    // 選択可能サモン確認
    //----------------------------------

    if(
        !nereidSelectableSummons.includes(
            summon
        )
    ){

        return false;

    }


    console.log(
        "ネレイド能力使用",
        summon.card.name
    );


    //----------------------------------
    // 発光解除
    //----------------------------------

    clearNereidDamagePreventHighlight();


    //----------------------------------
    // 能力使用ログ
    //----------------------------------

    addBattleLog(
        `${summon.card.name}の能力発動：受けるダメージを0`
    );


    //----------------------------------
    // 自身をクールゾーンへ
    //
    // 既存の場→クール処理を利用
    //----------------------------------

    moveLamiaTargetToCool(
        summon
    );


    //----------------------------------
    // ダメージを0にして再開
    //----------------------------------

    finishNereidDamagePrevent(
        0
    );


    return true;

}

//==================================================
// ネレイド
// 能力を使用しない
//==================================================

function skipNereidDamagePrevent(){

    if(!nereidDamageWaiting){

        return;

    }


    console.log(
        "ネレイド能力を使用しない"
    );


    //----------------------------------
    // 元ダメージ
    //----------------------------------

    const damage =
        nereidDamageEvent
            ? nereidDamageEvent.damage
            : 0;


    //----------------------------------
    // 発光解除
    //----------------------------------

    clearNereidDamagePreventHighlight();


    //----------------------------------
    // 通常ダメージで再開
    //----------------------------------

    finishNereidDamagePrevent(
        damage
    );

}

//==================================================
// ネレイド
// 選択発光解除
//==================================================

function clearNereidDamagePreventHighlight(){

    nereidSelectableSummons.forEach(
        summon => {

            if(
                summon &&
                summon.view &&
                typeof summon.view.setHighlight ===
                    "function"
            ){

                summon.view.setHighlight(
                    false
                );

            }

        }
    );

}

//==================================================
// ネレイド
// 能力選択後のダメージ処理再開
//==================================================

function finishNereidDamagePrevent(
    damage
){

    //----------------------------------
    // 保存情報
    //----------------------------------

    const data =
        nereidDamageEvent;


    if(!data){

        console.warn(
            "ネレイド：ダメージ待機情報なし"
        );

        return;

    }


    //----------------------------------
    // レジストイベント経由か
    //----------------------------------

    const fromResist =
        !!data.event;


    //----------------------------------
    // 状態解除
    //----------------------------------

    nereidDamageWaiting =
        false;

    nereidDamageEvent =
        null;

    nereidSelectableSummons =
        [];


    hideActionGuide();


    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();


    //----------------------------------
    // 最終ダメージ
    //----------------------------------

    const finalDamage =
        Math.max(
            0,
            damage
        );


    console.log(
        "ネレイド確認後ダメージ",
        finalDamage
    );


    //----------------------------------
    // ダメージ適用
    //----------------------------------

    if(finalDamage > 0){

        const damageTarget =
            data.player === PLAYER
                ?
                "PLAYER"
                :
                "CPU";


        addBattleLog(
            `${damageTarget}：${finalDamage}ダメージ`
        );


        applyPlayerDamage(
            data.player,
            finalDamage
        );


        //----------------------------------
        // AFTER_PLAYER_DAMAGE
        //----------------------------------

        emitGameEvent({

            type:
                GAME_EVENT.AFTER_PLAYER_DAMAGE,

            player:
                data.player,

            damage:
                finalDamage

        });

    }
    else{

        console.log(
            "ネレイド：ダメージ無効"
        );

    }


    //==================================
    // レジスト処理から来た場合
    //==================================

    if(fromResist){

        //----------------------------------
        // レジストイベント終了
        //----------------------------------

        currentResistEvent =
            null;


        //----------------------------------
        // 戦闘解決
        //----------------------------------

        resolveBattle();


        finishAttack();


        //----------------------------------
        // 手札状態解除
        //----------------------------------

        clearHandSelection();


        if(board.handCards){

            for(
                const card of
                board.handCards
            ){

                card.setSelected(
                    false
                );

                card.setCostSelected(
                    false
                );

                card.setHighlight(
                    false
                );

            }

        }


        //----------------------------------
        // 通常状態へ更新
        //----------------------------------

        updateGameState();


        //==================================
        // CPUターン中なら再開
        //==================================

        if(
            game.currentPlayer === ENEMY &&
            game.state === TURN_STATE.PLAYING
        ){

            console.log(
                "ネレイド処理完了：CPU攻撃再開"
            );


            cpuWaiting =
                false;


            //----------------------------------
            // 今回の攻撃完了
            //----------------------------------

            cpuAttackIndex++;


            //----------------------------------
            // 次の攻撃へ
            //----------------------------------

            setTimeout(
                () => {

                    cpuNextAttack();

                },
                2000
            );

        }


        return;

    }


    //==================================
    // レジストを経由していない場合
    //
    // 呼び出し元の攻撃処理が
    // 続きを担当する
    //==================================

    console.log(
        "ネレイド処理完了：通常ダメージ経路"
    );

}

//==================================================
// ネレイド
// 使用可能サモン発光
//==================================================

function updateNereidDamagePreventHighlight(){

    //----------------------------------
    // ネレイド選択中以外
    //----------------------------------

    if(!nereidDamageWaiting){

        return;

    }


    //----------------------------------
    // 使用可能なサモンを黄色発光
    //----------------------------------

    nereidSelectableSummons.forEach(
        summon => {

            if(
                !summon ||
                !summon.view
            ){

                return;

            }


            if(
                typeof summon.view.setHighlight ===
                    "function"
            ){

                summon.view.setHighlight(
                    true
                );

            }

        }
    );

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

    //==================================
// ネレイド
//==================================

if(
    checkNereidDamagePrevent(
        player,
        finalDamage,
        null
    )
){

    console.log(
        "ネレイド能力選択待機"
    );

    return;

}


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


    //----------------------------------
    // 攻撃状態解除
    //----------------------------------

    attackingSummon =
        null;

    attackTarget =
        null;

    attackMode =
        false;


    //----------------------------------
    // ブロック状態解除
    //----------------------------------

    blockMode =
        false;

    selectableBlockSummons =
        [];

    blockingSummon =
        null;


    //----------------------------------
    // トロール
    // サモン攻撃ブロック状態解除
    //----------------------------------

    summonAttackBlockMode =
        false;

    originalAttackTargetSummon =
        null;


    //----------------------------------
    // 攻撃対象発光解除
    //----------------------------------

    clearAttackHighlight();


    //----------------------------------
    // ブロック候補発光解除
    //----------------------------------

    playerField.forEach(
        summon => {

            if(
                summon &&
                summon.view
            ){

                summon.view.setHighlight(
                    false
                );

            }

        }
    );


    enemyField.forEach(
        summon => {

            if(
                summon &&
                summon.view
            ){

                summon.view.setHighlight(
                    false
                );

            }

        }
    );


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


    //==================================
    // サモンへの攻撃に対する
    // トロールのブロック確認だった場合
    //==================================

    if(summonAttackBlockMode){

        console.log(
            "トロール：",
            "ブロックしない"
        );


        //----------------------------------
        // 元の攻撃対象を取得
        //----------------------------------

        const target =
            originalAttackTargetSummon;


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
        // トロール用状態解除
        //----------------------------------

        summonAttackBlockMode =
            false;

        originalAttackTargetSummon =
            null;


        //----------------------------------
        // 攻撃者・対象確認
        //----------------------------------

        if(
            !attackingSummon ||
            !target ||
            target.destroyed
        ){

            console.log(
                "トロール：",
                "元の戦闘対象が存在しない"
            );


            finishAttack();

            return;

        }


        //==================================
        // 元のサモン同士の戦闘を実行
        //==================================

        console.log(
            "トロール：",
            "元の攻撃対象との戦闘を続行",
            attackingSummon.card.name,
            "→",
            target.card.name
        );


        //----------------------------------
        // バジリスク：
        // バトル相手を記録
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


        //----------------------------------
        // 戦闘解決
        //----------------------------------

        setTimeout(
            () => {

                resolveBattle();

                finishAttack();

            },
            1000
        );


        return;

    }


    //==================================
    // ここから通常の
    // PLAYERへの攻撃のブロック処理
    //==================================


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


    //==================================
    // 今回が強制アタックか保存
    //
    // finishAttack() 内で
    // forcedAttackMode が false に
    // 戻るため、先に保存する
    //==================================

    const wasForcedAttack =
        typeof forcedAttackMode !==
            "undefined" &&
        forcedAttackMode;


    //----------------------------------
    // プレイヤーへのダメージ
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


    //==================================
    // 強制アタックだった場合
    //
    // finishAttack() →
    // startNextForcedAttack()
    //
    // に任せる。
    //
    // cpuNextAttack() は呼ばない。
    //==================================

    if(wasForcedAttack){

        console.log(
            "CPU強制アタック：",
            "通常攻撃継続処理をスキップ"
        );

        return;

    }


    //----------------------------------
    // 通常CPU攻撃なら次へ
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


    //==================================
    // ネレイド
    //
    // レジスト解決後の最終ダメージに対して
    // 能力使用確認
    //==================================

    if(
        checkNereidDamagePrevent(
            event.player,
            finalDamage,
            event
        )
    ){

        console.log(
            "レジスト後：ネレイド能力選択待機"
        );


        return;

    }


    //----------------------------------
    // プレイヤーへのダメージ
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

    //==================================================
    // ドッペルゲンガー
    // コピー対象選択中
    //
    // 通常の行動可能サモン発光は行わない
    //==================================================

    if(
        typeof doppelgangerTargetMode !==
            "undefined" &&
        doppelgangerTargetMode
    ){

        console.log(
            "ドッペルゲンガー対象選択中：",
            "サモン通常発光なし"
        );


        //----------------------------------
        // 行動可能サモンの黄色発光を解除
        //----------------------------------

        playerField.forEach(
            summon => {

                if(
                    summon &&
                    summon.view
                ){

                    summon.view.setHighlight(
                        false
                    );

                }

            }
        );


        return;

    }


    //==================================================
    // 通常処理
    //==================================================

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


            //==================================
            // メドゥーサ
            //
            // 相手のサモンは
            // 能力や効果にかかわらず
            // 場に出たターンは
            // アタックできない
            //==================================

            const summonTurnAttackPrevented =
                typeof isSummonTurnAttackPrevented ===
                    "function"
                    ?
                    isSummonTurnAttackPrevented(
                        summon
                    )
                    :
                    false;


            //----------------------------------
            // アタック可能判定
            //----------------------------------

            const canAttackNow =

                game.currentPlayer === PLAYER &&

                (
                    summon.attackReady ||

                    (
                        canAttackOnSummonTurn &&
                        !summonTurnAttackPrevented
                    )
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

//======================================
// サモンへの攻撃をブロックできる
// サモンを取得
//
// ability:
// blockSummonAttack
//======================================

function findSummonAttackBlockers(
    attackTarget
){

    //----------------------------------
    // 攻撃者確認
    //----------------------------------

    if(!attackingSummon){

        return [];

    }


    //----------------------------------
    // 攻撃対象確認
    //----------------------------------

    if(
        !(attackTarget instanceof Summon)
    ){

        return [];

    }


    //----------------------------------
    // ブロック不可攻撃
    //----------------------------------

    if(
        hasSummonAbility(
            attackingSummon,
            "cannotBeBlocked"
        )
    ){

        console.log(
            "トロール：",
            "攻撃者がブロック不可"
        );

        return [];

    }


    //----------------------------------
    // 攻撃対象側のフィールド
    //----------------------------------

    const field =
        attackTarget.owner === PLAYER
            ? playerField
            : enemyField;


    const result = [];


    //----------------------------------
    // ブロッカー検索
    //----------------------------------

    for(const summon of field){

        //----------------------------------
        // 無効なサモン
        //----------------------------------

        if(
            !summon ||
            summon.destroyed
        ){

            continue;

        }


        //----------------------------------
        // 攻撃対象自身は除外
        //----------------------------------

        if(
            summon === attackTarget
        ){

            continue;

        }


        //----------------------------------
        // ヨコ向きはブロック不可
        //----------------------------------

        if(summon.isRest){

            continue;

        }


        //----------------------------------
        // トロール能力確認
        //
        // ドッペルゲンガーのコピーにも対応
        //----------------------------------

        if(
            !hasSummonAbility(
                summon,
                "blockSummonAttack"
            )
        ){

            continue;

        }


        //----------------------------------
        // オーガ能力等による
        // ブロック不可確認
        //----------------------------------

        if(
            typeof isOgreBattleLocked ===
                "function" &&
            isOgreBattleLocked(
                summon
            )
        ){

            console.log(
                "トロール：",
                "能力によりブロック不可",
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


    console.log(
        "サモン攻撃ブロッカー",
        result.map(
            summon =>
                summon.card.name
        )
    );


    return result;

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


    //==================================
    // サモンへの攻撃に対する
    // トロールブロックだったか保存
    //==================================

    const wasSummonAttackBlock =
        summonAttackBlockMode;


    const originalTarget =
        originalAttackTargetSummon;


    //----------------------------------
    // ブロッカー保存
    //----------------------------------

    blockingSummon =
        blocker;


    //----------------------------------
    // バトルログ
    //----------------------------------

    if(wasSummonAttackBlock){

        addBattleLog(
            `PLAYER：${blocker.card.name}が${originalTarget?.card?.name ?? "サモン"}への攻撃をブロック`
        );

    }
    else{

        addBattleLog(
            `PLAYER：${blocker.card.name}が${attackingSummon.card.name}をブロック`
        );

    }


    //----------------------------------
    // 横向きにする
    //----------------------------------

    blocker.isRest =
        true;


    blocker.view.setHorizontal(
        true
    );


    //----------------------------------
    // トロール用状態解除
    //
    // ここから先の戦闘相手は
    // 元の攻撃対象ではなく
    // ブロッカーになる
    //----------------------------------

    if(wasSummonAttackBlock){

        console.log(
            "トロール：",
            blocker.card.name,
            "が",
            originalTarget?.card?.name,
            "への攻撃をブロック"
        );


        summonAttackBlockMode =
            false;


        originalAttackTargetSummon =
            null;

    }


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


    //==================================
    // サモンへの攻撃に対する
    // トロールブロックだったか保存
    //==================================

    const wasSummonAttackBlock =
        summonAttackBlockMode;


    const originalTarget =
        originalAttackTargetSummon;


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

    if(wasSummonAttackBlock){

        addBattleLog(
            `CPU：${blocker.card.name}が${originalTarget?.card?.name ?? "サモン"}への攻撃をブロック`
        );

    }
    else{

        addBattleLog(
            `CPU：${blocker.card.name}が${attacker.card.name}をブロック`
        );

    }


    //----------------------------------
    // トロール用状態解除
    //----------------------------------

    if(wasSummonAttackBlock){

        console.log(
            "CPUトロール：",
            blocker.card.name,
            "が",
            originalTarget?.card?.name,
            "への攻撃をブロック"
        );


        summonAttackBlockMode =
            false;


        originalAttackTargetSummon =
            null;

    }


    //----------------------------------
    // バジリスク：
    // バトル相手を記録
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
        getPower(
            blocker
        )
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
            getPower(
                attacker
            )
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

    setTimeout(
        () => {

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

        },
        1000
    );


    return true;

}

//==================================================
// カリュブディス
//
// 相手のサモンがアタックしたとき、
// 相手は手札を1枚選び、
// コストゾーンに伏せる。
//
// 発動可能なサモンを取得
//==================================================

function findCharybdisTriggers(
    attacker
){

    //----------------------------------
    // 攻撃者確認
    //----------------------------------

    if(
        !attacker ||
        !attacker.card
    ){

        return [];

    }


    //----------------------------------
    // 攻撃者の相手側フィールド
    //----------------------------------

    const opponentField =
        attacker.owner === PLAYER
            ?
            enemyField
            :
            playerField;


    //----------------------------------
    // フィールド確認
    //----------------------------------

    if(
        !Array.isArray(
            opponentField
        )
    ){

        return [];

    }


    //==================================
    // カリュブディス能力を持つ
    // サモンをすべて取得
    //
    // getSummonAbility() を使うので
    // ドッペルゲンガーにも対応
    //==================================

    const triggers =
        opponentField.filter(
            summon => {

                //----------------------------------
                // 不正データ
                //----------------------------------

                if(
                    !summon ||
                    !summon.card
                ){

                    return false;

                }


                //----------------------------------
                // 破壊済み
                //----------------------------------

                if(summon.destroyed){

                    return false;

                }


                //----------------------------------
                // 能力確認
                //----------------------------------

                return !!getSummonAbility(
                    summon,
                    "forceEnemyHandToCostWhenEnemyAttack"
                );

            }
        );


    //----------------------------------
    // ログ
    //----------------------------------

    if(
        triggers.length > 0
    ){

        console.log(
            "カリュブディス誘発確認",
            {
                attacker:
                    attacker.card.name,

                attackerOwner:
                    attacker.owner,

                triggers:
                    triggers.map(
                        summon =>
                            summon.card.name
                    )
            }
        );

    }


    return triggers;

}

//==================================================
// カリュブディス
// 誘発開始
//
// 相手サモンがアタックしたとき
// 発動可能なカリュブディスを
// 順番に解決する
//==================================================

function startCharybdisTriggers(
    attacker,
    target
){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !attacker ||
        !attacker.card
    ){

        return false;

    }


    //----------------------------------
    // 誘発するカリュブディス取得
    //----------------------------------

    const triggers =
        findCharybdisTriggers(
            attacker
        );


    //----------------------------------
    // 誘発なし
    //----------------------------------

    if(
        !triggers ||
        triggers.length === 0
    ){

        return false;

    }


    console.log(
        "カリュブディス誘発開始",
        {
            attacker:
                attacker.card.name,

            triggers:
                triggers.map(
                    summon =>
                        summon.card.name
                )
        }
    );


    //----------------------------------
    // 攻撃情報保存
    //----------------------------------

    charybdisAttackWaiting =
        true;

    charybdisAttackAttacker =
        attacker;

    charybdisAttackTarget =
        target;


    //----------------------------------
    // 誘発キュー作成
    //----------------------------------

    charybdisTriggerQueue =
        [...triggers];


    //----------------------------------
    // 最初の誘発を処理
    //----------------------------------

    resolveNextCharybdisTrigger();


    return true;

}


//==================================================
// カリュブディス
// 次の誘発を処理
//==================================================

function resolveNextCharybdisTrigger(){

    //----------------------------------
    // カリュブディス処理中でない
    //----------------------------------

    if(!charybdisAttackWaiting){

        return;

    }


    //----------------------------------
    // 攻撃者確認
    //----------------------------------

    const attacker =
        charybdisAttackAttacker;


    if(
        !attacker ||
        !attacker.card
    ){

        finishCharybdisTriggers();

        return;

    }


    //==================================================
    // 残っている誘発を探す
    //==================================================

    let source =
        null;


    while(
        charybdisTriggerQueue.length > 0
    ){

        const candidate =
            charybdisTriggerQueue.shift();


        //----------------------------------
        // すでに場を離れている
        //----------------------------------

        if(
            !candidate ||
            !candidate.card ||
            candidate.destroyed
        ){

            continue;

        }


        //----------------------------------
        // 現在も相手側の場にいるか
        //----------------------------------

        const field =
            attacker.owner === PLAYER
                ?
                enemyField
                :
                playerField;


        if(
            !field.includes(
                candidate
            )
        ){

            continue;

        }


        //----------------------------------
        // 現在も能力を持っているか
        //----------------------------------

        if(
            !hasSummonAbility(
                candidate,
                "forceEnemyHandToCostWhenEnemyAttack"
            )
        ){

            continue;

        }


        source =
            candidate;

        break;

    }


    //----------------------------------
    // 残りの誘発なし
    //----------------------------------

    if(!source){

        finishCharybdisTriggers();

        return;

    }


    charybdisCurrentTrigger =
        source;


    //==================================================
    // カードをコストへ置く側
    //
    // カリュブディスの相手
    // ＝今回アタックした側
    //==================================================

    const forceTarget =
        attacker.owner;


    //----------------------------------
    // 対象側の手札
    //----------------------------------

    const targetHand =
        forceTarget === PLAYER
            ?
            board.handCards
            :
            enemyHandCards;


    //==================================================
    // 手札0枚
    //
    // 効果を処理できないので
    // 次のカリュブディスへ
    //==================================================

    if(
        !targetHand ||
        targetHand.length === 0
    ){

        console.log(
            "カリュブディス：",
            source.card.name,
            "相手の手札が0枚のため効果なし"
        );


        charybdisCurrentTrigger =
            null;


        resolveNextCharybdisTrigger();


        return;

    }


    //==================================================
    // 能力発動
    //==================================================

    console.log(
        "カリュブディス能力発動",
        {
            source:
                source.card.name,

            attacker:
                attacker.card.name,

            forceTarget:
                forceTarget,

            handCount:
                targetHand.length
        }
    );


    //----------------------------------
    // バトルログ
    //----------------------------------

    if(
        typeof addBattleLog ===
            "function"
    ){

        addBattleLog(
            `${source.card.name}の能力発動`
        );

    }


    //==================================================
    // CPU側のカリュブディス
    //
    // PLAYERがカードを選ぶので
    // 右側に能力カードを表示
    //==================================================

    if(
        source.owner === ENEMY
    ){

        if(
            typeof showCpuCardAction ===
                "function"
        ){

            showCpuCardAction(
                source.card,
                "ABILITY",
                PLAYER
            );

        }


        if(
            typeof showActionGuide ===
                "function"
        ){

            showActionGuide(
                `${source.card.name}の能力が発動しました<br>` +
                "コストゾーンに置くカードを<br>" +
                "1枚選んでください"
            );

        }

    }


    //==================================================
    // 強制コスト処理へ
    //
    // スフィンクスとは別ソースとして管理
    //==================================================

    forceCostSource =
        "charybdis";


    startForceCostSelect(
        forceTarget
    );

}

//==================================================
// カリュブディス
// 全誘発終了
//==================================================

function finishCharybdisTriggers(){

    //----------------------------------
    // 攻撃情報保存
    //----------------------------------

    const attacker =
        charybdisAttackAttacker;

    const target =
        charybdisAttackTarget;


    console.log(
        "カリュブディス誘発終了",
        {
            attacker:
                attacker &&
                attacker.card
                    ?
                    attacker.card.name
                    :
                    null,

            remainingTriggers:
                charybdisTriggerQueue.length
        }
    );


    //----------------------------------
    // 状態解除
    //----------------------------------

    charybdisAttackWaiting =
        false;

    charybdisAttackAttacker =
        null;

    charybdisAttackTarget =
        null;

    charybdisTriggerQueue =
        [];

    charybdisCurrentTrigger =
        null;


    //----------------------------------
    // 強制コスト状態
    //----------------------------------

    if(
        forceCostSource ===
            "charybdis"
    ){

        forceCostSource =
            null;

    }


    //----------------------------------
    // 中央案内解除
    //----------------------------------

    if(
        typeof hideActionGuide ===
            "function"
    ){

        hideActionGuide();

    }


    //----------------------------------
    // 攻撃情報がない
    //----------------------------------

    if(
        !attacker ||
        !target == null

    ){

        console.warn(
            "カリュブディス：攻撃再開情報なし"
        );

        return;

    }


    //==================================================
    // 通常の攻撃処理へ戻る
    //
    // executeAttack()を再実行しないことが重要
    //==================================================

    console.log(
        "カリュブディス：アタック処理再開",
        attacker.card.name
    );


    continueAttackAfterAttackAbility(
        attacker,
        target
    );

}