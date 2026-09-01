//======================================
// CPU処理
//======================================


let cpuWaiting = false;

let cpuSelectedBlocker = null;

//======================================
// CPUターン状態
//======================================

// 0 = 最初の攻撃
// 1 = サモン
// 2 = マギア
// 3 = 最後の攻撃
// 4 = 終了

let cpuTurnStep = 0;


//--------------------------------------
// CPUはターン中にサモン1枚まで
//--------------------------------------

let cpuSummonUsedThisTurn = false;


//--------------------------------------
// 現在の攻撃フェーズで処理した
// サモンを記録
//--------------------------------------

let cpuAttackQueue = [];

let cpuAttackIndex = 0;


//======================================
// CPUターン初期化
//======================================

function resetCpuTurnState(){

    cpuTurnStep = 0;

    cpuSummonUsedThisTurn = false;

    cpuAttackQueue = [];

    cpuAttackIndex = 0;

    cpuWaiting = false;

    console.log(
        "CPUターン状態リセット"
    );

}


//======================================
// CPU行動開始
//======================================

function startCpuAction(){

    if(
    battleGameEnding ||
    battleGameConceded
){

    console.log(
        "CPU行動中止：ゲーム終了・投了"
    );

    return;

}

    //----------------------------------
    // ゲーム終了後はCPU行動禁止
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU行動開始中止：ゲーム終了"
        );

        return;

    }


    logCpuCardTotal();

    console.log(
        "=============================="
    );

    console.log(
        "CPU行動開始"
    );

    console.log(
        "=============================="
    );


    cpuWaiting = false;


    runCpuTurnStep();

}


//======================================
// CPU行動ループ
//======================================

function runCpuTurnStep(){

if(
    battleGameEnding ||
    battleGameConceded
){

    console.log(
        "CPUターンステップ中止：ゲーム終了・投了"
    );

    return;

}

    //----------------------------------
    // ゲーム終了後はCPU行動禁止
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU行動停止：ゲーム終了"
        );

        cpuWaiting = false;

        return;

    }


    //----------------------------------
    // プレイヤー操作待ち
    //----------------------------------

    if(
        resistMode ||
        blockMode
    ){

        console.log(
            "CPU停止：プレイヤー操作待ち"
        );

        cpuWaiting = true;

        return;

    }


    cpuWaiting = false;


    //----------------------------------
    // CPUターン以外なら停止
    //----------------------------------

    if(
        game.currentPlayer !== ENEMY
    ){

        console.log(
            "CPU停止：CPUターンではありません"
        );

        return;

    }


    //==================================
    // CPUターン終了
    //==================================

    if(
        cpuTurnStep === 4
    ){

        console.log(
            "CPU：ターン終了処理へ"
        );


        cpuFinishTurn();


        return;

    }


    //----------------------------------
    // 通常のCPU行動
    //----------------------------------

    console.log(
        "CPUポイント方式：行動選択"
    );


    //----------------------------------
    // ポイント方式で行動実行
    //----------------------------------

    cpuExecuteBestAction();

}
//======================================
// CPU攻撃フェーズ開始
//======================================
function cpuStartAttackPhase(){

    console.log(
        "CPU攻撃フェーズ開始"
    );


    //----------------------------------
    // 最初の攻撃前
    //----------------------------------

    if(
        cpuTurnStep === 0
    ){

//----------------------------------
// アクアストリーム
//----------------------------------

const aquaInfo =
    cpuShouldUseAquaStream();


if(aquaInfo){

    //----------------------------------
    // PLAYERのサモンからのみ選択
    //----------------------------------

    const target =
        aquaInfo.targets[
            Math.floor(
                Math.random() *
                aquaInfo.targets.length
            )
        ];


    console.log(
        "CPU：最初の攻撃前にアクアストリーム使用",
        "対象=",
        target.card.name,
        "owner=",
        target.owner
    );


    //----------------------------------
    // CPUマギア使用
    //----------------------------------

    const result =
        cpuMagia(
            aquaInfo.card,
            target
        );


    console.log(
        "CPU：アクアストリーム使用結果",
        result
    );


    if(result){

        setTimeout(
            runCpuTurnStep,
            1200
        );

        return;

    }

}


        //----------------------------------
        // ウィンドプレッシャー
        //----------------------------------

        const windPressureInfo =
            cpuShouldUseWindPressure();


        if(windPressureInfo){

            console.log(
                "CPU：最初の攻撃前にウィンドプレッシャー使用"
            );


            const result =
                cpuMagia(
                    windPressureInfo.card,
                    windPressureInfo.target
                );


            console.log(
                "CPU：ウィンドプレッシャー使用結果",
                result
            );


            //----------------------------------
            // 強制コスト型
            //----------------------------------

            if(
                windPressureInfo.card.effect &&
                windPressureInfo.card.effect.type ===
                "forceCost"
            ){

                console.log(
                    "CPU：ウィンドプレッシャーの選択待ち"
                );

                return;

            }


            //----------------------------------
            // 通常マギア
            //----------------------------------

            if(result){

                setTimeout(
                    runCpuTurnStep,
                    1200
                );

                return;

            }

        }

    } // ← 最初の攻撃前のifをここで閉じる


    //----------------------------------
    // 攻撃キュー作成
    //----------------------------------

    createCpuAttackQueue();


    //----------------------------------
    // 攻撃可能なし
    //----------------------------------

    if(
        cpuAttackQueue.length === 0
    ){

        console.log(
            "CPU攻撃可能サモンなし"
        );


        if(
            cpuTurnStep === 0
        ){

            cpuTurnStep = 1;

        }
        else{

            cpuTurnStep = 4;

        }


        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // 攻撃開始
    //----------------------------------

    cpuAttackIndex = 0;

setTimeout(
    ()=>{

        cpuNextAttack();

    },
    2000
);
}


//======================================
// CPU攻撃キュー作成
//======================================

function createCpuAttackQueue(){

    cpuAttackQueue = [];

    cpuAttackIndex = 0;


    //----------------------------------
    // 基準パワー取得
    //----------------------------------

    const readyPlayerSummons =
    playerField.filter(
        summon => !summon.isRest
    );


    let attackPowerThreshold = 0;


    if(
        readyPlayerSummons.length > 0
    ){

        attackPowerThreshold =
        Math.max(
            ...readyPlayerSummons.map(
                summon =>
                getPower(summon)
            )
        );

    }


    console.log(
        "CPU攻撃基準パワー",
        attackPowerThreshold
    );

//----------------------------------
// 攻撃可能CPUサモン
//----------------------------------

cpuAttackQueue =
enemyField.filter(summon=>{


    //----------------------------------
    // 行動不能なら不可
    //----------------------------------

    if(summon.isRest){

        return false;

    }


    //----------------------------------
    // 召喚したターンは攻撃不可
    //----------------------------------

    if(
        !summon.attackReady &&
        summon.card.ability?.type !==
        "summonTurnAttack"
    ){

        return false;

    }

    //----------------------------------
    // ゴーレム特殊条件
    //----------------------------------
    // PLAYER側に
    // パワー3以上の縦向きサモンがいる場合
    // CPUゴーレムは攻撃しない
    //----------------------------------

    if(
        summon.card.name === "ゴーレム"
    ){

        const strongVerticalSummon =
            playerField.some(
                target => {

                    if(!target){

                        return false;

                    }


                    if(target.destroyed){

                        return false;

                    }


                    //----------------------------------
                    // 横向きは対象外
                    //----------------------------------

                    if(target.isRest){

                        return false;

                    }


                    //----------------------------------
                    // パワー3以上
                    //----------------------------------

                    return (
                        getPower(target) >= 3
                    );

                }
            );


        if(strongVerticalSummon){

            console.log(
                "CPU：ゴーレムは攻撃しない",
                "PLAYER側にパワー3以上の縦向きサモンあり"
            );

            return false;

        }

    }


//----------------------------------
// ブロックされないサモン
//----------------------------------
//
// cannotBeBlocked を持つサモンは
// 相手のパワーに関係なく攻撃可能
//----------------------------------

if(
    summon.card?.ability?.type ===
    "cannotBeBlocked"
){

    console.log(
        "CPU攻撃キュー：ブロック不可サモンなので攻撃",
        summon.card.name,
        "power=",
        getPower(summon)
    );

    return true;

}


//----------------------------------
// 通常サモン
//----------------------------------
// 相手の最高パワー以上なら攻撃
//----------------------------------

return (
    getPower(summon)
    >=
    attackPowerThreshold
);

});
}


//======================================
// CPU次の攻撃
//======================================

function cpuNextAttack(){


    //----------------------------------
    // ゲーム終了後はCPU攻撃禁止
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU攻撃停止：ゲーム終了"
        );

        cpuAttackQueue = [];

        cpuAttackIndex = 0;

        cpuWaiting = false;

        return;

    }

    console.log(
    "CPU次攻撃処理",
    "cpuTurnStep=",
    cpuTurnStep,
    "cpuAttackIndex=",
    cpuAttackIndex,
    "queue=",
    cpuAttackQueue.map(
        summon => summon.card.name
    )
);

    //----------------------------------
    // プレイヤー操作待ち
    //----------------------------------

    if(
        resistMode ||
        blockMode
    ){

        cpuWaiting = true;

        console.log(
            "CPU攻撃停止：プレイヤー操作待ち"
        );

        return;

    }


    //----------------------------------
    // 全攻撃終了
    //----------------------------------

    if(
        cpuAttackIndex >=
        cpuAttackQueue.length
    ){

        console.log(
            "CPU攻撃フェーズ終了"
        );


        cpuAttackQueue = [];

        cpuAttackIndex = 0;


        //----------------------------------
        // 次のステップ
        //----------------------------------

        if(cpuTurnStep === 0){

            cpuTurnStep = 1;

        }else{

            cpuTurnStep = 4;

        }


        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // ゲーム終了確認
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU攻撃中止：ゲーム終了"
        );

        cpuAttackQueue = [];
        cpuAttackIndex = 0;

        return;

    }

    //----------------------------------
    // 攻撃役
    //----------------------------------

    const attacker =
    cpuAttackQueue[
        cpuAttackIndex
    ];


    //----------------------------------
    // 攻撃不能になっていた場合
    //----------------------------------

    if(
        !attacker ||
        attacker.isRest ||
        !enemyField.includes(attacker)
    ){

        cpuAttackIndex++;

        cpuNextAttack();

        return;

    }


    //----------------------------------
    // 攻撃対象
    //----------------------------------

    const target =
    selectCpuAttackTarget();


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(!target){

        cpuAttackIndex++;

        cpuNextAttack();

        return;

    }


    console.log(
        "CPU攻撃",
        attacker.card.name,
        "→",
        target === PLAYER
        ? "PLAYER"
        : target.card.name
    );


    //----------------------------------
    // 攻撃実行
    //----------------------------------

    attackingSummon =
    attacker;

    attackMode = true;


    const result =
    executeAttack(
        attacker,
        target
    );


    //----------------------------------
    // 待機
    //----------------------------------

    if(
        result === "WAIT_RESIST" ||
        result === "WAIT_BLOCK"
    ){

        cpuWaiting = true;

        return;

    }


    //----------------------------------
    // 攻撃完了
    //----------------------------------

    cpuAttackIndex++;


    setTimeout(
        cpuNextAttack,
        2000
    );

}



