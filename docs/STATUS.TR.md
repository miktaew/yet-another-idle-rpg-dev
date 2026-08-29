<!-- doc-source: docs/STATUS.md  doc-version: 2 -->

> **Kanonik dosya: [STATUS.md](STATUS.md).** Bu çeviri bilgilendirme amaçlıdır.
> Çelişki hâlinde İngilizce dosya geçerlidir.

# Projenin durumu

Projenin bugün nerede olduğu. Eline yalnızca bu dosya verilen bir ajanın işe
başlayabilmesi için yazıldı. Buradaki her sayı hatırlanarak değil ölçülerek yazıldı;
zamanla kaydıklarında yeniden ölçülebilsin diye her birinin komutu da veriliyor.

---

## Bu proje nedir

[miktaew/yet-another-idle-rpg](https://github.com/miktaew/yet-another-idle-rpg-dev)
projesinin çatallanmış hâli. Tamamen tarayıcıda çalışan bir artımlı/boşta RPG. Sunucu
yok, hesap yok: kayıt, `localStorage` içinde duran ve oyuncunun base64 metin olarak
dışa aktarabildiği bir JSON.

Çatalın politikası: **içerikte ayrış, kodda birleş.** Hikâye, bölgeler, görevler ve
Türkçe yerelleştirme bize ait; yukarı akışa geri gitmeleri amaçlanmıyor. Hata
düzeltmeleri ve genel motor iyileştirmeleri ise yukarı akışa sunuluyor — proje yaşıyor:
`contribute/upstream-fixes` ve `contribute/upstream-features` dallarından iki çekme
isteği açık. Bu dallar yalnızca bunun için tutuluyor; geri kalan her şey doğrudan
`master`'a gidiyor (bkz. [PROPOSALS.md](PROPOSALS.md) içindeki D-6).

Dağıtım, `.github/workflows/deploy-pages.yml` ile `master`'dan GitHub Pages'e yapılıyor.
Güncel sürüm `src/game_version.js` içinde, `package.json` de onu yansıtıyor; ikisi
birlikte yükseltiliyor ve her seferinde iki değişiklik günlüğü sayfasına da giriş
ekleniyor.

---

## Çalıştırmak

```
npm install
npm run serve:site     # _site/ dizinine derler, 127.0.0.1:8081 üzerinden sunar
```

`npm run serve` (8080) depo kökünü sunar; bu yol paketi değil ham ES modüllerini
yükler. Yayına giden yol **o değildir** ve şu anda bozuktur; `serve:site` kullanın.

### Geçit

Commit öncesi dördünün de geçmesi gerekir:

```
npm run build          # esbuild -> dist/bundle.js, ardından _site/ derlenir
LOCALE_STRICT=1 npm run check
npm test
npm run check:bundle
```

- `check`, `tests/checks/` altındaki içerik ve tutarlılık kontrollerini çalıştırır
  (on iki dosya, yardımcılarıyla ~5.700 satır). `LOCALE_STRICT=1`, eksik çeviride
  uyarmak yerine hata verir.
- `test`, `tests/skills.mjs` içindeki yetenek ve ilerleyiş takımıdır: 136 kontrol.
- `check:bundle`, derlenmiş paketi tarayıcı taklit edilerek Node içinde çalıştırır.
  `dist/bundle.js`, `src/`'den eskiyse çalışmayı reddeder — çünkü bir keresinde
  başarısız bir derlemeden kalan bayat paketi sınayıp geçmişti.
- `npm run check:save "<dışa aktarılmış kayıt>.txt"` ayrıdır ve bir kayıt dosyası alır:
  o kayıttaki her kimliğin kayıtlarda hâlâ karşılığı var mı diye bakar. İçerik adı
  değiştiren her işten sonra gerçek bir dışa aktarmayla çalıştırmaya değer.

---

## Kod nerede

`src/`, 47 modülde 44.770 satır (`find src -name "*.js" | xargs wc -l`).

| Dosya | Satır | İçeriği |
| --- | ---: | --- |
| `display.js` | 7.057 | Bütün DOM güncellemeleri. En büyük dosya ve sıradaki hedef. |
| `data/skills.js` | 5.702 | 64 yetenek, kilometre taşları ve rütbe adları. |
| `items.js` | 5.231 | Eşya şablonları ve üretilen eşya düzeneği. |
| `main.js` | 4.501 | Giriş noktası: oyun döngüsü, aksiyonlar, dövüş, ödüller, seçenekler. |
| `data/locations.js` | 4.403 | 158 konum, aksiyonları ve bağlantıları. |
| `data/dialogues.js` | 3.073 | 22 diyalog ve replikleri. |
| `crafting_recipes.js` | 1.989 | 139 tarif. |
| `save_load.js` | 1.951 | Kaydetme ve yükleme. v0.6.54'te `main.js`'ten ayrıldı. |

`main.js` giriş noktasıdır ve bu bölme turundan önce 6.606 satırdı. Ondan çıkanlar:
`save_load.js`, `run_stats.js`, `game_state.js`, `ui_helpers.js`, `crafting.js`,
`world_index.js`. Her kesme iki sayı ölçülerek seçildi — taşınan kodun kalanlardan kaç
ada ihtiyacı var ve kalan kodun geri kaç ada ihtiyacı var — çünkü döngüyü yaratan
ikincisidir. Ölçülmüş ama henüz yapılmamış kesmeler ve maliyetleri
[PROPOSALS.md](PROPOSALS.md) 48. maddededir.

---

## Her biri bir sürümü bozmuş beş kısıt

Bunlar üslup tercihi değil; her biri bir hata yayımlattı.

**1. Döngüsel içe aktarmalar yük taşır.** Modül çizgesinde döngüler bilerek vardır ve
tarayıcının değerlendirme sırası sayesinde çalışırlar. `main.js` giriş noktasıdır ve
içe aktarma listesi o sıranın *kendisidir*. **Yeni bir içe aktarma o listenin sonuna
gider.** `crafting.js`'i başa koymak `character.js`'i `items.js`'ten önce çekti ve beş
kontrolü bozdu; paket her iki hâlde de sorunsuzdu — tehlikeli olan da bu.
`tests/lib/browser-free-src.mjs` tarayıcının sırasını üretmek için bu listeyi tekrarlar.

**2. esbuild, çözülmemiş bir tanımlayıcıyı çalışma zamanı genel değişkeni sayar.**
Kullanılan ama içe aktarılmayan bir ad tertemiz derlenir, tarayıcıda `ReferenceError`
fırlatır. Bu iki kez yayımlandı — önce `restore_message_log`, sonra `effect_templates` —
ve ikincisi `load()` içinde kendi satırından sonraki her şeyi öldürdü: kayıtlar görevsiz
ve favorisiz geldi. `check_modules_import_what_they_call` bunu korur; `name(`, `name[`
ve `new name(` biçimlerini okur, geriye bakışı da yayılma operatörüne izin verir.

**3. İçe aktarılan bir bağ salt okunurdur.** Başka bir modülün yazdığı durum, bir
nesnenin içinde yaşamak zorundadır. `run_stats.js` ve `game_state.js` bunun içindir;
çıplak bir `let`'e atama yalnızca çalışma zamanında patlar.

**4. Kayıt anahtarı bir sözleşmedir.** Kayıt anahtarları ve kayıt defteri anahtarları
oyuncu verisidir; asla yeniden adlandırılmaz, asla çevrilmez. `game_state.js` ayrımı
sırasındaki bir yeniden adlandırma, tırnak içindeki iki kayıt anahtarının içine kadar
uzandı: kayıt, yükleyicinin okumadığı adlarla yazdı, değer boş döndü ve bir sonraki
kayıt anahtarları dosyadan büsbütün düşürdü. Hiçbir şey yüksek sesle bozulmadı.
`check_save_keys_round_trip` artık yazılan her anahtarın okunmasını şart koşuyor:
53 yazılıyor, 53 okunuyor.

**5. `onclick` tıklama anında çözülen bir metindir.** `display.js` işleyicileri işaretleme
olarak kurar; dolayısıyla `window.` ataması düşen bir fonksiyon yalnızca oyuncu
tıkladığında patlar — derlemede değil, kontrollerde değil, paket sınamasında değil.
`check_onclick_names_are_reachable` 83 adı kapsıyor.

Bilmeye değer iki küçük kısıt daha. Türkçe yerel ayarlı küçültme büyük I'yı noktasız
ı'ya çevirir, zaten küçük olan `iron` ise yerinde kalır; bu yüzden arama, yerel ayarla
küçültmek yerine iki tarafı da düz harflere indirmek zorundadır. Bir de `changeTab`,
`display` değerini satır içi yazar; satır içi tanım stil sayfasını yendiği için esnek
bir panelin açıkça `"flex"` olarak istenmesi gerekir.

---

## Oyunda şu an ne var

Kayıt defterlerinden ve kontrollerden ölçüldü:

- Başlangıç köyü ve inşa edilmiş dört bölgede **158 konum**; 9 konum türü üzerinden 56
  tür beyanı ve 4 bölgede 4 tüccar dükkânı.
- **21 görev**; 11'inde gizli görev adımı var ve her gizli adımın bir ilerleticisi var.
- **64 yetenek**, 58'inde rütbe adı, ayrıca kilometre taşları.
- 36 dövüş bölgesine yayılmış **32 yaratık**.
- **139 tarif**; 450 şablona karşı 549 tarif eşya adı çözülüyor.
- **22 diyalog**, 7 stok listesinde 8 tüccar, 56 aksiyon.
- Tamamı çözülen **1.983 içerik metin kimliği**.

Yerelleştirme: **3.234 yerel anahtar, Türkçe %100, eksik yok** ve 3.234 satırın tamamına
oyun içinden erişilebiliyor. Türkçe öncelikli dildir ve çeviri değil, Türkçe yazılmış
gibi okunmalıdır — kurallar [I18N.md](I18N.md) içinde, direktif numarası D-7.

---

## Kontroller neyi kapsıyor

`tests/checks/` altında on iki dosya. Değerli olanlar genel biçim kuralları değil,
yayımlanmış bir hatayı kodlayanlar:

| Kontrol | Neyi engelliyor |
| --- | --- |
| `modules import what they call` | İçe aktarılmadan kullanılan ad. 47 dosya. |
| `save keys round-trip` | Adı değişen kayıt anahtarının oyuncu verisini sessizce düşürmesi. |
| `onclick names reachable` | Hiçbir şeye işaret etmeyen işaretleme işleyicisi. 83 ad. |
| `content text ids` | Yerel satırı olmayan oyuncuya görünür metin. 1.983 kimlik. |
| `action button labels` | Düğmenin içine çizilen paragraf. 41 aksiyon, 80 karakter sınırı. |
| `effect tags` | Buff diye etiketlenmiş zehir; dev konsolu onu oyuncuya verirdi. |
| `documentation pairs` | Türkçe eşi geride kalmış İngilizce belge. |
| `no English written into the DOM` | Yereli atlayıp doğrudan yazılmış metin. 212 sabit. |
| `hidden quest tasks` | İlerleyemeyen görev. 11 adım. |
| `actions can explain failure` | Sebebini söylemeden başarısız olan aksiyon. 56 aksiyon. |
| `content object keys` | Verisinin altından çekilip adı değiştirilen kurucu alanı. 345 nesne. |

D-8 direktifi: bir düzeltme, o olmadan bir kontrol başarısız olana kadar bitmiş
sayılmaz; koruma da hata geri konularak sınanır.

---

## Devam eden işler

Çalışma listesi olan ve her direktifin işe girişmeden önce kaydedildiği
[PROPOSALS.md](PROPOSALS.md) dosyasından:

- **48. madde, büyük dosyaların bölünmesi** — `devam ediyor`. 7.057 satırla `display.js`
  sırada; ölçülmüş adaylar ve bağlaşım maliyetleri orada listeli. `main.js` tarafında
  ölçülüp henüz yapılmayanlar: `options.js`, `release.js`, ödüller.
- **12. madde, çelikten üstteki madenler** — `kısmen bitti`. 4. ve 5. kademe malzemeler
  var ama ilerleyişe tam bağlanmadı.
- **P-13/35, Aşağıdaki Yankılar** — unvan sisteminin ötesinde hikâye ve oynanış.
- İki görev adımı günlükte ipucu göstermiyor; kaynağı okuyarak değil, oyun çalışırken
  ölçerek çözülmesi gerekiyor.

---

## Yeni gelen biri için okuma sırası

1. [AGENTS.md](AGENTS.md) — çalışma anlaşması ve kanonik talimat dosyası.
2. [PROPOSALS.md](PROPOSALS.md) — önce duran direktifler (D-1 ile D-8), sonra liste.
3. Bu dosya — ölçülmüş durum.
4. [I18N.md](I18N.md) — yerelleştirme kuralları ve sözlük.
5. [STORY.md](STORY.md) — sürdürülen, asla yeniden yazılmayan kanon.
6. [DEV_CONSOLE.md](DEV_CONSOLE.md) — `enable_dev_console()` ve verdikleri.
7. [CHANGELOG.md](CHANGELOG.md) — sürüm sürüm neyin neden değiştiği.

Yukarıdakilerin hepsinden önemli tek alışkanlık: oyun sırasında bir belirti
bildirildiğinde, kaynaktan akıl yürütmek yerine **çalışan oyunda ölçün**.
`null.innerText` çökmesi paketin kaynak haritası çözülerek bulundu; kaybolan kayıt
alanları, sahibinin günler arayla aldığı iki dışa aktarma karşılaştırılarak bulundu.
İkisi de kodu okuyarak görünmüyordu.
