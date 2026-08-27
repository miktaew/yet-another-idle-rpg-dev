<!-- doc-source: docs/PROPOSALS.md  doc-version: 28 -->

> **Kanonik dosya: [PROPOSALS.md](PROPOSALS.md).** Bu çeviri bilgilendirme
> amaçlıdır. Çelişki hâlinde İngilizce dosya geçerlidir.

# Öneriler ve İş Listesi

Bu fork'un çalışma listesi. Proje sahibinden gelen her direktif burada
numaralanmış bir öneri olarak kayda geçer, tamamlanana kadar izlenir ve ardından
neyin gerçekten değiştiği açıklanarak [CHANGELOG.TR.md](CHANGELOG.TR.md)
dosyasına aktarılır.

**Durum etiketleri**

| Durum | Anlamı |
| --- | --- |
| `done` | Tamamlandı ve doğrulandı. `CHANGELOG.md` içinde açıklandı. |
| `active` | Şu anda üzerinde çalışılıyor. |
| `open` | Kabul edildi, başlanmadı. |
| `blocked` | [Bekleyen kararlar](#bekleyen-kararlar) bölümündeki bir karar verilmeden başlanamaz. |

---

## Kalıcı direktifler

Bunlar tek seferlik görevler değil; bundan sonraki her değişikliği bağlar. Proje
sahibinden gelirler ve varsayılan davranışları geçersiz kılarlar.

### D-1 — Rol

Kıdemli bir oyun anlatı tasarımcısı (narrative designer), görev tasarımcısı
(quest designer) ve JavaScript geliştiricisi olarak çalışılacak.

### D-2 — Hikâyeyi yeniden yazma, devam ettir

Görev; mevcut hikâyeyi bittiği noktadan organik biçimde devam ettirmek, bilinçli
olarak açık bırakılmış bağları geliştirmek ve repoda hâlihazırda var olup oyun
içinde erişilemeyen içerikleri hikâyeye dahil etmektir.

Kanon kabul edilen ve dolayısıyla değiştirilmeyecek olanlar: mevcut karakterler,
dünya, lore, quest geçmişi, NPC ilişkileri, item açıklamaları, dialogue hook'ları
ve yarım kalmış bölgeler. Yeni içerik, aynı evrenin doğal devamı gibi okunmalıdır.

### D-3 — Her zaman iki dilli

Her doküman dosyası çift olarak yayınlanır: `NAME.md` ve `NAME.TR.md`. İngilizce
dosya kanoniktir. Kod yorumları İngilizce yazılır. Proje sahibiyle iletişim
Türkçedir.

### D-4 — Agent'lar için tek kanonik talimat dosyası

Agent'lar tek bir kanonik talimat dosyası okur. Diğer dosyalar onun kurallarını
tekrar etmek yerine ona işaret eder; böylece senkronize tutulacak bir şey kalmaz.

### D-5 — Oyuncuya görünen metin asla `src/` içine gömülmez

Tüm anlatı ve arayüz metni, bir string id arkasında `locales/<dil>.js` içinde
durur. Bu, D-3'ün yalnızca dokümanlarda değil oyunun kendisinde de geçerli olması
için ön koşuldur.

### D-7 — Türkçe, Türkçe gibi okunmalı

Türkçe yerelleştirme **en yüksek önceliktir**; hikâye çalışmasının önünde.

Çeviri, Türkçeye dönüştürülmüş gibi değil Türkçe yazılmış gibi okunmalı. Kabul
edilemez: makine çevirisi tadı, calque'ler, kelime kelime çevrilmiş deyimler ya da
çok anlamlı bir kelimenin yanlış anlamı — "spider web" bir ipek ağıdır, bilgisayar
ağı değil.

**Bağlam birimleri** hâlinde çevrilir, asla string string değil: bir string ekranda
üstündeki metnin altında okunur; dolayısıyla soru ile cevabı, bir stat'ın kısa ile
uzun biçimi, bir etiket ile alabileceği değerler birlikte çevrilir ve birbiriyle
uyumlu olmalıdır.

Kurallar, sözlük ve bilinen boşluklar: [I18N.TR.md](I18N.TR.md).

### D-6 — Doğrudan varsayılan branch'e push

Commit ve push doğrudan varsayılan branch'e yapılır (bugün `master`, ileride
`main` hedefleniyor). İstenmedikçe feature branch veya pull request açılmaz.
Pages deploy'u yalnızca varsayılan branch'te tetiklendiği için yan bir branch
deploy'u sessizce atlar.

---

## Öneriler

### P-1 — Kapsamlı proje analizi `done`

Değiştirmeden önce anlamak: mimari, içerik/veri katmanı, i18n hazırlığı, refactor
adayları, fork ayrışması, doküman durumu.

İki çok-agent'lı analizle teslim edildi — teknik denetim (8 alt sistem okuyucusu,
14 çekişmeli doğrulayıcı, 1 sentezleyici) ve anlatı keşfi (hikâye omurgası, açık
bağlar, erişilemeyen içerik, NPC yayları, coğrafya, ilerleme sistemleri).
Bulgular P-4, P-7, P-8 ve P-9'u besliyor.

### P-2 — GitHub Pages deploy workflow'unu düzelt `done`

Örnek bir `deploy-pages.yml` verildi. Gerçek repo yapısına karşı doğrulanıp
düzeltilecekti. Sekiz varsayımından altısı hatalıydı; kalem kalem listesi
`CHANGELOG.TR.md` içinde.

### P-3 — Araç zincirini güncelle `done`

`engines.node` değeri `>=22`'ye yükseltilecek, geride kalan bağımlılıklar ve
action'lar güncel sürümlere çekilecek.

### P-4 — `README.md`'yi yeniden yaz `done`

Mevcut README bu fork'u değil upstream projeyi anlatıyor ve birkaç iddiası artık
yanlış (`package.json` yokken `npm run build`, artık var olmayan bir bağımlılık
için `live-server` önerisi, upstream branch düzeni). Bu repo için yeniden
yazılacak, Türkçe eşiyle birlikte.

### P-5 — Doküman yapısı `done`

`docs/` klasörü şu çiftlerle oluşturulacak:

| Dosya | Amaç |
| --- | --- |
| `docs/AGENTS.md` | Agent'lar ve geliştiriciler için kanonik talimatlar (D-4). |
| `AGENTS.md` (kök) | İşaretçi stub; araçlar kök dosyayı otomatik keşfettiği için. |
| `docs/STORY.md` | Anlatı kanonu: dünya, protagonist, ton, hikâyenin şu an nerede durduğu. |
| `docs/PROPOSALS.md` | Bu dosya. |
| `docs/CHANGELOG.md` | Açıklamalı geliştirme geçmişi. |

İsimlendirme: büyük harf temel ad, büyük harf `.TR` işareti, küçük harf `.md`
uzantısı (`PROPOSALS.TR.md`). Deploy workflow'unun `paths-ignore` filtresi
büyük/küçük harfe duyarlı `**.md` kalıbı kullanıyor; başıboş bir `.MD` bu filtreyi
etkisiz bırakır ve yalnızca doküman değişen push'larda gereksiz bir rebuild
tetikler.

### P-6 — Upstream deployment referanslarını kaldır `done`

