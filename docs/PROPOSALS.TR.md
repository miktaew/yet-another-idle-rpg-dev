<!-- doc-source: docs/PROPOSALS.md  doc-version: 73 -->

> **Kanonik dosya: [PROPOSALS.md](PROPOSALS.md).** Bu çeviri bilgilendirme
> amaçlıdır. Çelişki hâlinde İngilizce dosya geçerlidir.

# Öneriler ve İş Listesi

Bu fork'un çalışma listesi. Proje sahibinden gelen her direktif burada
numaralanmış bir öneri olarak kayda geçer, tamamlanana kadar izlenir, neyin
gerçekten değiştiği açıklanarak [CHANGELOG.TR.md](CHANGELOG.TR.md) dosyasına
aktarılır ve sonra bu dosyadan çıkarılır. Geriye kalan, hâlâ açık olandır — bir
çalışma listesinin varlık sebebi de budur. Numaralar asla yeniden atanmaz; yani bir
boşluk tamamlanmış bir öneridir ve onu anan commit'ler ile changelog girdileri hâlâ
karşılığını bulur.

**Durum etiketleri**

| Durum | Anlamı |
| --- | --- |
| `done` | Gönderildi, doğrulandı, `CHANGELOG.md` içinde açıklandı ve **buradan çıkarıldı**. |
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

**Yalnızca `docs/` değil, depodaki her markdown dosyası denetlenir.** Her biri bir
`doc-source` ve `doc-version` başlığı taşır, çiftin iki yarısı aynı sürümde olmak
zorundadır ve her göreli bağlantı var olan bir dosyayı göstermelidir.
`check_docs_are_paired` hepsini kapsıyor - Türkçe eşi olduğu hâlde birinin geride
kaldığını anlamanın hiçbir yolu bulunmayan kök `AGENTS.md` ve `README.md` dâhil.
Dışarıdan alınmış üçüncü taraf markdown'ı kapsam dışı; onu bu kurala tabi tutmak
bize düşmez.

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

### D-9 — Oyun içi changelog oyuncu içindir

`changelog.html` ve `changelog.tr.html` oyunun içinde okunur. Oyuncunun görebileceği
şeyleri taşırlar: içerik, karşılaştığı hatalar, arayüz davranışı. **Bakım işleri onlara
girmez** — bölünen bir dosya, yeni bir kontrol, adı değişen bir içe aktarma oyun
oynayan biri için haber değildir; tek değişikliği bunlar olan bir sürüm orada hiç
görünmez.

O iş yine de kaydediliyor: geliştirici tarihçesi olan ve gerekçeyi tam derinlikte tutan
[CHANGELOG.md](CHANGELOG.md) içinde. `check_changelogs_cover_version` iki kuralı
birlikte uyguluyor: gönderilen bir sürüm ya birinde ya ötekinde yazılmış olmalı, hiçbirinde
değil olamaz.

### D-6 — Doğrudan varsayılan branch'e push

Commit ve push doğrudan varsayılan branch'e yapılır (bugün `master`, ileride
`main` hedefleniyor). İstenmedikçe feature branch veya pull request açılmaz.
Pages deploy'u yalnızca varsayılan branch'te tetiklendiği için yan bir branch
deploy'u sessizce atlar.

---

## Öneriler

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

15. **Her talebi buraya kaydet** — `sürekli`. Bu bölümün kendisi o kuralın
    uygulanması.

58. **Yukarı akışla iki yönlü alışveriş** — `sürekli`; P-13/34'ü de içine alıyor.
    **Alma:** upstream 2026-08-30'da temmuzdan beri ilk kez kımıldadı ve üç commit'inin de
    kaynağı bizim PR'ımız — ikisi adıyla bizim, üçüncüsü onların yeniden üsluplandırması.
    Alınacak bir şey yoktu: farkları, kendi kodumuzun onların ev üslubuyla yazılmış hâli;
    birleştirmek dört dosyada çakışırdı ve stratejinin dışladığı tek şeyi yapardı, kendi
    işimizin üstüne yazardı. Her kımıldadıklarında yeniden ölçülecek.
    **Verme:** bir şey teklif
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

    Dava düzgün ölçülünce yine de açıldı, **PR #243** olarak: kilit-açma mesajları zaten
    `action_name` okuyor, yani günlük bir aksiyonu düğmenin hiç göstermediği bir adla
    duyuruyor. Bu, sözcük tercihi değil kendi kodlarındaki bir tutarsızlık. Animasyonun
    null koruması da onunla gitti; savunmacı olduğu açıkça yazılarak - aynı korumasız
    erişim onların ağacında da var ama oraya giden bir yol olduğunu kanıtlayamadım.
    Geride kalan: bütün kontroller; çünkü onlarda ne `tests/` var, ne `package.json`,
    ne de birini asacak bir koşucu.


