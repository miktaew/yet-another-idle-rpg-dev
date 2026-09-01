<!-- doc-source: docs/PROPOSALS.md  doc-version: 83 -->

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

**5. kademe de v0.7.5 ile yayında.** 36 beyaz çelik ve siyah çelik bileşeninin hepsi
üretilebiliyor: `Heavy sand` gelgit düzlüklerinde kazılıyor, iki çelik külçesi de
Atratan cevherinin demirden çelik yaptığı gibi bu kumla ve kendi demir cevheriyle
eritiliyor; eksik olan dört stok — `White chainmail`, `White plate` ve siyah çiftleri —
artık var ve külçelerden dövülüyor. `check_components_can_be_made` 203'te 159'dan
195'e çıktı ve 5. kademe grubu `known_unmade` listesinden tamamen kalktı. Satın alınan
değil çıkarılan cevher, düzlüklerin kendi damarı; yani 3. madde henüz var olmayan bir
bölgeden değil, P-14'ün açtığı bölgeden cevaplandı.

> **Not.** Bu maddenin İngilizce yarısı bir tur önce yeniden ölçülüp düzeltilmişti,
> Türkçe yarısı ise düzeltilmemiş "görünen ad eksik" engelini taşımaya devam ediyordu.
> `doc-version` eşleşiyordu, çünkü o kontrol sürümlerin aynı olmasını denetliyor, aynı
> şeyi söylediklerini değil (D-3 zaten böyle diyor). Bu tur birlikte düzeltildi.

**Geriye kalan:**

2. **3'ün üstünde bir istasyon.** `roll_quality`, `station_tier - component_tier`
   okuyor; yani dağdaki bacada — oyunun en iyi ateşi, 3'te — dövülen 5. kademe
   bileşenleri iki kademelik cezayla atılıyor. Her şey *yapılabilir* durumda; çözülmemiş
   olan, hak ettiği kalitede çıkıp çıkmayacağı ve daha iyi bir ateşin nerede olacağı.
   Bu eksik bir tarif değil, bir denge ve bir yer meselesi; ve tek başına iliştirilmiş
   bir istasyondan çok, P-14 Faz 6'nın ekonomi yarısını yanında istiyor.

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

**Faz 3 — v0.7.2, *A Stroke Through It*.** `bitti`. Üç yol, üç itibar ekseni, üç farklı
parça. Loncanın mühür defteri `Guild`'i 50'de, hamallar `Slums`'ı 200'de, faktörün eski
suretleri `Town`'u 150'de okuyor — sokağın ve meydanın kendi orta kademeleri; mevcut
aksiyonları zaten 100/200/300 ve 50/150/250 üzerinde oturuyor. Hiçbiri mevsime bağlı
değil: evrak da insanlar da yıl boyu burada ve manifestoyu geç sonbaharda okuyan bir
oyuncu, onun hakkında soru sormak için ilkbaharı beklememeli. Her yol kazanılmadan önce
görünüyor ve sebebiyle birlikte reddediliyor; kendinden önceki altı yerleşim aksiyonu
gibi. 2. quest üç görev yerine **üç ilerleticisi olan tek bir görev** taşıyor; böylece
oyuncunun sahip olmadığı hiçbir itibar questi kilitleyemiyor. Kaybettiği şey diğer iki
parça oluyor ve iplik de kısalarak bunu söylüyor. Lonca itibarı arc'ın içinde
kazanılabilir hâle geldi — 1. quest 60 ödüyor, bu da mühür defterinin 50'sini o kadarını
yapmış herkesin menziline sokuyor, yapmamış hiç kimsenin menziline sokmuyor — yani
*The Merchant's Word*'ü erken bitirmiş hiçbir kayıt dışarıda kalmıyor. Muhafız: 3a ile
gelen `check_reputation_regions_have_names`; burada ikinci bir muhafız borç değil. Karar
verirken ölçüldü: ilerleticisi olan 61 görünür görevin 5'inde kapısız hiçbir ilerletici
yok; beşi de eğitilebilen ya da satın alınabilen skill ve eşya kapılarına bağlı. Bu,
Faz 4'ün adlandırdığı çıkmaz sınıfı değil — sebebini söyleyerek reddeden bir kapı,
başarısız olan bir kontrol değildir — ve ayrım, Faz 4 yeniden türetmek zorunda kalmasın
diye kayda geçirildi.

