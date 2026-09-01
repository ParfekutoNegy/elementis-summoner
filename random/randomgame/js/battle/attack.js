//======================================
// attack.js
// アタック処理
//======================================


//======================================
// 攻撃状態管理
//======================================

let attackingSummon = null;

let attackMode = false;

let attackTarget = null;

let waitingAttackAfterResist = false;

//======================================
// ブロック状態管理
//======================================

let blockMode = false;

// 選択可能なブロッカー
let selectableBlockSummons = [];

// 実際にブロックしたサモン
let blockingSummon = null;


function startAttack(summon){

    //----------------------------------
    // プレイヤーのターン以外は攻撃開始不可
    //----------------------------------

    if(
        game.currentPlayer !== PLAYER
    ){

        console.log(
            "プレイヤーのターンではないため攻撃不可"
        );

        return;

    }


    if(!summon){

        return;

    }


    //----------------------------------
    // 自分のサモン以外は攻撃開始不可
    //----------------------------------

    if(
        summon.owner !== PLAYER
    ){

        console.log(
            "自分のサモンではないため攻撃不可",
            summon.card.name
        );

        return;

    }


    //----------------------------------
    // 召喚したターンは攻撃不可
    //----------------------------------

    if(!summon.attackReady){

        console.log(
            "召喚したターンなので攻撃できません"
        );

        return;

    }


    //----------------------------------
    // 行動済みサモン
    //----------------------------------

    if(summon.isRest){

        console.log(
            "このサモンは攻撃できません"
        );

        return;

    }


    //----------------------------------
    // 攻撃開始
    //----------------------------------

    attackingSummon = summon;

    attackMode = true;


    //----------------------------------
    // 攻撃対象選択案内
    //----------------------------------

    showActionGuide(
        "アタック対象を選んでください"
    );


    highlightAttackTargets();


    updateGameState();


    console.log(
        "攻撃開始",
        summon.card.name
    );

}

//======================================
// アタック対象選択キャンセル
//======================================

function cancelAttack(){

    console.log(
        "アタック対象選択キャンセル"
    );


    //----------------------------------
    // 攻撃対象発光解除
    //----------------------------------

    clearAttackHighlight();


    //----------------------------------
    // 攻撃状態解除
    //----------------------------------

    attackMode = false;

    attackingSummon = null;

    attackTarget = null;


    //----------------------------------
    // 案内を消す
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();


    //----------------------------------
    // ゲーム状態更新
    //----------------------------------

    updateGameState();

}

//======================================
// 攻撃中確認
//======================================

function isAttacking(){

    return attackingSummon !== null;

}



//======================================
// 攻撃対象クリック
//======================================

function clickAttackTarget(target){


    if(!attackingSummon){

        return;

    }


    console.log(
        "攻撃対象決定",
        target
    );


    executeAttack(
        attackingSummon,
        target
    );


}


//======================================
// 攻撃可能判定
//======================================

function canAttack(target){

    if(!attackingSummon){

        return false;

    }


    //----------------------------------
    // 召喚したターンは攻撃不可
    //----------------------------------

    if(
        !attackingSummon.attackReady &&
        attackingSummon.card.ability?.type !==
        "summonTurnAttack"
    ){

        console.log(
            "召喚ターンのため攻撃不可"
        );

        return false;

    }


    //----------------------------------
    // 行動済みサモン
    //----------------------------------

    if(attackingSummon.isRest){

        console.log(
            "行動済みサモン"
        );

        return false;

    }


    //----------------------------------
    // サモン攻撃の場合
    //----------------------------------

    if(target instanceof Summon){

        //----------------------------------
        // 自分の場のサモンには攻撃不可
        //----------------------------------

        if(
            target.owner ===
            attackingSummon.owner
        ){

            console.log(
                "自分の場のサモンには攻撃不可",
                target.card.name
            );

            return false;

        }


        //----------------------------------
        // タテ向きサモンへの攻撃
        //----------------------------------

        if(!target.isRest){

            //----------------------------------
            // タテ向き攻撃可能能力がない
            //----------------------------------

            if(
                attackingSummon.card.ability?.type !==
                "attackVerticalSummon"
            ){

                console.log(
                    "待機状態サモンには攻撃不可"
                );

                return false;

            }


            //----------------------------------
            // タテ向き攻撃可能
            //----------------------------------

            console.log(
                "タテ向きサモンへの攻撃可能",
                attackingSummon.card.name
            );

        }

    }


    return true;

}