//======================================
// CPU攻撃対象選択
//======================================
function selectCpuAttackTarget(){

    //----------------------------------
    // 攻撃サモン確認
    //----------------------------------

    if(!attackingSummon){

        return PLAYER;

    }


    //----------------------------------
    // CPUの攻撃力
    //----------------------------------

    const attackerPower =
        getPower(attackingSummon);


    console.log(
        "CPU攻撃対象判定",
        attackingSummon.card.name,
        "攻撃力=",
        attackerPower
    );


    //----------------------------------
    // ドラゴン・クラーケン対策
    //----------------------------------

    if(
        attackingSummon.card.name === "バジリスク"
    ){

        const dragonKrakenTargets =
            playerField.filter(
                summon => {

                    if(summon.destroyed){
                        return false;
                    }

                    //----------------------------------
                    // 横向きのみ
                    //----------------------------------

                    if(!summon.isRest){
                        return false;
                    }

                    //----------------------------------
                    // ドラゴン・クラーケン
                    //----------------------------------

                    const name =
                        summon.card.name;

                    return (
                        name === "ドラゴン" ||
                        name === "クラーケン"
                    );

                }
            );


        if(
            dragonKrakenTargets.length > 0
        ){

            //----------------------------------
            // ドラゴン・クラーケンを優先
            //----------------------------------

            dragonKrakenTargets.sort(
                (a,b)=>
                    getPower(b)
                    -
                    getPower(a)
            );


            console.log(
                "CPU攻撃対象：バジリスクで",
                dragonKrakenTargets[0].card.name,
                "を優先攻撃"
            );


            return dragonKrakenTargets[0];

        }

    }



    //----------------------------------
    // ① 横向きサモン
    //----------------------------------
    // 自分のパワーより下なら攻撃
    // 同じパワー以上なら攻撃しない
    //----------------------------------

    const restingSummons =
        playerField.filter(
            summon => {

                if(summon.destroyed){

                    return false;

                }

                if(!summon.isRest){

                    return false;

                }

                return (
                    getPower(summon)
                    <
                    attackerPower
                );

            }
        );


    //----------------------------------
    // 横向きサモンがある場合
    //----------------------------------

    if(
        restingSummons.length > 0
    ){

        //----------------------------------
        // 最もパワーが高いものを優先
        //----------------------------------

        restingSummons.sort(
            (a,b)=>
                getPower(b)
                -
                getPower(a)
        );


        console.log(
            "CPU攻撃対象：横向きサモン",
            restingSummons[0].card.name,
            "power=",
            getPower(restingSummons[0])
        );


        return restingSummons[0];

    }


    //----------------------------------
    // ② 縦向きサモンを確認
    //----------------------------------
    // 自分のパワー以下なら
    // プレイヤーを攻撃する
    //
    // ※縦向きサモン自体には攻撃しない
    //----------------------------------

    const verticalSummons =
        playerField.filter(
            summon => {

                if(summon.destroyed){

                    return false;

                }

                if(summon.isRest){

                    return false;

                }

                return (
                    getPower(summon)
                    <=
                    attackerPower
                );

            }
        );


    //----------------------------------
    // 縦向きサモンが存在する場合
    // → プレイヤーを攻撃
    //----------------------------------

    if(
        verticalSummons.length > 0
    ){

        console.log(
            "CPU攻撃対象：縦向きサモンあり",
            "→ プレイヤーを攻撃"
        );


        return PLAYER;

    }


    //----------------------------------
    // ③ 攻撃可能な縦向きサモンなし
    // → プレイヤーを攻撃
    //----------------------------------

    console.log(
        "CPU攻撃対象：プレイヤー"
    );


    return PLAYER;

}


//======================================
// CPUサモン召喚
//======================================

function cpuSummon(card){

    if(!card){

        return false;

    }


    //----------------------------------
    // 現在のコスト取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    console.log(
        "CPUサモンコスト",
        card.name,
        "元cost=",
        card.cost,
        "現在cost=",
        currentCost
    );


    //----------------------------------
    // 手札残数確認
    //----------------------------------

    if(
        enemyHandCards.length
        - 1
        - currentCost
        <
        2
    ){

        console.log(
            "CPUサモン：手札不足"
        );

        return false;

    }


    //----------------------------------
    // コストカード
    //----------------------------------

    const costCards =
selectCpuCostCards(
    card,
    currentCost
);


    //----------------------------------
    // コスト枚数確認
    //----------------------------------

    if(
        costCards.length <
        currentCost
    ){

        console.log(
            "CPUサモン：コスト不足"
        );

        return false;

    }


    //----------------------------------
    // コスト支払い
    //----------------------------------

    costCards.forEach(
        costCard=>{

            moveEnemyToCost(
                costCard
            );

        }
    );


    //----------------------------------
    // 召喚
    //----------------------------------

    const result =
    executeSummon(
        card,
        ENEMY
    );

    addBattleLog(
    `CPU：${card.name}を召喚`
);


    return result !== false;

}

//======================================
// CPUコスト移動
//======================================

function moveEnemyToCost(card){

    enemyHandCards =
    enemyHandCards.filter(
        c => c !== card
    );


    card.area =
    "enemyCost";


    card.setFaceDown(true);


    enemyCostCards.push(
        card
    );


    board.enemyCostCards =
    enemyCostCards;


    updateEnemyZoneDisplay();

}


//======================================
// CPUマギア使用
//======================================


//======================================
// CPUマギア使用
//======================================

function cpuMagia(
    card,
    target
){

    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `CPU：${card.name}を使用`
    );

    addBattleLog(
        `CPU：対象 → ${
            getMagiaTargetLog(target)
        }`
    );


    //----------------------------------
    // CPUカード使用演出
    //----------------------------------

    showCpuCardAction(
        card,
        "MAGIA",
        target
    );


    console.log(
        "CPUマギア使用",
        card.name
    );


    //----------------------------------
    // CPU側の現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    console.log(
        "CPUマギアコスト",
        card.name,
        "元cost=",
        card.cost,
        "現在cost=",
        currentCost
    );


    //----------------------------------
    // マギア情報保存
    //----------------------------------

    magiaCard =
        card;

    magiaCard.owner =
        ENEMY;

    magiaTarget =
        target;


    //----------------------------------
    // CPUマギアを手札から除外
    //----------------------------------

    enemyHandCards =
        enemyHandCards.filter(
            c => c !== card
        );


    //----------------------------------
    // コスト支払い
    //----------------------------------

    payEnemyCost(
        currentCost
    );


    //----------------------------------
    // 強制コスト型
    //----------------------------------

    if(
        card.effect &&
        card.effect.type ===
        "forceCost"
    ){

        console.log(
            "CPU：強制コスト選択開始"
        );


        //----------------------------------
        // 対象発光
        //----------------------------------

        console.log(
    "★ CPUマギア対象デバッグ",
    "target=",
    target,
    "target===PLAYER=",
    target === PLAYER,
    "target==='player'=",
    target === "player"
);


        showCpuMagiaTargetHighlight(
            target
        );


        //----------------------------------
        // プレイヤーが手札を選択
        //----------------------------------

        startForceCostSelect(
            target
        );


        //----------------------------------
        // CPUターン停止
        //----------------------------------

        cpuWaiting = true;


        return true;

    }


    //----------------------------------
    // 通常マギア
    //----------------------------------

    resolveMagia();


    //----------------------------------
    // resetMagiaState()で消された後なので
    // もう一度対象を発光
    //----------------------------------

    setTimeout(()=>{

        console.log(
    "★ CPUマギア対象デバッグ",
    "target=",
    target,
    "target===PLAYER=",
    target === PLAYER,
    "target==='player'=",
    target === "player"
);




        showCpuMagiaTargetHighlight(
            target
        );

    },0);


    //----------------------------------
    // 対象発光解除
    //----------------------------------

    setTimeout(()=>{

        clearCpuMagiaTargetHighlight(
            target
        );

    },5000);


    return true;

}

//======================================
// CPUマギア対象選択
//======================================

function selectCpuMagiaTarget(card){

    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return null;

    }


    const targets =
        card.effect.target;

//======================================
// フォローウィンド
// 召喚したばかりで攻撃できないCPUサモンのみ対象
//======================================

