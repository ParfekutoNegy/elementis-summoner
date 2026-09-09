/* =========================================================
Elementis Summoner
Tutorial Common System
========================================================= */


/* =========================================================
Tutorial Common State
========================================================= */

const tutorialCommonState = {

    active:
        true,

    currentStep:
        "",

    currentPhase:
        "",

    interactionLocked:
        false

};


/* =========================================================
DOM
========================================================= */

let tutorialLayout = null;

let tutorialGameArea = null;

let tutorialPanel = null;

let tutorialStepLabel = null;

let tutorialMessage = null;

let tutorialMenuButton = null;

let tutorialNextButton = null;


/* =========================================================
Initialize
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTutorialCommon
);


function initializeTutorialCommon(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial Common Initialize ====="
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // DOM取得
    //----------------------------------

    tutorialLayout =
        document.getElementById(
            "tutorial-layout"
        );


    tutorialGameArea =
        document.getElementById(
            "tutorial-game-area"
        );


    tutorialPanel =
        document.getElementById(
            "tutorial-panel"
        );


    tutorialStepLabel =
        document.getElementById(
            "tutorial-step-label"
        );


    tutorialMessage =
        document.getElementById(
            "tutorial-message"
        );

    tutorialNextButton =
        document.getElementById(
            "tutorial-next-button"
        );


    //----------------------------------
    // 必須DOM確認
    //----------------------------------

    if(
        !tutorialLayout ||
        !tutorialGameArea ||
        !tutorialPanel ||
        !tutorialStepLabel ||
        !tutorialMessage ||
        !tutorialNextButton
    ){

        console.error(
            "Tutorial Common：必要なDOMがありません",
            {
                tutorialLayout,
                tutorialGameArea,
                tutorialPanel,
                tutorialStepLabel,
                tutorialMessage,
                tutorialNextButton
            }
        );

        return;

    }


    //----------------------------------
    // 次へボタン
    //
    // 各STEP側で onclick を設定するため
    // ここでは初期化だけ
    //----------------------------------

    tutorialNextButton.onclick =
        null;


    //----------------------------------
    // ゲーム画面縮小
    //----------------------------------

    resizeTutorialGame();


    //----------------------------------
    // リサイズ追従
    //----------------------------------

    window.addEventListener(
        "resize",
        resizeTutorialGame
    );


    //----------------------------------
    // 通常ゲームの不要UIを初期状態へ
    //----------------------------------

    resetTutorialGameActionArea();


    console.log(
        "Tutorial Common：初期化完了"
    );

}


/* =========================================================
Resize

1280×720の実ゲーム画面を
tutorial-game-area 内へ収める
========================================================= */

function resizeTutorialGame(){

    const gameArea =
        document.getElementById(
            "tutorial-game-area"
        );


    const battleScreen =
        document.getElementById(
            "battle-screen"
        );


    if(
        !gameArea ||
        !battleScreen
    ){

        return;

    }


    //----------------------------------
    // 使用可能サイズ
    //----------------------------------

    const availableWidth =
        gameArea.clientWidth;


    const availableHeight =
        gameArea.clientHeight;


    //----------------------------------
    // 基準サイズ
    //----------------------------------

    const baseWidth =
        1280;


    const baseHeight =
        720;


    //----------------------------------
    // Scale
    //----------------------------------

    const scaleX =
        availableWidth /
        baseWidth;


    const scaleY =
        availableHeight /
        baseHeight;


    const scale =
        Math.min(
            scaleX,
            scaleY
        );


    //----------------------------------
    // 適用
    //----------------------------------

    battleScreen.style.position =
        "absolute";


    battleScreen.style.top =
        "50%";


    battleScreen.style.left =
        "50%";


    battleScreen.style.width =
        baseWidth +
        "px";


    battleScreen.style.height =
        baseHeight +
        "px";


    battleScreen.style.transformOrigin =
        "center center";


    battleScreen.style.transform =
        `
        translate(-50%, -50%)
        scale(${scale})
        `;


    console.log(
        "Tutorial Resize",
        {
            availableWidth,
            availableHeight,
            scale
        }
    );

}


