<!-- doc-source: docs/PROPOSALS.md  doc-version: 156 -->

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

### D-10 — Oyuncunun gördüğü bir değişiklik, yardım girdisiyle birlikte yayınlanır `standing`

**2026-09-02, sahibi.** *"Eklenen maddelerle help'i de güncellemeyi atlama. Örneğin şu an
loncalara ekleme yapıldı ama help'te bir karşılığı var mı?"* Ve: *"Yeni bölgeler, yeni
özellikler gibi şeylerde help'lerde düzenlenmeli."*

Yoktu; ölçüm de sorunun ima ettiğinden kötüydü: **sekiz günlük sekmesinden `help.html`
yalnızca Data'yı adlandırıyordu.** Quests, Bestiary, Anthology, Discoveries, Lore ve Titles
hiç anılmıyordu; envanterin dördüncü sıralaması, tekrar dene düğmesi, craft filtresi ve
yetenek isteyen kitaplar da öyle.

Kural, D-9'un sürüm kuralının yanında ve aynı anda istendi: **değişiklik bir sürümü hak
ediyorsa, bir yardım girdisini de hak eder.** İki sayfa birlikte, `help.html` ve
`help.tr.html`, aynı commit'te — Türkçesi sonradan çevrilmiş değil, Türkçe yazılmış (D-7).
Yeni bölge dünya haritası bölümüne girer; yeni bir panel ya da sistem, oyuncunun arayacağı
yerde adlandırılır.

`npm run check` sayfanın iki parçasını bu kurala çoktan bağlıyor — harita 71 mekânın hepsini
kapsıyor, itibar bloğu her itibar bölgesini adlandırıyor — yani üçüncüsünü korumanın deseni
hazır. P-44, bu direktifin bulduğu iş listesi.

## Öneriler

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
- ~~**Tuz evi** ve **körfez**~~ **Marrowmoth yayıyla dolduruldu.** *Nothing Bites Here*
  körfezin iki stok listesinde ve Balıkçılık öğretiyor. Buranın işaret ettiği boşluk dolu.
- **Dağ**'da oyunun tek 3. kademe istasyonu var ve hiç kitabı yok. Forging ile Smelting'in
  hiçbir yerde öğretme yüzeyi yok.
- **Antika koleksiyoncusu** katalog tutuyor; **kenar mahallenin yaşlı kadını** bir liste
  tutuyor. İkisinin de bütün karakterizasyonu yazılı kayıt.

**Sonradan ölçüldü ve kalan iki adayın da teslimi türetilmek yerine karara bağlanmayı
gerektiriyor.** Loncanın Literacy nişi zaten dolu: `read the seal book`, Guild 50'de
`skill_xp: {Literacy: 600}` veriyor; yani Literacy öğreten bir lonca kitabı aynı dersi iki
kez vermek olurdu. Dağda ise ne tüccar ne NPC var — yaşlı zanaatkâr Köy'de — dolayısıyla
bir dağ kitabının teslimi için bir aksiyon gerekiyor, ki bu mekanizmayı yeniden kullanmak
değil icat etmek. Bugün oyundaki on iki kitabın hepsi bir tüccarın stok listesinden geliyor.

Ayrıca ölçüldü: `BookData` üzerindeki `finish_reward` ve `required_skills` hiçbir şey
tarafından okunmuyor (P-26); yani yeni bir kitap ikisine de yaslanmamalı.

**Bunun yapmaması gereken.** Bir xp çarpanı dükkânına dönüşmemeli. Yalnızca çarpan veren
bir kitap, `BookData`'nın yapabileceği en zayıf şey; mevcut en ilginç iki kitap *tarif*
açıyor ve izlenecek şekil de bu.

**Muhafız.** `check_books_can_be_got` **var ve geçiyor** — bu teklif yazıldıktan sonra
yazıldı; `check_components_can_be_made`'in bileşenler için kapsadığı sınıfın aynısı: her
`Book` eşyası ya elde edilebilir olmak zorunda — tüccar, düşürme, ödül ya da tarif yoluyla —
ya da gerekçesiyle yazılı bir listede durmak. 12 kitap, hepsi şablonlu ve hepsi ulaşılabilir.

**Yeniden ölçüldü ve bu teklifin adlandırdığı her aday artık ya kapalı ya bloke.** Körfez ve
lonca dolu; dağın, antikacının ve kenar mahalledeki yaşlı kadının stok listesi yok, yani her
biri yeniden kullanılacak değil icat edilecek bir teslim yolu gerektiriyor — oysa oyundaki on
iki kitabın hepsi bir tüccarın listesinden geliyor.

**Bu teklifin bilemeyeceği tek aday:** v0.7.33'te eklenen meydan tezgâhtarı, stok listesi olan
ve kitabı olmayan bir tüccar. Neyi öğreteceği açık kısım. Ölçüldü: 66 beceriye karşı 12 kitap,
56 beceriye hiçbir kitap dokunmuyor ve **kilitli hiçbir tarif "hiçbir şey tarafından
açılmıyor" durumunda değil** — yani yeni bir kitap, *Wood for Witches*'ın yaptığı gibi tarif
geri kazanamaz. Ya kendi tariflerini getirmesi gerekir, ki bu bir kitap değil bir içerik işi,
ya da bir tecrübe çarpanı olması, ki bunu bu teklif kendi sözleriyle dışlıyor.

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

**Başlanmadı ve bilerek henüz başlanmıyor.** v0.7, v0.7.42 ile kapandı ve P-14 bu dosyadan
ayrıldı; yani büyünün arkasında beklediği hikâye bitti — ama beklediği kural değişmedi ve
mevcut hikâye artık P-43. Büyü onun yanına değil **sonrasına** geliyor.

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

### P-42 — Büyük dosyalar ve TypeScript yerine ne kullanılacağı `active`

Sahibinin isteği: *"display.js gibi dosyalar çok büyüdü, uygulamaya genel bir component haline
getirme uygulamak gerek. TS kullanmak mantıksız demiştin, yerine alternatif ne var?"*

**Önce ölçüldü ve hedefi iki kez kaydırıyor.**

- **`display.js` en büyük dosya değil.** 3988 satır; buna karşılık `src/data/skills.js` 5797,
  `src/items.js` 5464, `src/data/locations.js` 5537 ve `src/main.js` 4751.
- **Karışık bir yumak da değil.** 118 üst düzey fonksiyon ve çizdikleri şeye göre
  gruplandığında en büyük küme *iki*: para. Her şey için bir fonksiyon — statlar, zaman,
  sıcaklık, depo, kese — bir dosyayı paylaşıyor. Yani boyutunun maliyeti **gezinme, bağlılık
  değil**; bu da farklı çözümü olan farklı bir problem.