if(
    card.name === "フォローウィンド"
){

    const candidates =
        enemyField.filter(
            summon => {

                //----------------------------------
                // マギア対象不可
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return false;

                }


                //----------------------------------
                // 横向きなら対象外
                //----------------------------------

                if(
                    summon.isRest
                ){

                    return false;

                }


                //----------------------------------
                // すでに攻撃可能なら対象外
                //----------------------------------

                if(
                    summon.attackReady
                ){

                    return false;

                }


                //----------------------------------
                // summonTurnAttack持ちは対象外
                //----------------------------------

                if(
                    summon.card?.ability?.type ===
                    "summonTurnAttack"
                ){

                    return false;

                }


                //----------------------------------
                // ここまで来たら
                // 「召喚ターンで攻撃できないサモン」
                //----------------------------------

                return true;

            }
        );


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(
        candidates.length === 0
    ){

        console.log(
            "CPU：フォローウィンド対象なし"
        );

        return null;

    }


    //----------------------------------
    // 対象決定
    //----------------------------------

    const target =
        candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
        ];


    console.log(
        "CPU：フォローウィンド対象",
        target.card.name
    );


    return target;

}


    //======================================
    // バーニングエナジー
    //======================================

    if(
        card.name ===
        "バーニングエナジー"
    ){

        //----------------------------------
        // CPUの攻撃可能サモン
        //----------------------------------

        const candidates =
            enemyField.filter(
                summon => {


                    //----------------------------------
                    // マギア対象不可
                    //----------------------------------

                    if(
                        isMagiaTargetBlocked(
                            card,
                            summon
                        )
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 横向きなら対象外
                    //----------------------------------

                    if(
                        summon.isRest
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 召喚ターンは攻撃不可
                    // summonTurnAttackなら例外
                    //----------------------------------

                    if(
                        !summon.attackReady &&
                        summon.card.ability?.type !==
                        "summonTurnAttack"
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 対象サモンのパワー
                    //----------------------------------

                    const targetPower =
                        getPower(
                            summon
                        );


                    //----------------------------------
                    // プレイヤー側のタテ向きサモン
                    //----------------------------------

                    const strongPlayerSummon =
                        playerField.some(
                            playerSummon => {


                                //----------------------------------
                                // マギア対象不可
                                //----------------------------------

                                if(
                                    isMagiaTargetBlocked(
                                        card,
                                        playerSummon
                                    )
                                ){

                                    return false;

                                }


                                //----------------------------------
                                // タテ向きのみ
                                //----------------------------------

                                if(
                                    playerSummon.isRest
                                ){

                                    return false;

                                }


                                //----------------------------------
                                // パワー+3以上
                                //----------------------------------

                                return (
                                    getPower(
                                        playerSummon
                                    )
                                    >=
                                    targetPower + 3
                                );

                            }
                        );


                    //----------------------------------
                    // 強いタテ向きサモンがいる
                    //----------------------------------

                    if(
                        strongPlayerSummon
                    ){

                        console.log(
                            "CPU：バーニングエナジー対象外",
                            summon.card.name,
                            "targetPower=",
                            targetPower,
                            "プレイヤー側にパワー+3以上の",
                            "タテ向きサモンあり"
                        );

                        return false;

                    }


                    return true;

                }
            );


        //----------------------------------
        // 対象なし
        //----------------------------------

        if(
            candidates.length === 0
        ){

            console.log(
                "CPU：バーニングエナジー対象なし"
            );

            return null;

        }


        //----------------------------------
        // 対象決定
        //----------------------------------

        const target =
            candidates[
                Math.floor(
                    Math.random() *
                    candidates.length
                )
            ];


        console.log(
            "CPU：バーニングエナジー対象",
            target.card.name,
            "power=",
            getPower(target)
        );


        return target;

    }


    //======================================
    // 通常マギア
    //======================================

    const candidates = [];


const isDamageMagia =
    card.effect.type === "damage";


const damageValue =
    Number(
        card.effect.value
    ) || 0;


//======================================
// 必殺対象
// PLAYER手札1枚以下
// かつ、このマギアでLIFEを0以下にできる
//======================================

if(
    isDamageMagia
){

    const playerHandCount =
        board.handCards.length;

    const playerLife =
        game.playerLife;


    if(
        playerHandCount <= 1 &&
        damageValue >= playerLife &&
        card.effect.target.includes("enemy")
    ){

        console.log(
            "★ CPU：必殺のためPLAYERを直接対象",
            card.name,
            "PLAYER手札=",
            playerHandCount,
            "PLAYER LIFE=",
            playerLife,
            "ダメージ=",
            damageValue
        );


        return PLAYER;

    }

}


//======================================
// ダメージマギア専用優先順位
//======================================

if(isDamageMagia){

    const priorityTarget =
        selectCpuDamageMagiaTarget(
            card
        );


    if(priorityTarget){

        console.log(
            "CPU：ダメージマギア優先対象",
            card.name,
            priorityTarget === PLAYER
                ? "PLAYER"
                : priorityTarget.card.name
        );


        return priorityTarget;

    }

}

    //======================================
    // 自分サモン
    // CPU自身のサモン
    //======================================

    if(
        targets.includes(
            "playerSummon"
        ) &&
        !isDamageMagia
    ){

        enemyField.forEach(
            summon => {

                //----------------------------------
                // 対象判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === ENEMY
                ){

                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 相手サモン
    // プレイヤーのサモン
    //======================================

    if(
        targets.includes(
            "enemySummon"
        )
    ){

        playerField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner !==
                    PLAYER
                ){

                    return;

                }


                //----------------------------------
                // ダメージマギアの場合
                // 倒せるサモンだけ候補
                //----------------------------------

                if(
                    isDamageMagia
                ){

                    const power =
                        getPower(
                            summon
                        );


                    if(
                        power > damageValue
                    ){

                        return;

                    }

                }


                candidates.push(
                    summon
                );

            }
        );

    }


    //======================================
    // 自分タテ向き
    //======================================

    if(
        targets.includes(
            "playerVerticalSummon"
        )
    ){

        enemyField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === ENEMY &&
                    !summon.isRest
                ){

                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 自分ヨコ向き
    //======================================

    if(
        targets.includes(
            "playerHorizontalSummon"
        )
    ){

        enemyField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === ENEMY &&
                    summon.isRest
                ){

                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 相手タテ向き
    // プレイヤーのサモン
    //======================================

    if(
        targets.includes(
            "enemyVerticalSummon"
        )
    ){

        playerField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === PLAYER &&
                    !summon.isRest
                ){

                    //----------------------------------
                    // ダメージマギア
                    //----------------------------------

                    if(
                        isDamageMagia
                    ){

                        const power =
                            getPower(
                                summon
                            );


                        if(
                            power > damageValue
                        ){

                            return;

                        }

                    }


                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 相手ヨコ向き
    // プレイヤーのサモン
    //======================================

    if(
        targets.includes(
            "enemyHorizontalSummon"
        )
    ){

        playerField.forEach(
            summon => {


                //----------------------------------
                // 対象不可判定
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return;

                }


                if(
                    summon.owner === PLAYER &&
                    summon.isRest
                ){

                    //----------------------------------
                    // ダメージマギア
                    //----------------------------------

                    if(
                        isDamageMagia
                    ){

                        const power =
                            getPower(
                                summon
                            );


                        if(
                            power > damageValue
                        ){

                            return;

                        }

                    }


                    candidates.push(
                        summon
                    );

                }

            }
        );

    }


    //======================================
    // 自分
    // CPU自身
    //======================================

    if(
        targets.includes(
            "player"
        )
    ){

        candidates.push(
            ENEMY
        );

    }


    //======================================
    // 相手
    // プレイヤー
    //======================================

    if(
        targets.includes(
            "enemy"
        )
    ){

        candidates.push(
            PLAYER
        );

    }


    //======================================
    // 対象なし
    //======================================

    if(
        candidates.length === 0
    ){

        return null;

    }


    //======================================
    // 対象決定
    //======================================

    return candidates[
        Math.floor(
            Math.random() *
            candidates.length
        )
    ];

}

//======================================
// CPUマギアコスト
//======================================

function payEnemyCost(
    cost,
    excludeCard = null
){

    const costCards =
        selectCpuCostCards(
            excludeCard,
            cost
        );


    if(
        costCards.length < cost
    ){

        console.log(
            "CPUコスト支払い失敗",
            "必要=",
            cost,
            "取得=",
            costCards.length
        );

        return false;
    }


    costCards.forEach(
        card => {

            moveEnemyToCost(
                card
            );

        }
    );


    updateEnemyZoneDisplay();

    return true;
}

//======================================
// CPUコスト回復
//======================================

function recoverEnemyCostCards(){

    if(
        enemyCostCards.length === 0
    ){

        return;

    }


    enemyCostCards.forEach(
        card=>{

            card.area =
            "enemyHand";

            card.setFaceDown(false);

            enemyHandCards.push(
                card
            );

        }
    );


    enemyCostCards = [];


    board.enemyCostCards =
    enemyCostCards;


    updateEnemyZoneDisplay();


    console.log(
        "CPUコスト回復完了"
    );

}


//======================================
// CPUターン終了
//======================================
function cpuFinishTurn(){

    console.log(
        "CPU行動終了"
    );


    cpuWaiting = false;


    //----------------------------------
    // モーダルを閉じる
    //----------------------------------

    closeHandModal();

    closeSummonActionModal();

    closeCoolModal();

    closeEnemyCoolModal();

    closeCostView();


    //----------------------------------
    // ターン終了
    //----------------------------------

    finishTurn();

}

function continueCpuTurn(){

console.log(
    "CPU再開",
    "cpuTurnStep=",
    cpuTurnStep,
    "cpuAttackIndex=",
    cpuAttackIndex,
    "cpuAttackQueue=",
    cpuAttackQueue.map(
        summon => summon.card.name
    )
);

    //----------------------------------
    // CPUターンでなければ終了
    //----------------------------------

    if(
        game.currentPlayer !== ENEMY
    ){

        return;

    }


    //----------------------------------
    // レジスト中なら待機
    //----------------------------------

    if(resistMode){

        console.log(
            "CPU再開待機：レジスト中"
        );

        return;

    }


    //----------------------------------
    // ブロック中なら待機
    //----------------------------------

    if(blockMode){

        console.log(
            "CPU再開待機：ブロック中"
        );

        return;

    }


    console.log(
        "CPU次の行動へ"
    );


    //----------------------------------
    // CPU行動を再開
    //----------------------------------

    setTimeout(()=>{

        runCpuTurnStep();

    },500);

}

//======================================
// CPUブロック判断
//======================================

function cpuShouldBlock(
    blockers,
    attacker
){

    //----------------------------------
    // ブロッカーなし
    //----------------------------------

    if(
        !blockers ||
        blockers.length === 0
    ){

        console.log(
            "CPUブロック判断：ブロッカーなし"
        );

        return false;

    }


    //----------------------------------
    // 攻撃者のパワー
    //----------------------------------

    const attackerPower =
        getPower(attacker);


    console.log(
        "CPUブロック判断",
        {
            attacker:
                attacker.card.name,

            attackerPower:
                attackerPower,

            blockers:
                blockers.map(
                    summon => ({
                        name:
                            summon.card.name,

                        power:
                            getPower(summon)
                    })
                )
        }
    );


    //----------------------------------
    // まず攻撃をレジストで
    // 1以下にできるか確認
    //----------------------------------

    const attackDamage =
        attackerPower;


    const resistCanReduce =
        cpuCanReduceAttackToOne(
            attackDamage
        );


    console.log(
        "CPUブロック判断：レジスト評価",
        {
            attackDamage:
                attackDamage,

            resistCanReduce:
                resistCanReduce
        }
    );


    //----------------------------------
    // ブロッカー評価
    //----------------------------------

    let bestBlocker = null;

    let bestScore = -Infinity;


    for(
        const blocker
        of blockers
    ){

        const blockerPower =
            getPower(blocker);


        //----------------------------------
        // 攻撃者を倒せる
        //----------------------------------

        if(
            blockerPower >
            attackerPower
        ){

            const score =
                1000;


            if(
                score >
                bestScore
            ){

                bestScore =
                    score;

                bestBlocker =
                    blocker;

            }

            continue;

        }


        //----------------------------------
        // 相打ち
        //----------------------------------

        if(
            blockerPower ===
            attackerPower
        ){

            const score =
                900;


            if(
                score >
                bestScore
            ){

                bestScore =
                    score;

                bestBlocker =
                    blocker;

            }

            continue;

        }


        //----------------------------------
        // ここからはブロッカーが
        // 攻撃者に倒されるケース
        //----------------------------------

        //----------------------------------
        // レジストでも1以下に
        // できないならブロック
        //----------------------------------

        if(
            !resistCanReduce
        ){

            //----------------------------------
            // パワー差が大きいほど
            // ブロック優先度を上げる
            //----------------------------------

            const powerDifference =
                attackerPower -
                blockerPower;


            const score =
                500 +
                powerDifference;


            if(
                score >
                bestScore
            ){

                bestScore =
                    score;

                bestBlocker =
                    blocker;

            }

            continue;

        }


        //----------------------------------
        // レジストで防げるなら
        // 無理にブロックしない
        //----------------------------------

        console.log(
            "CPUブロック判断：レジストで対応可能",
            blocker.card.name
        );

    }


    //----------------------------------
    // ブロックしない
    //----------------------------------

    if(
        !bestBlocker
    ){

        console.log(
            "CPUブロック判断：今回はブロックしない"
        );

        return false;

    }


    //----------------------------------
    // 選択したブロッカーを保存
    //----------------------------------

    cpuSelectedBlocker =
        bestBlocker;


    console.log(
        "CPUブロック判断：ブロックする",
        bestBlocker.card.name,
        "score=",
        bestScore
    );


    return true;

}

//======================================
// CPUが攻撃ダメージを1以下にできるか
//======================================

function cpuCanReduceAttackToOne(
    damage
){

    //----------------------------------
    // ダメージ1以下なら
    // そもそもレジスト不要
    //----------------------------------

    if(
        damage <= 1
    ){

        return true;

    }


    //----------------------------------
    // 現在使えるレジストを取得
    //----------------------------------

    const candidates =
        findCpuResistCards({

            type:
                GAME_EVENT.BEFORE_PLAYER_DAMAGE,

            player:
                ENEMY,

            damage:
                damage

        });


    //----------------------------------
    // 使用可能カードなし
    //----------------------------------

    if(
        !candidates ||
        candidates.length === 0
    ){

        console.log(
            "CPUブロック判断：レジストなし"
        );

        return false;

    }


    //----------------------------------
    // 1枚で1以下にできるか確認
    //----------------------------------

    for(
        const card
        of candidates
    ){

        let remaining =
            damage;


        switch(
            card.effect
        ){

            case "stoneGuard":

                remaining -= 3;

                break;


            case "groundwall":

                remaining -= 5;

                break;


            case "liquidVeil":

                remaining -= 2;

                break;


            case "waterBarrier":

                remaining = 0;

                break;


            case "rapidMove":

                remaining = 0;

                break;


            case "sandProtect":

                if(
                    damage === 1
                ){

                    remaining = 0;

                }

                break;

        }


        remaining =
            Math.max(
                0,
                remaining
            );


        console.log(
            "CPUブロック判断：レジスト評価",
            card.name,
            "damage=",
            damage,
            "remaining=",
            remaining
        );


        if(
            remaining <= 1
        ){

            return true;

        }

    }


    //----------------------------------
    // 1枚では防げない
    //----------------------------------

    return false;

}



function findCpuResistCards(event){

    console.log(
        "CPUレジスト候補検索",
        event
    );


    //----------------------------------
    // CPUレジスト使用判定
    //----------------------------------

    if(
        !shouldCpuUseResist(event)
    ){

        console.log(
            "CPUレジスト使用条件なし"
        );

        return [];

    }


    const result = [];


    //----------------------------------
    // CPUの手札から検索
    //----------------------------------

    for(
        const card of enemyHandCards
    ){

        //----------------------------------
        // レジストのみ
        //----------------------------------

        if(
            card.type !== "レジスト"
        ){

            continue;

        }


        //----------------------------------
        // このイベントで使用済み
        //----------------------------------

        if(card.usedThisEvent){

            continue;

        }


        //----------------------------------
        // 発動タイミング確認
        //----------------------------------

        if(
            Array.isArray(card.trigger)
        ){

            if(
                !card.trigger.includes(
                    event.type
                )
            ){

                continue;

            }

        }else{

            if(
                card.trigger !== event.type
            ){

                continue;

            }

        }


        //----------------------------------
        // コスト支払い可能か確認
        //----------------------------------

        if(
            !canPayCost(
                card,
                ENEMY
            )
        ){

            console.log(
                "CPUレジスト コスト不足",
                card.name
            );

            continue;

        }


        //----------------------------------
        // 個別条件確認
        //----------------------------------

        if(card.condition){

            const canUse =
                card.condition(event);


            if(!canUse){

                console.log(
                    "CPUレジスト 条件不一致",
                    card.name
                );

                continue;

            }

        }


        //----------------------------------
        // 使用可能
        //----------------------------------

        console.log(
            "CPUレジスト 使用可能",
            card.name
        );


        result.push(card);

    }


    console.log(
        "CPU使用可能レジスト",
        result.map(
            card=>card.name
        )
    );


    return result;

}


//======================================
// CPUレジスト使用判定
//======================================

function shouldCpuUseResist(event){

    console.log(
        "========== CPUレジスト判定 =========="
    );

    console.log(
        "event =",
        event
    );


    //----------------------------------
    // イベントなし
    //----------------------------------

    if(!event){

        console.log(
            "CPUレジスト不可：eventなし"
        );

        return false;

    }


    //======================================
    // CPUサモンへのダメージ
    // リキッドヴェール判定
    //======================================

    if(
        event.type ===
        GAME_EVENT.BEFORE_SUMMON_DAMAGE
    ){

        //----------------------------------
        // CPUサモンが対象か
        //----------------------------------

        if(
            !event.target ||
            event.target.owner !== ENEMY
        ){

            console.log(
                "CPUレジスト不可：CPUサモン対象ではありません"
            );

            return false;

        }


        //----------------------------------
        // マギアによるダメージか
        //----------------------------------

        if(
            event.sourceType !==
            "マギア"
        ){

            console.log(
                "CPUレジスト不可：マギアではありません"
            );

            return false;

        }


        //----------------------------------
        // damageタイプのマギアか
        //----------------------------------

        if(
            !event.source ||
            !event.source.effect ||
            event.source.effect.type !==
            "damage"
        ){

            console.log(
                "CPUレジスト不可：damageマギアではありません"
            );

            return false;

        }


        //----------------------------------
        // リキッドヴェール検索
        //----------------------------------

        const liquidVeil =
            enemyHandCards.find(
                card =>
                    card.name ===
                    "リキッドヴェール" &&
                    card.type ===
                    "レジスト"
            );


        if(!liquidVeil){

            console.log(
                "CPUレジスト不可：リキッドヴェールなし"
            );

            return false;

        }


        //----------------------------------
        // このイベントで使用済み
        //----------------------------------

        if(
            liquidVeil.usedThisEvent
        ){

            console.log(
                "CPUレジスト不可：リキッドヴェール使用済み"
            );

            return false;

        }


        //----------------------------------
        // コスト確認
        //----------------------------------

        if(
            !canPayCost(
                liquidVeil,
                ENEMY
            )
        ){

            console.log(
                "CPUレジスト不可：リキッドヴェール コスト不足"
            );

            return false;

        }


        //----------------------------------
        // 対象サモンの現在パワー
        //----------------------------------

        const power =
            getPower(
                event.target
            );


        //----------------------------------
        // 与えられるダメージ
        //----------------------------------

        const damage =
            Number(event.damage) || 0;


        //----------------------------------
        // パワー未満
        //----------------------------------

        if(
            damage < power
        ){

            console.log(
                "CPUレジスト不可：ダメージ不足",
                "power=",
                power,
                "damage=",
                damage
            );

            return false;

        }


        //----------------------------------
        // パワー+2以上
        //----------------------------------
        // リキッドヴェールは使わない
        //----------------------------------

        if(
            damage >= power + 2
        ){

            console.log(
                "CPUレジスト不可：ダメージ過剰",
                "power=",
                power,
                "damage=",
                damage
            );

            return false;

        }


        //----------------------------------
        // パワーと同じ
        // またはパワー+1
        //----------------------------------

        console.log(
            "CPUレジスト使用判定：YES",
            "リキッドヴェール",
            "target=",
            event.target.card.name,
            "power=",
            power,
            "damage=",
            damage
        );


        return true;

    }


    //======================================
    // ここからCPU本体へのダメージ
    //======================================

    if(
        event.type !==
        GAME_EVENT.BEFORE_PLAYER_DAMAGE
    ){

        console.log(
            "CPUレジスト不可：イベント違い",
            event.type
        );

        return false;

    }


    //----------------------------------
    // CPUが対象でなければ不可
    //----------------------------------

    if(
        event.player !== ENEMY
    ){

        console.log(
            "CPUレジスト不可：対象違い",
            "event.player =",
            event.player,
            "ENEMY =",
            ENEMY
        );

        return false;

    }


    //----------------------------------
    // 1ダメージ
    // サンドプロテクト候補
    //----------------------------------

    if(
        event.damage === 1
    ){

        console.log(
            "CPUレジスト使用判定：YES",
            "1ダメージなのでサンドプロテクト候補"
        );

        return true;

    }


    //----------------------------------
    // 2ダメージ以上
    //----------------------------------

    if(
        event.damage >= 2
    ){

        console.log(
            "CPUレジスト使用判定：YES",
            "damage =",
            event.damage
        );

        return true;

    }


    //----------------------------------
    // ライフ0になる場合
    //----------------------------------

    if(
        typeof enemyLife !== "undefined" &&
        enemyLife - event.damage <= 0
    ){

        console.log(
            "CPUレジスト使用判定：YES",
            "ライフ0"
        );

        return true;

    }


    //----------------------------------
    // 使用しない
    //----------------------------------

    console.log(
        "CPUレジスト使用判定：NO"
    );

    return false;

}


//======================================
// CPUレジスト最適カード選択
//======================================

function selectBestCpuResist(
    cards,
    damage,
    event = null
){

    if(
        !cards ||
        cards.length === 0 ||
        damage <= 0
    ){

        return null;

    }


    //----------------------------------
    // リキッドヴェール優先判定
    //----------------------------------

    if(
        event &&
        event.type ===
        GAME_EVENT.BEFORE_SUMMON_DAMAGE
    ){

        //----------------------------------
        // CPUサモンが対象
        //----------------------------------

        if(
            event.target &&
            event.target.owner === ENEMY
        ){

            //----------------------------------
            // プレイヤーのマギアによるダメージ
            //----------------------------------

            if(
                event.sourceType === "マギア" &&
                event.source &&
                event.source.effect &&
                event.source.effect.type === "damage"
            ){

                const liquidVeilCard =
                    cards.find(
                        card =>
                            card.effect ===
                            "liquidVeil"
                    );


                if(
                    liquidVeilCard
                ){

                    const power =
                        getPower(
                            event.target
                        );


                    //----------------------------------
                    // パワーと同じ
                    //----------------------------------

                    if(
                        damage === power
                    ){

                        console.log(
                            "CPUレジスト最優先：リキッドヴェール",
                            "target=",
                            event.target.card.name,
                            "power=",
                            power,
                            "damage=",
                            damage
                        );


                        return liquidVeilCard;

                    }


                    //----------------------------------
                    // パワー+1
                    //----------------------------------

                    if(
                        damage === power + 1
                    ){

                        console.log(
                            "CPUレジスト最優先：リキッドヴェール",
                            "target=",
                            event.target.card.name,
                            "power=",
                            power,
                            "damage=",
                            damage
                        );


                        return liquidVeilCard;

                    }


                    //----------------------------------
                    // パワー+2以上
                    // → リキッドヴェールを使わない
                    //----------------------------------

                    if(
                        damage >= power + 2
                    ){

                        console.log(
                            "リキッドヴェール不使用：ダメージ過剰",
                            "target=",
                            event.target.card.name,
                            "power=",
                            power,
                            "damage=",
                            damage
                        );

                    }

                }

            }

        }

    }


    //----------------------------------
    // 1ダメージなら
    // サンドプロテクトを最優先
    //----------------------------------

    if(
        damage === 1
    ){

        const sandProtectCard =
            cards.find(
                card =>
                    card.effect ===
                    "sandProtect"
            );


        if(
            sandProtectCard
        ){

            console.log(
                "CPUレジスト最優先：サンドプロテクト"
            );


            return sandProtectCard;

        }

    }


    //----------------------------------
    // 各レジストの軽減量
    //----------------------------------

    function getResistReduction(card){

        if(!card){

            return 0;

        }


        switch(card.effect){

            case "stoneGuard":

                return 3;


            case "groundwall":

                return 5;


            case "liquidVeil":

                return 2;


            case "waterBarrier":

                return damage;


            case "rapidMove":

                return damage;


            case "sandProtect":

                if(
                    damage === 1
                ){

                    return 1;

                }

                return 0;


            default:

                return 0;

        }

    }


    //----------------------------------
    // 使用可能カードを評価
    //----------------------------------

    const candidates =
        cards
        .map(card=>{

            const reduction =
                getResistReduction(
                    card
                );


            const remaining =
                Math.max(
                    0,
                    damage - reduction
                );


            return {

                card:
                    card,

                reduction:
                    reduction,

                remaining:
                    remaining

            };

        })
        .filter(
            item =>
                item.reduction > 0
        );


    if(
        candidates.length === 0
    ){

        return null;

    }


    //----------------------------------
    // 1枚で0にできるカードを優先
    //----------------------------------

    const finishers =
        candidates.filter(
            item =>
                item.remaining === 0
        );


    if(
        finishers.length > 0
    ){

        finishers.sort(
            (a,b) =>
                a.reduction -
                b.reduction
        );


        console.log(
            "CPUレジスト最適選択",
            finishers[0].card.name,
            "damage=",
            damage,
            "軽減=",
            finishers[0].reduction
        );


        return finishers[0].card;

    }


    //----------------------------------
    // 1枚で0にできない場合
    // 最も大きく軽減するカード
    //----------------------------------

    candidates.sort(
        (a,b) =>
            b.reduction -
            a.reduction
    );


    console.log(
        "CPUレジスト最適選択",
        candidates[0].card.name,
        "damage=",
        damage,
        "軽減=",
        candidates[0].reduction
    );


    return candidates[0].card;

}

//======================================
// CPUコストカード選択
//======================================

function selectCpuCostCards(
    excludeCard,
    cost
){

    //----------------------------------
    // コスト候補
    //----------------------------------

    const candidates =
        enemyHandCards.filter(
            card => card !== excludeCard
        );


    //----------------------------------
    // 種類ごとに分類
    //----------------------------------

    const summons =
        candidates.filter(
            card => card.type === "サモン"
        );

    const magias =
        candidates.filter(
            card => card.type === "マギア"
        );

    const resists =
        candidates.filter(
            card => card.type === "レジスト"
        );


    //----------------------------------
    // 各種類をランダムに並べる
    //----------------------------------

    summons.sort(
        () => Math.random() - 0.5
    );

    magias.sort(
        () => Math.random() - 0.5
    );

    resists.sort(
        () => Math.random() - 0.5
    );


    //----------------------------------
    // 優先順位順にまとめる
    //----------------------------------

    const orderedCards = [

        ...summons,
        ...magias,
        ...resists

    ];


    //----------------------------------
    // 必要枚数だけ取得
    //----------------------------------

    const costCards =
        orderedCards.slice(
            0,
            cost
        );


    console.log(
        "CPUコスト選択",
        costCards.map(
            card => card.name
        )
    );


    return costCards;

}

//======================================
// アクアストリーム使用判定
// CPU → PLAYERのサモンのみ
//======================================

function cpuShouldUseAquaStream(){

    //----------------------------------
    // アクアストリーム検索
    //----------------------------------

    const aquaStream =
        enemyHandCards.find(
            card =>
                card.name === "アクアストリーム" &&
                card.type === "マギア"
        );


    if(!aquaStream){

        return null;

    }


    //----------------------------------
    // CPU側に攻撃可能サモンがいるか
    //----------------------------------

    const attackableSummon =
        enemyField.find(
            summon => {

                if(!summon){

                    return false;

                }


                //----------------------------------
                // 横向きなら攻撃不可
                //----------------------------------

                if(
                    summon.isRest
                ){

                    return false;

                }


                //----------------------------------
                // 召喚ターンは攻撃不可
                // summonTurnAttackなら例外
                //----------------------------------

                if(
                    !summon.attackReady &&
                    summon.card.ability?.type !==
                    "summonTurnAttack"
                ){

                    return false;

                }


                return true;

            }
        );


    if(!attackableSummon){

        console.log(
            "CPU：アクアストリーム使用不可",
            "攻撃可能サモンなし"
        );

        return null;

    }


    //----------------------------------
    // プレイヤー側サモンのみ取得
    //----------------------------------

    const targets =
        playerField.filter(
            summon => {

                if(!summon){

                    return false;

                }


                //----------------------------------
                // PLAYERのサモンのみ
                //----------------------------------

                if(
                    summon.owner !== PLAYER
                ){

                    return false;

                }


                //----------------------------------
                // 横向きサモンは対象外
                //----------------------------------

                if(
                    summon.isRest
                ){

                    console.log(
                        "CPU：アクアストリーム対象外",
                        summon.card.name,
                        "横向き"
                    );

                    return false;

                }


                //----------------------------------
                // 相手のマギア対象不可
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        aquaStream,
                        summon
                    )
                ){

                    console.log(
                        "CPU：アクアストリーム対象外",
                        summon.card.name
                    );

                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // プレイヤーサモンなし
    //----------------------------------

    if(
        targets.length === 0
    ){

        console.log(
            "CPU：アクアストリーム使用不可",
            "対象となるプレイヤーサモンなし"
        );

        return null;

    }


    //----------------------------------
    // コスト確認
    //----------------------------------

    if(
        !canPayCost(
            aquaStream,
            ENEMY
        )
    ){

        console.log(
            "CPU：アクアストリーム コスト不足"
        );

        return null;

    }


    //----------------------------------
    // 使用情報
    //----------------------------------

    return {

        card:
            aquaStream,

        attacker:
            attackableSummon,

        targets:
            targets

    };

}

//======================================
// CPU：フォローウィンド対象確認
//======================================

function getCpuFollowWindTarget(){

    const followWind =
        enemyHandCards.find(
            card =>
                card.name === "フォローウィンド" &&
                card.type === "マギア"
        );

    if(!followWind){
        return null;
    }


    const target =
        enemyField.find(
            summon => {

                if(!summon){
                    return false;
                }


                //----------------------------------
                // マギア対象不可
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        followWind,
                        summon
                    )
                ){
                    return false;
                }


                //----------------------------------
                // すでに攻撃可能
                //----------------------------------

                if(
                    summon.attackReady
                ){
                    return false;
                }


                //----------------------------------
                // 横向き
                //----------------------------------

                if(
                    summon.isRest
                ){
                    return false;
                }


                //----------------------------------
                // 召喚ターン攻撃可能能力持ち
                //----------------------------------

                if(
                    summon.card?.ability?.type ===
                    "summonTurnAttack"
                ){
                    return false;
                }


                return true;
            }
        );


    if(!target){
        return null;
    }


    const currentCost =
        getCurrentCardCost(
            followWind,
            ENEMY
        );


    if(
        enemyHandCards.length
        - 1
        - currentCost
        < 2
    ){
        return null;
    }


    return {
        card:
            followWind,

        target:
            target
    };
}

//======================================
// ウィンドプレッシャー使用判定
// 最初の攻撃前のみ
//======================================

function cpuShouldUseWindPressure(){

    //----------------------------------
    // ウィンドプレッシャー検索
    //----------------------------------

    const windPressure =
        enemyHandCards.find(
            card =>
                card.name === "ウィンドプレッシャー" &&
                card.type === "マギア"
        );


    if(!windPressure){

        return null;

    }


    //----------------------------------
    // プレイヤー手札枚数
    //----------------------------------

    const playerHandCount =
        board.handCards.length;


    //----------------------------------
    // 手札が0枚なら使用しない
    //----------------------------------

    if(
        playerHandCount === 0
    ){

        console.log(
            "CPU：ウィンドプレッシャー使用しない",
            "PLAYER手札=0"
        );

        return null;

    }


    //----------------------------------
    // 4枚以下なら使用候補
    //----------------------------------

    if(
        playerHandCount > 4
    ){

        console.log(
            "CPU：ウィンドプレッシャー使用条件不成立",
            "PLAYER手札=",
            playerHandCount
        );

        return null;

    }


    //----------------------------------
    // 現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            windPressure,
            ENEMY
        );


    //----------------------------------
    // コスト確認
    //----------------------------------

    if(
        !canPayCost(
            windPressure,
            ENEMY
        )
    ){

        console.log(
            "CPU：ウィンドプレッシャー コスト不足"
        );

        return null;

    }


    //----------------------------------
    // 使用情報
    //----------------------------------

    return {

        card:
            windPressure,

        target:
            PLAYER

    };

}

//======================================
// ウィンドプレッシャー使用
//======================================

function cpuUseWindPressure(){

    const info =
        cpuShouldUseWindPressure();


    if(!info){

        return false;

    }


    console.log(
        "CPU：ウィンドプレッシャー使用",
        "PLAYER手札=",
        board.handCards.length
    );


    //----------------------------------
    // プレイヤーを対象に使用
    //----------------------------------

    const result =
        cpuMagia(
            info.card,
            info.target
        );


    console.log(
        "CPU：ウィンドプレッシャー使用結果",
        result
    );


    return result;

}


//======================================
// CPUマギア対象発光
//======================================

function showCpuMagiaTargetHighlight(target){

    if(!target){

        return;

    }


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        target.view &&
        typeof target.view.getElement ===
        "function"
    ){

        target.view
            .getElement()
            .classList.add(
                "magia-target"
            );


        console.log(
            "★ CPUマギア対象発光：サモン",
            target.card?.name
        );


        return;

    }


//----------------------------------
// PLAYER
//----------------------------------

if(
    target === PLAYER ||
    target === "player"
){

    const playerIcon =
        document.getElementById(
            "player-icon"
        );


    if(playerIcon){

        playerIcon.classList.add(
            "magia-target"
        );


        console.log(
            "★ CPUマギア対象発光：PLAYER"
        );

    }

}
}

//======================================
// CPUマギア対象発光解除
//======================================

function clearCpuMagiaTargetHighlight(target){

    if(!target){

        return;

    }


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        target.view &&
        typeof target.view.getElement ===
        "function"
    ){

        target.view
            .getElement()
            .classList.remove(
                "magia-target"
            );

        return;

    }

//----------------------------------
// PLAYER
//----------------------------------

if(
    target === PLAYER ||
    target === "player"
){

    const playerIcon =
        document.getElementById(
            "player-icon"
        );


    if(playerIcon){

        playerIcon.classList.remove(
            "magia-target"
        );

    }

}

}


