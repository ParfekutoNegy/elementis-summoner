//======================================
// 発動中イベント
//======================================

let currentResistEvent = null;

let resistPassedThisEvent = false;

//======================================
// バトルボム
// 対象選択状態
//======================================

let battleBombSelecting = false;

let battleBombTargetCandidates = [];

//======================================
// ヒートストレングス
// 対象選択状態
//======================================

let heatStrengthSelecting = false;

let heatStrengthTargetCandidates = [];

//======================================
// ファストコール
// 相手ターン中の召喚管理
//======================================

// 相手ターン中にファストコールで
// サモンを召喚したかどうか

let fastCallSummonUsed = false;

//--------------------------------------
// ファストコール効果処理中
//--------------------------------------

let fastCallSelectingSummon = false;

let fastCallSelectedSummon = null;


//--------------------------------------
// ファストコールによる召喚が可能か
//--------------------------------------

function canFastCallSummon(){

    // 自分のターン中は使用不可
    if(game.currentPlayer !== ENEMY){

        return false;

    }

    // 相手ターン中に召喚済み
    if(fastCallSummonUsed){

        return false;

    }

    return true;

}


//--------------------------------------
// ファストコールによる召喚成立
//--------------------------------------

function registerFastCallSummon(){

    fastCallSummonUsed = true;

    console.log(
        "ファストコール：相手ターン中の召喚完了"
    );

}


//--------------------------------------
// 相手ターン用の召喚回数をリセット
//--------------------------------------

function resetFastCallSummon(){

    fastCallSummonUsed = false;

    console.log(
        "ファストコール：召喚回数リセット"
    );

}

//======================================
// レジスト発動開始
//======================================

function startResist(card){

    //----------------------------------
    // 他カードの使用可能表示解除
    //----------------------------------

    board.handCards.forEach(c=>{

        c.setHighlight(false);

    });

    console.log(
        "レジスト発動開始",
        card
    );

    resistUsingCard = card;

    selectedResistCostCards = [];

    resistCostConfirm = false;

    startResistCost();

}


//======================================
// レジスト コスト開始
//======================================

function startResistCost(){

    console.log(
        "レジスト コスト開始",
        resistUsingCard
    );

    //----------------------------------
    // 初期化
    //----------------------------------

    selectedResistCostCards = [];

    resistCostConfirm = false;


    //----------------------------------
    // 現在のコスト取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            resistUsingCard
        );


    //----------------------------------
    // 行動案内
    //----------------------------------

    if(currentCost > 0){

if(resistUsingCard?.effect === "multiShield"){

    showActionGuide(
        `コストゾーンに置くカードを<br>${currentCost}枚以上選んでください。`
    );

}else{

    showActionGuide(
        `コストゾーンに置くカードを<br>${currentCost}枚選んでください。`
    );

}

    }


    //----------------------------------
    // 0コストなら選択不要
    //----------------------------------

    if(currentCost === 0){

        resistCostConfirm = true;

    }


    //----------------------------------
    // ボタン表示
    //----------------------------------

    document.getElementById(
        "cost-action-area"
    ).style.display = "flex";


    updateButtons();

}


//======================================
// レジスト コストカード選択
//======================================

function selectResistCostCard(card){

    //----------------------------------
    // レジスト自身は選択不可
    //----------------------------------

    if(card === resistUsingCard){

        return;

    }


    //----------------------------------
    // 現在のコスト取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            resistUsingCard
        );


    //----------------------------------
    // 0コストなら選択不要
    //----------------------------------

    if(currentCost === 0){

        resistCostConfirm = true;

        updateButtons();

        return;

    }


    //----------------------------------
    // 選択解除
    //----------------------------------

if(selectedResistCostCards.includes(card)){

    selectedResistCostCards =
        selectedResistCostCards.filter(
            c => c !== card
        );

    card.setCostSelected(false);

    //==================================
    // コスト選択解除後の決定判定
    //==================================

    const currentCost =
        getCurrentCardCost(resistUsingCard);

    resistCostConfirm =
        selectedResistCostCards.length >= currentCost;

    updateButtons();

    return;
}


//======================================
// マルチシールドは追加コストを許可
//======================================

const isMultiShield =
    resistUsingCard?.effect === "multiShield";

if(
    !isMultiShield &&
    selectedResistCostCards.length >= currentCost
){

    return;

}


    //----------------------------------
    // コスト追加
    //----------------------------------

    selectedResistCostCards.push(card);

    card.setCostSelected(true);


//======================================
// コスト選択完了判定
//======================================

if(
    isMultiShield
        ? selectedResistCostCards.length >= currentCost
        : selectedResistCostCards.length === currentCost
){

    resistCostConfirm = true;

}


    console.log(
        "選択枚数",
        selectedResistCostCards.length,
        "/",
        currentCost
    );


    console.log(
        "updateButtons呼び出し"
    );


    updateButtons();

}


//======================================
// レジストボタン更新
//======================================

function updateResistButtons(){

    const actionArea =
    document.getElementById(
        "cost-action-area"
    );

    const confirmButton =
    document.getElementById(
        "confirm-button"
    );

    const cancelButton =
    document.getElementById(
        "cancel-button"
    );


    actionArea.style.display =
    "flex";


    //----------------------------------
    // キャンセル
    //----------------------------------

    cancelButton.style.display =
    "inline-block";


    cancelButton.onclick =
    cancelResist;



    //----------------------------------
    // 確定ボタン
    //----------------------------------

    confirmButton.textContent =
    "決定";


    confirmButton.onclick =
    payResistCost;



    if(resistCostConfirm){

        confirmButton.style.display =
        "inline-block";

    }
    else{

        confirmButton.style.display =
        "none";

    }

}

//======================================
// レジスト コスト支払い
//======================================

function payResistCost(){

    console.log(
        "payResistCost"
    );

// マルチシールドの支払いコストを記録
if(resistUsingCard?.effect === "multiShield"){

    resistUsingCard.paidCost =
        selectedResistCostCards.length;

    console.log(
        "マルチシールド支払コスト：",
        resistUsingCard.paidCost
    );

}

  //======================================
// ファストコール
// コスト支払い後の召喚可否を確認
//======================================

if(resistUsingCard?.effect === "fastCall"){

    // レジストコスト支払い後に残る手札
    const remainingCards =
        board.handCards.filter(card =>
            card !== resistUsingCard &&
            !selectedResistCostCards.includes(card)
        );

    // 召喚可能なサモンが残るか確認
    const canSummon =
        remainingCards.some(card => {

            if(card.type !== "サモン"){
                return false;
            }

            if(
                !canPlaySummonByElementRestriction(
                    PLAYER,
                    card
                )
            ){
                return false;
            }

            const requiredCost =
                getCurrentCardCost(
                    card,
                    PLAYER
                );

            // 召喚するサモン自身を除いた
            // 残りの手札でコストを支払えるか
            return (
                remainingCards.length - 1 >=
                requiredCost
            );

        });

    if(!canSummon){

        console.log(
            "召喚可能なサモンが残りません。"
        );

        showActionGuide(
            "プレイ可能なサモンを手札に残してください。"
        );

        return;
    }

}  



    //==================================
    // カードプレイ成立
    //
    // ジャックフロスト等の
    // プレイ枚数管理
    //==================================

    registerCardPlay(
        PLAYER,
        resistUsingCard
    );


    //----------------------------------
    // コスト支払い
    //----------------------------------

    selectedResistCostCards.forEach(card=>{

        card.setCostSelected(false);

        moveToCost(card);

    });


    //----------------------------------
    // 表示状態解除
    //----------------------------------

    resistUsingCard.setSelected(false);
    resistUsingCard.setTarget(false);


    //----------------------------------
    // レジストを手札から除去
    //----------------------------------

    board.removeHandCard(
        resistUsingCard
    );


    //----------------------------------
    // クールへ送る
    // サンドプロテクトは手札へ戻るため除外
    //----------------------------------

    if(
        resistUsingCard.name !==
        "サンドプロテクト"
    ){

        board.addCoolCard(
            resistUsingCard,
            PLAYER
        );

    }


    //----------------------------------
    // このイベントでは再使用不可
    //----------------------------------

    resistUsingCard.usedThisEvent = true;


//----------------------------------
// ファストコール判定
//----------------------------------

const isFastCall =
    resistUsingCard.effect === "fastCall";


//----------------------------------
// 効果発動
//----------------------------------

activateResist(
    resistUsingCard
);


    //----------------------------------
    // 状態リセット
    //----------------------------------

    selectedResistCostCards = [];


    //----------------------------------
    // レジスト表示解除
    //----------------------------------

    board.handCards.forEach(card=>{

        if(card.type === "レジスト"){

            card.setHighlight(false);

        }

    });


    if(resistUsingCard){

        resistUsingCard.setHighlight(false);
        resistUsingCard.setSelected(false);
        resistUsingCard.setCostSelected(false);

    }


    resistUsingCard = null;

    resistCostConfirm = false;

    resistMode = false;

    selectableResistCards = [];


    //----------------------------------
    // ボタンを通常状態へ戻す
    //----------------------------------

    document.getElementById(
        "confirm-button"
    ).onclick =
        payCost;


//----------------------------------
// ファストコールの場合は
// サモンの召喚完了まで待機
//----------------------------------

//======================================
// レジスト終了判定
//======================================
//
// ファストコール：召喚完了待機
// バトルボム：対象選択完了待機
// ヒートストレングス：対象選択完了待機
//======================================

if(
    !isFastCall &&
    !battleBombSelecting &&
    !heatStrengthSelecting
){

    finishResist();

}

updateButtons();

}