- **Proje onu zaten böyle bölüyor ve işe yaradı.** `inventory_display.js`,
  `crafting_display.js`, `skills_display.js`, `journal_panels.js` ve `item_tooltips.js` hepsi
  display.js'ten çıktı.
- **Bir component sistemi zaten var.** `src/components/` içinde `availability_component.js` ve
  `inventory_component.js` duruyor; `component_management.js` de kendini kaydeden her sınıfa
  ortak metotları graft ediyor. Değiştirilecek değil genişletilecek mekanizma bu.

**Yani "genel bir component yaklaşımı"nın cevabı: burada zaten olan iki kalıp.** Bir panel bir
`*_display.js` modülü oluyor; sınıflar arasında paylaşılan davranış graft'lı bir component
oluyor. İkisinin de icat edilmesi gerekmiyor ve bölünmesi en çok kazandıracak dosya
**display.js değil** — oyundaki her eşya bildirimini tek başına taşıyan `items.js`.

**TypeScript'in alternatifi de JSDoc + `checkJs`.**

`"checkJs": true` taşıyan bir `jsconfig.json`, zaten yazılmış JavaScript'i zaten var olan
JSDoc'tan tip denetliyor — `main.js`'te 76, `display.js`'te 41 açıklama. TypeScript göçüne
karşı kazandırdıkları:

- **sözdizimi değişmiyor**: kaynak, tarayıcının çalıştırdığı JavaScript olarak kalıyor ve
  esbuild tam olarak yaptığı şeyi yapmaya devam ediyor;
- **göç yok**: `// @ts-check` ile dosya dosya açılıyor, yani kimsenin okumayacağı bin hata
  üretmiyor;
- **geri alınabilir**: tek bir dosya ve silmek derleme hakkında hiçbir şeyi değiştirmiyor.

**Ama araç argümanından çok ölçüm argümanı önemli.** Bu projenin gerçekten gönderdiği
hataların neredeyse hiçbiri biçim hatası değildi. Ulaşılabilirlik ve sıra hatalarıydı: hiçbir
şeyin vermediği bir bayrak, hiçbir şeyin başlatmadığı bir görev, gösterdiği değer yazılmadan
önce çizilen bir panel, yapılabilir olup olmadığını söyleyemeyen bir tarif, tetikleyicisi
çoktan harcanmış bir kilit açma. **TypeScript bunların hiçbirini yakalamaz.** 232 kontrol
yakalıyor ve zaten yakalamadığı için yazıldılar. Tipleme, iyi olduğu şey için değerli — yanlış
yazılmış bir özellik, hatalı argüman sayısı — ve bu dosyaların boyutunun yarattığı problemin
cevabı değil.

#### Sahibinin dört sorusu, 2026-09-02

*"src altında hepsini listelemek yerine klasörleyerek tipine konusuna göre kullanmak daha
doğru olmaz mı? models kullanımını daha da arttırmak tip güvenliği için daha iyi olmaz mı,
any any yerine? Ayrıca main.js sadece orchestrator olarak davransa fark yaratır mı?"* Ve
ayrıca: *"Bir de eşyalar, görevler gibi şeylerde json olarak verileri ayırsak ve jsondan
beslesek rahatlatır mı?"*

Ölçüldü ve dördünden üçünün net bir cevabı var.

**JSON: eşyalar ve tarifler için evet, görevler için hayır — ve sayı belirleyici.** Soru
aslında tek: "bu bildirim bir fonksiyon içeriyor mu?" Çünkü JSON fonksiyon tutamaz:

| dosya | bildirim | fonksiyon içeren |
|---|---|---|
| `items.js` | 256 | **1** (%0) |
| `crafting_recipes.js` | 148 | **0** (%0) |
| `quests.js` | 23 | **20** (%87) |

Yani `items.js` ve `crafting_recipes.js`, kod gibi davranan veri — ikisinde 404 bildirim ve
bir fonksiyon — ve JSON'a taşımak tek bir davranışı değiştirmeden 7.700 satır kaynağı
kaldırıyor. `quests.js` ise tam tersi: 23 görevinin %87'si fonksiyon, çünkü bir görevin
koşulu ve ipucu hesaplanıyor. Görevleri JSON'dan beslemek, o fonksiyonlar için JSON'un içinde
bir dil uydurmak olurdu; veri biçimleri de kötü programlama dillerine böyle dönüşür.

**Bu, P-42'nin 2. adımıyla yarışmıyor, onun yerine geçiyor.** 2. adım "items.js'i yorumlarda
kendini çoktan grupladığı ailelere böl" idi. JSON taşıması aynı iş ama sonu daha iyi: bölme
zaten bedavaya geliyor (aile başına bir dosya ya da tek bir dizi) ve tek yeni kod yükleyici.
Muhafız da 2. adımın zaten sahip olduğu muhafız: `npm run check:bundle`,
`Verify_Game_Objects()` ve gerçek bir export'a karşı `npm run check:save` — artı JSON'daki her
id'nin çözüldüğünü kontrol eden bir kontrol, ki `check_save_keys_round_trip` ve kayıt defteri
kontrolleri bunu öbür yönden çoktan yapıyor.

**`src/`yi konuya göre klasörlemek: evet ve neredeyse bedava.** Üst seviyede 45 dosyaya karşı
hâlihazırda var olan ve hâlihazırda bir şey ifade eden dört klasör — `data/`, `models/`,
`components/`, `mods/`. Kural orada; yalnızca uygulanmaz olmuş. Yeniden adlandırmalar burada
ucuz, çünkü `src/` dışından hiçbir şey yola göre import etmiyor ve paket tek bir giriş
noktasından derleniyor. **Ama bunu JSON taşımasından ve dosya bölmelerinden sonra yapmak
gerekiyor**, öncesinde değil: bir dosyayı iki kez taşımak iki kat pahalı ve ikisi de dosyanın
hangi klasöre ait olduğuna karar veriyor.

**models/ ve `any`: evet ve P-42'nin 1. adımı bedelini çoktan ölçtü.** `models/` iki dosya
tutuyor. Tür denetimi 56 dosyanın 26'sında açık ve proje çapındaki sonda hâlâ 30 dosyada 1672
hata bildiriyor — ve **bunların üçte ikisi iki kod**: TS2353 ile TS2740, ki ikisi tek bir
bulgu: *veri dosyaları, hiçbir kurucunun adını anmadığı fazladan alanlar taşıyan içerik
nesneleri bildiriyor.* Bir model tam olarak bunun içindir. Yani sıra "modelleri yaz, sonra
türleri" değil: bildirimleri JSON'a taşınan her dosya, doğrulanacağı bir şekle ihtiyaç duyuyor
ve o şekil modelin kendisi. JSON taşıması ile modeller tek bir iş; ayrı yapmak aynı okumayı
iki kez yapmak olur.