//======================================
// CPU：攻撃に意味があるか判定
//======================================

function cpuHasMeaningfulAttack(){

    //----------------------------------
    // 現在の攻撃キューを作成
    //----------------------------------

    const oldQueue =
        Array.isArray(cpuAttackQueue)
        ? [...cpuAttackQueue]
        : [];

    const oldIndex =
        cpuAttackIndex;


    createCpuAttackQueue();


    //----------------------------------
    // 攻撃可能サモンなし
    //----------------------------------

    if(
        cpuAttackQueue.length === 0
    ){

        cpuAttackQueue =
            oldQueue;

        cpuAttackIndex =
            oldIndex;

        return false;

    }


    //----------------------------------
    // 攻撃可能サモンを確認
    //----------------------------------

    const meaningful =
        cpuAttackQueue.some(
            attacker => {

                if(!attacker){

                    return false;

                }


                //----------------------------------
                // 攻撃者のパワー
                //----------------------------------

                const attackPower =
                    getPower(
                        attacker
                    );


                //----------------------------------
                // プレイヤー側の
                // タテ向きサモン
                //----------------------------------

                const blockers =
                    playerField.filter(
                        summon => {

                            if(!summon){

                                return false;

                            }


                            if(
                                summon.owner !== PLAYER
                            ){

                                return false;

                            }


                            if(
                                summon.isRest
                            ){

                                return false;

                            }


                            return true;

                        }
                    );


                //----------------------------------
                // ブロッカーなし
                //----------------------------------

                if(
                    blockers.length === 0
                ){

                    return true;

                }


                //----------------------------------
                // 攻撃者より弱いブロッカーがいるか
                //----------------------------------

                const canBreakBlocker =
                    blockers.some(
                        blocker =>
                            attackPower >=
                            getPower(blocker)
                    );


                if(
                    canBreakBlocker
                ){

                    return true;

                }


                //----------------------------------
                // 全ブロッカーに負ける
                //----------------------------------
                // 現段階では無意味な攻撃と判断

                return false;

            }
        );


    //----------------------------------
    // 攻撃キューを元に戻す
    //----------------------------------

    cpuAttackQueue =
        oldQueue;

    cpuAttackIndex =
        oldIndex;


    return meaningful;

}