//======================================
// 戦闘実行
//======================================

function executeAttack(
    attacker,
    target
){

    //----------------------------------
    // 攻撃対象選択案内を消す
    //----------------------------------

    hideActionGuide();


    console.log(
        "=== executeAttack ===",
        {
            attacker:
                attacker.owner,

            attackerName:
                attacker.card.name,

            target:
                target
        }
    );


    attackingSummon =
        attacker;


    //----------------------------------
    // バトルログ用情報
    //----------------------------------

    const attackerName =
        attacker.card.name;


    const attackerOwner =
        attacker.owner === PLAYER
            ? "PLAYER"
            : "CPU";


    let targetName;


    //----------------------------------
    // 攻撃対象
    //----------------------------------

    if(target instanceof Summon){

        targetName =
            target.card.name;

    }

    else if(
        target === PLAYER ||
        target === "player"
    ){

        targetName =
            "PLAYER";

    }

    else if(
        target === ENEMY ||
        target === "enemy"
    ){

        targetName =
            "CPU";

    }

    else{

        targetName =
            "不明";

    }


    //----------------------------------
    // 攻撃可能確認
    //----------------------------------

    if(!canAttack(target)){

        console.log(
            "攻撃不可"
        );


        finishAttack();


        return false;

    }


    //----------------------------------
    // 攻撃ログ
    //----------------------------------

    addBattleLog(
        `${attackerOwner}：${attackerName} → ${targetName}を攻撃`
    );


    //----------------------------------
    // 攻撃済み状態
    //----------------------------------

    attackingSummon.isRest =
        true;


    attackingSummon.view.setHorizontal(
        true
    );


    //----------------------------------
    // サモン同士の戦闘
    //----------------------------------

    if(target instanceof Summon){

        //----------------------------------
        // バジリスク：バトル相手を記録
        //----------------------------------

        setBasiliskBattleTarget(
            attackingSummon,
            target
        );


        //----------------------------------
        // ダメージ交換
        //----------------------------------

        dealDamage(
            target,
            getPower(attackingSummon)
        );


        dealDamage(
            attackingSummon,
            getPower(target)
        );

    }


    //----------------------------------
    // CPU → PLAYER
    //----------------------------------

    else if(
        target === PLAYER ||
        target === "player"
    ){

        console.log(
            "プレイヤーへの攻撃"
        );


        //----------------------------------
        // ブロッカー確認
        //----------------------------------

        const blockers =
            findBlockSummons();


        if(blockers.length > 0){

            console.log(
                "ブロック可能",
                blockers.length
            );


            startBlock(
                blockers
            );


            return "WAIT_BLOCK";

        }


        //----------------------------------
        // ブロックなし
        //
        // 必ず damagePlayer() を通す
        //----------------------------------

        damagePlayer(

            PLAYER,

            getPower(attackingSummon),

            false,

            attackingSummon.card

        );


        //----------------------------------
        // レジスト中なら停止
        //----------------------------------

        if(resistMode){

            console.log(
                "レジスト中なので戦闘終了停止"
            );

            return "WAIT_RESIST";

        }

    }


    //----------------------------------
    // PLAYER → CPU
    //----------------------------------

    else if(
        target === ENEMY ||
        target === "enemy"
    ){

        console.log(
            "CPUへの攻撃"
        );


        //----------------------------------
        // CPUブロッカー確認
        //----------------------------------

        const blockers =
            findBlockSummons();


        if(blockers.length > 0){

            console.log(
                "CPUブロック可能",
                blockers.map(
                    summon =>
                        summon.card.name
                )
            );


            //----------------------------------
            // CPUがブロックするか判断
            //----------------------------------

            const shouldBlock =
                cpuShouldBlock(
                    blockers,
                    attackingSummon
                );


            if(shouldBlock){

                console.log(
                    "CPUブロック"
                );


                executeCpuBlock(
                    blockers,
                    attackingSummon
                );


                return;

            }


            console.log(
                "CPUブロックしない"
            );

        }


        //----------------------------------
        // CPUへのダメージ
        //
        // damagePlayer() に統一
        //----------------------------------

        damagePlayer(

            ENEMY,

            getPower(attackingSummon),

            false,

            attackingSummon.card

        );


        //----------------------------------
        // レジスト待機
        //----------------------------------

        if(resistMode){

            console.log(
                "CPUへのダメージ：レジスト待機"
            );


            return "WAIT_RESIST";

        }

    }


    //----------------------------------
    // レジスト中なら戦闘終了しない
    //----------------------------------

    if(resistMode){

        console.log(
            "レジスト中なので戦闘終了停止"
        );


        return;

    }


    //----------------------------------
    // バトル解決
    //----------------------------------

    setTimeout(()=>{

        resolveBattle();

        finishAttack();

    },1000);

}

