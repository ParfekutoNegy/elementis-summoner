 function displayCards(){
    const keyword =
    document.getElementById("search")
    .value
    .toLowerCase()
    .trim();

    const cardArea =
    document.getElementById("card-area");
    cardArea.innerHTML = "";
   
    const checkedElements =
    Array.from(
        document.querySelectorAll(".elementFilter:checked")
    ).map(box => box.value);
   
    const checkedTypes =
    Array.from(
        document.querySelectorAll(".typeFilter:checked")
    ).map(box => box.value);
    const seriesFilter =
    document.getElementById("seriesFilter").value;
    const checkedCosts =
    Array.from(
        document.querySelectorAll(".costFilter:checked")
    ).map(box => box.value);

    for (let card of cards){
        if(
            keyword &&
            !card.name
            .toLowerCase()
            .includes(keyword)
        ){
            continue;
        }

        if(
            checkedElements.length > 0 &&
            !checkedElements.includes(card.element)
        ){
            continue;
        }

        if(
            checkedTypes.length > 0 &&
            !checkedTypes.includes(String(card.type))
        ){
             continue
        }
        if(
            seriesFilter !== "" &&
            card.series !== seriesFilter
        ){
            continue
        }
        if(
            checkedCosts.length > 0 &&
            !checkedCosts.includes(String(card.cost))
        ){
            continue
        }
           
        cardArea.innerHTML += `
        <div class="card"
        data-id="${card.id}"
        data-name="${card.name}">
        <img
        src="${card.image}"
        onclick="openCardModal('${card.id}')"
        oncontextmenu="removeCard('${card.id}'); return false;">      
        </div>
        `;
    }
}

let mainDeck =[];
let sideDeck =[];
let candidateCards = [];
let currentDeckId = null;
let isLoadingDeck = false;

function updateDeck(){
    const mainDeckArea=
    document.getElementById("main-deck");
    const subDeck=
    document.getElementById("sub-deck");
    mainDeckArea.innerHTML = "";
    subDeck.innerHTML = "";

    let total = 0;
    let mainCount = 0;
    const typeOrder = {
        "サモン":1,
        "マギア":2,
        "レジスト":3
    };
    const deckCards =
    mainDeck
    .map(cardId =>
        cards.find(
            c => c.id === cardId
        )
    )
    .filter(card => card)
   
    for(let cardData of deckCards){
        total ++;
        const wrapper =
        document.createElement("div");
        wrapper.className =
        "deck-card-wrapper";
        const img =
        document.createElement("img");
        img.src = cardData.image;
        img.onclick = function(){
            openCardModal(
                cardData.id,
                "main"
            );
        };
        const upBtn =
        document.createElement("button");
        upBtn.textContent = "◀";
        const downBtn =
        document.createElement("button");
        downBtn.textContent = "▶";
        const currentIndex =
        mainDeck.indexOf(cardData.id);
        const currentType =
        cardData.type;
        /* ▲ボタン表示判定 */
        if(currentIndex <= 0){
            upBtn.style.visibility =
            "hidden";
        }else{
            const prevCard =
            cards.find(
                c =>
                    c.id ===
                mainDeck[currentIndex - 1]
            );
            if(
                !prevCard ||
                prevCard.type !== currentType
            ){
                upBtn.style.visibility =
                "hidden";
            }
        }
        /* ▼ボタン表示判定 */
        if(
            currentIndex >=
            mainDeck.length - 1
        ){
            downBtn.style.visibility =
            "hidden";
        }else{
            const nextCard =
            cards.find(
                c =>
                    c.id ===
                mainDeck[currentIndex + 1]
            );
            if(
                !nextCard ||
                nextCard.type !== currentType
            ){
                downBtn.style.visibility =
                "hidden";
            }
        }

        upBtn.onclick = function(){
            moveCardUp(cardData.id);
        };
        downBtn.onclick = function(){
            moveCardDown(cardData.id)
        }
        const buttonArea =
        document.createElement("div");
        buttonArea.className =
        "move-buttons";

        buttonArea.appendChild(upBtn);
        buttonArea.appendChild(downBtn);

        wrapper.appendChild(img);
        wrapper.appendChild(buttonArea);
        mainDeckArea.appendChild(wrapper);
        mainCount++;
    }

    while(mainCount < 10 ){
        const wrapper =
        document.createElement("div");

        wrapper.className =
        "deck-card-wrapper";
        const img =
        document.createElement("img");

        img.src =
        "images/card-back.jpg";
        img.style.opacity = "0.5";
        wrapper.appendChild(img);
        mainDeckArea.appendChild(wrapper);
        mainCount++;
    }
const sortedSideDeck =
sideDeck
.map(cardId =>
    cards.find(
        c => c.id === cardId
    )
)
.filter(card => card)
.sort(
    (a,b) =>
    typeOrder[a.type]
    -
    typeOrder[b.type]
);
let sideCount = 0;
for(let cardData of sortedSideDeck){
    const img =
    document.createElement("img");
    img.src = cardData.image;
    img.onclick = function(){
        openCardModal(
            cardData.id,
            "side"
        );
    };
    subDeck.appendChild(img);
    sideCount++;
}
while(sideCount < 3){
    const img =
    document.createElement("img");
    img.src =
    "images/card-back.jpg";
    img.style.opacity = "0.5";
    subDeck.appendChild(img);
    sideCount++;
}
autoSaveDeck();
}