//======================================
// 攻撃セットアップ用マギア判定
//======================================

function isCpuAttackSetupMagia(card){

    if(!card){

        return false;

    }


    return (
        card.name === "アクアストリーム" ||
        card.name === "フォローウィンド" ||
        card.name === "ウィンドプレッシャー"
    );

}

//======================================
// CPU：攻撃セットアップマギア使用判定
//======================================

function cpuShouldUseAttackSetupMagia(
    card
){

    if(
        !isCpuAttackSetupMagia(card)
    ){

        return true;

    }


    //----------------------------------
    // 攻撃可能なサモンがない
    //----------------------------------

    if(
        !cpuHasMeaningfulAttack()
    ){

        console.log(
            "CPU：攻撃セットアップマギア使用しない",
            card.name,
            "使用後に意味のある攻撃なし"
        );

        return false;

    }


    //----------------------------------
    // 使用可能
    //----------------------------------

    console.log(
        "CPU：攻撃セットアップマギア使用候補",
        card.name
    );


    return true;

}

//======================================
// ドラゴン・クラーケン判定
//======================================

function isDragonOrKraken(summon){

    if(!summon){

        return false;

    }


    const card =
        summon.card || summon;


    if(!card){

        return false;

    }


    return (
        card.name === "ドラゴン" ||
        card.name === "クラーケン"
    );

}

//======================================
// プレイヤーの場に
// ドラゴン・クラーケンがいるか
//======================================

function cpuHasDragonOrKraken(){

    return playerField.some(
        summon =>
            isDragonOrKraken(summon)
    );

}

//======================================
// CPU ダメージマギア対象優先順位
//======================================

