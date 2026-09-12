/* =========================================================
Elementis Summoner
Tutorial STEP3

サモンのバトル
========================================================= */


/* =========================================================
STEP3 State
========================================================= */

const step3State = {

    active:
        false,

    phase:
        "",

    playerSummon:
        null,

    enemyVerticalSummon:
        null,

    enemyRestSummon:
        null,

    blockSummon:
        null,

    restBlockSummon:
        null,

    cpuAttacker:
        null,


    //----------------------------------
    // ブロック練習中
    //----------------------------------

    blockPracticeActive:
        false,


    //----------------------------------
    // 通常関数ラップ済み
    //----------------------------------

    blockFunctionsWrapped:
        false,


    observerRegistered:
        false

};


/* =========================================================
Initialize
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeTutorialStep3();

    }
);


/* =========================================================
STEP3 Initialize
========================================================= */

function initializeTutorialStep3(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial STEP3 ====="
    );

    console.log(
        "================================"
    );


    document.body.classList.add(
        "tutorial-step3"
    );


    step3State.active =
        true;


    //----------------------------------
    // ブロック処理監視を設定
    //----------------------------------

    installTutorialStep3BlockHooks();


    //----------------------------------
    // バトルログ初期非表示
    //----------------------------------

    if(
        typeof initializeTutorialBattleLog ===
        "function"
    ){

        initializeTutorialBattleLog();

    }


    //----------------------------------
    // 共通STEP開始
    //----------------------------------

    if(
        typeof beginTutorialStep ===
        "function"
    ){

        beginTutorialStep(
            "STEP 3",
            "サモンのアタック・ブロック・バトルについて学びます。"
        );

    }


    //----------------------------------
    // プレイヤー・CPUアイコン
    //----------------------------------

    if(
        typeof selectRandomMatchIcons ===
        "function"
    ){

        selectRandomMatchIcons();

    }


    if(
        typeof updateMatchIcons ===
        "function"
    ){

        updateMatchIcons();

    }


    //----------------------------------
    // 最初の盤面
    //----------------------------------

    setupTutorialStep3DirectAttack();


    //----------------------------------
    // 開始
    //----------------------------------

    showTutorialNextButton(
        "開始",
        startTutorialStep3DirectAttack
    );


    //----------------------------------
    // クリック監視
    //----------------------------------

    registerTutorialStep3Observer();

}


/* =========================================================
STEP3
通常のブロック処理にフック

attack.js自体をSTEP3専用に変更せず、
実際にexecuteBlockされた時だけ
チュートリアルを進める。
========================================================= */

function installTutorialStep3BlockHooks(){

    if(
        step3State.blockFunctionsWrapped
    ){

        return;

    }


    step3State.blockFunctionsWrapped =
        true;


    /* -----------------------------------------------------
    executeBlock
    ----------------------------------------------------- */

    if(
        typeof executeBlock ===
        "function"
    ){

        const normalExecuteBlock =
            executeBlock;


        executeBlock =
            function(blocker){

                console.log(
                    "★ Tutorial STEP3 executeBlock監視",
                    blocker?.card?.name
                );


                //----------------------------------
                // まず通常のブロック処理
                //----------------------------------

                const result =
                    normalExecuteBlock(
                        blocker
                    );


                //----------------------------------
                // STEP3のブロック練習なら
                // 実際のブロック成功として扱う
                //----------------------------------

                if(
                    step3State.active &&
                    step3State.blockPracticeActive &&
                    blocker ===
                        step3State.blockSummon
                ){

                    tutorialStep3BlockExecuted(
                        blocker
                    );

                }


                return result;

            };

    }


    /* -----------------------------------------------------
    skipBlock

    STEP3ブロック練習では
    「ブロックしない」を完全禁止
    ----------------------------------------------------- */

    if(
        typeof skipBlock ===
        "function"
    ){

        const normalSkipBlock =
            skipBlock;


        skipBlock =
            function(){

                if(
                    step3State.active &&
                    step3State.blockPracticeActive
                ){

                    console.log(
                        "★ Tutorial STEP3：" +
                        "ブロックしない禁止"
                    );


                    return;

                }


                return normalSkipBlock();

            };

    }

}


/* =========================================================
Field Display Update
========================================================= */