**main.js'in yalnızca orchestrator olması: dördün en belirsizi ve dürüst cevap "henüz
değil".** 4.930 satır, 121 üst seviye fonksiyon, 96'sı `window`a asılı, 41 import. Asıl şekli
o 96 window bağı gösteriyor: `main.js` bir tanrı-nesne olmaktan çok *HTML'in
ulaşabildiği dosya*, çünkü `index.html`teki her `onclick` bir global istiyor. Yani "yalnızca
orchestrator", `main.js`in refactor'u değil — DOM'un oyuna nasıl seslendiğine dair bir karar
ve bu, yukarıdaki üçünden daha büyük ve daha riskli. `display.js` bunun ucuz sürümünün
işlediğini kanıtladı (beş panel çıktı, tek yönlü import, döngü yok) ve v0.7.43'teki
`guild_display.js` aynı desenin tekrarı. **Öneri: panelleri çıkarmaya devam et; `main.js`te
kalan şey döngü, içerik yığını ve window bağları olduğunda karar ver.** İzlenecek sayı o 96
bağ; dosya yarıya inerken onlar 96 kalıyorsa cevap evetti.

**İlk aile tamam.** 112 malzemenin 111'i `src/data/materials.json` içinde; `items.js` 5.464
yerine 4.901 satır. `Rough wood log`, `getName`i `is_rat()` çağırdığı için kaynakta kaldı.
Kurulan kayıt defteri taşımadan önce ve sonra fotoğraflanarak kanıtlandı: 112'nin 112'si
birebir aynı.

Öğrettiği iki şey var ve ikisi de sonraki aileyi ucuzlatıyor. `with { type: "json" }` isteğe
bağlı değil zorunlu — esbuild çıplak JSON import'unu kabul ediyor, Node reddediyor ve
kontroller Node'da koşuyor. Ve **beş kontrol "eşya şablonu nedir"i items.js'i grepleyerek
türetiyordu**; o yüzden taşıma, sorunsuz çalışan malzemeleri adlandıran 171 kontrol hatası
üretti. `tests/lib/item-keys.mjs` artık bunu iki yerden birlikte cevaplıyor ve
`check_item_data_files_are_all_read`, yeni bir veri dosyası oraya eklenmezse düşüyor.

**İkinci aile de tamam.** 148 tarifin hepsi `src/data/recipes.json` içinde;
`crafting_recipes.js` 2.277 yerine 761 satır. Kurulan 148 tarifin 148'i öncesi ve sonrasında
birebir aynı. `tests/lib/recipe-rows.mjs` eş yardımcı ve altı türetme metin yerine satırlardan
alan okuyor.

**Tariflerin, malzemelerin öğrettiğinin ötesinde öğrettiği.** Onları taşımak, hepsi "bu bozuk"
değil *"oyuncuya bunu hiçbir şey veremez"* diyen 255 hata üretti — yanlış yere bakan bir
türetme düşmüyor, yalan söylüyor. Ve iki kapsam kaybı sayılana kadar sessizdi:
`interpolated pairs` 229'dan 125'e düştü (104 tarifin success_chance aralığı sınırsız, kontrol
hâlâ yeşil) ve `material_type` toplam kıpırdamadan 9 değerden 3'e daraldı. **Yani kalan
aileler için yöntem şu: önce kapsam sayılarını yakala, sonra karşılaştır.**

**Modeller tamam ve yanlarında bir düzeltmeyle geldiler.** `src/models/data_rows.js`
typedef'leri tutuyor, `src/data/content_rows.js` ise iki JSON dosyasını onlara karşı iddia
eden küçük, denetlenen bir modül — yani 111 malzeme ve 148 tarif satırının hepsi her
`check:types`ta karşılaştırılıyor, biri yanlışsa dosya ve alan adlandırılarak.

**Ve `check:types` 1. adımdan beri inert çalışıyordu.** `// @ts-check` her ifadeden önce
gelmek zorunda ve dâhil edilen 26 dosyanın hepsi onu `"use strict";` altında taşıyordu.
Dosyalar gerçekten temizdi, yani sayı doğruydu, yalnızca kapı boştu. Yerleşim artık kaynaktan
iddia ediliyor; çünkü mandal kontrolü proje çapında pragmaları görmeyen bir `checkJs`
sondasıyla ölçüyor ve bunu asla fark edemezdi.

**Bir typedef'in yapamadığı:** bildirilmemiş bir alan geçiyor, çünkü fazla-özellik denetimi
taze sabitlere uygulanıyor ve JSON import'u bir değişken. Muhafız izinli adları listelemek
yerine typedef'in kendi `@property` satırlarından okuyor.

**Sırada olan, ölçüm değil yargı:** `src/data/skills.js` 5.797 satırla kalan en büyük dosya
ama becerilerin çoğu `get_effect_description` fonksiyonu taşıyor, yani malzeme vakası değil.
`items.js` içindeki kalan saf-veri aileleri ucuz olanlar — ve bir de dosyalar hareket etmeyi
bıraktıktan sonraya dizilmiş olan klasör düzeni. Aynı okumayı üç kez değil bir kez yapmak demek ve TS2353 ile TS2740'ın (tür
hatalarının üçte ikisi) gerçekten yaşadığı yer de burası.

**Sıralanmış hâli:** önce `items.js` ve `crafting_recipes.js` için JSON + modeller, çünkü
arkasında ölçülmüş 404'e 1 gibi bir argüman olan tek iş bu. Sonra klasör düzeni, dosyalar
hareket etmeyi bıraktıktan sonra. `main.js` en son ve yalnızca panellerin götürdüğü kadar.

#### Bu soruların neden gelip durduğu ve ölçümlerin ne cevap verdiği

**2026-09-02, sahibi:** *"SOLID prensiplerine takıntılıyım. o yüzden ayrıştırmak mantıklı mı
diye soruyorum. ama kaçarı yoksa kabul ediyoruz."*

Kayda değer, çünkü yukarıdaki her cevabın çerçevesi bu ve nasıl yazılmaları gerektiğini
değiştiriyor: burada bir "hayır", tercih değil ölçüm olmak zorunda — ve hayır olmasına da
izin var.