**Faz 4 — v0.7.3, *Out on the Ebb*.** `bitti`. Q-9 uyarınca iki yer, fazlası değil:
düzlükler yaklaşım, ambar ise varış; demirleme yeri ile yük güvertesi de kendi odaları
değil, bu ikisi üzerinde aksiyon. Combat yok — engel su ve karanlık.

Gelgit bir saat değil. Bu motorda günün saatine bakan bir koşul yok ve bir tane eklemek,
Q-10'un kapsam dışı bıraktığı zamanlayıcı olurdu; düzlükleri kapayan şey, arc'ın geri
kalanının okuduğu aynı mevsim penceresi: oraya yürümenin tek sebebi teknenin çamurda
yatıyor olması. Açılma değil `display_conditions`, Faz 2'nin gerekçesiyle — açılma tek
yönlüdür — ve körfeze dönüş yolunda hiçbir koşul yok, yani mevsim dönerken orada olan
kimse mahsur kalmıyor.

Aynı çamurun üstünde üç yol; fazın kuralı bir muhafıza bırakılmak yerine içeriğe
yazıldı: Equilibrium ile yürüyüp suya geri çevrilmek, kayıkçıya 25.000 ödemek ya da
`Slums` 250'de sağlam hattan yürütülmek — soruşturmanın 200'ünden daha zor, çünkü
zeminin nerede tuttuğunun gösterilmesi, bir hamalın konuşmasından daha büyük bir iyilik.
Yalnızca bedava olan başarısız olabiliyor; diğer ikisi hiç başarısız olamıyor ve onun
yerine paraya ya da itibara mal oluyor. Üçü de aynı merdivende bitiyor ve aynı açılmayı
veriyor, yani burada oyuncunun sahip olmadığı bir skill'in arkasında hiçbir şey yok.

Faz, sandığın görülüp dokunulmaması üzerine bitiyor — ona ulaşmak Faz 5'in işi ve arc,
cevaptan çok soruyla bitirmek üzerine kurulu. Muhafız: 4a ile gelen
`check_no_dead_end_skill_gates`; dört yeni aksiyon sınıf düzeyi kontrollere kendiliğinden
katıldı ve kontroller yazının kaçırdıklarını yakaladı — iki yerin görünen adları, üç
seyahat satırı kimliği ve iki yardım sayfasının harita girdileri.

Sonraki fazlar için not: 4a'nın muhafızı `main.js` içindeki deneme çözümleyicisini üç
çağrı yerinin sırasına bakarak okuyor. O çözümleyicide yapılacak her düzenleme, kilidi
kazanan tarafta tutmak ya da niçin tutmadığını söylemek zorunda.

**Faz 5 — v0.7.4, *One Unweighed Crate*.** `bitti`. Sandığa ulaşılıyor ve kontrol onu
açmak değil — sandık bir kilit değil. Perception ve Woodworking okunuyor, çünkü zorluk
bu rıhtımda kimsenin atmayacağı bir bağı okumak ve onu, bağlayan adamın iki kez
bakmayacağı kadar iyi yeniden yapmak. Başarısızlık, bunu hiçbir şeyi *kesmeden önce*
anlamak; yani hiçbir şey kesilmiyor ve hiçbir şey kaybedilmiyor: oyuncu, su gitmesini
söyleyene kadar sırtını ona yaslayıp oturuyor.

