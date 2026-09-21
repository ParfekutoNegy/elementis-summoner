/* =========================================================
Elementis Summoner

Tutorial STEP5

LIFE
ゲームの勝利条件
マッチの勝利条件

最終実践チュートリアル
========================================================= */


/* =========================================================
STEP5 Deck

PLAYER
STEP4までで使用してきた10枚
========================================================= */

const TUTORIAL_STEP5_PLAYER_DECK_IDS = [

    1,   // ウィルオウィスプ
    11,  // ユニコーン
    20,  // クラーケン
    29,  // ロックスパイク

    5,   // バーニングエナジー
    6,   // ファイアボール
    7,   // パイロフレイム

    16,  // ラピッドムーヴ
    31,  // ストーンガード
    32   // グラウンドウォール

];


/* =========================================================
STEP5 CPU Deck
========================================================= */

const TUTORIAL_STEP5_CPU_DECK_IDS = [

    12,  // グリフォン
    10,  // シルフ
    11,  // ユニコーン
    9,   // フェアリー

    29,  // ロックスパイク
    13,  // エアスラッシュ
    6,   // ファイアボール

    31,  // ストーンガード
    16,  // ラピッドムーヴ
    24   // ウォーターバリア

];


/* =========================================================
STEP5 State
========================================================= */

const step5State = {

    active:
        false,

    phase:
        "none",

    //----------------------------------
    // 現在ゲーム中か
    //----------------------------------

    playing:
        false,

    //----------------------------------
    // ゲーム終了後
    //----------------------------------

    lastWinner:
        null,

    //----------------------------------
    // 第1ゲーム終了説明済み
    //----------------------------------

    starExplanationDone:
        false,

    //----------------------------------
    // 敗者先攻説明済み
    //----------------------------------

    loserFirstExplanationDone:
        false,

    //----------------------------------
    // Hook
    //----------------------------------

    hooksInstalled:
        false,

    //----------------------------------
    // 次ゲーム開始待ち
    //----------------------------------

    waitingNextGame:
        false,

    //----------------------------------
    // マッチ終了
    //----------------------------------

    matchFinished:
        false

};


/* =========================================================
DOMContentLoaded
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    initializeTutorialStep5

);


/* =========================================================
Initialize
========================================================= */

function initializeTutorialStep5(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial STEP5 ====="
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // STEP5状態
    //----------------------------------

    step5State.active =
        true;

    step5State.phase =
        "introduction";

    step5State.playing =
        false;

    step5State.lastWinner =
        null;

    step5State.waitingNextGame =
        false;

    step5State.matchFinished =
        false;


    //==================================================
    // 共通チュートリアル開始
    //==================================================

    beginTutorialStep(

        "STEP 5",

        "最後に、実際にゲームを行いながら、" +
        "LIFEとゲーム・マッチの勝利条件を確認します。"

    );


    //----------------------------------
    // マッチ初期化
    //----------------------------------

    playerWins =
        0;

    enemyWins =
        0;

    matchGameNumber =
        1;

    nextFirstPlayer =
        null;

    firstPlayer =
        null;

    secondPlayer =
        null;


    //----------------------------------
    // LIFE
    //----------------------------------

    game.playerLife =
        5;

    game.enemyLife =
        5;


    //----------------------------------
    // ゲーム終了状態
    //----------------------------------

    battleGameEnding =
        false;

    battleGameConceded =
        false;


    //----------------------------------
    // 勝利表示
    //----------------------------------

    if(
        typeof updateWinStars ===
        "function"
    ){

        updateWinStars();

    }


    //----------------------------------
    // LIFE表示
    //----------------------------------

    if(
        typeof updateLifeDisplay ===
        "function"
    ){

        updateLifeDisplay();

    }


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
    // アイコン
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
    // STEP5 Hook
    //----------------------------------

    installTutorialStep5Hooks();


    //----------------------------------
    // ゲーム開始前なので
    // ターン終了禁止
    //----------------------------------

    setTutorialStep5EndTurnEnabled(
        false
    );


    //----------------------------------
    // 最初の説明
    //----------------------------------

    showTutorialNextButton(

        "開始",

        showTutorialStep5LifeExplanation

    );

}


/* =========================================================
LIFE Explanation
========================================================= */