**Dört cevaptan üçü SOLID'le tartışmıyor, onunla aynı şeyi söylüyor**; önce bunu belirtmeye
değer.

- **JSON taşıması, yapılmış hâliyle SRP.** `items.js` 256 bildirim ve bir fonksiyon
  tutuyordu; `crafting_recipes.js` 148 bildirim ve hiç fonksiyon. Bu, tek dosyada veri ve
  davranış demek; ayırmak birini 5.464 satırdan 4.901'e, diğerini 2.277'den 761'e indirdi ve
  **kurulan nesnelerin 112'de 112'si ile 148'de 148'i birebir aynı** kaldı. Sorumluluk
  ayrımı gerçekti ve ölçülebilirdi.
- **Yanında OCP'yi de getirdi.** Levazımcının rafları, panonun iş havuzları ve av hedefleri
  kayıt defterlerinden *türetiliyor*: bir parça eklemek rafı, bir düşman eklemek havuzu
  büyütüyor ve hiçbir şey elle düzenlenmiyor. Bu, değiştirmeye kapalı genişletmeye açık
  olmanın kendisi — ve 197 parça adının elle yazılmış listesinin reddedilme sebebi de bu.
- **Nadir şeyleri test edilebilir kılan şey DIP'ti.** `rolls_a_sighting` ve
  `generate_guild_job`, `Math.random`a uzanmak yerine `random`ı parametre olarak alıyor; on
  binde bir olan bir olayın hiç kontrolü olmasının tek sebebi bu — iki ucu birden yedi oyun
  gününde değil bir milisaniyede sürülüyor.

**Ve tek "hayır", ret değil bir SOLID argümanı olarak yeniden.** `main.js` 4.930 satır ve
**96 `window.*` bağı** taşıyor; o bağlar onun seçtiği bir sorumluluk değil: `index.html`teki
her `onclick` bir global istiyor, yani `main.js` *DOM'un ulaşabildiği dosya*. Markup'ın oyuna
nasıl seslendiğini değiştirmeden onu bölmek, 96 bağı başka bir yere taşır ve hiçbir şeyi
ayırmaz — bağlantı `main.js`te değil, `index.html`te.

Bu da işi reddetmek yerine yeniden çerçeveliyor: **ayrılacak şey DOM'un giriş noktası** ve
ölçülebilir hedef o sayı. `display.js` ucuz yarısının işlediğini kanıtladı — beş panel çıktı,
tek yönlü import, döngü yok — ve `guild_display.js` aynı desenin tekrarı. Yani plan "panelleri
çıkarmaya devam" olarak kalıyor ve testi şu: `main.js` küçülürken 96 düşüyor mu? Düşmüyorsa
bölme kozmetikti.

**Öteki hayır daha küçük ve daha keskin.** `quests.js`i JSON'a taşımak kendi sayılarında
düşüyor: 23 görevinin 20'si fonksiyon taşıyor, çünkü bir görevin koşulu ve ipucu hesaplanıyor.
Onları ifade etmek zorunda kalan bir veri biçimi dile dönüşür; yani orada "veriyi davranıştan
ayır", adı SRP olan ve gerçekte yeni bir yorumlayıcı olan bir şey olurdu.

**Gitmesi gereken sıra, küçükten büyüğe.**

1. `checkJs` ile `jsconfig.json` ve import'u olmayan ya da bir tane olan yaprak modüllere
   `// @ts-check`: `game_time.js`, `misc.js`, `config.js`, `reputation.js`. Ne kadar şey
   bulduğu ölçülür.
2. Hisle değil ölçümle seçilmiş tek bir bölme: `items.js`, yorumlarında kendini zaten
   grupladığı eşya ailelerine.
3. `display.js` ancak ondan sonra ve mevcut beş bölmenin gittiği gibi panel panel.

**1. adım tamam ve ölçüm saklanmaya değer.** `checkJs` her şey için açıkken TypeScript, iki
saniye kadar bir sürede **56 dosyanın 37'sinde 1690 hata** bildiriyor. Bu yüzden
`jsconfig.json` içinde `checkJs` `false` ve dosyalar `// @ts-check` taşıyarak dâhil oluyor:
**19 dosya hâlihazırda temiz** ve artık pragmayı taşıyor, `npm run check:types` de geçiyor.
Dâhil olma yönteminin tehlikesi, geçmeye devam etmek için yalnızca *geriye* gitmesinin yetmesi
— pragmayı sil, hatalar yok olur — bu yüzden `check_checked_files_stay_checked` hangi
dosyaların geçeceğini TypeScript'e soruyor ve bunlardan biri dâhil edilmemişse başarısız
oluyor. Bakımı gereken bir liste yok, eşlenmesi gereken bir sayı da yok. Temiz olduğu hâlde
dâhil etmediğim `weather.js`'i bu şekilde yakaladı.

Pist, 1b adımı tahmin değil ölçüm olsun diye. Altı dosya temizliğe bir ya da iki hata uzakta —
`world_index.js`, `ui_helpers.js`, `person.js`, `pathfinding.js`, `activities.js` (birer),
`conditions.js` ve `combat_stances.js` (ikişer) — diğer uçta ise `main.js` (294),
`data/dialogues.js` (289), `crafting_recipes.js` (160) ve `data/locations.js` (157) var. Dört
kod toplamın üçte ikisi: TS2345 yanlış argüman türü (679), TS2339 çıkarsanan şekilde olmayan
özellik (448), TS2353 şeklin bildirmediği bir özelliği taşıyan nesne sabiti (267), TS2740
şeklin gerektirdiği özellikleri eksik bırakan sabit (99). Son ikisi tek bir şey: **veri
dosyaları, hiçbir kurucunun adını anmadığı fazladan alanlar taşıyan içerik nesneleri
bildiriyor** — kayıt defteri kontrollerinin öbür yönden söyleyip durduğu bulgunun aynısı.

**1b adımı tamam ve bütün bu işin bedelini o ödedi.** O yedi dosyanın hepsi temiz ve dâhil —
**artık 56'nın 26'sı**, 19'dan yukarı; proje toplamı 30 dosyada 1672 hata. Dokuz hatadan ikisi
gerçekti: `combat_stances.js`, `this.target_count`i atamasından iki satır önce test ediyordu,
yani `target_count: 0`da fırlatan bir doğrulama bir kez bile koşmamıştı; ve `enemy_zones`,
sırasız mekân nesneleri döndürdüğü hâlde sıralı görünen adlar döndürüyor diye belgelenmişti —
TypeScript'in her çağırıcıyı yanlış saymasının sebebi de bu. Bir tanesi daha gerçek *gibi*
göründü ama değildi: `zone.id` sorunsuz okunuyor, çünkü `locations.js` her mekân için bir id
geri dolduruyor — dört adet düz `id:` bildiriminden akıl yürütmek yerine ölçüldü, 46'nın 46'sı
çözülüyor. Muhafız `check_constructors_do_not_test_fields_before_setting_them` ve bilerek dar:
o kuralın geniş hâli burada on üç doğru satır buluyor.

