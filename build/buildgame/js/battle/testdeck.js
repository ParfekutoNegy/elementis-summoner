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

    {
        id: "cpu_fire",
        name: "火属性デッキ",
        strategy: "fire",

        cards: [
            1, 2, 4, 6, 7,
            8, 16, 23, 24, 31
        ]
    },

    {
        id: "en-d",
        name: "えんD結論構築",
        strategy: "water",

        cards: [
            4, 19, 28, 29, 22,
            23, 7, 31, 16, 24
        ]
    },

    {
        id: "cpu_wind",
        name: "風属性デッキ",
        strategy: "wind",

        cards: [
            10, 11, 12, 13, 5,
            29, 16, 24, 23, 31
        ]
    }

];


//==================================================
// CPU使用デッキ
//==================================================

let selectedCpuDeck = null;


//==================================================
// CPUデッキをランダム選択
// マッチ開始時に1回だけ実行
//==================================================

function selectRandomCpuDeck(){

    //----------------------------------
    // CPUデッキをランダム選択
    //----------------------------------

    const index =
        Math.floor(
            Math.random() *
            CPU_DECK_LIST.length
        );

    selectedCpuDeck =
        CPU_DECK_LIST[index];


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