İçinde: saman; keçe olmayan, mantar olmayan ve sıkışmayan gri bir malzemeden kesilmiş bir
yatak; ve demir, çelik ya da tunç olmayan, tırnaktan iz almayan bir metalden, bir bilek
genişliğinde kapalı bir halka — çepeçevre, kendi başlangıcına dönen karelerle oyulmuş.
Tek motif, tek metal, tek açıklanmamış malzeme; tam olarak bu önerinin istediği gibi ve
sandıkta başka hiçbir şey yok.

**Hiçbir eşya ödemiyor**, bilerek. Envanterdeki bir nesnenin bir şey yapması gerekirdi ve
yaptığı her şey, bu arc'ın cevaplamasına izin verilmeyen bir soruyu cevaplardı. Oyuncunun
elinde kalan şey bir tarif ve daha önce bir kez anlatılmış bir desen.

Arc, sayman değil **antika koleksiyoncusu** üzerinde kapanıyor; çünkü oyunda *"aynı el"*
diyip inandırabilecek tek kişi o — kasabanın en eski şeylerini kırk yıl kataloglamış ve
öteki parçayı suyun kaynama süresi kadar elinde tutmuş biri. Üç şey söylüyor ve
dördüncüsünü reddediyor: en az iki tane var, onları isteyen biri var, o biri onları
yapanla aynı değil ve *"dikkatli olmak istiyorum, çünkü söylediğimi hatırlayacaksınız."*
Kimin eli olduğunu söylemiyor. "Tek katman" kuralı burada tutuyor ve
[STORY.TR.md](STORY.TR.md) bölüm 3 artık bu üç olguyu ve hâlâ açık olanların listesini
kayda geçiriyor; böylece sonraki arc onları sessizce genişletemiyor.

Muhafız: 2a'dan gelen `check_lore_threads_resolve` — Q-8 gerçekten iplik seçeneğine
oturdu. İplik artık üç konuşan üzerinde beş beat: bir rıhtım, bir lonca ve meydanın
karşısındaki bir dükkân; Q-8'in yazıldığı şeklin tam boyu.

**Faz 6 — sistem geçişi.** `kısmen tamam`. Birbirinden bağımsız dört parça; biri
yayınlandı.

- **4. ve 5. kademe malzemelerinin cezirin açtığına bağlanması.** `bitti`, **v0.7.5**
  olarak. P-12'nin "satın alınan değil, çıkarılan bir cevher" maddesinin yeri burasıydı
  ve henüz var olmayan bir bölgeden değil, bu arc'ın açtığı bölgeden cevaplandı:
  `Heavy sand` gelgit düzlüklerinde kazılıyor; o düzlükler de yalnızca Marrowmoth'un iki
  mevsiminde sunulduğu için, 5. kademe reaktifi kendi koşuluna sahip olmadan arc'ın
  penceresini miras alıyor. 36 bileşen yapılamazdan yapılabilire geçti ve 5. kademe
  grubu `known_unmade` listesinden kalktı. P-12'de kalan şey istasyon sorusu, bir tarif
  değil.
- **Stance seçiminin stat bonusuyla değil `on_hit` / `on_damaged` üzerinden anlam
  kazanması.** `bitti`, **v0.7.6** olarak. Dört yaratık tepki veriyor ve hiçbiri bunun
  için bir stat satırı kazanmadı: sürü, bir noktaya karşı üstünüze kapanıyor ve geniş
  bir duruşla geri süpürülüyor; kurbağanın sıçraması ne kadar sert vurduğunuzla değil
  önünde ne kadarınızın durduğuyla ölçekleniyor; iki yusufçuğun iğnesi de bir savuruşa
  kendini vermiş bedeni buluyor. Hepsi zaten var olan kancaların içine yazıldı; P-14'ün
  ölçtüğü şey de buydu — ikinci bir soyutlama yok ve yeni bir yaratık da yok, çünkü
  arc'ın kendisinde combat yok ve Faz 4 bunu söylemişti. Dürüst sınır şu: bir kanca
  yalnızca `add_active_effect`'e ve log'a ulaşabiliyor, dolayısıyla tepki her zaman
  "nasıl durduğunuz, bunun size ne yapabileceğini değiştirir" oluyor. Muhafız:
  `check_stance_reactions_name_real_stances` — yanlış yazılmış bir stance kimliği, var
  olan her stance için yanlış döner; yani tepki yazılır, çevrilir, yayınlanır ve bir kez
  bile görülmez, yaratık ise tam eskisi gibi davranır.