/* =========================================================
Set STEP Label
========================================================= */

function setTutorialStepLabel(
    text
){

    if(!tutorialStepLabel){

        return;

    }


    tutorialStepLabel.textContent =
        text;

}


/* =========================================================
Set Message
========================================================= */

function setTutorialMessage(
    text
){

    if(!tutorialMessage){

        return;

    }


    tutorialMessage.textContent =
        text;

}


/* =========================================================
Set STEP + Message
========================================================= */

function setTutorialGuide(
    step,
    text
){

    setTutorialStepLabel(
        step
    );


    setTutorialMessage(
        text
    );

}


/* =========================================================
Show Next Button
========================================================= */

function showTutorialNextButton(
    text = "次へ",
    callback = null
){

    if(!tutorialNextButton){

        return;

    }


    tutorialNextButton.textContent =
        text;


    tutorialNextButton.disabled =
        false;


    tutorialNextButton.classList.remove(
        "tutorial-button-hidden"
    );


    //----------------------------------
    // 古いイベント解除
    //----------------------------------

    tutorialNextButton.onclick =
        null;


    //----------------------------------
    // 新しいイベント
    //----------------------------------

    if(callback){

        tutorialNextButton.onclick =
            event => {

                event.preventDefault();

                event.stopPropagation();


                callback();

            };

    }

}


/* =========================================================
Hide Next Button
========================================================= */

function hideTutorialNextButton(){

    if(!tutorialNextButton){

        return;

    }


    tutorialNextButton.onclick =
        null;


    tutorialNextButton.classList.add(
        "tutorial-button-hidden"
    );

}


/* =========================================================
Disable Next Button
========================================================= */

function disableTutorialNextButton(){

    if(!tutorialNextButton){

        return;

    }


    tutorialNextButton.disabled =
        true;

}


/* =========================================================
Enable Next Button
========================================================= */

function enableTutorialNextButton(){

    if(!tutorialNextButton){

        return;

    }


    tutorialNextButton.disabled =
        false;

}


/* =========================================================
Tutorial Menu
========================================================= */

function openTutorialMenu(){

    const result =
        window.confirm(
            "チュートリアルメニューに戻りますか？"
        );


    if(!result){

        return;

    }


    window.location.href =
        "tutorial.html";

}


/* =========================================================
STEP Page Move
========================================================= */

function moveTutorialStep(
    stepNumber
){

    const number =
        Number(
            stepNumber
        );


    if(
        !Number.isInteger(number) ||
        number < 1
    ){

        console.warn(
            "Tutorial：移動先STEPが不正です",
            stepNumber
        );

        return;

    }


    window.location.href =
        `step${number}.html`;

}


/* =========================================================
Intro Move
========================================================= */

function moveTutorialIntro(){

    window.location.href =
        "intro.html";

}


/* =========================================================
Highlight Zone
========================================================= */

function highlightTutorialZone(
    target
){

    clearTutorialZoneHighlight();


    const element =
        resolveTutorialElement(
            target
        );


    if(!element){

        console.warn(
            "Tutorial：発光対象がありません",
            target
        );

        return;

    }


    element.classList.add(
        "tutorial-zone-highlight"
    );

}


/* =========================================================
Highlight Multiple Zones
========================================================= */

function highlightTutorialZones(
    targets
){

    clearTutorialZoneHighlight();


    if(
        !Array.isArray(targets)
    ){

        targets =
            [
                targets
            ];

    }


    targets.forEach(
        target => {

            const element =
                resolveTutorialElement(
                    target
                );


            if(!element){

                return;

            }


            element.classList.add(
                "tutorial-zone-highlight"
            );

        }
    );

}


/* =========================================================
Highlight Information Area
========================================================= */

function highlightTutorialInfo(
    target
){

    clearTutorialInfoHighlight();


    const element =
        resolveTutorialElement(
            target
        );


    if(!element){

        return;

    }


    element.classList.add(
        "tutorial-info-highlight"
    );

}


/* =========================================================
Highlight Multiple Info Areas
========================================================= */