**Sırada 2. adım var, 1c ise opsiyonel.** Temizliğe iki hata mesafesinde başka bir şey kalmadı;
en ucuz kalan dosyalar dörderle `mods/glassmaking.js` ve `data/storage.js`, sonra altışarla
`races.js`, `market_saturation.js` ve `crafting.js`. O listeyi yürümeye devam etmek mi yoksa
`items.js` bölmesine geçmek mi — bu bir ölçüm değil, sahibinin hangisini tercih edeceğine dair
bir yargı.

**Ve iki sessiz arıza, çünkü bu kontrol tek bir soruyu cevaplamak için var ve onu iki kez
yanlış cevapladı.** İlk seferde kontrol edilmeyen 38 dosyanın tamamının pragmaya ihtiyaç
duyduğunu bildirdi: sonda yapılandırması geçici dizine yazılmıştı, `include` ise yapılandırma
dosyasının kendi dizinine göre çözülür, dolayısıyla hiçbir şeyle eşleşmedi ve tsc *hiçbir şeyi*
kontrol etmemiş olarak temiz çıktı. Düzeltildikten sonra aynısını yine yaptı: `execFileSync`
varsayılan olarak bir megabaytlık `maxBuffer` kullanıyor ve bir buçuk megabaytlık hata metni
ona **hata fırlatmak yerine süreci öldürüp boş çıktı döndürtüyor**. Her iki seferde de "çıktı
yok", "her şey geçiyor" diye okundu. Kontrol artık tsc kendi başına çıkmadığında hiç cevap
vermeyi reddediyor ve üçüncü arızayı yüzeye çıkaran da bu muhafız oldu: Node bir `.cmd`
sarmalayıcısını kabuk olmadan başlatmıyor, bu yüzden tsc TypeScript'in kendi giriş betiği
üzerinden `process.execPath` ile koşuyor.

**Muhafız.** Bir bölme ne yaparsa yapsın davranışı değiştirmemeli ve bu projenin bunu söyleyecek
aracı var: `npm run check:bundle` paketin hâlâ değerlendiğini, `Verify_Game_Objects()` kayıt
defterlerinin hâlâ çözüldüğünü, `npm run check:save` gerçek bir kaydın hâlâ yüklendiğini
kanıtlıyor. "Hiçbir dosya N satırı geçmesin" kontrolü ise ölçümden değil bir sayıdan uydurulmuş
bir kural olurdu ve bu dosyada onlardan yeterince var.

### P-43 — v0.8, Beyond the Lake `open`

İkinci ana ark ve P-14'ün ardılı. Brief onu ve onun için altı odağı adlandırıyor (TODO
bölüm 16): Ancient Forest, navigasyon, nadir karşılaşmalar, tier 5 toplama, duruş odaklı
dövüş ve çevresel keşifler. Aşağıdaki, bu altısının koda karşı ölçülmüş hâli — çünkü üçü
zaten bir biçimde var ve biri hiç yok.

**P-41 ve P-42'den sonraya bilerek dizildi.** Brief'in kendi koşulu *"v0.7 bittikten ve bütün
quality gate'ler geçtikten sonra v0.8'e geç"* — ikisi de artık doğru — ama sahibinin önünde
hâlâ açık talepleri var ve bir ark, onları bırakmak için onların beklemesinden daha kötü bir
sebep.

**Kapı çoktan yazılmış ve faz 7 üstüne bir iz bile koymuş.** `desc location Forest lake`,
gölün şelalenin kayalığı ile *"ormanın kalbi olsa gerek bir yere açılan yoğun bir örtü"*
arasında durduğunu söylüyor. Gölün tek çıkışları, geldiği Forest road ve `Frogs` — gölü
`parent_location` alan bir dövüş alt-alanı. Yani örtü, haritadaki tek açılmamış yön ve bunu
kimse planlamadan önce kanon adlandırmış. Faz 7'nin üçüncü izi, yatırılmış sazlar, tam olarak
*"karşı kıyıda, örtünün suya indiği yerde"* duruyor. İzler kapıyı gösteriyor.

Lake beach ve Waterfall basin gölün ötesinde **değil** ve biri o yöne doğru inşaya başlamadan
önce bunun yazılması gerekiyor: ikisi de Riverbank'ten sarkıyor, tırmanarak ve halatla
inilerek varılıyor. "Forest Lake'in ötesi" örtüdür, başka bir şey değil.

**Navigasyon yok ve yerine genişletilecek bir mekanizma var.** `Navigation`, `Pathfinding` ya
da `Orienteering` diye bir yetenek yok — brief hiç inşa edilmemiş bir yeteneği varsayıyor.
Var olan şey, bir bağlantı üzerindeki `travel_time_skills`: bütün haritada sekiz kez ve
yalnızca iki yetenekle kullanılıyor — `Scrambling` dört, `Climbing` dört. Yani bir yeteneğin
kısalttığı yolculuk burada zaten birinci sınıf bir fikir ve bağlantıları uzun olup yetenekle
kısalan bir bölge, yeni bir sistem olmadan navigasyondur.

**Nadir karşılaşmaların mekanizması artık var ve bir sürüm yaşında.** v0.7.42'nin
`rolls_a_sighting`i, oyundaki ilk "oyun içi dakika başına, mekâna bağlı" zarı; bir ödül bloğu
içindeki `chance_of` (iki kullanım, ikisi de `locations.js` içinde) ise tamamlama başına
karşılığı. Yani bu odak icat değil genişletme — **ve bir dünya-olayı çatısına dönüşmemeli.**
Q-10'un Marrowmoth'un takvimi için reddettiği tuzağın aynısı ve `data/marrowmoth.js` bunu
kendi yorumlarında söylüyor. Aynı tesisatı isteyen ikinci bir olay, soyutlamanın kendini hak
ettiği andır; ondan önce değil.

