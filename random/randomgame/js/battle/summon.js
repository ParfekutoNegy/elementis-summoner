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


    //----------------------------------
    // 現在持っている能力
    //----------------------------------

    const ability =
        summon.ability;


    //==================================
    // ワーム
    // 相手クール1枚につきパワー＋1
    //==================================

    if(
        ability?.type ===
        "powerUpByEnemyCool"
    ){

        const opponentCoolCards =
            summon.owner === PLAYER
                ? enemyCoolCards
                : board.playerCoolCards;


        const value =
            ability.value ?? 1;


        power +=
            opponentCoolCards.length *
            value;

    }


    //==================================
    // ミノタウロス
    // 自分のクールの【火】1枚につき＋1
    //==================================

    if(
        ability?.type ===
        "powerUpByOwnFireCool"
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
            ability.value ?? 1;


        power +=
            fireCardCount *
            value;

    }


    return power;

}

function refreshDynamicPowerSummons(){

    //----------------------------------
    // フィールド確認
    //----------------------------------

    if(
        typeof playerField ===
            "undefined" ||
        typeof enemyField ===
            "undefined"
    ){

        return;

    }


    //----------------------------------
    // コピー能力状態確認
    //----------------------------------

    validateAllDoppelgangerAbilities();


    //----------------------------------
    // PLAYER・CPU両方の場
    //----------------------------------

    const allSummons = [
        ...playerField,
        ...enemyField
    ];


    //----------------------------------
    // 各サモンを確認
    //----------------------------------

    allSummons.forEach(
        summon => {

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return;

            }


            //----------------------------------
            // 現在持っている能力
            //----------------------------------

            const abilityType =
                summon.ability?.type;


            //==================================
            // 動的パワー能力
            //==================================
            //
            // ワーム
            // powerUpByEnemyCool
            //
            // ミノタウロス
            // powerUpByOwnFireCool
            //
            //==================================

            if(
                abilityType ===
                    "powerUpByEnemyCool" ||

                abilityType ===
                    "powerUpByOwnFireCool"
            ){

                console.log(
                    "動的パワー更新",
                    summon.card.name,
                    "現在パワー=",
                    getPower(summon)
                );


                if(
                    summon.view &&
                    typeof summon.view.updateCurrentPower ===
                        "function"
                ){

                    summon.view.updateCurrentPower(
                        summon
                    );

                }


                if(
                    summon.view &&
                    typeof summon.view.refresh ===
                        "function"
                ){

                    summon.view.refresh();

                }

            }

        }
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
// ドッペルゲンガー
// 場に出たとき能力コピー
//==================================================

let doppelgangerTargetMode = false;

let doppelgangerSource = null;


//==================================================
// ドッペルゲンガー
// 対象選択開始
//==================================================

function startDoppelgangerTargetSelect(
    source
){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !source ||
        !source.card
    ){

        return;

    }


    //----------------------------------
    // コピー可能なサモン取得
    //----------------------------------

    const targets = [
        ...playerField,
        ...enemyField
    ].filter(
        summon =>
            summon &&
            summon !== source &&
            !summon.destroyed
    );


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(targets.length === 0){

        console.log(
            "ドッペルゲンガー：コピー対象なし"
        );

        return;

    }


    //==================================
    // PLAYER
    //==================================

    if(source.owner === PLAYER){

        doppelgangerTargetMode =
            true;

        doppelgangerSource =
            source;


        //----------------------------------
        // 対象発光
        //----------------------------------

        targets.forEach(
            summon => {

                if(
                    summon.view &&
                    typeof summon.view.setTarget ===
                    "function"
                ){

                    summon.view.setTarget(
                        true
                    );

                }

            }
        );


        //----------------------------------
        // 操作案内
        //----------------------------------

        showActionGuide(
            "能力の対象を選んでください"
        );


        console.log(
            "ドッペルゲンガー：対象選択開始",
            targets.map(
                summon =>
                    summon.card.name
            )
        );


        updateButtons();

        return;

    }


    //==================================
    // CPU
    // 後で実装
    //==================================

    console.log(
        "CPUドッペルゲンガー：",
        "コピー対象選択は後で実装"
    );

}

