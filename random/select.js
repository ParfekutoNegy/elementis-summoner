/* =========================================================
Elementis Summoner
Random Rule Selection
========================================================= */


/* =========================================================
通常ランダムルール開始
========================================================= */

function startRandomRule(mode){

    if(
        ![1, 2, 3].includes(mode)
    ){
        return;
    }

    console.log(
        "ランダムルール選択",
        mode
    );

    const url =
        "randomgame/index.html?mode=" + mode;

    location.href = url;

}


/* =========================================================
最低枚数設定を取得
========================================================= */

function getAllCardSettings(){

    const summon =
        Number(
            document.getElementById(
                "summon-min"
            ).value
        );

    const magia =
        Number(
            document.getElementById(
                "magia-min"
            ).value
        );

    const resist =
        Number(
            document.getElementById(
                "resist-min"
            ).value
        );

    return {
        summon,
        magia,
        resist
    };

}


/* =========================================================
最低枚数設定を確認
========================================================= */

function validateAllCardSettings(){

    const settings =
        getAllCardSettings();

    const values = [
        settings.summon,
        settings.magia,
        settings.resist
    ];

    //----------------------------------
    // 0～5の整数か確認
    //----------------------------------

    const validNumbers =
        values.every(
            value =>
                Number.isInteger(value) &&
                value >= 0 &&
                value <= 5
        );

    //----------------------------------
    // 最低枚数合計
    //----------------------------------

    const total =
        values.reduce(
            (sum, value) => sum + value,
            0
        );

    //----------------------------------
    // 表示要素
    //----------------------------------

    const summary =
        document.getElementById(
            "setting-summary"
        );

    const error =
        document.getElementById(
            "setting-error"
        );

    const startButton =
        document.getElementById(
            "all-card-start"
        );

    //----------------------------------
    // 設定値が不正な場合
    //----------------------------------

    if(!validNumbers){

        summary.textContent = "";

        error.textContent =
            "0～5の整数を選択してください。";

        startButton.disabled = true;

        return false;
    }

    //----------------------------------
    // 設定結果表示
    //----------------------------------

    summary.textContent =
        "最低保証 " + total +
        "枚 / 残り " +
        Math.max(0, 10 - total) +
        "枚はランダム";

    //----------------------------------
    // 合計10枚を超えた場合
    //----------------------------------

    if(total > 10){

        error.textContent =
            "最低枚数の合計は10枚以内にしてください。";

        startButton.disabled = true;

        return false;
    }

    //----------------------------------
    // 正常な設定
    //----------------------------------

    error.textContent = "";

    startButton.disabled = false;

    return true;

}


/* =========================================================
オールカード開始
========================================================= */

function startAllCardRule(){

    //----------------------------------
    // 設定確認
    //----------------------------------

    if(!validateAllCardSettings()){
        return;
    }

    //----------------------------------
    // 最低枚数取得
    //----------------------------------

    const settings =
        getAllCardSettings();

    //----------------------------------
    // URLパラメータ作成
    //----------------------------------

    const params =
        new URLSearchParams({

            mode: "4",

            summon:
                String(settings.summon),

            magia:
                String(settings.magia),

            resist:
                String(settings.resist)

        });

    console.log(
        "オールカード設定",
        settings
    );

    //----------------------------------
    // 対戦画面へ移動
    //----------------------------------

    location.href =
        "randomgame/index.html?" +
        params.toString();

}


/* =========================================================
初期化
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        //----------------------------------
        // プルダウンを取得
        //----------------------------------

        const selects =
            document.querySelectorAll(
                "#all-card-section select"
            );

        //----------------------------------
        // 選択変更時に設定確認
        //----------------------------------

        selects.forEach(select => {

            select.addEventListener(
                "change",
                validateAllCardSettings
            );

        });

        //----------------------------------
        // 初期表示
        //----------------------------------

        validateAllCardSettings();

    }
);