**Tier 5 toplamanın gerçek ve ölçülebilir bir boşluğu var; onu doldurmak geri kazanım.** Black
iron en üst malzeme kademesi — `Black iron ore`, `Black iron ingot`, `Black iron plate`,
`Black iron chainmail`, hepsi bildirilmiş ve cevheri tüketen iki tarif var. **Oyunda onu
toplayan hiçbir şey yok.** Tek kaynağı iki tüccar. Toplamanın kendisi 26 aktivite boyunca
`skill_required: [20, 35]`te tepe yapıyor. Yani bu odak tam olarak şu: gölün ötesinde, black
iron cevherinin 35'in üstünde topraktan çıktığı bir yer. Beslediği bütün eşyalar ve tarifler
zaten var ve şu anda yalnızca satın alınabiliyor.

**Duruş odaklı dövüş, hâlihazırda var olan yedi duruşu genişletiyor** — normal, quick, heavy,
defensive, wide, berserk, flowing water — ve faz 6, duruş seçimini stat satırlarıyla değil
dört düşman üzerinde `on_hit` / `on_damaged` ile çoktan önemli kıldı;
`check_stance_reactions_name_real_stances` de onu koruyor. O fazın kaydettiği dürüst sınır
hâlâ geçerli: bir hook `add_active_effect`e ve loga uzanır, dolayısıyla bir tepki her zaman
"nasıl durduğun, bunun sana ne yapabileceğini değiştirir"dir.

**Çevresel keşifler, evi olmayan tek odak.** Keşifler paneli beş kaynak türü biliyor —
`gather`, `drop`, `trade`, `craft`, `train` — ve her biri bir **eşyanın** nasıl bulunduğunun
bir yolu. Eşya olmayan bir şey için tür yok. Ya panel altıncı bir tür kazanır, ya da çevresel
keşif hiç bir Keşifler özelliği değildir ve faz 7'nin izlerinin gittiği yere, lore ipliklerine
aittir. Bunun inşa sırasında değil öncesinde kararlaştırılması gerekiyor.

**Brief'in yasakladığı şey ve faz 7'nin çoktan harcadığı şey.** *"Dört bacaklı kuşu doğrudan
bir boss işareti yapma."* Ve v0.7.42, Q-13'ü onu yaklaşık on binde bir karşılaşılabilir
kılarak cevapladı — yani bu ark, oyuncunun onu görmüş **olabileceği** bir dünyayı miras
alıyor ve iki yönde de varsayım yapamıyor. `has_seen_the_animal` üzerine bir kapı, neredeyse
hiç kimsenin geçmediği bir kapı olurdu; görmediklerini varsayan bir bölge ise görenler için
yanlış olurdu.

**Q-15 — Ancient Forest neye açılıyor ve kuş neye dönüşüyor? ÖNERİ: ne bir boss ne bir cevap.**
Brief yaratığın bir boss işareti olmadığını söylüyor ve P-14'ün bütün yöntemi arkın hiçbir şeyi
adlandırmamasıydı. Öneri şu: v0.8 bir **yer**, bir hesaplaşma değil — örtü, kendi işi olan bir
bölgeye açılıyor (black iron, yetenekle kısalan uzun yolculuklar, nadir karşılaşmalar) ve
hayvan, bölgenin hedefi olmak yerine sakini olarak kalıyor. Bunun karara bağlamadığı şey,
bölgede hayvanı *bilen* bir şey olup olmadığı ve bu sahibinin kararı.

**Muhafız, her şeyden önce.** Bu öneri bölgeye ikinci bir kapı açmamalı: örtü,
`locations["Forest lake"]` üzerinde tek bir bağlantı ve faz 7'nin sazları çoktan onu
gösteriyor; iki yerden varılan bir bölge, izleri süs hâline getirir. Ve inşa edilecek ilk
parça, P-14'ünkiler gibi ölçülmek zorunda; çünkü brief'in altı odağı altı iş parçası değil —
ikisi (navigasyon, duruş dövüşü) bir bölgenin içerdiği özellikler değil, sahip olduğu
niteliklerdir.

### P-45 — Onda duran dört beceri `open`

Sahibinin talebi: *"night vision, literacy, sleeping, farming gibi lv 10 max yeteneklerin üst
seviyelerini arttıralım."*

**Ölçüldü ve tam olarak o dördü.** Oyunun becerileri `max_level`e göre şöyle gruplanıyor:

| tavan | kaç | hangileri |
|---|---|---|
| 10 | **4** | Night vision, Farming, Sleeping, Literacy |
| 20 | 1 | Presence sensing |
| 25 | 1 | Haggling |
| 30 | 16 | duruşlar, Shield blocking, Stance mastery … |
| 40 | 7 | Perception, Breathing, Regeneration … |
| 50 | 5 | Running, Climbing, Swimming … |
| 60 | 32 | Combat, Evasion, Unarmed … |

Yani bu dördü bir kademe değil, zeminin kendisi — ve bir üst basamakta tek bir beceri var.
Bunlardan birini yükselten bir oyuncu, oyundaki başka hiçbir şey durmadan çok önce tavana
çarpıyor.

**Bir sayı seçilmeden önce karara bağlanması gerekenler, çünkü tavan yalnızca bir sayı
değil.** Bu dördünün her birinin milestone'ları ve seviyeyle ölçeklenen bir etkisi var; yani
milestone'ları uzatmadan tavanı yükseltmek, hiçbir şey satın almayan seviyeler veriyor — ki
bu tavandan kötü, çünkü tecrübe gerçek, ödül değil. Beslenmesi gerekenler
`get_next_skill_milestone` ve `get_unlocked_skill_rewards`.

**Ve dördünden ikisinin etkisi öylece ölçeklenemez.** Sleeping ile Night vision bir cezayı
azaltıyor; sıfırın ötesine azaltılmış bir ceza bonustur ve bu, "daha ileri gitsin"den farklı
bir tasarım kararı. Literacy okumayı hızlandırıyor, Farming bir aktiviteyi besliyor; o ikisi
temiz biçimde uzuyor.

**Tavana ulaşmış bir beceri xp'sini tutuyor, yani tavanı yükseltmek hiçbir şey
kaybettirmiyor — sahibi sorduğu için ölçüldü.** *"literacy şu an seviye 10, hala exp almaya
devam eder mi? maximuma ulaşsa da exp almaya devam etmesi gerekiyor ve eğer bir arttırım
olursa kayıp yaşanmaması gerek."* Kayıp yok: `Skill.add_xp`, `this.total_xp`'yi
**koşulsuz** yazıyor — seviyeyi durduran `if(this.current_level < this.max_level)` dalından
önce; kayıt yalnızca `{total_xp}` saklıyor; ve yükleyici seviyeyi o xp'yi tekrar oynatarak
kuruyor. Yani sonradan yükseltilen bir tavan, birikmiş xp'yi bir sonraki yüklemede seviyeye
çeviriyor — migration yok, onarılacak bir şey yok.

