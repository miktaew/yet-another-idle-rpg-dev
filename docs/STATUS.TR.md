<!-- doc-source: docs/STATUS.md  doc-version: 38 -->

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
yükler. Yayına giden yol o değil ve yayına gidenden daha katı: tarayıcının kendi modül
yükleyicisi, paketleyicinin göz yumduğu bir içe aktarmayı reddediyor - `crafting.js`
içindeki hayalet `update` içe aktarması böyle bulundu. Tam da bu yüzden bir refaktörden
sonra açmaya değer.

### Geçit

Commit öncesi dördünün de geçmesi gerekir:

```
npm run build          # esbuild -> dist/bundle.js, ardından _site/ derlenir
LOCALE_STRICT=1 npm run check
npm test
npm run check:bundle
```

- `check`, `tests/checks/` altındaki içerik ve tutarlılık kontrollerini çalıştırır
  (on altı dosya, yardımcılarıyla ~7.000 satır). `LOCALE_STRICT=1`, eksik çeviride
  uyarmak yerine hata verir.
- `test`, `tests/skills.mjs` içindeki yetenek ve ilerleyiş takımıdır: 207 kontrol.
- `check:bundle`, derlenmiş paketi tarayıcı taklit edilerek Node içinde çalıştırır.
  `dist/bundle.js`, `src/`'den eskiyse çalışmayı reddeder — çünkü bir keresinde
  başarısız bir derlemeden kalan bayat paketi sınayıp geçmişti.
- `npm run check:save "<dışa aktarılmış kayıt>.txt"` ayrıdır ve bir kayıt dosyası alır:
  o kayıttaki her kimliğin kayıtlarda hâlâ karşılığı var mı diye bakar. İçerik adı
  değiştiren her işten sonra gerçek bir dışa aktarmayla çalıştırmaya değer.

---

## Kod nerede

`src/`, 53 modülde 45.785 satır (`find src -name "*.js" | xargs wc -l`).

| Dosya | Satır | İçeriği |
| --- | ---: | --- |
| `display.js` | 3.815 | Bütün DOM güncellemeleri. Altı kesmede 7.057'den indi. |
| `data/skills.js` | 5.756 | 65 yetenek, kilometre taşları ve rütbe adları. |
| `items.js` | 5.231 | Eşya şablonları ve üretilen eşya düzeneği. |
| `main.js` | 4.501 | Giriş noktası: oyun döngüsü, aksiyonlar, dövüş, ödüller, seçenekler. |
| `data/locations.js` | 4.684 | 69 yer, aksiyonları ve bağlantıları. |
| `data/dialogues.js` | 3.073 | 20 diyalog ve replikleri. |
| `crafting_recipes.js` | 1.989 | 142 tarif. |
| `item_tooltips.js` | 706 | Eşya, etki ve tarif ipuçları. v0.6.62'de ayrıldı. |
| `crafting_display.js` | 624 | Zanaat penceresi. v0.6.63'te ayrıldı. |
| `journal_panels.js` | 696 | Bestiary, kitap listesi, lore ve Keşifler. v0.6.65'te ayrıldı. |
| `skills_display.js` | 660 | Yetenek çubukları ve duruş listesi. v0.6.67'de ayrıldı. |
| `inventory_display.js` | 963 | Üç envanter ve ticaret penceresi. v0.6.68'de ayrıldı. |
| `save_load.js` | 1.951 | Kaydetme ve yükleme. v0.6.54'te `main.js`'ten ayrıldı. |

`main.js` giriş noktasıdır ve bu bölme turundan önce 6.606 satırdı. Ondan çıkanlar:
`save_load.js`, `run_stats.js`, `game_state.js`, `ui_helpers.js`, `crafting.js`,
`world_index.js`. Her kesme iki sayı ölçülerek seçildi — taşınan kodun kalanlardan kaç
ada ihtiyacı var ve kalan kodun geri kaç ada ihtiyacı var — çünkü döngüyü yaratan
ikincisidir. 48. madde altıncı kesmeyle kapandı; neyi ölçtüğü —
nerede durmaya karar verdiği dâhil — [CHANGELOG.TR.md](CHANGELOG.TR.md) dosyasındadır.

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
`new name(`, `${name}` ve `name.property` biçimlerini okur; geriye bakışı da yayılma
operatörüne izin verir.

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