function removeCard(cardName){
    const index =
    mainDeck.indexOf(cardName);
    if(index === -1){
        return;
    }
    mainDeck.splice(index,1);
    updateDeck();
}

function autoSaveDeck(){
    if (isLoadingDeck) return; // ★追加
    const deckName =
    document.getElementById("deck-name").value;
    if(
        mainDeck.length === 0 &&
        sideDeck.length === 0 &&
        candidateCards.length === 0
    ){
        return;
    }
    let decks =
    JSON.parse(localStorage.getItem("decks")) || {};
    if(!currentDeckId){
        currentDeckId = Date.now().toString();
    }
    decks[currentDeckId] = {
        id: currentDeckId,
        name: deckName,
        main:[...mainDeck],
        side:[...sideDeck],
        candidate:[...candidateCards],
        updatedAt:Date.now()
    };
    localStorage.setItem(
        "decks",
        JSON.stringify(decks)
    );
    updateDeckList();
}

function clearDeck(){
    if(currentDeckId){
        let decks =
        JSON.parse(
            localStorage.getItem("decks")
        ) || {};
        delete decks[currentDeckId];
        localStorage.setItem(
            "decks",
            JSON.stringify(decks)
        );
    }
    currentDeckId = null;
    mainDeck.length = 0;
    sideDeck.length = 0;
    candidateCards.length =0;
    updateDeck();
    document.getElementById("deck-name").value = "";
    alert("デッキを削除しました");
}

function addCard(cardId){
    mainDeck.push(cardId);
    sortMainDeck();
}

displayCards();
updateDeckList();
showDeckListScreen();

function updateDeckList(){
    const deckList =
    document.getElementById("saved-decks");
    const decks =
    JSON.parse(
        localStorage.getItem("decks")
    ) || {};

    deckList.innerHTML = "";
    const sortedDecks = Object.values(decks).sort(
        (a,b) => (b.updatedAt || 0) - (a.updatedAt || 0)
    );
    for (const deckData of sortedDecks){
        const deckId = deckData.id;


        const displayName =
        deckData.name;

        const firstCardId =
        deckData.main?.[0];
        if(firstCardId === undefined){
            continue;
        }

        const cardData =
        cards.find(
            c => c.id === firstCardId
        );
        const imagePath =
        cardData
        ? cardData.image
        :"images/noimage.jpg";

        deckList.innerHTML += `
        <div class="saved-deck-card">
            <img
            src="${imagePath}"
            class="saved-deck-thumbnail"
            onclick="loadSavedDeck('${deckId}')">

            <div class="saved-deck-name">
                ${displayName}
            </div>
            <div class="saved-deck-buttons">
                <button
                onclick="showDeckImageFromList('${deckId}')">
                表示
                </button>
                <button
                onclick="copyDeckData('${deckId}')">
                複製
                </button>
                <button
                onclick="deleteDeck('${deckId}')">
                削除
                </button>
            </div>
        </div>
        `;
    }
}

function loadSavedDeck(deckId){
    isLoadingDeck = true;
    const decks =
    JSON.parse(
        localStorage.getItem("decks")
    )||{};
   
    const savedDeck =
    decks[deckId];

    mainDeck.length = 0;
    sideDeck.length = 0;
    candidateCards.length = 0;

    if(!savedDeck){
        return;
    }
    currentDeckId =
    savedDeck.id || null;

    mainDeck.length = 0;
    mainDeck.push(
        ...savedDeck.main
    );
   
    sideDeck.push(
        ...savedDeck.side
    );
    if(savedDeck.candidate){
        candidateCards.push(
            ...savedDeck.candidate
        );
    }
    updateDeck();
    updateCandidateArea();
    document.getElementById(
        "deck-name"
    ).value=
    savedDeck.name

    isLoadingDeck = false;

    showBuilderScreen();
}