### P-14 — v0.7, Marrowmoth `active`

Sıradaki arc ve bu fork'un miras aldığı bir kancaya değil, kendi bıraktığı bir
kancaya yazdığı ilk arc. Aşağıdaki, proje sahibinin briefinin kod üzerinde
ölçülmüş hâli; briefin tekrarı değil.

**Kullanabileceği kanon, bir fazlası değil.** Kırk ton; cezirle çıkış; tartılmamış
tek sandık; hesap sütununa iki kez çekilmiş çizgi; yılda iki kez dönüş; saymanın
haber göndermeyecek olması. Altısı da hâlihazırda
`action read the departures success` içinde ve [STORY.TR.md](STORY.TR.md)
bölüm 1b'de duruyor.

**Çözmeyeceği şeyler.** Soygunun parasını kimin verdiği; neden o yolcunun; alınan
objenin nereden geldiği; kahramanın ona neden sahip olduğu; köyün altındaki yapı;
Rat God; sürgün kabile; dört ayaklı kuş. **Tek katman, bir kez** — arc, sandıkla
çalınan objenin aynı elden çıktığını gösterebilir, o elin kime ait olduğunu
söyleyemez.

**Planlamadan önce ölçülenler**, v0.6.71'de dört kapı da yeşilken:

- Körfez üç yerden ibaret — The bay, The salt house, Coast road — ve **tek** bir
  aksiyonu var: Perception 15 / 34'e bağlı `read the departures`. Sayıca oyunun en
  ince bölgesi olması bilinçli; arc onu beşinci bir bölgeye şişirmemeli.
- Reputation'ın tam olarak üç bölgesi var: `Village`, `Slums`, `Town`. **Lonca
  itibarı yok**; oysa 3. questin üç yollu tasarımı onu varsayıyor. Bkz. Q-7.
- Discoveries *eşyaları* nereden geldiklerine göre indeksliyor; Lore ise *duyulmuş
  textline'ları* konuşana göre grupluyor. İkisi de bir soruşturma notu tutamaz.
  Bkz. Q-8.
- `conditions.js` zaten `season` okuyor; `game_time` günü, mevsimi, haftanın gününü
  ve ay evresini taşıyor. Yılda iki kez gelen bir teknenin zamanlayıcıya ihtiyacı
  yok. Bkz. Q-10.
- Bir tüccarın stoğu `inventory_templates[this.inventory_template]` üzerinden
  **yenilenme anında** okunuyor ve `inventory_template` kayda yazılmıyor. Dolayısıyla
  tekne limandayken değişen bir stok, saklanarak değil **türetilerek** kurulmalı;
  aksi hâlde oyuncunun bir sonraki oturumunda sessizce eski hâline döner ve hiçbir
  şey hata vermez.
- Burada bir kontrolü taşıyabilecek, gerçekten var olan skill'ler: Perception,
  Presence sensing, Spatial awareness, Climbing, Swimming, Equilibrium, Literacy,
  Haggling, Medicine. **Lockpicking diye bir skill yok, navigation diye de.** Tek bir
  kapı için birini eklemeyin.
- `Enemy` zaten `on_hit`, `on_damaged` ve `on_death` alıyor ve dört düşman bunları
  kullanıyor. Stance kararını anlamlı kılacak düşmanların ihtiyaç duyduğu yeniden
  kullanılabilir soyutlama budur; ikincisine gerek yok.
- Tier 5'i tıkayan şey adlandırma değil, tarifler — ve ölçülene kadar P-12 bunun
  tersini söylüyordu. Üretici 36 white-steel ve black-steel bileşeni kuruyor, hiçbir
  şey bunların hiçbirini üretmiyor ve locale satırları en başından beri yerinde.
  Sayıyı `check_components_can_be_made` tutuyor: üretilen 203 bileşenin 159'una
  ulaşılabiliyor, 44'üne ulaşılamıyor ve o 44'ün 36'sı bu.

#### Fazlar

Her faz kendi başına yayınlanır, `build` + `LOCALE_STRICT=1 check` + `test` +
`check:bundle` kapılarından geçer ve her iki changelog girdisini alır. Bir önceki
faz yeşile dönmeden sonraki başlamaz.