function selectCpuDamageMagiaTarget(card){

    if(!card){

        return null;

    }


    //----------------------------------
    // ダメージ量
    //----------------------------------

    const damageValue =
        Number(
            card.effect?.value
        ) || 0;


    if(damageValue <= 0){

        return null;

    }


    //----------------------------------
    // ウィルオウィスプ確認
    //----------------------------------

    const hasWillOWisp =
        enemyField.some(
            summon =>
                summon.card.name ===
                "ウィルオウィスプ"
        );


    //----------------------------------
    // 優先順位
    //----------------------------------

    let priority = [];


    //----------------------------------
    // エクスプロジア
    //----------------------------------

    if(
        card.name ===
        "エクスプロジア"
    ){

        priority = [
            "dragon",
            "power3to5",
            "player"
        ];

    }


    //----------------------------------
    // パイロフレイム
    //----------------------------------

    else if(
        card.name ===
        "パイロフレイム"
    ){

        if(hasWillOWisp){

            // エクスプロジアと同じ扱い
            priority = [
                "dragon",
                "power3to5",
                "player"
            ];

        }
        else{

            priority = [
                "power3",
                "power2",
                "player"
            ];

        }

    }


    //----------------------------------
    // ファイアボール
    //----------------------------------

    else if(
        card.name ===
        "ファイアボール"
    ){

        if(hasWillOWisp){

            // パイロフレイムと同じ扱い
            priority = [
                "power3",
                "power2",
                "player"
            ];

        }
        else{

            priority = [
                "power1",
                "player"
            ];

        }

    }

    //======================================
// ロックスパイク
//======================================

else if(
    card.name ===
    "ロックスパイク"
){

    priority = [
        "highestKillable"
    ];

}


    //----------------------------------
    // 対象優先順位なし
    //----------------------------------

    else{

        return null;

    }


    //======================================
    // 倒せるサモンだけ取得
    //======================================

    const killableSummons =
        playerField.filter(
            summon => {

                //----------------------------------
                // 破壊済み
                //----------------------------------

                if(
                    summon.destroyed
                ){

                    return false;

                }


                //----------------------------------
                // パワー確認
                //----------------------------------

                const power =
                    getPower(summon);


                //----------------------------------
                // ダメージで倒せない
                //----------------------------------

                if(
                    power >
                    damageValue
                ){

                    return false;

                }


                //----------------------------------
                // 対象不可
                //----------------------------------

                if(
                    isMagiaTargetBlocked(
                        card,
                        summon
                    )
                ){

                    return false;

                }


                return true;

            }
        );


    console.log(
        "CPU：ダメージマギア対象候補",
        card.name,
        killableSummons.map(
            summon =>
                `${summon.card.name}(${getPower(summon)})`
        )
    );


    //======================================
    // 優先順位に従って選択
    //======================================

    for(
        const rule of priority
    ){


//----------------------------------
// 倒せる中で一番パワーが高いサモン
//----------------------------------

if(
    rule === "highestKillable"
){

    if(
        killableSummons.length > 0
    ){

        const targets =
            [...killableSummons].sort(
                (a,b)=>
                    getPower(b)
                    -
                    getPower(a)
            );


        console.log(
            "CPU：ダメージマギア対象",
            card.name,
            "→ 最大パワー撃破",
            targets[0].card.name,
            "power=",
            getPower(targets[0])
        );


        return targets[0];

    }

}


        //----------------------------------
        // ドラゴン
        //----------------------------------

        if(
            rule === "dragon"
        ){

            const targets =
                killableSummons.filter(
                    summon =>
                        summon.card.name ===
                        "ドラゴン"
                );


            if(
                targets.length > 0
            ){

                targets.sort(
                    (a,b)=>
                        getPower(b)
                        -
                        getPower(a)
                );


                console.log(
                    "CPU：ダメージマギア対象",
                    card.name,
                    "→ ドラゴン"
                );


                return targets[0];

            }

        }


        //----------------------------------
        // パワー3～5
        //----------------------------------

        if(
            rule === "power3to5"
        ){

            const targets =
                killableSummons.filter(
                    summon => {

                        const power =
                            getPower(summon);

                        return (
                            power >= 3 &&
                            power <= 5
                        );

                    }
                );


            if(
                targets.length > 0
            ){

                targets.sort(
                    (a,b)=>
                        getPower(b)
                        -
                        getPower(a)
                );


                console.log(
                    "CPU：ダメージマギア対象",
                    card.name,
                    "→ パワー3～5"
                );


                return targets[0];

            }

        }


        //----------------------------------
        // パワー3
        //----------------------------------

        if(
            rule === "power3"
        ){

            const targets =
                killableSummons.filter(
                    summon =>
                        getPower(summon) === 3
                );


            if(
                targets.length > 0
            ){

                console.log(
                    "CPU：ダメージマギア対象",
                    card.name,
                    "→ パワー3"
                );


                return targets[0];

            }

        }


        //----------------------------------
        // パワー2
        //----------------------------------

        if(
            rule === "power2"
        ){

            const targets =
                killableSummons.filter(
                    summon =>
                        getPower(summon) === 2
                );


            if(
                targets.length > 0
            ){

                console.log(
                    "CPU：ダメージマギア対象",
                    card.name,
                    "→ パワー2"
                );


                return targets[0];

            }

        }


        //----------------------------------
        // パワー1
        //----------------------------------

        if(
            rule === "power1"
        ){

            const targets =
                killableSummons.filter(
                    summon =>
                        getPower(summon) === 1
                );


            if(
                targets.length > 0
            ){

                console.log(
                    "CPU：ダメージマギア対象",
                    card.name,
                    "→ パワー1"
                );


                return targets[0];

            }

        }


        //----------------------------------
        // プレイヤー
        //----------------------------------

        if(
            rule === "player"
        ){

            console.log(
                "CPU：ダメージマギア対象",
                card.name,
                "→ PLAYER"
            );


            return PLAYER;

        }

    }


    //----------------------------------
    // 対象なし
    //----------------------------------

    console.log(
        "CPU：ダメージマギア対象なし",
        card.name
    );


    return null;

}


//--------------------------------------
// CPU行動候補
//--------------------------------------

function createCpuAction(
    type,
    card,
    target = null
){

    return {

        type: type,

        card: card,

        target: target,

        points: 0

    };

}


//--------------------------------------
// CPU行動ポイント加算
//--------------------------------------

function addCpuActionPoints(
    action,
    points,
    reason = ""
){

    action.points += points;


    if(reason){

        console.log(
            "CPUポイント加算",
            action.card?.name,
            points,
            reason,
            "合計=",
            action.points
        );

    }

}


//--------------------------------------
// CPU行動候補の中から
// 最もポイントが高いものを選択
//--------------------------------------

function selectBestCpuAction(
    actions
){

    if(
        !actions ||
        actions.length === 0
    ){

        return null;

    }


    //----------------------------------
    // ポイント順
    //----------------------------------

    actions.sort(
        (a,b) =>
            b.points - a.points
    );


    //----------------------------------
    // 候補表示
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "CPU行動ポイント評価"
    );


    actions.forEach(
        action => {

            console.log(
                "CPU候補",
                action.type,
                action.card?.name,
                "target=",
                action.target?.card?.name ||
                action.target,
                "points=",
                action.points
            );

        }
    );


    console.log(
        "CPU選択",
        actions[0].type,
        actions[0].card?.name,
        "points=",
        actions[0].points
    );


    console.log(
        "================================"
    );


    return actions[0];

}

//======================================
// CPU：サモンのポイント評価
//======================================

function evaluateCpuSummonAction(
    card
){

    if(!card){

        return null;

    }


    //----------------------------------
    // このターンすでにサモン済み
    //----------------------------------

    if(
        cpuSummonUsedThisTurn
    ){

        return null;

    }


    //----------------------------------
    // サモン以外
    //----------------------------------

    if(
        card.type !== "サモン"
    ){

        return null;

    }


    //----------------------------------
    // 現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    //----------------------------------
    // 手札温存条件
    //----------------------------------

    if(
        enemyHandCards.length
        - 1
        - currentCost
        <
        2
    ){

        return null;

    }


    //----------------------------------
    // 行動作成
    //----------------------------------

    const action =
        createCpuAction(
            "SUMMON",
            card
        );


    //==================================
    // 基本ポイント
    //==================================

    addCpuActionPoints(
        action,
        100,
        "サモン基本点"
    );


    //==================================
    // コスト評価
    //==================================

    addCpuActionPoints(
        action,
        currentCost * 5,
        "高コストサモン"
    );


    //==================================
    // ドラゴン・クラーケン対策
    //==================================

    if(
        cpuHasDragonOrKraken()
    ){

        if(
            card.name === "ゴーレム"
        ){

            addCpuActionPoints(
                action,
                50,
                "ドラゴン・クラーケン対策"
            );

        }


        if(
            card.name === "バジリスク"
        ){

            addCpuActionPoints(
                action,
                35,
                "ドラゴン・クラーケン対策"
            );

        }

    }


    //==================================
    // ダメージマギアとの組み合わせ
    //==================================

    const hasFireDamageMagia =
        enemyHandCards.some(
            c =>
                c.type === "マギア" &&
                (
                    c.name === "ファイアボール" ||
                    c.name === "パイロフレイム" ||
                    c.name === "エクスプロジア"
                )
        );


    if(
        hasFireDamageMagia
    ){

        //----------------------------------
        // ウィルオウィスプ
        //----------------------------------

        if(
            card.name ===
            "ウィルオウィスプ"
        ){

            addCpuActionPoints(
                action,
                40,
                "ダメージマギアとのコンボ"
            );

        }


        //----------------------------------
        // コスト3～4
        //----------------------------------

        if(
            currentCost >= 3 &&
            currentCost <= 4
        ){

            addCpuActionPoints(
                action,
                20,
                "ダメージマギアと組み合わせやすい"
            );

        }

    }


    return action;

}

//======================================
// CPU：サモン行動候補を作成
//======================================

function createCpuSummonActions(){

    const actions = [];


    //----------------------------------
    // このターンすでにサモン済み
    //----------------------------------

    if(
        cpuSummonUsedThisTurn
    ){

        return actions;

    }


    //----------------------------------
    // 手札のサモンを全部評価
    //----------------------------------

    enemyHandCards.forEach(
        card => {

            const action =
                evaluateCpuSummonAction(
                    card
                );


            if(action){

                actions.push(
                    action
                );

            }

        }
    );


    return actions;

}


//======================================
// CPU：マギア行動候補を作成・ポイント評価
//======================================