function updateTutorialStep3FieldDisplay(){

    //----------------------------------
    // PLAYER
    //----------------------------------

    const playerCards =
        playerField
        .filter(
            summon =>
                summon &&
                summon.card &&
                !summon.destroyed
        )
        .map(
            summon => {

                summon.card.owner =
                    PLAYER;


                summon.card.isRest =
                    !!summon.isRest;


                return summon.card;

            }
        );


    //----------------------------------
    // ENEMY
    //----------------------------------

    const enemyCards =
        enemyField
        .filter(
            summon =>
                summon &&
                summon.card &&
                !summon.destroyed
        )
        .map(
            summon => {

                summon.card.owner =
                    ENEMY;


                summon.card.isRest =
                    !!summon.isRest;


                return summon.card;

            }
        );


    //----------------------------------
    // Boardへ反映
    //----------------------------------

    board.setPlayerCards(
        playerCards
    );


    board.setEnemyCards(
        enemyCards
    );


    //----------------------------------
    // 向きを再反映
    //----------------------------------

    const summons = [

        ...playerField,
        ...enemyField

    ];


    for(
        const summon
        of summons
    ){

        if(
            summon &&
            summon.view &&
            typeof summon.view.setHorizontal ===
                "function"
        ){

            summon.view.setHorizontal(
                !!summon.isRest
            );

        }

    }

}


/* =========================================================
共通リセット
========================================================= */

function resetTutorialStep3Board(){

    //----------------------------------
    // 攻撃状態解除
    //----------------------------------

    if(
        typeof resetAttackState ===
        "function"
    ){

        resetAttackState();

    }


    //----------------------------------
    // モーダル
    //----------------------------------

    if(
        typeof closeHandModal ===
        "function"
    ){

        closeHandModal();

    }


    if(
        typeof closeSummonActionModal ===
        "function"
    ){

        closeSummonActionModal();

    }


    //----------------------------------
    // フィールド
    //----------------------------------

    playerField.length =
        0;


    enemyField.length =
        0;


    board.setPlayerCards(
        []
    );


    board.setEnemyCards(
        []
    );


    //----------------------------------
    // 手札
    //----------------------------------

    board.setHandCards(
        []
    );


    enemyHandCards =
        [];


    //----------------------------------
    // コスト
    //----------------------------------

    board.costCards =
        [];


    enemyCostCards =
        [];


    board.enemyCostCards =
        [];


    //----------------------------------
    // クール
    //----------------------------------

    board.playerCoolCards =
        [];


    enemyCoolCards =
        [];


    board.enemyCoolCards =
        [];


    //----------------------------------
    // LIFE
    //----------------------------------

    game.playerLife =
        5;


    game.enemyLife =
        5;


    //----------------------------------
    // PLAYERターン
    //----------------------------------

    game.currentPlayer =
        PLAYER;


    game.state =
        TURN_STATE.PLAYING;


    //----------------------------------
    // 召喚は禁止
    //----------------------------------

    summonUsedThisTurn =
        true;


    //----------------------------------
    // STEP3状態
    //----------------------------------

    step3State.playerSummon =
        null;


    step3State.enemyVerticalSummon =
        null;


    step3State.enemyRestSummon =
        null;


    step3State.blockSummon =
        null;


    step3State.restBlockSummon =
        null;


    step3State.cpuAttacker =
        null;


    step3State.blockPracticeActive =
        false;


    //----------------------------------
    // LIFE
    //----------------------------------

    if(
        typeof updateLifeDisplay ===
        "function"
    ){

        updateLifeDisplay();

    }


    //----------------------------------
    // 相手ゾーン
    //----------------------------------

    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    //----------------------------------
    // 手札・コスト
    //----------------------------------

    if(
        typeof updateHandCostDisplay ===
        "function"
    ){

        updateHandCostDisplay();

    }


    //----------------------------------
    // アクションボタン
    //----------------------------------

    if(
        typeof resetTutorialGameActionArea ===
        "function"
    ){

        resetTutorialGameActionArea();

    }


    //----------------------------------
    // ターン終了禁止
    //----------------------------------

    if(
        typeof setTutorialEndTurnEnabled ===
        "function"
    ){

        setTutorialEndTurnEnabled(
            false
        );

    }


    //----------------------------------
    // 発光解除
    //----------------------------------

    if(
        typeof clearAllTutorialHighlights ===
        "function"
    ){

        clearAllTutorialHighlights();

    }


    //----------------------------------
    // 通常案内解除
    //----------------------------------

    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }

}


