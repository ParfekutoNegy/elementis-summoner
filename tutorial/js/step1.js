/* =========================================================
Elementis Summoner Tutorial

STEP 1
カードの種類と場所
========================================================= */


/* =========================================================
STEP1 State
========================================================= */

const step1State = {

    active:
        false,

    phase:
        "",

    explanationIndex:
        0,

    summonCard:
        null,

    magiaCard:
        null,

    resistCard:
        null,

    fieldSummon:
        null,

    screenLocked:
        false,

    observerRegistered:
        false

};


/* =========================================================
Start
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTutorialStep1
);


/* =========================================================
Initialize
========================================================= */

function initializeTutorialStep1(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial STEP1 ====="
    );

    console.log(
        "================================"
    );

    //----------------------------------
    // STEP1専用クラス
    //----------------------------------

    document.body.classList.add(
        "tutorial-step1"
    );

    initializeTutorialBattleLog();


    //----------------------------------
    // Board確認
    //----------------------------------

    if(
        typeof board ===
        "undefined" ||
        !board
    ){

        console.error(
            "STEP1：board がありません"
        );

        return;

    }


    //----------------------------------
    // CARD_LIST確認
    //----------------------------------

    if(
        typeof CARD_LIST ===
        "undefined"
    ){

        console.error(
            "STEP1：CARD_LIST がありません"
        );

        return;

    }


    //----------------------------------
    // STEP開始
    //----------------------------------

    beginTutorialStep(
        "STEP 1",
        "カードの種類と、カードを置く場所について学びます。"
    );


    //----------------------------------
    // ゲーム基本状態
    //----------------------------------

    game.currentPlayer =
        PLAYER;


    game.state =
        TURN_STATE.PLAYING;


    //----------------------------------
    // LIFE
    //----------------------------------

    setTutorialLife(
        5,
        5
    );


    //----------------------------------
    // アイコン
    //----------------------------------

    setTutorialIcons(
        1,
        2
    );


    //----------------------------------
    // 盤面
    //----------------------------------

    setupTutorialStep1Board();


    //----------------------------------
    // 手札クリック監視
    //----------------------------------

    registerTutorialStep1CardObserver();


    //----------------------------------
    // 開始
    //----------------------------------

    showTutorialNextButton(
        "開始",
        startTutorialStep1CardTypes
    );

}


/* =========================================================
STEP1 Board Setup
========================================================= */

