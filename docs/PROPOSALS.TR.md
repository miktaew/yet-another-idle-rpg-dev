<!-- doc-source: docs/PROPOSALS.md  doc-version: 47 -->

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

### D-8 — Her düzeltme, onu yakalayacak testle birlikte gelir

Oyuncuya ulaşmış bir hata, geçitte onu arayan hiçbir şey olmadığının kanıtıdır.
Korumayı eklemeden hatayı düzeltmek kapıyı açık bırakır ve bu depo o kapıdan birden
çok kez geri girdi: `restore_message_log` ile `effect_templates` üç hafta arayla
yaşanan aynı eksik-içe-aktarma hatasıydı.

Dolayısıyla bir düzeltme, o olmadan bir kontrol başarısız olana kadar bitmiş sayılmaz.
Bunu gerçek kılan iki kural:

1. **Korumayı tersten sınayın.** Hatayı geri koyun, kontrolün patladığını görün,
   çıkarın, geçtiğini görün. Hiç patlamamış bir koruma sınanmış değil yalnızca
   yazılmıştır — ve genişletilen bir eşleyici, eskiden yakaladığını sessizce
   yakalamaz olabilir.
2. **Örneği değil sınıfı koruyun.** `check_save_keys_round_trip`,
   `last_combat_location` diye bir şey bilmez; kaydın yazdığı her anahtarın yüklemenin
   okuduğu bir anahtar olmasını şart koşar. Bir sonraki yeniden adlandırma da aynı
   yerden patlar.

Nerede duruyorlar: `tests/checks/*.mjs`, `tests/run.mjs` içinde kayıtlı, `npm run check`
ile çalışıyor. Geçit `npm run build && npm run check && npm test && npm run check:bundle`
ve commit öncesi dördünün de geçmesi gerekiyor.

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
2. **Perkleri genişlet** — `tamam`. **Beceri kilometre taşları** olarak doğrulandı: bir becerinin 1. seviyede +1 kuvvet, 3. seviyede başka bir şey vermesi. Bu depoda bir perk sistemi
   yok: `src/`, yereller, `index.html` ve `style.css` içinde hiçbir yerde `perk`
   geçmiyor. En yakın mevcut sistemler **beceri kilometre taşları** (bir becerinin
   belirli seviyelerde sabit ya da çarpan stat vermesi), **savaş duruşları** ve
   **ırk ile boy bonusları**. "Perk"in hangisi olduğu ne kurulacağını değiştirdiği
   için tahmin edilmek yerine soruluyor.
3. **4. kademe: çeliğin üstündeki metaller** — `tamam`, P-12 olarak izleniyor.

#### Arayüz

4. **UI tam ekrana sığmıyor** — `tamam`. `#main_content` sabit 1241x806 ve mesaj
   günlüğü `left: 1230px`'te, 415px genişlikte; yani sayfa pencere ne olursa olsun
   yaklaşık 1660px genişliğinde ve günlüğün sağ kenarı kesiliyor, altta da yatay
   kaydırma çubuğu çıkıyor. Daha küçük yazı tipi değil, yeniden yapılandırma
   gerekiyor.
5. **Changelog elle satır kırılmamalı** — `tamam`. `<pre>` blokları geniş bir pencere
   için elle kırılmıştı ve `pre-wrap` onları kapsayıcı genişliğinde bir kez daha
   kırıyordu; yani her girdi iki kez bölünüyordu. Artık gerçek bir liste: kaynakta bir
   girdi bir satır ve sarmalamayı tarayıcı yapıyor, hem de bir `<pre>`'nin yapamadığı
   asılı girintiyle.
6. **Mağazada İptal geri getirmeli** — `tamam; davranış değil etiket olarak`. Davranış yazarın tasarımı ve doğru: bir düğme kurduğun sepeti temizliyor, öteki ayrılıyor. Yanlış olan şey "İptal" ile "Çık"ın hangisinin hangisi olduğunu söylememesi - ve yerleşim 1660px'te kesildiği için ikisinden yalnızca biri ekranda duruyordu. Artık "Seçimi temizle" ve "Dükkândan çık" yazıyorlar; 4. madde de üçüncü düğmeyi görünür hâle getirdi. Üç düğme var: Kabul et, İptal ve
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


20. **Panel düğmeleri panelin altına düşüyordu** — `tamam`. Favoriler, BGM ve
    Dükkândan çık kutularının alt kenarının altında kalıyordu. Beş panel, kayan
    listesine sabit bir yükseklik verip altındaki düğme satırlarına artanı
    bırakıyordu - Türkçe bir etiket ikinci satıra sardığında artan diye bir şey
    kalmıyor. Mesaj günlüğü, envanter, mağaza, depo ve zanaat penceresi artık flex
    kolon: liste kısalıyor, satırlar her zaman içeride kalıyor.
21. **Tooltipler farenin üstünde ve solunda çıkıyordu** — `tamam`.
    `#main_content` bir `zoom` taşıyor; bu, içine yazılan her uzunluğu -
    `position: fixed` bir tooltip'in `top` ve `left` değerleri dâhil - çarpıyor,
    `event.clientX/Y` ise ölçeklenmemiş görüntü penceresi pikseli olarak geliyor.
    Kenar sınırlaması ikisini doğrudan karşılaştırıyordu; tooltip'i farenin üstüne
    atlatan da buydu. Çarpan artık `--ui_scale`'den okunmuyor, bir sonda ile
    ölçülüyor: sabit konumlu ofsetlere dokunmayan bir tarayıcıda 1 ölçülür ve her
    satır eski hâline indirgenir.