/* =========================================================
カードデータ取得
========================================================= */

function getTutorialStep3CardData(
    id
){

    return CARD_LIST.find(
        card =>
            Number(
                card.id
            ) ===
            Number(
                id
            )
    );

}


/* =========================================================
サモン生成
========================================================= */

function createTutorialStep3Summon(
    id,
    owner,
    isRest = false,
    attackReady = true
){

    //----------------------------------
    // カード確認
    //----------------------------------

    const cardData =
        getTutorialStep3CardData(
            id
        );


    if(!cardData){

        console.error(
            "STEP3 card not found:",
            id
        );

        return null;

    }


    //----------------------------------
    // Card生成
    //----------------------------------

    const card =
        createTutorialCard(
            id,
            "field",
            owner
        );


    if(!card){

        console.error(
            "STEP3 Card生成失敗:",
            id
        );

        return null;

    }


    card.owner =
        owner;


    //----------------------------------
    // Summon生成
    //----------------------------------

    const summon =
        new Summon(
            card,
            owner
        );


    summon.isRest =
        isRest;


    summon.attackReady =
        attackReady;


    summon.destroyed =
        false;


    //----------------------------------
    // 向き
    //----------------------------------

    if(
        summon.view &&
        typeof summon.view.setHorizontal ===
            "function"
    ){

        summon.view.setHorizontal(
            isRest
        );

    }


    console.log(
        "STEP3 Summon生成",
        {
            name:
                card.name,

            owner:
                owner,

            isRest:
                summon.isRest,

            attackReady:
                summon.attackReady
        }
    );


    return summon;

}


/* =========================================================
LESSON 1
直接アタック準備
========================================================= */

function setupTutorialStep3DirectAttack(){

    resetTutorialStep3Board();


    step3State.phase =
        "directAttackIntroduction";


    //----------------------------------
    // PLAYER：クラーケン
    //----------------------------------

    const kraken =
        createTutorialStep3Summon(
            20,
            PLAYER,
            false,
            true
        );


    if(kraken){

        playerField.push(
            kraken
        );

    }


    updateTutorialStep3FieldDisplay();


    step3State.playerSummon =
        kraken;


    setTutorialGuide(
        "STEP 3",
        "サモンのアタック・ブロック・バトルについて学びます。"
    );

}


/* =========================================================
LESSON 1
直接アタック開始
========================================================= */

function startTutorialStep3DirectAttack(){

    step3State.phase =
        "selectDirectAttackSummon";


    hideTutorialNextButton();


    setTutorialGuide(
        "アタック",
        "まずは相手プレイヤーへアタックします。\n" +
        "場のクラーケンを選び、アタックボタンを押してください。"
    );


    highlightTutorialStep3Summon(
        step3State.playerSummon
    );

}


/* =========================================================
LESSON 1
直接アタック完了
========================================================= */

function completeTutorialStep3DirectAttack(){

    if(
        step3State.phase ===
        "directAttackExplanation"
    ){

        return;

    }


    step3State.phase =
        "directAttackExplanation";


    if(
        typeof clearAllTutorialHighlights ===
        "function"
    ){

        clearAllTutorialHighlights();

    }


    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    updateTutorialStep3FieldDisplay();


    setTutorialGuide(
        "アタック",
        "相手プレイヤーへアタックすると" +
        "サモンのパワー分のダメージを与えます。\n" +
        "また、アタックしたサモンはヨコ向きになります。"
    );


    showTutorialNextButton(
        "次へ",
        setupTutorialStep3SummonBattle
    );

}


/* =========================================================
LESSON 2
相手サモンへのアタック準備
========================================================= */

