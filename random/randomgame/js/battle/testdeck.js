//==================================================
// テスト用プレイヤー手札
//==================================================

/*function createTestHand(){

    const ids = [
        1,9,27,32,
        26,4,5,
        6,7,8,
    ];

    const hand = [];

    for(const id of ids){

        const cardData =
        CARD_LIST.find(
            card => card.id === id
        );

        if(cardData){

            hand.push(
                createCard(
                    cardData,
                    "hand",
                    PLAYER
                )
            );

        }

    }

    return hand;
}

//==================================================
// テスト用CPU手札
//==================================================

function createEnemyTestHand(){

    const ids = [
        27,3,6,7,
        1,32,31,30,
        31,32
    ];

    const hand = [];

    for(const id of ids){

        const cardData =
        CARD_LIST.find(
            card => card.id === id
        );

        if(cardData){

            hand.push(
                createCard(
                    cardData,
                    "enemyHand",
                    ENEMY
                )
            );

        }

    }

    return hand;
}*/

//======================================
// ランダムルール設定
//======================================

// 1 = ID1～32
// 2 = ID33～64
// 3 = ID65～96
// 4 = ID1～96（後で実装）
//======================================
// URLからランダムルール設定を取得
//======================================

const randomRuleParams =
    new URLSearchParams(
        window.location.search
    );

const requestedRandomRuleMode =
    Number(
        randomRuleParams.get("mode") || 1
    );

let randomRuleMode =
    [1, 2, 3, 4].includes(
        requestedRandomRuleMode
    )
        ? requestedRandomRuleMode
        : 1;


//======================================
// オールカード最低枚数設定
//======================================

const allCardMinimums = {

    summon:
        Number(
            randomRuleParams.get("summon") ?? 2
        ),

    magia:
        Number(
            randomRuleParams.get("magia") ?? 2
        ),

    resist:
        Number(
            randomRuleParams.get("resist") ?? 2
        )

};


console.log(
    "★ ランダムルールモード",
    randomRuleMode
);

console.log(
    "★ オールカード最低枚数",
    allCardMinimums
);


//======================================
// 使用するカードID範囲を取得
//======================================

function getRandomRuleRange(){

    switch(randomRuleMode){

        case 2:
            return {
                min: 33,
                max: 64
            };

        case 3:
            return {
                min: 65,
                max: 96
            };

        case 4:
            return {
                min: 1,
                max: 96
            };

        case 1:
        default:
            return {
                min: 1,
                max: 32
            };
    }
}


//======================================
// ランダムカードID取得
//
// モード1～3：従来のランダム抽選
// モード4：種類別最低枚数を保証
//======================================

function getRandomCardIds(
    count = 10,
    excludeIds = []
){

    //----------------------------------
    // 現在のルールのカード範囲
    //----------------------------------

    const range =
        getRandomRuleRange();

    //----------------------------------
    // 使用可能カード一覧
    //----------------------------------

    const availableCards =
        CARD_LIST.filter(card => {

            const id =
                Number(card.id);

            return (
                id >= range.min &&
                id <= range.max &&
                !excludeIds.includes(id)
            );

        });


    //----------------------------------
    // シャッフル関数
    //----------------------------------

    function shuffleCards(cards){

        const result =
            [...cards];

        for(
            let i = result.length - 1;
            i > 0;
            i--
        ){

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                result[i],
                result[j]
            ] = [
                result[j],
                result[i]
            ];
        }

        return result;
    }


    //----------------------------------
    // 通常ランダム
    // ベーシック・フォークロア・ミソロジー
    //----------------------------------

    if(randomRuleMode !== 4){

        return shuffleCards(
            availableCards
        )
        .slice(0, count)
        .map(card => Number(card.id));
    }


    //==================================
    // オールカード
    //==================================

    const minimums = {

        "サモン":
            allCardMinimums.summon,

        "マギア":
            allCardMinimums.magia,

        "レジスト":
            allCardMinimums.resist
    };


    //----------------------------------
    // 設定値確認
    //----------------------------------

    const minimumTotal =
        Object.values(minimums)
            .reduce(
                (sum, value) => sum + value,
                0
            );

    if(minimumTotal > count){

        console.error(
            "最低枚数の合計がデッキ枚数を超えています",
            minimums
        );

        return [];
    }


    //----------------------------------
    // 種類別に最低枚数を確保
    //----------------------------------

    const selectedCards = [];

    const selectedIds =
        new Set();


    for(const type of [
        "サモン",
        "マギア",
        "レジスト"
    ]){

        const minimum =
            minimums[type];

        const candidates =
            shuffleCards(
                availableCards.filter(
                    card =>
                        card.type === type
                )
            );

        if(candidates.length < minimum){

            console.error(
                "必要なカードが不足しています",
                {
                    type,
                    minimum,
                    available:
                        candidates.length
                }
            );

            return [];
        }

        const chosen =
            candidates.slice(
                0,
                minimum
            );

        chosen.forEach(card => {

            selectedCards.push(card);

            selectedIds.add(
                Number(card.id)
            );

        });
    }


    //----------------------------------
    // 残りのカードをランダム抽選
    //----------------------------------

    const remainingCount =
        count - selectedCards.length;

    const remainingCandidates =
        shuffleCards(
            availableCards.filter(
                card =>
                    !selectedIds.has(
                        Number(card.id)
                    )
            )
        );

    const additionalCards =
        remainingCandidates.slice(
            0,
            remainingCount
        );

    selectedCards.push(
        ...additionalCards
    );


    //----------------------------------
    // 最終的に順番をシャッフル
    //----------------------------------

    const finalCards =
        shuffleCards(
            selectedCards
        );

    const ids =
        finalCards.map(
            card => Number(card.id)
        );


    //----------------------------------
    // デバッグログ
    //----------------------------------

    console.log(
        "★ オールカード抽選結果",
        {
            minimums,

            ids,

            summon:
                finalCards.filter(
                    card =>
                        card.type === "サモン"
                ).length,

            magia:
                finalCards.filter(
                    card =>
                        card.type === "マギア"
                ).length,

            resist:
                finalCards.filter(
                    card =>
                        card.type === "レジスト"
                ).length
        }
    );


    return ids;
}


