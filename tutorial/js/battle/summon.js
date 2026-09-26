class Summon{

    constructor(card, owner){

        this.card = card;

        this.owner = owner;

        this.damage = 0;

        this.powerBonus = 0;

        this.damageBonus = 0;

        this.destroyed = false;

        this.isRest = false;

        this.attackReady = false;

        this.status = [];

        this.view = card;

        this.abilityUsedThisTurn = false;


        //==================================
        // 現在このサモンが持っている能力
        //==================================

        this.ability =
            card.ability ?? null;


        //==================================
        // ドッペルゲンガー
        // コピー元
        //==================================

        this.abilitySource =
            null;

    }

}

//==================================================
// サモン能力一覧取得
//
// ability が
// ・単一オブジェクト
// ・配列
//
// どちらの場合でも配列として返す
//==================================================

function getSummonAbilities(
    summon
){

    //----------------------------------
    // サモンなし
    //----------------------------------

    if(!summon){

        return [];

    }


    //----------------------------------
    // 能力なし
    //----------------------------------

    if(!summon.ability){

        return [];

    }


    //----------------------------------
    // 複数能力
    //----------------------------------

    if(
        Array.isArray(
            summon.ability
        )
    ){

        return summon.ability;

    }


    //----------------------------------
    // 単一能力
    //----------------------------------

    return [
        summon.ability
    ];

}



//==================================================
// 指定したサモン能力を取得
//
// 見つからない場合は null
//==================================================

function getSummonAbility(
    summon,
    abilityType
){

    //----------------------------------
    // 能力一覧取得
    //----------------------------------

    const abilities =
        getSummonAbilities(
            summon
        );


    //----------------------------------
    // 指定能力を検索
    //----------------------------------

    const ability =
        abilities.find(
            ability =>
                ability &&
                ability.type ===
                    abilityType
        );


    //----------------------------------
    // 結果
    //----------------------------------

    return ability ?? null;

}



//==================================================
// 指定したサモン能力を持っているか
//==================================================

function hasSummonAbility(
    summon,
    abilityType
){

    return (
        getSummonAbility(
            summon,
            abilityType
        ) !== null
    );

}

function dealDamage(
    target,
    damage,
    sourceCard = null
){

    if(!target){

        return;

    }


    console.log(
        "対象所有者",
        target.owner
    );


    console.log(
        "ダメージ",
        target.card.name,
        damage
    );



    //----------------------------------
    // レジストイベント
    //----------------------------------

    const event = {

        type:
        GAME_EVENT.BEFORE_SUMMON_DAMAGE,


        player:
        target.owner,


        target:
        target,


        damage:
        damage,


        source:
        sourceCard,


        sourceType:
        sourceCard?.type ?? null,


        element:
        sourceCard?.element ?? null

    };



    //----------------------------------
    // レジスト確認
    //----------------------------------

    const waitResist =
    emitGameEvent(event);



    //----------------------------------
    // レジスト待機
    //----------------------------------

    if(waitResist){

        console.log(
            "レジスト待機中 ダメージ停止"
        );

        return;

    }



    //----------------------------------
    // レジスト後ダメージ反映
    //----------------------------------

    damage =
    event.damage;



    //----------------------------------
    // ダメージ加算
    //----------------------------------

    target.damage += damage;



    //----------------------------------
    // ダメージ表示
    //----------------------------------

    showDamageNumber(
        target,
        damage
    );


}

function getPower(summon){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !summon ||
        !summon.card
    ){

        return 0;

    }


    //----------------------------------
    // 基本パワー
    //----------------------------------

    let power =
        summon.card.power +
        summon.powerBonus;


    //==================================
    // ワーム
    // 相手クール1枚につきパワー＋1
    //==================================

    const enemyCoolPowerAbility =
        getSummonAbility(
            summon,
            "powerUpByEnemyCool"
        );


    if(
        enemyCoolPowerAbility
    ){

        const opponentCoolCards =
            summon.owner === PLAYER
                ? enemyCoolCards
                : board.playerCoolCards;


        const value =
            enemyCoolPowerAbility.value ?? 1;


        power +=
            opponentCoolCards.length *
            value;

    }


    //==================================
    // ミノタウロス
    // 自分のクールの【火】1枚につき＋1
    //==================================

    const ownFireCoolPowerAbility =
        getSummonAbility(
            summon,
            "powerUpByOwnFireCool"
        );


    if(
        ownFireCoolPowerAbility
    ){

        const ownCoolCards =
            summon.owner === PLAYER
                ? board.playerCoolCards
                : enemyCoolCards;


        const fireCardCount =
            ownCoolCards.filter(
                card =>
                    card &&
                    card.elementType === "火"
            ).length;


        const value =
            ownFireCoolPowerAbility.value ?? 1;


        power +=
            fireCardCount *
            value;

    }


    return power;

}

