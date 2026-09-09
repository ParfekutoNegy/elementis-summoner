//==================================================
// Elementis Summoner
// Tutorial resize.js
//
// 基準画面
// 1280 × 720
//==================================================


//==================================================
// リサイズ
//==================================================

function resizeGame(){

    const battleScreen =
        document.getElementById(
            "battle-screen"
        );


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
    // 現在の画面サイズ
    //----------------------------------

    const windowWidth =
        window.innerWidth;


    const windowHeight =
        window.innerHeight;


    //----------------------------------
    // X / Y の倍率
    //----------------------------------

    const scaleX =
        windowWidth /
        baseWidth;


    const scaleY =
        windowHeight /
        baseHeight;


    //----------------------------------
    // 画面内に収まる倍率
    //----------------------------------

    const scale =
        Math.min(
            scaleX,
            scaleY
        );


    //----------------------------------
    // 中央配置 ＋ 拡大縮小
    //
    // ★ translate が重要
    //----------------------------------

    battleScreen.style.transform =
        `
        translate(-50%, -50%)
        scale(${scale})
        `;


    battleScreen.style.transformOrigin =
        "center center";


    console.log(
        "Tutorial resize",
        {
            windowWidth,
            windowHeight,
            scale
        }
    );

}


//==================================================
// 初回
//==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        resizeGame();

    }
);


//==================================================
// ウィンドウサイズ変更
//==================================================

window.addEventListener(
    "resize",
    resizeGame
);


//==================================================
// 旧関数名互換
//==================================================

function resizeBattleScreen(){

    resizeGame();

}