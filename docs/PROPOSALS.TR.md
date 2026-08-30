<!-- doc-source: docs/PROPOSALS.md  doc-version: 61 -->

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

35. **Echoes-Beneath'e yalnızca araçlar için değil, HİKÂYE ve OYNANIŞ için bak** —
    `yapılacak`. İlk inceleme araç sorusunu cevaplayıp sorulan soruyu kaçırdı. İstenen:
    alınmaya değer mekanikler ve anlatı araçları - örnek olarak **unvan sistemi**
    verildi. Onların `js/systems/` klasöründe bu oyunda hiç olmayan abilities,
    effectors, planner ve simulation var; docs'unda da REGIONS, STORY ve iki
    STORYPROGRESS dosyası.

48. **Büyük dosyaları bölmek** — `sürüyor`, ve asıl mesele ölçümler.

    v0.6.62 ipuçlarını çıkardı: `item_tooltips.js`, 706 satır; display.js 7.057'den
    6.430'a indi. Kesmenin ihtiyaç duyduğu sanılan üç adın aslında hiç gerekmediği çıktı -
    `rarity_colors` ve `rarity_outlines` onları okuyan ipuçlarına ait, `select_outline_class`
    display.js'te değil misc.js'te ve `round`'u başka hiçbir şey kullanmıyor. Geriye ödünç
    alınan tek ad `format_money` kaldı; o da modül kapsamında değil çalışma zamanında
    çağrılıyor.

    Yolda üç hata, her biri farklı bir ağa takıldı ve her biri hatırlanmaya değer:
    yıkıcı parametre listesi de bir süslü parantez açar, bu yüzden `function`'dan saymak
    create_item_tooltip_content'i kendi imzasında bitirdi; `Object.keys(x).forEach(...)`
    `});` ile kapanır ve geride bırakılan `);` sözdizimi hatasıdır; bir `const`'u onu okuyan
    döngünün üstüne taşımak onu geçici ölü bölgeye sokar - derleme kabul eder,
    `check:bundle` reddeder. Sonuncusu, o kontrolün var olma sebebi.

    v0.6.63 zanaat penceresini (`crafting_display.js`, 624 satır), v0.6.65 ise günlüğün
    panellerini aldı (`journal_panels.js`, 696 - bestiary, kitap listesi, lore, Keşifler).
    display.js dört kesmede 7.057'den 5.273'e indi. Her biri display.js'ten yalnızca bir
    ya da iki ad geri istedi; hepsi çalışma zamanında okunuyor.

    Bu arada iki şey öğrenildi. **Yeniden dışa aktarım bölmeyi kozmetik yapar**: display.js
    taşınan adları main.js, save_load.js, crafting.js ve items.js'e devrediyordu; onlar da
    artık içinde olmayan fonksiyonları ondan istemeye devam ediyordu. İçe aktaranları
    yönlendirmek kesmenin parçası, sonradan yapılacak bir iş değil. Bir de **tarayıcısız
    yükleyicinin uzayan bir saplama listesine değil bir `document`'a ihtiyacı var**:
    journal_panels.js modül kapsamında iki eleman tutamağı alıyor ve global'i bir kez
    saplamak, bir sonraki bölmede yükleyiciye hiç dokunmamak demek.

    Kalanlar, yeniden ölçüldü: envanter 921 satır (23 dışarı), ticaret 173 (8), görev
    günlüğü 907 (121 - bağlaşık olan), animasyonlar 204, dövüş 172. İki kesit yapıldı,
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

54. **Hikâyeyi sürdür, yeni alanları bağla** — `sürüyor`. v0.6.57, kenar mahalleyi
    kasaba kapısına bağladı; oyunun ikisi arasında kurduğu ilk geçiş bu. Bölgelerin geri
    kalanı hâlâ hikâyenin içinde değil, yanında duruyor. Motor toparlanırken
    anlatı işine ara verilmiyor: inşa edilen bölgelerin hikâyenin yanında durmak yerine
    hikâyeye bağlanması gerekiyor.

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
  [CHANGELOG.TR.md](CHANGELOG.TR.md) dosyasına yazılır ve ardından öneri bu
  dosyadan çıkarılır. Kaydı orada, geliştirici derinliğinde durur; burada ikinci bir
  kopya tutmak çalışma listesini arşive çevirir ve hâlâ açık olanı gömer.
- Kararlar [Bekleyen kararlar](#bekleyen-kararlar) bölümünden onları tüketen
  öneriye taşınır ve cevap kayda geçirilir.
