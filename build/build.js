
// ============================================================
// ビルドルール
// ============================================================


// ============================================================
// 状態
// ============================================================

let savedDecks = {};

let selectedDeckId = null;

let selectedRegulation = "all";

let selectedLife = 5;

// ============================================================
// 初期化
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeBuildScreen();

    }
);


// ============================================================
// 初期化
// ============================================================

function initializeBuildScreen(){

    const regulationSelect =
        document.getElementById(
            "regulation-select"
        );

    const lifeSelect =
        document.getElementById(
            "life-select"
        );


    // ----------------------------------------
    // レギュレーション変更
    // ----------------------------------------

    regulationSelect.addEventListener(
        "change",
        () => {

            selectedRegulation =
                regulationSelect.value;

            selectedDeckId = null;

            updateLifeOptions();

            updateDeckList();

            updateStartButton();

        }
    );


    // ----------------------------------------
    // ライフ変更
    // ----------------------------------------

    lifeSelect.addEventListener(
        "change",
        () => {

            selectedLife =
                Number(
                    lifeSelect.value
                );

            updateStartButton();

        }
    );


    selectedRegulation =
        regulationSelect.value;


    selectedLife =
        Number(
            lifeSelect.value
        );


    // 初期状態
    updateLifeOptions();

    loadSavedDecks();

}


// ============================================================
// ライフ選択更新
// ============================================================

function updateLifeOptions(){

    const lifeSelect =
        document.getElementById(
            "life-select"
        );

    const lifeDescription =
        document.getElementById(
            "life-description"
        );


    // ----------------------------------------
    // オールカード
    // ----------------------------------------

    if(
        selectedRegulation === "all"
    ){

        lifeSelect.value = "5";

        lifeSelect.disabled = true;

        selectedLife = 5;

        lifeDescription.textContent =
            "オールカードではライフ5固定";

        return;

    }


    // ----------------------------------------
    // その他のレギュレーション
    // ----------------------------------------

    lifeSelect.disabled = false;

    lifeDescription.textContent =
        "ライフ1～5から選択できます";


    // 現在値が範囲外なら5へ
    const currentLife =
        Number(
            lifeSelect.value
        );


    if(
        currentLife < 1 ||
        currentLife > 5
    ){

        lifeSelect.value = "5";

    }


    selectedLife =
        Number(
            lifeSelect.value
        );

}


// ============================================================
// 保存デッキ取得
// ============================================================

function loadSavedDecks(){

    try {

        savedDecks =
            JSON.parse(
                localStorage.getItem("decks")
            ) || {};

    } catch(error) {

        console.error(
            "デッキデータ読み込みエラー:",
            error
        );

        savedDecks = {};

    }


    // ========================================================
    // 存在しない空デッキを整理
    // ========================================================

    let changed = false;


    for(const deckId of Object.keys(savedDecks)){

        const deck =
            savedDecks[deckId];


        // デッキデータそのものがない
        if(!deck){

            delete savedDecks[deckId];

            changed = true;

            continue;

        }


        // メインデッキが存在しない
        if(!Array.isArray(deck.main)){

            delete savedDecks[deckId];

            changed = true;

            continue;

        }


        // メインデッキが0枚
        if(deck.main.length === 0){

            delete savedDecks[deckId];

            changed = true;

            continue;

        }

    }


    // ========================================================
    // 整理後のデータを保存
    // ========================================================

    if(changed){

        localStorage.setItem(
            "decks",
            JSON.stringify(savedDecks)
        );

    }


    updateDeckList();

}