//======================================
// 攻撃終了
//======================================
function finishAttack(){


    clearAttackHighlight();


    attackMode = false;


    if(attackingSummon){

        console.log(
            "攻撃終了",
            attackingSummon.card.name
        );

    }


    attackingSummon = null;

    attackTarget = null;



    //----------------------------------
    // レジスト状態終了
    //----------------------------------

    for(const card of selectableResistCards){
        card.setSelected(false);
    }

    resistMode = false;

    selectableResistCards = [];

    resistUsingCard = null;

    selectedResistCostCards = [];

    resistCostConfirm = false;



    //----------------------------------
    // イベント終了
    //----------------------------------

    currentResistEvent = null;

//----------------------------------
// ブロック発光解除
//----------------------------------

for(const summon of selectableBlockSummons){

    summon.view.setHighlight(
        false
    );

}

    //----------------------------------
// ブロック状態終了
//----------------------------------

blockMode = false;

selectableBlockSummons = [];

blockingSummon = null;


    updateGameState();

}


//======================================
// 攻撃対象表示
//======================================

function highlightAttackTargets(){

    //----------------------------------
    // 攻撃者の能力確認
    //----------------------------------

    const canAttackVertical =
        attackingSummon &&
        attackingSummon.card.ability?.type ===
        "attackVerticalSummon";


    //----------------------------------
    // 相手サモン
    //----------------------------------

    enemyField.forEach(summon=>{

        //----------------------------------
        // 通常
        // ヨコ向きサモンのみ
        //----------------------------------

        if(summon.isRest){

            summon.view.setTarget(true);

            return;

        }


        //----------------------------------
        // ケルピー
        // タテ向きサモンも対象
        //----------------------------------

        if(canAttackVertical){

            summon.view.setTarget(true);

        }

    });


    //----------------------------------
    // プレイヤー
    //----------------------------------

    const icon =
        document.getElementById(
            "enemy-player-icon"
        );


    if(icon){

        icon.classList.add(
            "attack-target"
        );

    }

}


//======================================
// 表示解除
//======================================

function clearAttackHighlight(){


    enemyField.forEach(summon=>{


        summon.view.setTarget(false);


    });


    const icon =
    document.getElementById(
        "enemy-player-icon"
    );


    if(icon){

        icon.classList.remove(
            "attack-target"
        );

    }

}