function setupTutorialStep3SummonBattle(){

    resetTutorialStep3Board();


    step3State.phase =
        "summonBattleIntroduction";


    //----------------------------------
    // PLAYER：クラーケン
    //----------------------------------

    const playerSummon =
        createTutorialStep3Summon(
            20,
            PLAYER,
            false,
            true
        );


    //----------------------------------
    // ENEMY：シルフ（タテ）
    //----------------------------------

    const enemyVertical =
        createTutorialStep3Summon(
            1004,
            ENEMY,
            false,
            true
        );


    //----------------------------------
    // ENEMY：グリフォン（ヨコ）
    //----------------------------------

    const enemyRest =
        createTutorialStep3Summon(
            12,
            ENEMY,
            true,
            true
        );


    if(playerSummon){

        playerField.push(
            playerSummon
        );

    }


    if(enemyVertical){

        enemyField.push(
            enemyVertical
        );

    }


    if(enemyRest){

        enemyField.push(
            enemyRest
        );

    }


    updateTutorialStep3FieldDisplay();


    step3State.playerSummon =
        playerSummon;


    step3State.enemyVerticalSummon =
        enemyVertical;


    step3State.enemyRestSummon =
        enemyRest;


    setTutorialGuide(
        "サモンにアタック",
        "相手のヨコ向きのサモンにもアタックできます。\n" +
        "タテ向きのサモンにはアタックできません。"
    );


    showTutorialNextButton(
        "次へ",
        startTutorialStep3SummonBattle
    );

}


/* =========================================================
LESSON 2
サモンへのアタック開始
========================================================= */

function startTutorialStep3SummonBattle(){

    step3State.phase =
        "selectBattleSummon";


    hideTutorialNextButton();


    setTutorialGuide(
        "サモンにアタック",
        "クラーケンで相手のヨコ向きの" +
        "グリフォンにアタックしてみましょう。"
    );


    highlightTutorialStep3Summon(
        step3State.playerSummon
    );

}


/* =========================================================
LESSON 2
サモン戦完了
========================================================= */

function completeTutorialStep3SummonBattle(){

    if(
        step3State.phase ===
        "summonBattleExplanation"
    ){

        return;

    }


    step3State.phase =
        "summonBattleExplanation";


    if(
        typeof clearAllTutorialHighlights ===
        "function"
    ){

        clearAllTutorialHighlights();

    }


    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    updateTutorialStep3FieldDisplay();


    setTutorialGuide(
        "サモンのバトル",
        "サモン同士がバトルすると、" +
        "お互いにパワー分のダメージを与えます。\n" +
        "パワー以上のダメージを受けたサモンは" +
        "クールゾーンに置かれます。"
    );


    showTutorialNextButton(
        "次へ",
        setupTutorialStep3BlockLesson
    );

}


/* =========================================================
LESSON 3
ブロック準備
========================================================= */

function setupTutorialStep3BlockLesson(){

    resetTutorialStep3Board();


    //----------------------------------
    // ブロック練習開始
    //----------------------------------

    step3State.blockPracticeActive =
        true;


    step3State.phase =
        "blockIntroduction";


    //----------------------------------
    // PLAYER
    // クラーケン：タテ
    //----------------------------------

    const blocker =
        createTutorialStep3Summon(
            20,
            PLAYER,
            false,
            true
        );


    //----------------------------------
    // PLAYER
    // ユニコーン：ヨコ
    //----------------------------------

    const restSummon =
        createTutorialStep3Summon(
            11,
            PLAYER,
            true,
            true
        );


    //----------------------------------
    // CPU
    // ユニコーン
    //----------------------------------

    const cpuAttacker =
        createTutorialStep3Summon(
            11,
            ENEMY,
            false,
            true
        );


    if(blocker){

        playerField.push(
            blocker
        );

    }


    if(restSummon){

        playerField.push(
            restSummon
        );

    }


    if(cpuAttacker){

        enemyField.push(
            cpuAttacker
        );

    }


    updateTutorialStep3FieldDisplay();


    step3State.blockSummon =
        blocker;


    step3State.restBlockSummon =
        restSummon;


    step3State.cpuAttacker =
        cpuAttacker;


    setTutorialGuide(
        "ブロック",
        "次は相手サモンからプレイヤーへのアタックをブロックします。"
    );


    showTutorialNextButton(
        "次へ",
        executeTutorialStep3CpuAttack
    );

}


/* =========================================================
LESSON 3
CPUアタック
========================================================= */