Varlıklar, repo bağlantıları ve ziyaretçi sayacı upstream yerine bu repo ve bu
deployment üzerinden çözülmeli.

Atıf bilinçli olarak **kaldırılmıyor**: MIT lisansı özgün telif bildiriminin
korunmasını gerektiriyor ve özgün yazar, fork'ların özgün projeye kredi verip
bağlantı vermesini açıkça istemiş. Varlık ve altyapı referansları taşınıyor;
kredi kalıyor ve dürüst biçimde yeniden etiketleniyor.

### P-7 — Oyuna Türkçe dil desteği `done`

Oyunun kendisine Türkçe seçeneği eklenecek. Çeviri katmanı hâlihazırda var ancak
şu anda yalnızca dialogue'ları ve arayüzün bir kısmını kapsıyor.

Engel kalktı: Q-1, Q-2 ve Q-4 karara bağlandı. Kapsam **tüm içerik katmanı** —
item, skill ve lokasyon görünen adları dahil.

Bu kapsamın tek katı ön koşulu var: **registry anahtarları şu anda görünen adların
kendisidir ve save dosyalarında birebir saklanır.** Dolayısıyla önce bir görünen-ad
dolaylama katmanı gelmeli — her registry girdisi İngilizce anahtarını kalıcı olarak
korur ve gösterilen adı için bir metin id'si kazanır. Anahtar yeniden adlandırmak
hiçbir zaman seçenek değildir. Bu, listedeki en büyük tek iş parçasıdır ve kendi
refactor ön koşulu olarak izlenir.

