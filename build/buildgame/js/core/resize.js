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
    // 表示倍率
    //----------------------------------

    const scale =
        Math.min(
            window.innerWidth / baseWidth,
            window.innerHeight / baseHeight
        );


    //----------------------------------
    // ゲーム画面
    //----------------------------------

    game.style.transform =
        `
        translate(-50%, -50%)
        scale(${scale})
        `;


    //----------------------------------
    // 基準サイズを維持
    //----------------------------------

    game.style.width =
        `${baseWidth}px`;

    game.style.height =
        `${baseHeight}px`;


    //----------------------------------
    // モーダル用の表示倍率を保存
    //
    // モーダルは battle-screen 内にあるため
    // 通常ならゲーム画面と一緒に縮小される。
    //
    // そこで現在の倍率をCSS変数として渡し、
    // モーダル側で逆倍率を適用する。
    //----------------------------------

    game.style.setProperty(
        "--game-scale",
        scale
    );

}

window.addEventListener(
    "resize",
    resizeGame
);

window.addEventListener(
    "orientationchange",
    resizeGame
);


resizeGame();