function executeTutorialStep3CpuAttack(){

    hideTutorialNextButton();


    step3State.phase =
        "waitingCpuAttack";


    setTutorialGuide(
        "ブロック",
        "相手のユニコーンが、あなたへアタックしました。\nブロックするサモンを選んでください。"
    );


    //----------------------------------
    // CPUターン
    //----------------------------------

    game.currentPlayer =
        ENEMY;


    game.state =
        TURN_STATE.PLAYING;


    //----------------------------------
    // 通常攻撃
    //----------------------------------

    setTimeout(
        () => {

            if(
                typeof executeAttack ===
                "function"
            ){

                executeAttack(
                    step3State.cpuAttacker,
                    PLAYER
                );

            }


            //----------------------------------
            // startBlock後
            //----------------------------------

            setTimeout(
                () => {

                    //----------------------------------
                    // 本当にブロック受付中か確認
                    //----------------------------------

                    if(
                        typeof blockMode !==
                            "undefined" &&
                        blockMode
                    ){

                        step3State.phase =
                            "selectBlock";


                        setTutorialGuide(
                            "ブロック",
                            "相手のユニコーンが、あなたへアタックしました。\nブロックするサモンを選んでください。"
                        );


                        return;

                    }


                    console.warn(
                        "STEP3：ブロックモードが開始されていません"
                    );

                },
                350
            );

        },
        500
    );

}


/* =========================================================
LESSON 3
ブロッカー選択後
========================================================= */

function tutorialStep3BlockerSelected(){

    step3State.phase =
        "confirmBlock";


    setTutorialGuide(
        "ブロック",
        "タテ向きのサモンをヨコ向きにしてブロックが可能です。\n『クラーケン』を選択し、ブロックボタンをおしてください。"
    );

}


/* =========================================================
LESSON 3
実際のブロック成立

ブロック終了時点でゲーム進行を停止する
========================================================= */

function tutorialStep3BlockExecuted(
    blocker
){

    if(
        !step3State.active
    ){

        return;

    }


    if(
        !step3State.blockPracticeActive
    ){

        return;

    }


    if(
        blocker !==
        step3State.blockSummon
    ){

        return;

    }


    console.log(
        "★ Tutorial STEP3：ブロック成功",
        blocker.card.name
    );


    //----------------------------------
    // ブロック練習終了
    //----------------------------------

    step3State.blockPracticeActive =
        false;


    step3State.phase =
        "blockResolving";


    //----------------------------------
    // ゲーム進行停止
    //----------------------------------

    game.state =
        TURN_STATE.END;


    //----------------------------------
    // CPU進行を止める
    //----------------------------------

    if(
        typeof battleGameEnding !==
        "undefined"
    ){

        battleGameEnding =
            true;

    }


    //----------------------------------
    // 攻撃・ブロック状態を停止
    //----------------------------------

    attackMode =
        false;


    blockMode =
        false;


    attackingSummon =
        null;


    attackTarget =
        null;


    selectableBlockSummons =
        [];


    blockingSummon =
        null;


    //----------------------------------
    // 通常の行動案内を消す
    //----------------------------------

    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    //----------------------------------
    // ターン終了ボタン禁止
    //----------------------------------

    if(
        typeof setTutorialEndTurnEnabled ===
        "function"
    ){

        setTutorialEndTurnEnabled(
            false
        );

    }


    //----------------------------------
    // 少しだけ戦闘結果を見せてから説明
    //----------------------------------

    setTimeout(
        () => {

            completeTutorialStep3Block();

        },
        500
    );

}

/* =========================================================
LESSON 3
ブロック完了
========================================================= */

function completeTutorialStep3Block(){

    if(
        step3State.phase ===
        "blockExplanation"
    ){

        return;

    }


    step3State.blockPracticeActive =
        false;


    step3State.phase =
        "blockExplanation";


    if(
        typeof clearAllTutorialHighlights ===
        "function"
    ){

        clearAllTutorialHighlights();

    }


    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    updateTutorialStep3FieldDisplay();


    setTutorialGuide(
        "ブロック",
        "ブロックするとサモン同士のバトルになり、お互いパワー分のダメージを与えます。プレイヤーはダメージを受けません。"
    );


    showTutorialNextButton(
        "次へ",
        completeTutorialStep3
    );

}


/* =========================================================
STEP3 Complete
========================================================= */

