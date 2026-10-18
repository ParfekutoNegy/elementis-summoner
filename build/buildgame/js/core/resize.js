
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

    const width =
        viewport
            ? viewport.width
            : window.innerWidth;

    const height =
        viewport
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
    // 画面方向
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
    // 基準サイズ
    //----------------------------------

    game.style.width =
        `${baseWidth}px`;

    game.style.height =
        `${baseHeight}px`;


    //----------------------------------
    // 回転と縮小
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
    // モーダル倍率
    //----------------------------------

    game.style.setProperty(
        "--game-scale",
        scale
    );


    //----------------------------------
    // 確認ログ
    //----------------------------------

    console.log(
        "画面方向:",
        isPortrait ? "縦" : "横"
    );

    console.log(
        "表示領域:",
        width,
        height
    );

    console.log(
        "表示倍率:",
        scale
    );

}


//==================================
// リサイズ予約
//==================================

let resizeTimer = null;

function scheduleResize(){

    // まず即時更新
    requestAnimationFrame(
        resizeGame
    );

    // 回転アニメーション後にも更新
    clearTimeout(
        resizeTimer
    );

    resizeTimer = setTimeout(
        resizeGame,
        300
    );

}


//==================================
// 通常の画面サイズ変更
//==================================

window.addEventListener(
    "resize",
    scheduleResize
);


//----------------------------------
// スマホ回転時の表示制御
//----------------------------------




//==================================
// 実際の表示領域変更
//==================================

if(window.visualViewport){

    window.visualViewport.addEventListener(
        "resize",
        scheduleResize
    );

}


//==================================
// 初期表示
//==================================

scheduleResize();

//----------------------------------
// ダブルタップによる拡大防止
//----------------------------------

let lastTouchEnd = 0;

document.addEventListener(
    "touchend",
    function(event){

        const now = Date.now();

        if(now - lastTouchEnd <= 300){

            event.preventDefault();

        }

        lastTouchEnd = now;

    },
    { passive: false }
);


//----------------------------------
// ピンチ操作による拡大防止
//----------------------------------

document.addEventListener(
    "touchmove",
    function(event){

        if(event.touches.length >= 2){

            event.preventDefault();

        }

    },
    { passive: false }
);


//----------------------------------
// Safariのジェスチャー拡大防止
//----------------------------------

[
    "gesturestart",
    "gesturechange",
    "gestureend"
].forEach(eventName => {

    document.addEventListener(
        eventName,
        function(event){

            event.preventDefault();

        },
        { passive: false }
    );

});

//==================================
// 画面回転時の表示制御
//==================================

let rotationTimer = null;

let lastPortrait =
    window.innerHeight > window.innerWidth;

function handleScreenRotation(){

    const container =
        document.getElementById(
            "game-container"
        );

    if(!container){
        return;
    }

    const isPortrait =
        window.innerHeight > window.innerWidth;

    // 縦横が切り替わった場合のみ
    if(isPortrait !== lastPortrait){

        lastPortrait = isPortrait;

        // ゲーム画面を隠す
        container.classList.add(
            "is-rotating"
        );

        clearTimeout(rotationTimer);

        // 回転後のサイズを再計算
        rotationTimer = setTimeout(() => {

            resizeGame();

            requestAnimationFrame(() => {

                container.classList.remove(
                    "is-rotating"
                );

            });

        }, 300);

    }

}


//==================================
// 画面サイズ変更を監視
//==================================

window.addEventListener(
    "resize",
    handleScreenRotation
);

if(window.visualViewport){

    window.visualViewport.addEventListener(
        "resize",
        handleScreenRotation
    );

}