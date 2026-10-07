//======================================
// CPU処理
//======================================


let cpuWaiting = false;

//======================================
// ファストコール
// CPUカードプレイの一時停止
//======================================

// ファストコールの解決待ちかどうか
let cpuFastCallWaiting = false;

// 中断したCPUのカードプレイを保存
let cpuFastCallPendingAction = null;


//--------------------------------------
// CPUカードプレイを一時保存
//--------------------------------------

function pauseCpuCardPlayForFastCall(
    card,
    resumeAction
){

    if(cpuFastCallWaiting){
        return false;
    }

    cpuFastCallWaiting = true;

    cpuFastCallPendingAction = {
        card: card,
        resume: resumeAction
    };

    cpuWaiting = true;

    console.log(
        "ファストコール：CPUカードプレイ一時停止",
        card.name
    );

    return true;

}


//--------------------------------------
// CPUカードプレイを再開
//--------------------------------------

function resumeCpuCardPlayAfterFastCall(){

    if(!cpuFastCallWaiting){
        return;
    }

    const pending =
        cpuFastCallPendingAction;

    cpuFastCallWaiting = false;

    cpuFastCallPendingAction = null;

    cpuWaiting = false;

    if(
        !pending ||
        typeof pending.resume !== "function"
    ){
        return;
    }

    console.log(
        "ファストコール：CPUカードプレイ再開",
        pending.card.name
    );

    pending.resume();

}

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


//==================================================
// ブレイクスルー使用後
// 必ず攻撃するCPUサモン
//==================================================

let cpuBreakthroughAttackSummon =
    null;


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

    //==================================
    // ゲーム終了・投了
    //==================================

    if(
        battleGameEnding ||
        battleGameConceded
    ){

        console.log(
            "CPUターンステップ中止：ゲーム終了・投了"
        );

        cpuWaiting = false;

        return;

    }


    //==================================
    // アースクェイク解決待ち
    //
    // 全対象へのダメージ処理、
    // レジスト、
    // ヒュドラ、
    // クール時誘発能力など、
    // アースクェイク全体が終了するまで
    // CPUの次の行動へ進ませない
    //==================================

    if(
        typeof earthquakeResolving !==
            "undefined" &&
        earthquakeResolving
    ){

        console.log(
            "CPU停止：アースクェイク解決待ち",
            {
                index:
                    typeof earthquakeIndex !==
                        "undefined"
                        ?
                        earthquakeIndex
                        :
                        null,

                total:
                    typeof earthquakeTargets !==
                        "undefined"
                        ?
                        earthquakeTargets.length
                        :
                        null,

                target:
                    typeof earthquakeCurrentTarget !==
                        "undefined"
                        ?
                        earthquakeCurrentTarget
                            ?.card?.name ?? null
                        :
                        null
            }
        );

        cpuWaiting = true;

        return;

    }


    //==================================
    // ヒュドラ
    // ダメージ無効能力の解決待ち
    //==================================

    if(
        typeof hydraDamageWaiting !==
            "undefined" &&
        hydraDamageWaiting
    ){

        console.log(
            "CPU停止：ヒュドラ能力の解決待ち"
        );

        cpuWaiting = true;

        return;

    }


    //==================================
    // クール時誘発能力の解決待ち
    //
    // マンドラゴラ・ヴァンパイア等
    //==================================

    if(
        typeof coolTriggerResolving !==
            "undefined" &&
        coolTriggerResolving
    ){

        console.log(
            "CPU停止：クール時誘発能力の解決待ち"
        );

        cpuWaiting = true;

        return;

    }


    //==================================
    // 強制アタックの解決待ち
    //
    // ワーウルフ等
    //==================================

    if(
        (
            typeof forcedAttackMode !==
                "undefined" &&
            forcedAttackMode
        ) ||
        (
            typeof forcedAttackQueue !==
                "undefined" &&
            forcedAttackQueue.length > 0
        )
    ){

        console.log(
            "CPU停止：強制アタックの解決待ち"
        );

        cpuWaiting = true;

        return;

    }


    //==================================
    // プレイヤー操作待ち
    //
    // レジスト
    // ブロック
    // ネレイド
    //==================================

    if(
        resistMode ||
        blockMode ||
        (
            typeof nereidDamageWaiting !==
                "undefined" &&
            nereidDamageWaiting
        )
    ){

        console.log(
            "CPU停止：プレイヤー操作待ち",
            {
                resistMode:
                    resistMode,

                blockMode:
                    blockMode,

                nereidDamageWaiting:
                    typeof nereidDamageWaiting !==
                        "undefined"
                        ?
                        nereidDamageWaiting
                        :
                        false
            }
        );

        cpuWaiting = true;

        return;

    }


    //==================================
    // 待機解除
    //==================================

    cpuWaiting = false;


    //==================================
    // CPUターン以外なら停止
    //==================================

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


    //==================================
    // 通常のCPU行動
    //==================================

    console.log(
        "CPUポイント方式：行動選択"
    );


    //==================================
    // ポイント方式で行動実行
    //==================================

    cpuExecuteBestAction();

}
//======================================
// CPU攻撃フェーズ開始
//======================================
//======================================
// CPU攻撃フェーズ開始
//======================================

