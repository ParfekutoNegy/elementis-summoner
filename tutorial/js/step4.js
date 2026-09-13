/* =========================================================
Elementis Summoner
Tutorial STEP4
Turn Progression
NEW VERSION
========================================================= */


/* =========================================================
STEP4 Player Hand
========================================================= */

const TUTORIAL_STEP4_PLAYER_HAND_IDS = [

    1,      // ウィルオウィスプ
    11,     // ユニコーン
    20,     // クラーケン
    29,     // ロックスパイク
    5,      // バーニングエナジー
    6,      // ファイアボール
    7,      // パイロフレイム
    16,     // ラピッドムーヴ
    31,     // ストーンガード
    32      // グラウンドウォール

];


/* =========================================================
STEP4 CPU Hand

CPU側では

・ユニコーン
・ラピッドムーヴ
・ストーンガード

を必ず使用する。

残りはコスト支払い用。
========================================================= */

const TUTORIAL_STEP4_CPU_HAND_IDS = [

    11,     // ユニコーン
    16,     // ラピッドムーヴ
    31,     // ストーンガード

    1,      // ウィルオウィスプ
    2,      // サラマンダー
    3,
    9,
    10,
    17,     // セイレーン
    20      // クラーケン

];


/* =========================================================
STEP4 State
========================================================= */

const step4State = {

    active:
        false,

    phase:
        "none",

    playerTurnNumber:
        1,


    //==================================================
    // PLAYER
    //==================================================

    unicorn:
        null,

    burningEnergy:
        null,

    fireball:
        null,

    stoneGuard:
        null,


    //==================================================
    // CPU
    //==================================================

    cpuUnicorn:
        null,

    cpuRapidMove:
        null,

    cpuStoneGuard:
        null,


    //==================================================
    // PLAYER 1ターン目
    //==================================================

    unicornSummoned:
        false,

    burningEnergyUsed:
        false,

    unicornAttacked:
        false,

    cpuRapidMoveUsedFirstTurn:
        false,

    fireballUsed:
        false,

    firstTurnEnded:
        false,


    //==================================================
    // CPUターン
    //==================================================

    cpuTurnStarted:
        false,

    cpuUnicornSummoned:
        false,

    cpuUnicornAttacked:
        false,

    playerStoneGuardUsed:
        false,


    //==================================================
    // PLAYER 2ターン目
    //==================================================

    secondPlayerTurnStarted:
        false,

    readyExplanationDone:
        false,

    costRecoveryDone:
        false,

    coolRecoveryDone:
        false,

    freePlay:
        false,


    //==================================================
    // 自由行動中のCPUレジスト
    //==================================================

    freePlayRapidMoveUsed:
        false,

    freePlayStoneGuardUsed:
        false,


    //==================================================
    // コスト誘導
    //==================================================

    allowedCostCardNames:
        [],


    //==================================================
    // Hooks
    //==================================================

    gameHooksInstalled:
        false,

    clickObserverInstalled:
        false

};


/* =========================================================
DOMContentLoaded
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    initializeTutorialStep4

);


/* =========================================================
Initialization
========================================================= */

function initializeTutorialStep4(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial STEP4 NEW ====="
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // Tutorial開始
    //----------------------------------

    step4State.active =
        true;

    step4State.phase =
        "introduction";


    //----------------------------------
    // ゲーム状態
    //----------------------------------

    game.turn =
        1;

    game.currentPlayer =
        PLAYER;

    game.state =
        TURN_STATE.PLAYING;

    game.playerLife =
        5;

    game.enemyLife =
        5;


    //----------------------------------
    // 初期盤面
    //----------------------------------

    setupTutorialStep4Board();


    //----------------------------------
    // バトルログ
    //----------------------------------

    if(
        typeof initializeTutorialBattleLog ===
        "function"
    ){

        initializeTutorialBattleLog();

    }


    //----------------------------------
    // プレイヤーアイコン
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
    // 通常処理Hook
    //----------------------------------

    installTutorialStep4GameHooks();

    installTutorialStep4ClickObserver();


    //----------------------------------
    // ターン終了禁止
    //----------------------------------

    setTutorialStep4EndTurnEnabled(
        false
    );


    //----------------------------------
    // 開始説明
    //----------------------------------

    setTutorialGuide(

        "STEP 4",

        "実際にターンを進めながら、" +
        "ターンの流れについて学びます。"

    );


    showTutorialNextButton(

        "開始",

        showTutorialStep4TurnIntroduction

    );

}


/* =========================================================
Board Setup
========================================================= */

function setupTutorialStep4Board(){

    //==================================================
    // 場
    //==================================================

    playerField.length =
        0;

    enemyField.length =
        0;


    if(
        typeof board.setPlayerCards ===
        "function"
    ){

        board.setPlayerCards(
            []
        );

    }


    if(
        typeof board.setEnemyCards ===
        "function"
    ){

        board.setEnemyCards(
            []
        );

    }


    //==================================================
    // コストゾーン
    //==================================================

    board.costCards =
        [];

    enemyCostCards =
        [];

    board.enemyCostCards =
        enemyCostCards;


    //==================================================
    // クールゾーン
    //==================================================

    board.playerCoolCards =
        [];

    enemyCoolCards =
        [];

    board.enemyCoolCards =
        enemyCoolCards;


    //==================================================
    // PLAYER手札
    //==================================================

    const playerHand =

        TUTORIAL_STEP4_PLAYER_HAND_IDS

            .map(
                id =>
                    createTutorialStep4Card(
                        id,
                        PLAYER
                    )
            )

            .filter(
                Boolean
            );


    board.setHandCards(
        playerHand
    );


    //==================================================
    // CPU手札
    //==================================================

    enemyHandCards =

        TUTORIAL_STEP4_CPU_HAND_IDS

            .map(
                id =>
                    createTutorialStep4Card(
                        id,
                        ENEMY
                    )
            )

            .filter(
                Boolean
            );


    enemyHandCards.forEach(
        card => {

            card.owner =
                ENEMY;

            card.area =
                "enemyHand";

        }
    );


    if(board){

        board.enemyHandCards =
            enemyHandCards;

    }


    //==================================================
    // PLAYERカード参照
    //==================================================

    step4State.unicorn =

        findTutorialStep4PlayerHandCard(
            "ユニコーン"
        );


    step4State.burningEnergy =

        findTutorialStep4PlayerHandCard(
            "バーニングエナジー"
        );


    step4State.fireball =

        findTutorialStep4PlayerHandCard(
            "ファイアボール"
        );


    step4State.stoneGuard =

        findTutorialStep4PlayerHandCard(
            "ストーンガード"
        );


    //==================================================
    // CPUカード参照
    //==================================================

    step4State.cpuUnicorn =

        enemyHandCards.find(
            card =>
                card.name ===
                "ユニコーン"
        ) || null;


    step4State.cpuRapidMove =

        enemyHandCards.find(
            card =>
                card.name ===
                "ラピッドムーヴ"
        ) || null;


    step4State.cpuStoneGuard =

        enemyHandCards.find(
            card =>
                card.name ===
                "ストーンガード"
        ) || null;


    //----------------------------------
    // 表示
    //----------------------------------

    updateTutorialStep4AllDisplays();


    console.log(

        "★ STEP4 PLAYER初期手札",

        board.handCards.map(
            card =>
                card.name
        )

    );


    console.log(

        "★ STEP4 CPU初期手札",

        enemyHandCards.map(
            card =>
                card.name
        )

    );

}


/* =========================================================
Card Creation
========================================================= */

function createTutorialStep4Card(

    id,

    owner = PLAYER

){

    const source =

        CARD_LIST.find(
            card =>
                Number(card.id) ===
                Number(id)
        );


    if(!source){

        console.warn(
            "STEP4 card not found:",
            id
        );

        return null;

    }


    //----------------------------------
    // 元データをコピー
    //----------------------------------

    const cardData = {

        ...source

    };


    //----------------------------------
    // tutorialフォルダから見た画像パスへ補正
    //----------------------------------

    if(
        cardData.image &&
        cardData.image.startsWith(
            "images/"
        )
    ){

        cardData.image =
            "../" +
            cardData.image;

    }


    //----------------------------------
    // Card生成
    //----------------------------------

    const card =

        new Card(
            cardData
        );


    card.owner =
        owner;


    //----------------------------------
    // PLAYER
    //----------------------------------

    if(
        owner === PLAYER
    ){

        card.area =
            "hand";


        card.onClick(
            tutorialStep4CardClick
        );

    }


    //----------------------------------
    // CPU
    //----------------------------------

    else{

        card.area =
            "enemyHand";

    }


    return card;

}


/* =========================================================
Find Player Hand Card
========================================================= */

function findTutorialStep4PlayerHandCard(
    name
){

    if(
        !board ||
        !Array.isArray(
            board.handCards
        )
    ){

        return null;

    }


    return (

        board.handCards.find(
            card =>
                card &&
                card.name ===
                name
        )

        ||

        null

    );

}


/* =========================================================
Display Update
========================================================= */

