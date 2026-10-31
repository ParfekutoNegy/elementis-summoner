
/* =========================================================
Elementis Summoner
Player Settings
========================================================= */

const PLAYER_SETTINGS_KEY =
    "elementisPlayerSettings";

let selectedPlayerIcon = null;


/* =========================================================
プレイヤーネーム文字数制限
全角10文字相当 / 半角20文字相当
========================================================= */

const PLAYER_NAME_MAX_LENGTH = 20;


/* =========================================================
文字数を計算
半角 = 1 / 全角 = 2
========================================================= */

function getPlayerNameLength(text){

    let length = 0;

    for(const char of text){

        const code =
            char.codePointAt(0);

        const isHalfWidth =
            code <= 0x7E ||
            (code >= 0xFF61 && code <= 0xFF9F);

        length +=
            isHalfWidth ? 1 : 2;

    }

    return length;

}


/* =========================================================
文字数制限を適用
========================================================= */

function limitPlayerName(text){

    let result = "";
    let length = 0;

    for(const char of text){

        const code =
            char.codePointAt(0);

        const isHalfWidth =
            code <= 0x7E ||
            (code >= 0xFF61 && code <= 0xFF9F);

        const charLength =
            isHalfWidth ? 1 : 2;

        if(
            length + charLength >
            PLAYER_NAME_MAX_LENGTH
        ){
            break;
        }

        result += char;
        length += charLength;

    }

    return result;

}



/* =========================================================
保存済み設定を取得
========================================================= */

function loadPlayerSettings(){

    try{

        const saved =
            localStorage.getItem(
                PLAYER_SETTINGS_KEY
            );

        if(saved){

            const data =
                JSON.parse(saved);

            return {
                playerName:
                    typeof data.playerName === "string"
                        ? data.playerName
                        : "",

                playerIcon:
                    Number.isInteger(data.playerIcon) &&
                    data.playerIcon >= 1 &&
                    data.playerIcon <= 16
                        ? data.playerIcon
                        : null
            };

        }

    }catch(error){

        console.error(
            "設定読み込みエラー",
            error
        );

    }

    return {
        playerName: "",
        playerIcon: null
    };

}


/* =========================================================
アイコン選択状態を更新
========================================================= */

function updateIconSelection(){

    document.querySelectorAll(
        ".player-icon-option"
    ).forEach(button => {

        const iconNumber =
            Number(button.dataset.icon);

        const isSelected =
            iconNumber === selectedPlayerIcon;

        button.classList.toggle(
            "selected",
            isSelected
        );

        button.setAttribute(
            "aria-pressed",
            String(isSelected)
        );

    });

    const randomButton =
        document.getElementById(
            "icon-random"
        );

    randomButton.classList.toggle(
        "selected",
        selectedPlayerIcon === null
    );

}


/* =========================================================
アイコン一覧を作成
========================================================= */

function createIconGrid(){

    const grid =
        document.getElementById(
            "icon-grid"
        );

    grid.innerHTML = "";

    for(let i = 1; i <= 16; i++){

        const number =
            String(i).padStart(2, "0");

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "player-icon-option";

        button.dataset.icon =
            String(i);

        button.setAttribute(
            "aria-label",
            "アイコン " + number
        );

        const image =
            document.createElement("img");

        image.src =
            "../images/ui/character-" +
            number +
            ".png";

        image.alt =
            "プレイヤーアイコン " + number;

        image.loading = "lazy";

        button.appendChild(image);

        button.addEventListener(
            "click",
            () => {

                selectedPlayerIcon = i;

                updateIconSelection();

            }
        );

        grid.appendChild(button);

    }

}



/* =========================================================
設定を保存
========================================================= */

function savePlayerSettings(){

    const nameInput =
        document.getElementById(
            "player-name"
        );

    //----------------------------------
    // プレイヤーネームを制限
    //----------------------------------

    const playerName =
        limitPlayerName(
            nameInput.value.trim()
        );

    nameInput.value = playerName;

    //----------------------------------
    // 保存データ
    //----------------------------------

    const data = {
        playerName,
        playerIcon: selectedPlayerIcon
    };

    try{

        localStorage.setItem(
            PLAYER_SETTINGS_KEY,
            JSON.stringify(data)
        );

        document.getElementById(
            "settings-message"
        ).textContent =
            "設定を保存しました。";

    }catch(error){

        console.error(
            "設定保存エラー",
            error
        );

        document.getElementById(
            "settings-message"
        ).textContent =
            "設定を保存できませんでした。";

    }

}



/* =========================================================
初期化
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const settings =
            loadPlayerSettings();


        //----------------------------------
        // プレイヤーネーム初期表示
        //----------------------------------

        const nameInput =
            document.getElementById(
                "player-name"
            );

        nameInput.value =
            limitPlayerName(
                settings.playerName
            );


        //----------------------------------
        // 入力中の文字数制限
        //----------------------------------

        let isComposing = false;

        nameInput.addEventListener(
            "compositionstart",
            () => {

                isComposing = true;

            }
        );

        nameInput.addEventListener(
            "compositionend",
            () => {

                isComposing = false;

                nameInput.value =
                    limitPlayerName(
                        nameInput.value
                    );

            }
        );

        nameInput.addEventListener(
            "input",
            () => {

                if(isComposing){
                    return;
                }

                nameInput.value =
                    limitPlayerName(
                        nameInput.value
                    );

            }
        );


        selectedPlayerIcon =
            settings.playerIcon;

        createIconGrid();

        updateIconSelection();

        document.getElementById(
            "icon-random"
        ).addEventListener(
            "click",
            () => {

                selectedPlayerIcon = null;

                updateIconSelection();

            }
        );

        document.getElementById(
            "save-settings"
        ).addEventListener(
            "click",
            savePlayerSettings
        );

    }
);