function deleteDeck(deckId){
    if(!confirm("このデッキを削除しますか？")){
        return;
    }
    let decks =
    JSON.parse (localStorage.getItem("decks"))||{};
    delete decks[deckId];
    localStorage.setItem(
        "decks",
        JSON.stringify(decks)
    );
    updateDeckList();
}

function showDeckListScreen() {
    resetFilters();
    document.getElementById("deck-list-screen").style.display = "block";
    document.getElementById("builder-screen").style.display = "none";
    document.getElementById("deck-image-screen").style.display = "none";
}

function showBuilderScreen(){
    document.getElementById(
        "deck-list-screen"
    ).style.display = "none";
    document.getElementById(
        "deck-image-screen"
    ).style.display = "none";
    document.getElementById(
        "builder-screen"
    ).style.display = "block";
}

function openFilterModal(){
    document.getElementById("filter-modal").style.display="block";    
}

function closeFilterModal(){
    document.getElementById("filter-modal").style.display="none";    
}

let selectedCard = null;
let modalSource = null;

function openCardModal(
    cardId,
    source = "list"
){
    cardId = Number(cardId);
    selectedCard = cardId;
    modalSource = source;

    const card =
    cards.find(c => c.id === cardId);
    if(!card){
        return;
    }
    document.getElementById(
        "modal-card-image"
    ).src = card.image;
    document.getElementById(
        "card-modal"
    ).style.display = "flex";
    const deleteBtn =
    document.getElementById(
        "delete-card-btn"
    );
    const sideBtn =
    document.getElementById(
        "side-btn"
    );
    const mainBtn =
    document.getElementById(
        "main-btn"
    );
    const candidateBtn =
    document.getElementById(
        "candidate-btn"
    );

    if(modalSource === "side"){
        deleteBtn.style.display =
        "inline-block";
        sideBtn.style.display =
        "none";
        mainBtn.style.display =
        "inline-block";
        candidateBtn.style.display =
        "inline-block";
    }else if(
        modalSource === "candidate"
    ){
        deleteBtn.style.display =
        "inline-block";
        sideBtn.style.display =
        "inline-block";
        mainBtn.style.display =
        "inline-block";
        candidateBtn.style.display =
        "none";
    }else if(
        modalSource === "main"
    ){
        deleteBtn.style.display =
        "inline-block";
        sideBtn.style.display =
        "inline-block";
        mainBtn.style.display =
        "none";
        candidateBtn.style.display =
        "inline-block";
    }else{    
        deleteBtn.style.display =
        "none";
        sideBtn.style.display =
        "inline-block";
        mainBtn.style.display =
        "inline-block";
        candidateBtn.style.display =
        "inline-block";
    }
}

function closeCardModal(){
    document.getElementById(
        "card-modal"
    ).style.display = "none";
}