function updateTutorialStep4AllDisplays(){

    //----------------------------------
    // PLAYER場
    //----------------------------------

    if(
        board &&
        typeof board.setPlayerCards ===
            "function"
    ){

        board.setPlayerCards(

            playerField.map(
                summon =>
                    summon.view
            )

        );

    }


    //----------------------------------
    // CPU場
    //----------------------------------

    if(
        board &&
        typeof board.setEnemyCards ===
            "function"
    ){

        board.setEnemyCards(

            enemyField.map(
                summon =>
                    summon.view
            )

        );

    }


    //----------------------------------
    // PLAYER向き
    //----------------------------------

    playerField.forEach(
        summon => {

            if(
                summon?.view &&
                typeof summon.view.setHorizontal ===
                    "function"
            ){

                summon.view.setHorizontal(
                    !!summon.isRest
                );

            }

        }
    );


    //----------------------------------
    // CPU向き
    //----------------------------------

    enemyField.forEach(
        summon => {

            if(
                summon?.view &&
                typeof summon.view.setHorizontal ===
                    "function"
            ){

                summon.view.setHorizontal(
                    !!summon.isRest
                );

            }

        }
    );


    //----------------------------------
    // PLAYERコスト
    //----------------------------------

    if(
        typeof updateCostZoneView ===
        "function"
    ){

        updateCostZoneView();

    }


    //----------------------------------
    // CPU
    //----------------------------------

    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    if(
        typeof updateEnemyHandDisplay ===
        "function"
    ){

        updateEnemyHandDisplay();

    }


    //----------------------------------
    // クール
    //----------------------------------

    if(
        board &&
        typeof board.updateCoolCount ===
            "function"
    ){

        board.updateCoolCount();

    }


    //----------------------------------
    // LIFE
    //----------------------------------

    if(
        typeof updateLifeDisplay ===
        "function"
    ){

        updateLifeDisplay();

    }
    else{

        const playerLife =

            document.getElementById(
                "player-life-value"
            );


        const enemyLife =

            document.getElementById(
                "enemy-life-value"
            );


        if(playerLife){

            playerLife.textContent =
                game.playerLife;

        }


        if(enemyLife){

            enemyLife.textContent =
                game.enemyLife;

        }

    }


    //----------------------------------
    // ボタン
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

}


/* =========================================================
Turn Introduction
========================================================= */

function showTutorialStep4TurnIntroduction(){

    step4State.phase =
        "turnIntroduction";


    setTutorialGuide(

        "ターン",

        "このゲームでは、自分と相手が" +
        "交互にターンを行います。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4FirstTurn

    );

}


/* =========================================================
PLAYER TURN 1
========================================================= */

function startTutorialStep4FirstTurn(){

    step4State.phase =
        "summonUnicorn";


    step4State.playerTurnNumber =
        1;


    hideTutorialNextButton();


    game.currentPlayer =
        PLAYER;


    game.state =
        TURN_STATE.PLAYING;


    if(
        typeof summonUsedThisTurn !==
        "undefined"
    ){

        summonUsedThisTurn =
            false;

    }


    setTutorialStep4EndTurnEnabled(
        false
    );


    setTutorialGuide(

        "あなたのターン",

        "まずは手札の『ユニコーン』を" +
        "プレイしてください。"

    );


    highlightTutorialStep4HandCard(
        "ユニコーン"
    );

}


/* =========================================================
Unicorn Summoned
========================================================= */

function tutorialStep4UnicornSummoned(
    summon
){

    if(
        step4State.unicornSummoned
    ){

        return;

    }


    if(
        !summon ||
        summon.card?.name !==
            "ユニコーン"
    ){

        console.warn(
            "STEP4：ユニコーン召喚確認失敗",
            summon
        );

        return;

    }


    step4State.unicornSummoned =
        true;


    step4State.unicorn =
        summon;


    //----------------------------------
    // 召喚ターンアタック能力
    //----------------------------------

    if(
        summon.card?.ability?.type ===
        "summonTurnAttack"
    ){

        summon.attackReady =
            true;

    }


    step4State.phase =
        "burningEnergyIntroduction";


    step4State.allowedCostCardNames =
        [];


    clearTutorialStep4HandHighlights();


    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    if(
        typeof selectedHandCard !==
            "undefined" &&
        selectedHandCard
    ){

        selectedHandCard.setSelected(
            false
        );

        selectedHandCard =
            null;

    }


    if(
        typeof updateButtons ===
        "function"
    ){

        updateButtons();

    }


    setTutorialGuide(

        "マギア",

        "『ユニコーン』が場にでました。\n" +
        "次は『バーニングエナジー』をプレイします。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4BurningEnergy

    );

}


/* =========================================================
Burning Energy
========================================================= */

function startTutorialStep4BurningEnergy(){

    step4State.phase =
        "playBurningEnergy";


    hideTutorialNextButton();


    setTutorialGuide(

        "マギア",

        "『バーニングエナジー』を選び、" +
        "場の『ユニコーン』を対象にしてください。"

    );


    highlightTutorialStep4HandCard(
        "バーニングエナジー"
    );

}


/* =========================================================
Burning Energy Complete
========================================================= */

function tutorialStep4BurningEnergyUsed(){

    if(
        step4State.burningEnergyUsed
    ){

        return;

    }


    step4State.burningEnergyUsed =
        true;


    step4State.allowedCostCardNames =
        [];


    clearTutorialStep4HandHighlights();


    step4State.phase =
        "unicornAbilityExplanation";


    setTutorialGuide(

        "ユニコーン",

        "通常、場に出たばかりのサモンは" +
        "アタックできません。\n" +
        "しかし『ユニコーン』は能力によって、" +
        "場に出たターンでもアタックできます。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4UnicornAttack

    );

}


/* =========================================================
PLAYER Unicorn Attack
========================================================= */

function startTutorialStep4UnicornAttack(){

    step4State.phase =
        "unicornAttack";


    hideTutorialNextButton();


    setTutorialGuide(

        "アタック",

        "『ユニコーン』で相手プレイヤーへ" +
        "アタックしてください。"

    );


    if(
        step4State.unicorn?.view &&
        typeof step4State.unicorn.view.setHighlight ===
            "function"
    ){

        step4State.unicorn.view.setHighlight(
            true
        );

    }

}


/* =========================================================
PLAYER Unicorn Attack Complete
========================================================= */

function tutorialStep4UnicornAttackCompleted(){

    if(
        step4State.unicornAttacked
    ){

        return;

    }


    step4State.unicornAttacked =
        true;


    step4State.phase =
        "rapidMoveExplanation";


    setTutorialGuide(

        "レジスト",

        "相手は『ユニコーン』のアタックに対して" +
        "『ラピッドムーヴ』をプレイしました。"

    );


    showTutorialNextButton(

        "次へ",

        showTutorialStep4MultipleMagiaExplanation

    );

}


/* =========================================================
Multiple Magia Explanation
========================================================= */

function showTutorialStep4MultipleMagiaExplanation(){

    step4State.phase =
        "multipleMagiaExplanation";


    setTutorialGuide(

        "マギア",

        "サモンは1ターンに1体までですが、\n" +
        "マギアはコストを支払える限り、" +
        "1ターンに何枚でもプレイできます。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4Fireball

    );

}


/* =========================================================
Fireball
========================================================= */

function startTutorialStep4Fireball(){

    step4State.phase =
        "playFireball";


    hideTutorialNextButton();


    setTutorialGuide(

        "マギア",

        "次は『ファイアボール』を" +
        "相手プレイヤーを対象にプレイしてください。"

    );


    highlightTutorialStep4HandCard(
        "ファイアボール"
    );

}


/* =========================================================
Fireball Complete
========================================================= */

function tutorialStep4FireballUsed(){

    if(
        step4State.fireballUsed
    ){

        return;

    }


    step4State.fireballUsed =
        true;


    step4State.allowedCostCardNames =
        [];


    clearTutorialStep4HandHighlights();


    step4State.phase =
        "firstTurnEnd";


    setTutorialGuide(

        "ターン終了",

        "行動を終えたら「ターン終了」ボタンを押します。"

    );


    setTutorialStep4EndTurnEnabled(
        true
    );


    highlightTutorialStep4EndTurn();

}


/* =========================================================
PLAYER TURN 1 END
========================================================= */

function tutorialStep4FirstTurnEnded(){

    if(
        step4State.firstTurnEnded
    ){

        return;

    }


    step4State.firstTurnEnded =
        true;


    step4State.phase =
        "cpuTurnIntroduction";


    setTutorialStep4EndTurnEnabled(
        false
    );


    clearTutorialStep4EndTurnHighlight();


    //----------------------------------
    // PLAYERターン状態終了
    //----------------------------------

    if(
        typeof resetMagiaState ===
        "function"
    ){

        resetMagiaState();

    }


    if(
        typeof resetAttackState ===
        "function"
    ){

        resetAttackState();

    }


    if(
        typeof resetTemporaryPower ===
        "function"
    ){

        resetTemporaryPower(
            PLAYER
        );

        resetTemporaryPower(
            ENEMY
        );

    }


    game.state =
        TURN_STATE.END;


    if(
        typeof onTurnEnd ===
        "function"
    ){

        onTurnEnd();

    }


    setTutorialGuide(

        "相手のターン",

        "あなたのターンが終了しました。\n" +
        "次は相手のターンです。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4CpuTurn

    );

}


/* =========================================================
CPU TURN START
========================================================= */