function showTutorialStep5LifeExplanation(){

    step5State.phase =
        "lifeExplanation";


    setTutorialGuide(

        "LIFE",

        "LIFEは5が基本です。\n" +
        "ただし、1つのシリーズだけを使用するビルドルールでは、" +
        "開始時のLIFEを1～5から選ぶことができます。"

    );


    highlightTutorialStep5Life();


    showTutorialNextButton(

        "次へ",

        showTutorialStep5GameRuleExplanation

    );

}


/* =========================================================
Game Rule
========================================================= */

function showTutorialStep5GameRuleExplanation(){

    step5State.phase =
        "gameRule";


    clearTutorialStep5Highlights();


    setTutorialGuide(

        "ゲームの勝利条件",

        "今回は基本となるLIFE5で通常のゲームを行います。\n" +
        "相手のLIFEを0にすると、そのゲームに勝利します。"

    );


    showTutorialNextButton(

        "ゲーム開始",

        startTutorialStep5Match

    );

}


/* =========================================================
Match Start
========================================================= */

function startTutorialStep5Match(){

    console.log(
        "================================"
    );

    console.log(
        "★ STEP5 MATCH START"
    );

    console.log(
        "================================"
    );


    step5State.phase =
        "playing";

    step5State.playing =
        true;


    hideTutorialNextButton();

    clearTutorialStep5Highlights();


    //----------------------------------
    // 第1ゲーム
    //----------------------------------

    matchGameNumber =
        1;


    //----------------------------------
    // 勝利数
    //----------------------------------

    playerWins =
        0;

    enemyWins =
        0;


    updateWinStars();


//----------------------------------
// 第1ゲーム
// チュートリアルではPLAYER先攻固定
//----------------------------------

firstPlayer =
    PLAYER;

secondPlayer =
    ENEMY;


console.log(
    "★ STEP5 第1ゲーム"
);

console.log(
    "先攻:",
    firstPlayer
);

console.log(
    "後攻:",
    secondPlayer
);


    //----------------------------------
    // ゲーム状態
    //----------------------------------

    game.turn =
        0;

    game.currentPlayer =
        firstPlayer;

    game.state =
        TURN_STATE.START;


    //----------------------------------
    // LIFE
    //----------------------------------

    game.playerLife =
        5;

    game.enemyLife =
        5;


    updateLifeDisplay();


    //----------------------------------
    // ゲーム終了状態解除
    //----------------------------------

    battleGameEnding =
        false;

    battleGameConceded =
        false;


    //----------------------------------
    // 固定デッキで盤面生成
    //----------------------------------

    setupTutorialStep5Game();


    //----------------------------------
    // 案内
    //----------------------------------

    setTutorialGuide(

        "第1ゲーム",

        (
            firstPlayer === PLAYER
                ? "あなた"
                : "相手"
        ) +
        "が先攻です。\n" +
        "これまでに学んだルールを使って、自由にプレイしてください。"

    );


    //----------------------------------
    // ゲーム開始
    //----------------------------------

    startTutorialStep5CurrentTurn();

}


/* =========================================================
Current Turn Start
========================================================= */

function startTutorialStep5CurrentTurn(){

    setTutorialStep5EndTurnEnabled(
        game.currentPlayer === PLAYER
    );


    if(
        game.currentPlayer === PLAYER
    ){

        startTurn();

    }
    else{

        startCpuTurn();

    }

}


/* =========================================================
STEP5 Game Setup
========================================================= */

function setupTutorialStep5Game(){

    console.log(
        "★ STEP5：固定デッキでゲームセットアップ",
        "第" + matchGameNumber + "ゲーム"
    );


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
    // PLAYER固定手札
    //----------------------------------

    const playerHand =
        createTutorialStep5Hand(

            TUTORIAL_STEP5_PLAYER_DECK_IDS,

            PLAYER

        );


    //----------------------------------
    // CPU固定手札
    //----------------------------------

    const cpuHand =
        createTutorialStep5Hand(

            TUTORIAL_STEP5_CPU_DECK_IDS,

            ENEMY

        );


    //----------------------------------
    // PLAYER
    //----------------------------------

    board.setHandCards(
        playerHand
    );


    //----------------------------------
    // CPU
    //----------------------------------

    enemyHandCards =
        cpuHand;


    //----------------------------------
    // 表示更新
    //----------------------------------

    if(
        typeof board.updateCostCount ===
        "function"
    ){

        board.updateCostCount();

    }


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
        typeof updateCostZoneView ===
        "function"
    ){

        updateCostZoneView();

    }


    if(
        typeof updateGameState ===
        "function"
    ){

        updateGameState();

    }


    console.log(
        "★ STEP5 PLAYER HAND",
        playerHand.map(
            card => card.name
        )
    );


    console.log(
        "★ STEP5 CPU HAND",
        cpuHand.map(
            card => card.name
        )
    );

}