function setupTutorialStep1Board(){

    console.log(
        "STEP1：初期盤面作成"
    );


    //----------------------------------
    // 一旦すべて初期化
    //----------------------------------

    clearTutorialBoard();


    //----------------------------------
    // LIFE
    //----------------------------------

    setTutorialLife(
        5,
        5
    );


    /* =====================================================
       PLAYER HAND

       11 ユニコーン
       6  ファイアボール
       31 ストーンガード
    ===================================================== */

    const unicorn =
        createTutorialCard(
            11,
            "hand",
            PLAYER
        );


    const fireball =
        createTutorialCard(
            6,
            "hand",
            PLAYER
        );


    const stoneGuard =
        createTutorialCard(
            31,
            "hand",
            PLAYER
        );


    if(
        !unicorn ||
        !fireball ||
        !stoneGuard
    ){

        console.error(
            "STEP1：手札カード生成失敗",
            {
                unicorn,
                fireball,
                stoneGuard
            }
        );

        return;

    }


    //----------------------------------
    // 保存
    //----------------------------------

    step1State.summonCard =
        unicorn;


    step1State.magiaCard =
        fireball;


    step1State.resistCard =
        stoneGuard;


    //----------------------------------
    // 手札
    //----------------------------------

    board.setHandCards(
        [
            unicorn,
            fireball,
            stoneGuard
        ]
    );


    /* =====================================================
       PLAYER FIELD

       20 クラーケン
    ===================================================== */

    const krakenCard =
        createTutorialCard(
            20,
            "field",
            PLAYER
        );


    if(krakenCard){

        krakenCard.area =
            "field";


        const kraken =
            new Summon(
                krakenCard,
                PLAYER
            );


        kraken.attackReady =
            false;


        kraken.isRest =
            false;


        if(
            kraken.view &&
            typeof kraken.view.setHorizontal ===
                "function"
        ){

            kraken.view.setHorizontal(
                false
            );

        }


        playerField.push(
            kraken
        );


        step1State.fieldSummon =
            kraken;


        board.setPlayerCards(
            playerField.map(
                summon =>
                    summon.view
            )
        );

    }


    /* =====================================================
       PLAYER COST

       1  ウィルオウィスプ
       17 セイレーン
       29 ロックスパイク
    ===================================================== */

    const playerCostIds =
        [
            1,
            17,
            29
        ];


    board.costCards =
        [];


    playerCostIds.forEach(
        id => {

            const card =
                createTutorialCard(
                    id,
                    "cost",
                    PLAYER
                );


            if(!card){

                return;

            }


            card.area =
                "cost";


            card.owner =
                PLAYER;


            if(
                typeof card.setSelected ===
                "function"
            ){

                card.setSelected(
                    false
                );

            }


            if(
                typeof card.setHighlight ===
                "function"
            ){

                card.setHighlight(
                    false
                );

            }


            if(
                typeof card.setCostSelected ===
                "function"
            ){

                card.setCostSelected(
                    false
                );

            }


            if(
                typeof card.setHorizontal ===
                "function"
            ){

                card.setHorizontal(
                    false
                );

            }


            if(
                typeof card.setFaceDown ===
                "function"
            ){

                card.setFaceDown(
                    true
                );

            }


            board.costCards.push(
                card
            );

        }
    );


    if(
        typeof board.updateCostCount ===
        "function"
    ){

        board.updateCostCount();

    }


    /* =====================================================
       PLAYER COOL

       16 ラピッドムーヴ
       32 グラウンドウォール
       7  パイロフレイム
    ===================================================== */

    const playerCoolIds =
        [
            16,
            32,
            7
        ];


    board.playerCoolCards =
        [];


    playerCoolIds.forEach(
        id => {

            const card =
                createTutorialCard(
                    id,
                    "cool",
                    PLAYER
                );


            if(!card){

                return;

            }


            prepareTutorialCoolCard(
                card,
                PLAYER
            );


            board.playerCoolCards.push(
                card
            );

        }
    );


    /* =====================================================
       CPU HAND

       内容は任意
       4枚
    ===================================================== */

    enemyHandCards =
        createTutorialEnemyCards(
            4,
            []
        );


    enemyHandCards.forEach(
        card => {

            card.area =
                "enemyHand";


            card.owner =
                ENEMY;

        }
    );


    /* =====================================================
       CPU COST

       内容は任意
       3枚
    ===================================================== */

    const usedEnemyIds =
        enemyHandCards.map(
            card =>
                Number(
                    card.id
                )
        );


    enemyCostCards =
        createTutorialEnemyCards(
            3,
            usedEnemyIds
        );


    enemyCostCards.forEach(
        card => {

            card.area =
                "enemyCost";


            card.owner =
                ENEMY;


            if(
                typeof card.setFaceDown ===
                "function"
            ){

                card.setFaceDown(
                    true
                );

            }

        }
    );


    board.enemyCostCards =
        enemyCostCards;


    /* =====================================================
       CPU COOL

       12 グリフォン
       13 エアスラッシュ
       32 グラウンドウォール
    ===================================================== */

    const enemyCoolIds =
        [
            12,
            13,
            32
        ];


    enemyCoolCards =
        [];


    board.enemyCoolCards =
        [];


    enemyCoolIds.forEach(
        id => {

            const card =
                createTutorialCard(
                    id,
                    "cool",
                    ENEMY
                );


            if(!card){

                return;

            }


            prepareTutorialCoolCard(
                card,
                ENEMY
            );


            enemyCoolCards.push(
                card
            );


            board.enemyCoolCards.push(
                card
            );

        }
    );


    //----------------------------------
    // 表示更新
    //----------------------------------

    if(
        typeof board.updateCoolCount ===
        "function"
    ){

        board.updateCoolCount();

    }


    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    if(
        typeof updateHandCostDisplay ===
        "function"
    ){

        updateHandCostDisplay();

    }


    //----------------------------------
    // 通常ゲーム操作ボタンは隠す
    //----------------------------------

    resetTutorialGameActionArea();


    //----------------------------------
    // ターン終了禁止
    //----------------------------------

    setTutorialEndTurnEnabled(
        false
    );


    console.log(
        "STEP1：初期盤面完成"
    );

}