function addToMainDeck(){
    const selectedData =
    cards.find(c => c.id === selectedCard);
    if(!selectedData){
        return;
    }
    //==========================
    // 一覧 → メイン
    //==========================
    if(modalSource === "list"){
        removeSameNameEverywhere(selectedData.name);
        if(mainDeck.length >= 10){
            if(!candidateCards.includes(selectedCard)){
                candidateCards.push(selectedCard);
            }
            alert("メインデッキが満杯です。検討中カードに加えます。");
            updateDeck();
            updateCandidateArea();
            closeCardModal();
            return;
        }
        addCard(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
    //==========================
    // サイド → メイン
    //==========================
    if(modalSource === "side"){
        if(mainDeck.length >= 10){
            const index =
            sideDeck.indexOf(selectedCard);
            if(index !== -1){
                sideDeck.splice(index,1);
            }
            if(!candidateCards.includes(selectedCard)){
                candidateCards.push(selectedCard);
            }
            alert("メインデッキが満杯です。検討中カードに加えます。");
            updateDeck();
            updateCandidateArea();
            closeCardModal();
            return;
        }
        const index =
        sideDeck.indexOf(selectedCard);
        if(index !== -1){
            sideDeck.splice(index,1);
        }
        addCard(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
    //==========================
    // 検討中 → メイン
    //==========================
    if(modalSource === "candidate"){
        if(mainDeck.length >= 10){
            alert("メインデッキが満杯です。");
            closeCardModal();
            return;
        }
        const index =
        candidateCards.indexOf(selectedCard);
        if(index !== -1){
            candidateCards.splice(index,1);
        }
        addCard(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
}

function addToSideDeck(){
    const selectedData =
    cards.find(c => c.id === selectedCard);
    if(!selectedData){
        return;
    }
    //==========================
    // 一覧 → サイド
    //==========================
    if(modalSource === "list"){
        removeSameNameEverywhere(selectedData.name);
        if(sideDeck.length >= 3){
            if(!candidateCards.includes(selectedCard)){
                candidateCards.push(selectedCard);
            }
            alert("サイドデッキが満杯です。検討中カードに加えます。");
            updateDeck();
            updateCandidateArea();
            closeCardModal();
            return;
        }
        sideDeck.push(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
    //==========================
    // メイン → サイド
    //==========================
    if(modalSource === "main"){
        const mainIndex =
        mainDeck.indexOf(selectedCard);
        if(sideDeck.length >= 3){
            if(mainIndex !== -1){
                mainDeck.splice(mainIndex,1);
            }
            if(!candidateCards.includes(selectedCard)){
                candidateCards.push(selectedCard);
            }
            alert("サイドデッキが満杯です。検討中カードに加えます。");
            updateDeck();
            updateCandidateArea();
            closeCardModal();
            return;
        }
        if(mainIndex !== -1){
            mainDeck.splice(mainIndex,1);
        }
        sideDeck.push(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
    //==========================
    // 検討中 → サイド
    //==========================
    if(modalSource === "candidate"){
        if(sideDeck.length >= 3){
            alert("サイドデッキが満杯です。");
            closeCardModal();
            return;
        }
        const candidateIndex =
        candidateCards.indexOf(selectedCard);
        if(candidateIndex !== -1){
            candidateCards.splice(candidateIndex,1);
        }
        sideDeck.push(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
}

function addToCandidate(){
    const selectedData =
    cards.find(c => c.id === selectedCard);
    if(!selectedData){
        return;
    }
    //==========================
    // 一覧 → 検討中
    //==========================
    if(modalSource === "list"){
        // メイン・サイドに同名があれば追加しない
        if(
            hasSameName(mainDeck, selectedData.name) ||
            hasSameName(sideDeck, selectedData.name)
        ){
            alert("このカードはデッキに登録済です。");
            closeCardModal();
            return;
        }
        // 検討中に同名があれば削除
        candidateCards =
        candidateCards.filter(id =>
            cards.find(c => c.id === id)?.name !== selectedData.name
        );
        candidateCards.push(selectedCard);
        updateCandidateArea();
        closeCardModal();
        return;
    }
    //==========================
    // メイン → 検討中
    //==========================
    if(modalSource === "main"){
        const index =
        mainDeck.indexOf(selectedCard);
        if(index !== -1){
            mainDeck.splice(index,1);
        }
        candidateCards =
        candidateCards.filter(id =>
            cards.find(c => c.id === id)?.name !== selectedData.name
        );
        candidateCards.push(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
    //==========================
    // サイド → 検討中
    //==========================
    if(modalSource === "side"){
        const index =
        sideDeck.indexOf(selectedCard);
        if(index !== -1){
            sideDeck.splice(index,1);
        }
        candidateCards =
        candidateCards.filter(id =>
            cards.find(c => c.id === id)?.name !== selectedData.name
        );
        candidateCards.push(selectedCard);
        updateDeck();
        updateCandidateArea();
        closeCardModal();
        return;
    }
}

function showCandidates(){
    const area =
    document.getElementById("candidate-area");
    const btn =
    document.getElementById("candidate-toggle-btn");
    if(area.style.display === "none"){
        area.style.display = "grid";
        btn.textContent = "検討中カード非表示";
    }else{
        area.style.display = "none";
        btn.textContent = "検討中カードを表示";
    }
}

function updateCandidateArea(){
    const area =
    document.getElementById("candidate-area");
    area.innerHTML = "";
    const typeOrder = {
        "サモン": 1,
        "マギア": 2,
        "レジスト": 3
    };
    const sortedCandidateCards =
    candidateCards
    .map(cardId =>
        cards.find(c => c.id === cardId)
    )
    .filter(card => card)
    .sort((a, b) =>
        typeOrder[a.type] - typeOrder[b.type]
    );
    for (const card of sortedCandidateCards){
        area.innerHTML += `
        <img
        src="${card.image}"
        onclick="
        openCardModal(
            '${card.id}',
            'candidate'
        )">
        `;
    }
}

function removeSelectedCard(){
    if(modalSource === "side"){
        const index =
        sideDeck.indexOf(
            selectedCard
        );
        if(index !== -1){
            sideDeck.splice(
                index,
                1
            );
            updateDeck();
        }
    }
    if(modalSource === "candidate"){
        const index =
        candidateCards.indexOf(
            selectedCard
        );
        if(index !== -1){
            candidateCards.splice(
                index,
                1
            );
            updateCandidateArea();
        }
    }
    if(modalSource === "main"){
        const index =
        mainDeck.indexOf(selectedCard);
        if(index !== -1){
            mainDeck.splice(index,1);
        }
        updateDeck();
    }
    closeCardModal();
}

function hasSameName(deckArray, cardName){
    return deckArray.some(id => {
        const card =
        cards.find(c => c.id === id);
        return card?.name === cardName;
    });
}

function removeSameNameEverywhere(cardName){
    mainDeck = mainDeck.filter(id =>
        cards.find(c => c.id === id)?.name !== cardName
    );
    sideDeck = sideDeck.filter(id =>
        cards.find(c => c.id === id)?.name !== cardName
    );
    candidateCards = candidateCards.filter(id =>
        cards.find(c => c.id === id)?.name !== cardName
    );
}

function isCardUsed(cardId){
    const card =
    cards.find(c => c.id === Number(cardId));
    if(!card){
        return false;
    }
    return(
        hasSameName(mainDeck, card.name)||
        hasSameName(sideDeck, card.name)||
        hasSameName(candidateCards, card.name)
    );
}

function sortMainDeck(){
    const typeOrder = {
        "サモン":1,
        "マギア":2,
        "レジスト":3
    };
    mainDeck.sort((a,b)=>{
        const cardA =
        cards.find(
            c => c.id === a
        );
        const cardB =
        cards.find(
            c => c.id === b
        );
        const typeDiff =
        typeOrder[cardA.type]
        -
        typeOrder[cardB.type];
        if(typeDiff !==0){
            return typeDiff;
        }
        return 0;
    });
}

function moveCardUp(cardId){
    const index =
    mainDeck.indexOf(cardId);
    if(index <= 0){
        return;
    }
    [
        mainDeck[index - 1],
        mainDeck[index]
    ] = [
        mainDeck[index],
        mainDeck[index - 1]
    ];
    updateDeck();
}
function moveCardDown(cardId){
    const index =
    mainDeck.indexOf(cardId);
    if(index === -1 ||
       index >= mainDeck.length - 1){
        return;
    }
    [
        mainDeck[index + 1],
        mainDeck[index]
    ] = [
        mainDeck[index],
        mainDeck[index + 1]
    ];
    updateDeck();
}

function createDeckData(){
    const deckName =
    document.getElementById(
        "deck-name"
    ).value || "無名デッキ";
    return {
        version: 1,
        name: deckName,
        main: [...mainDeck],
        side: [...sideDeck]
    };
}

function initCanvas(canvas, width = 700, height = 700) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return ctx;
}

async function exportDeckImage(){
    const preview = document.getElementById("preview");
    preview.removeAttribute("src");

    const canvas = document.getElementById("deck-canvas");
    // ★ここだけ変更（重要）
    const ctx = initCanvas(canvas, 700, 700);
    const cardWidth = 110;
    const cardHeight = 154;
    const gapX = 18;
    const gapY = 18;
    const startX = 35;
    const startY = 130;
    const deckName =
        document.getElementById("deck-name")?.value?.trim() || "NO NAME";
    // ==========================
    // 背景
    // ==========================
    const bg = ctx.createLinearGradient(0, 0, 0, 700);
    bg.addColorStop(0, "#f5ecd5");
    bg.addColorStop(0.45, "#efe1bc");
    bg.addColorStop(1, "#d8c19a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 700, 700);
    drawDeckNamePlate(ctx, deckName);

    ctx.strokeStyle = "#5d411d";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 680, 680);

    // ==========================
    // カード裏面
    // ==========================
    const backImage = await loadImage("images/card-back.jpg");
    // ==========================
    // MAIN
    // ==========================
    ctx.fillStyle ="#2f1f14";
    ctx.font ="bold 20px Georgia";
    ctx.textAlign ="left";
    ctx.fillText("♦ MAIN DECK ♦",startX, startY - 20);

    for (let i = 0; i < 10; i++) {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = startX + col * (cardWidth + gapX);
        const y = startY + row * (cardHeight + gapY);
        if (mainDeck[i]) {
            const card = cards.find(c => c.id === mainDeck[i]);
            if (card) {
                const img = await loadImage(card.image);
                drawCardShadow(ctx, x, y, cardWidth, cardHeight);
                drawRoundedImage(ctx, img, x, y, cardWidth, cardHeight, 5);
            }
        } else {
            ctx.globalAlpha = 0.45;
            drawCardShadow(ctx, x, y, cardWidth, cardHeight);
            drawRoundedImage(ctx, backImage, x, y, cardWidth, cardHeight, 5);
            ctx.globalAlpha = 1;
        }
    }
    // ==========================
    // SIDE
    // ==========================

    const sideStartY = 120 + 154 * 2 + 40 + 40;

    ctx.fillStyle ="#2f1f14";
    ctx.font ="bold 20px Georgia";
    ctx.textAlign ="left";
    ctx.fillText("♦ SIDE DECK ♦",startX, sideStartY - 20);

    const typeOrder = {
        "サモン": 1,
        "マギア": 2,
        "レジスト": 3
    };
    const sortedSideDeck = sideDeck
    .map(cardId => cards.find(c => c.id === cardId))
    .filter(card => card)
    .sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
 
    for (let i = 0; i < 3; i++) {
        const x = startX + i * (cardWidth + gapX);
        const y = sideStartY;
        if (sortedSideDeck[i]) {
            const card = sortedSideDeck[i];
            if (card) {
                const img = await loadImage(card.image);
                drawCardShadow(ctx, x, y, cardWidth, cardHeight);
                drawRoundedImage(ctx, img, x, y, cardWidth, cardHeight, 5);
            }
        } else {
            ctx.globalAlpha = 0.45;
            drawCardShadow(ctx, x, y, cardWidth, cardHeight);
            drawRoundedImage(ctx, backImage, x, y, cardWidth, cardHeight, 5);
            ctx.globalAlpha = 1;
        }
    }
    // ==========================
    // QR
    // ==========================
    ctx.fillStyle ="#2f1f14";
    ctx.font ="bold 20px Georgia";
    ctx.textAlign ="left";
    // ==========================
// QR（修正版：絶対ズレない版）
// ==========================
const qrCanvas = await generateQRCodeAsync();
if (qrCanvas) {
    const qrSize = 120;
    // QRの基準位置（右下エリア固定）
    const qrX = 480;
    const qrY = 520;
    // ★枠
    drawQRFrame(ctx, qrX, qrY, qrSize);
    // ★QR本体
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    // ★文字（QR基準で固定）
    const qrCenterX = qrX + qrSize / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "bold 20px Georgia";
    ctx.fillStyle = "#2f1f14";
    ctx.fillText("♦ DECK QR ♦", qrCenterX, qrY - 20);

    // ==========================
    // ロゴ
    // ==========================
    const logo = await loadImage("images/grimoire.png");
    ctx.drawImage(logo, 450, 635, 182, 49);
    // ==========================
    // 出力
    // ==========================
    canvas.toBlob((blob) => {
        if (!blob) {
            alert("画像生成失敗");
            return;
        }
        const url = URL.createObjectURL(blob);
        const deckName =
            document.getElementById("deck-name").value.trim() || "deck";
        const preview = document.getElementById("preview");
        if (preview) preview.src = url;
        const saveBtn = document.getElementById("save-image-btn");
        if (saveBtn) {
            saveBtn.onclick = () => saveImage(blob, deckName, url);
        }
        const openBtn = document.getElementById("open-btn");
        if (openBtn) {
            openBtn.style.display = "block";
            openBtn.onclick = () => window.open(url, "_blank");
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, "image/png");
}
}

function loadImage(src){
    return new Promise(
        (resolve,reject)=>{
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = () => {
                reject();
            };
            img.src = src;
        }
    );
}

function resetFilters(){

    document.getElementById(
        "search"
    ).value = "";
    document
    .querySelectorAll(
        ".elementFilter"
    )
    .forEach(box => {
        box.checked = false;
    });
    document
    .querySelectorAll(
        ".typeFilter"
    )
    .forEach(box => {
        box.checked = false;
    });
    document
    .querySelectorAll(
        ".costFilter"
    )
    .forEach(box => {
        box.checked = false;
    });
    document.getElementById(
        "seriesFilter"
    ).value = "";
    displayCards();
}

let deckPinned = false;

function toggleDeckPin(){
    const area =
    document.getElementById(
        "main-deck-section"
    );
    const spacer =
    document.getElementById(
        "main-deck-spacer"
    );
    const btn =
    document.getElementById(
        "pin-deck-btn"
    );
    deckPinned = !deckPinned;
    if(deckPinned){
        const height =
        area.offsetHeight;
        spacer.style.display =
        "block";
        spacer.style.height =
        height + "px";
        area.classList.add(
            "deck-pinned"
        );
        btn.textContent =
        "📍";
    }else{
        area.classList.remove(
            "deck-pinned"
        );
        spacer.style.display =
        "none";
        btn.textContent =
        "📌";
    }
}

function getNewDeckName(){
    const decks =
    JSON.parse(
        localStorage.getItem("decks")
    ) || {};
    let number = 1;
    while(true){
        const name =
        number === 1
        ? "新規デッキ"
        : `新規デッキ${number}`;
        const exists =
        Object.values(decks).some(
            deck => deck.name === name
        );
        if(!exists){
            return name;
        }
        number++;
    }
}

function createNewDeck(){
    resetFilters();
    currentDeckId = null;
    mainDeck.length = 0;
    sideDeck.length = 0;
    candidateCards.length = 0;
    document.getElementById(
        "deck-name"
    ).value = getNewDeckName();
    updateDeck();
    updateCandidateArea();
    showBuilderScreen();
}

function getImportedDeckName(baseName){
    const decks =
    JSON.parse(
        localStorage.getItem("decks")
    ) || {};
    let number = 1;
    while(true){
        const name =
        number === 1
        ? `${baseName}📖`
        : `${baseName}📖${number}`;
        const exists =
        Object.values(decks).some(
            deck => deck.name === name
        );
        if(!exists){
            return name;
        }
        number++;
    }
}

function showDeckImagePage(){
    resetFilters();
    document.getElementById(
        "deck-list-screen"
    ).style.display = "none";
    document.getElementById(
        "builder-screen"
    ).style.display = "none";
    document.getElementById(
        "deck-image-screen"
    ).style.display = "flex";
    exportDeckImage();
}

function showDeckImageFromList(deckId){
    loadSavedDeck(deckId);
    showDeckImagePage();
}

function copyDeckData(deckId){
    if(!confirm("このデッキを複製しますか？")) {
        return;
    }
    let decks =
    JSON.parse(localStorage.getItem("decks")) || {};
    const original = decks[deckId];
    if(!original){
        return;
    }
    const newDeckId = Date.now().toString();
    decks[newDeckId] = {
        id: newDeckId,
        name: getCopyDeckName(original.name),
        main: [...original.main],
        side: [...original.side],
        candidate: [...original.candidate],
        updatedAt: Date.now()
    };
    localStorage.setItem(
        "decks",
        JSON.stringify(decks)
    );
    updateDeckList();
}

function getCopyDeckName(baseName){
    baseName = baseName.replace(/ 📄\d*$/,"");
    const decks =
    JSON.parse(
        localStorage.getItem("decks")
    ) || {};
    let number = 1;
    while(true){
        const name =
        number === 1
        ? `${baseName} 📄`
        : `${baseName} 📄${number}`;
        const exists =
        Object.values(decks).some(
            deck => deck.name === name
        );
        if(!exists){
            return name;
        }
        number++;
    }
}

function drawCardShadow(ctx, x, y, w, h) {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "rgba(0,0,0,0.10)");
    grad.addColorStop(1, "rgba(0,0,0,0.25)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 4, w, h, 6);
        ctx.fill();
    } else {
        ctx.fillRect(x + 3, y + 4, w, h);
    }
    ctx.fill();
}

function drawRoundedImage(ctx, img, x, y, w, h, r) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
        .then(() => {
            console.log("PWA ready");
        })
        .catch(err => {
            console.log("SW error:", err);
        });
    });
}

function saveImage(blob, deckName, imageURL) {
    const fileName = `${deckName || "deck"}.png`;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    // iPhoneでもボタンは残す → 動作はメッセージだけ
    if (isIOS) {
        alert("画像を長押しで保存してください")
        return;
    }
    // PC / Androidはダウンロード
    downloadImage(imageURL, fileName);
}

function downloadImage(imageURL, fileName) {
    const a = document.createElement("a");
    a.href = imageURL;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function generateQRCodeAsync() {
    return new Promise((resolve) => {
        const deckData = createDeckData();
        const json = JSON.stringify(deckData);
        const qrArea = document.getElementById("qr-preview");
        qrArea.innerHTML = "";
        const canvas = document.createElement("canvas");
        qrArea.appendChild(canvas);
        QRCode.toCanvas(
            canvas,
            json,
            { width: 400,
                errorCorrectionLevel:"H",
                margin:2
             },
            (error) => {
                if (error) console.error(error);
                resolve(canvas); // ←ここ重要
            }
        );
    });
}

function drawQRFrame(ctx, x, y, size) {
    // 外枠（濃い古書色）
    ctx.fillStyle = "#2f1f14";
    ctx.fillRect(x - 10, y - 10, size + 20, size + 20);
    // 中間枠（装飾ライン）
    ctx.strokeStyle = "#8b6b3d";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 6, y - 6, size + 12, size + 12);
    // 内枠（細ライン）
    ctx.strokeStyle = "#c9b07a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
}

function drawDeckNamePlate(ctx, text) {
    const x = 30;
    const y = 30;
    const w = 640;
    const h = 55;
    // 影
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    // グラデーション（古書プレート）
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, "#f3e3c2");
    grad.addColorStop(0.5, "#e6d2a6");
    grad.addColorStop(1, "#d8bf8a");
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.restore();
    // 外枠
    ctx.strokeStyle = "#3b2a1a";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, 10);
    ctx.stroke();
    // 内枠
    ctx.strokeStyle = "rgba(59,42,26,0.4)";
    ctx.lineWidth = 1;
    roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 8);
    ctx.stroke();
    // 文字
    ctx.fillStyle = "#2f1f14";
    ctx.font = "bold 26px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text || "NO NAME", x + w / 2, y + h / 2);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function loadDeckFromQR(json) {
    let data;
    try {
        data = JSON.parse(json);
    } catch (e) {
        alert("QRデータが壊れています");
        return;
    }
    // 🔥新規デッキとして扱う
    currentDeckId = null;
    mainDeck.length = 0;
    sideDeck.length = 0;
    candidateCards.length = 0;
    // メインデッキ復元
    if (Array.isArray(data.main)) {
        mainDeck.push(
            ...data.main.filter(id =>
                cards.some(c => c.id === id)
            )
        );
    }
    // サイドデッキ復元
    if (Array.isArray(data.side)) {
        sideDeck.push(
            ...data.side.filter(id =>
                cards.some(c => c.id === id)
            )
        );
    }
    // 検討中（あれば）
    if (Array.isArray(data.candidate)) {
        candidateCards.push(
            ...data.candidate.filter(id =>
                cards.some(c => c.id === id)
            )
        );
    }
    // デッキ名
    document.getElementById("deck-name").value =
    getImportedDeckName(
        data.name || "読み込みデッキ"
    );
    // 画面更新
    updateDeck();
    updateCandidateArea();
    //新規デッキとして保存
    autoSaveDeck();
    // 編集画面へ
    /*showBuilderScreen();*/
    alert("QRからデッキを読み込みました");
}

async function tryReadQRCode(img) {
    const patterns = [
        { filter: "none", scale: 1 },
        { filter: "contrast(180%)", scale: 1 },
        { filter: "grayscale(100%) contrast(220%)", scale: 1 },
        { filter: "grayscale(100%) contrast(220%)", scale: 2 }
    ];
    for (const p of patterns) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width * p.scale;
        canvas.height = img.height * p.scale;
        ctx.filter = p.filter;
        ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
        );
        const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );
        const code = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
        );
        if (code) {
            return code;
        }
        // UIを固めないために少し待つ
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    // ---------- jsQRが全部失敗したらZXing ----------
    try {
        const reader = new ZXing.BrowserQRCodeReader();
        const result =
        await reader.decodeFromImageElement(img);
        if (result) {
            return {
                data: result.getText()
            };
        }
    } catch (e) {
        // 読めなかっただけ
        }
        return null;
}

document.getElementById("qr-image-input")
.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    let alreadyHandled = false;
    const reader = new FileReader();
    reader.onload = function () {
        const img = new Image();
        img.onload = async function () {
            const code = await tryReadQRCode(img);
           
            // 🟢ここが重要（1回だけ処理）
            if (alreadyHandled) return;
            alreadyHandled = true;
            if (code) {
                loadDeckFromQR(code.data);
            } else {
                alert("QRコードが見つかりませんでした");
            }
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

const deckName = document.getElementById("deck-name");
deckName.addEventListener("focus", () => {
    // 編集中スタイル
    deckName.classList.add("editing");
    // 全選択
    deckName.select();
});
deckName.addEventListener("blur", () => {
    // 元に戻す
    deckName.classList.remove("editing");
});

const overlay = document.getElementById("deck-name-overlay");
deckName.addEventListener("focus", () => {
    deckName.classList.add("editing");
    overlay.classList.add("show");
    deckName.select();
});
deckName.addEventListener("blur", () => {
    deckName.classList.remove("editing");
    overlay.classList.remove("show");
});

document.querySelectorAll("button").forEach(button=>{
    button.addEventListener("pointerdown",()=>{
        pressButton(button);
    });
});

function pressButton(button){
    if(!button) return;
    button.classList.remove("pressed");
    // 再付与できるようリフロー
    void button.offsetWidth;
    button.classList.add("pressed");
    setTimeout(()=>{
        button.classList.remove("pressed");
    },150);
}


function goToHome(){

    window.location.href =
        "../index.html";

}

function goToBuildRule(){

    window.location.href =
        "../build/build.html";

}