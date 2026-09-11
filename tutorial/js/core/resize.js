//==================================================
// Elementis Summoner
// Tutorial resize.js
//
// 基準画面
// 1280 × 720
//==================================================


let tutorialResizeTimer1 =
    null;

let tutorialResizeTimer2 =
    null;

let tutorialResizeTimer3 =
    null;


//==================================================
// リサイズ本体
//==================================================

function resizeGame(){

    const gameArea =
        document.getElementById(
            "tutorial-game-area"
        );


    const battleScreen =
        document.getElementById(
            "battle-screen"
        );


    if(!gameArea){

        console.warn(
            "tutorial-game-area が見つかりません"
        );

        return;

    }


    if(!battleScreen){

        console.warn(
            "battle-screen が見つかりません"
        );

        return;

    }


    //----------------------------------
    // 基準サイズ
    //----------------------------------

    const baseWidth =
        1280;


    const baseHeight =
        720;


    //----------------------------------
    // 実際のゲーム表示領域
    //----------------------------------

    const rect =
        gameArea.getBoundingClientRect();


    const areaWidth =
        rect.width;


    const areaHeight =
        rect.height;


    //----------------------------------
    // サイズ確認
    //----------------------------------

    if(
        areaWidth <= 0 ||
        areaHeight <= 0
    ){

        console.warn(
            "Tutorial resize：領域サイズ異常",
            {
                areaWidth,
                areaHeight
            }
        );

        return;

    }


    //----------------------------------
    // X / Y倍率
    //----------------------------------

    const scaleX =
        areaWidth /
        baseWidth;


    const scaleY =
        areaHeight /
        baseHeight;


    //----------------------------------
    // 画面内へ収める
    //----------------------------------

    const scale =
        Math.min(
            scaleX,
            scaleY
        );


    //----------------------------------
    // 基準サイズ固定
    //----------------------------------

    battleScreen.style.width =
        baseWidth +
        "px";


    battleScreen.style.height =
        baseHeight +
        "px";


    //----------------------------------
    // 中央配置
    //----------------------------------

    battleScreen.style.top =
        "50%";


    battleScreen.style.left =
        "50%";


    //----------------------------------
    // ★重要
    //
    // translate + scale を
    // 必ず同じtransformに設定
    //----------------------------------

    battleScreen.style.transform =
        `translate(-50%, -50%) scale(${scale})`;


    battleScreen.style.transformOrigin =
        "center center";


    //----------------------------------
    // 確認ログ
    //----------------------------------

    console.log(
        "Tutorial resize",
        {
            innerWidth:
                window.innerWidth,

            innerHeight:
                window.innerHeight,

            visualWidth:
                window.visualViewport
                ? window.visualViewport.width
                : null,

            visualHeight:
                window.visualViewport
                ? window.visualViewport.height
                : null,

            areaWidth,
            areaHeight,
            scale
        }
    );

}


//==================================================
// 安定した再リサイズ
//==================================================

function refreshTutorialGameSize(){

    //----------------------------------
    // 古いタイマー解除
    //----------------------------------

    if(tutorialResizeTimer1){

        clearTimeout(
            tutorialResizeTimer1
        );

    }


    if(tutorialResizeTimer2){

        clearTimeout(
            tutorialResizeTimer2
        );

    }


    if(tutorialResizeTimer3){

        clearTimeout(
            tutorialResizeTimer3
        );

    }


    //----------------------------------
    // 次フレーム
    //----------------------------------

    requestAnimationFrame(
        () => {

            resizeGame();


            //----------------------------------
            // さらに次フレーム
            //----------------------------------

            requestAnimationFrame(
                () => {

                    resizeGame();

                }
            );

        }
    );


    //----------------------------------
    // 100ms後
    //----------------------------------

    tutorialResizeTimer1 =
        setTimeout(
            () => {

                resizeGame();

            },
            100
        );


    //----------------------------------
    // 300ms後
    //----------------------------------

    tutorialResizeTimer2 =
        setTimeout(
            () => {

                resizeGame();

            },
            300
        );


    //----------------------------------
    // 600ms後
    //----------------------------------

    tutorialResizeTimer3 =
        setTimeout(
            () => {

                resizeGame();

            },
            600
        );

}


//==================================================
// 初回
//==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        refreshTutorialGameSize();

    }
);


//==================================================
// Window Resize
//==================================================

window.addEventListener(
    "resize",
    () => {

        refreshTutorialGameSize();

    }
);


//==================================================
// 端末回転
//==================================================

window.addEventListener(
    "orientationchange",
    () => {

        refreshTutorialGameSize();

    }
);


//==================================================
// Screen Orientation API
//==================================================

if(
    screen.orientation &&
    screen.orientation.addEventListener
){

    screen.orientation.addEventListener(
        "change",
        () => {

            refreshTutorialGameSize();

        }
    );

}


//==================================================
// Visual Viewport
//==================================================

if(window.visualViewport){

    window.visualViewport.addEventListener(
        "resize",
        () => {

            refreshTutorialGameSize();

        }
    );

}


//==================================================
// 旧関数名互換
//==================================================

function resizeBattleScreen(){

    refreshTutorialGameSize();

}