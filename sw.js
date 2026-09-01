const CACHE_NAME = "elementis-summoner-v1";

const FILES_TO_CACHE = [

    "./",
    "./index.html",
    "./top.css",
    "./cards.js",
    "./manifest.json"

];


//======================================
// インストール
//======================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "★ Service Worker インストール"
        );

        event.waitUntil(

            caches.open(
                CACHE_NAME
            ).then(
                cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                }
            )

        );

    }
);


//======================================
// 古いキャッシュ削除
//======================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "★ Service Worker アクティベート"
        );

        event.waitUntil(

            caches.keys().then(
                cacheNames => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                cacheName =>
                                    cacheName !== CACHE_NAME
                            )
                            .map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )

                    );

                }
            )

        );

    }
);


//======================================
// ファイル取得
//======================================

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            fetch(
                event.request
            ).catch(
                () => {

                    return caches.match(
                        event.request
                    );

                }
            )

        );

    }
);