//======================================
// キャンセレーション終了後のボタン復帰
//======================================

function restoreCancellationButtons(){

    const actionArea =
        document.getElementById(
            "cost-action-area"
        );

    [
        "use-button",
        "cancel-button",
        "confirm-button"
    ].forEach(id => {

        const button =
            document.getElementById(id);

        if(button){

            button.disabled = false;

            // 表示状態はupdateButtonsに任せる
            button.style.display = "";

        }

    });

    if(actionArea){

        actionArea.style.display = "";

    }

    updateButtons();

}

//======================================
// キャンセレーション終了後のボタン復帰
//======================================

function restoreCancellationButtons(){

    const actionArea =
        document.getElementById(
            "cost-action-area"
        );

    [
        "use-button",
        "cancel-button",
        "confirm-button"
    ].forEach(id => {

        const button =
            document.getElementById(id);

        if(button){

            button.disabled = false;

            // 表示状態はupdateButtonsに任せる
            button.style.display = "";

        }

    });

    if(actionArea){

        actionArea.style.display = "";

    }

    updateButtons();

}

//======================================
// キャンセレーション
// PLAYER・CPU共通
//======================================

function cancelMagia(card, event){

    //----------------------------------
    // イベント確認
    //----------------------------------

    if(
        !event ||
        (
            event.type !== GAME_EVENT.ENEMY_PLAY_CARD &&
            event.type !== GAME_EVENT.PLAY_CARD
        ) ||
        event.sourceType !== "マギア"
    ){

        return;

    }


    //----------------------------------
    // マギアの無効化
    //----------------------------------

    event.cancelled = true;

    //======================================
// キャンセレーション成立時
// 操作ボタンを非表示・無効化
//======================================

const actionArea =
    document.getElementById("cost-action-area");

const buttonIds = [
    "use-button",
    "cancel-button",
    "confirm-button"
];

buttonIds.forEach(id => {

    const button =
        document.getElementById(id);

    if(button){

        button.style.display = "none";
        button.disabled = true;

    }

});

if(actionArea){
    actionArea.style.display = "none";
}

//======================================
// 元のマギアの操作案内を消去
//======================================

if(typeof hideActionGuide === "function"){

    hideActionGuide();

}


    //----------------------------------
    // 無効化したマギアの名前
    //----------------------------------

    const magiaName =
        event.source?.card?.name ??
        event.source?.name ??
        event.card?.name ??
        "相手のマギア";


    //----------------------------------
    // 使用者
    //----------------------------------

    const userName =
        card.owner === ENEMY
            ? "CPU"
            : "PLAYER";


    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "キャンセレーション：マギア無効化",
        userName,
        magiaName
    );


    addBattleLog(
        `${userName}：${magiaName}の効果を無効化`
    );

}

//======================================
// ファストコール
//======================================

function fastCall(card, event){

    console.log(
        "ファストコール発動",
        event
    );

    //----------------------------------
    // 相手ターン中の召喚制限
    //----------------------------------

    if(!canFastCallSummon()){

        console.log(
            "ファストコール：召喚不可"
        );

        return;
    }

    //----------------------------------
    // 手札のサモンを取得
    //----------------------------------

    const summonCards =
        board.handCards.filter(
            c => c.type === "サモン"
        );

    //----------------------------------
    // 選択状態を開始
    //----------------------------------

    fastCallSelectingSummon = true;

    fastCallSelectedSummon = null;

    //----------------------------------
// ファストコール：サモン選択案内
//----------------------------------

showActionGuide(
    "プレイするサモンを選んでください。"
);

    //----------------------------------
// 召喚可能なサモンを発光
//----------------------------------

updateHandHighlight();
updateButtons();

    console.log(
        "ファストコール：サモン選択開始",
        summonCards.map(c => c.name)
    );

}

//======================================
// ファストコール
// サモン選択
//======================================

function selectFastCallSummon(card){

    if(!fastCallSelectingSummon){

        return;

    }

    //----------------------------------
    // 手札のサモンのみ選択可能
    //----------------------------------

    if(
        card.area !== "hand" ||
        card.type !== "サモン" ||
        !board.handCards.includes(card)
    ){

        return;

    }

    //----------------------------------
    // 選択状態を更新
    //----------------------------------

    board.handCards.forEach(c => {

        c.setSelected(false);

    });

    fastCallSelectedSummon = card;

    card.setSelected(true);

    showCardInfo(card);

    console.log(
        "ファストコール：サモン選択",
        card.name
    );

}

//======================================
// ヒートストレングス
// バトル参加サモンのパワーを＋2
//======================================

function heatStrength(card, event){

    console.log(
        "ヒートストレングス：効果処理開始"
    );

    //----------------------------------
    // イベント確認
    //----------------------------------

    if(
        !event ||
        event.type !== GAME_EVENT.BATTLE_START
    ){

        console.warn(
            "ヒートストレングス：バトル開始イベントではありません"
        );

        return;
    }

    //----------------------------------
    // 対象候補
    //----------------------------------

    const candidates =
        (event.participants || []).filter(
            summon =>
                summon instanceof Summon &&
                !summon.destroyed
        );

    if(candidates.length === 0){

        console.warn(
            "ヒートストレングス：対象なし"
        );

        return;
    }

//======================================
// CPUの場合
//======================================

if(card.owner === ENEMY){

    //----------------------------------
    // CPU側のバトル参加サモンを優先
    //----------------------------------

    const target =
        candidates.find(
            summon =>
                summon.owner === ENEMY
        ) ?? candidates[0];

    if(!target){

        console.warn(
            "CPUヒートストレングス：対象なし"
        );

        return;
    }

    //----------------------------------
    // このターン中パワー＋2
    //----------------------------------

    addTemporaryPower(
        target,
        2
    );

    //----------------------------------
    // ログ
    //----------------------------------

    console.log(
        "CPUヒートストレングス：対象",
        target.card.name,
        "現在パワー",
        getPower(target)
    );

    addBattleLog(
        `CPU：ヒートストレングスで${target.card.name}のパワー＋2`
    );

    //----------------------------------
    // 対象候補をクリア
    //----------------------------------

    heatStrengthSelecting = false;

    heatStrengthTargetCandidates = [];

    //----------------------------------
    // 重要
    // ここではfinishResist()しない
    // CPU側の終了処理に任せる
    //----------------------------------

    return;
}

    //----------------------------------
    // PLAYERの場合
    //----------------------------------

    heatStrengthSelecting = true;

    heatStrengthTargetCandidates =
        candidates;

    //----------------------------------
    // 対象を発光
    //----------------------------------

    candidates.forEach(summon => {

        const element =
            summon.view?.getElement?.();

        if(element){

            element.classList.add(
                "magia-target"
            );
        }

    });

    showActionGuide(
        "ヒートストレングスの対象を選んでください。"
    );

    console.log(
        "ヒートストレングス：対象選択待機"
    );

}


//======================================
// ヒートストレングス
// 対象確定
//======================================

function selectHeatStrengthTarget(summon){

    if(!heatStrengthSelecting){

        return false;
    }

    if(
        !heatStrengthTargetCandidates.includes(
            summon
        ) ||
        summon.destroyed
    ){

        return false;
    }

    //----------------------------------
    // パワー＋2
    //----------------------------------

    addTemporaryPower(
        summon,
        2
    );

    addBattleLog(
        `ヒートストレングス：${summon.card.name}のパワー＋2`
    );

    //----------------------------------
    // 発光解除
    //----------------------------------

    heatStrengthTargetCandidates.forEach(
        candidate => {

            candidate.view
                ?.getElement?.()
                ?.classList.remove(
                    "magia-target"
                );

        }
    );

    //----------------------------------
    // 状態解除
    //----------------------------------

    heatStrengthSelecting = false;

    heatStrengthTargetCandidates = [];

    hideActionGuide();

    //----------------------------------
    // レジスト終了
    //----------------------------------

    finishResist();

    return true;
}