/* =========================================================
Prepare Cool Card
========================================================= */

function prepareTutorialCoolCard(
    card,
    owner
){

    card.area =
        "cool";


    card.owner =
        owner;


    if(
        typeof card.setFaceDown ===
        "function"
    ){

        card.setFaceDown(
            false
        );

    }


    if(
        typeof card.setHorizontal ===
        "function"
    ){

        card.setHorizontal(
            false
        );

    }


    if(
        typeof card.setSelected ===
        "function"
    ){

        card.setSelected(
            false
        );

    }


    if(
        typeof card.setHighlight ===
        "function"
    ){

        card.setHighlight(
            false
        );

    }


    if(
        typeof card.setCostSelected ===
        "function"
    ){

        card.setCostSelected(
            false
        );

    }

}


/* =========================================================
Create Arbitrary CPU Cards
========================================================= */

function createTutorialEnemyCards(
    count,
    excludeIds = []
){

    const result =
        [];


    const excluded =
        new Set(
            excludeIds.map(
                id =>
                    Number(
                        id
                    )
            )
        );


    //----------------------------------
    // STEP1で使用しているカードを避ける
    //----------------------------------

    [
        1,
        6,
        7,
        11,
        12,
        13,
        16,
        17,
        20,
        29,
        31,
        32
    ].forEach(
        id => {

            excluded.add(
                id
            );

        }
    );


    for(
        const data of CARD_LIST
    ){

        if(
            result.length >=
            count
        ){

            break;

        }


        if(
            excluded.has(
                Number(
                    data.id
                )
            )
        ){

            continue;

        }


        const card =
            createCard(
                data,
                "enemyHand",
                ENEMY
            );


        if(!card){

            continue;

        }


        result.push(
            card
        );


        excluded.add(
            Number(
                data.id
            )
        );

    }


    return result;

}


/* =========================================================
STEP1
Card Types Start
========================================================= */

function startTutorialStep1CardTypes(){

    step1State.active =
        true;


    step1State.phase =
        "selectSummon";


    step1State.explanationIndex =
        0;


    step1State.screenLocked =
        false;


    hideTutorialNextButton();


    clearAllTutorialHighlights();


    //----------------------------------
    // ユニコーン発光
    //----------------------------------

    highlightTutorialCard(
        step1State.summonCard
    );


    setTutorialGuide(
        "STEP 1",
        "まず3種類のカードを確認します。\nサモンの『ユニコーン』を選んでください。"
    );

}


/* =========================================================
STEP1
通常ゲームのカードクリックを監視
========================================================= */

function registerTutorialStep1CardObserver(){

    if(
        step1State.observerRegistered
    ){

        return;

    }


    step1State.observerRegistered =
        true;


    document.addEventListener(
        "click",
        tutorialStep1CaptureClick,
        true
    );

}


/* =========================================================
STEP1
Capture Click
========================================================= */