- **Arc'ın para kuyusunun mevcut ekonomiye göre fiyatlanması.** `open`. Kayıkçının
  25.000'i bu arc'ın belirlediği tek fiyat ve bütün eğriye göre değil, quest ödüllerine
  göre belirlendi.
- **İtibar sonuçlarının ceza değil, dünya durumu gibi okunması.** `open`.

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

### P-15 — Kitaplar ve hiçbir şeyin öğretmediği yetenekler `open`

Sahibinin isteği: yeni kitaplar. Planlamadan önce ölçüldü; çünkü burada bir kitap ucuza
geliyor ve tam bu yüzden dikkatsizce eklenmemeli.

**Var olan.** On kitap; hepsi `src/items.js` içinde `Book` eşyası ve karşılığında bir
`book_stats` girdisi. `BookData`, yeni bir kitabın isteyebileceği her şeyi zaten
destekliyor ve hiçbir motor işi gerekmiyor: `required_time`, `required_skills`,
`literacy_xp_rate`, `bonuses.xp_multipliers` (yetenek başına ya da `all`),
`bonuses.multipliers` (karakter statları), `rewards` (tarifler ve diğer açılma türleri)
ve `finish_reward`. On kitap şunlar: *ABC for kids* (tüm xp ×1.2), *Old combat manual*
(Combat), *Twist liek a snek* (Evasion artı çeviklik), *Medicine for dummies* (üç
simya tarifi), *Butchering and you*, *Ode to Whimsy*, *A Glint On The Sand*,
*Shellfish desires*, *Wood for Witches* ve *Counting Mice*.

**Boşluk asıl olarak ne.** "Kitap sayısı az" değil — en yeni üç bölgenin hiç kitabı
olmaması ve oyunda on kitaba karşı 64 yetenek bulunması. Kitap, hiçbir yere, hiçbir
NPC'ye ve hiçbir dövüşe mal olmayan tek öğretme yüzeyi; bu da onu, dünyanın başka türlü
tanıtmaya yeri olmayan yetenekler için doğru araç yapıyor.

**Yenileri nereden gelmeli ve kural.** İcat yerine geri kazanım: her yeni kitap zaten var
olan bir şeyi öğretir ve zaten var olan bir yerden gelir. Uydurulmak yerine mevcuda karşı
ölçülmüş adaylar:

- **Lonca**'nın bir kâtibi, bir panosu, bir mühür defteri ve v0.7.2'den beri itibarı var.
  Orada satın alınan ya da kazanılan bir kitap, Literacy ile Haggling için doğal yer.
- **Tuz evi** ve **körfez** bir tekneden ineni satıyor ve hiç kitabı yok. Bir kılavuzun
  ya da saymanın kitabı, Perception, Spatial awareness ve Swimming'in ait olduğu yer.
- **Dağ**'da oyunun tek 3. kademe istasyonu var ve hiç kitabı yok. Forging ile Smelting'in
  hiçbir yerde öğretme yüzeyi yok.
- **Antika koleksiyoncusu** katalog tutuyor; **kenar mahallenin yaşlı kadını** bir liste
  tutuyor. İkisinin de bütün karakterizasyonu yazılı kayıt.

