<!-- doc-source: docs/PROPOSALS.md  doc-version: 139 -->

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

**Faz 6 — sistem geçişi.** `done`. Birbirinden bağımsız dört parça, dördü de yayınlandı.

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
- **Arc'ın para kuyusunun mevcut ekonomiye göre fiyatlanması.** `bitti`, **v0.7.10**
  olarak. Ölçüldü: tek seferlik quest parası 43.500, lonca faktörünün üç teslimatından
  27.000 daha, koleksiyoncuda 30.000'lik bir kuyu ve **hiçbir yerde tekrarlanabilir para
  ödeyen aksiyon yok** — üç yerleşim aksiyonu birer kez ödüyor. Yani tekrarlanabilen tek
  gelir ücretli bir iş ve onların en iyisi birim başına 50 ödeyen devriye. Kayıkçı *sefer
  başına* 25.000'di; bu 500 birim devriye ve bütün oyunda aşağı yukarı bir karşılanabilir
  yolculuk demek: çamuru geçmenin pahalı yolu, bir kez kullandığınız bir yoldu. Artık
  6.000 — faktörün en küçük teslimatı, bir günlük iş parasına bir kayık yolculuğu, 120
  birim.

  **Muhafız yok ve bulgu da bu.** Bir kural yazıldı, sonra kaldırıldı: "tekrarlanabilir
  bir fiyat, en pahalı tek seferlik fiyatı aşmamalı." 25.000'de geçiyor, çünkü 25.000
  koleksiyoncunun 30.000'inden küçük — yani yazıldığı hatanın tam kendisini onaylardı.
  Yakalayan her versiyonu uydurulmuş bir sabit istiyor; çünkü asıl soru, bir fiyatın
  *oyunun o noktasındaki gelire* göre durumu ve bu bir yargı. Bunun yerine yukarıdaki
  sayılar öneriye ve kaynakta fiyatın yanına yazıldı; böylece sonraki fiyat seçilmek
  yerine türetiliyor.
- **İtibar sonuçlarının ceza değil, dünya durumu gibi okunması.** `bitti`, **v0.7.11**
  olarak; ve fazı tamamlıyor. Saymanın kapanış repliği seçimi zaten çerçevelemişti —
  *"Yazdığım gün bu bir lonca meselesi olur"* — yani içeriğe karar uydurmak gerekmedi,
  yalnızca kararın öteki tarafı gerekti. Kâtip dosyayı açıyor: Guild +60, Town +20,
  **Slums −40** ve bunun rıhtımdan geldiği bilinecek. Kimse zorlamıyor; arc her iki hâlde
  de bitiyor ve replik öylece duruyor. Kenar mahallenin yaşlı kadını cevap veriyor, bir
  bayrağa bağlı, ve sinirli değil — söylediği şu: bir süre boyunca, buradan biri yazıya
  geçmesini istemediği bir şeye sahip olduğunda, onu kimin yanında söyleyeceğini
  düşünecek. Fazın istediği fark da bu: bir yerin bir fikri olması, bir puanın kesilmesi
  değil.

  350 kazanılabilir değere ve arc'ın 200 ile 250'deki kendi kapılarına karşı −40. Sağlam
  hattı bir süre menzil dışına çıkarabiliyor; düzlükleri yürümek bedava ve kayıkçı 6.000,
  yani hiçbir şey kapanmıyor.

  **Ve itibarın artık bir tabanı var**; bu, oyunun eksiltme yapan ilk ödülünden önce
  girmek zorundaydı. `add_reputation` sınırsız bir `+=` kullanıyordu ve
  `update_displayed_reputation` yalnızca 0'ın üstündeki bölgeleri çiziyor — yani −20'deki
  bir oyuncu hiçbir satır görmezdi, bütün kapılar da kapalı kalırdı: aynı anda görünmez ve
  sonuçlu. 0'da tabanlandı, altı test, tabanı yeniden kaldırarak negatif test edildi.

**Faz 7 — v0.8 hazırlığı, *Beyond the Lake*.** `active`. Önce izler — ayak izleri,
tüyler, ses, kırılmış örtü — ve oyuncu yaratıkla karşılaşmadan önce onun var olup
olmadığından emin olmamalıdır.