//======================================
// プレイヤーダメージ
//======================================
function damagePlayer(
    player,
    damage,
    skipResist = false,
    sourceCard = null
){

    console.log(
        "damagePlayer source",
        sourceCard,
        sourceCard?.elementType
    );


    //----------------------------------
    // 元ダメージを保存
    //----------------------------------

    const originalDamage =
        damage;


    //----------------------------------
    // ガーゴイルによるダメージ軽減
    //----------------------------------

    const field =
        player === PLAYER
        ?
        playerField
        :
        enemyField;


    const gargoyle =
        field.find(
            summon =>
                !summon.destroyed &&
                summon.card.ability?.type ===
                "reducePlayerDamage"
        );


    if(gargoyle){

        const reduction =
            gargoyle.card.ability.value ?? 1;


        damage =
            Math.max(
                0,
                damage - reduction
            );


        console.log(
            "ガーゴイル：ダメージ軽減",
            "元ダメージ=",
            originalDamage,
            "軽減=",
            reduction,
            "軽減後=",
            damage
        );

    }


    //----------------------------------
    // レジストをスキップする場合
    //----------------------------------

    if(skipResist){

        console.log(
            "レジストスキップ：確定ダメージ",
            damage
        );


        //----------------------------------
        // バトルログ
        //----------------------------------

        if(damage > 0){

            const damageTarget =
                player === PLAYER
                ?
                "PLAYER"
                :
                "CPU";


            addBattleLog(
                `${damageTarget}：${damage}ダメージ`
            );

        }


        //----------------------------------
        // ダメージ適用
        //----------------------------------

        applyPlayerDamage(
            player,
            damage
        );


        return;

    }


    //----------------------------------
    // レジスト用イベント作成
    //----------------------------------

    const event = {

        type:
            GAME_EVENT.BEFORE_PLAYER_DAMAGE,

        player:
            player,

        damage:
            damage,

        source:
            sourceCard,

        sourceType:
            sourceCard?.type,

        element:
            sourceCard?.elementType

    };


    //----------------------------------
    // レジスト確認
    //----------------------------------

    const resist =
        emitGameEvent(event);


    //----------------------------------
    // レジスト待機
    //----------------------------------

    if(resist){

        console.log(
            "レジスト待機",
            "ガーゴイル軽減後ダメージ=",
            event.damage
        );


        pendingDamage = {

            event:
                event

        };


        return;

    }


    //----------------------------------
    // レジストなし
    //----------------------------------

    const finalDamage =
        event.damage;


    console.log(
        "レジストなし：確定ダメージ",
        finalDamage
    );


    //----------------------------------
    // バトルログ
    //----------------------------------

    if(finalDamage > 0){

        const damageTarget =
            player === PLAYER
            ?
            "PLAYER"
            :
            "CPU";


        addBattleLog(
            `${damageTarget}：${finalDamage}ダメージ`
        );

    }


    //----------------------------------
    // ダメージ適用
    //----------------------------------

    applyPlayerDamage(
        player,
        finalDamage
    );

}

function applyPlayerDamage(
    player,
    damage
){

    if(player === PLAYER){

        game.playerLife -= damage;


        showPlayerDamageNumber(
            "player",
            damage
        );


    }else{

        game.enemyLife -= damage;


        showPlayerDamageNumber(
            "enemy",
            damage
        );

    }


    updateLifeDisplay();

    checkGameOver();

}


//======================================
// ライフ表示更新
//======================================

function updateLifeDisplay(){

    const playerLife =
        document.getElementById(
            "player-life-value"
        );

    if(playerLife){

        playerLife.textContent =
            game.playerLife;

    }


    const enemyLife =
        document.getElementById(
            "enemy-life-value"
        );

    if(enemyLife){

        enemyLife.textContent =
            game.enemyLife;

    }

}



//======================================
// 勝敗判定
//======================================
function checkGameOver(){

    //----------------------------------
    // プレイヤー敗北
    //----------------------------------

    if(game.playerLife <= 0){

        //----------------------------------
        // CPU行動を強制停止
        //----------------------------------

        battleGameEnding = true;

        finishBattleGame(
            ENEMY
        );

        return;

    }


    //----------------------------------
    // プレイヤー勝利
    //----------------------------------

    if(game.enemyLife <= 0){

        //----------------------------------
        // CPU行動を強制停止
        //----------------------------------

        battleGameEnding = true;

        finishBattleGame(
            PLAYER
        );

        return;

    }

}


//======================================
// 完全リセット
//======================================

function resetAttackState(){

    hideActionGuide();
    
    attackingSummon = null;

    attackTarget = null;

    attackMode = false;


    clearAttackHighlight();


    console.log(
        "攻撃状態リセット"
    );

}

//======================================
// ブロックしない
//======================================

