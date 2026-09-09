const CARD_LIST = [
    {
        id: 1,
        name: "ウィルオウィスプ",
        type: "サモン",
        element: "火",
        cost: 1,
        power: 1,
        series:"basic",
        image: "images/001-ウィルオウィスプ.jpg",
        ability: {
            type: "fireMagiaDamageUp",
            value: 2
        },
        text:"自分の【火】のマギアが与えるダメージは＋２される。"
    },
    {
        id: 2,
        name: "サラマンダー",
        type: "サモン",
        element: "火",
        cost: 2,
        power: 1,
        series:"basic",
        image: "images/002-サラマンダー.jpg",    
        ability: {
        type: "elementCostDown",
        element: "火",
        value: 1
    },
        text:"自分の【火】のカードのコストは－１される。"

    },
    {
        id: 3,
        name: "フェニックス",
        type: "サモン",
        element: "火",
        cost: 3,
        power: 3,
        series:"basic",
        image: "images/003-フェニックス.jpg",
        ability: {
            type: "returnToHandOnCool"
        },
        text:"このカードが場からクールゾーンに置かれたとき、手札に戻す。"
    },
    {
        id: 4,
        name:"ドラゴン",
        type: "サモン",
        element: "火",
        cost: 4,
        power: 5,
        series:"basic",
        image: "images/004-ドラゴン.jpg",
        ability: {
        type: "turnPowerUp",
        value: 2,
    },
        text:"自分のターン中、このカードのパワーは＋２される。" 
    },
    {
        id: 5,
        name:"バーニングエナジー",
        type: "マギア",
        element: "火",
        cost: 1,
        series:"basic",
        image: "images/005-バーニングエナジー.jpg",
        effect:{
            target:["enemySummon","playerSummon"],
                type:"powerUp",
                value:2
        },
        tag:"サモン１体",
        text:"このターン中、対象のパワーを＋２する。"
    },
    {
        id: 6,
        name:"ファイアボール",
        type: "マギア",
        element: "火",
        cost: 2,
        series:"basic",
        image: "images/006-ファイアボール.jpg",
        effect:{
            target:["enemySummon" , "enemy","playerSummon"],
            type:"damage",
            value:1
        },
        tag:"相手、もしくはサモン１体",
        text:"対象に１ダメージを与える。"
    },
    {
        id: 7,
        name:"パイロフレイム",
        type: "マギア",
        element: "火",
        cost: 3,
        series:"basic",
        image: "images/007-パイロフレイム.jpg",
        effect:{
        target:["enemySummon" , "enemy","playerSummon"],
        type:"damage",
        value:3
        },
        tag:"相手、もしくはサモン１体",
        text:"対象に３ダメージを与える。"
    },
    {
        id: 8,
        name:"エクスプロジア",
        type: "マギア",
        element: "火",
        cost: 5,
        series:"basic",
        image: "images/008-エクスプロジア.jpg",
        effect:{
        target:["enemySummon" , "enemy","playerSummon"],
        type:"damage",
        value:5
        },
        tag:"相手、もしくはサモン１体",
        text:"対象に５ダメージを与える。"
    },
    {
        id: 9,
        name:"フェアリー",
        type: "サモン",
        element: "風",
        cost: 1,
        power: 1,
        series:"basic",
        image: "images/009-フェアリー.jpg",
        ability: {
            type: "fairyTurnEndReady"
        },
        text:"自分のターン終了時、自分のサモンをすべてタテ向きにする。"

    },
    {
        id: 10,
        name:"シルフ",
        type: "サモン",
        element: "風",
        cost: 2,
        power: 1,
        series:"basic",
        image: "images/010-シルフ.jpg",
        ability: {
        type: "elementCostDown",
        element: "風",
        value: 1},
        text:"自分の【風】のカードのコストは－１される。"
    },

    {
        id: 11,
        name:"ユニコーン",
        type: "サモン",
        element: "風",
        cost: 2,
        power: 2,
        series:"basic",
        image: "images/011-ユニコーン.jpg",
        ability: {type: "summonTurnAttack"},
        text:"このカードは場に出たターンでもアタックできる。"
    },
    {
        id: 12,
        name:"グリフォン",
        type: "サモン",
        element: "風",
        cost: 4,
        power: 3,
        series:"basic",
        image: "images/012-グリフォン.jpg",
        ability: {
            type: "cannotBeBlocked"
        },
        text:"このカードはブロックされない。"

    },

    {
        id: 13,
        name:"エアスラッシュ",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/013-エアスラッシュ.jpg",
        effect:{
            target:["enemy"],
            type:"damage",
            value:1
        },
        tag:"相手",
        text:"対象に１ダメージを与える。"

    },
    {
        id: 14,
        name:"ウィンドプレッシャー",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/014-ウィンドプレッシャー.jpg",
        tag:"相手",
        text: "相手は手札を1枚選び、コストゾーンに伏せる。",
        effect: {
            type: "forceCost",
            target: ["enemy"]
        }
    },
    {
        id: 15,
        name:"フォローウィンド",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/015-フォローウィンド.jpg",
        tag:"サモン1体",
        text: "対象は場に出たターンでもアタックできる。", 
        effect: {  
            type: "attackReady",  
            target: ["playerSummon","enemySummon"]
        }
    },
    {
        id: 16,
        name:"ラピッドムーヴ",
        type: "レジスト",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/016-ラピッドムーヴ.jpg",
        trigger:"beforePlayerDamage",
        condition:rapidMoveCondition,
        effect:"rapidMove",
        condi:"自分がサモンからダメージを受けるとき",
        text:"受けるダメージを０にする。"
    },
    {
        id: 17,
        name:"セイレーン",
        type: "サモン",
        element: "水",
        cost: 1,
        power: 1,
        series:"basic",
        image: "images/017-セイレーン.jpg",
        ability: {
        type: "enemyMagiaCostUp",
        value: 1
        },
        text:"相手のマギアのコストは＋１される。"
    },
    {
        id: 18,
        name:"ウンディーネ",
        type: "サモン",
        element: "水",
        cost: 2,
        power: 1,
        series:"basic",
        image: "images/018-ウンディーネ.jpg",
        ability: {
        type: "elementCostDown",
        element: "水",
        value: 1
    },
    text:"自分の【水】のカードのコストは－１される。"

    },
    {
        id: 19,
        name:"ケルピー",
        type: "サモン",
        element: "水",
        cost: 2,
        power: 2,
        series:"basic",
        image: "images/019-ケルピー.jpg",
        ability: {
            type: "attackVerticalSummon"
        },
        text:"このカードはタテ向きのサモンにアタックできる。"
    },
    {
        id: 20,
        name:"クラーケン",
        type: "サモン",
        element: "水",
        cost: 4,
        power: 4,
        series:"basic",
        image: "images/020-クラーケン.jpg",
        ability: {
            type: "cannotBeMagiaTarget"
        },
        text:"相手はこのカードをマギアの対象として選べない。"
    },
    {
        id: 21,
        name:"リカバリースペル",
        type: "マギア",
        element: "水",
        cost: 2,
        series:"basic",
        image: "images/021-リカバリースペル.jpg",
        text: "自分のクールゾーンのカード1枚を対象とする。そのカードを手札に戻す。",
        effect: {
        type: "returnToHand",
        target: ["playerCoolCard"]
    },
    tag:"自分のクールゾーンのカード１枚",
    text:"対象を手札に戻す。"
    },

    {
        id: 22,
        name:"アクアストリーム",
        type: "マギア",
        element: "水",
        cost: 2,
        series:"basic",
        image: "images/022-アクアストリーム.jpg",
        text: "タテ向きのサモン1体を対象とする。そのサモンをヨコ向きにする。",
        effect: {
        type: "horizontal",
        target: ["playerVerticalSummon","enemyVerticalSummon"]
    },
    tag:"タテ向きのサモン１体",
    text:"対象をヨコ向きにする。"
    },

    {
        id: 23,
        name:"リキッドヴェール",
        type: "レジスト",
        element: "水",
        cost: 1,
        series:"basic",
        image: "images/023-リキッドヴェール.jpg",
        trigger:["beforePlayerDamage","beforeSummonDamage"],  
        condition:liquidVeilCondition, 
        effect:"liquidVeil",
        condi:"自分、もしくはサモン１体がマギアでダメージを受けるとき",
        text:"受けるダメージを－２する。"
    },
    {
        id: 24,
        name:"ウォーターバリア",
        type: "レジスト",
        element: "水",
        cost: 1,
        series:"basic",
        image: "images/024-ウォーターバリア.jpg",
        trigger:"beforePlayerDamage",
        condition:waterBarrierCondition,
        effect:"waterBarrier",
        condi:"自分が【火】のマギアでダメージを受けるとき",
        text:"受けるダメージを０にする。"
    },
    {
        id: 25,
        name:"ノーム",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 1,
        series:"basic",
        image: "images/025-ノーム.jpg",
        ability: {
        type: "elementCostDown",
        element: "土",
        value: 1
    },
    text:"自分の【土】のカードのコストは－１される。"
    },

    {
        id: 26,
        name:"バジリスク",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 2,
        series:"basic",
        image: "images/026-バジリスク.jpg",
        ability: { 
            type: "coolAfterBattle"
        },
        text:"このカードとバトルをしたサモンは、バトル後にクールゾーンに置く。"
    },
    {
        id: 27,
        name:"ガーゴイル",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 2,
        series:"basic",
        image: "images/027-ガーゴイル.jpg",
        ability: {   
            type: "reducePlayerDamage",
            value: 1
        },
        text:"自分が受けるダメージは－１される。"
    },
    {
        id: 28,
        name:"ゴーレム",
        type: "サモン",
        element: "土",
        cost: 4,
        power: 3,
        series:"basic",
        image: "images/028-ゴーレム.jpg",
        ability: {
            type: "noDamageWhenBlocking"
        },
        text:"このカードはブロックしたとき、相手のサモンからダメージを受けない。"
    },
    {
        id: 29,
        name:"ロックスパイク",
        type: "マギア",
        element: "土",
        cost: 1,
        series:"basic",
        image: "images/029-ロックスパイク.jpg",
        effect:{
        target:["enemySummon" ,"playerSummon"],
        type:"damage",
        value:2
        },
        tag:"サモン１体",
        text:"２ダメージを与える。"

    },
    {
        id: 30,
        name:"サンドプロテクト",
        type: "レジスト",
        element: "土",
        cost: 1,
        series:"basic",
        image: "images/030-サンドプロテクト.jpg",
        trigger:"beforePlayerDamage",
        condition:sandProtectCondition,
        effect:"sandProtect",
        condi:"自分が、ちょうど１のダメージを受けるとき",
        text:"受けるダメージを０にしたあと、このカードを手札に戻す。"
    },
    {
        id: 31,
        name:"ストーンガード",
        type:"レジスト",
        element: "土",
        cost: 1,
        series:"basic",
        image: "images/031-ストーンガード.jpg",
        trigger:"beforePlayerDamage",
        effect:"stoneGuard",
        condi:"自分がダメージを受けるとき",
        text:"受けるダメージを－３する。"

    },
    {
        id: 32,
        name:"グラウンドウォール",
        type: "レジスト",
        element: "土",
        cost: 2,
        series:"basic",
        image: "images/032-グラウンドウォール.jpg",
        trigger:"beforePlayerDamage",
        effect:"groundwall",
        condi:"自分がダメージを受けるとき",
        text:"受けるダメージを－５する。"
    },
    {
        id: 33,
        name:"オーガ",
        type: "サモン",
        element: "火",
        cost: 1,
        power: 3,
        series:"folklore",
        image: "images/033-オーガ.jpg"
    },
    {
        id: 34,
        name:"ファイア・ドレイク",
        type: "サモン",
        element: "火",
        cost: 2,
        power: 2,
        series:"folklore",
        image: "images/034-ファイア・ドレイク.jpg"
    },
    {
        id: 35,
        name:"ワイバーン",
        type: "サモン",
        element: "火",
        cost: 3,
        power: 2,
        series:"folklore",
        image: "images/035-ワイバーン.jpg"
    },
    {
        id: 36,
        name:"ヘルハウンド",
        type: "サモン",
        element: "火",
        cost: 3,
        power: 2,
        series:"folklore",
        image: "images/036-ヘルハウンド.jpg"
    },
    {
        id: 37,
        name:"マグナブレイズ",
        type: "マギア",
        element: "火",
        cost: 2,
        series:"folklore",
        image: "images/037-マグナブレイズ.jpg"
    },
    {
        id: 38,
        name:"インフェルノ",
        type: "マギア",
        element: "火",
        cost: 3,
        series:"folklore",
        image: "images/038-インフェルノ.jpg"
    },
    {
        id: 39,
        name:"ヒートストレングス",
        type: "レジスト",
        element: "火",
        cost: 1,
        series:"folklore",
        image: "images/039-ヒートストレングス.jpg"
    },
    {
        id: 40,
        name:"バトルボム",
        type: "レジスト",
        element: "火",
        cost: 2,
        series:"folklore",
        image: "images/040-バトルボム.jpg"
    },
    {
        id: 41,
        name:"ケット・シー",
        type: "サモン",
        element: "風",
        cost: 1,
        power: 1,
        series:"folklore",
        image: "images/041-ケット・シー.jpg"
    },
    {
        id: 42,
        name:"ワーウルフ",
        type: "サモン",
        element: "風",
        cost: 1,
        power: 3,
        series:"folklore",
        image: "images/042-ワーウルフ.jpg"
    },
    {
        id: 43,
        name:"ヴァンパイア",
        type: "サモン",
        element: "風",
        cost: 2,
        power: 2,
        series:"folklore",
        image: "images/043-ヴァンパイア.jpg"
    },
    {
        id: 44,
        name:"ヒッポグリフ",
        type: "サモン",
        element: "風",
        cost: 3,
        power: 3,
        series:"folklore",
        image: "images/044-ヒッポグリフ.jpg"
    },
    {
        id: 45,
        name:"トルネード",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"folklore",
        image: "images/045-トルネード.jpg"
    },
    {
        id: 46,
        name:"ブレイクスルー",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"folklore",
        image: "images/046-ブレイクスルー.jpg"
    },
    {
        id: 47,
        name:"クイックアクション",
        type: "マギア",
        element: "風",
        cost: 4,
        series:"folklore",
        image: "images/047-クイックアクション.jpg"
    },
    {
        id: 48,
        name:"ファストコール",
        type: "レジスト",
        element: "風",
        cost: 3,
        series:"folklore",
        image: "images/048-ファストコール.jpg"
    },
    {
        id: 49,
        name:"マーフォーク",
        type: "サモン",
        element: "水",
        cost: 1,
        power: 1,
        series:"folklore",
        image: "images/049-マーフォーク.jpg"
    },
    {
        id: 50,
        name:"ウォーター・リーパー",
        type: "サモン",
        element: "水",
        cost: 2,
        power: 2,
        series:"folklore",
        image: "images/050-ウォーター・リーパー.jpg"
    },
    {
        id: 51,
        name:"ジャックフロスト",
        type: "サモン",
        element: "水",
        cost: 2,
        power: 2,
        series:"folklore",
        image: "images/051-ジャックフロスト.jpg"
    },
    {
        id: 52,
        name:"シーサーペント",
        type: "サモン",
        element: "水",
        cost: 3,
        power: 3,
        series:"folklore",
        image: "images/052-シーサーペント.jpg"
    },
    {
        id: 53,
        name:"オブリビオンレイン",
        type: "マギア",
        element: "水",
        cost: 1,
        series:"folklore",
        image: "images/053-オブリビオンレイン.jpg"
    },
    {
        id: 54,
        name:"クリスタルピーピング",
        type: "マギア",
        element: "水",
        cost: 1,
        series:"folklore",
        image: "images/054-クリスタルピーピング.jpg"
    },
    {
        id: 55,
        name:"イリュージョンフォグ",
        type: "レジスト",
        element: "水",
        cost: 1,
        series:"folklore",
        image: "images/055-イリュージョンフォグ.jpg"
    },
    {
        id: 56,
        name:"キャンセレーション",
        type: "レジスト",
        element: "水",
        cost: 1,
        series:"folklore",
        image: "images/056-キャンセレーション.jpg"
    },
    {
        id: 57,
        name:"マンドラゴラ",
        type: "サモン",
        element: "土",
        cost: 1,
        power: 1,
        series:"folklore",
        image: "images/057-マンドラゴラ.jpg"
    },
    {
        id: 58,
        name:"ドッペルゲンガー",
        type: "サモン",
        element: "土",
        cost: 1,
        power: 1,
        series:"folklore",
        image: "images/058-ドッペルゲンガー.jpg"
    },
    {
        id: 59,
        name:"ワーム",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 1,
        series:"folklore",
        image: "images/059-ワーム.jpg"
    },
    {
        id: 60,
        name:"トロール",
        type: "サモン",
        element: "土",
        cost: 3,
        power: 3,
        series:"folklore",
        image: "images/060-トロール.jpg"
    },
    {
        id: 61,
        name:"アースクェイク",
        type: "マギア",
        element: "土",
        cost: 1,
        series:"folklore",
        image: "images/061-アースクェイク.jpg"
    },
    {
        id: 62,
        name:"クレイクリエイト",
        type: "マギア",
        element: "土",
        cost: 4,
        series:"folklore",
        image: "images/062-クレイクリエイト.jpg"
    },
    {
        id: 63,
        name:"マルチシールド",
        type: "レジスト",
        element: "土",
        cost: 1,
        series:"folklore",
        image: "images/063-マルチシールド.jpg"
    },
    {
        id: 64,
        name:"ダイヤスキン",
        type: "レジスト",
        element: "土",
        cost: 1,
        series:"folklore",
        image: "images/064-ダイヤスキン.jpg"
    },
    {
        id: 65,
        name:"ミノタウロス",
        type: "サモン",
        element: "火",
        cost: 1,
        power: 1,
        series:"mythology",
        image: "images/065-ミノタウロス.jpg"
    },
    {
        id: 66,
        name:"ケルベロス",
        type: "サモン",
        element: "火",
        cost: 2,
        power: 2,
        series:"mythology",
        image: "images/066-ケルベロス.jpg"
    },
    {
        id: 67,
        name:"サイクロプス",
        type: "サモン",
        element: "火",
        cost: 2,
        power: 4,
        series:"mythology",
        image: "images/067-サイクロプス.jpg"
    },
    {
        id: 68,
        name:"キマイラ",
        type: "サモン",
        element: "火",
        cost: 3,
        power: 3,
        series:"mythology",
        image: "images/068-キマイラ.jpg"
    },
    {
        id: 69,
        name:"ダメージブースト",
        type: "マギア",
        element: "火",
        cost: 1,
        series:"mythology",
        image: "images/069-ダメージブースト.jpg"
    },
    {
        id: 70,
        name:"ソウルバーン",
        type: "マギア",
        element: "火",
        cost: 1,
        series:"mythology",
        image: "images/070-ソウルバーン.jpg"
    }, 
    {
        id: 71,
        name:"イグナイト",
        type: "マギア",
        element: "火",
        cost: 2,
        series:"mythology",
        image: "images/071-イグナイト.jpg"
    }, 
    {
        id: 72,
        name:"リコイルショック",
        type: "レジスト",
        element: "火",
        cost: 1,
        series:"mythology",
        image: "images/072-リコイルショック.jpg"
    },
    {
        id: 73,
        name:"ペガサス",
        type: "サモン",
        element: "風",
        cost: 1,
        power: 1,
        series:"mythology",
        image: "images/073-ペガサス.jpg"
    },
    {
        id: 74,
        name:"ハーピー",
        type: "サモン",
        element: "風",
        cost: 2,
        power: 1,
        series:"mythology",
        image: "images/074-ハーピー.jpg"
    },
    {
        id: 75,
        name:"ケンタウロス",
        type: "サモン",
        element: "風",
        cost: 2,
        power: 1,
        series:"mythology",
        image: "images/075-ケンタウロス.jpg"
    }, 
    {
        id: 76,
        name:"スフィンクス",
        type: "サモン",
        element: "風",
        cost: 3,
        power: 3,
        series:"mythology",
        image: "images/076-スフィンクス.jpg"
    }, 
    {
        id: 77,
        name:"メモリーシャッフル",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"mythology",
        image: "images/077-メモリーシャッフル.jpg"
    }, 
    {
        id: 78,
        name:"カーススモーク",
        type: "マギア",
        element: "風",
        cost: 2,
        series:"mythology",
        image: "images/078-カーススモーク.jpg"
    }, 
    {
        id: 79,
        name:"ハイスピード",
        type: "レジスト",
        element: "風",
        cost: 1,
        series:"mythology",
        image: "images/079-ハイスピード.jpg"
    }, 
    {
        id: 80,
        name:"カウンタースラッシュ",
        type: "レジスト",
        element: "風",
        cost: 1,
        series:"mythology",
        image: "images/080-カウンタースラッシュ.jpg"
    }, 
    {
        id: 81,
        name:"ネレイド",
        type: "サモン",
        element: "水",
        cost: 1,
        power: 1,
        series:"mythology",
        image: "images/081-ネレイド.jpg"
    }, 
    {
        id: 82,
        name:"カリュブディス",
        type: "サモン",
        element: "水",
        cost: 2,
        power: 2,
        series:"mythology",
        image: "images/082-カリュブディス.jpg"
    }, 
    {
        id: 83,
        name:"ヒュドラ",
        type: "サモン",
        element: "水",
        cost: 3,
        power: 3,
        series:"mythology",
        image: "images/083-ヒュドラ.jpg"
    }, 
    {
        id: 84,
        name:"ケートス",
        type: "サモン",
        element: "水",
        cost: 3,
        power: 4,
        series:"mythology",
        image: "images/084-ケートス.jpg"
    }, 
    {
        id: 85,
        name:"アイスジェイル",
        type: "マギア",
        element: "水",
        cost: 1,
        series:"mythology",
        image: "images/085-アイスジェイル.jpg"
    },
    {
        id: 86,
        name:"イミテーション",
        type: "マギア",
        element: "水",
        cost: 1,
        series:"mythology",
        image: "images/086-イミテーション.jpg"
    },
    {
        id: 87,
        name:"デリュージ",
        type: "マギア",
        element: "水",
        cost: 5,
        series:"mythology",
        image: "images/087-デリュージ.jpg"
    },
    {
        id: 88,
        name:"スノーストーム",
        type: "レジスト",
        element: "水",
        cost: 3,
        series:"mythology",
        image: "images/088-スノーストーム.jpg"
    },
    {
        id: 89,
        name:"ラミア",
        type: "サモン",
        element: "土",
        cost: 1,
        power: 1,
        series:"mythology",
        image: "images/089-ラミア.jpg"
    },
    {
        id: 90,
        name:"ドライアド",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 1,
        series:"mythology",
        image: "images/090-ドライアド.jpg"
    },
    {
        id: 91,
        name:"メデゥーサ",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 2,
        series:"mythology",
        image: "images/091-メドゥーサ.jpg"
    },
    {
        id: 92,
        name:"スパルトイ",
        type: "サモン",
        element: "土",
        cost: 3,
        power: 2,
        series:"mythology",
        image: "images/092-スパルトイ.jpg"
    },
    {
        id: 93,
        name:"コンセントレイト",
        type: "マギア",
        element: "土",
        cost: 1,
        series:"mythology",
        image: "images/093-コンセントレイト.jpg"
    },
    {
        id: 94,
        name:"プリヴェント",
        type: "レジスト",
        element: "土",
        cost: 1,
        series:"mythology",
        image: "images/094-プリヴェント.jpg"
    },
    {
        id: 95,
        name:"フレキシブルサンド",
        type: "レジスト",
        element: "土",
        cost: 1,
        series:"mythology",
        image: "images/095-フレキシブルサンド.jpg"
    },
    {
        id: 96,
        name:"アースディフェンス",
        type: "レジスト",
        element: "土",
        cost: 4,
        series:"mythology",
        image: "images/096-アースディフェンス.jpg"
    },

    {
        id: 1001,
        name:"ドラゴン",
        type: "サモン",
        element: "火",
        cost: 4,
        power: 5,
        series:"promo",
        image: "images/PR-001 ドラゴンフルアート.jpg",
        ability: {
        type: "turnPowerUp",
        value: 2
    },
        text:"自分のターン中、このカードのパワーは＋２される。" 
    },

    {
        id: 1002,
        name:"ドラゴン",
        type: "サモン",
        element: "火",
        cost: 4,
        power: 5,
        series:"promo",
        image: "images/PR-002 ドラゴン.jpg",
        ability: {
        type: "turnPowerUp",
        value: 2
    },
        text:"自分のターン中、このカードのパワーは＋２される。" 
    },
    {
        id: 1003,
        name:"サラマンダー",
        type: "サモン",
        element: "火",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-003 サラマンダー.jpg",
        ability: {
        type: "elementCostDown",
        element: "火",
        value: 1
    },
        text:"自分の【火】のカードのコストは－１される。"

    },
    {
        id: 1004,
        name:"シルフ",
        type: "サモン",
        element: "風",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-004 シルフ.jpg",
        ability: {
        type: "elementCostDown",
        element: "風",
        value: 1},
        text:"自分の【風】のカードのコストは－１される。"
    },
    {
        id: 1005,
        name:"ウンディーネ",
        type: "サモン",
        element: "水",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-005 ウンディーネ.jpg",
        ability: {
        type: "elementCostDown",
        element: "水",
        value: 1
    },
    text:"自分の【水】のカードのコストは－１される。"

    },
    {
        id: 1006,
        name:"ノーム",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-006 ノーム.jpg",
        ability: {
        type: "elementCostDown",
        element: "土",
        value: 1
    },
    text:"自分の【土】のカードのコストは－１される。"
    },
    {
        id: 1007,
        name:"サラマンダー",
        type: "サモン",
        element: "火",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-007 サラマンダーフルアート.jpg",
        ability: {
        type: "elementCostDown",
        element: "火",
        value: 1
    },
        text:"自分の【火】のカードのコストは－１される。"

    },
    {
        id: 1008,
        name:"シルフ",
        type: "サモン",
        element: "風",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-008 シルフフルアート.jpg",
        ability: {
        type: "elementCostDown",
        element: "風",
        value: 1},
        text:"自分の【風】のカードのコストは－１される。"
    },
    {
        id: 1009,
        name:"ウンディーネ",
        type: "サモン",
        element: "水",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-009 ウンディーネフルアート.jpg",
        ability: {
        type: "elementCostDown",
        element: "水",
        value: 1
    },
    text:"自分の【水】のカードのコストは－１される。"

    },
    {
        id: 1010,
        name:"ノーム",
        type: "サモン",
        element: "土",
        cost: 2,
        power: 1,
        series:"promo",
        image: "images/PR-010 ノームフルアート.jpg",
        ability: {
        type: "elementCostDown",
        element: "土",
        value: 1
    },
    text:"自分の【土】のカードのコストは－１される。"
    },


];