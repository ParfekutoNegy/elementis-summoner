
class Board {

    constructor() {

        // ===== エリア =====

        this.enemyField =
            document.getElementById("enemy-field");

        this.playerField =
            document.getElementById("player-field");

        this.handArea =
            document.getElementById("hand-area");


        // ===== データ =====

        this.enemyCards = [];

        this.playerCards = [];

        this.handCards = [];

        this.costCards = [];

        this.playerCoolCards = [];

        this.enemyHandCards = [];

        this.enemyCostCards = [];
        
        this.enemyCoolCards = [];

    }

    //=========================
    // プレイヤー場
    //=========================

    setPlayerCards(cards) {

        this.playerCards = cards;

        this.renderPlayerField();

    }

    renderPlayerField() {

        this.playerField.innerHTML = "";

        this.playerCards.forEach(card => {

            card.refresh();

            this.playerField.appendChild(
                card.getElement()
            );

        });

    }

  //=========================
    // 相手場
    //=========================

    setEnemyCards(cards) {

        this.enemyCards = cards;

        this.renderEnemyField();

    }

    renderEnemyField() {

        this.enemyField.innerHTML = "";

        this.enemyCards.forEach(card => {

            this.enemyField.appendChild(
                card.getElement()
            );

        });

    }


    //=========================
    // 手札
    //=========================

    setHandCards(cards) {

        this.handCards = cards;

        this.renderHand();

    }

renderHand(){

    const handCardsArea =
    document.getElementById(
        "hand-cards-area"
    );

    const typeOrder = {
        "サモン": 0,
        "マギア": 1,
        "レジスト": 2
    };

    this.handCards.sort((a, b)=>{

        //----------------------------------
        // まず種類
        //----------------------------------

        if(a.type !== b.type){

            return (
                typeOrder[a.type] -
                typeOrder[b.type]
            );

        }

        //----------------------------------
        // 次にコスト
        //----------------------------------

        if(a.cost !== b.cost){

            return a.cost - b.cost;

        }

        //----------------------------------
        // 最後にID（同コスト時の順番固定）
        //----------------------------------

        return a.id - b.id;

    });

    handCardsArea.innerHTML = "";

    this.handCards.forEach(card=>{

        card.refresh();

        handCardsArea.appendChild(
            card.getElement()
        );

    });

}

    //=========================
    // カード追加
    //=========================


    addPlayerCard(card) {

        this.playerCards.push(card);

        this.renderPlayerField();

    }


    addEnemyCard(card) {

        this.enemyCards.push(card);

        this.renderEnemyField();

    }


    addHandCard(card) {

        this.handCards.push(card);

        this.renderHand();

    }



    //=========================
    // カード削除
    //=========================


    removePlayerCard(card) {

        this.playerCards =
            this.playerCards.filter(
                c => c !== card
            );

        this.renderPlayerField();

    }


    removeEnemyCard(card) {

        this.enemyCards =
            this.enemyCards.filter(
                c => c !== card
            );

        this.renderEnemyField();

    }


    removeHandCard(card) {

        this.handCards =
            this.handCards.filter(
                c => c !== card
            );

        this.renderHand();

    }



    //=========================
    // クリア
    //=========================


    clearPlayerField() {

        this.playerCards = [];

        this.renderPlayerField();

    }


    clearEnemyField() {

        this.enemyCards = [];

        this.renderEnemyField();

    }


    clearHand() {

        this.handCards = [];

        this.renderHand();

    }


    clearAll() {

        this.clearPlayerField();
        this.clearEnemyField();
        this.clearHand();
        this.clearCost();
        this.clearCool();

    }



    //=========================
    // 再描画
    //=========================