function tutorialStep1CaptureClick(
    event
){

    if(
        !step1State.active
    ){

        return;

    }


/* =====================================================
   STEP1
   説明中は下部バー以外の操作を完全に禁止

   これによりカード詳細モーダルも
   説明が終わるまで閉じない
===================================================== */

if(
    step1State.screenLocked
){

    const tutorialPanel =
        document.getElementById(
            "tutorial-panel"
        );


    //----------------------------------
    // 下部説明バー内のクリックだけ許可
    //----------------------------------

    const insideTutorialPanel =
        (
            tutorialPanel &&
            (
                event.target ===
                    tutorialPanel
                ||
                tutorialPanel.contains(
                    event.target
                )
            )
        );


    if(insideTutorialPanel){

        //----------------------------------
        // 「次へ」などは通常通り動かす
        //----------------------------------

        return;

    }


    //----------------------------------
    // それ以外はすべて禁止
    //
    // モーダル外クリックによる
    // closeHandModal() もここで止める
    //----------------------------------

    console.log(
        "STEP1：説明中なのでゲーム操作を禁止"
    );


    event.preventDefault();

    event.stopPropagation();

    event.stopImmediatePropagation();


    return;

}


    //----------------------------------
    // 手札カード
    //----------------------------------

    const cardElement =
        event.target.closest(
            ".card"
        );


    if(!cardElement){

        return;

    }


    const card =
        board.handCards.find(
            handCard =>
                typeof handCard.getElement ===
                    "function"
                &&
                handCard.getElement() ===
                    cardElement
        );


    if(!card){

        return;

    }


    //----------------------------------
    // 通常ゲーム側の選択処理を先に動かす
    //----------------------------------

    setTimeout(
        () => {

            tutorialStep1AfterCardClick(
                card
            );

        },
        60
    );

}


/* =========================================================
STEP1
通常ゲーム側のカード選択後
========================================================= */

function tutorialStep1AfterCardClick(
    card
){

    if(
        !step1State.active
    ){

        return;

    }


    console.log(
        "STEP1：カード選択後",
        card.name,
        "selectedHandCard=",
        selectedHandCard?.name
    );


    /* =====================================================
       サモン
    ===================================================== */

    if(
        step1State.phase ===
        "selectSummon"
    ){

        if(
            card !==
            step1State.summonCard
        ){

            setTutorialMessage(
                "『ユニコーン』を選んでください。"
            );


            return;

        }


        //----------------------------------
        // 通常ゲーム側で本当に選択されたか
        //----------------------------------

        if(
            selectedHandCard !==
            card
        ){

            return;

        }


        console.log(
            "STEP1：ユニコーン選択完了"
        );


        clearTutorialCardHighlight();


        step1State.phase =
            "summonExplanation1";


        //----------------------------------
        // ここから説明中はゲーム画面固定
        //----------------------------------

        lockTutorialStep1Game();


        setTutorialGuide(
            "STEP 1",
            "サモンは場に出してアタックやブロックを行うカードです。"
        );


        showTutorialNextButton(
            "次へ",
            tutorialStep1SummonExplanation2
        );


        return;

    }


    /* =====================================================
       マギア
    ===================================================== */

    if(
        step1State.phase ===
        "selectMagia"
    ){

        if(
            card !==
            step1State.magiaCard
        ){

            setTutorialMessage(
                "『ファイアボール』を選んでください。"
            );


            return;

        }


        if(
            selectedHandCard !==
            card
        ){

            return;

        }


        clearTutorialCardHighlight();


        step1State.phase =
            "magiaExplanation1";


        lockTutorialStep1Game();


        setTutorialGuide(
            "STEP 1",
            "マギアは対象にさまざまな効果を与えるカードです。"
        );


        showTutorialNextButton(
            "次へ",
            tutorialStep1MagiaExplanation2
        );


        return;

    }


    /* =====================================================
       レジスト
    ===================================================== */

    if(
        step1State.phase ===
        "selectResist"
    ){

        if(
            card !==
            step1State.resistCard
        ){

            setTutorialMessage(
                "『ストーンガード』を選んでください。"
            );


            return;

        }


        if(
            selectedHandCard !==
            card
        ){

            return;

        }


        clearTutorialCardHighlight();


        step1State.phase =
            "resistExplanation1";


        lockTutorialStep1Game();


        setTutorialGuide(
            "STEP 1",
            "レジストは相手のターンに使うカードです。"
        );


        showTutorialNextButton(
            "次へ",
            tutorialStep1ResistExplanation2
        );

    }

}


/* =========================================================
SUMMON Explanation 2
========================================================= */

function tutorialStep1SummonExplanation2(){

    step1State.phase =
        "summonExplanation2";


    setTutorialMessage(
        "サモンはそれぞれ固有の能力を持っています。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep1SummonExplanation3
    );

}


/* =========================================================
SUMMON Explanation 3
========================================================= */

