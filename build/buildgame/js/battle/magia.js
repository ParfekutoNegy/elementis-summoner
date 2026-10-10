// マギア使用中
let magiaCard = null;

// マギア対象
let magiaTarget = null;

// マギア対象選択中
let magiaTargetMode = false;

let nereidWaitingMagiaOwnSummon =
    null;

//==================================================
// 追加サモン選択型ダメージマギア
//
// イグナイト等
//==================================================

let magiaOwnSummonSelectMode =
    false;

let magiaSelectedOwnSummon =
    null;


let forceCostMode = false;
let forceCostPlayer = null;
let selectedForceCostCard = null;

let forceCostSource =
    null;

let sphinxAttackWaiting =
    false;

let sphinxAttackTarget =
    null;

 //==================================================
// カリュブディス
// 攻撃時誘発管理
//==================================================

let charybdisAttackWaiting =
    false;

let charybdisAttackAttacker =
    null;

let charybdisAttackTarget =
    null;

let charybdisTriggerQueue =
    [];

let charybdisCurrentTrigger =
    null;   
//======================================
// ヒュドラ
// マギアダメージ待機
//======================================

let hydraMagiaWaiting =
    false;

let hydraWaitingMagia =
    null;

let hydraWaitingMagiaTarget =
    null;

let hydraWaitingMagiaOwnSummon =
    null;    

//==================================================
// レジストによって停止中のマギア
//==================================================

let resistMagiaWaiting = false;

//==================================================
// CPUキャンセレーション
// プレイヤーマギアの効果発動前の待機状態
//==================================================

let cpuCancellationWaiting = false;

// 中断したマギアの情報
let cpuCancellationPending = null;

let resistWaitingMagia = null;

let resistWaitingMagiaTarget = null;

let resistWaitingMagiaOwnSummon =
    null;

//==================================================
// クリスタルピーピング
//==================================================

let crystalPeepingWaiting =
    false;

let crystalPeepingMagia =
    null;

let crystalPeepingOwner =
    null;

let crystalPeepingRevealedCards =
    new Set();

function resetCrystalPeepingRevealedCards(){

    crystalPeepingRevealedCards.clear();

    console.log(
        "クリスタルピーピング：公開履歴リセット"
    );

}

//==================================================
// アースクェイク
// 全体ダメージ解決状態
//==================================================

let earthquakeResolving =
    false;

let earthquakeMagia =
    null;

let earthquakeTargets =
    [];

let earthquakeIndex =
    0;

let earthquakeCurrentTarget =
    null;


//==================================================
// アースクェイク
// 解決開始
//==================================================

function startEarthquakeResolution(
    card
){

    console.log(
        "================================"
    );

    console.log(
        "★ アースクェイク解決開始"
    );


    //----------------------------------
    // 相手フィールド取得
    //----------------------------------

    const targetField =
        card.owner === PLAYER
            ? enemyField
            : playerField;


    //----------------------------------
    // 解決状態保存
    //----------------------------------

    earthquakeResolving =
        true;

    earthquakeMagia =
        card;

    earthquakeTargets =
        targetField.filter(
            summon =>
                summon &&
                summon.card &&
                !summon.destroyed
        );

    earthquakeIndex =
        0;

    earthquakeCurrentTarget =
        null;


    console.log(
        "アースクェイク対象：",
        earthquakeTargets.map(
            summon =>
                summon.card.name
        )
    );


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(
        earthquakeTargets.length === 0
    ){

        console.log(
            "アースクェイク：対象サモンなし"
        );


        finishEarthquakeResolution();

        return "DONE";

    }


    //----------------------------------
    // 最初の1体へ
    //----------------------------------

    return resolveNextEarthquakeTarget();

}


//==================================================
// アースクェイク
// 次のサモンを解決
//==================================================

function resolveNextEarthquakeTarget(){

    //----------------------------------
    // 解決中でなければ終了
    //----------------------------------

    if(
        !earthquakeResolving ||
        !earthquakeMagia
    ){

        return "DONE";

    }


    //----------------------------------
    // 全対象終了
    //----------------------------------

    if(
        earthquakeIndex >=
        earthquakeTargets.length
    ){

        finishEarthquakeResolution();

        return "DONE";

    }


    //----------------------------------
    // 今回の対象
    //----------------------------------

    const target =
        earthquakeTargets[
            earthquakeIndex
        ];


    earthquakeIndex++;


    //----------------------------------
    // すでに場を離れている場合
    // 次の対象へ
    //----------------------------------

    const currentField =
        target?.owner === PLAYER
            ? playerField
            : enemyField;


    if(
        !target ||
        target.destroyed ||
        !currentField.includes(target)
    ){

        console.log(
            "アースクェイク：対象が場にいないためスキップ",
            target?.card?.name
        );


        return resolveNextEarthquakeTarget();

    }


    //----------------------------------
    // 現在の対象を保存
    //----------------------------------

    earthquakeCurrentTarget =
        target;


    console.log(
        "================================"
    );

    console.log(
        "★ アースクェイク ダメージ対象",
        target.card.name,
        `${earthquakeIndex}/${earthquakeTargets.length}`
    );


    //----------------------------------
    // 1ダメージ
    //----------------------------------

const damage =
    Number(
        earthquakeMagia.effect?.value
    ) || 0;


const damageResult =
    dealDamage(
        target,
        damage,
        earthquakeMagia
    );


    //----------------------------------
    // ヒュドラ待ち
    //----------------------------------

    if(
        damageResult ===
        "WAIT_HYDRA"
    ){

        console.log(
            "アースクェイク：ヒュドラ能力待ち"
        );

        return "WAIT_HYDRA";

    }


    //----------------------------------
    // レジスト待ち
    //----------------------------------

    if(
        damageResult ===
        "WAIT_RESIST"
    ){

        console.log(
            "アースクェイク：レジスト待ち"
        );

        return "WAIT_RESIST";

    }


    //----------------------------------
    // 通常ダメージ完了
    //----------------------------------

    return finishEarthquakeTargetDamage();

}


//==================================================
// アースクェイク
// 1体分のダメージ後処理
//==================================================

function finishEarthquakeTargetDamage(){

    if(
        !earthquakeResolving
    ){

        return "DONE";

    }


    console.log(
        "★ アースクェイク 1体分ダメージ完了",
        earthquakeCurrentTarget?.card?.name
    );


    //----------------------------------
    // 破壊判定
    //
    // resolveBattle 内で
    //
    // resolveDestroy
    // removeDestroyedSummons
    // sortCoolTriggerQueue
    // clearDamage
    // startCoolTriggerResolution
    //
    // まで処理される
    //----------------------------------

    resolveBattle();


    //----------------------------------
    // クール時誘発能力が開始した場合
    //
    // マンドラゴラ等の能力が
    // 完全に終わるまでここで停止
    //----------------------------------

    if(
        typeof coolTriggerResolving !==
            "undefined" &&
        coolTriggerResolving
    ){

        console.log(
            "アースクェイク：クール時誘発能力待ち"
        );

        return "WAIT_COOL_TRIGGER";

    }


    //----------------------------------
    // 誘発なし
    // 次のサモンへ
    //----------------------------------

    earthquakeCurrentTarget =
        null;


    return resolveNextEarthquakeTarget();

}


//==================================================
// アースクェイク
// 全対象解決完了
//==================================================

function finishEarthquakeResolution(){

    //==================================
    // アースクェイク
    // 全対象解決完了
    //==================================

    if(
        !earthquakeResolving ||
        !earthquakeMagia
    ){

        console.warn(
            "finishEarthquakeResolution：",
            "アースクェイク解決状態がありません"
        );

        return;

    }


    //----------------------------------
    // 終了するマギアを保存
    //----------------------------------

    const resolvedMagia =
        earthquakeMagia;

    const isCpuMagia =
        resolvedMagia.owner ===
            ENEMY;


    console.log(
        "================================"
    );

    console.log(
        "★ アースクェイク 全対象解決完了"
    );

    console.log(
        "使用者：",
        resolvedMagia.owner
    );

    console.log(
        "================================"
    );


    //==================================
    // アースクェイク状態を先に解除
    //==================================
    //
    // この後 board.addCoolCard() によって
    // クール時能力などが発生しても、
    // アースクェイク本体の処理として
    // 再開されないようにする
    //==================================

    earthquakeResolving =
        false;

    earthquakeMagia =
        null;

    earthquakeTargets =
        [];

    earthquakeIndex =
        0;

    earthquakeCurrentTarget =
        null;


    //==================================
    // 各種待機状態を念のため解除
    //==================================

    if(
        typeof hydraMagiaWaiting !==
            "undefined"
    ){

        hydraMagiaWaiting =
            false;

    }


    if(
        typeof hydraWaitingMagia !==
            "undefined" &&
        hydraWaitingMagia ===
            resolvedMagia
    ){

        hydraWaitingMagia =
            null;

        hydraWaitingMagiaTarget =
            null;

        hydraWaitingMagiaOwnSummon =
            null;

    }


    if(
        typeof resistMagiaWaiting !==
            "undefined"
    ){

        resistMagiaWaiting =
            false;

    }


    if(
        typeof resistWaitingMagia !==
            "undefined" &&
        resistWaitingMagia ===
            resolvedMagia
    ){

        resistWaitingMagia =
            null;

        resistWaitingMagiaTarget =
            null;

        resistWaitingMagiaOwnSummon =
            null;

    }


    //==================================
    // マギアを手札から削除
    //==================================

    if(
        resolvedMagia.owner ===
        PLAYER
    ){

        board.handCards =
            board.handCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }
    else{

        enemyHandCards =
            enemyHandCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }


    //==================================
    // 通常マギア状態リセット
    //==================================

    resetMagiaState();


    summonCard =
        null;

    selectedCostCards =
        [];

    costConfirm =
        false;


    updateButtons();


    //==================================
    // アースクェイク本体をクールへ
    //==================================
    //
    // 各サモンについては
    // finishEarthquakeTargetDamage()
    // 内ですでに resolveBattle() 済み。
    //
    // そのためここでは
    // resolveBattle() を呼ばない。
    //==================================

    setTimeout(
        () => {

            //----------------------------------
            // ゲーム終了済みでも
            // 使用したマギア自体は
            // クールへ送る
            //----------------------------------

            resolvedMagia.area =
                "cool";


            board.addCoolCard(
                resolvedMagia,
                resolvedMagia.owner
            );


            console.log(
                "アースクェイク効果解決完了 → クールへ",
                resolvedMagia.name
            );


            //----------------------------------
            // CPU対象発光解除
            //----------------------------------

            if(
                isCpuMagia &&
                typeof clearCpuMagiaTargetHighlight ===
                    "function"
            ){

                clearCpuMagiaTargetHighlight();

            }


            //----------------------------------
            // UI更新
            //----------------------------------

            if(
                typeof updateGameState ===
                    "function"
            ){

                updateGameState();

            }


            if(
                typeof updateButtons ===
                    "function"
            ){

                updateButtons();

            }


            //----------------------------------
            // CPUマギアの場合
            // 次のCPU行動へ
            //----------------------------------

            if(
                isCpuMagia &&
                typeof runCpuTurnStep ===
                    "function"
            ){

                setTimeout(
                    () => {

                        //----------------------------------
                        // ゲーム終了中
                        //----------------------------------

                        if(
                            typeof battleGameEnding !==
                                "undefined" &&
                            battleGameEnding
                        ){

                            return;

                        }


                        //----------------------------------
                        // 投了処理中
                        //----------------------------------

                        if(
                            typeof battleGameConceded !==
                                "undefined" &&
                            battleGameConceded
                        ){

                            return;

                        }


                        //----------------------------------
                        // CPUターンでなければ
                        // 再開しない
                        //----------------------------------

                        if(
                            typeof game !==
                                "undefined" &&
                            game.currentPlayer !==
                                ENEMY
                        ){

                            return;

                        }


                        //----------------------------------
                        // クール時誘発処理中なら
                        // 再開しない
                        //----------------------------------

                        if(
                            typeof coolTriggerResolving !==
                                "undefined" &&
                            coolTriggerResolving
                        ){

                            return;

                        }


                        runCpuTurnStep();

                    },
                    500
                );

            }

        },
        500
    );

}
    