//======================================
// バトルボム
// 効果処理
// PLAYER・CPU共通
//======================================

function battleBomb(card, event){

    console.log(
        "================================"
    );

    console.log(
        "バトルボム：効果処理開始",
        card.owner === ENEMY
            ? "CPU"
            : "PLAYER"
    );

    console.log(
        "================================"
    );


    //==================================
    // バトル開始イベント確認
    //==================================

    if(
        !event ||
        event.type !==
            GAME_EVENT.BATTLE_START
    ){

        console.warn(
            "バトルボム：バトル開始イベントではありません"
        );

        return;
    }


    //==================================
    // バトル参加サモン確認
    //==================================

    if(
        !Array.isArray(
            event.participants
        ) ||
        event.participants.length !== 2
    ){

        console.warn(
            "バトルボム：バトル参加サモンが不正です"
        );

        return;
    }


    //==================================
    // 対象候補取得
    //==================================

    battleBombTargetCandidates =
        event.participants.filter(
            summon =>
                summon instanceof Summon &&
                !summon.destroyed
        );


    if(
        battleBombTargetCandidates.length ===
            0
    ){

        console.warn(
            "バトルボム：選択可能な対象がありません"
        );

        return;
    }


    //==================================
    // 使用したバトルボムを記録
    //==================================

    battleBombSourceCard =
        card;

    battleBombTarget =
        null;


    //==================================
    // CPU使用
    //==================================

    if(
        card.owner === ENEMY
    ){

        console.log(
            "CPUバトルボム：対象自動選択開始"
        );


        //----------------------------------
        // PLAYER側の戦闘参加サモンを取得
        //----------------------------------

        const playerTarget =
            battleBombTargetCandidates.find(
                summon =>
                    summon.owner ===
                        PLAYER
            );


        //----------------------------------
        // PLAYER側サモンがない場合
        // 念のため候補先頭
        //----------------------------------

        const target =
            playerTarget ??
            battleBombTargetCandidates[0];


        if(!target){

            console.warn(
                "CPUバトルボム：対象なし"
            );

            battleBombTargetCandidates =
                [];

            battleBombSelecting =
                false;

            return;
        }


        //----------------------------------
        // CPUはクリック待ちにしない
        //----------------------------------

        battleBombSelecting =
            false;

        battleBombTarget =
            target;


        //----------------------------------
        // 対象候補クリア
        //----------------------------------

        battleBombTargetCandidates =
            [];


        //----------------------------------
        // ログ
        //----------------------------------

        console.log(
            "CPUバトルボム：対象確定",
            target.card?.name
        );


        addBattleLog(
            `CPU：バトルボムで${target.card.name}を対象に選択`
        );


        //==================================
        // 重要
        //
        // ここでは finishResist() を
        // 呼ばない。
        //
        // useCpuResist() 側の
        // CPUレジスト終了処理へ戻す。
        //==================================

        return;
    }


    //==================================
    // PLAYER使用
    // 従来通り手動対象選択
    //==================================

    battleBombSelecting =
        true;


    //==================================
    // 対象候補発光
    //==================================

    battleBombTargetCandidates.forEach(
        summon => {

            const element =
                summon.view?.getElement?.();


            if(!element){

                console.warn(
                    "バトルボム：DOM取得失敗",
                    summon.card?.name
                );

                return;
            }


            element.classList.add(
                "magia-target"
            );

        }
    );


    //==================================
    // 対象候補ログ
    //==================================

    console.log(
        "バトルボム：対象選択開始"
    );

    console.log(
        "選択可能なサモン：",
        battleBombTargetCandidates.map(
            summon =>
                summon.card.name
        )
    );


    //==================================
    // 操作案内
    //==================================

    showActionGuide(
        "バトルボムの対象を選んでください。"
    );


    console.log(
        "バトルボム：対象選択待機中"
    );

}

//======================================
// バトルボム
// 対象サモンの確定
//======================================

function selectBattleBombTarget(summon){

    //==================================
    // 対象選択中か確認
    //==================================

    if(!battleBombSelecting){

        return false;

    }


    //==================================
    // バトル開始イベント確認
    //==================================

    if(
        !currentResistEvent ||
        currentResistEvent.type !==
            GAME_EVENT.BATTLE_START
    ){

        console.warn(
            "バトルボム：バトル開始イベントがありません"
        );

        return false;

    }


    //==================================
    // 選択可能な対象か確認
    //==================================

    if(
        !(summon instanceof Summon) ||
        !battleBombTargetCandidates.includes(
            summon
        ) ||
        summon.destroyed
    ){

        console.warn(
            "バトルボム：選択できない対象です"
        );

        return false;

    }


    //==================================
    // 対象確定
    //==================================

    battleBombTarget =
        summon;

    battleBombSelecting =
        false;


    //==================================
    // バトルボム
    // 対象候補の青白い発光を解除
    //
    // summon.view はDOMそのものではないため
    // getElement() で取得する
    //==================================

    battleBombTargetCandidates.forEach(
        candidate => {

            if(
                !candidate ||
                !candidate.view ||
                typeof candidate.view.getElement !==
                    "function"
            ){

                return;

            }


            const element =
                candidate.view.getElement();


            if(
                element &&
                element.classList
            ){

                element.classList.remove(
                    "magia-target"
                );

            }

        }
    );


    //==================================
    // 対象候補をクリア
    //
    // 発光解除後に行う
    //==================================

    battleBombTargetCandidates =
        [];


    //==================================
    // ログ
    //==================================

    console.log(
        "バトルボム：対象確定",
        summon.card.name
    );


    addBattleLog(
        `バトルボム：${summon.card.name}を対象に選択`
    );


    //==================================
    // 行動案内を解除
    //==================================

    if(
        typeof hideActionGuide ===
            "function"
    ){

        hideActionGuide();

    }


    //==================================
    // UI更新
    //==================================

    if(
        typeof updateButtons ===
            "function"
    ){

        updateButtons();

    }


    //==================================
    // レジスト終了
    //
    // battleBombTarget は保持したまま
    // バトル開始イベントを再開する
    //==================================

    finishResist();


    return true;

}

//======================================
// レジスト効果一覧
//======================================

const resistEffects = {

    stoneGuard,
    groundwall,
    waterBarrier,
    diamondSkin,
    liquidVeil,
    rapidMove,
    sandProtect,
    illusionFog,
    multiShield,

    fastCall,
    cancelMagia,

    battleBomb,
    heatStrength

};


//======================================
// レジスト効果
//======================================

function activateResist(card){

    console.log(
        "レジスト発動",
        card.name
    );

     //----------------------------------
    // 行動案内を消す
    //----------------------------------

    hideActionGuide();

    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `PLAYER：${card.name}を使用`
    );

    const effect =
    resistEffects[card.effect];

    if(effect){

        effect(
            card,
            currentResistEvent
        );

    }

//----------------------------------
// ファストコールの場合は
// サモンの召喚完了まで待機
//----------------------------------

if(card.effect === "fastCall"){

    console.log(
        "ファストコール：サモン選択待機"
    );

    return;

}

//======================================
// バトルボム
//
// バトルボムは通常レジスト用の
// 2秒後 finishResist() を使用しない
//
// PLAYER
// → 対象クリック後
//   selectBattleBombTarget()
//   から finishResist()
//
// CPU
// → useCpuResist() 側で
//   対象自動確定後に finishResist()
//
// そのためここでは必ず終了する
//======================================

if(
    card.effect ===
        "battleBomb"
){

    if(
        battleBombSelecting
    ){

        console.log(
            "バトルボム：対象選択待機中"
        );

    }
    else{

        console.log(
            "バトルボム：専用終了処理待機"
        );

    }

    return;

}

//======================================
// ヒートストレングス
// 対象選択完了まで終了しない
//======================================

if(
    card.effect === "heatStrength"
){

    if(heatStrengthSelecting){

        console.log(
            "ヒートストレングス：対象選択待機中"
        );

    }
    else{

        console.log(
            "ヒートストレングス：専用終了処理待機"
        );

    }

    return;
}


//----------------------------------
// 通常レジスト
// 軽減後ダメージ処理へ
//----------------------------------

setTimeout(
    () => {

        finishResist();

    },
    2000
);


}