    refresh() {

        this.renderPlayerField();

        this.renderEnemyField();

        this.renderHand();

    }



//=========================
// コストゾーン
//=========================


addCostCard(card){

    this.costCards.push(
        card
    );

    this.updateCostCount();

}


removeCostCard(card){

    this.costCards =
        this.costCards.filter(
            c => c !== card
        );

    this.updateCostCount();

}


clearCost(){

    this.costCards = [];

    this.updateCostCount();

}


updateCostCount(){

    //----------------------------------
    // コストカード表示
    //----------------------------------

    const cardArea =
        document.getElementById(
            "player-cost-cards"
        );


    const countArea =
        document.getElementById(
            "player-cost-count"
        );


    if(
        !cardArea ||
        !countArea
    ){

        return;

    }


    //----------------------------------
    // 既存表示を削除
    //----------------------------------

    cardArea.innerHTML = "";


    //----------------------------------
    // コストカードを裏向きで表示
    //----------------------------------

    this.costCards.forEach(
        () => {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "player-cost-card";


            image.src =
                "../../images/ui/card-back.png";


            image.alt =
                "コスト";


            cardArea.appendChild(
                image
            );

        }
    );


    //----------------------------------
    // 枚数
    //----------------------------------

    countArea.textContent =
        `コスト×${this.costCards.length}`;




    //----------------------------------
    // CPUクール表示
    //----------------------------------
    // CPU側の表示更新は既存関数に任せる

    if(
        typeof updateEnemyZoneDisplay ===
        "function"
    ){

        updateEnemyZoneDisplay();

    }

}


//=========================
// クールゾーン
//=========================

addCoolCard(card, owner){

    console.log(
        "★ addCoolCard",
        card.name,
        "owner=",
        owner,
        "area=",
        card.area
    );


    //----------------------------------
    // フェニックス能力
    //----------------------------------

    if(
        card.ability?.type ===
        "returnToHandOnCool"
    ){

        console.log(
            "★フェニックス手札戻し前",
            "CPU手札=",
            enemyHandCards.length,
            enemyHandCards.map(c => c.name)
        );


        card.area = "hand";


        if(owner === PLAYER){

            this.addHandCard(card);

        }
        else{

            enemyHandCards.push(card);

            updateEnemyZoneDisplay();


            console.log(
                "★ CPU手札実数",
                enemyHandCards.length,
                enemyHandCards.map(c => c.name)
            );

        }


        console.log(
            "★フェニックス手札戻し後",
            "CPU手札=",
            enemyHandCards.length,
            enemyHandCards.map(c => c.name)
        );


        console.log(
            "★フェニックス追加カード",
            card.name,
            "area=",
            card.area
        );


        console.log(
            "★フェニックス能力発動",
            card.name,
            "クールゾーンに入らず手札へ"
        );


        return;

    }


    //----------------------------------
    // クールゾーン設定
    //----------------------------------

    card.area = "cool";


    //----------------------------------
    // 所有者別に追加
    //----------------------------------

    if(owner === PLAYER){

        card.owner = PLAYER;


        //----------------------------------
        // Board側
        //----------------------------------

        this.playerCoolCards.push(
            card
        );

    }
    else{

        card.owner = ENEMY;


        //----------------------------------
        // Board側
        //----------------------------------

        this.enemyCoolCards.push(
            card
        );


        //----------------------------------
        // グローバル側も同期
        //----------------------------------

        if(
            !enemyCoolCards.includes(card)
        ){

            enemyCoolCards.push(
                card
            );

        }


        updateEnemyZoneDisplay();

    }


    this.updateCoolCount();

}

removeCoolCard(card, owner){

    //----------------------------------
    // クールゾーンから削除
    //----------------------------------

    if(owner === PLAYER){

        this.playerCoolCards =
            this.playerCoolCards.filter(
                c => c !== card
            );

    }
    else{

        this.enemyCoolCards =
            this.enemyCoolCards.filter(
                c => c !== card
            );


        enemyCoolCards =
            enemyCoolCards.filter(
                c => c !== card
            );

    }


    //----------------------------------
    // クール回収ログ
    //----------------------------------

    if(owner === PLAYER){

        addBattleLog(
            `PLAYER：${card.name}をクールゾーンから回収`
        );

    }
    else{

        addBattleLog(
            `CPU：${card.name}をクールゾーンから回収`
        );

    }


    //----------------------------------
    // 行動案内を消す
    //----------------------------------

    if(
        owner === PLAYER &&
        coolRecoveryMode
    ){

        hideActionGuide();

    }


    //----------------------------------
    // 表示更新
    //----------------------------------

    this.updateCoolCount();

}

clearCool(){

    //----------------------------------
    // プレイヤークール
    //----------------------------------

    this.playerCoolCards = [];


    //----------------------------------
    // CPUクール
    //----------------------------------

    this.enemyCoolCards = [];


    //----------------------------------
    // グローバルCPUクールも同期
    //----------------------------------

    enemyCoolCards = [];


    //----------------------------------
    // 表示更新
    //----------------------------------

    this.updateCoolCount();

}

//=========================
// クールゾーン表示更新
//=========================

updateCoolCount(){

    //----------------------------------
    // プレイヤークール表示
    //----------------------------------

    const cardArea =
        document.getElementById(
            "player-cool-cards"
        );


    const countArea =
        document.getElementById(
            "player-cool-count"
        );


    if(
        !cardArea ||
        !countArea
    ){

        console.warn(
            "プレイヤークール表示要素が見つかりません"
        );

        return;

    }


    //----------------------------------
    // 既存表示を削除
    //----------------------------------

    cardArea.innerHTML = "";


    //----------------------------------
    // クールカードをすべて表示
    //----------------------------------

    this.playerCoolCards.forEach(
        card => {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "player-cool-card";


            image.src =
                card.image;


            image.alt =
                card.name;


            cardArea.appendChild(
                image
            );

        }
    );


    //----------------------------------
    // 枚数表示
    //----------------------------------

    countArea.textContent =
        `クール×${this.playerCoolCards.length}`;

}
}