//=========================
// マギア効果処理
//=========================

function activateMagia(card){


    console.log(
        "マギア発動",
        card.name
    );



    //----------------------------------
    // 仮効果
    //----------------------------------

    alert(
        card.name +
        " を使用しました"
    );



    //----------------------------------
    // クールへ送る
    //----------------------------------

    card.area =
    "cool";


    board.addCoolCard(
        card,
        PLAYER
    );


}

//======================================
// マギア状態リセット
//======================================

function resetMagiaState(){

    //----------------------------------
    // ハイライト解除
    //----------------------------------

    clearMagiaHighlight();


    //==================================
    // 通常マギア状態初期化
    //==================================

    magiaCard =
        null;

    magiaTarget =
        null;

    magiaTargetMode =
        false;


    //==================================
    // 追加サモン選択状態初期化
    //
    // イグナイト等
    //==================================

    magiaOwnSummonSelectMode =
        false;

    magiaSelectedOwnSummon =
        null;


    //----------------------------------
    // 表示状態再更新
    //----------------------------------

    updateGameState();

}

function startMagia(card){

    //----------------------------------
    // カードプレイ枚数制限
    //
    // ジャックフロスト等
    //----------------------------------

    if(
        !canPlayCardByLimit(
            PLAYER
        )
    ){

        console.log(
            "マギア使用不可：",
            "カードプレイ枚数上限",
            getCardPlayCount(
                PLAYER
            ),
            "/",
            getCardPlayLimit(
                PLAYER
            ),
            "card=",
            card?.name
        );

        return;

    }


    //----------------------------------
    // 使用中なら終了
    //----------------------------------

    if(magiaCard){

        return;

    }


    //----------------------------------
    // 使用カード保存
    //----------------------------------

    magiaCard = card;

    magiaCard.owner =
        PLAYER;


    //----------------------------------
    // 攻撃可能サモンの発光解除
    //----------------------------------

    updateGameState();


    magiaTarget = null;


    //----------------------------------
    // 手札発光更新
    //----------------------------------

    updateGameState();


    magiaTarget = null;


    //----------------------------------
    // 対象選択開始
    //----------------------------------

    startMagiaTargetSelect(
        card
    );


    updateButtons();

}

//=========================
// マギアコスト選択開始
//=========================

function startMagiaCost(){

    console.log(
        "startMagiaCost",
        magiaCard,
        magiaTarget
    );


    //----------------------------------
    // コスト確認
    //----------------------------------

    if(!canPayCost(magiaCard)){

        alert(
            "コストが足りません"
        );

        magiaCard = null;
        magiaTarget = null;
        magiaTargetMode = false;

        return;

    }


    //----------------------------------
    // サモン処理と同じ変数を利用
    //----------------------------------

    summonCard = magiaCard;

    costTargetCard = magiaCard;

    selectedCostCards = [];

    costConfirm = false;


    //----------------------------------
    // 現在のコスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            magiaCard
        );


    //----------------------------------
    // 手札のコスト表示更新
    //----------------------------------

    if(
        magiaCard &&
        typeof magiaCard.refresh ===
            "function"
    ){

        magiaCard.refresh();

    }


    //----------------------------------
    // 行動案内をコスト選択に変更
    //----------------------------------

    if(currentCost > 0){

        showActionGuide(
            `コストゾーンに置くカードを<br>${currentCost}枚選んでください。`
        );

    }


    //----------------------------------
    // 0コストなら選択不要
    //----------------------------------

    if(currentCost === 0){

        costConfirm = true;

    }


    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();

}

function resolveMagia(){

    //----------------------------------
    // マギア確認
    //----------------------------------

    if(!magiaCard){

        console.error(
            "resolveMagia：magiaCardがありません"
        );

        return;
    }


    //==================================
    // 追加選択が必要なマギア
    //==================================

    if(
        magiaCard.effect &&
        magiaCard.effect.type === "forceCost"
    ){

        //----------------------------------
        // PLAYER → CPU
        // CPU手札が0枚なら効果なし
        //----------------------------------

        if(
            magiaCard.owner === PLAYER &&
            magiaTarget === ENEMY &&
            enemyHandCards.length === 0
        ){

            console.log(
                "ウィンドプレッシャー：CPU手札0枚",
                "効果なし"
            );

            const resolvedMagia = magiaCard;
            const resolvedTarget = magiaTarget;

            const isCpuMagia =
                resolvedMagia.owner === ENEMY;


            // マギアプレイ時サモン能力

            triggerSummonAbilitiesOnMagiaPlay(
                resolvedMagia.owner
            );


            // 手札から削除

            if(resolvedMagia.owner === PLAYER){

                board.handCards =
                    board.handCards.filter(
                        card => card !== resolvedMagia
                    );

            }
            else{

                enemyHandCards =
                    enemyHandCards.filter(
                        card => card !== resolvedMagia
                    );

            }


            // 効果解決完了

            setTimeout(
                () => {

                    if(
                        isCpuMagia &&
                        typeof clearCpuMagiaTargetHighlight ===
                            "function"
                    ){

                        clearCpuMagiaTargetHighlight(
                            resolvedTarget
                        );

                    }

                    resolveBattle();

                    resolvedMagia.area = "cool";

                    board.addCoolCard(
                        resolvedMagia,
                        resolvedMagia.owner
                    );

                    console.log(
                        "forceCostマギア効果解決完了 → クールへ",
                        resolvedMagia.name
                    );

                },
                5000
            );


            resetMagiaState();

            summonCard = null;

            selectedCostCards = [];

            costConfirm = false;

            updateButtons();

            return;
        }


        //----------------------------------
        // 通常の強制コスト選択
        //----------------------------------

        forceCostSource = "magia";

        startForceCostSelect(
            magiaTarget
        );

        return;
    }


    //==================================
    // 通常マギア
    //==================================

    const resolvedMagia = magiaCard;

    const resolvedTarget = magiaTarget;


    //----------------------------------
    // イグナイト等
    // 選択サモンを保存
    //----------------------------------

    const resolvedOwnSummon =
        magiaSelectedOwnSummon;


    const isCpuMagia =
        resolvedMagia.owner === ENEMY;

    //==================================
    // マギアプレイ時サモン能力
    //==================================

    triggerSummonAbilitiesOnMagiaPlay(
        resolvedMagia.owner
    );


    //----------------------------------
    // 効果発動
    //----------------------------------

    const effectResult =
        activateCardEffect(
            resolvedMagia,
            resolvedTarget,
            resolvedMagia.owner
        );


    //==================================
    // GAME OVER
    //==================================

    if(
        effectResult === "GAME_OVER"
    ){

        console.log(
            "マギア解決中にゲーム終了：",
            resolvedMagia.name
        );

        return;
    }


    //==================================
    // ヒュドラ待ち
    //==================================

    if(
        effectResult === "WAIT_HYDRA"
    ){

        console.log(
            "マギア解決停止：",
            resolvedMagia.name,
            "→ ヒュドラ待ち"
        );

        hydraMagiaWaiting = true;

        hydraWaitingMagia =
            resolvedMagia;

        hydraWaitingMagiaTarget =
            resolvedTarget;

        hydraWaitingMagiaOwnSummon =
            resolvedOwnSummon;

        return;
    }


    //==================================
    // ネレイド待ち
    //==================================

    if(
        effectResult === "WAIT_NEREID"
    ){

        console.log(
            "マギア解決停止：",
            resolvedMagia.name,
            "→ ネレイド待ち"
        );

        nereidWaitingMagia =
            resolvedMagia;

        nereidWaitingMagiaTarget =
            resolvedTarget;

        nereidWaitingMagiaOwnSummon =
            resolvedOwnSummon;

        return;
    }


    //==================================
    // クリスタルピーキング待ち
    //==================================

    if(
        effectResult ===
            "WAIT_CRYSTAL_PEEPING"
    ){

        console.log(
            "マギア解決停止：",
            resolvedMagia.name,
            "→ クリスタルピーキング待ち"
        );

        return;
    }


    //==================================
    // レジスト待ち
    //==================================

    if(
        effectResult === "WAIT_RESIST"
    ){

        console.log(
            "マギア解決停止：",
            resolvedMagia.name,
            "→ レジスト待ち"
        );

        resistMagiaWaiting = true;

        resistWaitingMagia =
            resolvedMagia;

        resistWaitingMagiaTarget =
            resolvedTarget;

        resistWaitingMagiaOwnSummon =
            resolvedOwnSummon;

        return;
    }


    //==================================
    // アースクェイク
    // クール時誘発能力待ち
    //==================================

    if(
        effectResult ===
            "WAIT_COOL_TRIGGER"
    ){

        console.log(
            "マギア解決停止：",
            resolvedMagia.name,
            "→ クール時誘発能力待ち"
        );

        // アースクェイク側が
        // マギア情報と進行状態を保持

        return;
    }


    //==================================
    // アースクェイク専用処理
    //==================================

    if(
        resolvedMagia.effect?.type ===
            "damageAllEnemySummons"
    ){

        console.log(
            "アースクェイク：",
            "専用解決処理へ移行"
        );

        return;
    }


    //==================================
    // ここから通常マギア終了処理
    //==================================


    //----------------------------------
    // 手札から削除
    //----------------------------------

    if(
        resolvedMagia.owner === PLAYER
    ){

        board.handCards =
            board.handCards.filter(
                card =>
                    card !== resolvedMagia
            );

    }
    else{

        enemyHandCards =
            enemyHandCards.filter(
                card =>
                    card !== resolvedMagia
            );

    }


    //==================================
    // 効果解決完了
    //==================================

    setTimeout(
        () => {


            //----------------------------------
            // イグナイト等
            // 選択した自分サモンをクールへ
            //----------------------------------

            resolveMagiaCoolOwnSummon(
                resolvedMagia,
                resolvedOwnSummon
            );


            //----------------------------------
            // 戦闘解決
            //----------------------------------

            resolveBattle();


            //----------------------------------
            // マギアをクールへ
            //----------------------------------

            resolvedMagia.area = "cool";

            board.addCoolCard(
                resolvedMagia,
                resolvedMagia.owner
            );


            console.log(
                "マギア効果解決完了 → クールへ",
                resolvedMagia.name
            );

        },
        1000
    );


    //----------------------------------
    // 状態リセット
    //----------------------------------

    resetMagiaState();

    summonCard = null;

    selectedCostCards = [];

    costConfirm = false;

    updateButtons();

}