//======================================
// プレイヤー初期手札
//======================================

function createTestHand(){

    //----------------------------------
    // 32枚からランダムに10枚
    //----------------------------------

    const ids =
        getRandomCardIds(
            10,
            []
        );


    console.log(
        "★ プレイヤー第1戦初期手札ID",
        ids
    );


    //----------------------------------
    // 第1戦で使用した10枚を保存
    //----------------------------------

    playerStartingCardIds =
        [...ids];


    console.log(
        "★ プレイヤー使用済みIDを保存",
        playerStartingCardIds
    );


    const hand = [];


    //----------------------------------
    // カード作成
    //----------------------------------

    ids.forEach(id=>{

        const cardData =
            CARD_LIST.find(
                card => card.id === id
            );


        if(!cardData){

            console.warn(
                "プレイヤーカードが見つかりません",
                id
            );

            return;

        }


        const card =
            createCard(
                cardData,
                "hand",
                PLAYER
            );


        hand.push(card);

    });


    return hand;

}

//======================================
// 2戦目以降の初期手札
// 使用済み開始手札を除外
//======================================

function createNextGameHand(owner){

    //----------------------------------
    // 使用済みカードID取得
    //----------------------------------

    const usedIds =
        owner === PLAYER
            ? playerStartingCardIds
            : enemyStartingCardIds;

    //----------------------------------
    // 使用可能カードID
    //----------------------------------

    const range =
        getRandomRuleRange();

    const availableIds = [];

    for(
        let id = range.min;
        id <= range.max;
        id++
    ){

        if(usedIds.includes(id)){
            continue;
        }

        const exists =
            CARD_LIST.some(
                card =>
                    Number(card.id) === id
            );

        if(!exists){
            continue;
        }

        availableIds.push(id);
    }

    console.log(
        owner === PLAYER
            ? "★ プレイヤー使用済みID"
            : "★ CPU使用済みID",
        [...usedIds]
    );

    console.log(
        owner === PLAYER
            ? "★ プレイヤー残りカードID"
            : "★ CPU残りカードID",
        [...availableIds]
    );

    //----------------------------------
    // 次戦の10枚をランダム取得
    //----------------------------------

    const ids =
        getRandomCardIds(
            10,
            usedIds
        );

    console.log(
        owner === PLAYER
            ? "★ プレイヤー次戦初期手札ID"
            : "★ CPU次戦初期手札ID",
        ids
    );

    //----------------------------------
    // カード生成
    //----------------------------------

    const hand = [];

    ids.forEach(id => {

        const cardData =
            CARD_LIST.find(
                card =>
                    Number(card.id) === id
            );

        if(!cardData){

            console.warn(
                "次戦カードが見つかりません",
                id
            );

            return;
        }

        const card =
            createCard(
                cardData,

                owner === PLAYER
                    ? "hand"
                    : "enemyHand",

                owner
            );

        hand.push(card);
    });

    //----------------------------------
    // 今回使用したIDを保存
    //----------------------------------

    usedIds.push(...ids);

    console.log(
        owner === PLAYER
            ? "★ プレイヤー使用済みID更新"
            : "★ CPU使用済みID更新",
        [...usedIds]
    );

    return hand;
}



//======================================
// CPU初期手札
//======================================

function createEnemyTestHand(){

    //----------------------------------
    // 32枚からランダムに10枚
    //----------------------------------

    const ids =
        getRandomCardIds(
            10,
            []
        );


    console.log(
        "★ CPU第1戦初期手札ID",
        ids
    );


    //----------------------------------
    // 第1戦で使用した10枚を保存
    //----------------------------------

    enemyStartingCardIds =
        [...ids];


    console.log(
        "★ CPU使用済みIDを保存",
        enemyStartingCardIds
    );


    const hand = [];


    //----------------------------------
    // カード作成
    //----------------------------------

    ids.forEach(id=>{

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