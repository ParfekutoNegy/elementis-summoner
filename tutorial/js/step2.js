/* =========================================================
Elementis Summoner Tutorial

STEP 2
カードのプレイ

・サモン
・マギア
・レジスト
========================================================= */


/* =========================================================
STEP2 State
========================================================= */

const step2State = {

    active:
        false,

    phase:
        "",

    selectedSummonCard:
        null,

    selectedMagiaCard:
        null,

    selectedResistCard:
        null,

    cpuMagiaCard:
        null,

    observerRegistered:
        false

};


/* =========================================================
Start
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTutorialStep2
);


/* =========================================================
Initialize
========================================================= */

function initializeTutorialStep2(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial STEP2 ====="
    );

    console.log(
        "================================"
    );

   //----------------------------------
    // STEP2専用クラス
    //----------------------------------

    document.body.classList.add(
        "tutorial-step2"
    );


    //----------------------------------
    // バトルログ初期非表示
    //----------------------------------

    initializeTutorialBattleLog();


    if(
        typeof board ===
        "undefined" ||
        !board
    ){

        console.error(
            "STEP2：board がありません"
        );

        return;

    }


    if(
        typeof CARD_LIST ===
        "undefined"
    ){

        console.error(
            "STEP2：CARD_LIST がありません"
        );

        return;

    }


//----------------------------------
// STEP2ではターン終了禁止
//----------------------------------

const endTurnButton =
    document.getElementById(
        "endturn-button"
    );

if(endTurnButton){

    endTurnButton.disabled =
        true;

    endTurnButton.classList.add(
        "tutorial-disabled-button"
    );

}



    beginTutorialStep(
        "STEP 2",
        "カードのプレイ方法を学びます。\nまずはサモンをプレイしてみましょう。"
    );


    game.currentPlayer =
        PLAYER;


    game.state =
        TURN_STATE.PLAYING;


    setTutorialLife(
        5,
        5
    );


    setTutorialIcons(
        1,
        2
    );


    registerTutorialStep2Observer();


    showTutorialNextButton(
        "開始",
        setupTutorialStep2SummonLesson
    );

}


/* =========================================================
共通10枚手札
========================================================= */

function createTutorialStep2FullHand(){

    const ids = [

        1,   // ウィルオウィスプ
        6,   // ファイアボール
        7,   // パイロフレイム
        11,  // ユニコーン
        16,  // ラピッドムーヴ
        17,  // セイレーン
        20,  // クラーケン
        29,  // ロックスパイク
        31,  // ストーンガード
        32   // グラウンドウォール

    ];


    const hand =
        [];


    ids.forEach(
        id => {

            const card =
                createTutorialCard(
                    id,
                    "hand",
                    PLAYER
                );


            if(!card){

                console.warn(
                    "STEP2：カード生成失敗",
                    id
                );

                return;

            }


            card.area =
                "hand";


            card.owner =
                PLAYER;


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


            hand.push(
                card
            );

        }
    );


    return hand;

}


/* =========================================================
共通リセット
========================================================= */

function resetTutorialStep2Lesson(){

    console.log(
        "================================"
    );

    console.log(
        "STEP2：練習盤面リセット"
    );

    console.log(
        "================================"
    );


    if(
        typeof closeHandModal ===
        "function"
    ){

        closeHandModal();

    }


    if(
        typeof closeCoolModal ===
        "function"
    ){

        closeCoolModal();

    }


    if(
        typeof closeEnemyCoolModal ===
        "function"
    ){

        closeEnemyCoolModal();

    }


    if(
        typeof closeCostView ===
        "function"
    ){

        closeCostView();

    }


    if(
        typeof resetAttackState ===
        "function"
    ){

        resetAttackState();

    }


    if(
        typeof resetMagiaState ===
        "function"
    ){

        resetMagiaState();

    }


    clearTutorialBoard();

    setupTutorialStep2EnemyHand();


    game.currentPlayer =
        PLAYER;


    game.state =
        TURN_STATE.PLAYING;


    setTutorialLife(
        5,
        5
    );


    summonUsedThisTurn =
        false;


    selectedHandCard =
        null;


    selectedSummon =
        null;


    summonCard =
        null;


    selectedCostCards =
        [];


    costConfirm =
        false;


    resistMode =
        false;


    resistEvent =
        null;


    selectableResistCards =
        [];


    resistUsingCard =
        null;


    selectedResistCostCards =
        [];


    resistCostConfirm =
        false;


    coolRecoveryMode =
        false;


    step2State.selectedSummonCard =
        null;


    step2State.selectedMagiaCard =
        null;


    step2State.selectedResistCard =
        null;


    step2State.cpuMagiaCard =
        null;


    clearAllTutorialHighlights();


    resetTutorialGameActionArea();


    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    setTutorialEndTurnEnabled(
        false
    );


    hideTutorialNextButton();

}


/* =========================================================
サモン練習
========================================================= */

function setupTutorialStep2SummonLesson(){

    resetTutorialStep2Lesson();


    console.log(
        "================================"
    );

    console.log(
        "STEP2：サモン練習"
    );

    console.log(
        "================================"
    );


    step2State.active =
        true;


    const hand =
        createTutorialStep2FullHand();


    board.setHandCards(
        hand
    );


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


    step2State.phase =
        "selectSummon";


    setTutorialGuide(
        "STEP 2",
        "サモンを1枚選び、プレイボタンを押してください。"
    );


    setTimeout(
        enforceTutorialStep2UI,
        50
    );

}


/* =========================================================
サモン発光
========================================================= */

function highlightTutorialStep2UsableSummons(){

    clearTutorialCardHighlight();


    board.handCards.forEach(
        card => {

            if(
                card.type !==
                "サモン"
            ){

                return;

            }


            let usable =
                true;


            if(
                typeof canPayCost ===
                "function"
            ){

                usable =
                    canPayCost(
                        card
                    );

            }


            if(
                usable &&
                typeof card.setHighlight ===
                "function"
            ){

                card.setHighlight(
                    true
                );

            }

        }
    );

}