function skipBlock(){

    hideActionGuide();


    console.log(
        "ブロックしない"
    );


    //----------------------------------
    // ブロック状態解除
    //----------------------------------

    blockMode =
        false;


    selectableBlockSummons =
        [];


    //----------------------------------
    // ハイライト解除
    //----------------------------------

    playerField.forEach(
        summon => {

            summon.view.setHighlight(
                false
            );

        }
    );


    //----------------------------------
    // 攻撃者確認
    //----------------------------------

    if(!attackingSummon){

        console.log(
            "ブロックなし：攻撃者なし"
        );


        finishAttack();

        return;

    }


    //----------------------------------
    // プレイヤーへのダメージ
    //
    // ★重要
    //
    // ここで必ず
    //
    // 攻撃力
    // ↓
    // ガーゴイル軽減
    // ↓
    // レジスト
    //
    // の順番にする
    //----------------------------------

    damagePlayer(

        PLAYER,

        getPower(attackingSummon),

        false,

        attackingSummon.card

    );


    //----------------------------------
    // レジスト待機
    //----------------------------------

    if(resistMode){

        console.log(
            "レジスト待機"
        );


        waitingAttackAfterResist =
            true;


        return;

    }


    //----------------------------------
    // レジストなし
    //----------------------------------

    resolveBattle();


    finishAttack();


    //----------------------------------
    // CPU攻撃なら次へ
    //----------------------------------

    if(
        game.currentPlayer === ENEMY
    ){

        cpuAttackIndex++;


        setTimeout(
            cpuNextAttack,
            2000
        );

    }

}

//======================================
// レジスト終了後に攻撃再開
//======================================

function resumePlayerDamage(){

    if(!currentResistEvent){

        console.log(
            "レジスト後ダメージ：イベントなし"
        );

        return;

    }


    //----------------------------------
    // イベント取得
    //----------------------------------

    const event =
        currentResistEvent;


    //----------------------------------
    // 最終ダメージ
    //
    // ガーゴイル軽減とレジスト処理は
    // すでにイベント側で完了している
    //----------------------------------

    const finalDamage =
        Math.max(
            0,
            event.damage
        );


    console.log(
        "レジスト後ダメージ",
        finalDamage
    );


    //----------------------------------
    // ダメージ0
    //----------------------------------

    if(finalDamage <= 0){

        console.log(
            "ダメージ無効"
        );


        currentResistEvent =
            null;


        resolveBattle();

        finishAttack();


        return;

    }


    //----------------------------------
    // プレイヤーへのダメージ
    //
    // ★ damagePlayer() は呼ばない
    //----------------------------------

    applyPlayerDamage(

        event.player,

        finalDamage

    );


    //----------------------------------
    // AFTERイベント
    //----------------------------------

    emitGameEvent({

        type:
            GAME_EVENT.AFTER_PLAYER_DAMAGE,

        player:
            event.player,

        damage:
            finalDamage

    });


    //----------------------------------
    // イベント終了
    //----------------------------------

    currentResistEvent =
        null;


    //----------------------------------
    // 戦闘解決
    //----------------------------------

    resolveBattle();

    finishAttack();

}

//======================================
// 攻撃可能表示更新
//======================================

function updateAttackHighlight(){


    playerField.forEach(summon=>{


        if(
            game.currentPlayer === PLAYER &&
            summon.attackReady &&
            !summon.isRest &&
            !summonCard &&
            !magiaCard &&
            !resistUsingCard &&
            !attackMode
        ){

            summon.view.setHighlight(true);

        }else{

            summon.view.setHighlight(false);

        }


    });


}

//======================================
// ブロック可能サモン取得
//======================================

function findBlockSummons(){

    //----------------------------------
    // 攻撃者のブロック不可能力
    //----------------------------------

    if(
        attackingSummon &&
        attackingSummon.card &&
        attackingSummon.card.ability &&
        attackingSummon.card.ability.type ===
        "cannotBeBlocked"
    ){

        console.log(
            "ブロック不可",
            attackingSummon.card.name
        );

        return [];

    }


    const result = [];


    //----------------------------------
    // 攻撃者によってブロック側を変更
    //----------------------------------

    const field =
        attackingSummon.owner === PLAYER
        ?
        enemyField
        :
        playerField;


    for(const summon of field){

        //----------------------------------
        // 横向きサモン除外
        //----------------------------------

        if(summon.isRest){

            continue;

        }


        //----------------------------------
        // 破壊済み除外
        //----------------------------------

        if(summon.destroyed){

            continue;

        }


        result.push(summon);

    }


    return result;

}

//======================================
// ブロック開始
//======================================

function startBlock(blockers){

    console.log(
        "ブロック開始"
    );

    //----------------------------------
    // 行動案内
    //----------------------------------

    showActionGuide(
        "ブロックを行いますか？"
    );

    //----------------------------------
    // ブロックモード開始
    //----------------------------------

    blockMode = true;
   
    //----------------------------------
    // 選択可能サモン保存
    //----------------------------------

    selectableBlockSummons = blockers;
    updateButtons();
 
    //----------------------------------
    // ブロック可能サモンを発光
    //----------------------------------

    for(const summon of blockers){

        summon.view.setHighlight(
            true
        );

    }

}