function createCpuMagiaAction(card){

    //----------------------------------
    // マギア以外
    //----------------------------------

    if(!card){

        return null;

    }


    if(
        card.type !== "マギア"
    ){

        return null;

    }


    //----------------------------------
    // 現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    //----------------------------------
    // コスト支払い可能か
    //----------------------------------

    if(
        !canPayCost(
            card,
            ENEMY
        )
    ){

        console.log(
            "CPUポイント評価：マギア候補外",
            card.name,
            "コスト不足"
        );

        return null;

    }


    //----------------------------------
    // プレイヤー手札枚数
    //----------------------------------

    const playerHandCount =
        board.handCards.length;


    //----------------------------------
    // エクスプロジア特殊処理
    //----------------------------------

    const isExplozia =
        card.name ===
        "エクスプロジア";


    const canIgnoreHandLimit =
        isExplozia &&
        playerHandCount <= 2;


//----------------------------------
// 必殺条件
// PLAYER手札1枚以下
// かつ火力がPLAYERのLIFE以上
//----------------------------------

const isDamageMagia =
    card.effect &&
    card.effect.type === "damage";

const damageValue =
    isDamageMagia
        ? Number(card.effect.value) || 0
        : 0;

const isPlayerLethal =
    isDamageMagia &&
    playerHandCount <= 1 &&
    damageValue >= game.playerLife;


//----------------------------------
// 通常の手札温存
//----------------------------------
//
// 必殺できる場合だけ
// CPUの手札温存ルールを無視する
//

if(
    !canIgnoreHandLimit &&
    !isPlayerLethal &&
    enemyHandCards.length
    - 1
    - currentCost
    < 2
){

    console.log(
        "CPUポイント評価：マギア候補外",
        card.name,
        "手札温存"
    );

    return null;

}


//----------------------------------
// 必殺時ログ
//----------------------------------

if(
    isPlayerLethal
){

    console.log(
        "★ CPU必殺条件成立",
        card.name,
        "PLAYER手札=",
        playerHandCount,
        "PLAYER LIFE=",
        game.playerLife,
        "ダメージ=",
        damageValue,
        "CPU手札=",
        enemyHandCards.length
    );

}

    //----------------------------------
    // 攻撃セットアップ用マギア
    //----------------------------------

    if(
        !cpuShouldUseAttackSetupMagia(
            card
        )
    ){

        console.log(
            "CPUポイント評価：マギア候補外",
            card.name,
            "攻撃セットアップ不成立"
        );

        return null;

    }


//======================================
// アクアストリーム専用条件
//======================================

let aquaStreamInfo = null;


if(
    card.name ===
    "アクアストリーム"
){

    //----------------------------------
    // アクアストリーム専用使用判定
    //----------------------------------

    aquaStreamInfo =
        cpuShouldUseAquaStream();


    //----------------------------------
    // 使用条件を満たさない
    //----------------------------------

    if(!aquaStreamInfo){

        console.log(
            "CPUポイント評価：アクアストリーム候補外"
        );

        return null;

    }

}

    //----------------------------------
// ウィンドプレッシャー専用条件
//----------------------------------

if(
    card.name ===
    "ウィンドプレッシャー"
){

    //----------------------------------
    // PLAYERの手札が0枚なら使用しない
    //----------------------------------

    const playerHandCount =
        board.handCards.length;


    if(
        playerHandCount <= 0
    ){

        console.log(
            "CPUポイント評価：ウィンドプレッシャー候補外",
            "PLAYER手札0枚"
        );

        return null;

    }


    //----------------------------------
    // 使用後に攻撃する意味がなければ使用しない
    //----------------------------------

    if(
        !cpuHasMeaningfulAttack()
    ){

        console.log(
            "CPUポイント評価：ウィンドプレッシャー候補外",
            "使用後に意味のある攻撃なし"
        );

        return null;

    }

}


//======================================
// 対象取得
//======================================

let target;


//======================================
// アクアストリーム
// PLAYERサモンのみ
//======================================

if(
    card.name ===
    "アクアストリーム"
){

    //----------------------------------
    // cpuShouldUseAquaStream() で
    // すでにPLAYERサモンだけに絞っている
    //----------------------------------

    const targets =
        aquaStreamInfo.targets;


    //----------------------------------
    // 念のため対象なし確認
    //----------------------------------

    if(
        !targets ||
        targets.length === 0
    ){

        console.log(
            "CPU：アクアストリーム対象なし"
        );

        return null;

    }


    //----------------------------------
    // PLAYERサモンからランダム選択
    //----------------------------------

    target =
        targets[
            Math.floor(
                Math.random() *
                targets.length
            )
        ];


    console.log(
        "CPU：アクアストリーム対象決定",
        target.card?.name
    );

}


//======================================
// 通常マギア
//======================================

else{

    target =
        selectCpuMagiaTarget(
            card
        );

}


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(!target){

        console.log(
            "CPUポイント評価：マギア対象なし",
            card.name
        );

        return null;

    }


    //----------------------------------
    // 行動作成
    //----------------------------------

    const action =
        createCpuAction(
            "MAGIA",
            card,
            target
        );


    //==================================
    // 基本ポイント
    //==================================

    addCpuActionPoints(
        action,
        10,
        "マギア基本点"
    );


    //==================================
    // コスト評価
    //==================================
    //
    // 高コストを使う価値を少し高くする
    //

    addCpuActionPoints(
        action,
        currentCost * 3,
        "マギアコスト評価"
    );


    //==================================
    // カード別基本評価
    //==================================

    switch(card.name){

        //----------------------------------
        // ファイアボール
        //----------------------------------

        case "ファイアボール":

            addCpuActionPoints(
                action,
                20,
                "ファイアボール"
            );

            break;


        //----------------------------------
        // パイロフレイム
        //----------------------------------

        case "パイロフレイム":

            addCpuActionPoints(
                action,
                30,
                "パイロフレイム"
            );

            break;


        //----------------------------------
        // エクスプロジア
        //----------------------------------

        case "エクスプロジア":

            addCpuActionPoints(
                action,
                10,
                "エクスプロジア"
            );

            break;


        //----------------------------------
        // アクアストリーム
        //----------------------------------

        case "アクアストリーム":

            addCpuActionPoints(
                action,
                25,
                "アクアストリーム"
            );

            break;


        //----------------------------------
        // フォローウィンド
        //----------------------------------

        case "フォローウィンド":

            addCpuActionPoints(
                action,
                20,
                "フォローウィンド"
            );

            break;


        //----------------------------------
        // ウィンドプレッシャー
        //----------------------------------

        case "ウィンドプレッシャー":

            addCpuActionPoints(
                action,
                25,
                "ウィンドプレッシャー"
            );

            break;

    }


    //==================================
    // ダメージマギア評価
    //==================================

    if(
        card.effect &&
        card.effect.type === "damage"
    ){

        const damage =
            Number(
                card.effect.value
            ) || 0;


        //----------------------------------
        // PLAYERへの直接ダメージ
        //----------------------------------

        if(
            target === PLAYER ||
            target === "player"
        ){

            addCpuActionPoints(
                action,
                damage * 10,
                "PLAYERへのダメージ"
            );
        }
//----------------------------------
// 必殺ダメージ
// プレイヤーの手札枚数によって
// 優先度を大きく変える
//----------------------------------

const playerLife =
    game.playerLife;


if(
    damage >= playerLife
){

    //----------------------------------
    // プレイヤー手札枚数
    //----------------------------------

    const playerHandCount =
        board.handCards.length;


    let finishingBonus = 0;


    //----------------------------------
    // 手札1枚以下
    // → 最優先
    //----------------------------------

    if(
        playerHandCount <= 1
    ){

        finishingBonus = 1000;

    }


    //----------------------------------
    // 手札2枚
    //----------------------------------

    else if(
        playerHandCount === 2
    ){

        finishingBonus = 80;

    }


    //----------------------------------
    // 手札3枚
    //----------------------------------

    else if(
        playerHandCount === 3
    ){

        finishingBonus = 50;

    }


    //----------------------------------
    // 手札4枚
    //----------------------------------

    else if(
        playerHandCount === 4
    ){

        finishingBonus = 30;

    }


    //----------------------------------
    // 手札5枚
    //----------------------------------

    else if(
        playerHandCount === 5
    ){

        finishingBonus = 20;

    }


    //----------------------------------
    // 手札6枚以上
    // → 必殺だからという理由では
    //   特別扱いしない
    //----------------------------------

    else{

        finishingBonus = 0;

    }


    //----------------------------------
    // 必殺ダメージ加算
    //----------------------------------

    addCpuActionPoints(
        action,
        finishingBonus,
        "必殺ダメージ"
    );


    console.log(
        "CPU必殺ダメージ評価",
        card.name,
        "PLAYERライフ=",
        playerLife,
        "ダメージ=",
        damage,
        "PLAYER手札=",
        playerHandCount,
        "追加点=",
        finishingBonus
    );

}


        //----------------------------------
        // サモンへのダメージ
        //----------------------------------

        else if(
            target &&
            target.card
        ){

            const targetPower =
                getPower(
                    target
                );


            //----------------------------------
            // 破壊可能
            //----------------------------------

            if(
                damage >= targetPower
            ){

                addCpuActionPoints(
                    action,
                    50,
                    "サモン破壊可能"
                );

            }


            //----------------------------------
            // 高パワーサモンを倒す価値
            //----------------------------------

            addCpuActionPoints(
                action,
                targetPower * 5,
                "高パワーサモンを対象"
            );

        }

    }


    //==================================
    // PLAYER対象
    //==================================

    if(
        target === PLAYER ||
        target === "player"
    ){

        addCpuActionPoints(
            action,
            10,
            "PLAYERへの効果"
        );

    }


    //==================================
    // アクアストリーム
    //==================================

    if(
        card.name ===
        "アクアストリーム"
    ){

        //----------------------------------
        // 攻撃可能状態を作る
        //----------------------------------

        if(
            cpuHasMeaningfulAttack()
        ){

            addCpuActionPoints(
                action,
                40,
                "攻撃可能状態を作る"
            );

        }

    }

//==================================
// バーニングエナジー
//==================================

if(
    card.name ===
    "バーニングエナジー"
){

    //----------------------------------
    // 攻撃可能なCPUサモンを取得
    //----------------------------------

    const attackableSummons =
        enemyField.filter(
            summon => {

                if(!summon){

                    return false;

                }


                //----------------------------------
                // ヨコ向きなら攻撃不可
                //----------------------------------

                if(
                    summon.isRest
                ){

                    return false;

                }


                //----------------------------------
                // 通常の攻撃可能判定
                //----------------------------------

                if(
                    summon.attackReady
                ){

                    return true;

                }


                //----------------------------------
                // 召喚したターンでも攻撃できる能力
                //----------------------------------

                if(
                    summon.card?.ability?.type ===
                    "summonTurnAttack"
                ){

                    return true;

                }


                return false;

            }
        );


    //----------------------------------
    // 攻撃可能なサモンがいない
    //----------------------------------

    if(
        attackableSummons.length === 0
    ){

        addCpuActionPoints(
            action,
            -100,
            "バーニングエナジー：攻撃可能サモンなし"
        );


        console.log(
            "CPU：バーニングエナジー",
            "攻撃可能なサモンなし → -100"
        );

    }
    else{

        //----------------------------------
        // 相手のサモンを確認
        //----------------------------------

        const enemyTargets =
            playerField.filter(
                summon => {

                    if(!summon){

                        return false;

                    }


                    return true;

                }
            );


        //----------------------------------
        // 新しく倒せるタテ向きサモン
        //----------------------------------

        let createsNewVerticalAttack =
            false;


        //----------------------------------
        // 新しく倒せるヨコ向きサモン
        //----------------------------------

        let createsNewHorizontalAttack =
            false;


        //----------------------------------
        // 攻撃可能サモンごとに確認
        //----------------------------------

        for(
            const attacker of attackableSummons
        ){

            const currentPower =
                getPower(
                    attacker
                );


            const boostedPower =
                currentPower + 2;


            //----------------------------------
            // 相手サモンを確認
            //----------------------------------

            for(
                const target of enemyTargets
            ){

                const targetPower =
                    getPower(
                        target
                    );


                //----------------------------------
                // 使用前に倒せるか
                //----------------------------------

                const canKillBefore =
                    currentPower >=
                    targetPower;


                //----------------------------------
                // 使用後に倒せるか
                //----------------------------------

                const canKillAfter =
                    boostedPower >=
                    targetPower;


                //----------------------------------
                // 使用前は倒せない
                // 使用後なら倒せる
                //----------------------------------

                if(
                    !canKillBefore &&
                    canKillAfter
                ){

                    //----------------------------------
                    // 相手がヨコ向き
                    //----------------------------------

                    if(
                        target.isRest
                    ){

                        createsNewHorizontalAttack =
                            true;


                        console.log(
                            "CPU：バーニングエナジーで",
                            "新規ヨコ向きサモン撃破可能",
                            "攻撃者=",
                            attacker.card?.name,
                            "使用前=",
                            currentPower,
                            "使用後=",
                            boostedPower,
                            "対象=",
                            target.card?.name,
                            "対象パワー=",
                            targetPower
                        );

                    }

                    //----------------------------------
                    // 相手がタテ向き
                    //----------------------------------

                    else{

                        createsNewVerticalAttack =
                            true;


                        console.log(
                            "CPU：バーニングエナジーで",
                            "新規タテ向きサモン撃破可能",
                            "攻撃者=",
                            attacker.card?.name,
                            "使用前=",
                            currentPower,
                            "使用後=",
                            boostedPower,
                            "対象=",
                            target.card?.name,
                            "対象パワー=",
                            targetPower
                        );

                    }

                }

            }

        }


        //----------------------------------
        // タテ向きサモンを新しく倒せる
        //----------------------------------

        if(
            createsNewVerticalAttack
        ){

            addCpuActionPoints(
                action,
                50,
                "バーニングエナジーで新規タテ向き撃破"
            );

        }


        //----------------------------------
        // ヨコ向きサモンを新しく倒せる
        //----------------------------------

        if(
            createsNewHorizontalAttack
        ){

            addCpuActionPoints(
                action,
                30,
                "バーニングエナジーで新規ヨコ向き撃破"
            );

        }


        //----------------------------------
        // ログ
        //----------------------------------

        console.log(
            "CPU：バーニングエナジー評価",
            "タテ向き新規撃破=",
            createsNewVerticalAttack,
            "ヨコ向き新規撃破=",
            createsNewHorizontalAttack
        );

    }

}

    //==================================
    // フォローウィンド
    //==================================

    if(
        card.name ===
        "フォローウィンド"
    ){

        //----------------------------------
        // 攻撃可能状態を作る
        //----------------------------------

        if(
            cpuHasMeaningfulAttack()
        ){

            addCpuActionPoints(
                action,
                35,
                "攻撃準備"
            );

        }

    }


//==================================
// ウィンドプレッシャー
//==================================

if(
    card.name ===
    "ウィンドプレッシャー"
){

    //----------------------------------
    // PLAYER手札枚数による評価
    //----------------------------------

    const handCount =
        board.handCards.length;


    let handValue = 0;


    if(handCount === 1){

        handValue = 30;

    }
    else if(handCount === 2){

        handValue = 70;

    }
    else if(handCount === 3){

        handValue = 30;

    }
    else if(handCount === 4){

        handValue = 10;

    }


    //----------------------------------
    // ポイント加算
    //----------------------------------

    addCpuActionPoints(
        action,
        handValue,
        "PLAYER手札" +
        handCount +
        "枚 → +" +
        handValue
    );

}
    //==================================
    // ウィルオウィスプとのコンボ
    //==================================

    if(
        card.name === "パイロフレイム" ||
        card.name === "ファイアボール" ||
        card.name === "エクスプロジア"
    ){

        const hasWillOWisp =
            enemyField.some(
                summon =>
                    summon.card?.name ===
                    "ウィルオウィスプ"
            );


        if(hasWillOWisp){

            addCpuActionPoints(
                action,
                30,
                "ウィルオウィスプとのコンボ"
            );

        }

    }


    //==================================
    // ドラゴン・クラーケン対策
    //==================================

    if(
        cpuHasDragonOrKraken()
    ){

        if(
            card.name === "ファイアボール" ||
            card.name === "パイロフレイム" ||
            card.name === "エクスプロジア"
        ){

            if(
                target &&
                target.card &&
                isDragonOrKraken(target)
            ){

                addCpuActionPoints(
                    action,
                    80,
                    "ドラゴン・クラーケン破壊"
                );

            }

        }

    }


    //==================================
    // 最終ログ
    //==================================

    console.log(
        "CPUマギア候補完成",
        card.name,
        "target=",
        target?.card?.name ||
        target,
        "points=",
        action.points
    );


    return action;

}
//======================================
// CPU：攻撃行動ポイント評価
//======================================