function startTutorialStep4CpuTurn(){

    step4State.phase =
        "cpuTurnStart";


    step4State.cpuTurnStarted =
        true;


    hideTutorialNextButton();


    game.currentPlayer =
        ENEMY;


    game.turn =
        2;


    game.state =
        TURN_STATE.START;


    const beginCpuTurn = () => {


        //==================================================
        // CPUサモンReady
        //==================================================

        if(
            typeof readySummons ===
            "function"
        ){

            readySummons(
                ENEMY
            );

        }


        //==================================================
        // CPUコスト回収
        //==================================================

        if(
            typeof recoverEnemyCostCards ===
            "function"
        ){

            recoverEnemyCostCards();

        }


        //==================================================
        // CPUクール回収
        //
        // PLAYERターン1で使用した
        // ラピッドムーヴを手札へ戻す
        //==================================================

        if(
            typeof recoverEnemyCoolCard ===
            "function"
        ){

            recoverEnemyCoolCard();

        }


        //==================================================
        // ターン開始
        //==================================================

        if(
            typeof onTurnStart ===
            "function"
        ){

            onTurnStart(
                ENEMY
            );

        }


        game.state =
            TURN_STATE.PLAYING;


        updateTutorialStep4AllDisplays();


        //----------------------------------
        // 説明
        //----------------------------------

        step4State.phase =
            "cpuSummonUnicorn";


        setTutorialGuide(

            "相手のターン",

            "相手が『ユニコーン』を召喚します。"

        );


        setTimeout(

            tutorialStep4CpuSummonUnicorn,

            700

        );

    };


    //----------------------------------
    // ターン表示
    //----------------------------------

    if(
        typeof showTurnMessage ===
        "function"
    ){

        showTurnMessage(

            ENEMY,

            beginCpuTurn

        );

    }
    else{

        beginCpuTurn();

    }

}


/* =========================================================
CPU Summon Unicorn
========================================================= */

function tutorialStep4CpuSummonUnicorn(){

    const card =

        enemyHandCards.find(
            card =>
                card.name ===
                "ユニコーン"
        );


    if(!card){

        console.error(
            "STEP4：CPUユニコーンが手札にありません"
        );

        return;

    }


    console.log(
        "★ STEP4：CPUユニコーン召喚開始"
    );


    let success =
        false;


    //==================================================
    // 通常CPU召喚処理を優先
    //==================================================

    if(
        typeof cpuSummon ===
        "function"
    ){

        if(
            typeof cpuSummonUsedThisTurn !==
            "undefined"
        ){

            cpuSummonUsedThisTurn =
                false;

        }


        success =

            !!cpuSummon(
                card
            );

    }


    //==================================================
    // 通常処理で召喚できなければ
    // STEP4専用処理
    //==================================================

    if(!success){

        success =

            tutorialStep4FallbackCpuSummon(
                card
            );

    }


    if(!success){

        console.error(
            "STEP4：CPUユニコーン召喚失敗"
        );

        return;

    }


    //----------------------------------
    // 場から取得
    //----------------------------------

    const cpuUnicorn =

        enemyField.find(
            summon =>
                summon.card?.name ===
                "ユニコーン"
        );


    if(!cpuUnicorn){

        console.error(
            "STEP4：CPUユニコーンSummon取得失敗"
        );

        return;

    }


    step4State.cpuUnicorn =
        cpuUnicorn;


    step4State.cpuUnicornSummoned =
        true;



//----------------------------------
// CPUユニコーンのクリック処理
//----------------------------------

if(
    cpuUnicorn.view &&
    typeof cpuUnicorn.view.onClick ===
        "function"
){

    cpuUnicorn.view.onClick(
        card => {

            if(
                typeof onCardClick ===
                    "function"
            ){

                onCardClick(
                    card
                );

            }

        }
    );

}


    //----------------------------------
    // ユニコーンは召喚ターンに
    // アタックできる
    //----------------------------------

    cpuUnicorn.attackReady =
        true;


    updateTutorialStep4AllDisplays();


    //----------------------------------
    // 能力説明
    //----------------------------------

    step4State.phase =
        "cpuUnicornAbilityExplanation";


    setTutorialGuide(

        "ユニコーン",

        "相手も『ユニコーン』を召喚しました。\n" +
        "『ユニコーン』は能力によって、" +
        "場に出たターンでもアタックできます。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4CpuUnicornAttack

    );

}


/* =========================================================
CPU Unicorn Attack
========================================================= */

function startTutorialStep4CpuUnicornAttack(){

    step4State.phase =
        "cpuUnicornAttack";


    hideTutorialNextButton();


    const unicorn =
        step4State.cpuUnicorn;


    if(!unicorn){

        console.error(
            "STEP4：CPUユニコーンがありません"
        );

        return;

    }


    //----------------------------------
    // PLAYERへアタック
    //----------------------------------

    setTutorialGuide(

        "レジスト",

        "相手の『ユニコーン』のアタックに対して、" +
        "手札の『ストーンガード』をプレイしてください。"

    );


    setTimeout(
        () => {

            executeAttack(

                unicorn,

                PLAYER

            );

        },

        600

    );

}

/* =========================================================
CPU Unicorn Attack → Stone Guard
========================================================= */

function startTutorialStep4StoneGuard(){

    step4State.phase =
        "playStoneGuard";


    //----------------------------------
    // ストーンガード確認
    //----------------------------------

    const stoneGuard =

        board.handCards.find(
            card =>
                card.name ===
                "ストーンガード"
        );


    if(!stoneGuard){

        console.error(
            "STEP4：ストーンガードが手札にありません"
        );

        return;

    }


    step4State.stoneGuard =
        stoneGuard;


    //----------------------------------
    // PLAYERレジストモード
    //----------------------------------

    if(
        typeof resistMode !==
        "undefined"
    ){

        resistMode =
            true;

    }


    if(
        typeof selectableResistCards !==
        "undefined"
    ){

        selectableResistCards = [
            stoneGuard
        ];

    }


    //----------------------------------
    // 発光
    //----------------------------------

    clearTutorialStep4HandHighlights();


    if(
        typeof stoneGuard.setHighlight ===
        "function"
    ){

        stoneGuard.setHighlight(
            true
        );

    }


    //----------------------------------
    // 案内
    //----------------------------------

    setTutorialGuide(

        "レジスト",

        "相手の『ユニコーン』のアタックに対して、" +
        "手札の『ストーンガード』をプレイしてください。"

    );


    if(
        typeof showActionGuide ===
        "function"
    ){

        showActionGuide(
            "レジストをプレイしますか？"
        );

    }


    if(
        typeof updateButtons ===
        "function"
    ){

        updateButtons();

    }

}


/* =========================================================
PLAYER Stone Guard Complete
========================================================= */

function tutorialStep4StoneGuardUsed(){

    if(
        step4State.playerStoneGuardUsed
    ){

        return;

    }


    step4State.playerStoneGuardUsed =
        true;


    step4State.allowedCostCardNames =
        [];


    clearTutorialStep4HandHighlights();


    //----------------------------------
    // CPUアタック終了状態
    //----------------------------------

    step4State.cpuUnicornAttacked =
        true;


    step4State.phase =
        "cpuTurnEnd";


    game.currentPlayer =
        ENEMY;


    game.state =
        TURN_STATE.END;


    //----------------------------------
    // CPUターン終了処理
    //----------------------------------

    if(
        typeof resetTemporaryPower ===
        "function"
    ){

        resetTemporaryPower(
            ENEMY
        );

    }


    if(
        typeof onTurnEnd ===
        "function"
    ){

        onTurnEnd();

    }


    setTutorialGuide(

        "相手のターン",

        "『ストーンガー』で" +
        "『ユニコーン』のアタックによるダメージを防ぎました。\n" +
        "相手のターンはこれで終了です。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4SecondPlayerTurn

    );

}


/* =========================================================
PLAYER TURN 2
========================================================= */

function startTutorialStep4SecondPlayerTurn(){

    if(
        step4State.secondPlayerTurnStarted
    ){

        return;

    }


    step4State.secondPlayerTurnStarted =
        true;


    step4State.playerTurnNumber =
        2;


    step4State.phase =
        "readyExplanation";


    hideTutorialNextButton();


    //----------------------------------
    // PLAYERターン
    //----------------------------------

    game.currentPlayer =
        PLAYER;


    game.turn =
        3;


    game.state =
        TURN_STATE.START;


    //----------------------------------
    // サモン使用回数リセット
    //----------------------------------

    if(
        typeof summonUsedThisTurn !==
        "undefined"
    ){

        summonUsedThisTurn =
            false;

    }


    const beginPlayerTurn = () => {


        //----------------------------------
        // 一時パワー解除
        //----------------------------------

        if(
            typeof resetTemporaryPower ===
            "function"
        ){

            resetTemporaryPower(
                PLAYER
            );

        }


        //----------------------------------
        // サモンReady
        //----------------------------------

        if(
            typeof readySummons ===
            "function"
        ){

            readySummons(
                PLAYER
            );

        }
        else{

            playerField.forEach(
                summon => {

                    summon.isRest =
                        false;

                    summon.attackReady =
                        true;


                    if(
                        summon.view &&
                        typeof summon.view.setHorizontal ===
                            "function"
                    ){

                        summon.view.setHorizontal(
                            false
                        );

                    }

                }
            );

        }


        step4State.readyExplanationDone =
            true;


        updateTutorialStep4AllDisplays();


        //----------------------------------
        // Ready説明
        //----------------------------------

        setTutorialGuide(

            "ターン開始",

            "自分のターン開始時、" +
            "ヨコ向きの自分のサモンは" +
            "タテ向きに戻ります。"

        );


        showTutorialNextButton(

            "次へ",

            showTutorialStep4CostRecovery

        );

    };


    //----------------------------------
    // ターン表示
    //----------------------------------

    if(
        typeof showTurnMessage ===
        "function"
    ){

        showTurnMessage(

            PLAYER,

            beginPlayerTurn

        );

    }
    else{

        beginPlayerTurn();

    }

}