**Bunun yapmaması gereken.** Bir xp çarpanı dükkânına dönüşmemeli. Yalnızca çarpan veren
bir kitap, `BookData`'nın yapabileceği en zayıf şey; mevcut en ilginç iki kitap *tarif*
açıyor ve izlenecek şekil de bu.

**Muhafız.** `check_books_can_be_got`; `check_components_can_be_made`'in bileşenler için
kapsadığı sınıfın aynısı: her `Book` eşyası ya elde edilebilir olmak zorunda — tüccar,
düşürme, ödül ya da tarif yoluyla — ya da gerekçesiyle yazılı bir listede durmak. On
kitap var ve bugün hiçbirinin ulaşılabilir olduğunu hiçbir şey denetlemiyor.

### P-16 — Büyü, kendi arc'ı olarak `open`

Sahibinin tespiti; doğru ve kulağa geldiğinden kötü. Ölçüldü:

- `skills["Wands"]` ve `skills["Staffs"]` ikisi de var, ikisi de `Weapon mastery`
  altında ve ikisinin de tam kademe adları var — *Wand casting*, *Wand mastery*,
  *Master of wands*.
- `character.stats`, `max_mana`, `mana_regeneration_flat` ve `mana_regeneration_percent`
  bildiriyor ve üçü de **`//currently useless`** yorumunu taşıyor.
- `character.js` bir yorumda üç hasar türü anıyor: `"physical"`, `"elemental"`,
  `"magic"`.
- **Oyunda tek bir asa ya da değnek eşyası yok.** `grep -n "wand" src/items.js` hiçbir
  şey döndürmüyor.
- `magic` statını hiçbir şey okumuyor. Yaratıklar bildiriyor; hepsinde 0.

Yani büyü, v0.7.5'ten önceki 5. kademenin tam olarak aynı biçiminde: arkasında içerik
olmayan, bitmiş bir sözcük dağarcığı. Oyunun 64 yeteneğinden ikisi hiçbir yolla
seviye atlayamıyor, çünkü ölçekledikleri silahlar mevcut değil.

**Q-11'i sahibi karara bağladı: büyü üçüncü bir savaş ekseni ve kendi fazı.** Bir silah
ailesi değil — eksenin tamamı. Mana, olağan dövüş sırasında harcanan gerçek bir kaynak;
büyüler hasar ve buff/debuff etkileri taşıyor; `intuition` zaten var ve büyünün okuduğu
stat o; büyü gücü, yeteneklerin ve ekipmanın yükselttiği gerçek bir stat ve belli
eşikleri geçmek özellikler ekliyor. Manaya odaklı yetenekler — yenilenme ve benzeri —
bunun parçası. **Kendi fazı ve kendi sürüm serisi olarak, mevcut hikâyeden sonra**
planlanıyor; Q-11'in iki cevabının da üzerinde anlaştığı tek şey buydu: bütün Marrowmoth
arc'ından büyük bir değişiklik ve başka bir fazın içine ait değil.

Bunu karşılanabilir kılan şey Q-1'in ikinci revizyonu: fork artık tamamen ayrışıyor, yani
yeni yetenekler, yeni statlar ve yeni sistemler kapsam içinde. Kararı veren şey artık
"hiçbir şeye bağlanmıyor" değil.

**Başlanmadı ve bilerek henüz başlanmıyor.** P-14 Faz 6'nın iki parçası kaldı, Faz 7 ise
hiç başlamadı; büyü, mevcut hikâyenin yanına değil sonrasına geliyor.

**Karar verilebilen ve iki cevap altında da geçerli olan:**

- Ne yayınlanırsa yayınlansın `Wands` ile `Staffs`'ı seviye atlanabilir kılmalı; çünkü
  oyuncunun gördüğü ama asla yükseltemediği bir yetenek, hiç olmayan bir yetenekten
  kötüdür.