//----------------------------------
// 相手プレイヤー
//----------------------------------

const enemyPlayerIcon =
document.getElementById(
    "enemy-player-icon"
);

enemyPlayerIcon.addEventListener(
    "click",
    clickEnemyPlayer
);

function clickEnemyPlayer(){

    //----------------------------------
    // レジスト中
    //----------------------------------

    if(
        resistMode ||
        resistUsingCard
    ){

        console.log(
            "レジスト中 相手プレイヤークリック無視"
        );

        return;

    }


    //----------------------------------
    // ブロック中
    //----------------------------------

    if(blockMode){
        return;
    }

    //----------------------------------
    // 攻撃中
    //----------------------------------

    if(isAttacking()){

        executeAttack(
            attackingSummon,
            ENEMY
        );

        return;

    }

//----------------------------------
// マギア対象選択中
//----------------------------------

if(magiaTargetMode){

    //----------------------------------
    // このマギアが相手プレイヤーを
    // 対象にできるか確認
    //----------------------------------

    const targets =
        magiaCard?.effect?.target || [];


    if(!targets.includes("enemy")){

        console.log(
            "このマギアは相手プレイヤーを対象にできません"
        );

        return;

    }


    //----------------------------------
    // 対象決定
    //----------------------------------

    magiaTarget = ENEMY;

    magiaTargetMode = false;

    clearMagiaHighlight();

    startMagiaCost();

    return;
}

}
//======================================
// プレイヤークールゾーン
// クリックで閲覧モーダル
//======================================

const playerCoolDisplay =
    document.getElementById(
        "player-cool-display"
    );


if(playerCoolDisplay){

    playerCoolDisplay.style.cursor =
        "pointer";


    playerCoolDisplay.addEventListener(
        "click",
        ()=>{

            //----------------------------------
            // クール回収中は操作禁止
            //----------------------------------

            if(coolRecoveryMode){

                console.log(
                    "クール回収中のため自分クールゾーン表示を禁止"
                );

                return;

            }


            //----------------------------------
            // 通常時のみ閲覧
            //----------------------------------

            console.log(
                "プレイヤークールゾーン表示クリック"
            );


            //----------------------------------
            // クールゾーン表示
            // 開いていれば閉じる
            //----------------------------------

            openCoolView();

        }
    );

}