//==================================================
// ドッペルゲンガー
// コピー対象決定
//==================================================

function selectDoppelgangerTarget(
    target
){

    //----------------------------------
    // 状態確認
    //----------------------------------

    if(
        !doppelgangerTargetMode ||
        !doppelgangerSource ||
        !target
    ){

        return false;

    }


    //----------------------------------
    // 自分自身は不可
    //----------------------------------

    if(
        target ===
        doppelgangerSource
    ){

        return false;

    }


    //----------------------------------
    // 対象が現在場にいるか
    //----------------------------------

    const targetOnField =
        !target.destroyed &&
        (
            playerField.includes(
                target
            ) ||
            enemyField.includes(
                target
            )
        );


    if(!targetOnField){

        return false;

    }


    //----------------------------------
    // コピー元保存
    //----------------------------------

    doppelgangerSource.abilitySource =
        target;


    //----------------------------------
    // 能力コピー
    //
    // ★ target.ability ではなく
    // target.card.ability
    //
    // これにより
    // ドッペルゲンガーをコピーした場合は
    // 本来の copySummonAbility のみ得る
    //----------------------------------

    doppelgangerSource.ability =
        target.card.ability ?? null;


    console.log(
        "================================"
    );

    console.log(
        "ドッペルゲンガー能力コピー"
    );

    console.log(
        "対象：",
        target.card.name
    );

    console.log(
        "取得能力：",
        doppelgangerSource.ability
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // 発光解除
    //----------------------------------

    [
        ...playerField,
        ...enemyField
    ].forEach(
        summon => {

            if(
                summon &&
                summon.view &&
                typeof summon.view.setTarget ===
                    "function"
            ){

                summon.view.setTarget(
                    false
                );

            }

        }
    );


    //----------------------------------
    // ドッペルゲンガー選択状態終了
    //----------------------------------

    doppelgangerTargetMode =
        false;

    doppelgangerSource =
        null;


    //----------------------------------
    // 操作案内解除
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // 表示更新
    //----------------------------------

    refreshDynamicPowerSummons();

    updateGameState();

    updateButtons();


    return true;

}

//==================================================
// サモン能力
//==================================================

function applySummonAbility(summon){

    if(!summon){

        return;

    }


    //----------------------------------
    // 現在持っている能力
    //----------------------------------

    const ability =
        summon.ability;


    if(!ability){

        return;

    }


    //==================================
    // ドッペルゲンガー
    // 場に出たとき能力コピー
    //==================================

    if(
        ability.type ===
        "copySummonAbility"
    ){

        startDoppelgangerTargetSelect(
            summon
        );

        return;

    }


    //----------------------------------
    // ターン中パワーアップ
    //----------------------------------

    if(
        ability.type ===
        "turnPowerUp"
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
        ability.type ===
        "summonTurnAttack"
    ){

        summon.attackReady =
            true;


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
    // コピー能力状態確認
    //----------------------------------

    validateAllDoppelgangerAbilities();


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


        //----------------------------------
        // 現在持っている能力
        //----------------------------------

        const ability =
            summon.ability;


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


            if(value <= 0){

                continue;

            }


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

//==================================================
// サモン能力 コスト支払い
//==================================================

let summonAbilityCostMode =
    false;

let summonAbilityCostCards =
    [];

let summonAbilityCostConfirm =
    false;


//==================================================
// サモン能力
// コスト選択開始
//==================================================

function startSummonAbilityCost(){

    //----------------------------------
    // 使用サモン確認
    //----------------------------------

    if(
        !summonAbilitySource ||
        !summonAbilitySource.card
    ){

        return;

    }


    //----------------------------------
    // コピー能力状態確認
    //----------------------------------

    validateDoppelgangerAbility(
        summonAbilitySource
    );


    //----------------------------------
    // 現在持っている能力
    //----------------------------------

    const ability =
        summonAbilitySource.ability;


    if(!ability){

        return;

    }


    //----------------------------------
    // 必要コスト
    //----------------------------------

    const cost =
        Number(
            ability.cost
        ) || 0;


    //----------------------------------
    // 手札不足
    //----------------------------------

    if(
        board.handCards.length <
        cost
    ){

        console.log(
            "サモン能力：コスト不足",
            "必要=",
            cost,
            "手札=",
            board.handCards.length
        );


        cancelSummonAbilityTarget();

        return;

    }


    //==================================================
    // 通常の使用可能カード発光を解除
    //==================================================

    document
        .querySelectorAll(
            ".usable-card"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "usable-card"
                );

            }
        );


    //----------------------------------
    // 通常選択も解除
    //----------------------------------

    clearHandSelection();

    clearFieldSelection();


    //==================================================
    // コスト選択開始
    //==================================================

    summonAbilityCostMode =
        true;

    summonAbilityCostCards =
        [];

    summonAbilityCostConfirm =
        false;


    //----------------------------------
    // 使用可能カード発光更新
    //----------------------------------

    updateUsableCardHighlight();


    //----------------------------------
    // 選択状態リセット
    //----------------------------------

    selectedHandCard =
        null;


    //----------------------------------
    // 操作案内
    //----------------------------------

    showActionGuide(
        `${cost}枚のカードをコストとして選択してください`
    );


    console.log(
        "================================"
    );

    console.log(
        "サモン能力コスト選択開始"
    );

    console.log(
        "使用サモン：",
        summonAbilitySource.card.name
    );

    console.log(
        "必要コスト：",
        cost
    );

    console.log(
        "================================"
    );


    updateButtons();

}
//==================================================
// サモン能力
// コストカード選択
//==================================================

function selectSummonAbilityCostCard(
    card
){

    //----------------------------------
    // モード確認
    //----------------------------------

    if(
        !summonAbilityCostMode ||
        !summonAbilitySource
    ){

        return;

    }


    //----------------------------------
    // 手札以外不可
    //----------------------------------

    if(
        !card ||
        card.area !== "hand"
    ){

        return;

    }


    //----------------------------------
    // 必要コスト
    //----------------------------------

const cost =
    Number(
        summonAbilitySource
            .ability
            ?.cost
    ) || 0;


    //----------------------------------
    // 選択解除
    //----------------------------------

    if(
        summonAbilityCostCards.includes(
            card
        )
    ){

        summonAbilityCostCards =
            summonAbilityCostCards.filter(
                selected =>
                    selected !== card
            );


        card.setSelected(
            false
        );

        card.setCostSelected(
            false
        );


        summonAbilityCostConfirm =
            false;


        updateButtons();

        return;

    }


    //----------------------------------
    // 必要枚数以上は選べない
    //----------------------------------

    if(
        summonAbilityCostCards.length >=
        cost
    ){

        return;

    }


    //----------------------------------
    // 選択
    //----------------------------------

    summonAbilityCostCards.push(
        card
    );


    card.setCostSelected(
        true
    );


    //----------------------------------
    // 必要枚数選択完了
    //----------------------------------

    summonAbilityCostConfirm =
        (
            summonAbilityCostCards.length ===
            cost
        );


    console.log(
        "サモン能力コスト",
        summonAbilityCostCards.length,
        "/",
        cost
    );


    updateButtons();

}

//==================================================
// サモン能力
// コスト支払い
//==================================================

function paySummonAbilityCost(){

    //----------------------------------
    // 状態確認
    //----------------------------------

    if(
        !summonAbilityCostMode ||
        !summonAbilitySource ||
        !summonAbilitySource.card
    ){

        return;

    }


    //----------------------------------
    // 現在持っている能力を取得
    //
    // ドッペルゲンガーの
    // コピー能力もここに入る
    //----------------------------------

    const ability =
        summonAbilitySource.ability;


    if(!ability){

        return;

    }


    //----------------------------------
    // 必要コスト
    //----------------------------------

    const cost =
        Number(
            ability.cost
        ) || 0;


    //----------------------------------
    // 必要枚数確認
    //----------------------------------

    if(
        summonAbilityCostCards.length !==
        cost
    ){

        console.log(
            "サモン能力コスト不足",
            summonAbilityCostCards.length,
            "/",
            cost
        );

        return;

    }


    //----------------------------------
    // 解決に必要な情報を保存
    //----------------------------------

    const source =
        summonAbilitySource;

    const target =
        summonAbilityTarget;

    const damage =
        Number(
            ability.value
        ) || 0;


    console.log(
        "================================"
    );

    console.log(
        "サモン能力コスト支払い"
    );

    console.log(
        "使用サモン：",
        source.card.name
    );

    console.log(
        "能力：",
        ability.type
    );

    console.log(
        "コスト：",
        cost
    );

    console.log(
        "対象：",
        target
    );

    console.log(
        "================================"
    );


    //==================================================
    // コストを支払う
    //==================================================

    const costCards = [
        ...summonAbilityCostCards
    ];


    costCards.forEach(
        card => {

            //----------------------------------
            // 選択表示解除
            //----------------------------------

            card.setSelected(
                false
            );

            card.setCostSelected(
                false
            );


            //----------------------------------
            // 既存のコスト移動処理
            //----------------------------------

            moveToCost(
                card
            );

        }
    );


    //==================================================
    // 能力使用済み
    //==================================================

    source.abilityUsedThisTurn =
        true;


    //==================================================
    // コスト選択状態を終了
    //==================================================

    summonAbilityCostMode =
        false;

    summonAbilityCostCards =
        [];

    summonAbilityCostConfirm =
        false;


    //----------------------------------
    // 操作案内解除
    //----------------------------------

    hideActionGuide();


    //==================================================
    // キマイラ能力解決
    //==================================================

    if(
        ability.type ===
        "oncePerTurnPlayerDamageWithCost"
    ){

        //----------------------------------
        // 対象確認
        //----------------------------------

        if(
            target === ENEMY ||
            target === "enemy"
        ){

            console.log(
                "サモン能力発動：",
                source.card.name,
                "→ ENEMY",
                damage,
                "ダメージ"
            );


            addBattleLog(
                `${source.card.name}の能力発動：相手に${damage}ダメージ`
            );


            //----------------------------------
            // 通常のプレイヤーダメージ処理
            //----------------------------------

            damagePlayer(
                ENEMY,
                damage,
                false,
                source.card
            );

        }

    }


    //==================================================
    // サモン能力状態リセット
    //==================================================

    summonAbilitySource =
        null;

    summonAbilityTarget =
        null;

    summonAbilityTargetMode =
        false;


    clearSummonAbilityTargetHighlight();

    clearFieldSelection();


    //----------------------------------
    // 表示更新
    //----------------------------------

    updateGameState();

    updateButtons();

}

//==================================================
// サモン能力
// コスト選択キャンセル
//==================================================

function cancelSummonAbilityCost(){

    //----------------------------------
    // 選択中カードの表示解除
    //----------------------------------

    summonAbilityCostCards.forEach(
        card => {

            if(!card){
                return;
            }


            card.setSelected(
                false
            );

            card.setCostSelected(
                false
            );

        }
    );


    //----------------------------------
    // コスト状態解除
    //----------------------------------

    summonAbilityCostMode =
        false;

    summonAbilityCostCards =
        [];

    summonAbilityCostConfirm =
        false;


    //----------------------------------
    // サモン能力状態解除
    //----------------------------------

    summonAbilityTargetMode =
        false;

    summonAbilityTarget =
        null;

    summonAbilitySource =
        null;


    //----------------------------------
    // 表示解除
    //----------------------------------

    clearSummonAbilityTargetHighlight();

    clearFieldSelection();

    hideActionGuide();


    console.log(
        "サモン能力コスト選択キャンセル"
    );


    //----------------------------------
    // UI更新
    //----------------------------------

    updateGameState();

    updateButtons();

}

//======================================
// ラミア 能力選択
//======================================

let lamiaChoiceMode = false;

let lamiaAbilitySource = null;

let lamiaAbilityTarget = null;

//======================================
// ケット・シー能力
//======================================

// ケット・シー能力で
// クールゾーン選択中
let catSithAbilityMode = false;

// 能力を使用したケット・シー
let catSithAbilitySource = null;

// 選択した風マギア
let catSithSelectedMagia = null;

//----------------------------------
// クールから取り出して
// マギアをプレイしている途中か
//----------------------------------

let catSithMagiaPlaying = false;

function getUsableCatSithMagias(){

    console.log(
        "================================"
    );

    console.log(
        "★ ケット・シー使用可能マギア判定開始"
    );


    //----------------------------------
    // クールゾーン確認
    //----------------------------------

    if(
        !board ||
        !Array.isArray(
            board.playerCoolCards
        )
    ){

        console.log(
            "★ playerCoolCards がありません"
        );

        return [];

    }


    console.log(
        "★ PLAYERクール枚数=",
        board.playerCoolCards.length
    );


    //----------------------------------
    // 使用可能な風マギアを取得
    //----------------------------------

    const result =
        board.playerCoolCards.filter(
            card => {

                console.log(
                    "--------------------------------"
                );

                console.log(
                    "★ クールカード確認",
                    card?.name
                );

                console.log(
                    "type=",
                    card?.type
                );

                console.log(
                    "elementType=",
                    card?.elementType
                );

                console.log(
                    "area=",
                    card?.area
                );

                console.log(
                    "owner=",
                    card?.owner
                );


                //----------------------------------
                // 基本確認
                //----------------------------------

                if(!card){

                    console.log(
                        "→ NG：cardなし"
                    );

                    return false;

                }


                //----------------------------------
                // マギアのみ
                //----------------------------------

                if(
                    card.type !== "マギア"
                ){

                    console.log(
                        "→ NG：マギアではない"
                    );

                    return false;

                }


                //----------------------------------
                // 風属性のみ
                //----------------------------------

                if(
                    card.elementType !== "風"
                ){

                    console.log(
                        "→ NG：風ではない",
                        card.elementType
                    );

                    return false;

                }


                //----------------------------------
                // 適正な対象が存在するか
                //----------------------------------

                const hasTarget =
                    canUseMagiaTarget(
                        card
                    );


                console.log(
                    "適正対象=",
                    hasTarget
                );


                if(!hasTarget){

                    console.log(
                        "→ NG：適正対象なし"
                    );

                    return false;

                }


                //----------------------------------
                // コストを支払えるか
                //----------------------------------

                const canPay =
                    canPayCost(
                        card
                    );


                console.log(
                    "コスト支払い可能=",
                    canPay
                );


                if(!canPay){

                    console.log(
                        "→ NG：コスト不足"
                    );

                    return false;

                }


                console.log(
                    "→ OK：ケット・シーで使用可能",
                    card.name
                );


                return true;

            }
        );


    console.log(
        "================================"
    );

    console.log(
        "★ ケット・シー使用可能マギア=",
        result.map(
            card =>
                card.name
        )
    );

    console.log(
        "================================"
    );


    return result;

}

function startCatSithMagiaSelect(source){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !source ||
        !source.card
    ){

        return;

    }


    //----------------------------------
    // 使用可能カード取得
    //----------------------------------

    const usableMagias =
        getUsableCatSithMagias();


    //----------------------------------
    // 使用可能カードなし
    //----------------------------------

    if(
        usableMagias.length === 0
    ){

        console.log(
            "ケット・シー：",
            "使用可能な風マギアなし"
        );

        return;

    }


    //----------------------------------
    // 状態保存
    //----------------------------------

    catSithAbilityMode =
        true;

    catSithAbilitySource =
        source;

    catSithSelectedMagia =
        null;


    //----------------------------------
    // クールモーダル取得
    //----------------------------------

    const modal =
        document.getElementById(
            "cool-modal"
        );

    const list =
        document.getElementById(
            "cool-list"
        );

    const closeButton =
        document.getElementById(
            "close-cool-x-button"
        );


    if(
        !modal ||
        !list
    ){

        console.error(
            "ケット・シー：",
            "クールモーダルが見つかりません"
        );

        return;

    }


    //----------------------------------
    // タイトル
    //----------------------------------

    const title =
        modal.querySelector(
            "h2"
        );


    if(title){

        title.textContent =
            "プレイする風マギアを選択";

    }


    //==================================
    // モーダル右端のボタンは使用しない
    //==================================

    if(closeButton){

        closeButton.style.display =
            "none";

        closeButton.onclick =
            null;

    }


    //----------------------------------
    // リスト初期化
    //----------------------------------

    list.innerHTML =
        "";


    //----------------------------------
    // クールゾーンのカードを表示
    //----------------------------------

    board.playerCoolCards.forEach(
        card => {

            const img =
                document.createElement(
                    "img"
                );


            img.src =
                card.image;

            img.className =
                "cool-card";


            //----------------------------------
            // 使用可能判定
            //----------------------------------

            const usable =
                usableMagias.includes(
                    card
                );


            //----------------------------------
            // 使用可能カード
            //----------------------------------

            if(usable){

                img.classList.add(
                    "magia-target"
                );

                img.style.cursor =
                    "pointer";

            }


            //----------------------------------
            // 使用不可カード
            //----------------------------------

            else{

                img.style.opacity =
                    "0.35";

                img.style.cursor =
                    "default";

            }


            //----------------------------------
            // クリック
            //----------------------------------

            img.onclick =
                ()=>{

                    if(!usable){

                        console.log(
                            "ケット・シー：",
                            "このカードは使用できません",
                            card.name
                        );

                        return;

                    }


                    selectCatSithMagia(
                        card
                    );

                };


            list.appendChild(
                img
            );

        }
    );


    //----------------------------------
    // モーダル表示
    //----------------------------------

    modal.style.display =
        "block";

    modal.classList.add(
        "active"
    );


    //==================================
    // 通常の赤いキャンセルボタンを表示
    //==================================

    const actionArea =
        document.getElementById(
            "cost-action-area"
        );

    const cancelButton =
        document.getElementById(
            "cancel-button"
        );


    if(actionArea){

        actionArea.style.display =
            "flex";

    }


    if(cancelButton){

        cancelButton.style.display =
            "inline-block";

        cancelButton.textContent =
            "キャンセル";

        cancelButton.onclick =
            cancelCatSithAbility;

    }


    //----------------------------------
    // ボタン状態を正式に更新
    //----------------------------------

    updateButtons();


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "ケット・シー：",
        "使用可能な風マギア",
        usableMagias.map(
            card =>
                card.name
        )
    );

}