function cpuStartAttackPhase(){

    console.log(
        "CPU攻撃フェーズ開始"
    );


    //==================================
    // 最初の攻撃前
    //==================================

    if(cpuTurnStep === 0){


        //==============================
        // アクアストリーム
        //==============================

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


            //==============================
            // ファストコール解決待ち
            //==============================

            if(result === "WAIT_FAST_CALL"){

                console.log(
                    "CPU：アクアストリーム一時停止",
                    "ファストコール解決待ち"
                );

                return;

            }


            //----------------------------------
            // マギア使用成功
            //----------------------------------

            if(result === true){

                setTimeout(
                    runCpuTurnStep,
                    1200
                );

                return;

            }

        }


        //==============================
        // ウィンドプレッシャー
        //==============================

        const windPressureInfo =
            cpuShouldUseWindPressure();


        if(windPressureInfo){

            console.log(
                "CPU：最初の攻撃前にウィンドプレッシャー使用"
            );


            //----------------------------------
            // CPUマギア使用
            //----------------------------------

            const result =
                cpuMagia(
                    windPressureInfo.card,
                    windPressureInfo.target
                );


            console.log(
                "CPU：ウィンドプレッシャー使用結果",
                result
            );


            //==============================
            // ファストコール解決待ち
            //==============================

            if(result === "WAIT_FAST_CALL"){

                console.log(
                    "CPU：ウィンドプレッシャー一時停止",
                    "ファストコール解決待ち"
                );

                return;

            }


            //==============================
            // マギア使用成功
            //==============================

            if(result === true){


                //----------------------------------
                // 強制コスト型
                //----------------------------------

                if(
                    windPressureInfo.card.effect &&
                    windPressureInfo.card.effect.type ===
                        "forceCost"
                ){

                    console.log(
                        "CPU：ウィンドプレッシャー",
                        "強制コスト選択待ち"
                    );

                    return;

                }


                //----------------------------------
                // 通常マギア
                //----------------------------------

                setTimeout(
                    runCpuTurnStep,
                    1200
                );

                return;

            }

        }

    }


    //==================================
    // 攻撃キュー作成
    //==================================

    createCpuAttackQueue();


    //==================================
    // 攻撃可能なサモンなし
    //==================================

    if(cpuAttackQueue.length === 0){

        console.log(
            "CPU攻撃可能サモンなし"
        );


        //----------------------------------
        // 次のフェーズへ
        //----------------------------------

        if(cpuTurnStep === 0){

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


    //==================================
    // 攻撃開始
    //==================================

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


    //==================================
    // PLAYER側の
    // 実際にブロック可能なサモン
    //==================================

    const readyPlayerSummons =
        playerField.filter(
            summon => {

                //----------------------------------
                // サモンなし
                //----------------------------------

                if(!summon){

                    return false;

                }


                //----------------------------------
                // 破壊済み
                //----------------------------------

                if(summon.destroyed){

                    return false;

                }


                //----------------------------------
                // 横向きはブロック不可
                //----------------------------------

                if(summon.isRest){

                    return false;

                }


                //----------------------------------
                // 能力によりブロック不可
                //----------------------------------

                if(
                    typeof isOgreBattleLocked ===
                        "function" &&
                    isOgreBattleLocked(
                        summon
                    )
                ){

                    console.log(
                        "CPU攻撃評価から除外：",
                        summon.card.name,
                        "現在ブロック不可"
                    );


                    return false;

                }


                //----------------------------------
                // ブロック可能
                //----------------------------------

                return true;

            }
        );


    //==================================
    // 基準パワー
    //==================================

    let attackPowerThreshold =
        0;


    if(
        readyPlayerSummons.length > 0
    ){

        attackPowerThreshold =
            Math.max(
                ...readyPlayerSummons.map(
                    summon =>
                        getPower(
                            summon
                        )
                )
            );

    }


    console.log(
        "CPU攻撃基準パワー",
        attackPowerThreshold
    );


    console.log(
        "CPUが考慮するブロッカー",
        readyPlayerSummons.map(
            summon => ({
                name:
                    summon.card.name,

                power:
                    getPower(
                        summon
                    ),

                curseSmoke:
                    isCurseSmokeTarget(
                        summon
                    )
            })
        )
    );


    //==================================
    // カーススモーク状態の
    // 横向きPLAYERサモン
    //==================================

    const curseSmokeRestingTargets =
        playerField.filter(
            summon => {

                //----------------------------------
                // 基本確認
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
                // 横向きのみ
                //----------------------------------

                if(!summon.isRest){

                    return false;

                }


                //----------------------------------
                // カーススモーク状態
                //----------------------------------

                return (
                    isCurseSmokeTarget(
                        summon
                    )
                );

            }
        );


    //==================================
    // カーススモーク状態の
    // 唯一のブロッカー確認
    //==================================

    let curseSmokeOnlyBlocker =
        null;


    if(
        readyPlayerSummons.length === 1 &&
        isCurseSmokeTarget(
            readyPlayerSummons[0]
        )
    ){

        curseSmokeOnlyBlocker =
            readyPlayerSummons[0];


        console.log(
            "CPU攻撃キュー：",
            "唯一のブロッカーがカーススモーク状態",
            curseSmokeOnlyBlocker.card.name
        );

    }


    //==================================
    // 攻撃可能CPUサモン
    //==================================

    cpuAttackQueue =
        enemyField.filter(
            summon => {


                //----------------------------------
                // 基本確認
                //----------------------------------

                if(
                    !summon ||
                    !summon.card
                ){

                    return false;

                }


                //----------------------------------
                // 行動不能なら不可
                //----------------------------------

                if(summon.isRest){

                    return false;

                }


                //----------------------------------
                // 破壊済み
                //----------------------------------

                if(summon.destroyed){

                    return false;

                }


                //----------------------------------
                // 召喚したターンは攻撃不可
                //
                // summonTurnAttackなら例外
                //
                // 複数能力対応
                //----------------------------------

                if(
                    !summon.attackReady &&
                    !hasSummonAbility(
                        summon,
                        "summonTurnAttack"
                    )
                ){

                    return false;

                }


                //----------------------------------
                // 現在パワー
                //----------------------------------

                const summonPower =
                    getPower(
                        summon
                    );

                //==================================
                // ブレイクスルー予約サモン
                //==================================

                if(
                    typeof cpuBreakthroughAttackSummon !==
                        "undefined" &&
                    summon ===
                        cpuBreakthroughAttackSummon
                ){

                    console.log(
                        "CPU攻撃キュー：",
                        "ブレイクスルー予約サモン",
                        summon.card.name,
                        "power=",
                        summonPower
                    );


                    return true;

                }

                //==================================
                // ブロックされないサモン
                //
                // 複数能力対応
                //==================================

                if(
                    hasSummonAbility(
                        summon,
                        "cannotBeBlocked"
                    )
                ){

                    console.log(
                        "CPU攻撃キュー：",
                        "ブロック不可サモンなので攻撃",
                        summon.card.name,
                        "power=",
                        summonPower
                    );


                    return true;

                }


                //==================================
                // カーススモーク特殊条件①
                //
                // 横向きのカーススモーク対象を
                // 攻撃できる
                //==================================

                if(
                    summonPower >= 1 &&
                    curseSmokeRestingTargets.length >
                        0
                ){

                    console.log(
                        "CPU攻撃キュー：",
                        summon.card.name,
                        "カーススモーク状態の",
                        "横向きサモンを攻撃可能"
                    );


                    return true;

                }


                //==================================
                // カーススモーク特殊条件②
                //
                // 唯一のブロッカーが
                // カーススモーク状態
                //==================================

                if(
                    summonPower >= 1 &&
                    curseSmokeOnlyBlocker
                ){

                    console.log(
                        "CPU攻撃キュー：",
                        summon.card.name,
                        "唯一のカーススモークブロッカーを",
                        "誘うため攻撃可能"
                    );


                    return true;

                }


                //==================================
                // ゴーレム特殊条件
                //==================================

                if(
                    summon.card.name ===
                        "ゴーレム"
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
                                // 能力により
                                // ブロックできないサモンは
                                // パワーを参照しない
                                //----------------------------------

                                if(
                                    typeof isOgreBattleLocked ===
                                        "function" &&
                                    isOgreBattleLocked(
                                        target
                                    )
                                ){

                                    return false;

                                }


                                //----------------------------------
                                // パワー3以上
                                //----------------------------------

                                return (
                                    getPower(
                                        target
                                    ) >= 3
                                );

                            }
                        );


                    if(
                        strongVerticalSummon
                    ){

                        console.log(
                            "CPU：ゴーレムは攻撃しない",
                            "PLAYER側にパワー3以上のブロック可能サモンあり"
                        );


                        return false;

                    }

                }


                //==================================
                // 通常サモン
                //==================================

                return (
                    summonPower >=
                    attackPowerThreshold
                );

            }
        );

    //==================================
    // ブレイクスルー予約サモンを
    // 攻撃キューの先頭へ移動
    //==================================

    if(
        typeof cpuBreakthroughAttackSummon !==
            "undefined" &&
        cpuBreakthroughAttackSummon
    ){

        const breakthroughIndex =
            cpuAttackQueue.indexOf(
                cpuBreakthroughAttackSummon
            );


        if(
            breakthroughIndex > 0
        ){

            cpuAttackQueue.splice(
                breakthroughIndex,
                1
            );


            cpuAttackQueue.unshift(
                cpuBreakthroughAttackSummon
            );

        }


        if(
            breakthroughIndex >= 0
        ){

            console.log(
                "CPU攻撃キュー：",
                "ブレイクスルー予約サモンを先頭へ",
                cpuBreakthroughAttackSummon
                    .card?.name
            );

        }

    }        


    //==================================
    // 最終ログ
    //==================================

    console.log(
        "CPU攻撃キュー完成",
        cpuAttackQueue.map(
            summon => ({
                name:
                    summon.card.name,

                power:
                    getPower(
                        summon
                    ),

                summonTurnAttack:
                    hasSummonAbility(
                        summon,
                        "summonTurnAttack"
                    ),

                cannotBeBlocked:
                    hasSummonAbility(
                        summon,
                        "cannotBeBlocked"
                    )
            })
        )
    );

}

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

        //==================================
        // ★追加
        // ブレイクスルー攻撃予約解除
        //==================================

        cpuBreakthroughAttackSummon =
            null;

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
            summon =>
                summon.card.name
        )
    );


    //==================================
    // プレイヤー操作待ち
    //
    // ・レジスト
    // ・ブロック
    // ・スフィンクス
    // ・カリュブディス
    //==================================

    if(
        resistMode ||
        blockMode ||
        (
            forceCostMode &&
            (
                forceCostSource ===
                    "sphinx" ||

                forceCostSource ===
                    "charybdis"
            )
        )
    ){

        cpuWaiting =
            true;


        console.log(
            "CPU攻撃停止：プレイヤー操作待ち",
            {
                resistMode:
                    resistMode,

                blockMode:
                    blockMode,

                forceCostMode:
                    forceCostMode,

                forceCostSource:
                    forceCostSource
            }
        );


        return;

    }


    //==================================
    // ネレイド能力選択待ち
    //==================================

    if(
        typeof nereidDamageWaiting !==
            "undefined" &&
        nereidDamageWaiting
    ){

        cpuWaiting =
            true;


        console.log(
            "CPU攻撃停止：",
            "ネレイド能力選択待ち"
        );


        return;

    }


    //==================================
    // カリュブディス処理待ち
    //==================================

    if(
        typeof charybdisAttackWaiting !==
            "undefined" &&
        charybdisAttackWaiting
    ){

        cpuWaiting =
            true;


        console.log(
            "CPU攻撃停止：",
            "カリュブディス処理待ち"
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
        // ★追加
        // 攻撃フェーズ終了時に
        // 不要な予約が残っていれば解除
        //----------------------------------

        cpuBreakthroughAttackSummon =
            null;


        //----------------------------------
        // 次のステップ
        //----------------------------------

        if(cpuTurnStep === 0){

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
    // ゲーム終了確認
    //----------------------------------

    if(battleGameEnding){

        console.log(
            "CPU攻撃中止：ゲーム終了"
        );


        cpuAttackQueue = [];

        cpuAttackIndex = 0;

        cpuBreakthroughAttackSummon =
            null;


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
        !enemyField.includes(
            attacker
        )
    ){

        //----------------------------------
        // ★追加
        // 予約サモン自身が
        // 攻撃不能になった場合は予約解除
        //----------------------------------

        if(
            attacker &&
            attacker ===
                cpuBreakthroughAttackSummon
        ){

            console.log(
                "CPU：ブレイクスルー予約解除",
                attacker.card?.name,
                "攻撃不能"
            );


            cpuBreakthroughAttackSummon =
                null;

        }


        cpuAttackIndex++;


        cpuNextAttack();


        return;

    }


    //==================================
    // ★追加
    // ブレイクスルー予約攻撃か
    //==================================

    const isBreakthroughAttack =
        attacker ===
        cpuBreakthroughAttackSummon;


    //----------------------------------
    // 攻撃対象
    //----------------------------------

    let target;


    //==================================
    // ★追加
    // ブレイクスルー対象は
    // 必ずPLAYER本体へアタック
    //==================================

    if(isBreakthroughAttack){

        target =
            PLAYER;


        console.log(
            "CPU：ブレイクスルー優先攻撃",
            attacker.card.name,
            "→ PLAYER",
            "power=",
            getPower(
                attacker
            )
        );

    }

    //==================================
// PLAYERへの実ダメージ確認
//
// ガーゴイル等の軽減によって
// 最終ダメージが0になる場合は
// アタックしない
//==================================

if(
    target === PLAYER &&
    !canCpuAttackDamagePlayer(
        attacker
    )
){

    console.log(
        "CPUアタック見送り：",
        attacker.card.name,
        "PLAYERへの予測ダメージが0"
    );


    //----------------------------------
    // ブレイクスルー予約だった場合
    // 予約を解除
    //----------------------------------

    if(isBreakthroughAttack){

        cpuBreakthroughAttackSummon =
            null;

    }


    //----------------------------------
    // このサモンの攻撃は行わず
    // 次のCPUサモンへ
    //----------------------------------

    cpuAttackIndex++;


    setTimeout(
        cpuNextAttack,
        1000
    );


    return;

}


    //==================================
    // 通常攻撃
    //==================================

    else{

        target =
            selectCpuAttackTarget(
                attacker
            );

    }


//----------------------------------
// 対象なし
//----------------------------------

if(!target){

    //----------------------------------
    // 予約攻撃だった場合
    // 念のため予約解除
    //----------------------------------

    if(isBreakthroughAttack){

        cpuBreakthroughAttackSummon =
            null;

    }


    cpuAttackIndex++;


    cpuNextAttack();


    return;

}


//==================================
// PLAYERへの予測ダメージ確認
//
// ガーゴイル等によって
// 最終ダメージが0になる場合は
// 攻撃を行わない
//==================================

if(
    target === PLAYER &&
    !canCpuAttackDamagePlayer(
        attacker
    )
){

    console.log(
        "CPU攻撃見送り：",
        attacker.card.name,
        "PLAYERへの予測ダメージ0"
    );


    //----------------------------------
    // ブレイクスルー予約だった場合
    // 予約を解除
    //----------------------------------

    if(isBreakthroughAttack){

        console.log(
            "CPU：ブレイクスルー予約解除",
            attacker.card.name,
            "PLAYERへの予測ダメージ0"
        );


        cpuBreakthroughAttackSummon =
            null;

    }


    //----------------------------------
    // この攻撃者を終了扱いにする
    //----------------------------------

    cpuAttackIndex++;


    //----------------------------------
    // 次のCPU攻撃へ
    //----------------------------------

    setTimeout(
        cpuNextAttack,
        1000
    );


    return;

}


console.log(
    "CPU攻撃",
        attacker.card.name,
        "→",
        target === PLAYER
            ?
            "PLAYER"
            :
            target.card.name
    );


    //----------------------------------
    // 攻撃実行
    //----------------------------------

    attackingSummon =
        attacker;


    attackMode =
        true;


    //==================================
    // ★追加
    //
    // executeAttack()へ入った時点で
    // ブレイクスルー予約そのものは達成
    //
    // レジスト・ネレイド等で待機しても
    // 同じ攻撃を二重開始しないよう、
    // ここで予約を解除する
    //==================================

    if(isBreakthroughAttack){

        console.log(
            "CPU：ブレイクスルー予約攻撃開始",
            attacker.card.name
        );


        cpuBreakthroughAttackSummon =
            null;

    }


    const result =
        executeAttack(
            attacker,
            target
        );


    //==================================
    // 攻撃処理待機
    //
    // WAIT_RESIST
    // WAIT_BLOCK
    // WAIT_SPHINX
    // WAIT_CHARYBDIS
    //==================================

    if(
        result ===
            "WAIT_RESIST" ||

        result ===
            "WAIT_BLOCK" ||

        result ===
            "WAIT_SPHINX" ||

        result ===
            "WAIT_CHARYBDIS"
    ){

        cpuWaiting =
            true;


        console.log(
            "CPU攻撃待機",
            result
        );


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

function selectCpuAttackTarget(
    attacker
){

    //----------------------------------
    // 攻撃サモン確認
    //----------------------------------

    if(!attacker){

        return PLAYER;

    }


    //----------------------------------
    // CPUの攻撃力
    //----------------------------------

    const attackerPower =
        getPower(
            attacker
        );


    console.log(
        "CPU攻撃対象判定",
        attacker.card.name,
        "攻撃力=",
        attackerPower
    );


    //==================================
    // ブロック不可サモン
    //
    // 複数能力対応
    //==================================

    if(
        hasSummonAbility(
            attacker,
            "cannotBeBlocked"
        )
    ){

        console.log(
            "CPU攻撃対象：ブロック不可",
            attacker.card.name,
            "→ PLAYERを直接攻撃"
        );


        return PLAYER;

    }


    //==================================
    // カーススモーク
    // 横向き対象を優先攻撃
    //==================================

    const curseSmokeRestingTargets =
        playerField.filter(
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
                // シーサーペント
                // アタック対象にできない
                //----------------------------------

                if(
                    hasSummonAbility(
                        summon,
                        "cannotBeAttacked"
                    )
                ){

                    console.log(
                        "CPU攻撃対象から除外：",
                        summon.card.name,
                        "アタック対象不可"
                    );


                    return false;

                }


                if(!summon.isRest){

                    return false;

                }


                if(
                    !isCurseSmokeTarget(
                        summon
                    )
                ){

                    return false;

                }


//----------------------------------
// ドライアド等を考慮した
// 予測最終ダメージ
//----------------------------------

const expectedDamage =
    getHydraExpectedDamage(
        summon,
        attackerPower
    );


console.log(
    "CPU：カーススモーク対象",
    "攻撃ダメージ予測",
    {
        attacker:
            attacker.card.name,

        target:
            summon.card.name,

        attackerPower:
            attackerPower,

        expectedDamage:
            expectedDamage
    }
);


//----------------------------------
// 最終ダメージ0なら
// 攻撃対象にしない
//----------------------------------

if(
    expectedDamage <= 0
){

    console.log(
        "CPU攻撃対象から除外：",
        summon.card.name,
        "カーススモーク対象だが",
        "軽減後ダメージ0"
    );


    return false;

}


return true;

            }
        );


    //----------------------------------
    // カーススモーク状態の
    // 横向きサモンあり
    //----------------------------------

    if(
        curseSmokeRestingTargets.length >
        0
    ){

        curseSmokeRestingTargets.sort(
            (a,b) =>
                getPower(b) -
                getPower(a)
        );


        const target =
            curseSmokeRestingTargets[0];


        console.log(
            "CPU攻撃対象：",
            "カーススモーク横向き対象を優先",
            target.card.name,
            "targetPower=",
            getPower(target),
            "attackerPower=",
            attackerPower
        );


        return target;

    }


    //==================================
    // カーススモーク
    // 縦向きサモンが1体だけなら
    // PLAYERへ攻撃してブロックを誘う
    //==================================

    const curseSmokeVerticalTargets =
        playerField.filter(
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


                if(summon.isRest){

                    return false;

                }


                return (
                    isCurseSmokeTarget(
                        summon
                    )
                );

            }
        );


    //----------------------------------
    // PLAYER側の有効な縦向きサモン
    //----------------------------------

    const allVerticalSummons =
        playerField.filter(
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


                if(summon.isRest){

                    return false;

                }


                if(
                    typeof isOgreBattleLocked ===
                        "function" &&
                    isOgreBattleLocked(
                        summon
                    )
                ){

                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // 唯一のブロッカーが
    // カーススモーク対象ならPLAYERへ
    //----------------------------------

    if(
        allVerticalSummons.length === 1 &&
        curseSmokeVerticalTargets.length === 1 &&
        allVerticalSummons[0] ===
            curseSmokeVerticalTargets[0]
    ){

        console.log(
            "CPU攻撃対象：",
            "唯一の縦向きブロッカーが",
            "カーススモーク状態",
            allVerticalSummons[0].card.name,
            "→ PLAYERへ攻撃してブロックを誘う"
        );


        return PLAYER;

    }


    //==================================
    // バジリスク
    // ドラゴン・クラーケン対策
    //==================================

    if(
        attacker.card.name ===
            "バジリスク"
    ){

        const dragonKrakenTargets =
            playerField.filter(
                summon => {

                    if(summon.destroyed){

                        return false;

                    }


                    //----------------------------------
                    // シーサーペント
                    // アタック対象にできない
                    //----------------------------------

                    if(
                        hasSummonAbility(
                            summon,
                            "cannotBeAttacked"
                        )
                    ){

                        console.log(
                            "CPU攻撃対象から除外：",
                            summon.card.name,
                            "アタック対象不可"
                        );


                        return false;

                    }


if(!summon.isRest){

    return false;

}


const name =
    summon.card.name;


//----------------------------------
// ドラゴン・クラーケン以外
//----------------------------------

if(
    name !== "ドラゴン" &&
    name !== "クラーケン"
){

    return false;

}


//----------------------------------
// ドライアド等を考慮した
// 予測最終ダメージ
//----------------------------------

const expectedDamage =
    getHydraExpectedDamage(
        summon,
        attackerPower
    );


console.log(
    "CPU：バジリスク特殊攻撃",
    "ダメージ予測",
    {
        target:
            summon.card.name,

        attackerPower:
            attackerPower,

        expectedDamage:
            expectedDamage
    }
);


//----------------------------------
// 最終ダメージ0なら
// 攻撃対象にしない
//----------------------------------

if(
    expectedDamage <= 0
){

    console.log(
        "CPU攻撃対象から除外：",
        summon.card.name,
        "バジリスク特殊攻撃だが",
        "軽減後ダメージ0"
    );


    return false;

}


return true;

                }
            );


        if(
            dragonKrakenTargets.length > 0
        ){

            dragonKrakenTargets.sort(
                (a,b) =>
                    getPower(b) -
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

//==================================
// 通常
// ① 横向きサモン
//==================================

const restingSummons =
    playerField.filter(
        summon => {

            //----------------------------------
            // 基本確認
            //----------------------------------

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return false;

            }


            //----------------------------------
            // シーサーペント
            // アタック対象にできない
            //----------------------------------

            if(
                hasSummonAbility(
                    summon,
                    "cannotBeAttacked"
                )
            ){

                console.log(
                    "CPU攻撃対象から除外：",
                    summon.card.name,
                    "アタック対象不可"
                );


                return false;

            }


            //----------------------------------
            // 横向きのみ
            //----------------------------------

            if(!summon.isRest){

                return false;

            }


            //----------------------------------
            // ドライアド等を考慮した
            // 予測最終ダメージ
            //----------------------------------

            const expectedDamage =
                getHydraExpectedDamage(
                    summon,
                    attackerPower
                );


            console.log(
                "CPU：サモン攻撃ダメージ予測",
                {
                    attacker:
                        attacker.card.name,

                    target:
                        summon.card.name,

                    attackerPower:
                        attackerPower,

                    expectedDamage:
                        expectedDamage
                }
            );


            //----------------------------------
            // 最終ダメージ0なら
            // 攻撃対象にしない
            //----------------------------------

            if(expectedDamage <= 0){

                console.log(
                    "CPU攻撃対象から除外：",
                    summon.card.name,
                    "軽減後ダメージ0"
                );


                return false;

            }


            //----------------------------------
            // 軽減後ダメージで
            // 対象を倒せるか確認
            //----------------------------------

            return (
                getPower(
                    summon
                ) <
                expectedDamage
            );

        }
    );


//----------------------------------
// 横向きサモンがある場合
//----------------------------------

if(
    restingSummons.length > 0
){

    restingSummons.sort(
        (a,b) =>
            getPower(b) -
            getPower(a)
    );


    console.log(
        "CPU攻撃対象：横向きサモン",
        restingSummons[0].card.name,
        "power=",
        getPower(
            restingSummons[0]
        )
    );


    return restingSummons[0];

}


    //==================================
    // ② 実際にブロック可能な
    // PLAYERサモンだけ確認
    //==================================

    const blockableVerticalSummons =
        playerField.filter(
            summon => {

                if(summon.destroyed){

                    return false;

                }


                if(summon.isRest){

                    return false;

                }


                if(
                    typeof isOgreBattleLocked ===
                        "function" &&
                    isOgreBattleLocked(
                        summon
                    )
                ){

                    console.log(
                        "CPU攻撃対象評価から除外：",
                        summon.card.name,
                        "現在ブロック不可"
                    );


                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // ブロック可能サモンなし
    //----------------------------------

    if(
        blockableVerticalSummons.length ===
        0
    ){

        console.log(
            "CPU攻撃対象：",
            "ブロック可能サモンなし",
            "→ PLAYER"
        );


        return PLAYER;

    }


    //----------------------------------
    // 攻撃者以下のパワーの
    // ブロッカーが存在するか
    //----------------------------------

    const canAttackPlayer =
        blockableVerticalSummons.some(
            summon =>
                getPower(summon) <=
                attackerPower
        );


    if(canAttackPlayer){

        console.log(
            "CPU攻撃対象：",
            "攻撃可能なブロッカーのみ",
            "→ PLAYER"
        );


        return PLAYER;

    }


    //==================================
    // ③ その他
    //==================================

    console.log(
        "CPU攻撃対象：プレイヤー"
    );


    return PLAYER;

}

//======================================
// CPUサモン召喚
//======================================


function cpuSummon(
    card,
    skipFastCall = false,
    costPaid = false
){

    //----------------------------------
    // カード確認
    //----------------------------------

    if(!card){
        return false;
    }

    //----------------------------------
    // 通常のプレイ開始時のみ確認
    //----------------------------------

    if(!costPaid){

        if(!canPlayCardByLimit(ENEMY)){

            console.log(
                "CPUサモン使用不可：カードプレイ枚数上限",
                card.name
            );

            return false;
        }

        if(
            !canPlaySummonByElementRestriction(
                ENEMY,
                card
            )
        ){

            console.log(
                "CPUサモン使用不可：属性制限",
                card.name
            );

            return false;
        }

        //----------------------------------
        // コスト取得
        //----------------------------------

        const currentCost =
            getCurrentCardCost(
                card,
                ENEMY
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
        // コストカード決定
        //----------------------------------

        const costCards =
            selectCpuCostCards(
                card,
                currentCost
            );

        if(
            costCards.length <
            currentCost
        ){

            console.log(
                "CPUサモン：コスト不足"
            );

            return false;
        }

        //==================================
        // 先にコストを支払う
        //==================================

        costCards.forEach(
            costCard => {

                moveEnemyToCost(
                    costCard
                );

            }
        );

        //==================================
        // プレイするカードを手札から除外
        //==================================

        enemyHandCards =
            enemyHandCards.filter(
                c => c !== card
            );

        // 解決待ちとして保持
        card.area = "pending";

        updateEnemyZoneDisplay();

        //==================================
        // ファストコール発動確認
        //==================================

        if(!skipFastCall){

            const event = {

                type:
                    GAME_EVENT.ENEMY_PLAY_CARD,

                player:
                    PLAYER,

                source:
                    card,

                sourceType:
                    "サモン",

                resume:
                    resumeCpuCardPlayAfterFastCall

            };

            const available =
                findResistCards(
                    event
                ).some(
                    resist =>
                        resist.effect ===
                        "fastCall"
                );

            if(available){

                const paused =
                    pauseCpuCardPlayForFastCall(
                        card,
                        () => {

                            console.log(
                                "CPU：ファストコール終了後",
                                "召喚再開",
                                card.name
                            );

                            // コスト支払い済みで再開
                            const result =
                                cpuSummon(
                                    card,
                                    true,
                                    true
                                );

                            if(result === true){

                                cpuSummonUsedThisTurn =
                                    true;

                            }

                            setTimeout(
                                runCpuTurnStep,
                                2000
                            );

                        }
                    );

                if(paused){

                    //----------------------------------
                    // プレイするカードを表示
                    //----------------------------------

                    showCpuCardAction(
                        card,
                        "SUMMON",
                        null,
                        true
                    );

                    const triggered =
                        emitGameEvent(
                            event
                        );

                    if(triggered){

                        console.log(
                            "CPU：ファストコール待機",
                            card.name
                        );

                        return "WAIT_FAST_CALL";

                    }

                    //----------------------------------
                    // レジストが開始されなかった
                    //----------------------------------

                    hideCpuCardAction();

                    cpuFastCallWaiting =
                        false;

                    cpuFastCallPendingAction =
                        null;

                    cpuWaiting =
                        false;

                }

            }

        }

    }

    //==================================
    // CPUの召喚処理
    // コストの再支払いは行わない
    //==================================

    const result =
        executeSummon(
            card,
            ENEMY
        );

    if(result === false){

        console.log(
            "CPUサモン：召喚失敗",
            card.name
        );

        return false;
    }

    //----------------------------------
    // カードプレイ成立
    //----------------------------------

    registerCardPlay(
        ENEMY,
        card
    );

    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `CPU：${card.name}を召喚`
    );

    return true;

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


function cpuMagia(
    card,
    target,
    ownSummon = null,
    skipFastCall = false,
    costPaid = false
){

    if(!card){
        return false;
    }

    //==================================
    // 通常プレイ時の事前確認
    //==================================

    if(!costPaid){

        //----------------------------------
        // カードプレイ枚数制限
        //----------------------------------

        if(!canPlayCardByLimit(ENEMY)){

            console.log(
                "CPUマギア使用不可：カードプレイ枚数上限",
                card.name
            );

            return false;
        }

    }

    //----------------------------------
    // 参照サモンの確認
    //----------------------------------

    if(
        card.effect?.valueType ===
        "ownSummonPower"
    ){

        if(
            !ownSummon ||
            ownSummon.destroyed ||
            !enemyField.includes(ownSummon)
        ){

            console.log(
                "CPUマギア使用不可：参照サモンなし",
                card.name
            );

            return false;
        }

    }

    //==================================
    // マギア情報を設定
    //
    // 対象によってコストが変化するため
    // コスト計算より先に設定する
    //==================================

    magiaCard = card;

    magiaCard.owner = ENEMY;

    magiaTarget = target;

    magiaSelectedOwnSummon = ownSummon;

    //==================================
    // 初回のみコスト支払い
    //==================================

    if(!costPaid){

        //----------------------------------
        // 現在のコスト
        //----------------------------------

        const currentCost =
            getCurrentCardCost(
                card,
                ENEMY
            );

        console.log(
            "CPUマギアコスト",
            card.name,
            currentCost
        );

        //----------------------------------
        // 支払い可能か確認
        //----------------------------------

        if(
            enemyHandCards.length - 1 <
            currentCost
        ){

            console.log(
                "CPUマギア：コスト不足",
                card.name
            );

            magiaCard = null;

            magiaTarget = null;

            magiaSelectedOwnSummon = null;

            return false;
        }

        //==================================
        // プレイするマギアを手札から除外
        //==================================

        enemyHandCards =
            enemyHandCards.filter(
                c => c !== card
            );

        //----------------------------------
        // 解決待ちの状態
        //----------------------------------

        card.area = "pending";

        //==================================
        // コスト支払い
        //==================================

        payEnemyCost(
            currentCost
        );

        updateEnemyZoneDisplay();

        console.log(
            "CPUマギア：コスト支払い完了",
            card.name
        );

        //==================================
        // ファストコール発動確認
        //==================================

        if(!skipFastCall){

            const event = {

                type:
                    GAME_EVENT.ENEMY_PLAY_CARD,

                player:
                    PLAYER,

                source:
                    card,

                sourceType:
                    "マギア",

                resume:
                    resumeCpuCardPlayAfterFastCall

            };

            //----------------------------------
            // 使用可能なファストコールを検索
            //----------------------------------

const available =
    findResistCards(
        event
    ).some(
        resist =>
            resist.effect === "fastCall" ||
            resist.effect === "cancelMagia"
    );

            if(available){

                //----------------------------------
                // マギア解決処理を保存
                //----------------------------------

                const paused =
                    pauseCpuCardPlayForFastCall(
                        card,
                        () => {

                            //======================================
// キャンセレーション
// マギアの効果を無効化
//======================================

if(event.cancelled === true){

    console.log(
        "キャンセレーション：",
        card.name,
        "の効果を無効化"
    );

    // カードのプレイ枚数を記録
    registerCardPlay(
        ENEMY,
        card
    );

    // マギアをクールゾーンへ送る
    card.area = "cool";

    board.addCoolCard(
        card,
        ENEMY
    );

    // マギアの使用状態を解除
    resetMagiaState();

    // CPUの次の行動へ
    setTimeout(
        runCpuTurnStep,
        500
    );

    return;
}

                            console.log(
                                "CPU：ファストコール終了",
                                "マギア解決再開",
                                card.name
                            );

                            //----------------------------------
                            // 支払い済みで再開
                            //----------------------------------

                            const result =
                                cpuMagia(
                                    card,
                                    target,
                                    ownSummon,
                                    true,
                                    true
                                );

                            //----------------------------------
                            // 強制コスト型
                            //----------------------------------

                            if(result === true){

                                if(
                                    card.effect?.type ===
                                    "forceCost"
                                ){

                                    console.log(
                                        "CPU：強制コスト選択待ち"
                                    );

                                    return;
                                }

                                //----------------------------------
                                // 通常マギア
                                //----------------------------------

                                console.log(
                                    "CPU：マギア処理完了",
                                    card.name
                                );

                                setTimeout(
                                    runCpuTurnStep,
                                    2000
                                );

                            }
                            else{

                                console.log(
                                    "CPU：マギア再開失敗",
                                    card.name
                                );

                                setTimeout(
                                    runCpuTurnStep,
                                    500
                                );

                            }

                        }
                    );

                //----------------------------------
                // 一時停止できた場合
                //----------------------------------

                if(paused){

                    //----------------------------------
                    // CPUが使用するカードを事前表示
                    //----------------------------------

                    showCpuCardAction(
                        card,
                        "MAGIA",
                        target,
                        true
                    );

                    //----------------------------------
                    // レジストイベント発生
                    //----------------------------------

                    const triggered =
                        emitGameEvent(
                            event
                        );

                    if(triggered){

                        console.log(
                            "CPU：ファストコール待機",
                            card.name
                        );

                        return "WAIT_FAST_CALL";

                    }

                    //----------------------------------
                    // レジストが開始されなかった場合
                    //----------------------------------

                    hideCpuCardAction();

                    cpuFastCallWaiting = false;

                    cpuFastCallPendingAction = null;

                    cpuWaiting = false;

                }

            }

        }

    }

    //==================================
    // ここからマギアの解決処理
    //
    // コスト支払いは行わない
    //==================================

    //----------------------------------
    // 再開時にも対象情報を復元
    //----------------------------------

    magiaCard = card;

    magiaCard.owner = ENEMY;

    magiaTarget = target;

    magiaSelectedOwnSummon = ownSummon;

    //----------------------------------
    // カードプレイ成立
    //----------------------------------

    registerCardPlay(
        ENEMY,
        card
    );

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
    // 追加サモンログ
    //----------------------------------

    if(ownSummon){

        addBattleLog(
            `CPU：${ownSummon.card.name}のパワーを参照`
        );

    }

//----------------------------------
// CPUカード使用演出
// 再開時は二重表示しない
//----------------------------------

if(!skipFastCall){

    showCpuCardAction(
        card,
        "MAGIA",
        target
    );

}

    console.log(
        "CPUマギア使用",
        card.name
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

        showCpuMagiaTargetHighlight(
            target
        );

        forceCostSource = "magia";

        startForceCostSelect(
            target
        );

        cpuWaiting = true;

        return true;

    }

    //----------------------------------
    // 通常マギア
    //----------------------------------

    resolveMagia();

    //----------------------------------
    // 対象発光
    //----------------------------------

    setTimeout(() => {

        showCpuMagiaTargetHighlight(
            target
        );

    }, 0);

    //----------------------------------
    // 対象発光解除
    //----------------------------------

    setTimeout(() => {

        clearCpuMagiaTargetHighlight(
            target
        );

    }, 5000);

    return true;

}

//==================================================
// CPU：条件付きブロック不可マギア対象選択
//
// ブレイクスルー等
//==================================================

function selectCpuConditionalUnblockableTarget(
    card
){

    //----------------------------------
    // カード確認
    //----------------------------------

    if(
        !card ||
        !card.effect
    ){

        return null;

    }


    //----------------------------------
    // 条件付きブロック不可以外
    //----------------------------------

    if(
        card.effect.type !==
        "conditionalCannotBeBlocked"
    ){

        return null;

    }


    //----------------------------------
    // 条件となる最大パワー
    //----------------------------------

    const maxPower =
        Number(
            card.effect.maxPower
        ) || 2;


    //==================================
    // 対象候補
    //==================================

    const candidates =
        enemyField.filter(
            summon => {

                //----------------------------------
                // 無効なサモン
                //----------------------------------

                if(
                    !summon ||
                    summon.destroyed
                ){

                    return false;

                }


                //----------------------------------
                // CPU自身のサモンのみ
                //----------------------------------

                if(
                    summon.owner !==
                    ENEMY
                ){

                    return false;

                }


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


                //==================================
                // ★重要
                // 現在パワーが条件以下のみ
                //
                // 「優先」ではなく、
                // これを超えるサモンには
                // CPUは使用しない
                //==================================

                const currentPower =
                    getPower(
                        summon
                    );


                if(
                    currentPower >
                    maxPower
                ){

                    return false;

                }


                //----------------------------------
                // ヨコ向きは攻撃できない
                //----------------------------------

                if(
                    summon.isRest
                ){

                    return false;

                }


                //==================================
                // このターン攻撃可能か
                //==================================

                let canAttack =
                    summon.attackReady;


                //----------------------------------
                // 召喚ターン攻撃能力
                //----------------------------------

                if(
                    !canAttack &&
                    hasSummonAbility(
                        summon,
                        "summonTurnAttack"
                    )
                ){

                    canAttack =
                        true;

                }


                //----------------------------------
                // 攻撃できない
                //----------------------------------

                if(!canAttack){

                    return false;

                }


                //----------------------------------
                // メドゥーサによって
                // 召喚ターン攻撃を禁止されている
                //----------------------------------

                if(
                    typeof isSummonTurnAttackPrevented ===
                        "function" &&
                    isSummonTurnAttackPrevented(
                        summon
                    )
                ){

                    //----------------------------------
                    // 通常のattackReadyがないなら
                    // 攻撃不可
                    //----------------------------------

                    if(
                        !summon.attackReady
                    ){

                        return false;

                    }

                }


                //----------------------------------
                // オーガ等による攻撃制限
                //----------------------------------

                if(
                    typeof isOgreBattleLocked ===
                        "function" &&
                    isOgreBattleLocked(
                        summon
                    )
                ){

                    return false;

                }


                //==================================
                // すでに恒常的に
                // ブロックされないなら不要
                //
                // グリフォン等
                //==================================

                if(
                    hasSummonAbility(
                        summon,
                        "cannotBeBlocked"
                    )
                ){

                    return false;

                }


                //==================================
                // すでにブレイクスルー等を
                // 受けているなら不要
                //==================================

                if(
                    Array.isArray(
                        summon.status
                    ) &&
                    summon.status.some(
                        status =>
                            status?.type ===
                            "conditionalCannotBeBlocked"
                    )
                ){

                    return false;

                }


                //----------------------------------
                // 候補
                //----------------------------------

                return true;

            }
        );


    //==================================
    // 候補なし
    //==================================

    if(
        candidates.length === 0
    ){

        console.log(
            "CPU：条件付きブロック不可対象なし",
            card.name
        );


        return null;

    }


    //==================================
    // 候補評価
    //
    // 条件を満たす中では
    // 高パワーを優先
    //==================================

    candidates.sort(
        (a,b) =>
            getPower(b) -
            getPower(a)
    );


    //----------------------------------
    // 最大パワー
    //----------------------------------

    const bestPower =
        getPower(
            candidates[0]
        );


    //----------------------------------
    // 同パワー候補
    //----------------------------------

    const bestCandidates =
        candidates.filter(
            summon =>
                getPower(
                    summon
                ) ===
                bestPower
        );


    //----------------------------------
    // 同値ならランダム
    //----------------------------------

    const target =
        bestCandidates[
            Math.floor(
                Math.random() *
                bestCandidates.length
            )
        ];


    console.log(
        "================================"
    );

    console.log(
        "CPU：条件付きブロック不可対象決定",
        card.name
    );

    console.log(
        "対象=",
        target.card?.name
    );

    console.log(
        "現在パワー=",
        getPower(
            target
        )
    );

    console.log(
        "attackReady=",
        target.attackReady
    );

    console.log(
        "================================"
    );


    return target;

}

//======================================
// CPU：クールゾーンのサモン対象選択
//======================================

function selectCpuCoolSummonTarget(
    card
){

    //----------------------------------
    // カード確認
    //----------------------------------

    if(
        !card ||
        !card.effect
    ){

        return null;

    }


    //----------------------------------
    // CPUクールゾーン確認
    //----------------------------------

    if(
        !Array.isArray(
            enemyCoolCards
        )
    ){

        return null;

    }


    //----------------------------------
    // サモンだけ取得
    //----------------------------------

    const candidates =
        enemyCoolCards.filter(
            coolCard => {

                if(!coolCard){

                    return false;

                }


                return (
                    coolCard.type ===
                    "サモン"
                );

            }
        );


    //----------------------------------
    // 候補なし
    //----------------------------------

    if(
        candidates.length === 0
    ){

        console.log(
            "CPU：クールゾーンのサモン対象なし",
            card.name
        );

        return null;

    }


    //----------------------------------
    // コスト軽減属性
    //----------------------------------

    const costDownElement =
        card.effect
            .costDownElement ??
        null;


    //----------------------------------
    // コスト軽減対象
    //----------------------------------

    const reducedCandidates =
        candidates.filter(
            coolCard => {

                const element =
                    coolCard.elementType ??
                    coolCard.element ??
                    null;


                return (
                    costDownElement &&
                    element ===
                        costDownElement
                );

            }
        );


    //----------------------------------
    // 使用する候補
    //
    // 軽減対象が存在する場合は
    // そちらを優先する
    //----------------------------------

    const usableCandidates =
        reducedCandidates.length > 0
            ?
            reducedCandidates
            :
            candidates;


    //----------------------------------
    // パワーが高い順に並べる
    //----------------------------------

    const sortedCandidates =
        [...usableCandidates].sort(
            (a, b) => {

                const powerA =
                    Number(
                        a.power
                    ) || 0;

                const powerB =
                    Number(
                        b.power
                    ) || 0;


                return (
                    powerB -
                    powerA
                );

            }
        );


    //----------------------------------
    // 最もパワーが高いサモン
    //----------------------------------

    const target =
        sortedCandidates[0];


    //----------------------------------
    // 対象属性
    //----------------------------------

    const targetElement =
        target.elementType ??
        target.element ??
        null;


    //----------------------------------
    // 軽減対象か
    //----------------------------------

    const costDown =
        (
            costDownElement &&
            targetElement ===
                costDownElement
        );


    console.log(
        "CPU：クールゾーンサモン対象決定",
        {
            magia:
                card.name,

            target:
                target.name,

            power:
                target.power,

            element:
                targetElement,

            costDown:
                costDown
        }
    );


    return target;

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

    //==================================
    // 相手サモン能力無効
    //==================================

    if(
        card.effect.type ===
            "disableEnemySummonAbilities" &&
        targets.includes(
            "enemy"
        )
    ){

        console.log(
            "CPU：サモン能力無効マギア対象",
            "PLAYER"
        );


        return PLAYER;

    }



    //==================================
    // クールゾーンのサモンを場に出す
    //==================================

    if(
        card.effect.type ===
            "playSummonFromCool" &&
        targets.includes(
            "playerCoolSummon"
        )
    ){

        return (
            selectCpuCoolSummonTarget(
                card
            )
        );

    }

//==================================
// ヨコ向きサモンをタテ向きにする
// クイックアクション等
//==================================

if(
    card.effect.type ===
        "readySummon" &&
    targets.includes(
        "horizontalSummon"
    )
){

    //----------------------------------
    // CPU自身のヨコ向きサモンだけを
    // 対象候補にする
    //----------------------------------

    const candidates =
        enemyField.filter(
            summon => {

                //----------------------------------
                // 無効なサモン
                //----------------------------------

                if(
                    !summon ||
                    summon.destroyed
                ){

                    return false;

                }


                //----------------------------------
                // CPU自身のサモンのみ
                //----------------------------------

                if(
                    summon.owner !==
                        ENEMY
                ){

                    return false;

                }


                //----------------------------------
                // ヨコ向きのみ
                //----------------------------------

                if(
                    !summon.isRest
                ){

                    return false;

                }


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
            "CPU：タテ向き変更マギア対象なし",
            card.name
        );

        return null;

    }


    //----------------------------------
    // 風サモンを取得
    //----------------------------------

    const windCandidates =
        candidates.filter(
            summon => {

                const element =
                    summon.card?.elementType ??
                    summon.card?.element ??
                    null;


                return (
                    element ===
                    card.effect.costDownElement
                );

            }
        );


    //----------------------------------
    // 風サモンがいれば
    // コスト軽減対象を優先
    //----------------------------------

    const targetCandidates =
        windCandidates.length > 0
            ? windCandidates
            : candidates;


    //----------------------------------
    // パワーが高い順
    //----------------------------------

    targetCandidates.sort(
        (a,b) =>
            getPower(b) -
            getPower(a)
    );


    //----------------------------------
    // 最大パワー
    //----------------------------------

    const maxPower =
        getPower(
            targetCandidates[0]
        );


    //----------------------------------
    // 同じ最大パワーなら
    // ランダム
    //----------------------------------

    const bestCandidates =
        targetCandidates.filter(
            summon =>
                getPower(
                    summon
                ) ===
                maxPower
        );


    const target =
        bestCandidates[
            Math.floor(
                Math.random() *
                bestCandidates.length
            )
        ];


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "CPU：タテ向き変更マギア対象決定",
        card.name
    );

    console.log(
        "対象=",
        target.card?.name
    );

    console.log(
        "属性=",
        target.card?.elementType ??
        target.card?.element
    );

    console.log(
        "パワー=",
        getPower(
            target
        )
    );

    console.log(
        "================================"
    );


    return target;

}    


//==================================
// ★追加
// 条件付きブロック不可
//
// ブレイクスルー等
//==================================

if(
    card.effect.type ===
    "conditionalCannotBeBlocked"
){

    return (
        selectCpuConditionalUnblockableTarget(
            card
        )
    );

}



    //==================================
    // ★追加
    // ヨコ向きサモンを手札へ戻す
    //
    // トルネード等
    //
    // CPUは自分のサモンではなく、
    // PLAYERのヨコ向きサモンを優先する
    //==================================

    if(
        card.effect.type ===
            "returnToHand" &&
        card.effect.condition
            ?.orientation ===
            "horizontal" &&
        targets.includes(
            "enemySummon"
        )
    ){

        //----------------------------------
        // PLAYERのヨコ向きサモンから
        // 有効対象だけ取得
        //----------------------------------

        const candidates =
            playerField.filter(
                summon => {

                    if(
                        !summon ||
                        summon.destroyed
                    ){

                        return false;

                    }


                    //----------------------------------
                    // PLAYERサモンのみ
                    //----------------------------------

                    if(
                        summon.owner !==
                        PLAYER
                    ){

                        return false;

                    }


                    //----------------------------------
                    // ヨコ向きのみ
                    //----------------------------------

                    if(
                        !summon.isRest
                    ){

                        return false;

                    }


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
                "CPU：手札戻しマギア対象なし",
                card.name
            );


            return null;

        }


        //----------------------------------
        // 高パワー順
        //----------------------------------

        candidates.sort(
            (a,b) =>
                getPower(b) -
                getPower(a)
        );


        //----------------------------------
        // 最大パワー
        //----------------------------------

        const maxPower =
            getPower(
                candidates[0]
            );


        //----------------------------------
        // 同じ最大パワーの候補
        //
        // 同値ならランダム
        //----------------------------------

        const bestCandidates =
            candidates.filter(
                summon =>
                    getPower(
                        summon
                    ) ===
                    maxPower
            );


        const target =
            bestCandidates[
                Math.floor(
                    Math.random() *
                    bestCandidates.length
                )
            ];


        console.log(
            "================================"
        );

        console.log(
            "CPU：手札戻しマギア対象決定",
            card.name
        );

        console.log(
            "対象=",
            target.card?.name
        );

        console.log(
            "向き=",
            target.isRest
                ? "ヨコ"
                : "タテ"
        );

        console.log(
            "パワー=",
            getPower(
                target
            )
        );

        console.log(
            "================================"
        );


        return target;

    }


    //==================================
    // フォローウィンド
    // 召喚したばかりで
    // 攻撃できないCPUサモンのみ対象
    //==================================

    if(
        card.name ===
        "フォローウィンド"
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
                    //
                    // 複数能力・ドッペルゲンガーの
                    // コピー能力にも対応
                    //----------------------------------

                    if(
                        hasSummonAbility(
                            summon,
                            "summonTurnAttack"
                        )
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


    //==================================
    // バーニングエナジー
    //==================================

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
                    // 召喚ターン攻撃可能能力
                    //----------------------------------

                    const canAttackOnSummonTurn =
                        hasSummonAbility(
                            summon,
                            "summonTurnAttack"
                        );


                    //----------------------------------
                    // 召喚ターンは攻撃不可
                    // summonTurnAttackなら例外
                    //
                    // 複数能力・ドッペルゲンガーの
                    // コピー能力にも対応
                    //----------------------------------

                    if(
                        !summon.attackReady &&
                        !canAttackOnSummonTurn
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


    //==================================
    // 通常マギア
    //==================================

    const candidates = [];


    const isDamageMagia =
        card.effect.type ===
        "damage";


    //==================================
    // 現在の実ダメージ
    //
    // 通常ダメージ
    // マグナブレイズ
    // 火マギアダメージ上昇
    // に対応
    //==================================

    const damageValue =
        isDamageMagia
            ?
            getCpuMagiaDamageValue(
                card
            )
            :
            0;


//==================================
// 必殺対象
//
// PLAYER手札1枚以下
// かつ
// 軽減後の実ダメージで
// LIFEを0以下にできる
//==================================

if(
    isDamageMagia
){

    const playerHandCount =
        board.handCards.length;


    const playerLife =
        game.playerLife;


    //----------------------------------
    // ガーゴイル等を考慮した
    // PLAYERへの予測最終ダメージ
    //----------------------------------

    const expectedPlayerDamage =
        getCpuExpectedMagiaDamage(
            PLAYER,
            damageValue
        );


    console.log(
        "CPU：必殺マギア判定",
        {
            magia:
                card.name,

            playerHand:
                playerHandCount,

            playerLife:
                playerLife,

            originalDamage:
                damageValue,

            expectedDamage:
                expectedPlayerDamage
        }
    );


    //----------------------------------
    // 軽減後ダメージで倒せる場合のみ
    // PLAYERを直接対象にする
    //----------------------------------

    if(
        playerHandCount <= 1 &&
        expectedPlayerDamage >=
            playerLife &&
        card.effect.target.includes(
            "enemy"
        )
    ){

        console.log(
            "CPU：必殺のためPLAYERを直接対象",
            card.name,
            "PLAYER手札=",
            playerHandCount,
            "PLAYER LIFE=",
            playerLife,
            "元ダメージ=",
            damageValue,
            "軽減後ダメージ=",
            expectedPlayerDamage
        );


        return PLAYER;

    }

}


//----------------------------------
// ダメージマギア専用対象
//----------------------------------

if(isDamageMagia){

    const priorityTarget =
        selectCpuDamageMagiaTarget(
            card
        );


    //----------------------------------
    // 有効な対象あり
    //----------------------------------

    if(priorityTarget){

        return priorityTarget;

    }


    //----------------------------------
    // ダメージマギアなのに
    // 有効な対象がない場合
    //
    // 通常の対象選択へ進ませない
    //----------------------------------

    console.log(
        "CPU：ダメージマギア使用見送り",
        card.name,
        "有効なダメージ対象なし"
    );


    return null;



    }


    //==================================
    // 自分サモン
    // CPU自身のサモン
    //==================================

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


    //==================================
    // 相手サモン
    // プレイヤーのサモン
    //==================================

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


    //==================================
    // 自分タテ向き
    //==================================

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


    //==================================
    // 自分ヨコ向き
    //==================================

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


    //==================================
    // 相手タテ向き
    // プレイヤーのサモン
    //==================================

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


    //==================================
    // 相手ヨコ向き
    // プレイヤーのサモン
    //==================================

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


    //==================================
    // 自分
    // CPU自身
    //==================================

    if(
        targets.includes(
            "player"
        )
    ){

        candidates.push(
            ENEMY
        );

    }


    //==================================
    // 相手
    // プレイヤー
    //==================================

    if(
        targets.includes(
            "enemy"
        )
    ){

        candidates.push(
            PLAYER
        );

    }


    //==================================
    // 対象なし
    //==================================

    if(
        candidates.length === 0
    ){

        return null;

    }


    //==================================
    // 対象決定
    //==================================

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

            case "diamondSkin":

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


        //======================================
// カード使用イベント専用判定
//======================================

// プレイヤーがカードを使用した際は
// ファストコールのみを候補にする

if(event.type === GAME_EVENT.PLAY_CARD){

    const isFastCall =
        card.effect === "fastCall";

    const isCancellation =
        card.effect === "cancelMagia" &&
        event.sourceType === "マギア";

    if(!isFastCall && !isCancellation){
        continue;
    }

}

        //----------------------------------
        // レジストのみ
        //----------------------------------

        if(
            card.type !== "レジスト"
        ){

            continue;

        }

        //======================================
// バトルボム
// BATTLE_START専用確認
//======================================

if(
    card.effect ===
        "battleBomb"
){

    //----------------------------------
    // BATTLE_START以外では使用不可
    //----------------------------------

    if(
        event.type !==
            GAME_EVENT.BATTLE_START
    ){

        continue;

    }


    //----------------------------------
    // CPUがレジスト使用側か
    //----------------------------------

    if(
        event.player !== ENEMY
    ){

        continue;

    }


    //----------------------------------
    // バトル参加サモン確認
    //----------------------------------

    const participants =
        Array.isArray(
            event.participants
        )
            ?
            event.participants.filter(
                summon =>
                    summon &&
                    !summon.destroyed
            )
            :
            [];


    if(
        participants.length < 2
    ){

        console.log(
            "CPUバトルボム候補除外：",
            "バトル参加サモン不足"
        );

        continue;

    }


    //----------------------------------
    // PLAYER側サモンが存在するか
    //----------------------------------

    const playerTargetExists =
        participants.some(
            summon =>
                summon.owner === PLAYER
        );


    if(!playerTargetExists){

        console.log(
            "CPUバトルボム候補除外：",
            "PLAYER側サモンなし"
        );

        continue;

    }


    console.log(
        "CPUバトルボム：候補条件OK",
        participants.map(
            summon =>
                summon.card?.name
        )
    );

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

const isCpuFastCallEvent =
    event.type === GAME_EVENT.PLAY_CARD &&
    (
        card.effect === "fastCall" ||
        (
            card.effect === "cancelMagia" &&
            event.sourceType === "マギア"
        )
    );

if(!isCpuFastCallEvent){

    if(Array.isArray(card.trigger)){

        if(!card.trigger.includes(event.type)){
            continue;
        }

    }else{

        if(card.trigger !== event.type){
            continue;
        }

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
// CPUファストコール
// 召喚するサモンの選択
//======================================

function selectCpuFastCallSummon(){

    const summonCards =
        enemyHandCards.filter(card => {

            if(card.type !== "サモン"){
                return false;
            }

            // 属性による召喚制限
            if(
                !canPlaySummonByElementRestriction(
                    ENEMY,
                    card
                )
            ){
                return false;
            }

            // 現在の召喚コスト
            const cost =
                getCurrentCardCost(
                    card,
                    ENEMY
                );

            // コスト支払い可能か確認
            if(
                !canPayCost(card, ENEMY)
            ){
                return false;
            }

            return (
                enemyHandCards.length - 1 >= cost
            );

        });

    if(summonCards.length === 0){

        console.log(
            "CPUファストコール：召喚可能サモンなし"
        );

        return null;
    }

    // パワーが高いサモンを優先
    summonCards.sort(
        (a, b) =>
            Number(b.power || 0) -
            Number(a.power || 0)
    );

    console.log(
        "CPUファストコール召喚候補：",
        summonCards.map(card => card.name)
    );

    return summonCards[0];

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
// CPUバトルボム使用判定
//======================================

if(
    event.type ===
        GAME_EVENT.BATTLE_START &&
    event.player === ENEMY
){

    const battleBombCard =
        enemyHandCards.find(
            card =>
                card.type ===
                    "レジスト" &&
                card.effect ===
                    "battleBomb" &&
                !card.usedThisEvent &&
                canPayCost(
                    card,
                    ENEMY
                ) &&
                (
                    !card.condition ||
                    card.condition(event)
                )
        );


    //----------------------------------
    // バトルボムなし
    //----------------------------------

    if(!battleBombCard){

        console.log(
            "CPUバトルボム：使用可能カードなし"
        );

        return false;

    }


    //----------------------------------
    // バトル参加サモン確認
    //----------------------------------

    const participants =
        Array.isArray(
            event.participants
        )
            ?
            event.participants.filter(
                summon =>
                    summon &&
                    !summon.destroyed
            )
            :
            [];


    if(
        participants.length < 2
    ){

        console.log(
            "CPUバトルボム：",
            "バトル参加サモン不足"
        );

        return false;

    }


    //----------------------------------
    // PLAYER側サモン確認
    //----------------------------------

    const playerTarget =
        participants.find(
            summon =>
                summon.owner === PLAYER
        );


    if(!playerTarget){

        console.log(
            "CPUバトルボム：",
            "PLAYER側対象なし"
        );

        return false;

    }


    //----------------------------------
    // 使用する
    //----------------------------------

    console.log(
        "CPUバトルボム使用判定：YES",
        {
            target:
                playerTarget.card?.name,

            power:
                typeof getPower ===
                    "function"
                    ?
                    getPower(
                        playerTarget
                    )
                    :
                    null
        }
    );


    return true;

}

//======================================
// CPUキャンセレーション使用判定
//======================================

if(
    event.type === GAME_EVENT.PLAY_CARD &&
    event.player === ENEMY &&
    event.sourceType === "マギア"
){

    const canCancel =
        enemyHandCards.some(card =>
            card.effect === "cancelMagia" &&
            !card.usedThisEvent &&
            canPayCost(card, ENEMY)
        );

    if(canCancel){
        return true;
    }

}

//======================================
// CPUファストコール使用判定
//======================================

if(
    event.type === GAME_EVENT.PLAY_CARD &&
    event.player === ENEMY
){

    const fastCallCard =
        enemyHandCards.find(
            card =>
                card.effect === "fastCall" &&
                !card.usedThisEvent &&
                canPayCost(card, ENEMY) &&
                (
                    !card.condition ||
                    card.condition(event)
                )
        );

    if(!fastCallCard){
        return false;
    }

    // ファストコール自体のコスト
    const fastCallCost =
        getCurrentEnemyCardCost(
            fastCallCard
        );

    // 召喚可能なサモンを探す
    const summonCards =
        enemyHandCards.filter(
            card =>
                card.type === "サモン" &&
                canPlaySummonByElementRestriction(
                    ENEMY,
                    card
                )
        );

    // 両方のコストを支払えるか確認
    const canUse =
        summonCards.some(
            summon => {

                const summonCost =
                    getCurrentCardCost(
                        summon,
                        ENEMY
                    );

                const availableCards =
                    enemyHandCards.length - 2;

                return (
                    availableCards >=
                    fastCallCost + summonCost
                );

            }
        );

    console.log(
        "CPUファストコール使用判定",
        canUse
    );

    return canUse;

}


    //======================================
    // CPUサモンへのダメージ
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
        // ダメージ確認
        //----------------------------------

        const damage =
            Number(event.damage) || 0;


        if(damage <= 0){

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
        // このダメージで破壊されないなら
        // レジストを温存
        //----------------------------------

        if(
            damage < power
        ){

            console.log(
                "CPUレジスト不可：",
                "サモンが破壊されない",
                "target=",
                event.target.card.name,
                "power=",
                power,
                "damage=",
                damage
            );

            return false;

        }


        //----------------------------------
        // 使用可能なレジストがあるか確認
        //
        // findCpuResistCards()をここで
        // 呼ぶと再帰になるため、
        // 手札を直接確認する
        //----------------------------------

        const usableResist =
            enemyHandCards.some(
                card => {

                    if(
                        card.type !==
                        "レジスト"
                    ){

                        return false;

                    }


                    if(
                        card.usedThisEvent
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 発動タイミング
                    //----------------------------------

                    if(
                        Array.isArray(
                            card.trigger
                        )
                    ){

                        if(
                            !card.trigger.includes(
                                event.type
                            )
                        ){

                            return false;

                        }

                    }
                    else{

                        if(
                            card.trigger !==
                            event.type
                        ){

                            return false;

                        }

                    }


                    //----------------------------------
                    // 個別条件
                    //----------------------------------

                    if(
                        card.condition &&
                        !card.condition(event)
                    ){

                        return false;

                    }


                    //----------------------------------
                    // コスト
                    //----------------------------------

                    if(
                        !canPayCost(
                            card,
                            ENEMY
                        )
                    ){

                        return false;

                    }


                    return true;

                }
            );


        if(!usableResist){

            console.log(
                "CPUレジスト不可：",
                "使用可能なサモンダメージ用レジストなし"
            );

            return false;

        }


        console.log(
            "CPUレジスト使用判定：YES",
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
        typeof enemyLife !==
            "undefined" &&
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

    //======================================
// CPUバトルボム選択
//======================================

if(
    event?.type ===
        GAME_EVENT.BATTLE_START &&
    event?.player ===
        ENEMY
){

    //----------------------------------
    // 使用可能候補から
    // バトルボムを取得
    //----------------------------------

    const battleBombCard =
        cards?.find(
            card =>
                card &&
                card.effect ===
                    "battleBomb"
        );


    //----------------------------------
    // バトルボムなし
    //----------------------------------

    if(!battleBombCard){

        console.log(
            "CPUバトルボム選択：",
            "候補なし"
        );

        return null;

    }


    //----------------------------------
    // バトル参加サモン取得
    //----------------------------------

    const participants =
        Array.isArray(
            event.participants
        )
            ?
            event.participants.filter(
                summon =>
                    summon &&
                    !summon.destroyed
            )
            :
            [];


    //----------------------------------
    // PLAYER側の戦闘参加サモン
    //----------------------------------

    const playerTarget =
        participants.find(
            summon =>
                summon.owner ===
                    PLAYER
        );


    //----------------------------------
    // PLAYER側対象なし
    //----------------------------------

    if(!playerTarget){

        console.log(
            "CPUバトルボム選択：",
            "PLAYER側対象なし"
        );

        return null;

    }


    //----------------------------------
    // 今回はPLAYER側サモンを
    // バトルボム対象候補として採用
    //----------------------------------

    console.log(
        "CPUバトルボム選択：",
        battleBombCard.name,
        "対象予定=",
        playerTarget.card?.name
    );


    return battleBombCard;

}

    //======================================
    // CPUキャンセレーション選択
    //======================================

    if(
        event?.type === GAME_EVENT.PLAY_CARD &&
        event.sourceType === "マギア"
    ){

        const cancellation =
            cards?.find(
                card =>
                    card.effect === "cancelMagia"
            );

        if(!cancellation){
            return null;
        }

        const magia =
            event.source?.card ??
            event.source ??
            event.card;

        const target =
            event.target;

        let canDefend = false;

        const magiaDamage =
            magia?.effect?.type === "damage"
                ? Number(magia.effect.value) || 0
                : 0;

        //======================================
        // リキッドヴェールによる防御判定
        //======================================

        if(
            magiaDamage > 0 &&
            target?.owner === ENEMY
        ){

            const power =
                getPower(target);

            const remainingDamage =
                Math.max(
                    0,
                    magiaDamage - 2
                );

            const damageEvent = {
                ...event,

                type:
                    GAME_EVENT.BEFORE_SUMMON_DAMAGE,

                player: ENEMY,

                damage: magiaDamage,

                target: target
            };

            const liquidVeil =
                enemyHandCards.find(card => {

                    if(
                        card.effect !== "liquidVeil" ||
                        card.usedThisEvent ||
                        !canPayCost(card, ENEMY)
                    ){
                        return false;
                    }

                    const triggerMatches =
                        Array.isArray(card.trigger)
                            ? card.trigger.includes(
                                damageEvent.type
                            )
                            : card.trigger ===
                                damageEvent.type;

                    if(!triggerMatches){
                        return false;
                    }

                    if(
                        card.condition &&
                        !card.condition(damageEvent)
                    ){
                        return false;
                    }

                    return true;

                });

            if(
                liquidVeil &&
                remainingDamage < power
            ){

                canDefend = true;

                console.log(
                    "CPU：リキッドヴェールで防御可能",
                    "対象=",
                    target.card.name,
                    "パワー=",
                    power,
                    "軽減後ダメージ=",
                    remainingDamage
                );

            }

        }


        //======================================
        // ストーンガード・グラウンドウォール
        //======================================

        if(
            !canDefend &&
            magiaDamage > 0 &&
            (
                target === ENEMY ||
                target?.owner === ENEMY
            )
        ){

            const isSummon =
                target?.owner === ENEMY;

            const power =
                isSummon
                    ? getPower(target)
                    : 0;

            const damageEvent = {
                ...event,

                type: isSummon
                    ? GAME_EVENT.BEFORE_SUMMON_DAMAGE
                    : GAME_EVENT.BEFORE_PLAYER_DAMAGE,

                player: ENEMY,

                target: target,

                damage: magiaDamage
            };

            const reductions = {
                stoneGuard: 3,
                groundwall: 5
            };

            const defensiveCard =
                enemyHandCards.find(card => {

                    const reduction =
                        reductions[card.effect];

                    if(!reduction){
                        return false;
                    }

                    if(
                        card.usedThisEvent ||
                        !canPayCost(card, ENEMY)
                    ){
                        return false;
                    }

                    const triggerMatches =
                        Array.isArray(card.trigger)
                            ? card.trigger.includes(
                                damageEvent.type
                            )
                            : card.trigger ===
                                damageEvent.type;

                    if(!triggerMatches){
                        return false;
                    }

                    if(
                        card.condition &&
                        !card.condition(damageEvent)
                    ){
                        return false;
                    }

                    const remainingDamage =
                        Math.max(
                            0,
                            magiaDamage - reduction
                        );

                    if(isSummon){

                        return (
                            remainingDamage < power
                        );

                    }

                    return remainingDamage === 0;

                });


            if(defensiveCard){

                canDefend = true;

                console.log(
                    "CPU：他のレジストで防御可能",
                    defensiveCard.name
                );

            }

        }

        //======================================
// その他のレジストによる防御判定
//======================================

if(
    !canDefend &&
    magiaDamage > 0 &&
    (
        target === ENEMY ||
        target?.owner === ENEMY
    )
){

    const isSummon =
        target?.owner === ENEMY;

const damageEvent = {
    ...event,

    type: isSummon
        ? GAME_EVENT.BEFORE_SUMMON_DAMAGE
        : GAME_EVENT.BEFORE_PLAYER_DAMAGE,

    player: ENEMY,

    sourceType: "マギア",

    // 元のマギアの属性を引き継ぐ
    element: magia.elementType,

    target: target,

    damage: magiaDamage
};

    const defensiveCard =
        enemyHandCards.find(card => {

            // ウォーターバリアの判定状況を確認
if(card.effect === "waterBarrier"){

    console.log(
        "★ ウォーターバリア事前判定",
        {
            target: target,
            damage: magiaDamage,
            trigger: card.trigger,
            expectedTrigger: damageEvent.type,
            usedThisEvent: card.usedThisEvent,
            canPay: canPayCost(card, ENEMY),
            conditionResult:
                card.condition
                    ? card.condition(damageEvent)
                    : true
        }
    );

}

            if(
                card.usedThisEvent ||
                !canPayCost(card, ENEMY)
            ){
                return false;
            }

            const triggerMatches =
                Array.isArray(card.trigger)
                    ? card.trigger.includes(
                        damageEvent.type
                    )
                    : card.trigger ===
                        damageEvent.type;

            if(!triggerMatches){
                return false;
            }

            if(
                card.condition &&
                !card.condition(damageEvent)
            ){
                return false;
            }

            switch(card.effect){

                case "waterBarrier":
                    return true;

                case "illusionFog":
                    return isSummon;

                case "sandProtect":
                    return magiaDamage === 1;

                default:
                    return false;

            }

        });

    if(defensiveCard){

        canDefend = true;

        console.log(
            "CPU：他のレジストで防御可能",
            defensiveCard.name
        );

    }

}


        //======================================
        // 他のレジストで防御可能なら温存
        //======================================

        if(canDefend){

            console.log(
                "CPU：キャンセレーション温存",
                "他のレジストで防御可能"
            );

            return null;

        }


        //======================================
        // マギアのコストに応じた確率判定
        //======================================

        const magiaCost =
            Number(magia?.cost ?? 0);

        const probability =
            Math.min(
                100,
                Math.max(
                    0,
                    magiaCost * 20
                )
            );

        const random =
            Math.random() * 100;

        console.log(
            "CPUキャンセレーション確率判定",
            "マギア=",
            magia?.name,
            "コスト=",
            magiaCost,
            "使用確率=",
            probability,
            "乱数=",
            random
        );


        if(random < probability){

            console.log(
                "CPU：キャンセレーション使用",
                magia?.name
            );

            return cancellation;

        }


        console.log(
            "CPU：キャンセレーション温存",
            magia?.name
        );

        return null;

    }


    //======================================
    // 使用可能レジスト確認
    //======================================

    if(
        !cards ||
        cards.length === 0 ||
        damage <= 0
    ){

        return null;

    }


    //======================================
    // サモンダメージ
    //======================================

    if(
        event &&
        event.type ===
            GAME_EVENT.BEFORE_SUMMON_DAMAGE &&
        event.target &&
        event.target.owner === ENEMY
    ){

        //----------------------------------
        // イリュージョンフォグ
        //----------------------------------

        const illusionFogCard =
            cards.find(
                card =>
                    card.effect ===
                        "illusionFog"
            );

        if(illusionFogCard){

            console.log(
                "CPUレジスト候補：イリュージョンフォグ",
                "target=",
                event.target.card.name,
                "damage=",
                damage
            );

        }


        //----------------------------------
        // リキッドヴェール
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

            if(liquidVeilCard){

                const power =
                    getPower(
                        event.target
                    );

                //----------------------------------
                // パワーと同じ
                //----------------------------------

                if(damage === power){

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

                if(damage === power + 1){

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
                //----------------------------------

                if(damage >= power + 2){

                    console.log(
                        "CPUリキッドヴェール使用見送り",
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


    //----------------------------------
    // 1ダメージなら
    // サンドプロテクトを最優先
    //----------------------------------

    if(damage === 1){

        const sandProtectCard =
            cards.find(
                card =>
                    card.effect ===
                        "sandProtect"
            );

        if(sandProtectCard){

            console.log(
                "CPUレジスト最優先：サンドプロテクト"
            );

            return sandProtectCard;

        }

    }


    //======================================
    // 各レジストの軽減量
    //======================================

    function getResistReduction(card){

        if(!card){
            return 0;
        }

        switch(card.effect){

            case "stoneGuard":
                return 3;

            case "groundwall":
                return 5;

            case "liquidVeil":{

                if(
                    event &&
                    event.type ===
                        GAME_EVENT.BEFORE_SUMMON_DAMAGE &&
                    event.target &&
                    event.target.owner === ENEMY &&
                    event.sourceType === "マギア" &&
                    event.source &&
                    event.source.effect &&
                    event.source.effect.type === "damage"
                ){

                    const power =
                        getPower(
                            event.target
                        );

                    if(
                        damage >= power + 2
                    ){

                        console.log(
                            "CPUリキッドヴェール候補除外",
                            "target=",
                            event.target.card.name,
                            "power=",
                            power,
                            "damage=",
                            damage
                        );

                        return 0;

                    }

                }

                return 2;

            }

            case "multiShield": {

    // CPU本体へのダメージの場合のみ
    if(
        event?.type !==
        GAME_EVENT.BEFORE_PLAYER_DAMAGE
    ){
        return 0;
    }

    // マルチシールド以外の手札
    const availableCards =
        enemyHandCards.filter(
            c => c !== card
        ).length;

    // 支払うコストを計算
    const cost =
        getCpuMultiShieldCost(
            damage,
            availableCards
        );

    // 基本コストを払えない場合
    if(
        cost <
        getCurrentCardCost(card, ENEMY)
    ){
        return 0;
    }

    return Math.min(
        damage,
        cost * 2
    );

}

            case "waterBarrier":
                return damage;


        
            case "diamondSkin":
                return damage;


            case "rapidMove":
                return damage;

            case "illusionFog":
                return damage;

            case "sandProtect":

                if(damage === 1){
                    return 1;
                }

                return 0;

            default:
                return 0;

        }

    }


    //======================================
    // 使用可能カードを評価
    //======================================

    const candidates =
        cards
            .map(card => {

                const reduction =
                    getResistReduction(card);

                const remaining =
                    Math.max(
                        0,
                        damage - reduction
                    );

                return {
                    card: card,
                    reduction: reduction,
                    remaining: remaining
                };

            })
            .filter(
                item =>
                    item.reduction > 0
            );


    if(candidates.length === 0){
        return null;
    }


    //======================================
    // 1枚でダメージを0にできるカードを優先
    //======================================

    const finishers =
        candidates.filter(
            item =>
                item.remaining === 0
        );


if(finishers.length > 0){

    finishers.sort((a, b) => {

        // ダイヤスキンは最後に使用する
        const aDiamond =
            a.card.effect === "diamondSkin";

        const bDiamond =
            b.card.effect === "diamondSkin";

        if(aDiamond !== bDiamond){
            return aDiamond ? 1 : -1;
        }

        // それ以外は従来どおり
        // 軽減量が小さいカードを優先
        return a.reduction - b.reduction;

    });

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


    //======================================
    // 1枚で0にできない場合
    // 最も大きく軽減するカード
    //======================================

    candidates.sort(
        (a, b) =>
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
                // 召喚ターン攻撃可能能力
                //----------------------------------

                const canAttackOnSummonTurn =
                    hasSummonAbility(
                        summon,
                        "summonTurnAttack"
                    );


                //----------------------------------
                // 召喚ターンは攻撃不可
                // summonTurnAttackなら例外
                //----------------------------------

                if(
                    !summon.attackReady &&
                    !canAttackOnSummonTurn
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
                //
                // すでに攻撃できるので
                // フォローウィンド対象外
                //----------------------------------

                if(
                    hasSummonAbility(
                        summon,
                        "summonTurnAttack"
                    )
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


function cpuHasMeaningfulAttack(){

    //----------------------------------
    // 現在の攻撃キューを保存
    //----------------------------------

    const oldQueue =
        Array.isArray(cpuAttackQueue)
            ? [...cpuAttackQueue]
            : [];


    const oldIndex =
        cpuAttackIndex;


    //----------------------------------
    // 現在の攻撃キューを作成
    //----------------------------------

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

                //----------------------------------
                // 攻撃者確認
                //----------------------------------

                if(
                    !attacker ||
                    !attacker.card
                ){

                    return false;

                }


                //----------------------------------
                // 攻撃者のパワー
                //----------------------------------

                const attackPower =
                    getPower(
                        attacker
                    );


                //==================================
                // ブロック不可
                //
                // 複数能力対応
                //==================================
                //
                // PLAYERへ直接攻撃できるので
                // 常に意味のある攻撃
                //==================================

                if(
                    hasSummonAbility(
                        attacker,
                        "cannotBeBlocked"
                    )
                ){

                    console.log(
                        "CPU意味ある攻撃：",
                        attacker.card.name,
                        "ブロック不可 → PLAYER攻撃可能"
                    );


                    return true;

                }


                //==================================
                // カーススモーク
                // 横向き対象
                //==================================
                //
                // パワー差に関係なく
                // 1以上のダメージを与えれば
                // クールにできる
                //==================================

                if(
                    attackPower >= 1
                ){

                    const curseSmokeRestingTarget =
                        playerField.some(
                            summon => {

                                //----------------------------------
                                // 基本確認
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
                                // 横向きのみ
                                //----------------------------------

                                if(!summon.isRest){

                                    return false;

                                }


                                //----------------------------------
                                // カーススモーク状態
                                //----------------------------------

                                return (
                                    isCurseSmokeTarget(
                                        summon
                                    )
                                );

                            }
                        );


                    if(
                        curseSmokeRestingTarget
                    ){

                        console.log(
                            "CPU意味ある攻撃：",
                            attacker.card.name,
                            "→ カーススモーク状態の横向きサモンを攻撃可能"
                        );


                        return true;

                    }

                }


                //==================================
                // プレイヤー側の
                // 実際にブロック可能な
                // タテ向きサモン
                //==================================

                const blockers =
                    playerField.filter(
                        summon => {

                            //----------------------------------
                            // 基本確認
                            //----------------------------------

                            if(
                                !summon ||
                                !summon.card
                            ){

                                return false;

                            }


                            //----------------------------------
                            // PLAYERのみ
                            //----------------------------------

                            if(
                                summon.owner !== PLAYER
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
                            // 横向き
                            //----------------------------------

                            if(
                                summon.isRest
                            ){

                                return false;

                            }


                            //----------------------------------
                            // 現在ブロックできない能力
                            //----------------------------------

                            if(
                                typeof isOgreBattleLocked ===
                                    "function" &&
                                isOgreBattleLocked(
                                    summon
                                )
                            ){

                                return false;

                            }


                            return true;

                        }
                    );


                //==================================
                // カーススモーク
                // 唯一の縦向きブロッカー
                //==================================
                //
                // PLAYERへ攻撃
                // ↓
                // カーススモーク対象がブロック
                // ↓
                // 1以上のダメージ
                // ↓
                // クール
                //==================================

                if(
                    attackPower >= 1 &&
                    blockers.length === 1 &&
                    isCurseSmokeTarget(
                        blockers[0]
                    )
                ){

                    console.log(
                        "CPU意味ある攻撃：",
                        attacker.card.name,
                        "→ 唯一のブロッカー",
                        blockers[0].card.name,
                        "がカーススモーク状態"
                    );


                    return true;

                }


                //==================================
                // ブロッカーなし
                //==================================

                if(
                    blockers.length === 0
                ){

                    return true;

                }


                //==================================
                // 攻撃者以上ではない
                // ブロッカーがいるか
                //==================================

                const canBreakBlocker =
                    blockers.some(
                        blocker =>
                            attackPower >=
                            getPower(
                                blocker
                            )
                    );


                if(
                    canBreakBlocker
                ){

                    return true;

                }


                //----------------------------------
                // 全ブロッカーに負ける
                //----------------------------------

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


    //----------------------------------
    // 結果
    //----------------------------------

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
    // 現在の実ダメージ
    //
    // 通常ダメージ
    // マグナブレイズ
    // 火マギアダメージ上昇
    // に対応
    //----------------------------------

    const damageValue =
        getCpuMagiaDamageValue(
            card
        );


    if(damageValue <= 0){

        return null;

    }


    //----------------------------------
    // ウィルオウィスプ確認
    //----------------------------------

    const hasWillOWisp =
        enemyField.some(
            summon =>
                summon &&
                !summon.destroyed &&
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


    //----------------------------------
    // ロックスパイク
    //----------------------------------

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


    //==================================
    // 倒せるサモンだけ取得
    //
    // ドライアド等による
    // ダメージ軽減も考慮する
    //==================================

    const killableSummons =
        playerField.filter(
            summon => {

                //----------------------------------
                // 基本確認
                //----------------------------------

                if(
                    !summon ||
                    !summon.card ||
                    summon.destroyed
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


                //----------------------------------
                // パワー確認
                //----------------------------------

                const power =
                    getPower(
                        summon
                    );


                //----------------------------------
                // ドライアド等を考慮した
                // 予測最終ダメージ
                //----------------------------------

                const expectedDamage =
                    getCpuExpectedMagiaDamage(
                        summon,
                        damageValue
                    );


                console.log(
                    "CPU：サモンダメージ予測",
                    {
                        magia:
                            card.name,

                        target:
                            summon.card.name,

                        power:
                            power,

                        originalDamage:
                            damageValue,

                        expectedDamage:
                            expectedDamage
                    }
                );


                //----------------------------------
                // 最終ダメージ0
                //----------------------------------

                if(expectedDamage <= 0){

                    console.log(
                        "CPU：ダメージマギア対象外",
                        summon.card.name,
                        "軽減後ダメージ0"
                    );


                    return false;

                }


                //----------------------------------
                // 軽減後ダメージで倒せない
                //----------------------------------

                if(
                    power >
                    expectedDamage
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


    //==================================
    // 優先順位に従って選択
    //==================================

    for(
        const rule of priority
    ){


        //----------------------------------
        // 倒せる中で
        // 一番パワーが高いサモン
        //----------------------------------

        if(
            rule ===
            "highestKillable"
        ){

            if(
                killableSummons.length > 0
            ){

                const targets =
                    [...killableSummons].sort(
                        (a,b) =>
                            getPower(b) -
                            getPower(a)
                    );


                console.log(
                    "CPU：ダメージマギア対象",
                    card.name,
                    "→ 最大パワー撃破",
                    targets[0].card.name,
                    "power=",
                    getPower(
                        targets[0]
                    )
                );


                return targets[0];

            }

        }


        //----------------------------------
        // ドラゴン
        //----------------------------------

        if(
            rule ===
            "dragon"
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
                    (a,b) =>
                        getPower(b) -
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
            rule ===
            "power3to5"
        ){

            const targets =
                killableSummons.filter(
                    summon => {

                        const power =
                            getPower(
                                summon
                            );


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
                    (a,b) =>
                        getPower(b) -
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
            rule ===
            "power3"
        ){

            const targets =
                killableSummons.filter(
                    summon =>
                        getPower(
                            summon
                        ) === 3
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
            rule ===
            "power2"
        ){

            const targets =
                killableSummons.filter(
                    summon =>
                        getPower(
                            summon
                        ) === 2
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
            rule ===
            "power1"
        ){

            const targets =
                killableSummons.filter(
                    summon =>
                        getPower(
                            summon
                        ) === 1
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


        //==================================
        // PLAYER
        //
        // ガーゴイル等による
        // ダメージ軽減を考慮する
        //==================================

        if(
            rule ===
            "player"
        ){

            //----------------------------------
            // このマギアが
            // PLAYERを対象にできるか確認
            //----------------------------------

            if(
                !card.effect.target.includes(
                    "enemy"
                )
            ){

                continue;

            }


            //----------------------------------
            // ガーゴイル等を考慮した
            // 予測最終ダメージ
            //----------------------------------

            const expectedDamage =
                getCpuExpectedMagiaDamage(
                    PLAYER,
                    damageValue
                );


            console.log(
                "CPU：PLAYERマギアダメージ予測",
                {
                    magia:
                        card.name,

                    originalDamage:
                        damageValue,

                    expectedDamage:
                        expectedDamage
                }
            );


            //----------------------------------
            // 0ダメージなら使用しない
            //----------------------------------

            if(expectedDamage <= 0){

                console.log(
                    "CPU：PLAYERを対象外",
                    card.name,
                    "軽減後ダメージ0"
                );


                continue;

            }


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


    //==================================
    // ケートス等
    // サモン属性プレイ制限
    //==================================

    if(
        !canPlaySummonByElementRestriction(
            ENEMY,
            card
        )
    ){

        console.log(
            "CPUポイント評価：サモン候補外",
            card.name,
            "属性プレイ制限",
            "element=",
            card.elementType
        );


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

//==================================================
// CPU：手札戻しマギア評価
//
// トルネード等
//==================================================

function getCpuReturnToHandMagiaScore(
    card,
    target
){

    //----------------------------------
    // 対象確認
    //----------------------------------

    if(
        !card ||
        !card.effect ||
        !target ||
        !target.card
    ){

        return 0;

    }


    //----------------------------------
    // 手札戻し効果以外
    //----------------------------------

    if(
        card.effect.type !==
            "returnToHand"
    ){

        return 0;

    }


    //----------------------------------
    // 相手サモン以外は
    // 現在のCPU評価では対象外
    //----------------------------------

    if(
        target.owner !==
            PLAYER
    ){

        return 0;

    }


    //----------------------------------
    // 対象パワー
    //----------------------------------

    const targetPower =
        getPower(
            target
        );


    //----------------------------------
    // 基本評価
    //
    // サモン1体を場から除去できること自体に価値
    //----------------------------------

    let score =
        20;


    //----------------------------------
    // 高パワーほど価値を上げる
    //----------------------------------

    score +=
        targetPower * 10;


    //==================================
    // 通常攻撃で処理できるか確認
    //
    // ヨコ向きサモンなので、
    // CPUの攻撃可能サモンで
    // パワー以上の攻撃が可能なら
    // トルネードを使う価値を下げる
    //==================================

    const canDestroyByAttack =
        enemyField.some(
            attacker => {

                //----------------------------------
                // 基本確認
                //----------------------------------

                if(
                    !attacker ||
                    attacker.destroyed
                ){

                    return false;

                }


                //----------------------------------
                // ヨコ向きは攻撃不可
                //----------------------------------

                if(
                    attacker.isRest
                ){

                    return false;

                }


                //----------------------------------
                // 攻撃可能か
                //----------------------------------

                let canAttack =
                    attacker.attackReady;


                //----------------------------------
                // 召喚ターン攻撃能力
                //----------------------------------

                if(
                    !canAttack &&
                    hasSummonAbility(
                        attacker,
                        "summonTurnAttack"
                    )
                ){

                    canAttack =
                        true;

                }


                //----------------------------------
                // 攻撃不可
                //----------------------------------

                if(
                    !canAttack
                ){

                    return false;

                }


                //----------------------------------
                // メドゥーサ等により
                // 召喚ターン攻撃を封じられている
                //----------------------------------

                if(
                    typeof isSummonTurnAttackPrevented ===
                        "function" &&
                    isSummonTurnAttackPrevented(
                        attacker
                    )
                ){

                    if(
                        !attacker.attackReady
                    ){

                        return false;

                    }

                }


                //----------------------------------
                // オーガ系の戦闘制限
                //----------------------------------

                if(
                    typeof isOgreBattleLocked ===
                        "function" &&
                    isOgreBattleLocked(
                        attacker
                    )
                ){

                    return false;

                }


                //----------------------------------
                // パワー比較
                //----------------------------------

                return (
                    getPower(
                        attacker
                    ) >=
                    targetPower
                );

            }
        );


    //==================================
    // 攻撃で倒せる
    //==================================

    if(
        canDestroyByAttack
    ){

        //----------------------------------
        // 攻撃で処理可能なので
        // トルネードの優先度を大きく下げる
        //----------------------------------

        score -=
            40;


        console.log(
            "CPU：手札戻し評価",
            card.name,
            "対象=",
            target.card?.name,
            "power=",
            targetPower,
            "攻撃処理可能",
            "score=",
            score
        );

    }


    //==================================
    // 攻撃で倒せない
    //==================================

    else{

        //----------------------------------
        // 攻撃では処理できない相手を
        // 一時的に除去できるので高評価
        //----------------------------------

        score +=
            40;


        console.log(
            "CPU：手札戻し評価",
            card.name,
            "対象=",
            target.card?.name,
            "power=",
            targetPower,
            "攻撃処理不可",
            "score=",
            score
        );

    }


    //----------------------------------
    // 最低0点
    //----------------------------------

    return Math.max(
        0,
        score
    );

}

//======================================
// CPU：マギアの使用予定コスト取得
//======================================

function getCpuPlannedMagiaCost(
    card,
    target = null
){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(!card){

        return 0;

    }


    //----------------------------------
    // 通常の現在コスト
    //----------------------------------

    let cost =
        getCurrentCardCost(
            card,
            ENEMY
        );


    //----------------------------------
    // 対象によるコスト軽減なし
    //----------------------------------

    if(
        !target ||
        !card.effect ||
        !card.effect.costDownElement ||
        !card.effect.costDownValue
    ){

        return cost;

    }


    //----------------------------------
    // 対象属性取得
    //----------------------------------

    const targetElement =
        target.elementType ??
        target.element ??
        target.card?.elementType ??
        target.card?.element ??
        null;


    //----------------------------------
    // 指定属性なら軽減
    //----------------------------------

    if(
        targetElement ===
        card.effect.costDownElement
    ){

        const reduction =
            Number(
                card.effect.costDownValue
            ) || 0;


        cost =
            Math.max(
                0,
                cost - reduction
            );


        console.log(
            "CPU：対象によるマギアコスト軽減",
            {
                card:
                    card.name,

                target:
                    target.name ??
                    target.card?.name,

                targetElement:
                    targetElement,

                reduction:
                    reduction,

                finalCost:
                    cost
            }
        );

    }


    return cost;

}

//======================================
// CPU：オブリビオンレイン使用判定
//======================================

function cpuShouldUseOblivionRain(){

    //----------------------------------
    // オブリビオンレインを使用する
    // PLAYERサモン
    //----------------------------------

    const targetSummonIds = [
        3,      // フェニックス
        20,     // クラーケン
        25,     // ノーム
        26,     // バジリスク
        27,     // ガーゴイル
        28,     // ゴーレム
        34,     // ファイアドレイク
        49,     // マーフォーク
        52,     // シーサーペント
        57,     // マンドラゴラ
        59,     // ワーム
        60,     // トロール
        65,     // ミノタウロス
        66,     // ケルベロス
        81,     // ネレイド
        82,     // カリュブディス
        90,     // ドライアド
        91      // メデゥーサ
    ];


    //----------------------------------
    // PLAYERの場を確認
    //----------------------------------

    const targetSummon =
        playerField.find(
            summon => {

                if(
                    !summon ||
                    !summon.card ||
                    summon.destroyed
                ){

                    return false;

                }


                const cardId =
                    Number(
                        summon.card.id
                    );


                return (
                    targetSummonIds.includes(
                        cardId
                    )
                );

            }
        );


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(!targetSummon){

        return false;

    }


    //----------------------------------
    // 使用条件成立
    //----------------------------------

    console.log(
        "CPU：オブリビオンレイン使用条件成立",
        {
            summon:
                targetSummon.card.name,

            id:
                targetSummon.card.id
        }
    );


    return true;

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
    // CPUでは使用しないマギア
    //----------------------------------

    if(
        card.effect?.type ===
            "revealEnemyHand"
    ){

        console.log(
            "CPUポイント評価：マギア候補外",
            card.name,
            "CPU使用対象外"
        );

        return null;

    }

        //==================================
    // オブリビオンレイン
    //==================================

    if(
        card.effect?.type ===
            "disableEnemySummonAbilities"
    ){

        if(
            !cpuShouldUseOblivionRain()
        ){

            console.log(
                "CPUポイント評価：マギア候補外",
                card.name,
                "オブリビオンレイン使用条件なし"
            );

            return null;

        }

    }

    //==================================
// アースクェイク専用使用条件
//
// PLAYERサモンを1体以上
// 破壊できる場合のみ使用候補にする
//==================================

if(
    card.effect?.type ===
        "damageAllEnemySummons"
){

    //----------------------------------
    // アースクェイクのダメージ
    //----------------------------------

    const earthquakeDamage =
        Number(
            card.effect?.value
        ) || 0;


    //----------------------------------
    // 破壊可能なPLAYERサモンがいるか
    //----------------------------------

    const canDestroySummon =
        playerField.some(
            summon => {

                if(
                    !summon ||
                    summon.destroyed
                ){
                    return false;
                }


                //----------------------------------
                // 現在パワー
                //----------------------------------

                const power =
                    getPower(
                        summon
                    );


                //----------------------------------
                // 現在受けているダメージ
                //----------------------------------

                const currentDamage =
                    Number(
                        summon.damage
                    ) || 0;


                //----------------------------------
                // アースクェイク後の
                // 合計ダメージ
                //----------------------------------

                const afterDamage =
                    currentDamage +
                    earthquakeDamage;


                console.log(
                    "CPU：アースクェイク破壊判定",
                    summon.card?.name,
                    "power=",
                    power,
                    "currentDamage=",
                    currentDamage,
                    "earthquakeDamage=",
                    earthquakeDamage,
                    "afterDamage=",
                    afterDamage
                );


                //----------------------------------
                // 破壊可能
                //----------------------------------

                return (
                    afterDamage >=
                    power
                );

            }
        );


    //----------------------------------
    // 1体も破壊できない
    //----------------------------------

    if(!canDestroySummon){

        console.log(
            "CPUポイント評価：マギア候補外",
            card.name,
            "アースクェイクで破壊可能なサモンなし"
        );

        return null;

    }


    //----------------------------------
    // 1体以上破壊可能
    //----------------------------------

    console.log(
        "CPU：アースクェイク使用条件成立",
        "破壊可能なPLAYERサモンあり"
    );

}


//==================================
// インフェルノ専用使用条件
//
// PLAYERのコスト3以上のサモンにのみ使用
//==================================

let infernoTarget =
    null;


if(
    card.effect?.type ===
        "sendSummonToCool"
){

    //----------------------------------
    // コスト3以上のPLAYERサモン
    //----------------------------------

    const infernoTargets =
        playerField.filter(
            summon => {

                if(
                    !summon ||
                    summon.destroyed ||
                    !summon.card
                ){

                    return false;

                }


                const summonCost =
                    Number(
                        summon.card.cost
                    ) || 0;


                return (
                    summonCost >= 3
                );

            }
        );


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(
        infernoTargets.length === 0
    ){

        console.log(
            "CPUポイント評価：マギア候補外",
            card.name,
            "コスト3以上のPLAYERサモンなし"
        );

        return null;

    }


    //----------------------------------
    // 対象決定
    //
    // 最もコストが高いサモンを優先
    //----------------------------------

    infernoTargets.sort(
        (a, b) => {

            const costA =
                Number(
                    a.card?.cost
                ) || 0;

            const costB =
                Number(
                    b.card?.cost
                ) || 0;

            return costB - costA;

        }
    );


    infernoTarget =
        infernoTargets[0];


    console.log(
        "CPU：インフェルノ使用条件成立",
        {
            target:
                infernoTarget.card?.name,

            cost:
                infernoTarget.card?.cost
        }
    );

}


    //----------------------------------
    // 現在コスト
    //----------------------------------

    let currentCost =
        getCurrentCardCost(
            card,
            ENEMY
        );


let costCheckTarget =
    null;


//==================================
// 対象によってコストが変わるマギア
//
// クレイクリエイト
// クイックアクション
//==================================

if(
    Array.isArray(
        card.effect?.target
    )
){

    //----------------------------------
    // クレイクリエイト
    //----------------------------------

    if(
        card.effect.type ===
            "playSummonFromCool" &&
        card.effect.target.includes(
            "playerCoolSummon"
        )
    ){

        //----------------------------------
        // 先に対象を決定
        //----------------------------------

        costCheckTarget =
            selectCpuCoolSummonTarget(
                card
            );


        //----------------------------------
        // 対象なし
        //----------------------------------

        if(!costCheckTarget){

            console.log(
                "CPUポイント評価：マギア候補外",
                card.name,
                "クールゾーンに対象なし"
            );

            return null;

        }

    }


    //----------------------------------
    // クイックアクション
    //----------------------------------

    else if(
        card.effect.type ===
            "readySummon" &&
        card.effect.target.includes(
            "horizontalSummon"
        )
    ){

        //----------------------------------
        // selectCpuMagiaTarget()で
        // CPU自身のヨコ向きサモンを選択
        //----------------------------------

        costCheckTarget =
            selectCpuMagiaTarget(
                card
            );


        //----------------------------------
        // 対象なし
        //----------------------------------

        if(!costCheckTarget){

            console.log(
                "CPUポイント評価：マギア候補外",
                card.name,
                "ヨコ向きサモンに対象なし"
            );

            return null;

        }

    }


    //----------------------------------
    // 対象が先に決まった場合
    // 対象を考慮したコストを計算
    //----------------------------------

    if(costCheckTarget){

        currentCost =
            getCpuPlannedMagiaCost(
                card,
                costCheckTarget
            );


        console.log(
            "CPU：対象決定後マギアコスト",
            {
                card:
                    card.name,

                target:
                    costCheckTarget.name ??
                    costCheckTarget.card?.name,

                targetElement:
                    costCheckTarget.elementType ??
                    costCheckTarget.element ??
                    costCheckTarget.card?.elementType ??
                    costCheckTarget.card?.element,

                currentCost:
                    currentCost
            }
        );

    }

}

    //==================================
    // コスト支払い可能確認
    //==================================

    const availableCostCards =
        enemyHandCards.filter(
            handCard =>
                handCard !== card
        ).length;


    if(
        availableCostCards <
        currentCost
    ){

        console.log(
            "CPUポイント評価：マギア候補外",
            card.name,
            "コスト不足",
            {
                required:
                    currentCost,

                available:
                    availableCostCards
            }
        );

        return null;

    }


    //======================================
    // ライフコスト確認
    //
    // ソウルバーン等
    //
    // ライフコストを支払った時点で
    // CPUのライフが0以下になる場合は
    // 効果より先にCPUが敗北するため
    // 使用候補から除外する
    //======================================

    const lifeCost =
        Number(
            card.effect?.lifeCost
        ) || 0;


    if(
        lifeCost > 0 &&
        game.enemyLife <= lifeCost
    ){

        console.log(
            "CPUポイント評価：マギア候補外",
            card.name,
            "ライフコストで敗北",
            "CPU LIFE=",
            game.enemyLife,
            "lifeCost=",
            lifeCost
        );


        return null;

    }


    //======================================
    // 自分サモンパワー参照型
    //
    // イグナイト等
    //
    // ダメージ対象と
    // クールへ送る自分サモンを
    // セットで決定する
    //======================================

    let ownSummonPowerPlan =
        null;


    if(
        card.effect?.type ===
            "damage" &&
        card.effect?.valueType ===
            "ownSummonPower"
    ){

        ownSummonPowerPlan =
            createCpuOwnSummonPowerDamagePlan(
                card
            );


        if(!ownSummonPowerPlan){

            console.log(
                "CPUポイント評価：マギア候補外",
                card.name,
                "パワー参照プランなし"
            );

            return null;

        }

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
    // ダメージマギア判定
    //----------------------------------

    const isDamageMagia =
        card.effect &&
        card.effect.type ===
            "damage";


    //==================================
    // 現在の実ダメージ
    //
    // ・通常ダメージ
    // ・マグナブレイズ
    // ・イグナイト
    // ・火マギアダメージ上昇
    //
    // に対応
    //==================================

    const damageValue =
        isDamageMagia
            ?
            (
                ownSummonPowerPlan
                    ?
                    ownSummonPowerPlan.damage
                    :
                    getCpuMagiaDamageValue(
                        card
                    )
            )
            :
            0;


    //----------------------------------
    // 必殺条件
    //----------------------------------

    const isPlayerLethal =
        isDamageMagia &&
        playerHandCount <= 1 &&
        damageValue >=
            game.playerLife;


    //----------------------------------
    // 通常の手札温存
    //----------------------------------

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

    let aquaStreamInfo =
        null;


    if(
        card.name ===
        "アクアストリーム"
    ){

        aquaStreamInfo =
            cpuShouldUseAquaStream();


        if(!aquaStreamInfo){

            console.log(
                "CPUポイント評価：アクアストリーム候補外"
            );

            return null;

        }

    }


    //======================================
    // ウィンドプレッシャー専用条件
    //======================================

    if(
        card.name ===
        "ウィンドプレッシャー"
    ){

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
    // カーススモーク専用使用判定
    //======================================

    let curseSmokePlan =
        null;


    if(
        card.effect?.type ===
        "curseSmoke"
    ){

        curseSmokePlan =
            cpuGetCurseSmokePlan(
                card
            );


        if(!curseSmokePlan){

            console.log(
                "CPUポイント評価：カーススモーク候補外",
                "有効な使用条件なし"
            );

            return null;

        }

    }


//======================================
// 対象取得
//======================================

let target;


//======================================
// インフェルノ
//======================================

if(
    infernoTarget
){

    target =
        infernoTarget;


    console.log(
        "CPU：インフェルノ対象決定",
        target.card?.name,
        "cost=",
        target.card?.cost
    );

}


//======================================
// アクアストリーム
//======================================

else if(
    card.name ===
        "アクアストリーム"
){

        const targets =
            aquaStreamInfo.targets;


        if(
            !targets ||
            targets.length === 0
        ){

            console.log(
                "CPU：アクアストリーム対象なし"
            );

            return null;

        }


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
    // カーススモーク
    //======================================

    else if(
        curseSmokePlan
    ){

        target =
            curseSmokePlan.target;


        console.log(
            "================================"
        );

        console.log(
            "CPU：カーススモーク対象決定"
        );

        console.log(
            "対象=",
            target.card?.name
        );

        console.log(
            "パワー=",
            getPower(
                target
            )
        );

        console.log(
            "計画=",
            curseSmokePlan.type
        );

        console.log(
            "================================"
        );

    }


    //======================================
    // 自分サモンパワー参照型
    //
    // イグナイト等
    //======================================

    else if(
        ownSummonPowerPlan
    ){

        target =
            ownSummonPowerPlan.target;


        console.log(
            "CPU：パワー参照マギア対象決定",
            card.name,
            "target=",
            target === PLAYER
                ?
                "PLAYER"
                :
                target?.card?.name,
            "ownSummon=",
            ownSummonPowerPlan
                .ownSummon
                .card?.name,
            "damage=",
            ownSummonPowerPlan.damage
        );

    }


    //======================================
    // 通常マギア
    //======================================

    else{

        //----------------------------------
        // コスト判定時に対象を決定済み
        //
        // クレイクリエイト等
        //----------------------------------

        if(costCheckTarget){

            target =
                costCheckTarget;


            console.log(
                "CPU：コスト判定時の対象を使用",
                {
                    card:
                        card.name,

                    target:
                        target.name ??
                        target.card?.name,

                    element:
                        target.elementType ??
                        target.element ??
                        target.card?.elementType ??
                        target.card?.element,

                    cost:
                        currentCost
                }
            );

        }


        //----------------------------------
        // 通常の対象選択
        //----------------------------------

        else{

            target =
                selectCpuMagiaTarget(
                    card
                );

        }

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
    // パワー参照用サモン保存
    //
    // イグナイト等
    //==================================

    if(
        ownSummonPowerPlan
    ){

        action.ownSummon =
            ownSummonPowerPlan
                .ownSummon;

    }


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

    addCpuActionPoints(
        action,
        currentCost * 3,
        "マギアコスト評価"
    );

        //==================================
    // クールゾーンからサモンを場に出す
    //==================================

    if(
        card.effect?.type ===
            "playSummonFromCool" &&
        target &&
        target.type ===
            "サモン"
    ){

        //----------------------------------
        // 対象サモンのパワー
        //----------------------------------

        const summonPower =
            Number(
                target.power
            ) || 0;


        //----------------------------------
        // 基本評価
        //----------------------------------

        addCpuActionPoints(
            action,
            20,
            "クールサモン復帰"
        );


        //----------------------------------
        // パワー評価
        //----------------------------------

        addCpuActionPoints(
            action,
            summonPower * 10,
            "復帰サモンパワー"
        );


        //----------------------------------
        // コスト軽減評価
        //----------------------------------

        const targetElement =
            target.elementType ??
            target.element ??
            null;


        if(
            card.effect.costDownElement &&
            targetElement ===
                card.effect.costDownElement
        ){

            const reduction =
                Number(
                    card.effect.costDownValue
                ) || 0;


            addCpuActionPoints(
                action,
                reduction * 10,
                "対象によるコスト軽減"
            );

        }


        console.log(
            "CPU：クールサモン復帰評価",
            {
                magia:
                    card.name,

                target:
                    target.name,

                power:
                    summonPower,

                element:
                    targetElement,

                cost:
                    currentCost,

                score:
                    action.score
            }
        );

    }

//==================================
// ヨコ向きサモンをタテ向きにする
// クイックアクション等
//==================================

if(
    card.effect?.type ===
        "readySummon" &&
    target &&
    target.card &&
    target.owner === ENEMY &&
    target.isRest
){

    //----------------------------------
    // 対象パワー
    //----------------------------------

    const targetPower =
        getPower(
            target
        );


    //----------------------------------
    // タテ向きにしたあと
    // 攻撃できるか確認
    //----------------------------------

    const canAttackAfterReady =
        target.attackReady === true ||
        hasSummonAbility(
            target,
            "summonTurnAttack"
        );


    //----------------------------------
    // 攻撃できない場合
    //----------------------------------

    if(!canAttackAfterReady){

        addCpuActionPoints(
            action,
            -100,
            "タテ向きにしても攻撃不可"
        );

    }


    //----------------------------------
    // 再攻撃できる場合
    //----------------------------------

    else{

        //----------------------------------
        // 基本評価
        //----------------------------------

        addCpuActionPoints(
            action,
            30,
            "再攻撃可能"
        );


        //----------------------------------
        // パワー評価
        //----------------------------------

        addCpuActionPoints(
            action,
            targetPower * 10,
            "再攻撃サモンパワー"
        );


        //----------------------------------
        // 対象属性
        //----------------------------------

        const targetElement =
            target.card?.elementType ??
            target.card?.element ??
            null;


        //----------------------------------
        // コスト軽減対象なら評価
        //----------------------------------

        if(
            card.effect.costDownElement &&
            targetElement ===
                card.effect.costDownElement
        ){

            const reduction =
                Number(
                    card.effect.costDownValue
                ) || 0;


            addCpuActionPoints(
                action,
                reduction * 10,
                "対象によるコスト軽減"
            );

        }

    }


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "CPU：タテ向き変更マギア評価",
        {
            magia:
                card.name,

            target:
                target.card?.name,

            power:
                targetPower,

            attackReady:
                target.attackReady,

            canAttackAfterReady:
                canAttackAfterReady,

            cost:
                currentCost,

            points:
                action.points
        }
    );

}


    //==================================
// ★追加
// 手札戻しマギア評価
//
// トルネード等
//==================================

if(
    card.effect?.type ===
        "returnToHand" &&
    target &&
    target.card
){

    const returnToHandScore =
        getCpuReturnToHandMagiaScore(
            card,
            target
        );


    addCpuActionPoints(
        action,
        returnToHandScore,
        "手札戻しマギア"
    );

}


    //==================================
    // カーススモーク評価
    //==================================

    if(
        card.effect?.type ===
            "curseSmoke" &&
        curseSmokePlan
    ){

        addCpuActionPoints(
            action,
            curseSmokePlan.score,
            "カーススモーク戦術"
        );


        addCpuActionPoints(
            action,
            getPower(
                curseSmokePlan.target
            ) * 5,
            "カーススモーク対象パワー"
        );


        console.log(
            "CPU：カーススモーク評価",
            "計画=",
            curseSmokePlan.type,
            "対象=",
            curseSmokePlan.target
                .card?.name,
            "power=",
            getPower(
                curseSmokePlan.target
            ),
            "戦術点=",
            curseSmokePlan.score
        );

    }

//==================================
// 自分サモンをクールへ送るデメリット
//
// イグナイト等
//==================================

if(
    card.effect?.coolOwnSummon === true &&
    ownSummonPowerPlan?.ownSummon
){

    const lostSummon =
        ownSummonPowerPlan.ownSummon;


    const lostPower =
        getPower(
            lostSummon
        );


    //----------------------------------
    // 基本減点
    //
    // サモン1体を失うこと自体を
    // 大きなデメリットとして扱う
    //----------------------------------

    let penalty =
        60;


    //----------------------------------
    // 継続能力を持つサモンなら
    // さらに失いたくない
    //----------------------------------

    const abilities =
        getSummonAbilities(
            lostSummon
        );


    if(
        abilities.length > 0
    ){

        penalty +=
            20;

    }


    //----------------------------------
    // 評価へ反映
    //----------------------------------

    addCpuActionPoints(
        action,
        -penalty,
        "自分サモンを失う"
    );


    console.log(
        "CPU：自分サモンクール評価",
        {
            magia:
                card.name,

            summon:
                lostSummon.card?.name,

            power:
                lostPower,

            abilityCount:
                abilities.length,

            penalty:
                penalty
        }
    );

}



    //==================================
    // カード別基本評価
    //==================================

    switch(card.name){

        case "ファイアボール":

            addCpuActionPoints(
                action,
                20,
                "ファイアボール"
            );

            break;


        case "パイロフレイム":

            addCpuActionPoints(
                action,
                30,
                "パイロフレイム"
            );

            break;


        case "エクスプロジア":

            addCpuActionPoints(
                action,
                10,
                "エクスプロジア"
            );

            break;


        case "アクアストリーム":

            addCpuActionPoints(
                action,
                25,
                "アクアストリーム"
            );

            break;


        case "フォローウィンド":

            addCpuActionPoints(
                action,
                20,
                "フォローウィンド"
            );

            break;


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
//
// ガーゴイル・ドライアド等による
// 軽減後の予測最終ダメージで評価
//==================================

if(
    card.effect &&
    card.effect.type ===
        "damage"
){

    //----------------------------------
    // 元ダメージ
    //----------------------------------

    const damage =
        ownSummonPowerPlan
            ?
            ownSummonPowerPlan.damage
            :
            getCpuMagiaDamageValue(
                card
            );


    //----------------------------------
    // 対象への予測最終ダメージ
    //----------------------------------

    const expectedDamage =
        ownSummonPowerPlan &&
        typeof ownSummonPowerPlan.expectedDamage ===
            "number"
            ?
            ownSummonPowerPlan.expectedDamage
            :
            getCpuExpectedMagiaDamage(
                target,
                damage
            );


    console.log(
        "CPU：ダメージマギア評価",
        {
            magia:
                card.name,

            target:
                (
                    target === PLAYER ||
                    target === "player"
                )
                    ?
                    "PLAYER"
                    :
                    target?.card?.name,

            originalDamage:
                damage,

            expectedDamage:
                expectedDamage
        }
    );


    //======================================
    // ライフコスト評価
    //======================================

    if(
        lifeCost > 0
    ){

        let lifeCostPenalty =
            lifeCost * 10;


        //----------------------------------
        // 支払い後の残りライフ
        //----------------------------------

        const remainingLife =
            game.enemyLife -
            lifeCost;


        //----------------------------------
        // 残りライフが少ないほど
        // 使用を慎重にする
        //----------------------------------

        if(
            remainingLife === 1
        ){

            lifeCostPenalty +=
                40;

        }
        else if(
            remainingLife === 2
        ){

            lifeCostPenalty +=
                20;

        }


        addCpuActionPoints(
            action,
            -lifeCostPenalty,
            "ライフコスト"
        );


        console.log(
            "CPU：ライフコスト評価",
            card.name,
            "現在LIFE=",
            game.enemyLife,
            "支払い=",
            lifeCost,
            "支払い後=",
            remainingLife,
            "減点=",
            lifeCostPenalty
        );

    }


    //==================================
    // PLAYERへの直接ダメージ
    //==================================

    if(
        target === PLAYER ||
        target === "player"
    ){

        //----------------------------------
        // 軽減後ダメージで評価
        //----------------------------------

        addCpuActionPoints(
            action,
            expectedDamage * 10,
            "PLAYERへのダメージ"
        );


        //----------------------------------
        // 必殺ダメージ
        //----------------------------------

        const playerLife =
            game.playerLife;


        if(
            expectedDamage >=
            playerLife
        ){

            const playerHandCount =
                board.handCards.length;


            let finishingBonus =
                0;


            if(
                playerHandCount <= 1
            ){

                finishingBonus =
                    1000;

            }
            else if(
                playerHandCount === 2
            ){

                finishingBonus =
                    80;

            }
            else if(
                playerHandCount === 3
            ){

                finishingBonus =
                    50;

            }
            else if(
                playerHandCount === 4
            ){

                finishingBonus =
                    30;

            }
            else if(
                playerHandCount === 5
            ){

                finishingBonus =
                    20;

            }
            else{

                finishingBonus =
                    0;

            }


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
                "元ダメージ=",
                damage,
                "軽減後ダメージ=",
                expectedDamage,
                "PLAYER手札=",
                playerHandCount,
                "追加点=",
                finishingBonus
            );

        }

    }


    //==================================
    // サモンへのダメージ
    //==================================

    else if(
        target &&
        target.card
    ){

        const targetPower =
            getPower(
                target
            );


        //----------------------------------
        // 軽減後ダメージで
        // 破壊可能か判定
        //----------------------------------

        if(
            expectedDamage >=
            targetPower
        ){

            addCpuActionPoints(
                action,
                50,
                "サモン破壊可能"
            );

        }


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

                    //----------------------------------
                    // 基本確認
                    //----------------------------------

                    if(
                        !summon ||
                        summon.destroyed
                    ){

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
                    // オーガ系の戦闘制限
                    //----------------------------------

                    if(
                        typeof isOgreBattleLocked ===
                            "function" &&
                        isOgreBattleLocked(
                            summon
                        )
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
                    // 召喚ターン攻撃可能
                    //
                    // 複数能力対応
                    //----------------------------------

                    if(
                        hasSummonAbility(
                            summon,
                            "summonTurnAttack"
                        )
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


            let createsNewVerticalAttack =
                false;


            let createsNewHorizontalAttack =
                false;


            //----------------------------------
            // 攻撃可能サモンごとに確認
            //----------------------------------

            for(
                const attacker
                of attackableSummons
            ){

                const currentPower =
                    getPower(
                        attacker
                    );


                const boostedPower =
                    currentPower + 2;


                for(
                    const target
                    of enemyTargets
                ){

                    const targetPower =
                        getPower(
                            target
                        );


                    const canKillBefore =
                        currentPower >=
                        targetPower;


                    const canKillAfter =
                        boostedPower >=
                        targetPower;


                    if(
                        !canKillBefore &&
                        canKillAfter
                    ){

                        //----------------------------------
                        // ヨコ向き
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
                        // タテ向き
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


            if(
                createsNewVerticalAttack
            ){

                addCpuActionPoints(
                    action,
                    50,
                    "バーニングエナジーで新規タテ向き撃破"
                );

            }


            if(
                createsNewHorizontalAttack
            ){

                addCpuActionPoints(
                    action,
                    30,
                    "バーニングエナジーで新規ヨコ向き撃破"
                );

            }


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

        const handCount =
            board.handCards.length;


        let handValue =
            0;


        if(
            handCount === 1
        ){

            handValue =
                30;

        }
        else if(
            handCount === 2
        ){

            handValue =
                70;

        }
        else if(
            handCount === 3
        ){

            handValue =
                30;

        }
        else if(
            handCount === 4
        ){

            handValue =
                10;

        }


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
    // 火マギアダメージ上昇とのコンボ
    //==================================

    if(
        card.type === "マギア" &&
        card.elementType === "火" &&
        card.effect?.type === "damage"
    ){

        const hasFireMagiaDamageUp =
            enemyField.some(
                summon => {

                    if(
                        !summon ||
                        summon.destroyed
                    ){

                        return false;

                    }


                    return !!getSummonAbility(
                        summon,
                        "fireMagiaDamageUp"
                    );

                }
            );


        if(
            hasFireMagiaDamageUp
        ){

            addCpuActionPoints(
                action,
                30,
                "火マギアダメージ上昇とのコンボ"
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
                isDragonOrKraken(
                    target
                )
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
        "ownSummon=",
        action.ownSummon
            ?.card?.name ||
            null,
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
    // 破壊済み
    //----------------------------------

    if(attacker.destroyed){

        return null;

    }


    //----------------------------------
    // 横向きなら攻撃不可
    //----------------------------------

    if(
        attacker.isRest
    ){

        return null;

    }


    //----------------------------------
    // 召喚ターン攻撃制限
    //
    // summonTurnAttackなら例外
    //
    // 複数能力対応
    //----------------------------------

    if(
        !attacker.attackReady &&
        !hasSummonAbility(
            attacker,
            "summonTurnAttack"
        )
    ){

        return null;

    }


    //----------------------------------
    // オーガ系の戦闘制限
    //----------------------------------

    if(
        typeof isOgreBattleLocked ===
            "function" &&
        isOgreBattleLocked(
            attacker
        )
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


                if(summon.destroyed){

                    return false;

                }


                if(
                    summon.isRest
                ){

                    return false;

                }


                //----------------------------------
                // オーガ系で現在ブロック不可
                //----------------------------------

                if(
                    typeof isOgreBattleLocked ===
                        "function" &&
                    isOgreBattleLocked(
                        summon
                    )
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


    //==================================================
    // ブロック不可
    //
    // ブロッカーがいてもPLAYERを攻撃可能
    //
    // 複数能力対応
    //==================================================

    if(
        hasSummonAbility(
            attacker,
            "cannotBeBlocked"
        )
    ){

        target =
            PLAYER;

    }


    //==================================================
    // 通常
    //==================================================

    else if(
        blockers.length > 0
    ){

        //----------------------------------
        // 倒せるブロッカー
        //----------------------------------

        const killable =
            blockers.filter(
                blocker =>
                    attackPower >=
                    getPower(
                        blocker
                    )
            );


        if(
            killable.length > 0
        ){

            //----------------------------------
            // 一番パワーが高いものを攻撃
            //----------------------------------

            killable.sort(
                (a,b) =>
                    getPower(b) -
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


        //----------------------------------
        // ブロック不可
        //
        // 複数能力対応
        //----------------------------------

        if(
            hasSummonAbility(
                attacker,
                "cannotBeBlocked"
            )
        ){

            addCpuActionPoints(
                action,
                20,
                "ブロック不可"
            );

        }

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
        "summonTurnAttack=",
        hasSummonAbility(
            attacker,
            "summonTurnAttack"
        ),
        "cannotBeBlocked=",
        hasSummonAbility(
            attacker,
            "cannotBeBlocked"
        ),
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
//
// ジャックフロスト等の
// プレイ枚数上限も確認
//==================================

if(
    canPlayCardByLimit(
        ENEMY
    )
){

    const summonActions =
        createCpuSummonActions();


    actions.push(
        ...summonActions
    );

}
else{

    console.log(
        "CPU：サモン候補を作成しない",
        "カードプレイ枚数上限",
        getCardPlayCount(
            ENEMY
        ),
        "/",
        getCardPlayLimit(
            ENEMY
        )
    );

}


//==================================
// マギア候補
//
// ジャックフロスト等の
// プレイ枚数上限も確認
//==================================

if(
    canPlayCardByLimit(
        ENEMY
    )
){

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

}
else{

    console.log(
        "CPU：マギア候補を作成しない",
        "カードプレイ枚数上限",
        getCardPlayCount(
            ENEMY
        ),
        "/",
        getCardPlayLimit(
            ENEMY
        )
    );

}


    //==================================
    // ★ ブロック不可サモン確認
    //==================================

    const hasCannotBeBlockedAttack =
        enemyField.some(
            summon => {

                //----------------------------------
                // 存在確認
                //----------------------------------

                if(!summon){

                    return false;

                }


                //----------------------------------
                // 破壊済みは不可
                //----------------------------------

                if(summon.destroyed){

                    return false;

                }


                //----------------------------------
                // 横向きは攻撃不可
                //----------------------------------

                if(summon.isRest){

                    return false;

                }


                //----------------------------------
                // 召喚ターン攻撃制限
                //
                // summonTurnAttackなら例外
                //----------------------------------

                if(
                    !summon.attackReady &&
                    !hasSummonAbility(
                        summon,
                        "summonTurnAttack"
                    )
                ){

                    return false;

                }


                //----------------------------------
                // cannotBeBlocked確認
                //
                // 複数能力対応
                //----------------------------------

                return (
                    hasSummonAbility(
                        summon,
                        "cannotBeBlocked"
                    )
                );

            }
        );


    if(hasCannotBeBlockedAttack){

        console.log(
            "CPU：攻撃可能なブロック不可サモンあり"
        );

    }


    //==================================
    // サモン能力候補
    //==================================

    for(const summon of enemyField){

        //----------------------------------
        // 使用可能確認
        //----------------------------------

        if(
            !cpuCanUseSummonAbility(
                summon
            )
        ){

            continue;

        }


        //----------------------------------
        // CPUが使用する起動能力
        //----------------------------------

        const supportedTypes = [

            // ワイバーン
            "oncePerTurnSummonDamage",

            // ケンタウロス
            "oncePerTurnSummonPowerUp",

            // キマイラ
            "oncePerTurnPlayerDamageWithCost",

            // ラミア
            "oncePerTurnPowerOneSummonRemove",

            // ケット・シー
            "playWindMagiaFromCool"

        ];


        //----------------------------------
        // 現在持っている能力一覧取得
        //
        // ドッペルゲンガーによる
        // コピー能力も含む
        //
        // 複数能力対応
        //----------------------------------

        const abilities =
            getSummonAbilities(
                summon
            );


        //----------------------------------
        // CPUが使用する起動能力を取得
        //----------------------------------

        const ability =
            abilities.find(
                ability =>
                    ability &&
                    supportedTypes.includes(
                        ability.type
                    )
            );


        if(!ability){

            continue;

        }

        //==================================
// カードをプレイするサモン能力
// プレイ枚数制限
//
// ケット・シー
// playWindMagiaFromCool
//==================================

if(
    ability.type ===
        "playWindMagiaFromCool" &&
    !canPlayCardByLimit(
        ENEMY
    )
){

    console.log(
        "CPU：ケット・シー系能力候補外",
        "カードプレイ枚数上限",
        getCardPlayCount(
            ENEMY
        ),
        "/",
        getCardPlayLimit(
            ENEMY
        )
    );

    continue;

}

        //==================================
        // 対象取得
        //==================================

        let target =
            null;


        //----------------------------------
        // ケット・シー系以外
        //
        // 通常のサモン能力対象を取得
        //----------------------------------

        if(
            ability.type !==
            "playWindMagiaFromCool"
        ){

            target =
                cpuSelectSummonAbilityTarget(
                    summon
                );


            if(!target){

                continue;

            }

        }


        //----------------------------------
        // ケット・シー系
        //
        // サモン能力自体には対象なし
        //----------------------------------

        else{

            console.log(
                "CPU：ケット・シー系能力候補",
                "使用サモン=",
                summon.card.name,
                "クールゾーンの風マギアを使用"
            );

        }


        //----------------------------------
        // ABILITY候補作成
        //----------------------------------

        const abilityAction =
            createCpuAction(
                "ABILITY"
            );


        //----------------------------------
        // 使用サモン
        //----------------------------------

        abilityAction.summon =
            summon;


        //----------------------------------
        // 対象
        //
        // ケット・シー系はnull
        //----------------------------------

        abilityAction.target =
            target;


        //==================================
        // キマイラ系
        // PLAYERへのダメージ能力
        //==================================

        if(
            ability.type ===
            "oncePerTurnPlayerDamageWithCost"
        ){

            addCpuActionPoints(
                abilityAction,
                80,
                "サモン能力でPLAYERにダメージ"
            );


            //----------------------------------
            // LIFEを0にできるなら最優先
            //----------------------------------

            const damage =
                Number(
                    ability.value
                ) || 0;


            if(
                damage >=
                game.playerLife
            ){

                addCpuActionPoints(
                    abilityAction,
                    1000,
                    "サモン能力でPLAYERを倒せる"
                );

            }

        }


        //==================================
        // ワイバーン系
        // サモンダメージ能力
        //==================================

        else if(
            ability.type ===
            "oncePerTurnSummonDamage"
        ){

            addCpuActionPoints(
                abilityAction,
                80,
                "サモン能力で相手サモンにダメージ"
            );


            //----------------------------------
            // カーススモーク対象
            //----------------------------------

            if(
                target &&
                isCurseSmokeTarget(
                    target
                )
            ){

                addCpuActionPoints(
                    abilityAction,
                    40,
                    "カーススモーク対象"
                );

            }

        }


        //==================================
        // ケンタウロス系
        // パワーアップ能力
        //==================================

        else if(
            ability.type ===
            "oncePerTurnSummonPowerUp"
        ){

            addCpuActionPoints(
                abilityAction,
                80,
                "アタック可能なサモンを強化"
            );

        }


        //==================================
        // ケット・シー系
        // クールの風マギアをプレイ
        //==================================

        else if(
            ability.type ===
            "playWindMagiaFromCool"
        ){

            addCpuActionPoints(
                abilityAction,
                80,
                "クールゾーンの風マギアをプレイ"
            );

        }


        //==================================
        // その他
        //==================================

        else{

            addCpuActionPoints(
                abilityAction,
                80,
                "サモン能力"
            );

        }


        //----------------------------------
        // 候補追加
        //----------------------------------

        actions.push(
            abilityAction
        );


        //==================================
        // 対象名
        //==================================

        let targetName;


        if(
            ability.type ===
            "playWindMagiaFromCool"
        ){

            targetName =
                "クールゾーンの風マギア";

        }
        else if(
            target === PLAYER
        ){

            targetName =
                "PLAYER";

        }
        else{

            targetName =
                target?.card?.name ||
                "不明";

        }


        console.log(
            "CPU：サモン能力候補追加",
            "使用=",
            summon.card.name,
            "能力=",
            ability.type,
            "対象=",
            targetName,
            "points=",
            abilityAction.points
        );

    }


    //==================================
    // 攻撃候補
    //==================================

    const hasBreakthroughReservedAttack =
        typeof cpuBreakthroughAttackSummon !==
            "undefined" &&
        cpuBreakthroughAttackSummon &&
        enemyField.includes(
            cpuBreakthroughAttackSummon
        ) &&
        !cpuBreakthroughAttackSummon.destroyed &&
        !cpuBreakthroughAttackSummon.isRest;


    if(
        hasBreakthroughReservedAttack ||
        hasCannotBeBlockedAttack ||
        cpuHasMeaningfulAttack()
    ){

        const attackAction =
            createCpuAction(
                "ATTACK"
            );


        //----------------------------------
        // 攻撃基本ポイント
        //----------------------------------

        if(
            hasBreakthroughReservedAttack
        ){

            addCpuActionPoints(
                attackAction,
                1000,
                "ブレイクスルー予約サモンの攻撃"
            );

        }
        else{

            addCpuActionPoints(
                attackAction,
                30,
                hasCannotBeBlockedAttack
                    ? "ブロック不可サモンの直接攻撃"
                    : "意味のある攻撃"
            );

        }


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
        "ownSummon=",
        bestAction.ownSummon
            ?.card?.name ||
        null
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


            //----------------------------------
// ファストコール解決待ち
//----------------------------------

if(result === "WAIT_FAST_CALL"){

    console.log(
        "CPU：ファストコールの解決待ち"
    );

    return;

}


        if(result){

            cpuSummonUsedThisTurn =
                true;

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


        //==================================
        // 追加サモン
        //
        // イグナイト等
        //
        // 通常マギアではnull
        //==================================

        const ownSummon =
            bestAction.ownSummon ??
            null;


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
            target,
            "ownSummon=",
            ownSummon
                ?.card?.name ||
            null
        );



        //==================================
        // ★追加
        // ブレイクスルー等
        //
        // CPUがこの効果を使用した場合、
        // 対象サモンはこのターン
        // 必ずアタックさせる
        //==================================

        if(
            card.effect?.type ===
                "conditionalCannotBeBlocked" &&
            target instanceof Summon &&
            target.owner === ENEMY
        ){

            cpuBreakthroughAttackSummon =
                target;


            console.log(
                "CPU：ブレイクスルー攻撃予約",
                {
                    magia:
                        card.name,

                    summon:
                        target.card?.name,

                    power:
                        getPower(
                            target
                        )
                }
            );

        }


        //==================================
        // CPUマギア実行
        //==================================

const result =
    cpuMagia(
        card,
        target,
        ownSummon
    );


//==================================
// ファストコールの解決待ち
//==================================

if(
    result === "WAIT_FAST_CALL"
){

    console.log(
        "CPU：ファストコールの解決待ち",
        card.name
    );

    // ファストコール終了後に
    // 保存済みのマギア処理を再開する
    return;

}


//==================================
// マギア使用失敗
//==================================

if(
    result === false
){

    console.log(
        "CPU：マギア使用失敗",
        card.name
    );

    setTimeout(
        runCpuTurnStep,
        500
    );

    return;

}


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
    // ABILITY
    // サモン能力
    //==================================

    if(
        bestAction.type ===
        "ABILITY"
    ){

        const summon =
            bestAction.summon;


        const target =
            bestAction.target;


        //----------------------------------
        // 使用サモン確認
        //----------------------------------

        if(!summon){

            console.log(
                "CPU：サモン能力",
                "使用サモンなし"
            );


            setTimeout(
                runCpuTurnStep,
                500
            );


            return;

        }


        //----------------------------------
        // CPUが使用する起動能力
        //----------------------------------

        const supportedTypes = [

            // ワイバーン
            "oncePerTurnSummonDamage",

            // ケンタウロス
            "oncePerTurnSummonPowerUp",

            // キマイラ
            "oncePerTurnPlayerDamageWithCost",

            // ラミア
            "oncePerTurnPowerOneSummonRemove",

            // ケット・シー
            "playWindMagiaFromCool"

        ];


        //----------------------------------
        // 現在持っている能力一覧
        //
        // 複数能力対応
        //
        // ドッペルゲンガーによる
        // コピー能力も含む
        //----------------------------------

        const abilities =
            getSummonAbilities(
                summon
            );


        //----------------------------------
        // 今回実行する起動能力
        //----------------------------------

        const ability =
            abilities.find(
                ability =>
                    ability &&
                    supportedTypes.includes(
                        ability.type
                    )
            );


        //----------------------------------
        // 起動能力がなくなっている
        //----------------------------------

        if(!ability){

            console.log(
                "CPU：サモン能力",
                "現在使用可能な起動能力なし"
            );


            setTimeout(
                runCpuTurnStep,
                500
            );


            return;

        }


        //==================================
        // ケット・シー系
        //
        // サモン能力自体には
        // targetを持たない
        //==================================

        const isCatSith =
            ability.type ===
            "playWindMagiaFromCool";


        //----------------------------------
        // 通常能力は対象必須
        //----------------------------------

        if(
            !isCatSith &&
            !target
        ){

            console.log(
                "CPU：サモン能力",
                "対象なし"
            );


            setTimeout(
                runCpuTurnStep,
                500
            );


            return;

        }


        //----------------------------------
        // 実行ログ
        //----------------------------------

        console.log(
            "================================"
        );

        console.log(
            "CPU：ポイント方式でサモン能力実行"
        );

        console.log(
            "使用サモン=",
            summon.card?.name
        );

        console.log(
            "現在能力=",
            ability.type
        );


        if(isCatSith){

            console.log(
                "対象=",
                "クールゾーンの風マギア"
            );

        }
        else{

            console.log(
                "対象=",
                target?.card?.name ||
                target
            );

        }


        console.log(
            "================================"
        );


        //----------------------------------
        // 能力実行
        //----------------------------------

        const result =
            cpuUseSummonAbility(
                summon,
                target
            );


        console.log(
            "CPU：サモン能力使用結果",
            result
        );


        //----------------------------------
        // 能力実行失敗
        //
        // 同じ能力を選択し続ける
        // 無限ループを防止
        //----------------------------------

        if(!result){

            console.log(
                "CPU：サモン能力実行失敗"
            );


            summon.abilityUsedThisTurn =
                true;

        }


        //==================================
        // ケット・シー系から使用したマギアが
        // 強制コスト型だった場合
        //
        // PLAYER側の選択待ちになるため
        // CPU行動を再開しない
        //==================================

        if(
            isCatSith &&
            cpuWaiting
        ){

            console.log(
                "CPU：ケット・シー系",
                "マギア処理待ち"
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

//==================================================
// CPU
// サモン能力使用可能判定
//==================================================

function cpuCanUseSummonAbility(summon){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !summon ||
        !summon.card
    ){

        return false;

    }


    //----------------------------------
    // CPUのサモンのみ
    //----------------------------------

    if(
        summon.owner !== ENEMY
    ){

        return false;

    }


    //----------------------------------
    // CPUターンのみ
    //----------------------------------

    if(
        game.currentPlayer !== ENEMY
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
    // CPUが使用する起動能力
    //----------------------------------

    const supportedTypes = [

        // ワイバーン
        "oncePerTurnSummonDamage",

        // ケンタウロス
        "oncePerTurnSummonPowerUp",

        // キマイラ
        "oncePerTurnPlayerDamageWithCost",

        // ラミア
        "oncePerTurnPowerOneSummonRemove",

        // ケット・シー
        "playWindMagiaFromCool"

    ];


    //----------------------------------
    // 現在持っている能力一覧取得
    //
    // ドッペルゲンガーの
    // コピー能力もここに入る
    //
    // 複数能力対応
    //----------------------------------

    const abilities =
        getSummonAbilities(
            summon
        );


    //----------------------------------
    // CPUが使用できる起動能力を取得
    //----------------------------------

    const ability =
        abilities.find(
            ability =>
                ability &&
                supportedTypes.includes(
                    ability.type
                )
        );


    //----------------------------------
    // CPUが起動する能力ではない
    //----------------------------------

    if(!ability){

        return false;

    }


    //----------------------------------
    // このターン使用済み
    //----------------------------------

    if(
        summon.abilityUsedThisTurn
    ){

        return false;

    }


    //==================================================
    // キマイラ
    // コスト確認
    //==================================================

    if(
        ability.type ===
        "oncePerTurnPlayerDamageWithCost"
    ){

        const cost =
            Number(
                ability.cost
            ) || 0;


        //----------------------------------
        // CPU手札不足
        //----------------------------------

        if(
            enemyHandCards.length <
            cost
        ){

            console.log(
                "CPU：キマイラ系能力",
                "コスト不足",
                enemyHandCards.length,
                "/",
                cost
            );

            return false;

        }


        //----------------------------------
        // PLAYERを対象にできるか
        //----------------------------------

        if(
            !canTargetBySummonAbility(
                summon,
                PLAYER
            )
        ){

            console.log(
                "CPU：キマイラ系能力",
                "PLAYERを対象にできない"
            );

            return false;

        }


        return true;

    }


    //==================================================
    // ケット・シー
    //
    // CPUクールゾーンに
    // 使用可能な風マギアがあるか
    //==================================================

    if(
        ability.type ===
        "playWindMagiaFromCool"
    ){

        const usableMagias =
            getUsableCpuCatSithMagias();


        //----------------------------------
        // 候補なし
        //----------------------------------

        if(
            usableMagias.length === 0
        ){

            console.log(
                "CPU：ケット・シー系能力使用不可",
                "使用可能な風マギアなし"
            );

            return false;

        }


        console.log(
            "CPU：ケット・シー系能力使用可能",
            "能力保持サモン=",
            summon.card.name,
            usableMagias.map(
                card =>
                    card.name
            )
        );


        return true;

    }


    //==================================================
    // 通常の対象選択型能力
    //
    // ワイバーン
    // ケンタウロス
    // ラミア
    //==================================================

    const target =
        cpuSelectSummonAbilityTarget(
            summon
        );


    if(!target){

        return false;

    }


    return true;

}

//==================================================
// CPU
// サモン能力対象選択
//==================================================

function cpuSelectSummonAbilityTarget(source){

    //----------------------------------
    // 使用サモン確認
    //----------------------------------

    if(
        !source ||
        !source.card
    ){

        return null;

    }


    //----------------------------------
    // CPUが使用する起動能力
    //----------------------------------

    const supportedTypes = [

        // ワイバーン
        "oncePerTurnSummonDamage",

        // ケンタウロス
        "oncePerTurnSummonPowerUp",

        // キマイラ
        "oncePerTurnPlayerDamageWithCost",

        // ラミア
        "oncePerTurnPowerOneSummonRemove",

        // ケット・シー
        "playWindMagiaFromCool"

    ];


    //----------------------------------
    // 現在持っている能力一覧取得
    //
    // ドッペルゲンガーの
    // コピー能力もここに入る
    //
    // 複数能力対応
    //----------------------------------

    const abilities =
        getSummonAbilities(
            source
        );


    //----------------------------------
    // CPUが使用する起動能力取得
    //----------------------------------

    const ability =
        abilities.find(
            ability =>
                ability &&
                supportedTypes.includes(
                    ability.type
                )
        );


    if(!ability){

        return null;

    }


    //==================================================
    // キマイラ系
    //
    // PLAYERを対象にダメージ
    //==================================================

    if(
        ability.type ===
        "oncePerTurnPlayerDamageWithCost"
    ){

        //----------------------------------
        // PLAYERを対象にできるか
        //----------------------------------

        if(
            !canTargetBySummonAbility(
                source,
                PLAYER
            )
        ){

            console.log(
                "CPU：キマイラ系能力",
                "PLAYERを対象にできない"
            );

            return null;

        }


        console.log(
            "CPU：キマイラ系能力対象 → PLAYER",
            "能力保持サモン=",
            source.card.name
        );


        return PLAYER;

    }


    //==================================================
    // ラミア系
    //
    // PLAYER側の
    // 現在パワー1のサモンを対象
    //==================================================

    if(
        ability.type ===
        "oncePerTurnPowerOneSummonRemove"
    ){

        //----------------------------------
        // PLAYER側から候補取得
        //----------------------------------

        const candidates =
            playerField.filter(
                summon => {

                    //----------------------------------
                    // 基本確認
                    //----------------------------------

                    if(
                        !summon ||
                        !summon.card ||
                        summon.destroyed
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 現在パワー1のみ
                    //----------------------------------

                    if(
                        getPower(summon) !== 1
                    ){

                        return false;

                    }


                    //----------------------------------
                    // マーフォーク等の対象耐性
                    //----------------------------------

                    if(
                        !canTargetBySummonAbility(
                            source,
                            summon
                        )
                    ){

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
                "CPU：ラミア系能力",
                "パワー1の対象なし"
            );

            return null;

        }


        //----------------------------------
        // 複数いる場合はランダム
        //----------------------------------

        const target =
            candidates[
                Math.floor(
                    Math.random() *
                    candidates.length
                )
            ];


        console.log(
            "CPU：ラミア系能力対象",
            target.card.name,
            "現在パワー=",
            getPower(target)
        );


        return target;

    }


    //==================================================
    // ケンタウロス系
    //
    // 自分のアタック可能なサモンを
    // このターン中パワーアップ
    //==================================================

    if(
        ability.type ===
        "oncePerTurnSummonPowerUp"
    ){

        //----------------------------------
        // CPU側のサモンのみ
        //----------------------------------

        const candidates =
            enemyField.filter(
                summon => {

                    //----------------------------------
                    // 基本確認
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
                    // ヨコ向き
                    //----------------------------------

                    if(summon.isRest){

                        return false;

                    }


                    //----------------------------------
                    // 現在アタック可能か
                    //
                    // summonTurnAttackも
                    // 複数能力対応
                    //----------------------------------

                    if(
                        !summon.attackReady &&
                        !hasSummonAbility(
                            summon,
                            "summonTurnAttack"
                        )
                    ){

                        return false;

                    }


                    //----------------------------------
                    // サモン能力対象判定
                    //----------------------------------

                    if(
                        !canTargetBySummonAbility(
                            source,
                            summon
                        )
                    ){

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
                "CPU：ケンタウロス系能力",
                "アタック可能な対象なし"
            );

            return null;

        }


        //----------------------------------
        // 現在パワーが高い順
        //----------------------------------

        candidates.sort(
            (a,b) =>
                getPower(b) -
                getPower(a)
        );


        //----------------------------------
        // 最もパワーが高いサモン
        //----------------------------------

        const target =
            candidates[0];


        console.log(
            "CPU：ケンタウロス系能力対象",
            target.card.name,
            "現在パワー=",
            getPower(target)
        );


        return target;

    }


    //==================================================
    // ワイバーン系
    //
    // PLAYERのサモンにダメージ
    //==================================================

    if(
        ability.type ===
        "oncePerTurnSummonDamage"
    ){

        //----------------------------------
        // PLAYERの有効なサモン
        //----------------------------------

        const candidates =
            playerField.filter(
                summon => {

                    //----------------------------------
                    // 基本確認
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
                    // サモン能力対象判定
                    //----------------------------------

                    if(
                        !canTargetBySummonAbility(
                            source,
                            summon
                        )
                    ){

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

            return null;

        }


        //==================================
        // 最優先
        // カーススモーク状態
        //==================================

        const curseSmokeTargets =
            candidates.filter(
                summon =>
                    isCurseSmokeTarget(
                        summon
                    )
            );


        if(
            curseSmokeTargets.length > 0
        ){

            curseSmokeTargets.sort(
                (a,b) =>
                    getPower(b) -
                    getPower(a)
            );


            console.log(
                "CPU：ワイバーン系能力",
                "カーススモーク対象を最優先",
                curseSmokeTargets[0].card.name
            );


            return curseSmokeTargets[0];

        }


        //==================================
        // 通常
        // パワー1のみ対象
        //==================================

        const powerOneTargets =
            candidates.filter(
                summon =>
                    getPower(summon) === 1
            );


        //----------------------------------
        // パワー1なし
        //----------------------------------

        if(
            powerOneTargets.length === 0
        ){

            console.log(
                "CPU：ワイバーン系能力",
                "パワー1の対象なし"
            );

            return null;

        }


        //----------------------------------
        // 複数いる場合はランダム
        //----------------------------------

        const target =
            powerOneTargets[
                Math.floor(
                    Math.random() *
                    powerOneTargets.length
                )
            ];


        console.log(
            "CPU：ワイバーン系能力対象",
            target.card.name,
            "power=",
            getPower(target)
        );


        return target;

    }


    //==================================================
    // 未対応能力
    //==================================================

    return null;

}


function cpuUseSummonAbility(
    source,
    target
){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !source ||
        !source.card
    ){

        return false;

    }


    //----------------------------------
    // CPUが使用する起動能力
    //----------------------------------

    const supportedTypes = [

        // ワイバーン
        "oncePerTurnSummonDamage",

        // ケンタウロス
        "oncePerTurnSummonPowerUp",

        // キマイラ
        "oncePerTurnPlayerDamageWithCost",

        // ラミア
        "oncePerTurnPowerOneSummonRemove",

        // ケット・シー
        "playWindMagiaFromCool"

    ];


    //----------------------------------
    // 現在持っている能力一覧取得
    //
    // 複数能力対応
    //----------------------------------

    const abilities =
        getSummonAbilities(
            source
        );


    //----------------------------------
    // 今回使用する起動能力を取得
    //----------------------------------

    const ability =
        abilities.find(
            ability =>
                ability &&
                supportedTypes.includes(
                    ability.type
                )
        );


    //----------------------------------
    // 使用可能な起動能力なし
    //----------------------------------

    if(!ability){

        return false;

    }


    //==================================================
    // ケット・シー系
    //
    // 通常のサモン能力対象を持たないため
    // 先に専用処理へ送る
    //==================================================

    if(
        ability.type ===
        "playWindMagiaFromCool"
    ){

        return cpuUseCatSithAbility(
            source
        );

    }


    //----------------------------------
    // 通常能力は対象必須
    //----------------------------------

    if(!target){

        return false;

    }


    //----------------------------------
    // 使用可能確認
    //----------------------------------

    if(
        !cpuCanUseSummonAbility(
            source
        )
    ){

        return false;

    }


    //----------------------------------
    // 対象を再確認
    //----------------------------------

    const validTarget =
        cpuSelectSummonAbilityTarget(
            source
        );


    if(!validTarget){

        return false;

    }


    //----------------------------------
    // 対象が変化していた場合
    //----------------------------------

    if(
        validTarget !== target
    ){

        target =
            validTarget;

    }


    //----------------------------------
    // 効果値
    //----------------------------------

    const value =
        Number(
            ability.value
        ) || 1;


    //==================================================
    // 対象名
    //==================================================

    const targetName =

        target === PLAYER

            ? "PLAYER"

            : target.card?.name ||
              "不明";


    //==================================================
    // キマイラ系
    // コスト支払い
    //==================================================

    if(
        ability.type ===
        "oncePerTurnPlayerDamageWithCost"
    ){

        const cost =
            Number(
                ability.cost
            ) || 0;


        //----------------------------------
        // 念のため再確認
        //----------------------------------

        if(
            enemyHandCards.length <
            cost
        ){

            console.log(
                "CPU：キマイラ系能力",
                "解決直前にコスト不足"
            );

            return false;

        }


        //----------------------------------
        // 支払うカードを確定
        //----------------------------------

        const costCards =
            enemyHandCards.slice(
                0,
                cost
            );


        console.log(
            "CPU：キマイラ系能力コスト",
            costCards.map(
                card =>
                    card.name
            )
        );


        //----------------------------------
        // コストへ移動
        //----------------------------------

        costCards.forEach(
            card => {

                moveEnemyToCost(
                    card
                );

            }
        );

    }


    //==================================================
    // バトルログ
    //==================================================

    addBattleLog(
        `CPU：${source.card.name}の能力を使用`
    );


    addBattleLog(
        `CPU：対象 → ${targetName}`
    );


    //==================================================
    // CPUカード使用演出
    //==================================================

    showCpuCardAction(
        source.card,
        "ABILITY"
    );


    //==================================================
    // 対象発光
    //==================================================

    if(
        target === PLAYER
    ){

        const playerIcon =
            document.getElementById(
                "player-icon"
            );


        if(playerIcon){

            playerIcon.classList.add(
                "magia-target"
            );

        }

    }
    else{

        showCpuMagiaTargetHighlight(
            target
        );

    }


    //----------------------------------
    // コンソール
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "CPU：サモン能力使用"
    );

    console.log(
        "使用サモン：",
        source.card.name
    );

    console.log(
        "能力タイプ：",
        ability.type
    );

    console.log(
        "対象：",
        targetName
    );

    console.log(
        "効果値：",
        value
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // このターン使用済み
    //----------------------------------

    source.abilityUsedThisTurn =
        true;


    //==================================================
    // 少し演出を見せてから能力解決
    //==================================================

    setTimeout(
        ()=>{


            //==================================
            // キマイラ系
            //
            // PLAYERへダメージ
            //==================================

            if(
                ability.type ===
                "oncePerTurnPlayerDamageWithCost"
            ){

                console.log(
                    "CPU：キマイラ系能力",
                    source.card.name,
                    "→ PLAYER",
                    value,
                    "ダメージ"
                );


                addBattleLog(
                    `CPU：${source.card.name}の能力でPLAYERに${value}ダメージ`
                );


                damagePlayer(
                    PLAYER,
                    value,
                    false,
                    source.card
                );

            }


            //==================================
            // ラミア系
            //
            // PLAYER側のパワー1サモンを
            // クールゾーンへ置く
            //==================================

            else if(
                ability.type ===
                "oncePerTurnPowerOneSummonRemove"
            ){

                //----------------------------------
                // 対象再確認
                //----------------------------------

                if(
                    target &&
                    target.card &&
                    !target.destroyed &&
                    target.owner === PLAYER &&
                    playerField.includes(
                        target
                    ) &&
                    getPower(target) === 1 &&
                    canTargetBySummonAbility(
                        source,
                        target
                    )
                ){

                    const removedCardName =
                        target.card.name;


                    console.log(
                        "CPU：ラミア系能力",
                        source.card.name,
                        "→",
                        removedCardName,
                        "をクールゾーンへ"
                    );


                    //----------------------------------
                    // クールへ移動
                    //----------------------------------

                    moveLamiaTargetToCool(
                        target
                    );


                    //----------------------------------
                    // バトルログ
                    //----------------------------------

                    addBattleLog(
                        `CPU：${source.card.name}の能力で${removedCardName}をクールゾーンに置いた`
                    );

                }
                else{

                    console.log(
                        "CPU：ラミア系能力",
                        "解決時に対象が無効"
                    );

                }

            }


            //==================================
            // ワイバーン系
            //
            // サモンへダメージ
            //==================================

            else if(
                ability.type ===
                "oncePerTurnSummonDamage"
            ){

                if(
                    target &&
                    !target.destroyed
                ){

                    dealDamage(
                        target,
                        value,
                        source.card
                    );


                    console.log(
                        "CPU：サモンダメージ能力",
                        source.card.name,
                        "→",
                        target.card.name,
                        "ダメージ=",
                        value
                    );


                    //----------------------------------
                    // 撃破解決
                    //----------------------------------

                    setTimeout(
                        ()=>{

                            resolveBattle();

                        },
                        1000
                    );

                }

            }


            //==================================
            // ケンタウロス系
            //
            // このターン中パワーアップ
            //==================================

            else if(
                ability.type ===
                "oncePerTurnSummonPowerUp"
            ){

                if(
                    target &&
                    !target.destroyed
                ){

                    addTemporaryPower(
                        target,
                        value
                    );


                    addBattleLog(
                        `CPU：${target.card.name}のパワー＋${value}`
                    );


                    console.log(
                        "CPU：サモンパワーアップ能力",
                        source.card.name,
                        "→",
                        target.card.name,
                        "パワー+",
                        value,
                        "現在パワー=",
                        getPower(
                            target
                        )
                    );

                }

            }


            //----------------------------------
            // UI更新
            //----------------------------------

            updateGameState();

            updateButtons();

        },
        800
    );


    //==================================================
    // 対象発光解除
    //==================================================

    setTimeout(
        ()=>{

            if(
                target === PLAYER
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
            else{

                clearCpuMagiaTargetHighlight(
                    target
                );

            }

        },
        5000
    );


    return true;

}


//==================================================
// カーススモーク状態確認
//==================================================

function isCurseSmokeTarget(summon){

    if(
        !summon ||
        !Array.isArray(
            summon.status
        )
    ){

        return false;

    }


    return summon.status.some(
        status =>
            status.type ===
            "curseSmoke"
    );

}

//==================================================
// CPU
// カーススモーク使用判定
//==================================================

function cpuGetCurseSmokePlan(card){

    //----------------------------------
    // カード確認
    //----------------------------------

    if(
        !card ||
        !card.effect ||
        card.effect.type !==
            "curseSmoke"
    ){

        return null;

    }


    //----------------------------------
    // PLAYERサモン確認
    //----------------------------------

    const playerSummons =
        playerField.filter(
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
                // すでにカーススモーク状態
                //----------------------------------

                if(
                    isCurseSmokeTarget(
                        summon
                    )
                ){

                    return false;

                }


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


                return true;

            }
        );


    if(
        playerSummons.length === 0
    ){

        return null;

    }


    //==================================================
    // 優先度1
    // 1ダメージ能力とのコンボ
    //==================================================

    const damageAbilitySummon =
        enemyField.find(
            summon => {

                if(
                    !summon ||
                    !summon.card ||
                    summon.destroyed
                ){

                    return false;

                }


                //----------------------------------
                // 1ターン1回ダメージ能力
                //
                // 複数能力対応
                //----------------------------------

                if(
                    !hasSummonAbility(
                        summon,
                        "oncePerTurnSummonDamage"
                    )
                ){

                    return false;

                }


                //----------------------------------
                // 使用済み
                //----------------------------------

                if(
                    summon.abilityUsedThisTurn
                ){

                    return false;

                }


                return true;

            }
        );


    if(damageAbilitySummon){

        //----------------------------------
        // 能力で対象にできるものだけ
        //----------------------------------

        const candidates =
            playerSummons.filter(
                summon =>
                    canTargetBySummonAbility(
                        damageAbilitySummon,
                        summon
                    )
            );


        if(
            candidates.length > 0
        ){

            //----------------------------------
            // パワー最大
            //----------------------------------

            candidates.sort(
                (a,b) =>
                    getPower(b) -
                    getPower(a)
            );


            const target =
                candidates[0];


            console.log(
                "CPU：カーススモーク計画",
                "1ダメージ能力コンボ",
                "能力使用サモン=",
                damageAbilitySummon.card.name,
                "対象=",
                target.card.name,
                "power=",
                getPower(target)
            );


            return {

                type:
                    "ABILITY_COMBO",

                target:
                    target,

                score:
                    150

            };

        }

    }


    //==================================================
    // 優先度2
    // 横向きパワー3以上を
    // 小さいサモンで攻撃
    //==================================================

    const horizontalTargets =
        playerSummons.filter(
            summon =>
                summon.isRest &&
                getPower(summon) >= 3
        );


    //----------------------------------
    // パワーが高い順
    //----------------------------------

    horizontalTargets.sort(
        (a,b) =>
            getPower(b) -
            getPower(a)
    );


    for(
        const target
        of horizontalTargets
    ){

        const targetPower =
            getPower(target);


        //----------------------------------
        // 対象よりパワーが小さく
        // 現在攻撃可能なCPUサモン
        //----------------------------------

        const attacker =
            enemyField.find(
                summon => {

                    if(
                        !summon ||
                        !summon.card ||
                        summon.destroyed
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 横向きは攻撃不可
                    //----------------------------------

                    if(summon.isRest){

                        return false;

                    }


                    //----------------------------------
                    // 召喚ターン攻撃制限
                    //
                    // summonTurnAttackなら例外
                    //----------------------------------

                    if(
                        !summon.attackReady &&
                        !hasSummonAbility(
                            summon,
                            "summonTurnAttack"
                        )
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 相手より小さい
                    //----------------------------------

                    return (
                        getPower(summon) <
                        targetPower
                    );

                }
            );


        if(attacker){

            console.log(
                "CPU：カーススモーク計画",
                "横向きサモン攻撃コンボ",
                "対象=",
                target.card.name,
                "power=",
                targetPower,
                "攻撃役=",
                attacker.card.name,
                "power=",
                getPower(attacker)
            );


            return {

                type:
                    "HORIZONTAL_ATTACK",

                target:
                    target,

                attacker:
                    attacker,

                score:
                    130

            };

        }

    }


    //==================================================
    // 優先度3
    // PLAYERの縦向きサモンが1体だけ
    // PLAYERへの攻撃時に使用
    //==================================================

    const verticalTargets =
        playerSummons.filter(
            summon =>
                !summon.isRest
        );


    if(
        verticalTargets.length === 1
    ){

        const target =
            verticalTargets[0];


        //----------------------------------
        // PLAYERへ攻撃できるCPUサモン確認
        //----------------------------------

        const hasAttacker =
            enemyField.some(
                summon => {

                    if(
                        !summon ||
                        !summon.card ||
                        summon.destroyed
                    ){

                        return false;

                    }


                    if(summon.isRest){

                        return false;

                    }


                    //----------------------------------
                    // 召喚ターン攻撃制限
                    //
                    // summonTurnAttackなら例外
                    //----------------------------------

                    if(
                        !summon.attackReady &&
                        !hasSummonAbility(
                            summon,
                            "summonTurnAttack"
                        )
                    ){

                        return false;

                    }


                    return true;

                }
            );


        if(hasAttacker){

            console.log(
                "CPU：カーススモーク計画",
                "唯一の縦向きブロッカー",
                "対象=",
                target.card.name
            );


            return {

                type:
                    "VERTICAL_BLOCKER",

                target:
                    target,

                score:
                    110

            };

        }

    }


    //----------------------------------
    // 使用する意味なし
    //----------------------------------

    return null;

}

function getUsableCpuCatSithMagias(){

    console.log(
        "================================"
    );

    console.log(
        "★ CPUケット・シー使用可能マギア判定開始"
    );


    //----------------------------------
    // CPUクールゾーン確認
    //----------------------------------

    if(
        !Array.isArray(
            enemyCoolCards
        )
    ){

        return [];

    }


    //----------------------------------
    // 使用可能な風マギア
    //----------------------------------

    const result =
        enemyCoolCards.filter(
            card => {

                //----------------------------------
                // 基本確認
                //----------------------------------

                if(!card){

                    return false;

                }


                //----------------------------------
                // マギア
                //----------------------------------

                if(
                    card.type !== "マギア"
                ){

                    return false;

                }


                //----------------------------------
                // 風属性
                //----------------------------------

                if(
                    card.elementType !== "風"
                ){

                    return false;

                }


                //----------------------------------
                // CPU所有
                //----------------------------------

                card.owner =
                    ENEMY;


                //----------------------------------
                // 現在コスト
                //----------------------------------

                const cost =
                    getCurrentCardCost(
                        card,
                        ENEMY
                    );


                //----------------------------------
                // コスト不足
                //----------------------------------

                if(
                    enemyHandCards.length <
                    cost
                ){

                    console.log(
                        "CPUケット・シー：",
                        card.name,
                        "コスト不足",
                        enemyHandCards.length,
                        "/",
                        cost
                    );

                    return false;

                }


                //----------------------------------
                // 適正対象確認
                //----------------------------------

                const target =
                    selectCpuMagiaTarget(
                        card
                    );


                if(!target){

                    console.log(
                        "CPUケット・シー：",
                        card.name,
                        "適正対象なし"
                    );

                    return false;

                }


                console.log(
                    "CPUケット・シー使用可能：",
                    card.name,
                    "cost=",
                    cost
                );


                return true;

            }
        );


    console.log(
        "★ CPUケット・シー使用可能マギア=",
        result.map(
            card =>
                card.name
        )
    );

    console.log(
        "================================"
    );


    return result;

}

function selectCpuCatSithMagia(){

    //----------------------------------
    // 使用可能な風マギア取得
    //----------------------------------

    const candidates =
        getUsableCpuCatSithMagias();


    //----------------------------------
    // 候補なし
    //----------------------------------

    if(
        candidates.length === 0
    ){

        return null;

    }


    //----------------------------------
    // 実際に対象を選択できるカードだけ残す
    //----------------------------------

    const usable =
        candidates.filter(
            card => {

                //----------------------------------
                // CPU所有に設定
                //----------------------------------

                card.owner =
                    ENEMY;


                //----------------------------------
                // 通常CPUマギア対象選択
                //----------------------------------

                const target =
                    selectCpuMagiaTarget(
                        card
                    );


                if(!target){

                    console.log(
                        "CPUケット・シー：",
                        card.name,
                        "適正対象なし"
                    );

                    return false;

                }


                return true;

            }
        );


    //----------------------------------
    // 使用可能カードなし
    //----------------------------------

    if(
        usable.length === 0
    ){

        console.log(
            "CPUケット・シー：",
            "対象を取れる風マギアなし"
        );

        return null;

    }


    //----------------------------------
    // 現段階ではランダム選択
    //----------------------------------

    const card =
        usable[
            Math.floor(
                Math.random() *
                usable.length
            )
        ];


    console.log(
        "CPUケット・シー：",
        "使用マギア決定 →",
        card.name
    );


    return card;

}

function cpuUseCatSithAbility(source){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !source ||
        !source.card
    ){

        return false;

    }


    //----------------------------------
    // ケット・シー系能力取得
    //
    // 複数能力対応
    //
    // ドッペルゲンガーによる
    // コピー能力も含む
    //----------------------------------

    const ability =
        getSummonAbility(
            source,
            "playWindMagiaFromCool"
        );


    //----------------------------------
    // ケット・シー系能力なし
    //----------------------------------

    if(!ability){

        return false;

    }


    //==================================
    // カードプレイ枚数上限確認
    //
    // クールゾーンからプレイする
    // マギアも1枚として数える
    //==================================

    if(
        !canPlayCardByLimit(
            ENEMY
        )
    ){

        console.log(
            "CPUケット・シー系能力使用不可：",
            "カードプレイ枚数上限",
            getCardPlayCount(
                ENEMY
            ),
            "/",
            getCardPlayLimit(
                ENEMY
            )
        );

        return false;

    }


    //----------------------------------
    // 使用可能確認
    //----------------------------------

    if(
        !cpuCanUseSummonAbility(
            source
        )
    ){

        return false;

    }


    //----------------------------------
    // 以下は現在の処理をそのまま
    //----------------------------------


    //----------------------------------
    // 使用する風マギア決定
    //----------------------------------

    const card =
        selectCpuCatSithMagia();


    if(!card){

        return false;

    }


    //----------------------------------
    // 対象決定
    //----------------------------------

    card.owner =
        ENEMY;


    const target =
        selectCpuMagiaTarget(
            card
        );


    if(!target){

        console.log(
            "CPUケット・シー系：",
            "解決直前に対象なし",
            card.name
        );

        return false;

    }


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "CPU：ケット・シー系能力使用"
    );

    console.log(
        "能力保持サモン：",
        source.card.name
    );

    console.log(
        "使用マギア：",
        card.name
    );

    console.log(
        "対象：",
        target
    );

    console.log(
        "================================"
    );


    addBattleLog(
        `CPU：${source.card.name}の能力を使用`
    );


    addBattleLog(
        `CPU：クールゾーンの${card.name}をプレイ`
    );


    //----------------------------------
    // 能力使用済み
    //----------------------------------

    source.abilityUsedThisTurn =
        true;


    //----------------------------------
    // CPUクールゾーンから除外
    //----------------------------------

    enemyCoolCards =
        enemyCoolCards.filter(
            coolCard =>
                coolCard !== card
        );


    //----------------------------------
    // Board側も同期
    //----------------------------------

    if(
        board &&
        Array.isArray(
            board.enemyCoolCards
        )
    ){

        board.enemyCoolCards =
            board.enemyCoolCards.filter(
                coolCard =>
                    coolCard !== card
            );

    }


    //----------------------------------
    // 一時的に手札扱い
    //
    // cpuMagia()は
    // enemyHandCardsから除外する設計なので
    // 一度追加して通常処理へ渡す
    //----------------------------------

    card.area =
        "hand";


    if(
        !enemyHandCards.includes(
            card
        )
    ){

        enemyHandCards.push(
            card
        );

    }


    //----------------------------------
    // UI更新
    //----------------------------------

    updateCoolCount();

    updateEnemyZoneDisplay();


    //----------------------------------
    // 通常のCPUマギア処理へ
    //----------------------------------

    const result =
        cpuMagia(
            card,
            target
        );


    console.log(
        "CPUケット・シー系：",
        "マギア使用結果=",
        result
    );


    return result;

}

//======================================
// CPU：マギアの現在ダメージ取得
//======================================

function getCpuMagiaDamageValue(
    card,
    ownSummon = null
){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !card ||
        !card.effect ||
        card.effect.type !== "damage"
    ){

        return 0;

    }


    let damage =
        0;


    //==================================
    // 自分サモンパワー参照型
    //
    // イグナイト等
    //==================================

    if(
        card.effect.valueType ===
            "ownSummonPower"
    ){

        if(
            !ownSummon ||
            ownSummon.destroyed ||
            !enemyField.includes(
                ownSummon
            )
        ){

            return 0;

        }


        damage =
            getPower(
                ownSummon
            );

    }


    //==================================
    // クールゾーン属性枚数型
    //==================================

    else if(
        card.effect.valueType ===
            "ownCoolElementCount"
    ){

        const targetElement =
            card.effect.element;


        damage =
            enemyCoolCards.filter(
                coolCard => {

                    if(!coolCard){

                        return false;

                    }


                    return (
                        coolCard.elementType ===
                        targetElement
                    );

                }
            ).length;

    }


    //==================================
    // 固定ダメージ
    //==================================

    else{

        damage =
            Number(
                card.effect.value
            ) || 0;

    }


    //==================================
    // 火マギアダメージ上昇
    //==================================

    if(
        card.type === "マギア" &&
        card.elementType === "火"
    ){

        enemyField.forEach(
            summon => {

                if(
                    !summon ||
                    summon.destroyed
                ){

                    return;

                }


                const ability =
                    getSummonAbility(
                        summon,
                        "fireMagiaDamageUp"
                    );


                if(!ability){

                    return;

                }


                damage +=
                    Number(
                        ability.value
                    ) || 0;

            }
        );

    }


    console.log(
        "CPU：現在マギアダメージ",
        card.name,
        damage
    );


    return damage;

}
//==================================================
// CPU
// 自分サモンパワー参照ダメージマギア計画
//
// イグナイト等
//==================================================

function createCpuOwnSummonPowerDamagePlan(
    card
){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !card ||
        card.effect?.type !==
            "damage" ||
        card.effect?.valueType !==
            "ownSummonPower"
    ){

        return null;

    }


    //----------------------------------
    // クールへ送れるCPUサモン
    //----------------------------------

    const ownSummons =
        enemyField.filter(
            summon => {

                if(
                    !summon ||
                    summon.destroyed
                ){

                    return false;

                }


                return true;

            }
        );


    if(
        ownSummons.length === 0
    ){

        console.log(
            "CPU：パワー参照マギア候補外",
            card.name,
            "自分サモンなし"
        );

        return null;

    }


    //==================================
    // 火マギアダメージ上昇
    //==================================

    let fireBonus =
        0;


    if(
        card.type === "マギア" &&
        card.elementType === "火"
    ){

        enemyField.forEach(
            summon => {

                if(
                    !summon ||
                    summon.destroyed
                ){

                    return;

                }


                const ability =
                    getSummonAbility(
                        summon,
                        "fireMagiaDamageUp"
                    );


                if(ability){

                    fireBonus +=
                        Number(
                            ability.value
                        ) || 0;

                }

            }
        );

    }


    //----------------------------------
    // 全プラン
    //----------------------------------

    const plans =
        [];


    //==================================
    // 各CPUサモンを
    // イグナイトの参照元として評価
    //==================================

    ownSummons.forEach(
        ownSummon => {

            //----------------------------------
            // 現在パワー
            //----------------------------------

            const power =
                getPower(
                    ownSummon
                );


            //----------------------------------
            // 元ダメージ
            //
            // サモンの現在パワー
            // ＋
            // 火マギアダメージ上昇
            //----------------------------------

            const damage =
                power +
                fireBonus;


            //==============================
            // PLAYER直接
            //==============================

            if(
                card.effect.target.includes(
                    "enemy"
                )
            ){

                //----------------------------------
                // ガーゴイル等を考慮した
                // 予測最終ダメージ
                //----------------------------------

                const expectedDamage =
                    getCpuExpectedMagiaDamage(
                        PLAYER,
                        damage
                    );


                console.log(
                    "CPU：パワー参照マギア",
                    "PLAYERダメージ予測",
                    {
                        magia:
                            card.name,

                        ownSummon:
                            ownSummon.card?.name,

                        originalDamage:
                            damage,

                        expectedDamage:
                            expectedDamage
                    }
                );


                //----------------------------------
                // 最終ダメージ0
                //----------------------------------

                if(
                    expectedDamage > 0
                ){

                    //----------------------------------
                    // ダメージが高いほど高評価
                    //----------------------------------

                    let score =
                        expectedDamage * 10;


                    //----------------------------------
                    // PLAYERを倒せる
                    //----------------------------------

                    if(
                        expectedDamage >=
                        game.playerLife
                    ){

                        score +=
                            500;

                    }


                    //----------------------------------
                    // プラン登録
                    //----------------------------------

                    plans.push({

                        target:
                            PLAYER,

                        ownSummon:
                            ownSummon,

                        damage:
                            damage,

                        expectedDamage:
                            expectedDamage,

                        score:
                            score

                    });

                }
                else{

                    console.log(
                        "CPU：パワー参照マギア",
                        card.name,
                        "PLAYER候補外",
                        "軽減後ダメージ0"
                    );

                }

            }


            //==============================
            // PLAYERサモン
            //==============================

            if(
                card.effect.target.includes(
                    "enemySummon"
                )
            ){

                playerField.forEach(
                    target => {

                        if(
                            !target ||
                            target.destroyed
                        ){

                            return;

                        }


                        //----------------------------------
                        // マギア対象不可
                        //----------------------------------

                        if(
                            isMagiaTargetBlocked(
                                card,
                                target
                            )
                        ){

                            return;

                        }


                        const targetPower =
                            getPower(
                                target
                            );


                        //----------------------------------
                        // ドライアド等を考慮した
                        // 予測最終ダメージ
                        //----------------------------------

                        const expectedDamage =
                            getCpuExpectedMagiaDamage(
                                target,
                                damage
                            );


                        console.log(
                            "CPU：パワー参照マギア",
                            "サモンダメージ予測",
                            {
                                magia:
                                    card.name,

                                ownSummon:
                                    ownSummon.card?.name,

                                target:
                                    target.card?.name,

                                targetPower:
                                    targetPower,

                                originalDamage:
                                    damage,

                                expectedDamage:
                                    expectedDamage
                            }
                        );


                        //----------------------------------
                        // 最終ダメージ0
                        //----------------------------------

                        if(
                            expectedDamage <= 0
                        ){

                            console.log(
                                "CPU：パワー参照マギア",
                                card.name,
                                target.card?.name,
                                "候補外",
                                "軽減後ダメージ0"
                            );


                            return;

                        }


                        //----------------------------------
                        // 軽減後ダメージで倒せない
                        //----------------------------------

                        if(
                            expectedDamage <
                            targetPower
                        ){

                            return;

                        }


                        //----------------------------------
                        // サモン撃破基本点
                        //----------------------------------

                        let score =
                            30;


                        //----------------------------------
                        // 高パワーの相手を
                        // 倒すほど高評価
                        //----------------------------------

                        score +=
                            targetPower * 10;


                        //----------------------------------
                        // オーバーダメージを少し減点
                        //----------------------------------

                        score -=
                            (
                                expectedDamage -
                                targetPower
                            ) * 2;


                        //----------------------------------
                        // プラン登録
                        //----------------------------------

                        plans.push({

                            target:
                                target,

                            ownSummon:
                                ownSummon,

                            damage:
                                damage,

                            expectedDamage:
                                expectedDamage,

                            score:
                                score

                        });

                    }
                );

            }

        }
    );


    //----------------------------------
    // プランなし
    //----------------------------------

    if(
        plans.length === 0
    ){

        console.log(
            "CPU：パワー参照マギア",
            card.name,
            "有効プランなし"
        );

        return null;

    }


    //----------------------------------
    // 最高評価
    //----------------------------------

    plans.sort(
        (a,b) =>
            b.score -
            a.score
    );


    const bestPlan =
        plans[0];


    console.log(
        "================================"
    );

    console.log(
        "CPU：パワー参照マギア計画",
        card.name
    );

    console.log(
        "対象=",
        bestPlan.target === PLAYER
            ?
            "PLAYER"
            :
            bestPlan.target.card?.name
    );

    console.log(
        "クールへ送るサモン=",
        bestPlan.ownSummon.card?.name
    );

    console.log(
        "参照パワー=",
        getPower(
            bestPlan.ownSummon
        )
    );

    console.log(
        "元ダメージ=",
        bestPlan.damage
    );

    console.log(
        "軽減後予測ダメージ=",
        bestPlan.expectedDamage
    );

    console.log(
        "計画点=",
        bestPlan.score
    );

    console.log(
        "================================"
    );


    return bestPlan;

}

//======================================
// CPU：マルチシールド必要コスト計算
//======================================

function getCpuMultiShieldCost(damage, availableCards){

    // ダメージを0にする最小コスト
    const requiredCost = Math.max(
        1,
        Math.ceil(damage / 2)
    );

    // 支払える枚数を超えない
    return Math.min(
        requiredCost,
        Math.max(0, availableCards)
    );

}