function updateDeckList(){

    const area =
        document.getElementById(
            "saved-decks"
        );

    const deckCount =
        document.getElementById(
            "deck-count"
        );


    area.innerHTML = "";


    const decks =
        Object.values(savedDecks)
        .sort(
            (a, b) =>
                (b.updatedAt || 0) -
                (a.updatedAt || 0)
        );


    deckCount.textContent =
        `${decks.length}個のデッキ`;


    // ========================================================
    // デッキがない場合
    // ========================================================

    if(
        decks.length === 0
    ){

        area.innerHTML = `
            <div id="empty-message">

                <p>
                    保存されているデッキがありません。
                </p>

                <p>
                    「デッキ構築」から
                    デッキを作成してください。
                </p>

            </div>
        `;

        return;

    }


    // ========================================================
    // デッキ一覧
    // ========================================================

    for(
        const deck of decks
    ){

        // ----------------------------------------------------
        // レギュレーション判定
        // ----------------------------------------------------

        const result =
            checkDeckLegality(
                deck,
                selectedRegulation
            );


        // ----------------------------------------------------
        // デッキ画像
        // ----------------------------------------------------

        const card =
            getDeckThumbnail(
                deck
            );


        // ----------------------------------------------------
        // デッキ要素
        // ----------------------------------------------------

        const deckElement =
            document.createElement(
                "div"
            );


        deckElement.className =
            "saved-deck-card";


        // ----------------------------------------------------
        // 使用可能 / 使用不可
        // ----------------------------------------------------

        if(
            result.status === "legal"
        ){

            deckElement.classList.add(
                "selectable"
            );

        }else{

            deckElement.classList.add(
                "illegal"
            );

        }


        // ----------------------------------------------------
        // 選択中
        // ----------------------------------------------------

        if(
            selectedDeckId &&
            selectedDeckId === deck.id
        ){

            deckElement.classList.add(
                "selected"
            );

        }


        // ----------------------------------------------------
        // 表示用データ
        // ----------------------------------------------------

        const statusText =
            getStatusText(
                result
            );


        const mainCount =
            Array.isArray(deck.main)
                ? deck.main.length
                : 0;


        const sideCount =
            Array.isArray(deck.side)
                ? deck.side.length
                : 0;


        const reasonText =
            getReasonText(
                result
            );


        // ====================================================
        // HTML
        // ====================================================

        deckElement.innerHTML = `

            <img
                src="${card}"
                class="saved-deck-thumbnail"
                alt="デッキ画像">


            <div class="deck-info">

                <div class="saved-deck-name">

                    ${escapeHtml(
                        deck.name ||
                        "無名デッキ"
                    )}

                </div>


                <div
                    class="deck-status ${result.status}">

                    ${statusText}

                </div>


                <div class="deck-reason">

                    メイン：
                    ${mainCount}/10

                    <br>

                    サイド：
                    ${sideCount}/3

                    <br>

                    ${reasonText}

                </div>


                <div class="deck-buttons">

                    ${
                        result.status === "legal"
                        ? `
                            <button
                                type="button"
                                class="deck-select-button">

                                ${
                                    selectedDeckId === deck.id
                                        ? "選択中"
                                        : "このデッキを選択"
                                }

                            </button>
                        `
                        : `
                            <div
                                class="deck-select-label">

                                選択不可

                            </div>
                        `
                    }


                    <button
                        type="button"
                        class="deck-list-view-button">

                        デッキリストを見る

                    </button>

                </div>

            </div>

        `;


        // ====================================================
        // デッキ選択ボタン
        // ====================================================

        const selectButton =
            deckElement.querySelector(
                ".deck-select-button"
            );


        if(
            selectButton
        ){

            selectButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    selectDeck(
                        deck.id
                    );

                }
            );

        }


        // ====================================================
        // デッキリスト表示ボタン
        // ====================================================

        const listButton =
            deckElement.querySelector(
                ".deck-list-view-button"
            );


        if(
            listButton
        ){

            listButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    openDeckListModal(
                        deck.id
                    );

                }
            );

        }


        // ====================================================
        // デッキ要素を一覧へ追加
        // ====================================================

        area.appendChild(
            deckElement
        );

    }

}


// ============================================================
// デッキサムネイル
// ============================================================

function getDeckThumbnail(deck){

    const firstCardId =
        Array.isArray(deck.main)
            ? deck.main[0]
            : null;


    // ----------------------------------------
    // 先頭カードがない
    // ----------------------------------------

    if(
        firstCardId === null ||
        firstCardId === undefined
    ){

        return "../deck/images/noimage.jpg";

    }


    // ----------------------------------------
    // カード検索
    // ----------------------------------------

    const card =
        cards.find(
            c =>
                Number(c.id) ===
                Number(firstCardId)
        );


    // ----------------------------------------
    // カードが見つからない
    // ----------------------------------------

    if(!card){

        return "../deck/images/noimage.jpg";

    }


    // ----------------------------------------
    // カード画像
    // ----------------------------------------

    return getBuildCardImagePath(
        card.image
    );

}


// ============================================================
// デッキ合法性判定
// ============================================================