//==================================================
// ヒュドラ
// 停止していたマギア解決を再開
//==================================================

function resumeMagiaAfterHydra(){

    //----------------------------------
    // 待機確認
    //----------------------------------

    if(
        !hydraMagiaWaiting ||
        !hydraWaitingMagia
    ){

        return false;

    }


    //----------------------------------
    // 保存情報
    //----------------------------------

    const resolvedMagia =
        hydraWaitingMagia;

    const resolvedTarget =
        hydraWaitingMagiaTarget;

    const resolvedOwnSummon =
        hydraWaitingMagiaOwnSummon;

    const isCpuMagia =
        resolvedMagia.owner ===
            ENEMY;


    console.log(
        "ヒュドラ：マギア解決再開",
        {
            magia:
                resolvedMagia.name,

            target:
                resolvedTarget?.card?.name ??
                resolvedTarget,

            owner:
                resolvedMagia.owner
        }
    );


    //==================================
    // ヒュドラ待機解除
    //==================================

    hydraMagiaWaiting =
        false;

    hydraWaitingMagia =
        null;

    hydraWaitingMagiaTarget =
        null;

    hydraWaitingMagiaOwnSummon =
        null;

    //==================================
    // アースクェイク解決中
    //==================================
    //
    // 通常マギアのように
    // マギア全体を終了させず、
    // 現在の1体分を完了して
    // 次の対象へ進む
    //==================================

    if(
        typeof earthquakeResolving !==
            "undefined" &&
        earthquakeResolving &&
        earthquakeMagia ===
            resolvedMagia
    ){

        console.log(
            "ヒュドラ後：アースクェイク再開",
            earthquakeCurrentTarget?.card?.name
        );


        //----------------------------------
        // ヒュドラ割り込み後なので
        // dealDamage() は再実行しない
        //----------------------------------

        finishEarthquakeTargetDamage();


        return true;

    }


    //==================================
    // マギアを手札から削除
    //==================================

    if(
        resolvedMagia.owner ===
            PLAYER
    ){

        board.handCards =
            board.handCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }
    else{

        enemyHandCards =
            enemyHandCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }


    //==================================
    // マギア状態リセット
    //==================================

    resetMagiaState();

    summonCard =
        null;

    selectedCostCards =
        [];

    costConfirm =
        false;


    updateButtons();


    //==================================
    // 効果解決完了
    //==================================

    setTimeout(
        () => {

            //----------------------------------
            // CPUマギア対象発光解除
            //----------------------------------

            if(
                isCpuMagia &&
                typeof clearCpuMagiaTargetHighlight ===
                    "function"
            ){

                clearCpuMagiaTargetHighlight(
                    resolvedTarget
                );

            }


            //----------------------------------
            // イグナイト等
            // 選択サモンをクールへ
            //----------------------------------

            resolveMagiaCoolOwnSummon(
                resolvedMagia,
                resolvedOwnSummon
            );


            //----------------------------------
            // 撃破解決
            //----------------------------------

            resolveBattle();


            //----------------------------------
            // マギアをクールへ
            //----------------------------------

            resolvedMagia.area =
                "cool";


            board.addCoolCard(
                resolvedMagia,
                resolvedMagia.owner
            );


            console.log(
                "ヒュドラ解決後：",
                "マギア効果解決完了 → クールへ",
                resolvedMagia.name
            );


            //----------------------------------
            // CPU行動再開
            //----------------------------------

            if(
                isCpuMagia &&
                typeof runCpuTurnStep ===
                    "function"
            ){

                setTimeout(
                    () => {

                        runCpuTurnStep();

                    },
                    500
                );

            }

        },
        1000
    );


    return true;

}

//======================================
// マギア対象選択開始
//======================================


function startMagiaTargetSelect(card){

    magiaCard = card;

    magiaTarget = null;

    magiaTargetMode = true;


    console.log(
        "マギア対象選択開始",
        card.name
    );

    //----------------------------------
    // 行動案内
    //----------------------------------

    showActionGuide(
        "対象を選んでください"
    );



    //----------------------------------
    // クールゾーン対象
    //----------------------------------

    const targets =
        card.effect?.target || [];


    if(
        targets.includes("playerCoolCard") ||
        targets.includes("playerCoolMagia") ||
        targets.includes("playerCoolSummon")
    ){

        startMagiaCoolTargetSelect();

        return;

    }


    //----------------------------------
    // 通常対象
    //----------------------------------

    highlightMagiaTargets();

}

//==================================================
// マギア：追加の自分サモン選択開始
//
// valueType:"ownSummonPower"
// coolOwnSummon:true
//
// イグナイト等
//==================================================

function startMagiaOwnSummonSelect(){

    //----------------------------------
    // 使用中マギア確認
    //----------------------------------

    if(
        !magiaCard ||
        !magiaCard.effect
    ){

        return;

    }


    //----------------------------------
    // 選択できるサモン確認
    //----------------------------------

    const selectableSummons =
        playerField.filter(
            summon =>
                summon &&
                !summon.destroyed
        );


    if(
        selectableSummons.length === 0
    ){

        console.warn(
            "追加サモン選択：",
            "選択できる自分のサモンがありません"
        );

        return;

    }


    //----------------------------------
    // 通常マギア対象選択終了
    //----------------------------------

    magiaTargetMode =
        false;


    clearMagiaHighlight();


    //----------------------------------
    // 追加選択開始
    //----------------------------------

    magiaOwnSummonSelectMode =
        true;

    magiaSelectedOwnSummon =
        null;


    //----------------------------------
    // 案内
    //----------------------------------

    showActionGuide(
        "パワーを参照する自分のサモンを選んでください"
    );


    //----------------------------------
    // 自分サモンを発光
    //----------------------------------

    selectableSummons.forEach(
        summon => {

            summon.view
                .getElement()
                .classList.add(
                    "magia-target"
                );

        }
    );


    console.log(
        "マギア：追加サモン選択開始",
        magiaCard.name
    );


    updateButtons();

}

//==================================================
// マギア：追加の自分サモン決定
//==================================================

function selectMagiaOwnSummon(
    summon
){

    //----------------------------------
    // 選択中確認
    //----------------------------------

    if(
        !magiaOwnSummonSelectMode ||
        !magiaCard
    ){

        return false;

    }


    //----------------------------------
    // 自分の場のサモンのみ
    //----------------------------------

    if(
        !summon ||
        summon.owner !== PLAYER ||
        summon.destroyed ||
        !playerField.includes(
            summon
        )
    ){

        return false;

    }


    //----------------------------------
    // 選択保存
    //----------------------------------

    magiaSelectedOwnSummon =
        summon;


    console.log(
        "マギア：追加サモン決定",
        {
            magia:
                magiaCard.name,

            damageTarget:
                magiaTarget?.card?.name ??
                magiaTarget,

            selectedSummon:
                summon.card?.name,

            power:
                getPower(
                    summon
                )
        }
    );


    //----------------------------------
    // 選択終了
    //----------------------------------

    magiaOwnSummonSelectMode =
        false;


    clearMagiaHighlight();


    //----------------------------------
    // 通常のマギアコスト選択へ
    //----------------------------------

    startMagiaCost();


    return true;

}

//======================================
// マギア対象種類
//======================================

function getMagiaTargetMode(card){


    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return null;

    }


    return card.effect.target;


}

//======================================
// マギア対象ハイライト
//======================================

function highlightMagiaTargets(){

    if(
        !magiaCard ||
        !magiaCard.effect ||
        !magiaCard.effect.target
    ){

        return;

    }


    //----------------------------------
    // 対象タイプ取得
    //----------------------------------

    const targets =
        magiaCard.effect.target;


    //----------------------------------
    // 相手サモン
    //----------------------------------

    if(
        targets.includes("enemySummon")
    ){

        enemyField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分サモン
    //----------------------------------

    if(
        targets.includes("playerSummon")
    ){

        playerField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分タテ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "playerVerticalSummon"
        )
    ){

        playerField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分ヨコ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "playerHorizontalSummon"
        )
    ){

        playerField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分・相手のヨコ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "horizontalSummon"
        )
    ){

        //----------------------------------
        // 自分の場
        //----------------------------------

        playerField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });


        //----------------------------------
        // 相手の場
        //----------------------------------

        enemyField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 相手タテ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "enemyVerticalSummon"
        )
    ){

        enemyField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 相手ヨコ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "enemyHorizontalSummon"
        )
    ){

        enemyField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分
    //----------------------------------

    if(
        targets.includes("player")
    ){

        document
            .getElementById(
                "player-icon"
            )
            ?.classList.add(
                "magia-target"
            );

    }


    //----------------------------------
    // 相手
    //----------------------------------

    if(
        targets.includes("enemy")
    ){

        document
            .getElementById(
                "enemy-player-icon"
            )
            ?.classList.add(
                "magia-target"
            );

    }


    //----------------------------------
    // 自分クールゾーン
    //----------------------------------

    if(
        targets.includes(
            "playerCoolCard"
        )
    ){

        board.playerCoolCards.forEach(card=>{

            card.getElement()
                .classList.add(
                    "magia-target"
                );

        });

    }

}

//======================================
// マギア対象タイプ ハイライト
//======================================

function highlightMagiaTargetType(
    targetType
){

    switch(targetType){

        //----------------------------------
        // 自分のタテ向きサモン
        //----------------------------------

        case "playerVerticalSummon":

            playerField.forEach(
                summon => {

                    if(
                        summon.owner === PLAYER &&
                        !summon.isRest
                    ){

                        summon.view
                            .getElement()
                            .classList.add(
                                "magia-target"
                            );

                    }

                }
            );

            break;


        //----------------------------------
        // 自分のヨコ向きサモン
        //----------------------------------

        case "playerHorizontalSummon":

            playerField.forEach(
                summon => {

                    if(
                        summon.owner === PLAYER &&
                        summon.isRest
                    ){

                        summon.view
                            .getElement()
                            .classList.add(
                                "magia-target"
                            );

                    }

                }
            );

            break;


        //----------------------------------
        // 自分
        //----------------------------------

        case "player":

            document
                .getElementById(
                    "player-icon"
                )
                ?.classList.add(
                    "magia-target"
                );

            break;


        //----------------------------------
        // クールゾーン
        //----------------------------------

        case "playerCoolCard":
        case "playerCoolMagia":
        case "playerCoolSummon":

            document
                .getElementById(
                    "player-cool-zone-button"
                )
                ?.classList.add(
                    "magia-target"
                );

            break;

    }

}