Bu, bu önerinin aksi hâlde taşımak zorunda olacağı riski ortadan kaldırıyor ve sırayı da
değiştiriyor: tavanlar, oyuncular onlara karşı xp biriktirmeden önce yetişme telaşı olmadan,
milestone'lar hazır olduğunda yükseltilebilir.

**Muhafız.** `check_skill_effect_descriptions` ve milestone kontrolleri, bir beceriyi
ulaşabildiği her seviyede ne yaptığını anlatmaya çoktan bağlıyor; yani milestone'larının
ötesine yükseltilmiş bir tavanın orada düşmesi lazım, yeni bir kontrole gerek kalmadan.
Buna güvenmeden önce doğrulanmaya değer.

### P-46 — Changelog sayfası nerede kaldığını hatırlıyor `open`

Sahibinin talebi, dört parça hâlinde: *"changelog'ta major sürümleri filtreleyebilelim örn
v0.7 v0.6 gibi, normalde hepsi seçili gelsin, ancak sadece v0.7 de bırakırsam bunu
hatırlasın ve sonraki açışımda v0.7'yi göstersin. ayrıca son changelog'a baktığım sürümü de
hatırlasın ve o aralığın tamamını açık göstersin. eğer hepsini gördüysem sonuncu açık kalmaya
devam edebilir. eski kayıtla yükleyip yeni sürüm varsa changelog üzerinde eski kayıt sürümü
örn 0.7.30, son sürüm 0.7.45. yani arada 15 sürüm fark var. ufak (+15) göstersin ve ona
basarak changelogu açtıysam 15 sürüm logu açık gelsin."*

**Dört özellik ve ayrılmaları gerekiyor, çünkü yalnızca ikisi sayfayla ilgili.**

- **Major filtresi** sayfa durumu: sürüm başlıklarını oku, minor'a göre grupla (`v0.7`,
  `v0.6`), aç/kapa olarak sun, varsayılan hepsi açık. Hafızası bir tarayıcı meselesi, kayıt
  meselesi değil — sayfa oyunun içinden olduğu kadar dışından da açılıyor.
- **Son bakılan sürüm** aynı türden durum ve aynı depoyu paylaşabilir.
- **(+15) göstergesi farklı** ve sayfadan çok oyuna ihtiyaç duyan parça o: yüklenen kayıttaki
  sürümü mevcut sürümle karşılaştırıyor. Kayıt sürümünü çoktan taşıyor — P-38'in bütün sebebi
  bu — yani sayı bir çıkarma, ama **aradaki sürüm sayısıyla** sayılmalı, sayıların kendisiyle
  değil: v0.7.30'dan v0.7.45'e on beş, ancak aradaki her sürüm varsa; hangilerinin var
  olduğunu söyleyen liste de changelog.
- **Göstergeden açmak**, sayfaya neyi açacağının söylenmesi demek; bu da hatırlanan durum
  değil, bağlantı üzerinde bir parametre.

**İnşadan önce karara bağlanması gereken: hafıza nerede duracak.** Sayfaya anahtarlanmış
`localStorage` bariz cevap ve yeni bir kayıt anahtarı istemiyor — ama tarayıcı başına, yani
dışa aktarılan bir kaydı takip etmiyor ve oyuncu makine değiştirince hayatta kalmıyor.
Alternatifi `game_state`; o düzgün kalıcı ama bir okuma tercihi için changelog sayfasını kayıt
sözleşmesinin içine çekiyor. **ÖNERİ: iki filtre için `localStorage`, gösterge için kaydın
kendi sürümü** — ki bu hiç yeni depo istemiyor.

**Ve sahip olunmaya değer bir muhafız.** O on beşi sayan şey, `changelog.html`in gerçekten
listelediğiyle uyuşmak zorunda ve iki HTML kopya da birbiriyle uyuşmalı —
`check_changelogs_cover_version` iki sayfayı da yayımlanan `game_version` için bir girdi
taşımaya çoktan bağlıyor; yani iki nokta arasındaki sürümleri saymak, aynı listenin ikinci
kez okunması.

### P-47 — Envanter nasıl sıralandığını hatırlıyor `open`

Sahibi: *"envanter seçimi sıralaması hatırlamalı."*

**Ölçüldü: onu kapsayan bir şey yok.** `option_remember_filters` var ve kapsıyormuş gibi
duruyor — kapsamıyor. Yalnızca `game_options.remember_message_log_filters`ı ayarlıyor, başka
bir şey yapmıyor; yani mesaj logunun filtreleri yeniden yüklemeyi atlatıyor, envanterin
sıralaması atlatmıyor. Sıralamanın kendisi dört düğmeyle birlikte `inventory_display.js`
içinde yaşıyor ve hiçbir yere kaydedilmiyor.

**Bu da P-46'nın sorduğu sorunun aynısını soruyor ve ikisi birlikte cevaplanmalı:** bir
görüntü tercihi kayda mı yoksa tarayıcıya mı ait. Envanter sıralamasının kayıt üzerinde
changelog filtrelerinden daha güçlü bir hakkı var — oyunun dışında okunan bir sayfa hakkında
değil, karakterin kendi ekranı hakkında bir tercih — ve `game_options` böyle şeylerin çoktan
yaşadığı ve çoktan kalıcı olan yer. **ÖNERİ: `remember_message_log_filters`ın yanında
`game_options`, ve sütunun yanı sıra yönü de** — çünkü seçili düğmeye basmak sırayı tersine
çeviriyor ve birini öbürü olmadan hatırlamak, seçimin yarısını geri yüklemek olurdu.

**P-46 ile birlikte yapılmaya değecek kadar küçük**, kendi başına değil; çünkü ikisi de
tercihlerin nerede yaşadığına dair tek bir karar.

### P-48 — Körfezde bir sandık ve Keşifler'de neyin aranabildiği `open`

Aynı oturumdan iki küçük talep; ikisi de bir şey inşa etmekten çok var olanı genişletmekle
ilgili olduğu için birlikte tutuluyor.