- **İlk iz.** `done`, **v0.7.37** olarak. Orman gölünde `read the shallows`: dört parmak,
  arkalarında sertçe itilmiş kum, bir balıkçıl için fazla büyük ve bir yaban domuzu için
  yanlış. Hiçbir şey adlandırmıyor, hiçbir şey açmıyor. Gölün kendi sesleri zaten *"bir
  hayvan su içmeye iniyor"* diyordu; yani su kıyısını kanon, kimse planlamadan önce
  seçmişti.

  `required` kapısı yok ve bunu komşusu öğretti: `read the departures` Algısını `conditions`
  içinde tutuyor ve hiçbir şeye kapatmıyor; yani aksiyon denenmek için hep orada ve zayıf bir
  göze, daha iyi bir gözün ne okuyacağı söyleniyor. Sonrasında gölün altı sesinin arasına bir
  bayrağın arkasından üç ses daha karışıyor — Marrowmoth limandayken rıhtımın kullandığı
  biçim.

- **İkinci iz.** `done`, **v0.7.38** olarak. Şelale havzasında `read the rock shelters`;
  sığlığı okumuş olmaya kapatılmış ve o zamana dek sebebiyle reddediliyor. Bir insandan uzun
  aşınmış bir yer ve ezilmiş değil açılmış yengeç kabukları; zaman kipi "burada bir şey
  durmuştu"dan "burada bir şey yaşıyor"a yükseliyor ve hiçbir şey adlandırılmıyor.

  **Islak orman ölçüldü ve elendi**, ki asıl saklanmaya değer bulgu bu: sesleri zaten bu
  kayıtta ve `cut the standing flax` ipliği açıkça kapatıyor. Oraya bir iz koymak, oyunun
  söylemeyi bitirdiğini yeniden açardı.

- **Üçüncü iz.** `done`, **v0.7.39** olarak ve farklı bir tür: bir angarya değil bir yer.
  Barınaklara bakıldıktan sonra Orman gölünün açıklaması bir paragraf kazanıyor — yatırılmış
  bir sazlık şeridi, yattıkları yerde kahverengi dik durdukları yerde yeşil, oyuncu ilk
  geldiğinden beri yatık. Kırılmış örtü ve değişen şey okuyan.

  Açıklamanın yerine geçmek yerine ona ekleniyor, böylece iki durum ayrışamıyor.

- **Karşılaşma.** `done`, **v0.7.42** olarak, ve bu Q-13'ün cevabının inşası: oyun içi dakikada
  bir zar, iz taşıyan iki yerde, barınaklar okunduktan sonra. Suyun kenarında yaklaşık yedi
  oyun günü durmaya karşılık geliyor.

  **Oran sahibinin; birim ölçüldü.** "On binde bir", neyin on binde biri olduğu bilinmeden bir
  şey söylemiyor ve mevcut üç kadanstan ikisi olayı bambaşka bir olay yapıyor. Bir aksiyon
  tick'i, aksiyon-saniyesinin onda biri: olayı birkaç dakikada bir düşürürdü. Bir mekâna varmak
  uzun bir kayıtta birkaç yüz kez olur: hiç düşürmezdi. "Neredeyse hiç kimse, ama gerçekten
  orada" ifadesini yalnızca dakika tick'i veriyor ve Q-13'ün çizdiği ayrım da buydu.

  **Tüy izini de harcıyor.** O iz iyi bir sebeple zordu: envanterdeki bir eşyanın bir şey
  yapması gerekirdi. Burada tüyler karşılaşmanın içinde — taşınan değil, bakılan; ki bu, fazın
  kendi saydığı iki dürüst seçenekten biriydi. Hiçbir şey adlandırılmıyor, dövüş yok ve hiçbir
  şey kesilmiyor: ark faz 4'ten beri dövüşsüz ve olay olurken oyuncu başka bir işin ortasında.

  Orman gölünün açıklaması ikinci bir dal değil üçüncü bir **kapanış** kazanıyor; böylece ilk
  paragraf tek yerde kalıyor. Önemli olan kontrol, sessizce düşebilecek olan: asla
  ateşlenemeyecek şekilde bağlanmış, on binde bir olan bir olay, kimsenin görecek kadar şanslı
  olmadığı bir olaydan ayırt edilemez. Bu yüzden `rolls_a_sighting` rastgeleliği argüman olarak
  alıyor ve `check_the_sighting_can_land_and_then_stops` iki ucu birden sürüyor.