function selectCatSithMagia(card){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(
        !card ||
        !catSithAbilitySource
    ){

        return;

    }


    //----------------------------------
    // 使用可能カードか再確認
    //----------------------------------

    const usableMagias =
        getUsableCatSithMagias();


    if(
        !usableMagias.includes(card)
    ){

        console.log(
            "ケット・シー：",
            "このマギアは使用できません",
            card.name
        );

        return;

    }


    //----------------------------------
    // 使用サモンを保存
    //----------------------------------

    const source =
        catSithAbilitySource;


    //----------------------------------
    // 選択マギアを保存
    //----------------------------------

    catSithSelectedMagia =
        card;


    //----------------------------------
    // クール選択モーダルを閉じる
    //----------------------------------

    const modal =
        document.getElementById(
            "cool-modal"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    //----------------------------------
    // マギア発光解除
    //----------------------------------

    if(
        typeof clearMagiaHighlight ===
        "function"
    ){

        clearMagiaHighlight();

    }


    //----------------------------------
    // クールゾーンから一時的に外す
    //----------------------------------

    board.removeCoolCard(
        card,
        PLAYER
    );


    //----------------------------------
    // 通常マギアとして扱うため
    // 一時的に手札エリア扱い
    //----------------------------------

    card.owner =
        PLAYER;

    card.area =
        "hand";


    //----------------------------------
    // 重要
    //
    // この時点では
    // abilityUsedThisTurn を
    // trueにしない
    //----------------------------------

    catSithMagiaPlaying =
        true;


    //----------------------------------
    // クール選択モード終了
    //----------------------------------

    catSithAbilityMode =
        false;


    //----------------------------------
    // 使用サモンはまだ保持する
    //
    // マギアが本当にプレイされた時に
    // 使用済みにするため
    //----------------------------------

    catSithAbilitySource =
        source;


    //----------------------------------
    // 通常サモン能力選択状態解除
    //----------------------------------

    summonAbilityTargetMode =
        false;

    summonAbilitySource =
        null;

    summonAbilityTarget =
        null;


    clearSummonAbilityTargetHighlight();

    hideActionGuide();


    console.log(
        "ケット・シー：",
        card.name,
        "をクールからプレイ開始"
    );


    //----------------------------------
    // 通常マギア処理へ
    //----------------------------------

    startMagia(
        card
    );


    updateButtons();

}

function closeCatSithCoolModal(){

    const modal =
        document.getElementById(
            "cool-modal"
        );


    if(modal){

        modal.style.display =
            "none";

        modal.classList.remove(
            "active"
        );

    }


    //----------------------------------
    // タイトルを戻す
    //----------------------------------

    const title =
        modal?.querySelector(
            "h2"
        );


    if(title){

        title.textContent =
            "クールゾーン";

    }


    //----------------------------------
    // 閉じるボタンを戻す
    //----------------------------------

    const closeButton =
        document.getElementById(
            "close-cool-x-button"
        );


    if(closeButton){

        closeButton.textContent =
            "×";


        closeButton.onclick =
            function(){

                closeCoolModal();

            };

    }


    //----------------------------------
    // リスト再描画
    //----------------------------------

    refreshCoolModal();

}

function cancelCatSithAbility(){

    console.log(
        "ケット・シー能力キャンセル"
    );


    //----------------------------------
    // モーダル
    //----------------------------------

    const modal =
        document.getElementById(
            "cool-modal"
        );


    if(modal){

        modal.style.display =
            "none";

        modal.classList.remove(
            "active"
        );

    }


    //----------------------------------
    // 状態解除
    //----------------------------------

    catSithAbilityMode =
        false;

    catSithAbilitySource =
        null;

    catSithSelectedMagia =
        null;


    //----------------------------------
    // サモン能力状態解除
    //----------------------------------

    summonAbilityTargetMode =
        false;

    summonAbilitySource =
        null;

    summonAbilityTarget =
        null;


    //----------------------------------
    // 発光解除
    //----------------------------------

    clearSummonAbilityTargetHighlight();

    clearMagiaHighlight();

    clearFieldSelection();

    hideActionGuide();


    //----------------------------------
    // 通常のクール表示へ戻す
    //----------------------------------

    refreshCoolModal();


    //----------------------------------
    // UI更新
    //----------------------------------

    updateGameState();

    updateButtons();

    updateUsableCardHighlight();

}

//==================================================
// ケット・シー
// マギアのプレイ成立
//==================================================

function completeCatSithAbility(){

    //----------------------------------
    // ケット・シー経由でなければ何もしない
    //----------------------------------

    if(
        !catSithMagiaPlaying
    ){

        return;

    }


    //----------------------------------
    // 使用サモンを使用済みにする
    //----------------------------------

    if(catSithAbilitySource){

        catSithAbilitySource.abilityUsedThisTurn =
            true;


        console.log(
            "ケット・シー能力使用完了：",
            catSithAbilitySource.card?.name
        );

    }


    //----------------------------------
    // 状態解除
    //----------------------------------

    catSithMagiaPlaying =
        false;

    catSithAbilityMode =
        false;

    catSithAbilitySource =
        null;

    catSithSelectedMagia =
        null;

}

//==================================================
// ケット・シー
// プレイ中マギアのキャンセル
//==================================================

function cancelCatSithMagiaPlay(){

    //----------------------------------
    // ケット・シー経由でなければ
    // 何もしない
    //----------------------------------

    if(
        !catSithMagiaPlaying ||
        !catSithSelectedMagia
    ){

        return false;

    }


    const card =
        catSithSelectedMagia;


    console.log(
        "ケット・シー：",
        card.name,
        "のプレイをキャンセル"
    );


    //----------------------------------
    // マギア選択表示解除
    //----------------------------------

    if(
        typeof clearMagiaHighlight ===
        "function"
    ){

        clearMagiaHighlight();

    }


    //----------------------------------
    // クールへ戻す
    //----------------------------------

    card.owner =
        PLAYER;

    card.area =
        "cool";


    //----------------------------------
    // 二重登録防止
    //----------------------------------

    if(
        !board.playerCoolCards.includes(
            card
        )
    ){

        board.addCoolCard(
            card,
            PLAYER
        );

    }


    //----------------------------------
    // ケット・シーは未使用のまま
    //----------------------------------

    if(catSithAbilitySource){

        catSithAbilitySource.abilityUsedThisTurn =
            false;

    }


    //----------------------------------
    // 状態解除
    //----------------------------------

    catSithMagiaPlaying =
        false;

    catSithAbilityMode =
        false;

    catSithAbilitySource =
        null;

    catSithSelectedMagia =
        null;


    return true;

}

//==================================================
// ドッペルゲンガー
// コピー能力有効確認
//==================================================

function validateDoppelgangerAbility(
    summon
){

    //----------------------------------
    // 基本確認
    //----------------------------------

    if(!summon){

        return false;

    }


    //----------------------------------
    // コピー元なし
    //----------------------------------

    if(!summon.abilitySource){

        return false;

    }


    const source =
        summon.abilitySource;


    //----------------------------------
    // コピー元が場に存在するか
    //----------------------------------

    const sourceOnField =
        !source.destroyed &&
        (
            playerField.includes(
                source
            ) ||
            enemyField.includes(
                source
            )
        );


    //----------------------------------
    // まだ場にいる
    //----------------------------------

    if(sourceOnField){

        return false;

    }


    console.log(
        "ドッペルゲンガー：",
        "コピー元が場を離れたため能力消失",
        source.card?.name
    );


    //----------------------------------
    // コピー能力消失
    //----------------------------------

    summon.ability =
        null;

    summon.abilitySource =
        null;


    //==================================
    // パワー表示を即時更新
    //==================================

    if(
        summon.view &&
        typeof summon.view.updateCurrentPower ===
            "function"
    ){

        summon.view.updateCurrentPower(
            summon
        );

    }


    //----------------------------------
    // カード表示更新
    //----------------------------------

    if(
        summon.view &&
        typeof summon.view.refresh ===
            "function"
    ){

        summon.view.refresh();

    }


    console.log(
        "ドッペルゲンガー能力消失後",
        summon.card.name,
        "現在パワー=",
        getPower(summon)
    );


    return true;

}


//==================================================
// ドッペルゲンガー
// 全コピー能力状態更新
//==================================================

function validateAllDoppelgangerAbilities(){

    const allSummons = [
        ...playerField,
        ...enemyField
    ];


    allSummons.forEach(
        summon => {

            validateDoppelgangerAbility(
                summon
            );

        }
    );

}