function highlightTutorialInfos(
    targets
){

    clearTutorialInfoHighlight();


    if(
        !Array.isArray(targets)
    ){

        targets =
            [
                targets
            ];

    }


    targets.forEach(
        target => {

            const element =
                resolveTutorialElement(
                    target
                );


            if(!element){

                return;

            }


            element.classList.add(
                "tutorial-info-highlight"
            );

        }
    );

}


/* =========================================================
Resolve DOM Element

DOMそのものでも
"#player-field" のようなselectorでも可
========================================================= */

function resolveTutorialElement(
    target
){

    if(!target){

        return null;

    }


    //----------------------------------
    // DOM Element
    //----------------------------------

    if(
        target instanceof
        HTMLElement
    ){

        return target;

    }


    //----------------------------------
    // Selector
    //----------------------------------

    if(
        typeof target ===
        "string"
    ){

        return document.querySelector(
            target
        );

    }


    return null;

}


/* =========================================================
Clear Zone Highlight
========================================================= */

function clearTutorialZoneHighlight(){

    document
        .querySelectorAll(
            ".tutorial-zone-highlight"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "tutorial-zone-highlight"
                );

            }
        );

}


/* =========================================================
Clear Info Highlight
========================================================= */

function clearTutorialInfoHighlight(){

    document
        .querySelectorAll(
            ".tutorial-info-highlight"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "tutorial-info-highlight"
                );

            }
        );

}


/* =========================================================
Clear All Tutorial Highlight
========================================================= */

function clearTutorialHighlight(){

    clearTutorialZoneHighlight();

    clearTutorialInfoHighlight();

}


/* =========================================================
Card Highlight

実ゲームのCard.setHighlight()を使う
========================================================= */

function highlightTutorialCard(
    card
){

    if(!card){

        return;

    }


    //----------------------------------
    // 手札等の既存発光を解除
    //----------------------------------

    if(
        typeof board !==
        "undefined" &&
        board &&
        Array.isArray(
            board.handCards
        )
    ){

        board.handCards.forEach(
            handCard => {

                if(
                    typeof handCard.setHighlight ===
                    "function"
                ){

                    handCard.setHighlight(
                        false
                    );

                }

            }
        );

    }


    //----------------------------------
    // 対象発光
    //----------------------------------

    if(
        typeof card.setHighlight ===
        "function"
    ){

        card.setHighlight(
            true
        );

    }

}


/* =========================================================
Clear Card Highlight
========================================================= */