22. **Beceri sekmeleri arasında gezip dönmek kaydırmayı kaybediyordu** — `tamam`.
    `changeTab` satır içi bir `display` yazıyor ve `showSkills` `block` istiyordu -
    bu da stil dosyasının flex kolonunu eziyordu, liste içerik yüksekliğine kadar
    büyüyüp sekme satırının üzerine iniyordu. Elemanın ayrıca birbiriyle yarışan iki
    `display` bildirimi vardı ve aralarında yalnızca kaynak sırası karar veriyordu;
    artık tek bildirim var.
23. **Zanaat günlüğü İngilizce konuşuyordu** — `tamam`. Üst üste iki hata: eşya
    tarifi yolu mesajını hiç metin kimliği kullanmadan birleştiriyordu, bileşen yolu
    ise kimlikleri kullanıp `getName()` geçiyordu - o da asıl İngilizce ad ve aynı
    zamanda çeviri anahtarı. Dört yeni satır, beş çağrı yerinde değişen bir erişimci.
24. **Kalite satırı nadirliği İngilizce gösteriyordu** — `tamam`.
    `Kalite: 118% [uncommon]`. `getItemRarity` bir kalite sayısını yedi İngilizce
    kelimeden birine çeviriyor, yani bu hesaplanan bir kayıt değeri; yedi satır ve
    bir etiket yardımcısı.
25. **Hayvanlar kitabı ve antoloji her şeyi kayıt anahtarıyla adlandırıyordu** —
    `tamam`, ve yanında dahası bulundu. Hayvanlar kitabı canlıları anahtarla
    listeliyordu; dövüş paneli kurt sıçanı derken kitap `Wolf rat` diyordu.
    Tooltipi etiketleri olduğu gibi yazıyordu, konum başlığı türlerini aynı şekilde,
    antoloji de kitaplarını anahtarla adlandırıyordu. İki liste sıralamayı da
    yapmıyordu: antoloji bir başlığı diğerinden çıkarıyordu - iki metin için bu
    `NaN` eder - hayvanlar kitabı ise `>` ile karşılaştırıyordu, bu da kod birimine
    göre sıralar ve şapkalı her Türkçe harfi Z'den sonraya atar.
26. **Diyalog cevabında `text not found`** — `tamam`. Bir eylemden sonra gösterilen
    cevap içerik yığınına ulaştığında zaten çözülmüş oluyor; üç tür cevabı da
    gösteren tek fonksiyon onu ikinci kez çözüyor, yani bitmiş cümleyi bir kimlik
    olarak arıyordu. Yanında bulundu: sıçan şakası bir kelimeyi değiştirmek için
    metin kimliğini boşluklardan bölüyordu, bu da hiçbir şeye çözülmeyen bir kimlik
    üretiyordu - yani %1'lik şaka cevabın bir kelimesi yerine tamamını değiştiriyordu.
27. **Hız ayarı başlamış bir eyleme ulaşmıyordu** — `tamam`. Oyun eylemini ilerleten
    zamanlayıcı periyodunu `tickrate`'ten türetiyor, ama `setInterval` kurulduğu
    andaki periyodu koruyor; yani başlamış bir eylem başladığı hızda kalıyordu.
    `set_game_speed` onu yeniden kuruyor; ilerleme tick'in kapanışında yaşadığı için
    hiçbir şey kaybolmuyor.
28. **`check-site.js` fazla büyüdü; kontroller `tests/` klasörüne ayrılsın** —
    `tamam`. Yirmi yedi kontrolü barındıran 2134 satırlık tek bir dosyaydı ve tek bir
    turda üç kontrol daha eklendi. Artık `tests/run.mjs` onları çağırıyor,
    `tests/checks/` konuya göre sekiz modülde barındırıyor, `tests/lib/` de birden
    fazlasının ihtiyaç duyduğu beş şeyi tutuyor: raporlayıcı, yollar, locale
    yükleyici, kaynak okuma ilkelleri ve eşya üreteci. `test-skills.mjs` ve
    `check-save.js` yanlarına `skills.mjs` ve `save.mjs` olarak taşındı; `scripts/`
    artık yalnızca derleme.

    Her kontrolün gövdesi olduğu gibi taşındı. Bölme şöyle yapıldı: dosya üst düzey
    birimlere kesildi, birimleri yeniden birleştirmenin özgün dosyayı geri verdiği
    doğrulandı, her birim bir modüle atandı ve import'lar her modülün gerçekten
    başvurduğu adlardan türetildi. Güvenilir kılan da sondaki karşılaştırma:
    `npm run check` eskisiyle aynı 29 satırı aynı sırada yazıyor ve kaldırılan bir
    locale satırı onu hâlâ 1 çıkış koduyla düşürüyor.