/* =========================================================
マギア練習
========================================================= */

function setupTutorialStep2MagiaLesson(){

    resetTutorialStep2Lesson();


    console.log(
        "================================"
    );

    console.log(
        "STEP2：マギア練習"
    );

    console.log(
        "================================"
    );


    step2State.active =
        true;


    const hand =
        createTutorialStep2FullHand();


    board.setHandCards(
        hand
    );


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


    step2State.phase =
        "magiaIntroduction";


    setTutorialGuide(
        "STEP 2",
        "次はマギアのプレイ方法です。マギアはプレイ時に対象を選びます。"
    );


    showTutorialNextButton(
        "次へ",
        tutorialStep2StartMagiaSelection
    );

}


/* =========================================================
マギア選択開始
========================================================= */

function tutorialStep2StartMagiaSelection(){

    step2State.phase =
        "selectMagia";


    hideTutorialNextButton();


    setTutorialGuide(
        "STEP 2",
        "マギアを1枚選び、プレイボタンを押してください。\n対象が選べないマギアはプレイできません。"
    );


    setTimeout(
        enforceTutorialStep2UI,
        50
    );

}


/* =========================================================
マギア発光
========================================================= */

function highlightTutorialStep2UsableMagias(){

    clearTutorialCardHighlight();


    board.handCards.forEach(
        card => {

            const id =
                Number(
                    card.id
                );


            if(
                id !== 6 &&
                id !== 7
            ){

                return;

            }


            let usable =
                true;


            if(
                typeof canPayCost ===
                "function"
            ){

                usable =
                    usable &&
                    canPayCost(
                        card
                    );

            }


            if(
                typeof canUseMagia ===
                "function"
            ){

                usable =
                    usable &&
                    canUseMagia(
                        card
                    );

            }


            if(
                usable &&
                typeof card.setHighlight ===
                "function"
            ){

                card.setHighlight(
                    true
                );

            }

        }
    );

}


/* =========================================================
レジスト練習
========================================================= */
function setupTutorialStep2ResistLesson(){

    resetTutorialStep2Lesson();


    console.log(
        "================================"
    );

    console.log(
        "STEP2：レジスト練習"
    );

    console.log(
        "================================"
    );


    step2State.active =
        true;


    //----------------------------------
    // 自分の手札
    //----------------------------------

    const hand =
        createTutorialStep2FullHand();


    board.setHandCards(
        hand
    );


    //----------------------------------
    // 場を空にする
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
    // CPUゾーン初期化
    //----------------------------------

    enemyHandCards =
        [];


    enemyCostCards =
        [];


    enemyCoolCards =
        [];


    board.enemyCostCards =
        [];


    board.enemyCoolCards =
        [];


    //----------------------------------
    // CPU手札を10枚作る
    //----------------------------------

    setupTutorialStep2EnemyHand();


    //----------------------------------
    // 表示更新
    //----------------------------------

    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    //----------------------------------
    // 状態
    //----------------------------------

    step2State.phase =
        "resistIntroduction";


    //----------------------------------
    // 説明
    //----------------------------------

    setTutorialGuide(
        "STEP 2",
        "最後はレジストです。\n相手ターン中に条件を満たしたときのみプレイできます。"
    );


    //----------------------------------
    // 次へ
    //----------------------------------

    showTutorialNextButton(
        "次へ",
        executeTutorialStep2CpuMagia
    );

}

/* =========================================================
Observer
========================================================= */

function registerTutorialStep2Observer(){

    if(
        step2State.observerRegistered
    ){

        return;

    }


    step2State.observerRegistered =
        true;


    document.addEventListener(
        "click",
        tutorialStep2CaptureClick,
        true
    );

}


/* =========================================================
STEP2
Capture Click
========================================================= */