- Üç mana statı `//currently useless` olmayı bırakıyor — o yorum, onları okuyan bir şey
  olduğunda kalkar ve bu cevap altında olacak.
- Yeni bölge yok. Büyü, 5. kademenin düzlükler üzerinden geldiği gibi, var olan yerler ve
  insanlar üzerinden gelmek zorunda.
- Mevcut savaş formülleri ona uydurulmak için kırılmayacak. `intuition` ile `magic` hasar
  türünün adı zaten konmuş; üçüncü eksen onların yanına değil üzerine kurulur.
### P-19 — Kasaba meydanında ya da ona bağlı bir yerde bir tüccar `open`

Sahibinin isteği: kasaba meydanında ya da ona bağlı yerlerden birinde satış yapabilen bir
tüccar.

**Önce ölçüldü, çünkü kasabanın zaten bir tüccarı olabilirdi.** Yedi stok listesine
yayılmış sekiz tüccar var ve meydanın hiç tüccarı yok — üç itibar aksiyonu, bir çeşme,
güvercinler, bir tellal ve iki fırıncı var; satın alınacak hiçbir şey yok. Meydan
kasabanın yaşam merkezi ve dükkânı olmayan tek yerleşim merkezi.

Bunun tasarıma etkisi:

- Karar tüccar değil, stok listesi. Yedi liste var; meydan tüccarı ya var olan bir
  listeyi okumalı ya da körfezinki gibi, var olan eşyalardan kurulmuş yeni bir listeyi.
  Karşı-hedef yeni bir mal kademesi.
- Meydanın bir `market_region`'ı var; eklemeden önce kontrol edilmeli, çünkü bir dükkânın
  para basma makinesine dönüşmesini engelleyen şey `market_saturation` ve var olan bir
  bölgedeki yeni dükkân onu miras alıyor.
- "Ya da ona bağlı bir yer" ilginç olan yarısı. Meydan loncaya ve kenar mahalleye
  bağlanıyor; kenar mahallede terazili baraka ve hazır bir itibar merdiveni zaten var.
  Stoğu ya da fiyatları `Town` veya `Slums` itibarını okuyan bir tüccar, oyunun elinde
  zaten bulunan bir sayıyı harcar.

### P-20 — Dev modu yenilemeden sağ çıkar, yeniden açılıştan çıkmaz `open`

Sahibinin isteği ve tam olarak tek bir depolama kararı: `sessionStorage`. Sayfa
yenilemesinden sağ çıkıyor, sekme kapandığında ölüyor; yönetilecek bir bayrak olmadan ve
kayda hiçbir şey yazılmadan istenen davranış bu.

**Ölçüldü:** dev konsolu `enable_dev_console()` ile açılıyor ve
[DEV_CONSOLE.md](DEV_CONSOLE.md) içinde belgeli. Şu anda ne ayarlıyorsa yalnızca bellekte,
yani yenileme onu kaybediyor — sahibinin değişmesini istediği yarı bu — ve hiçbir şey onu
kalıcı kılmıyor, ki yeniden açılışta doğru kalması gereken yarı da bu.

**Olmaması gereken:** kayda girmemeli. "Dev modu açıktı" bilgisini taşıyan bir kayıt,
başkasının makinesinde farklı davranan bir kayıttır ve export, oyuncuların paylaştığı bir
dosya.

### P-21 — Yardım sayfası oyunun gerisinde kaldı `open`

Q-3, `help.html` ile `changelog.html`'in ikisinin de Türkçe kapsamında ve ikisinin de
miras değil bakımı yapılan dosyalar olduğunu karara bağlamıştı. Changelog yarısı
zorunlu kılınıyor — `npm run check`, iki kopyadan biri yayınlanan `game_version` için
girdi taşımıyorsa düşüyor — yardım yarısı ise zorunlu değil, o yüzden kaydı.

**v0.7.0 ile v0.7.8 arasında eklenip yardım sayfasının anlatmadıkları:**