29. **`Kuroiteiken/Echoes-Beneath` reposuna bakıp alınabilecek fikirleri çıkar** —
    `tamam`. Bu repoyla aynı şekilde kurulmuş bir tarayıcı oyunu ve aynı doküman
    düzenini koruyor (`AGENTS`, `PROPOSALS`, `CHANGELOG`, her biri `.TR` yarısıyla).
    Orada olup burada olmayan yedi şey, alma sırasıyla:

    1. **`tests/probes/` ve `browser-smoke-test.js`** — sayfayı bir tarayıcıda açan
       kontroller. Bu reponun kontrollerinin hepsi kaynak metni okuyor; panel taşması,
       tooltip kayması ve kaybolan beceri kaydırmasının hepsinin sürüme girmesinin
       sebebi tam olarak bu: `style.css`'i ne kadar okursan oku, kendi kutusunun
       altında duran bir elemanı göremezsin. *Hiçbir eleman panelinin dışına taşmıyor*
       ve *tooltip farenin altına düşüyor* diyen bir prob, tek başına v0.6.22'deki üç
       hatayı yakalardı. Mevcut kontrol setindeki en büyük boşluk bu.
    2. **`docs/status.md`** — bir devir dosyası: şu andaki sürüm, commit'lenmemiş olan,
       çiğnenmemesi gereken kurallar, kayıt biçimi tuzakları, tekrarlayan hatalar, araç
       tehlikeleri ve durum simgeleriyle bir karar kuyruğu. Bu reponun bir backlog'u
       (`PROPOSALS`) ve kuralları (`AGENTS`) var, ama *durum şu anda şu ve seni şu
       ısırır* diyen bir şeyi yok. Onların dosyası bu reponun sürekli çarptığı
       tehlikeyi zaten kaydetmiş: Bash heredoc'u ters bölü kaçışlarını ve Türkçe
       şapkalı harfleri bozuyor.
    3. **`tests/fingerprint.js`** — davranış anlık görüntüsü; bir refactor'ün hiçbir
       şeyi değiştirmediğini gösterebilmek için. 28. madde tam olarak buna ihtiyaç
       duydu ve elde kuruldu.
    4. **Bir `js/systems/` bölmesi** — onlarda abilities, actions, combat, containers,
       crafting, effectors, planner, simulation var. Burada `main.js` yaklaşık altı bin
       satır, `display.js` altı bin üç yüz.
    5. **`docs/REGIONS.md`, `docs/STORY.md`, `docs/STORYPROGRESS.md`** — içerik
       tasarımı backlog'un dışında; backlog sekiz yüz satırı geçti.
    6. **`translation-expectations.tr.json`** — belirli ifadeleri sabitleyen bir veri
       dosyası. Buradaki koruma İngilizce işlev kelimelerinden oluşan bir kara liste;
       çevrilmemiş satırı yakalar ama üzerinde tartışılmış bir ifadeyi sabitleyemez.
    7. **ESLint ve bir biçim kontrolü.** Burada ikisi de yok.

    Almaya değmeyenler: kendi bundler'ları, sürüm şemaları, locale manifest'i.
30. **Dövüşte çabuk ölmek** — `tamam, ve ilk iki cevabım yanlıştı`.

    Sebep **kalkan**. `damage_dealt_to_character`, savuşturma zarını
    `if(kalkan var)` içinde atıyor ve kaçınma zarını `else`'e koyuyordu; yani kalkan
    taşımak kaçınmayı tamamen kaldırıyordu. `base_block_chance` 0.75 olduğu için
    başlangıç kalkanı saldırıların dörtte üçünü "kalkanın gücü kadar azaltıldı"ya
    çeviriyor - `Ucuz ahşap kalkan` için 1.6 hasar - kalan dörtte biri de, aksi hâlde
    çoğunu savuşturacak bir karaktere bedava tam vuruş olarak veriyordu. Karşılaştığı
    hasardan zayıf bir kalkan böylece hiç taşımamaktan kesinlikle daha kötüydü;
    kalkanı çıkarmak da bunu kanıtladı. Artık savuşturulamayan bir saldırı kaçınma
    zarına düşüyor; savuşturulan düşmüyor, çünkü o kalkana çarpmış oldu.

    İki yanlış dönüşü de kaydediyorum; ikisi de kendinden emindi ve ikisi de doğru
    değildi. İlk olarak bu turda dövüşe dokunan bir şey olmadığını söyleyip orada
    bıraktım - diff hakkında doğru, cevap olarak işe yaramaz, çünkü hata diff'ten
    eskiydi. Sonra `Savunma: 0.0`'ı okuyup `Math.ceil` yüzünden takılı her parçanın en
    az 1 vermesi gerektiğini, dolayısıyla yuvaların boş olması gerektiğini savundum.
    Aritmetik doğruydu, sonuç yanlıştı: bir sonraki ekran görüntüsünde altı parça
    takılıydı. İşi çözen şey, sahibin parçaları tek tek çıkarıp değişkeni
    yalıtmasıydı - şablonlardan akıl yürütmek yerine iki cevap önce istemem gereken
    şey buydu.