function passResist(){

    console.log(
        "レジストをプレイしない"
    );

    //----------------------------------
// このイベントでは
// これ以上レジストを使用しない
//----------------------------------

resistPassedThisEvent = true;


    //----------------------------------
    // 行動案内を消す
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // 現在のイベント確認
    //----------------------------------

    const event =
        currentResistEvent;


    if(!event){

        console.log(
            "レジストイベントなし"
        );

        return;

    }


    //----------------------------------
    // 手札モーダルを閉じる
    //----------------------------------

    closeHandModal();


    //----------------------------------
    // レジスト表示解除
    //----------------------------------

    selectableResistCards.forEach(
        card => {

            card.setSelected(false);

            card.setHighlight(false);

        }
    );


    selectableResistCards =
        [];


    //----------------------------------
    // レジストモード解除
    //----------------------------------

    resistMode =
        false;

//----------------------------------
// ダメージイベントの場合のみ
// ダメージを正規化
//----------------------------------

if(
    event.type !==
    GAME_EVENT.ENEMY_PLAY_CARD
){

    event.damage =
        Math.max(
            0,
            event.damage ?? 0
        );

}


    console.log(
        "レジストを使用せず解決へ",
        {
            type:
                event.type,

            target:
                event.target?.card?.name ??
                event.player,

            damage:
                event.damage
        }
    );


    //==================================
    // 重要
    //
    // ここでは
    //
    // dealDamage()
    // damagePlayer()
    //
    // を呼ばない。
    //
    // すでに BEFORE_*_DAMAGE の
    // レジスト判定まで終了しているため、
    // 再度呼ぶと同じイベントが
    // 発生してしまう。
    //
    // 残りダメージの処理は
    // finishResist() に任せる。
    //==================================


    finishResist();

}

//======================================
// レジスト選択開始
//======================================

function openResistSelect(){

    console.log(
        "レジスト選択開始"
    );

    //----------------------------------
    // レジストモード
    //----------------------------------

    resistMode = true;


    selectableResistCards =
        board.handCards.filter(
            card =>
            card.type === "レジスト"
        );


    console.log(
        "選択可能レジスト",
        selectableResistCards
    );

}


//======================================
// ストーンガード
//======================================

function stoneGuard(card){

    currentResistEvent.damage -= 3;

    if(currentResistEvent.damage < 0){

        currentResistEvent.damage = 0;

    }

}

//======================================
// グラウンドウォール
//======================================

function groundwall(card){

    currentResistEvent.damage -= 5;

    if(currentResistEvent.damage < 0){

        currentResistEvent.damage = 0;

    }

}

//======================================
// ウォーターバリア
//======================================
function waterBarrier(card){


    console.log(
        "ウォーターバリア発動"
    );


    currentResistEvent.damage = 0;


    console.log(
        "変更後ダメージ",
        currentResistEvent.damage
    );


}

//======================================
// ダイヤスキン
// プレイヤーが受けるダメージを0にする
//======================================

function diamondSkin(card){

    console.log(
        "ダイヤスキン発動"
    );

    currentResistEvent.damage = 0;

    console.log(
        "変更後ダメージ",
        currentResistEvent.damage
    );

}

//======================================
// リキッドヴェール
//======================================

function liquidVeil(card){

    console.log(
        "リキッドヴェール発動"
    );


    currentResistEvent.damage -= 2;


    if(currentResistEvent.damage < 0){

        currentResistEvent.damage = 0;

    }


    console.log(
        "変更後ダメージ",
        currentResistEvent.damage
    );

}
//======================================
// ラピッドムーヴ
//======================================

function rapidMove(card){


    console.log(
        "ラピッドムーヴ発動"
    );


    currentResistEvent.damage = 0;


}

//======================================
// サンドプロテクト
//======================================

function sandProtect(card){

    console.log(
        "サンドプロテクト発動",
        currentResistEvent
    );

    console.log(
        "サンドプロテクト owner:",
        card.owner
    );

    console.log(
        "ENEMY:",
        ENEMY
    );

    console.log(
        "CPU判定:",
        card.owner === ENEMY
    );


    if(
        currentResistEvent.damage === 1
    ){

        console.log(
            "条件一致 → ダメージ0"
        );

        currentResistEvent.damage = 0;


        //----------------------------------
        // CPUの場合
        //----------------------------------

        if(
            card.owner === ENEMY
        ){

            console.log(
                "★ CPUサンドプロテクト処理"
            );

            if(
                !enemyHandCards.includes(card)
            ){

                enemyHandCards.push(card);

            }

            card.area = "hand";


        }

        //----------------------------------
        // プレイヤーの場合
        //----------------------------------

        else{

            console.log(
                "★ PLAYERサンドプロテクト処理"
            );

            returnResistToHand(card);

        }

    }else{

        console.log(
            "条件不一致"
        );

    }


    console.log(
        "変更後ダメージ",
        currentResistEvent.damage
    );
}

//======================================
// カードプレイイベント終了処理
//======================================

function finishCardPlayResist(){

    if(
        !currentResistEvent ||
        currentResistEvent.type !==
            GAME_EVENT.ENEMY_PLAY_CARD
    ){
        return false;
    }

    const event = currentResistEvent;

    //----------------------------------
    // レジスト状態を解除
    //----------------------------------

    selectableResistCards.forEach(card => {

        card.setSelected(false);
        card.setHighlight(false);

    });

    currentResistEvent = null;

    resistMode = false;
    resistUsingCard = null;
    resistCostConfirm = false;

    selectedResistCostCards = [];
    selectableResistCards = [];

    resistPassedThisEvent = false;


//==================================
// CPUの事前カード表示を終了
//==================================

if(
    typeof hideCpuCardAction === "function"
){
    hideCpuCardAction();
}



//----------------------------------
// 中断していたCPUのカードプレイを再開
//----------------------------------

if(
    typeof event.resume === "function"
){

    console.log(
        "ファストコール：レジスト処理終了"
    );

    // レジスト処理の終了後に
    // CPUのカードプレイを再開する
    setTimeout(
        ()=>{

            // ゲームが終了していた場合は
            // CPUの行動を再開しない
            if(
                battleGameEnding ||
                battleGameConceded
            ){

                cpuFastCallWaiting = false;

                cpuFastCallPendingAction = null;

                cpuWaiting = false;

                return;

            }

            event.resume();

        },
        300
    );

}else{

    console.warn(
        "ファストコール：CPU再開処理なし"
    );

}

    //==================================
    // キャンセレーション終了後の復帰
    //==================================

    if(event.cancelled){

        restoreCancellationButtons();

    }else{

        updateButtons();

    }

    return true;

}

//======================================
// レジスト終了
//======================================