function tutorialStep2CaptureClick(
    event
){

    if(
        !step2State.active
    ){

        return;

    }


    /* =====================================================
       STEP2ではターン終了ボタンを完全に禁止
    ===================================================== */

    const endTurnButton =
        document.getElementById(
            "endturn-button"
        );


    if(
        endTurnButton &&
        (
            event.target ===
                endTurnButton
            ||
            endTurnButton.contains(
                event.target
            )
        )
    ){

        console.log(
            "STEP2：ターン終了は禁止"
        );


        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();


        return;

    }


    const phase =
        step2State.phase;


/* =====================================================
   STEP2ではアタック禁止
===================================================== */

if(
    event.target.closest(
        "#attack-button"
    )
    ||
    event.target.closest(
        "#summon-attack-button"
    )
){

    console.log(
        "STEP2：アタックは使用しない"
    );


    event.preventDefault();

    event.stopPropagation();

    event.stopImmediatePropagation();


    return;

}        


/* =====================================================
   レジスト
   「プレイしない / パス」

   STEP2ではレジストを使う練習なので
   パスはさせない
===================================================== */

if(
    event.target.closest(
        "#resist-pass-button"
    )
){

    if(
        phase === "selectResist" ||
        phase === "resistConditionExplanation"
    ){

        console.log(
            "STEP2：レジストをプレイしない → 禁止"
        );


        //----------------------------------
        // 通常ゲーム側へ流さない
        //----------------------------------

        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();


        //----------------------------------
        // レジスト選択状態を維持
        //----------------------------------

        step2State.phase =
            "selectResist";


        //----------------------------------
        // 説明
        //----------------------------------

        setTutorialMessage(
            "条件を満たしたレジストを1枚選び、プレイボタンを押してください。"
        );


        //----------------------------------
        // 使用可能レジストを再発光
        //----------------------------------

        setTimeout(
            () => {

                enforceTutorialStep2UI();

            },
            30
        );


        return;

    }

}


    /* =====================================================
       キャンセルボタン

       ★対象選択・コスト選択などの
       正式なキャンセルは許可する
    ===================================================== */

    if(
        event.target.closest(
            "#cancel-button"
        )
    ){

        console.log(
            "STEP2：キャンセルボタン"
        );


        //----------------------------------
        // 通常ゲーム側のキャンセル処理は
        // そのまま実行させる
        //----------------------------------

        setTimeout(
            tutorialStep2AfterCancelButton,
            80
        );


        return;

    }


    /* =====================================================
       ★マギア対象選択中

       正しい対象以外を押しても
       通常ゲーム側へ流さない。

       これにより誤タップで
       マギア処理がキャンセルされて
       STEP2が止まるのを防ぐ。
    ===================================================== */

    if(
        phase ===
        "selectMagiaTarget"
    ){

        //----------------------------------
        // 相手プレイヤー領域
        //----------------------------------

        const enemyPlayerArea =
            document.getElementById(
                "enemy-player-area"
            );


        const enemyPlayer =
            document.getElementById(
                "enemy-player"
            );


        const enemyIcon =
            document.getElementById(
                "enemy-player-icon"
            );


        const enemyLife =
            document.getElementById(
                "enemy-life-display"
            );


        //----------------------------------
        // 正しい対象か確認
        //----------------------------------

        const validTarget =
            (
                enemyPlayerArea &&
                (
                    event.target ===
                        enemyPlayerArea
                    ||
                    enemyPlayerArea.contains(
                        event.target
                    )
                )
            )
            ||
            (
                enemyPlayer &&
                (
                    event.target ===
                        enemyPlayer
                    ||
                    enemyPlayer.contains(
                        event.target
                    )
                )
            )
            ||
            (
                enemyIcon &&
                event.target ===
                    enemyIcon
            )
            ||
            (
                enemyLife &&
                (
                    event.target ===
                        enemyLife
                    ||
                    enemyLife.contains(
                        event.target
                    )
                )
            );


        //----------------------------------
        // 正しい対象
        //----------------------------------

        if(validTarget){

            console.log(
                "STEP2：マギア対象選択",
                "ENEMY PLAYER"
            );


            //----------------------------------
            // 通常ゲーム側へクリックを通す
            //----------------------------------

            setTimeout(
                () => {

                    tutorialStep2AfterMagiaTarget();


                    setTimeout(
                        enforceTutorialStep2UI,
                        30
                    );

                },
                80
            );


            return;

        }


        //----------------------------------
        // 間違った場所
        //
        // ★通常ゲームへ絶対に渡さない
        //----------------------------------

        console.log(
            "STEP2：マギア対象以外をクリック"
        );


        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();


        //----------------------------------
        // 対象選択状態は維持
        //----------------------------------

        setTutorialMessage(
            "選べる対象が発光します。\nここでは相手プレイヤーを選んでください。"
        );


        return;

    }


    /* =====================================================
       カードクリック
    ===================================================== */

    const cardElement =
        event.target.closest(
            ".card"
        );


    if(cardElement){

        const card =
            findTutorialStep2CardByElement(
                cardElement
            );


        if(card){

            const intercepted =
                handleTutorialStep2CardClick(
                    card,
                    event
                );


            //----------------------------------
            // チュートリアル側で
            // 通常処理を止めた場合
            //----------------------------------

            if(intercepted){

                setTimeout(
                    enforceTutorialStep2UI,
                    30
                );


                return;

            }


            //----------------------------------
            // 通常ゲーム側カード処理の後に
            // チュートリアルUIを再適用
            //----------------------------------

            setTimeout(
                enforceTutorialStep2UI,
                60
            );

        }

    }


    /* =====================================================
       プレイボタン
    ===================================================== */

    if(
        event.target.closest(
            "#use-button"
        )
    ){

        /* =================================================
           サモン確定

           プレイを押した時点で
           現在選択しているサモンを確定
        ================================================= */

        if(
            step2State.phase ===
            "selectSummon"
        ){

            if(
                selectedHandCard &&
                selectedHandCard.type ===
                    "サモン"
            ){

                step2State.selectedSummonCard =
                    selectedHandCard;


                step2State.phase =
                    "pressSummonPlay";


                console.log(
                    "STEP2：サモン確定",
                    selectedHandCard.name
                );

            }

        }


        /* =================================================
           マギア確定

           プレイを押した時点で
           ファイアボール /
           パイロフレイムのどちらかを確定
        ================================================= */

        else if(
            step2State.phase ===
            "selectMagia"
        ){

            if(selectedHandCard){

                const id =
                    Number(
                        selectedHandCard.id
                    );


                if(
                    id === 6 ||
                    id === 7
                ){

                    step2State.selectedMagiaCard =
                        selectedHandCard;


                    step2State.phase =
                        "pressMagiaPlay";


                    console.log(
                        "STEP2：マギア確定",
                        selectedHandCard.name
                    );

                }

            }

        }


        /* =================================================
           レジスト確定

           プレイを押した時点で
           selectableResistCards 内の
           現在選択カードを確定
        ================================================= */

        else if(
            step2State.phase ===
            "selectResist"
        ){

            if(
                selectedHandCard &&
                Array.isArray(
                    selectableResistCards
                ) &&
                selectableResistCards.includes(
                    selectedHandCard
                )
            ){

                step2State.selectedResistCard =
                    selectedHandCard;


                step2State.phase =
                    "pressResistPlay";


                console.log(
                    "STEP2：レジスト確定",
                    selectedHandCard.name
                );

            }

        }


        //----------------------------------
        // 通常ゲーム側のプレイ処理後
        //----------------------------------

        setTimeout(
            () => {

                tutorialStep2AfterUseButton();


                setTimeout(
                    enforceTutorialStep2UI,
                    30
                );

            },
            60
        );


        return;

    }


    /* =====================================================
       決定ボタン
    ===================================================== */

    if(
        event.target.closest(
            "#confirm-button"
        )
    ){

        setTimeout(
            () => {

                tutorialStep2AfterConfirmButton();


                setTimeout(
                    enforceTutorialStep2UI,
                    30
                );

            },
            120
        );


        return;

    }

}