//======================================
// ブロック実行
//======================================

function executeBlock(blocker){

    hideActionGuide();

console.log(
    "executeBlock ゴーレム確認",
    blocker?.card?.name,
    blocker?.card?.ability
);

    //----------------------------------
    // ブロッカー保存
    //----------------------------------

    blockingSummon = blocker;


    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `PLAYER：${blocker.card.name}が${attackingSummon.card.name}をブロック`
    );

    //----------------------------------
    // 横向きにする
    //----------------------------------

    blocker.isRest = true;

    blocker.view.setHorizontal(
        true
    );


//----------------------------------
// バジリスク：バトル相手を記録
//----------------------------------

setBasiliskBattleTarget(
    attackingSummon,
    blocker
);

    //----------------------------------
    // ダメージ交換
    //----------------------------------

    dealDamage(
        attackingSummon,
        getPower(blocker)
    );

    //----------------------------------
// ゴーレム：ブロック時はダメージを受けない
//----------------------------------

if(
    blocker.card.ability?.type ===
    "noDamageWhenBlocking"
){

    console.log(
        "ゴーレム：ブロック時のダメージ無効",
        blocker.card.name
    );

}else{

    dealDamage(
        blocker,
        getPower(attackingSummon)
    );

}

    //----------------------------------
    // 戦闘解決
    //----------------------------------

    resolveBattle();

    //----------------------------------
    // 攻撃終了
    //----------------------------------

    finishAttack();
    hideActionGuide();

    //----------------------------------
    // CPUターンなら次の攻撃へ
    //----------------------------------

    if(
        game.currentPlayer === ENEMY
    ){

        console.log(
            "CPU：ブロック処理完了、次の攻撃へ"
        );

        setTimeout(
            cpuNextAttack,
            2000
        );

    }

}


function executeCpuBlock(
    blockers,
    attacker
){

    console.log(
        "=== CPUブロック実行 ===",
        {
            attacker:
            attacker.card.name,

            blockers:
            blockers.map(
                summon =>
                    summon.card.name
            )
        }
    );


    //----------------------------------
    // 使用するブロッカーを決定
    //----------------------------------

    const blocker =
    cpuSelectedBlocker ||
    blockers[0];


    if(!blocker){

        console.log(
            "CPUブロッカーなし"
        );

        return false;

    }

        console.log(
    "executeCpuBlock ゴーレム確認",
    blocker?.card?.name,
    blocker?.card?.ability
);


    //----------------------------------
    // 攻撃者をブロック対象にする
    //----------------------------------

    console.log(
        "CPUブロッカー",
        blocker.card.name
    );

    //----------------------------------
// バトルログ
//----------------------------------

addBattleLog(
    `CPU：${blocker.card.name}が${attacker.card.name}をブロック`
);

//----------------------------------
// バジリスク：バトル相手を記録
//----------------------------------

setBasiliskBattleTarget(
    attacker,
    blocker
);


 //----------------------------------
// ブロッカーから攻撃者へのダメージ
//----------------------------------

dealDamage(
    attacker,
    getPower(blocker)
);


//----------------------------------
// ゴーレム：ブロック時はダメージを受けない
//----------------------------------

if(
    blocker.card.ability?.type ===
    "noDamageWhenBlocking"
){

    console.log(
        "ゴーレム：ブロック時のダメージ無効",
        blocker.card.name
    );

}else{

    dealDamage(
        blocker,
        getPower(attacker)
    );

}
    //----------------------------------
    // ブロッカーも攻撃済みにする
    //----------------------------------

    blocker.isRest = true;

    blocker.view.setHorizontal(
        true
    );


    //----------------------------------
    // 戦闘解決
    //----------------------------------

    setTimeout(()=>{

        resolveBattle();

        //----------------------------------
        // CPUブロッカー選択をリセット
        //----------------------------------

        cpuSelectedBlocker = null;


        //----------------------------------
        // 攻撃終了
        //----------------------------------

        finishAttack();

    },1000);


    return true;

}