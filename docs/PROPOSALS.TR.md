<!-- doc-source: docs/PROPOSALS.md  doc-version: 56 -->

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

---

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

1. **Bir lore alanı** — hikâyenin geçmişini ve yapılmış konuşmaları tutan bir yer.
   `yapılacak`. Günlükte zaten dört sekme var (görevler, hayvanlar kitabı, antoloji,
   veri) ve beşincisi yeni bir panelden çok oraya ait. Ne tutmalı: oyuncuya ne
   söylendiği, kim tarafından; diyalog kapandıktan sonra da kalacak şekilde. Oyunda
   şu anda bunu kaydeden hiçbir şey yok.

6. **Mağazada İptal geri getirmeli** — `tamam; davranış değil etiket olarak`. Davranış yazarın tasarımı ve doğru: bir düğme kurduğun sepeti temizliyor, öteki ayrılıyor. Yanlış olan şey "İptal" ile "Çık"ın hangisinin hangisi olduğunu söylememesi - ve yerleşim 1660px'te kesildiği için ikisinden yalnızca biri ekranda duruyordu. Artık "Seçimi temizle" ve "Dükkândan çık" yazıyorlar; 4. madde de üçüncü düğmeyi görünür hâle getirdi. Üç düğme var: Kabul et, İptal ve
   Çık. İptal sepeti temizleyip kalıyor, Çık ayrılıyor. Bildirilen ekran
   görüntüsünde yalnızca ikisi görünüyor; bu da büyük olasılıkla 4. maddedeki yerleşim
   sorunu. Etiketler de Türkçede iki eylemi yeterince ayırmıyor.

15. **Her talebi buraya kaydet** — `sürekli`. Bu bölümün kendisi o kuralın
    uygulanması.

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

47. **Tarayıcısız yükleyici üç içerik modülüne erişemiyor** — `yapılacak`, ve bu bir dilek
    değil yetenek eksiği. tests/lib/browser-free-src.mjs bir modülü main.js ve display.js'i
    stub'layarak gerçekten yüklüyor; enemies.js, traders.js ve data/locations.js ise
    "Cannot access 'is_rat' before initialization" ile ölüyor - döngünün yanlış giriş
    noktasıyla değerlendirilmesinden doğan bir TDZ hatası. Her çağrı kendi geçici grafiğini
    kurduğu için önce items.js yüklemek işe yaramıyor. Maliyeti somut: Keşifler indeksi
    trader.inventory_template'i liste sandı, oysa anahtar; ve hiçbir test bunu yakalayamazdı
    çünkü hiçbir test bir tüccar kuramıyor. Çözüm, main.js'in kendi sırasıyla içe alan tek
    bir giriş modülü üretip hedefi onun üzerinden değerlendirmek.
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