/* =========================================================
Card DOM → Card
========================================================= */

function findTutorialStep2CardByElement(
    element
){

    if(
        !element ||
        !board
    ){

        return null;

    }


    for(
        const card of board.handCards
    ){

        if(
            typeof card.getElement ===
            "function" &&
            card.getElement() ===
            element
        ){

            return card;

        }

    }


    for(
        const summon of playerField
    ){

        if(
            summon &&
            summon.view &&
            typeof summon.view.getElement ===
                "function" &&
            summon.view.getElement() ===
                element
        ){

            return summon.card;

        }

    }


    return null;

}


/* =========================================================
STEP2
カードクリック

どのカードでも詳細確認可能。
プレイ可否だけチュートリアル側で制限する。
========================================================= */

function handleTutorialStep2CardClick(
    card,
    event
){

    const phase =
        step2State.phase;


    const id =
        Number(
            card.id
        );


    /* =====================================================
       サモン練習
    ===================================================== */

    if(
        phase ===
        "selectSummon"
    ){

        //----------------------------------
        // サモン
        //----------------------------------

        if(
            card.type ===
            "サモン"
        ){

            //----------------------------------
            // 支払い可能
            //----------------------------------

            const usable =
                (
                    typeof canPayCost !==
                        "function"
                    ||
                    canPayCost(
                        card
                    )
                );


            if(usable){

                //----------------------------------
                // プレイ候補
                //
                // まだ確定ではない。
                // 別のサモンへ変更可能。
                //----------------------------------

                step2State.selectedSummonCard =
                    card;


                setTutorialMessage(
                    "サモンを1枚選び、プレイボタンを押してください。"
                );

            }
            else{

                //----------------------------------
                // 詳細は見られるが
                // プレイ候補にはしない
                //----------------------------------

                step2State.selectedSummonCard =
                    null;


                setTutorialMessage(
                    "このサモンは現在コストを支払えません。"
                );

            }


            //----------------------------------
            // 通常ゲーム側のクリックを通す
            // → 詳細表示・選択表示
            //----------------------------------

            return false;

        }


        //----------------------------------
        // マギア / レジスト
        //
        // 詳細は見られる。
        // ただしプレイ対象ではない。
        //----------------------------------

        step2State.selectedSummonCard =
            null;


        setTutorialMessage(
            "サモンを1枚選び、プレイボタンを押してください。"
        );


        return false;

    }


    /* =====================================================
       サモンコスト
    ===================================================== */

    if(
        phase ===
        "selectSummonCost"
    ){

        setTimeout(
            updateTutorialStep2SummonCostMessage,
            30
        );


        return false;

    }


    /* =====================================================
       マギア練習
    ===================================================== */

    if(
        phase ===
        "selectMagia"
    ){

        //----------------------------------
        // ファイアボール
        // パイロフレイム
        //----------------------------------

        if(
            id === 6 ||
            id === 7
        ){

            let usable =
                true;


            //----------------------------------
            // コスト
            //----------------------------------

            if(
                typeof canPayCost ===
                "function"
            ){

                usable =
                    usable &&
                    canPayCost(
                        card
                    );

            }


            //----------------------------------
            // マギア使用条件
            //----------------------------------

            if(
                typeof canUseMagia ===
                "function"
            ){

                usable =
                    usable &&
                    canUseMagia(
                        card
                    );

            }


            if(usable){

                //----------------------------------
                // プレイ候補
                //----------------------------------

                step2State.selectedMagiaCard =
                    card;


                setTutorialMessage(
                    "マギアを1枚選び、プレイボタンを押してください。\n対象が選べないマギアはプレイできません。"
                );

            }
            else{

                step2State.selectedMagiaCard =
                    null;


                setTutorialMessage(
                    "このマギアは現在プレイできません。"
                );

            }


            //----------------------------------
            // 通常クリックは許可
            //----------------------------------

            return false;

        }


        //----------------------------------
        // ロックスパイク
        //----------------------------------

        if(id === 29){

            //----------------------------------
            // プレイ候補から外す
            //----------------------------------

            step2State.selectedMagiaCard =
                null;


            //----------------------------------
            // 詳細表示は許可
            //----------------------------------

            setTutorialGuide(
                "STEP 2",
                "対象が選べないマギアはプレイできません。"
            );


            return false;

        }


        //----------------------------------
        // その他のカード
        //
        // サモン・レジストも詳細確認OK
        //----------------------------------

        step2State.selectedMagiaCard =
            null;


        setTutorialMessage(
            "マギアを1枚選び、プレイボタンを押してください。\n対象が選べないマギアはプレイできません。"
        );


        return false;

    }


    /* =====================================================
       マギアコスト
    ===================================================== */

    if(
        phase ===
        "selectMagiaCost"
    ){

        setTimeout(
            updateTutorialStep2MagiaCostMessage,
            30
        );


        return false;

    }


    /* =====================================================
       レジスト練習
    ===================================================== */

    if(
        phase ===
        "selectResist"
    ){

        //----------------------------------
        // ラピッドムーヴ
        //----------------------------------

        if(id === 16){

            //----------------------------------
            // プレイ候補解除
            //----------------------------------

            step2State.selectedResistCard =
                null;


            //----------------------------------
            // 詳細は表示させる
            //----------------------------------

            setTutorialGuide(
                "STEP 2",
                "マギアからのダメージなので、条件がサモンからのダメージである『ラピッドムーヴ』はプレイできません。"
            );


            return false;

        }


        //----------------------------------
        // レジスト
        //----------------------------------

        if(
            card.type ===
            "レジスト"
        ){

            //----------------------------------
            // 今回のイベントで
            // 実際に使用可能か
            //----------------------------------

            const usable =
                (
                    Array.isArray(
                        selectableResistCards
                    )
                    &&
                    selectableResistCards.includes(
                        card
                    )
                );


            if(usable){

                //----------------------------------
                // プレイ候補
                //----------------------------------

                step2State.selectedResistCard =
                    card;


                setTutorialMessage(
                    "条件を満たしたレジストを1枚選び、プレイボタンを押してください。"
                );

            }
            else{

                //----------------------------------
                // 詳細のみ
                //----------------------------------

                step2State.selectedResistCard =
                    null;


                setTutorialMessage(
                    "このレジストは現在条件を満たしていません。"
                );

            }


            return false;

        }


        //----------------------------------
        // サモン / マギア
        //
        // 詳細確認だけ許可
        //----------------------------------

        step2State.selectedResistCard =
            null;


        setTutorialMessage(
            "条件を満たしたレジストを1枚選び、プレイボタンを押してください。"
        );


        return false;

    }


    /* =====================================================
       レジストコスト
    ===================================================== */

    if(
        phase ===
        "selectResistCost"
    ){

        setTimeout(
            updateTutorialStep2ResistCostMessage,
            30
        );


        return false;

    }


    return false;

}


