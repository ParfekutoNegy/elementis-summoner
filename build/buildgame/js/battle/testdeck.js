//==================================================
// ビルドルール
// CPUデッキ設定
//==================================================


//==================================================
// CPUデッキ一覧
//==================================================
//
// deckId
//   CPUデッキを識別するID
//
// name
//   デッキ名
//
// cardIds
//   CPUが使用する10枚のカードID
//
// strategy
//   CPUの行動パターン
//
//==================================================

//==================================================
// CPU固定デッキ一覧
//==================================================

const CPU_DECK_LIST = [


  /*{
        id: "cpu_test",
        name: "test用デッキ",
        regulation: "basic",
        strategy: "wind",

 cards: [
            51, 2, 6, 57,40,
            39, 64, 69, 85, 86
        ]
    },*/


   {
        id: "cpu_fire",
        name: "火属性デッキ",
        regulation: "basic",
        strategy: "fire",

        cards: [
            1, 2, 4, 6, 7,
            8, 16, 23, 24, 31
        ]
    },

    {
        id: "en-d",
        name: "えんD結論構築",
        regulation: "basic",
        strategy: "water",

        cards: [
            4, 19, 28, 29, 22,
            23, 7, 31, 16, 24
        ]
    },
    {
        id: "turoial",
        name: "サンプルデッキ",
        regulation: "basic",
        strategy: "water",

        cards: [
            1, 11, 20, 7, 6,
            5, 29, 31, 16, 32
        ]
    },

    {
        id: "cpu_wind",
        name: "風属性デッキ",
        regulation: "basic",
        strategy: "wind",

        cards: [
            10, 11, 12, 13, 5,
            29, 16, 24, 23, 31
        ]
    },
    {
        id:"fdgg",
        name:"ファイアドレイク・ガーゴイル",
        regulation:"all",
        cards: [
            34, 27, 58, 29, 7,
            46, 55, 23, 16, 48
        ]
    },
        {
        id:"ybc",
        name:"ワイバーンコントロール",
        regulation:"all",
        cards: [
            35, 92, 78, 29, 7,
            69, 23, 24, 31, 72
        ]
    },
            {
        id:"dragon",
        name:"赤茶",
        regulation:"all",
        cards: [
            4, 1, 28, 62, 6,
            7, 86, 31, 64,96
        ]
    },
                {
        id:"ワーウルフ",
        name:"ワーウルフ",
        regulation:"folklore",
        cards: [
            42, 41, 34, 47, 38,
            45, 46, 48, 63,39
        ]
    },
                {
        id:"風",
        name:"風",
        regulation:"all",
        cards: [
            42, 41, 10, 47, 45,
            13, 5, 48, 40,24
        ]
    },
    {
        id:"土",
        name:"土",
        regulation:"folklore",
        cards: [
            60, 59, 58, 57, 62,
            53, 55, 63, 64,40
        ]
    },
    {
        id:"20260618",
        name:"20260618ゴウ",
        regulation:"all",
        cards: [
            20, 26, 73, 41, 13,
            16, 31, 32, 79,24
        ]
    },
    {
        id:"20260210",
        name:"20260210プリン",
        regulation:"all",
        cards: [
            28, 3, 25, 1, 6,
            7, 86, 24, 31,16
        ]
    },
    {
        id:"20260424",
        name:"20260424プリン",
        regulation:"all",
        cards: [
            4, 35, 1, 11, 6,
            7, 86, 16, 24,31
        ]
    },



];


//==================================================
// CPU使用デッキ
//==================================================

let selectedCpuDeck = null;


//==================================================
// CPUデッキをランダム選択
// マッチ開始時に1回だけ実行
//==================================================

//==================================================
// CPUデッキをレギュレーション別にランダム選択
//==================================================

function selectRandomCpuDeck(
    regulation
){

    //----------------------------------
    // 対応デッキを抽出
    //----------------------------------

    const availableDecks =
        CPU_DECK_LIST.filter(
            deck =>
                deck.regulation === regulation
        );


    //----------------------------------
    // 対応デッキなし
    //----------------------------------

    if(availableDecks.length === 0){

        selectedCpuDeck = null;

        console.warn(
            "CPUデッキ未登録：",
            regulation
        );

        return false;

    }


    //----------------------------------
    // ランダム選択
    //----------------------------------

    const index =
        Math.floor(
            Math.random() *
            availableDecks.length
        );

    selectedCpuDeck =
        availableDecks[index];


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "================================"
    );

    console.log(
        "CPU使用デッキ決定"
    );

    console.log(
        "レギュレーション：",
        regulation
    );

    console.log(
        "候補デッキ数：",
        availableDecks.length
    );

    console.log(
        "デッキ名：",
        selectedCpuDeck.name
    );

    console.log(
        "デッキID：",
        selectedCpuDeck.id
    );

    console.log(
        "戦略：",
        selectedCpuDeck.strategy
    );

    console.log(
        "カードID：",
        selectedCpuDeck.cards
    );

    console.log(
        "================================"
    );


    return true;

}

//==================================================
// CPUデッキ取得
//==================================================

function getSelectedCpuDeck(){

    return selectedCpuDeck;

}


//==================================================
// CPU初期手札作成
//==================================================
//
// CPUデッキ10枚から10枚すべてを手札にする
//
// ※デッキ自体は固定なので、
//   2戦目以降も同じ10枚を使用する
//
//==================================================

function createEnemyTestHand(){

    //----------------------------------
    // CPUデッキ確認
    //----------------------------------

    if(!selectedCpuDeck){

        console.warn(
            "CPUデッキが選択されていません"
        );

        return [];

    }


    //----------------------------------
    // 固定デッキを取得
    //----------------------------------

    const ids =
        [...selectedCpuDeck.cards];


    console.log(
        "★ CPU使用デッキ：",
        selectedCpuDeck.name
    );

    console.log(
        "★ CPU初期手札ID：",
        ids
    );


    //----------------------------------
    // CPU使用済みカードを保存
    // ※ビルドルールでは2戦目以降も
    // 同じデッキなので基本的に使用しない
    //----------------------------------

    enemyStartingCardIds =
        [...ids];


    //----------------------------------
    // 手札生成
    //----------------------------------

    const hand = [];


    ids.forEach(id => {

        const cardData =
            CARD_LIST.find(
                card => card.id === id
            );


        if(!cardData){

            console.warn(
                "CPUカードが見つかりません",
                id
            );

            return;

        }


        const card =
            createCard(
                cardData,
                "enemyHand",
                ENEMY
            );


        hand.push(card);

    });


    return hand;

}


//==================================================
// CPUデッキの戦略取得
//==================================================

function getCpuStrategy(){

    if(!selectedCpuDeck){

        return null;

    }


    return selectedCpuDeck.strategy;

}


//==================================================
// CPUデッキID取得
//==================================================

function getCpuDeckId(){

    if(!selectedCpuDeck){

        return null;

    }


    return selectedCpuDeck.deckId;

}