/* =========================================================
Create Fixed Hand
========================================================= */

function createTutorialStep5Hand(
    ids,
    owner
){

    const result =
        [];


    ids.forEach(
        id => {

            const source =
                CARD_LIST.find(
                    card =>
                        Number(card.id) ===
                        Number(id)
                );


            if(!source){

                console.warn(
                    "STEP5 card not found:",
                    id
                );

                return;

            }


            //----------------------------------
            // main.js の createCard() を使用
            //
            // createCard() 側で
            // "../" + cardData.image
            // になるため画像パスも正常
            //----------------------------------

            const card =
                createCard(
                    source,
                    "hand",
                    owner
                );


            if(!card){

                return;

            }


            card.area =
                "hand";

            card.owner =
                owner;

            card.setFaceDown(
                false
            );

            card.setSelected(
                false
            );

            card.setCostSelected(
                false
            );

            card.setHighlight(
                false
            );


            result.push(
                card
            );

        }
    );


    return result;

}


/* =========================================================
Hooks
========================================================= */

function installTutorialStep5Hooks(){

    if(
        step5State.hooksInstalled
    ){

        return;

    }


    step5State.hooksInstalled =
        true;


    console.log(
        "★ STEP5：通常ゲームHook開始"
    );


    //==================================================
    // setupGame
    //
    // startNextGame() の中から呼ばれるため、
    // STEP5中だけ固定デッキに差し替える
    //==================================================

    if(
        typeof setupGame ===
        "function"
    ){

        const normalSetupGame =
            setupGame;


        setupGame =
            function(){

                if(
                    step5State.active
                ){

                    console.log(
                        "★ STEP5：setupGame → 固定デッキ"
                    );


                    setupTutorialStep5Game();

                    return;

                }


                return normalSetupGame.apply(
                    this,
                    arguments
                );

            };

    }


    //==================================================
    // finishBattleGame
    //
    // 通常版では2秒後に自動で
    // startNextGame() が実行される。
    //
    // STEP5では説明を挟む。
    //==================================================

    if(
        typeof finishBattleGame ===
        "function"
    ){

        const normalFinishBattleGame =
            finishBattleGame;


        finishBattleGame =
            function(
                winner
            ){

                if(
                    !step5State.active
                ){

                    return normalFinishBattleGame.apply(
                        this,
                        arguments
                    );

                }


                tutorialStep5FinishBattleGame(
                    winner
                );

            };

    }


    //==================================================
    // finishMatch
    //
    // 通常のMATCH WIN/LOSS画面ではなく
    // チュートリアル終了説明へ
    //==================================================

    if(
        typeof finishMatch ===
        "function"
    ){

        const normalFinishMatch =
            finishMatch;


        finishMatch =
            function(
                winner
            ){

                if(
                    !step5State.active
                ){

                    return normalFinishMatch.apply(
                        this,
                        arguments
                    );

                }


                tutorialStep5FinishMatch(
                    winner
                );

            };

    }

}


/* =========================================================
Game Finish

通常 finishBattleGame のSTEP5版
========================================================= */