function finishResist(){

    //----------------------------------
    // イベントなし
    //----------------------------------

    if(!currentResistEvent){

        console.log(
            "finishResist：イベントなし"
        );

        return;

    }

    // 今回のレジストがバトルボムの
// ダメージに対するものか記録
const wasBattleBombDamageEvent =
    currentResistEvent.type ===
        GAME_EVENT.BEFORE_SUMMON_DAMAGE &&
    battleBombWaiting &&
    battleBombDamageStarted &&
    currentResistEvent.target ===
        battleBombTarget;

    //======================================
// バトルボム
// バトル開始イベント終了
//======================================

if(
    currentResistEvent.type ===
    GAME_EVENT.BATTLE_START
){

    const event = currentResistEvent;

    // 使用済みフラグ解除
    selectableResistCards.forEach(card => {

        card.setSelected(false);
        card.setHighlight(false);
        card.usedThisEvent = false;

    });

    enemyHandCards.forEach(card => {
        card.usedThisEvent = false;
    });

    enemyCoolCards.forEach(card => {
        card.usedThisEvent = false;
    });

    // レジスト状態解除
    currentResistEvent = null;
    resistMode = false;
    resistUsingCard = null;
    resistCostConfirm = false;

    selectedResistCostCards = [];
    selectableResistCards = [];

    resistPassedThisEvent = false;

    updateButtons();

    // 保存された戦闘再開処理
    if(
        typeof event.resume === "function"
    ){

        event.resume();

    }

    return;

}


    //======================================
// CPUファストコール終了処理
//======================================

if(
    currentResistEvent.type ===
    GAME_EVENT.PLAY_CARD
){

    const event = currentResistEvent;

    // レジスト状態を解除
    currentResistEvent = null;

    resistMode = false;
    resistUsingCard = null;
    resistCostConfirm = false;

    selectedResistCostCards = [];
    selectableResistCards = [];

    resistPassedThisEvent = false;

    // CPUのカード表示を終了
    if(
        typeof hideCpuCardAction ===
        "function"
    ){
        hideCpuCardAction();
    }

    // 中断していたプレイヤーの行動を再開
    if(
        typeof event.resume ===
        "function"
    ){

        setTimeout(
            () => event.resume(),
            300
        );

    }

    return;

}


    //==================================
    // ファストコール
    // カードプレイイベントの終了
    //==================================

    if(
        currentResistEvent.type ===
        GAME_EVENT.ENEMY_PLAY_CARD
    ){

        finishCardPlayResist();

        return;

    }


    console.log(
        "========== finishResist =========="
    );

    console.log(
        "イベント=",
        currentResistEvent.type,
        "対象=",
        currentResistEvent.player,
        "残りダメージ=",
        currentResistEvent.damage,
        "pass=",
        resistPassedThisEvent
    );


    //==================================
    // 残りダメージがある場合
    //==================================

    if(
        currentResistEvent.damage > 0
    ){

        //==================================
        // CPUがダメージを受ける場合
        //==================================

        if(
            currentResistEvent.player === ENEMY
        ){

            //----------------------------------
            // 使用可能CPUレジスト取得
            //----------------------------------

            const cpuResistCards =
                findCpuResistCards(
                    currentResistEvent
                ).filter(
                    card =>
                        !card.usedThisEvent
                );


            //----------------------------------
            // 使用可能カードあり
            //----------------------------------

            if(
                cpuResistCards.length > 0
            ){

                const cpuResist =
                    selectBestCpuResist(
                        cpuResistCards,
                        currentResistEvent.damage,
                        currentResistEvent
                    );


                //----------------------------------
                // CPUが使用すると判断
                //----------------------------------

                if(cpuResist){

                    console.log(
                        "CPU追加レジスト",
                        cpuResist.name,
                        "使用前ダメージ=",
                        currentResistEvent.damage
                    );


                    const result =
                        useCpuResist(
                            cpuResist
                        );


                    //----------------------------------
                    // 使用成功
                    //----------------------------------

                    if(result){

                        console.log(
                            "CPUレジスト使用後ダメージ=",
                            currentResistEvent.damage
                        );


                        //----------------------------------
                        // 追加レジスト判定へ
                        //----------------------------------

                        setTimeout(
                            () => {

                                finishResist();

                            },
                            2000
                        );


                        return;

                    }

                }

            }


            //==================================
            // CPUネレイド能力判定
            //==================================

            if(
                currentResistEvent.type ===
                    GAME_EVENT.BEFORE_PLAYER_DAMAGE &&
                currentResistEvent.damage > 0
            ){

                const nereidUsed =
                    checkNereidDamagePrevent(
                        ENEMY,
                        currentResistEvent.damage,
                        currentResistEvent
                    );


                if(nereidUsed){

                    console.log(
                        "CPUネレイド：ダメージ0"
                    );

                    currentResistEvent.damage =
                        0;

                }

            }

        }


        //==================================
        // PLAYERがダメージを受ける場合
        //==================================

        if(
            currentResistEvent.player === PLAYER
        ){

            //----------------------------------
            // 「プレイしない」を選んでいない
            // 場合だけ追加レジスト確認
            //----------------------------------

            if(
                !resistPassedThisEvent
            ){

                const resistCards =
                    findResistCards(
                        currentResistEvent
                    ).filter(
                        card =>
                            !card.usedThisEvent
                    );


                //----------------------------------
                // 追加レジスト選択
                //----------------------------------

                if(
                    resistCards.length > 0
                ){

                    console.log(
                        "追加プレイヤーレジスト選択",
                        resistCards.map(
                            card =>
                                card.name
                        )
                    );


                    showResistSelection(
                        resistCards,
                        currentResistEvent
                    );


                    return;

                }

            }
            else{

                console.log(
                    "PLAYER：このイベントでは",
                    "これ以上レジストを使用しない"
                );

            }

        }

    }


    //==================================
    // ダメージ解決
    //==================================

    if(
        currentResistEvent.damage > 0
    ){

        //----------------------------------
        // プレイヤーへのダメージ
        //----------------------------------

        if(
            currentResistEvent.type ===
                GAME_EVENT.BEFORE_PLAYER_DAMAGE
        ){

            const finalDamage =
                currentResistEvent.damage;


                //==================================
// PLAYERネレイド能力判定
//==================================

if(
    currentResistEvent.player === PLAYER &&
    finalDamage > 0
){

    const nereidWaiting =
        checkNereidDamagePrevent(
            PLAYER,
            finalDamage,
            currentResistEvent
        );

    if(nereidWaiting){

        // レジストの選択状態を終了
        selectableResistCards.forEach(card => {
            card.setSelected(false);
            card.setHighlight(false);
            card.usedThisEvent = false;
        });

        selectableResistCards = [];
        resistMode = false;
        resistUsingCard = null;
        resistCostConfirm = false;
        selectedResistCostCards = [];
        resistPassedThisEvent = false;

        updateButtons();

        console.log(
            "レジスト後：PLAYERネレイド能力待機"
        );

        return;

    }

}

            console.log(
                "レジスト後：プレイヤーダメージ確定",
                currentResistEvent.player,
                finalDamage
            );


            //----------------------------------
            // damagePlayer() は使用しない
            //
            // ガーゴイル等の軽減処理は
            // BEFORE_PLAYER_DAMAGE 発生前に
            // すでに適用済み
            //----------------------------------

            if(finalDamage > 0){

                const damageTarget =
                    currentResistEvent.player === PLAYER
                        ? "PLAYER"
                        : "CPU";


                addBattleLog(
                    `${damageTarget}：${finalDamage}ダメージ`
                );


                applyPlayerDamage(
                    currentResistEvent.player,
                    finalDamage
                );

            }

        }


        //----------------------------------
        // サモンへのダメージ
        //----------------------------------

        if(
            currentResistEvent.type ===
                GAME_EVENT.BEFORE_SUMMON_DAMAGE
        ){

            console.log(
                "レジスト後：サモンダメージ確定",
                currentResistEvent.target?.card?.name,
                currentResistEvent.damage
            );


            //==================================
            // レジスト後のヒュドラ判定
            //==================================
            //
            // dealDamage() は再実行しない。
            //
            // BEFORE_SUMMON_DAMAGEを
            // 再発生させず、
            // ヒュドラ判定だけ行う。
            //==================================

            const waitHydra =
                startHydraDamageAbility(
                    currentResistEvent
                );


            //----------------------------------
            // ヒュドラ能力待ち
            //----------------------------------

            if(waitHydra){

                console.log(
                    "レジスト後：ヒュドラ能力待機",
                    currentResistEvent.target?.card?.name,
                    "damage=",
                    currentResistEvent.damage
                );


                //==================================
                // 重要
                //
                // currentResistEvent は
                // ヒュドラ側が使用するため
                // ここでは消さない。
                //
                // またマギアもまだ再開しない。
                //==================================

                return;

            }


            //----------------------------------
            // ヒュドラなし
            // 最終ダメージ適用
            //----------------------------------

            applyHydraResolvedDamage(
                currentResistEvent
            );

        }

    }


    //==================================
    // ここから
    // レジストイベント終了処理
    //==================================


    //----------------------------------
    // 使用済みフラグ解除
    //----------------------------------

    for(
        const card of selectableResistCards
    ){

        card.setSelected(false);

        card.usedThisEvent =
            false;

    }


    //----------------------------------
    // CPUレジスト使用済み解除
    //----------------------------------

    for(
        const card of enemyHandCards
    ){

        card.usedThisEvent =
            false;

    }


    for(
        const card of enemyCoolCards
    ){

        card.usedThisEvent =
            false;

    }


    //----------------------------------
    // レジスト表示解除
    //----------------------------------

    for(
        const card of selectableResistCards
    ){

        card.setSelected(false);

        card.setHighlight(false);

    }


    //----------------------------------
    // 後続処理用情報保存
    //----------------------------------

    const wasPlayerDamage =
        currentResistEvent.type ===
            GAME_EVENT.BEFORE_PLAYER_DAMAGE;


    const attacker =
        currentResistEvent.attacker;


    //----------------------------------
    // レジスト状態解除
    //----------------------------------

    currentResistEvent =
        null;

    resistMode =
        false;

    selectableResistCards =
        [];

    resistUsingCard =
        null;

    resistCostConfirm =
        false;

    selectedResistCostCards =
        [];


    //----------------------------------
    // 「プレイしない」状態解除
    //----------------------------------

    resistPassedThisEvent =
        false;


    updateButtons();

    //==================================
// アースクェイク
// 各サモンへのレジスト終了後
//==================================
//
// アースクェイクは複数のサモンへ
// 1体ずつダメージを与える。
//
// 2体目以降では
// resistMagiaWaiting が解除済みの
// 場合があるため、
// earthquakeResolving を直接確認して
// 現在の1体分を完了させる。
//==================================

if(
    typeof earthquakeResolving !==
        "undefined" &&
    earthquakeResolving &&
    typeof earthquakeMagia !==
        "undefined" &&
    earthquakeMagia &&
    typeof earthquakeCurrentTarget !==
        "undefined" &&
    earthquakeCurrentTarget
){

    console.log(
        "レジスト終了：アースクェイク直接再開",
        {
            target:
                earthquakeCurrentTarget
                    ?.card?.name ?? null,

            index:
                typeof earthquakeIndex !==
                    "undefined"
                    ?
                    earthquakeIndex
                    :
                    null,

            total:
                typeof earthquakeTargets !==
                    "undefined"
                    ?
                    earthquakeTargets.length
                    :
                    null
        }
    );


    //----------------------------------
    // この1体分のダメージは
    // レジスト処理内ですでに確定済み。
    //
    // dealDamage() は再実行しない。
    //----------------------------------

    if(
        typeof finishEarthquakeTargetDamage ===
            "function"
    ){

        finishEarthquakeTargetDamage();

        return;

    }

}


    //==================================
    // マギアによるダメージへの
    // レジストだった場合
    //==================================

    if(
        typeof resistMagiaWaiting !==
            "undefined" &&
        resistMagiaWaiting
    ){

        console.log(
            "レジスト終了：",
            "停止中マギアの解決を再開"
        );


        resumeMagiaAfterResist();


        return;

    }

//======================================
// バトルボム
// レジスト終了後の専用処理
//======================================

if(
    wasBattleBombDamageEvent &&
    battleBombWaiting &&
    battleBombDamageStarted &&
    !battleBombDamageResolved
){

    console.log(
        "バトルボム：レジスト終了"
    );

    resumeBattleBombAfterDamage();

    finishBattleBombDamage();

    return;

}

//======================================
// 戦闘ダメージへのレジスト終了
//
// 通常戦闘・ブロック戦闘の途中で
// レジストが発生していた場合、
// 戦闘の続きへ戻る
//======================================

if(
    (
        typeof hydraBattleWaiting !==
            "undefined" &&
        hydraBattleWaiting
    ) ||
    (
        typeof hydraBlockWaiting !==
            "undefined" &&
        hydraBlockWaiting
    )
){

    console.log(
        "レジスト終了：戦闘ダメージ処理を再開"
    );


    if(
        typeof resumeBattleAfterHydra ===
            "function"
    ){

        resumeBattleAfterHydra();

        return;

    }

}


    //----------------------------------
    // 通常の戦闘解決
    //----------------------------------

    resolveBattle();


    //==================================
    // CPUターン中のレジスト終了
    //==================================

    if(
        game.currentPlayer === ENEMY &&
        cpuWaiting
    ){

        console.log(
            "レジスト終了：CPU行動を再開"
        );


        setTimeout(
            () => {

                continueCpuTurn();

            },
            500
        );


        return;

    }


    //==================================
    // 通常の攻撃終了
    //==================================

    if(
        isAttacking()
    ){

        finishAttack();

    }

}