/* =========================================================
After Use Button
========================================================= */

function tutorialStep2AfterUseButton(){

    if(
        !step2State.active
    ){

        return;

    }


    /* =====================================================
       サモン
    ===================================================== */

    if(
        step2State.phase ===
        "pressSummonPlay"
    ){

        if(
            summonCard ===
            step2State.selectedSummonCard
        ){

            step2State.phase =
                "selectSummonCost";


            const cost =
                getCurrentCardCost(
                    step2State.selectedSummonCard,
                    PLAYER
                );


            setTutorialMessage(
                `手札からコストにするカードを${cost}枚選んでください。`
            );

        }


        return;

    }


    /* =====================================================
       マギア
    ===================================================== */

    if(
        step2State.phase ===
        "pressMagiaPlay"
    ){

        step2State.phase =
            "selectMagiaTarget";


        setTutorialMessage(
            "選べる対象が発光します。\nここでは相手プレイヤーを選んでください。。"
        );


        return;

    }


    /* =====================================================
       レジスト
    ===================================================== */

    if(
        step2State.phase ===
        "pressResistPlay"
    ){

        if(
            resistUsingCard ===
            step2State.selectedResistCard
        ){

            step2State.phase =
                "selectResistCost";


            const cost =
                getCurrentCardCost(
                    step2State.selectedResistCard,
                    PLAYER
                );


            setTutorialMessage(
                `手札からコストにするカードを${cost}枚選んでください。`
            );

        }

    }

}


/* =========================================================
After Magia Target
========================================================= */

function tutorialStep2AfterMagiaTarget(){

    if(
        step2State.phase !==
        "selectMagiaTarget"
    ){

        return;

    }


    if(
        summonCard ===
        step2State.selectedMagiaCard
    ){

        step2State.phase =
            "selectMagiaCost";


        const cost =
            getCurrentCardCost(
                step2State.selectedMagiaCard,
                PLAYER
            );


        setTutorialMessage(
            `手札からコストにするカードを${cost}枚選んでください。`
        );

    }

}


/* =========================================================
Cost Messages
========================================================= */

function updateTutorialStep2SummonCostMessage(){

    if(
        step2State.phase !==
        "selectSummonCost"
    ){

        return;

    }


    const cost =
        getCurrentCardCost(
            step2State.selectedSummonCard,
            PLAYER
        );


    const selected =
        selectedCostCards.length;


    if(selected < cost){

        setTutorialMessage(
            `コストを選択してください。${selected} / ${cost}枚`
        );

    }
    else{

        setTutorialMessage(
            "必要なコストを選びました。決定ボタンを押してください。"
        );

    }

}


function updateTutorialStep2MagiaCostMessage(){

    if(
        step2State.phase !==
        "selectMagiaCost"
    ){

        return;

    }


    const cost =
        getCurrentCardCost(
            step2State.selectedMagiaCard,
            PLAYER
        );


    const selected =
        selectedCostCards.length;


    if(selected < cost){

        setTutorialMessage(
            `コストを選択してください。${selected} / ${cost}枚`
        );

    }
    else{

        setTutorialMessage(
            "必要なコストを選びました。決定ボタンを押してください。"
        );

    }

}


function updateTutorialStep2ResistCostMessage(){

    if(
        step2State.phase !==
        "selectResistCost"
    ){

        return;

    }


    const cost =
        getCurrentCardCost(
            step2State.selectedResistCard,
            PLAYER
        );


    const selected =
        selectedResistCostCards
            ?.length ?? 0;


    if(selected < cost){

        setTutorialMessage(
            `コストを選択してください。${selected} / ${cost}枚`
        );

    }
    else{

        setTutorialMessage(
            "必要なコストを選びました。決定ボタンを押してください。"
        );

    }

}


/* =========================================================
After Confirm
========================================================= */