/* =========================================================
Cost Recovery Explanation
========================================================= */

function showTutorialStep4CostRecovery(){

    step4State.phase =
        "costRecovery";


    setTutorialGuide(

        "コスト回収",

        "ターン開始時、" +
        "コストゾーンにあるカードを" +
        "すべて手札に戻します。"

    );


    showTutorialNextButton(

        "回収する",

        executeTutorialStep4CostRecovery

    );

}


/* =========================================================
Execute Cost Recovery
========================================================= */

function executeTutorialStep4CostRecovery(){

    hideTutorialNextButton();


    //----------------------------------
    // 通常のコスト回収
    //----------------------------------

    if(
        typeof recoverCostCards ===
        "function"
    ){

        recoverCostCards();

    }

    else if(
        typeof recoverCost ===
        "function"
    ){

        recoverCost(
            PLAYER
        );

    }

    else{

        console.warn(
            "STEP4：PLAYERコスト回収関数が見つかりません"
        );

    }


    //----------------------------------
    // 表示
    //----------------------------------

    if(
        typeof updateCostZoneView ===
        "function"
    ){

        updateCostZoneView();

    }


    step4State.costRecoveryDone =
        true;


    updateTutorialStep4AllDisplays();


    //----------------------------------
    // クール説明へ
    //----------------------------------

    step4State.phase =
        "coolRecoveryExplanation";


    setTutorialGuide(

        "クール回収",

        "続いてクールゾーンを確認します。\n" +
        "クールゾーンにカードがある場合、" +
        "ターン開始時に1枚を選んで手札に戻します。"

    );


    showTutorialNextButton(

        "次へ",

        startTutorialStep4CoolRecovery

    );

}


/* =========================================================
Cool Recovery
========================================================= */

function startTutorialStep4CoolRecovery(){

    step4State.phase =
        "coolRecoverySelection";


    hideTutorialNextButton();


    //----------------------------------
    // クールが空
    //----------------------------------

    if(
        !board.playerCoolCards ||
        board.playerCoolCards.length ===
            0
    ){

        console.log(
            "★ STEP4：クール回収対象なし"
        );


        tutorialStep4CoolRecoveryCompleted();

        return;

    }


    //----------------------------------
    // 説明
    //----------------------------------

    setTutorialGuide(

        "クール回収",

        "クールゾーンから手札に戻すカードを1枚選び、" +
        "「決定」を押してください。"

    );


    //----------------------------------
    // 通常回収処理
    //----------------------------------

    if(
        typeof startCoolRecovery ===
        "function"
    ){

        startCoolRecovery();

    }
    else{

        console.warn(
            "STEP4：startCoolRecovery() が見つかりません"
        );


        tutorialStep4CoolRecoveryCompleted();

    }

}


/* =========================================================
Cool Recovery Complete
========================================================= */

function tutorialStep4CoolRecoveryCompleted(){

    if(
        step4State.coolRecoveryDone
    ){

        return;

    }


    step4State.coolRecoveryDone =
        true;


    step4State.phase =
        "freePlayExplanation";


    //----------------------------------
    // PLAYERターン本処理開始
    //----------------------------------

    game.currentPlayer =
        PLAYER;


    game.state =
        TURN_STATE.PLAYING;


    if(
        typeof onTurnStart ===
        "function"
    ){

        onTurnStart(
            PLAYER
        );

    }


    //----------------------------------
    // 説明
    //----------------------------------

    setTutorialGuide(

        "ターン中の行動",

        "ターン開始時の処理が終わると、" +
        "自由に行動できます。"

    );


    showTutorialNextButton(

        "次へ",

        showTutorialStep4FreePlayExplanation

    );

}


/* =========================================================
Free Play Explanation
========================================================= */

function showTutorialStep4FreePlayExplanation(){

    step4State.phase =
        "freePlayExplanation2";


    setTutorialGuide(

        "ターン中の行動",

        "サモンのプレイ、マギアのプレイ、" +
        "アタックを行う順番は自由です。\n" +
        "ここからは自由に行動してみましょう。"

    );


    showTutorialNextButton(

        "自由に行動する",

        startTutorialStep4FreePlay

    );

}


/* =========================================================
Free Play
========================================================= */

function startTutorialStep4FreePlay(){

    step4State.phase =
        "freePlay";


    step4State.freePlay =
        true;


    hideTutorialNextButton();


    game.currentPlayer =
        PLAYER;


    game.state =
        TURN_STATE.PLAYING;


    //----------------------------------
    // ターン終了可能
    //----------------------------------

    setTutorialStep4EndTurnEnabled(
        true
    );


    highlightTutorialStep4EndTurn();


    //----------------------------------
    // 説明
    //----------------------------------

    setTutorialGuide(

        "自由行動",

        "好きな順番で行動してください。\n終わったら「ターン終了」を押してください。"

    );


    //----------------------------------
    // 通常操作更新
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

}


/* =========================================================
STEP4 Complete
========================================================= */