31. **Dışa aktar düğmesi hiçbir şey yapmıyordu** — `tamam`. `btoa`, U+00FF üstündeki
    her karakterde istisna atıyor ve dört Türkçe harf orada yaşıyor: ş, ğ, ı, İ. Kayıt
    dosyası, günlük yenilemeden sağ çıkmaya başladığından beri mesaj günlüğünü
    taşıyor; yani oyuncuya gösterilen ilk Türkçe cümle her dışa aktarmayı patlatıyordu
    - bir onclick içindeki istisna da sessizdir. Bu hata benim ve günlük kalıcılığıyla
    birlikte geldi. `to_base64` / `from_base64` önce UTF-8 bayta çeviriyor, eski
    aktarmalar yine yükleniyor (çünkü biri ancak saf ASCII'den üretilebilirdi) ve
    ham çifti yeniden çağıran olursa derleme artık düşüyor.
32. **`factor hello` ve cevabı çeviri gibi okunuyor** — `tamam`. İki ipucu. "You are
    not with the gate?" "Kapıyla birlikte değil misin?" olmuş - kapıyla beraber
    değil misin. Türkçe burada ayrılma hâli kullanır ve mubayaacının cevabı zaten
    kullanıyor ("Ben loncadanım"), o yüzden soru artık onu yansıtıyor: "Kapıdan
    değil misin?". Bir de "a man with scales", "terazi taşıyan bir adamı muhafız
    sanan dördüncü kişisin" olmuş: tek isim üzerine yığılmış iki sıfat-fiil -
    dilbilgisinin izin verdiği, yazının kullanmadığı bir şey. Kısa cümleler, sonda
    vurgu: "Masamda terazi var, sen muhafız sanıyorsun. Bugün dördüncüsün."
33. **Milestone'ları tükenen beceriler için yenileri** — `bitti`, v0.6.37. Sonraki bir
    talimatla kapsam düşük-max becerilerden 20'nin üstündeki her beceriye
    genişletildi, beşer seviye: 45 beceri, 275 milestone; her biri o becerinin kendi
    sözlüğünden, biriminden, temposundan ve tavanlarından üretildi. Hiç milestone'u
    olmayan 15 beceri kapsam dışı. Aslen: Okuryazarlık 10.
    seviyede duruyor ve milestone'ları 5'te bitiyor, yani çubuğun ikinci yarısı hiçbir
    şey vermiyor. Bu şekildeki her beceriyi bul - düşük bir max_level'a karşılık çok
    önce biten bir milestone listesi - ve eksikleri yaz. 64 becerinin 49'unda milestone
    var; mesele hiç olmayan on beş tanesi değil, olanların kuyruğu.
34. **Merge'ü yap, sonra sonucu upstream'e öner** — `etkin`. Upstream'den alınabilecek
    olanı al - sonradan ekleyecekleri de dâhil - ama kendi işimizi ezmeden; sonra
    mevcut kodu katkı olarak onlara gönder, isterlerse alsınlar. Bu, sahibe sunulan (A)
    yolu ve artık kalıcı öncelik: kararı verdiren ölçüm şu - upstream'in yeniden
    yazdığı dosyalarda hata düzeltmeye devam ettikçe merge büyüyor; ilk ölçümde 191
    çakışma bloğu, altı sürüm sonra 222. Aynı aralıkta GameAction taşıması amaçlandığı
    gibi işledi (sil/değiştir çakışması 4 -> 3), yani yön doğru; maliyet zaman, kuşku
    değil.
35. **Echoes-Beneath'e yalnızca araçlar için değil, HİKÂYE ve OYNANIŞ için bak** —
    `yapılacak`. İlk inceleme araç sorusunu cevaplayıp sorulan soruyu kaçırdı. İstenen:
    alınmaya değer mekanikler ve anlatı araçları - örnek olarak **unvan sistemi**
    verildi. Onların `js/systems/` klasöründe bu oyunda hiç olmayan abilities,
    effectors, planner ve simulation var; docs'unda da REGIONS, STORY ve iki
    STORYPROGRESS dosyası.
36. **Lore paneli ne işe yarayacak** — `bitti`, v0.6.51, ve bu P-13/1'i keskinleştiriyor.
    Oyuncunun sorduğu soruları ve aldığı cevapları tutacak, böylece hikâye
    hatırlanmak yerine takip edilebilecek; ve yönlendirecek - bir hafta sonra dönen
    oyuncu neyin ortasında kaldığını bilerek dönmeli. Döküm değil: ipi taşıyan kısımlar.
37. **Duruş tooltip'indeki eksik stat adı** — `bitti`, v0.6.34. Cinnet yürüyüşü "x1.2
    text not found, id: hit_chance" yazıyordu. Merge sırasında upstream'de görülüp
    "bizde karşılığı var" varsayımıyla atlanan dört satırdan biri; yoktu. Satır olarak
    değil aile olarak kapatıldı: check_enumerable_id_families stat etiketlerini artık
    display.js'in bir stat anahtarını gerçekten okuduğu beş yerden türetiyor;
    character.base_stats'tan bilerek türetmiyor, çünkü orada oyunun hiç göstermediği beş
    stat adlandırılmış, bu ise adlandırılmamıştı.
38. **Duruşu favorilemek hata veriyordu** — `bitti`, v0.6.35. "getName is not a
    function": hızlı seçim çubuğuna registry gerekirken hangi duruşların yıldızlı olduğu
    haritası veriliyordu. Parametre düzeltilmek yerine kaldırıldı; artık yanlış
    geçirilecek bir şey yok.
39. **Geliştirici konsolu kalite ve adet verebilmeli** — `bitti`. `give` ikisini de şekil
    olarak zaten alıyordu ve ikisi de belgelendiği gibi çalışmıyordu: kalite paylaşılan
    şablona yazılıyordu, getInventoryKey() ise önbelleğe aldığı için anahtara hiç
    ulaşmıyordu. Ölçüldü: demircinin verdiği beş başlangıç silahı kalite 50 istiyor ve
    100 olarak geliyordu - içeriğin 79/100/144 diye fiyatladığı yerde 157/200/290. Yani
    yalnızca konsol eksiği değil, canlı bir içerik hatası. InventoryHaver'ın hâlihazırda
    kullandığı yolla düzeltildi; beş test ve hiçbir yerin şablona kalite yazmamasını
    denetleyen bir kontrol eklendi.
40. **İşlenmiş dev konsolu örnekleriyle bir doküman** — `bitti`,
    [DEV_CONSOLE.TR.md](DEV_CONSOLE.TR.md) ve İngilizce eşi. 23 ödül anahtarının tamamı,
    her birinin istediği şekille, kalite tablosu ve diğer fonksiyonlar. İçindeki her ad
    hafızadan yazılmak yerine registry'lere karşı doğrulandı.
41. **"Gathering mastery" "Çırak toplayıcı" olarak okunuyor** — `cevaplandı`, ve bu bir
    çeviri hatası değil. Bir becerinin seviyeye göre anahtarlanmış `names` haritası var,
    yani gösterilen adı rütbe atladıkça değişiyor - İngilizce oyuncu da 10. seviyede
    "Apprentice gatherer" okuyor, Türkçesi de o unvanın doğru karşılığı. P-13/35 için not
    edilmeye değer: bu rütbe sistemi, Echoes-Beneath'ten istenen unvan mekaniğinin
    büyük kısmı zaten. Raporun gerçekten ortaya çıkardığı şey ise gerçek ve düzeltildi:
    kilometre taşı listesinde iki sabit İngilizce cümle vardı ve birinin içindeki beceri
    registry anahtarıydı; o yüzden Uyku tooltip'i, hemen yanında "Meditasyon" yazan bir
    satırın altında `Unlocked skill "Meditation"` diyordu.
42. **Aktarılabilecek olanların bir kısmı değil tamamı** — `saptanabilir olan için
    bitti`. `contribute/upstream-fixes` artık 14 commit taşıyor; her biri upstream'in
    kendi koduna ve üslubuna göre yazılmış, her biri kuşkulanılan değil ölçülen bir
    kusur, ve her biri tek başına atılabilir: `src/` içinde on iki hata düzeltmesi, bir
    derleme düzeltmesi (`build.js` sürüm damgasını basamadığında 0 ile çıkıyor, yani
    hiçbir tarayıcının çekmeyeceği bir paket başarılı derleme olarak raporlanıyor - ve
    orada `dist/` commit ediliyor) ve isteğe bağlı, bağımsız bir paket-yükleme kontrolü.

    Küme nasıl tahminle değil kapanışla belirlendi: kontrol takımımız onların ağacına
    yöneltildi - kontrollerimiz zaten bunun için, her biri bulduğumuz bir hata sınıfını
    kodluyor. Kaynak düzeyindeki kontroller onların kodunda artık başka bir şey
    bulmuyor. İki bulgu düzeltme değil yazar kararı gerektirdiği için rapor olarak
    bırakıldı: gaze aksiyonunun sıfır şanslı başarı metni, ve düzeltilmesi kendi
    yorumlarının beklemede olduğunu söylediği gümüş hattını açacak olan yanlış yazılmış
    `action:` ödül anahtarı. Gerçek gibi görünen bir bulgu ise değildi: 21 tanelik
    "koşulsuz conditional_loss" isabeti yanlış alarm sınıfı, çünkü kontrolümüz
    `conditions` arıyor, onların alanı `success_conditions`.

    Aktarılamayanlar ve nedeni: çeviri katmanı (onlar İngilizce-only, ve bu bir düzeltme
    değil mimari), kendi içeriğimiz ve kanonumuz, ve kendi işaretlememize ile onlarda
    olmayan `zoom` özelliğine bağlı arayüz işi.

    **PR [#241](https://github.com/miktaew/yet-another-idle-rpg-dev/pull/241) açık** - 14
    commit, 7 dosya, +349/-48, birleştirilebilir. Kaydedilmeye değer bir şey daha,
    çünkü yerleşik bir varsayımı tersine çeviriyor: upstream **ölü değil**. `master`
    ve `refactoring` dallarının ikisi de 2026-08-27'de push edilen `19011a0`'da ve
    bizim master zaten onu içeriyor - yani alınacak yeni bir şey yok, ama
    gönderilecek biri var.
43. **Bestiary bir yaratığın nerede çıktığını söylemeli** — `bitti`, v0.6.48. Yaratığın ne
    olduğunu ve ne düşürdüğünü listeliyor, ama oyuncunun ona genelde baktığı asıl şeyi
    söylemiyor. Veri mevcut: her dövüş bölgesi düşman gruplarını bildiriyor, yani ters
    dizin yazılmak yerine kurulabilir.
44. **Lore panelinin yanına keşfedilen eşyalar sayfası** — `bitti`, v0.6.49; arama v0.6.51'de eklendi. Oyunun tepesine,
    lore ile aynı aileden yeni bir mini sayfa: oyuncunun gerçekten bulduğu her şey -
    haritadan toplanan, yaratıktan düşen, satın alınan - nereden geldiğiyle birlikte ve
    geldiği bölgeye götüren bir butonla. Katalog değil keşif: oyuncu oynadıkça doluyor,
    açmaya değer kılan da bu.
45. **Rütbesi olmayan beceriler için rütbe adları** — `bitti`, v0.6.41. 49 beceri merdiven
    kazandı, yani 64'ün 58'i artık rütbe atlıyor; altı duruş becerisi dışarıda
    bırakıldı, çünkü bir duruş becerisinin adı çalıştırdığı duruşun kimliği. Aslen: Dokuz beceri seviye
    atladıkça kendi adını değiştiriyor - Unarmed > Brawling > Martial arts, Tough skin >
    Wooden skin > Stone skin > Iron skin, Beginner > Apprentice > Adept > Expert > Master
    gatherer - 55'i değiştirmiyor. Eklenebilen her yere bu ilerleyişi ekle; yani iki
    dilde de tırmanılacak gerçek bir merdivenin olduğu yerlere, yalnızca eşanlamlının
    olduğu yerlere değil. Her rütbenin iki locale'de de `name X` satırı gerekiyor ve
    Türkçesi gerçekten kullanılacak bir unvan gibi okunmalı.
46. **Düzeltmeler değil geliştirmeler için ikinci bir PR** — `bitti`. PR
    [#242](https://github.com/miktaew/yet-another-idle-rpg-dev/pull/242): geliştirici
    konsolu ve hız çarpanı, her çubuğun tepesine kadar beş seviyede bir milestone, ve
    kuşanılanla kıyaslama.
    [#241](https://github.com/miktaew/yet-another-idle-rpg-dev/pull/241)'den bilerek ayrı
    tutuldu - o kusurlar, bu eklemeler; ayrı cevapları hak ediyorlar. Her commit tek
    başına duruyor. Onların Forging'i milestone işinin dışında bırakıldı: tek ödülü bir
    tarif kilidi, yani sürdürülecek bir sözlük yok ve uydurmak dengeyi uydurmak olurdu.
47. **Tarayıcısız yükleyici üç içerik modülüne erişemiyor** — `yapılacak`, ve bu bir dilek
    değil yetenek eksiği. tests/lib/browser-free-src.mjs bir modülü main.js ve display.js'i
    stub'layarak gerçekten yüklüyor; enemies.js, traders.js ve data/locations.js ise
    "Cannot access 'is_rat' before initialization" ile ölüyor - döngünün yanlış giriş
    noktasıyla değerlendirilmesinden doğan bir TDZ hatası. Her çağrı kendi geçici grafiğini
    kurduğu için önce items.js yüklemek işe yaramıyor. Maliyeti somut: Keşifler indeksi
    trader.inventory_template'i liste sandı, oysa anahtar; ve hiçbir test bunu yakalayamazdı
    çünkü hiçbir test bir tüccar kuramıyor. Çözüm, main.js'in kendi sırasıyla içe alan tek
    bir giriş modülü üretip hedefi onun üzerinden değerlendirmek.
48. **Büyük dosyaları bölmek** — `sürüyor`, ve asıl mesele ölçümler. İki kesit yapıldı,
    kalanların maliyeti tahmin edilmedi, hesaplandı. Bir kesit iki sayıyla yargılanıyor:
    taşınan kod kalandan kaç ad istiyor, ve kalan koddan kaç ad geri isteniyor. Pahalı
    olan ikincisi - o, zaten yük taşıyan bir döngünün giriş noktasına doğru bir import'a
    dönüşüyor.

    Yapıldı: **crafting.js** (357 satır, 4 giren / 0 çıkan) ve **run_stats.js** (on koşu
    sayacı; önce onların çıkması gerekti, çünkü içe aktarılmış bağ salt okunur ve
    use_recipe ikisini artırıyor). Ardından aynı gerekçeyle display.js tarafında
    **ui_helpers.js** (9 fonksiyon). main.js 6606 -> 6279.

    Hesaplandı ama YAPILMADI, gerekçesiyle:

      * `process_rewards` (365 satır) main.js'ten 20 ad istiyor ve rewards.js ile
        quests.js'i doğrudan iki modüllük döngüye sokardı - v0.6.27'yi bozan şekil. Önce
        `questManager`'ın registries.js üzerinden yayımlanması gerekir.
      * save/load (1821 satır, main.js'in %29'u) 60 ad istiyor ve neredeyse hepsi bu iki
        fonksiyonun okuyup yazdığı modül durumu. run_stats.js kalıbı genelleşiyor: o
        durumu tutan bir `game_state.js` yaprağı 60'ı sert biçimde düşürür. En büyük
        ödül, en büyük hazırlık; dikkatsiz yapılırsa kayıt biçimi riski.
      * bestiary + Keşifler'in display.js'ten çıkarılması (389 satır) artık 5 giren / 1
        çıkan - tek geri-bağ, görev ipuçlarının da kullandığı `create_travel_line`. İpucu
        render'ını da taşımak ihtiyacı `create_quest_step_hint`'e kaydırıyor ve zincir
        görev günlüğüne uzanıyor. Sıradaki hazırlık, günlüğün ortak render'ının nerede
        duracağına karar vermek.

    Güvenlik ağı kuruldu: `check_onclick_names_are_reachable`. Bir onclick, tıklama anında
    global nesneye karşı çözülen bir dizgedir; yani `window.` atamasını kaybeden bir
    fonksiyon yalnızca orada patlar - derlemede değil, kontrolde değil, paket testinde
    değil. 81 ad var ve atamaların 89'u main.js'te.

    Zor yoldan öğrenilen bir kural: yeni bir import, main.js'in import listesinin SONUNA
    gider. Tarayıcısız test yükleyicisi tarayıcının değerlendirme sırasını yeniden üretmek
    için o listeyi taklit ediyor; crafting.js'i başa koymak character.js'i items.js'ten
    önce çekti ve beş kontrolü bozdu. Paket her iki hâlde de sorunsuzdu.

49. **Yükleyici yarı yolda duruyordu** — `bitti`, v0.6.55. "Görevler tamamen
    bozuldu, boş geliyor" diye bir ReferenceError'la, ayrıca favorilenen yerlerin hızlı
    yolculuktan kaybolduğu şeklinde bildirildi. Tek sebep: kaydetme/yüklemeyi kendi
    dosyasına taşımak `effect_templates`'i içe aktarılmamış bıraktı; esbuild çözülmemiş
    bir adı çalışma zamanı genel değişkeni saydığı için derleme ve bütün kontroller
    geçti, hata yalnızca yüklemede çıktı. `load()` içinde o satırdan sonraki her şey —
    favoriler dâhil — hiç çalışmadı. Sahibinin gerçek kaydıyla tarayıcıda
    doğrulandı: yedi görev çiziliyor, iki favori de geri geliyor.
50. **Yatak ve dövüş konumları kalıcı olmuyordu** — `bitti`, v0.6.55. Bildirilmedi;
    49'u ölçerken bulundu: aynı ayrım `last_combat_location`'ı her yerde
    `game_state.last_combat_location` yaptı ve bu, tırnak içindeki iki **kayıt
    anahtarının** içine kadar uzandı. Kayıt, yükleyicinin okumadığı bir adla yazdı,
    değer boş döndü, sonraki kayıt da anahtarı dosyadan düşürdü. Ancak sahibinin günler
    arayla aldığı iki dışa aktarma karşılaştırılınca ortaya çıktı. Kayıt anahtarı, hâlihazırda
    var olan kayıtlarla yapılmış bir sözleşmedir; bkz. D-8.
51. **Satır sonları `.gitattributes` ile sabitlendi** — `bitti`. `* text=auto`,
    çalışma kopyasındaki satır sonunu her katılımcının `core.autocrlf` ayarına bırakıyordu;
    sonuçta tamamı LF olan bir indekse karşı 64 dosyası CRLF, 10 dosyası LF çıkarılmış bir
    ağaç oluştu ve commit'ler "LF will be replaced by CRLF" yazdı. Artık
    `.js/.mjs/.json/.css/.html/.md/.yml` için `eol=lf`. CRLF ile commit edilmiş tek dosya
    olan `tests/checks/content.mjs` bu sırada normalleştirildi.
52. **Bir ajanın başlayabileceği durum belgesi** — `bitti`.
    [STATUS.md](STATUS.md): oyunun nerede olduğu, mimarinin gerçekte ne olduğu, hangi
    kısıtların can yaktığı ve nelerin sürdüğü. Geçmişi olmayan bir ajana verildiğinde
    yetecek şekilde yazıldı.
53. **Belge çifti kontrolü** — `bitti`. D-3, her belgenin `NAME.md` ve
    `NAME.TR.md` olarak çift geldiğini söylüyor ama bunu zorlayan bir şey yoktu; çeviri
    sessizce geride kalabiliyordu — bayat bir Türkçe dosya, artık doğru olmayan
    paragrafa gelene kadar gayet iyi okunur. `check_docs_are_paired` artık eşin var
    olmasını, `doc-source` olarak İngilizce dosyayı göstermesini ve aynı `doc-version`'ı
    taşımasını şart koşuyor. Yedi çift. Türkçenin İngilizceyle aynı şeyi söyleyip
    söylemediğini denetleyemez; o D-7'nin işi.
54. **Hikâyeyi sürdür, yeni alanları bağla** — `sürüyor`. v0.6.57, kenar mahalleyi
    kasaba kapısına bağladı; oyunun ikisi arasında kurduğu ilk geçiş bu. Bölgelerin geri
    kalanı hâlâ hikâyenin içinde değil, yanında duruyor. Motor toparlanırken
    anlatı işine ara verilmiyor: inşa edilen bölgelerin hikâyenin yanında durmak yerine
    hikâyeye bağlanması gerekiyor.
55. **Kasabayı genişlet ve hareketlendir** — `bitti`, v0.6.57 ve v0.6.58. Kenar mahalle
    bir aktivite ve sıfır aksiyondan üçe çıktı; kasaba meydanı ise hiçten üçe. Meydandakiler
    yeni mobilya değil, zaten oradaki ambiyanstan kuruldu: çeşmedeki güvercinler, gazete
    tellalı, birbirine bayat diyen iki ekmekçi. İkisi de tarayıcıda doğrulandı - kapı ve
    etiketler. Hiç yokken altı yerleşim aksiyonu. Oyuncunun en çok vakit
    geçirdiği yer başlangıç yerleşimi ve içinde en az şey olan yer de orası. Daha çok
    yapılacak şey, daha çok görülecek şey, geri dönmek için daha çok sebep.
56. **İtibar yeni aksiyon ve konuşmalar açsın** — `bitti`, v0.6.57, aksiyonlar için.
    Önce ölçüldü: 610 Köy / 350 Kenar mahalle / 320 Kasaba itibarı kazanılabiliyor, dört
    diyalog satırı buna bakıyor, hiçbir aksiyon bakmıyordu ve Kenar mahalleyi bir tüccarın
    kâr payı dışında **hiçbir şey** geri okumuyordu. Üç aksiyon artık 100 / 200 / 300'de
    kapı tutuyor; tarayıcıda iki yönden de doğrulandı. İtibara bağlı konuşmalar zaten
    vardı (dört satır) ve olduğu gibi bırakıldı. v0.6.59, asıl eksik olan yarıyı ekledi:
    arkasında görev de kilit açma da olmayan, **yalnızca** itibarla açılan iki satır -
    meydandaki komisyoncunun bir itibara da buğdaya biçtiği gibi fiyat biçmesi ve yaşlı
    kadının nöbet listesinin ne ettiğini değil neye mal olduğunu söylemesi. İkisi de eşiğin
    altında gizli, üstünde açık olarak doğrulandı ve ikisi de lore paneline düşüyor. Kasaba, içinde
    kurulan itibara tepki vermeli: itibar yükseldikçe yeni aksiyonlar ve yeni
    konuşmalar açılmalı ki mekân sabit bir fon olmaktan çıkıp oyuncuyla değişsin.
57. **Dev konsolu için `add_best_effect`** — `bitti`, v0.6.56. `give_best`'in eşi:
    olumlu etkilerin tamamını — Spark of inspiration, Coffee, Well hydrated ve
    diğerleri — tek tek adlandırmak yerine istenen süreyle uygulayan tek komut.
    Hangi etkinin olumlu sayıldığı elle listelenmeyip şablonlardan türetilmeli; yoksa
    liste, yeni bir etki eklendiği anda çürür.
58. **Değişiklikler biriktiğinde uyanı yukarı akışa gönder** — `sürekli`. Bir şey teklif
    etmeden önce ölçüldü, çünkü bir turun işinin çoğu forka özgü: kontroller upstream'de
    olmayan bir `tests/` çatısına dayanıyor ve `effect_templates` bizim refaktörümüzün hatasıydı,
    onların değil. Uyan tek şey `add_best_effect`'ti; zaten PR #242'de duran dev konsolunun
    yanına ait olduğu için üçüncü bir PR yerine oraya dördüncü commit olarak gitti.
    Önce upstream'in kendi ağacında denendi: 22 buff uygulanıyor, aralarında zehir yok.

    Ölçülüp gönderil**meyen**: aksiyon düğmesi etiketi düzeltmesi. Upstream'de aynı yapı var
    - `action_name || starting_text` ve düğme `starting_text` çiziyor - ama onların etiketleri
    zaten kısa; oradaki etkisi, üç karınca yuvası aksiyonunun tek bir düğme etiketini
    paylaşması ve ayırt edici adlarının kullanılmaması. Bu bir hatadan çok metinlerine dair
    tartışmaya açık bir iyileştirme ve kararı bizim değil.
---
## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar.

### Q-1 — Bu fork içerik olarak ayrışacak mı? **GÜNCELLENDİ: içerikte ayrış, kodda yakınlaş**

Yeni bölgeler, item'lar ve dialogue eskisi gibi kapsam dahilinde. Değişen şey
ikinci yarısı: **upstream terk edilmiyor.** Ondan alınmaya değer olanı al, kodu
iki yönde de merge edilebilir tut ve bu yolda hiçbir şeyi bozma. Biten sonuç
upstream'e pull request olarak geri gidecek.

İlk karar merge-dostluğunun artık bir hedef olmadığını söylüyordu. Yeniden hedef.
Pratik sonuçları:

- Bizim yapacağımız bir refactor, upstream'in bir düzeni olduğu yerde ona *doğru*
  gitmeli, ondan uzağa değil. Upstream'in `19011a0` commit'i `src/models/`,
  `src/components/` ve `src/data/` diye bölmüş; bizim `main.js` bölmemiz de üçüncü
  bir düzen icat etmek yerine aynı şekle oturmalı.
- Upstream'den gelen bir değişiklik, artık senkron olmadığımız için atlanmak
  yerine değerine göre değerlendirilip alınmaya değerse alınır. Upstream'in
  `19011a0` için kendi changelog'u, refactor'ün yanında altı ayrı iyileştirme
  sayıyor ve bunlar refactor'den bağımsız olarak taşınabilir.
- Merge edilebilirliğe ulaşmak için vazgeçilemeyecek tek şey çeviri katmanımız.
  Kayıt anahtarları İngilizce kalıyor, çünkü kayıt verisi (Q-2) ve hiçbir taşıma,
  artık bir metin kimliğinin durduğu yere oyuncunun göreceği sabit bir metni geri
  koyamaz. İkisi çatıştığında çeviri katmanı kazanır, taşıma uyarlanır.
- Q-5 (`dist/` takipten çıkarma) geçerliliğini koruyor. Hiçbir yanı ayrışmaya
  bağlı değildi: deploy iş akışı her hâlükârda kendi paketini derliyor.

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
