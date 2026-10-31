
/* =========================================================
Elementis Summoner
Challenge Mode Selection
========================================================= */


/* =========================================================
連勝記録を表示
========================================================= */

function displayChallengeRecord(){

    const currentElement =
        document.getElementById(
            "challenge-current"
        );

    const bestElement =
        document.getElementById(
            "challenge-best"
        );

    const nextInfo =
        document.getElementById(
            "challenge-next-info"
        );

    if(
        !currentElement ||
        !bestElement ||
        !nextInfo
    ){
        return;
    }

    //----------------------------------
    // 保存データ読み込み
    //----------------------------------

    let current = 0;
    let best = 0;

    try{

        const saved =
            localStorage.getItem(
                "elementisChallengeRecord"
            );

        if(saved){

            const data =
                JSON.parse(saved);

            current = Math.max(
                0,
                Math.floor(
                    Number(data.currentStreak) || 0
                )
            );

            best = Math.max(
                current,
                Math.floor(
                    Number(data.bestStreak) || 0
                )
            );

        }

    }catch(error){

        console.error(
            "チャレンジ記録読み込みエラー",
            error
        );

    }

    //----------------------------------
    // 記録表示
    //----------------------------------

    currentElement.textContent =
        current + "連勝";

    bestElement.textContent =
        best + "連勝";


    //----------------------------------
    // 次の対戦条件
    //----------------------------------

    let life = 5;

    if(current >= 20){

        life = 1;

    }else if(current >= 10){

        life = 3;

    }


    //----------------------------------
    // 先攻条件
    //----------------------------------

    const firstPlayer =
        current >= 30
            ? "相手"
            : "ランダム";


    //----------------------------------
    // 対戦条件表示
    //----------------------------------

    const conditionElement =
        document.getElementById(
            "challenge-next-condition"
        );

    if(conditionElement){

        conditionElement.textContent =
            "ライフ " +
            life +
            " / 先攻 " +
            firstPlayer;

    }


    //----------------------------------
    // 次の条件変更
    //----------------------------------

    let nextChange = null;

    if(current < 10){

        nextChange = 10;

    }else if(current < 20){

        nextChange = 20;

    }else if(current < 30){

        nextChange = 30;

    }


//----------------------------------
// 次の条件変更を表示
//----------------------------------

if(nextChange !== null){

    nextInfo.textContent =
        "次の対戦条件変更：" +
        nextChange +
        "連勝達成時";

}else{

    nextInfo.textContent =
        "次の対戦条件変更：なし";

}


}


/* =========================================================
チャレンジモード開始
========================================================= */

function startChallengeMode(){

    //----------------------------------
    // 保存済み連勝数を取得
    //----------------------------------

    let currentStreak = 0;

    try{

        const saved =
            localStorage.getItem(
                "elementisChallengeRecord"
            );

        if(saved){

            const record =
                JSON.parse(saved);

            currentStreak = Math.max(
                0,
                Math.floor(
                    Number(record.currentStreak) || 0
                )
            );

        }

    }catch(error){

        console.error(
            "チャレンジ記録読み込みエラー",
            error
        );

    }

    //----------------------------------
    // 連勝数に応じたライフ
    //----------------------------------

    let life = 5;

    if(currentStreak >= 20){

        life = 1;

    }else if(currentStreak >= 10){

        life = 3;

    }

    //----------------------------------
    // 30連勝以上でCPU先攻固定
    //----------------------------------

    const cpuFirst =
        currentStreak >= 30;

    //----------------------------------
    // バトル設定
    //----------------------------------

    const params =
        new URLSearchParams({

            mode: "4",

            challenge: "1",

            life: String(life),

            cpuFirst:
                cpuFirst ? "1" : "0",

            summon: "2",

            magia: "2",

            resist: "2"

        });

    //----------------------------------
    // 対戦画面へ移動
    //----------------------------------

    location.href =
        "../random/randomgame/index.html?" +
        params.toString();

}


/* =========================================================
初期表示
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    displayChallengeRecord
);


//==================================================
// チャレンジモード
// プレイヤー情報表示
//==================================================

function displayChallengePlayerInfo(){

    //----------------------------------
    // 表示要素取得
    //----------------------------------

    const iconElement =
        document.getElementById(
            "challenge-player-icon"
        );

    const nameElement =
        document.getElementById(
            "challenge-player-name"
        );

    if(!iconElement || !nameElement){
        return;
    }


    //----------------------------------
    // 初期値
    //----------------------------------

    let playerName = "";
    let playerIcon = null;


    //----------------------------------
    // 保存済み設定を取得
    //----------------------------------

    try{

        const saved =
            localStorage.getItem(
                "elementisPlayerSettings"
            );

        if(saved){

            const settings =
                JSON.parse(saved);

            //----------------------------------
            // プレイヤーネーム
            //----------------------------------

            if(
                typeof settings.playerName ===
                "string"
            ){

                playerName =
                    settings.playerName.trim();

            }


            //----------------------------------
            // プレイヤーアイコン
            //----------------------------------

            if(
                Number.isInteger(
                    settings.playerIcon
                ) &&
                settings.playerIcon >= 1 &&
                settings.playerIcon <= 16
            ){

                playerIcon =
                    settings.playerIcon;

            }

        }

    }catch(error){

        console.error(
            "プレイヤー情報読み込みエラー",
            error
        );

    }


    //----------------------------------
    // プレイヤーネーム表示
    //----------------------------------

    nameElement.textContent =
        playerName || "ゲスト";


    //----------------------------------
    // アイコン未設定ならランダム
    //----------------------------------

    if(playerIcon === null){

        playerIcon =
            Math.floor(
                Math.random() * 16
            ) + 1;

    }


    //----------------------------------
    // アイコン番号を2桁にする
    //----------------------------------

    const iconNumber =
        String(playerIcon).padStart(
            2,
            "0"
        );


    //----------------------------------
    // プレイヤーアイコン表示
    //----------------------------------

    iconElement.src =
        "../images/ui/character-" +
        iconNumber +
        ".png";

}


//==================================================
// 画面読み込み時に実行
//==================================================

document.addEventListener(
    "DOMContentLoaded",
    displayChallengePlayerInfo
);