//======================================
// マギア対象表示解除
//======================================

function clearMagiaHighlight(){


    document
    .querySelectorAll(
        ".magia-target"
    )
    .forEach(element=>{


        element.classList.remove(
            "magia-target"
        );


    });


}


//======================================
// マギア使用可能判定
//======================================

function canUseMagia(card){

    //----------------------------------
    // 対象指定なし
    //----------------------------------

    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return true;

    }


    const targets =
        card.effect.target;


    const condition =
        card.effect.condition;


    //==================================
    // 向き条件付きサモン
    //
    // トルネード等
    //
    // effect.condition.orientation
    // を持つカード
    //==================================

    if(
        condition &&
        condition.orientation
    ){

        const orientation =
            condition.orientation;


        //----------------------------------
        // 対象候補
        //----------------------------------

        const targetSummons = [];


        //----------------------------------
        // 自分サモン
        //----------------------------------

        if(
            targets.includes(
                "playerSummon"
            ) ||
            targets.includes(
                "selfSummon"
            )
        ){

            targetSummons.push(
                ...playerField
            );

        }


        //----------------------------------
        // 相手サモン
        //----------------------------------

        if(
            targets.includes(
                "enemySummon"
            )
        ){

            targetSummons.push(
                ...enemyField
            );

        }


        //----------------------------------
        // 条件に合う対象が存在するか
        //----------------------------------

        const canUseTarget =
            targetSummons.some(
                summon => {

                    //----------------------------------
                    // 存在しない
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
                    // ヨコ向き指定
                    //----------------------------------

                    if(
                        orientation ===
                            "horizontal" &&
                        !summon.isRest
                    ){

                        return false;

                    }


                    //----------------------------------
                    // タテ向き指定
                    //----------------------------------

                    if(
                        orientation ===
                            "vertical" &&
                        summon.isRest
                    ){

                        return false;

                    }


                    //----------------------------------
                    // マギア対象不可
                    // クラーケン等
                    //----------------------------------

                    if(
                        typeof isMagiaTargetBlocked ===
                            "function" &&
                        isMagiaTargetBlocked(
                            card,
                            summon
                        )
                    ){

                        return false;

                    }


                    //----------------------------------
                    // 使用可能対象
                    //----------------------------------

                    return true;

                }
            );


        console.log(
            "マギア使用可能判定：向き条件",
            {
                card:
                    card.name,

                orientation:
                    orientation,

                result:
                    canUseTarget
            }
        );


        //----------------------------------
        // 向き条件付きカードは
        // ここで使用可否を確定
        //----------------------------------

        return canUseTarget;

    }


    //==================================
    // horizontalSummon
    //
    // 別形式のカード用として残す
    //==================================

    if(
        targets.includes(
            "horizontalSummon"
        )
    ){

        const fieldSummons = [
            ...playerField,
            ...enemyField
        ];


        const canUseTarget =
            fieldSummons.some(
                summon => {

                    if(
                        !summon ||
                        summon.destroyed ||
                        !summon.isRest
                    ){

                        return false;

                    }


                    if(
                        typeof isMagiaTargetBlocked ===
                            "function" &&
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


        return canUseTarget;

    }


    //----------------------------------
    // 自分サモン
    //----------------------------------

    if(
        targets.includes(
            "playerSummon"
        ) &&
        playerField.some(
            summon =>
                summon &&
                !summon.destroyed
        )
    ){

        return true;

    }


    //----------------------------------
    // 相手サモン
    //----------------------------------

    if(
        targets.includes(
            "enemySummon"
        ) &&
        enemyField.some(
            summon =>
                summon &&
                !summon.destroyed
        )
    ){

        return true;

    }


    //----------------------------------
    // 自分タテ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "playerVerticalSummon"
        )
    ){

        if(
            playerField.some(
                summon =>
                    summon &&
                    !summon.destroyed &&
                    !summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分ヨコ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "playerHorizontalSummon"
        )
    ){

        if(
            playerField.some(
                summon =>
                    summon &&
                    !summon.destroyed &&
                    summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 相手タテ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "enemyVerticalSummon"
        )
    ){

        if(
            enemyField.some(
                summon =>
                    summon &&
                    !summon.destroyed &&
                    !summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 相手ヨコ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "enemyHorizontalSummon"
        )
    ){

        if(
            enemyField.some(
                summon =>
                    summon &&
                    !summon.destroyed &&
                    summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分プレイヤー
    //----------------------------------

    if(
        targets.includes(
            "player"
        )
    ){

        return true;

    }


    //----------------------------------
    // 相手プレイヤー
    //----------------------------------

    if(
        targets.includes(
            "enemy"
        )
    ){

        return true;

    }


    //----------------------------------
    // 自分クールゾーンのカード
    //----------------------------------

    if(
        targets.includes(
            "playerCoolCard"
        ) &&
        board.playerCoolCards.length > 0
    ){

        return true;

    }


    //----------------------------------
    // 自分クールゾーンのサモン
    //
    // クレイクリエイト等
    //----------------------------------

    if(
        targets.includes(
            "playerCoolSummon"
        ) &&
        board.playerCoolCards.some(
            card =>
                card.type === "サモン"
        )
    ){

        return true;

    }


    //----------------------------------
    // 自分クールゾーンのマギア
    //----------------------------------

    if(
        targets.includes(
            "playerCoolMagia"
        ) &&
        board.playerCoolCards.some(
            card =>
                card.type === "マギア"
        )
    ){

        return true;

    }


    //----------------------------------
    // 使用可能対象なし
    //----------------------------------

    return false;

}

//======================================
// マギア対象タイプ 使用可能判定
//======================================

function canSelectMagiaTargetType(
    targetType
){

    switch(targetType){

        //----------------------------------
        // 自分のタテ向きサモン
        //----------------------------------

        case "playerVerticalSummon":

            return playerField.some(
                summon =>
                    summon.owner === PLAYER &&
                    !summon.isRest
            );


        //----------------------------------
        // 自分のヨコ向きサモン
        //----------------------------------

        case "playerHorizontalSummon":

            return playerField.some(
                summon =>
                    summon.owner === PLAYER &&
                    summon.isRest
            );


        //----------------------------------
        // 自分のクールゾーンのカード
        //----------------------------------

        case "playerCoolCard":

            return board.playerCoolCards.length > 0;


        //----------------------------------
        // 自分のクールゾーンのマギア
        //----------------------------------

        case "playerCoolMagia":

            return board.playerCoolCards.some(
                card =>
                    card.type === "マギア"
            );


        //----------------------------------
        // 自分のクールゾーンのサモン
        //----------------------------------

        case "playerCoolSummon":

            return board.playerCoolCards.some(
                card =>
                    card.type === "サモン"
            );


        //----------------------------------
        // 自分
        //----------------------------------

        case "player":

            return true;


        //----------------------------------
        // 未対応
        //----------------------------------

        default:

            return false;

    }

}

//======================================
// マギア対象タイプ取得
//======================================

function getMagiaTargetFromCard(
    card,
    targetType
){

    switch(targetType){

        //----------------------------------
        // 自分のタテ向きサモン
        //----------------------------------

        case "playerVerticalSummon":{

            if(
                card.area !== "field"
            ){

                return null;

            }


            const summon =
                findSummonByView(card);


            if(
                summon &&
                summon.owner === PLAYER &&
                !summon.isRest
            ){

                return summon;

            }

            return null;

        }


        //----------------------------------
        // 自分のヨコ向きサモン
        //----------------------------------

        case "playerHorizontalSummon":{

            if(
                card.area !== "field"
            ){

                return null;

            }


            const summon =
                findSummonByView(card);


            if(
                summon &&
                summon.owner === PLAYER &&
                summon.isRest
            ){

                return summon;

            }

            return null;

        }


        default:

            return null;

    }

}

//======================================
// マギア対象存在確認
//======================================

function canUseMagiaTarget(card){

    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return false;

    }


    //----------------------------------
    // 自分サモン
    //----------------------------------

    for(
        const summon of playerField
    ){

        if(
            isValidMagiaTarget(
                card,
                summon
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 相手サモン
    //----------------------------------

    for(
        const summon of enemyField
    ){

        if(
            isValidMagiaTarget(
                card,
                summon
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分プレイヤー
    //----------------------------------

    if(
        isValidMagiaTarget(
            card,
            PLAYER
        )
    ){

        return true;

    }


    //----------------------------------
    // 相手プレイヤー
    //----------------------------------

    if(
        isValidMagiaTarget(
            card,
            ENEMY
        )
    ){

        return true;

    }


    //----------------------------------
    // クールゾーン
    //----------------------------------

    const targets =
        card.effect.target;


    //----------------------------------
    // 自分クール：カード
    //----------------------------------

    if(
        targets.includes(
            "playerCoolCard"
        ) &&
        board.playerCoolCards.length > 0
    ){

        return true;

    }


    //----------------------------------
    // 自分クール：マギア
    //----------------------------------

    if(
        targets.includes(
            "playerCoolMagia"
        ) &&
        board.playerCoolCards.some(
            card =>
                card.type === "マギア"
        )
    ){

        return true;

    }


    //----------------------------------
    // 自分クール：サモン
    //----------------------------------

    if(
        targets.includes(
            "playerCoolSummon"
        ) &&
        board.playerCoolCards.some(
            card =>
                card.type === "サモン"
        )
    ){

        return true;

    }


    return false;

}

//======================================
// マギア対象不可判定
//======================================

function isMagiaTargetBlocked(
    card,
    target
){

    if(
        !card ||
        !target ||
        !(target instanceof Summon)
    ){

        return false;

    }


    //----------------------------------
    // 相手のマギア対象にならない
    //
    // card.ability ではなく
    // 現在Summonが持っている能力を確認
    //
    // ドッペルゲンガーのコピーにも対応
    //----------------------------------

    if(
        hasSummonAbility(
            target,
            "cannotBeMagiaTarget"
        )
    ){

        //----------------------------------
        // 自分のマギアは対象にできる
        //----------------------------------

        if(
            target.owner !==
            card.owner
        ){

            console.log(
                "マギア対象不可",
                target.card.name,
                "cardOwner=",
                card.owner,
                "targetOwner=",
                target.owner,
                "ability=",
                "cannotBeMagiaTarget"
            );


            return true;

        }

    }


    return false;

}




//======================================
// マギア対象判定
//======================================


function isValidMagiaTarget(
    card,
    target
){

    if(
        !card ||
        !card.effect ||
        !card.effect.target ||
        !target
    ){

        return false;

    }


    const targets =
        card.effect.target;


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        target instanceof Summon
    ){

        //----------------------------------
        // 共通対象不可判定
        //----------------------------------

        if(
            isMagiaTargetBlocked(
                card,
                target
            )
        ){

            return false;

        }


        //==================================
        // effect.condition による
        // サモン共通条件
        //==================================

        const condition =
            card.effect.condition;


        //----------------------------------
        // 向き条件
        //----------------------------------

        if(
            condition?.orientation ===
            "horizontal"
        ){

            if(
                !target.isRest
            ){

                return false;

            }

        }


        if(
            condition?.orientation ===
            "vertical"
        ){

            if(
                target.isRest
            ){

                return false;

            }

        }


        //----------------------------------
        // 自分サモン
        //----------------------------------

        if(
            targets.includes(
                "playerSummon"
            ) &&
            target.owner === PLAYER
        ){

            return true;

        }


        //----------------------------------
        // 相手サモン
        //----------------------------------

        if(
            targets.includes(
                "enemySummon"
            ) &&
            target.owner === ENEMY
        ){

            return true;

        }


        //----------------------------------
        // 自分タテ向き
        //----------------------------------

        if(
            targets.includes(
                "playerVerticalSummon"
            ) &&
            target.owner === PLAYER &&
            !target.isRest
        ){

            return true;

        }

        //==================================
// 自分・相手のヨコ向きサモン
// クイックアクション等
//==================================

if(
    targets.includes(
        "horizontalSummon"
    ) &&
    target.isRest &&
    !target.destroyed &&
    (
        target.owner === PLAYER ||
        target.owner === ENEMY
    )
){

    return true;

}


        //----------------------------------
        // 自分ヨコ向き
        //----------------------------------

        if(
            targets.includes(
                "playerHorizontalSummon"
            ) &&
            target.owner === PLAYER &&
            target.isRest
        ){

            return true;

        }


        //----------------------------------
        // 相手タテ向き
        //----------------------------------

        if(
            targets.includes(
                "enemyVerticalSummon"
            ) &&
            target.owner === ENEMY &&
            !target.isRest
        ){

            return true;

        }


        //----------------------------------
        // 相手ヨコ向き
        //----------------------------------

        if(
            targets.includes(
                "enemyHorizontalSummon"
            ) &&
            target.owner === ENEMY &&
            target.isRest
        ){

            return true;

        }


        return false;

    }


    //----------------------------------
    // 自分
    //----------------------------------

    if(
        target === PLAYER ||
        target === "player"
    ){

        return targets.includes(
            "player"
        );

    }


    //----------------------------------
    // 相手
    //----------------------------------

    if(
        target === ENEMY ||
        target === "enemy"
    ){

        return targets.includes(
            "enemy"
        );

    }


    //----------------------------------
    // 自分クールゾーン
    //----------------------------------

    if(
        target.area === "cool" &&
        target.owner === PLAYER &&
        targets.includes(
            "playerCoolCard"
        )
    ){

        return true;

    }


    //----------------------------------
    // その他
    //----------------------------------

    return false;

}
//======================================
// マギア：クールゾーン対象選択
//======================================

function startMagiaCoolTargetSelect(){

    console.log(
        "マギア：クールゾーン対象選択開始"
    );


    const modal =
        document.getElementById(
            "cool-modal"
        );


    const title =
        modal.querySelector("h2");


    const list =
        document.getElementById(
            "cool-list"
        );


    //----------------------------------
    // タイトル
    //----------------------------------

    title.textContent =
        "対象カードを選択";


    //----------------------------------
    // リスト初期化
    //----------------------------------

    list.innerHTML = "";


    //----------------------------------
    // 自分のクールゾーン
    //----------------------------------

    const cards =
        board.playerCoolCards;


    //----------------------------------
    // カードなし
    //----------------------------------

    if(cards.length === 0){

        list.innerHTML =
            "<p>カードはありません</p>";

    }else{


        cards.forEach(card=>{

            const img =
                document.createElement("img");


            img.src =
                card.image;


            img.className =
                "cool-card";


            //----------------------------------
            // マギア対象として選択可能なら発光
            //----------------------------------

            if(
                isValidMagiaCoolTarget(
                    magiaCard,
                    card
                )
            ){

                img.classList.add(
                    "magia-target"
                );

            }


            //----------------------------------
            // マギア対象クリック
            //----------------------------------

            img.onclick = ()=>{

                //----------------------------------
                // 対象判定
                //----------------------------------

                if(
                    !isValidMagiaCoolTarget(
                        magiaCard,
                        card
                    )
                ){

                    console.log(
                        "マギア対象外",
                        card.name
                    );

                    return;

                }


                //----------------------------------
                // 対象決定
                //----------------------------------

                magiaTarget =
                    card;


                magiaTargetMode =
                    false;


                console.log(
                    "マギア対象決定：クール",
                    card.name
                );


                //----------------------------------
                // モーダルを閉じる
                //----------------------------------

                modal.style.display =
                    "none";

                modal.classList.remove(
                    "active"
                );


                //----------------------------------
                // 発光解除
                //----------------------------------

                clearMagiaHighlight();


                //----------------------------------
                // コスト選択
                //----------------------------------

                startMagiaCost();

            };


            list.appendChild(img);

        });

    }


    //----------------------------------
    // 表示
    //----------------------------------

    modal.style.display =
        "block";


    modal.classList.add(
        "active"
    );

}

//======================================
// マギア：クールゾーン対象判定
//======================================

function isValidMagiaCoolTarget(
    card,
    target
){

    if(
        !card ||
        !card.effect ||
        !card.effect.target ||
        !target
    ){

        return false;

    }


    //----------------------------------
    // 自分のクールゾーンのカード
    //----------------------------------

    if(
        card.effect.target.includes(
            "playerCoolCard"
        )
    ){

        if(
            board.playerCoolCards.includes(
                target
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分のクールゾーンのマギア
    //----------------------------------

    if(
        card.effect.target.includes(
            "playerCoolMagia"
        )
    ){

        if(
            board.playerCoolCards.includes(
                target
            ) &&
            target.type === "マギア"
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分のクールゾーンのサモン
    //----------------------------------

    if(
        card.effect.target.includes(
            "playerCoolSummon"
        )
    ){

        //----------------------------------
        // サモンか確認
        //----------------------------------

        if(
            !board.playerCoolCards.includes(
                target
            ) ||
            target.type !== "サモン"
        ){

            return false;

        }


        //----------------------------------
        // 対象によってコストが変化する場合
        //----------------------------------

        if(
            card.effect.costDownElement &&
            card.effect.costDownValue
        ){

            //----------------------------------
            // 使用カード以外の手札枚数
            //----------------------------------

            const handCount =
                board.handCards.filter(
                    handCard =>
                        handCard !== card
                ).length;


            //----------------------------------
            // 通常の現在コスト
            //----------------------------------

            let requiredCost =
                getCurrentCardCost(
                    card
                );


            //----------------------------------
            // 対象属性
            //----------------------------------

            const targetElement =
                target.elementType ??
                target.element ??
                null;


            //----------------------------------
            // 対象によるコスト軽減
            //----------------------------------

            if(
                targetElement ===
                    card.effect.costDownElement
            ){

                requiredCost -=
                    Number(
                        card.effect.costDownValue
                    ) || 0;

            }


            requiredCost =
                Math.max(
                    0,
                    requiredCost
                );


            //----------------------------------
            // 支払い可能なら対象にできる
            //----------------------------------

            return (
                handCount >=
                requiredCost
            );

        }


        //----------------------------------
        // 通常
        //----------------------------------

        return true;

    }


    return false;

}

//======================================
// ウインドプレッシャー
// 相手手札選択開始
//======================================
//======================================
// 強制コスト選択開始
//
// ・ウインドプレッシャー
// ・スフィンクス
// ・カリュブディス
//======================================

function startForceCostSelect(target){

    console.log(
        "強制コスト選択開始",
        {
            target:
                target,

            source:
                forceCostSource
        }
    );


    //----------------------------------
    // 選択プレイヤー
    //----------------------------------

    forceCostPlayer =
        target;


    forceCostMode =
        true;


    selectedForceCostCard =
        null;


    //----------------------------------
    // 対象プレイヤーの手札確認
    //----------------------------------

    const targetHand =
        target === PLAYER
            ?
            board.handCards
            :
            enemyHandCards;


    //==================================
    // 手札がない
    //==================================

    if(
        !targetHand ||
        targetHand.length === 0
    ){

        console.log(
            "強制コスト：",
            target === PLAYER
                ?
                "PLAYER"
                :
                "CPU",
            "の手札なし",
            "source=",
            forceCostSource
        );


        //----------------------------------
        // 発生元を保存
        //----------------------------------

        const resolvedSource =
            forceCostSource;


        //----------------------------------
        // 選択状態解除
        //----------------------------------

        forceCostMode =
            false;


        forceCostPlayer =
            null;


        selectedForceCostCard =
            null;


        //----------------------------------
        // PLAYER選択案内を消す
        //----------------------------------

        if(
            target === PLAYER
        ){

            hideActionGuide();

        }


        //==================================
        // カリュブディス
        //==================================

        if(
            resolvedSource ===
                "charybdis"
        ){

            console.log(
                "カリュブディス：",
                "攻撃側の手札が0枚のため効果なし"
            );


            forceCostSource =
                null;


            charybdisCurrentTrigger =
                null;


            //----------------------------------
            // 次のカリュブディス誘発へ
            //
            // 残っていなければ
            // 攻撃処理が再開される
            //----------------------------------

            setTimeout(
                ()=>{

                    resolveNextCharybdisTrigger();

                },
                500
            );


            return;

        }


        //==================================
        // スフィンクス
        //==================================

        if(
            resolvedSource ===
                "sphinx"
        ){

            console.log(
                "スフィンクス：",
                "相手の手札が0枚のため効果なし"
            );


            //----------------------------------
            // resolveSphinxForceCost() 側で
            // forceCostSource も解除する
            //----------------------------------

            resolveSphinxForceCost();


            return;

        }


        //==================================
        // ウインドプレッシャー
        //==================================

        forceCostSource =
            null;


        resolveMagiaAfterForceCost();


        return;

    }


    //==================================
    // CPUが選択する場合
    //==================================

    if(
        target === ENEMY
    ){

        cpuForceCostSelect();

        return;

    }


    //==================================
    // PLAYERが選択する場合
    //==================================

    if(
        target === PLAYER
    ){

        //==================================
        // カリュブディス
        //==================================

        if(
            forceCostSource ===
                "charybdis"
        ){

            showActionGuide(
                "カリュブディスの能力が発動しました。<br>" +
                "手札を1枚コストゾーンに置いてください。"
            );

        }


        //==================================
        // スフィンクス
        //==================================

        else if(
            forceCostSource ===
                "sphinx"
        ){

            showActionGuide(
                "スフィンクスの能力が発動しました<br>" +
                "手札を1枚コストゾーンに置いてください"
            );

        }


        //==================================
        // ウインドプレッシャー
        //==================================

        else{

            showActionGuide(
                "手札を1枚コストゾーンに置いてください"
            );

        }


        //----------------------------------
        // PLAYER手札を発光
        //----------------------------------

        updateHandHighlight();


        //----------------------------------
        // ボタン更新
        //----------------------------------

        updateButtons();


        return;

    }


//----------------------------------
// 想定外
//----------------------------------

console.warn(
    "強制コスト：",
    "対象プレイヤーが不正",
    target
);


//----------------------------------
// 発生元を保存
//----------------------------------

const resolvedSource =
    forceCostSource;


//----------------------------------
// 強制コスト状態解除
//----------------------------------

forceCostMode =
    false;


forceCostPlayer =
    null;


selectedForceCostCard =
    null;


forceCostSource =
    null;


//==================================
// スフィンクス
//==================================

if(
    resolvedSource ===
        "sphinx"
){

    console.warn(
        "スフィンクス：",
        "強制コスト対象が不正のため攻撃終了"
    );


    sphinxAttackWaiting =
        false;


    sphinxAttackAttacker =
        null;


    sphinxAttackTarget =
        null;


    if(attackResolving){

        finishAttack();

    }


    return;

}


//==================================
// カリュブディス
//==================================

if(
    resolvedSource ===
        "charybdis"
){

    console.warn(
        "カリュブディス：",
        "強制コスト対象が不正のため攻撃終了"
    );


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


    if(attackResolving){

        finishAttack();

    }


    return;

}


//==================================
// ウインドプレッシャー等
//==================================

if(
    typeof resolveMagiaAfterForceCost ===
        "function"
){

    resolveMagiaAfterForceCost();

}

}


//======================================
// 強制コストカード選択
//======================================

function selectForceCostCard(card){

    console.log(
        "ウインドプレッシャー：コストカード選択",
        card.name
    );


    //----------------------------------
    // 強制コスト選択中でなければ無効
    //----------------------------------

    if(!forceCostMode){

        return;

    }


    //----------------------------------
    // プレイヤーの手札以外は選択不可
    //----------------------------------

    if(
        forceCostPlayer !== PLAYER ||
        card.area !== "hand"
    ){

        return;

    }


    //----------------------------------
    // 前回の選択を解除
    //----------------------------------

    if(selectedForceCostCard){

        selectedForceCostCard.setSelected(
            false
        );

    }


    //----------------------------------
    // 今回のカードを選択
    //----------------------------------

    selectedForceCostCard =
        card;

    card.setSelected(true);


    //----------------------------------
    // カード情報表示
    //----------------------------------

    showCardInfo(card);


    //----------------------------------
    // 決定・キャンセルを表示
    //----------------------------------

    updateButtons();


    console.log(
        "ウインドプレッシャー：コストカード選択中",
        card.name
    );

}


function cancelForceCostCard(){

    console.log(
        "ウインドプレッシャー：コストカード選択キャンセル"
    );


    //----------------------------------
    // 選択解除
    //----------------------------------

    if(selectedForceCostCard){

        selectedForceCostCard.setSelected(
            false
        );

    }


    selectedForceCostCard =
        null;


    //----------------------------------
    // カード情報を閉じる
    //----------------------------------

    clearHandSelection();


    //----------------------------------
    // 再び「1枚選んでください」の状態
    //----------------------------------

    showActionGuide(
        "手札を1枚コストゾーンに置いてください"
    );


    updateButtons();

}


//======================================
// 強制コスト選択後
// マギア解決
//======================================

//======================================
// 強制コストカード決定
//
// ・ウインドプレッシャー
// ・スフィンクス
// ・カリュブディス
//
// 共通処理
//======================================

function confirmForceCostCard(){

    //----------------------------------
    // 選択確認
    //----------------------------------

    if(
        !forceCostMode ||
        forceCostPlayer !== PLAYER ||
        !selectedForceCostCard
    ){

        return;

    }


    console.log(
        "強制コストカード決定",
        selectedForceCostCard.name,
        "source=",
        forceCostSource
    );


    //----------------------------------
    // 発生元を保存
    //
    // この後 forceCostSource が
    // 変更されても判定できるようにする
    //----------------------------------

    const resolvedSource =
        forceCostSource;


    //----------------------------------
    // 使用中のマギアを保存
    //
    // ウインドプレッシャーの場合に使用
    //----------------------------------

    const resolvedMagia =
        magiaCard;


    //----------------------------------
    // 選択カードを保存
    //----------------------------------

    const selectedCard =
        selectedForceCostCard;


    //----------------------------------
    // コストゾーンへ移動
    //----------------------------------

    moveToCost(
        selectedCard
    );


    //----------------------------------
    // 選択解除
    //----------------------------------

    selectedForceCostCard =
        null;


    //----------------------------------
    // 案内を消す
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // 強制コスト選択終了
    //----------------------------------

    forceCostMode =
        false;

    forceCostPlayer =
        null;


    //----------------------------------
    // ハイライト更新
    //----------------------------------

    updateGameState();

    updateButtons();


    //==================================
    // カリュブディス
    //==================================

    if(
        resolvedSource ===
            "charybdis"
    ){

        console.log(
            "カリュブディス：",
            "PLAYER強制コスト選択完了",
            selectedCard.name
        );


        //----------------------------------
        // 今回の強制コスト処理終了
        //----------------------------------

        forceCostSource =
            null;


        //----------------------------------
        // 現在の誘発を解決済みにする
        //----------------------------------

        charybdisCurrentTrigger =
            null;


        //----------------------------------
        // UI更新
        //----------------------------------

        updateGameState();

        updateButtons();


        //==================================
        // 次のカリュブディスへ
        //
        // まだ誘発が残っていれば次を処理
        // 全部終われば攻撃を再開
        //==================================

        setTimeout(
            ()=>{

                resolveNextCharybdisTrigger();

            },
            500
        );


        return;

    }


    //==================================
    // スフィンクス
    //==================================

    if(
        resolvedSource ===
            "sphinx"
    ){

        resolveSphinxForceCost();

        return;

    }


    //==================================
    // ウインドプレッシャー
    //==================================

    forceCostSource =
        null;


    resolveMagiaAfterForceCost(
        resolvedMagia,
        PLAYER
    );


    //----------------------------------
    // 使用可能カードの発光を復帰
    //----------------------------------

    if(
        game.currentPlayer === PLAYER
    ){

        updateUsableCardHighlight();

    }

}


//======================================
// CPUによる強制コスト選択
//======================================

function cpuForceCostSelect(){

    //----------------------------------
    // 発生元を確認
    //----------------------------------

    const source =
        forceCostSource;


    console.log(
        "CPU強制コスト選択",
        "source=",
        source
    );


    //==================================
    // カリュブディス
    //
    // 相手のサモンがアタックしたとき、
    // 相手は手札を1枚選び、
    // コストゾーンに伏せる。
    //
    // CPUがアタックした場合は
    // CPU自身の手札から1枚選ぶ
    //==================================

    if(
        source ===
            "charybdis"
    ){

        //----------------------------------
        // CPU手札なし
        //----------------------------------

        if(
            enemyHandCards.length === 0
        ){

            console.log(
                "CPU：カリュブディス能力",
                "手札なし"
            );


            //----------------------------------
            // 強制コスト状態解除
            //----------------------------------

            forceCostMode =
                false;

            forceCostPlayer =
                null;

            forceCostSource =
                null;


            //----------------------------------
            // 現在のカリュブディス誘発終了
            //----------------------------------

            charybdisCurrentTrigger =
                null;


            //----------------------------------
            // 次のカリュブディスへ
            //----------------------------------

            setTimeout(
                ()=>{

                    resolveNextCharybdisTrigger();

                },
                500
            );


            return;

        }


        //----------------------------------
        // CPUが手札をランダム選択
        //----------------------------------

        const card =
            enemyHandCards[
                Math.floor(
                    Math.random() *
                    enemyHandCards.length
                )
            ];


        console.log(
            "CPU：カリュブディス能力",
            "コストゾーンに置くカード",
            card.name
        );


        //----------------------------------
        // バトルログ
        //----------------------------------

        if(
            typeof addBattleLog ===
                "function"
        ){

            addBattleLog(
                `CPU：${card.name}をコストゾーンに置いた`
            );

        }


        //----------------------------------
        // コストへ移動
        //
        // 既存のCPU用処理を使用
        //----------------------------------

        moveEnemyToCost(
            card
        );


        //----------------------------------
        // 強制コスト状態解除
        //----------------------------------

        forceCostMode =
            false;

        forceCostPlayer =
            null;

        forceCostSource =
            null;


        //----------------------------------
        // 現在のカリュブディス誘発終了
        //----------------------------------

        charybdisCurrentTrigger =
            null;


        //----------------------------------
        // UI更新
        //----------------------------------

        updateGameState();

        updateButtons();


        //----------------------------------
        // 次のカリュブディスへ
        //
        // 複数いれば次を解決
        // 全部終われば攻撃再開
        //----------------------------------

        setTimeout(
            ()=>{

                resolveNextCharybdisTrigger();

            },
            500
        );


        return;

    }


    //==================================
    // スフィンクス
    //==================================

    if(
        source ===
            "sphinx"
    ){

        //----------------------------------
        // CPU手札なし
        //----------------------------------

        if(
            enemyHandCards.length === 0
        ){

            console.log(
                "CPU：スフィンクス能力",
                "対象手札なし"
            );


            forceCostMode =
                false;


            forceCostPlayer =
                null;


            //----------------------------------
            // スフィンクスの攻撃再開
            //----------------------------------

            resolveSphinxForceCost();


            return;

        }


        //----------------------------------
        // CPUが手札をランダム選択
        //----------------------------------

        const card =
            enemyHandCards[
                Math.floor(
                    Math.random() *
                    enemyHandCards.length
                )
            ];


        console.log(
            "CPU：スフィンクス能力",
            "コストゾーンに置くカード",
            card.name
        );


        //----------------------------------
        // コストへ移動
        //----------------------------------

        moveEnemyToCost(
            card
        );


        //----------------------------------
        // 状態解除
        //----------------------------------

        forceCostMode =
            false;


        forceCostPlayer =
            null;


        //----------------------------------
        // UI更新
        //----------------------------------

        updateGameState();

        updateButtons();


        //----------------------------------
        // スフィンクスの攻撃再開
        //----------------------------------

        resolveSphinxForceCost();


        return;

    }


    //==================================
    // ここからウインドプレッシャー
    //==================================


    //----------------------------------
    // マギア確認
    //----------------------------------

if(!magiaCard){

    console.error(
        "cpuForceCostSelect：magiaCardがありません"
    );


    //----------------------------------
    // 強制コスト状態解除
    //----------------------------------

    forceCostMode =
        false;


    forceCostPlayer =
        null;


    selectedForceCostCard =
        null;


    forceCostSource =
        null;


    //----------------------------------
    // UI更新
    //----------------------------------

    updateGameState();


    updateButtons();


    return;

}


    //----------------------------------
    // 使用中のマギアを保存
    //----------------------------------

    const resolvedMagia =
        magiaCard;


    //----------------------------------
    // 手札なし
    //----------------------------------

    if(
        enemyHandCards.length === 0
    ){

        console.log(
            "CPU：ウインドプレッシャー対象手札なし"
        );


        forceCostMode =
            false;


        forceCostPlayer =
            null;


        //----------------------------------
        // 発生元解除
        //----------------------------------

        forceCostSource =
            null;


        //----------------------------------
        // マギア解決
        //----------------------------------

        resolveMagiaAfterForceCost(
            resolvedMagia,
            ENEMY
        );


        return;

    }


    //----------------------------------
    // CPUが選択
    //----------------------------------

    const card =
        enemyHandCards[
            Math.floor(
                Math.random() *
                enemyHandCards.length
            )
        ];


    console.log(
        "CPU：ウインドプレッシャー対象カード",
        card.name
    );


    //----------------------------------
    // コストへ移動
    //----------------------------------

    moveEnemyToCost(
        card
    );


    //----------------------------------
    // 状態解除
    //----------------------------------

    forceCostMode =
        false;


    forceCostPlayer =
        null;


    //----------------------------------
    // 発生元解除
    //----------------------------------

    forceCostSource =
        null;


    //----------------------------------
    // UI更新
    //----------------------------------

    updateGameState();

    updateButtons();


    //----------------------------------
    // マギア解決
    //----------------------------------

    resolveMagiaAfterForceCost(
        resolvedMagia,
        ENEMY
    );

}

//======================================
// ウインドプレッシャー
// 強制コスト後のマギア解決
//======================================

function resolveMagiaAfterForceCost(
    resolvedMagia = null,
    selectedForceCostPlayer = null
){

    //----------------------------------
    // 引数がない場合
    // 現在使用中のマギアを取得
    //----------------------------------

    if(!resolvedMagia){

        resolvedMagia =
            magiaCard;

    }


    //----------------------------------
    // マギア確認
    //----------------------------------

    if(!resolvedMagia){

        console.error(
            "resolveMagiaAfterForceCost：マギアがありません"
        );

        return false;

    }


    //----------------------------------
    // CPUマギアか確認
    //----------------------------------

    const isCpuMagia =
        resolvedMagia.owner ===
            ENEMY;


    //----------------------------------
    // 対象保存
    //----------------------------------

    const resolvedTarget =
        magiaTarget;


    console.log(
        "ウインドプレッシャー：強制コスト後の解決",
        {
            magia:
                resolvedMagia.name,

            owner:
                resolvedMagia.owner,

            target:
                resolvedTarget,

            selectedForceCostPlayer:
                selectedForceCostPlayer
        }
    );


    //----------------------------------
    // 強制コスト状態を完全解除
    //----------------------------------

    forceCostMode =
        false;

    forceCostPlayer =
        null;

    selectedForceCostCard =
        null;

    forceCostSource =
        null;


    //----------------------------------
    // マギアプレイ時能力
    //----------------------------------

    triggerSummonAbilitiesOnMagiaPlay(
        resolvedMagia.owner
    );


    //----------------------------------
    // 使用したマギアを手札から削除
    //----------------------------------

    if(
        resolvedMagia.owner ===
            PLAYER
    ){

        board.handCards =
            board.handCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }
    else{

        enemyHandCards =
            enemyHandCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }


    //----------------------------------
    // マギア状態解除
    //----------------------------------

    resetMagiaState();

    summonCard =
        null;

    selectedCostCards =
        [];

    costConfirm =
        false;


    //----------------------------------
    // 案内解除
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // UI更新
    //----------------------------------

    updateGameState();

    updateButtons();


    //==================================
    // マギア解決完了
    //==================================

    setTimeout(
        () => {

            //----------------------------------
            // CPU対象発光解除
            //----------------------------------

            if(
                isCpuMagia &&
                typeof clearCpuMagiaTargetHighlight ===
                    "function"
            ){

                clearCpuMagiaTargetHighlight(
                    resolvedTarget
                );

            }


            //----------------------------------
            // 戦闘解決
            //----------------------------------

            resolveBattle();


            //----------------------------------
            // ウインドプレッシャーをクールへ
            //----------------------------------

            resolvedMagia.area =
                "cool";


            board.addCoolCard(
                resolvedMagia,
                resolvedMagia.owner
            );


            console.log(
                "ウインドプレッシャー：効果解決完了 → クールへ"
            );


            //==================================
            // CPU使用時
            // CPU行動を再開
            //==================================

            if(
                isCpuMagia &&
                game.currentPlayer === ENEMY &&
                game.state === TURN_STATE.PLAYING
            ){

                console.log(
                    "CPU：ウインドプレッシャー解決後の行動再開"
                );


                cpuWaiting =
                    false;


                if(
                    typeof runCpuTurnStep ===
                        "function"
                ){

                    setTimeout(
                        () => {

                            runCpuTurnStep();

                        },
                        500
                    );

                }

            }


            //==================================
            // PLAYER使用時
            //==================================

            if(
                !isCpuMagia &&
                game.currentPlayer === PLAYER
            ){

                updateGameState();

                updateButtons();

                updateUsableCardHighlight();

            }

        },
        1000
    );


    return true;

}

//======================================
// スフィンクス
// 強制コスト効果解決完了
//======================================

function resolveSphinxForceCost(){

    console.log(
        "スフィンクス：強制コスト効果解決完了"
    );


    //----------------------------------
    // 待機していなければ終了
    //----------------------------------

    if(
        !sphinxAttackWaiting
    ){

        forceCostSource =
            null;


        //==================================
        // 攻撃処理中だった場合
        // 攻撃終了処理を通す
        //==================================

        if(attackResolving){

            finishAttack();

        }


        return;

    }


    //==================================
    // 攻撃情報保存
    //
    // スフィンクス能力発動時に
    // 保存しておいた攻撃情報を使用
    //==================================

    const attacker =
        sphinxAttackAttacker;


    const target =
        sphinxAttackTarget;


    //==================================
    // スフィンクス状態解除
    //==================================

    sphinxAttackWaiting =
        false;


    sphinxAttackAttacker =
        null;


    sphinxAttackTarget =
        null;


    forceCostSource =
        null;


    //----------------------------------
    // 強制コスト状態も念のため解除
    //----------------------------------

    forceCostMode =
        false;


    forceCostPlayer =
        null;


    selectedForceCostCard =
        null;


    //----------------------------------
    // 攻撃情報確認
    //----------------------------------

    if(
        !attacker ||
        target == null
    ){

        console.warn(
            "スフィンクス：",
            "攻撃再開情報がありません"
        );


        //==================================
        // 攻撃処理自体は開始済みなので
        // 必ず終了処理を通す
        //==================================

        if(attackResolving){

            finishAttack();

        }


        return;

    }


    //----------------------------------
    // 攻撃者がすでに場にいない
    //----------------------------------

    const attackerField =
        attacker.owner === PLAYER
            ?
            playerField
            :
            enemyField;


    if(
        !attackerField.includes(
            attacker
        ) ||
        attacker.destroyed
    ){

        console.log(
            "スフィンクス：",
            "攻撃者が場にいないため攻撃終了",
            attacker.card?.name
        );


        finishAttack();


        return;

    }


    console.log(
        "スフィンクス：アタック処理再開",
        attacker.card.name,
        target
    );


    //==================================
    // カリュブディス確認
    //
    // スフィンクス能力の解決後、
    // 相手側にカリュブディス能力を
    // 持つサモンがいるか確認する
    //==================================

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
            "スフィンクス解決後：",
            "カリュブディス処理待機"
        );


        //----------------------------------
        // カリュブディス側から
        // 攻撃処理を再開するため、
        // ここでは終了
        //----------------------------------

        return;

    }


    //==================================
    // カリュブディスなし
    //
    // 通常のブロック・ダメージ処理へ
    //==================================

    continueAttackAfterAttackAbility(
        attacker,
        target
    );

}

function resumeMagiaAfterResist(){

    //----------------------------------
    // 待機確認
    //----------------------------------

    if(
        !resistMagiaWaiting ||
        !resistWaitingMagia
    ){

        return false;

    }


    //----------------------------------
    // 保存情報
    //----------------------------------

    const resolvedMagia =
        resistWaitingMagia;

    const resolvedTarget =
        resistWaitingMagiaTarget;

    const resolvedOwnSummon =
        resistWaitingMagiaOwnSummon;

    const isCpuMagia =
        resolvedMagia.owner ===
            ENEMY;


    console.log(
        "レジスト後：マギア解決再開",
        {
            magia:
                resolvedMagia.name,

            target:
                resolvedTarget?.card?.name ??
                resolvedTarget,

            owner:
                resolvedMagia.owner
        }
    );


    //==================================
    // レジスト待機解除
    //==================================

    resistMagiaWaiting =
        false;

    resistWaitingMagia =
        null;

    resistWaitingMagiaTarget =
        null;

    resistWaitingMagiaOwnSummon =
        null;

    //==================================
    // アースクェイク解決中
    //==================================
    //
    // 通常マギアのようにここで
    // マギア全体を終了させず、
    // 今回の1体分のダメージ処理を
    // 完了させてから次の対象へ進む
    //==================================

    if(
        typeof earthquakeResolving !==
            "undefined" &&
        earthquakeResolving &&
        earthquakeMagia ===
            resolvedMagia
    ){

        console.log(
            "レジスト後：アースクェイク再開",
            earthquakeCurrentTarget?.card?.name
        );


        //----------------------------------
        // 今回の1体分のダメージは
        // レジスト処理側ですでに確定済み
        //
        // activateCardEffect() や
        // dealDamage() は再実行しない
        //----------------------------------

        finishEarthquakeTargetDamage();


        return true;

    }



    //----------------------------------
    // activateCardEffect() は
    // 再実行しない
    //----------------------------------


    //==================================
    // マギアを手札から削除
    //==================================

    if(
        resolvedMagia.owner ===
            PLAYER
    ){

        board.handCards =
            board.handCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }
    else{

        enemyHandCards =
            enemyHandCards.filter(
                card =>
                    card !==
                    resolvedMagia
            );

    }


    //==================================
    // マギア状態リセット
    //==================================

    resetMagiaState();

    summonCard =
        null;

    selectedCostCards =
        [];

    costConfirm =
        false;


    updateButtons();


    //==================================
    // マギア後処理
    //==================================

    setTimeout(
        () => {

            //----------------------------------
            // CPUマギア対象発光解除
            //----------------------------------

            if(
                isCpuMagia &&
                typeof clearCpuMagiaTargetHighlight ===
                    "function"
            ){

                clearCpuMagiaTargetHighlight(
                    resolvedTarget
                );

            }


            //----------------------------------
            // イグナイト等
            // 選択サモンをクールへ
            //----------------------------------

            resolveMagiaCoolOwnSummon(
                resolvedMagia,
                resolvedOwnSummon
            );


            //----------------------------------
            // 戦闘解決
            //----------------------------------

            resolveBattle();


            //----------------------------------
            // マギアをクールへ
            //----------------------------------

            resolvedMagia.area =
                "cool";


            board.addCoolCard(
                resolvedMagia,
                resolvedMagia.owner
            );


            console.log(
                "レジスト後：",
                "マギア効果解決完了 → クールへ",
                resolvedMagia.name
            );


            //==================================
            // CPUマギアならCPU処理再開
            //==================================

            if(
                isCpuMagia &&
                game.currentPlayer === ENEMY &&
                game.state === TURN_STATE.PLAYING
            ){

                console.log(
                    "レジスト後：CPUマギア処理再開"
                );


                cpuWaiting =
                    false;


                if(
                    typeof runCpuTurnStep ===
                        "function"
                ){

                    setTimeout(
                        () => {

                            runCpuTurnStep();

                        },
                        500
                    );

                }

            }

        },
        1000
    );


    return true;

}

//==================================================
// マギア
// 選択した自分サモンをクールゾーンへ
//
// イグナイト等
//==================================================

function resolveMagiaCoolOwnSummon(
    resolvedMagia,
    selectedSummon
){

    //----------------------------------
    // この効果を持たない
    //----------------------------------

    if(
        !resolvedMagia ||
        resolvedMagia.effect?.coolOwnSummon !==
            true
    ){

        return;

    }


    //----------------------------------
    // 選択サモンなし
    //----------------------------------

    if(!selectedSummon){

        console.warn(
            "マギア：クールへ置くサモンがありません",
            resolvedMagia.name
        );

        return;

    }


    //----------------------------------
    // 所有者の場
    //----------------------------------

    const field =
        selectedSummon.owner === PLAYER
            ? playerField
            : enemyField;


    //----------------------------------
    // すでに場を離れている
    //
    // ダメージ対象と参照サモンが
    // 同じだった場合などに備える
    //----------------------------------

    if(
        !field.includes(
            selectedSummon
        )
    ){

        console.log(
            "マギア：選択サモンはすでに場を離れています",
            selectedSummon.card?.name
        );

        return;

    }


    //----------------------------------
    // クールへ
    //----------------------------------

    console.log(
        "マギア：選択サモンをクールへ",
        {
            magia:
                resolvedMagia.name,

            summon:
                selectedSummon.card?.name
        }
    );


    moveLamiaTargetToCool(
        selectedSummon
    );

}

//==================================================
// クリスタルピーピング
// 公開処理開始
//==================================================

function startCrystalPeeping(
    card,
    owner
){

    //----------------------------------
    // PLAYER使用時のみ
    //----------------------------------

    if(owner !== PLAYER){

        return false;

    }


    //----------------------------------
    // CPU手札
    //----------------------------------

    const enemyCards =
        enemyHandCards.filter(
            enemyCard =>
                enemyCard &&
                enemyCard !== card
        );


    //----------------------------------
    // 公開枚数
    //----------------------------------

    const revealCount =
        Math.min(
            card.effect?.value ?? 3,
            enemyCards.length
        );


    //----------------------------------
    // 以前公開したカード
    //----------------------------------

    const alreadyRevealed =
        enemyCards.filter(
            enemyCard =>
                crystalPeepingRevealedCards.has(
                    enemyCard
                )
        );


    //----------------------------------
    // まだ公開していないカード
    //----------------------------------

    const notRevealed =
        enemyCards.filter(
            enemyCard =>
                !crystalPeepingRevealedCards.has(
                    enemyCard
                )
        );


    //----------------------------------
    // ランダム並び替え
    //----------------------------------

    const shuffleCards =
        cards => {

            const result =
                [...cards];


            for(
                let i =
                    result.length - 1;
                i > 0;
                i--
            ){

                const j =
                    Math.floor(
                        Math.random() *
                        (i + 1)
                    );


                [
                    result[i],
                    result[j]
                ] =
                [
                    result[j],
                    result[i]
                ];

            }


            return result;

        };


    //----------------------------------
    // 公開済みカードを優先
    //----------------------------------

    const shuffledRevealed =
        shuffleCards(
            alreadyRevealed
        );


    const shuffledNotRevealed =
        shuffleCards(
            notRevealed
        );


    const revealedCards =
        [
            ...shuffledRevealed,
            ...shuffledNotRevealed
        ].slice(
            0,
            revealCount
        );


    //----------------------------------
    // 今回公開したカードを記録
    //----------------------------------

    revealedCards.forEach(
        revealedCard => {

            crystalPeepingRevealedCards.add(
                revealedCard
            );

        }
    );


    //----------------------------------
    // 待機情報
    //----------------------------------

    crystalPeepingWaiting =
        true;

    crystalPeepingMagia =
        card;

    crystalPeepingOwner =
        owner;


    //----------------------------------
    // 公開
    //----------------------------------

    showCrystalPeepingCards(
        revealedCards
    );


    console.log(
        "クリスタルピーピング：公開カード",
        revealedCards.map(
            revealedCard =>
                revealedCard.name
        )
    );


    return true;

}

//==================================================
// クリスタルピーピング
// 公開カード表示
//==================================================

function showCrystalPeepingCards(
    cards
){

    const modal =
        document.getElementById(
            "crystal-peeping-modal"
        );

    const list =
        document.getElementById(
            "crystal-peeping-card-list"
        );

    const message =
        document.getElementById(
            "crystal-peeping-message"
        );

    const confirmButton =
        document.getElementById(
            "crystal-peeping-confirm-button"
        );


    if(
        !modal ||
        !list ||
        !message ||
        !confirmButton
    ){

        console.error(
            "クリスタルピーピング：表示UIがありません"
        );

        return;

    }


    //----------------------------------
    // 初期化
    //----------------------------------

    list.innerHTML =
        "";


    //----------------------------------
    // カードなし
    //----------------------------------

    if(cards.length === 0){

        message.textContent =
            "相手の手札はありません";

    }


    //----------------------------------
    // 公開カードあり
    //----------------------------------

    else{

        message.textContent =
            `相手が公開したカード（${cards.length}枚）`;


        cards.forEach(
            card => {

                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    card.image;

                img.alt =
                    card.name;


                list.appendChild(
                    img
                );

            }
        );

    }


    //----------------------------------
    // 確認ボタン
    //----------------------------------

    confirmButton.onclick =
        finishCrystalPeeping;


    //----------------------------------
    // 表示
    //----------------------------------

    modal.classList.add(
        "active"
    );


    console.log(
        "クリスタルピーピング：公開",
        cards.map(
            card =>
                card.name
        )
    );

}


//==================================================
// クリスタルピーピング
// 公開終了
//==================================================

//==================================================
// クリスタルピーピング
// 公開終了
//==================================================

function finishCrystalPeeping(){

    //----------------------------------
    // 待機確認
    //----------------------------------

    if(
        !crystalPeepingWaiting ||
        !crystalPeepingMagia
    ){

        return;

    }


    //----------------------------------
    // 使用カード情報保存
    //----------------------------------

    const card =
        crystalPeepingMagia;

    const owner =
        crystalPeepingOwner;


    console.log(
        "================================"
    );

    console.log(
        "★ クリスタルピーピング終了処理",
        {
            card:
                card.name,

            owner:
                owner,

            magiaCard:
                magiaCard?.name,

            summonCard:
                summonCard?.name
        }
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // モーダルを閉じる
    //----------------------------------

    const modal =
        document.getElementById(
            "crystal-peeping-modal"
        );


    if(modal){

        modal.classList.remove(
            "active"
        );

    }


    //==================================
    // 使用したマギアを手札へ戻す
    //==================================

    if(owner === PLAYER){

        card.area =
            "hand";


        card.setFaceDown(
            false
        );


        //----------------------------------
        // 選択状態解除
        //----------------------------------

        if(
            typeof card.setSelected ===
                "function"
        ){

            card.setSelected(
                false
            );

        }


        //----------------------------------
        // 手札に存在しなければ戻す
        //----------------------------------

        if(
            !board.handCards.includes(
                card
            )
        ){

            board.addHandCard(
                card
            );

        }

    }
    else{

        card.area =
            "enemyHand";


        if(
            !enemyHandCards.includes(
                card
            )
        ){

            enemyHandCards.push(
                card
            );

        }


        updateEnemyZoneDisplay();

    }


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "クリスタルピーピング：",
        card.name,
        "を手札へ戻しました"
    );


    addBattleLog(
        owner === PLAYER
            ?
            "PLAYER：クリスタルピーピングを手札に戻した"
            :
            "CPU：クリスタルピーピングを手札に戻した"
    );


    //==================================
    // クリスタルピーピング待機解除
    //==================================

    crystalPeepingWaiting =
        false;

    crystalPeepingMagia =
        null;

    crystalPeepingOwner =
        null;


    //==================================
    // 通常マギア状態を完全解除
    //==================================
    //
    // resolveMagia() は
    // WAIT_CRYSTAL_PEEPING で停止しているため、
    // 通常マギア側の終了処理には到達しない。
    //
    // そのためここで明示的に解除する。
    //==================================

    resetMagiaState();


    //----------------------------------
    // サモン・マギア共通コスト状態解除
    //----------------------------------

    summonCard =
        null;

    costTargetCard =
        null;

    selectedCostCards =
        [];

    costConfirm =
        false;


    //----------------------------------
    // 手札選択状態解除
    //----------------------------------

    if(
        typeof selectedHandCard !==
            "undefined"
    ){

        selectedHandCard =
            null;

    }


    //----------------------------------
    // 操作案内解除
    //----------------------------------

    hideActionGuide();


    //==================================
    // UIを通常状態へ戻す
    //==================================

    updateHandCostDisplay();

    updateGameState();

    updateButtons();


    //----------------------------------
    // 使用可能カード発光を再計算
    //----------------------------------

    if(
        typeof updateUsableCardHighlight ===
            "function"
    ){

        updateUsableCardHighlight();

    }


    console.log(
        "★ クリスタルピーピング終了",
        {
            magiaCard:
                magiaCard,

            summonCard:
                summonCard,

            selectedCostCards:
                selectedCostCards.length,

            costConfirm:
                costConfirm
        }
    );

}