function checkDeckLegality(
    deck,
    regulation
){

    // ----------------------------------------
    // デッキデータ確認
    // ----------------------------------------

    if(!deck){

        return {
            status: "illegal",
            reason:
                "デッキデータがありません"
        };

    }


    // ----------------------------------------
    // メインデッキ確認
    // ----------------------------------------

    if(
        !Array.isArray(deck.main)
    ){

        return {
            status: "illegal",
            reason:
                "メインデッキがありません"
        };

    }


    if(
        deck.main.length !== 10
    ){

        return {
            status: "illegal",
            reason:
                "メインデッキを10枚にしてください"
        };

    }


    // ----------------------------------------
    // サイドデッキ確認
    // ----------------------------------------

    if(
        !Array.isArray(deck.side)
    ){

        return {
            status: "illegal",
            reason:
                "サイドデッキデータがありません"
        };

    }


    if(
        deck.side.length > 3
    ){

        return {
            status: "illegal",
            reason:
                "サイドデッキは3枚までです"
        };

    }


    // ----------------------------------------
    // 判定対象
    // ----------------------------------------
    //
    // candidate は「検討中」なので
    // 合法性判定には含めません。
    //

    const deckCards = [
        ...deck.main,
        ...deck.side
    ];


    // ----------------------------------------
    // カード確認
    // ----------------------------------------

    for(
        const cardId of deckCards
    ){

        const card =
            cards.find(
                c =>
                    Number(c.id) ===
                    Number(cardId)
            );


        // カードが存在しない
        if(!card){

            return {
                status: "illegal",
                reason:
                    `カードID ${cardId} が存在しません`
            };

        }


        // ------------------------------------
        // オールカード
        // ------------------------------------

        if(
            regulation === "all"
        ){

            continue;

        }


// ------------------------------------
// シリーズ判定
// ------------------------------------

// 001～010 は promo でも
// ベーシックでは使用可能
const basicPromoException =
    regulation === "basic" &&
    Number(card.id) >= 1 &&
    Number(card.id) <= 10;


// 例外カードではない場合だけ
// 通常のシリーズ判定を行う

if(
    !basicPromoException &&
    card.series !== regulation
){

    return {
        status: "illegal",

        reason:
            "対象外カードが入っています"
    };

}

    }


    // ----------------------------------------
    // 使用可能
    // ----------------------------------------

    return {
        status: "legal",

        reason:
            `${getRegulationName(regulation)}で使用できます`
    };

}


// ============================================================
// シリーズ名
// ============================================================

function getSeriesName(series){

    switch(series){

        case "basic":
            return "ベーシック";

        case "folklore":
            return "フォークロア";

        case "mythology":
            return "ミソロジー";

        case "promo":
            return "プロモ";

        default:
            return series || "不明";

    }

}


// ============================================================
// レギュレーション名
// ============================================================

function getRegulationName(regulation){

    switch(regulation){

        case "all":
            return "オールカード";

        case "basic":
            return "ベーシック";

        case "folklore":
            return "フォークロア";

        case "mythology":
            return "ミソロジー";

        default:
            return regulation;

    }

}


// ============================================================
// 状態表示
// ============================================================

function getStatusText(result){

    if(
        result.status === "legal"
    ){

        return "○ 使用可能";

    }


    if(
        result.status === "unknown"
    ){

        return "△ 判定保留";

    }


    return "× 使用不可";

}


function getReasonText(result){

    return escapeHtml(
        result.reason || ""
    );

}


// ============================================================
// デッキ選択
// ============================================================

function selectDeck(deckId){

    const deck =
        savedDecks[deckId];


    if(!deck){

        return;

    }


    const result =
        checkDeckLegality(
            deck,
            selectedRegulation
        );


    if(
        result.status !== "legal"
    ){

        return;

    }


    selectedDeckId =
        deckId;


    updateDeckList();

    updateStartButton();

}


// ============================================================
// ゲーム開始ボタン更新
// ============================================================

function updateStartButton(){

    const button =
        document.getElementById(
            "start-game-button"
        );

    const message =
        document.getElementById(
            "selected-deck-message"
        );


    if(!selectedDeckId){

        button.disabled = true;

        message.textContent =
            "デッキを選択してください";

        return;

    }


    const deck =
        savedDecks[
            selectedDeckId
        ];


    if(!deck){

        selectedDeckId = null;

        button.disabled = true;

        message.textContent =
            "デッキを選択してください";

        return;

    }


    const result =
        checkDeckLegality(
            deck,
            selectedRegulation
        );


    if(
        result.status !== "legal"
    ){

        selectedDeckId = null;

        button.disabled = true;

        message.textContent =
            "選択したデッキは使用できません";

        return;

    }


    button.disabled = false;


    message.textContent =
        `選択中：${deck.name || "無名デッキ"}`;

}


// ============================================================
// ゲーム開始
// ============================================================

