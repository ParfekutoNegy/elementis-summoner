
/* ==========================================
   Elementis Summoner
   Tutorial resize.js

   全体サイズ：1280 × 812
   ゲーム画面：1280 × 720
   説明パネル：1280 × 92
========================================== */

(function(){

    "use strict";

    //----------------------------------
    // 基準サイズ
    //----------------------------------

    const BASE_WIDTH = 1280;
    const BASE_HEIGHT = 812;

    let resizeTimer = null;
    let rotationTimer = null;

    let lastPortrait =
        window.innerHeight > window.innerWidth;


    //==================================
    // リサイズ本体
    //==================================

    function resizeGame(){

        const layout =
            document.getElementById(
                "tutorial-layout"
            );

        const battleScreen =
            document.getElementById(
                "battle-screen"
            );

        if(!layout || !battleScreen){
            return;
        }


        //----------------------------------
        // 表示領域取得
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
        // 縦横判定
        //----------------------------------

        const isPortrait =
            height > width;


        //----------------------------------
        // 表示倍率
        //----------------------------------

        let scale;

        if(isPortrait){

            // 90度回転後は
            // 812 × 1280
            scale = Math.min(
                width / BASE_HEIGHT,
                height / BASE_WIDTH
            );

        }else{

            // 横持ちは通常表示
            scale = Math.min(
                width / BASE_WIDTH,
                height / BASE_HEIGHT
            );

        }


        //----------------------------------
        // レイアウト基準サイズ
        //----------------------------------

        layout.style.width =
            `${BASE_WIDTH}px`;

        layout.style.height =
            `${BASE_HEIGHT}px`;


        //----------------------------------
        // 全体の回転・縮小
        //----------------------------------

        if(isPortrait){

            layout.style.transform =
                `translate(-50%, -50%)
                 rotate(90deg)
                 scale(${scale})`;

        }else{

            layout.style.transform =
                `translate(-50%, -50%)
                 scale(${scale})`;

        }


        //----------------------------------
        // バトル画面は回転させない
        //----------------------------------

        battleScreen.style.width =
            "1280px";

        battleScreen.style.height =
            "720px";

        battleScreen.style.top =
            "50%";

        battleScreen.style.left =
            "50%";

        battleScreen.style.transform =
            "translate(-50%, -50%)";

        battleScreen.style.transformOrigin =
            "center center";


        //----------------------------------
        // 表示倍率を保存
        //----------------------------------

        battleScreen.style.setProperty(
            "--game-scale",
            scale
        );


        //----------------------------------
        // 確認ログ
        //----------------------------------

        console.log(
            "Tutorial resize",
            {
                isPortrait,
                width,
                height,
                scale
            }
        );

    }


    //==================================
    // リサイズ予約
    //==================================

    function refreshTutorialGameSize(){

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
    // 回転検知
    //==================================

    function handleTutorialRotation(){

        const layout =
            document.getElementById(
                "tutorial-layout"
            );

        if(!layout){
            return;
        }

        const isPortrait =
            window.innerHeight >
            window.innerWidth;

        if(isPortrait === lastPortrait){
            return;
        }

        lastPortrait = isPortrait;

        //----------------------------------
        // 回転中は全体を非表示
        //----------------------------------

        layout.classList.add(
            "is-rotating"
        );

        clearTimeout(rotationTimer);

        rotationTimer = setTimeout(
            () => {

                resizeGame();

                requestAnimationFrame(
                    () => {

                        layout.classList.remove(
                            "is-rotating"
                        );

                    }
                );

            },
            300
        );

    }


    //==================================
    // イベント登録
    //==================================

    window.addEventListener(
        "resize",
        refreshTutorialGameSize
    );

    window.addEventListener(
        "resize",
        handleTutorialRotation
    );

    window.addEventListener(
        "orientationchange",
        refreshTutorialGameSize
    );

    if(window.visualViewport){

        window.visualViewport.addEventListener(
            "resize",
            refreshTutorialGameSize
        );

        window.visualViewport.addEventListener(
            "resize",
            handleTutorialRotation
        );

    }


    //==================================
    // タッチ操作による拡大防止
    //==================================

    const gestureEvents = [
        "gesturestart",
        "gesturechange",
        "gestureend"
    ];

    gestureEvents.forEach(eventName => {

        document.addEventListener(
            eventName,
            function(event){

                const layout =
                    document.getElementById(
                        "tutorial-layout"
                    );

                if(
                    layout &&
                    layout.contains(event.target)
                ){
                    event.preventDefault();
                }

            },
            { passive: false }
        );

    });


    document.addEventListener(
        "touchmove",
        function(event){

            const layout =
                document.getElementById(
                    "tutorial-layout"
                );

            if(
                layout &&
                layout.contains(event.target) &&
                event.touches.length >= 2
            ){
                event.preventDefault();
            }

        },
        { passive: false }
    );


    //==================================
    // 既存関数との互換性
    //==================================

    window.resizeGame =
        resizeGame;

    window.refreshTutorialGameSize =
        refreshTutorialGameSize;

    window.resizeBattleScreen =
        refreshTutorialGameSize;


    //==================================
    // 初期表示
    //==================================

    if(document.readyState === "loading"){

        document.addEventListener(
            "DOMContentLoaded",
            refreshTutorialGameSize
        );

    }else{

        refreshTutorialGameSize();

    }

})();