Hitap kipi bir motor özelliği değil, **NPC bazında yazım kuralıdır** — bkz.
[STORY.TR.md](STORY.TR.md#6-t%C3%BCrk%C3%A7e-hitap-kipi). `src/translation.js`
içindeki arama mantığında değişiklik gerekmez, çünkü her satır zaten ayrı bir
string id'dir.

**Tamamlanan** — dil uçtan uca çalışıyor. `getText` artık çevrilmemiş her id için
varsayılan dile düşüyor; kısmi bir locale'i güvenli kılan şey bu. `turkish` kayıtlı;
`locales/turkish.js` arayüz, stat, skill, ırk ve künye bölümlerini taşıyor; ayarlar
paneline `languages` registry'sinden inşa edilen ve canlı geçiş yapan bir seçici
eklendi. `npm run check` kapsamı raporluyor, `npm test` arama ve fallback davranışını
kapsıyor. Çevirmen el kitabı ve sözlük [I18N.TR.md](I18N.TR.md) içinde.

**Tamamlandı.** Oyunda oyuncuya görünen İngilizce metin kalmadı. Dil başına 2536
anahtar; diyalogları, quest'leri, item'ları, lokasyonları, düşmanları, becerileri,
duruşları, efektleri, etkinlikleri, tarifleri, tüccarları, günlük mesajlarını ve
arayüzü kapsıyor. Oyunun bildirmek yerine ürettiği 203 item, parametreli ad
kalıplarıyla kapsanıyor; `help.html` ve `changelog.html`'in ise düğmelerin geçtiği
Türkçe karşılıkları var. Geriye kalanlar [I18N.TR.md](I18N.TR.md) bilinen boşluklar
bölümünde yapısal notlar olarak yazılı: init öncesi iki yükleme mesajı, bağımsız
sayfaların ayrışma riski ve İngilizcenin kendisinin bir sayıyı tekrarladığı birkaç
yer.

### P-8 — Bildirilen NaN uyarılarını gider `done`

Analizden gelen çerçeve düzeltmesi: çekişmeli doğrulama, *ekrana basılan* `NaN`
metni için öne sürülen tüm adayları çürüttü. Var olan şey bir konsol
**uyarısı** — ki özgün talepteki ifade de buydu — ve `src/main.js` içindeki
guard, bir skill'e sayısal olmayan xp eklendiğinde bunu yazıyor.

Analiz, 11 maddelik sıralı bir düzeltme listesi artı yan temizlikler üretti. En
kritik ikisi:

- Skill xp'sinin yazılmasından önceki son kapı `xp_to_add == 0` karşılaştırması
  yapıyor; bu hem `NaN`'ı hem `Infinity`'yi geçiriyor. `Infinity`, seviye atlama
  döngüsünü sonlanmaz hâle getiriyor ve tarayıcı sekmesini kilitliyor.
- Bir `typeof x === Number` karşılaştırması koşulsuz olarak false; çünkü `typeof`
  bir string döndürür, `Number` ise bir constructor'dır. Koruduğu kazanç başına
  xp sınırı bu yüzden hiç uygulanmamış. Düzeltmek canlı bir denge değişikliği
  olduğu için kendi changelog satırını gerektiriyor.

Ayrıca D-2 açısından daha ilginç bir bulgu: boy/ırk yardımcı fonksiyonu
alanlarını yanlış nesneden okuyor, dolayısıyla boy ve ırk seçiminin şu anda
oynanışa **hiçbir etkisi yok** ve bir dialogue varyantı kalıcı olarak
erişilemez durumda.

**Tamamlanan** - canlı oyundan bildirilen skill xp paneli görüntüsü ve arkasındaki
model hataları; ilk düzeltmenin getirdiği bir regresyon; skill ilerleme çubuğu
genişliği; yeni etkinleşen xp sınırının iyimser hâle getirdiği seviye atlama
tahmini; ve boy/ırk fonksiyonu ile birlikte boy koşul bloğu. Hepsi
[CHANGELOG.TR.md](CHANGELOG.TR.md) içinde yazılı ve `npm test` ile kapsanıyor.

**İncelenip elenen** - yeniden gündeme gelmemesi için buraya kaydedildi. Her biri
çekişmeli olarak "düzeltmeye değmez" diye doğrulandı:

- *Max seviyedeki crafting skill xp aritmetiği* (`main.js`, dört nokta). `NaN`
  üretiyor, ama değer yalnızca `accumulated_xp >= needed_xp` karşılaştırmasında
  kullanılıyor ve `x >= NaN` ile `x >= Infinity` ikisi de false. Önerilen
  `|| Infinity` koruması hiçbir şeyi değiştirmiyor. Korumayı taşıyan kardeş nokta
  ona ihtiyaç duyuyor çünkü o dal değer üzerinde aritmetik yapıyor — kullanımda bir
  asimetri, gözden kaçırma değil.
- *Boş savaş bölenleri* (`main.js`, stance xp ve hayatta kalan sayısı üsleri).
  `is_alive = false` tek bir yerde yazılıyor ve o yer ilgili düşmanın zamanlayıcısını
  hemen temizliyor; öldürme-yeniden doldurma yolu ise ara vermeyen tek bir senkron
  callback — yani hiçbir şey tamamı ölü bir düşman listesini gözlemleyemiyor.
  Gözlemleyebilse bile giriş koruması değeri hatayla reddediyor ve değer hiç
  saklanmıyor.
- *Düşman panelindeki isabet ve kaçınma oranları* sıfır hayatta kalanla. Sıfır
  durumu erişilebilir, ancak `get_hit_chance` sonunda `else { result = 0 }` ile
  `NaN`'ı dönüştürüyor ve düzeltici yeniden çizim aynı senkron görev içinde
  gerçekleşiyor; arada hiçbir kare çizilmiyor. O son dal işlevsel ve belgesiz —
  savunulabilir tek aksiyon bir yorum eklemek.
- *Karakter xp giriş koruması* (`character.js`). Dört çağrı noktasının hepsi
  kanıtlanabilir biçimde sonlu, `total_xp` 0'dan başlıyor ve yalnızca artırılıyor,
  yükleme yolunun girdisi ise diğer üçünün yazdığı bir kayıttan geliyor. En iyi
  hâlde derinlemesine savunma.

**Kapandı.** İki interpolasyon yardımcısı da düzeltildi ve korumaya alındı.

`slerp` geometrik interpolasyon yapıyor; bir çift sıfırdan başladığında bunun okuması
yok - `(to / 0)` `Infinity`, `0 * Infinity ** t` `NaN` - iki uçtan biri negatif
olduğunda da yok. Artık geometrik biçimin tanımsız olduğu yerde doğrusala düşüyor;
doğrusal, iki uçta da onunla aynı sonucu veriyor. `crafting_recipes.js` zanaat başarısı
için aynı ifadenin satır içi bir kopyasını tutuyordu, artık yardımcıyı çağırıyor; yani
koruma tek yerde. Bugün 193 içerik çiftinin hepsi pozitif, dolayısıyla hiçbir mevcut
sayı kaymadı.

**Market doygunluk böleni yeniden üretilemedi.** O yoldaki tek bölmeye ancak
`sold >= 1e13` iken varılıyor, yani sıfıra bölemez; diğeri bir sabite bölüyor. İleriye
taşınmak yerine çürütülmüş olarak kaydedildi. Bakarken yakındaki iki işlevsiz çağrı da
düzeltildi: tek argümanlı `Math.max(x ?? 0)` `x` döndürüyor ve hiçbir şeyi
sınırlamıyordu.

Tuzağın geri dönmemesi için üç koruma:

- `npm run check` içerik kaynağındaki her interpolasyon çiftinin iki ucunun da pozitif
  olduğunu doğruluyor - 192 çift - ve her push'ta çalışıyor.
- `npm test` hem geometrik eğriyi hem düşüş davranışını sabitliyor; içinde eski
  ifadenin gerçekten `NaN` döndürdüğünü doğrulayan bir kontrol de var, yani yenileri
  boş değil.
- `Verify_Game_Objects` aynı çiftleri oyunun içinden bildiriyor. Bu eklenirken onun
  toplama kontrolünün ölü olduğu bulundu: döngü `gained_resources?.length` okuyordu ve
  `gained_resources` bir `resources` dizisi tutan nesne olduğu için bu `undefined`;
  yani sıfır tur atıyor ve içindeki kaynak-adı kontrolü hiç çalışmamıştı.

Ayrıca `npm run check:save` eklendi: dışa aktarılmış bir savegame'i her registry'ye
karşı denetliyor. Yerelleştirme çalışmasından önceki gerçek bir v0.5.5.30 save'i
üzerinde çalıştırıldığında 61 lokasyon, 14 dialogue, 60 skill, 15 etkinlik, 4 tüccar,
11 görev, 8 kitap, 131 tarif ve 90 eşya id'sinin tamamı çözülüyor. Registry
anahtarlarının save verisi olduğu kuralı, bugüne dek gerçek bir save'e karşı hiç
denetlenmemişti.

---

### P-9 — Hikâyeyi devam ettir `done`

Kanon, frontier, orphan envanteri ve planlanan ark artık
[STORY.TR.md](STORY.TR.md) içinde yazılı. Q-1 tam ayrışma yönünde karara
bağlandığı için yeni içerik kapsam dahilinde.

Ark **"The Merchant's Word"**; frontier'dan tam olarak başlayan altı quest.
Premisi tamamen kanondan türetildi: kasaba kapısı tek iki anahtar olarak
yurttaşlığı veya tüccar loncası üyeliğini sayıyor ve bataklıktan sonra loncaya
şelalelerin ötesinden tedarik yapabilecek tek yaşayan kişi kahramandır. Kahraman
kasabaya kahraman olarak değil, tedarikçi olarak girer.

Uygulama sırası, en yüksek kaldıraç önce:

1. **Q2 — TAMAMLANDI.** Kapı açıldı, Town itibarının tamamı olan 150'ye
   kapılandı ve böylece o itibar ilk tüketicisini kazandı. Town square, Cat cafe,
   Antique store ve Adventurer's guild erişilebilir; `Location` artık
   `display_conditions`'ı dikkate aldığı için Nekomimi cafe doğru şekilde
   beastkin ile kapılı; v0.4.6'dan beri ölü olan Lost memory görevi
   tamamlanabilir. [CHANGELOG.TR.md](CHANGELOG.TR.md) içinde yazılı.
2. **BİTTİ.** Dört geri kazanım engelinin hepsi kalktı ve varsayılmak yerine
   kaynağa karşı doğrulandı: `inventory_templates["Cat cafe"]` var ve iki kafe
   tüccarı da onu gösteriyor; Mages guild'in Nekomimi cafe'den kopyalanmış değil
   kendi açıklaması var (iki geniş binanın arasına sıkışmış dar bir taş yapı);
   `src/` veya `locales/` içinde hiçbir yerde `lorem ipsum` kalmadı; ve `Location`
   `display_conditions`'ı saklıyor, `display.js` da onu çizim anında
   değerlendiriyor; yani mofu kapılaması artık push yerinde yapılmak zorunda değil.
3. **İki yarısı da BİTTİ.** *Kasabada Bir Yerde* yayında: lonca kâtibi adı buluyor
   ve yeşil tentenin altındaki komisyoncu, soyguncunun andığı eski patron. İşin
   ödendiğini, sözleşmede tek bir nesnenin tarif edildiğini ve geri kalanın meydanın
   karşısındaki koleksiyoncuya gittiğini veriyor. Kimin ödediğini vermiyor; kanon onu
   açık tutuyor. Tarif ettiği nesne — avuç kadar, yassı, *"kareler dönüp
   başladıkları yere geliyor"* — mağaraya giden fiziksel bağ.

   *Nothing but Pants* de yayında. Antikacı satmıyor ve bu, daha büyük bir sayının
   çözeceği bir bilmece değil: içeri giden yol menşe. Hikâyesi olmayan nesne
   mobilyadır ve bu nesnenin hikâyesi kahramanın kendisi. Para, o bunu öğrendikten
   sonraki bedel: 30000 — oyunda para veren değil **alan** ilk şey.

   Bu, mekanizmayı kurmayı gerektirdi. `money` koşulu üç ayrı biçimde belgelenmiş ve
   hiç harcama yapmayan çıplak bir karşılaştırma olarak yazılmıştı; yani belgelendiği
   gibi yazılan bir fiyat bir nesneye karşı kapı tutuyor ve sessizce hiçbir şeye mal
   olmuyordu. Bkz. [CHANGELOG.TR.md](CHANGELOG.TR.md).

   Son repliği ödülü veriyor: o partide bir parça daha vardı ve aynı gece çıktı;
   yassı, üzerinde dönüp kendi başlangıcına gelen kareler oyulmuş — ve bu kasabayı
   kırk yıl kataloglamış biri, onun burada onu yapacak kimse yokken yapıldığını
   söylüyor.
4. **BİTTİ.** İkinci kapı iki adımda açılıyor; çünkü odanın kendi repliği güçle
   değil anlamayla ilgili: zemini incele — kareler, gözün daire olarak görmek
   zorunda kaldığı kadar basık bir sarmal — ve bu sana kapının itilmeyip okunduğunu
   ve neyle okunacağını söylüyor. Gümüşle; çünkü cevherin açıklaması baştan beri
   onun "büyüyü yönlendirdiğini ya da bozduğunu", külçenin de "büyülü aletlerde
   kullanım potansiyeli olduğunu" söylüyor.

   Bu, gümüşe gideceği yeri verdi ve yazılmış ama iki yerden birden kopmuş zinciri
   yeniden bağladı. Orman gölündeki derin dalış — oyundaki tek gümüş musluğu —
   ödül olarak tekil `action:` veriyordu; bu bir ödül anahtarı değil. Gösterdiği
   `mining` ise bir aktivite, yani `.actions` altında da asla bulunamazdı.
   `Silver ingot` tarifi de "gideceği yer bekleniyor" diye yorumdaydı. İkisi de
   artık yayında, aralarında bir bulucu çubukla.

   Kapının arkasında, yorumlanmış bir bloktan geri kazanılan `cute little rat`
   diyaloğu var: Vaat Edilmiş Sıçan Prensi Ratzor Rathai'nin yedi textline'ı; duvar
   OLAN şeylere papasının lütfunun verildiğini ve onların reddedecek kadar güçlü
   olmadığını anlatıyor. Girişte üç bağlantı hatası onarıldı — bkz.
   [CHANGELOG.TR.md](CHANGELOG.TR.md). The Infinite Rat Saga'nın yazıldığından beri
   `(tbc)` işaretli son adımı artık tamamlanabilir.
5. **BİTTİ.** Q6 köy muhafızının geçiştirmesinin karşılığını ödüyor ve mekanizmayı
   onun kendi replikleri veriyor. *"İkisi sparring'le kolayca gösterilebilir, o
   yüzden onunla başlayalım. Üçüncüsünü anlatmam gerekecek"* — yani bugün hiçbir
   şeyin vermediği iki duruş, ancak atlatılarak öğrenilebilen ikisi; üçte
   durmasının sebebi de bu, *"öğretmen olarak berbatım"* sözünün alçakgönüllülük
   değil bir yöntem olmasının sebebi de. Onları öğretmiyor. Dövüşerek içine işliyor
   ve sana şimdiden yanlış yaptığını söylüyor; asıl nokta da bu.

   Challenge_zone değil: *"ben senin için fazla ağır sıkletim"* kanon, yani o,
   oyuncunun yendiği bir düşman olamaz. Ölçülen şey, aşırmaya değer bir şey görecek
   kadar ayakta kalmak.

   Açık kalan şey, değirmencilerin zaten dokunmamayı seçtiği şey: geri dönmesinden
   hemen önce emekli olan o en iyi on maceracıdan biri olup olmadığı. Soruyu açık
   açık reddediyor ve yalnızca zanaatkârın hükmünü düzeltiyor: *"yetenek değildi."*

6. **BİTTİ — ve eksik olan ilk görev buydu.** *The Merchant's Word* tüccar
   loncasına gövde, kapıya da ikinci anahtarını veriyor. Mubayaacı, duvarın
   DIŞINDA portatif bir masada oturuyor; asıl nokta da bu: bir tedarikçinin
   satmak için içeri alınmasına gerek yok, içeri alınmaya değer olması gerekiyor.

   Kimsenin ona getiremeyeceği üç şeyi alıyor — kabile ketenden keten kumaş,
   tabakçının tarifinden timsah derisi, aşçının tarifinden kurutulmuş et — ve
   gerekçesi bir iyilik değil, bir arz meselesi: *"Oradan kimse dönmüyor, yani arz
   yok, yani fiyat yok — ve bir şeyin fiyatı olmayan bir lonca, biri sonunda o şeyi
   getirdiğinde onunla ne yapacağını bilmiyor."* Üç teslimat, tahtasında üç fiyat
   ve ardından loncanın bugüne dek verdiği en ucuz üyelik.

   Kapının `supplier` satırı `known`'ı birebir yansıtıyor, çünkü aynı kapı; fark,
   oyuncunun iki anahtardan hangisini getirdiği. Her biri diğerini kilitliyor;
   böylece itibarla içeri girmiş bir oyuncuya artık ihtiyacı olmayan bir kâğıt
   önerilmiyor.

**Arkın altı görevinin tamamı kuruldu.** Kapının iki anahtarı da var, kasaba
içlerinde insanlar var, soygunun kimsenin adını bilmediği bir müşterisi var, ikinci
kapı akılla açılıyor ve muhafız sonunda dövüşüyor. Gümüş, sıçan, derin dalış,
külçe tarifi ve son iki duruş geri kazanıldı — [STORY.TR.md](STORY.TR.md) içindeki
"yazılmış ama erişilemez" listesi boş.

Açık kalması gerekenler: soygunun parasını kimin ödediği, kahramanın o nesneye
nasıl sahip olduğu, inşa edilmemiş dört bölge, sürgün kabile ve Rat God.

---

### P-10 — Dört bölgeyi inşa et `done`

Direktif: inşa edilmemiş bölgeler inşa edilecek ve hikâye çalışması sürecek.

**Dördü de çoktan adlandırılmış, hem de tek bir NPC tarafından.** Bataklık aşçısının
coğrafya dersi şartnamenin tamamı ve bir harita değil bir yas: her satır, yılanın
ruhunun eskiden neyi kapsadığıyla ilgili:

> *"Ahh`! Topraklar! Onlar ruhtur! Ama eskiden daha büyüktü! Dağ! Ovalar! Ormanlar!
> Körfez! Hepsi eskiden yılanın ruhundaydı!"*

| Bölge | Onun repliği | Durum |
| --- | --- | --- |
| **Dağ** | *"Kuzeybatı; yürüyen kayaların ve düşen suyun olduğu yer!"* | Kısmen kurulu: Mountain path, Mountain camp, Waterfall basin. Yaratmak değil derinlik gerekiyor. |
| **Islak ormanlar** | *"Düşen suyun güneyi! Islak ormanlar! Bizim toplandığımız yer orasıydı! Ama şimdi?! Sadece yürüyen kayaların evi!"* | Kurulmadı. |
| **Ovalar** | *"Güneydoğu! Yılan avlanırdı! Ama yılan bölündü! Ve artık hiçbir yılan ovalara gitmiyor!"* | Kurulmadı. Sürgün kabilenin gittiği yer. |
| **Körfez** | *"Çok kuzeyde! Oradan çok baharat, et, metal ve deri gelir! Çok uzaktan! Gidilecek iyi bir yer! Ayrılmak için!"* | Kurulmadı. Loncanın mallarının aktığı ticaret merkezi. |

Uygulama sırası, en yüksek kaldıraç önce:

1. **Islak ormanlar — BİTTİ.** Waterfall basin'den güneye; oraya rastlayarak değil
   aşçıya ormanları sorarak bulunuyor: onları adlandıran replik, onları açan replik.
   Suyun içinde duran bir orman, onun yürüyen kayalarının elinde; Drowned grove'u
   temizlemek kabilenin eskiden topladığı şeyi geri veriyor.

   Topladıkları şey keten ve bu bir süs değildi. Lonca mubayaacısı yirmi Keten kumaş
   istiyor, bir kumaş on Flax ve o iki yüz Flax'in hepsi haritanın öbür ucundaki tek
   bir Riverbank aktivitesinden gelmek zorundaydı — yani 1. görev, sahip olmadığı bir
   arzla yayına çıkmıştı. Toplama alanı, kendisinden önce gelen görevi onarıyor;
   *"bizim toplandığımız yer orasıydı"* zaten bunu söylüyor.

   Odanın açıklaması korunun temizlenme sayısıyla üç aşamada değişiyor; böylece bölge
   bir anahtar gibi değil iyileşiyormuş gibi okunuyor. Aşçı da coğrafya dersindeki
   herhangi bir repliğin bugüne dek aldığı tek cevabı alıyor.
2. **Ovalar — TAMAM.** Bataklık tarlaları'nın güneydoğusu; aşçının ovalardan
   bahsetmesiyle açılıyor. Bir yer olarak değil, bir yokluk olarak kuruldu: repliği
   terk edilmiş bir av sahasından bahsediyor, yani tehlike orada artık hiçbir şeyin
   avlanmaması, ve yerleşen şey de Eski av sahası.

   `No Snakes Go to the Plains` adını onun repliğinden alıyor ve ödülü bir eşya
   değil - bataklık reisi, yüzüğünü verdiği gün yarıda bıraktığı cümleyi
   tamamlıyor. Kasıtlı bırakılmış bir kancaydı ve hiçbir şey ona geri dönmemişti.

   Sürgün kabile hâlâ bulunmuyor. İzleri orada; ne oldukları, bataklığın üstüne
   kurulduğu açık soru olarak kalıyor.
3. **Körfez — TAMAM.** Kapının üç gün kuzeyi; mubayaacıya yoldan geri ne gittiğini
   sorarak açılıyor. Ayrılmak için sebep 4. görevle geldi: koleksiyoncunun ikinci
   parçası *"geceyi çıkarmadı"* ve bu, o parçanın çıktığı yol.

   Yol bir engel - Kasaba dışı'na bağlı, içinden geçilen değil temizlenen bir
   Combat_zone - ve körfezin kendisi bir ayrılış olarak kuruldu: on bir yapı,
   dokuzu depo, kimse buralı değil. Tuz evi, aşçının *"baharat, et, metal ve
   deri"* vaadini mevcut şablonlardan tutuyor; içindeki her şeyin tekneyle
   geldiğini söyleyen bir marjla ve kendi pazar bölgesinde, çünkü oyundaki diğer
   bütün pazarlardan bir ay uzakta.

   Ödül çıkış defteri: **Marrowmoth**, tartılmamış bir sandık ve üzerinden iki kez
   geçilmiş bir hesap sütunu. Kimin ödediğine dokunulmuyor. Yeni olan şey, yılda
   iki kez dönen ve vakti gelmemiş bir tekne.
4. **Dağ — TAMAM.** Zemin değil derinlik; ve derinlik çoktan
   [STORY.md](STORY.md)'nin sınır notunda adlandırılmıştı: ekipman tavanı bir
   istasyon tavanı. Oyundaki her zanaat istasyonunda dövme ve eritme 1. kademedeydi,
   oysa parçalar 5. kademeye çıkıyor; yani oyuncunun bugüne kadar dövdüğü her şey
   kalitesini cezalı attı.

   Kamp zaten oyuncunun kendisinin ve kendi ortam repliği rüzgâr; yani hava akımıyla
   beslenen bir ocak oraya ait ve kimsenin onu teslim etmesi gerekmiyor. Yaşlı
   zanaatkâr, öğretisinin hep ima ettiği ama hiç söylemediği sınırı — kendi
   ocağındaki sınırı — adlandırıyor. Kademeler bir küresel bayrak üzerinden getter
   ve 2 değil 3; çünkü 2, 4. ve 5. kademe parçaları hâlâ eksik atmaya bırakırdı.

   **Dört toprağın tamamı artık oyunda.**

**Onun dördüne dahil olmayan beşinci bir iplik.** Forest lake'in ötesindeki `gaze`
eylemi şöyle bitiyor: *"Uzakta uçan bir kuşa benzeyen şeyin ayrıntılarını seçmeye
çalışıyorsun. Dört bacağı var... [tbc]"* — ormanın kalbi, kendi yazarı tarafından
devam edecek diye işaretlenmiş. Hiçbir bölgeye ait değil ve birinin içine
katlanmamalı.

**Açık kalması gerekenler.** Sürgün kabilenin kendisi: ovalar yürünebilir ve izleri
bulunabilir, ama *onları* bulmak, bataklığın üzerine kurulduğu soruyu yanıtlar.
Dört bacaklı kuş. Sıçan Tanrı. Soygunun parasını kimin ödediği. Köy muhafızının
emekli maceracı olup olmadığı.

İki `[To be continued]` görev adımı da bağlanmamış durumda ve bu listeye değil
bölgelere ait: `Village expansion` adım 7 ve `Light in the darkness` adım 2.

### P-11 — İki `[To be continued]` görevini bitir `done`

Oyunda iki görev maddesi, açıklaması olarak birebir **"[To be continued]"** metnini
taşıyor: `Village expansion` 7. madde ve `Light in the darkness` 2. madde. Bunlar
oyunun kendi görev verisindeki son çıkmazlar - geri kalan her şeyi bitirmiş bir
oyuncu, ikisini de arkalarında hiçbir şey olmadan panelde duruyor görüyor.

Yazıldıklarında ikisinin de bir cevabı yoktu. Şimdi ikisinin de var ve iki durumda da
cevap, bu iş için uydurulmuş bir şeyden değil, o zamandan beri kurulmuş bir şeyden
çıktı.

#### 1. `Village expansion` 7. madde — yaşlının dördüncü işi — **TAMAM**

Üç işi su, erişim ve güvenlik: ıslah kanalı, köprü ve dev yusufçukların temizlenmesi.
Sonra:

> *"Yusufçuklar gittiğine göre yeni projeler var mı?"*
> *"Henüz yok, ama umarım yakında."*

**"Yakında"yı getiren şey 4. bölge.** Yaşlı zanaatkâr oyuncuya dövdüğü her şeyin neden
eksik çıktığını yeni söyledi - *"bu köy bir çukurda kurulu; uyumak için harika, yakmak
için umutsuz"* - ve aynı nefeste bunu kendisinin düzeltemeyeceğini de söyledi: *"Ben
seksen bir yaşındayım ve rüzgâr bu vadide değil."* Oyuncu o tarihten beri, onun
anlattığı şeyi bir dağın üstünde, iki yüz tuğlayla kurdu.

Yani dördüncü iş köy için bir ocak ve köy dağı asla yakalamıyor. Yukarıda rüzgâr,
körüğü çeken çocuğun işini yapıyor; çukurun içinde gerçek bir çocuk gerekiyor, o
yüzden köy istasyonu **2'ye çıkıyor ve 2'de kalıyor**. Bu, özür dilenecek bir kısıt
değil - zanaatkârın kendi açıklamasının sayıya dönüşmüş hâli.

Sıra: yaşlının `further work` repliği artık *"henüz yok"*ta durmuyor; oyuncu kuruyor;
yaşlı zanaatkâr da tutan bir ateşin karşısında durabiliyor.

#### 2. `Light in the darkness` 2. madde — kurtarma değil, alıcı — **TAMAM**

Görev doğru soruyu soruyor ve 1. maddesi onu cevaplamıyor:

> *"Kenar mahalle halkı acı ve korku içinde yaşıyor. Belki durumlarını en azından
> biraz iyileştirebilirsin?"*

1. madde *"Çeteyle ilgilen"*. Kabadayıları kaldırmak iyileştirme değil - etkin bir
zararın kaldırılması ve kenar mahalle sonrasında tam olarak eskisi kadar yoksul.
Oyun bunu zaten biliyor: `desc location Slums`, `Gang hideout.is_finished` ile
değişip *"bölgeye biraz güvenlik döndüğü için daha çok kişi sokakta"* diyor. Güvenlik
döndü. Başka bir şey dönmedi.

Ve 3. görev bunu çözmek yerine keskinleştirdi: o çeteyi yönetmiş adam artık kasaba
meydanında, **yeşil bir tentenin altında bir komisyoncu**; meşru ve iyi durumda,
oysa yönettiği mahalle olduğu gibi. Bu karşıtlık bu maddeden sağ çıkmalı.

**Kenar mahallenin eksiği bir alıcı.** Oyunda hâlihazırda duran üç parça bir alıcı
kuruyor:

- yaşlı kadın, oyuncuya bitki bilgisi öğretecek kadar otları biliyor; kenar
  mahalleden birinin bugüne kadar karşılıksız verdiği tek beceri bu;
- lonca mubayaacısı her şeyi alıyor, kötü fiyata, ve bunu yüzüne söylüyor - *"Her
  şeyi, kötü fiyata"*;
- oyuncunun elinde loncayla yazılı, portatif masada oturan bir adamın imzaladığı bir
  cari hesap var.

Yani iyileştirme bir bağış değil, bir hesap: kenar mahalle, dilenmek yerine sattığı
ilk şeye kavuşuyor - hem de mubayaacının aşağılayıcı olduğunu neşeyle kabul edeceği
bir fiyattan. *"En azından biraz"* görevin kendi vaadi ve doğru ölçü de bu.

**Bunun yapmaması gerekenler:** yoksulluğu çözmek, komisyoncuyu aklamak ya da
kahramanı bir hami yapmak. Yaşlı kadına iki kez teşekkür ettirilmeyecek.

#### Sıra

1. Köy ocağı. Doğrudan 4. bölgeden geliyor ve mekanizması çoktan kurulmuş ve kontrol
   edilmiş durumda.
2. Kenar mahalle hesabı. Mubayaacının diyaloğunun bir kez daha açılmasını gerektiriyor
   ve bu, 3. bölgenin kullandığı kapının aynısı; o yüzden iki şeyin aynı konuşma için
   yarışmaması adına ikinci sırada olmalı.

### P-12 — Çeliğin üstündeki metalleri bağla `kısmen tamam`

`crafting_component_filling.js`, hiçbir tarifin bugüne kadar üretmediği dört malzeme
için 72 bileşen üretiyor: 4. kademede **beyaz demir** ve **siyah demir**, 5. kademede
**beyaz çelik** ve **siyah çelik**. Silah başlıkları, saplar, kalkan tabanları ve beş
zırh yuvasının tamamı için hem zincir zırh hem plaka dış katmanları. Başlığı boşluğu
tek satırda açıklıyor: *"DOES NOT AUTO-FILL CRAFTING RECIPES, DO IT MANUALLY AND MAKE
SURE NAMES MATCH"*.

**4. kademe tamam.** Cevher körfezdeki tuz evinde satılıyor, eritme tarifleri 15-25
bandında ve on üç dövme bileşen tarifinin her birine iki satır eklendi. İhtiyaç
duyduğu her şey zaten mevcuttu — cevherler, külçeler, zincir zırh ve iki dildeki
adları ile açıklamaları.

**Kalanlar, ve sırası:**

1. **4. kademe plaka.** Üretici `White iron plate helmet armor` ve dokuz kardeşini
   yapıyor, ama onları dövecek bir `White iron plate` malzemesi yok — demir/çelik
   hattında da plaka yok, yani bu iki yeni tarif satırı değil, iki yeni malzeme eşyası
   istiyor. `material white iron plate` adlandırma satırları iki yerelde de zaten var.
2. **5. kademe: beyaz çelik ve siyah çelik.** Külçeler ve zincir zırh eşya olarak
   mevcut. Olmayan şey bir görünen ad: `material white` ve `material black`'in iki
   yerelde de satırı yok; özgün çalışma da orada durmuş. 4. kademenin üstündeki bir
   kademe, 3'ün üstünde bir istasyon da ister ve öyle bir şey yok — dağdaki baca
   oyunun en iyi ateşi.
3. **Satın alınan değil, kazılan bir cevher.** Körfezde satın almak, "çok uzaktan"
   gelen bir metal için doğru; ama oyuncunun yalnızca alışverişle edinebildiği bir
   kademe zayıf. Nerede kazıldığı bir hikâye sorusu ve bir sonraki açılacak bölgeye
   ait, bu öneriye değil.

**Bunun yapmaması gereken:** beşinci bir kademe uydurmak. Çeliğin ötesinde dört
malzeme, bataklığın ötesindeki yazılı içerikten çoktan fazla; ve tavan hikâyenin
önünde değil, onunla birlikte hareket etmeli.

### P-13 — Oturumun talepleri, tek tek `active`

Buraya kaydedildi; çünkü her talimat bu dosyaya işin bitmesinden sonra değil, önce
ya da sırasında girer. Her madde, talebin verildiği hâli ve bulunduğu durum.

#### İçerik ve özellikler

1. **Bir lore alanı** — hikâyenin geçmişini ve yapılmış konuşmaları tutan bir yer.
   `yapılacak`. Günlükte zaten dört sekme var (görevler, hayvanlar kitabı, antoloji,
   veri) ve beşincisi yeni bir panelden çok oraya ait. Ne tutmalı: oyuncuya ne
   söylendiği, kim tarafından; diyalog kapandıktan sonra da kalacak şekilde. Oyunda
   şu anda bunu kaydeden hiçbir şey yok.
2. **Perkleri genişlet** — `cevaplandı, yapılacak`. **Beceri kilometre taşları** olarak doğrulandı: bir becerinin 1. seviyede +1 kuvvet, 3. seviyede başka bir şey vermesi. Bu depoda bir perk sistemi
   yok: `src/`, yereller, `index.html` ve `style.css` içinde hiçbir yerde `perk`
   geçmiyor. En yakın mevcut sistemler **beceri kilometre taşları** (bir becerinin
   belirli seviyelerde sabit ya da çarpan stat vermesi), **savaş duruşları** ve
   **ırk ile boy bonusları**. "Perk"in hangisi olduğu ne kurulacağını değiştirdiği
   için tahmin edilmek yerine soruluyor.
3. **4. kademe: çeliğin üstündeki metaller** — `tamam`, P-12 olarak izleniyor.

#### Arayüz

4. **UI tam ekrana sığmıyor** — `yapılacak`. `#main_content` sabit 1241x806 ve mesaj
   günlüğü `left: 1230px`'te, 415px genişlikte; yani sayfa pencere ne olursa olsun
   yaklaşık 1660px genişliğinde ve günlüğün sağ kenarı kesiliyor, altta da yatay
   kaydırma çubuğu çıkıyor. Daha küçük yazı tipi değil, yeniden yapılandırma
   gerekiyor.
5. **Changelog elle satır kırılmamalı** — `tamam`. `<pre>` blokları geniş bir pencere
   için elle kırılmıştı ve `pre-wrap` onları kapsayıcı genişliğinde bir kez daha
   kırıyordu; yani her girdi iki kez bölünüyordu. Artık gerçek bir liste: kaynakta bir
   girdi bir satır ve sarmalamayı tarayıcı yapıyor, hem de bir `<pre>`'nin yapamadığı
   asılı girintiyle.
6. **Mağazada İptal geri getirmeli** — `yapılacak`. Üç düğme var: Kabul et, İptal ve
   Çık. İptal sepeti temizleyip kalıyor, Çık ayrılıyor. Bildirilen ekran
   görüntüsünde yalnızca ikisi görünüyor; bu da büyük olasılıkla 4. maddedeki yerleşim
   sorunu. Etiketler de Türkçede iki eylemi yeterince ayırmıyor.
7. **"Bitir: koşu" yanlış okunuyor** — `tamam`. `ui finish activity` değeri
   `Bitir: {v1}`; bu bir talimattan çok etiket-değer çifti gibi okunuyor. Türkçe,
   faaliyet adına göre değişen bir belirtme eki olmadan İngilizce sözcük sırasını
   buraya alamıyor.

#### Ekran görüntülerinden bildirilen çeviri boşlukları

8. **Eşya baloncuğundaki bileşen listesi** — `tamam`. `item_templates[...].name`,
   yani ham kayıt adını basıyordu; dövülmüş bir kılıç
   `[Cheap iron long blade] + [Simple wooden short handle]` diye okunuyordu. Artık
   `getDisplayName()` kullanıyor ve beş bileşen yuvası anahtarı satır kazandı.
9. **`[weapon]`, `[legs]`, `[torso]`, `[cape]` yuva etiketleri** — `tamam`. Envanter
   satırı `equip_slot`'u ham basıyordu. Tek site; karakter envanteri, tüccar ve depo
   onu paylaşıyor.
10. **Kategori filtre düğmeleri** — `tamam`. `all` / `equipment` / `usable` /
    `other`; tüccar ve depo panellerinde sekiz tane ve hiçbirinde `data-translation`
    yok.
11. **Kitap adları** — `tamam`. Envanter bir kitap için `target_item.name`
    basıyor, o yüzden `"A Glint On The Sand"` diye görünüyorlar. Her kitabın zaten bir
    `name <başlık>` satırı var.
12. **Alışveriş toplamındaki `nothing`** — `tamam`. `format_money(0)` bu dizgeyi
    doğrudan döndürüyor. Bir DOM yazması değil bir dönüş değeri olduğu için bu oturumda
    eklenen kontrol onu görmedi.
13. **Tooltiplerde `Winter`, `2 hours`, `25 minutes`** — `tamam`; ve onlarla birlikte iki tane daha bulundu: dört becerinin altındaki mizah satırı ve her beceri çubuğundaki `level` kelimesi. İki sebep: iş
    müsaitlik satırı sezon listesini doğrudan `game_time.js`'ten alıyor ve o dosya
    İngilizce döndürmeye devam etmek zorunda; ve `misc.js` içindeki
    `format_working_time` / `format_reading_time` birimlerini İngilizce kuruyor.

#### Geliştirme

14. **Geliştirme için bir konsol anahtarı** — `tamam`. Tarayıcı konsolunda
    `enable_dev_console()` yazmak yardımcıları yalın global olarak bağlıyor; istenen
    `add_active_effect("Coffee", 1800)` dahil, ayrıca `give()` (bir görevin kullandığı
    yolun aynısından geçen bir ödül nesnesi), `goto()`, `add_money`, `add_xp`,
    `add_skill_xp`, `set_flag` ve `list_*` fonksiyonları. Varsayılan olarak kapalı ve
    kaydedilmiyor: yeniden yükleme onu kapatıyor.
15. **Her talebi buraya kaydet** — `sürekli`. Bu bölümün kendisi o kuralın
    uygulanması.
16. **Geliştirme için hız çarpanı** — `tamam`. Alt panelde Kaydet ve Dışa aktar'ın
    yanında 1x / 2x / 5x / 10x; `enable_dev_console()` onları ortaya çıkarana kadar
    gizli, ayrıca konsoldan `set_speed(n)`. `tickrate`, `main.js` içindeki her
    duvar-saati gecikmesinin ve her tik-başı muhasebe teriminin böleni; yani onu
    çarpmak her şeyi tutarlı biçimde hızlandıran ve muhasebeyi doğru bırakan tek
    değişiklik. Kaydedilmiyor.
17. **Mesaj günlüğü yeniden yüklemeden sağ çıkıyor** — `tamam`. Saklanan şey
    `log_message`'ın aldığı argümanlar, bitmiş div'ler değil; yani geri yüklenen bir
    günlük canlı olanla aynı kodla kuruluyor ve grup başı üst sınırlar birebir aynı
    davranıyor. 300 girdiyle sınırlı, çünkü kayıt oyuncunun elle dışa aktardığı bir
    metin dosyası. Satırlar hâlâ düştükleri dilde kalıyor — bu kısıt `log_message`'ın
    kimlik değil kurulmuş metin alması ve değişmedi.
18. **Changelog girdileri cümle** — `tamam`. İki dosyadaki her girdi büyük harfle
    başlıyor ve noktayla bitiyor: İngilizcede 857 büyütme ve 863 nokta, Türkçede 800
    ve 866. Türkçe büyütme ASCII değil, o yüzden i, `upper()` üzerinden değil açıkça
    İ'ye eşleniyor. Otuz üç girdi bir `<b>` ya da `<span>` içinde bitiyor ve noktaları
    etiketten sonra değil içine girdi.
19. **Upstream'in güncellemesini al, sonra oraya PR aç** — `alınacak bir şey yok; PR
    karar bekliyor`. Upstream çekildi ve tam olarak iki dalı var:

    | ref | baş | tarih |
    | --- | --- | --- |
    | `master` | `e335643` v0.5.5.30 | 2026-06-23 |
    | `ghpages` | `fc04780` | 2026-06-26 |

    `ghpages` dağıtım dalı ve **ağacı master'ınkiyle bayt bayt aynı** — sonraki
    commit'ler hiçbir dosyayı değiştirmeyen birleştirmeler. `master`'ın başı bizim
    çatallanma noktamız; yani `upstream/master..master` 67 commit,
    `master..upstream/master` sıfır. Alınacak bir güncelleme yok.

    PR ayrı ve gerçek bir soru: o 67 commit, Q-1'in karar verdiği tam ayrışma — her
    dizgenin yerel dosyalara taşınması, ikinci bir dil, dört bölge, bir derleme ve 99
    kontrol — ve bunun tamamını sunmak incelenebilir bir pull request değil. Sunulabilir
    olan şey, bizim değil upstream'in hatası olan bir avuç düzeltme; her biri küçük ve
    dilden bağımsız:

    - `item_templates["Cooked potato"]`, `name: "Potato"` taşıyor; yani pişmiş patates
      çiğ olanı gibi görünüyor.
    - `gaze` eylemi, `success_chances: [0,0]` ve boş bir koşul listesinin ulaşılamaz
      kıldığı bir başarı metni ve bir `conditional_loss` metni bildiriyor; başarı
      metninin içeriği de `[TBD]`.
    - `crafting_component_filling.js`, hiçbir tarifin üretmediği dört malzeme için 72
      bileşen üretiyor; kendi başlığı da bu konuda uyarıyor.
    - `Alchemical Wood` zinciri ve `Silver ingot` tarifi kullanım noktası olmadan
      yorumda duruyor, gümüşü veren derin dalış da kilitli.

    Bunlardan hangisinin gönderileceği ve hiçbir şeyin gönderilip gönderilmeyeceği
    varsayılmak yerine soruluyor.


---
## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar.

### Q-1 — Bu fork içerik olarak ayrışacak mı? **KARAR: tam ayrışma**

Yeni bölgeler, item'lar ve dialogue kapsam dahilinde. Upstream senkronizasyonu
artık bir hedef değil. Refactor'ların upstream ile merge-dostu kalması gerekmiyor
ve Q-5 (`dist/` takipten çıkarma) o zamandan beri takipten çıkarma yönünde
karara bağlandı.

### Q-2 — Türkçe nereye kadar? **KARAR: her şey**

Arayüz, dialogue ve item / skill / lokasyon görünen adları.

Sonucu, P-7'de anlatılan görünen-ad dolaylama katmanıdır. Registry anahtarları
kalıcı olarak İngilizce kalır, çünkü onlar save verisidir; çevrilen şey, girdi
başına ayrı bir gösterilen-ad metin id'sidir. Bunun hiçbir kısmı anahtar yeniden
adlandırmaya izin vermez.

### Q-3 — `help.html` ve `changelog.html` Türkçe kapsamında mı? **KARAR: ikisi de, tümüyle**

Öneri, elle yazılmış bir Türkçe yardım sayfası ve Türkçe bir not taşıyan yalnızca
İngilizce bir changelog'du. İkinci yarısı fazla çekingendi. İki sayfa da Türkçe
olarak var — `help.tr.html` ve `changelog.tr.html` — ve
`update_translated_page_links` oyun içi bağlantıları seçilen dile uyan dosyaya
yöneltiyor; sayfası olmayan bir dil için İngilizceye düşüyor.

Oyun içi changelog o zamandan beri devralınmış bir artefakt değil, geliştirme
kaydının parçası hâline geldi; bu da sorunun geri kalanını kapatıyor: Türkçe
kopyası bir nezaket değil, bakımı yapılan bir dosya. `npm run check`, iki
kopyanın da yayımlanan `game_version` için bir girdi taşımasını şart koşuyor.

### Q-4 — Türkçe hitap kipi **KARAR: karma, NPC bazında**

Yaşlılar, resmî görevliler ve bataklık şefine sizli hitap edilir; akranlara,
çocuklara ve samimi kadroya senli. NPC'ler kahramana senli hitap eder, görev
başındaki görevliler hariç. NPC bazlı harita
[STORY.TR.md](STORY.TR.md#6-t%C3%BCrk%C3%A7e-hitap-kipi) içinde.

Önceki çerçeveye düzeltme: bunun için **hiçbir** motor değişikliği gerekmiyor.
Kipin ikinci bir seçilebilir eksen olması arama mantığının yeniden yazılmasını
gerektirirdi; ancak NPC bazında sabit bir kip yalnızca o satırın Türkçe metnine
yazılır ve her satır zaten ayrı bir string id'dir.

### Q-5 — `dist/` takipte kalsın mı? **KARAR: takipten çıkarıldı**

Commit'li kopyayı kullanan hiçbir şey yoktu. Deploy workflow'u yüklemeden önce
`npm run build`'i kendisi çalıştırıyor, yani yayımlanan bundle her zaman CI'ın
derlediğiydi; depo kökü geliştirme giriş noktası ve `index.html`'i `src/main.js`
yüklüyor; ayrıca hiçbir kontrol commit'li bundle'ı `src/` ile karşılaştırmıyordu,
yani bayat bir kopya yakalanmazdı. Karşılığında ödenen bedel 4 MB minified çıktı
artı sourcemap'ti ve 121 commit boyunca her içerik değişikliğinde yeniden diff'e
giriyordu. Birleştirilemez-çatışma gerekçesi Q-1 altında geçersiz kaldı, ama geri
kalanı ona ihtiyaç duymuyor.

`.gitignore` artık `dist/`'i yok sayıyor, blob'u diff'lerin dışında tutan
`.gitattributes` girdileri onunla birlikte kalktı ve `scripts/build-site.js`,
deploy workflow'u, iki README ile `docs/AGENTS`'ın iki yarısındaki yorumlar artık
onun commit'li olduğunu söylemiyor. `npm run build`'in kendisi değişmedi: hâlâ önce
`dist/bundle.js`'i yazıyor, sonra onu `_site/` içine kopyalıyor.

### Q-6 — Dil değiştirme: yeniden yükleme mi, canlı mı? **KARAR: canlı**

Burada anlatılan engel — canlı bir geçişin, display modülü bölünmeden var olmayan
bir "tüm ekranları yenile" giriş noktası gerektirdiği — sorunun biçimi değilmiş.

`translateUI`, `data-translation` taşıyan her şeyi yeniden yazıyor; geri kalan her
şey de paneli çizilirken `getText` üzerinden çözülüyor, yani oyuncu dolaştıkça
kendiliğinden dönüşüyor. Kalan şey, bir kez emirsel olarak kurulup bir daha hiç
çizilmeyen kısa bir panel listesi: karakter bio'su ve karakter oluşturma paneli.
Her biri `option_language` içinde açık bir yeniden çizim alıyor ve biri eksik
olursa `npm run check` düşüyor; böylece liste sessizce büyüyemiyor. Yeniden yükleme
yok ve hiçbir şeyin bölünmesi gerekmedi.

---

## Bu dosyanın kuralları

- Her direktif için bir öneri; numaralandırılır ve asla yeniden numaralandırılmaz.
- Bir öneri `done` durumuna geldiğinde açıklaması
  [CHANGELOG.TR.md](CHANGELOG.TR.md) dosyasına yazılır, öneri kayıt olarak burada
  kalır.
- Kararlar [Bekleyen kararlar](#bekleyen-kararlar) bölümünden onları tüketen
  öneriye taşınır ve cevap kayda geçirilir.