function startBuildGame(){

    if(!selectedDeckId){

        alert(
            "使用するデッキを選択してください。"
        );

        return;

    }


    const deck =
        savedDecks[
            selectedDeckId
        ];


    if(!deck){

        alert(
            "選択したデッキが見つかりません。"
        );

        return;

    }


    const legality =
        checkDeckLegality(
            deck,
            selectedRegulation
        );


    if(
        legality.status !== "legal"
    ){

        alert(
            "このデッキは現在の条件では使用できません。"
        );

        return;

    }


    // オールカードは必ずライフ5
    if(
        selectedRegulation === "all"
    ){

        selectedLife = 5;

    }


    // ========================================================
    // ゲーム開始設定
    // ========================================================

    const gameSettings = {

        rule: "build",

        regulation:
            selectedRegulation,

        life:
            selectedLife,

        playerDeckId:
            selectedDeckId,

        savedAt:
            Date.now()

    };


    localStorage.setItem(
        "currentGameSettings",
        JSON.stringify(
            gameSettings
        )
    );


    console.log(
        "ビルドルール ゲーム開始設定",
        gameSettings
    );


    // ========================================================
    // ゲーム画面へ
    // ========================================================

    window.location.href =
        "./buildgame/index.html";

}


// ============================================================
// ホームへ戻る
// ============================================================

function backToHome(){

    window.location.href =
        "../index.html";

}


// ============================================================
// HTMLエスケープ
// ============================================================

function escapeHtml(value){

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// build画面用カード画像パス
// ============================================================

function getBuildCardImagePath(imagePath){

    if(!imagePath){

        return "../deck/images/noimage.jpg";

    }


    // ----------------------------------------
    // images/ から始まる場合
    // ----------------------------------------

    if(
        imagePath.startsWith("images/")
    ){

        return "../deck/" + imagePath;

    }


    // ----------------------------------------
    // 画像ファイル名だけの場合
    // ----------------------------------------

    if(
        !imagePath.startsWith("../") &&
        !imagePath.startsWith("/") &&
        !imagePath.startsWith("http") &&
        !imagePath.startsWith("data:")
    ){

        return "../deck/images/" + imagePath;

    }


    return imagePath;

}

// ============================================================
// デッキリストモーダルを開く
// ============================================================

function openDeckListModal(deckId){

    const deck =
        savedDecks[deckId];


    if(!deck){

        console.warn(
            "デッキが見つかりません:",
            deckId
        );

        return;

    }


    // ========================================================
    // タイトル
    // ========================================================

    const title =
        document.getElementById(
            "deck-list-modal-title"
        );


    title.textContent =
        deck.name ||
        "無名デッキ";


    // ========================================================
    // 表示エリア
    // ========================================================

    const mainArea =
        document.getElementById(
            "modal-main-deck"
        );


    const sideArea =
        document.getElementById(
            "modal-side-deck"
        );


    mainArea.innerHTML = "";

    sideArea.innerHTML = "";


    // ========================================================
    // デッキ取得
    // ========================================================

    const mainCards =
        Array.isArray(deck.main)
            ? deck.main
            : [];


    const sideCards =
        Array.isArray(deck.side)
            ? deck.side
            : [];

    // ========================================================
    // メインデッキ表示
    // ========================================================

    renderDeckListCards(
        mainCards,
        mainArea
    );


    // ========================================================
    // サイドデッキ表示
    // ========================================================

    renderDeckListCards(
        sideCards,
        sideArea
    );


    // ========================================================
    // モーダル表示
    // ========================================================

    const modal =
        document.getElementById(
            "deck-list-modal"
        );


    modal.style.display =
        "flex";

}


// ============================================================
// デッキリストのカード表示
// ============================================================

function renderDeckListCards(
    cardIds,
    area
){

    if(
        !Array.isArray(cardIds) ||
        cardIds.length === 0
    ){

        area.innerHTML = `
            <div class="modal-empty-message">
                カードがありません
            </div>
        `;

        return;

    }


    for(
        const cardId of cardIds
    ){

        const card =
            cards.find(
                c =>
                    Number(c.id) ===
                    Number(cardId)
            );


        // 存在しないカードは表示しない
        if(!card){

            continue;

        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "modal-card-item";


        // ----------------------------------------------------
        // カード画像
        // ----------------------------------------------------

        const image =
            document.createElement(
                "img"
            );


        image.src =
            getBuildCardImagePath(
                card.image
            );


        image.alt =
            card.name ||
            "";


        // ----------------------------------------------------
        // カード画像だけ追加
        // ----------------------------------------------------

        wrapper.appendChild(
            image
        );


        area.appendChild(
            wrapper
        );

    }

}

// ============================================================
// デッキリストモーダルを閉じる
// ============================================================

function closeDeckListModal(){

    const modal =
        document.getElementById(
            "deck-list-modal"
        );


    if(!modal){

        return;

    }


    modal.style.display =
        "none";

}