function completeTutorialStep3(){

    step3State.phase =
        "complete";


    step3State.active =
        false;


    step3State.blockPracticeActive =
        false;


    if(
        typeof clearAllTutorialHighlights ===
        "function"
    ){

        clearAllTutorialHighlights();

    }


    if(
        typeof resetAttackState ===
        "function"
    ){

        resetAttackState();

    }


    if(
        typeof resetTutorialGameActionArea ===
        "function"
    ){

        resetTutorialGameActionArea();

    }


    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    setTutorialGuide(
        "STEP 3",
        "サモンのアタックとブロックについて学びました。\nSTEP3はこれで完了です。"
    );


    showTutorialNextButton(
        "メニューへ",
        () => {

            window.location.href =
                "tutorial.html";

        }
    );

}


/* =========================================================
クリック監視登録
========================================================= */

function registerTutorialStep3Observer(){

    if(
        step3State.observerRegistered
    ){

        return;

    }


    step3State.observerRegistered =
        true;


    document.addEventListener(
        "click",
        tutorialStep3CaptureClick,
        true
    );

}


/* =========================================================
クリック監視
========================================================= */

function tutorialStep3CaptureClick(
    event
){

    if(
        !step3State.active
    ){

        return;

    }


    //----------------------------------
    // ターン終了禁止
    //----------------------------------

    const endTurnButton =
        event.target.closest
        ? event.target.closest(
            "#endturn-button"
        )
        : null;


    if(endTurnButton){

        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();

        return;

    }


    /* =====================================================
    ブロックなし禁止
    ===================================================== */

    const blockSkip =
        event.target.closest
        ? event.target.closest(
            "#block-skip-button"
        )
        : null;


    if(
        blockSkip &&
        step3State.blockPracticeActive
    ){

        console.log(
            "★ Tutorial STEP3：" +
            "ブロックしないクリック禁止"
        );


        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();


        return;

    }


    /* =====================================================
    アタックボタン
    ===================================================== */

    const attackButton =
        event.target.closest
        ? event.target.closest(
            "#attack-button, " +
            "#summon-attack-button"
        )
        : null;


    if(attackButton){

        if(
            step3State.phase !==
                "selectDirectAttackSummon" &&
            step3State.phase !==
                "selectBattleSummon"
        ){

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();

            return;

        }


        setTimeout(
            () => {

                tutorialStep3AfterAttackButton();

            },
            60
        );


        return;

    }


    /* =====================================================
    LESSON1
    直接攻撃対象
    ===================================================== */

    if(
        step3State.phase ===
        "selectDirectAttackTarget"
    ){

        const enemyPlayer =
            event.target.closest
            ? event.target.closest(
                "#enemy-player, " +
                "#enemy-player-icon, " +
                "#enemy-life-display"
            )
            : null;


        if(!enemyPlayer){

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            setTutorialGuide(
                "アタック",
                "今回は相手プレイヤーを選んでください。"
            );


            return;

        }


        setTimeout(
            () => {

                completeTutorialStep3DirectAttack();

            },
            700
        );


        return;

    }


    /* =====================================================
    LESSON2
    サモン攻撃対象
    ===================================================== */

    if(
        step3State.phase ===
        "selectBattleTarget"
    ){

        const clickedSummon =
            findTutorialStep3SummonByElement(
                event.target
            );


        const enemyPlayer =
            event.target.closest
            ? event.target.closest(
                "#enemy-player, " +
                "#enemy-player-icon, " +
                "#enemy-life-display"
            )
            : null;


        //----------------------------------
        // PLAYER
        //----------------------------------

        if(enemyPlayer){

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            setTutorialGuide(
                "サモンにアタック",
                "今回はヨコ向きのサモンに" +
                "アタックしましょう。"
            );


            return;

        }


        //----------------------------------
        // シルフ
        //----------------------------------

        if(
            clickedSummon ===
            step3State.enemyVerticalSummon
        ){

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            setTutorialGuide(
                "サモンにアタック",
                "タテ向きのサモンにはアタックできません。\n" +
                "ヨコ向きのサモンにアタックしましょう。"
            );


            return;

        }


        //----------------------------------
        // グリフォン以外
        //----------------------------------

        if(
            clickedSummon !==
            step3State.enemyRestSummon
        ){

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            setTutorialGuide(
                "サモンにアタック",
                "ヨコ向きのサモンにアタックしましょう。"
            );


            return;

        }


        //----------------------------------
        // グリフォン
        //----------------------------------

        setTimeout(
            () => {

                completeTutorialStep3SummonBattle();

            },
            900
        );


        return;

    }


    /* =====================================================
    LESSON3
    ブロッカー選択
    ===================================================== */

    if(
        step3State.phase ===
        "selectBlock"
    ){

        const clickedSummon =
            findTutorialStep3SummonByElement(
                event.target
            );


        //----------------------------------
        // ヨコ向きユニコーン
        //----------------------------------

        if(
            clickedSummon ===
            step3State.restBlockSummon
        ){

            event.preventDefault();

            event.stopPropagation();

            event.stopImmediatePropagation();


            setTutorialGuide(
                "ブロック",
                "タテ向きのサモンをヨコ向きにしてブロックが可能です。\n『クラーケン』を選択し、ブロックボタンをおしてください。"
            );


            return;

        }


        //----------------------------------
        // クラーケン
        //
        // 通常ゲーム側のクリックは通す
        //----------------------------------

        if(
            clickedSummon ===
            step3State.blockSummon
        ){

            console.log(
                "★ Tutorial STEP3：" +
                "クラーケン選択"
            );


            //----------------------------------
            // 通常処理がボタンを出した後に
            // チュートリアル案内を更新
            //----------------------------------

            setTimeout(
                () => {

                    tutorialStep3BlockerSelected();

                },
                50
            );


            return;

        }


        return;

    }


    /* =====================================================
    LESSON3
    ブロック確認中

    「ブロック」ボタンは通常処理へ通す。
    「ブロックしない」は上で遮断済み。
    ===================================================== */

    if(
        step3State.phase ===
        "confirmBlock"
    ){

        const blockButton =
            event.target.closest
            ? event.target.closest(
                "#block-button"
            )
            : null;


        if(blockButton){

            console.log(
                "★ Tutorial STEP3：" +
                "ブロックボタン"
            );


            //----------------------------------
            // 通常のexecuteBlockへ通す
            //----------------------------------

            return;

        }

    }

}