function tutorialStep2AfterConfirmButton(){

    if(
        !step2State.active
    ){

        return;

    }


    /* =====================================================
       サモン完了
    ===================================================== */

    if(
        step2State.phase ===
        "selectSummonCost"
    ){

        const summoned =
            playerField.find(
                summon =>
                    summon.card ===
                    step2State.selectedSummonCard
            );


        if(summoned){

            step2State.phase =
                "summonComplete";


            clearTutorialCardHighlight();


            setTutorialGuide(
                "STEP 2",
                "サモンを場に出しました。\nコストにしたカードはコストゾーンへ置かれます。"
            );


            showTutorialNextButton(
                "マギア練習へ",
                setupTutorialStep2MagiaLesson
            );

        }


        return;

    }


    /* =====================================================
       マギア完了
    ===================================================== */

    if(
        step2State.phase ===
        "selectMagiaCost"
    ){

        const inCool =
            board.playerCoolCards.includes(
                step2State.selectedMagiaCard
            );


        if(inCool){

            step2State.phase =
                "magiaComplete";


            setTutorialGuide(
                "STEP 2",
                "マギアの効果で相手にダメージを与えました。\n使用したカードはクールゾーンに置かれます。"
            );


            showTutorialNextButton(
                "レジスト練習へ",
                setupTutorialStep2ResistLesson
            );

        }


        return;

    }


    /* =====================================================
       レジスト
    ===================================================== */

    if(
        step2State.phase ===
        "selectResistCost"
    ){

        setTimeout(
            tutorialStep2CheckResistComplete,
            100
        );

    }

}


/* =========================================================
After Cancel
========================================================= */

function tutorialStep2AfterCancelButton(){

    if(
        !step2State.active
    ){

        return;

    }


    const oldPhase =
        step2State.phase;


    console.log(
        "STEP2：キャンセル",
        oldPhase
    );


    clearAllTutorialHighlights();


    /* =====================================================
       サモンへ戻る
    ===================================================== */

    if(
        oldPhase ===
            "pressSummonPlay"
        ||
        oldPhase ===
            "selectSummonCost"
    ){

        step2State.selectedSummonCard =
            null;


        step2State.phase =
            "selectSummon";


        selectedHandCard =
            null;


        summonCard =
            null;


        selectedCostCards =
            [];


        costConfirm =
            false;


        setTutorialGuide(
            "STEP 2",
            "サモンを1枚選び、プレイボタンを押してください。"
        );


        setTimeout(
            enforceTutorialStep2UI,
            80
        );


        return;

    }


/* =====================================================
   マギアへ戻る
===================================================== */

if(
    oldPhase ===
        "pressMagiaPlay"
    ||
    oldPhase ===
        "selectMagiaTarget"
    ||
    oldPhase ===
        "selectMagiaCost"
){

    resetTutorialStep2MagiaSelection();

    return;

}

    /* =====================================================
       レジストへ戻る
    ===================================================== */

    if(
        oldPhase ===
            "pressResistPlay"
        ||
        oldPhase ===
            "selectResistCost"
    ){

        step2State.selectedResistCard =
            null;


        step2State.phase =
            "selectResist";


        selectedHandCard =
            null;


        resistUsingCard =
            null;


        selectedResistCostCards =
            [];


        resistCostConfirm =
            false;


        setTutorialGuide(
            "STEP 2",
            "条件を満たしたレジストを1枚選び、プレイボタンを押してください。"
        );


        setTimeout(
            enforceTutorialStep2UI,
            80
        );

    }

}


/* =========================================================
STEP2 UI強制調整
========================================================= */

/* =========================================================
STEP2
現在のフェーズに合わせてUIを強制調整
========================================================= */

function enforceTutorialStep2UI(){

    if(
        !step2State.active
    ){

        return;

    }


    //----------------------------------
    // プレイボタン制御
    //----------------------------------

    enforceTutorialStep2PlayButton();


    //----------------------------------
    // STEP2ではアタック禁止
    //----------------------------------

    hideTutorialStep2AttackButton();


    //----------------------------------
    // 発光制御
    //----------------------------------

    enforceTutorialStep2Highlight();

}

/* =========================================================
STEP2
プレイボタン制御

詳細表示は全カード許可するが、
プレイできるカードだけボタンを表示する。
========================================================= */

function enforceTutorialStep2PlayButton(){

    const useButton =
        document.getElementById(
            "use-button"
        );


    if(!useButton){

        return;

    }


    let allowed =
        false;


    /* =====================================================
       サモン練習
    ===================================================== */

    if(
        step2State.phase ===
        "selectSummon"
    ){

        //----------------------------------
        // 現在選択されているカード
        //----------------------------------

        const card =
            selectedHandCard;


        if(
            card &&
            card.type ===
                "サモン"
        ){

            //----------------------------------
            // STEP2側でも
            // プレイ候補として認識している
            //----------------------------------

            const sameCard =
                step2State.selectedSummonCard ===
                card;


            //----------------------------------
            // コスト確認
            //----------------------------------

            const canPay =
                (
                    typeof canPayCost !==
                        "function"
                    ||
                    canPayCost(
                        card
                    )
                );


            allowed =
                sameCard &&
                canPay;

        }

    }


    /* =====================================================
       マギア練習
    ===================================================== */

    else if(
        step2State.phase ===
        "selectMagia"
    ){

        const card =
            selectedHandCard;


        if(card){

            const id =
                Number(
                    card.id
                );


            //----------------------------------
            // 今回使用可能なのは
            // ファイアボール / パイロフレイム
            //----------------------------------

            if(
                id === 6 ||
                id === 7
            ){

                const sameCard =
                    step2State.selectedMagiaCard ===
                        card;


                let usable =
                    sameCard;


                if(
                    usable &&
                    typeof canPayCost ===
                        "function"
                ){

                    usable =
                        canPayCost(
                            card
                        );

                }


                if(
                    usable &&
                    typeof canUseMagia ===
                        "function"
                ){

                    usable =
                        canUseMagia(
                            card
                        );

                }


                allowed =
                    usable;

            }

        }

    }


    /* =====================================================
       レジスト練習
    ===================================================== */

    else if(
        step2State.phase ===
        "selectResist"
    ){

        const card =
            selectedHandCard;


        if(card){

            const sameCard =
                step2State.selectedResistCard ===
                    card;


            const selectable =
                (
                    Array.isArray(
                        selectableResistCards
                    )
                    &&
                    selectableResistCards.includes(
                        card
                    )
                );


            allowed =
                sameCard &&
                selectable;

        }

    }


    /* =====================================================
       プレイボタンを押した直後
    ===================================================== */

    else if(
        step2State.phase ===
            "pressSummonPlay"
        ||
        step2State.phase ===
            "pressMagiaPlay"
        ||
        step2State.phase ===
            "pressResistPlay"
    ){

        allowed =
            true;

    }


    /* =====================================================
       表示
    ===================================================== */

    if(allowed){

        //----------------------------------
        // 通常ゲーム側が表示した場合は
        // その表示を維持する
        //----------------------------------

        return;

    }


    //----------------------------------
    // 使用不可なら必ず隠す
    //----------------------------------

    useButton.style.display =
        "none";

}

