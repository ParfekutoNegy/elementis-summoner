class Card {

    constructor(cardData = {}) {

    console.log(
        "Card生成",
        cardData.name,
        "ability=",
        cardData.ability
    );


    this.id = cardData.id || "";
    this.name = cardData.name || "";
    this.image = cardData.image || "";
    this.cost = cardData.cost || 0;
    this.power = cardData.power || 0;
    this.type = cardData.type || "";
    this.text = cardData.text || "";
    this.trigger = cardData.trigger || null;
    this.condition = cardData.condition || null;
    this.effect = cardData.effect || null;
    this.ability = cardData.ability || null;
    // 属性
    this.elementType = cardData.element || "";
    this.tag = cardData.tag || "";
    this.condi = cardData.condi || "";
 
    //----------------------------------
    // エリア
    //----------------------------------

    this.area = "hand";



    this.faceDown = false;
    this.horizontal = false;

    // 手札選択
    this.selected = false;

    // 場カード選択
    this.fieldSelected = false;

    // カードクリック時のイベント
    this.clickCallback = null;

    this.element = this.createElement();

    //=========================
// 表示状態
//=========================

// 使用可能（発光）
this.highlight = false;

// 使用カード
this.useSelected = false;

// コストカード
this.costSelected = false;

// 対象カード
this.target = false;


    this.refresh();

}

createElement() {

    const card =
    document.createElement("div");

    card.className = "card";


    //----------------------------------
    // カード画像
    //----------------------------------

    const image =
    document.createElement("img");

    image.className =
    "card-image";


    //----------------------------------
    // コスト
    //----------------------------------

    const cost =
    document.createElement("div");

    cost.className =
    "card-cost";


    //----------------------------------
    // マーカー
    //----------------------------------

    const marker =
    document.createElement("div");

    marker.className =
    "card-marker";

    marker.style.display =
    "none";


    //----------------------------------
    // 現在パワー
    //----------------------------------

    const currentPower =
    document.createElement("div");

    currentPower.className =
    "card-current-power";

    currentPower.style.display =
    "none";


    //----------------------------------
    // カードへ追加
    //----------------------------------

    card.appendChild(cost);

    card.appendChild(image);

    card.appendChild(marker);

    card.appendChild(currentPower);


    //----------------------------------
    // 保持
    //----------------------------------

    this.imageElement =
    image;

    this.costElement =
    cost;

    this.markerElement =
    marker;

    this.currentPowerElement =
    currentPower;


    //----------------------------------
    // クリック
    //----------------------------------

    card.addEventListener(

        "click",

        ()=>{

            if(this.clickCallback){

                this.clickCallback(this);

            }

        }

    );


    return card;

}


refresh(){

//----------------------------------
// コスト表示
//----------------------------------

if(
    this.faceDown
){

    // 裏向き
    this.costElement.textContent = "";

    this.costElement.style.display =
        "none";

}
else if(
    this.area === "field" ||
    this.area === "enemyField"
){

    // 場のカードはコスト完全非表示
    this.costElement.textContent = "";

    this.costElement.style.display =
        "none";

}
else if(
    this.area === "hand"
){

    // 手札はコスト表示
    this.costElement.textContent =
        getEffectiveCost(this);

    this.costElement.style.display =
        "flex";

}
else{

    // その他
    this.costElement.textContent =
        this.cost;

    this.costElement.style.display =
        "flex";

}

    //----------------------------------
    // カード画像
    //----------------------------------

        if (this.faceDown) {

            this.imageElement.src =
            "../../images/ui/card-back.png";


        } else {

            this.imageElement.src = this.image;

        }

        if (this.horizontal) {

            this.element.classList.add("horizontal");

        } else {

            this.element.classList.remove("horizontal");

        }

//=========================
// 発光
//=========================

this.element.classList.toggle(
    "card-highlight",
    this.highlight
);

//=========================
// 表示状態更新
//=========================

this.updateHighlight();

this.updateMarker();

this.updateSelection();

    }

    //=========================
    // 裏向き
    //=========================

    setFaceDown(flag = true) {

        this.faceDown = flag;
        this.refresh();

    }

    flip() {

        this.faceDown = !this.faceDown;
        this.refresh();

    }

    //=========================
    // 横向き
    //=========================

    setHorizontal(flag = true) {

        this.horizontal = flag;
        this.refresh();

    }

    rotate() {

        this.horizontal = !this.horizontal;
        this.refresh();

    }

//=========================
// 通常選択
//=========================

setSelected(flag = true){


        console.log(
        "setSelected",
        this.name,
        "area=",
        this.area,
        "変更前=",
        this.selected,
        "変更後=",
        flag
    );


    this.selected = flag;

    this.updateMarker();

    this.updateSelection();


}

    toggleSelected() {

        this.selected = !this.selected;
        this.refresh();

    }

    //=========================
    // イベント
    //=========================

    onClick(callback) {

        this.clickCallback = callback;

    }

    //=========================
    // Getter
    //=========================

    getElement() {

        return this.element;

    }

    getData() {

        return {

            id: this.id,
            name: this.name,
            image: this.image,
            cost: this.cost,
            power: this.power,
            type: this.type,
            element: this.elementType,
            text: this.text,
            trigger: this.trigger,
            condition: this.condition,
            effect: this.effect,
            ability: this.ability,
            tag: this.tag,
            condi: this.condi

        };

    }

//=========================
// 発光
//=========================

setHighlight(flag = true){

    this.highlight = flag;

    this.updateHighlight();

}


//=========================
// 対象
//=========================

setTarget(flag = true){

    this.target = flag;

    this.updateMarker();

}


//=========================
// コスト選択
//=========================

setCostSelected(flag = true){

    this.costSelected = flag;

    this.updateSelection();

}


//=========================
// 全解除
//=========================

clearEffects(){

    this.highlight = false;

    this.selected = false;

    this.target = false;

    this.useSelected = false;

    this.costSelected = false;


    this.updateHighlight();

    this.updateMarker();

    this.updateSelection();

}

//=========================
// 発光更新
//=========================

updateHighlight(){

    if(this.highlight){

        this.element.classList.add(
            "card-highlight"
        );

    }else{

        this.element.classList.remove(
            "card-highlight"
        );

    }

}


//=========================
// マーカー更新
//=========================

updateMarker(){

    //----------------------------------
    // リセット
    //----------------------------------

    this.markerElement.style.display =
    "none";

    this.markerElement.classList.remove(
        "marker-selected",
        "marker-target"
    );

    this.markerElement.textContent =
        "";


    //----------------------------------
    // 対象
    //----------------------------------

    if(this.target){

        this.markerElement.style.display =
        "flex";

        this.markerElement.classList.add(
            "marker-target"
        );

        this.markerElement.textContent =
            "⚔";

        return;

    }


    //----------------------------------
    // 選択
    //----------------------------------

    if(this.selected){

        this.markerElement.style.display =
        "block";

        this.markerElement.classList.add(
            "marker-selected"
        );

        return;

    }

}

updateSelection(){

    //----------------------------------
    // 一旦解除
    //----------------------------------

    this.element.classList.remove(
        "selected",
        "selected-use",
        "selected-cost"
    );

    //----------------------------------
    // 手札選択
    //----------------------------------

    if(this.selected){

        this.element.classList.add(
            "selected"
        );

    }

    //----------------------------------
    // 使用カード
    //----------------------------------

    if(this.useSelected){

        this.element.classList.add(
            "selected-use"
        );

    }

    //----------------------------------
    // コストカード
    //----------------------------------

    if(this.costSelected){

        this.element.classList.add(
            "selected-cost"
        );

    }

}

//=========================
// 現在パワー表示
//=========================

updateCurrentPower(summon){

    if(!this.currentPowerElement){

        return;

    }

    //----------------------------------
    // 変動なし
    //----------------------------------

    if(summon.powerBonus === 0){

        this.currentPowerElement.style.display =
        "none";

        return;

    }

    //----------------------------------
    // 表示
    //----------------------------------

    this.currentPowerElement.style.display =
    "flex";

    this.currentPowerElement.textContent =
    getPower(summon);

}


}