- bir mevsim penceresi ve dört mevsimden ikisinin körfezin ne olduğunu değiştirmesi
- gelgit düzlüklerini geçmenin üç yolu ve birinin başarısız olup tekrarlanabilmesi
- dördüncü reputation bölgesi olarak `Guild`; karakter sayfası artık, sayfanın itibar
  anlatımında hiç anılmayan bir satır gösterecek
- günlükteki lore iplikleri; sayfanın tarif ettiği bir listenin üstüne gelen yeni bir
  gruplama
- 5. kademenin üretilebilir hâle gelmesi ve satın alınan değil kazılan bir cevher
- stance tepkileri — sayfa stance'ları stat çarpanı olarak anlatıyor, ki bu artık hikâyenin
  yarısı
- körfezde balıkçılık

Harita, iki yeni yer yayınlandıkça güncellendi; çünkü bir kontrol bunu istiyordu. **Akış**
güncellenmedi ve sahibinin istediği de bu: sayfanın sırası ve vurgusu, yalnızca listeleri
değil.

**Düşünülecek muhafız:** changelog simetrisi işliyor, çünkü sürüm artışı bir girdiyi
zorunlu kılıyor. Yardım sayfası için eşdeğeri yok ve mekanik bir eşdeğeri olamaz da —
bir sayfanın neyi anlatması gerektiği bir yargı. Kontrol edilebilecek olan daha dar:
oyunun bildirdiği her bölgenin ve her reputation bölgesinin, iki yardım sayfasında da bir
yerde adının geçmesi. Harita kontrolü, yerler için ilk yarısını zaten yapıyor.


---

## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar. Burada kalanlar projenin tamamını ilgilendiriyor; tek bir
önerinin sorduğu soru, cevaplandığı anda o önerinin içine geçer. Q-7 ile Q-10 da
oraya gitti — bkz. P-14 içindeki
[Fazlara taşınan kararlar](#fazlara-taşınan-kararlar).

### Q-1 — Bu fork içerik olarak ayrışacak mı? **YENİDEN GÜNCELLENDİ: tamamen ayrış**

**2026-09-01, sahibi.** Upstream'e gidecek olan iş gitti: pull request'ler açık ve onlara
borçlu olunan başka bir şey yok. Fork artık kendini upstream'in şekline tutmuyor ve buna
motor da dâhil — **yeni yetenekler, yeni sistemler ve yeni mekanikler artık kapsam
içinde; yalnızca yeni içerik değil.**

Pratikte değişenler:

- "Kendi refactor'larımız upstream'in yerleşimine doğru gitmeli" maddesi kalktı. Onların
  şekli daha iyi olduğu yerde kopyalamaya yine değer, kendi meziyeti üzerinden; ama artık
  bir kısıt değil.
- P-15 ve P-16 artık var olanla sınırlı değil. Özellikle P-16'nın Q-11'i kısmen "hiçbir
  şeye bağlanmıyor" üzerinden savunulmuştu; o argüman artık daha zayıf: üçüncü bir savaş
  ekseni fork için artık karakter dışı değil, yalnızca pahalı.
- D-3, D-5 ve D-7 hakkında hiçbir şey değişmiyor. Çeviri katmanı, yerelleştirme kuralı ve
  Türkçe standardı zaten upstream'in değildi ve bundan etkilenmiyor.
- Değişmeyen bir şey daha: **icat yerine geri kazanım** ilk soru olmayı sürdürüyor. Bir
  sistem ekleyebilir olmak, mevcut birini genişletmenin yeteceği yerde yenisini eklemek
  için gerekçe değil; son altı sürüm de bunun kanıtı.

Önceki cevap aşağıda korunuyor, çünkü commit'ler ve changelog girdileri ona atıf yapıyor.

---

### Q-1 (önceki) — **GÜNCELLENDİ: içerikte ayrış, kodda yakınlaş**

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
