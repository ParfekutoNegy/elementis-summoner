//======================================
// ウォーターバリア条件
// 火属性マギアによるプレイヤーダメージ
//======================================

function waterBarrierCondition(event){

    return (
        event.sourceType === "マギア" &&
        event.element === "火"
    );

}
//======================================
// ラピッドムーヴ条件
// サモンの攻撃ダメージ
//======================================

function rapidMoveCondition(event){


    return (

        event.sourceType === "サモン"

    );

}



//======================================
// サンドプロテクト条件
// 1ダメージのみ
//======================================

function sandProtectCondition(event){


    return (

        event.damage === 1

    );

}


function liquidVeilCondition(event){

    console.log(
        "liquidVeilCondition",
        event.sourceType,
        event.element,
        event.type
    );


    return (
        event.sourceType === "マギア"
    );

}

//======================================
// イリュージョンフォグ条件
// サモンがバトル以外で
// ダメージを受けるとき
//======================================

function illusionFogCondition(event){

    console.log(
        "illusionFogCondition",
        {
            type:
                event?.type,

            sourceType:
                event?.sourceType,

            isBattleDamage:
                event?.isBattleDamage,

            target:
                event?.target
                    ?.card?.name,

            damage:
                event?.damage
        }
    );


    //----------------------------------
    // サモンへのダメージのみ
    //----------------------------------

    if(
        event?.type !==
        GAME_EVENT.BEFORE_SUMMON_DAMAGE
    ){

        return false;

    }


    //----------------------------------
    // バトルダメージでは使用不可
    //----------------------------------

    if(
        event.isBattleDamage === true
    ){

        return false;

    }


    //----------------------------------
    // 対象サモン確認
    //----------------------------------

    if(
        !event.target ||
        !(event.target instanceof Summon)
    ){

        return false;

    }


    //----------------------------------
    // 1以上のダメージを受けるとき
    //----------------------------------

    return (
        Number(event.damage) > 0
    );

}