function getDamage(summon, damage){

    return (
        damage +
        summon.damageBonus
    );

}

//======================================
// 共通召喚処理
//======================================

function executeSummon(card, owner){

    console.log(
    "プレイヤー手札",
    board.handCards.map(card => card.name)
);

console.log(
    "CPU手札",
    enemyHandCards.map(card => card.name)
);


    if(!card){

        return false;

    }


    //----------------------------------
    // 所属ゾーン変更
    //----------------------------------

    card.area =
    owner === PLAYER
    ?
    "field"
    :
    "enemyField";

    card.refresh();


    //----------------------------------
    // 手札から削除
    //----------------------------------

    if(owner === PLAYER){

        board.handCards =
        board.handCards.filter(
            c=>c !== card
        );

    }
    else{

        enemyHandCards =
        enemyHandCards.filter(
            c=>c !== card
        );

    }

// ★追加確認
console.log(
    "削除後プレイヤー手札",
    board.handCards.map(c=>c.name)
);

console.log(
    "削除後CPU手札",
    enemyHandCards.map(c=>c.name)
);


    //----------------------------------
    // サモン生成
    //----------------------------------

    const summon =
    new Summon(
        card,
        owner
    );

    //----------------------------------
// 場の表示設定
//----------------------------------

card.area =
owner === PLAYER
?
"field"
:
"enemyField";

card.refresh();



    //----------------------------------
    // 場へ追加
    //----------------------------------

    if(owner === PLAYER){

        playerField.push(
            summon
        );

    }
    else{

        enemyField.push(
            summon
        );

    }

    //----------------------------------
    // サモン能力
    //----------------------------------

    applySummonAbility( 
        summon
    );

    updateHandCostDisplay();

    
    //----------------------------------
    // 表示更新
    //----------------------------------

    if(owner === PLAYER){

        board.setPlayerCards(
            playerField.map(
                s=>s.view
            )
        );

    }
    else{

        board.setEnemyCards(
            enemyField.map(
                s=>s.view
            )
        );

    }

    updateEnemyZoneDisplay();

    //----------------------------------
    // 召喚ターンは攻撃不可
    //----------------------------------

    summon.attackReady = false;


    console.log(
    "★ executeSummon 呼び出し",
    "owner=",
    owner,
    "PLAYER=",
    PLAYER,
    "card=",
    card.name
);



    console.log(
        "召喚完了",
        owner,
        card.name
    );

    updateHandCostDisplay();

    return summon;

}


//==================================================
// サモン能力
//==================================================

function applySummonAbility(summon){

    if(!summon){

        return;

    }


    //==================================
    // ドッペルゲンガー
    //==================================

    const copyAbility =
        getSummonAbility(
            summon,
            "copySummonAbility"
        );


    if(copyAbility){

        startDoppelgangerTargetSelect(
            summon
        );

        return;

    }


    //==================================
    // ドラゴン
    // ターン中パワーアップ
    //==================================

    const turnPowerUpAbility =
        getSummonAbility(
            summon,
            "turnPowerUp"
        );


    if(turnPowerUpAbility){

        summon.powerBonus =
            turnPowerUpAbility.value;


        console.log(
            "サモン能力適用",
            summon.card.name,
            "powerBonus=",
            summon.powerBonus,
            "power=",
            getPower(summon)
        );


        if(summon.view){

            summon.view.updateCurrentPower(
                summon
            );

        }

    }


    //==================================
    // ユニコーン等
    //
    // 召喚ターンからアタック可能
    //
    // attackReady は変更しない。
    //
    // summonTurnAttack を持っていること自体を
    // startAttack / canAttack 側で確認して
    // 召喚ターンのアタックを許可する。
    //
    // これによりメドゥーサがいる場合は
    // summonTurnAttack より優先して
    // アタックを禁止できる。
    //==================================

    if(
        hasSummonAbility(
            summon,
            "summonTurnAttack"
        )
    ){

        console.log(
            "召喚ターン攻撃能力あり",
            summon.card.name,
            "attackReady=",
            summon.attackReady
        );

    }


    //==================================
    // ジャックフロスト
    //
    // 相手は1ターンに指定枚数までしか
    // カードをプレイできない
    //
    // 場に出た瞬間から制限を有効化
    //==================================

    const cardPlayLimitAbility =
        getSummonAbility(
            summon,
            "limitEnemyCardPlay"
        );


    if(cardPlayLimitAbility){

        console.log(
            "カードプレイ制限能力適用",
            summon.card.name,
            "owner=",
            summon.owner,
            "limit=",
            cardPlayLimitAbility.value
        );


        //----------------------------------
        // 現在のプレイ枚数を維持したまま
        // 制限だけを再評価する
        //----------------------------------

        if(
            typeof refreshCardPlayLimitState ===
                "function"
        ){

            refreshCardPlayLimitState();

        }

    }

}