function evaluateCpuAttackAction(
    attacker
){

    if(!attacker){

        return null;

    }


    //----------------------------------
    // CPUサモンでなければ不可
    //----------------------------------

    if(
        attacker.owner !== ENEMY
    ){

        return null;

    }


    //----------------------------------
    // 攻撃可能確認
    //----------------------------------

    if(
        attacker.isRest
    ){

        return null;

    }


    if(
        !attacker.attackReady &&
        attacker.card?.ability?.type !==
        "summonTurnAttack"
    ){

        return null;

    }


    //----------------------------------
    // 攻撃力
    //----------------------------------

    const attackPower =
        getPower(
            attacker
        );


    //----------------------------------
    // PLAYER側のブロッカー
    //----------------------------------

    const blockers =
        playerField.filter(
            summon => {

                if(!summon){

                    return false;

                }


                if(
                    summon.owner !== PLAYER
                ){

                    return false;

                }


                if(
                    summon.isRest
                ){

                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // 攻撃先
    //----------------------------------

    let target = PLAYER;


    //----------------------------------
    // ブロッカーがいる場合
    //----------------------------------

    if(
        blockers.length > 0
    ){

        //----------------------------------
        // 倒せるブロッカー
        //----------------------------------

        const killable =
            blockers.filter(
                blocker =>
                    attackPower >=
                    getPower(blocker)
            );


        if(
            killable.length > 0
        ){

            //----------------------------------
            // 一番パワーが高いものを攻撃
            //----------------------------------

            killable.sort(
                (a,b)=>
                    getPower(b)
                    -
                    getPower(a)
            );


            target =
                killable[0];

        }
        else{

            //----------------------------------
            // 倒せないなら攻撃候補なし
            //----------------------------------

            return null;

        }

    }


    //----------------------------------
    // 行動作成
    //----------------------------------

    const action =
        createCpuAction(
            "ATTACK",
            attacker,
            target
        );


    //==================================
    // 基本ポイント
    //==================================

    addCpuActionPoints(
        action,
        10,
        "攻撃基本点"
    );


    //==================================
    // プレイヤー本体への攻撃
    //==================================

    if(
        target === PLAYER
    ){

        addCpuActionPoints(
            action,
            30,
            "PLAYER本体を攻撃"
        );

    }


    //==================================
    // サモンへの攻撃
    //==================================

    else{

        const targetPower =
            getPower(
                target
            );


        //----------------------------------
        // 破壊できる
        //----------------------------------

        if(
            attackPower >=
            targetPower
        ){

            addCpuActionPoints(
                action,
                50,
                "サモンを破壊できる"
            );

        }


        //----------------------------------
        // 高パワーサモンを倒す
        //----------------------------------

        if(
            targetPower >= 3
        ){

            addCpuActionPoints(
                action,
                20,
                "高パワーサモンを処理"
            );

        }

    }


    //==================================
    // 攻撃者のパワー評価
    //==================================

    addCpuActionPoints(
        action,
        attackPower * 3,
        "攻撃力評価"
    );


    //----------------------------------
    // 最終ログ
    //----------------------------------

    console.log(
        "CPU攻撃ポイント評価",
        attacker.card?.name,
        "target=",
        target === PLAYER
            ? "PLAYER"
            : target.card?.name,
        "points=",
        action.points
    );


    return action;

}

//======================================
// CPU：攻撃行動候補を作成
//======================================

function createCpuAttackActions(){

    const actions = [];


    //----------------------------------
    // CPUフィールドを確認
    //----------------------------------

    enemyField.forEach(
        summon => {

            const action =
                evaluateCpuAttackAction(
                    summon
                );


            if(action){

                actions.push(
                    action
                );

            }

        }
    );


    return actions;

}


//======================================
// CPU：全行動候補を作成
//======================================

function createCpuActions(){

    const actions = [];


    //==================================
    // サモン候補
    //==================================

    const summonActions =
        createCpuSummonActions();


    actions.push(
        ...summonActions
    );


    //==================================
    // マギア候補
    //==================================

    enemyHandCards.forEach(
        card => {

            const action =
                createCpuMagiaAction(
                    card
                );


            if(action){

                actions.push(
                    action
                );

            }

        }
    );


    //==================================
    // 攻撃候補
    //==================================

    if(
        cpuHasMeaningfulAttack()
    ){

        const attackAction =
            createCpuAction(
                "ATTACK"
            );


        //----------------------------------
        // 攻撃基本ポイント
        //----------------------------------

        addCpuActionPoints(
            attackAction,
            30,
            "意味のある攻撃"
        );


        actions.push(
            attackAction
        );

    }


    //==================================
    // ターン終了候補
    //==================================

    const endAction =
        createCpuAction(
            "END"
        );


    addCpuActionPoints(
        endAction,
        0,
        "ターン終了"
    );


    actions.push(
        endAction
    );


    //----------------------------------
    // 候補確認
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "CPU全行動候補",
        actions
    );

    console.log(
        "================================"
    );


    return actions;

}

//======================================
// CPU：ポイント方式で最善行動を取得
//======================================

function cpuSelectBestAction(){

    //----------------------------------
    // 全行動候補を作成
    //----------------------------------

    const actions =
        createCpuActions();


    //----------------------------------
    // 候補なし
    //----------------------------------

    if(
        !actions ||
        actions.length === 0
    ){

        console.log(
            "CPU：行動候補なし"
        );

        return null;

    }


    //----------------------------------
    // 最もポイントが高い行動を選択
    //----------------------------------

    const bestAction =
        selectBestCpuAction(
            actions
        );


    //----------------------------------
    // 選択結果
    //----------------------------------

    if(bestAction){

        console.log(
            "================================"
        );

        console.log(
            "CPUポイント方式：次の行動",
            bestAction.type,
            bestAction.card?.name,
            "points=",
            bestAction.points
        );

        console.log(
            "================================"
        );

    }


    return bestAction;

}

//======================================
// CPU：ポイント方式で次の行動を実行
//======================================

function cpuExecuteBestAction(){

    //----------------------------------
    // ゲーム終了確認
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU：ゲーム終了のため行動しない"
        );

        return;

    }


    //----------------------------------
    // 全行動候補を作成
    //----------------------------------

    const actions =
        createCpuActions();


    //----------------------------------
    // 候補なし
    //----------------------------------

    if(
        !actions ||
        actions.length === 0
    ){

        console.log(
            "CPU：行動候補なし → ターン終了"
        );

        cpuTurnStep = 4;

        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // 最善行動を取得
    //----------------------------------

    const bestAction =
        selectBestCpuAction(
            actions
        );


    //----------------------------------
    // 行動なし
    //----------------------------------

    if(!bestAction){

        console.log(
            "CPU：最善行動なし → ターン終了"
        );

        cpuTurnStep = 4;

        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }


    //----------------------------------
    // 選択結果
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "CPUポイント方式 行動決定"
    );

    console.log(
        "type=",
        bestAction.type
    );

    console.log(
        "card=",
        bestAction.card?.name
    );

    console.log(
        "target=",
        bestAction.target?.card?.name ||
        bestAction.target
    );

    console.log(
        "points=",
        bestAction.points
    );

    console.log(
        "================================"
    );


    //==================================
    // SUMMON
    //==================================

    if(
        bestAction.type ===
        "SUMMON"
    ){

        const card =
            bestAction.card;


        if(!card){

            console.log(
                "CPU：SUMMONカードなし"
            );

            cpuTurnStep = 4;

            setTimeout(
                runCpuTurnStep,
                500
            );

            return;

        }


        console.log(
            "CPU：ポイント方式でサモン実行",
            card.name
        );


        const result =
            cpuSummon(
                card
            );


        if(result){

            cpuSummonUsedThisTurn = true;

        }


        //----------------------------------
        // 次の行動を再評価
        //----------------------------------

        setTimeout(
            runCpuTurnStep,
            2000
        );

        return;

    }


    //==================================
    // MAGIA
    //==================================

    if(
        bestAction.type ===
        "MAGIA"
    ){

        const card =
            bestAction.card;

        const target =
            bestAction.target;


        if(
            !card ||
            !target
        ){

            console.log(
                "CPU：MAGIAカードまたは対象なし"
            );

            cpuTurnStep = 4;

            setTimeout(
                runCpuTurnStep,
                500
            );

            return;

        }


        console.log(
            "CPU：ポイント方式でマギア実行",
            card.name,
            "target=",
            target?.card?.name ||
            target
        );


        const result =
            cpuMagia(
                card,
                target
            );


        console.log(
            "CPU：ポイント方式マギア結果",
            result
        );


        //----------------------------------
        // 強制コスト型
        //----------------------------------

        if(
            card.effect &&
            card.effect.type ===
            "forceCost"
        ){

            console.log(
                "CPU：強制コスト型 → 選択待ち"
            );

            return;

        }


        //----------------------------------
        // 次の行動を再評価
        //----------------------------------

        setTimeout(
            runCpuTurnStep,
            2000
        );

        return;

    }


    //==================================
    // ATTACK
    //==================================

    if(
        bestAction.type ===
        "ATTACK"
    ){

        console.log(
            "CPU：ポイント方式で攻撃開始"
        );


        //----------------------------------
        // 攻撃フェーズへ
        //----------------------------------

        cpuStartAttackPhase();


        return;

    }


    //==================================
    // END
    //==================================

    if(
        bestAction.type ===
        "END"
    ){

        console.log(
            "CPU：ポイント方式でターン終了"
        );


        cpuTurnStep = 4;


        setTimeout(
            runCpuTurnStep,
            500
        );

        return;

    }

}