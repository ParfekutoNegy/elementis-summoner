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
// ランダムカードID取得
//======================================

function getRandomCardIds(
    count = 10,
    excludeIds = []
){

    //----------------------------------
    // 1～32
    //----------------------------------

    const ids = [];

    for(let i = 1; i <= 32; i++){

        //----------------------------------
        // 使用済みカードは除外
        //----------------------------------

        if(
            excludeIds.includes(i)
        ){

            continue;

        }

        ids.push(i);

    }


    //----------------------------------
    // シャッフル
    //----------------------------------

    for(
        let i = ids.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            ids[i],
            ids[j]
        ] =
        [
            ids[j],
            ids[i]
        ];

    }


    //----------------------------------
    // 指定枚数取得
    //----------------------------------

    return ids.slice(
        0,
        count
    );

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
// 使用済み開始手札を除外して10枚取得
//======================================


function createNextGameHand(owner){

    //----------------------------------
    // プレイヤー / CPU の使用済みID
    //----------------------------------

    const usedIds =
        owner === PLAYER
            ? playerStartingCardIds
            : enemyStartingCardIds;


    //----------------------------------
    // 使用済みカードを除外
    //----------------------------------

    const availableIds = [];


    for(
        let id = 1;
        id <= 32;
        id++
    ){

        if(
            !usedIds.includes(id)
        ){

            availableIds.push(id);

        }

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
    // 残りカードをシャッフル
    //----------------------------------

    for(
        let i = availableIds.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            availableIds[i],
            availableIds[j]
        ] =
        [
            availableIds[j],
            availableIds[i]
        ];

    }


    //----------------------------------
    // 10枚取得
    //----------------------------------

    const ids =
        availableIds.slice(
            0,
            10
        );


    console.log(
        owner === PLAYER
            ? "★ プレイヤー次戦初期手札ID"
            : "★ CPU次戦初期手札ID",
        ids
    );


    //----------------------------------
    // カード作成
    //----------------------------------

    const hand = [];


    ids.forEach(id=>{

        const cardData =
            CARD_LIST.find(
                card => card.id === id
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
    // 今回使ったカードも保存
    // 3戦目では第1戦 + 第2戦を除外する
    //----------------------------------

    usedIds.push(
        ...ids
    );


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