const cards = [
    {
        id: 1,
        name: "ウィルオウィスプ",
        type: "サモン",
        element: "火",
        cost: 1,
        series:"basic",
        image: "images/001-ウィルオウィスプ.jpg"
    },
    {
        id: 2,
        name: "サラマンダー",
        type: "サモン",
        element: "火",
        cost: 2,
        series:"basic",
        image: "images/002-サラマンダー.jpg"
    },
    {
        id: 3,
        name: "フェニックス",
        type: "サモン",
        element: "火",
        cost: 3,
        series:"basic",
        image: "images/003-フェニックス.jpg"
    },
    {
        id: 4,
        name:"ドラゴン",
        type: "サモン",
        element: "火",
        cost: 4,
        series:"basic",
        image: "images/004-ドラゴン.jpg"
    },
    {
        id: 5,
        name:"バーニングエナジー",
        type: "マギア",
        element: "火",
        cost: 1,
        series:"basic",
        image: "images/005-バーニングエナジー.jpg"
    },
    {
        id: 6,
        name:"ファイアボール",
        type: "マギア",
        element: "火",
        cost: 2,
        series:"basic",
        image: "images/006-ファイアボール.jpg"
    },
    {
        id: 7,
        name:"パイロフレイム",
        type: "マギア",
        element: "火",
        cost: 3,
        series:"basic",
        image: "images/007-パイロフレイム.jpg"
    },
    {
        id: 8,
        name:"エクスプロジア",
        type: "マギア",
        element: "火",
        cost: 5,
        series:"basic",
        image: "images/008-エクスプロジア.jpg"
    },
    {
        id: 9,
        name:"フェアリー",
        type: "サモン",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/009-フェアリー.jpg"
    },
    {
        id: 10,
        name:"シルフ",
        type: "サモン",
        element: "風",
        cost: 2,
        series:"basic",
        image: "images/010-シルフ.jpg"
    },
    {
        id: 11,
        name:"ユニコーン",
        type: "サモン",
        element: "風",
        cost: 2,
        series:"basic",
        image: "images/011-ユニコーン.jpg"
    },
    {
        id: 12,
        name:"グリフォン",
        type: "サモン",
        element: "風",
        cost: 4,
        series:"basic",
        image: "images/012-グリフォン.jpg"
    },
    {
        id: 13,
        name:"エアスラッシュ",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/013-エアスラッシュ.jpg"
    },
    {
        id: 14,
        name:"ウィンドプレッシャー",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/014-ウィンドプレッシャー.jpg"
    },
    {
        id: 15,
        name:"フォローウィンド",
        type: "マギア",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/015-フォローウィンド.jpg"
    },
    {
        id: 16,
        name:"ラピッドムーヴ",
        type: "レジスト",
        element: "風",
        cost: 1,
        series:"basic",
        image: "images/016-ラピッドムーヴ.jpg"
    },
    {
        id: 17,
        name:"セイレーン",
        type: "サモン",
        element: "水",
        cost: 1,
        series:"basic",
        image: "images/017-セイレーン.jpg"
    },
    {
        id: 18,
        name:"ウンディーネ",
        type: "サモン",
        element: "水",
        cost: 2,
        series:"basic",
        image: "images/018-ウンディーネ.jpg"
    },
    {
        id: 19,
        name:"ケルピー",
        type: "サモン",
        element: "水",
        cost: 2,
        series:"basic",
        image: "images/019-ケルピー.jpg"
    },
    {
        id: 20,
        name:"クラーケン",
        type: "サモン",
        element: "水",
        cost: 4,
        series:"basic",
        image: "images/020-クラーケン.jpg"
    },
    {
        id: 21,
        name:"リカバリースペル",
        type: "マギア",
        element: "水",
        cost: 2,
        series:"basic",
        image: "images/021-リカバリースペル.jpg"
    },
    {
        id: 22,
        name:"アクアストリーム",
        type: "マギア",
        element: "水",
        cost: 2,
        series:"basic",
        image: "images/022-アクアストリーム.jpg"
    },
    {
        id: 23,
        name:"リキッドヴェール",
        type: "レジスト",
        element: "水",
        cost: 1,
        series:"basic",
        image: "images/023-リキッドヴェール.jpg"
    },
    {
        id: 24,
        name:"ウォーターバリア",
        type: "レジスト",
        element: "水",
        cost: 1,
        series:"basic",
        image: "images/024-ウォーターバリア.jpg"
    },
    {
        id: 25,
        name:"ノーム",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"basic",
        image: "images/025-ノーム.jpg"
    },
    {
        id: 26,
        name:"バジリスク",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"basic",
        image: "images/026-バジリスク.jpg"
    },
    {
        id: 27,
        name:"ガーゴイル",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"basic",
        image: "images/027-ガーゴイル.jpg"
    },
    {
        id: 28,
        name:"ゴーレム",
        type: "サモン",
        element: "土",
        cost: 4,
        series:"basic",
        image: "images/028-ゴーレム.jpg"
    },
    {
        id: 29,
        name:"ロックスパイク",
        type: "マギア",
        element: "土",
        cost: 1,
        series:"basic",
        image: "images/029-ロックスパイク.jpg"
    },
    {
        id: 30,
        name:"サンドプロテクト",
        type: "レジスト",
        element: "土",
        cost: 1,
        series:"basic",
        image: "images/030-サンドプロテクト.jpg"
    },
    {
        id: 31,
        name:"ストーンガード",
        type: "レジスト",
        element: "土",
        cost: 1,
        series:"basic",
        image: "images/031-ストーンガード.jpg"
    },
    {
        id: 32,
        name:"グラウンドウォール",
        type: "レジスト",
        element: "土",
        cost: 2,
        series:"basic",
        image: "images/032-グラウンドウォール.jpg"
    },
    {
        id: 33,
        name:"オーガ",
        type: "サモン",
        element: "火",
        cost: 1,
        series:"folklore",
        image: "images/033-オーガ.jpg"
    },
    {
        id: 34,
        name:"ファイア・ドレイク",
        type: "サモン",
        element: "火",
        cost: 2,
        series:"folklore",
        image: "images/034-ファイア・ドレイク.jpg"
    },
    {
        id: 35,
        name:"ワイバーン",
        type: "サモン",
        element: "火",
        cost: 3,
        series:"folklore",
        image: "images/035-ワイバーン.jpg"
    },
    {
        id: 36,
        name:"ヘルハウンド",
        type: "サモン",
        element: "火",
        cost: 3,
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
        series:"folklore",
        image: "images/041-ケット・シー.jpg"
    },
    {
        id: 42,
        name:"ワーウルフ",
        type: "サモン",
        element: "風",
        cost: 1,
        series:"folklore",
        image: "images/042-ワーウルフ.jpg"
    },
    {
        id: 43,
        name:"ヴァンパイア",
        type: "サモン",
        element: "風",
        cost: 2,
        series:"folklore",
        image: "images/043-ヴァンパイア.jpg"
    },
    {
        id: 44,
        name:"ヒッポグリフ",
        type: "サモン",
        element: "風",
        cost: 3,
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
        series:"folklore",
        image: "images/049-マーフォーク.jpg"
    },
    {
        id: 50,
        name:"ウォーター・リーパー",
        type: "サモン",
        element: "水",
        cost: 2,
        series:"folklore",
        image: "images/050-ウォーター・リーパー.jpg"
    },
    {
        id: 51,
        name:"ジャックフロスト",
        type: "サモン",
        element: "水",
        cost: 2,
        series:"folklore",
        image: "images/051-ジャックフロスト.jpg"
    },
    {
        id: 52,
        name:"シーサーペント",
        type: "サモン",
        element: "水",
        cost: 3,
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
        series:"folklore",
        image: "images/057-マンドラゴラ.jpg"
    },
    {
        id: 58,
        name:"ドッペルゲンガー",
        type: "サモン",
        element: "土",
        cost: 1,
        series:"folklore",
        image: "images/058-ドッペルゲンガー.jpg"
    },
    {
        id: 59,
        name:"ワーム",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"folklore",
        image: "images/059-ワーム.jpg"
    },
    {
        id: 60,
        name:"トロール",
        type: "サモン",
        element: "土",
        cost: 3,
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
        series:"mythology",
        image: "images/065-ミノタウロス.jpg"
    },
    {
        id: 66,
        name:"ケルベロス",
        type: "サモン",
        element: "火",
        cost: 2,
        series:"mythology",
        image: "images/066-ケルベロス.jpg"
    },
    {
        id: 67,
        name:"サイクロプス",
        type: "サモン",
        element: "火",
        cost: 2,
        series:"mythology",
        image: "images/067-サイクロプス.jpg"
    },
    {
        id: 68,
        name:"キマイラ",
        type: "サモン",
        element: "火",
        cost: 3,
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
        series:"mythology",
        image: "images/073-ペガサス.jpg"
    },
    {
        id: 74,
        name:"ハーピー",
        type: "サモン",
        element: "風",
        cost: 2,
        series:"mythology",
        image: "images/074-ハーピー.jpg"
    },
    {
        id: 75,
        name:"ケンタウロス",
        type: "サモン",
        element: "風",
        cost: 2,
        series:"mythology",
        image: "images/075-ケンタウロス.jpg"
    }, 
    {
        id: 76,
        name:"スフィンクス",
        type: "サモン",
        element: "風",
        cost: 3,
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
        series:"mythology",
        image: "images/081-ネレイド.jpg"
    }, 
    {
        id: 82,
        name:"カリュブディス",
        type: "サモン",
        element: "水",
        cost: 2,
        series:"mythology",
        image: "images/082-カリュブディス.jpg"
    }, 
    {
        id: 83,
        name:"ヒュドラ",
        type: "サモン",
        element: "水",
        cost: 3,
        series:"mythology",
        image: "images/083-ヒュドラ.jpg"
    }, 
    {
        id: 84,
        name:"ケートス",
        type: "サモン",
        element: "水",
        cost: 3,
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
        series:"mythology",
        image: "images/089-ラミア.jpg"
    },
    {
        id: 90,
        name:"ドライアド",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"mythology",
        image: "images/090-ドライアド.jpg"
    },
    {
        id: 91,
        name:"メデゥーサ",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"mythology",
        image: "images/091-メドゥーサ.jpg"
    },
    {
        id: 92,
        name:"スパルトイ",
        type: "サモン",
        element: "土",
        cost: 3,
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
        series:"promo",
        image: "images/PR-001 ドラゴンフルアート.jpg"
    },
    {
        id: 1002,
        name:"ドラゴン",
        type: "サモン",
        element: "火",
        cost: 4,
        series:"promo",
        image: "images/PR-002 ドラゴン.jpg"
    },
    {
        id: 1003,
        name:"サラマンダー",
        type: "サモン",
        element: "火",
        cost: 2,
        series:"promo",
        image: "images/PR-003 サラマンダー.jpg"
    },
    {
        id: 1004,
        name:"シルフ",
        type: "サモン",
        element: "風",
        cost: 2,
        series:"promo",
        image: "images/PR-004 シルフ.jpg"
    },
    {
        id: 1005,
        name:"ウンディーネ",
        type: "サモン",
        element: "水",
        cost: 2,
        series:"promo",
        image: "images/PR-005 ウンディーネ.jpg"
    },
    {
        id: 1006,
        name:"ノーム",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"promo",
        image: "images/PR-006 ノーム.jpg"
    },
    {
        id: 1007,
        name:"サラマンダー",
        type: "サモン",
        element: "火",
        cost: 2,
        series:"promo",
        image: "images/PR-007 サラマンダーフルアート.jpg"
    },
    {
        id: 1008,
        name:"シルフ",
        type: "サモン",
        element: "風",
        cost: 2,
        series:"promo",
        image: "images/PR-008 シルフフルアート.jpg"
    },
    {
        id: 1009,
        name:"ウンディーネ",
        type: "サモン",
        element: "水",
        cost: 2,
        series:"promo",
        image: "images/PR-009 ウンディーネフルアート.jpg"
    },
    {
        id: 1010,
        name:"ノーム",
        type: "サモン",
        element: "土",
        cost: 2,
        series:"promo",
        image: "images/PR-010 ノームフルアート.jpg"
    },




   













];