- Kayıt defterinde **69 yer**: başlangıç köyü ile inşa edilmiş dört bölgeye yayılmış
  33 sıradan konum, 27 dövüş bölgesi ve 9 meydan okuma bölgesi. 9 konum türü üzerinden
  56 tür beyanı.
- Bu yerlere dağılmış **45 aksiyon** ve **46 etkinlik**.
- **70 adım** taşıyan **19 görev**; adımların 11'i gizli ve 6 göreve dağılmış, her gizli
  adımın bir ilerleticisi var.
- **65 yetenek**, 59'unda birden fazla rütbe adı, ayrıca kilometre taşları.
- **32 yaratık**.
- 7 dalda **142 tarif** ve üç plaka malzemesi; tarif eşya adlarının tamamı **453 eşya
  şablonuna** karşı çözülüyor.
- **20 diyalog** ve **8 tüccar**.

Yerelleştirme: **3.302 yerel anahtar, Türkçe %100, eksik yok** ve 3.302 satırın tamamına
oyun içinden erişilebiliyor. Türkçe öncelikli dildir ve çeviri değil, Türkçe yazılmış
gibi okunmalıdır — kurallar [I18N.md](I18N.md) içinde, direktif numarası D-7.

---

## Kontroller neyi kapsıyor

`tests/checks/` altında on altı dosya. Değerli olanlar genel biçim kuralları değil,
yayımlanmış bir hatayı kodlayanlar:

| Kontrol | Neyi engelliyor |
| --- | --- |
| `modules import what they call` | İçe aktarılmadan kullanılan ad. 47 dosya. |
| `imports resolve` | Dışa aktarmayan bir modülden içe aktarılan ad. 677 ad. |
| `save keys round-trip` | Adı değişen kayıt anahtarının oyuncu verisini sessizce düşürmesi. |
| `onclick names reachable` | Hiçbir şeye işaret etmeyen işaretleme işleyicisi. 83 ad. |
| `content text ids` | Yerel satırı olmayan oyuncuya görünür metin. 2.043 kimlik. |
| `action button labels` | Düğmenin içine çizilen paragraf. 45 aksiyon, 80 karakter sınırı. |
| `effect tags` | Buff diye etiketlenmiş zehir; dev konsolu onu oyuncuya verirdi. |
| `documentation` | Geride kalmış çeviri ya da hiçbir yeri göstermeyen bağlantı. 18 dosya. |
| `no raw control bytes` | Bayt olarak yazılmış NUL; grep'in dosyayı ikili saymasına yol açar. |
| `no English written into the DOM` | Yereli atlayıp doğrudan yazılmış metin. 212 sabit. |
| `hidden quest tasks` | İlerleyemeyen görev. 11 adım. |
| `visible quest tasks` | Günlükte adı yazan ama bitirilme yolu olmayan adım. 65 adım. |
| `actions can explain failure` | Sebebini söylemeden başarısız olan aksiyon. 70 aksiyon. |
| `content object keys` | Verisinin altından çekilip adı değiştirilen kurucu alanı. 345 nesne. |
| `generated components can be made` | Bir malzemenin genişletilmiş `types` listesinin, hiçbir şeyin üretemediği eşyalar doğurması. 203 üretilmiş, 8'i yapılamaz. |
| `quest hints` | Listesini boşaltıp sonra hiçbir şey söylemeyen bir ipucu kurucusu. |
| `markdown rules` | Paragrafın hemen altına yazılmış `---`; o paragrafı başlığa çeviriyor. 62 çizgi. |
| `seasonal content` | `getSeason()`'ın hiç döndürmediği bir mevsim adı; yani hiç gerçekleşmeyen içerik. 54 dosyada 25 ad. |
| `trader stock` | Var olmayan bir stok listesi ya da türetilmek yerine tüccara saklanmış bir raf. 9 ad, 8 liste. |
| `lore threads` | Altında hiçbir şey olmayan bir başlık olarak çizilen iplik. 1 iplik, 6 satır. |
| `books` | Hiçbir şeyin satmadığı/düşürmediği/vermediği bir kitap ya da okuma verisi olmayan bir kitap eşyası. 12 kitap. |
| `droprate tags` | Hiçbir düşmanın taşımadığı ya da düşmanları hiçbir şey düşürmeyen bir etikete yöneltilmiş düşme oranı yeteneği. 2 çift. |
| `locked skills` | Kilitli başlayan ve hiçbir ödülün açmadığı bir yetenek. 3 kilitli. |
| `tier ladder` | İstasyon cezasının ulaşmaya değmez hâle getirdiği bir bileşen kademesi. 30 kademe/beceri noktası. |
| `display conditions` | Dizi olarak yazılmış bir display_conditions; her yapıcı onu sarmalayıp hep karşılanan bir koşula çeviriyor. 21 yazım. |
| `moon phases` | getMoonPhaseName'in hiç döndürmediği bir ay evresi adı; kapıladığı pencere hiç açılmıyor. 4 evre. |
| `items can be got` | Hiçbir tarifin, tüccarın, düşüşün, ödülün ya da toplama etkinliğinin veremediği elle yazılmış eşya. 192 eşya, 1 mazeretli. |
| `item display names` | Ad satırları aynı dizgeye çözülen iki eşya; oyuncu onları ayırt edemiyor. 508 ad. |
| `help explains standing` | Yardım sayfasının itibar anlatımının hiç anmadığı bir reputation bölgesi. 4 bölge. |
| `dev console` | Dev konsolunun oturum anahtarına sessionStorage dışında dokunulması ya da kaydın onu anması. |
| `trader market regions` | Doygunluk sayacı olmayan bir dükkân ve hiçbir yerin listelemediği bir tüccar. 6 dükkân, 8 tüccar. |
| `crafting quality` | İçine ne girdiğinin söylenmesine imkân tanımayan bir kalite atışı ve kendi şablonunun anahtarıyla eklenen üretilmiş bir eşya. 2 bildirim, 6 çağrı yeri. |
| `inherited quality is shown` | Bir tarifin devrettiği ama hiçbir tooltip'in çizmediği bir kalite ve nadirliğine cevap veremeyen bir eşya sınıfı. 4 tarif. |
| `reputation regions` | Adı olmayan bir bölge ya da bölge olmayan bir bölge anahtarı. 4 bölge, 58 kullanım. |
| `dead ends` | Questi kilitleyen başarısızlık: kazanma dalının dışındaki kilit ya da kaybedilen denemede yenen eşya. 18 aksiyon. |
| `stance reactions` | Stance olmayan bir stance kimliğine tepki veren yaratık; hiç tetiklenmez. 10 kimlik, 7 stance. |

D-8 direktifi: bir düzeltme, o olmadan bir kontrol başarısız olana kadar bitmiş
sayılmaz; koruma da hata geri konularak sınanır.

---

## Devam eden işler

Çalışma listesi olan ve her direktifin işe girişmeden önce kaydedildiği
[PROPOSALS.md](PROPOSALS.md) dosyasından:

- **P-14, v0.7 ve Marrowmoth** — `active`. Sıradaki arc; onu isteyen briefe karşı
  değil koda karşı planlandı, her biri tek başına yayınlanabilir sekiz faz hâlinde.
  Zemin fazı olan Faz 0 yeşil: dört tasarım kararı — Q-7 ile Q-10 — cevaplandı ve
  Bekleyen kararlar'dan çıkıp önerinin kendi içine, her biri onu harcayan fazın
  karşısına taşındı. *No Word Sent* olan Faz 1, v0.7.0 olarak yayınlandı: Marrowmoth
  İlkbahar ve Sonbaharda limanda ve tuz evinin rafı, rıhtımın fon replikleri ile lonca
  kâtibinin söylentisi hep o tek pencereyi okuyor. *Forty Tons* olan Faz 2 de aynı
  şekilde v0.7.1 olarak yayınlandı: boşaltma ile manifesto, mevcut körfez üzerinde iki
  aksiyon; 1. quest kimsenin elinden değil işten açılıyor; arc'ın ilk lore ipliği de
  iki konuşan arasında uzanıyor. *A Stroke Through It* olan Faz 3 de aynı şekilde
  v0.7.2 olarak yayınlandı: üç itibar ekseni üzerinde üç soruşturma yolu — `Guild` 50,
  `Slums` 200, `Town` 150 — her biri farklı bir parça veriyor ve 2. quest herhangi
  birinden bitiyor. *Out on the Ebb* olan Faz 4 de aynı şekilde bölündü: çıkmaz muhafızı
  olan 4a girdi — planın tahmin ettiği kuralın değil, questi gerçekten kilitleyen şeyin
  etrafına yazılmış hâliyle — ve 4b de v0.7.3 olarak yayınlandı: gelgit düzlükleri ile
  alt ambar, çamurun üstünde Equilibrium, para ya da `Slums` 250 ile üç yol. Faz 5,
  v0.7.4 olarak yayınlandı: sandık, onu geri koyabilmek üzerine açılıyor; içinde
  koleksiyoncunun bir kez tarif ettiği karelerle oyulmuş, adı olmayan bir metalden tek
  bir halka var ve bilerek hiçbir eşya ödemiyor. Sistem geçişi olan Faz 6 başladı: dört
  parçasının hepsi yayınlandı: v0.7.5, 5. kademeyi düzlüklere bağladı ve yapılamayan 36
  bileşeni sıfıra indirdi; v0.7.6 dört yaratığı, zaten var olan kancalar üzerinden
  kahramanın duruşuna tepki verir hâle getirdi; v0.7.10 ekonomiyi ölçtükten sonra arc'ın
  para kuyusunu yeniden fiyatladı; v0.7.11 ise arc'a, bir yerin fikri olması gibi okunan
  bir itibar sonucu kazandırdı — artı itibara bir taban, ki ondan bir şey eksiltilene
  kadar buna kimsenin ihtiyacı olmamıştı. **P-14'ten kalan, v0.8 hazırlığı olan Faz 7.**
- **P-12, çelikten üstteki madenler** — `kısmen bitti`. 4. ve 5. kademe ikisi de
  yayında ve 36 beyaz/siyah çelik bileşeni, gelgit düzlüklerinde kazılan bir cevherden
  üretilebiliyor. Tek bir soru kaldı: `roll_quality`,
  `station_tier - component_tier` okuyor; yani dağdaki bacada dövülen 5. kademe iki
  kademelik cezayla atılıyor ve oyunda daha iyi bir ateş yok.
**İpucu göstermeyen iki görev adımı bu listeden ölçülerek çıktı.** Yeniden
üretilemiyor. Sahibin iki dışa aktarımında da her aktif görevin güncel adımı tam
olarak bir adlandırılmış yere çözülüyor; üstelik görünür hiçbir adım, geri dönüşü
olmayan ipucu yoluna ulaşamıyor: yaşayan beş `task_condition` bloğunun hepsi gizli
görevlere ait ve gizli görev günlüğe hiç çıkmıyor, `Test quest` ise yorum satırında.
İddia, "başka bir yerde" satırı eklenmeden önce doğruydu ve o gün bugündür bayat.

Altında gerçek olan şey şuydu: iki ipucu kurucusundan yalnızca birinin bu geri
dönüşü vardı. Sayan bir adımın andığı bölgelerin hepsi henüz bulunmamışken
`create_quest_hint` hiçbir şey döndürmüyordu; yani bir kill sayan ilk görünür görev,
altında tek satır olmayan bir 0/10 gösterecekti. Artık iki kurucu tek bir geri
dönüşü paylaşıyor ve biri onu kullanmayı bırakırsa
`check_hints_say_when_they_cannot_point` düşüyor.

48. madde ile P-13/35 kapandıktan sonra da burada listeleniyordu; bu da okuyucuyu
çalışma listesinde olmayan önerileri aramaya gönderiyordu. İkisi de
[CHANGELOG.TR.md](CHANGELOG.TR.md) içinde yazılı; biten madde oraya aittir, başka
hiçbir yere değil.

---

## Yeni gelen biri için okuma sırası

1. [AGENTS.md](AGENTS.md) — çalışma anlaşması ve kanonik talimat dosyası.
2. [PROPOSALS.md](PROPOSALS.md) — önce duran direktifler (D-1 ile D-9), sonra liste.
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
