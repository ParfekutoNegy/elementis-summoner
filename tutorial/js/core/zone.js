//======================================
// zone.js
// ゾーン操作
//======================================


//======================================
// カード追加
//======================================

function addCard(zone, card){

    zone.push(card);

}



//======================================
// カード削除
//======================================

function removeCard(zone, card){

    const index = zone.indexOf(card);

    if(index !== -1){

        zone.splice(index,1);

    }

}



//======================================
// カード移動
//======================================

function moveCard(

    fromZone,

    toZone,

    card

){

    removeCard(

        fromZone,

        card

    );

    addCard(

        toZone,

        card

    );

}

function getCoolCards(owner){

    if(owner === PLAYER){

        return board.playerCoolCards;

    }else{

        return board.enemyCoolCards;

    }

}

function getHandCards(owner){

    if(owner === PLAYER){

        return board.handCards;

    }else{

        return enemyHandCards;

    }

}



function getCoolCards(owner){

    if(owner === PLAYER){

        return board.playerCoolCards;

    }else{

        return board.enemyCoolCards;

    }

}

function getHandZone(owner){

    if(owner === PLAYER){

        return board.handCards;

    }else{

        return enemyHandCards;

    }

}



function getFieldZone(owner){

    if(owner === PLAYER){

        return playerField;

    }else{

        return enemyField;

    }

}



function getCostZone(owner){

    if(owner === PLAYER){

        return playerCostCards;

    }else{

        return enemyCostCards;

    }

}



function getCoolZone(owner){

    if(owner === PLAYER){

        return board.playerCoolCards;

    }else{

        return board.enemyCoolCards;

    }

}