function tutorialStep1SummonExplanation3(){

    step1State.phase =
        "summonExplanation3";


    setTutorialMessage(
        "サモンは自分のターンごとに1枚だけプレイできます。"
    );


    showTutorialNextButton(
        "次へ",
        startTutorialStep1Magia
    );

}


/* =========================================================
MAGIA Start
========================================================= */

function startTutorialStep1Magia(){

    //----------------------------------
    // サモン説明で固定していた画面を解除
    //----------------------------------

    unlockTutorialStep1Game();


    //----------------------------------
    // 詳細を閉じる
    //----------------------------------

    closeTutorialStep1CardDetail();


    //----------------------------------
    // 通常選択状態解除
    //----------------------------------

    resetTutorialStep1HandSelection();


    step1State.phase =
        "selectMagia";


    hideTutorialNextButton();


    clearTutorialCardHighlight();


    highlightTutorialCard(
        step1State.magiaCard
    );


    setTutorialGuide(
        "STEP 1",
        "次はマギアの『ファイアボール』を選んでください。"
    );

}


/* =========================================================
MAGIA Explanation 2
========================================================= */

function tutorialStep1MagiaExplanation2(){

    step1State.phase =
        "magiaExplanation2";


    setTutorialMessage(
        "マギアは自分のターンに何枚でもプレイできます。"
    );


    showTutorialNextButton(
        "次へ",
        startTutorialStep1Resist
    );

}


/* =========================================================
RESIST Start
========================================================= */

function startTutorialStep1Resist(){

    //----------------------------------
    // マギア説明で固定していた画面を解除
    //----------------------------------

    unlockTutorialStep1Game();


    closeTutorialStep1CardDetail();


    resetTutorialStep1HandSelection();


    step1State.phase =
        "selectResist";


    hideTutorialNextButton();


    clearTutorialCardHighlight();


    highlightTutorialCard(
        step1State.resistCard
    );


    setTutorialGuide(
        "STEP 1",
        "最後にレジストの『ストーンガード』を選んでください。"
    );

}


/* =========================================================
RESIST Explanation 2
========================================================= */

function tutorialStep1ResistExplanation2(){

    step1State.phase =
        "resistExplanation2";


    setTutorialMessage(
        "レジストは条件を満たしたときだけプレイできます。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep1ResistExplanation3
    );

}


/* =========================================================
RESIST Explanation 3
========================================================= */

function tutorialStep1ResistExplanation3(){

    step1State.phase =
        "resistExplanation3";


    setTutorialMessage(
        "相手の攻撃やカード効果に対応してプレイします。"
    );


    showTutorialNextButton(
        "次へ",
        startTutorialStep1ZoneExplanation
    );

}


/* =========================================================
Zone Explanation Start
========================================================= */

function startTutorialStep1ZoneExplanation(){

    /* =====================================================
       ★ここです

       レジスト説明中に固定したゲーム画面を解除してから
       ゾーン説明へ移行する。
    ===================================================== */

    unlockTutorialStep1Game();


    //----------------------------------
    // カード詳細
    //----------------------------------

    closeTutorialStep1CardDetail();


    //----------------------------------
    // 手札選択解除
    //----------------------------------

    resetTutorialStep1HandSelection();


    //----------------------------------
    // 発光解除
    //----------------------------------

    clearAllTutorialHighlights();


    step1State.phase =
        "zoneIntroduction";


    setTutorialGuide(
        "STEP 1",
        "次はカードを置く場所について確認します。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep1ShowHandZone
    );

}


/* =========================================================
HAND
========================================================= */

function tutorialStep1ShowHandZone(){

    step1State.phase =
        "handZone";


    clearTutorialHighlight();


    highlightTutorialZone(
        "#hand-cards-area"
    );


    setTutorialGuide(
        "手札",
        "ゲーム開始時、すべてのカードは手札にあります。\n手札のカードはプレイしたり、コストとして伏せたりします。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep1ShowFieldZone
    );

}


/* =========================================================
FIELD
========================================================= */