**Balık tutarken sandık.** Sahibi: *"çok nadir olmakla birlikte (dövüştende nadir) körfezde
balık tutarkende sandık denk gelebilir."* Mekanizma var ve ölçülü: bir ödül bloğunun
içindeki `chance_of` bir grup atıyor ve Köy'ün `work at the lock` eylemi tam olarak bunu
kullanıyor — sahte dipli bir sandık, bir tuzak, bir yün atkı. Yeni olan, bunu bir eyleme
değil bir **toplama aktivitesine** koymak; kontrol edilmesi gereken yer de burası: bir
aktivitenin ödülleri bir eylemin ödüllerinden farklı bir yoldan işleniyor ve hiçbir şeyin
atmadığı bir `chance_of`, bu projenin bulup durduğu sessiz arızanın ta kendisi.

**"Dövüşten de nadir"** seçilecek değil türetilecek kısıt; yani sayı, hisse göre değil
dövüşün gerçekte ne düşürdüğüne göre gelmeli.

**Keşifler yaratıkları da aramalı.** Arama kutusu eşya listesini süzüyor; oysa panel bir
"nerede idman edilir" bölümü de tutuyor ve yaratıkları düşüren kaynak olarak adlandırıyor,
sahibi de tek kutunun hepsini bulmasını bekliyor. Filtreyi yazmadan önce orada gösterilen
yaratık adlarının görünen ad mı kayıt anahtarı mı olduğunu kontrol etmeye değer, çünkü ikisi
farklı ve kutu, oyuncunun okuyabildiğiyle eşleşmek zorunda.

## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar. Burada kalanlar projenin tamamını ilgilendiriyor; tek bir
önerinin sorduğu soru, cevaplandığı anda o önerinin içine geçer. Q-7 ile Q-10 ve Q-13 de
oraya gitti. P-14 o zamandan beri bitti ve bu dosyadan ayrıldı; dolayısıyla onların kaydı
[CHANGELOG.TR.md](CHANGELOG.TR.md) içinde — numaralar yeniden kullanılmıyor ve onları anan
commit'ler ile girdiler hâlâ çözülüyor.

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

### Q-12 — Bir kitap, okunmak için beceri isteyebilmeli mi? **KARAR: evet, ve bu bir seri**

Teklifin cevabı değil. Kitap okumak genel olarak hiçbir şey istemiyor ve **Okuma becerisini
artırıyor** — bir kitabın var olma sebebi de bu. Ama bir kitap, o becerinin *hakkında* ve
okuyanın ulaşmış olması gereken bir seviyedeyse beceri isteyebilir: kılıç becerisi veren bir
kitabın hiçbir şeye ihtiyacı yokken, bir **ustalık serisi** — "Kılıç ustalığı" ve benzerleri —
derinleştirdiği beceride 20. seviyeyi isteyebilir.

Yani `required_skills` **kalıyor ve bağlanıyor**; P-26'nın silinecek bir alan değil gerçek bir
özellik dediği yarı bu. Yanında gereken şey reddetme: henüz okuyamadığınız bir kitabın bunu ve
ne istediğini söylemesi gerekir, yoksa kimsenin göremediği kilitli bir kapıdır.

`finish_reward` bu cevabın dışında. Hiçbir kitap onu ayarlamıyor ve hiçbir şey okumuyor; yani
hâlâ bir tuzak — silmek hiçbir şey kaybettirmiyor ve aynı soru değil.


### Q-14 — Lonca işleri: dört karar **KARAR VERİLDİ, dördü de**

**1. Kademeler.** Dokuz basamaklı bir merdiven: **F, E, D, C, B, A, S, SS, SSS**. Bir oyuncu
panoda **kendi kademesinin, bir altının ve bir üstünün** işlerini görüyor — D'deyken E, D ve C.
Kendi kademenizin üstünden iş almak sizi daha hızlı yükseltiyor ve bunu yapmak için daha zor iş
veriyor; panonun sunduğu seçimin tamamı bu. **SS ve SSS nadir ve zorlaması amaçlanan
kademeler.**

*Listeden değil örnekten okundu: liste "F, D, E, C, A, S, SS, SSS" diyor, örnek ise — "D'deyken
E, D ve C alabilir" — E'yi D'nin altına, C'yi üstüne koyuyor; bu da azalan harf merdiveni. B de
aynı okumayla yazıldı. İkisinden biri yanlışsa düzeltilecek satır bu, çünkü kademe kaydedilen
bir değer ve sonradan yeniden adlandırmak bu projenin yapmadığı şey.*

**2. Yenilenme: oyun günü başına, ve alınmış bir iş asla kaybolmuyor.** Pano yeniden atıyor;
oyuncunun kabul ettiği iş atmıyor. Yenilenmeyi yavaş olanın cezası olmaktan çıkaran şey bu; ve
kayıt biçimini zorunlu kılan da bu — kabul edilmiş bir iş yeniden yüklemeyi atlatmalı.

**3. İtibar: kademe için sabit bir miktar, artı işin zorluğu için bir miktar.** Yani aynı
kademedeki iki iş aynı ödemiyor; zor olan brief daha çok ödüyor. Ölçülmüş kısıt yerinde:
`check_a_standing_gate_can_be_reached` tekrarlanabilir bir kaynağı sınırsız sayıyor, yani
panonun toplamda ödeyebileceğine hâlâ bir tavan gerekiyor; yoksa o kontrol Lonca için susuyor.

**4. Zorluk brief'i ölçekliyor, kurguyu değil.** "Şundan 10 getir", "30 getir" oluyor; "100
öldür", "300 öldür" oluyor. Her kademede aynı iş türleri ve işi sayılar yapıyor — isteğin
adlandırdığı iki tür (şu kadar avla, şu kadar topla) da bu yüzden başlanacak doğru ikisi.

**Hâlâ açık ve küçük:** loncaya özel eşyaların ne işe yaradığı. Teklifin cevabı — component'ler,
itibar fiyatına; çünkü 175'ini kimse satmıyor ve onları itibarla almak, zanaat merdivenini
atlamayı satın alınan değil hak edilen bir şey yapıyor — çürütülmedi ve sahibi aksini söyleyene
kadar geçerli.


---

## Bu dosyanın kuralları

- Her direktif için bir öneri; numaralandırılır ve asla yeniden numaralandırılmaz.
- Bir öneri `done` durumuna geldiğinde açıklaması
  [CHANGELOG.TR.md](CHANGELOG.TR.md) dosyasına yazılır ve ardından öneri bu
  dosyadan çıkarılır. Kaydı orada, geliştirici derinliğinde durur; burada ikinci bir
  kopya tutmak çalışma listesini arşive çevirir ve hâlâ açık olanı gömer.
- Kararlar [Bekleyen kararlar](#bekleyen-kararlar) bölümünden onları tüketen
  öneriye taşınır ve cevap kayda geçirilir.