**Faz 0 — zemin.** `bitti`. Hikâye yok; dört maddesinin üçü koddan çok kaydın
kendisiyle ilgili çıktı — zemin fazı zaten bunun için var.

- **Q-7 ile Q-10 cevaplandı ve taşındı.** Her biri aşağıda
  [Fazlara taşınan kararlar](#fazlara-taşınan-kararlar) altında, onu harcayan fazın
  karşısında duruyor. Bu önerinin
  [Bekleyen kararlar](#bekleyen-kararlar) bölümünde beklediği bir şey kalmadı.
- **Yanılan dosya STATUS'tü.** 48. madde de P-13/35 de kapanmıştı ama hâlâ "devam
  ediyor" listesindeydi; bu da okuyanı, iş listesinde bulunmayan önerilerin peşine
  düşürüyordu.
- **İpucu göstermeyen iki quest task'ı yeniden üretilemedi.** Kaynaktan değil,
  sahibin kendi export'larından ölçüldü: açık her questin güncel task'ı adı olan tek
  bir yere çözülüyor. Raporun altındaki asıl boşluk gerçekti ve onu artık
  `check_hints_say_when_they_cannot_point` tutuyor.
- **Eksik iki malzeme satırı eksik değil.** Üretici `material name white steel` ve
  `material name black steel` istiyor; ikisi de iki dilde de yerinde duruyor. Tier
  5'i tıkayan şey bir isim değil, hiç var olmayan tariflerin kendisi.

Muhafız: bir tane, planda yoktu ama D-8 gereği borçtu. Kaydı düzeltirken kaydın
kendisinde bir kusur çıktı — P-14'ün son cümlesinin hemen altına yazılmış bir `---`,
ki markdown bunu o cümlenin üstüne çekilmiş setext başlığı olarak okuyor — bu yüzden
`check_thematic_breaks_are_not_headings` o satırı değil sınıfı, izlenen bütün markdown
dosyalarını okuyarak koruyor. Sonraki fazları ölçülebilir kılan faz buydu; bunu da
hatırlanan üç bilginin yerine ölçülmüş üçünü koyarak yaptı.

**Faz 1 — v0.7.0, *No Word Sent*.** `bitti`. Üç yüzey Marrowmoth'un döndüğünü
söylüyor ve hiçbiri bildirim değil: tuz evi bir öncekinden kalanı değil, az önce
boşaltılanı tutuyor; rıhtım yılın geri kalanında olmayan dört replik kazanıyor; lonca
kâtibinin de yanaşıp tek bir iş ilanı asmayan kırk tonluk bir tekne hakkında
söyleyecekleri var. Pencere İlkbahar ile Sonbahar — ekinokslar, yani yılın en büyük
gelgit farklarının düştüğü yer; yalnızca cezirle çalışabilen bir teknenin
tutabileceği tek çift bu ve Faz 4'ün yaklaşımının da zamanlanacağı çift aynısı.
Pencere hiçbir şey import etmeyen `src/data/marrowmoth.js` içinde yaşıyor, çünkü üç
yüzeyin de aynı şeyi söylemesi gerekiyor ve kayan kopya sessizce bozardı. Raf her
yenilemede türetiliyor, asla saklanmıyor — Q-10 böyle diyor. Muhafızlar: 1a'dan gelen
`check_seasonal_content_is_reachable`, artık üç dosya ve tek koşul biçimi yerine
`src/` altındaki her dosyayı ve adlandırılmış her mevsim listesini okuyor; bir de iki
kez genişletilen `check_trader_stock_lists`, hem türetilmiş şablon adını görüyor hem
de `inventory_template` alanına yapılan her atamayı reddediyor — Q-10'un "saklama"
kuralının mekanik hâli. 1. quest bunların hiçbirinden açılmıyor; o Faz 2'nin işi ve
tersi değil, keşiften açılıyor.

**Faz 2 — v0.7.1, *Forty Tons*.** `bitti`. Mevcut körfez üzerinde iki aksiyon; ikisi
de açılıp yeniden kilitlenmek yerine mevsime bakılan `display_conditions` ile
gösteriliyor, çünkü "tekne burada değil" oyuncunun değil dünyanın durumu. Tahtada
bir gün, para almadan — rıhtımın kendi repliği hamalların parasını kimin verdiğini
soruyor ve kendisi cevaplıyor, dolayısıyla kahramana para vermek oyuncunun zaten
duyduğu bir satırla çelişirdi — ardından deponun kapısının içine çakılı çetele:
altı sütun, beş tam satır ve altısının dördü boş yazılmış bir satır; altındaki
cetvel çizgisi kesintisiz. Sayman ağırlık sütununda neden ağırlık olmadığını
söylüyor, sonra da bunun aralarında iki ilkbahar olan ikinci kez olduğunu, ikisini de
kendi elinin yazdığını. Aynı sandık olduğunu söylemiyor: ikisini de ne tarttı ne
açtı. 1. quest işten açılıyor, tersi değil. Arc'ın ilk lore ipliği sayman ile lonca
kâtibi arasında uzanıyor; Q-8'in kendi örneği — tek konu, iki konuşan, aralarında bir
aylık yürüyüş. Muhafızlar: iki aksiyonun otomatik olarak dâhil olduğu mevcut sınıf
düzeyi kontroller ve 2a'dan gelen `check_lore_threads_resolve`.

**Faz 3 — v0.7.2, *A Stroke Through It*.** İtibara bağlı soruşturma — Q-7 uyarınca
dördüncü bir reputation bölgesi olan `Guild` üzerinden — ve **aynı parçayı değil,
farklı parçaları** veren üç yol: lonca kayıtları, liman işçisinin tanıklığı, eski
manifestolar. Eşikler uydurulmaz; gerçekten kazanılabilen değerlerden (bugün 610
Village, 350 Slums, 320 Town) ve mevcut yerleşim aksiyonlarının oturduğu yerlerden
türetilir. Kendinden önceki iki faz gibi bölündü.

- **3a — bölge.** `bitti`. `character.reputation` artık dördüncü bir anahtar taşıyor:
  `Guild`; adı iki dilde de var ve muhafızı da. Maliyet Q-7'nin ölçtüğü kadar oldu,
  fazlası değil: tek alan, iki satır, bir kontrol. Eski bir kayıt bu anahtar olmadan
  geliyor ve bildirilen 0 kalıyor; `update_displayed_reputation` yalnızca 0'ın
  üstündeki bölgeleri çiziyor, yani kimse kazanmadığı bir satırı görmüyor;
  `market_saturation`'a dokunulmadı, çünkü hiçbir şeyi fiyatlamayan bir loncanın
  market bölgesine ihtiyacı yok. Muhafız: `check_reputation_regions_have_names`; bir
  bölge anahtarını okuyan ve hiçbiri kendiliğinden birbiriyle uyuşmayan üç yüzeyin
  üçünü de kapsıyor — karakter sayfasının `getDisplayName`'i; bir `reputation:` ödülü,
  ki `add_reputation` tanımadığı bölgede **hata fırlatıyor**; ve bir `reputation:`
  koşulu, ki aynı yazım hatası orada undefined okuyup kapıyı hiçbir şey söylemeden
  temelli kapatıyor. Henüz hiçbir şey lonca itibarı kazandırmıyor, yani satır hiç
  çizilmiyor ve sürüm de yok.
- **3b — üç yol.** `open`. Lonca kayıtları, liman işçisinin tanıklığı ve eski
  manifestolar; her biri farklı bir parça veriyor. Lonca itibarının kazanılabilir hâle
  geleceği yer de burası ve **arc'ın içinde** kazanılabilir olmak zorunda, yalnızca
  hâlihazırdaki lonca işinden değil: bu sürümden önce *The Merchant's Word*'ü bitirmiş
  bir kayıt, aksi hâlde lonca yolundan temelli dışlanırdı. v0.7.2 olarak yayınlanacak
  olan bu.

**Faz 4 — v0.7.3, *Out on the Ebb*.** Cezir yaklaşımı. Q-9 uyarınca en fazla iki
yeni yer; demirleme yeri ve güverte oda değil aksiyon olur. Combat değil, skill ve
aksiyon kontrolleri. Her kapı var olan bir skill'i anar, her başarısızlık nedenini
söyler ve başka bir yol bırakır — daha uzun, daha pahalı ya da itibar üzerinden.
Muhafız: `check_no_dead_end_skill_gates` — tek ilerleticisi skill'e bağlı bir
aksiyon olan bir task'ın ikinci bir ilerleticisi olmak zorundadır. Bu, sahibin
"başarısız kontrol questi kilitlemez" kuralının mekanik hâlidir.

**Faz 5 — v0.7.4, *One Unweighed Crate*.** Sandığa ulaşılır. Orman yolunda alınan
objeyle aynı eli taşır — tek bir motif, tek bir metal, tek bir açıklanmamış malzeme
— ve başka hiçbir şey. Oyuncu bilerek cevaptan çok soruyla çıkmalıdır. Muhafız:
`check_lore_threads_resolve`; Q-8 iplik seçeneğine oturdu, yani bu muhafız artık
borç.

**Faz 6 — v0.7.5, sistem geçişi.** Briefin istediği %20 ve arc'ı değerli kılan
kısım: stance seçimi stat bonusuyla değil `on_hit` / `on_damaged` üzerinden anlam
kazanır; arc'ın para kuyusu mevcut ekonomiye göre fiyatlanır; tier 4 ve tier 5
malzemeleri cezirin açtığı şeye bağlanır — P-12'nin "satın alınan değil, çıkarılan
bir cevher" maddesinin yeri burasıdır; itibar sonuçları cezalandırma gibi değil,
dünya durumu gibi okunur.

**Faz 7 — v0.8 hazırlığı, *Beyond the Lake*.** Faz 6 yeşile dönmeden başlamaz. Önce
izler — ayak izleri, tüyler, ses, kırılmış örtü — ve oyuncu yaratıkla karşılaşmadan
önce onun var olup olmadığından emin olmamalıdır.

#### Fazlara taşınan kararlar

Bu önerinin sorduğu dört soru, cevaplarıyla birlikte ve her biri onu harcayan fazın
karşısında. [Bekleyen kararlar](#bekleyen-kararlar) altında karara bağlanmışlardı;
faz 0 kapanınca buraya taşındılar: bir karar, biçimlendirdiği işin yanında durur.
Numaraları korunuyor, böylece onları anan commit'ler ve changelog girdileri hâlâ
çözülüyor.

##### Q-7 — Lonca itibarı dördüncü bir reputation bölgesi mi olsun? **KARAR: evet** — faz 3 harcar

P-14'ün 3. fazı birbirinden farklı üç bilgi yolu istiyor ve üç eksenin ikisi zaten
harcanmış durumda: kasaba meydanı Town'u 50 / 150 / 250'de, sıra evleri Slums'ı
100 / 200 / 300'de okuyor. Bunlardan birinin üzerine kurulacak üçüncü bir yol, aynı
yolun iki kez yürünmesidir.

Maliyet korkulmadan ölçüldü. `character.reputation` düz bir nesne; `load()`
**kayıttaki** anahtarları dolaşıyor ve tanımadığı bir bölgeyi uyarıp geçiyor, yani
eski bir kayıt `Guild` olmadan geliyor ve alan bildirilmiş 0 değerinde kalıyor.
`update_displayed_reputation` yalnızca 0'ın üstündeki bölgeleri gösteriyor, yani
kimse kazanmadığı bir satırı görmüyor; bölgenin adı da `getDisplayName` üzerinden
geçiyor, o da dil başına bir locale satırı istiyor. `market_saturation` ayrı bir
harita ve ellenmiyor: hiçbir şeyi fiyatlamayan bir loncanın market bölgesine
ihtiyacı yok.

Yani bütün maliyet bir alan, iki locale satırı ve bir kontrol. Alternatif — lonca
gözdeliğini flag ve quest durumuyla ifade etmek — daha az kod tutar ve hiçbir şey
kazandırmaz: üçüncü bir yolu üçüncü bir yol gibi hissettiren şey, tam olarak
oyuncunun yükselişini izleyebildiği bir sayıdır.

##### Q-8 — Soruşturma notları nerede durur? **KARAR: yeni panel değil, bir lore ipliği** — faz 2 harcar, faz 3 ve 5 üstüne kurar

Ölçüldü; çünkü brief Discoveries diyor ve Discoveries kulağa geldiği şey değil.
`update_displayed_discoveries` **eşyaları** nereden geldiklerine karşı çiziyor;
kaynağı `world_index`. `update_displayed_lore` ise **oyuncunun duyduğu
textline'ları** konuşana göre gruplayıp kaldığı yeri gösteren bir satır ekliyor.
Bir aksiyonun başarı metni ikisi de değil; bugün günlükte bir kez okunup gidiyor.

Üç seçenek var ve doğrusu ortadaki:

- **İpuçlarını `lore: true` işaretli diyalog satırlarından geçirmek.** Hiç kod
  gerekmez, hâlihazırda çalışır. Ama konuşana göre grupladığı için Marrowmoth'un
  altı olgusu üç ayrı kişinin altında dağılır ve tek bir iplik değil, üç ayrı sohbet
  gibi okunur.
- **`Textline`'a opsiyonel bir `lore_thread` kimliği, lore paneline de konuşan
  listesinin üstünde bir iplik gruplaması vermek.** Bir opsiyonel alan, bir dal,
  kayıt üzerinde hiçbir etki — textline'lar zaten açılmış olarak izleniyor. Sürgün
  kabile ve Rat God için yeniden kullanılabilir; bir soyutlamanın kendini hak edip
  etmediğinin ölçüsü de budur.
- **Yeni bir soruşturma paneli.** Hem brief hem de kanıt bunu dışlıyor: oyunun zaten
  dört günlük yüzeyi var ve beşincisi, buradaki her kalıcı direktifin önlemek için
  var olduğu paralel sistem olurdu.

##### Q-9 — Cezir zinciri kaç yeni yer ister? **KARAR: dört değil, iki** — faz 4 harcar

Brief şu zinciri çiziyor: Körfez → cezir düzlüğü → demirleme yeri → güverte → alt
ambar. Körfez oyunun bilerek en ince bölgesi — üç yer, çünkü liman insanın içinden
geçtiği bir yerdir — ve dört yeni oda onu dağdan sonraki en büyük bölge yapar ki bu
onun hakkında yanlış bir şey söyler.

Zincirin tamamını iki yer taşır: yaklaşımı ve gelgitin kapattığı şeyi temsil eden
**düzlük**, ve varış noktası olan **ambar**. Demirleme yeri ile güverte, bu ikisinin
üzerindeki aksiyonlardır. Burada yer eklemek ucuzdur; tuzak da budur: ölçü bir odayı
eklemenin maliyeti değil, o odanın içinde bir şey olup olmadığıdır — koridorun
içinde yoktur.

##### Q-10 — "Yılda iki kez" nasıl çalışır? **KARAR: iki mevsim, zamanlayıcı yok** — faz 1 harcar

`conditions.js` zaten `season: {yes, not}` okuyor; `game_time` mevsimi, haftanın
gününü, gün sayısını ve ay evresini taşıyor. Yılda iki kez, iki mevsim demektir ve
briefin saydığı bütün dünya-olayı sözlüğü — tüccar stoğu, fon replikleri,
aksiyonlar, diyalog — aynı koşulu okuyabilir.

Tek gerçek tehlike zaman modeli değil, durum: `inventory_template` **kayda
yazılmıyor**. Tekne limandayken bir tüccarın üzerinde çevrilen ne varsa, yazılmak
yerine yüklemede mevsimden yeniden hesaplanmalı; yoksa bir sonraki oturumda geri
döner ve hiçbir şey yüksek sesle hata vermez — ki bu, sahibin favori yerlerini
kaybettiren hatanın tam olarak biçimidir (bkz. [STATUS.TR.md](STATUS.TR.md), 4.
kısıt). Türet; saklama.

Genel bir dünya-olayı çatısı açıkça kapsam dışıdır. İkinci bir olay aynı tesisatı
isterse, soyutlama kendini o zaman hak etmiş olur.

#### Bu önerinin yapmayacakları

Beşinci bir bölge, ikinci bir soruşturma arayüzü, bir zamanlayıcı çatısı, bir
lockpicking skill'i ya da bir gizemin cevabı uydurmak. Yazılmış içerik bir anı
zaten karşılıyorsa, paralelini yazmak yerine onu bağlayın.

---

## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar. Burada kalanlar projenin tamamını ilgilendiriyor; tek bir
önerinin sorduğu soru, cevaplandığı anda o önerinin içine geçer. Q-7 ile Q-10 da
oraya gitti — bkz. P-14 içindeki
[Fazlara taşınan kararlar](#fazlara-taşınan-kararlar).

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
  [CHANGELOG.TR.md](CHANGELOG.TR.md) dosyasına yazılır ve ardından öneri bu
  dosyadan çıkarılır. Kaydı orada, geliştirici derinliğinde durur; burada ikinci bir
  kopya tutmak çalışma listesini arşive çevirir ve hâlâ açık olanı gömer.
- Kararlar [Bekleyen kararlar](#bekleyen-kararlar) bölümünden onları tüketen
  öneriye taşınır ve cevap kayda geçirilir.
