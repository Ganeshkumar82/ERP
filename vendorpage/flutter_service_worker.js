'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "bb992cc755f100eccd4e22cc7119b060",
"assets/AssetManifest.bin.json": "cb2af2d5c5608a8ad887c5f5e5b15d80",
"assets/AssetManifest.json": "d14998d9390e674d093abc11f69ea5ee",
"assets/assets/animations/JSON/1%2520-%2520Copy.json": "0bca735cb92c3e8452c49c35031287fd",
"assets/assets/animations/JSON/1.json": "0bca735cb92c3e8452c49c35031287fd",
"assets/assets/animations/JSON/emptycustomerlist.json": "3c1971543d656a23177e9779563ebf77",
"assets/assets/animations/JSON/emptyprocesslist.json": "49e5b551600e3e5940ff1143c4b41b90",
"assets/assets/animations/JSON/emptysubscriptionlist.json": "fe825e43a1ecec85cdb358bf628a5e12",
"assets/assets/animations/JSON/packageview.json": "d8ffa80fdc4d35f20f04cd2ec55efe70",
"assets/assets/config.json": "1db48e9ffb17f6cef86f8ec0b9b82eb0",
"assets/assets/fonts/AbrilFatface-Regular.ttf": "8c6847c75ae35d0ca5fd3798d4567443",
"assets/assets/fonts/FiraSans-Black.ttf": "608b764a1cc4218d10f27600ef530fa6",
"assets/assets/fonts/FiraSans-BlackItalic.ttf": "57579f90e4c29a5d880a83efe78e1833",
"assets/assets/fonts/FiraSans-Bold.ttf": "382e230417d252a0cb16c7d491b030c7",
"assets/assets/fonts/FiraSans-BoldItalic.ttf": "6e7fd9789e43219fec5bcefb98aa872f",
"assets/assets/fonts/FiraSans-ExtraBold.ttf": "ab5e89ae3427a97125ae380280b1df7f",
"assets/assets/fonts/FiraSans-ExtraBoldItalic.ttf": "efd9cf8a84e4ddc8be4774fec875b06b",
"assets/assets/fonts/FiraSans-ExtraLight.ttf": "7b01a1d6efbf405007495ea871f58d42",
"assets/assets/fonts/FiraSans-ExtraLightItalic.ttf": "ffffdab9fd18858235473d663b2ab325",
"assets/assets/fonts/FiraSans-Italic.ttf": "576fe2da09745b60e892fb5bbda8bf77",
"assets/assets/fonts/FiraSans-Light.ttf": "20161a557e36034d7255f22dadab5f58",
"assets/assets/fonts/FiraSans-LightItalic.ttf": "19d6dc84ea6417eb624c3313a9397e51",
"assets/assets/fonts/FiraSans-Medium.ttf": "f97963c595e8acb87013c1d4e1c3c9f9",
"assets/assets/fonts/FiraSans-MediumItalic.ttf": "c4a7f4d91c0e1cda2d762796f3f887e2",
"assets/assets/fonts/FiraSans-Regular.ttf": "50e780b45678ae34cef52d3e5112bd0d",
"assets/assets/fonts/FiraSans-SemiBold.ttf": "eb5e811f2fe0408c9d0a552fcf1fb390",
"assets/assets/fonts/FiraSans-SemiBoldItalic.ttf": "a61964676efbf35bc263fe7086ef1716",
"assets/assets/fonts/FiraSans-Thin.ttf": "8205dc3e1f7953b4f52ed6a23977a6be",
"assets/assets/fonts/FiraSans-ThinItalic.ttf": "5512e98f8b6a8f9e5f0a11546cd1e084",
"assets/assets/fonts/Helvetica-Bold.ttf": "d13db1fed3945c3b8c3293bfcfadb32f",
"assets/assets/fonts/Helvetica.ttf": "1b580d980532792578c54897ca387e2c",
"assets/assets/fonts/Montserrat-Regular.ttf": "5e077c15f6e1d334dd4e9be62b28ac75",
"assets/assets/fonts/Notosans.ttf": "b72e420edb95cdf06e6e0a27bc0d964d",
"assets/assets/fonts/OFL.txt": "824d06d116dbf37b905f885cc8ae9a31",
"assets/assets/fonts/Poppins-Medium.ttf": "a4e11dda40531debd374e4c8b1dcc7f4",
"assets/assets/fonts/Poppins-Regular.ttf": "731a28a413d642522667a2de8681ff35",
"assets/assets/fonts/Poppins-Thin.ttf": "735aa7d8e35b63068b9113ea2545f0c3",
"assets/assets/fonts/Roboto-Bold.ttf": "8c9110ec6a1737b15a5611dc810b0f92",
"assets/assets/fonts/roboto.ttf": "3aa911d4a1e76c8946952fe744ce7434",
"assets/assets/images/1.svg": "14fa562892d26a9c89cc21794c3a2d53",
"assets/assets/images/2.jpg": "2f67d83e6b6a2b234653425f5a466327",
"assets/assets/images/2.svg": "3a0dd2aa9cac1de3e10b9398ce8fa37b",
"assets/assets/images/3.svg": "6be01676b5afbd1f02ae64e9221aa059",
"assets/assets/images/4.svg": "764e1223b2a10eaa2a2264152481720c",
"assets/assets/images/5.svg": "74405e84a95acb5d3f37b1b877daaa8c",
"assets/assets/images/6.svg": "34e6d4fc4f365d315cbf15c9d4f26754",
"assets/assets/images/abcd.png": "db79059d90a2e35c9b59c56f6cc4a779",
"assets/assets/images/addcustomer.png": "0dc59960f8cd973821400b2a3347e27c",
"assets/assets/images/addenquiry.png": "52b353fe8e6dc4ed4b67c30be508a080",
"assets/assets/images/addpeople.png": "bc0335fe8090a391143de414bad6e372",
"assets/assets/images/addprocess.png": "9b98262ebeb80f8a7bfc9a3d1fed0e52",
"assets/assets/images/addvendorprocess.png": "c75e3837a797296dd96b11c187b253ec",
"assets/assets/images/AIMbg1.jpg": "a320eb660a4224617860035eeb01b9bf",
"assets/assets/images/balancesheet.png": "2087849a35d907acf7efc55dabff35ca",
"assets/assets/images/bay.jpg": "552e032a1b3b7714a81a105133c71613",
"assets/assets/images/black.jpg": "1cf3cc3e732dca6941115b081f5bd8e6",
"assets/assets/images/bottom.jpg": "2e1291e401aa97d2255f3e89c90b92b8",
"assets/assets/images/car.jpg": "66b15e9807d46ea8087ab6fc72be1d19",
"assets/assets/images/clientreq.png": "219840fd513cc196e3f61eee118ca99c",
"assets/assets/images/dc.png": "ad6c4d9f9516f567342b9d35bd21b154",
"assets/assets/images/discount.png": "566d459940ce57d147530bafde497e9d",
"assets/assets/images/download.jpg": "f464aaea5b51f3f2d11a2687f2bf1ebd",
"assets/assets/images/download.png": "99335596ccedc8fd8ee149a20b999e6b",
"assets/assets/images/Estimate.png": "bbc40cee6f57aa23c6f6be42e1291cfc",
"assets/assets/images/ethernet.png": "843b5ce2e3bc771f37f9af8ad4aa642b",
"assets/assets/images/excel.png": "2eb22139bba928246dbd823dbcd082c5",
"assets/assets/images/exclamation.png": "fc0c73fb9df30a438183c848a2854687",
"assets/assets/images/geo.jpg": "bbf844a47b67edb96f28f6e423d75cc2",
"assets/assets/images/geo2.jpg": "0cdb594441235b17bdf6c032afc1633f",
"assets/assets/images/geobackground.jpeg": "650a1322ada47a6e0fba174e30d42b62",
"assets/assets/images/giphy.webp": "06372bc814b1ce361bdfacb25a9cbccb",
"assets/assets/images/gmail.png": "2c1a7560c88ea83e6b2593cd07af8ad8",
"assets/assets/images/hide.png": "43e096dd01c54489424b56c1af708ae4",
"assets/assets/images/human.jpg": "90fd2c3cecf07b33fffd6aceca397556",
"assets/assets/images/IAMbg.jpg": "fe3719e31a5758cea348271ac549abc2",
"assets/assets/images/image.png": "09fd7fd75777b8f1c21b38d004248459",
"assets/assets/images/img.png": "3e3fe1a7f210899839f9e306e8ee2c45",
"assets/assets/images/info.png": "e17864004616feec0bb517d2238d2633",
"assets/assets/images/invoice.png": "3f19dbdd1a596afcb198ce5542401855",
"assets/assets/images/invoice1.png": "1d8a44d9c2e2fa47c9415f48cee976a4",
"assets/assets/images/ledger.png": "5a31b99ce372d51585da31aae436dc2d",
"assets/assets/images/link.png": "615ed327d5c75773a6026ee21bb634e6",
"assets/assets/images/logo.svg": "0de9dd933e291ad552be5644f0946c3c",
"assets/assets/images/mainlist.png": "6e9c47701f3ba5a6fe69fab19d1c834d",
"assets/assets/images/noimage.jpg": "bbd1db5fa019f862743d5fb77ebb1d3d",
"assets/assets/images/options.png": "e4f4e5fbc07dea1ba2b18e7c66425b1c",
"assets/assets/images/order.png": "c6cf7d4ac941ac3665fcbdab4f068558",
"assets/assets/images/pdfdownload.png": "bcb9a2cd74a7e6ab47ea2b741c46c98b",
"assets/assets/images/pending.png": "9b47342836a081a1f4280b313657a924",
"assets/assets/images/popup.png": "c1d64eb2ae58b812c47f5b33fa1c93ca",
"assets/assets/images/popup1.png": "7e45296c05bd3b92ff2040107017675e",
"assets/assets/images/printer.png": "d0ccb085d90fd7a4fca62002b03aaea3",
"assets/assets/images/rane_group.jpg": "b1aa76b8896b4096a6ffe1914b86454b",
"assets/assets/images/reject.png": "b299ab96076949c9e38d9565561c53fb",
"assets/assets/images/reload.png": "2a7605b9bbf37b0608e52718d68b9f2b",
"assets/assets/images/request.png": "5c25a381a1d7b2358a9ac829ba2bef82",
"assets/assets/images/revision.png": "45991c1fd4beb041c7ba44c5cd7c97ff",
"assets/assets/images/rfq.png": "1f479d68dff71b4470885d26b117bbd4",
"assets/assets/images/secureshutter.jpeg": "492e3a546462b8f0d25c1a6bcafded12",
"assets/assets/images/settings.png": "5316e5b36cf41a1cb67b31e236d52903",
"assets/assets/images/share.png": "f4fd23d8cb88ca6269c1361b75a9663a",
"assets/assets/images/sporada.jpeg": "cb50e9c0ebecd9e79f3c526c14a75621",
"assets/assets/images/sporadaResized.jpeg": "e0b534204ce1006aee752ef78341bcaf",
"assets/assets/images/subscription.png": "f4eb304371265078f5edd03c66d483b6",
"assets/assets/images/tik.gif": "6a33c17e91256e429779c24f49c388ae",
"assets/assets/images/transaction.png": "50df718343149ea33d9ba22818afcac3",
"assets/assets/images/unhide.png": "dbceb6702355d81f2d82c8a76763c29d",
"assets/assets/images/vendor.png": "aa17d761bb1465280d9ec3fff140d802",
"assets/assets/images/verified.png": "be0f3ffb45fbf378e4fbe95c47c4b710",
"assets/assets/images/viewarchivelist.png": "816c05f1223732ec16558867b3603ece",
"assets/assets/images/voucher.png": "40da691e87e8bfa89abe1b45d2caab58",
"assets/assets/images/whatsapp.png": "1aa80beced508dbc8357acd5c5a85b08",
"assets/assets/images/white.jpg": "0f51cba74404f3a96a497342bc123144",
"assets/assets/images/whitefull.png": "21cbc8ae5ffad598856254655f0b65ef",
"assets/assets/images/whiteleaf.svg": "73bd67297cebbf56daaefd9a88de4b9f",
"assets/assets/images/word.png": "8c258e2c41a05c49711e7b1f70db987c",
"assets/assets/key.config": "cdd4622b8597ec4dc17bd1082df47afe",
"assets/assets/pdf/invoice.pdf": "1aef3ce01ebe9b41253c7ad77a7e2039",
"assets/FontManifest.json": "d7a7d728f9674f49bde4f4b5dac38767",
"assets/fonts/MaterialIcons-Regular.otf": "ea4423b3a63a6f7f91e6458ee4914a68",
"assets/NOTICES": "75fed9888ecf6d10acf23c0e5b93c84a",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "825e75415ebd366b740bb49659d7a5c6",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.js.symbols": "27361387bc24144b46a745f1afe92b50",
"canvaskit/canvaskit.wasm": "a37f2b0af4995714de856e21e882325c",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.js.symbols": "f7c5e5502d577306fb6d530b1864ff86",
"canvaskit/chromium/canvaskit.wasm": "c054c2c892172308ca5a0bd1d7a7754b",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "9fe690d47b904d72c7d020bd303adf16",
"canvaskit/skwasm.wasm": "1c93738510f202d9ff44d36a4760126b",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"flutter_bootstrap.js": "9cc7b44c75f677143612fe08ea8ae15a",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "93a8d840f3cc4c7e7d2db080638d7151",
"/": "93a8d840f3cc4c7e7d2db080638d7151",
"leaf.png": "1cf3cc3e732dca6941115b081f5bd8e6",
"main.dart.js": "0f4d990e99088d00959b41e607151fe4",
"manifest.json": "429b00b7ef7b4af172873798012cfe8f",
"version.json": "8cdd386f00ad6a038c9ffac165dbf2fe"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