function clearTutorialCardHighlight(){

    if(
        typeof board ===
        "undefined" ||
        !board
    ){

        return;

    }


    //----------------------------------
    // 手札
    //----------------------------------

    if(
        Array.isArray(
            board.handCards
        )
    ){

        board.handCards.forEach(
            card => {

                if(
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


    //----------------------------------
    // 自分場
    //----------------------------------

    if(
        typeof playerField !==
        "undefined" &&
        Array.isArray(
            playerField
        )
    ){

        playerField.forEach(
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


    //----------------------------------
    // 相手場
    //----------------------------------

    if(
        typeof enemyField !==
        "undefined" &&
        Array.isArray(
            enemyField
        )
    ){

        enemyField.forEach(
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

}


/* =========================================================
Clear All Highlight
========================================================= */

function clearAllTutorialHighlights(){

    clearTutorialHighlight();

    clearTutorialCardHighlight();

}


/* =========================================================
Reset Game Action Area

チュートリアル開始時に
既存アクションボタンを一旦隠す
========================================================= */

function resetTutorialGameActionArea(){

    const actionArea =
        document.getElementById(
            "cost-action-area"
        );


    if(!actionArea){

        return;

    }


    //----------------------------------
    // 各ボタン
    //----------------------------------

    actionArea
        .querySelectorAll(
            "button"
        )
        .forEach(
            button => {

                button.style.display =
                    "none";

            }
        );


    actionArea.style.display =
        "none";

}


/* =========================================================
Lock All Game Interaction

説明だけを読む場面などで使用。
STEP側から必要に応じて呼ぶ。
========================================================= */

function lockTutorialGameInteraction(){

    tutorialCommonState.interactionLocked =
        true;


    //----------------------------------
    // ゲーム画面全体を停止
    //----------------------------------

    const battleUI =
        document.getElementById(
            "battle-ui"
        );


    if(battleUI){

        battleUI.classList.add(
            "tutorial-disabled"
        );

    }


    //----------------------------------
    // モーダル等も停止
    //----------------------------------

    const selectors = [

        "#cost-action-area",

        "#action-guide",

        "#hand-card-modal",

        "#summon-action-modal",

        "#cool-modal",

        "#enemy-cool-modal"

    ];


    selectors.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );


            if(element){

                element.classList.add(
                    "tutorial-disabled"
                );

            }

        }
    );

}


/* =========================================================
Unlock Game Interaction
========================================================= */

function unlockTutorialGameInteraction(){

    tutorialCommonState.interactionLocked =
        false;


    document
        .querySelectorAll(
            ".tutorial-disabled"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "tutorial-disabled"
                );

            }
        );

}


/* =========================================================
Allow Only One Element

通常操作を止めつつ、
特定のゾーン等だけクリックさせたい場合に使用
========================================================= */

function allowOnlyTutorialElement(
    target
){

    lockTutorialGameInteraction();


    const element =
        resolveTutorialElement(
            target
        );


    if(!element){

        return;

    }


    element.classList.remove(
        "tutorial-disabled"
    );


    element.classList.add(
        "tutorial-enabled"
    );

}


/* =========================================================
Clear Allowed Elements
========================================================= */

function clearTutorialEnabledElements(){

    document
        .querySelectorAll(
            ".tutorial-enabled"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "tutorial-enabled"
                );

            }
        );

}


/* =========================================================
Enable Normal Tutorial Interaction
========================================================= */

function resetTutorialInteraction(){

    clearTutorialEnabledElements();

    unlockTutorialGameInteraction();

}


/* =========================================================
Set Tutorial State
========================================================= */

function setTutorialCommonState(
    step,
    phase
){

    tutorialCommonState.currentStep =
        step;


    tutorialCommonState.currentPhase =
        phase;


    console.log(
        "Tutorial State",
        {
            step,
            phase
        }
    );

}


/* =========================================================
Get Card Data By ID
========================================================= */

function getTutorialCardDataById(
    id
){

    if(
        typeof CARD_LIST ===
        "undefined"
    ){

        console.error(
            "Tutorial：CARD_LIST がありません"
        );

        return null;

    }


    return CARD_LIST.find(
        card =>
            Number(
                card.id
            ) ===
            Number(
                id
            )
    ) || null;

}


/* =========================================================
Get Card Data By Name
========================================================= */

function getTutorialCardDataByName(
    name
){

    if(
        typeof CARD_LIST ===
        "undefined"
    ){

        return null;

    }


    return CARD_LIST.find(
        card =>
            card.name ===
            name
    ) || null;

}


/* =========================================================
Create Tutorial Card

既存main.jsのcreateCard()が使える場合は
必ずそちらを利用する。

これによりカード画像・能力・trigger等も
本番ゲームと同じになる。
========================================================= */

function createTutorialCard(
    id,
    area = "hand",
    owner = PLAYER
){

    const data =
        getTutorialCardDataById(
            id
        );


    if(!data){

        console.error(
            "Tutorial：カードデータがありません",
            id
        );

        return null;

    }


    //----------------------------------
    // 本番createCardを利用
    //----------------------------------

    if(
        typeof createCard ===
        "function"
    ){

        return createCard(
            data,
            area,
            owner
        );

    }


    console.error(
        "Tutorial：createCard() がありません"
    );


    return null;

}


/* =========================================================
Clear Tutorial Board

STEPごとの初期盤面を作る前に使用
========================================================= */

function clearTutorialBoard(){

    console.log(
        "Tutorial：盤面初期化"
    );


    //----------------------------------
    // 選択解除
    //----------------------------------

    clearAllTutorialHighlights();

    resetTutorialInteraction();


    //----------------------------------
    // フィールド
    //----------------------------------

    if(
        typeof playerField !==
        "undefined"
    ){

        playerField.length =
            0;

    }


    if(
        typeof enemyField !==
        "undefined"
    ){

        enemyField.length =
            0;

    }


    //----------------------------------
    // Board
    //----------------------------------

    if(
        typeof board !==
        "undefined" &&
        board
    ){

        board.setPlayerCards(
            []
        );


        board.setEnemyCards(
            []
        );


        board.setHandCards(
            []
        );


        board.costCards =
            [];


        board.playerCoolCards =
            [];


        board.enemyCoolCards =
            [];


        board.enemyCostCards =
            [];


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

    }


    //----------------------------------
    // CPU
    //----------------------------------

    if(
        typeof enemyHandCards !==
        "undefined"
    ){

        enemyHandCards =
            [];

    }


    if(
        typeof enemyCostCards !==
        "undefined"
    ){

        enemyCostCards =
            [];

    }


    if(
        typeof enemyCoolCards !==
        "undefined"
    ){

        enemyCoolCards =
            [];

    }


    //----------------------------------
    // 選択状態
    //----------------------------------

    if(
        typeof selectedHandCard !==
        "undefined"
    ){

        selectedHandCard =
            null;

    }


    if(
        typeof selectedSummon !==
        "undefined"
    ){

        selectedSummon =
            null;

    }


    if(
        typeof selectedCoolCard !==
        "undefined"
    ){

        selectedCoolCard =
            null;

    }


    if(
        typeof summonCard !==
        "undefined"
    ){

        summonCard =
            null;

    }


    if(
        typeof selectedCostCards !==
        "undefined"
    ){

        selectedCostCards =
            [];

    }


    if(
        typeof costConfirm !==
        "undefined"
    ){

        costConfirm =
            false;

    }


    if(
        typeof summonUsedThisTurn !==
        "undefined"
    ){

        summonUsedThisTurn =
            false;

    }


    //----------------------------------
    // 行動状態
    //----------------------------------

    if(
        typeof resistMode !==
        "undefined"
    ){

        resistMode =
            false;

    }


    if(
        typeof coolRecoveryMode !==
        "undefined"
    ){

        coolRecoveryMode =
            false;

    }


    //----------------------------------
    // 攻撃状態
    //----------------------------------

    if(
        typeof resetAttackState ===
        "function"
    ){

        resetAttackState();

    }


    //----------------------------------
    // 表示
    //----------------------------------

    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }


    resetTutorialGameActionArea();

}