function tutorialStep5FinishBattleGame(
    winner
){

    console.log(
        "================================"
    );

    console.log(
        "★ STEP5 GAME FINISH",
        winner
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // 二重実行防止
    //----------------------------------

    if(
        step5State.waitingNextGame ||
        step5State.matchFinished
    ){

        return;

    }


    step5State.playing =
        false;

    step5State.lastWinner =
        winner;


    //----------------------------------
    // ゲーム停止
    //----------------------------------

    game.state =
        TURN_STATE.END;


    //----------------------------------
    // 勝利数
    //----------------------------------

    if(
        winner === PLAYER
    ){

        playerWins++;

    }
    else{

        enemyWins++;

    }


    //----------------------------------
    // ☆更新
    //----------------------------------

    updateWinStars();


    //----------------------------------
    // 操作停止
    //----------------------------------

    closeTutorialStep5GameUI();


    setTutorialStep5EndTurnEnabled(
        false
    );


    //----------------------------------
    // 2勝したか
    //----------------------------------

    if(
        playerWins >= 2 ||
        enemyWins >= 2
    ){

        tutorialStep5FinishMatch(
            winner
        );

        return;

    }


    //----------------------------------
    // 次ゲーム待ち
    //----------------------------------

    step5State.waitingNextGame =
        true;


    //----------------------------------
    // 最初のゲーム終了時
    // ☆の意味を説明
    //----------------------------------

    if(
        !step5State.starExplanationDone
    ){

        step5State.phase =
            "starExplanation";

        step5State.starExplanationDone =
            true;


        highlightTutorialStep5WinnerStars(
            winner
        );


        setTutorialGuide(

            "ゲーム終了",

            (
                winner === PLAYER
                    ? "あなた"
                    : "相手"
            ) +
            "がこのゲームに勝利しました。\n" +
            "ゲームに勝利すると、勝者側に☆が1つ付きます。"

        );


        showTutorialNextButton(

            "次へ",

            showTutorialStep5LoserFirstExplanation

        );


        return;

    }


    //----------------------------------
    // 2ゲーム目終了
    //
    // 1勝1敗なら第3ゲームへ
    //----------------------------------

    showTutorialStep5NextGameExplanation();

}


/* =========================================================
Loser First Explanation
========================================================= */

function showTutorialStep5LoserFirstExplanation(){

    step5State.phase =
        "loserFirstExplanation";


    clearTutorialStep5Highlights();


    step5State.loserFirstExplanationDone =
        true;


    const winner =
        step5State.lastWinner;


    const nextFirst =
        winner === PLAYER
            ? ENEMY
            : PLAYER;


    setTutorialGuide(

        "次のゲーム",

        "次のゲームでは、前のゲームに負けたプレイヤーが先攻になります。\n" +
        "今回は" +
        (
            nextFirst === PLAYER
                ? "あなた"
                : "相手"
        ) +
        "が先攻になります。"

    );


    showTutorialNextButton(

        "次のゲームへ",

        startTutorialStep5NextGame

    );

}


/* =========================================================
Game2 → Game3
========================================================= */

function showTutorialStep5NextGameExplanation(){

    step5State.phase =
        "nextGameExplanation";


    clearTutorialStep5Highlights();


    const winner =
        step5State.lastWinner;


    const nextFirst =
        winner === PLAYER
            ? ENEMY
            : PLAYER;


    setTutorialGuide(

        "次のゲーム",

        "現在の戦績は " +
        playerWins +
        " - " +
        enemyWins +
        " です。\n" +
        "前のゲームに負けた" +
        (
            nextFirst === PLAYER
                ? "あなた"
                : "相手"
        ) +
        "が次のゲームの先攻になります。"

    );


    showTutorialNextButton(

        "次のゲームへ",

        startTutorialStep5NextGame

    );

}


/* =========================================================
Start Next Game
========================================================= */

function startTutorialStep5NextGame(){

    const winner =
        step5State.lastWinner;


    if(!winner){

        console.error(
            "STEP5：前ゲームの勝者がありません"
        );

        return;

    }


    console.log(
        "★ STEP5：次ゲーム開始",
        "前ゲーム勝者=",
        winner
    );


    hideTutorialNextButton();

    clearTutorialStep5Highlights();


    step5State.waitingNextGame =
        false;

    step5State.phase =
        "playing";

    step5State.playing =
        true;


    //----------------------------------
    // 既存の startNextGame() を使用
    //
    // ・敗者先攻設定
    // ・matchGameNumber++
    // ・各状態リセット
    // ・LIFE5へ戻す
    // ・setupGame()
    // ・ターン開始
    //
    // setupGame() はHookしてあるため
    // STEP5固定デッキになる
    //----------------------------------

    startNextGame(
        winner
    );


    //----------------------------------
    // startNextGame後には
    // firstPlayer が決定済み
    //----------------------------------

    setTutorialGuide(

        "第" +
        matchGameNumber +
        "ゲーム",

        (
            firstPlayer === PLAYER
                ? "あなた"
                : "相手"
        ) +
        "が先攻です。\n" +
        "ゲームを続けてください。"

    );

}


/* =========================================================
Match Finish
========================================================= */

function tutorialStep5FinishMatch(
    winner
){

    console.log(
        "================================"
    );

    console.log(
        "★ STEP5 MATCH FINISH"
    );

    console.log(
        "winner=",
        winner
    );

    console.log(
        "score=",
        playerWins,
        "-",
        enemyWins
    );

    console.log(
        "================================"
    );


    step5State.matchFinished =
        true;

    step5State.playing =
        false;

    step5State.waitingNextGame =
        false;

    step5State.lastWinner =
        winner;

    step5State.phase =
        "matchFinished";


    //----------------------------------
    // ゲーム停止
    //----------------------------------

    game.state =
        TURN_STATE.END;


    //----------------------------------
    // 操作停止
    //----------------------------------

    closeTutorialStep5GameUI();


    setTutorialStep5EndTurnEnabled(
        false
    );


    //----------------------------------
    // 勝利スター
    //----------------------------------

    updateWinStars();


    highlightTutorialStep5WinnerStars(
        winner
    );


    //----------------------------------
    // マッチ説明
    //----------------------------------

    setTutorialGuide(

        "マッチ終了",

        (
            winner === PLAYER
                ? "あなた"
                : "相手"
        ) +
        "が先に2ゲーム勝利しました。\n" +
        "先に2ゲーム勝利したプレイヤーが、マッチの勝者です。"

    );


    showTutorialNextButton(

        "次へ",

        completeTutorialStep5

    );

}


/* =========================================================
Tutorial Complete
========================================================= */

function completeTutorialStep5(){

    step5State.phase =
        "complete";


    clearTutorialStep5Highlights();


    setTutorialGuide(

        "チュートリアル完了",

        "これでElementis Summonerの基本的な遊び方の説明は終了です。"

    );


    showTutorialNextButton(

        "チュートリアルを終了",

        finishTutorialStep5

    );

}


/* =========================================================
Tutorial Finish
========================================================= */

function finishTutorialStep5(){

    step5State.active =
        false;


    clearTutorialStep5Highlights();


    window.location.href =
        "tutorial.html";

}


/* =========================================================
Close Game UI
========================================================= */

function closeTutorialStep5GameUI(){

    //----------------------------------
    // モーダル
    //----------------------------------

    if(
        typeof closeEnemyCoolModal ===
        "function"
    ){

        closeEnemyCoolModal();

    }


    if(
        typeof closeCoolModal ===
        "function"
    ){

        closeCoolModal();

    }


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


    if(
        typeof closeCostView ===
        "function"
    ){

        closeCostView();

    }


    //----------------------------------
    // 攻撃
    //----------------------------------

    if(
        typeof resetAttackState ===
        "function"
    ){

        resetAttackState();

    }


    //----------------------------------
    // 選択
    //----------------------------------

    if(
        typeof clearHandSelection ===
        "function"
    ){

        clearHandSelection();

    }


    if(
        typeof clearFieldSelection ===
        "function"
    ){

        clearFieldSelection();

    }

}


/* =========================================================
LIFE Highlight
========================================================= */

function highlightTutorialStep5Life(){

    clearTutorialStep5Highlights();


    const playerLife =
        document.getElementById(
            "player-life-display"
        );


    const enemyLife =
        document.getElementById(
            "enemy-life-display"
        );


    if(playerLife){

        playerLife.classList.add(
            "tutorial-step5-highlight"
        );

    }


    if(enemyLife){

        enemyLife.classList.add(
            "tutorial-step5-highlight"
        );

    }

}


/* =========================================================
Winner Star Highlight
========================================================= */

function highlightTutorialStep5WinnerStars(
    winner
){

    clearTutorialStep5Highlights();


    const id =
        winner === PLAYER
            ? "player-win-stars"
            : "enemy-win-stars";


    const stars =
        document.getElementById(
            id
        );


    if(stars){

        stars.classList.add(
            "tutorial-step5-highlight"
        );

    }

}


/* =========================================================
Clear Highlight
========================================================= */

function clearTutorialStep5Highlights(){

    document
        .querySelectorAll(
            ".tutorial-step5-highlight"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "tutorial-step5-highlight"
                );

            }
        );

}


/* =========================================================
End Turn
========================================================= */

function setTutorialStep5EndTurnEnabled(
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