/* =========================================================
Highlight Control
========================================================= */

function enforceTutorialStep2Highlight(){

    clearTutorialCardHighlight();


    if(
        step2State.phase ===
        "selectSummon"
    ){

        highlightTutorialStep2UsableSummons();

        return;

    }


    if(
        step2State.phase ===
        "selectMagia"
    ){

        highlightTutorialStep2UsableMagias();

        return;

    }


    if(
        step2State.phase ===
        "selectResist"
    ){

        if(
            Array.isArray(
                selectableResistCards
            )
        ){

            selectableResistCards.forEach(
                card => {

                    if(
                        typeof card.setHighlight ===
                        "function"
                    ){

                        card.setHighlight(
                            true
                        );

                    }

                }
            );

        }

    }

}


/* =========================================================
STEP2
CPU パイロフレイム使用
========================================================= */

function executeTutorialStep2CpuMagia(){

    console.log(
        "================================"
    );

    console.log(
        "STEP2：CPU パイロフレイム使用"
    );

    console.log(
        "================================"
    );


    hideTutorialNextButton();


    clearAllTutorialHighlights();


    //----------------------------------
    // CPUターン
    //----------------------------------

    game.currentPlayer =
        ENEMY;


    game.state =
        TURN_STATE.PLAYING;


    //----------------------------------
    // パイロフレイム生成
    //----------------------------------

    const magia =
        createTutorialCard(
            7,
            "enemyHand",
            ENEMY
        );


    if(!magia){

        console.error(
            "STEP2：パイロフレイム生成失敗"
        );

        return;

    }


    //----------------------------------
    // CPU手札状態
    //----------------------------------

    magia.area =
        "enemyHand";


    magia.owner =
        ENEMY;


    step2State.cpuMagiaCard =
        magia;


    //----------------------------------
    // ★重要
    //
    // CPU手札10枚のうち
    // 1枚をパイロフレイムへ差し替える
    //
    // enemyHandCards = [magia];
    // にはしない
    //----------------------------------

    if(
        enemyHandCards.length > 0
    ){

        enemyHandCards[0] =
            magia;

    }
    else{

        enemyHandCards.push(
            magia
        );

    }


    //----------------------------------
    // CPU手札表示更新
    //----------------------------------

    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    console.log(
        "STEP2：パイロフレイム使用前CPU手札",
        enemyHandCards.length
    );


    //----------------------------------
    // CPUカード使用演出
    //----------------------------------

    if(
        typeof showCpuCardAction ===
        "function"
    ){

        showCpuCardAction(
            magia,
            "MAGIA",
            PLAYER
        );

    }


    //----------------------------------
    // バトルログ
    //----------------------------------

    if(
        typeof addBattleLog ===
        "function"
    ){

        addBattleLog(
            "CPU：パイロフレイムを使用"
        );


        addBattleLog(
            "CPU：対象 → PLAYER"
        );

    }


    //----------------------------------
    // 説明
    //----------------------------------

    setTutorialGuide(
        "STEP 2",
        "相手が3ダメージを与える『パイロフレイム』をプレイしました。レジストをプレイしてダメージを防ぎましょう。"
    );


    //----------------------------------
    // 状態
    //----------------------------------

    step2State.phase =
        "waitingResist";


    //----------------------------------
    // 少し待ってレジスト判定へ
    //----------------------------------

    setTimeout(
        () => {

            //----------------------------------
            // パイロフレイムを
            // CPU手札から削除
            //
            // 10枚 → 9枚
            //----------------------------------

            enemyHandCards =
                enemyHandCards.filter(
                    card =>
                        card !== magia
                );


            //----------------------------------
            // CPU手札表示更新
            //----------------------------------

            if(
                typeof updateEnemyZoneDisplay ===
                "function"
            ){

                updateEnemyZoneDisplay();

            }


            console.log(
                "STEP2：パイロフレイム使用後CPU手札",
                enemyHandCards.length
            );


            //----------------------------------
            // レジスト判定用イベント
            //----------------------------------

            const resistEventData = {

                type:
                    "beforePlayerDamage",

                player:
                    PLAYER,

                damage:
                    3,

                source:
                    magia,

                sourceType:
                    "マギア",

                element:
                    magia.elementType ??
                    magia.element ??
                    "火"

            };


            //----------------------------------
            // 通常ゲームのレジスト判定
            //----------------------------------

            if(
                typeof triggerResist ===
                "function"
            ){

                triggerResist(
                    resistEventData
                );

            }


            //----------------------------------
            // ラピッドムーヴ説明へ
            //----------------------------------

            setTimeout(
                tutorialStep2ExplainRapidMove,
                150
            );

        },
        700
    );

}

/* =========================================================
Rapid Move Explanation
========================================================= */

function tutorialStep2ExplainRapidMove(){

    step2State.phase =
        "resistConditionExplanation";


    setTutorialGuide(
        "STEP 2",
        "相手が3ダメージを与える『パイロフレイム』をプレイしました。レジストをプレイしてダメージを防ぎましょう。"
    );


    showTutorialNextButton(
        "次へ",
        startTutorialStep2ResistSelection
    );

}


/* =========================================================
Resist Selection
========================================================= */

