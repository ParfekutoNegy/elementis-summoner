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

    }

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
        Math.max(
            0,
            event.damage
        );


    //----------------------------------
    // ダメージ加算
    //----------------------------------

    target.damage +=
        damage;


    //----------------------------------
    // ダメージ表示
    //----------------------------------

    showDamageNumber(
        target,
        damage
    );


    //==================================================
    // カーススモーク
    // 1以上のダメージを受けた場合
    //==================================================

    if(
        damage >= 1 &&
        isCurseSmokeTarget(
            target
        )
    ){

        console.log(
            "カーススモーク発動",
            target.card.name,
            "damage=",
            damage
        );


        //----------------------------------
        // 通常の破壊と同じ扱い
        //----------------------------------

        target.destroyed =
            true;

    }

}

function getPower(summon){

    return (
        summon.card.power +
        summon.powerBonus
    );

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


    const ability =
        summon.card.ability;


    if(!ability){
        return;
    }


    //----------------------------------
    // ターン中パワーアップ
    //----------------------------------

    if(
        ability.type === "turnPowerUp"
    ){

        summon.powerBonus =
            ability.value;


        console.log(
            "サモン能力適用",
            summon.card.name,
            "powerBonus=",
            summon.powerBonus,
            "power=",
            getPower(summon)
        );


        //----------------------------------
        // 現在パワー表示更新
        //----------------------------------

        if(summon.view){

            summon.view.updateCurrentPower(
                summon
            );

        }

    }


    //----------------------------------
    // 召喚ターン攻撃可能
    //----------------------------------

    if(
        ability.type === "summonTurnAttack"
    ){

        summon.attackReady = true;

        console.log(
            "召喚ターン攻撃可能",
            summon.card.name
        );

    }

}

//======================================
// マギアプレイ時サモン能力
//======================================

function triggerSummonAbilitiesOnMagiaPlay(
    owner
){

    //----------------------------------
    // マギアをプレイした側のフィールド
    //----------------------------------

    const field =
        owner === PLAYER
            ? playerField
            : enemyField;


    //----------------------------------
    // サモン能力確認
    //----------------------------------

    for(
        const summon of field
    ){

        if(
            !summon ||
            summon.destroyed
        ){

            continue;

        }


        const ability =
            summon.card?.ability;


        if(!ability){

            continue;

        }


        //==================================
        // マギアをプレイするたび
        // このターン中パワーアップ
        //==================================

        if(
            ability.type ===
            "powerUpWhenPlayMagia"
        ){

            const value =
                Number(
                    ability.value
                ) || 0;


            if(
                value <= 0
            ){

                continue;

            }


            //==================================
            // 既存の一時パワーシステムを使用
            //==================================

            addTemporaryPower(
                summon,
                value
            );


            console.log(
                "サモン能力発動：",
                summon.card.name,
                "マギアプレイにより",
                "パワー+",
                value,
                "現在パワー=",
                getPower(
                    summon
                )
            );

        }

    }

}