- **Sırada olanlar.** Brief'in dört türünden geriye kalan yok. Faz 7'nin yapmadığı şey
  **v0.8'in kendisiyle** ilgili olan: karşılaşma zemin işinin son parçası, arkın sonraki
  parçası değil — ve birisi o şeyi gördükten sonra ne olacağı, bu önerinin verilmemiş bir
  hikâye kararı.

#### Fazlara taşınan kararlar

Bu önerinin sorduğu beş soru, cevaplarıyla birlikte ve her biri onu harcayan fazın
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

##### Q-13 — v0.8 dört bacaklı kuşla karşılaşacak mı? **KARAR: karşılaşılabilir, on binde bir civarında** — faz 7 harcadı

Bu da önerinin cevabı değil ve ondan iyi. Karşılaşma programlanmış değil **mümkün**: yalnızca
belli yerlerde, **10.000'de 1** mertebesinde çok düşük bir şans.

Bu, fazın korumaya çalıştığı şeyi koruyor. Oyuncu onun var olduğundan hâlâ emin olamıyor,
çünkü neredeyse hiç kimse görmeyecek; izler arkın normalde yaşandığı biçim olarak kalıyor; ve
karşılaşmanın olması için hiçbir şeyin harcanması gerekmiyor. Bu, hikâyenin içine yürüttüğü bir
sahne ile gerçekten dışarıda olan bir şey arasındaki fark.

**İnşa anına bıraktığı üç şey ve nasıl sonuçlandıkları.** *Hangi yerler*: iz taşıyan ikisi;
seçilerek değil, mekân verisinden okunarak — hayvanın, hiçbir şeyin işaret etmediği bir yerde
olmak için sebebi yok. *Girişte mi, aksiyonda mı, tick başına mı*: tick başına, çünkü o tick
oyun içi bir dakika ve üç kadanstan yalnızca onda "on binde bir" bu kararın kastettiği şeyi
söylüyor. *Karşılaşma nedir*: dövüş değil, bir görme — ki arkın kendisi buna faz 4'ten beri
dövüşsüz kalarak ve üç izin hiçbirinde hiçbir şeyi adlandırmayarak çoktan karar vermişti.

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

**Başlanmadı ve bilerek henüz başlanmıyor.** v0.7.39 itibarıyla Faz 6 bitti ve Faz 7 sürüyor;
yani burada duran "Faz 6'nın iki parçası kaldı, Faz 7 hiç başlamadı" cümlesi artık doğru bir
şey söylemiyor. Değişmeyen şey kural: büyü, mevcut hikâyenin yanına değil **sonrasına**
geliyor.

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

### P-41 — Lonca işleri: bir iş panosu, itibar ve ona cevap veren bir dükkân `open`

Sahibinin isteği: *"loncadan random A'dan S'ye kadar görevler ekleyelim. farklı görevleri
alabilelim ve bunlar lonca görevleri adıyla farklı bir yerde dursun. x kadar canavar avla, y
şundan topla gibi farklı tip görevler, ve lonca rep'i arttırsın. lonca rep'i ile de lonca
mağazasından farklı ödüller, belli milestonelerde farklı ödüller alabilelim. belki loncaya özel
eşyalar ekleyebiliriz."*

**Zaten var olanlar, ölçüldü.** `Guild` gerçek bir itibar bölgesi ve sahibinin kaydında 0;
lonca faktörünün diyalogu üç yerde onu veriyor; bir `Guild` kapısı da zaten var. Görev
makinesi adımları, gizli adımları, sıralı tamamlamayı ve adım ödüllerini kaldırıyor. Yani
bölge, para birimi ve adım motoru yerinde.