function startTutorialStep2ResistSelection(){

    step2State.phase =
        "selectResist";


    hideTutorialNextButton();


    setTutorialGuide(
        "STEP 2",
        "条件を満たしたレジストを1枚選び、プレイボタンを押してください。"
    );


    setTimeout(
        enforceTutorialStep2UI,
        50
    );

}


/* =========================================================
Resist Complete
========================================================= */

function tutorialStep2CheckResistComplete(){

    if(resistUsingCard){

        setTimeout(
            tutorialStep2CheckResistComplete,
            100
        );


        return;

    }


    const selected =
        step2State.selectedResistCard;


    if(!selected){

        return;

    }


    const inCool =
        board.playerCoolCards.includes(
            selected
        );


    if(!inCool){

        setTimeout(
            tutorialStep2CheckResistComplete,
            100
        );


        return;

    }


    step2State.phase =
        "resistComplete";


    const cpuMagia =
        step2State.cpuMagiaCard;


    if(cpuMagia){

        cpuMagia.area =
            "cool";


        cpuMagia.owner =
            ENEMY;


        if(
            !board.enemyCoolCards.includes(
                cpuMagia
            )
        ){

            board.enemyCoolCards.push(
                cpuMagia
            );

        }


        if(
            !enemyCoolCards.includes(
                cpuMagia
            )
        ){

            enemyCoolCards.push(
                cpuMagia
            );

        }


        if(
            typeof updateEnemyZoneDisplay ===
            "function"
        ){

            updateEnemyZoneDisplay();

        }

    }


    setTutorialGuide(
        "STEP 2",
        `レジストをプレイし、ダメージを防げました。`
    );


    showTutorialNextButton(
        "次へ",
        completeTutorialStep2
    );

}


/* =========================================================
Complete
========================================================= */

function completeTutorialStep2(){

    step2State.active =
        false;


    step2State.phase =
        "complete";


    clearAllTutorialHighlights();


    resetTutorialGameActionArea();


    if(
        typeof closeHandModal ===
        "function"
    ){

        closeHandModal();

    }


    setTutorialEndTurnEnabled(
        false
    );


    setTutorialGuide(
        "STEP 2",
        "サモン・マギア・レジストのプレイ方法を確認しました。\nSTEP2はこれで完了です。"
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
Action Area Observer

通常ゲーム側 updateButtons() のあとでも
チュートリアル制限を維持
========================================================= */

const tutorialStep2ActionObserver =
    new MutationObserver(
        () => {

            if(
                !step2State.active
            ){

                return;

            }


            enforceTutorialStep2PlayButton();

        }
    );


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const actionArea =
            document.getElementById(
                "cost-action-area"
            );


        if(!actionArea){

            return;

        }


        tutorialStep2ActionObserver.observe(
            actionArea,
            {
                attributes:
                    true,

                childList:
                    true,

                subtree:
                    true,

                attributeFilter:
                    [
                        "style",
                        "class"
                    ]
            }
        );

    }
);

/* =========================================================
STEP2
マギア選択状態へ戻す
========================================================= */

function resetTutorialStep2MagiaSelection(){

    console.log(
        "STEP2：マギア選択へ戻る"
    );


    //----------------------------------
    // STEP状態
    //----------------------------------

    step2State.selectedMagiaCard =
        null;


    step2State.phase =
        "selectMagia";


    //----------------------------------
    // 通常ゲーム側選択解除
    //----------------------------------

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
    // マギア対象状態解除
    //----------------------------------

    if(
        typeof magiaTargetMode !==
        "undefined"
    ){

        magiaTargetMode =
            false;

    }


    //----------------------------------
    // 対象発光解除
    //----------------------------------

    if(
        typeof clearMagiaHighlight ===
        "function"
    ){

        clearMagiaHighlight();

    }


    //----------------------------------
    // 行動案内解除
    //----------------------------------

    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    //----------------------------------
    // 通常ボタン更新
    //----------------------------------

    if(
        typeof updateButtons ===
        "function"
    ){

        updateButtons();

    }


    //----------------------------------
    // チュートリアル説明
    //----------------------------------

    setTutorialGuide(
        "STEP 2",
        "マギアを1枚選び、プレイボタンを押してください。\n対象が選べないマギアはプレイできません。"
    );


    //----------------------------------
    // マギアだけ再発光
    //----------------------------------

    setTimeout(
        enforceTutorialStep2UI,
        80
    );

}

/* =========================================================
STEP2
アタックボタンを常に非表示
========================================================= */

function hideTutorialStep2AttackButton(){

    const attackButton =
        document.getElementById(
            "attack-button"
        );


    if(attackButton){

        attackButton.style.display =
            "none";

    }


    //----------------------------------
    // 場サモン詳細モーダル側の
    // アタックボタンも非表示
    //----------------------------------

    const summonAttackButton =
        document.getElementById(
            "summon-attack-button"
        );


    if(summonAttackButton){

        summonAttackButton.style.display =
            "none";

    }

}

/* =========================================================
STEP2
CPU手札を10枚にする
========================================================= */

function setupTutorialStep2EnemyHand(){

    //----------------------------------
    // CPU手札初期化
    //----------------------------------

    enemyHandCards =
        [];


    //----------------------------------
    // CARD_LISTから10枚作成
    //----------------------------------

    for(
        const data of CARD_LIST
    ){

        if(
            enemyHandCards.length >=
            10
        ){

            break;

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


        card.area =
            "enemyHand";


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


        enemyHandCards.push(
            card
        );

    }


    //----------------------------------
    // 表示更新
    //----------------------------------

    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    //----------------------------------
    // 念のため枚数表示も直接更新
    //----------------------------------

    const countElement =
        document.getElementById(
            "enemy-hand-count"
        );


    if(countElement){

        countElement.textContent =
            "手札×" +
            enemyHandCards.length;

    }


    console.log(
        "STEP2：CPU手札",
        enemyHandCards.length,
        enemyHandCards
    );

}