//==================================================
// レジスト
// ↓
// ヒュドラ
//
// ヒュドラ解決後のレジスト終了処理
//==================================================

function finishResistAfterHydra(){

    console.log(
        "================================"
    );

    console.log(
        "★ レジスト → ヒュドラ",
        "終了処理"
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // 使用済みフラグ解除
    //----------------------------------

    for(
        const card of selectableResistCards
    ){

        card.setSelected(false);

        card.usedThisEvent =
            false;

    }


    //----------------------------------
    // CPUレジスト使用済み解除
    //----------------------------------

    for(
        const card of enemyHandCards
    ){

        card.usedThisEvent =
            false;

    }


    for(
        const card of enemyCoolCards
    ){

        card.usedThisEvent =
            false;

    }


    //----------------------------------
    // レジスト表示解除
    //----------------------------------

    for(
        const card of selectableResistCards
    ){

        card.setSelected(false);

        card.setHighlight(false);

    }


    //==================================
    // レジスト状態解除
    //==================================

    currentResistEvent =
        null;

    resistMode =
        false;

    selectableResistCards =
        [];

    resistUsingCard =
        null;

    resistCostConfirm =
        false;

    selectedResistCostCards =
        [];

    resistPassedThisEvent =
        false;


    updateButtons();


    //======================================
    // バトルボム
    // レジスト → ヒュドラ終了
    //======================================

    if(
        battleBombWaiting &&
        battleBombDamageStarted &&
        !battleBombDamageResolved
    ){

        console.log(
            "バトルボム：レジスト・ヒュドラ終了"
        );

        resumeBattleBombAfterDamage();

        finishBattleBombDamage();

        return;

    }


    //==================================
    // マギアへ戻る
    //==================================

    if(
        typeof resistMagiaWaiting !==
            "undefined" &&
        resistMagiaWaiting
    ){

        console.log(
            "レジスト → ヒュドラ終了：",
            "停止中マギアを再開"
        );


        resumeMagiaAfterResist();


        return;

    }


    //==================================
    // ★追加
    // 戦闘ダメージへ戻る
    //
    // 通常戦闘・ブロック戦闘の途中で
    // レジスト → ヒュドラとなった場合、
    // 保存してある位置から戦闘を再開する
    //==================================

    if(
        (
            typeof hydraBattleWaiting !==
                "undefined" &&
            hydraBattleWaiting
        ) ||
        (
            typeof hydraBlockWaiting !==
                "undefined" &&
            hydraBlockWaiting
        )
    ){

        console.log(
            "レジスト → ヒュドラ終了：",
            "戦闘ダメージ処理を再開"
        );


        if(
            typeof resumeBattleAfterHydra ===
                "function"
        ){

            resumeBattleAfterHydra();

            return;

        }

    }


    //==================================
    // その他
    // 通常解決
    //==================================

    resolveBattle();


    if(
        typeof isAttacking ===
            "function" &&
        isAttacking()
    ){

        finishAttack();

    }

}

//=========================
// レジストキャンセル
//=========================

function cancelResistCost(){

    console.log(
        "レジストキャンセル"
    );

    //----------------------------------
    // コスト選択解除
    //----------------------------------

    selectedResistCostCards.forEach(card=>{

        card.setSelected(false);

        card.setCostSelected(false);

    });

    //----------------------------------
    // 状態リセット
    //----------------------------------

    resistUsingCard = null;

    selectedResistCostCards = [];

    resistCostConfirm = false;

    //----------------------------------
    // レジスト選択へ戻す
    //----------------------------------

    resistMode = true;

    startResistSelection();

    //----------------------------------
    // 行動案内をレジスト選択に戻す
    //----------------------------------

showActionGuide(
    getResistGuideMessage(
        currentResistEvent
    )
);

    updateGameState();

}

function returnResistToHand(card){

    console.log(
        "レジスト手札戻し",
        card.name
    );


    //----------------------------------
    // 使用済み解除
    //----------------------------------

    card.usedThisEvent = false;


    //----------------------------------
    // 手札へ戻す
    //----------------------------------

    board.addHandCard(card);


    card.setFaceDown(false);

    card.setHighlight(false);

    card.setSelected(false);

    card.setCostSelected(false);


    card.refresh();


    updateGameState();

}


//======================================
// CPU現在コスト取得
//======================================

function getCurrentEnemyCardCost(card){

    if(!card){

        return 0;

    }


    //----------------------------------
    // 元のコスト
    //----------------------------------

    let cost =
        card.cost;


    //----------------------------------
    // CPU場のコスト軽減能力
    //----------------------------------

    enemyField.forEach(
        summon => {

            //----------------------------------
            // サモン確認
            //----------------------------------

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return;

            }


            //----------------------------------
            // 属性コスト軽減
            //
            // ドッペルゲンガーの
            // コピー能力も含む
            //----------------------------------

            const costDownAbility =
                getSummonAbility(
                    summon,
                    "elementCostDown"
                );


            if(
                costDownAbility &&
                costDownAbility.element ===
                    card.elementType
            ){

                cost -=
                    Number(
                        costDownAbility.value
                    ) || 0;

            }

        }
    );


    //==================================
    // PLAYER場の能力を確認
    //==================================

    playerField.forEach(
        summon => {

            //----------------------------------
            // サモン確認
            //----------------------------------

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return;

            }


            //----------------------------------
            // セイレーン
            // CPUのマギアコスト +1
            //----------------------------------

            const magiaCostUpAbility =
                getSummonAbility(
                    summon,
                    "enemyMagiaCostUp"
                );


            if(
                magiaCostUpAbility &&
                card.type ===
                    "マギア"
            ){

                cost +=
                    Number(
                        magiaCostUpAbility.value
                    ) || 0;

            }


            //----------------------------------
            // ハーピー
            // CPUのレジストコスト +1
            //----------------------------------

            const resistCostUpAbility =
                getSummonAbility(
                    summon,
                    "enemyResistCostUp"
                );


            if(
                resistCostUpAbility &&
                card.type ===
                    "レジスト"
            ){

                cost +=
                    Number(
                        resistCostUpAbility.value
                    ) || 0;

            }

        }
    );


    //----------------------------------
    // 0未満にはしない
    //----------------------------------

    cost =
        Math.max(
            0,
            cost
        );


    return cost;

}