function completeTutorialStep4(){

    if(
        step4State.phase ===
        "complete"
    ){

        return;

    }


    step4State.phase =
        "complete";


    step4State.active =
        false;


    step4State.freePlay =
        false;


    //----------------------------------
    // 操作終了
    //----------------------------------

    setTutorialStep4EndTurnEnabled(
        false
    );


    clearTutorialStep4EndTurnHighlight();


    clearTutorialStep4HandHighlights();


    if(
        typeof hideActionGuide ===
        "function"
    ){

        hideActionGuide();

    }


    game.state =
        TURN_STATE.END;


    //----------------------------------
    // 完了
    //----------------------------------

    setTutorialGuide(

        "STEP 4 完了",

        "ターンの進行について学びました。\nSTEP4は完了です。"

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
Fixed PLAYER Cost Setup
========================================================= */


/* =========================================================
Unicorn Cost

固定：
・ウィルオウィスプ
・クラーケン
========================================================= */

function prepareTutorialStep4UnicornCost(){

    step4State.allowedCostCardNames = [

        "ウィルオウィスプ",

        "クラーケン"

    ];


    setupTutorialStep4FixedCostHighlights(

        step4State.allowedCostCardNames

    );

}


/* =========================================================
Burning Energy Cost

固定：
・ロックスパイク
========================================================= */

function prepareTutorialStep4BurningEnergyCost(){

    step4State.allowedCostCardNames = [

        "ロックスパイク"

    ];


    setupTutorialStep4FixedCostHighlights(

        step4State.allowedCostCardNames

    );

}


/* =========================================================
Fireball Cost

固定：
・パイロフレイム
・グラウンドウォール
========================================================= */

function prepareTutorialStep4FireballCost(){

    step4State.allowedCostCardNames = [

        "パイロフレイム",

        "グラウンドウォール"

    ];


    setupTutorialStep4FixedCostHighlights(

        step4State.allowedCostCardNames

    );

}


/* =========================================================
Stone Guard Cost

CPUユニコーンへのレジスト時。

この段階では指定可能な残りカードから
必要枚数だけ選ぶ。
========================================================= */

function prepareTutorialStep4StoneGuardCost(
    card
){

    let requiredCost =
        card?.cost ?? 0;


    if(
        typeof getCurrentCardCost ===
        "function"
    ){

        requiredCost =

            getCurrentCardCost(

                card,

                PLAYER

            );

    }


    //----------------------------------
    // ストーンガード自身以外
    //----------------------------------

    const candidates =

        board.handCards.filter(
            handCard => {

                if(!handCard){

                    return false;

                }


                if(
                    handCard ===
                    card
                ){

                    return false;

                }


                if(
                    handCard.area !==
                    "hand"
                ){

                    return false;

                }


                return true;

            }
        );


    step4State.allowedCostCardNames =

        candidates

            .slice(
                0,
                requiredCost
            )

            .map(
                handCard =>
                    handCard.name
            );


    setupTutorialStep4FixedCostHighlights(

        step4State.allowedCostCardNames

    );

}


/* =========================================================
Fixed Cost Highlights
========================================================= */

function setupTutorialStep4FixedCostHighlights(
    cardNames
){

    clearTutorialStep4HandHighlights();


    if(
        !Array.isArray(
            cardNames
        )
    ){

        return;

    }


    //----------------------------------
    // 発光
    //----------------------------------

    board.handCards.forEach(
        card => {

            if(
                cardNames.includes(
                    card.name
                )
            ){

                if(
                    typeof card.setHighlight ===
                    "function"
                ){

                    card.setHighlight(
                        true
                    );

                }

            }

        }
    );


    //----------------------------------
    // 案内文章
    //----------------------------------

    const namesText =

        cardNames

            .map(
                name =>
                    `『${name}』`
            )

            .join(
                "と"
            );


    setTutorialGuide(

        "コスト",

        namesText+"をコストとして選んでください。"

    );


    console.log(

        "★ STEP4 固定コスト",

        cardNames

    );

}


/* =========================================================
CPU Cost Selection
========================================================= */

function tutorialStep4ChooseCpuCostCards(

    usingCard,

    requiredCost

){

    requiredCost =

        Math.max(

            0,

            Number(
                requiredCost
            ) || 0

        );


    if(
        requiredCost === 0
    ){

        return [];

    }


    if(
        !Array.isArray(
            enemyHandCards
        )
    ){

        return [];

    }


    //----------------------------------
    // 今後CPUが使うカードを保護
    //----------------------------------

    const protectedNames =
        [];


    //----------------------------------
    // CPUユニコーン
    //----------------------------------

    if(
        !step4State.cpuUnicornSummoned &&
        usingCard?.name !==
            "ユニコーン"
    ){

        protectedNames.push(
            "ユニコーン"
        );

    }


    //----------------------------------
    // ラピッドムーヴ
    //----------------------------------

    if(
        usingCard?.name !==
            "ラピッドムーヴ"
    ){

        protectedNames.push(
            "ラピッドムーヴ"
        );

    }


    //----------------------------------
    // ストーンガード
    //----------------------------------

    if(
        usingCard?.name !==
            "ストーンガード"
    ){

        protectedNames.push(
            "ストーンガード"
        );

    }


    //----------------------------------
    // 候補
    //----------------------------------

    const candidates =

        enemyHandCards.filter(
            card => {

                if(!card){

                    return false;

                }


                if(
                    card ===
                    usingCard
                ){

                    return false;

                }


                if(
                    protectedNames.includes(
                        card.name
                    )
                ){

                    return false;

                }


                return true;

            }
        );


    return candidates.slice(
        0,
        requiredCost
    );

}


/* =========================================================
Fallback CPU Summon
========================================================= */

function tutorialStep4FallbackCpuSummon(
    card
){

    if(!card){

        return false;

    }


    let requiredCost =
        card.cost ?? 0;


    if(
        typeof getCurrentEnemyCardCost ===
        "function"
    ){

        requiredCost =

            getCurrentEnemyCardCost(
                card
            );

    }


    //----------------------------------
    // CPUコスト選択
    //----------------------------------

    const costCards =

        tutorialStep4ChooseCpuCostCards(

            card,

            requiredCost

        );


    if(
        costCards.length <
        requiredCost
    ){

        console.error(

            "STEP4：CPU召喚コスト不足",

            card.name,

            requiredCost

        );


        return false;

    }


    //----------------------------------
    // コストへ移動
    //----------------------------------

    costCards.forEach(
        costCard => {

            if(
                typeof moveEnemyToCost ===
                "function"
            ){

                moveEnemyToCost(
                    costCard
                );

            }
            else{

                enemyHandCards =

                    enemyHandCards.filter(
                        c =>
                            c !==
                            costCard
                    );


                costCard.area =
                    "enemyCost";


                enemyCostCards.push(
                    costCard
                );

            }

        }
    );


    //----------------------------------
    // 使用カードを手札から除外
    //----------------------------------

    enemyHandCards =

        enemyHandCards.filter(
            handCard =>
                handCard !==
                card
        );


    //----------------------------------
    // Summon生成
    //----------------------------------

    card.owner =
        ENEMY;


    card.area =
        "enemyField";


    const summon =

        new Summon(

            card,

            ENEMY

        );


    summon.isRest =
        false;


    summon.attackReady =
        false;


    enemyField.push(
        summon
    );


    //----------------------------------
    // サモン能力
    //----------------------------------

    if(
        typeof applySummonAbility ===
        "function"
    ){

        applySummonAbility(
            summon
        );

    }


    //----------------------------------
    // ユニコーン能力
    //----------------------------------

    if(
        card.name ===
        "ユニコーン"
    ){

        summon.attackReady =
            true;

    }


    //----------------------------------
    // 表示
    //----------------------------------

    if(
        board &&
        typeof board.addEnemyCard ===
            "function"
    ){

        board.addEnemyCard(
            summon.view
        );

    }
    else if(
        board &&
        typeof board.setEnemyCards ===
            "function"
    ){

        board.setEnemyCards(

            enemyField.map(
                enemySummon =>
                    enemySummon.view
            )

        );

    }


    if(
        typeof addBattleLog ===
        "function"
    ){

        addBattleLog(
            `CPU：${card.name}を召喚`
        );

    }


    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    return true;

}

/* =========================================================
Game Hooks
========================================================= */

function installTutorialStep4GameHooks(){

    if(
        step4State.gameHooksInstalled
    ){
        return;
    }


    step4State.gameHooksInstalled =
        true;


    console.log(
        "★ STEP4：通常ゲーム処理フック登録"
    );


    //==================================================
    // startSummon
    //==================================================

    if(
        typeof startSummon ===
        "function"
    ){

        const normalStartSummon =
            startSummon;


        startSummon =
            function(card){

                //----------------------------------
                // STEP4外
                //----------------------------------

                if(
                    !step4State.active
                ){

                    return normalStartSummon(
                        card
                    );

                }


                //----------------------------------
                // 自由行動
                //----------------------------------

                if(
                    step4State.freePlay
                ){

                    return normalStartSummon(
                        card
                    );

                }


                //----------------------------------
                // PLAYER最初のユニコーン
                //----------------------------------

                if(
                    step4State.phase ===
                    "summonUnicorn"
                ){

                    if(
                        !card ||
                        card.name !==
                        "ユニコーン"
                    ){

                        setTutorialGuide(

                            "あなたのターン",

                            "今回は『ユニコーン』を召喚してください。"

                        );


                        return;

                    }


                    const result =

                        normalStartSummon(
                            card
                        );


                    if(
                        typeof summonCard !==
                            "undefined" &&
                        summonCard ===
                            card
                    ){

                        step4State.phase =
                            "summonUnicornCost";


                        prepareTutorialStep4UnicornCost();

                    }


                    return result;

                }


                //----------------------------------
                // それ以外は禁止
                //----------------------------------

                return;

            };

    }


    //==================================================
    // startMagia
    //==================================================

    if(
        typeof startMagia ===
        "function"
    ){

        const normalStartMagia =
            startMagia;


        startMagia =
            function(card){

                //----------------------------------
                // STEP4外
                //----------------------------------

                if(
                    !step4State.active
                ){

                    return normalStartMagia(
                        card
                    );

                }


                //----------------------------------
                // 自由行動
                //----------------------------------

                if(
                    step4State.freePlay
                ){

                    return normalStartMagia(
                        card
                    );

                }


                //==================================
                // Burning Energy
                //==================================

                if(
                    step4State.phase ===
                    "playBurningEnergy"
                ){

                    if(
                        !card ||
                        card.name !==
                        "バーニングエナジー"
                    ){

                        setTutorialGuide(

                            "マギア",

                            "今回は『バーニングエナジー』をプレイしてください。"

                        );


                        return;

                    }


                    const result =

                        normalStartMagia(
                            card
                        );


                    step4State.phase =
                        "burningEnergyTarget";


                    setTutorialGuide(

                        "マギア",

                        "青く発光している『ユニコーン』を対象にしてください。"

                    );


                    return result;

                }


                //==================================
                // Fireball
                //==================================

                if(
                    step4State.phase ===
                    "playFireball"
                ){

                    if(
                        !card ||
                        card.name !==
                        "ファイアボール"
                    ){

                        setTutorialGuide(

                            "マギア",

                            "今回は『ファイアボール』をプレイしてください。"

                        );


                        return;

                    }


                    const result =

                        normalStartMagia(
                            card
                        );


                    step4State.phase =
                        "fireballTarget";


                    setTutorialGuide(

                        "マギア",

                        "相手プレイヤーを対象にしてください。"

                    );


                    return result;

                }


                //----------------------------------
                // その他は禁止
                //----------------------------------

                return;

            };

    }


    //==================================================
    // startMagiaCost
    //==================================================

    if(
        typeof startMagiaCost ===
        "function"
    ){

        const normalStartMagiaCost =
            startMagiaCost;


        startMagiaCost =
            function(){

                //==================================
                // Burning Energy
                //==================================

                if(
                    step4State.active &&
                    step4State.phase ===
                        "burningEnergyTarget" &&
                    magiaCard?.name ===
                        "バーニングエナジー"
                ){

                    //----------------------------------
                    // ユニコーン限定
                    //----------------------------------

                    if(
                        !magiaTarget ||
                        !(magiaTarget instanceof Summon) ||
                        magiaTarget.card?.name !==
                            "ユニコーン" ||
                        magiaTarget.owner !==
                            PLAYER
                    ){

                        magiaTarget =
                            null;


                        magiaTargetMode =
                            true;


                        if(
                            typeof clearMagiaHighlight ===
                            "function"
                        ){

                            clearMagiaHighlight();

                        }


                        if(
                            typeof highlightMagiaTargets ===
                            "function"
                        ){

                            highlightMagiaTargets();

                        }


                        setTutorialGuide(

                            "マギア",

                            "自分の『ユニコーン』を対象にしてください。"

                        );


                        return;

                    }


                    const result =

                        normalStartMagiaCost();


                    step4State.phase =
                        "burningEnergyCost";


                    prepareTutorialStep4BurningEnergyCost();


                    return result;

                }


                //==================================
                // Fireball
                //==================================

                if(
                    step4State.active &&
                    step4State.phase ===
                        "fireballTarget" &&
                    magiaCard?.name ===
                        "ファイアボール"
                ){

                    //----------------------------------
                    // ENEMY PLAYER限定
                    //----------------------------------

                    if(
                        !(
                            magiaTarget === ENEMY ||
                            magiaTarget === "enemy"
                        )
                    ){

                        magiaTarget =
                            null;


                        magiaTargetMode =
                            true;


                        if(
                            typeof clearMagiaHighlight ===
                            "function"
                        ){

                            clearMagiaHighlight();

                        }


                        if(
                            typeof highlightMagiaTargets ===
                            "function"
                        ){

                            highlightMagiaTargets();

                        }


                        setTutorialGuide(

                            "マギア",

                            "相手プレイヤーを対象にしてください。"

                        );


                        return;

                    }


                    const result =

                        normalStartMagiaCost();


                    step4State.phase =
                        "fireballCost";


                    prepareTutorialStep4FireballCost();


                    return result;

                }


                //----------------------------------
                // 通常
                //----------------------------------

                return normalStartMagiaCost();

            };

    }


    //==================================================
    // selectCostCard
    //==================================================

    if(
        typeof selectCostCard ===
        "function"
    ){

        const normalSelectCostCard =
            selectCostCard;


        selectCostCard =
            function(card){

                //----------------------------------
                // 誘導中か
                //----------------------------------

                const guided =

                    step4State.active &&

                    [

                        "summonUnicornCost",
                        "burningEnergyCost",
                        "fireballCost"

                    ].includes(
                        step4State.phase
                    );


                //----------------------------------
                // 指定外禁止
                //----------------------------------

                if(
                    guided &&
                    !step4State.allowedCostCardNames.includes(
                        card.name
                    )
                ){

                    setTutorialGuide(

                        "コスト",

                        "今回は発光しているカードをコストとして選んでください。"

                    );


                    return;

                }


                return normalSelectCostCard(
                    card
                );

            };

    }


    //==================================================
    // payCost
    //==================================================

    if(
        typeof payCost ===
        "function"
    ){

        const normalPayCost =
            payCost;


        payCost =
            function(){

                //----------------------------------
                // 使用カード保存
                //----------------------------------

                const usingCard =

                    typeof summonCard !==
                        "undefined"

                        ?

                        summonCard

                        :

                        null;


                //----------------------------------
                // 各段階判定
                //----------------------------------

                const wasUnicorn =

                    step4State.active &&

                    step4State.phase ===
                        "summonUnicornCost" &&

                    usingCard?.name ===
                        "ユニコーン";


                const wasBurning =

                    step4State.active &&

                    step4State.phase ===
                        "burningEnergyCost" &&

                    usingCard?.name ===
                        "バーニングエナジー";


                const wasFireball =

                    step4State.active &&

                    step4State.phase ===
                        "fireballCost" &&

                    usingCard?.name ===
                        "ファイアボール";


                //----------------------------------
                // 通常処理
                //----------------------------------

                const result =
                    normalPayCost();


                //----------------------------------
                // 誘導解除
                //----------------------------------

                if(
                    wasUnicorn ||
                    wasBurning ||
                    wasFireball
                ){

                    step4State.allowedCostCardNames =
                        [];


                    clearTutorialStep4HandHighlights();

                }


                //==================================
                // Unicorn
                //==================================

                if(wasUnicorn){

                    const unicorn =

                        playerField.find(
                            summon =>
                                summon.card ===
                                usingCard
                        )

                        ||

                        playerField.find(
                            summon =>
                                summon.card?.name ===
                                "ユニコーン"
                        );


                    if(unicorn){

                        setTimeout(

                            () => {

                                tutorialStep4UnicornSummoned(
                                    unicorn
                                );

                            },

                            100

                        );

                    }

                }


                //==================================
                // Burning Energy
                //==================================

                if(wasBurning){

                    setTimeout(

                        tutorialStep4BurningEnergyUsed,

                        300

                    );

                }


                //==================================
                // Fireball
                //==================================

                if(wasFireball){

                    setTimeout(

                        tutorialStep4FireballUsed,

                        400

                    );

                }


                return result;

            };

    }


    //==================================================
    // executeAttack
    //==================================================

    if(
        typeof executeAttack ===
        "function"
    ){

        const normalExecuteAttack =
            executeAttack;


        executeAttack =
            function(
                attacker,
                target
            ){

                //==================================
                // PLAYER TURN1
                // Unicorn → ENEMY限定
                //==================================

                if(
                    step4State.active &&
                    step4State.phase ===
                        "unicornAttack"
                ){

                    if(
                        attacker?.card?.name !==
                            "ユニコーン" ||
                        attacker.owner !==
                            PLAYER ||
                        !(
                            target === ENEMY ||
                            target === "enemy"
                        )
                    ){

                        setTutorialGuide(

                            "アタック",

                            "『ユニコーン』で相手プレイヤーへアタックしてください。"

                        );


                        return false;

                    }

                }


                //==================================
                // CPU Unicorn attack
                //==================================

                const cpuTutorialAttack =

                    step4State.active &&

                    step4State.phase ===
                        "cpuUnicornAttack" &&

                    attacker?.owner ===
                        ENEMY &&

                    attacker?.card?.name ===
                        "ユニコーン" &&

                    (
                        target === PLAYER ||
                        target === "player"
                    );


                //----------------------------------
                // 通常アタック
                //----------------------------------

                const result =

                    normalExecuteAttack(

                        attacker,

                        target

                    );


                //==================================
                // CPUユニコーンに対する
                // Stone Guard誘導
                //==================================

                if(cpuTutorialAttack){

                    setTimeout(

                        () => {

                            console.log(
                                "★ STEP4：CPUユニコーンアタック → ストーンガード誘導"
                            );


                            startTutorialStep4StoneGuard();

                        },

                        150

                    );

                }


                return result;

            };

    }


    //==================================================
    // finishAttack
    //==================================================

    if(
        typeof finishAttack ===
        "function"
    ){

        const normalFinishAttack =
            finishAttack;


        finishAttack =
            function(){

                //----------------------------------
                // PLAYER最初のユニコーン攻撃か
                //----------------------------------

                const firstUnicornAttack =

                    step4State.active &&

                    step4State.phase ===
                        "unicornAttack" &&

                    attackingSummon?.owner ===
                        PLAYER &&

                    attackingSummon?.card?.name ===
                        "ユニコーン";


                //----------------------------------
                // 通常処理
                //----------------------------------

                const result =
                    normalFinishAttack();


                //----------------------------------
                // 完了説明へ
                //----------------------------------

                if(firstUnicornAttack){

                    setTimeout(

                        () => {

                            tutorialStep4UnicornAttackCompleted();

                        },

                        200

                    );

                }


                return result;

            };

    }


//==================================================
// shouldCpuUseResist
//
// STEP4専用CPUレジスト制御
//==================================================

if(
    typeof shouldCpuUseResist ===
    "function"
){

    const normalShouldCpuUseResist =
        shouldCpuUseResist;


    shouldCpuUseResist =
        function(event){

            if(
                step4State.active
            ){

                //==================================
                // PLAYER TURN1
                // ファイアボール
                //
                // この場面ではCPUは
                // レジストを一切使用しない
                //==================================

                if(
                    !step4State.freePlay &&
                    event?.player === ENEMY &&
                    event?.source?.name ===
                        "ファイアボール"
                ){

                    console.log(
                        "★ STEP4：最初のファイアボールにはCPUレジストを使用しない"
                    );

                    return false;

                }


                //==================================
                // PLAYER TURN1
                // Unicorn attack
                // → Rapid Move
                //==================================

                if(
                    step4State.phase ===
                        "unicornAttack" &&

                    event?.player ===
                        ENEMY &&

                    event?.source?.name ===
                        "ユニコーン"
                ){

                    const rapidMove =

                        enemyHandCards.find(
                            card =>
                                card.name ===
                                "ラピッドムーヴ"
                        );


                    if(rapidMove){

                        console.log(
                            "★ STEP4：CPUラピッドムーヴ使用判定 true"
                        );

                        return true;

                    }

                }


                //==================================
                // 自由行動
                // Unicorn attack
                // → Rapid Move
                //==================================

                if(
                    step4State.freePlay &&

                    event?.player ===
                        ENEMY &&

                    event?.source?.name ===
                        "ユニコーン" &&

                    event?.source?.type ===
                        "サモン"
                ){

                    const rapidMove =

                        enemyHandCards.find(
                            card =>
                                card.name ===
                                "ラピッドムーヴ"
                        );


                    if(rapidMove){

                        console.log(
                            "★ STEP4 FREE：ユニコーン → ラピッドムーヴ"
                        );

                        return true;

                    }

                }


                //==================================
                // 自由行動
                // Pyroflame
                // → Stone Guard
                //==================================

                if(
                    step4State.freePlay &&

                    event?.player ===
                        ENEMY &&

                    event?.source?.name ===
                        "パイロフレイム"
                ){

                    const stoneGuard =

                        enemyHandCards.find(
                            card =>
                                card.name ===
                                "ストーンガード"
                        );


                    if(stoneGuard){

                        console.log(
                            "★ STEP4 FREE：パイロフレイム → ストーンガード"
                        );

                        return true;

                    }

                }

            }


            //----------------------------------
            // 上記以外は通常CPU判断
            //----------------------------------

            return normalShouldCpuUseResist(
                event
            );

        };

}


    //==================================================
    // selectBestCpuResist
    //==================================================

    if(
        typeof selectBestCpuResist ===
        "function"
    ){

        const normalSelectBestCpuResist =
            selectBestCpuResist;


        selectBestCpuResist =
            function(
                cards,
                damage,
                event
            ){

                if(
                    step4State.active
                ){

                    //==================================
                    // Unicorn → Rapid Move
                    //==================================

                    if(
                        event?.source?.name ===
                            "ユニコーン"
                    ){

                        const rapidMove =

                            cards?.find(
                                card =>
                                    card.name ===
                                    "ラピッドムーヴ"
                            );


                        if(rapidMove){

                            return rapidMove;

                        }

                    }


                    //==================================
                    // Pyroflame → Stone Guard
                    //==================================

                    if(
                        step4State.freePlay &&
                        event?.source?.name ===
                            "パイロフレイム"
                    ){

                        const stoneGuard =

                            cards?.find(
                                card =>
                                    card.name ===
                                    "ストーンガード"
                            );


                        if(stoneGuard){

                            return stoneGuard;

                        }

                    }

                }


                return normalSelectBestCpuResist(

                    cards,
                    damage,
                    event

                );

            };

    }


    //==================================================
    // useCpuResist
    //==================================================

    if(
        typeof useCpuResist ===
        "function"
    ){

        const normalUseCpuResist =
            useCpuResist;


        useCpuResist =
            function(card){

                const isRapidMove =
                    card?.name ===
                    "ラピッドムーヴ";


                const isStoneGuard =
                    card?.name ===
                    "ストーンガード";


                //----------------------------------
                // 通常処理
                //----------------------------------

                const result =

                    normalUseCpuResist(
                        card
                    );


                if(
                    step4State.active
                ){

                    //==================================
                    // PLAYER TURN1 Rapid Move
                    //==================================

                    if(
                        isRapidMove &&
                        !step4State.freePlay
                    ){

                        step4State.cpuRapidMoveUsedFirstTurn =
                            true;


                        console.log(
                            "★ STEP4：CPUラピッドムーヴ使用"
                        );

                    }


                    //==================================
                    // FREE Rapid Move
                    //==================================

                    if(
                        isRapidMove &&
                        step4State.freePlay
                    ){

                        step4State.freePlayRapidMoveUsed =
                            true;


                        console.log(
                            "★ STEP4 FREE：CPUラピッドムーヴ使用"
                        );

                    }


                    //==================================
                    // FREE Stone Guard
                    //==================================

                    if(
                        isStoneGuard &&
                        step4State.freePlay
                    ){

                        step4State.freePlayStoneGuardUsed =
                            true;


                        console.log(
                            "★ STEP4 FREE：CPUストーンガード使用"
                        );

                    }

                }


                return result;

            };

    }


    //==================================================
    // selectCpuCostCards
    //
    // CPU側の重要カードをコストにしない
    //==================================================

    if(
        typeof selectCpuCostCards ===
        "function"
    ){

        const normalSelectCpuCostCards =
            selectCpuCostCards;


        selectCpuCostCards =
            function(
                card,
                count
            ){

                if(
                    step4State.active
                ){

                    const selected =

                        tutorialStep4ChooseCpuCostCards(

                            card,
                            count

                        );


                    if(
                        selected.length >=
                        count
                    ){

                        return selected;

                    }

                }


                return normalSelectCpuCostCards(

                    card,
                    count

                );

            };

    }


    //==================================================
    // startResist
    //
    // CPUユニコーン攻撃時はStone Guard限定
    //==================================================

    if(
        typeof startResist ===
        "function"
    ){

        const normalStartResist =
            startResist;


        startResist =
            function(card){

                if(
                    step4State.active &&
                    step4State.phase ===
                        "playStoneGuard"
                ){

                    if(
                        !card ||
                        card.name !==
                        "ストーンガード"
                    ){

                        setTutorialGuide(

                            "レジスト",

                            "今回は『ストーンガード』をプレイしてください。"

                        );


                        return;

                    }


                    const result =

                        normalStartResist(
                            card
                        );


                    step4State.phase =
                        "stoneGuardCost";


                    prepareTutorialStep4StoneGuardCost(
                        card
                    );


                    return result;

                }


                return normalStartResist(
                    card
                );

            };

    }


    //==================================================
    // selectResistCostCard
    //==================================================

    if(
        typeof selectResistCostCard ===
        "function"
    ){

        const normalSelectResistCostCard =
            selectResistCostCard;


        selectResistCostCard =
            function(card){

                if(
                    step4State.active &&
                    step4State.phase ===
                        "stoneGuardCost"
                ){

                    if(
                        !step4State.allowedCostCardNames.includes(
                            card.name
                        )
                    ){

                        setTutorialGuide(

                            "コスト",

                            "発光しているカードをコストとして選んでください。"

                        );


                        return;

                    }

                }


                return normalSelectResistCostCard(
                    card
                );

            };

    }


    //==================================================
    // payResistCost
    //==================================================

    if(
        typeof payResistCost ===
        "function"
    ){

        const normalPayResistCost =
            payResistCost;


        payResistCost =
            function(){

                const wasStoneGuard =

                    step4State.active &&

                    step4State.phase ===
                        "stoneGuardCost" &&

                    resistUsingCard?.name ===
                        "ストーンガード";


                //----------------------------------
                // 通常処理
                //----------------------------------

                const result =
                    normalPayResistCost();


                //----------------------------------
                // STEP4進行
                //----------------------------------

                if(wasStoneGuard){

                    step4State.allowedCostCardNames =
                        [];


                    clearTutorialStep4HandHighlights();


                    setTimeout(

                        tutorialStep4StoneGuardUsed,

                        350

                    );

                }


                return result;

            };

    }


    //==================================================
    // confirmCoolRecovery
    //
    // 関数を直接呼んだ場合の検知
    //==================================================

    if(
        typeof confirmCoolRecovery ===
        "function"
    ){

        const normalConfirmCoolRecovery =
            confirmCoolRecovery;


        confirmCoolRecovery =
            function(){

                const tutorialRecovery =

                    step4State.active &&

                    step4State.phase ===
                        "coolRecoverySelection";


                const selectedBefore =

                    typeof selectedCoolCard !==
                        "undefined"

                        ?

                        selectedCoolCard

                        :

                        null;


                const result =
                    normalConfirmCoolRecovery();


                if(
                    tutorialRecovery &&
                    selectedBefore
                ){

                    setTimeout(

                        tutorialStep4CoolRecoveryCompleted,

                        150

                    );

                }


                return result;

            };

    }

}


/* =========================================================
STEP4 Card Click
========================================================= */

function tutorialStep4CardClick(
    card
){

    if(!card){

        return;

    }


    //----------------------------------
    // STEP4終了後
    //----------------------------------

    if(
        !step4State.active
    ){

        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    console.log(

        "★ STEP4 カードクリック",

        card.name,

        "area=",
        card.area,

        "phase=",
        step4State.phase

    );


    //==================================================
    // 自由行動
    //==================================================

    if(
        step4State.freePlay
    ){

        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //==================================================
    // サモン・マギア コスト
    //==================================================

    if(
        [

            "summonUnicornCost",
            "burningEnergyCost",
            "fireballCost"

        ].includes(
            step4State.phase
        )
    ){

        if(
            typeof summonCard !==
                "undefined" &&
            card ===
                summonCard
        ){

            return;

        }


        if(
            card.area !==
            "hand"
        ){

            return;

        }


        if(
            !step4State.allowedCostCardNames.includes(
                card.name
            )
        ){

            setTutorialGuide(

                "コスト",

                "今回は発光しているカードをコストとして選んでください。"

            );


            return;

        }


        if(
            typeof selectCostCard ===
            "function"
        ){

            selectCostCard(
                card
            );

        }


        return;

    }


    //==================================================
    // Stone Guard コスト
    //==================================================

    if(
        step4State.phase ===
        "stoneGuardCost"
    ){

        if(
            card ===
            resistUsingCard
        ){

            return;

        }


        if(
            card.area !==
            "hand"
        ){

            return;

        }


        if(
            !step4State.allowedCostCardNames.includes(
                card.name
            )
        ){

            setTutorialGuide(

                "コスト",

                "今回は発光しているカードをコストとして選んでください。"

            );


            return;

        }


        if(
            typeof selectResistCostCard ===
            "function"
        ){

            selectResistCostCard(
                card
            );

        }


        return;

    }


    //==================================================
    // Unicorn召喚
    //==================================================

    if(
        step4State.phase ===
        "summonUnicorn"
    ){

        if(
            card.area !==
            "hand"
        ){

            return;

        }


        if(
            card.name !==
            "ユニコーン"
        ){

            setTutorialGuide(

                "あなたのターン",

                "まずは『ユニコーン』を召喚してください。"

            );


            if(
                typeof showCardInfo ===
                "function"
            ){

                showCardInfo(
                    card
                );

            }


            return;

        }


        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //==================================================
    // Burning Energy
    //==================================================

    if(
        step4State.phase ===
        "playBurningEnergy"
    ){

        if(
            card.area !==
            "hand"
        ){

            return;

        }


        if(
            card.name !==
            "バーニングエナジー"
        ){

            setTutorialGuide(

                "マギア",

                "今回は『バーニングエナジー』をプレイしてください。"

            );


            return;

        }


        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //==================================================
    // Burning target
    //==================================================

    if(
        step4State.phase ===
        "burningEnergyTarget"
    ){

        if(
            card.area ===
            "hand"
        ){

            setTutorialGuide(

                "マギア",

                "自分の『ユニコーン』を対象にしてください。"

            );


            return;

        }


        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //==================================================
    // PLAYER Unicorn Attack
    //==================================================

    if(
        step4State.phase ===
        "unicornAttack"
    ){

        if(
            card.area ===
            "hand"
        ){

            return;

        }


        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //==================================================
    // Fireball
    //==================================================

    if(
        step4State.phase ===
        "playFireball"
    ){

        if(
            card.area !==
            "hand"
        ){

            return;

        }


        if(
            card.name !==
            "ファイアボール"
        ){

            setTutorialGuide(

                "マギア",

                "今回は『ファイアボール』をプレイしてください。"

            );


            return;

        }


        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //==================================================
    // Fireball Target
    //==================================================

    if(
        step4State.phase ===
        "fireballTarget"
    ){

        if(
            card.area ===
            "hand"
        ){

            setTutorialGuide(

                "マギア",

                "相手プレイヤーを対象にしてください。"

            );


            return;

        }


        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //==================================================
    // Stone Guard
    //==================================================

    if(
        step4State.phase ===
        "playStoneGuard"
    ){

        if(
            card.area !==
            "hand"
        ){

            return;

        }


        if(
            card.name !==
            "ストーンガード"
        ){

            setTutorialGuide(

                "レジスト",

                "今回は『ストーンガード』を使プレイしてください。"
            );


            return;

        }


        if(
            typeof onCardClick ===
            "function"
        ){

            onCardClick(
                card
            );

        }


        return;

    }


    //----------------------------------
    // その他説明中
    //----------------------------------

    if(
        card.area ===
        "hand" &&
        typeof showCardInfo ===
            "function"
    ){

        showCardInfo(
            card
        );

    }

}


/* =========================================================
Click Observer
========================================================= */

function installTutorialStep4ClickObserver(){

    if(
        step4State.clickObserverInstalled
    ){

        return;

    }


    step4State.clickObserverInstalled =
        true;


    document.addEventListener(

        "click",

        event => {

            if(
                !step4State.active
            ){

                return;

            }


            //==================================================
            // Cool Recovery 決定
            //
            // 通常confirmCoolRecovery()の後を検知
            //==================================================

            if(
                step4State.phase ===
                "coolRecoverySelection"
            ){

                const confirmButton =

                    event.target.closest
                        ?

                        event.target.closest(
                            "#confirm-button"
                        )

                        :

                        null;


                if(confirmButton){

                    console.log(
                        "★ STEP4：クール回収決定クリック検知"
                    );


                    //----------------------------------
                    // 通常クリックは止めない
                    //----------------------------------

                    setTimeout(

                        () => {

                            const recoveryEnded =

                                typeof coolRecoveryMode ===
                                    "undefined"

                                    ||

                                coolRecoveryMode ===
                                    false;


                            console.log(

                                "★ STEP4：クール回収後確認",

                                {
                                    recoveryEnded,
                                    selectedCoolCard:
                                        typeof selectedCoolCard !==
                                            "undefined"

                                            ?

                                            selectedCoolCard

                                            :

                                            "undefined"
                                }

                            );


                            if(recoveryEnded){

                                tutorialStep4CoolRecoveryCompleted();

                            }

                        },

                        100

                    );


                    return;

                }

            }


            //==================================================
            // End Turn
            //==================================================

            const endTurnButton =

                event.target.closest
                    ?

                    event.target.closest(
                        "#endturn-button"
                    )

                    :

                    null;


            if(endTurnButton){

                //==================================
                // TURN1 END
                //==================================

                if(
                    step4State.phase ===
                    "firstTurnEnd"
                ){

                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();


                    tutorialStep4FirstTurnEnded();


                    return;

                }


                //==================================
                // FREE PLAY END
                //==================================

                if(
                    step4State.phase ===
                    "freePlay"
                ){

                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();


                    completeTutorialStep4();


                    return;

                }


                //----------------------------------
                // その他禁止
                //----------------------------------

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();


                return;

            }

        },

        true

    );

}


/* =========================================================
Highlight Hand Card
========================================================= */

function highlightTutorialStep4HandCard(
    cardName
){

    clearTutorialStep4HandHighlights();


    if(
        !board ||
        !Array.isArray(
            board.handCards
        )
    ){

        return;

    }


    const card =

        board.handCards.find(
            card =>
                card?.name ===
                cardName
        );


    if(
        card &&
        typeof card.setHighlight ===
            "function"
    ){

        card.setHighlight(
            true
        );

    }

}


/* =========================================================
Clear Hand Highlight
========================================================= */

function clearTutorialStep4HandHighlights(){

    if(
        !board ||
        !Array.isArray(
            board.handCards
        )
    ){

        return;

    }


    board.handCards.forEach(
        card => {

            if(
                card &&
                typeof card.setHighlight ===
                    "function"
            ){

                card.setHighlight(
                    false
                );

            }

        }
    );

}


/* =========================================================
End Turn Enabled
========================================================= */

function setTutorialStep4EndTurnEnabled(
    enabled
){

    const button =

        document.getElementById(
            "endturn-button"
        );


    if(!button){

        return;

    }


    button.disabled =
        !enabled;

}


/* =========================================================
End Turn Highlight
========================================================= */

function highlightTutorialStep4EndTurn(){

    const button =

        document.getElementById(
            "endturn-button"
        );


    if(!button){

        return;

    }


    button.classList.add(
        "tutorial-action-highlight"
    );

}


/* =========================================================
Clear End Turn Highlight
========================================================= */

function clearTutorialStep4EndTurnHighlight(){

    const button =

        document.getElementById(
            "endturn-button"
        );


    if(!button){

        return;

    }


    button.classList.remove(
        "tutorial-action-highlight"
    );

}


/* =========================================================
Debug
========================================================= */

function logTutorialStep4State(){

    console.log(
        "================================"
    );

    console.log(
        "★ STEP4 STATE"
    );


    console.log(
        "phase =",
        step4State.phase
    );


    console.log(
        "playerTurnNumber =",
        step4State.playerTurnNumber
    );


    console.log(
        "unicornSummoned =",
        step4State.unicornSummoned
    );


    console.log(
        "burningEnergyUsed =",
        step4State.burningEnergyUsed
    );


    console.log(
        "unicornAttacked =",
        step4State.unicornAttacked
    );


    console.log(
        "cpuRapidMoveUsedFirstTurn =",
        step4State.cpuRapidMoveUsedFirstTurn
    );


    console.log(
        "fireballUsed =",
        step4State.fireballUsed
    );


    console.log(
        "cpuUnicornSummoned =",
        step4State.cpuUnicornSummoned
    );


    console.log(
        "cpuUnicornAttacked =",
        step4State.cpuUnicornAttacked
    );


    console.log(
        "playerStoneGuardUsed =",
        step4State.playerStoneGuardUsed
    );


    console.log(
        "costRecoveryDone =",
        step4State.costRecoveryDone
    );


    console.log(
        "coolRecoveryDone =",
        step4State.coolRecoveryDone
    );


    console.log(
        "freePlay =",
        step4State.freePlay
    );


    console.log(
        "freePlayRapidMoveUsed =",
        step4State.freePlayRapidMoveUsed
    );


    console.log(
        "freePlayStoneGuardUsed =",
        step4State.freePlayStoneGuardUsed
    );


    console.log(

        "PLAYER HAND =",

        board?.handCards?.map(
            card =>
                card.name
        ) || []

    );


    console.log(

        "PLAYER COST =",

        board?.costCards?.map(
            card =>
                card.name
        ) || []

    );


    console.log(

        "PLAYER COOL =",

        board?.playerCoolCards?.map(
            card =>
                card.name
        ) || []

    );


    console.log(

        "CPU HAND =",

        enemyHandCards?.map(
            card =>
                card.name
        ) || []

    );


    console.log(

        "CPU COST =",

        enemyCostCards?.map(
            card =>
                card.name
        ) || []

    );


    console.log(

        "CPU COOL =",

        enemyCoolCards?.map(
            card =>
                card.name
        ) || []

    );


    console.log(
        "================================"
    );

}