**Var olmayan şey ve işin tamamı da bu.** Oyundaki her görev elle yazılmış, adlandırılmış ve
belirli bir diyalog repliğinden ulaşılıyor. Hiçbir şey görev üretmiyor, hiçbir şey bir havuz
tutmuyor ve hiçbir şey birkaçı arasından seçim sunmuyor. Rastgele işlerden oluşan bir pano yeni
bir mekanizma: bir üretici, o an sunulanları tutacak bir yer, nasıl yenilendiklerine dair bir
kural ve bir kayıt biçimi gerekiyor — çünkü oyuncunun kabul ettiği bir iş yeniden yüklemeyi
atlatmalı.

**Herhangi biri yazılmadan önce dört karar.**

- **"A'dan S'ye" ne demek.** On dokuz zorluk kademesi mi, on dokuz ayrı iş mi? Birincisi bir
  merdiven ve bir ölçekleme kuralı gerektiriyor; ikincisi bir havuz ve on dokuz yazılmış brief.
- **Nerede yenilendikleri.** Oyun günü başına, ziyaret başına ya da tamamlamada. Bu, oyuncunun
  kontrol ettiği bir pano ile oyuncunun çiftlik yaptığı bir pano arasındaki fark.
- **İtibarı nasıl ödedikleri.** Kademe başına sabit bir miktar basit ve öngörülebilir;
  işle ölçeklenmesi merdiveni anlamlı kılıyor. Her hâlükârda toplam sınırlı olmalı, çünkü
  `check_a_standing_gate_can_be_reached` bağışları kapılarla karşılaştırıyor ve tekrarlanabilir
  bir kaynak bölgeyi sınırsız yapıyor — ki bu o kontrolü lonca için susturur.
- **Loncaya özel eşyaların ne işe yaradığı.** Başka kimsenin satmadığı eşyalar bir dükkânın var
  olması için iyi bir sebep (iki kafe v0.7.9'da tam olarak bunun için eklendi). Başka kimsenin
  satmadığı **ve** oyuncunun elindekinden iyi olan eşyalar ise bir güç eğrisi ve oyunun eğrisi
  zaten kademeyle belirlenmiş.

**Nerede yaşamalı.** İstendiği gibi ayrı bir panel. `Guild` itibarının sıfırın üzerine çıktığı
anda Veri panelinde zaten bir satırı oluyor, yani milestone'ların okunacağı bir yer var.

**Şimdiye kadar yapılanlar.**

- **Kademeler.** `done`, **v0.7.41** olarak. F'den SSS'e, kaydedilmek yerine lonca itibarından
  türetiliyor — yüksek iş daha çok itibar ödüyor, yani terfi yolunu zaten itibar taşıyor ve
  türetilmiş bir kademenin yeni kayıt anahtarına ihtiyacı yok. 255, mevcut içeriğin ödediği her
  şey ve D'ye düşüyor. `get_offered_guild_ranks` panonun penceresi; yazıldı ve muhafızlandı.

- **İş üreteci.** `done` ve sürümsüz, çünkü onu çizen bir şey henüz yok. `guild_jobs.js`,
  her şeyi oyunun zaten bildirdiği veriden türetiyor: avın zorluğu için düşman `rank` 1-11,
  mallar için `value` ve ödeme için merdivenin kendi aralıkları. Q-14'ün istediği tavan
  `standing_paid_for` içinde.

  **Ölçüldü ve tasarımı iki kez oynattı.** Görev motoru etikete göre `kill_any`'i zaten
  sayıyor, yani av yeni makine değil var olan bir `QuestTask` biçimi — ama tetiklediği beş
  olayın arasında **toplama olayı yok**, dolayısıyla toplama işi malı bataklık teslimlerinin
  yaptığı gibi teslim etmeli. Ve iki hedef havuzu da ölçülene kadar yanlıştı: `living` ile
  `beast` on bir düşman kademesinin hepsine yayılıyor ve "her hammadde", getirilecek şey olarak
  Black iron chainmail sunuyordu.

**Sırada, bu sırayla:** panonun kendisi — gün başına yenilenme ve alınmış işin kalıcılığıyla
(kayıt biçimi isteğe bağlı olmayan kısım) — sonra biten işin teslimi, sonra dükkân.

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

## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar. Burada kalanlar projenin tamamını ilgilendiriyor; tek bir
önerinin sorduğu soru, cevaplandığı anda o önerinin içine geçer. Q-7 ile Q-10 ve Q-13 de
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