//======================================
// CPUファストコール専用召喚
//======================================

function executeCpuFastCallSummon(card){

    if(
        !card ||
        !enemyHandCards.includes(card)
    ){
        return false;
    }

    // 属性による使用制限
    if(
        !canPlaySummonByElementRestriction(
            ENEMY,
            card
        )
    ){
        return false;
    }

//----------------------------------
// 現在の召喚コスト
//----------------------------------

const currentCost =
    getCurrentCardCost(
        card,
        ENEMY
    );


//======================================
// ファストコール専用コスト選択
//======================================

// 召喚するサモン自身を除外
const candidates =
    enemyHandCards.filter(
        handCard =>
            handCard !== card
    );


//----------------------------------
// カードの種類ごとに分類
//----------------------------------

const summons =
    candidates.filter(
        c => c.type === "サモン"
    );

const magias =
    candidates.filter(
        c => c.type === "マギア"
    );

const resists =
    candidates.filter(
        c => c.type === "レジスト"
    );


//----------------------------------
// 通常のCPUと同じ優先順位
//----------------------------------

summons.sort(
    () => Math.random() - 0.5
);

magias.sort(
    () => Math.random() - 0.5
);

resists.sort(
    () => Math.random() - 0.5
);


//----------------------------------
// 必要なコストを選択
//----------------------------------

const costCards = [
    ...summons,
    ...magias,
    ...resists
].slice(
    0,
    currentCost
);


console.log(
    "CPUファストコール召喚コスト",
    costCards.map(c => c.name)
);

    // コスト不足、または召喚カード自身が
    // コストに選ばれている場合は中止
    if(
        costCards.length < currentCost ||
        costCards.includes(card)
    ){
        console.log(
            "CPUファストコール：召喚コスト不足",
            card.name
        );

        return false;
    }

    // コスト支払い
    costCards.forEach(costCard => {
        moveEnemyToCost(costCard);
    });

    // 召喚実行
//----------------------------------
// ファストコールによる召喚
//----------------------------------

const summon =
    executeSummon(
        card,
        ENEMY
    );

if(!summon){

    console.log(
        "CPUファストコール：召喚失敗",
        card.name
    );

    return false;

}


//======================================
// カードプレイ枚数を記録
//======================================

registerCardPlay(
    ENEMY,
    card
);

    addBattleLog(
        `CPU：ファストコールで${card.name}を召喚`
    );

    console.log(
        "CPUファストコール：召喚完了",
        card.name
    );

    return true;

}

//======================================
// CPUレジスト使用
//======================================

function useCpuResist(card){

    if(!card){

        return false;

    }


    //==================================
    // カードプレイ枚数制限
    //
    // ジャックフロスト等
    //==================================

    if(
        !canPlayCardByLimit(
            ENEMY
        )
    ){

        console.log(
            "CPUレジスト使用不可：",
            "カードプレイ枚数上限",
            getCardPlayCount(
                ENEMY
            ),
            "/",
            getCardPlayLimit(
                ENEMY
            )
        );

        return false;

    }


    //----------------------------------
    // 現在のコスト
    //----------------------------------

    const currentCost =
        getCurrentEnemyCardCost(
            card
        );


    console.log(
        "CPUレジストコスト確認",
        card.name,
        currentCost
    );


    //----------------------------------
    // コストカード取得
    //----------------------------------

//======================================
// CPUレジストのコスト選択
//======================================

let costCards;

// ファストコールで召喚するサモン
let reservedSummon = null;

if(card.effect === "fastCall"){

//======================================
// 召喚コストも確保できる組み合わせを探す
//======================================

const summonCards =
    enemyHandCards.filter(
        c =>
            c !== card &&
            c.type === "サモン" &&
            canPlaySummonByElementRestriction(
                ENEMY,
                c
            )
    );

summonCards.sort(
    (a, b) =>
        Number(b.power || 0) -
        Number(a.power || 0)
);


let reservedCostCards = [];

for(const summon of summonCards){

    const candidates =
        enemyHandCards.filter(
            c =>
                c !== card &&
                c !== summon
        );

    const selected =
        candidates.slice(
            0,
            currentCost
        );

    if(selected.length < currentCost){
        continue;
    }

    const remaining =
        candidates.filter(
            c => !selected.includes(c)
        );

    const summonCost =
        getCurrentCardCost(
            summon,
            ENEMY
        );

    if(remaining.length < summonCost){
        continue;
    }

    reservedSummon = summon;
    reservedCostCards = selected;

    break;
}

costCards = reservedCostCards;

if(!reservedSummon){

    console.log(
        "CPUファストコール中止：",
        "召喚可能な組み合わせなし"
    );

    return false;

}

}else if(card.effect === "multiShield"){

    //==================================
    // マルチシールド専用コスト選択
    //==================================

    const damage =
        Math.max(
            0,
            Number(currentResistEvent?.damage) || 0
        );

    // 支払いに使用できる手札
    const availableCards =
        enemyHandCards.filter(
            c => c !== card
        ).length;

    // ダメージを防ぐための必要コスト
    const requiredCost =
        getCpuMultiShieldCost(
            damage,
            availableCards
        );

    // コスト増減効果も考慮
    const payCost =
        Math.max(
            currentCost,
            requiredCost
        );

    costCards =
        selectCpuCostCards(
            card,
            payCost
        );

    console.log(
        "CPUマルチシールド",
        "ダメージ=", damage,
        "必要コスト=", payCost
    );

}else{

    costCards =
        selectCpuCostCards(
            card,
            currentCost
        );

}


    //----------------------------------
    // コスト不足
    //----------------------------------

    if(
        costCards.length <
        currentCost
    ){

        console.log(
            "CPUレジスト：コスト不足",
            card.name
        );

        return false;

    }

    //======================================
// CPUファストコール
// 召喚サモンの事前確保
//======================================

let cpuFastCallSummon = null;

if(card.effect === "fastCall"){

    // ファストコールのコストに
    // 召喚予定のサモンを使わない
    const availableHand =
        enemyHandCards.filter(
            handCard =>
                handCard !== card &&
                !costCards.includes(handCard)
        );

    const summonCards =
        availableHand.filter(
            handCard =>
                handCard.type === "サモン" &&
                canPlaySummonByElementRestriction(
                    ENEMY,
                    handCard
                )
        );

//======================================
// 召喚可能なサモンを選択
//======================================

// パワーが高い順に並べる
summonCards.sort(
    (a, b) =>
        Number(b.power || 0) -
        Number(a.power || 0)
);


//--------------------------------------
// コストを支払えるサモンを探す
//--------------------------------------

cpuFastCallSummon =
    reservedSummon;

if(!cpuFastCallSummon){

    console.log(
        "CPUファストコール中止：召喚サモンなし"
    );

    return false;

}

//======================================
// 召喚コストの事前確認
//======================================

const summonCost =
    getCurrentCardCost(
        cpuFastCallSummon,
        ENEMY
    );

// ファストコールのコスト支払い後に
// 残るカードを取得
const remainingHand =
    enemyHandCards.filter(
        handCard =>
            handCard !== card &&
            handCard !== cpuFastCallSummon &&
            !costCards.includes(handCard)
    );

if(remainingHand.length < summonCost){

    console.log(
        "CPUファストコール中止：召喚コスト不足",
        cpuFastCallSummon.name,
        "必要枚数=",
        summonCost,
        "使用可能枚数=",
        remainingHand.length
    );

    return false;

}

    console.log(
        "CPUファストコール召喚予定：",
        cpuFastCallSummon.name
    );

}


    //----------------------------------
    // ここから実際の使用
    //----------------------------------

    console.log(
        "CPUレジスト使用",
        card.name
    );


    //==================================
    // カードプレイ成立
    //
    // ジャックフロスト等の
    // プレイ枚数管理
    //==================================

    registerCardPlay(
        ENEMY,
        card
    );


    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `CPU：${card.name}を使用`
    );


    //----------------------------------
    // CPUレジスト使用演出
    //----------------------------------

    showCpuCardAction(
        card,
        "RESIST"
    );


    //==================================
// マルチシールド支払コスト記録
//==================================