/* =========================================================
アタックボタン押下後
========================================================= */

function tutorialStep3AfterAttackButton(){

    //----------------------------------
    // PLAYER直接攻撃
    //----------------------------------

    if(
        step3State.phase ===
        "selectDirectAttackSummon"
    ){

        step3State.phase =
            "selectDirectAttackTarget";


        if(
            typeof clearAllTutorialHighlights ===
            "function"
        ){

            clearAllTutorialHighlights();

        }


        setTutorialGuide(
            "アタック",
            "アタックできる対象が発光します。\n" +
            "アタック対象として相手プレイヤーを選んでください。"
        );


        return;

    }


    //----------------------------------
    // サモン攻撃
    //----------------------------------

    if(
        step3State.phase ===
        "selectBattleSummon"
    ){

        step3State.phase =
            "selectBattleTarget";


        if(
            typeof clearAllTutorialHighlights ===
            "function"
        ){

            clearAllTutorialHighlights();

        }


        setTutorialGuide(
            "サモンにアタック",
            "ヨコ向きの相手サモンを選んでください。"
        );

    }

}


/* =========================================================
DOMからSummon検索
========================================================= */

function findTutorialStep3SummonByElement(
    target
){

    if(!target){

        return null;

    }


    const cardElement =
        target.closest
        ? target.closest(
            ".card"
        )
        : null;


    if(!cardElement){

        return null;

    }


    const summons = [

        ...playerField,
        ...enemyField

    ];


    for(
        const summon
        of summons
    ){

        if(
            !summon ||
            !summon.card
        ){

            continue;

        }


        const element =
            summon.element ||
            summon.card.element ||
            summon.card.dom;


        if(
            element ===
            cardElement
        ){

            return summon;

        }


        if(
            element &&
            typeof element.contains ===
                "function" &&
            element.contains(
                target
            )
        ){

            return summon;

        }

    }


    return null;

}


/* =========================================================
チュートリアル用サモン発光
========================================================= */

function highlightTutorialStep3Summon(
    summon
){

    if(
        typeof clearAllTutorialHighlights ===
        "function"
    ){

        clearAllTutorialHighlights();

    }


    if(
        !summon ||
        !summon.card
    ){

        return;

    }


    const element =
        summon.element ||
        summon.card.element ||
        summon.card.dom;


    if(!element){

        console.warn(
            "STEP3：サモンDOMが取得できません",
            summon.card.name
        );

        return;

    }


    element.classList.add(
        "tutorial-zone-highlight"
    );

}