/* =========================================================
Set Tutorial LIFE
========================================================= */

function setTutorialLife(
    playerLife,
    enemyLife
){

    if(
        typeof game ===
        "undefined"
    ){

        return;

    }


    game.playerLife =
        playerLife;


    game.enemyLife =
        enemyLife;


    if(
        typeof updateLifeDisplay ===
        "function"
    ){

        updateLifeDisplay();

    }

}


/* =========================================================
Set Tutorial Icons
========================================================= */

function setTutorialIcons(
    playerIndex = 1,
    enemyIndex = 2
){

    const playerIcon =
        document.getElementById(
            "player-icon"
        );


    const enemyIcon =
        document.getElementById(
            "enemy-player-icon"
        );


    const playerNumber =
        String(
            playerIndex
        ).padStart(
            2,
            "0"
        );


    const enemyNumber =
        String(
            enemyIndex
        ).padStart(
            2,
            "0"
        );


    if(playerIcon){

        playerIcon.src =
            `../images/ui/character-${playerNumber}.png`;

    }


    if(enemyIcon){

        enemyIcon.src =
            `../images/ui/character-${enemyNumber}.png`;

    }

}


/* =========================================================
End Turn Button Lock
========================================================= */

function setTutorialEndTurnEnabled(
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
Common STEP Start

各step.jsの最初から呼ぶ
========================================================= */

function beginTutorialStep(
    stepLabel,
    firstMessage
){

    tutorialCommonState.active =
        true;


    setTutorialCommonState(
        stepLabel,
        "start"
    );


    //----------------------------------
    // チュートリアル中は
    // 右上のゲームメニューを使用しない
    //----------------------------------

    disableTutorialGameMenu();


    clearAllTutorialHighlights();

    resetTutorialInteraction();

    resetTutorialGameActionArea();


    setTutorialGuide(
        stepLabel,
        firstMessage
    );


    hideTutorialNextButton();


    setTutorialEndTurnEnabled(
        false
    );

}


/* =========================================================
Tutorial
右上メニューをチュートリアル用として使用
========================================================= */

function disableTutorialGameMenu(){

    const menuButton =
        document.getElementById(
            "menu-button"
        );


    const gameMenu =
        document.getElementById(
            "game-menu"
        );


    const closeMenuButton =
        document.getElementById(
            "close-menu-button"
        );


    //----------------------------------
    // 最初は閉じておく
    //----------------------------------

    if(gameMenu){

        gameMenu.style.display =
            "none";

    }


    //----------------------------------
    // 右上メニューボタン
    //----------------------------------

    if(menuButton){

        menuButton.disabled =
            false;


        menuButton.style.display =
            "";


        if(
            !menuButton.dataset
                .tutorialMenuRegistered
        ){

            menuButton.addEventListener(
                "click",
                tutorialMenuButtonClick,
                true
            );


            menuButton.dataset
                .tutorialMenuRegistered =
                "true";

        }

    }


    //----------------------------------
    // 閉じるボタン
    //----------------------------------

    if(closeMenuButton){

        closeMenuButton.disabled =
            false;


        closeMenuButton.style.display =
            "";


        if(
            !closeMenuButton.dataset
                .tutorialMenuRegistered
        ){

            closeMenuButton.addEventListener(
                "click",
                tutorialCloseMenuButtonClick,
                true
            );


            closeMenuButton.dataset
                .tutorialMenuRegistered =
                "true";

        }

    }


    console.log(
        "Tutorial：右上メニューを有効化"
    );

}


/* =========================================================
Tutorial Menu Button Click
========================================================= */

function tutorialMenuButtonClick(
    event
){

    if(
        !tutorialCommonState.active
    ){

        return;

    }


    event.preventDefault();

    event.stopPropagation();

    event.stopImmediatePropagation();


    openTutorialGameMenu();

}


/* =========================================================
Tutorial Close Menu Button Click
========================================================= */

function tutorialCloseMenuButtonClick(
    event
){

    if(
        !tutorialCommonState.active
    ){

        return;

    }


    console.log(
        "Tutorial：メニューを閉じる"
    );


    event.preventDefault();

    event.stopPropagation();

    event.stopImmediatePropagation();


    closeTutorialGameMenu();

}


/* =========================================================
Open Tutorial Menu
========================================================= */

function openTutorialGameMenu(){

    const gameMenu =
        document.getElementById(
            "game-menu"
        );


    if(!gameMenu){

        return;

    }


    const concedeButton =
        document.getElementById(
            "concede-button"
        );


    const resetButton =
        document.getElementById(
            "reset-game-button"
        );


    const homeButton =
        document.getElementById(
            "menu-home-button"
        );


    const closeButton =
        document.getElementById(
            "close-menu-button"
        );


    //----------------------------------
    // 通常ゲーム用は隠す
    //----------------------------------

    if(concedeButton){

        concedeButton.style.display =
            "none";

    }


    if(resetButton){

        resetButton.style.display =
            "none";

    }


    //----------------------------------
    // チュートリアルメニュー
    //----------------------------------

    if(homeButton){

        homeButton.style.display =
            "";


        homeButton.textContent =
            "メニューに戻る";


        homeButton.onclick =
            event => {

                event.preventDefault();

                event.stopPropagation();


                location.href =
                    "tutorial.html";

            };

    }


    //----------------------------------
    // 閉じる
    //----------------------------------

    if(closeButton){

        closeButton.style.display =
            "";

    }


    //----------------------------------
    // 表示
    //----------------------------------

    gameMenu.style.display =
        "flex";

}


/* =========================================================
Close Tutorial Menu
========================================================= */

function closeTutorialGameMenu(){

    const gameMenu =
        document.getElementById(
            "game-menu"
        );


    if(!gameMenu){

        return;

    }


    gameMenu.style.display =
        "none";


    console.log(
        "Tutorial：ゲームメニュー非表示"
    );

}