if(card.effect === "multiShield"){

    card.paidCost =
        costCards.length;

    console.log(
        "CPUマルチシールド支払コスト：",
        card.paidCost
    );

}


    //----------------------------------
    // コスト支払い
    //----------------------------------

    costCards.forEach(
        costCard => {

            moveEnemyToCost(
                costCard
            );

        }
    );


    //----------------------------------
    // サンドプロテクトか確認
    //----------------------------------

    const returnToHand =
        card.effect === "sandProtect";


    //----------------------------------
    // レジスト自身を手札から除去
    //----------------------------------

    enemyHandCards =
        enemyHandCards.filter(
            c => c !== card
        );


    //----------------------------------
    // サンドプロテクト以外はクールへ
    //----------------------------------

    if(
        !returnToHand
    ){

        card.area =
            "enemyCool";


        if(
            !enemyCoolCards.includes(card)
        ){

            enemyCoolCards.push(
                card
            );

        }


        board.enemyCoolCards =
            enemyCoolCards;


        updateEnemyZoneDisplay();

    }


    //----------------------------------
    // このイベントでは使用済み
    //----------------------------------

    card.usedThisEvent =
        true;


//----------------------------------
// 効果発動
//----------------------------------

const effect =
    resistEffects[
        card.effect
    ];


//======================================
// CPUレジスト効果発動
//======================================

if(
    card.effect ===
        "fastCall"
){

    console.log(
        "CPUファストコール：専用召喚開始",
        cpuFastCallSummon?.name
    );

    const summonResult =
        executeCpuFastCallSummon(
            cpuFastCallSummon
        );

    console.log(
        "CPUファストコール：召喚結果",
        summonResult
    );

}
else if(effect){

    effect(
        card,
        currentResistEvent
    );

}


//======================================
// CPUバトルボム
// 対象確定後にBATTLE_STARTを終了
//======================================

if(
    card.effect ===
        "battleBomb"
){

    //----------------------------------
    // 対象確定確認
    //----------------------------------

    if(
        battleBombTarget
    ){

        console.log(
            "CPUバトルボム：",
            "対象確定後、戦闘を再開",
            battleBombTarget
                ?.card?.name
        );


        //==================================
        // battleBomb()ではCPUの場合
        // 対象だけを自動確定している。
        //
        // ここでBATTLE_STARTの
        // レジスト処理を終了し、
        // event.resume()から戦闘へ戻す。
        //==================================

        setTimeout(
            () => {

                finishResist();

            },
            800
        );

    }
    else{

        console.warn(
            "CPUバトルボム：",
            "対象を確定できませんでした"
        );

        //----------------------------------
        // 対象が取れなかった場合でも
        // BATTLE_STARTを停止させない
        //----------------------------------

        setTimeout(
            () => {

                finishResist();

            },
            300
        );

    }

}


    //----------------------------------
    // 効果確認ログ
    //----------------------------------

    console.log(
        "CPUレジスト効果適用後",
        card.name,
        "damage=",
        currentResistEvent.damage
    );


    //----------------------------------
    // クール確認ログ
    //----------------------------------

    console.log(
        "CPUクールゾーン現在枚数",
        enemyCoolCards.length,
        enemyCoolCards.map(
            c => c.name
        )
    );


    return true;

}

//======================================
// イリュージョンフォグ
//======================================

function illusionFog(card){

    console.log(
        "イリュージョンフォグ発動",
        {
            target:
                currentResistEvent
                    ?.target
                    ?.card
                    ?.name,

            damageBefore:
                currentResistEvent
                    ?.damage
        }
    );


    //----------------------------------
    // イベント確認
    //----------------------------------

    if(!currentResistEvent){

        return;

    }


    //----------------------------------
    // サモンダメージのみ
    //----------------------------------

    if(
        currentResistEvent.type !==
        GAME_EVENT.BEFORE_SUMMON_DAMAGE
    ){

        return;

    }


    //----------------------------------
    // 受けるダメージを0にする
    //----------------------------------

    currentResistEvent.damage = 0;


    console.log(
        "イリュージョンフォグ：ダメージ0",
        currentResistEvent
            .target
            ?.card
            ?.name
    );

}

function startFastCallSummonCost(){

    const card = fastCallSelectedSummon;

    if(!card || !fastCallSelectingSummon){
        return;
    }

    if(!canFastCallSummon()){
        return;
    }

    if(!canPlayCardByLimit(PLAYER)){
        return;
    }

    if(!canPlaySummonByElementRestriction(PLAYER, card)){
        return;
    }

    if(!canPayCost(card)){
        alert("サモンのコストが足りません");
        return;
    }

    fastCallSelectingSummon = false;

    summonCard = card;
    costTargetCard = card;
    costMode = "fastCallSummon";

    selectedCostCards = [];

    costConfirm =
        getCurrentCardCost(card, PLAYER) === 0;

    board.handCards.forEach(c => {
        c.setHighlight(false);
    });

    showActionGuide(
        "サモンのコストを選択してください。"
    );

    updateButtons();
}
function payFastCallSummonCost(){

    const card = summonCard;

    if(
        costMode !== "fastCallSummon" ||
        !card ||
        card !== fastCallSelectedSummon
    ){
        return;
    }

    if(!canFastCallSummon()){
        return;
    }

    if(
        !canPlayCardByLimit(PLAYER) ||
        !canPlaySummonByElementRestriction(PLAYER, card)
    ){
        return;
    }

    const requiredCost =
        getCurrentCardCost(card, PLAYER);

    if(
        !costConfirm ||
        selectedCostCards.length !== requiredCost ||
        selectedCostCards.some(
            c =>
                c === card ||
                !board.handCards.includes(c)
        )
    ){
        return;
    }

    //----------------------------------
    // サモンのコストを支払う
    //----------------------------------

    selectedCostCards.forEach(c => {

        c.setSelected(false);
        c.setCostSelected(false);

        moveToCost(c);

    });

    //----------------------------------
    // サモンを場に出す
    //----------------------------------

    card.setSelected(false);

    board.removeHandCard(card);

    registerCardPlay(PLAYER, card);

    card.area = "field";

    const summon =
        new Summon(card, PLAYER);

    summon.attackReady = false;

    summon.view.setHighlight(false);

    playerField.push(summon);

    addBattleLog(
        `PLAYER：ファストコールで${card.name}を召喚`
    );

    applySummonAbility(summon);

    board.addPlayerCard(summon.view);

    updateHandCostDisplay();

    //----------------------------------
    // ファストコール専用の召喚回数
    //----------------------------------

    registerFastCallSummon();

    //----------------------------------
    // 選択状態を解除
    //----------------------------------

    selectedCostCards = [];

    summonCard = null;
    costTargetCard = null;

    selectedHandCard = null;

    costConfirm = false;
    costMode = null;

    fastCallSelectedSummon = null;
    fastCallSelectingSummon = false;

    hideActionGuide();

    updateGameState();
    updateButtons();

    console.log(
        "ファストコール：サモン召喚完了"
    );

    //----------------------------------
// ファストコールの処理終了
//----------------------------------

finishResist();

}

//======================================
// ファストコール
// サモンのコスト支払いキャンセル
//======================================

function cancelFastCallSummonCost(){

    console.log(
        "ファストコール：サモン選択に戻る"
    );

    //----------------------------------
    // コスト選択解除
    //----------------------------------

    selectedCostCards.forEach(card=>{

        card.setSelected(false);
        card.setCostSelected(false);

    });

    selectedCostCards = [];

    //----------------------------------
    // 選択中サモンを解除
    //----------------------------------

    if(fastCallSelectedSummon){

        fastCallSelectedSummon.setSelected(
            false
        );

    }

    fastCallSelectedSummon = null;

    //----------------------------------
    // コスト支払い状態を解除
    //----------------------------------

    summonCard = null;
    costTargetCard = null;
    costConfirm = false;
    costMode = null;

    //----------------------------------
    // サモン選択に戻る
    //----------------------------------

    fastCallSelectingSummon = true;

showActionGuide(
    "プレイするサモンを選んでください。"
);

    updateHandHighlight();
    updateButtons();

}

//======================================
// マルチシールド
// 支払ったコスト1につきダメージ-2
//======================================

function multiShield(card, event){

    const paidCost =
        card.paidCost ?? 0;

    const reduction =
        paidCost * 2;

    event.damage = Math.max(
        0,
        event.damage - reduction
    );

    console.log(
        "マルチシールド発動",
        "支払コスト:", paidCost,
        "軽減量:", reduction,
        "残りダメージ:", event.damage
    );

    addBattleLog(
        `マルチシールド：${reduction}ダメージ軽減`
    );

    // 次回使用時に備えて初期化
    card.paidCost = 0;

}