function tutorialStep1ShowFieldZone(){

    step1State.phase =
        "fieldZone";


    clearTutorialHighlight();


    highlightTutorialZone(
        "#player-field"
    );


    setTutorialGuide(
        "場",
        "サモンはプレイすると、タテ向きで場に出ます。\n場に出したサモンはアタックやブロックを行えます。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep1ShowCostZone
    );

}


/* =========================================================
COST
========================================================= */

function tutorialStep1ShowCostZone(){

    step1State.phase =
        "costZone";


    clearTutorialHighlight();


    highlightTutorialZone(
        "#player-cost-display"
    );


    setTutorialGuide(
        "コストゾーン",
        "カードのプレイ時にコストにしたカードを伏せて置く場所です。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep1ShowCoolZone
    );

}


/* =========================================================
COOL
========================================================= */

function tutorialStep1ShowCoolZone(){

    step1State.phase =
        "coolZone";


    clearTutorialHighlight();


    highlightTutorialZone(
        "#player-cool-display"
    );


    setTutorialGuide(
        "クールゾーン",
        "プレイしたカードや、倒されたサモンなどを置く場所です。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep1ShowEnemyZones
    );

}


/* =========================================================
Enemy Zones
========================================================= */

function tutorialStep1ShowEnemyZones(){

    step1State.phase =
        "enemyZones";


    clearTutorialHighlight();


    highlightTutorialZones(
        [
            "#enemy-hand-display",
            "#enemy-field",
            "#enemy-cost-display",
            "#enemy-cool-display"
        ]
    );


    setTutorialGuide(
        "相手のエリア",
        "相手にも手札・場・コストゾーン・クールゾーンがあります。"
    );


    showTutorialNextButton(
        "次へ",
        completeTutorialStep1
    );

}


/* =========================================================
STEP1 Complete
========================================================= */

function completeTutorialStep1(){

    console.log(
        "================================"
    );

    console.log(
        "===== STEP1 COMPLETE ====="
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // 念のため固定解除
    //----------------------------------

    unlockTutorialStep1Game();


    step1State.active =
        false;


    step1State.phase =
        "complete";


    clearAllTutorialHighlights();


    closeTutorialStep1CardDetail();


    resetTutorialStep1HandSelection();


    setTutorialGuide(
        "STEP 1",
        "カードの種類と、それぞれのカードを置く場所を確認しました。\nSTEP1はこれで完了です。"
    );


    showTutorialNextButton(
        "STEP 2へ",
        () => {

            moveTutorialStep(
                2
            );

        }
    );

}


/* =========================================================
Close Card Detail
========================================================= */

function closeTutorialStep1CardDetail(){

    if(
        typeof closeHandModal ===
        "function"
    ){

        closeHandModal();

    }

}


/* =========================================================
STEP1
通常手札選択を解除
========================================================= */

function resetTutorialStep1HandSelection(){

    if(
        selectedHandCard &&
        typeof selectedHandCard.setSelected ===
            "function"
    ){

        selectedHandCard.setSelected(
            false
        );

    }


    selectedHandCard =
        null;


    summonCard =
        null;


    selectedCostCards =
        [];


    costConfirm =
        false;


    //----------------------------------
    // STEP1ではプレイ操作を使わない
    //----------------------------------

    resetTutorialGameActionArea();

}


/* =========================================================
STEP1
ゲーム画面固定
========================================================= */

function lockTutorialStep1Game(){

    step1State.screenLocked =
        true;


    const gameArea =
        document.getElementById(
            "tutorial-game-area"
        );


    if(gameArea){

        gameArea.classList.add(
            "tutorial-game-locked"
        );

    }


    console.log(
        "STEP1：ゲーム画面固定"
    );

}


/* =========================================================
STEP1
ゲーム画面固定解除
========================================================= */

function unlockTutorialStep1Game(){

    step1State.screenLocked =
        false;


    const gameArea =
        document.getElementById(
            "tutorial-game-area"
        );


    if(gameArea){

        gameArea.classList.remove(
            "tutorial-game-locked"
        );

    }


    console.log(
        "STEP1：ゲーム画面固定解除"
    );

}