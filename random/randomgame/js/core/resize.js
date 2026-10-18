
"use strict";

//==================================
// チュートリアル画面サイズ調整
//==================================

function resizeGame(){

    const game =
        document.getElementById(
            "battle-screen"
        );

    const container =
        document.getElementById(
            "game-container"
        );

    if(!game || !container){
        return;
    }


    //----------------------------------
    // 基準サイズ
    //----------------------------------

    const baseWidth = 1280;
    const baseHeight = 720;


    //----------------------------------
    // 実際の表示領域
    //----------------------------------

    const viewport =
        window.visualViewport;

    const width = viewport
        ? viewport.width
        : window.innerWidth;

    const height = viewport
        ? viewport.height
        : window.innerHeight;

    if(width <= 0 || height <= 0){
        return;
    }


    //----------------------------------
    // コンテナサイズ
    //----------------------------------

    container.style.width =
        `${width}px`;

    container.style.height =
        `${height}px`;


    //----------------------------------
    // 縦横判定
    //----------------------------------

    const isPortrait =
        height > width;


    //----------------------------------
    // 表示倍率
    //----------------------------------

    let scale;

    if(isPortrait){

        scale = Math.min(
            width / baseHeight,
            height / baseWidth
        );

    }else{

        scale = Math.min(
            width / baseWidth,
            height / baseHeight
        );

    }


    //----------------------------------
    // ゲーム画面の基準サイズ
    //----------------------------------

    game.style.width =
        `${baseWidth}px`;

    game.style.height =
        `${baseHeight}px`;


    //----------------------------------
    // 回転・拡大縮小
    //----------------------------------

    if(isPortrait){

        game.style.transform =
            `translate(-50%, -50%)
             rotate(90deg)
             scale(${scale})`;

    }else{

        game.style.transform =
            `translate(-50%, -50%)
             scale(${scale})`;

    }


    //----------------------------------
    // モーダル用倍率
    //----------------------------------

    game.style.setProperty(
        "--game-scale",
        scale
    );

}


//==================================
// リサイズ予約
//==================================

let resizeTimer = null;

function scheduleResize(){

    requestAnimationFrame(
        resizeGame
    );

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(
        resizeGame,
        300
    );

}


//==================================
// 画面回転中の表示制御
//==================================

let rotationTimer = null;

let lastPortrait =
    window.innerHeight >
    window.innerWidth;

function handleScreenRotation(){

    const container =
        document.getElementById(
            "game-container"
        );

    if(!container){
        return;
    }

    const isPortrait =
        window.innerHeight >
        window.innerWidth;

    //----------------------------------
    // 縦横が変化した場合
    //----------------------------------

    if(isPortrait !== lastPortrait){

        lastPortrait = isPortrait;

        //----------------------------------
        // 回転中は画面を隠す
        //----------------------------------

        container.classList.add(
            "is-rotating"
        );

    }

    //----------------------------------
    // 回転中のタイマーを更新
    //----------------------------------

    if(
        !container.classList.contains(
            "is-rotating"
        )
    ){
        return;
    }

    clearTimeout(rotationTimer);

    //----------------------------------
    // 画面サイズが安定したら再表示
    //----------------------------------

    rotationTimer = setTimeout(
        () => {

            resizeGame();

            requestAnimationFrame(() => {

                container.classList.remove(
                    "is-rotating"
                );

            });

        },
        300
    );

}


//==================================
// イベント登録
//==================================

window.addEventListener(
    "resize",
    scheduleResize
);

window.addEventListener(
    "resize",
    handleScreenRotation
);

window.addEventListener(
    "orientationchange",
    scheduleResize
);

if(window.visualViewport){

    window.visualViewport.addEventListener(
        "resize",
        scheduleResize
    );

    window.visualViewport.addEventListener(
        "resize",
        handleScreenRotation
    );

}


//==================================
// 初期表示
//==================================

scheduleResize();


//==================================
// タッチ操作による拡大防止
//==================================

//----------------------------------
// ダブルタップ拡大防止
//----------------------------------

let lastTouchEnd = 0;

document.addEventListener(
    "touchend",
    function(event){

        const container =
            document.getElementById(
                "game-container"
            );

        if(
            !container ||
            !container.contains(event.target)
        ){
            return;
        }

        const now = Date.now();

        if(now - lastTouchEnd <= 300){

            event.preventDefault();

        }

        lastTouchEnd = now;

    },
    { passive: false }
);


//----------------------------------
// ピンチ操作防止
//----------------------------------

document.addEventListener(
    "touchmove",
    function(event){

        const container =
            document.getElementById(
                "game-container"
            );

        if(
            container &&
            container.contains(event.target) &&
            event.touches.length >= 2
        ){

            event.preventDefault();

        }

    },
    { passive: false }
);


//----------------------------------
// Safariジェスチャー拡大防止
//----------------------------------

[
    "gesturestart",
    "gesturechange",
    "gestureend"
].forEach(eventName => {

    document.addEventListener(
        eventName,
        function(event){

            const container =
                document.getElementById(
                    "game-container"
                );

            if(
                container &&
                container.contains(event.target)
            ){

                event.preventDefault();

            }

        },
        { passive: false }
    );

});
