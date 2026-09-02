<!-- doc-source: docs/CHANGELOG.md  doc-version: 111 -->

> **Kanonik dosya: [CHANGELOG.md](CHANGELOG.md).** Bu çeviri bilgilendirme
> amaçlıdır. Çelişki hâlinde İngilizce dosya geçerlidir.

# Değişiklik Geçmişi

Bu fork'un geliştirme geçmişi ve her değişikliğin arkasındaki gerekçe. Bir iş,
[PROPOSALS.TR.md](PROPOSALS.TR.md) içindeki karşılık gelen öneri `done` durumuna
geldiğinde buraya girer.

> **Oyun içi changelog ile eşlidir.** Repo kökündeki `changelog.html` ve
> `changelog.tr.html`, oyunun içinde gösterilen ve oyuncuya yönelik sürüm
> geçmişidir. Burada yazılan her girdi, aynı değişiklik içinde oraya da karşılık
> gelen bir girdi olarak işlenir: bu dosya gerekçeyi geliştirici derinliğinde
> tutar, onlar oyuncunun okuduğu anlatımı taşır. Hikâye içeriği ve yeni bölgeler,
> mevcut bir sürümün içine katlanmak yerine kendi minor sürüm başlığını alır
> (0.6.1, 0.6.2, …). `npm run check`, iki HTML kopyanın da yayımlanan
> `game_version` için bir girdi taşıdığını doğruluyor; böylece ikisi fark
> edilmeden birbirinden uzaklaşamıyor.

---

## 2026-09-01

### v0.7.39 - sazlar zaten yatıktı

P-14'ün 7. fazının üçüncü izi ve **bilerek farklı bir tür**. İlk ikisi birer angarya: bir yere
git, bir şey oku. Bu ise yayın başladığı yerin, artık neye bakacağını bilen biri tarafından
yeniden okunması — ve gördükleri şey hep oradaydı.

Kırılmış örtü, fazın istediği dört türden biri ve kalan üçü içinde bir angarya değil bir yer
olarak işleyen tek tür. Tüy bir eşya olurdu ve envanterdeki bir eşyanın bir şey yapması
gerekir; ses ise her izin "sonrası" için zaten kullanılan kanal.

Gölde yeni bir şey olmadı. Sazlar yattıkları yerde kahverengi, dik durdukları yerde yeşil ve
oyuncu buraya ilk geldiğinden beri yatıklar. Değişen şey okuyan.

**Açıklamanın yerine geçmek yerine ona ekleniyor.** Bütün bir alternatif metin havzanın
yaptığı şey ve orada doğru, çünkü onun üç durumu baştan sona farklı; burada yalnızca son
değişiyor ve tek bir paragrafın iki kopyası, biri gölü ilk düzenlediğinde ayrışır. Barınakları
okumuş olmaya bağlı, ki o da sığlığı okumuş olmayı gerektiriyor — barınaklar o bayrağı şart
koştuğu için tek bir test ikisini birden kapsıyor.

Üç durumda da ölçüldü: başlangıçta gölde altı ses ve havzada bir, izden sonra dokuz ve bir,
barınaklardan sonra dokuz ve iki; sazlar ise yalnızca sonda beliriyor.

**Yeni muhafız yok ve bu fazda ikinci kez böyle.** Bayrağa bağlı bir açıklamayı adı için
`check_global_flags`, metni için `LOCALE_STRICT` tutuyor; paragrafı kopyalamak yerine
birleştirmek de bir kontrolün gözlemek zorunda kalacağı ayrışmayı ortadan kaldırıyor. Onu
kapsamak için uydurulacak bir kural, havzanın bilerek farklı olan üç durumuna izin vermek
zorunda kalırdı.

**Saklanmaya değer bir araç notu.** Bu iterasyon sırasında `src/data/locations.js` sıfıra
kesildi: bir yama betiğinin `io.open(path, "w", newline=...)` çağrısı kötü bir argümanla hata
verdi — ama "w" dosyayı çoktan boşaltmıştı. HEAD'den geri alındı ve commit edilmemiş tek blok
bilerek yeniden uygulandı. O andan itibaren her yazma geçici bir dosyaya gidip yerine
taşınıyor; yani hata veren bir betik bir kaynak dosyayı boş bırakamıyor.

### v0.7.38 - ikinci iz ve yatıp kalkan bir şey

P-14'ün 7. fazı sürüyor. Göl bir iz verdi; bu, o izin peşine düşmeye değeni.

**Islak orman bariz yerdi ve yanlış yer.** Önce komşuları okumak bu projenin yazım
kurallarından biri ve burada karşılığını verdi: ıslak ormanın arka plan sesleri *zaten* bu
kayıtta — *"Ağır bir şey kendini yere bırakıyor"*, *"Kurbağalar, sonra kurbağa yok"* — ve
`cut the standing flax` o ipliği açıkça kapatıyor: *"Griler gitti. Orman artık sadece
orman."* Oraya bir iz koymak, oyunun söylemeyi bitirdiği bir şeyi yeniden açardı.

**Şelale havzası kendini iki kez seçti.** Kendi açıklaması kaya barınaklarını ve taştan
ayırt edilemeyen yengeçleri adlandırıyor; yani orası zaten şeyleri görememekle ilgili bir
yer, ve bir şelalenin altında olduğu için hiçbir şeyin duyulmadığı bir yer. Üstelik hiç
aksiyonu ve tam olarak tek bir arka plan sesi vardı.

Baştan üçüncü barınakta olan şey, bir insandan uzun aşınmış bir yer ve **ezilmiş değil
açılmış** yengeç kabuklarından bir taban — bir taşın altında ölen yengeç parça parça olur,
bunlar sökülmüş. Hiçbir şey adlandırılmıyor. Yükselen tek şey zaman kipi: gölde bir şey
durmuştu; burada bir şey yaşıyor.

**İlk ize kapatılmış ve kapalıyken bile görünür.** `required: {flags:
["has_read_the_shallows"]}` ve nedenini söyleyen bir reddetme — içinde yengeç olan oyuklar, bir
sebebiniz olana kadar aranmaya değmez. Bu, projenin kilitli kapılar kuralı ve ilk izi anlamlı
kılan şey.

**Muhafız: `check_every_required_flag_can_be_set`.** Hiçbir şeyin vermediği bir bayrağa
kapatılmış bir kapı sonsuza dek, kibarca, kendi sözleriyle reddeder ve tam olarak oyuncunun
henüz hak etmediği bir kapı gibi okunur. `check_global_flags` *yanlış yazılmış* bir bayrağı
iki yönde de zaten yakalıyor; bu, öteki yarı — doğru yazılmış, bildirilmiş, istenmiş ve bir
kez bile verilmemiş.

**`every_reward_block` üzerine kurulu ve asıl mesele bu.** `rewards: {flags: [...]}` için elle
yazılmış bir tarama `is_strength_proved`'ı verilemez diye bildirdi. O, iki savaş bölgesinin
`first_reward`'ında veriliyor — o taramanın bilmediği bir biçim ve aynı dosyanın tam olarak bu
hatayı kaydettiği üçüncü kez. `true` başlayan bir bayrağın vericiye ihtiyacı yok ve atlanıyor;
isimle muaf tutularak değil bildirimden türetilerek. 7 bayrak bekleniyor, 10 tanesi veriliyor,
biri baştan açık. İki yönde negatif test edildi: verilmeyen bir bayrağa çevrilmiş bir kapı ve
gölün kendi bayrağını vermeyi bırakması.

### v0.7.37 - ilk iz, gölde

P-14'ün 7. fazı açılıyor. *Önce izler — ayak izleri, tüyler, ses, kırılmış örtü — ve oyuncu,
dört bacaklı kuşla karşılaşmadan önce onun var olduğundan emin olmamalı.*

**Ve ondan önceki faz zaten bitmişti.** Faz 6'nın başlığı hâlâ `partly done`, "dört bağımsız
parça; biri gönderildi" diyordu; oysa dört maddesinin dördü de `done` ve sonuncusu fazı
tamamladığını söylüyor. Düzeltildi, çünkü faz 7 açıkça "faz 6 yeşil olmadan başlamaz" diyor ve
plan sessizce yeşil olmadığını söylüyordu.

**Yayın kendi kanonu bunu kimse planlamadan önce yerine koymuştu.** Orman gölünün arka plan
sesleri arasında zaten *"bir hayvan su içmeye iniyor"* vardı. Yer, su kıyısıydı; bunun tek
yaptığı oyuncunun oraya çömelmesine izin vermek.

`read the shallows` dört parmak ve arkalarında sertçe itilmiş kum buluyor — sudan aceleyle
uzaklaşmış, yüzmemiş, bir balıkçıl için fazla büyük ve bir yaban domuzu için yanlış bir şey.
Hiçbir şey adlandırmıyor, hiçbir şey açmıyor, hiçbir eşya vermiyor. **Bir katman, bir kez**;
yayın 1. fazdan beri taşıdığı kural.

**`required` kapısı yok ve bunu komşusu öğretti.** İlk hâli Algı 12'ye kapatıyordu. Körfezin
kendi ilk izi olan `read the departures`'a karşı ölçüldü: onun `required`'ı boş ve Algı 15/34
`conditions` içinde yaşıyor; yani aksiyon denenmek için hep orada ve denemenin ne getireceğine
beceri karar veriyor. Bu, projenin kilitli kapılar kuralının istediği şey de: zayıf bir göze,
daha iyi bir gözün ne okuyacağı söyleniyor. Rampa boyunca ölçüldü: 12'nin altında hiç, 20'de
yarısı, 30'da tamamı.

**Sonrasında göl farklı ses veriyor.** Üç ses daha; her zaman sahip olduğu altısının yerine
geçmeden aralarına karışmış hâlde, bir bayrağın arkasında. İçinde sivrisinek, kurbağa ve ördek
olan bir göl hâlâ o göldür — içinde uymayan bir şey daha vardır. Marrowmoth limandayken
rıhtımın kullandığı biçimin aynısı. Değişen şey, oyuncunun artık fark eden türden biri olması.

**Bu yazılırken bir kontrol bir açığı yakaladı:** `check_actions_can_explain_failure`, başarı
koşulu olup `conditional_loss` satırı olmayan bir aksiyonu reddetti — ki bu, zayıf gözlü bir
oyuncunun tam da bir cümleye ihtiyaç duyduğu anda eksik metin işareti basardı.

**Ve yeni muhafız yok, ki bunu anlamak biraz sürdü.** Yanlış yazılmış bir bayrak adı
`undefined`'dır, `undefined` falsy'dir ve bayrağa bağlı içerik yazılır, çevrilir, gönderilir ve
bir kez bile görülmez — tutulacak sınıf bu gibi görünüyordu. Onun için bir kontrol yazıldı ve
`check_global_flags`'in **iki yönü de zaten kapsadığı** görüldü: özellik okuması ve dizgeyle
adlandırılmış bağış, üç biçimde. İlk negatif testin aksini göstermesinin tek sebebi, grep'in
yeni ifadeyi aramasıydı. Gönderilmek yerine silindi; mevcut kontrol her iki yönde de yanlış
yazımda düşüyor, ikisi de ölçüldü.

### v0.7.36 - sadece yapabildiklerim ve P-39 kapanıyor

P-39'un öteki yarısı: *"craft sayfalarında sadece yapılabilirleri filtrelemek için bir
checkbox ekleyelim."*

**Teklif bunu ucuz yarı diye anmıştı — "var olan bir yüklem ve onu okuyan bir onay kutusu" —
ve üçte ikisi vardı.** `get_availability` `ItemRecipe` üzerinde ve component tarifleri onu
miras alıyor; `EquipmentRecipe extends Recipe` ise hiç taşımıyordu. Yapılamayan tariflerin
soluklaştırılmasının component ve ekipman sayfalarında bugüne dek yorumda durmasının sebebi
de bu: soracak bir şey yoktu.

**Böylece ekipman cevap vermeyi öğrendi.** Bir ekipman tarifi bir bileşen türü çifti
adlandırıyor — bir balta, bir "axe head" ve bir "medium handle" — ve soru, oyuncunun her
birinden birini taşıyıp taşımadığı. Dönen sayı, çantanın sağlayabileceği en küçük tam takım
sayısı; ki eşya tariflerinin sayısının zaten anlamı bu, çünkü ikisini de tek bir çağıran
okuyor.

Kalite ve kademe bilerek sorulmuyor. Herhangi bir ağız bir balta yapar ve hangi ağız olacağı
oyuncunun vereceği karar, filtrenin peşinen alacağı değil.

**Artık tek bir yer soruyor.** Bileşen seçim listesi envanteri `component_type`'a göre satır
içinde süzüyordu; yani "buraya hangi bileşenler girebilir" iki kez yazılmak üzereydi.
`count_components_of_type` o soru, bir kez.

`.recipe_hidden { display: none }` stil dosyasında zaten vardı, yani cevap verecek bir şey
olunca saklama yarısı bedava geldi. Kutu hem satır kurulurken hem yenilenirken uygulanıyor,
böylece zaten işaretliyken açılan bir sayfa ilk seferde doğru.

**Muhafız: `check_every_recipe_can_say_if_it_is_makeable`.** Cevap veremeyen bir tarif türü
gürültüyle düşmüyor — isteğe bağlı çağrı undefined dönüyor ve kutu çalışıyor gibi görünürken
koca bir sayfa yanlış filtreleniyor. 148 tarif, hepsi cevap verebiliyor; yüklemi
`EquipmentRecipe`'ten geri almak onu adıyla ve sayfasıyla düşürüyor. Altı davranış testi
cevabın kendisini kapsıyor: boş çanta, çiftin yarısı, iki yarı ve bir eşya tarifinin
döndürdüğü biçimle eşleşme.

**Ve mevcut bir kontrol yine hakkını verdi.** `check_onclick_names_are_reachable`, yeni onay
kutusunun `update_displayed_crafting_recipes`'i, onu `window`'a koyan bir şey olmadan
çağırdığını yakaladı — hiçbir şey yapmayacak bir düğme ve bunu ancak bir tıklama söylerdi.

### v0.7.35 - hiç yapmadığınız bir tarif bunu söylüyor

P-39'un ilk yarısı, sahibinden: *"craft edilebilir ama hiç craft edilmemiş eşyaları bir
belirteçle keşfedildi/keşfedilmedi şeklinde işaretleyelim."*

**Açık soru, isteğin kendisinden cevaplandı.** İstenen şey "hiç craft edilmemiş" — yani
belirteç, oyuncunun ne yaptığını kaydediyor, ona ne gösterildiğini değil. Teklifteki ikinci
okuma, "yapılabilir olduğu görülmüş", aynı kelimeyi giyen bir tarif defteri sayacı.

**Bilerek tarif kimliğine göre, kategori/altkategori/kimliğe göre değil.** Ölçüldü: 148 tarif
136 ayrı kimlik taşıyor ve dokuzu iki ya da üç kategoride birden görünüyor — bir Short hilt
crafting, forging ya da woodworking ile yapılabiliyor. Halkanın cevapladığı soru "bunlardan
hiç yaptım mı", "bunu tam olarak bu yolla hiç yaptım mı" değil.

**`item_log`'a katılmadı, ki ilk fikir ve teklifin kendi önerisi oydu.** O depo EŞYA'ya göre
anahtarlı ve bir component tarifinin eşyası yapıldığı malzemeye bağlı — "Short hilt"in bayrak
asılacak tek bir eşyası yok.

İşaret, satırdaki bir sınıf ve CSS'ten çizilen bir halka; markup'a yazılan bir şey değil:
eşya sayfası, craft adedi düğmelerini eklerken ilk çocuğunu baştan kuruyor, yani araya
konulan bir şey bir sayfada yaşar öteki sayfada silinirdi. Aynı sebeple alt kategori
dallanmasının dışında uygulanıyor — `update_displayed_crafting_recipe`'in yalnızca eşya dalı
bir şey yapıyor, diğer ikisi yorumda; üç sayfanın birinde beliren bir belirteç ise hiç
olmamasından kötü olurdu.

**Muhafız: `check_every_craft_records_that_it_happened` ve kendini anında çıkardı.** Üç
eklememden ikisinin aynı teslim noktasına düştüğünü ve ekipman dalının boş kaldığını buldu —
ki bu, oyuncu kaç tane döverse dövsün her ekipman parçasını "hiç yapılmamış" işaretli
bırakırdı. Sonucu verip kaydetmeyen bir dal hiçbir şey bildirmiyor: craft çalışıyor, eşya
geliyor, yalnızca halka hiç sönmüyor.

Toplamları karşılaştırmak yerine her teslim ile bir sonraki arasında bir kayıt arıyor; çünkü
tek bir dala tıkıştırılmış üç kayıt bir sayımı memnun ederdi. Üç daldan ikisi üzerinden
negatif test edildi. Deponun kendisini dokuz davranış testi kapsıyor: kayıt turu ve alandan
önceki bir kayıt dahil.

**Hâlâ açık: filtre.** Teklif "filtre, var olan bir yüklem" diyordu ve ölçüm bunu düzeltiyor:
`get_availability` `ItemRecipe` üzerinde tanımlı ve component tarifleri onu miras alıyor,
`EquipmentRecipe extends Recipe` ise hiç taşımıyor — üç sayfanın ikisinde soluklaştırmanın
yorumda olmasının sebebi de bu. "Yalnızca yapılabilirler" onay kutusu, önce o yüklemin ekipman
için yazılmasını gerektiriyor; ekipmanda ise soru anlam kazanmadan önce bir malzeme ve
bileşenlerinin seçilmiş olması gerekiyor.

### v0.7.34 - bir panel, gösterdiği değer değişmeden hemen önce çizilmiyor

P-37, sahibinin sorusu: *"envanter, veri gibi alanların güncellenmesini kontrol ettik mi?"*

**Cevap evet ve bunu söyleyebilmek on bir düzeltme aldı.** Bu biçimdeki her denetim kendinden
emin bulgular üretti ve ilk on üçü oyunun değil denetimin kusurlarıydı. Yazılıyor, çünkü aynı
aracı bir sonraki kişi de kuracak:

- durumu panele **elle** eşleştirmek bestiary'yi savaş listesiyle, efekt kayıt defterini stat
  bonus tablosuyla karşı karşıya getirdi — bu yüzden eşleştirme, panellere ne okuduklarını
  sorarak türetiliyor;
- çevreleyen fonksiyonu "bu satırdan önce başlayan sonuncu" diye adlandırmak, yeni bir oyunun
  açılış kesesini bir dev-konsol yardımcısına yükledi; çünkü o fonksiyon çoktan kapanmıştı;
- bir fonksiyonun gövdesi olarak "addan sonraki ilk `{`"i almak, aralığı destructure edilmiş
  parametre listesinin içine sokuyor — `function process_rewards({rewards = {}, ...})` — ve
  fonksiyonu kendi ilk ifadesinden önce bitiriyor;
- çıplak bir registry adı daha uzun yolların içinde eşleşiyordu ve imzadaki bir varsayılan
  yazma sayılıyordu;
- çağrı aramasında baştaki noktayı dışlamak `ReputationManager.add_reputation(...)`'ı tamamen
  gizledi; yani çağıranı bir sonraki satırda yenileyen bir fonksiyon soğuk göründü;
- yalnızca **yukarı**, çağıranlara yürümek `unlock_location`'ı kaçırdı: kendisi hiçbir şey
  çizmiyor, her şeyi yeniden kuran `change_location`'ı çağırıyor;
- ve `create_new_bestiary_entry` ile `create_bestiary_entry_content`, herhangi bir `update_`
  fonksiyonu kadar kesin biçimde çiziyor.

**Gerçekte yanlış olan şey ve ulaşılabilirliğin onu asla bulamayacağı.** `unlock_location`
oyuncunun konumunu yeniden kuruyordu — ki bu hızlı seyahat listesini `unlocked_beds`'ten çizer
— ve yeni açılan yatağı bir sonraki satırda kaydediyordu. "Bu yolda bir yeniden çizim var mı"
diyen her ölçüt evet der. Panel yine de eski değerden kuruluyordu ve onu bir daha çizen
olmuyordu; yani az önce hak ettiğiniz bir yatak, siz bir yere gidene kadar listede yoktu.

İki satır, yer değiştirdi. Yazma hâlâ `if`'in dışında, çünkü zaten açık bir yeri açmak da
yatağını kaydetmeli; yeniden yükleme ise artık gerçek bir açılma koşuluna bağlı, ki en baştan
kastedilen de buydu.

**Muhafız: `check_a_panel_is_not_redrawn_before_the_value_changes`.** Ulaşılabilirlik değil
sıra — statik bir kontrolün dürüstçe cevaplayabileceği yarı bu. Bir panelin okuduğu bir
değere yapılan her yazmanın, kendisinden sonra o paneli çizen bir şey olmalı. Fonksiyon başına
değil yazma başına: `kill_enemy` bir `if`'in bir kolunda yazıp çiziyor, öteki kolunda yine
yazıp çiziyor ve uçları karşılaştırmak bunu da yanlış saydı.

Bir panelin okuduğu 16 durum parçası, bunlardan birini hem yazıp hem çizen 8 fonksiyon,
sırası bozuk olan yok. Yükleme ve karakter yaratma yolları muaf; ikisi de her şeyi doldurup
sonra her şeyi çiziyor. Dev konsolu da muaf: konsoldan set edilen bir bayrak, oyuncunun
izlediği bir yol değil. Yatağı gönderildiği yere geri koyarak negatif test edildi.

### v0.7.33 - meydanda bir tezgâh ve P-36 kapanıyor

P-36'nın üç parçasının sonuncusu: *"kasaba meydanında tüccar olmalı"*.

**Açık soru ne satacağıydı ve cevabı ölçüm verdi.** Town pazar bölgesinde iki tüccar vardı ve
ikisi de aynı on yemeklik menüyü işleten kafelerdi; yani oyunun ortasındaki bir oyuncu başka
her şey için köye geri yürüyor ya da kenar mahalleye iniyordu. Ama beşinci bir genel dükkân
yanlış cevap — iki kafe v0.7.9'da tam olarak başka kimsenin satmadığını sattıkları için
eklenmişti.

Oyundaki her stok listesi boyunca sayıldı: **hiçbir tüccarın satmadığı 94 hammadde** ve bir
alet yuvası — olta kamışı — ki diğer her alet türü bir yerde bir rafta duruyor, bu ise hiçbir
yerde yoktu; üstelik üç bölgenin sunduğu bir faaliyet için.

Yani tezgâh yün ve keten ile onlardan yapılan kumaşı, odun kömürünü, tuğlayı, iç yağını,
siniri, özsuyu ve biçilmiş keresteyi satıyor; bir de ucuz iki olta kamışını. On iki kalem ve
**hiçbiri başka bir rafta yok** — mesele de bu: ticareti taşımıyor, ekliyor.

**Bilerek hammadde, component değil.** 175 component de satılmıyor ve onları satmak oyuncunun
zanaat merdivenini tamamen atlamasına izin verirdi. Kumaş, iplik, yakıt ve kereste satan bir
pazar o merdivenin yerine geçmiyor, onu besliyor. Yün ile yün kumaşın taban değeri aynı; yani
tezgâh marjını aldıktan sonra eğirmek hâlâ hesaplı olan yol. Meydanın component'ler konusunda
ne yapacağı ilerlemeyi değiştirir ve bir tezgâhın vereceği karar değildir.

Meydanın kendi 50/150/250 itibar merdiveninin orta basamağı olan `cry the news` açıyor: bir
sabahı tezgâhların omzunda geçirmek, tezgâh tutan kişiyi tanımanın yolu. Marj 8; köyün 4'ü ile
kafelerin 18'i arasında — bir pazar, pazar olarak rekabetçidir.

**İki kontrol hakkını verdi, bir kural ise vermedi.**

`check_trader_market_regions`, tüccar yazıldıktan bir dakika sonra meydandaki eksik
`market_region`'ı yakaladı — o olmayan bir dükkânın pazar doygunluğunda sayacı olmuyor ve
`verifier.js` bunu çalışma anında reddediyor.

**Ve yazmak üzere olduğum muhafız yanlış çıktı.** "Her dükkân, başka hiçbir dükkânın satmadığı
bir şey satar", projenin teklifte alıntılanan kendi tasarım kuralı — ve dokuz tüccar boyunca
ölçüldüğünde **dördü kendine ait hiçbir şey satmıyor**: iki kafe menüyü bilerek paylaşıyor ve
kademeli listeler tasarımı gereği birbirinin üst kümesi. Onu kodlamak, gönderilmiş ve bilerek
yapılmış içeriği düşürürdü. Bu, döngünün kendini bir cümleden — bir sayımdan değil — kural
uydururken yakalamasının beşinci kezi.

**Dürüst olan muhafız: `check_every_trader_can_be_opened`.** Dokuz tüccarın yedisi kapalı
geliyor; yani bir dükkân da diğerleri gibi bir kapı ve hiçbir şeyin açmadığı bir kapı hiç
ticaret düğmesi çizmiyor — bu da bir arıza gibi değil, tüccarı olmayan bir yer gibi okunuyor.
Tezgâhtarın tek açma satırını ya da körfez tüccarınınkini kaldırmak onu adıyla düşürüyor.

### v0.7.32 - kasaba meydanında yapılacak bir şey var artık

P-36, üç parçasının ilki, sahibinden: *"kasaba meydanında koşu gibi farklı alternatif yetenek
geliştirmelerine ihtiyaç var. köy daha zengin aksiyona sahip. kasaba meydanında tüccar olmalı.
nöbet ile para kazanabilmeli."*

**Hatırlanarak değil sayılarak: köyde on faaliyet, meydanda sıfır.** Üç parçanın ikisi burada
bitti — beceri pratiği ve ücretli nöbet, ki ikisi aynı iş çıktı. Tüccar gerçekten ayrı bir iş
ve açık kalıyor.

**Bilerek iki tane, on değil.** Meydanın ikinci bir köy olması amaçlanmıyor; amaçlanan, boş
olmaması. İkisi de yeni bir tür eklemek yerine var olanı kullanıyor ve bu bir kestirme değil:
her konum kendi `starting_text`'ini yazıyor, yani mekanik ortak, sözler yerel — meydanda
koşmayı köyde koşmanın başka adlı hâli olmaktan çıkaran da bu.

**Her biri onu hak eden işle açılıyor**, meydanın üç aksiyonunun zaten kullandığı 50/150/250
itibar merdiveninde. `chase the pigeons` **koşuyu** açıyor — bir öğleden sonrayı meydanı
koşarak geçirdikten sonra, bunu bilerek yapmak artık tuhaf değil. En üst kademe olan `settle
the bread argument` ise **nöbeti** açıyor: iki fırıncı arasında hakemlik edecek kadar
güvenilmek, onu satın alan şey.

**Nöbet 50 ödüyor, köy devriyesiyle aynı.** İstek meydanda para kazanabilmekti, orada daha
fazla kazanmak değil; ikinci bir ücret, ilkine göre belirlenmiş her fiyatı oynatırdı (v0.7.10
o ekonomiyi kayıkçının fiyatı için ölçmüştü). Onu kopya değil alternatif yapan şey gece işi
olması: 20:00–06:00, köyün gündüz devriyesine karşı.

**Muhafız: `check_a_timed_activity_can_ever_be_started`** ve var olma sebebi, bunun bozuk
gönderilmesine ramak kalması. `main.js`'teki uygunluk kontrolünün iki dalı da
`availability_seasons?.includes(...)` ile bitiyor; yani saati olup **mevsimi olmayan** bir
faaliyet her günün her saatinde reddediliyor — `display.js` ise ipucunda "20'den 6'ya
kullanılabilir" yazmaya devam ediyor. Oyuncuya ne zaman geleceği söyleniyor ve geldiğinde geri
çevriliyor; derlemedeki başka hiçbir şey bunu göremiyor: yapıcı memnun ve belirti, kimsenin
açmadığı bir faaliyetle birebir aynı okunuyor.

Meydanın nöbeti, oyunda gece boyunca süren dalı kullanan ilk şey. `main.js`'in kendi testiyle
saat saat ve mevsim mevsim ölçüldü — dört mevsimde 20:00–06:00 arası başlatılabilir, 07:00–19:00
arası reddediliyor — ve mevsimleri kaldırılmış hâliyle yeniden ölçüldü: her saatte reddediliyor.
3 faaliyet saat taşıyor, 1'i gece boyunca sürüyor, hepsi mevsimlerini adlandırıyor; hem yenisi
hem köyün `fieldwork`'ü üzerinden negatif test edildi.

### v0.7.31 - tekrar dene, tekrar denemenin işe yarayacağı yerde

P-34, başarısız bir kilitten: *"kilitler için altına tekrar dene ekle ve geri ileri yapmadan
tekrarlayabilelim."*

**Tasarımın tamamı tek bir soruya indi** ve o soruyu cevaplamak teklifin açık bıraktığı iki
kararı da çözdü: **deneme şu anda başlatılabiliyor mu?**

- *Başarıdan sonra da görünmeli mi?* Yalnızca yeniden başlatmanın gerçekten mümkün olduğu
  yerde. Açılmış bir kilit sandığını harcadı, yani gereksinim karşılanmıyor ve düğme
  çizilmiyor. Beceriyle kapatılmış, başarılı olmuş bir aksiyon hâlâ başlatılabilir durumda ve
  onu orada sunmak, oyuncunun elle yapacağı aynı iki tıklama.
- *Denemenin bedelini taşımalı mı?* Bu bir geri alma değil. Düğme `start_game_action`'ı
  çağırıyor — konum listesinin kullandığı yolun aynısı — yani her gereksinim kontrol ediliyor
  ve her bedel ilk denemedeki gibi ödeniyor.

**`can_be_started` değil `canBeStarted`** ve fark burada önemli: katı olanı kilitli-olmama ve
bitmemiş-olma durumlarını da katıyor. Tek seferlik bir aksiyon kendini **yalnızca başarıda**
kilitliyor, yani başarısız olan biri hâlâ tekrar denemeyi sunuyor — ki isteğin geldiği durum
tam olarak bu.

`retry_game_action`, bir sonrakini başlatmadan önce biten denemeyi kapatıyor; böylece içerik
yığını her deneme başına bir aksiyon kutusu büyümüyor ve `current_dialogue` bundan
etkilenmiyor — bir konuşmanın aksiyonu konuşmanın içinde tekrarlanıyor.

**Kararın nerede yaşadığı asıl mesele.** `offers_a_retry`, DOM kurucusunun içine gömülmüş bir
koşul değil `GameAction` üzerinde bir metot; çünkü cevabı kendi bulan bir kurucu, hiçbir testin
itiraz edemeyeceği bir kurucudur: testler geçmeye devam ederken düğmeyi çizmeye devam ederdi.
`update_game_action_finish_button`'a bir boolean veriliyor ve karaktere hiç bakmıyor.

**Muhafızlar üç yönden negatif test edildi.** Davranış yarısı gerçek kilit aksiyonunu üç
durumda çalıştırıyor — sandık elde, eli boş ve bitmiş — yapısal yarısı ise kurucuyu okuyup
kararı düğmeyi **yaratmadan önce** danışmasını ve kendi kararını hesaplamamasını şart koşuyor.

İki yarı da hakkını verdi. `offers_a_retry`'ı yalnızca-koşullar testine gevşetmek üç davranış
kontrolünü birden düşürdü. Kararı kurucunun içine taşımak yapısal olanları düşürdü. Ve
parametreyi imzada bırakıp guard'ı kaldırmak — her denemeden sonra düğmeyi çizen regresyon —
kontrolün ilk hâlinden kaçtı; o hâl yalnızca `can_retry`'ın herhangi bir yerde geçip
geçmediğini soruyordu. Artık düğmenin yaratıldığı ana karşı ölçüyor: imzanın ve bir önceki
denemenin düğmesini temizleyen satırın ötesinde.

Testi yazmak bir şeyi daha ortaya çıkardı: `canBeStarted`, başlangıçta
`fill_availability_methods()` çalışana kadar var olmuyor; yani onu tarayıcısız test eden her
şeyin metotları önce graft etmesi gerekiyor.

### v0.7.30 - körfezin son iki görevi artık veriliyor

P-40, sahibinin talimatından: *"quest ekliyoruz ancak bir yere bağlanmıyorsa, onu uygun bir
şekilde doğru yerlere bağlamamız gerek."*

**Hata, ölçülmüş hâliyle.** Oyundaki hiçbir şey `Out on the Ebb` ya da `One Unweighed
Crate`'i vermiyordu ve `questManager.finishQuestTask`, `if(this.isQuestActive(quest_id))` ile
açılıyor — yani onların adımlarını ilerleten altı aksiyon ve bir diyalog repliği **işlevsizdi**.
Bir oyuncu düzlükleri yürüyebilir, kayıkçıya para verebilir, kargo güvertesini geçebilir,
sandığı açabilir ve tarifi antikacıya götürebilirdi; günlük bunların hiçbirinden söz etmezdi.
İkisi de benim, Marrowmoth yayından.

**Nereye ait oldukları ve bunun zaten yerleşik olduğu.** Yay her görevi saymanın cevabında
devrediyor: `lend a hand on the quay`, *Forty Tons*'u işin kendisinden açıyor ve `tallyman last
time`, *A Stroke Through It*'i onun söylediğinden. Dolayısıyla 3. görev `tallyman what you
found`'da açılıyor — araştırmayı cevaplıyor ve cevap işin kendisi — ve 4. görev `tallyman the
hold`'da, kalan suları sayan ve böylece geri dönmeyi bir plana çeviren replikte. İki replik,
iki bağış, yeni makine yok.

**Okurken bulunan ikinci hata.** `tallyman the hold`'da **iki `rewards:` bloğu** vardı, her
birinin üzerinde kendi yorumu. JavaScript tekrarlanan bir adın son anahtarını tutup
öncekileri sessizce düşürüyor; yani lonca kâtibinin repliği — o alışverişin var olma sebebi —
gönderilen hiçbir sürümde verilmemişti. Tek blokta birleştirildi.

**Bulunan üçüncü şey ve o oyunun değil benim hatamdı.** Bu düzeltmenin ilk hâli `The tidal
flats`'i de açıyordu; oraya hiçbir şeyin ulaşmadığı okumasıyla. 2. görevin kendi tamamlanma
ödülü onları açıyor ve nedenini söyleyen bir yorumu var; onu kaçıran grep `quests.js`'e
bakmayı akıl etmemişti. **Yakalayan şey aşağıdaki kontrol** — bu bölgede yazılı bir teşhisimin
ölçümle düzeltilmesinin dördüncü kez oluşu — ve kopya bağış gönderilmek yerine kaldırıldı.

**Üç muhafız, hepsi negatif test edildi.**

`check_every_quest_can_be_started`, sahibinin talimatının kural hâli: her görev bir şey
tarafından veriliyor olmalı. Bir şeyin onu verip vermediğini soruyor, o şeyin kendisinin
ulaşılabilir olup olmadığını değil — tam bir ulaşılabilirlik yürüyüşü savaş temizlemelerini,
görev zincirlerini ve açılma sırasını modellemek zorunda kalırdı ve oyunu modelleyen bir
kontrol, oyunla çelişen bir kontroldür. 23 görev, hepsi veriliyor.

`check_every_location_can_be_unlocked`, aynı başarısızlığın farklı para birimindeki hâli ve
onu yazmak ödül yürüyüşüne bilmediği üç biçim öğretti: içeri girmek için ödenen
`entrance_rewards` ve bir beceri milestone'unun `unlocks` altında bir kat aşağıda duran
bağışları. Onlar olmadan ulaşılabilir dört görevi başlatılamaz ilan etmişti. Kural
**ulaşılamayan içerik**, ulaşılamayan boşluk değil: `Mages guild` kilitli ve hiçbir şey
vermiyor, ama içinde diyalog, tüccar, aksiyon, faaliyet ya da yatak yok — P-41'i bekleyen boş
bir oda ve onu açmak oyuncuya içi boş bir oda vermek olurdu. Oraya bir yol açmadan içine bir
şey yazın, kontrol düşer; düşmesi gereken an da odur. 71 konum, 54'ü kilitli, her biri ya
veriliyor ya boş.

`check_no_content_object_repeats_a_key` kopyayı tutuyor: bir nesne literalinde tekrarlanan bir
anahtar, dilin kabul ettiği bir sözdizimiyle silinmiş koca bir içerik bloğudur ve derlemedeki
her şeye görünmez. Yapıcı gövdelerini okuyor — `new Textline({...})` ve akrabaları — çünkü bu
nesneler orada, bir seferde yüzlerce satır olarak yazılıyor; ikinci bir `rewards:`'ın gözden
kaçtığı uzunluk da tam olarak bu. 1488 literal, hiçbirinde tekrar yok.

### v0.7.29 - körfez açılıyor, tamamlanmış bir işin vaat ettiği her şeyle birlikte

*"Körfez bölgesinde ilkbaharda hâlâ aksiyon yok."* Bunun üçüncü bildirimi ve **ilk iki
teşhisim de yanlıştı** — v0.7.25 iki mevsimlik aksiyonu `display_conditions`'tan çıkardı, ki bu
gerçek bir hataydı ama bu değildi; P-30 ise bölgenin bilerek ince olduğu sonucuna varmıştı.

**Gerçekte ne olduğu.** `locations["The bay"]`'in kendine ait hiç aksiyonu yok: bölgeye liman
saymanı üzerinden giriliyor ve onun selamı, geri kalan her şeyi açan repliği açan şey. O ödül
bir zamanlar `unlocks:` olarak yazılmıştı — `Textline`'ın sahip olmadığı bir parametre — ve
`dialogues.js`'teki bir yorum düzeltmeyi kaydediyor. **Düzeltme, bu oyuncu selamı çoktan
duyduktan sonra geldi** ve bir replik bitince kendini kilitliyor, yani ödül bir daha
ateşlenemedi. Bir diyalog yalnızca repliklerinden biri için `is_unlocked && !is_finished`
tuttuğunda sunuluyor; dolayısıyla tek repliği bitmiş, gerisi kilitli olan açık bir sayman
**hiç konuşma göstermiyordu** — ekran görüntüsünün tam kendisi: içinde çıkış yolundan başka
hiçbir şey olmayan bir körfez.

Akıl yürütülmek yerine sahibinin kaydında ölçüldü: `harbour tallyman` açık, `tallyman hello`
bitmiş, `tallyman what leaves` kilitli ve `The salt house`, `The tidal flats`, `The lower hold`
hiç açılmamış — son ikisi bölgenin dört aksiyonunu aralarında tutuyor.

**Yani bu yine P-38, farklı bir para biriminde** ve aynı yere gidiyor. `save_repairs.js` artık
tamamlanmış tek seferlik bir tetikleyicinin verdiği ama oyuncunun hiç almadığı kilit açmalarını
da yeniden uyguluyor. Her şey yüklendikten sonra canlı kayıt defterlerinden okunuyor, çünkü
önemli olan oyunun gerçekten içinde bulunduğu durum.

**Kilit açmalar tek tek uygulanıyor ve bu titizlik değil.**
`process_rewards({only_unlocks: true})` parayı, tecrübeyi, eşyayı ve etkileri atlıyor ama
itibarı **atlamıyor** — yani her yüklemede bütün ödül bloklarını tekrar oynatmak bir itibar
pompası olurdu. Kaçırılmış her kilit açma, yalnızca kendisini taşıyan bir ödül nesnesi olarak
veriliyor.

Çalıştığına dair kayıt tutmadan her yüklemede çalışması güvenli: oyundaki her uygunluk testi
`is_unlocked && !is_finished`, yani zaten açık olanı yeniden açmak hiçbir şeyi değiştirmiyor.
Gerçek kayıtta idempotent olarak ölçüldü — ilk seferde altı, ikinci seferde sıfır.

**O altısının ne olduğu.** Saymanın repliği; bataklık aşçısının üç repliği; antikacının
monografı; nekomimi tüccarı; **Lake beach'te bir yatak**; ve *the woods are quiet* unvanı.
Altısı da kazanılmış, hiçbiri alınmamış. Son ikisi diyalogdan değil konum aksiyonlarından
geliyordu — ki onarım oraları yürümeye ancak muhafız zorladığı için başladı.

**Muhafız: `check_the_unlock_repair_knows_every_kind`.** Tuttuğu başarısızlık, onarımın sessizce
güncelliğini yitirmesi: tek seferlik bir repliğe yeni tür bir kilit açma ekleyin, onarım
yanından geçer, hiçbir şey fırlatmaz, içerik her yeni oyuncu için çalışır ve yalnızca o
repliği yanlış sürümde bitirmiş biri eksik kalır — ki hiçbir test bu duruma denk gelemez.
Dolayısıyla tek seferlik bir girdide bildirilen her ödül türü ya onarılmış olmalı ya da
`unlock_kinds_left_alone` içinde **gerekçesiyle** adlandırılmalı. Onarılanlar listesi dağıtım
tablosunun kendisinden türetiliyor, yani kontrol kendi kendiyle hemfikir olamıyor.

**Yazılırken masrafını iki kez çıkardı.** Onarımın diyalogları yürüdüğünü ama konum
aksiyonlarını yürümediğini buldu — aynı çıkmazın koca bir ikinci kaynağı — ve genişletildikten
sonra da `housing` ile `titles`'ın kimsenin onarmadığı kilit açmalar olduğunu. İkisi de artık
kapsanıyor ve ikisi de sahibinin kaydında eksik çıktı. 22 tür bildirilmiş, 10'u onarılıyor,
12'si adıyla gerekçeli. İki yönde negatif test edildi: tek seferlik bir repliğe eklenen bir
ödeme türü ve onarımdan çıkarılan bir işleyici.

### v0.7.28 - bir dışa aktarma hangi sürümün yazdığını söylüyor

Doğrudan istendi: *"dışarı aktarılan kayıtlara versiyon bilgisi de ekle dosya adlarına"*.

`yet-another-idle-rpg 2026-09-01 18_06_03 v0.7.28.txt`. **Tarihten önce değil sonra**, böylece
bir kayıt klasörü ada göre hâlâ kronolojik sıralanıyor — ki bu bu sürümde önem kazandı, çünkü
v0.7.27 hepsini `playersaves/` içine taşıdı ve altı tane var.

Sürüm dosyanın içinde de var ve yükleyicinin ve `check:save`'in okuduğu da o. Ne var ki bir
dosya listesi bir dosya değil: yalnızca zaman damgasıyla ayrılan altı dışa aktarma, eski bir
kayda sorulan ilk soruyu cevaplayamıyor — onu hangi sürüm yazdı. P-38'i açan soru da bu.

**Muhafız: `check_an_export_names_its_version`.** `index.html` içinde tek satırda tek bir
şablon ve derlemede ona bakan başka hiçbir şey yok — bir düzenlemenin sessizce düşüreceği tam
olarak bu türden bir şey, çünkü dışa aktarma çalışmaya devam ediyor, yalnızca tanınabilir
olmaktan çıkıyor. Hem sürümü hem tarihi zorunlu kılıyor ve ikisinden biri kaldırıldığında
düşüyor.

**Ayrıca, onu doğrulayan ölçümle birlikte kaydedildi: P-40.** Oyundaki hiçbir şeyin
başlatamadığı iki görev.

### v0.7.27 - bir işe yaramadan önce kazanılan itibar yüklemede ödeniyor

P-38; karşı kontrol için bir kayıtla bildirildi: *"bataklığa ekledik ama görevler tamamlandığı
için görev tamamlamalara göre kontrol edip rep'leri güncelleyen bir metot ekleyelim"*.

**Önce ölçüldü ve ilk ölçüm yanlıştı.** Bir kaynak taraması beş bataklık bağışını en yakın
önceki `new Textline`'a atfetti ve 300'ün 120'sinin kayıp, 180'inin kazanılabilir olduğunu
bildirdi. Onlar `new DialogueAction`. Doğru alana karşı okunduğunda **beşi de tamamlanmış ve
300'ün tamamı harcanmış** — ve aynı tarama iki `display_conditions` bloğunu bağış saymış,
hiç eksiği olmayan bir bölgede 140 puanlık bir açık uydurmuştu; çünkü `rewards:`,
`display_conditions:`'ın dört satır üstünde duruyor. Aşağıdaki her şey artık canlı ödül
nesnelerini okuyor: bağış `rewards` altında, kapı `display_conditions` altında ve hiçbiri
diğeriyle karıştırılamıyor.

Yani sahibinin kaydının gerçek durumu: **bataklık itibarı 0, oyunda onu yükseltebilecek hiçbir
şey yok ve 200'e kapatılmış `swampchief standing` kalıcı olarak ulaşılamaz.**

**Kaydın sürümü test olamaz ve zorluğun tamamı bu.** `save_load.js`'teki diğer her onarım
`is_a_older_than_b(save_data["game version"], …)` ile kapatılmış ve burada bu başarısız oluyor:
kayıt v0.7.25 okunuyor çünkü en son o zaman *yazıldı*; teslimler ise v0.7.21 bağışı eklemeden
çok önce tamamlanmıştı. Bir sürüm, içeriğin ne zaman yapıldığı hakkında hiçbir şey söylemiyor.

**Dolayısıyla test aritmetik.** `save_repairs.js`, tamamlanmış içeriğin bir bölgeye ne borçlu
olduğunu hesaplayıp itibarla karşılaştırıyor. Altındaysa fark hiç ödenmemiş; üstünde ya da
eşitse yapacak bir şey yok. Bu kuruluşu gereği idempotent — ikinci yükleme aynı tabanı
hesaplayıp karşılanmış buluyor — yani uygulanmış onarımların defterine ihtiyacı yok ve iki kez
ödeyemiyor. Sahibinin kaydında dört durumda ölçüldü: ilkinde +300, ikincisinde hiç, yeni bir
oyunda hiç, 300'ü meşru şekilde kazanmış bir oyuncuda hiç.

Yalnızca tamamlanmasını kaydın birebir tuttuğu kaynaklar sayılıyor — tamamlanmış işaretli tek
seferlik bir girdi ya da sayacı olan tekrarlanabilir biri — ki bu toplamı bir taban olarak
tutuyor. Negatif bağışlar da sayılıyor, çünkü bir ödül lonca yardımı karşılığında kenar
mahalleden düşüyor.

**Bilerek tek bir adlandırılmış bölgeye kapsandı ve bunu söyleyen şey ölçüm.** Oyundaki her
kaynak toplandığında taban güvenilir bir alt sınır değil: sahibinin kaydında kasabanın gerçek
itibarının **on üstüne** çıktı. Bu tam olarak aynı türden başka bir bağış olabilir ya da başka
bir şey; her hâlükârda, açıklanamayan bir sayı üzerinden ikinci bir bölgeyi sessizce
oynatmak onarım değildir. Kayıt defteri Swamp'ı, sürümünü ve onu doğuran bildirimi adıyla
yazıyor.

`process_rewards` üzerinden ödeniyor, yani onarılan bir itibar taze kazanılmış birinin yolunu
izliyor; ve mesaj kaydında söyleniyor — Veri panelindeki bir sayının oturumlar arasında
açıklamasız değişmesi, eksikten daha kötü.

**İki muhafız, negatif test edildi.**

`check_a_standing_gate_can_be_reached`, bunun statik bir kontrolün tutabileceği yarısını
tutuyor: kapıları içeriğinin verebileceğinden fazlasını isteyen bir bölge, kimsenin
açamayacağı içeriktir ve sıradan veri gibi okunur. **Onu yazmak yürüyücüyü iki kez yanlış
buldu.** İlk geçiş yalnızca diyalog ve konum aksiyonu ödüllerini biliyordu ve Köy'de 400'e
kapatılmış ihtiyarın muskasını ulaşılamaz ilan etti — gerçek bir kayıtta 460 var. Temizlenen
bir bölge üç biçim daha ödüyor (`first_reward`, `repeatable_reward`,
`rewards_with_clear_requirement`) ve görevler hem görevin kendisinde hem tek tek görev
adımlarında ödüyor; Köy itibarının 260'ı tek bir görevden geliyor. Artık 46 bağış ve 5
kapatılmış bölge var, her bölgenin en yüksek kapısı ulaşılabilir; unvanlar kapı olarak okunuyor,
çünkü bir unvan itibarın açtığı bir şey. Toplamının üstüne çıkarılan bir kapı onu düşürüyor.

`check_a_late_repair_still_finds_its_grants`, gönderilen hesabı, o bölgeye bağış yapan her
kaynağın tamamlandığını söyleyen bir kayda karşı çalıştırıyor; çünkü hiçbir şey bulamayan bir
onarım sessiz bir işlevsizliktir: hiçbir şey fırlatmıyor, hiçbir şey loglanmıyor ve geri
getirmek için var olduğu itibar sıfırda kalıyor. Bağışları silmek onu düşürüyor. Ayrıca
onarımın ödediğini tam yürüyüşün gördüğüyle karşılaştırıyor ve bu karşılaştırma kendi kendiyle
hemfikir olmak yerine canlı: bir görev ödülüne eklenen bir Swamp bağışı — ki `save_repairs.js`
görevleri yürümüyor — onu adıyla düşürüyor.

**Ayrıca:** dışa aktarılan kayıtlar artık `playersaves/` içinde yaşıyor, git tarafından
yoksayılıyor ve `npm run check:save` önce oraya bakıyor; yani çıplak bir dosya adı yeterli. Ve
`dialogues.js`'teki bir yorum hâlâ oyunda hiçbir şeyin Swamp itibarı vermediğini söylüyordu, ki
bu v0.7.21'de doğru olmaktan çıkmıştı.

### v0.7.26 - çanta en son gelene göre sıralanabiliyor

P-32; *"envanteri ada türe gibi yanına bir de son diye ekle, en son elde edilen eşyaları en
başta gösterecek şekilde elde etme tarihine göre sırala"* diye istendi.

**Bir karşılaştırıcı değil — var olmaya başlaması gereken bir alan.** Bir envanter girdisi
`{item, count}`'tı ve hepsi bu kadardı. Üzerinde onun *ne zaman* elde edildiğini söyleyen
hiçbir şey yoktu, yani sıralanacak bir elde etme tarihi de yoktu; iş, o sayının nereden
geldiğine, nereye yazıldığına ve hiç böyle bir şey kaydetmemiş eski bir kaydın ne yapacağına
karar vermekteydi.

**Tek boğaz noktası.** `inventory_component.js` içindeki `add_to_inventory`, bir girdinin
oluşturulduğu ya da üzerine eklendiği tek yer — karakter, tüccarlar ve depo için aynı şekilde
— yani oradaki tek bir sayaç üçünü de kapsıyor. Sayaç yalnızca artıyor ve içindeki boşluklar
sorun değil, çünkü okunan tek şey sıra.

**Bir yığına eklemek onu yeniden en üste taşıyor**, ki bu bir ayrıntı değil bir karar:
eklemeye devam ettiğiniz bir yığın, elde etmeye devam ettiğiniz bir yığındır ve sıralama "az
önce ne aldım" sorusunu cevaplamak için var. Bunun çalışması için ikinci bir değişiklik
gerekti — liste, *yeni* bir şey ortaya çıktığında yeniden sıralanıyor ve var olan bir yığına
eklemek yeni değil, dolayısıyla girdideki sıra değişip satır yerinde kalıyordu. Artık her
değişiklikte yeniden sıralanıyor, ama yalnızca seçili sıralama "son" iken.

**Kategori kuralları bu tek sıralamada devre dışı.** Kuşanılabilirler düz eşyaların altında,
bileşenler onların altında, kitaplar onların altında oturuyor — ve "son" altında bunların
tamamı yanlış soruyu cevaplardı; yeni bulunmuş bir kılıcı çantadaki her deri parçasının
altına gömerdi. Onların üzerindeki iki kural her sıralama için yerinde kalıyor, çünkü onlar
bir satırın nasıl karşılaştırıldığıyla değil nereye *ait olduğuyla* ilgili: kuşanılmış bir
eşya aslında listede değildir ve takas için sıraya girmiş bir satır listenin dibine aittir.

**Yükleme sırasında taşınmak yerine yüklemeden sonra geri konuyor.** Yükleme yolu eşya
listesini on dokuz ayrı push noktasından dolduruyor ve bunların çoğu bu alandan çok daha eski
kayıtlar için göç dalları. Kaydedilmiş bir anahtarı sonradan kurulmuş envanterle eşleştirmek,
on dokuz yer yerine tek bir yer; anahtarı bir göç sırasında değişmiş bir girdi de yüklemenin
verdiği sırayı koruyor.

**Ölçüldü ve ölçüm planı düzeltti.** Teklif, eski bir kaydın her girdiyi "eşit derecede eski"
diye eşitlemek zorunda kalacağını söylüyordu. Kalmıyor: bir nesne dizge anahtarlarını
eklendikleri sırayla listeliyor ve onlar eşyalar ilk alındıkça eklenmişti — yani eski bir
kayıt bedavaya doğru sıralanıyor. Baştan sona doğrulandı: sıra, farklı bir anahtar düzeniyle
yeniden yüklemeyi atlatıyor, bir yığına ekleme onu yukarı taşıyor ve yüklemeden sonra alınan
ilk eşya kaydın taşıdığı her şeyin üstüne konuyor. Ardından gönderilen karşılaştırıcı
temsilci satırlar üzerinde çalıştırıldı — bir sırayı akıl yürütmek yerine görmenin tek yolu:
ilk tıklamada en yeni başta, ikincisinde ters, her şey eşitken alfabetik.

**Tüccarlarda üç düğme kalıyor.** Onların stoğu oyuncu içeri girdiğinde üretiliyor, yani
üretildiği sıra, kimsenin bir şey elde ettiği bir sıra değil.

**Kısa etiketler ve cümlenin ipucu balonuna taşınması.** Bu yapılırken istendi: üzerinde
"Ada göre sırala" / "Değere göre sırala" / "Türe göre sırala" / "Son eklenene göre sırala"
yazan dört düğme, dört kelimenin yeteceği yerde dört cümle. Artık `Ad` `Değer` `Tür` `Son`
okunuyorlar; tam ifade, mevcut `data-translation-title` üzerinden üzerine gelince görünüyor
ve beceriler paneli de aynı işlemi gördü ki ikisi birbiriyle çelişmesin.

**İki muhafız, ikisi de iki yönden negatif test edildi.**

`check_a_sorted_field_is_saved`, bu özelliğin sessizce başarısız olabileceği sınıfı tutuyor:
kaydın tutmadığı bir alana bağlı bir sıralama. Çalışan kod gibi görünüyor — düğme sıralıyor,
düzen doğru — sonra bir yeniden yükleme alanı çöpe atıyor ve sıralama, hiçbir yerde hiçbir şey
bildirilmeden keyfi hale geliyor. Ekranın bir envanter girdisinden aldığı özellikleri okuyor,
bunlardan bir karşılaştırıcının gerçekten bir satırdan okuduklarını ayıklıyor ve her birini
**iki** kayıtlı envanterde de zorunlu kılıyor; çünkü karakterin kaydına eklenip deponun
kaydında unutulan bir alan, yarısı düzeltilmiş aynı hatadır. İki yarı sırayla kaldırıldı ve
kontrol her seferinde doğru sahibi adıyla söyledi.

`check_every_sort_button_is_understood` öteki ucu kapsıyor: bir sıralama, bir onclick içinde
düz bir dizge, yani adını hiçbir dalın karşılamadığı bir düğme hiçbir şeyi yeniden dizmiyor ve
tam olarak yanındaki üçü gibi görünüyor. İki yönde de çalışıyor — kimsenin işlemediği bir ad
ve kimsenin sunmadığı bir dal — ve kullanılmayan yerel satır kontrolü de üçüncü bir açıdan
onun yanında düşüyor.

### v0.7.25 - körfez saklamak yerine reddediyor

P-30, iki kez bildirildi — körfezin kışın hiç aksiyon göstermemesi, sonra ilkbaharda da
göstermemesi. **Teklif yol boyunca iki kez düzeltildi ve önemli olan ikinci düzeltme.**

**İkinci ölçümün bulduğu şey.** Körfez varışta boş değil. Liman saymanının diyalogu açık ve
orada listeli, `tallyman hello` hemen mevcut ve o konuşmanın üç repliği ilk aksiyonu açıyor —
`hello`, `what leaves`, `that night`, `read the departures`. Yani "saymanın konuşması işlenene
kadar her mevsimde boş" ifadesi sebep konusunda doğru, kelime konusunda yanlıştı: yapılacak
bir konuşma var ve bir konuşma içeriktir. Q-9 körfezi bilerek oyunun en ince bölgesi yaptı;
dört aksiyonlu üç yer, o kararın görüntüsü.

**Gerçekten yanlış olan şey ve o daha küçük yarı.** Dört aksiyonun ikisi
`display_conditions: {season: {yes: marrowmoth_seasons}}` taşıyordu, ki bu onları mevsimi
dışında **saklıyor**. Kışın gelen biri o işin var olduğunu öğrenmiyordu. Bu, projenin Faz
4'te yerleşim aksiyonları için yazılmış ve P-25'te yeniden ifade edilmiş kendi kuralına
aykırı: bir aksiyon alınabilir olmadan önce görünür ve neden alınamadığını söyler; çünkü
kimsenin göremediği kilitli bir kapı hedef değildir.

**Düzeltme bir taşıma, yeni makine değil.** `required`, `display_conditions`'ın çalıştırdığı
aynı koşul kümesini çalıştırıyor; yani mevsim birebir aynı okunuyor. Değişen şey, motorun
düğmeyi çizmeden önce ikisinden hangisini sorduğu. Ardından
`check_actions_can_explain_failure` reddetme metnini zorunlu kıldı — kontrolün tasarım işini
yapması: *"İndirilen bir şey yok. Marrowmoth ilkbaharda ve sonbaharda çalışıyor; yılın
kalanında rıhtım bir sıra depodan ibaret."*

Dört mevsimde `can_be_started` üzerinden ölçüldü: her zaman görünüyor, ilkbahar ve sonbaharda
başlatılabiliyor, yaz ve kışta sebebiyle reddediliyor.

**Muhafız: `check_no_action_hides_on_a_recurring_condition`.** `season` ve `moon`, oyuncu
hiçbir şey yapmadan kendiliğinden gelen iki koşul; onlarda saklanmayı yanlış yapan da bu —
aksiyon **kesinlikle** kullanılabilir olacak ve oyuncuya geri gelmek için bir sebep
verilmiyor. Bir beceri ya da bayrak zamanın geçmesi değildir ve bu kontrol onlar hakkında
hiçbir şey söylemiyor.

72 aksiyon, hiçbiri ikisinde saklanmıyor. **Textline'lar muaf ve üçü bunu kullanıyor**:
geçerli olmayan bir replik sunulmamalı ve bir replikte sebebin konulacağı bir reddetme yolu
yok. Manifesto'nun mevsimini eski yerine koyarak negatif test edildi.

### v0.7.24 - bir süre, birimlerini oyuncunun dilinde söylüyor

P-29, bir ekran görüntüsünden: Türkçe bir panelde *"Sonraki seviyeye kalan 3801 saat
(**2 days 15 hours 22 minutes** gerçek zamanda)"*.

**Sorun `locales/turkish.js` değildi** — sahibi oraya işaret etti ve
`check_translations_have_no_english` o dosyanın her satırını tarayıp geçiyor. İngilizce,
`src/game_time.js` içindeki `format_time`'daydı: on düz kelime — `year/years`,
`month/months`, `day/days`, `hour/hours`, `minute/minutes` — bir `long_names` bayrağının
arkasında, hiçbir yerel satırdan geçmeden dizgeye kurulmuş. **Projenin bütün kontrollerine
görünmez**, çünkü İngilizce sızıntı kontrolü çevirileri okuyor ve hiç çevrilmemiş bir metnin
okunacak satırı yok.

**Düzeltmenin nereye gitmesi gerektiği ve bunun hatanın olduğu yer olmadığı.**
`game_time.js`'in **hiç import'u yok** — `src/` içindeki tek yaprak modül — ve kelimelerin
yerelden gelmesi gerekiyor; yerel ise `translation.js`'in arkasında, o `main.js`'i,
o da `game_time.js`'i import ediyor. Çeviri katmanına orada uzanmak, hiç döngüsü olmayan tek
modülün üzerinden bir döngü kapatırdı.

Yani aritmetik kalıyor, sözcükler taşınıyor. `split_duration` dakikaları saate, saatleri güne
taşıyor ve dışa aktarılıyor; `format_time` kısa biçimi koruyor — `2D15h22m` kelime değil harf
olduğu için yerelsiz bir dosyada güvenli — ve `display.js` içindeki
`format_duration_in_words` söyleme işini yapıyor; yerelin zaten bulunduğu yerde.

**Taşımadan önce ölçüldü: `long_names: true`'nun tam olarak bir çağıranı vardı** —
`display.js`'teki "sonraki seviyeye kalan" satırı, ki ekran görüntüsündeki dize de o.
Dolayısıyla bayrak ve on kelimesi yerinde çevrilmek yerine tamamen kaldırıldı.

**On satırın dördü zaten vardı.** `display.js`, başka bir panel için `ui time hour`,
`ui time hours`, `ui time minute` ve `ui time minutes`'ı çözüyordu; `format_time` ise kendi
kelimelerini kuruyordu. Altı satır aileyi tamamlıyor. Türkçe bir sayıdan sonra ismi çoğul
yapmıyor — "2 gün", "2 günler" değil — yani iki biçimi de aynı şeyi söylüyor; bu bir kopya
değil doğru cevap.

**Artık iki kontrol kapsıyor ve biri bedava.** Kimlikler kurulmak yerine çözüldüğü için
`LOCALE_STRICT=1`, eksik olan biri istendiği anda düşüyor — düzeltmenin yapısal yarısı. Ve
`check_duration_units_have_rows`, katılığın kapsayamadığını kapsıyor: listeye eklenen ama
satırlarını kimsenin yazmadığı bir birim. Birim listesini yeniden ifade etmek yerine
`display.js`'ten okuyor, yani "week" eklemek kontrolün kendi kendiyle hemfikir kalmasına yol
açmıyor — iki yönden negatif test edildi: bir Türkçe satır silinerek ve altıncı bir birim
eklenerek.

`check_no_unused_locale_rows`'a da `ui time <birim>`'in artık kurulmuş bir aile olduğunun
söylenmesi gerekti. Bunu kendi mesajı söylüyordu; kendi masrafını çıkaran kontrol tam olarak
bu türden.

### v0.7.23 - günlük, siz onu okurken güncelleniyor

P-31; *"burası stateless galiba, ya da hemen yenilenmiyor"* diye bildirildi. **Teklif durumu
abartmıştı ve onu düzelten şey ikinci ölçüm oldu** — P-33'ten sonra bu, üst üste ikinci.

**Teklifin söylediği.** Keşifler panelini *hiçbir şeyin* yeniden çizmediği: dört çağıran ve
hepsi `index.html`'deki filtre girdileri. **Beş tane var.** `showDiscoveries()`, sekme
açılışında güncellemeyi çağırıyor; `showLore()` da aynısını yapıyor — hem de ikisinin de
yanında, açılışta yeniden kurduklarını ve nedenini söyleyen bir yorum var. "Dört çağıran
buldu" diyen arama beşinci satırı kırpmış.

**Gerçekte doğru olan şey ve bildirilenin ta kendisi.** İki panel de **zaten açıkken**
yeniden çizilmiyordu. Oyuncu listeye bakıyor, bir şey topluyor ve sayı, sekme değiştirip
dönene ya da bir filtreye dokunana kadar kımıldamıyor. `item_log.log_items`,
`add_to_character_inventory`'den çağrılıyor, `update_displayed_item_log` bir alt satırda
yenileniyor ve günlük yenilenmiyordu.

**`refresh_open_journal_panels`**, panelin baktığı şeyin değiştiği iki yerden çağrılıyor:
`character.js`'te `log_items`'ın ardından ve `start_textline` içinde
`textline.is_heard = true`'nun yanında — günlük ekrandayken duyulan bir lore repliği de aynı
durumdu.

**Açık olma koşuluna bağlandı**, çünkü alternatifi, kimsenin bakmadığı bir panel için uzun
bir bekleme oturumunun her toplamasında iki yüz girdilik bir listeyi yeniden kurmak.
`changeTab`, `display`'i satır içi yazıyor; yani bu bir yerleşim sorusu değil bir dizge
okuması — `offsetParent` daha katı olurdu ve yerleşimi zorlardı, ki eşya başına bir kez
sorulan bir şey için yanlış takas. Bir durum hâlâ "evet" diyip hiçbir şey göstermiyor —
günlüğün başka bir panelin arkasında açık olması — ve orada yanılmanın bedeli, kimsenin
görmediği bir yeniden kurulum.

**Yardımcı `display.js`'te yaşıyor**, `journal_panels.js`'te değil; ve bu keyfi değil:
çağıran `character.js` ve o zaten `display.js`'ten import ediyor, oysa
`journal_panels` → `items` → `character` yeni bir döngü kapatırdı. `display.js` ise iki
güncelleyiciyi zaten import edip hiçbirini kullanmıyordu; bulgunun öteki yarısı da bu.

**Muhafız: `check_every_panel_updater_is_called`.** Teklifin yanlış okuması gerçek bir
başarısızlığı tarif ediyor, dolayısıyla bu olmasa da bir kontrole değer: bir paneli çizen ve
hiç çağrılmayan bir fonksiyon, hiç görünmeyen bir paneldir ve tam olarak çalışan kod gibi
okunur. Çağıranlar `src/` altındaki her modülden **ve** `index.html`'den sayılıyor, çünkü
günlük sekmeleri satır içi işleyicilerle bağlı — `check_onclick_names_are_reachable` öteki
yönü yürüyor. 48 güncelleyici, hepsi çağrılıyor; yeni yardımcıya yapılan iki çağrıyı
kaldırmak onu adıyla düşürüyor.

### v0.7.22 - yedi eşya oyuncuya registry anahtarını göstermeyi bırakıyor

P-33, bir envanter ekran görüntüsünden: iki düzgün çevrilmiş eşyanın arasında duran
`[ayak] Snakeskin boots`. **Teklifin teşhisi yanlıştı ve onu düzelten şey ölçüm oldu.**

**Teklifin söylediği ve neden yanlış olduğu.** İki `component <tip>` satırının eksik
olduğunu söylüyordu — `leg armor interior` ve `shoes interior` — gerekçesi de şapka, yelek
ve eldivenin birleşip tayt ile botun birleşmemesiydi. Ölçüldü: **o beş satırın hepsi var,
iki yerelde de.** Önceki arama onları hiç aramamıştı; başka bir satır ailesini taramış ve
sonuç okunmak yerine çıkarsanmıştı.

**Gerçekte olan şey.** `Armor.getDisplayName` önce `name <anahtar>` satırını çözüyor, sonra
`components.external`'dan birleştirmeyi deniyor, sonra anahtara düşüyor. Yedi giysi
şablonunda ikisi de yok: ne `name` satırı, ne de harici bileşen — **çünkü kendileri
bileşen**. Dolayısıyla oyuncunun okuduğu şey anahtar oluyor.

İki değil yedi — ve beş farklı bileşen tipinde; tek-sebep teorisini sürdürülemez kılan da
bu:

| eşya | tip |
| --- | --- |
| `Snakeskin boots` | shoes interior |
| `Snakeskin leggings`, `Linen leggings` | leg armor interior |
| `Linen bandanna` | helmet interior |
| `Wool shirt` | chestplate interior |
| `Iron chainmail vest`, `Steel chainmail vest` | chestplate exterior |

On dört satır bunu düzeltiyor — iki dilde yedi eşya. İngilizce satırlar anahtarların
kendisi; boşluğun görünmez olmasının sebebi de tam olarak bu: geri düşüş referans dilde
doğru okunuyor, öteki her dilde ekrandaki tek çevrilmemiş şey oluyor. Türkçesi oyunun kendi
sözlüğünü izliyor, ki o sözlük zaten oradaydı: `material name snakeskin` "yılan derisi" ve
`component shoes interior` "ayakkabı", yani bot "Yılan derisi bot".

**Muhafız: `check_no_item_shows_its_key`.** Her yerelde bir eşya, ya bir `name <anahtar>`
satırı çözmek ya da anahtarından farklı bir ad birleştirmek zorunda. Değeri anahtara eşit
olan açık bir satır sorun değil — `"name Iron ore": "Iron ore"` bir geri düşüş değil çeviri
— ve kontrolün tamamı bu ayrımda: adın *çözülüp çözülmediğini* soruyor, doğru görünüp
görünmediğini değil.

İki yerelde 916 ad araması. Girerken tam on dört bulgu bildirdi; düzeltmeyi yönlendiren de
o oldu, tersi değil. Bir satırı yeniden kaldırmak onu adıyla düşürüyor.

**Neden daha önce yakalanmadı.** `check_item_display_names`, ad satırı **olan** her eşyayı
olduğu gibi bildiriyor; `check_no_two_items_share_a_name` ise var olan satırları
karşılaştırıyor. Hiçbiri, satıra ihtiyacı olan bir eşyanın satırı olup olmadığını sormuyor —
ve `LOCALE_STRICT=1` yalnızca *istenen* bir kimlikte düşüyor, oysa `getOptionalText` hiç
istemeyen bir yoklama.

### v0.7.21 - bataklık kabilesinin itibarı var

P-28, oyundan bildirildi: *"bataklıktaki görevleri tamamladık ama bir rep kazanamadık"*; ve
karakter sayfasında kasaba, köy ve kenar mahalle için satır varken kabile için hiçbir şey
yoktu.

**Sayfa doğruyu söylüyordu.** `character.reputation` dört bölge tanımlıyordu ve `Swamp` yoktu;
oysa kabilede bir reis, bir aşçı, bir terzi, bir tabak, bir izci, iki tüccar ve kendi pazar
bölgesi var.

**Eklemeden önce ölçüldü, çünkü Q-7'nin argümanı iki yönlü keser.** Q-7, Guild'i bayrak
kümesi değil bölge yapmıştı; gerekçesi *"oyuncunun yükselişini izleyebildiği bir sayı, üçüncü
bir yolu yol gibi hissettiren şeyin ta kendisi"*. Sonucu da şu: içeriğin zaten söylediği bir
şeyi tekrarlayan bir bölge hiçbir şey kazandırmaz. Ve kabile bunu **zaten** söylüyor:
tabağın replikleri `unknown`, `known` ve `liked` diye adlandırılmış, terzinin de bir `liked`'ı
var; diyalog kilitleriyle yürüyorlar. Yani bu, hakkınızda söyleyecek şeyi olmayan bir yer
değil. Bu, ilerlemesini oyuncunun göremediği bir yer ve sayı da onu görünür kılan şey.

**Beş kaynak, toplam 300**; Town'un değil Guild'in şekli: kaynakları tek seferlik olan tek bir
yerleşim. `swampcook deliver` 60, `swamptailor deliver` 60, `swamptanner deliver 1` 50,
`swamptanner deliver 2` 70, `swampscout help` 60.

**Ve `swampscout help` hiçbir şey vermiyordu** — ölçüldü: oyuncunun tamamladığı bir iş için ne
tecrübe, ne görev ilerlemesi, ne itibar. Kabilenin beşinci teslimatı ve karşılığında hiçbir
şey vermeyen tek olanı; ayarlama değil ödül almasının sebebi de bu.

**Tek kapı, çünkü tuzağı P-28'in kendisi adlandırmıştı**: *"arkasında hiçbir şey olmayan bir
sayı, sadece bir sayıdır… yoksa yalnızca yükselen ve hiçbir şey açmayan bir satır olur."*
Reisin Swamp 200'de bir repliği var — beş teslimatın dördü — ve bilerek bir ödül değil.
Kabilenin böyle bir şeyi ilan etmediğini, onun yerine yaptığı şeyin ayağınızı nereye
bastığınızı izlemeyi bırakmak olduğunu söylüyor.

**Maliyet, Q-7'nin ölçtüğü şeydi**: bir alan, dil başına bir ad satırı ve bir kontrol.
`load()`, kayıttaki anahtarları yürüyor ve tanımadığı bir bölgede uyarıyor; yani eski bir
kayıt `Swamp` olmadan geliyor ve tanımlı 0 geçerli kalıyor — Guild'in v0.7.2'de izlediği
yolun aynısı.

**İki kontrol ve biri üç sürüm önce benim yazdığım.**

`check_help_explains_standing` — P-14 faz 6 için yazılmıştı — yardım sayfası beşinci bölgeyi
**iki dilde** adlandırana kadar derlemeyi reddetti. Bu, kontrolün tam olarak yazıldığı işi
yapması: bir oyuncu bir satır kazanıyor ve yardım sayfasında onun ne olduğunu söyleyen hiçbir
şey bulamıyor. Yardım artık "beşinin dördü yer" diyor.

Ve bir yenisi. `check_a_reputation_region_opens_something`, `character.reputation`'ın
tanımladığı her bölgeyi, içerikte en az bir `display_conditions` ya da `required` tarafından
adlandırılmaya zorluyor. Ödüller saymıyor: her görevin içine ödeme yaptığı ve hiçbir şeyin
okumadığı bir bölge, tam olarak P-28'in uyardığı şekil; ve
`check_reputation_regions_have_names` her iki hâlde de geçiyor, ki onu hata değil tuzak yapan
şey buydu. Beşi de geçiyor; reisin kapısını kaldırmak onu adıyla düşürüyor.

### v0.7.20 - sandık, birinin gömdüğü şeyi tutuyor

P-35; mekanizmanın yayınlanmasından bir sürüm sonra bildirildi: her sandık aynı yün atkıyı
veriyordu. Teklifi kapatıyor ve hata tam olarak yazılmaya değer, çünkü mekanizma doğruydu,
içerik değildi.

**Ölçüldü ve şikâyetin iki yarısı tek bir sebepti.** %35 ve %25'te iki eşya grubu, bağımsız
atılıyor: atkı hançer başına 1,4 taneydi ve **açışların %41'i sikkeden başka hiçbir şey
vermiyordu** — kutudaki en büyük tek sonuç. Aynı anda tekrarlı ve boş; ve iki sayının
ayarlanması, iki şeylik bir havuzu düzeltmiyor.

**Gömülmüş bir zulanın ne tuttuğu ve cevap oyunda zaten vardı.** Hiçbir tüccarın satmadığı
22 düşman ganimetinden — P-24 için sayıldı — arka oda beş bitmiş olanı aldı; bunlar da
altındaki hamlar: `Wolf fang`, `Boar tusk`, `Bear claw`, `Bear hide`,
`Mountain goat horn`, `Frog hide` ve `Weak monster bone`; %2 ile %12 arası düşme oranlarıyla.
Her biri, 50-e-1 bir kasaplık yükseltmesinin **elli** tanesini istediği şey; atkıdan farkı da
bu: ikinci bir tılsım satış fiyatı kadar değerli, ikinci bir diş demeti ise bir nişanenin
ellide biri. Kopyalar sorun değil, meselenin kendisi.

Artık sekiz eşya grubu var, yedisi yığın. Açış başına beklenen 1,48 yığın ve yalnızca-sikke
durumu **%41'den %19'a** düşüyor. Atkı %8'de kalıyor — eski şansının on ikide biri — çünkü
kutudaki kişisel şey o.

**Muhafız: `check_a_rolled_set_is_not_mostly_nothing`.** Bulgu mekanik, kural da öyle: eşya
ya da para veren her grubun ıskalarını çarp; hepsi birlikte, en olası olanının isabet
ettiğinden daha sık ıskalıyorsa, kümenin en olası sonucu hiçbir şeyin çıkmamasıdır. Yalnızca
`items` ve `money` sayılıyor — etkilerden oluşan bir küme çoğunlukla hiçbir şey olabilir, ki
tuzak odur — ve türetilmiş bir şans tahmin edilmek yerine atlanıp sayımda anılıyor.
v0.7.19'un yayınladığı tam sayılara karşı negatif test edildi: %35'e karşı %41'i adıyla
bildiriyor.

**Ve ilk yazıldığında düşemiyordu**; bu, projede altıncı kez. İki regex, `$` (son çapası)
gerekirken `\$` (düz dolar) taşıyordu; yani sayısal şans testi hiçbir şeyle eşleşmedi, her
grup "türetilmiş" sayılıp atlandı ve kontrol hiçbir şey yapmadan geçti. Onu ele veren şey
özet satırı oldu: tam olarak bir tane olduğu yerde on türetilmiş şansın atlandığını
bildiriyordu.

### v0.7.19 - şans taşıyabilen bir ödül ve canı yakabilen bir ödül

P-24'ün son üçte biri ve teklifi kapatıyor. Tuzak ile çeşitli içeriklerin **iki değil bir
mekanizma** olduğu ortaya çıktı — v0.7.18'in kaydettiği bulgu buydu, bu sürüm de onu
uyguluyor.

**Önünde ne duruyordu.** Bir aksiyonun tek başarı yolu var ve `rewards`'ı yalnızca başarıda
tetikleniyor; yirmi dört türden hiçbirine bağlı bir şans yok. Yani bir sandık her seferinde
aynı sikkeyi ve aynı atkıyı veriyordu ve "bazen ısırır" hiç yazılamıyordu. `UsableItem`
üzerindeki `recovery_chances`, motorun şansa bağlı tek verimi ve o da bir etkinin gerçekten
uygulanmasına bağlı — `use_item`, ancak `add_active_effect` true döndürürse geri kazanımları
işliyor — ve hiçbir beceriye bakmıyor.

**İki ödül türü, ikisi de genel.**

`rewards.effects: [{effect, duration}]` — bir aktif etki; yemeğin, düşmanların ve dev
konsolunun kullandığı aynı `add_active_effect` üzerinden. Yirmi dört türün her biri bir şey
*veriyor*; bu, alabilen ilk tür. Sandık kapağındaki tuzak bir süre için bir debuff ve bu bir
**maliyet** — açtığınız şey yine sizin.

`rewards.chance_of: [{chance, rewards}]` — bağımsız atılan ödül grupları. `chance` bir sayı
**ya da onu türeten bir fonksiyon** olabilir; bir tüccarın `inventory_template`'inin zaten
aldığı şekil ve aynı sebeple: kilitten anlayanın daha sık fark ettiği bir tuzağın, atıldığı
anda beceriyi okuması gerekiyor ve hesaplanmış bir şansı saklamak, Q-10'un karara bağladığı
"türet, saklama" hatası olurdu. Yayınlanan fonksiyon üzerinden ölçüldü: Kilit açma 0'da %30,
10'da %22, 20'de %14, 30'dan itibaren %6.

**Sandık artık**: sikke ve pratik kesin; %35 atkı, %25 hançer, %15 altında 2.600 daha olan
gizli dip ve türetilmiş şansta iğne.

**Üç muhafız, üç negatif test ve düşemeyen bir kontrol.**

`check_reward_keys` iki yeni türü de reddetti; haklı olarak — **listesi elle yazılmıştı**,
oysa kendi yorumu "main.js'in okuduğundan alındı" diyordu. `reachable_item_names()`'in
paylaşıldığı yazılıp tek çağıranı olmasıyla aynı şekil. Artık türetiliyor: main.js'ten
`rewards.<anahtar>`, 26 anahtar; ayrıca bir taban öne sürülüyor, böylece hiçbir şey bulmayan
bir tarama her şeyi kabul edemiyor.

Ve atılan bir grup, yalnızca yüklemenin atladığı şeyleri tutabiliyor. Bitmiş bir kitap
ödüllerini her yüklemede yeniden uyguluyor; yani şansa bağlı bir *kilit açma* yeniden
atılırdı — bir yüklemede verilir, ötekinde eksik, ve hiçbir şey düşmez. Güvenli türler de
türetiliyor: main.js'in `!only_unlocks` **ya da** `!is_from_loading` arkasına aldığı türler.
Yalnızca ilk bayrağı okumak `messages`'ı güvensiz sayıyordu, oysa bir kütük satırı tam da
atılan bir grubun isteyeceği şey.

**Kuralın ilk hâli kendi iki negatif testinin ikisini de geçemiyordu**; bu, projede beşinci
kez. `top_level_keys` kullanıyordu, ki satır tabanlı ve satır başına tek anahtar döndürüyor;
yani bir satıra başka bir anahtarın yanına konmuş kilit türü doğrudan geçti. Ayrıca `chance`
kelimesini grup grup değil bütün `chance_of` dizisinde arıyordu, dolayısıyla bir grubun
şansını silmek yine geçiyordu. Üst seviye virgüllere göre ayıracak ve her grubu kendi başına
okuyacak şekilde yeniden yazıldı — artık bir kilit türü, eksik bir şans ve ödülsüz bir grup
adıyla düşüyor.

### v0.7.18 - kilitli bir sandık ve oyunun iki kez şakasını yaptığı beceri

P-24'ün ilk üçte ikisi. Arc kilit açmayı iki kez yok saymıştı — P-14'ün planlama notu böyle
bir beceri olmadığını yazıyor ve gelgit düzlüklerinin başarısızlık metni tam da olmadığı
için onunla şaka yapıyor — ve Q-1'in ikinci revizyonu yeni bir beceriyi kapsama aldı.

**Bunun neredeyse hiçbiri yeni makine değil; bulgu da bu.** İsteğin ihtiyaç duyduğu her
parça zaten vardı ve ölçüm hangi mevcut parça olduğuyla ilgiliydi:

- **Beceri gradyanı**, iki-set koşul rampası. `process_conditions`, `conditions[0]` ile
  `conditions[1]` arasında bir kesir döndürüyor ve `get_success_chance` onu
  `chances[0] + (chances[1] - chances[0]) * status` olarak okuyor. Yani
  `[{skills: {Lockpicking: 0}}, {skills: {Lockpicking: 30}}]` ile
  `success_chances: [0.2, 0.9]`, 0. seviyede %22, 10'da %46, 20'de %69 ve 30'dan itibaren
  %90 veriyor — yayınlanan formül üzerinden ölçüldü, hesaplamak için tek satır yazılmadan.
  Becerinin azami seviyesi 30, çünkü rampa orada duruyor; yani kilit iyileşmeyi bıraktığı
  anda beceri de bitiyor.
- **"Kilitli bir sandık asla çıkmaz sokak olmamalı"**, Faz 4'ün kuralı ve bedavaya geliyor.
  `main.js`, `remove_on_success && is_won || remove_on_fail && !is_won` okuyor; yani
  yalnızca `remove_on_success`, başarısız bir denemenin sandığı bıraktığı anlamına geliyor.
  `keep_progress` ise o ana kadar harcanan zamanın onun üstünde kaldığı anlamına geliyor.
  Başarısızlık yalnızca denemeye mal oluyor — beceri de böyle öğreniliyor, çünkü tecrübe
  başarıda ve 0. seviyeden itibaren denemelerin beşte biri başarılı.
- **Bulunma**, `loot_list` üzerinden; çünkü P-24'ün kendi kuralı, bunun onun yanında ikinci
  bir ganimet sistemine dönüşmemesi. Dört bölgede dört düşman, %0,4: orman ayısı, yaban
  domuzu, dağ keçisi ve timsah. Bulduğunuz şey hayvanın üstünden değil ve açıklama bunu
  söylüyor.

**Beceri baştan açık**; bir kitabın öğrettiği Butchering ve Shellwork'ün aksine. Bunu
öğretebilecek tek şey kilit ve kilit de beceriyi istiyor: tek eğitmeni kendisini isteyen
kilitli bir beceri bir kısırdöngü. Onun yerine `visibility_treshold`, ilk denemeye kadar
onu gizliyor.

**Tek kilit, tek yer — köy.** Aksiyonlar lokasyonlarda yaşıyor; köy hem merkez hem ilk
sandık kaynağının bölgesi. Sandık ayrıca 300'e satılabiliyor — içindekinin genellikle
ettiğinin bir kısmı — yani beceriyi istemeyen biri kesin küçük olanı belirsiz büyük olana
tercih edebiliyor. Bu bir kayıp değil, bir seçim.

**İki kontrol girerken hakkını verdi.**

`check_actions_can_explain_failure`, aksiyonu başarı koşulu olup `conditional_loss` metni
olmadığı için reddetti. O yol erişilemez — rampanın tabanı Lockpicking 0 ve bir beceri
altına düşemez — ama `check_conditions_on_finish` sonda yeniden bakıyor ve metni olmayan
erişilemez bir yol, birinin tabanı yükselttiği günü bekleyen bir eksik-metin işareti.
Yazıldı.

Ve bir yenisi. `check_no_dead_end_skill_gates`, Faz 4'ün kuralını yalnızca **görev
ilerleten** aksiyonlar için uyguluyor; öteki yarının arkasında hiçbir şey yoktu, çünkü
bugüne kadar oyunda hem eşya isteyen hem başarısız olabilen bir aksiyon yoktu — eşya
isteyen on birinin hepsinin `success_chances[0]`'ı 1. Kontrolü yazarken ölçüldü: kilit
girince başarısız olabilen dört tane var — kilit, `climb the mountain`, `cut a flue` ve
`rappel waterfall` — ve hiçbiri girdisini yemiyor.
`check_a_failed_attempt_keeps_what_it_needs` bunu tutuyor: başarısız olabilen bir aksiyon,
`required`'ının adlandırdığı hiçbir şeye `remove_on_fail` koyamaz; çünkü başarısız bir
denemenin yediği sandık bir maliyet değil, o denemenin sizi iyileştirdiği şeyde kötü
olmanın cezası. Bayrağı ekleyerek negatif test edildi.

**P-24'te kalan: tuzak** ve o, veri değil motor işi istiyor. Bir aksiyonun tek başarı yolu
var ve `rewards`'ı yalnızca başarıda tetikleniyor, hiçbirine bağlı bir şans yok — yani
"sandık bazen ısırır" ifade edilemiyor. `UsableItem` üzerindeki `recovery_chances`, motorun
şansa bağlı tek verimi ve o da bir etkinin gerçekten uygulanmasına bağlı (`use_item`,
`add_active_effect` true döndürmezse geri kazanımları işlemiyor) ve hiçbir beceriye
bakmıyor. Çeşitli içerikler de aynı şekle sahip: şu an her başarılı açış aynı sikkeyi ve
aynı atkıyı veriyor, çünkü ödüller zar atamıyor. İkisi de aynı şeyi istiyor — şans
taşıyabilen bir ödül — ki bu iki mekanizma değil bir mekanizma.

### "Bu hiç elde edilebilir mi" sorusu artık bütün registry'ye soruluyor

P-27 ve kapanıyor. Oyuncuya hiçbir şeyin veremediği dört elle yazılmış eşya; üçü gitti,
biri sebebiyle yazıldı ve onları yakalayacak iki kontrol artık var. Bakım işi: oyuncunun
ulaşabileceği hiçbir şey değişmedi, çünkü işin içinde oyuncunun ulaşabileceği hiçbir şey
yoktu.

**Ne silindi ve silmenin neden güvenli yarı olduğu.** `White steel chainmail` ile
`Black steel chainmail`, `White chainmail` ve `Black chainmail`'in bayt bayt kopyasıydı —
aynı sınıf, aynı 180 değer, aynı `material_type` — ve **görünen adlarını** da onlarla
paylaşıyorlardı. v0.7.5 bunları kullanmak yerine ikinci çifti ekledi, çünkü bileşen üreteci
malzemesini `"white chainmail"` diye anahtarlıyor; o registry anahtarı artık oyuncu verisi
ve adı değiştirilemez, dolayısıyla giden eski çift oluyor.
`Scraps of wolf rat meat`, oyunda `material_type: "meat"` olan tek eşyaydı ve hiçbir tarif
o türü istemiyor — kurt sıçanları `Rat meat chunks` düşürüyor. Silmek tam olarak *hiçbir
şeyin onları hiç üretmemiş olması sayesinde* güvenli: hiçbir kaynağın yapmadığı şeyi hiçbir
kayıt içeremez.

`Basic spare parts` kalıyor; `known_unreachable_items` üzerinde, sebebiyle. Açıklaması ne
için olduğunu söylüyor — *"teçhizat üretimi için gerekli"* — ve hiçbir tarif onu istemiyor;
bu, artık kalmış bir şeyden çok bağlanmamış bir niyet gibi okunuyor. Silmek fikri çöpe
atardı; kaynak vermek ise ima ettiği sistemi icat etmek olurdu.

**İki kontrol ve her biri girerken bir şey buldu.**

`check_items_can_be_got`, ailenin üçüncüsü. `check_components_can_be_made` "bu elde
edilebilir mi" sorusunu 203 üretilmiş bileşene, `check_books_can_be_got` kitaplara soruyor;
192 düz bildirime kimse sormuyordu. Erişilebilir olmak: bir tarifin, bir tüccarın, bir
düşüşün, bir ödülün ya da bir toplama etkinliğinin adlandırması — ya da `components` veya
`component_type` taşımak, ki o öteki kontrollerin işi; çünkü birleştirilmiş bir kalkanın
envanter anahtarı, şablonunun adından değil parçalarından kuruluyor.

**Ve paylaşılan yardımcının ne paylaşıldığını ne de tamam olduğunu buldu.**
`reachable_item_names()`, *"check_components_can_be_made ve check_books_can_be_got
tarafından paylaşılıyor… yeni bir kaynak türü buraya bir kez öğretiliyor"* diye
belgelenmişti — ve `check_components_can_be_made` aynı sekiz desenin kendi gövde içi
kopyasını hâlâ taşıyordu, yani tek çağıranı vardı. Daha kötüsü: yardımcı dört kaynak türü
biliyordu, **beş** var. Bir `LocationActivity`'nin `resources`'unu hiçbir şey okumuyordu;
oysa oyundaki her cevher, kütük, ot, yün ve kum oradan geliyor — düz registry'nin yaklaşık
beşte biri. İlk iki çağıranın soracağı toplanmış bir şey olmadığı için eksik küme hiç
görünmedi. İkisi de düzeltildi; yardımcının üç çağıranı var ve toplamayı biliyor.

`resources`'u okumak, tembel bir `[\s\S]*?\]` yerine derinlik saymayı gerektirdi; çünkü
bir kaynak `ammount: [[1,1], [1,3]]` taşıyor ve ilk `]` iki seviye içeride. O kırpma bütün
balıkları gizliyordu; kendini böyle duyurdu.

`check_no_two_items_share_a_name` ise öteki. `check_item_name_collisions`, bir eşyanın
`name:` ALANINI başka eşyaların anahtarlarıyla karşılaştırıyor; bu bir şekli yakalıyor ama
şunu yakalamıyor: `name <anahtar>` satırları aynı dizgeye çözülen iki farklı anahtar. Oyuncu
o zaman aynı adı iki kez görüyor — envanterde, takas listesinde ve Keşifler'de — hangisinin
hangisi olduğunu bilmenin yolu olmadan. Girerken dört kez düştü — iki zırh örgüsü çifti, iki
yerelde — ve artık iki yerelde 508 ad geçiyor.

**Üç yönden negatif test edildi**: mazeret listesinde bırakılmış erişilebilir bir eşya
(bayat mazeret dalı), yardımcının toplamayı yeniden unutması (20 eşya bildirildi) ve iki
eşyaya aynı görünen adın verilmesi.

### v0.7.17 - kutunun altındaki kutu ve takvime bir ay eklendi

P-25'in son parçası ve teklifi kapatıyor: arada çıkan karaborsa. Teklif bunun *"itibara
**ve** zamana bağlı bir stok listesi olduğunu ve arc'ın bu ikisinin de yarısını çoktan
yayınladığını"* söylüyordu. İtibar yarısı doğruydu. Zaman yarısı değil.

**Yayınlanmış zaman koşulunun neden yanlış olanı olduğu.** `season`, *yılın* çeyreği. Bu,
yılda iki kez gelen bir tekne için doğru ritim — Q-10 onu bunun için karara bağladı — ve
arada bir çıkması gereken bir şey için çok yavaş. Bu yüzden koşullar bir `moon` kazandı;
`season` ile aynı `{yes, not}` şeklinde ve aynı sebeple: arkasında hiçbir zamanlayıcı
olmadan kendiliğinden açılan tekrarlı bir pencere. Bir evre 29,5 günün çeyreği, yaklaşık
7,4 gün; yani her ay geliyor ve dört günde bir tazelenen bir tüccar genellikle içine bir
kez düşüyor.

**Haftanın günü ise ölçüldü ve elendi.** Bariz kol gibi görünüyor ve bir artefakt:
`Trader.can_refresh`, `last_refresh`'i `refresh_time`'ın katına oturtuyor; yani dört günlük
tazelemeyle bir gün koşulu ve tazeleme ızgarası ancak 28 günde bir buluşuyor. Bu, iki
ızgaranın etkileşimi; kimsenin tasarladığı bir ritim değil.

**Kutuda ne var — iki tasarım ölçümden geçmedikten sonra.**

*Bitmiş nişaneler* bariz ve en gösterişli cevaptı. Kimsenin satmadığı beş artefakt ve her
biri arka odanın 50-e-1 kasaplık yükseltmelerinden **dört** tane istiyor — bir dağ keçisi
nişanesi 200 kusursuz boynuz, boynuz da %2 düşen 50 keçi boynuzu: on bin öldürme mertebesi.
Fiyat sistemi bunu söyleyemiyor. Fiyat `değer` çarpı marj, nişanenin değeri 650 ve hiçbir
marj on bin öldürmeyi bir sayıya çevirmiyor: birini birkaç bine satmak, oyundaki en derin
öğütmeyi anlamsız kılardı. v0.7.10'un kayıkçısı ve P-23'ün kitabıyla aynı bulgu şekli —
ekonominin kolu değer çarpı marj ve nadirliği ifade edemiyor.

*Kalite* edebiliyor. Ölçüldü: **oyundaki her listede kalite adlandıran 183 stok girdisi var
ve hiçbiri 120'yi geçmiyor**; yardım sayfası bunu bir kural olarak yazıyor. Yani
karaborsanın ayırt edici yanı farklı mallar değil, aynı malların kimsenin satmasına izin
verilmediği kadar iyisi — Intermediate listesinin zaten 70-120'de sunduğu dört deri
pelerin, burada 130-160'ta. Ve ekonomi bunu kendiliğinden doğru fiyatlıyor, çünkü kalite
değeri çarpıyor ve yolda bir nadirlik bandı geçiyor: 150'deki bir pelerin değer x1,5 x1,3
iken aynı pelerin 120'de değer x1,2 x1,1.

Yardım artık bunu söylüyor, çünkü yazdığı kuralın bir istisnası var: *"herhangi bir dükkânın
sunduğu en yüksek eşya kalitesi %120 — bir istisnası var ve o, dükkân saatlerine uymuyor."*

**Ve kadın gecenin hangi tür gece olduğunu söylüyor.** Slums 300 **ve** yeni aya bağlı bir
replik; arka oda repliğinin aksine duyulduktan sonra kilitlenmiyor — tekrarlı bir şey ve
kadın onu yine söylerdi. O kadar iyi bir pelerinin nereden geldiğine ve sormaya dair bir
görüşü var.

**İki muhafız, üç negatif test ve kendi kontrolümün yakaladığı bir şey.**

- `check_moon_phases_are_real`, dört adı `game_time.js`'ten okuyor — burada yazılı bir
  listeden değil — ve her `moon:` koşulunu onlara bağlıyor. Yanlış yazılmış bir evre, var
  olan her evreye karşı yanlış döner; yani pencere hiç açılmaz ve dükkân öylece kalır.
  `"Dark"` ile negatif test edildi.
- İki tur önceki türetilmiş raf kuralı **kendi sınırında düştü**, ki işe yarayan kısım bu:
  üçlü şablon birkaç satıra yayılan bir blok gövde ve kontrol yalnızca ilk satırı okuyup
  hiç sabit bulamadı, üç beyan edilmiş listeyi de erişilemez bildirdi. Bu, yanlış şeye
  nişan alan doğru bir hata. Artık değerin tamamını `value_expression` üzerinden okuyor —
  yanındaki kardeş kuralın baştan beri kullandığı şey.
- Ayrıca `"New"`'i stok listesi adı sanıp bildirdi, çünkü evre dizgesi tüccarın kendi
  fonksiyonunun içinde duruyordu. Bu, kontrol hatası değil gerçek bir tasarım kokusuydu:
  `getMoonPhaseName`'in dört adı `game_time.js`'te yaşıyor ve birinin başka bir dosyadaki
  beşinci kopyası hiçbir şey fark etmeden yanlış yazılabilir. Artık
  `current_game_time.isNewMoon()`; ikisini de çözüyor.
- Karaborsayı beyandan çıkararak ve fonksiyonu onu döndüremez hâle getirerek negatif test
  edildi.

**P-25 backlog'dan çıkıyor.** Dört parça: yüksek ve düşük itibarda farklı konuşan NPC'ler
(v0.7.15 ve bunu mümkün kılan itibar tavanı), yalnızca yüksek itibarda satılan eşyalar
(v0.7.16 ve ondan önceki Keşifler zemin işi), bir arka oda (aynı v0.7.16 — aynı şey olduğu
ortaya çıktı) ve arada çıkan karaborsa. Teklifin "hiçbiri motor işi gerektirmiyor" iddiası
iki kez yanlıştı: itibarın tavanı, zamanın da evresi yoktu.

### v0.7.16 - ikinci kutu ve içindekiler ölçüldü

P-25'in ikinci parçası: yalnızca yüksek itibarda satılan eşyalar. Mekanizmayı teklif ve
geçen turun zemin işi çözmüştü; ölçüm gerektiren şey **böyle bir rafta ne olacağıydı** ve
teklifin kendi iki önerisi ölçümden geçmedi.

**Teklifin önerdiği ve ikisinin de neden olmadığı.** *"Yapılamayan sekiz üretilmiş bileşen
ile 5. kademe ailesi zaten elde duruyor."* Ölçüldü: yapılamayan sekizi mükerrer — beşi,
tariflerin gerçekten adlandırdığı elle yazılmış `Turtleshell *` parçalarını tekrarlayan
`Turtle shellplate` zırh parçaları; ikisi ise tarifleri iç kısımda duran malzemelerde kumaş
ayakkabılar. Onları satmak çöp satmaktır. 5. kademe ailesi ise v0.7.5'te düzlüklerin kendi
damarından üretilebilir oldu; onu satmak arc'ın yeni kurduğu zinciri baltalardı.

**Cevap neydi ve zaten yazılıydı.** Körfez tüccarı v0.7.8'den bir not taşıyor: bir raf,
*"oyuncunun yalnızca yapmak ya da avlamak zorunda kaldığı şeyleri, birinin onları uzaktan
taşıdığını söyleyen bir fiyatla"* tutmalı. *Yeni ganimet değil.* Buna karşı sayıldı:
**hiçbir tüccarın satmadığı 22 farklı düşman ganimeti.** Beşi o listenin en pahalı uçları
ve dördü oyunun **50-e-1 kasaplık yükseltmeleri**:

| eşya | başka türlü nasıl elde edilir |
| --- | --- |
| `Pristine mountain goat horn` | 50 keçi boynuzu, ve boynuz %2 düşüyor — 2.500 öldürme mertebesi |
| `Sharp bear claw` | 50 ayı pençesi |
| `High quality wolf fang` | 50 kurt dişi |
| `High quality boar tusk` | 50 yaban domuzu dişi |
| `Turtle shell` | binde beş düşüyor ve bir shellplate on tane istiyor |

Bunlar, bir oyuncunun haftalarca öğüttüğü ya da hiç sahip olmadığı şeyler. O odadaki biri
öğütmeyi çoktan yapmış; bir arka odanın bütün kurgusu da bu.

**Tek tüccar, iki değil.** Liste `[...inventory_templates["Intermediate"], ...]` olarak
kuruluyor — arka oda aynı adam, çünkü sokak sizi beğenmeye karar verdiğinde ikinci bir
dükkâncı edinmiyor. Teklifin kendi kuralı ve olmaması gerektiğini söylediği şey de buydu.

**Slums 300, türetildi.** Sokağın kendi işareti: yaşlı kadının sizi listeye yazdığını
söylediği itibar, *"yataktan kalkacağımız insanlar"*. Arka odanın aynı sayıda açılması, o
gerçeğin sokağın öteki tarafından görünüşü. Sınırda doğrulandı — 299'da Intermediate,
300'de arka oda.

**Kıtlık fiyatta değil şansta.** Kâr marjı tüccar başına ve bu aynı tüccar, yani pahalı
yapmak zaten mümkün değildi — ayrıca yanlış kol olurdu. Dört günlük tazelemeye karşı 0,12
ile 0,25 arası şanslar, elinde olduğunda olduğu anlamına geliyor.

**Ve kadın size söylüyor.** P-25 açıkça *"oyuncunun göremediği bir raf ödül değildir"*
diyor — yerleşim aksiyonları kazanılmadan önce görünüyor ve sebebiyle reddediliyor, bilerek.
Bu yüzden yaşlı kadın aynı 300'de bir replik alıyor ve bu bir tabela değil: adamda ikinci
kutunun hep olduğunu, değişen şeyin kapağı sizin önünüzde açması olduğunu ve hiçbirinin
nereden geldiğini sormamanızı söylüyor.

Söylenmenin öteki yarısı, geçen turun zemin işinin hemen kendini ödemesi: türetilmiş bir raf
artık olabileceği her listeyi beyan ettiği için, Keşifler paneli o beşini oyuncu oradan
satın alabilmeden **önce** kenar mahallenin sattığı şeyler olarak adlandırıyor.

**Yeni muhafız yok ve bu bilinçli.** Geçen turun kontrolü bu tüccarın beyanını var olduğu
anda doğruladı — bir türetilmiş raftan ikiye çıktı ve eklenecek bir şey olmadı — ve itibar
koşulu, v0.7.15'in yayınladığı üç kuralın kapsamında. Buraya dördüncü bir kural, raflar
hakkında değil bu raf hakkında bir kural olurdu.

**P-25'in bir parçası kaldı**: arada çıkan karaborsa. O, bu raf artı bir zaman koşulu ve
ikisi de artık var.

### Discoveries, bir tüccarın tuttuğu rafı değil tutabileceği her rafı öğreniyor

P-25'in kalan üç parçası için zemin işi ve üstüne inşa etmeden önce zemini ölçerken bulunan
bir delik.

**Yanlış olan neydi.** `stock_list_name_of`, *bu tüccar şu anda ne satıyor* sorusuna cevap
veriyor; bu bir dükkân için doğru, Discoveries indeksi için yanlış soru. `item_sources`
ilk kullanımda bir kez kuruluyor ve **oturum boyunca önbellekte tutuluyor**; yani panel ilk
açıldığında hangi liste güncelse kendini ona sabitliyordu. Paneli Marrowmoth'un iki mevsimi
dışında açın, körfezin limandaki stoğunun oturumun geri kalanında hiç kaynağı görünmezdi ve
hiçbir şey hata atmazdı.

**Bugüne kadar şans eseri zararsızdı.** Ölçüldü: `Bay` ve `Bay in port` listeleri **aynı on
beş eşya adını** taşıyor, yalnızca sayı ve şanslarda ayrılıyorlar; yani gerçekte hiçbir şey
kaybolmadı. Bunu sonrasına değil şimdi düzeltmeye değer kılan da tam olarak bu: türetilmiş
bir liste ötekinde olmayan bir şey taşıdığı an şans bitiyor ve itibara bağlı bir raf
tastamam odur. Dahası orada, oyuncunun henüz kazanmadığı eşya, panelin en çok adlandırması
gereken eşyadır — P-25 bunu kendisi söylüyor: *"Oyuncunun göremediği bir raf ödül
değildir."*

**Düzeltme.** `stock_list_name_of`'un yanına `stock_lists_of`, öteki soruyu cevaplıyor: bir
tüccarın kullanabileceği her liste. Çıplak bir ad kendine düşüyor, yani sekiz statik tüccar
için hiçbir şey değişmiyor; türetilmiş bir şablon ise listelerini beyan ediyor. İndeks
hepsini yürüyor.

**İki yarı birbirine karşı kontrol ediliyor**, çünkü hiçbiri tek başına güvenilir değil:
kimsenin doğrulamadığı bir beyan fonksiyondan uzaklaşır, kimsenin sayamadığı bir fonksiyon
da indekslenemez. `check_trader_stock_lists` artık türetilmiş şablonun kendi kaynağındaki
dizge sabitlerini okuyup beyanın onlarla birebir uyuşmasını şart koşuyor — eksik liste yok,
fazla liste yok ve beyan edilen her ad gerçek bir `inventory_templates` kaydına dayanıyor.
Üç yönden negatif test edildi: beyanı kaldırmak, iki listeden birini yazmak ve fonksiyonun
asla döndüremeyeceği bir rafı yazmak.

**Ayrıca bulundu ama burada düzeltilmedi**, P-27 olarak kaydedildi: oyunda hiçbir şeyin
üretemediği, satmadığı, düşürmediği ya da vermediği dört elle yazılmış eşya — `White steel
chainmail`, `Black steel chainmail`, `Scraps of wolf rat meat` ve `Basic spare parts`. İlk
ikisi 5. kademe zırh örgüsü malzemeleri; 180 değerinde, `material_type: "chainmail"` ile ve
adlandırma kuralının uyduğu 4. kademe çiftinin bir satır altında duruyorlar — v0.7.5 ise
onları kullanmak yerine yanlarına `White chainmail` ve `Black chainmail` ekledi.

### v0.7.15 - itibar bir tavan olabiliyor ve komisyoncu kuralı tekrarlamayı bırakıyor

P-25'in dört parçasından ilki: yüksek ve düşük itibarda farklı konuşan NPC'ler. Teklif,
dört parçanın da oyunun sahip olduğu iki mekanizma olduğunu — bir Textline üzerinde
`display_conditions` ve bir Trader üzerinde türetilmiş `inventory_template` — ve ilkinin
*"zıt koşullu iki replik"* olduğunu zaten ölçmüştü. Yazmadan önce yeniden ölçüldü ve zıt
koşul diye bir şey yoktu.

**İtibar yalnızca bir taban olabiliyordu.** `conditions.js`,
`character.reputation[region] < conditions[0].reputation[region]` okuyup altında
düşürüyordu; `conditions[1]` ise bir aksiyonun başarı şansını iki sayı arasında ölçekleyen
yumuşak bir rampa, sert bir tavan değil. Oyundaki altı itibar kapısının hepsi taban.
Dolayısıyla bir yer ısınabiliyor ama asla soğuk olamıyordu ve bir yabancının duyup bir
müdavimin duymadığı hiçbir şey yazılamıyordu.

**Şekil zaten dosyanın içindeydi.** `location_clears` `{at_least, at_most}` alıyor, boy
koşulları `{at_least, exactly, at_most}` alıyor; yani itibar da `{at_least, at_most}`
alıyor — icat değil, ödünç, ve `at_most` iki yerde de kapsayıcı. Çıplak bir sayı hâlâ
taban, ki mevcut altı kapının hepsi öyle, ve iki-set rampası sayısal forma bırakıldı. Her
iki form ve her sınır ölçüldü: `at_least: 100` 99'da düşüyor 100'de geçiyor, `at_most: 100`
100'de geçiyor 101'de düşüyor, pencere çalışıyor, olmayan bir bölge 0 okunuyor ve rampa
100 ile 200 arasında 150 itibarda hâlâ 0,51 döndürüyor.

**Ne söylediği ve neden komisyoncu olduğu.** *"Bana miktar getir, sana bir sayı vereyim.
Bana hikâye getirirsen sana hiçbir şey vermem"*, bir **yabancıya** verilen cevap ve
elindeki tek cevap buydu. Her kelimesi duruyor; yalnızca Town 150'de cevap olmayı
bırakıyor — kasabanın ilk kapısı, kapı muhafızının kuralı tekrarlamayı bırakıp size düzgün
baktığı yer — ki bu, adamın kendi 250 repliğinin epey altında, yani ikisi ayrı vuruş olarak
kalıyor. İki yarı da `lore: true` taşıyor; çünkü panel duyduğunuzu kaydediyor ve ikisinden
hangisini duyduğunuz ilk ne zaman geldiğinize bağlı.

Hiçbir şey mahsur kalmıyor: önce ölçüldü, `hello` hiçbir şey açmıyor ve yalnızca kendini
kilitliyor.

**Üç muhafız, dört negatif test ve yolda düşülen bir tuzak.**

Önce tuzak, çünkü işe yarayan kısım o. `display_conditions` alan her yapıcı onu
`[display_conditions]` olarak saklıyor. İki yeni selamlama dizi olarak yazılmıştı — ki
*doğru görünüyor* ve Location yapıcısının kendi `display_conditions = []` varsayılanı bunu
etkin biçimde öneriyordu — böylece `[[...]]` oldular, `process_conditions` `conditions[0]`
üzerinden hiçbir şey okumadı ve **iki replik de her itibarda göründü**. Derleme geçti.
Bütün kontroller geçti. Yalnızca koşulu yedi farklı itibarda çizdirmek yakaladı.

- `check_display_conditions_are_not_wrapped_twice`, nesne olması gereken yerde diziyi
  reddediyor; `src/` genelinde. 21 yazım, hiçbiri sarmalanmamış. `locations.js`'teki iki
  yanıltıcı `[]` varsayılanı artık nesne.
- `check_reputation_regions_have_names` sınırlı şekli öğrendi — `at_most`'u bölge adı diye
  okuyordu, kendini böyle duyurdu — ve artık `process_conditions`'ın okumadığı bir sınır
  anahtarını, itibarın asla karşılayamayacağı 0 altı bir `at_most`'u ve boş bir pencereyi
  de reddediyor.
- Ve bir tavan bir tabanla buluşmak zorunda. `{at_most: 149}` ile `{at_least: 150}` tam
  oturuyor; bir birim öbür yöne kaydırın, konuşmacının hiç repliği olmadığı bir itibar
  bandı oluşuyor ve bunu başka hiçbir şey bildirmiyor.

**P-25'te kalanlar.** Üç parça: yalnızca yüksek itibarda satılan eşyalar, bir arka oda ve
kenar mahalle tarafında bir karaborsa. Üçü de *öteki* mekanizma — saklanmak yerine türetilen
bir Trader `inventory_template`'i, ki v0.7.5 körfezin mevsimlik rafı için onu zaten
fonksiyon hâline getirmişti. Bu sürümün eklediği söz dağarcığı, eksik olan yarısı.

### Üçün üstünde ocak yok ve bunun ne zaman değişeceğini söyleyen kontrol

P-12'nin son açık maddesi; P-14 faz 6'nın ekonomi yarısını beklediği için tutulan madde:
*"3. kademe üstü bir istasyon. `roll_quality`, `station_tier - component_tier` okuyor, yani
dağ ocağında dövülen 5. kademe bileşenler iki kademe cezayla atıyor. Her şey yapılabilir
durumda; karara bağlanmayan şey, hak ettiği kalitede çıkması gerekip gerekmediği ve daha
iyi bir ateşin nerede olacağı."*

**Ölçüldü ve cevap şu: daha iyi bir ateşe gerek yok.** Üç ölçüm, alınma sıralarıyla.

**İstasyonlar gerçekte ne.** Dört üretim istasyonu var. Önemli olan ikisi de kademelerini
bir bayrağın arkasındaki **getter** ile hesaplıyor; yani modülün taze okunuşu Dağ kampını
forging 0, köyü 1 gösteriyor — ki bu, inşa edilmemiş bir dünyanın görüntüsü, oyunun kendisi
değil. Bayraklar açıkken: dağ ocağı forging ve smelting **3**, köy ocağı **2** ve en iyi
*montaj* istasyonu Swampland tribe, crafting **2**. Dağ kampında hiç `crafting` kademesi
yok, dolayısıyla 5. kademe bir silah eksi ikide dövülüp sonra eksi üçte birleştiriliyor.

**Cezanın bedeli.** Bileşen için kademe başına 15 kalite puanı, birleştirilmiş parça için
10 — ve kalite tavanı beceri seviyesi başına `100 + 2`, yani cezayı aşağıdan yutuyor.
Yayınlanan `get_quality_range` üzerinden ölçülen bileşen kaybı:

| Forging | ocakta 3. kademe | ocakta 5. kademe | kayıp |
| --- | --- | --- | --- |
| 10 | [84,112] | [56,80] | 32 |
| 20 | [116,140] | [84,112] | 28 |
| 30 | [144,160] | [116,140] | 20 |
| 40 | [176,180] | [144,172] | 8 |
| 50 | [200,200] | [176,200] | **0** |

Montaj kaybı ise **her seviyede, aralığın üst sınırında 0**: bileşenler 140'ta iken taban
zaten teçhizat tavanının üstünde, yani eksi üç aralığı yalnızca aşağı doğru genişletiyor.

**Ve sıralamayı hiç tersine çevirmiyor; bütün cevap da bu.** Saldırı çoğunlukla bileşenin
temel statlarından, ancak ikincil olarak kaliteden geliyor; dolayısıyla *cezalı* kalitedeki
5. kademe bir namlu, *cezasız* kalitedeki 3. kademeyi yeniyor. Aynı sapla birleştirilmiş
uzun kılıçlar, oyunun en iyi istasyonlarının gerçekten ulaşabildiği kalitelerde:

| Forging / Crafting | k1 | k2 | k3 | k4 | k5 |
| --- | --- | --- | --- | --- | --- |
| 20 | 16 | 32 | 46 | 68 | **81** |
| 40 | 34 | 67 | 96 | 141 | **178** |
| 60 | 49 | 98 | 142 | 207 | **261** |

Oyunun ortasında 5. kademe, cezasıyla birlikte 3. kademeye göre %76 kazanç. Yani ceza, 5.
kademeyi olabileceğinden küçük bir yükseltme yapıyor; kötü bir yükseltme yapmıyor. 4.
kademe bir istasyon, kendiliğinden kapanan bir eksiği düzeltir ve teçhizat tavanını
hikâyenin önüne geçirirdi — ki P-12'nin yapılmamalı dediği tek şey buydu.

**Muhafız: `check_higher_tiers_are_still_worth_reaching`.** Karar artık bir paragraf değil,
bir kontrol. Oyundaki en iyi istasyon kademesini lokasyonlardan türetiyor — bayrak adlarını
kaynaktan okuyor, yani üçüncü bir istasyon o görmeden eklenemez — sonra iki silah başı
ailesini Forging ve Crafting 20, 40 ve 60'ta kademeleri boyunca yürüyor, her birini
birleştirip saldırıları karşılaştırıyor. Her adım bir iyileşme olmak zorunda. 30
kademe/beceri noktası.

**Düşebilir olduğu varsayılmadı, doğrulandı** — bu projede şimdiye kadar üç kez düşemeyen
bir kontrol yazıldı. Kademe katsayısını 15'ten 60'a çıkarmak, ki makul bir yeniden ayar,
20. seviyedeki merdiveni 16, 32, 46, 46, **24** yapıyor: 5. kademe namlu, 3. kademeden kötü
hâle geliyor ve kontrol bunu adıyla bildiriyor.

**Dürüst sınırı ki bu da cevabın bir parçası.** Dağ ocağını 3'ten 1'e düşürmek — yani
oyundaki en iyi ocağın köydeki 2 olması, bugünden tam bir kademe kötü — **kontrolü
düşürmüyor**. Kontrol, en iyi istasyon neyse onu okuyup merdivenin hâlâ tırmandığını
soruyor ve üç kademe açıkta bile tırmanıyor. Bundan *daha kötü* bir ocağa sahip bir oyun da
kademelerini doğru sıralardı; daha iyisini inşa etmeye karşı argümanın en güçlü hâli de bu.

P-12 backlog'dan çıkıyor. Yol boyunca yayınladıkları: 4. kademe körfezin tuz evine, 5.
kademe v0.7.5'te gelgit düzlüklerine bağlandı, 36 bileşen yapılamazdan yapılabilire geçti
ve şimdi de 4. kademe bir ocağın neden olmadığı, düşebilen bir şey olarak yazıldı.

### v0.7.14 - koleksiyoncunun ikinci ve son satışı

P-23, sahibinin isteğinden: koleksiyoncu çok özel bir kitap satabilir ve düşme oranlarını
arttırabilir. Tasarım iki kez ölçümle karara bağlandı ve sezgisel cevap iki kez de
yanlıştı.

**Düşme oranı zaten nerede yaşıyor.** `enemies.js` içindeki
`droprate_modifier_skills_for_tags`, bir düşman etiketini o etiketin düşüşlerini seviyesiyle
çarpan yeteneğe eşliyor ve tek bir kaydı vardı: `beast: "Butchering"`.
`Enemy.get_droprate_modifier`, düşmanın etiketlerini yürüyüp bulduğu her biri için yetenek
katsayısıyla çarpıyor. Yani genişletilecek şekil tek satır veriydi, yeni bir mekanizma
değil — P-23'ün istediği de buydu.

**İlk yanlış cevap: genel bir güçlendirme.** P-23 sabit bir "+%X düşüş"ü zaten
dışlamıştı; ölçüm nedenini sayıyla söylüyor: `beast`, oyunun 32 düşmanından 23'ünü ve
**2,94 toplam düşme ağırlığının 2,93'ünü** taşıyor. Hayvanlara ya da bütün oyuna
yöneltilen her şey, aynı güçlendirmenin ikinci kez yapılması.

**İkinci yanlış cevap: `insect`.** Bariz dar etiket buydu — arc'ın kendi düşmanları
karıncalar ve yusufçuklar — ve ölçüm onu tümden öldürdü. Dört düşmanından üçünün loot
listesi **boş**, dördüncüsü de binde beşle ot düşürüyor. Toplam düşme ağırlığı **0,02**.
Bunu çarpmak için bir hayli paraya satılan bir kitap kusursuz çalışır ve hiçbir şey
yapmazdı.

**`aquatic`, bütün alternatiflere karşı ölçüldü.** 6 düşman, 5'i ganimetli, 7 farklı eşya,
1,14 düşme ağırlığı — çarpmanın öteki tarafında gerçek bir şey olan, oyundaki en dar
etiket. %2 yengeç eti, %1 yengeç kıskacı, binde beş dev yengeç kıskacı ve kaplumbağa
kabuğu, %1 timsah derisi: bataklık üretim zinciri ve hepsi oyuncunun şu an uzun süre
beklediği düşüşler.

Her `aquatic` düşman aynı zamanda `beast`, yani yeni yetenek **o altısında Kasaplıkla
birlikte, başka hiçbir yerde değil** çalışıyor. Bu bir gözden kaçma değil tasarım —
kasaplığı zaten biliyorsun, monografi ise sana kabuğun ne yaptığını öğretiyor — ve
Kasaplığın üç sayısının onun için düşürülmesinin sebebi de bu: azami seviye 60 değil 40,
katsayı 2 değil 1,5, temel tecrübe maliyeti 40 değil 60. Yayınlanan
`get_droprate_modifier` üzerinden ölçüldü: 40. seviyede Kasaplık tek başına bir yengeçte
1,587 veriyor, ikisi birlikte 2,381, kurt sıçanı ise iki hâlde de 1,587'de kalıyor.

**Kabuk işi, önemli olan her bakımdan Kasaplığın kardeşi**: bir kitap öğretene kadar
kilitli, `Crafting mastery`'ye bağlı, aynı tablodan okunuyor. `Butchering and you`'nun
`Butchering`'i açması emsal ve birebir; kayıtlar açısından önemli olan kısım dahil —
bitmiş bir kitap yüklemede ödüllerini `only_unlocks: true` ile yeniden uyguluyor ve
`rewards.skills`, o bayrağın atladığı türlerden değil. Varsayılmadı, doğrulandı.

**Kitap.** *Suyun Geri Verdikleri*, 600 dakika — oyundaki en uzun okuma — okuryazarlık
tecrübe oranı 3 ve bütün ödülü o yetenek. Tecrübe çarpanı yok: P-15'in kuralı, yalnızca
çarpan veren bir kitabın `BookData`'nın yapabileceği en zayıf şey olduğu.

**40.000, türetildi.** Oyundaki 17 para ödülü toplamda **84.740** ve iki kuyu var: bu
adamın plaka için istediği 30.000 ve kayıkçının sefer başına 6.000'i. v0.7.10 kayıkçıyı
yeniden fiyatlandırdı çünkü *tekrarlanan* bir fiyat bir geçiş ücretidir ve sefer başına
25.000, 500 birim devriye demekti; bu ise bir kez alınıyor ve hiçbir şeyi kapatmıyor,
dolayısıyla bir hedef olmasına izin var. 40.000'de iki tek seferlik kuyu 84.740'ın
70.000'ini alıyor ve oyuncunun sattığı her şey bunun üstüne geliyor. Teklif onun `other`
repliğinden geliyor — bütün alışverişin ardından, ki ikinci bir istisnanın inandırıcı
olacağı tek nokta da orası.

**Muhafızlar, üç negatif test ve düşemeyen bir kontrol.**

- `check_droprate_tags_are_worth_scaling`: tablodaki her etiket gerçek bir düşman
  tarafından taşınıyor, gerçek bir yeteneği gösteriyor ve çarpmaya değer ganimeti var.
  **İlk hâli düşemiyordu.** Taban 0,01'di ve `insect` 0,02 — yani kontrol, yakalamak için
  yazıldığı hatanın tam kendisini onaylardı; tuzağı geri koyup inanmadan önce test ederek
  bulundu. Artık iki koşul: etiketli düşmanların çoğunun bir şey düşürmesi ve 0,1 tabanı;
  `insect` ile `aquatic` arasında iki büyüklük mertebesi olduğu için taban hassas değil.
- `check_locked_skills_can_be_unlocked`: `is_unlocked: false` olan her yetenek bir yerde
  bir `skills: [...]` ödülünde adlandırılıyor. Üçü öyle ve üçü de öğretiliyor. Atlanmış bir
  ödül; hiç görünmeyen, hiç tecrübe almayan ve soran her şeye — düşme oranı tablosu dahil —
  0. seviye diye okunan bir yetenek bırakır.
- Yeteneği `insect`'e yönelterek, yetenek kimliğini yanlış yazarak ve ödülü kitaptan
  alarak negatif test edildi. Her biri hedeflenen kontrolü hedeflenen mesajla düşürüyor.

**Yardım artık düşme oranlarını anlatıyor**, ki hiç anlatmıyordu: eşya başına şanslar, bir
yaratık türünün tamamını çarpan iki yetenek, bestiary'nin düşüşleri yetenekleriniz
uygulanmış hâlde gösterdiği ve hiçbir yerin oyuncuya söylemediği şey — bir grupla dövüşmek
içindeki her düşmanın düşürdüğünü azaltıyor.

### v0.7.13 - v0.7.12'nin ihtiyacı olan düzeltme ve sözünü tutan bir ipucu

Bu döngünün bir iterasyon önce yayınladığı bir regresyon; bildirimle değil ölçümle
bulundu — hem de bu işin değil, sıradaki işin ölçümüyle.

**Ne kırıldı.** v0.7.12, `Fish fillet`'e bir kalite verdi; çünkü iyi bir yayından kesilmiş
fileto iyi bir fileto olmalı. `find_recipe_material`'ın iki dalı vardı ve **id** ile
adlandırılmış bir malzeme için olanı tek bir aramaydı:

```js
const key = item_templates[material_id].getInventoryKey();
if (character.inventory[key]) { ... }
```

Bu, **şablonun** anahtarı ve kalite taşımıyor. Bir tarifin id ile istediği hiçbir şeyin
kalitesi olamadığı sürece doğruydu; `Fish fillet`'in olabildiği an yanlış oldu. %68 bir
fileto `{"id":"Fish fillet","quality":68}` altında saklanıyor, `Fish steak` tarifi filetoyu
id ile istiyor ve arama onu hiç görmüyordu. Ölçüldü: çantada on fileto,
`get_availability()` 0 döndürüyor. Malzeme elde dururken tarif "yapılamaz" diyordu.

Öteki dal — **tür** ile adlandırılmış malzeme, ki balığın tavaya ulaşma yolu o —
`Object.values(character.inventory)` üzerinde yürüyüp filtreliyor, yani bu sorunu hiç
yaşamamıştı. Balığı pişirmek çalışıyordu; balıktan kestiğiniz şeyi pişirmek çalışmıyordu.

**Düzeltme, artık tek dal olması.** İkisi arasındaki tek gerçek fark yüklemdi, dolayısıyla
kalan tek fark da o: `entry.item.id === material_id` ya da
`entry.item.material_type === material_type`; sonra tek yürüyüş, tek sıralama, tek durma
kuralı. En ucuz önce; ki kalite taşıyan bir şey için bu, en kötüsünün ilk harcanıp
iyilerin elde kalması demek — tür yürüyüşünün zaten sahip olduğu kural, artık ikisinde de.

**Ve tahmin hâlâ gizliydi.** Tarif ipucu sonucunu `{skip_quality: true}` ile kuruyordu;
eşya tarifleri kaliteli hiçbir şey üretmezken bu doğruydu. Yani kızarmış balık tarifine
bakan bir oyuncu, iyi balığın iyi yemek yapacağını anlayamıyordu — özellik oyunda vardı ve
okunacağı tek yerde görünmezdi.

Önünde iki şey duruyordu, ikisi de kalktı:

- **Ağırlıklandırmanın tek sahibi vardı, iki tanesi gerekiyordu.** `use_recipe` onu
  gövdesinin içinde hesaplıyordu. `get_consumed_quality` olarak ayrıldı; hem atış hem ipucu
  ona soruyor, çünkü sonuçla çelişebilen bir tahmin, hiç tahmin olmamasından kötüdür. Bu
  dosyanın bütün tarihi tek cümlede bu.
- **`show_quality`, eşyanın kalitesinin zaten olmasını istiyordu.** Tarif ipucuna paylaşılan
  *şablon* veriliyor ve bir şablonun kalitesi, teçhizat olmayan her şey için `null` —
  kuşanılabilirlerin 100 varsayması ise parça tarifi ipucunun bugüne kadar bir aralık
  çizebilmesinin tek sebebi. Artık `options.quality` geçen bir çağıranın söylemesi yeterli;
  `use_quality` de onaylamak zorunda, yani kimsenin istemediği yerde bir sayı açamıyor. Dört
  durumda da ölçüldü: tahmin edilen aralık çiziliyor, `skip_quality` hâlâ gizliyor, seçenek
  yokken hâlâ gizliyor ve `use_quality: false` olan bir eşya tahmini yok sayıyor.

**Muhafızlar, ikisi de negatif test edildi.**

- Bir eşya tarifinin id ile adlandırdığı her malzeme envantere iki kez konuyor — düz ve %68
  — ve iki seferinde de bulunmak zorunda. 82 adlandırılmış malzeme üzerinde 164 arama.
  Şablon-anahtarı karşılaştırmasını geri koymak, Silver ingot, Wool, Flax ve diğerlerinde
  düşüyor; ki mesele bu: sınıf "bir tarif istediğini bulabilir", "fileto artık çalışıyor"
  değil.
- `get_consumed_quality`'nin tam olarak tek bir tanımı var ve hem `crafting.js` hem
  `item_tooltips.js` onu çağırmak zorunda. Kopyalardan birini geri gövdeye almak düşüyor.

**Akılda tutulacak ders.** `check_inherited_quality_is_shown`, tarif çizgesini yürüyüp
kalitenin ulaşabildiği her sonucun onu *gösterip* göstermediğini soruyordu. Kalitenin
ulaşabildiği her malzemenin hâlâ *bulunabildiğini* sormuyordu. Bir şeye kalite vermek onun
envanter anahtarını değiştiriyor ve envanter anahtarı bir aramadır — yani her yeni kaliteye
sorulacak soru, yalnızca onu kimin gösterdiği değil, kimin aradığıdır.

### v0.7.12 - balık, pişirdiğinizde kalitesini koruyor

Oyun içinde bildirildi: balığın kalitesi pişirdikten sonra kayboluyor.

**Bunun teklifinin, tek satır kod değişmeden önce iki kez yanlış bildiği şey.** Eşya
yolunun
`roll_quality(station_tier - result_tier)` çağırdığını, bileşenlerle ekipmanın ise
ikisinin de ağırlıklı bir girdi kalitesi geçirdiğini yazıyordu. İkisi de doğru değil.
Ölçüldüğünde dört yol şöyleydi:

| yol | kalite atıyor mu | girdisine bakıyor mu |
| --- | --- | --- |
| eşyalar — yemek, eritme, simya, kasaplık, cam, kömür | **hayır** | atış diye bir şey yoktu: sonuç `item_templates[result_id].getInventoryKey()` ile ekleniyordu, yani kalitesi `null` çıkıyordu |
| bileşenler — külçeden namluya, kumaştan giysiye | evet | **hayır** — `roll_quality(tier)`'ın bunun için parametresi yoktu |
| pelerinler | evet | **hayır** — aynısı |
| ekipman montajı | evet | evet — `roll_quality(component_stats.weighted_quality, tier)` |

Yani mesele, eşya atışının malzemeleri görmezden gelmesi değildi. Eşya atışı diye bir şey
yoktu ve kaliteyi çöpe atan satır kusursuz masum görünüyordu. Dört yoldan yalnızca biri
girdisine bakmıştı.

**Ayrışma neden mümkün oldu ve düzeltme ne.** Dört sınıftan üçü kendi `roll_quality`
kopyasını taşıyordu; her biri yalnızca bir kademe alıyordu. Daha iyisini yapacak
mekanizma — `get_quality_range`'in iki dalı — ise bunca zaman temel sınıfta kullanılmadan
duruyordu. Artık `ItemRecipe` üzerinde tek bir gövde var, `(input_quality, tier)`, ve
kaliteli bir şey üreten her alt sınıf onu miras alıyor; `EquipmentRecipe` bu şekli zaten
taşıyordu. İki mükerrer gövde silindi.

`use_recipe`'in eşya dalı, gerçekten tükettiği şeyin kalitesini, ne kadarını tükettiğine
göre ağırlıklandırarak topluyor; hem de tam o yığınları zaten yürüyen döngünün içinde.
Parti başına tek atış, çünkü o dal bir parti: tek bir çağrıda tek bir şeyin `final_count`
tanesini üretiyor ve hiç eşya başına dönmüyor — yani karışık bir balık kovası, yığını on
parçaya bölmek yerine tek bir kaliteye pişiyor.

**Bunun neden sınırlı kaldığı.** Kalitesi olmayan bir malzeme toplamı sıfırda bırakıyor ve
sonuç eskisi gibi şablondan üretiliyor; çünkü `get_quality_range`, yanlış-değerli bir
girdi kalitesine kendi girdisiz dalıyla cevap veriyor. Üretim dışında kalite yaratan tek
şey balıkçılık — oyundaki üç `roll_quality: true` etkinliğinin üçü de balık tutma — yani
bugün mesele balıklar ve başka hiçbir şey. Kural balıklarla değil malzemelerle ilgili
olduğu için, sonradan kalite verilen her şey kendiliğinden devreye giriyor.

**Bunu baştan güvenli kılan sayı.** `get_quality_range`'in iki dalı, 80 girdi
kalitesinde buluşuyor: 50 + 80, girdisiz dalın eklediği 130 ediyor. Dolayısıyla eşya
tariflerinin hiç kullanmadığı dal, harfiyen *malzemeleri 80 varsay* demek; bu da gerçek
kaliteyi geçirmeyi bir güçlendirme değil, simetrik bir şey yapıyor. Balığı, balıkçılığın
kendi formülüyle atarak beceri seviyeleri boyunca ölçüldü:

| Balıkçılık / Yemek | balık atışı | yemek, eskiden fiyatlandığı sabit %100'ün oranı olarak |
| --- | --- | --- |
| 0 | 55-80 | %58 |
| 10 | 85-110 | %112 |
| 20 | 115-140 | %140 |
| 30 | 145-160 | %160 |
| 50+ | 200 | %200 |

Eğim, nerf değil: acemi biri kötü bir balıktan kötü bir yemek yapıyor ve bir süre balık
tutmuş biri için yaklaşık iki katına çıkıyor. Oyunun başındaki kayıp, 40 değerli bir
eşyada birkaç sikke.

**Ölçümün bulup planın bulamadığı iki şey.** İkisi de oyuncunun birinde göremeyeceği,
diğerinde atlatamayacağı bir kaliteyi yayınlayacaktı:

- **`use_quality`.** Kaliteyi çizen iki yer de — tooltip ve envanter satırı — önce eşyaya
  `use_quality` diye soruyor ve 39 tüketilebilirin hepsi "hayır" diyordu; çünkü bugüne
  kadar pişmiş hiçbir şeyin kalitesi yoktu. Bunu ayarlamasak yemek, üstünde hiçbir yerde
  görünmeyen bir sayıyla kaydedilecek, fiyatlanacak ve alınıp satılacaktı: aynı anda
  görünmez ve sonuçlu, yani bu projenin sürekli peşine düştüğü tam o eşleşme. Tarif
  yürüyüşünün adlandırdığı, kalitenin ulaşabildiği dört yemekte ayarlandı: şiş, kızarmış
  balık, fileto ve biftek — biftek geçişli olarak, fileto üzerinden.
- **`getRarity`.** Çizen iki yer de sayıyı `item.getRarity()` ile renklendiriyor ve bu,
  `Item` üzerinde değil üç alt sınıfta üç birebir kopya hâlinde yaşıyordu. `UsableItem` ve
  `OtherItem` — yemeklerin ait olduğu iki sınıf — bundan yoksundu, yani kaliteli ilk yemek
  bir TypeError atıp envanter ekranını da beraberinde götürecekti. `Item`'a taşındı, üç
  kopya silindi.

**Dört muhafız; her biri hatayı geri koyarak negatif test edildi.**

- Her `roll_quality` bildirimi ilk sırada bir kademe değil bir girdi kalitesi alıyor.
  `ItemRecipe`'in imzasını geri almak hem bunu hem davranış kontrolünü düşürüyor.
- Her çağrı yeri iki argüman geçiyor ve ilkinde bir kaliteyi adlandırıyor; ayrıca üretilen
  hiçbir eşya kendi şablonunun envanter anahtarıyla eklenemiyor — bu ikinci kural,
  balığın kalitesinin öldüğü satırın tam şekli; çünkü çağrı yerlerini saymak, atış
  korunurken sonucun şablona dönmesini yakalamazdı.
- Arkasındaki aralık değil, yayınlanan `roll_quality` üzerinden: %130 girdiden alınan 40
  örneğin hepsi %40 girdiden alınan 40 örneği geçiyor, yanlış-değerli bir girdi girdisiz
  aralığın içinde kalıyor ve iki dal hâlâ 80'de buluşuyor. Aralığı okumak yerine atışı
  örneklemek bilinçli — bu kontrolün ilk hâli doğrudan `get_quality_range`'i soruyordu ve
  parametre bağlanmamışken **geçiyordu**.
- Tarif yürüyüşü: bugün kalite gösteren her şeyden başlayarak, kalitenin ulaşabildiği her
  sonuç da bir kalite göstermek zorunda ve her eşya şablonu `getRarity`'ye cevap vermek
  zorunda. Listelenmek yerine türetildi, böylece başka bir malzemeye kalite vermek, onu
  yutacak olanı adlandırıyor.

**Bilerek bırakılanlar ve nedenleri.**

- **Bileşen yarısı bağlı ama erişilemez.** Bir bileşen tarifinin aldığı hiçbir malzemenin
  henüz kalitesi yok ve `update_displayed_material_choice` satırlarını yığınlardan değil
  şablondan anahtarlıyor — üstünde duran upstream notu tam bunu söylüyor:
  `//TODO currently doesn't support items with quality`. Yani oyuncu kaliteli bir külçeyi
  baştan seçemiyor. Yine de bağlamak esas nokta: parametreyi dışarıda bırakmak, yolların
  ayrışma biçiminin kendisiydi; seçici de ona sunacak kaliteli bir külçe olduğunda gelir.
- **Yemek etkileri ölçeklenmiyor.** Bir yemeğin etkisi, sabit süreli adlandırılmış bir
  öğün; yani %140 kızarmış balık daha değerli ama daha iyi doyurmuyor. Süre bariz eksen ve
  bu bir tasarım kararı, düzeltme değil.
- **Hiçbir kütük satırı kaliteyi söylemiyor.** Eşya dalı "N tanesinden M yaptı" diye
  yazıyor, bileşen dalının ise içinde kalite olan kendi ifadesi var. Onu yeniden kullanmak
  iki dilde dört yeni yerel satır gerektirirdi; sayı her hâlükârda eşyanın üstünde.
- **`item_mapping` kaliteli bir eşyaya ulaşmıyor.** Kayıt yükleyici, yeniden adlandırma
  haritasını kalitesi olmayan eşyaların dalında uyguluyor; pişmiş balığın geldiği dalda
  değil. Haritadaki üç kayıt, asla kalite taşıyamayacak odun malzemeleri; bu yüzden bugüne
  kadar önemi olmadı — o haritaya bir şey ekleyecek sonraki kişinin görmesi için dalın
  yanına not düşüldü.

### v0.7.11 - bir yerin fikri olması ve itibarın altına bir taban

P-14 Faz 6'nın son parçası ve fazı tamamlıyor. Brief, ceza değil dünya durumu gibi okunan
itibar sonuçları istiyordu; bu da koddan önce bir tasarım problemi: bir sayının düşmesi,
dünyada biri bu konuda bir şey söylemedikçe cezadır.

**İçerik seçimi zaten çerçevelemişti.** Saymanın kapanış repliği şöyle diyor: *"Yazdığım
gün bu bir lonca meselesi olur, lonca meselesinin bir usulü vardır ve usul de birinin
hesap sütununa kime fatura keseceğini sormasıdır."* Uzun uzun reddediyor ve reddederken
oyuncuya, bunu kendisinin yapabileceğini söylüyor. Yani uydurulacak bir şey yoktu —
yalnızca kanonun çoktan kurduğu bir kararın öteki tarafı.

Lonca kâtibi yapıyor. Bir dosya açıyor, teknenin adını ve iki ilkbaharı yazıyor, dördüncü
sütunda tam onun gibi duruyor ve kartı dosyalıyor: *"Bunun rıhtımdan geldiği bilinecek.
Ben aksini varmış gibi yapmayacağım, siz de yapmayın."* Guild +60, Town +20, **Slums −40**
— oyunun bir şeyi eksilten ilk ödülü.

**Kimse zorlamıyor.** Arc her iki hâlde de bitiyor ve replik kâtibin yanında öylece
duruyor. Sonuçla ceza arasındaki fark da bu: ceza oynadığınızda olan şeydir, sonuç ise
seçtiğinizde.

Ve sokak cevap veriyor. Kenar mahallenin yaşlı kadınının, bayrağa bağlı bir repliği var ve
sinirli değil — düzeltilecek bir şey yok, kimsenin başı dertte değil. Söylediği şu: bir
süre boyunca, buradan biri yazıya geçmesini istemediği bir şeye sahip olduğunda onu kimin
yanında söyleyeceğini düşünecek ve oyuncu, düşündüğü insanların listesinde olacak.
*"Geçer. Burada çoğu şey geçer. Ama daha geçmedi ve siz sordunuz."* Dünya durumu yarısı
bu; o olmasa −40 bir para cezası olurdu.

350 kazanılabilir değere ve arc'ın Slums 200 ile 250'deki kendi kapılarına karşı −40.
Sağlam hattı bir süre menzil dışına çıkarabiliyor; düzlükleri yürümek bedava ve kayıkçı
geçen sürümden beri 6.000, yani hiçbir şey kapanmıyor.

**İtibarın artık bir tabanı var ve bu, herhangi bir şeyin eksiltmesine izin verilmeden
önce girmek zorundaydı.** `add_reputation` sınırsız bir `+=` kullanıyordu.
`update_displayed_reputation` yalnızca 0'ın üstündeki bölgeleri çiziyor. Yani kenar
mahallede −20'de olan bir oyuncu **hiçbir satır görmezdi** — ne sayı, ne çukurda olduğuna
dair bir işaret, ne de ne kadar derinde olduğunu anlamanın bir yolu — bütün kapılar da
kapalı okunurdu. Aynı anda görünmez ve sonuçlu; bu proje her sürümünü bu biçimdeki
hataların peşinde geçirdi ve bu, tam da bu özellikle birlikte gelecekti.

0'da tabanlandı; çünkü sıfır "sizi tanımıyorlar" demek ve herkes oradan başlıyor. Altı
test; aralarında tam olarak hepsini almanın kıl payı değil sıfır bıraktığı ve tam sayı
olmayan bir değerin hâlâ sessizce tabanlanmak yerine doğrudan reddedildiği de var —
muhafız bir reddi 0'a çevirmiş olmamalı. Tabanı yeniden kaldırarak negatif test edildi:
bir kontrol düşüyor ve −20 bildiriyor.

Bu, Faz 6'yı kapatıyor. P-14'ten kalan, v0.8 hazırlığı olan Faz 7.

### v0.7.10 - kayıkçı bir kilometre taşı gibi fiyatlanmış, bir hizmet gibi satılıyordu

P-14 Faz 6'nın dört parçasından üçüncüsü: arc'ın para kuyusunun tahmine değil mevcut
ekonomiye göre fiyatlanması. Tahmindi — 25.000; o an önümde duran quest ödüllerinin yanına
konmuştu.

**Ekonominin gerçekte ne tuttuğu**, hatırlanarak değil ölçülerek:

- Beş queste yayılmış 43.500 tek seferlik quest parası.
- Lonca faktörünün üç teslimatından 27.000 daha; hepsi `repeatable: false`.
- Tek bir 30.000'lik kuyu, koleksiyoncunun; bu arc'tan önceki tek gerçek kuyu da o.
- **Hiçbir yerde tekrarlanabilir para ödeyen aksiyon yok.** Üç yerleşim aksiyonu — 400
  ödeyen terazi nöbeti, 260 ödeyen tellallık, 90 ödeyen güvercin kovalama — hepsi
  `repeatable: false`. Birer kez ödüyorlar.

Yani oyuncunun tekrarlayabildiği tek gelir ücretli bir iş ve onların en iyisi birim başına
50 ödeyen devriye.

Buna karşı *sefer başına* 25.000, 500 birim devriye ve bütün oyunda aşağı yukarı bir
karşılanabilir yolculuk demek. Bu, pahalı yolu pahalı yapmıyor; onu "bir kez kullanıp bir
daha dönmediğiniz" bir yola çeviriyor ve Faz 4'ün etrafına kurulduğu üç geçiş yolundan
birini sessizce kaldırıyor. Artık 6.000: faktörün en küçük teslimatı, bir günlük iş
parasına bir kayık yolculuğu, 120 birim devriye.

**Bir muhafız yazıldı, sonra kaldırıldı; bunun daha faydalı yarısı da bu.**

Kural şuydu: "tekrarlanabilir bir fiyat, en pahalı tek seferlik fiyatı aşmamalı." Kulağa
iyi geliyor. 25.000'de geçiyor — çünkü 25.000, koleksiyoncunun 30.000'inden küçük. Yani
kontrol, yakalamak için yazıldığı hatanın tam üzerinden yeşil geçerdi; hem de sonsuza
kadar, kapsama gibi görünerek.

Bunu yakalayan her versiyonu, birinin uydurduğu bir sabit istiyor: tekrarlanabilir fiyat,
bir gelirin N katının altında olmalı ve N bir yargı. Asıl soru, bir fiyatın *oyunun o
noktasındaki* mevcut paraya göre durumu; bu da ilerleyişin modellenmesini gerektiriyor ve
bir değişmez değil, bir tasarım kararı.

Bu yüzden kontrol yok; onun yerine sayılar yazıldı — öneriye ve kaynakta fiyatın yanına —
böylece sonraki fiyat seçilmek yerine türetiliyor. Bu oturum artık iki kez düşemeyen bir
kontrol yayınlamaya yaklaştı (yardım sayfasının itibar kontrolü, iki kez) ve ikisini de
inanmadan önce negatif test ederek yakaladı. Hatayı onaylayan bir kontrol, hiç kontrol
olmamasından kötü; üçüncüsünde fark etmek düzeltmekten ucuza geldi.

### v0.7.9 - satacak hiçbir şeyi olmayan iki kafe

P-19, kasaba meydanında ya da ona bağlı yerlerden birinde bir tüccar istiyordu. Bir tane
yapmadan önce ölçüldü ve cevap şu çıktı: iki tanesi zaten vardı.

`cat cafe trader` ile `nekomimi trader`, bu fork'tan da önce `traders.js` içinde
bildirilmiş ve ikisinin arasında gerçek, on satırlık bir stok listesi var — taze ekmek,
ekmek kvası, pişmiş istiridye, yengeç çorbası, kral boy kurbağa bacağı, balık bifteği.
**Hiçbir yer ikisini de listelemiyordu.** Yani hiçbiriyle karşılaşılamıyordu, iki kafenin
de satın alınacak bir şeyi yoktu ve hiçbir şey düşmüyordu: `check_trader_stock_lists`
gayet memnundu, çünkü listeleri gerçekti. Kedi kafesi, dokuz fon sesi olan ve içinde
hiçbir şey bulunmayan bir odaydı — NPC'si de yoktu.

Ve nekomimi işletmecisinin `offer` repliği, kaynağın içinde **`//todo: unlock trade`**
yorumunu taşıyordu. Bağlantı tarif edilmiş ve hiç yapılmamış; bulunabilecek en işe yarar
şey de bu: tüccarın nereye ait olduğunu ve onu kimin açtığını tam olarak söylüyor.

Yani bu icat değil geri kazanım; P-19'un kural olarak kaydettiği de bu. İşletmeci
kendisininkini açıyor, çünkü öneren o. Kedi kafesinin tezgâhı içeri girildiğinde açılıyor,
çünkü orada soracak kimse yok.

**Kasabanın artık bir market bölgesi var** ve olması zorunluydu. `src/verifier.js`,
`market_region`'ı olmayan bir yerdeki tüccarı reddediyor ve bütün kasabanın hiç bölgesi
yoktu — meydan, iki kafe ve antika dükkânı hepsi `market_region: null`'dı; ki hiçbirinin
satın alınacak bir şeyi olmamasıyla da tutarlı. `Town` yalnızca `Slums`'a sızıyor, başka
hiçbir yere değil; çünkü ikisi aynı şehir: meydanın yanındaki bir kafeye boşalttığınız şey
sokakta bir fiyatı oynatıyor, ikisi de bir günlük yürüyüş uzaktaki bir köyde hiçbir şeyi
oynatmıyor.

**`check_trader_market_regions`, bunu yakalayacak muhafızı kazandı.** `traders.js` içinde
bildirilen her tüccarın bir yer tarafından listelenmesi ve bir yerin listelediği her
tüccarın bildirilmiş olması şart — bileşen ve kitap kontrollerindeki aynı iki yönlü şekil.
Kimsenin ulaşamadığı bir tüccar, hiçbir şeyin yapamadığı bir bileşenle aynı türden ölü
içerik; bu ise orada çok daha uzun süre durmuş.

Çalışma anındaki registry yerine yer bloklarını okuyor, bilerek: bir tüccar bir ödülle
açılabilir ve yine de içinde durduğu oda tarafından listelenmiş olabilir. Listelenmek
yerleştirmedir; açılmak yalnızca izindir. İki yönden de negatif test edildi — kedi
kafesinin listesi kaldırıldı ve bir odaya var olmayan bir tüccar yazıldı. 5 bölgede 6
dükkân, 8 tüccarın hepsi yerleştirilmiş.

Olduğu yerde bırakılan bir şey var: işletmecinin `special` repliği hâlâ
`//todo: unlock paid action` taşıyor. O bir tüccar değil bir aksiyon, yani bu önerinin işi
değil; ve bir yorumu ortadan kaldırmak için aksiyon uydurmak, içeriğin yanlış sebeple
eklenme biçimidir.

### Dev konsolu yenilemeden sağ çıkıyor, yeniden açılıştan çıkmıyor

P-20, sahibinin isteği ve bir özellikten çok tek bir depolama kararı: konsolun ömrü
sekmenin ömrü olmalı. `sessionStorage` tam olarak bu — yenilemeden sağ çıkıyor, sekme
kapandığında ölüyor — yani temizlenecek bir bayrak, bir zamanlayıcı ve başka bir şeyle
uyumsuz düşebilecek hiçbir şey yok.

`enable_dev_console()` çıkarken anahtarı yazıyor, boot dizisi de girerken okuyor; en
sonda, çünkü açtığı panel DOM ve dağıttığı yardımcılar, yüklemenin önce doldurduğu
registry'lerin üzerine kapanıyor. Her erişim try/catch içinde: `sessionStorage` bazı
gizlilik modlarında null döndürmek yerine doğrudan hata fırlatıyor ve bir geliştirici
kolaylığı, oyunun açılmama sebebi olamaz. Depolama engelliyse konsol, açıldığı sayfa için
çalışmaya devam ediyor; sadece geri gelmiyor.

Yazdığı satır da değişti, çünkü eski davranışı belgeliyordu: *"Kaydedilmiyor — yenileme
onu kapatır"* diyordu. Artık yenilemeden sağ çıktığını, sekmeyi kapatınca gittiğini ve
hâlâ kaydedilmediğini söylüyor.

**`check_dev_console_is_not_saved`**, bunun bozulduğu iki yolu koruyor; ikisi de sessiz:

- **`sessionStorage` yerine `localStorage`.** Tek kelime fark ve konsol o makinede
  temelli açık kalıyor — tarayıcı sonra kimin olursa onun için de.
- **Kayıt.** Export, oyuncuların birbirine verdiği ve içe aktarma kutusuna yapıştırdığı bir
  dosya. "Dev modu açıktı" bilgisini taşıyan bir kayıt, konsolu hiç açmamış birinde, hiç
  etkinleştirilmemiş bir makinede onu açardı. Bunu bizden önce bir oyuncu bulurdu.

Bu yüzden anahtarın yalnızca `sessionStorage` da geçen satırlarda görünmesi ve
`save_load.js` ile `game_state.js` içinde hiç geçmemesi şart. Kontrol, anahtarı kendi
kopyasında tutmak yerine sabitin bildiriminden okuyor.

Üç yönden negatif test edildi: `localStorage` yerine kondu ve anahtar `save_load.js` içine
yerleştirildi — ilk olarak yorum olarak, ki bu haklı olarak *tetiklenmedi*, çünkü
`strip_comments` yorumları kontrol okumadan önce temizliyor ve bir anahtarı anan yorum
hiçbir şey taşımıyor. Gerçek kod olarak iki kez tetikledi, kural başına bir kez; iki kuralı
birden bozan tek bir satır için doğru cevap da bu.

Bakım işi: dev konsolu oyuncuya dönük değil, dolayısıyla sürüm artmadı.

### Yardım sayfası oyunu yakalıyor ve bir kontrol artık yakalamadığını söylüyor

P-21 ve sahibi listeleri değil akışı istedi. Ölçüldü: harita güncelmiş, çünkü
`check_help_map_covers_the_world` her yer yayınlandığında bunu zorunlu kılıyor. Haritanın
kapsamadığı her şey ise v0.7.0'dan beri kaymış.

**Yanlış olanlar, ne kadar yanıltıcı olduklarına göre sıralı:**

- *"Mevcut oyun içeriği nerede bitiyor?"* hâlâ **"Kasabaya girmek ve ikinci kapıyı açmak
  henüz mümkün değil"** diyordu. Kasaba tüccar loncası üzerinden uzun süredir açık. Ayrıca
  bataklıkta duruyor ve sahil yolunu, körfezi, tuz evini ya da onların ötesindeki hiçbir
  şeyi anmıyordu — son dört sürümün içeriğini.
- *"Büyü eklendi mi?"* "kasaba erişilebilir olduktan sonra gelecek" diyordu; o çoktan
  oldu. Artık gerçekten doğru ve işe yarar olanı söylüyor: sözcük dağarcığı oyunda ve
  görünür — Wands, Staffs, bir mana havuzu, sezgi — hiçbiri bir şeye bağlı değil, elde
  edilecek bir asa ya da değnek yok ve dolayısıyla o iki yetenek hiç yükseltilemiyor. Ve
  planın ne olduğunu söylüyor, Q-11 uyarınca: mevcut hikâyeden sonra kendi arc'ı, bir
  şeyin içine sıkıştırılmış bir özellik değil.
- **Dövüş duruşları**, dayanıklılık karşılığında buff ve ceza olarak anlatılıyordu.
  v0.7.6'dan beri bazı yaratıklar duruşun kendisine tepki veriyor; birini seçmenin
  sebebinin yarısı bu.
- **Mevsimler**, "bazı etkinlikleri" sınırlıyor diye anlatılıyordu. Artık yerleri ve
  insanları da kapatıyor: bir bölge yılda iki kez kendi kendine değişiyor ve hiçbir şey
  duyurmuyor.
- **İtibar** için fiyatlarla ilgili tek bir cümle vardı ve hiçbir bölge adı geçmiyordu —
  yani `Guild` dördüncü bir bölge ve karakter sayfasında bir satır olarak geldi, sayfada
  onu açıklayan hiçbir şey yokken.
- Körfezin kendi açıklaması sattığı cevherde duruyordu.

**Muhafız ve düşebilir hâle gelmesi üç denemeyi aldı.**
`check_help_explains_standing`, `character.reputation`'ın her anahtarının, iki sayfada da,
sayfanın itibar anlatımı içinde adlandırılmasını iki yönlü şart koşuyor.

İlk hâli, bölgenin görünen adını sayfanın tamamında arıyordu. Ad silinmişken de geçti;
çünkü "guild" kasabanın açıklamasında ve içeriğin nerede bittiği cevabında da geçiyor.
İkincisi aramayı itibar paragrafına daralttı ve yine geçti; çünkü paragrafın kendi
açıklama cümlesi "loncanın işini" diyor — Türkçede daha da kötü, çünkü dil ekleme yapıyor
ve "loncanın" içinde "lonca" var.

İkisi de düşemeyen kontrollerdi; bu, hiç kontrol olmamasından kötü: hiçbirini açıklamadığı
hâlde dört bölgenin açıklandığını bildirirlerdi. Üçüncü hâli her bölgeyi işaretlemede
`data-region="Village"` gibi işaretliyor — haritanın `data-location` ile zaten yaptığının
aynısı — ve o kümeyi bildirilenle karşılaştırıyor. Böylece metin, her dilde nasıl okunuyorsa
öyle okunmakta serbest; D-7'nin istediği de bu. Üç yönden negatif test edildi: Türkçe
sayfadan bir işaret kaldırıldı, İngilizceden bir işaret kaldırıldı ve var olmayan bir
bölgeyi adlandıran bir işaret kondu.

Sürüm kuralı açısından bakım işi: yardım sayfası oyun içi changelog değil ve oyuncu yeni
bir içerik görmüyor, dolayısıyla sürüm artmadı.

### v0.7.8 - körfez bir kitap kazanıyor, Keşifler cevabını geri alıyor

İki şey ve ikincisi, ilkini ölçerken bulundu.

**P-15'in ilk kitabı.** Yazmadan önce ölçüldü: on kitap var ve Basic, Basic plus,
Intermediate ile Swamp plus listelerinin hepsi kitap taşıyor, iki Bay listesi ise hiç
taşımıyordu — hem de bütün ticareti, oyuncunun gidebileceğinden daha uzaktan gelen şeyler
olan tek bölgede. `BookData` yeni bir kitabın isteyebileceği her şeyi zaten destekliyor,
yani motor işi gerekmedi.

*Burada Balık Vurmaz*, bu kıyıda bir ömür çalışmış birinin yazdığı kitap: kıyı boyunca
hiçbir şey tutamayacağınız her yer, sırayla. Öteki liste ne olurdu bilinmez ama bu ondan
çok daha uzun; sonuna geldiğinizde neden bu tarafından yazmayı seçtiğini anlıyorsunuz.

Çarpmıyor, **açıyor**; P-15'in izlenecek şekil olarak kaydettiği de bu: mevcut on kitabın
altısı xp çarpanı ve en ilginç ikisi — `A Glint On The Sand`, `Butchering and you` — bir
aktivite ve bir yetenek veriyor. Bu kitap körfezde deniz balıkçılığını açıyor ve bu, kendi
başına anılmaya değer bir boşluğu doldurdu: **limanın hiçbir türde aktivitesi yoktu**, ki
kimliği iş olan tek bölge için tuhaf. Yeni eşya da gerekmedi — Mackerel shark, Trout,
Ratfish ve Clam hepsi mevcut; buradaki fark hangisinin beklemeye değdiği. İstiridyenin
oyunda tam olarak bir tek başka kaynağı vardı.

**`check_books_can_be_got`** muhafız ve `check_components_can_be_made`'in kitaplara
çevrilmiş hâli: "bu kitap gerçek bir ödül adlandırıyor mu" değil, "bu kitap hiç elde
edilebilir mi". Kitap buradaki en ucuz öğretme yüzeyi — yer yok, NPC yok, dövüş yok — ve
tam bu yüzden bir kitap yazılıp, çevrilip, gerçek ödüller verilip, hiçbir şey düşmeden hiç
oyuncuya ulaşmayabilir. Kardeşi gibi iki yönlü: eşyası olmayan okuma verisi okunamaz,
okuma verisi olmayan eşya ise anında okunup hiçbir şey öğretmez. Her dal için bir tane
olmak üzere üç yönden negatif test edildi; çünkü ilk dal `continue` yapıyor ve ikincisini
gizleyecekti. Ulaşılabilirlik kurulumu artık iki kontrolün paylaştığı bir yardımcı, yani
yeni bir kaynak türü ikisine birden öğretiliyor.

**Ve regresyon.** Yeni kitabın ulaşılabilir olup olmadığını ölçmek, ulaşılabilir
olmadığını ortaya çıkardı — **Beyaz demir cevheri** ile **Siyah demir cevheri** de öyle.
Körfezin rafı v0.7.5'te fonksiyona dönüştüğünde `world_index.js`,
`inventory_templates[trader.inventory_template]` yapmaya devam etti; bu da bir fonksiyon
için `undefined`'a çözülüyor. O tüccarın sattığı her şey Keşifler panelinden sessizce
çıktı; körfezin bütün oyundaki tek kaynağı olduğu iki cevher dâhil. Hiçbir şey hata
fırlatmadı. Sayfanın yalnızca cevabı yoktu ve cevabı olmayan bir panel, kaynağı olmayan bir
eşya gibi görünüyor.

Artık tek bir çözücü var: `traders.js` içindeki `stock_list_name_of`; hem
`get_inventory_from_template` hem indeks onu kullanıyor. `check_trader_stock_lists`, bu
alana yapılan *atamaları* zaten reddediyordu; artık onu *çıplak okumayı* da reddediyor —
aynı problemin öteki yüzü. Bunun ilk kalıbı `traders[key]?.inventory_template` içindeki iç
`]` işaretini geçemiyor ve negatif testi geçiyordu; düzeltilip yeniden test edildi.

İki regresyon testi, özellikle o iki cevher üzerine; çünkü takımda ticaret kaynakları için
bir test zaten vardı ve baştan sona geçiyordu: stok listesi hâlâ düz bir metin olan bir
tüccarı kullanıyormuş.

### Sahibinin brief'i, iki dilde, git'te

P-17. `docs/TODO.md`, döngü başladığından beri bilerek izlem dışıydı; hem bu dosya hem
döngünün kendi talimatları bunu söylüyor ve commit edilmemesini söylüyordu. Sahibi bunu
tersine çevirdi: artık izleniyor — Türkçe özgün metin bütün hâliyle `docs/TODO.TR.md`,
yanında da kanonik İngilizce `docs/TODO.md`; ikisi aynı `doc-version` başlığında, ki D-3
izlenen her markdown dosyasından bunu istiyor.

**Neden dışarıda tutuluyordu ve o gerekçe izlenmeye başlayınca neden hâlâ geçerli.**
Brief'in checkbox'ı yok ve hiçbir maddesi işaretlenmiyor; iş `PROPOSALS.md` içinde
izleniyor, brief orada koda karşı ölçülüp numaralı önerilere dönüştürüldü. Bu ayrım
muhasebe değil. Brief'in bazı varsayımları kodda yok — bir lockpicking skill'i, bir
navigation skill'i ve lonca itibarı anıyor; yazıldığında üçü de mevcut değildi. Doğrudan
ondan çalışmak, kapanmış kararları yeniden türetmek ve o zamandan beri ölçülüp
düzeltilmiş varsayımlara göre davranmak olurdu.

Bu yüzden gerekçe artık, bu repository'nin dışından kimsenin göremeyeceği bir teamülde
yaşamak yerine iki yarının da başına yazıldı. Dosya ne olduğunu kendisi söylüyor: kuyruk
değil bağlam; iş ise önerilerde.

İzlenmesinin gerekçesi daha basit: kimsenin göremediği bir brief, kimsenin işi karşısında
denetleyemediği bir brief demek. Marrowmoth arc'ının altı sürümü bu belgeye karşı
yayınlandı ve bugüne kadar bir okuyucu onları yalnızca belgenin özetiyle
karşılaştırabiliyordu.

Sonradan keşfedilmek yerine taşınan üç sonuç:

- **Döngünün talimat dosyası bunun tersini söylüyordu** ve bir sonraki oturumu yanlış bir
  ifadeye göre davrandıracaktı. `.claude/` yok sayılıyor, yani bir commit'le
  düzeltilemiyor; aynı değişiklikte yerelde düzenlendi. Ayrıca kendisi hakkında da tersini
  söylüyor artık: `docs/TODO.md` bir çift ve D-3'ü geçiyor; `.loop.md` ise tek bir
  agent'ın Türkçe çalışma emri ve İngilizce-kanonik bir çift olacak şekil değil, o yüzden
  yok sayılmaya devam ediyor.
- **`git add docs/` hâlâ yanlış**, ama artık başka sebeple. Eskiden taşıdığı tehlike —
  izlenmeyen bir brief'i süpürüp bir sonraki koşuda `check_docs_are_paired`'i kırmak; ki
  bugün bir kez oldu — ortadan kalktı, ama bunu görünür kılan şey adlandırılmış yolları
  yazmaktı.
- **İngilizce yarı bir çeviri, yeniden yazım değil.** Brief'in kendi yapısı, arka arkaya
  gelen üst düzey başlıkları dâhil korundu; çünkü bu sahibinin belgesi ve şekli de
  söylenenin bir parçası.

`check_docs_are_paired` artık 20 dosyada 10 çift bildiriyor; öncesinde 18 dosyada 9'du.

### v0.7.7 - alta taşan tooltip yukarı doğru açılıyor

Oyun içinde ekran görüntüsüyle bildirildi: kenar mahalle aksiyon tooltip'i, aksiyon
listesinin son satırında imlecin altına çizilmiş ve yarısı pencerenin altını aşmış.

**Sebep, belirtinin düşündürdüğü şey değil.** `index.html` içindeki satır içi script'te iki
tooltip yerleştirici var. `move_restricted_tooltip`, tooltip'i `scrollHeight` ile ölçüyor,
alt kenarın nerede olduğunu hesaplıyor ve onu ekranda tutuyor. `move_unrestricted_tooltip`
ise `top` değerini `clientY + shift` yapıyor ve hiçbir şey kırpmıyor.

Aksiyon satırları `elements_with_unrestricted_tooltips` içindeydi — **üstelik yalnızca
kırpan yerleştiricinin okuduğu iki alanı, `target_classes` ve `break_classes`'ı
taşıyarak.** Girdi, kırpan yerleştiricinin alanlarına sahipti ve kırpmayanına veriliyordu;
yani o iki alan hiçbir şey yapmıyordu. Kendi yorumu da bu süre boyunca *"kırpılmazsa, uzun
olanı sayfanın altından taşıyordu"* diyordu: geçmiş bir sorunu açıklamıyordu, girdinin
hâlâ içinde bulunduğu durumu tarif ediyordu. Var olan en pahalı yorum türü bu.

**İki parça hâlinde düzeltildi; çünkü kırpmak ne istenen şey ne de doğrusu.** Uzun bir
tooltip'i alt kenara sabitlemek onu ekranda tutuyor ve işaret edilen satırın üzerine
kaydırıyor; böylece hakkında okuduğunuz şey, okuduğunuz şeyin arkasında kalıyor. Dikey
kural artık şu: varsayılan olarak imlecin altı; altta yer yoksa **üstü**; ve yalnızca iki
yöne de sığmadığında kırpma — üstten, çünkü ilk satırından okunan bir tooltip, son
satırından okunandan değerlidir.

Bu yalnızca aksiyon satırlarına değil, kırpılan her tooltip'e uygulanıyor; doğru kapsam da
bu: hiçbiri kendi satırının üzerine sabitlenmek istemiyordu.

**Muhafız, aritmetiğin artık yaşadığı yer.** `index.html` içindeki satır içi bir `<script>`,
bu kod tabanında hiçbir testin ulaşamadığı tek yer ve yanlış olan kısım da orasıydı.
Matematik, `ui_helpers.js` içindeki `place_tooltip_vertically`'ye taşındı — saf, DOM yok —
ve satır içi script'e `window` üzerinden veriliyor; `main.js` zaten bir düzine fonksiyonu
böyle veriyor. On test; aralarında bildirilen durum, "tooltip, tarif ettiği satırın üzerini
kapatmaz" doğrulaması olarak yazıldı. Kaydırma çıkarılarak negatif test edildi: üçü düşüyor
ve üçüncüsü tam olarak ekran görüntüsü — *"ve tarif ettiği satırın üzerini kapatmıyor:
600'e karşı 560"*.

Yol üstünde kontrollerin yakaladığı bir şey: `main.js`, `ui_helpers.js`'i hiç import
etmiyordu; dolayısıyla bunun ilk hâli `place_tooltip_vertically`'yi çıplak bir ad olarak
kullanıyordu. esbuild çözülmemiş bir tanımlayıcıyı runtime global sayar; yani derleme de
paket de temiz görünür ve oyun yüklenirken hata fırlatırdı. Import, yeni bir kenarın
gittiği yere — main.js'in listesinin sonuna — eklendi.

### v0.7.6 - nasıl durduğunuz, şeylerin size ne yaptığını değiştiriyor

P-14 Faz 6'nın dört parçasından ikincisi: stance seçiminin, ikinci bir stat çarpanı
kümesiyle değil `on_hit` ve `on_damaged` üzerinden anlam kazanması.

**Yeni soyutlama yok, yeni yaratık yok.** P-14, `Enemy`'nin zaten `on_hit`, `on_damaged`
ve `on_death` aldığını ve dört yaratığın bunları kullandığını ölçmüş, ikinci bir
mekanizma için gerekçe olmadığı sonucuna varmıştı. Bu geçerli: buradaki her tepki, zaten
var olan bir kancanın içine ya da aynı aileden bir yaratıkta onun yanına yazıldı. Ve
hiçbir dövüş eklenmedi, çünkü arc'ın kendisinde combat yok ve Faz 4 bunu söylemişti —
yeni bir yaratık gerektiren bir stance geçişi, bu fazın adını taşıyan başka bir faz
olurdu.

**Dört tepki ve her biri, statların zaten ima ettiği şeyi kurgunun söylemesi:**

- **Kırmızı karınca sürüsü.** Ucunuzu sürünün ortasına saplamak, geri kalanının
  gelmesini engellemiyor; gelen de kollarınızın içine giriyor — dörtte bir olasılıkla
  `Irritation`. Tabii geniş bir yay çizmiyorsanız: Broad Arc, Berserker's Stride ve
  Flowing Water sürünün içinden bir hat geçiriyor ve onlar geri gidiyor. `target_count`
  çarpanı o duruşların sürüyü daha hızlı öldürmesini zaten sağlıyordu; bu ise birini
  seçmeyi aritmetik olarak daha iyi değil, doğru cevap gibi hissettiren şey.
- **Kurbağa.** Sıçrama ne kadar sert vurduğunuzu önemsemiyor, önünde ne kadarınızın
  durduğunu önemsiyor. Berserker's Stride blok ve çevikliği 0.4'e düşürüyor, Broad Arc
  iki kolu birden veriyor; yani iki katı isabet ediyor. Defensive Measures ise yarıya
  indiriyor — bütün varlık sebebi sizinle bunun arasına bir şey koymak olan tek duruş.
- **Dev yusufçuk** ve **Yusufçuk kraliçesi.** İğne, bir savuruşa kendini vermiş bir
  bedeni buluyor, kımıldamayı bırakmamış olanı ıskalıyor: açık duruşlarda bir buçuk kat,
  Quick Steps ya da Flowing Water'da 0.6 kat.

**Dürüst sınır**, sonradan keşfedilmeye bırakılmak yerine dosyaya yazıldı: bir kanca
yalnızca `add_active_effect`'e ve log'a ulaşabiliyor. Yani tepki her zaman "nasıl
durduğunuz, bunun size ne yapabileceğini değiştirir" oluyor; yaratığın kendi durumunu
değiştirmesi değil. Burada hiçbir şey bir durum makinesine dönüşmüyor.

**`check_stance_reactions_name_real_stances`** muhafız ve mevsim ile bölge
kontrollerindeki aynı sessiz sınıf: yanlış yazılmış bir stance kimliği, var olan her
stance için yanlış döner; yani tepki yazılır, çevrilir, yayınlanır ve bir kez bile
görülmez, yaratık ise tam eskisi gibi davranır. Bir hatanın tasarım kararı gibi
görünmesinin en inandırıcı yolu bu. Kimlikler yeniden yazılmak yerine
`combat_stances.js` içinden geliyor ve iki biçim de okunuyor — adlandırılmış gruplar ve
satır içi listeler. 7 stance'a karşı 10 kimlik. Üç yönden negatif test edildi: bir grupta
yanlış yazılmış kimlik, satır içi listede yanlış yazılmış kimlik ve boş bir liste.

**Bundan bir test altyapısı hatası da çıktı.** `browser-free-src.mjs`, `current_stance`'ı
`"normal"` metni olarak taklit ediyordu; oysa `main.js` bir Stance nesnesi olan
`stances["normal"]`'ı tutuyor. Üzerinden hiçbir alan okunmadığı için bu basitleştirme
görünmezdi; bir tepki `.id` okuduğu anda değer `undefined` olurdu ve mekanizmayı
sınayan her test, hiçbir şeyin hiç eşleşmediğini onaylayarak geçerdi. Stub artık gerçeğin
biçiminde ve değiştirilebilir; yani bir test kahramanı farklı durdurup neyin değiştiğini
sorabiliyor.

On beş test, tepkilerin dayandığı kararı kapsıyor — tarayıcısız bir yüklemenin
gözlemleyebildiği tek kısım da o, çünkü `add_active_effect` de log da taklit ediliyor —
artı dört tepkinin de iki duruşta, silahlı ve silahsız hâlde hata fırlatmadan çalıştığını:
400 çağrı. Negatif test, stance kimliği yerine stance nesnesinin karşılaştırılmasıyla
yapıldı; stub'ın sakladığı hatanın tam kendisi: beş kontrol düşüyor.

### v0.7.5 - 5. kademe yapılabiliyor ve cevher satın alınmıyor, kazılıyor

P-14 Faz 6'nın dört parçasından ilki ve P-12'nin büyük kısmını kapatan parça. Otuz altı
bileşen bu fork'tan da önce, bitmiş hâlde duruyordu — her beyaz çelik ve siyah çelik
silah başlığı, iki kalkan tabanı, üç sapın tamamı ve beş zırh yuvası için zincir ile
plaka — ve oyunda hiçbir şey tekini bile üretemiyordu. Otuz altısı da artık üretilebilir.
`check_components_can_be_made` 203'te 159'dan 195'e çıktı ve 5. kademe grubu, daha iyi
açıklanmak yerine `known_unmade` listesinden tamamen kalktı.

**Mesele cevherin kendisi.** P-12, 4. kademe yayınlandığından beri "satın alınan değil,
çıkarılan bir cevher" istiyordu; Faz 6 ise 4. ve 5. kademe malzemelerinin cezirin
açtığına bağlanmasını söylüyordu. İkisi aynı cümle: `Heavy sand`, yalnızca Marrowmoth'un
iki mevsiminde sunulan gelgit düzlüklerinde kazılıyor. Yani 5. kademe reaktifi, kendi
koşulunu taşımadan arc'ın penceresini miras alıyor — aktivitenin mevsim kapısına
ihtiyacı yok, çünkü üstünde durduğu zemin mevsim dışında var olmuyor. Kimse satmıyor,
çünkü kimse ona ulaşamıyor; bu da bütün arzın körfezdeki tek bir depo olduğu 4. kademenin
tam tersi.

Bu bir reaktif, daha zengin bir damar değil. `Heavy sand`, beyaz ve siyah demire,
Atratan cevherinin demire yaptığını yapıyor; yani 5. kademe, içinde iki cevher olan bir
eritme tarifi — beyaz ya da siyah demir cevheri beş, artı ağır kum üç, artı iki kömür;
Smelting 25/35'te ve 4. kademeden daha kötü bir şansla. Bu, bir kademenin var olması için
ikinci bir yol uydurmak yerine çeliğin zaten sahip olduğu şekli yeniden kullanıyor.

**Dört eşya eksikti ve kimse fark etmemişti.** Üretici, fork'tan da önce "white
chainmail", "white plate", "black chainmail" ve "black plate" malzemelerinden dış
parçalar üretiyordu ve bu dördü `items.js` içinde hiç yoktu — bu tek başına, yapılamayan
36 bileşenin 20'si demek. Artık varlar; 4. kademe çifti gibi iki ve üç külçeden
dövülüyorlar ve değerleri 4. kademe çiftinin külçe üzerinden ölçeklenmesiyle belirlendi:
70'lik külçede 105/160 olan, 120'lik külçede 180/275 oluyor.

Ardından on üç bileşen tarifine yayılan 36 satır; bu mekanik bir iş ve öyle de yazıldı —
elle yazılmak yerine bir tablodan üretildi ve yanında durduğu 4. kademe satırına karşı
doğrulandı; böylece uyuşmayan bir sayı ya da yanlış yazılmış bir sonuç içeri sızamadı.

**Muhafızın iki yönü de negatif test edildi**, çünkü `check_components_can_be_made` iki
yönlü işliyor ve yalnızca tek yönden düşen bir liste, bastırma dosyasına dönüşür: yeni
satırlardan biri çıkarıldı — kontrol bunu, listede olmayan yapılamaz bir bileşen olarak
adlandırdı; ve artık üretilen bir ad listeye geri kondu — onu da, artık açıklamadığı bir
girdiyi tutmaya devam eden bir liste olarak adlandırdı.

**P-12'de kalan şey** tek bir soru ve bir tarif değil. `roll_quality`,
`station_tier - component_tier` okuyor; yani dağdaki bacada — oyunun en iyi ateşi, 3.
kademede — dövülen 5. kademe bileşenleri iki kademelik cezayla atılıyor. Her şey
yapılabilir durumda; hak ettiği kalitede çıkıp çıkmayacağı ve daha iyi bir ateşin nerede
olacağı ise bir denge ve bir yer meselesi. Bu da tek başına iliştirilmiş bir istasyondan
çok, Faz 6'nın ekonomi geçişinin yanına ait.

**Ve kayda geçmeye değer bir dokümantasyon kayması.** P-12'nin Türkçe yarısı, İngilizce
yarısının bir tur önce düzeltildiği engeli hâlâ anlatıyordu — var olmadığı ortaya çıkan
"eksik görünen ad". `doc-version` bu süre boyunca eşleşiyordu, çünkü o kontrol iki yarının
aynı sürümde olmasını denetliyor, aynı şeyi söylemesini değil; D-3 da bunu kendisi
söylüyor. İki yarı da artık doğru ve bu, eşli doküman kuralının bir okuyucudan başka
hiçbir şeyin yakalayamadığı arıza biçimi.

### v0.7.4 - *One Unweighed Crate*: aynı el ve ona verilecek bir ad yok

P-14 Faz 5 ve arc'ın hikâyesinin sonu. Sandığa ulaşılıyor ve sahnenin tasarım probleminin
tamamı şu: sandık bir kilit değil.

**Kontrol, onu geri koymak.** Perception ve Woodworking; çünkü zor olan şey, bu rıhtımda
kimsenin atmayacağı bir bağı okumak — kendi üstünden, iki kez çözmeniz gereken bir
sırayla geçiyor — ve onu, bağlayan adamın iki kez bakmayacağı kadar iyi yeniden yapmak.
Yani başarısızlık "açılmadı" değil. Bunu hiçbir şeyi *kesmeden önce* anlamak: onu kesip
inandırıcı biçimde geri bağlayacağınız hiçbir senaryo yok, o yüzden kesmiyorsunuz ve su
gitmenizi söyleyene kadar sırtınızı ona yaslayıp oturuyorsunuz. Hiçbir şey
kaybedilmiyor, hiçbir şey tüketilmiyor ve 4a'nın muhafızı bunu söylüyor.

**İçinde ne var.** Saman; sonra keçe olmayan, mantar olmayan, başparmak altında
sıkışmayan ve ambardan sıcak olan gri bir malzemeden ölçüsüne göre kesilmiş bir yatak.
Yatağın içinde tek bir şey: bir bilek genişliğinde kapalı bir halka; demir olmayan, çelik
olmayan, tunç olmayan ve tırnaktan iz almayan bir metalden, çepeçevre kendi başlangıcına
dönen karelerle oyulmuş.

Tek motif, tek metal, tek açıklanmamış malzeme; tam olarak önerinin istediği şey ve
sandıkta başka hiçbir şey yok. Sonra yatak yerine, saman yerine gidiyor; bağ bağlandığı
gibi, bağlandığı sırayla bağlanıyor ve iki kez kontrol ediliyor.

**Hiçbir eşya ödemiyor.** Bu bir eksiklik değil, fazın kendisi. Envanterdeki bir nesnenin
bir şey yapması gerekir — kuşanılması, bir şeyin yapımında kullanılması, satılması — ve
yaptığı her şey, bu arc'ın açıkça cevaplamasına izin verilmeyen bir soruyu cevaplardı.
Oyuncunun dışarı taşıdığı şey bir tarif ve daha önce tam olarak bir kez anlatılmış bir
desen.

**Arc, sayman değil antika koleksiyoncusu üzerinde kapanıyor** ve buradaki tek gerçek
yazarlık kararı da bu oldu. Sayman bir sayfa tutuyor; bu adam ise kasabanın en eski
şeylerini kırk yıldır kataloglamış ve öteki parçayı *"suyun kaynama süresi kadar"* elinde
tutmuş. Oyunda "aynı el" deyip inandırabilecek tek kişi o. Cevap vermeden önce tarifin
gerisini istiyor — metali, tırnağın altında ne yaptığını, yatağın sıcak olup olmadığını —
sonra büyütecini çekmeceye koyuyor; onun işle ilgisi olmayan bir şey yaptığı ilk kez
görülüyor.

*"Aynı el. Aynı nesne değil. Kopyası da değil ve birinin ona öykünmesi de değil. Aynı el;
bir evdeki iki kapının aynı el olduğu gibi."*

Bundan kanona geçen üç olgu var ve **başka hiçbir şey yok**: en az iki tane var; onları
isteyen biri var ve ilkini almaya pazarlık etmeden geldi; ve o biri, onları yapanla aynı
değil. Kimin eli olduğunu söylemiyor ve oyuncunun bunu hatırlayacağı için dikkatli
olduğunu açıkça belirtiyor. `STORY.md` bölüm 3 artık bu üçünü ve hâlâ açık olanların
listesini kayda geçiriyor — soygunun parasını kimin verdiği, neden o yolcunun, iki
nesnenin nereden geldiği, kahramanın neden birine sahip olduğu ve o karelerin ne olduğu —
böylece sonraki arc onları kazara genişletemiyor. İcat yerine geri kazanım: ödül,
hikâye notlarının çoktan "tükenmiş" diye işaretlediği bir NPC; değiştirilmedi,
genişletildi.

Muhafız: Faz 2a'dan gelen `check_lore_threads_resolve` ve Q-8 gerçekten iplik seçeneğine
oturdu. Marrowmoth ipliği artık üç konuşan üzerinde beş beat — bir rıhtım, bir lonca ve
meydanın karşısındaki bir dükkân — Q-8'in yazıldığı şeklin tam boyu. Yalnızca konuşan
bazlı listede bakıldığında bu beşi, birbiriyle alakasız üç konuşma gibi okunurdu.

Ölçüldü: aksiyon ambarda, Perception 30/60 ve Woodworking 15/40 ile duruyor; quest,
kaydın tutacağı kimlik altında iki görev taşıyor; ve iplik `harbour tallyman`,
`guild clerk` ile `antique collector` üzerinde beş beat'e çözülüyor.

### v0.7.3 - *Out on the Ebb*: aynı çamurun üstünde üç yol

P-14 Faz 4b. Q-9 uyarınca iki yer, fazlası değil — gelgit düzlükleri yaklaşım, alt ambar
varış — ve demirleme yeri ile yük güvertesi de kendi odaları değil, bu ikisi üzerinde
aksiyon. İçinde hiçbir yerde combat yok: engel su ve karanlık.

**Gelgit bir saat değil.** Bu motorda günün saatine bakan bir koşul yok ve bir tane
eklemek, tam olarak Q-10'un kapsam dışı bıraktığı zamanlayıcı olurdu. Bu yüzden
düzlükleri kapayan şey, rafın, rıhtımın sesinin ve kâtibin söylentisinin okuduğu aynı
mevsim penceresi: oraya yürümenin tek sebebi teknenin çamurda yatıyor olması. Açılma
değil `display_conditions`; Faz 2'nin gerekçesiyle — açılma tek yönlüdür, tekne ise yılda
iki kez geliyor — ve körfeze dönüş yolunda hiçbir koşul yok, yani mevsim dönerken orada
olan bir oyuncu her zaman içeri gelebiliyor.

**Üç yol ve yalnızca biri başarısız olabiliyor.** Bu, fazın kendi kuralı — her
başarısızlık başka bir yol bırakır: daha uzun, daha pahalı ya da itibar üzerinden — ve
bir muhafızın sonradan fark etmesine bırakılmak yerine içeriğe yazıldı:

- **Yürümek.** Denemek için Equilibrium 18, kesinlik için 42. Zemin iki kez aynı değil ve
  ortada patika yok; yalnızca bugün işe yarayan bir yol var. Başarısızlık, suyun
  dönmesi: üstünüze gelmiyor, sadece çekilmeyi bırakıp yükselmeye başlıyor ve orada bu,
  "çık" denmesiyle aynı şey. Bedava, tekrarlanabilir ve gelgitten başka hiçbir şeye mal
  olmuyor.
- **Kayıkçıya para vermek**, 25.000, yalnızca başarıda alınıyor. Pahalı yol pahalıdır,
  daha yüksek fiyatlı ikinci bir kumar değil — başarısız olamıyor. Adam düz dipli kayığı
  on santim suda sırıkla itiyor, yol boyunca tek soru sormuyor ve beklemiyor.
- **Sağlam hattı istemek**, `Slums` 250. Soruşturmanın 200'ünden bilerek daha zor: bir
  hamalın konuşması bir iyilik, zeminin nerede tuttuğunun gösterilmesi daha büyük bir
  iyilik. Onun ayak izlerine basarak, yanına değil. O hattı, karanlıkta bir merdiveni
  bildiğiniz gibi biliyor, hiçbirini açıklamıyor ve gövdenin dibinde duruyor:
  *"Ben oraya çıkmıyorum, siz de çıkmayın. Yine de çıkacaksınız."*

Üçü de aynı merdivende bitiyor ve aynı açılmayı veriyor; yani burada oyuncunun sahip
olmadığı bir skill'in arkasında hiçbir şey durmuyor.

**Ambar** çamura yan yatmış; yani aşağıda hiçbir şey düz değil ve her şey, düz olacağını
varsayan insanlar tarafından bağlanmış. Karanlıkta Climbing ve Spatial awareness; her
bağı güvenmeden önce ayrı ayrı sınayarak. Aşağıdaki şey sayfada yazan şey — fıçılar,
rodalar, kalay külçeleri, deriler — hepsi aynı ehil, aynı sıkılmış, aynı profesyonel
biçimde bağlanmış. Ve kıç tarafta, tek başına, o güvertede başka hiçbir şeye tanınmamış
bir buçuk metrelik boşlukla: farklı bağlanmış bir sandık. Daha iyi değil; farklı — bunu
bir mevsimde yüz kez yapan birinin yaptığı gibi değil.

Oyuncu ona dokunmuyor. Ona ulaşmak Faz 5'in işi ve arc, cevaptan çok soruyla bitirmek
üzerine kurulu.

**Kontrollerin, yazının kaçırdığı neleri yakaladığı.** Dördü de kaynağı okuyarak
görülemeyecek şeyler: iki yeni yerin de `name <yer>` satırı yoktu, yani yer başlığı ve
her seyahat satırı registry anahtarını gösterirdi; üç seyahat satırı kimliği bildirilmiş
ama yazılmamıştı; ve iki yardım sayfasının haritası da iki yerin hiçbirini
adlandırmıyordu — site kontrolü bunu *"haritayı okuyan oyuncular onun var olduğunu
bilmeyecek"* diye bildiriyor. Bu son madde sessizce yayına çıkacak türden bir boşluk: yer
ulaşılabilir ve doğru, ama basılı haritada hiç yok.

Yeni muhafız yok: 4a'nın `check_no_dead_end_skill_gates`'i bunu kapsıyor ve dört yeni
aksiyon sınıf düzeyi kontrollere kendiliğinden katıldı. Quest ilerleten 17 aksiyon,
hiçbiri başarısızlıkta kaybedilmiyor; 69 aksiyonun hepsi başarısızlığı açıklayabiliyor;
36 yer koleksiyonu birer kez atanmış.

Sonraki fazlar için kayda geçti: 4a'nın muhafızı `main.js` içindeki deneme
çözümleyicisini üç çağrı yerinin sırasına bakarak okuyor; o çözümleyicideki her düzenleme
kilidi kazanan tarafta tutmak ya da niçin tutmadığını söylemek zorunda.

### Çıkmaz muhafızı, planın söylediği şeyi söylemiyor

P-14 Faz 4a. Öneri `check_no_dead_end_skill_gates`'i istiyor ve kuralı da açıkça
yazıyordu: *tek ilerleticisi skill'e bağlı bir aksiyon olan bir task'ın ikinci bir
ilerleticisi olmak zorundadır.* İçeriğe karşı ölçüldüğünde bu kural burada yanlış ve onu
dayatmak, kontrolü hiç yazmamaktan daha kötü olurdu.

Beş görünür task yalnızca skill kontrollü bir aksiyonla ilerliyor. Dördü birer bölgenin
imzası: ovada `read the ground`, körfezde `read the departures`, dağda `cut a flue` ve
ovanın yeri okuyan quest adımı. Beşincisi ise iki sürüm önce yayınlanan
`see the manifest`. Planlanan cümleyi kontrole yazmak beşini birden işaretlerdi ve
çıkış yolları yalnızca şunlar olurdu: bilerek tek yönlü yazılmış dört aksiyona ikinci
bir ilerletici iliştirmek, ya da bir istisna listesi tutmak — ki bu, kendine inanmayı
bırakmış bir kontroldür.

**Questi asıl kilitleyen şey**, varsayılarak değil çözümleyiciden okunarak:
`lock_action`, `main.js` içinde tam olarak tek bir yerden ve denemenin kazanma dalının
içinden çağrılıyor. Başarısız bir deneme asla kilitlenmiyor. Yani skill kontrolü burada
bir tuzak değil — bir tekrar ve skill de eğitilebiliyor. Planın kuralı, bu motorun sahip
olmadığı bir tehlikeye karşı yazılmıştı.

Sahip olduğu iki tehlike var ve muhafız da onlar:

1. **Kazanma dalının dışındaki bir kilit.** Bu, her an tek bir düzenleme uzaklıkta.
   `lock_action`'ı `pick_failure_text(action, "random_loss")` satırının altına taşıyın
   ve oyundaki skill kontrollü her ilerletici aynı anda tek kullanımlık olur — beş task
   birlikte çıkmaza döner ve takımdaki başka hiçbir şey bunu fark etmez. Kontrol üç
   çağrı yerini okuyor ve kilidin, başarı metni ile kayıp metni arasında durmasını şart
   koşuyor.
2. **Başarısız denemede yenen bir eşya.** `conditions[0].items_by_id` içinde `remove`
   işaretli eşyalar, deneme kazanılsa da kaybedilse de alınıyor; `required.items_by_id`
   ise doğrudan `remove_on_fail` kabul ediyor. Bugün dört aksiyon her denemede tüketiyor
   — iki yerde kamp malzemesi, iki yerde daha halat rulosu — ve hiçbiri quest
   ilerletmiyor. Çizgi de bu: bir aksiyon ya başarısız olmanın size bir şeye mal olduğu
   bir aksiyondur ya da bir task'ı bitirmenin tek yoludur; ikisi birden değil.

Quest ilerleten 13 aksiyon, hiçbiri başarısızlıkta kaybedilmiyor. İki kural da negatif
test edildi: kilit kayıp dalına taşındı ve `see the manifest`'in koşullarına tüketilen
bir halat rulosu eklendi. Her biri kendi gerekçesiyle adlandırıldı.

Öneri artık düzeltilmiş kuralı ve arkasındaki ölçümü taşıyor; çünkü "Faz 4'ün istediği
muhafız"ı okuyacak bir sonraki kişi, kendi tarifiyle sessizce uyuşmayan bir kontrol
değil, ne yapıldığını ve neden farklı olduğunu bulmalı.

Sürüm artmadı: oyuncu bunların hiçbirini görmüyor.

### v0.7.2 - *A Stroke Through It*: üç giriş, üç farklı cevap

P-14 Faz 3b. Briefin şartı, **aynı parçayı değil, farklı parçaları** veren üç bilgi
yoluydu; asıl tasarım problemi de tam olarak bu: tek bir olguyu öğrenmenin üç yolu, üç
kapılı tek bir yoldur.

**Üç parça.** Loncanın mühür defteri, o satırdaki işaretin bir hane mührü olduğunu
söylüyor: iyi malzemeden, bu işi daha önce yapmış birinin kestiği bir mühür ve defterde
olmayan, hiç de olmamış bir haneye ait — defterin, bu kasabada kullanımdaki her hane
mührünün kaydı olması, onun yokluğunu anlamlı kılan şeyin ta kendisi. Hamallar, kırk
tonluk bir tekneden iki adamın indirdiğini, hafif olduğunu ve tekerlekleri çuval bezine
sarılı bir arabayla, ışık gitmeden güneye gittiğini söylüyor. Faktörün eski suretleri,
aynı boş satırın iki ilkbahar öncesinde de durduğunu söylüyor; varış sütununda başlanıp
bırakılmış tek bir harfle ve cetvel çizgisinin altında — yani birileri o sandığın nereye
gittiğini tek bir harf yazacak kadar bir süre biliyormuş. Parayı kimin verdiği üçünde de
yok; arc'ın "tek katman" kuralı burada tutuyor.

**Eşikler türetildi, uydurulmadı.** Sokağın üç aksiyonu 100 / 200 / 300, meydanınki
50 / 150 / 250 üzerinde oturuyor; hikâye boyunca kazanılabilen değerler ise 350 Slums ve
320 Town. Hamallar Slums'ı 200'de, faktörün rafı Town'u 150'de okuyor — her semtin kendi
orta kademesi. Mühür defteri ise Guild'i 50'de okuyor; Q-7'nin eklediği ve şimdiye kadar
hiçbir şeyin okumadığı bölge.

**Lonca itibarının arc'ın içinde kazanılabilir hâle gelmesi gerekiyordu** ve buradaki tek
"arkasında kayıt olan" karar buydu. Onu *The Merchant's Word*'e iliştirmek, o questi
bugünden önce bitirmiş hiç kimseye bir şey ödemezdi ve lonca yolu o oyuncular için
temelli kapanırdı. Bu yüzden 1. quest tamamlandığında 60 ödüyor: o kadarını yapmış herkes
için menzilde, yapmamış hiç kimse için değil ve ne zaman oynadığından bağımsız.

**2. quest, her biri bir ilerleticili üç görev yerine üç ilerleticili tek bir görev
taşıyor.** Sokağı olup kasabası olmayan ya da loncası olup ikisi de olmayan bir oyuncu
yine de bitiriyor. Kaybettiği şey diğer iki parça oluyor ve lore ipliği de kısalarak
bunu söylüyor. Bu, sahibin "başarısız kontrol questi kilitlemez" kuralının itibara
uygulanmış hâli.

Bu da Faz 4'ün `check_no_dead_end_skill_gates` muhafızının, Faz 1 ve 2'ninkiler gibi öne
alınıp alınmayacağı sorusunu doğurdu. Varsayılmadı, ölçüldü: ilerleticisi olan 61 görünür
görevin 5'inde kapısız hiçbir ilerletici yok — *The Infinite Rat Saga* #3, *Village
expansion* #0 ve #7, *A Fire in a Hollow* #1 ve bu. Hiçbiri çıkmaz değil, çünkü o
kapıların hepsi sebebini söyleyerek reddediyor ve bir skill eğitilerek ya da bir alet
alınarak karşılanabiliyor. Sebebini söyleyen bir kapı, başarısız olan bir kontrol
değildir; Faz 4'ün muhafızının etrafında yazılması gereken ayrım da bu. Öne almak dört
masum görevi işaretler ve yanlış kuralı öğretirdi; o yüzden planlandığı yerde kalıyor ve
ölçüm, Faz 4 tekrarlamasın diye kayda geçti.

**Buradaki hiçbir şey mevsime bağlı değil**; bu bir gözden kaçırma değil, bir karar.
Evrak da insanlar da yıl boyu kıyıda. Soruşturmayı pencereye bağlamak, manifestoyu geç
sonbaharda okuyan bir oyuncunun onun hakkında soru sormak için ilkbaharı beklemesi
demekti; oyun yılının yarısı boyunca duran bir quest ise kapı değil, duvardır.

Yeni bir muhafız borç değil: Faz 3'ün kendi muhafızı 3a ile gelen
`check_reputation_regions_have_names` ve artık 4 bölgede 58 kullanımı kapsıyor.

Yüklü oyunda ölçüldü: üç farklı bölge üzerinde üç yol, 50 / 200 / 150 eşiklerinde;
1. quest Guild 60, 2. quest 40 daha ödüyor; ve Marrowmoth ipliği artık iki konuşan
üzerinde üç beat.

### Lonca itibarı bir reputation bölgesi oldu; bölge anahtarı artık yazım hatası olamıyor

P-14 Faz 3a; Q-7'nin koda dökülmüş hâli. Faz 3, birbirinden farklı üç bilgi yolu
istiyor ve üç eksenin ikisi zaten harcanmıştı: kasaba meydanı Town'u 50 / 150 / 250'de,
sokak ise Slums'ı 100 / 200 / 300'de okuyor; yani bu ikisinden çıkacak üçüncü bir yol,
aynı yolun tekrarı olurdu. Üçüncü yolun üçüncü yol gibi hissettirmesini sağlayan şey
dördüncü bir bölge — oyuncunun yükselişini izleyebildiği bir sayı; alternatif olan
bayrak-ve-quest-durumu ise daha az koda mal olup hiçbir şey kazandırmıyordu.

Maliyet Q-7'nin ölçtüğü kadar oldu, fazlası değil. `character.reputation` dördüncü bir
anahtar taşıyor: `Guild`; iki dilde de bir `name Guild` satırı var. Başka hiçbir şey
kımıldamadı:

- Eski bir kayıt bu anahtar olmadan geliyor. `load()`, **kayıttaki** anahtarları
  dolaşıyor ve tanımadığı birinde uyarı verip geçiyor; yani eksik anahtar, bildirilen
  0'ı yerinde bırakıyor. Varsayılmadı, gerçek bir v0.6.54 export'una karşı doğrulandı:
  içindeki her anahtar hâlâ çözülüyor.
- `update_displayed_reputation` yalnızca 0'ın üstündeki bölgeleri çiziyor, yani kimse
  kazanmadığı bir satırı görmüyor — bunun sürümsüz yayınlanmasının sebebi de bu. Henüz
  hiçbir şey lonca itibarı kazandırmıyor, dolayısıyla satır hiç çizilmiyor ve oyuncu
  hiçbir değişiklik görmüyor.
- `market_saturation` ayrı bir harita ve ona dokunulmadı. Hiçbir şeyi fiyatlamayan bir
  loncanın market bölgesine ihtiyacı yok.

**`check_reputation_regions_have_names`**, adının söylediğinden fazlasını kapsıyor;
çünkü bir bölge anahtarını üç şey okuyor ve hiçbiri kendiliğinden diğeriyle uyuşmuyor:

- Karakter sayfası onu `getDisplayName` ile çözüyor; yani `name <bölge>` satırı olmayan
  bir bölge, oyuncunun bütün oyun boyunca açık tuttuğu tek panelde kendi kimliğini
  çiziyor. Yalnızca referans dil değil, her dil kontrol ediliyor: Türkçe oynayan bir
  oyuncunun kazandığı bölge ya Türkçe dosyadan çizilir ya da yer tutucudan.
- Bir `reputation:` **ödülü** bölge adlandırıyor ve `add_reputation` tanımadığı bölgede
  *hata fırlatıyor*. Bu, bir quest ödülü verirken oyuncunun gözü önünde çökme demek —
  olabileceği en kötü yer ve oynayarak ulaşılması en zor yer.
- Bir `reputation:` **koşulu** da bölge adlandırıyor ve ters yönde bozuluyor:
  `character.reputation[yazım_hatası]` undefined oluyor, ona karşı yapılan her
  karşılaştırma yanlış dönüyor ve kapı hiçbir yerde bir şey söylemeden temelli
  kapanıyor.

Son ikisi aynı değişmez olduğu için `src/` altındaki her dosyayı tarayan tek bir geçiş
ikisini de kapsıyor. 4 bölge, 2 dil, 51 kullanım.

Negatif test üç dosyada üç yönden yapıldı: Türkçe `name Guild` satırı silindi, bir quest
ödülünde bölge adı yanlış yazıldı ve bir diyalog ödülünde bölge adı yanlış yazıldı. Üçü
de adlandırıldı; eksik satır iki kez adlandırıldı — biri, yalnızca bir anahtarın eksik
olduğunu söyleyebilen mevcut dil eşleşme kontrolü tarafından; diğeri, neyin bozulduğunu
ve oyuncunun bunu nerede göreceğini söyleyen bu kontrol tarafından.

Düzeltilmeyip kayda geçirilen bir şey var, çünkü 3b'ye ait: lonca itibarının
**arc'ın içinde** kazanılabilir hâle gelmesi gerekiyor, yalnızca hâlihazırdaki lonca
işinden değil. Bu sürümden önce *The Merchant's Word*'ü bitirmiş bir kayıt, aksi hâlde
lonca yolundan temelli dışlanırdı; ne zaman oynadığınıza göre kapalı olan bir yol da yol
sayılmaz.

### v0.7.1 - *Forty Tons*: birinin iki kez boş yazdığı bir satır

P-14 Faz 2b ve arc'ın cevap veren değil soru soran ilk içeriği. Mevcut körfez üzerinde
iki aksiyon, bir quest ve ilk gerçek lore ipliği.

**İki aksiyon da açılıp yeniden kilitlenmek yerine mevsime bakan `display_conditions`
ile gösteriliyor.** "Tekne burada değil" oyuncunun değil dünyanın durumu ve bu fark
teorik değil: açılma tek yönlüdür, yani tekne ikinci kez geldiğinde aksiyonların bir
şey tarafından yeniden açılması gerekirdi ve bunu yapacak bir şey yok. Mevsim koşulu ise
sadece eşleşmeyi bırakıp yeniden eşleşmeye başlıyor; ikisinin de okuduğu şey Faz 1'in
penceresi.

**Boşaltma hiç para vermiyor** ve bu bir tasarım değil, bir düzeltmeydi. İlk taslak bir
günlük iş için 900 veriyordu; oysa bu, oyuncunun rıhtımda zaten kulak misafiri olduğu
bir satırla çelişiyor: *"Hamalların parasını kim veriyor?" "Kimse vermiyor."* Geçen
sürümde yazılmış kanon, bu sürümde yazılmış bir ödülden üstündür; o yüzden para
kaldırıldı. Geriye Equilibrium ve Weightlifting deneyimi, siz başınızı kaldırmadan
gidiveren birinin elinize tutuşturduğu ekmekle bir tas, ve saymanın *"Deftere yazılı
değilsiniz. Kimse deftere yazılı değil."*i kalıyor. Ödenmemiş olması zaten meselenin
kendisi.

**Manifesto**, Q-8'in şart koştuğu gibi, yeni bir arayüz değil aksiyonun başarı metni.
Altı sütun — yük, ağırlık, menşe, varış, mühür, durum — beş tam satır ve en altta,
altısının dördü boş yazılmış bir satır. Ne bulaşmış ne düzeltilmiş: altındaki cetvel
çizgisi kesintisiz. Durum sütunu onun o tekneden indiğini söylüyor. Biri bu kadarını
yazmış ve durmuş.

Manifestoyu okumak bilerek ikinci adım. Bir yabancı gidip deponun kapısındaki çeteleyi
okumaz; bir gün boyunca o teknenin tahtasından yük indirmiş biri okur ve kimse onu
durdurmaz. Literacy kapıyı 8'de açıyor, 20'de kesinleştiriyor; `read the departures`
Perception'ı nasıl okuyorsa öyle.

**Sayman bunu açıklamıyor, çünkü açıklayamıyor.** Çetelenin ne olduğunu söylüyor: bir
şey tartıldığında ağırlığı sütuna yazılır, o tartılmadı, dolayısıyla oraya yazılacak bir
şey yok. Sonra bunun ikinci kez olduğunu söylüyor — aralarında iki ilkbahar var, iki
satır da kendi elinden çıkmış ve sayfayı tuttuğu on bir yılda böyle olan bir tek onlar
var. Aynı sandık olduğunu söylemiyor. İkisini de tartmadı, ikisini de açmadı; yani
bildiği şey satırın aynı olduğu. Ona tartmamasını kimin söylediği bu oyunda henüz yok ve
arc'ın "tek katman" kuralı da tam burada tutuyor.

**İplik.** `lore thread the Marrowmoth`, saymanın rıhtımdaki iki repliği ile bir aylık
yürüyüş uzaklıktaki lonca kâtibinin söylentisi arasında uzanıyor. Bu Q-8'in kendi
örneği — tek konu, iki konuşan — ve yalnızca konuşan bazlı listede bakıldığında birbiriyle
alakasız iki konuşma gibi okunuyor. v0.7.0'da gelen kâtip repliğine ayrıca `lore: true`
gerekti: dünyada hiçbir şeyi değiştirmiyor, dolayısıyla türetilmiş kural onu elerdi ve
iplik yine tek konuşanlı kalırdı.

**1. quest işten açılıyor.** Üç görev, hiç dövüş yok ve sonuncusu bir soru. Kimse elden
vermiyor: oyuncu, günlük tekneden bahsetmeden önce zaten tahtada oluyor. Arc'ın tamamı
bu kural üzerine kurulu.

Kaynağı okuyarak görülemeyecek iki şeyi kontroller yakaladı:

- `data/locations.js` içinde `marrowmoth_seasons` kullanılmış ama yalnızca
  `is_marrowmoth_in_port` import edilmişti. esbuild çözülmemiş bir tanımlayıcıyı runtime
  global sayar; yani derleme de paket de sorunsuz görünürdü ve körfez, bir oyuncu oraya
  ilk adımını attığında hata fırlatırdı.
- İki aksiyon önce `locations["The bay"].actions["id"] = ...` biçiminde, ayrı ayrı
  atamalarla yazılmıştı. `check_action_branches` tek bildirim yerini okuyor, dolayısıyla
  iki aksiyon da ona görünmez oldu — "bir şey şu aksiyonu açıyor ama orada bildirilmemiş"
  dedi. Artık ikisi de mevcut nesne değişmezinin içinde; kontrolün varsaydığı gibi tek
  bir bildirim yeri.

Bir şeyi de testler yakaladı: 2a'nın "hiçbir birim iplik iddia etmiyor" taban varsayımı,
içerik iplik iddia ettiği anda haklı olarak düştü. Artık gerçek olanı doğruluyor —
Marrowmoth ipliğinin birden fazla beat'te ve birden fazla konuşan tarafından
bildirildiğini ve içinden bir şey duyulmadan hiçbir ipliğin çizilmediğini; ki panelin,
oyuncunun gerçekten ne bildiği konusunda dürüst kalmasını sağlayan da bu.

Sayfadan okunmadı, yüklü oyunda ölçüldü: iki aksiyon da körfezde, İlkbahar/Sonbahar
koşuluyla; quest, kaydın tutacağı kimlik altında üç göreve sahip; manifesto ile ipliğin
adı iki dilde de eksik metin olmadan çözülüyor.

### Bir soruşturma tek bir ipliktir, üç ayrı konuşma değil

P-14 Faz 2a; Q-8'in cevabının koda dökülmüş hâli. Brief, soruşturma notlarının bir
yerde durmasını istiyor ve Keşifler'i adlandırıyordu; oysa Keşifler, adının çağrıştırdığı
şey değil. O panel *eşyaları*, her birinin nereden geldiğine göre çiziyor. Lore ise
*oyuncunun duyduğu replikleri*, konuşana göre gruplayarak çiziyor. Yani tek bir tekne
hakkında üç ayrı kişiden öğrenilen altı olgu, üç ayrı adın altına dağılıyor ve tek bir
şeyin çözülmesi gibi değil, üç ayrı konuşma gibi okunuyor. Arıza bu ve eksik bir panel
değil, bir gruplama sorunu.

Bu yüzden `Textline` artık opsiyonel bir `lore_thread` alıyor: ipliği adlandıran bir
metin kimliği. Tek alan, tek dal, kayda hiç dokunmuyor — replikler zaten açılmış olarak
izleniyor. Dışarıda bırakılan seçenek beşinci bir günlük yüzeyiydi; brief onu zaten
eliyordu ve buradaki her kalıcı direktif de onu önlemek için var. Oyunda dört tane
zaten mevcut.

Gruplamayı panel değil `world_index.js` yapıyor; test edilebilir olmasının tek sebebi
de bu — panel bir tarayıcı istiyor, indeks istemiyor. `lore_thread_of(unit)` satırı
değil beat'i okuyor: bir birim birkaç repliği tek bir beat'e katlayabiliyor, dolayısıyla
ipliği adlandıran ilk satır beat'in tamamı adına karar veriyor. `lore_threads(everything)`
grupları ilk göründükleri sırayla döndürüyor; diyaloglar aşağı yukarı oyuncunun onlarla
karşılaştığı sırayla tanımlandığı için bu, oyuncunun onlara rastladığı sıra demek.

İplikli bir beat kendi ipliğinde çiziliyor ve aşağıda konuşanının altında **çizilmiyor**.
İkisinde birden göstermek aynı altı olguyu sayfaya iki kez koymak olurdu; oysa istenen
şey tam olarak "üç konuşma değil, tek bir şey"di. Kimin söylediği zaten girdinin
üzerinde duruyor. Konuşan bazlı başlık da artık yalnızca altında bir şey kaldığında
çiziliyor: boş listenin üstündeki başlık hata gibi okunuyor ve duyulan her şeyin iplikli
olması gayet olağan bir durum.

**`check_lore_threads_resolve`**, Faz 5'in muhafızı; Faz 1'inki gibi öne alındı, aynı
sebeple: ardından gelen içeriği ölçülebilir kılan şey o. İplik olmak ile lore'da
tutulmak birbirinden bağımsız iki karar ve arıza tam burada saklanıyor — bir ipliğe
konup `lore: false` işaretlenen bir satır, gruplama onu görmeden eleniyor; iplik
sessizce bir beat eksik kalıyor, ya da hiç kalmıyor ve başlık hiçbir yerde hata
vermeden yok oluyor. Üç kural: bir iplikteki hiçbir satır `lore: false` olamaz; bir
iplik en az iki beat ister, çünkü kendi başlığının altındaki tek beat, üstüne mobilya
konmuş bir satırdır ve konuşan bazlı liste onu zaten gösteriyordu; ve bir ipliğin
kimliği de diğerleri gibi bir metin kimliğidir, bu yüzden `check_content_text_ids`
artık `lore_thread` alanını da tarıyor ve yerel satırı olmayan bir iplik adı, başlık
olarak kendi kimliğini çizmek yerine hata veriyor.

Negatif test tek seferde dört yönden yapıldı ve yanlarında geçerli iki satırlık bir
iplik de vardı; böylece ayrıştırıcının iplik bulduğu kanıtlandı, hiçbir şey bulmadığı
değil: bir iplikteki `lore: false` satırı, iki ayrı tek satırlık iplik ve yerel satırı
olmayan bir kimlik. Dördü de adlandırıldı.

Gruplamayı dokuz test kapsıyor ve bu testler `world_index.js` ile `data/dialogues.js`
dosyalarını **tek** bir grafiğe yüklüyor; böylece bir replik çalışma anında ipliğe
bağlanabiliyor ve indeks bunu görüyor. İki ayrı yükleme, `src/` dizininin birbiriyle
ilgisiz iki kopyası demek ve hiçbir şey kanıtlamaz — daha önce bir kapı testi çalışan
koda karşı tam bu yüzden düşmüştü. Test edilen durum Q-8'in kendi örneği: iki beat, iki
konuşan, tek konu.

Katlama testinin ilk hâli, yalnızca baş satırı okuyan kasıtlı olarak yanlış bir
uygulamayı da geçiyordu; çünkü iplik baş satıra konmuştu. Artık katlamanın *ikinci*
satırında ve yanlış uygulama dört kontrolü birden düşürüyor. Hatayla hemfikir olan bir
test, hiç test olmamasından daha kötüdür: hatayı onaylar.

Sürüm artmadı: oyunda henüz iplikli hiçbir şey yok, yani panel eskiden ne çiziyorsa onu
çiziyor — testlerin ilk doğruladığı şey de bu. İş listesinde Faz 2 bunu söylemek için
ikiye bölündü. 2b, manifesto ile arc'ın ilk gerçek ipliği ve v0.7.1.

### v0.7.0 - *No Word Sent*: üç yüzey ve hiç bildirim yok

P-14 Faz 1. Briefin kuralı, oyuncunun Marrowmoth'un döndüğünü görev günlüğünden değil
dünyadan öğrenmesiydi; dolayısıyla fazın tamamı, değişen üç şey ve değiştiklerini
duyuran hiçbir şey.

**Pencere İlkbahar ile Sonbahar** ve hangi iki mevsim olduğu yazı tura değildi. Tekne
cezirle çıkıp cezirle dönüyor, yani yılın en büyük gelgit farklarına ihtiyacı var;
onlar da ekinoksların çevresine düşüyor. Faz 4'ün cezir yaklaşımının zamanlanacağı çift
de aynısı, yani seçim kendini iki kez ödüyor.

Pencere, hiçbir şey import etmeyen `src/data/marrowmoth.js` içinde. Üç modül onu
okuyor — raf için `traders.js`, rıhtım için `data/locations.js`, söylenti için
`data/dialogues.js` — ve üçü de zaten tasarım gereği döngüsel bir grafiğin içinde
oturuyor; bir yapraktan sabit okumak hiçbir kenar eklemiyor. `registries.js` de tam
bunun için var. Alternatif, aynı iki mevsimlik listenin üç ayrı kopyasıydı ve kayan
kopya sessizce bozardı: hiç açılmayan bir mevsim kapısı, kimsenin henüz ulaşmadığı
içerikle birebir aynı görünüyor. Bu bir dünya-olayı çatısı değil, tek bir teknenin
tarifesi; Q-10 çatıyı kapsam dışı bırakmıştı.

**Raf.** `inventory_templates["Bay in port"]`, `"Bay"` listesinin uzaktan gelen
yarısının kesinleşmiş hâli: bu ülkede kimsenin çıkarmadığı beyaz ve siyah demir cevheri
üçte bir ihtimal ve üç çuvaldan kesinliğe ve on altıya çıkıyor; külçeler ile deri ise
aşağı yukarı ikiye katlanıyor. Satılan yeni hiçbir şey yok, mesele de bu: yazın buraya
kadar yürüyüp en arkada iki çuval bulan oyuncu, sonbaharda gelip yerin tamamını kaplı
buluyor. Fiyatlara dokunulmadı; bolluğun nakliyeyi ucuzlattığı yok.

Q-10'un işaret ettiği tehlike tam da burada. `inventory_template` kayda **yazılmıyor**,
yani tüccara geçirilen bir liste sekme kapanana kadar yaşar, sonra sessizce eski hâline
dönerdi — sahibin sevdiği eşyaları kaybettiren hatanın aynı biçimi. Bu yüzden alan
artık ad kadar fonksiyon da kabul ediyor ve körfezinki listeyi her yenilemede mevsimden
türetiyor. Kararı her seferinde dünya veriyor, kaydın ise konuyla ilgili hiçbir fikri
olmuyor.

**Rıhtım.** Mevsiminde dört fon repliği; mevcut altısının yerine geçmiyor, aralarına
karışıyor, çünkü yanında kırk tonluk bir tekne olan liman aynı liman, sadece içinde
daha çok şey dönüyor. Dördünün hiçbiri tekneyi adıyla anmıyor: en dipteki babadan
öteye halatla yanaşan bir tekne; *kırk, bu dipte* diyen biri; yükü kimin indireceğini
çözemeyen iki kişi; ve hep birden suyun bir yakasına geçmiş martılar. Yerine konmak
yerine eklendi, çünkü buraya sonbaharda hiç gelmemiş bir oyuncunun kıyaslayacağı bir
şey yok; değişikliğin "farklı" değil "daha çok" diye okunması gerekiyor.

**Söylenti.** Lonca kâtibi, üçü içinde adı söyleyen tek yüzey; böylece diğer ikisini
görmüş olan oyuncu buraya cevap almaya değil, soruyla geliyor. Yılda iki kez yanaşıp
hiçbir şey asmayan bir tekneden çıkacak işi yok, yazmayı bırakmış ve hesabı kime
göndereceğini merak ediyor. `locks_lines` yok, bilerek: söylenti, tekne limandayken
panoda duran, gittiğinde kaybolan bir şey; mekanizmanın tamamı mevsim kapısı. Hiçbir
quest başlatmıyor — 1. quest keşiften açılıyor, tersi değil, ve o Faz 2'nin işi.

**İki muhafız eklenmedi, büyütüldü.** İkisi de var oldukları şeyi sessizce kapsamayı
bırakmıştı; bu proje en sık bu arızayı buluyor:

- `check_trader_stock_lists` yalnızca açıkça yazılmış tek bir şablon adı okuyordu;
  körfezinki fonksiyona dönünce sayı 8 tüccardan 7'ye düştü ve kontrol yine geçti.
  Artık değer ifadesinin tamamını nasıl yazılmış olursa olsun okuyor — iki liste
  adlandıran bir ternary, iki ad demek — ve `src/` altında `inventory_template` alanına
  yapılan **her** atamayı reddediyor; tek istisna olarak kurucununki adıyla anılıyor.
  Bu, Q-10'un "saklama" kuralının hatırlanan değil mekanik hâli. İlk kalıp çıplak bir
  tanımlayıcı üzerine demirlenmişti ve köşeli parantezle yapılan bir atamanın yanından
  geçip gidiyordu; negatif test bunu yakaladı.
- `check_seasonal_content_is_reachable` üç adlı dosya ve tek bir koşul biçimi okuyordu.
  Arc'ın kendi penceresi ise dördüncü bir dosyadaki bir sabit; yani bütün bunların ne
  zaman olacağına karar veren tek yer, denetlenmeyen tek yerdi. Artık `src/` altındaki
  her dosyayı ve adlandırılmış her mevsim listesini okuyor: bir `*seasons` bildirimi ya
  da bir `*seasons:` özelliği — ki `availability_seasons` zaten oydu. 54 dosyada 25
  mevsim adı.

Negatif test tek seferde üç yönden, üç ayrı dosyada yapıldı: `marrowmoth.js` içinde
yanlış yazılmış bir mevsim, türetilmiş şablon fonksiyonunun içinde var olmayan bir stok
listesi ve bir tüccara saklanan bir şablon. Üçü de adlandırıldı. Pencerenin kendisini
yedi test kapsıyor; aralarında tam olarak iki mevsimi boş bıraktığı da var, çünkü yılda
iki kez, iki kez demek zorunda.

Akıl yürütülmedi, ölçüldü: iki stok listesi de on dörder satırla yerinde, tüccarın
alanı gerçekten bir fonksiyon ve yüklem İlkbahar ile Sonbaharda doğru, diğer ikisinde
yanlış dönüyor.

### Mevsim koşulu iki mevsim adlandırabiliyor, yanlış yazılmış mevsim artık yayına çıkamıyor

P-14'ün Faz 1'i için zemin işi; Marrowmoth'un yılda iki kez limana döndüğü faz.
Q-10 bunu iki mevsim ve sıfır zamanlayıcı olarak karara bağlamıştı: mevsimler
kendiliğinden dönüyor, dolayısıyla tekrarlayan bir pencere, pencerenin iki yarısını da
adlandırabilen bir koşuldan başka hiçbir şeye mal olmuyor. `season: {yes}` ve
`season: {not}` ise tam olarak bir mevsim adlandırabiliyordu.

Artık tek bir mevsim ya da mevsim listesi alıyorlar. Değiştirilmedi, genişletildi;
iki sebeple. Tek metinli biçim, içeriğin hâlihazırda kullandığı biçim — tedarikçinin
`troubled` ve `troubled unavailable` replikleri bir `not: "Winter"` / `yes: "Winter"`
çifti — ve başka içeriğin dayandığı bir koşulu altından çekip almak yanlış iş
olurdu. İkincisi, birden çok mevsimi adlandırmanın yolu bu projede zaten liste: bir
Activity'nin `availability_seasons` alanı fork'tan da eski. Aynı fikir için üçüncü bir
yazım uydurmak, buradaki her direktifin önlemek için var olduğu paralel sistem olurdu.

On dört test iki biçimi de sabitliyor; testler takımın `src/conditions.js`
bölümünde, ki orada hiç mevsim kapsamı yoktu — oradaki stub `season` özelliği olan
ama `getSeason()` metodu olmayan bir `current_game_time` taşıyordu, yani herhangi bir
mevsim kapısı hata fırlatırdı. Tek mevsim karşılaştırması geri konarak negatif test
edildi: on dördün beşi düşüyor, aralarında yılda iki kez penceresinin iki yarısı ve
tek elemanlı liste de var.

`check_seasonal_content_is_reachable` fazın kendi muhafızı; fazın geri kalanını
ölçülebilir kılan şey o olduğu için öne alındı. Mevsim adı, `getSeason()` ile
karşılaştırılan bir metin; yani bir yazım hatası sessizce ve iki ayrı yönde
bozuyor: yanlış yazılmış bir `yes`, yazılmış, çevrilmiş, yayınlanmış ve bir kez bile
ulaşılamamış içerik demek; yanlış yazılmış bir `not` ise hiçbir şeyi dışarıda
bırakmıyor ve kapıyı sonsuza kadar açık tutuyor. `availability_seasons` aynı hatanın
başka adlı hâli — bir işi sessizce yılın tamamında açık bırakıyor — o da okunuyor.
Mevsim listesi yeniden yazılmak yerine `game_time.js` içinden geliyor, böylece kontrol
denetlediği oyundan uzaklaşamıyor. Üç dosyada 23 mevsim adı, hepsi gerçek.

Negatif test iki dosyada dört yönden yapıldı, çünkü tek yerdeki tek yazım hatası
yalnızca örneği kanıtlardı: yanlış yazılmış bir `yes`, yanlış yazılmış bir `not`,
yanlış yazılmış bir `availability_seasons` girdisi ve boş bir liste. Dördü de
adlandırıldı; ayrıca özet satırı artık ortada hata dururken her şeyin yolunda
olduğunu iddia etmiyor.

Sürüm artmadı: henüz hiçbir içerik iki mevsim adlandırmıyor ve mevcut tek mevsimli
kapıların hepsi eskisi gibi davranıyor. İş listesinde Faz 1 bunu söylemek için ikiye
bölündü: 1a bu; 1b ise tuz evinin rafı, körfezin fon replikleri ve loncanın
söylentisi — oyuncunun gördüğü ve v0.7.0 olarak yayınlanacak olan kısım.

### Marrowmoth'un dört kararı, onları soran önerinin içine taşındı

P-14'ün Faz 0'ı zemin fazı: hikâye yok, tek işi kendisinden sonraki fazları
ölçülebilir kılmak. Dört maddesinin üçü koddan çok kaydın kendisiyle ilgili çıktı;
yalnızca biri işti.

Q-7 ile Q-10 karara bağlanmış ama **Bekleyen kararlar** başlığı altında bırakılmıştı;
cevaplanmış bir sorunun duracağı yer orası değil. O bölüm projenin tamamını
ilgilendiriyor — Q-1 ile Q-6 fork'un yaptığı her şeyi kısıtlıyor — oysa bu dördü
birer fazı kısıtlıyor ve P-14'ü okuyan biri, Faz 3'ün neyi varsayabileceğini öğrenmek
için öneriden çıkıp geri dönmek zorunda kalıyordu. Artık P-14'ün içinde
`#### Fazlara taşınan kararlar` başlığı altındalar ve her başlık onu harcayan fazı
anıyor: Q-10'u Faz 1, Q-8'i Faz 2 (Faz 3 ve 5 de üstüne kuruyor), Q-7'yi Faz 3,
Q-9'u Faz 4. Numaralar korundu; onları anan commit'ler ve changelog girdileri hâlâ
çözülüyor. Fazlar da artık dayandıkları cevabı bir çapraz referansla göstermek yerine
kendi paragraflarında söylüyor.

Kalan üç madde yapılarak değil, ölçülerek kapandı:

- **Yanılan dosya STATUS'tü**, PROPOSALS değil: 48. madde de P-13/35 de kapanmıştı ve
  hâlâ "devam ediyor" listesindeydi. Bu da okuyanı, iş listesinde bulunmayan
  önerilerin peşine düşürüyordu. Düzeltme ipucu işiyle birlikte inmişti; Faz 0'a
  düşen tek şey, düzeltmenin hangi yöne gittiğini kayda geçirmekti.
- **İpucu göstermeyen iki quest task'ı yeniden üretilemiyor.** Raporun altındaki
  boşluk gerçekti ve onu `check_hints_say_when_they_cannot_point` tutuyor.
- **Eksik iki malzeme satırı eksik değil.** Öyle diyen girdiye güvenilmedi, yeniden
  ölçüldü: `White short blade` gerçek bir registry anahtarı, `name_parts` alanı
  `material name white steel` ile `component short blade` kimliklerine çözülüyor ve
  iki satır da hem `locales/english.js` hem `locales/turkish.js` içinde duruyor —
  siyah çelik çifti de öyle. `white steel` tanımı `name: "white"` taşıdığı için
  anahtar ile kurulan görünen ad birbirini tutuyor; `check_generated_items` bu yüzden
  ikisini de itirazsız doğruluyor. 5. kademeyi tıkayan şey tarifler, başka bir şey
  değil.

P-14 artık `open` değil `active` ve sıradaki faz, *No Word Sent* olan Faz 1. STATUS
da aynısını söylüyor; okuma sırası bölümü de duran direktiflerin D-8'de bittiğini
iddia etmeyi bıraktı — dokuz tane var.

### Cümlenin altındaki `---` bir başlıktır, bizde de iki tane vardı

Yukarıdaki kayıt düzeltmesi sırasında bulundu; zaten başka türlü de bulunmazdı:
**Bekleyen kararlar** başlığından önceki `---`, PROPOSALS'ın iki dilinde de P-14'ün
son cümlesinin hemen altında duruyordu. Markdown, boş olmayan bir satırın altındaki
tire dizisini setext altçizgisi olarak okur; yani o cümle yazıldığı günden beri her
görüntüleyicide `<h2>` olarak çiziliyordu ve kaynakta bakınca kusursuz görünüyordu.
Diff de göstermiyor: iki durum arasındaki tek fark bir boş satır.

D-8 örneği değil sınıfı istiyor, o yüzden `check_thematic_breaks_are_not_headings`
izlenen bütün markdown dosyalarını okuyor ve yalnızca `-` ya da yalnızca `=`
karakterlerinden oluşan her satırın üstünde bir boş satır arıyor. Kod blokları
atlanıyor, çünkü markdown orayı ayrıştırmıyor; tablo ayraç satırları ise `|` ile
başladığı için testin önüne hiç gelmiyor. On sekiz dosyada altmış iki çizgi, hepsi
başlık değil çizgi.

Negatif test bir değil üç yönden yapıldı, çünkü yalnızca kendi yazıldığı örneği
yakalayan bir muhafız muhafız değildir: boş satır, kusurun hiç bulunmadığı bir dosya
olan `STATUS.md`'den çıkarıldı ve kontrol onu söyledi; asıl kusur `PROPOSALS.TR.md`
içine geri kondu, onu da söyledi; ve boş olmayan bir satırın hemen altında, kod bloğu
içinde bir `---` denendi — onu doğru şekilde görmezden geldi, saymadı da.

---

## 2026-08-30

### Ajanın kendi loop talimatı git'in dışında kalıyor

`.claude/` artık yoksayılıyor. İçinde geliştirme döngüsünün talimat dosyası ve
bir harness'ın yanına yazdığı yerel ayarlar duruyor.

Sebep düzen tutkusu değil. `.loop.md` Türkçe yazılmış, D-3 ise *izlenen* her
markdown dosyasını `NAME.md` / `NAME.TR.md` çiftine ve aynı `doc-version`
değerine bağlıyor. O dizini commit etmek `check_docs_are_paired`'in bir
`.loop.TR.md` istemesine yol açardı - yani loop'un kendi talimat dosyası,
loop'un geçmek için var olduğu kalite kapısından kalırdı. İngilizce kanonik +
Türkçe çeviri biçimi, tek bir ajanın çalışma emri olan bir dosya için yanlış
biçim.

Loop dosyasının kendisi de değiştirildi: orada duran genel bir şablondu ve bu
repository hakkında söylediklerinin çoğu burada doğru değildi. Düzeltmeler,
maliyet sırasıyla:

- Bitmiş bir proposal'ı `done` işaretleyip `PROPOSALS.md` içinde bırakmayı
  söylüyordu. `check_docs_are_paired` tam olarak bunu hata olarak bildiriyor
  (D-9: `CHANGELOG.md` içine yaz ve dosyadan çıkar), yani loop bir şey
  bitirdiği her iterasyonda kendi kapısından kalacaktı.
- `docs/TODO.md`'yi iş kuyruğu sayıyor ve `PROPOSALS.md`'nin üstüne
  koyuyordu. O dosyada checkbox yok ve izlenmiyor, yani işaretlenecek bir şey
  de yok - ayrıca sahibi brief'i zaten ölçüp P-14 olarak yazdı. Brief'ten
  çalışmak, verilmiş kararları yeniden türetmek ve kodda olmayan şeylere göre
  davranmak olurdu: guild standing yok, lockpicking yok, navigation skill'i yok.
- Hiçbir şeyin Türkçe yarısından ya da `doc-version`'dan söz etmiyordu. İkisi de
  zorunlu.
- Bloklanmış madde için `// SORU:` diye bir yorum biçimi uyduruyordu. Projenin
  kendi kuralı var - `blocked` durumu ve **Open decisions** altında numaralı
  `Q-n` - ve Q-7 ile Q-10 şu an `PROPOSED`, yani kararsız; P-14'ün Faz 0'ı da
  önce bunların çözülmesini istiyor.
- Sürüm kuralı tek muğlak paragraftı. Artık iki kol: bakım yalnızca
  `docs/CHANGELOG.md` ve Türkçe yarısına dokunur, `game_version.js`,
  `package.json` ve iki changelog HTML'ini rahat bırakır; oyuncuyu etkileyen iş
  iki sürüm dosyasını da yükseltir ve iki HTML girdisini de ekler. Simetri
  zorunlu - `npm run check`, iki HTML kopyanın da güncel `game_version` için
  girdi taşımasını şart koşuyor.

Dosya ayrıca bu oturumda bizzat çarpılan tuzakları taşıyor: `LOCALE_STRICT=1`
bash sözdizimidir ve PowerShell'de `$env:` gerekir, `npm run build` bir test
sunucusu `_site`'ı tutarken EBUSY ile düşer, esbuild çözülmemiş bir
tanımlayıcıyı runtime global sayar ve `git checkout <dosya>` kendi çalışmanı
sessizce siler - bugün bir negatif testin ortasında `style.css` böyle kayboldu.

### İpucu göstermeyen iki görev adımı yok; altlarındaki açık vardı

STATUS, "iki görev adımı günlükte ipucu göstermiyor" maddesini oyun çalışırken ölçüm
bekleyen açık bir iş olarak taşıyordu. Kaynağa değil, sahibin kendi dışa aktarımlarına
karşı ölçüldü: hem 2026-08-29'da hem 2026-08-30'da her aktif görevin güncel adımı tam
olarak bir adlandırılmış yere çözülüyor. İpucusuz çizilen hiçbir şey yok.

Yapısal olarak da olamaz. Günlük ipucunu iki yoldan kuruyor — sayan bir adım için
`create_quest_hint`, saymayan için `create_quest_step_hint` — ve görünür bir görevden
yalnızca ikincisine ulaşılabiliyor. Yaşayan beş `task_condition` bloğunun hepsi iki
gizli göreve ait ve gizli görev günlüğe hiç çıkmıyor; `Test quest` ise yorum satırında.
Bildirim, "başka bir yerde" satırı eklenmeden önce doğruydu ve o gün bugündür bayat.

Kaydı doğru okumak iki denemede oldu, ilki yanlıştı. `task_status` adım başına bir
boolean değil: güncel bitmemiş adım **dâhil** olmak üzere `{is_finished: true}`
tutuyor ve o son girdi bunun yerine `{progress}` taşıyor — yani uzunluğunun bir eksiği
oyuncunun gerçekte nerede olduğu. Boolean gibi okununca her girdi doğru sayılıyor ve iki
dışa aktarımda üç görev bitmiş-ama-aktif gibi görünüyor. Değiller; son adımlarındalar.

**Gerçek olan neydi.** Geri dönüş yalnızca `create_quest_step_hint`'te vardı. Eşi,
sayan bir adımın andığı bölgelerin hepsi henüz bulunmamışken hiçbir şey döndürmüyordu;
yani bir kill sayan ilk görünür görev, altında tek satır olmayan bir 0/10 gösterecekti —
geri dönüşün yazılma sebebi olan durumun ta kendisi, öteki yolda bekliyordu. İkisi artık
tek bir `create_hint_elsewhere_line` paylaşıyor.

`check_hints_say_when_they_cannot_point` ikisini bir arada tutuyor; Q-6'nın dil
değiştirme için koyduğu kuralla: bu işi yapmak zorunda olan yerleri adıyla say ve biri
bıraktığında düş. İki kurucunun da ortak satıra ulaşmasını ve locale kimliğinin yalnızca
onun içinde yaşamasını şart koşuyor; çünkü ikisinin ilk etapta birbirinden ayrılma
sebebi, satır içine kopyalanmış ikinci bir nüshaydı. İki yönden negatif test edildi:
geri dönüş bir kurucudan çıkarıldı ve kimliğin ikinci bir kopyası ötekine gömüldü.

### Çalışma listesi, var olmayan bir tıkacı anlatıyordu

P-12, 5. kademeyi iki eksik locale satırına bağlı sayıyordu — `material white` ve
`material black` — yani beyaz çelik bir bileşenin adını alacağı yer yoktu. İki
yarısı da yanlış. Üretici `material white` değil `material name white steel`
istiyor ve o satır diğer otuz yediyle birlikte en başından beri iki dilde de
duruyor. Asıl eksik olan bütün tarifler: `crafting_component_filling.js` 36 tane
beyaz çelik ve siyah çelik bileşeni kuruyor ve oyunda hiçbir şey bunlardan tekini
bile üretmiyor.

Yanlış tıkacı anlatan bir liste maddesi, onu eline alan kişiye aynı ölçümü iki kez
yaptırır; o yüzden ölçüm artık bir cümle değil, bir kontrol.
`check_components_can_be_made` oku `check_recipe_item_names`'in tersine okuyor:
"bu tarif gerçek bir eşyayı mı anıyor" değil, "bu üretilmiş eşyaya hiçbir şekilde
ulaşılabiliyor mu" — tarifle, tüccarla, düşman düşürmesiyle ya da ödülle. 203'ün
159'una ulaşılıyor. Ulaşılamayan 44'ü gerekçesiyle listeli ve liste iki yönde birden
zorunlu tutuluyor: bir ad, onu üreten bir şey çıktıktan sonra listede kalamıyor ve
üreticinin kurmadığı bir şey için listeye eklenemiyor.

5. kademenin ötesinde kimsenin fark etmediği sekiz tane buldu: `Wool shoes`,
`Linen shoes`, `Turtleshell shield handle` ve tariflerin asıl andığı elle yazılmış
`Turtleshell` parçalarını tekrarlayan beş `Turtle shellplate` zırh parçası.
Sekizi de, hiçbir tarifin yazılmadığı bir bileşen türünü listeleyen bir malzeme —
bir `types` dizisini genişletmek tam olarak bunu sessizce yapar; eşyaların çalışma
anında maliyeti yok ve oyunda görünmüyorlar, birikmelerinin sebebi de bu.

Üç yönden negatif test edildi: yaşayan bir 4. kademe tarif satırı kaldırıldı,
listeye üreticinin kurmadığı bir ad eklendi ve listedeki bir ada tarif verildi. Her
biri kendi cümlesiyle düşüyor.

**Bir de durum dosyası bitmiş işi anlatıyordu.** `Devam eden işler` bölümü, 48.
madde ile P-13/35 kapandıktan sonra da onları listeliyordu; bu da okuyucuyu çalışma
listesinde olmayan önerileri aramaya gönderiyor. Artık P-14 ile P-12'yi listeliyor
ve biten bir maddenin nerede durduğunu söylüyor.

### Günlük panelleri, alta saran bir sekme çubuğuna göre boyutlandırılmıştı

**v0.6.72.** Üç kez bildirildi: unvanlar, keşifler ve görev listesi günlüğün alt
kenarını aşıp altındaki beceriler kutusunun üzerine basıyor, ayrıca görev listesi
kendi "tamamlananları gizle" çubuğunun altına giriyordu.

Sebep tek. Sekme çubuğunun altındaki her şey, o çubuğun boyuna dair bir tahmine
göre boyutlandırılmıştı:

```
#journal_div          height: 330px
#journal_content_div  height: 287px   <- 330 eksi 43px'lik çubuk
paneller              height: 284px
```

Çalışan oyunda ölçüldü: yedi sekmeyle çubuk **üç satır ve 72px** yer kaplıyor, tek
satır ve 43px değil. 330px'lik günlüğe karşı 287 + 72 = 329, yani her panel alttan
~18px dışarı taşıyor ve bu zincirde hiçbir şey kırpmıyor. v0.6.69'da eklenen
Unvanlar sekmesi çubuğu üçüncü satıra itmiş - bir sekme gizlenerek kanıtlandı:
çubuk iki satıra düşüyor, taşma tam olarak sıfırlanıyor.

Sayılar kaldırıldı: `#journal_div` bir sütun, içerik çubuktan geriye kalanı alıyor,
paneller de onun %100'ü. Baştan sona `min-height: 0`, ki içteki kayan listeler
küçülebilsin, kendi yüksekliklerini ağaçta yukarı doğru dayatmasın.

Görev çubuğu aynı hatanın küçük hâliydi. `position: absolute` ve `bottom: 0`; en
yakın konumlanmış atası görev kutusu değil `#journal_div`, dolayısıyla çubuk
günlüğün alt kenarına çakılıyken üstündeki liste kendi yüksekliğini koruyordu.
Artık sütunun son satırı ve kutu yerine `#quest_list` kayıyor: kutu kaymaya devam
etseydi çubuk da içerikle birlikte kayıp giderdi.

İki farklı pencere boyutunda, gerçek bir kayıtla doğrulandı: yedi panel de
günlüğün 2px içinde, çubuk 2px içinde, görev listesi sonuna kadar kaydırıldığında
listenin altı çubuğun üstüyle tam olarak buluşuyor.

**Kontrol, ve kontroldeki kör nokta.**
`check_journal_panels_are_styled`, her panele yükseklik verilmiş mi ve içinde kayan
bir şey var mı diye soruyordu. Burada ikisi de doğruydu - yükseklik yalnızca başka
bir düzene ait bir sayıydı. Artık günlük panellerinde ve içerik div'inde piksel
cinsinden yüksekliği reddediyor; çünkü bu her zaman, alta saran bir çubuğa dair bir
tahmindir.

Bunu yazarken kontrolün kendisindeki ikinci bir kusur ortaya çıktı: her panelin
listesini `${panel}_list` diye tahmin ediyordu, ki görevler sekmesi için bu yanlış -
`#quest_list`, tekil. O sırada kutu kaydığı için ıska bir şeye mal olmamış ve
kaydırma listeye taşınana kadar görünmez kalmıştı. Artık kimlikleri işaretlemeden
okuyor. Üç yönden negatif test edildi: 287px geri konarak, `#quest_list`'in
kaydırması alınarak ve bir sekme gizlenerek.

### Bir kaydın kaybettiği görev ilerlemesi için bir araç

`node scripts/restore-quests.js <yeni-kayit.txt> <eski-kayit.txt>`

30 Ağustos 2026'daki iki dışa aktarım arasında bir kayıt, görev bloğu düzleşmiş
hâlde geri geldi - her görevde `is_active` false, `is_finished` false,
`task_status` boş - karakterin geri kalanına ise dokunulmamıştı. Dışa aktarımlar
üzerinden ölçüldü: 08-29 22:23'te 14 tamamlanmış görev ve 18'inde adım ilerlemesi
var; aynı karakterin daha fazla tecrübeye sahip 08-30 01:44 kaydında 1 ve 2.

Sebep giderildi ve yuvarlak testi temiz: o kaydı yükleyip doğrudan geri yazmak 14
tamamlanmış, 4 aktif, 18'inde adım ilerlemesi döndürüyor, hiçbir şey kaybolmuyor.
Ama hata etkinken yazılmış bir kayıt kaybı ileriye taşıyor; eski dışa aktarımı
yeniden oynamak ise o günden beri kazanılan her şeyi geri veriyor.

Birleştirme hiçbir ilerlemeyi geri almaz - `is_finished` iki kayıttan birinde true
ise kazanır, `is_active` de öyle (görev zaten tamamlanmadıysa), `task_status` ise
indeks indeks birleşir - yani sağlıklı bir çiftte hiçbir şey yapmaz ve her çiftte
tekrar çalıştırılabilir. `task_status` konumsaldır ve görevler o günden beri yeni
adımlar kazandı; bu yüzden dizi, iki kayda değil *güncel* tanıma göre eşlenir:
fazla girdiler atılır, eksikler false ile tamamlanır.

### Özgün oyuna oyunun içinden bağlantı, ve çevrilmeyi öğrenen ipuçları

**v0.6.71.** Köşede tek bir GitHub işareti vardı, bu çatallamanınki. Devam
ettirdiği proje yardım sayfasında anılıyordu ama oyunun kendisinden
erişilemiyordu; artık iki işaret var ve özgün oyununki, üzerine gelinene kadar
%50 solukta duruyor - yan yana duran iki aynı logo, hangisinin hangi depoyu
açtığını söylemez.

Gerisini ipucu yazısının taşıması gerekiyordu, taşıyamıyordu: o `title`
öznitelikleri çeviri sisteminin tümüyle dışındaydı ve oyunun dili ne olursa
olsun İngilizce kalıyordu. `translateUI`, bir girdinin yönergesine
`data-translation-placeholder` ile tam da bu yüzden uzanıyor; ipucu yazısı da
aynı durum, bu yüzden yanına `data-translation-title` katıldı. Köşedeki üç
simgenin de artık böyle bir özniteliği var ve üçü de çevriliyor.

CSS'ten akıl yürütmek yerine çalışan oyunda ölçüldü: üç simge sağdan 98 / 56 /
14 uzaklıkta, yaklaşık 39px genişlikte, çakışma yok; Türkçeye geçince üçünün de
başlığı diakritikleri bozulmadan yeniden çiziliyor.

**Kontrol.** Bir kimliğin bir locale'de eksik olması İngilizceye düşer,
güvenlidir. *Hiçbir* locale'de olmaması hiçbir şeye düşer ve `getText`,
arayüze düpedüz `text not found, id: ui link repo` yazar. Bunu arayan yoktu:
`locales.mjs` locale'leri birbiriyle karşılaştırır, dolayısıyla HTML'de
yapılan bir yazım hatası ona görünmez - iki locale de birbiriyle uyumludur ve
ekranda duran, ikisinde de olmayan kimliktir. `check_ui_ids_exist` üç
özniteliği de her sayfada okuyor. Yeni kimlik yanlış yazılarak negatif test
edildi; 5 sayfada 124 arayüz metin kimliği, hepsi yerinde.

### Eşleştirme kuralı, deponun göndermediği dosyaları da sorguluyordu

`check_docs_are_paired` ağacı markdown için tarıyor ve kendi yorumu sonuca
"izlenir görünen her .md dosyası" diyordu. Git'e hiç sormamıştı. Dolayısıyla
çalışma ağacında duran, henüz eklenmemiş bir taslak - sonraki bir oturumun
planı, yarısı yazılmış bir dosya - henüz sahip olması gerekmeyen bir Türkçe
eşi yok diye D-3'ten kalıyordu.

Artık soruyor. `git ls-files` indeksi okuduğu için yeni bir belge kuralın
kapsamına commit edildiği anda değil, sahnelendiği anda giriyor; doğru sınır da
bu: onu bizim yapan şey sahnelenmesi. Git yoksa - diyelim bir tarball - tarama
eskisi gibi çalışıyor. İki yönden de negatif test edildi: sahnelenmemiş taslak
görmezden geliniyor, aynı dosya sahnelenince anında kalıyor.

### Upstream'in ağacında dört kırık import, ve onları bulan kontrol

[PR #244](https://github.com/miktaew/yet-another-idle-rpg-dev/pull/244) olarak
sunuldu.

Oradaki `src/mods/glassmaking.js`, `../locations.js` ve `../traders.js`'ten
import ediyor; ikisi de artık yok. `locations` `src/data/` altına,
`LocationActivity` `src/models/location.js`'e, `TradeItem`
`src/models/trade_item.js`'e taşınmış, `inventory_templates` ise
`src/data/inventory_templates.js`'in *varsayılan* dışa aktarımı olmuş. Dördü de
çözülemiyor ve mod bir süredir yüklenebilir değil. Ayrıca `src/data/npcs.js`,
dosyanın adı `npc.js` iken `../models/NPC.js` istiyor - Windows ve macOS'ta
sorunsuz, Linux'ta hiçbir şey.

İlk grubu bizim `check_imports_resolve`'umuz buldu. İkincisini bulamadı ve bunu
kaydetmeye değer: `fs.existsSync` burada büyük/küçük harfe duyarsız yanıt
veriyor, yani kontrol, hatayı yazan makinede hatayla hemfikirdi. Upstream'e
gönderilen bağımsız kopya bunun yerine dizin listesini yürüyor ve her yerde
aynı yanıtı veriyor; ayrıca yalnızca `{ isimli }` listeleri değil, importun
*her* biçimini okuyor - harf hatası, süslü parantezi olmayan düz bir varsayılan
importtu, yani yalnızca süslü parantez arayan bir eşleştirici onun yanından
geçip gider. İki boşluk da onlarınki kadar bizimdi. Upstream'in ağacında 53
dosyada 492 import edilmiş isim, yanlış pozitif yok.
### Kayıt yüklenmez oldu; görmesi gereken kontrol de kördü

**v0.6.55.** "Görevler tamamen bozuldu, boş geliyor" diye bir `ReferenceError`'la, ayrıca
favorilenen yerlerin hızlı yolculuktan kaybolması olarak bildirildi. İkisinin de tek
sebebi vardı: bir önceki sürümde kaydetme/yüklemeyi `save_load.js`'e taşırken
`effect_templates` kullanılıyor ama içe aktarılmıyor kalmıştı. esbuild, çözülmemiş bir
tanımlayıcıyı çalışma zamanındaki bir genel değişkene yapılmış geçerli bir gönderme
sayar; bu yüzden paket derlendi, bütün kontroller geçti ve hata ancak bir oyuncu kaydını
yüklediğinde çıktı - `load()` içinde o satırdan sonraki her şeyi, favoriler dâhil,
beraberinde götürerek.

`check_modules_import_what_they_call` tam da bunun için vardı ve tetiklenmedi; çünkü
yalnızca *çağrı* konumundaki adlara bakıyordu, `effect_templates[effect]` ise bir indis.
Genişletme, doğru sonuca varmadan önce iki kez yanlış gitti ve ikisi de saklanmaya değer:

- `onclick` işaretlemesini atlamak için önce tırnaklı metinleri sıyırmak, altı bin satır
  boyunca tek bir dengesiz tırnakla senkronu kaybediyor ve iki gerçek eksik içe
  aktarmayı sessizce yakalamaz oluyor;
- genişletilmiş eşleyicinin kendi geriye bakışı, `(?<![.\w$])`, tam da yakalamak için
  eklendiği göndermeyi reddediyor: `{...effect_templates[effect]}` adın hemen önüne bir
  nokta koyar ve `...` açıkça geçirilmedikçe yayılma, özellik erişiminden ayırt
  edilemez.

**İkinci bir hata; birincisi ölçülürken bulundu ve hiç bildirilmemişti.** Aynı ayrım
`last_combat_location`'ı her yerde `game_state.last_combat_location` yaptı - tırnak
içindeki iki kayıt anahtarının içi dâhil. Kayıt, yükleyicinin okumadığı bir adla yazdı,
değer `undefined` döndü ve bir sonraki kayıt anahtarı dosyadan büsbütün düşürdü. Hiçbir
şey yüksek sesle bozulmadı. Ancak sahibinin günler arayla aldığı iki dışa aktarma
karşılaştırılınca ortaya çıktı: `favourite_locations` 10 -> 0, `enemy_killcount` 25 -> 0,
yatak ve dövüş konumları da yok. `check_save_keys_round_trip` artık kaydın yazdığı her
anahtarın yüklemenin okuduğu bir anahtar olmasını şart koşuyor - 53'e 53.

İkisi de kaynaktan akıl yürütülerek değil, sahibinin gerçek kaydıyla tarayıcıda
doğrulandı: yedi görev çiziliyor, iki favori de geri geliyor.

### İtibar, mekânların harcadığı bir para birimine dönüşüyor

**v0.6.57, v0.6.58, v0.6.59.** Tek satır yazılmadan önce ölçüldü: hikâye boyunca 610 Köy,
350 Kenar mahalle ve 320 Kasaba itibarı kazanılabiliyor; dört diyalog satırı buna bakıyor;
**hiçbir aksiyon bakmıyordu**; ve Kenar mahalleyi bir tüccarın kâr payı dışında hiçbir şey
geri okumuyordu. Yani oyuncu kenar mahallede 350 itibar biriktirebiliyordu ve bunun tek
yaptığı şey bir fiyattan birkaç kuruş kırmaktı.

Artık altı yerleşim aksiyonu onu okuyor ve altısı da o mekânların yanına eklenmedi, zaten
oldukları şeyden kuruldu. Kenar mahallede, 100 / 200 / 300'de: kâhyanın P-11'de açtığı
terazili baraka, çete gittiğinden beri kendi gecesini kendi bekleyen sokak, ve kasaba
kapısında birine kefil olmak - oyunda kenar mahalle itibarını kasaba itibarına çeviren
ilk şey, ve kapının arkasında hiçbir şey açmıyor. Kasaba meydanında, 50 / 150 / 250'de:
çeşmedeki güvercinler, gazete tellalı ve konum var olduğundan beri birbirine bayat diyen
iki ekmekçi; hepsi arka plan seslerindeydi ve hiçbiri oyuncunun katılabileceği bir şey
değildi.

İki konuşma **yalnızca** itibarla açılıyor - görev yok, kilit açma yok. Meydandaki
komisyoncu bir itibara da buğdaya biçtiği gibi fiyat biçiyor; kenar mahallenin yaşlı
kadını sokağın nöbet listesinin ne ettiğini değil neye mal olduğunu söylüyor. İkisi de
hiçbir şeyi çözmüyor - bu çatalın açmadığı gizemlere dair kural gereği.

### display.js, 7.057 satırdan 5.273'e

**v0.6.62, v0.6.63, v0.6.65**; öncesinde **v0.6.54** kaydetme/yüklemeyi `main.js`'ten
çıkarmıştı. Dört kesme; her biri iki sayı ölçülerek seçildi - taşınan kodun kalanlardan
kaç ada ihtiyacı var ve kalan kodun geri kaç ada ihtiyacı var - çünkü döngüyü yaratan
ikincisidir.

| modül | satır | display.js'ten geri istenen adlar |
| --- | ---: | --- |
| `item_tooltips.js` | 706 | `format_money` |
| `crafting_display.js` | 624 | `action_div`, `update_displayed_normal_location` |
| `journal_panels.js` | 696 | `item_divs` |

Ölçmek daha ilk kesmede kendini ödedi: ihtiyaç duyulduğu sanılan üç adın aslında hiç
gerekmediği çıktı. `rarity_colors` ve `rarity_outlines` onları okuyan ipuçlarına ait,
`select_outline_class` `display.js`'te değil `misc.js`'te ve `round`'u başka hiçbir şey
kullanmıyor.

Dört ayrı yanlış; her biri farklı bir ağa takıldı:

- yıkıcı parametre listesi de bir süslü parantez açar, bu yüzden `function`'dan saymak
  259 satırlık bir fonksiyonu kendi imzasında bitirdi;
- `Object.keys(x).forEach(...)` `});` ile kapanır ve eşleşen paranteze kadar kesmek
  geride `);` bırakır;
- bir `const`'u onu okuyan döngünün üstüne taşımak onu geçici ölü bölgeye sokar - paket
  tertemiz derlenir ve sayfa bomboş açılır; `check:bundle` tam bunun içindir ve ardından
  taşımanın geride bıraktığı iki adı daha yakaladı;
- tembel bir `import\s*\{[\s\S]*?from "./display.js"` deseni dosyadaki İLK import'tan
  başlayıp aradaki her şeyi yutar; `main.js`'te bir yorumu sözdizimi hatasına çevirdi.

Bir sonraki kesmenin nasıl yapılacağını değiştiren iki ders. **Yeniden dışa aktarım
bölmeyi kozmetik yapar**: `display.js` taşınan adları `main.js`, `save_load.js`,
`crafting.js` ve `items.js`'e devrediyordu; onlar da artık içinde olmayan fonksiyonları
ondan istemeye devam ediyordu. Yani içe aktaranları yönlendirmek kesmenin parçası,
sonradan yapılacak bir iş değil. Bir de **tarayıcısız yükleyicinin uzayan bir saplama
listesine değil bir `document`'a ihtiyacı var**: `main.js` ile `display.js`'i içe aktarma
döngüsü için saplıyor, `journal_panels.js` ikisi de değil ve yüklenirken iki eleman
tutamağı alıyor; global'i bir kez saplamak, bir sonraki bölmede yükleyiciye hiç
dokunmamak demek.

### Beş kontrol; her biri çoktan yayımlanmış bir şey için

- **`check_save_keys_round_trip`** - adı değişen kayıt anahtarının oyuncu verisini
  sessizce düşürmesi.
- **`check_imports_resolve`** (**v0.6.61**) - `crafting.js`, `main.js`'ten `update`'i içe
  aktarıyordu; main.js onu dışa aktarmıyor ve crafting.js hiç çağırmıyordu. esbuild göz
  yumuyor; tarayıcının kendi modül yükleyicisi reddediyor - `npm run serve`'ü sessizce
  bozan da buydu. Bu, `check_modules_import_what_they_call`'ın aynadaki eşi: ikisi
  birlikte bir içe aktarma listesinin gerçekle iki yönden de uyuşmasını istiyor. 677 ad.
- **`check_visible_tasks_can_be_finished`** (**v0.6.60**) - "ne yapacağım var, nasıl
  yapacağım yok" bildirimini kapatıyor; günlükte adı yazan ama altında satır olmayan
  adım. İpucu üreteci, ilerleticileri henüz keşfedilmemiş bir adımı zaten karşılıyordu;
  hiç ilerleticisi olmayanı karşılayamıyordu. Önce ölçüldü ve içerik zaten temizdi.
- **`check_action_labels_fit_a_button`** - altı aksiyon, modelin "düğme üzerindeki yazı"
  diye tanımladığı `starting_text` alanına anlatı cümlesi koymuştu ve düğme 105
  karakterin hepsini çiziyordu. Altısının da kısa etiketi zaten yazılmış, kullanılmıyordu.
- **`check_no_raw_control_bytes`** - `\0` kaçışı yerine bayt olarak yazılmış NUL.
  `tests/checks/content.mjs`'i grep'e ikili gösterdi; sonra iki PROPOSALS dosyası da bunu
  anlatan maddeden birer tane kaptı, çünkü bir kabuk heredoc'u kaçışı yeniden bayta
  çevirdi.

Hepsi hata geri konularak tersten sınandı; bu artık D-8 direktifi. Bu oturumda iki kez
genişletilmiş bir eşleyici, eskiden yakaladığını sessizce yakalamaz oldu; yani hiç
patlamamış bir koruma, koruma değildir.

### Belgeler denetleniyor ve projenin nerede olduğunu söylüyor

**v0.6.64.** `docs/STATUS.md` yeni: oyunun nerede olduğu, eline yalnızca o dosya verilen
bir ajanın burada çalışabilmesi için yazıldı; her sayı hatırlanarak değil ölçülerek ve
onu üreten komut da verilerek.

Çift kontrolü yalnızca `docs/` içine bakıyordu; dolayısıyla Türkçe eşi bulunan kök
`AGENTS.md` ve `README.md` hiç denetlenmemişti ve denetlenecek bir `doc-version`
taşımıyorlardı. Artık ikisinde de var; ayrıca her markdown dosyasındaki her göreli
bağlantı izleniyor: 9 çift, 166 bağlantı, 18 dosya.

`STORY.md` de yetişti. 7. bölüm hâlâ her NPC'nin tükendiğini söylüyordu; komisyoncu ile
yaşlı kadın itibara cevap veren satırlar kazandığında bu doğru olmaktan çıkmıştı ve
itibarın bir para birimine dönüşmesinden hiç söz etmiyordu. Meydandaki komisyoncu da
kendi yayımlanmış satırlarının tanıklığıyla hitap tablosuna girdi - `siz` değil, `sen`.

### Plaka zırh ve hiç var olmamış basamak

**v0.6.66.** P-12 bunu eksik bir 4. kademe malzemesi diye yazmıştı. Ölçünce daha genişti:
bileşen üreticisi beş malzeme ve beş yuvada **yirmi beş** plaka parçası kuruyor ve hiçbiri
yapılamıyordu, çünkü ortada metal plaka diye bir eşya hiç yoktu - çelik dâhil; oysa
kaplumbağadan düşen kabuk plaka gayet çalışıyordu. Hattın ilk basamağı hiç yoktu.

`Steel plate`, `White iron plate` ve `Black iron plate` artık birer malzeme; zincir zırhın
iki külçesine karşılık üçer külçeden dövülüyorlar. Bu oran uydurma değil: üretici plakaya
zaten aynı metalin zincir zırhına göre 1,5 kat değer ve 1,6 kat güç veriyor. Beş dış
kaplama tarifinin her birine birer satır eklenerek on beş parça erişilebilir oldu. Beyaz
ve siyah çelik dışarıda kaldı - P-12 tavanın hikâyeyle birlikte yükselmesini şart koşuyor,
iki yerelde de görünen adları yok ve dağdaki bacanın üstünde bir istasyon da yok.

### Islak ormanlar bir bitiş kazanıyor

**v0.6.70.** Bölge şekillerini `STORY.md`'ye yazmak bunu ortaya çıkardı: ıslak ormanlar
**kapanmıyor, duruyordu**. Onlarla işinin bittiğini işaretleyen hiçbir şey yoktu; oysa
bölgenin yayı zaten vardı - Drowned grove temizlendikçe açıklaması üç durumda ilerliyor ve
sonuncusu gri şekillerin gittiğini, ketenin uzun ve kesilmemiş uzandığını söylüyor. Durum
vardı, onu söyleyen yoktu.

Brief o şekilden geldi ve ona sadık kalındı: küçük olacak ve **insan sokmayacak**. Islak
ormanlarda kimse yaşamıyor ve oranın bütün karakteri kimsenin orada olmaması; o yüzden
bitiş, birinin karşılaşılması değil bir şeyin fark edilmesi - oyuncu geri dönüp gri
şekillerin bıraktığı boşlukta biteni biçiyor. Ödemesi keten, çünkü bu bölgenin ödediği şey
malzeme.

İlk kez kullanılan üç şey:

- **`location_clears`**: motorun koşul yeniden yazımından beri desteklediği ama hiçbir
  içeriğin kullanmadığı bir koşul. Korunun bir tam temizliği - açıklamanın zaten tepki
  verdiği durumun aynısı.
- **`titles: [...]` ödül anahtarı** ve kayıt defterinin yer ayırdığı koşulsuz unvan:
  oyunun saydığı hiçbir şey bunu göremez, çünkü bir sayı değil bir an.
- **`rewards.locks.actions`'ın kendine uygulanması.** GameAction'da `is_unique` yok -
  alan `is_finished` - yani bir kez olması gereken bir bitiş, her şeyin kullandığı aynı
  ödül yolundan kendini kilitliyor. Tekrarlanan bitiş, bitiş değildir.

Testi için yükleyicinin büyümesi gerekti. Her `load_browser_free` çağrısı `src/`'nin kendi
geçici kopyasını kuruyor; dolayısıyla bir çağrıdan `locations`'ı değiştirip başka bir
çağrıdan `process_conditions` sormak hiçbir şey kanıtlamıyor: koşul, ilk çağrının hiç
dokunmadığı bir kayıt defterini okuyor ve kapı testi çalışan kodun üstünde patladı.
`module_path` artık dizi alıyor ve ikisini de **tek** çizgeden döndürüyor; tek bir metin
hâlâ modülün kendisini döndürdüğü için mevcut çağıranlar değişmedi. 136 kontrolden 143'e.

### Unvanlar, lore panelinin öbür yarısı

**v0.6.69.** Lore paneli oyuncuya ne **söylendiğini** kaydeder; bir unvan ne **yaptığını**.
Echoes-Beneath'ten uyarlandı ve o incelemenin savunduğu tek değişiklik tasarımın kendisi:
**kaydı al, yeteneği alma.** Onlarınki kazanıldığında bir kez uygulanan bir `talent()`
taşıyabiliyor; buradaki yetenek kilometre taşları ise zaten eşiklerde istatistik veriyor ve
aynı anda aynı işi yapan iki sistem, bir sayı üzerinde böyle anlaşmazlığa düşer.

On iki unvan ve her biri oyunun zaten tuttuğu bir sayacı okuyor: öldürmeler, adı geçen bir
yaratığın öldürme sayısı, başarılı üretimler, ölümler, en sert vuruş, yetenek seviyeleri,
itibarlar. Hiçbiri yeni bir sayaç gerektirmedi; bir unvanın oyun hakkında mı yoksa kendi
hakkında mı olduğunun sınavı da bu.

Koşullar bilerek **fonksiyon değil bildirimsel**: bir kontrol `{skill: {Forging: 20}}`'yi
okuyup var olmayan bir yetenekte patlayabiliyor, oysa bir `() => ...` bunu oyuncu oraya
gelene kadar gizlerdi. Kazandırabilecek her olaydan değil, oyun içi dakikada bir kez
veriliyor - on iki koşulu yeniden okumak ucuz ve sayaç artıran her yere kanca koymak,
biri on üçüncü kazanma yolunu eklediği anda eskiyen bir liste demek. Bir unvan bir kez
kazanıldı mı kazanılmış kalıyor: itibar harcanabilir ve oyuncunun yaptığının kaydı sessizce
doğru olmaktan çıkmamalı.

Kazanılmamış unvanlar listede hiç görünmüyor, soluk hâlde bile. Göstermek, bir kaydı
yapılacaklar listesine çevirirdi.

Bunu kurarken üç kontrol genişledi; her biri bir şeyi geçirdiği için:

- **Onclick kontrolü yalnızca ilk sıçramayı doğruluyordu.** `onclick="showTitles()"`
  işaretlemede tanımlı bir işleyiciyi adlandırıyor, o işleyici de `window`'da olmayan
  `update_displayed_titles`'ı çağırıyordu. Sekme hiçbir şey çizmedi ve bunu yalnızca bir
  tıklama söyledi. Artık ikinci sıçramayı da izliyor; o işleyicilerin kendi tanımladığı
  yerelleri saymak, on yedi yanlış alarmı sıfıra indiriyor.
- **Panel kontrolü yüksekliği ve görünürlüğü biliyordu ama kaydırmayı bilmiyordu.**
  Yüksekliği doğru ama listesi doğru olmayan bir panel, tam olarak iki kez bildirilen
  hata - önce Keşifler, sonra Lore - ve unvanlar paneli aynı oturumda üçüncüsünü yaptı.
  Kutu da liste de kaydırabilir - bestiary kutuyu, Lore ise başlığı sabit kalsın diye
  listeyi kaydırıyor - o yüzden kontrol ikisini de kabul ediyor; tasarımın uymadığı bir
  kuralı icat etmiyor.
- **Yerel kontrolleri şablonla kurulan bir kimliği göremiyordu.** `title ${id} name`'in,
  konum türleri ve nadirlikler gibi, sayılabilir bir aile olarak kaydedilmesi gerekti.

### Dört bölge bir şekil kazanıyor

P-13/54, inşa edilmiş bölgelerin hikâyenin yanında durmak yerine ona bağlanmasını
istiyor. Somut olarak, Echoes-Beneath incelemesinden: her birine `STORY.md` içinde bir
**Açılış, Sahneler, Beklentiler ve Bitiş** veriliyor; onların REGIONS.md'sinin tuttuğu ve
burada hiç olmayan şekil bu.

Bölgelerin gerçekte ne içerdiğine bakılarak yazıldı, hatırlanarak değil: ıslak ormanlar
içinde hiç NPC olmayan dört yer, ovalar oyunun on dört NPC'sinden beşini barındıran yedi
yer, körfez sayıca en ince olan üç yer, dağ ise en fazlası olan sekiz yer.

Dördün ikisinin bitişi olmadığı çıktı ve bunu söylemek zaten alıştırmanın amacı:

- **Islak ormanlar kapanmıyor, duruyor.** Onlarla işinin bittiğini söyleyen tek satır yok.
  Onları bitirecek şey küçük olmalı ve bir insan sokmamalı; çünkü bölgenin bütün karakteri
  kimsenin orada olmaması.
- **Körfez bilerek çözülmemiş** ve çatalın sahip olduğu en güçlü uç: Marrowmoth,
  tartılmamış bir sandık, hesap sütununda iki kez çizilmiş bir çizgi ve haber salmayacak
  bir sayman.

1. bölüm ayrıca 7. bölümle çelişiyordu. Hâlâ dört bölgenin "henüz olmadığını" söylüyordu,
oysa 7. bölüm dördünün de inşa edildiğini yazıyordu. Artık hangilerinin inşa edildiğini ve
hangilerinin yalnızca adının geçtiğini söylüyor - büyük nehir havzası ve Forest lake'in
ötesindeki kadim orman.

### Echoes-Beneath, bu kez hikâye ve oynanış için okundu

İlk inceleme araç gereç sorusunu cevaplayıp asıl sorulanı kaçırmıştı. Bu inceleme
mekaniklere ve anlatı aygıtlarına bakıyor; örnek olarak da unvan sistemi adı geçmişti.

**Unvanlar - alınmaya değer, tek bir değişiklikle.** `js/data/titles.js` 883 satır ve 30
unvan. Bir unvanın adı, açıklaması, nadirliği ve bir `have` bayrağı var; bir `talent()`
tanımlamadıkça tamamen kozmetik, tanımlarsa da ilk kazanıldığında bir kez uygulanıyor.
Zaten oyunun içine dağılmış eşiklerden veriliyorlar: bir yeteneğin 10. seviyeye gelmesi,
bir öldürme sayacı, bir para toplamı, bir teçhizat olayı.

Bu oyuna alışılmadık biçimde iyi oturuyor, çünkü tamamlayıcı yarısı zaten var: lore
paneli **size ne söylendiğini** kaydediyor, bir unvan ise **ne yaptığınızı**. Düzenek de
hazır - `process_rewards` zaten 23 ödül anahtarı alıyor, yani `titles: [...]` yanlarına
oturur; günlükte böyle bir liste için sekme şekli zaten var; `enemy_killcount`, yetenek
seviyeleri, itibarlar ve koşu sayaçları da eşikler.

Değişiklik şu: **kaydı al, yeteneği alma.** Yetenek kilometre taşları zaten eşiklerde
istatistik veriyor; `talent()` taşıyan bir unvan, aynı anda aynı işi yapan ikinci bir
sistem olurdu - iki sistemin bir sayı üzerinde anlaşmazlığa düşmesi de böyle başlar.
Buradaki unvan bir kayıt olmalı, başka bir şey değil.

**Effector'lar - burada zaten başka adla var.** `js/systems/effectors.js` 56 satır: bir
alana bağlı, karanlık gibi dünya durumlarını açıp kapatan çevresel bir değiştirici.
Kademeli uygulanan etkileriyle `location_types` aynı aygıt ve soğuk kademeleri de onun
çalışan hâli. Alınacak bir şey yok.

**Yetenekler (abilities) - başka bir oyun.** Yaratığa özel adlandırılmış saldırılar, kendi
anlatım cümleleriyle ve bir hasar hesaplayıcısıyla çözülüyor. Buradaki dövüş istatistik ve
duruşlardan ibaret, adlandırılmış saldırı yok; yani bunu almak bir ekleme değil dövüşün
yeniden yazımı olur ve getirdiği ton da bu oyunun tonu değil.

**Planner - kazanç yok.** İşi sonraki bir tick'e erteliyor. `game_action_period` ve
mevcut aralıklar zaten bunu yapıyor.

**En işe yarar şey kod değil.** `docs/REGIONS.md` her bölgeye sabit bir şekil veriyor -
Açılış, Sahneler, Beklentiler, Bitiş - ve buradaki `STORY.md`'de böyle bir şey yok:
dünyayı ve hikâyenin nerede durduğunu anlatıyor ama inşa edilmiş her bölge, başı ve sonu
olan bir şekil değil bir yerler listesi. P-13/54'ün işaret ettiği boşluk tam olarak bu;
o yüzden şekil kendi önerisine değil oraya gidiyor.

`STORYPROGRESS.TR.MD`'nin bir aygıt değil bir istem olduğu çıktı - bu projenin de altında
çalıştığı aynı rol tarifi. Alınacak bir şey yok.

### Büyük dosyaları bölmek ve bunun nerede durduğu

Altı kesme display.js'i **7.057 satırdan 3.815'e** indirdi ve artık projedeki en büyük
dosya bile değil - `data/skills.js`, `items.js`, `data/locations.js` ve `main.js`
hepsi daha büyük; üçü de içerik dosyası, ki büyük olmaları gerekiyor.

| modül | satır | sürüm | geri istediği adlar |
| --- | ---: | --- | --- |
| `save_load.js` | 1.951 | v0.6.54 | (main.js'ten çıktı) |
| `item_tooltips.js` | 706 | v0.6.62 | `format_money` |
| `crafting_display.js` | 624 | v0.6.63 | `action_div`, `update_displayed_normal_location` |
| `journal_panels.js` | 696 | v0.6.65 | `item_divs` |
| `skills_display.js` | 660 | v0.6.67 | hiçbiri |
| `inventory_display.js` | 963 | v0.6.68 | dört, hepsi çalışma zamanı |

**Neden burada duruyor.** Kalan her kesme daha kötü bir takas ve bunu sezgi değil
ölçümler söylüyor:

- **Görev günlüğü** 893 satır ve display.js'ten **91** ad istiyor. Diğer bütün
  panellerin konuştuğu panel o.
- main.js'teki **seçenekler** 289 satır ve `game_options`, `language`,
  `current_location`, `current_stance`, `global_flags` istiyor - projenin yarısının
  okuduğu çekirdek durum. Onu taşımak başka bir iş; bırakmak ise giriş noktası olan
  main.js'e on geri kenar demek - bir döngünün daha önce bir sürümü bozduğu tek yer.
- display.js'teki **dövüş** ve **animasyonlar**, 166 ve 169 satır için 22 ve 13 ad
  istiyor; on satır başına bir döngü eder.

Altı kesmenin ürettiği ve satır sayısından değerli olan kural: **bir kesme, kazandırdığı
satırla değil, taşınan kodun geri kaç ada ihtiyaç duyduğuyla ölçülür.** Altısının beşi
dört ya da daha az istedi, biri hiç istemedi; pahalı görünen ikisi de yalnızca onların
okuduğu durum birlikte taşınınca ucuzladı.

### Envanterler ve ticaret penceresi

**v0.6.68.** `inventory_display.js`, 963 satır; display.js 4.699'dan 3.819'a - v0.6.60'ta
olduğunun üçte biri ve altı kesme boyunca 7.057'den 3.819'a.

Karakterin envanteri, tüccarınki, depo sandığı ve ticaret penceresi tek parça hâlinde
kesildi; çünkü sıralamalarını, eşya satırlarını ve on iki parça durumu paylaşıyorlar.
display.js'ten geri dört ad geliyor - modül kapsamında bir kez alınan iki DOM tutamağı,
para biçimlendirici ve görev sayacı yeniden çizimi - dördü de fonksiyonların içinde
kullanılıyor, modül değerlendirilirken değil.

`sort_displayed_quests` bilerek geride bırakıldı. Envanterin karşılaştırıcılarıyla
sıralıyor ama günlüğün durumu olan `quest_list`'i okuyor; almak, tek bir fonksiyon için
görev panelinin durumunu envanter modülüne sürüklemek olurdu.

Taşımayla birlikte bir kontrolün de değişmesi gerekti: `check_equipment_slot_names`,
`equipment_slots_divs`'i `src/display.js`'ten adıyla okuyordu ve harita gidince kırıldı.
Artık arıyor; çünkü okuduğu dosyayı sabit yazan bir kontrol, o dosya her kesildiğinde
doğru işin üstünde kırılır.

Altı sürüm önce eklenen `check_imports_resolve` burada kendini ödedi: yönlendirmenin
atladığı `crafting.js`'in hâlâ display.js'ten `update_displayed_character_inventory`
istediğini yakaladı.

### Yetenek çubukları ile duruş listesi, ve kontrolün göremediği iki şekil daha

**v0.6.67.** `skills_display.js`, 660 satır; display.js 5.273'ten 4.699'a. Beş kesmenin
en temizi: display.js'ten ihtiyaç duyduğu sanılan yedi adın hepsi bu koda ait modül
durumu - çubuk div'leri, iki liste, sıralama ölçütü ve yönü - ve onlar da birlikte
taşınınca yeni modülün geri **hiçbir** ada ihtiyacı kalmadı. Tek yönlü bir içe aktarma
ve üzerine düşünülecek bir döngü yok.

Ardından `check_modules_import_what_they_call`'ın göremediği iki şekil daha çıktı; ikisi
de `effect_templates`'in bir adım ötesi: tertemiz derlendi, tertemiz değerlendirildi ve
kayıt yüklenince patladı.

- **`${name}`.** `[data-stance='${selected_stance}']`, şablon dizesi içinde çıplak bir
  değer: ne çağrı, ne indis, ne kurulum. Eklemesi düşük gürültülü, çünkü `${}` içindeki
  her şey mutlaka değerlendirilir.
- **`name.property`.** `character.bonus_skill_levels` - içe aktarılmış bir nesnenin
  normalde kullanılma biçimi ve beşinin en geniş boşluğu. Eklemeden önce ölçüldü: 51
  modülün tamamında tam olarak bir isabet veriyor, o da gerçek olanı - yeter ki modül
  yolları dışarıda bırakılsın. Yoksa `"./character.js"`, `character` ve ardından `.j`
  diye okunuyor.

`${name}`'i eklemek kontrolün `translation.js` hakkında boş yere bağırmasına da yol açtı;
orada `load = async(language) => {` yazıyor ve içinde `${language}` geçiyor - bu bir
parametre, eksik bir içe aktarma değil. Ok fonksiyonu parametreleri artık bildirilmiş
sayılıyor; önce sayılmıyordu.

### Katkı geri döndü ve alınacak bir şey yoktu

Upstream, temmuzdan beri ilk kez ve aynı gün kımıldadı: üç commit ve üçünün de kaynağı
bizim çekme isteğimiz. İkisi adıyla bizim commit'lerimiz - dev konsolu ve teçhizat
karşılaştırması - üçüncüsü onların: "added and tweaked commits from PR". PR #242,
*"cherry picked some of the commits included (all but milestone's expansion), with a few
tweaks on the way"* denilerek kapatıldı.

Yani P-13/34'teki strateji - upstream'den alınabileni al, sonra kendimizinkini sun - bu
tur için cevabını buldu: **alınacak bir şey yok**. Onların bizim ağacımıza göre farkı,
kendi kodumuzun onların ev üslubuyla yazılmış hâli: `equipment_comparison`,
`create_equipment_comparison` olmuş, bir dizi birleştirmesi yeniden metin toplamaya
dönmüş, çarpanlar `+%5` yerine `x1.05` gösteriliyor ve açıklayıcı yorumlar silinmiş.
Birleştirmek dört dosyada çakışırdı ve kendi işimizin üstüne yazardı; stratejinin dışladığı
tek şey de bu.

Tek özlü ekleme `config.js` içindeki `enable_dev_mode: false` bayrağı ve o da bilerek
bizimkinden farklı bir tasarım. Bizimki konsola yazılan `enable_dev_console()`; varsayılan
olarak kapalı, hiç kaydedilmiyor ve bilerek bir sürüm bayrağına bağlanmıyor - geliştirme
sürümü de birilerinin oynadığı bir sürüm. Onun yerine bir config anahtarı almak bunu
zayıflatırdı; olduğu gibi kalıyor.

Bu, *alma* yarısını kapatıyor. Verme yarısı duran bir tutum ve P-13/58'de yaşıyor.

### Tarayıcısız yükleyici içerik modüllerine ulaşıyor

`tests/lib/browser-free-src.mjs`, `main.js` ile `display.js`'i üretilmiş saplamalarla
değiştirerek `src/` içinden bir modülü gerçekten yüklüyor. Üç modül bunda ölüyordu -
`enemies.js`, `traders.js` ve `data/locations.js` - "Cannot access 'is_rat' before
initialization" diyerek: bilinçli bir içe aktarma döngüsünü yanlış giriş noktasıyla
değerlendirmekten doğan bir geçici ölü bölge hatası. Önce `items.js`'i yüklemek işe
yaramıyordu, çünkü her çağrı kendi geçici çizgesini kuruyor.

Düzeltme şu: yükleyici artık her modülü **main.js'in kendi sırasıyla** içe aktaran bir
giriş modülü üretiyor - sıra gerçek `main.js`'ten okunuyor - ve hedefi onun üzerinden
çekiyor. Tarayıcıda giriş noktası `main.js`'tir ve `character.js` ile `items.js`'ten
hangisinin önce girileceğini o sıra belirler; sırayı tekrarlamak aynı çözümü Node'da da
üretiyor. Hedef, sıradan bilerek çıkarılmıyor: çıkarmak sırayı değiştirir ve `items.js`
çıkarıldığında `market_saturation.js` önce giriliyor, `group_key_prefix`'i yarı
değerlendirilmiş bir modülden okuyordu.

Boşluğun bedeli somuttu: Keşifler indeksi `trader.inventory_template`'i bir liste sanıp
okuyordu, oysa o bir listenin ADI; ve hiçbir test bunu yakalayamazdı çünkü hiçbir test
bir tüccar kuramıyordu. O test artık var - "trade sources are found through the stock
list a trader names" - kaynak metninden değil gerçek nesnelerden kuruluyor; yani
indeksin varsaydığı şekilde olmayan bir alan, oyuncunun karşısında değil takımda
patlıyor.

### Lore paneli

**v0.6.52.** "Hikâyenin geçmişini ve daha önce yapılan konuşmaları tutan bir yer" diye
istendi. Oyunda bunu kaydeden hiçbir şey yoktu: bir replik bir kez okunuyor ve
kayboluyordu; bir hafta sonra dönen oyuncunun kendisine söylenene geri dönmesinin yolu
yoktu.

Yeni bir panel olarak değil, günlüğe beşinci sekme olarak eklendi; görevlerin,
bestiary'nin, antolojinin ve verinin yanına - çünkü oyunun sizin için hatırladığı şeyleri
tuttuğu yer zaten günlük. `Textline` kurucusunda bir `lore` bayrağı, gövdesinde de
`is_heard` kazandı; `check_content_object_keys`'in etkilenmemesinin sebebi de bu: bayrak
içeriğin bildirdiği veri, duyulma durumu ise çalışma zamanı. Yirmi altı satır işaretli;
konuşana göre gruplanıp duyulduğu sırayla diziliyorlar.

Ardından panel günlüğün altından taştı; bu da **v0.6.53**: filtreleri ikinci bir satıra
kayıyor ve altındaki listenin bundan haberi olmayan sabit bir yüksekliği vardı. Artık
denetimlerden ne artarsa onu alıyor, kaç satır olursa olsun; aynı kusur Keşifler'de de
vardı ve onunla birlikte düzeldi.

### Çalışma listesinden çıkmadan önce iki madde daha

**Dükkândaki İptal.** "İptal geri götürmeli" diye bildirildi. Davranış zaten doğruydu -
ticaret penceresinde Kabul, İptal ve Çıkış var; İptal sepeti boşaltıp orada kalıyor,
Çıkış ise çıkıyor. Yani kusur etiketlerdeydi (Türkçede iki eylemi yeterince ayırmıyorlardı)
ve üçünden birini gizleyen yerleşimdeydi. Davranış olarak değil, sözcük olarak düzeltildi;
bildirimin dürüst okuması buydu.

**Bir kısmı değil, aktarılabilenlerin tamamı.** `contribute/upstream-fixes` 14 commit
taşıyor; her biri upstream'in kendi koduna ve üslubuna göre yazılmış, her biri şüphelenilen
değil ölçülen bir kusur ve her biri tek başına düşürülebilir: `src/` içinde on iki
düzeltme, bir derleme düzeltmesi - `build.js`, sürümü damgalayamadığında 0 ile çıkıyordu,
yani hiçbir tarayıcının çekmeyeceği bir paket başarılı derleme olarak raporlanıyordu ve
orada `dist/` commit'li - ve isteğe bağlı bir paket-yükleme kontrolü. Küme tahminle değil,
kendi kontrol takımımız onların ağacına doğrultularak kapatıldı; o kontroller zaten bunun
için var: her biri burada bulunmuş bir hata sınıfını kodluyor. Kaynak düzeyinde onların
kodunda başka bir şey bulmuyorlar.

### Bakım

- **v0.6.56** - dev konsoluna `add_best_effect(duration)`; `give_best`'in eşi. Hangi
  etkinin iyi sayıldığı `main.js` içinde listelenmiyor, `tags.buff`'tan okunuyor; çünkü
  veri, cevabı sayılardan daha iyi taşıyor: Tipsy çevikliği artırır, el becerisini
  düşürür ve debuff etiketlidir. `check_effect_tags_match_their_numbers`, komutun
  güvendiği etiketi çapraz denetliyor.
- **Satır sonları sabitlendi.** `* text=auto`, çalışma kopyasındaki satır sonunu her
  katılımcının `core.autocrlf` ayarına bırakıyordu; tamamı LF olan bir indekse karşı 64
  dosyası CRLF, 10 dosyası LF çıkarılmış bir ağaç oluşuyordu. Artık
  `.js/.mjs/.json/.css/.html/.md/.yml` için `eol=lf`.
- **Yukarı akış.** `add_best_effect`, ait olduğu dev konsolunun yanına, PR #242'ye gitti.
  PR #243 ise yeni: onların aksiyon düğmeleri `starting_text` çiziyor ama kilit-açma
  mesajları `action_name` okuyor; yani günlük, düğmenin hiç göstermediği bir adla bir
  aksiyon duyuruyor - üç karınca yuvası aksiyonu tek bir etiketi paylaşıyor. Kontroller
  geride kaldı; upstream'de ne `tests/` var ne de birini asacak bir `package.json`.

---

## 2026-08-26

### Arayüz pencereye sığıyor, ve iki beceri ailesi tamamlandı

**P-13, 4. madde: yerleşim.** Her panel sabit bir konumda `position: absolute` — left
0, 410 ve 820'de dört 400px'lik sütun ve 1230'da kendi 415px'iyle mesaj günlüğü — yani
arayüz pencere ne olursa olsun sabit ~1660x850. Daha dar bir görüntü alanı günlüğün sağ
kenarını kesiyor ve yatay bir kaydırma çubuğu ekliyordu.

Bunu düzeltmenin üç yolu var ve ilginç kısım da seçim:

- flex ya da grid'e geçirmek doğru cevap ve her konumun yük taşıdığı 3000 satırlık bir
  stil sayfasında büyük, riskli bir değişiklik;
- günlüğü diğerlerinin altına indiren bir medya sorgusu yazı boyutunu koruyor ve
  sayfayı pencereden geniş değil uzun yapıyor; yani bir kaydırma çubuğunu bir başkasıyla
  değiştiriyor;
- bütün sabit yerleşimi ölçeklemek her piksel ilişkisini birebir koruyor, yirmi satır
  kadar ve geri alınabilir.

Yani: ölçekleme. `--ui_scale`,
`min(1, kullanılabilir_genişlik / 1660, kullanılabilir_yükseklik / 850)`; yeniden
boyutlandırmada tekrar hesaplanıyor ve `#main_content` üzerinde, kaynağı sol üstte olan
bir `transform` olarak uygulanıyor. 1'de sınırlı; yani zaten yeterince büyük bir pencere
hiç etkilenmiyor. Alt panel bir kardeş ve bilerek tam boyutta kalıyor — kaydet ve dışa
aktar düğmeleri geri kalanla birlikte küçülmemeli.

Ölçeklemenin bozduğu tek şey `event.pageX/pageY` ile konumlanan bir tooltip; çünkü onlar
sayfa koordinatı, oysa öğenin kapsayıcı bloğu artık ölçekli. Bütün projede tam olarak
iki tane var ve `#main_content` içinde olanı artık ölçeğe bölüyor.

**P-13, 2. madde: kilometre taşları.** "Perk" beceri kilometre taşları demekti ve
boşluklar dağınık değildi — bir kardeşin tamamlanıp diğerlerinin bırakıldığı bütün
ailelerdi:

| aile | tamamlanmış | boş |
| --- | --- | --- |
| Toplama | Balıkçılık, on taşla | Odun kesme, madencilik, kazma, bitki bilgisi, hayvan idaresi, toplama ustalığı |
| Zanaat | Zanaat ustalığı altı, Forging bir taşla | Zanaat, eritme, yemek, simya, kasaplık, ahşap işçiliği, tıp |

Yani bu bir sistem uydurmak değil iki aileyi bitirmek; her sayının tamamlanmış
kardeşten kopyalanmasının sebebi de bu: altta sabit 1, ortada sabit 2, yuvarlak
seviyelerde 1.05 çarpan ve ara sıra bir ilgili beceriye 1.1 tecrübe çarpanı. Buraya
eklenen hiçbir şey balıkçılığın zaten olduğundan güçlü değil.

Her beceri, işinin kullandığı özelliği ödüllendiriyor; böylece neyi geliştireceğini
seçmek bir seçim olarak kalıyor: balta kuvvetle, kazma kuvvet ve el becerisiyle, kürek
kuvvet ve dayanıklılıkla, ot sezgi ve el becerisiyle, hayvan sezgiyle, tencere sezgiyle
ödüyor. İki ustalık becerisi, zanaat ustalığının zaten sahip olduğu el becerisi
merdiveninin aynısını alıyor; çünkü aynı türden beceriler.

Forging'in mevcut 10. seviye tarif açılışına dokunulmadı; beş stat taşı onu
değiştirmek yerine o nesneye katıldı.

**On beş beceri bilerek hâlâ taşsız.** Yedi duruş becerisi kendi duruşunun etkisini
ölçekliyor, ki bu bir kilometre taşının işi değil. Asalar ve değneklerin oyunda onları
kullanacak bir silahı yok. Weapon mastery ile Combat, taşları çocuklarının taşıdığı
ebeveynler. Üç direnç de bırakıldı; çünkü Heat resistance'ın statı `character.js`
içinde *"şu anda işe yaramaz"* diye işaretli ve Cold resistance tahmin edilmek yerine
kararlaştırılmış bir sıcaklık ölçeği istiyor — iyi ölçeklenmiş taşlarla 64 beceriden
49'u, uydurma üç taneyle 52'den iyidir.

### Bildirilen boşluklar, bir dev konsolu ve changelog'un elle kırılmaktan kurtulması

Tek oturumda on dört talep; geldikleri sırada P-13'e kaydedildi. Çeviri raporları
ekran görüntüsüne göre değil sebebe göre gruplandı, çünkü içlerinden yalnızca biri
"biri bir satırı unutmuş".

**Ad yerine değer basılması.** Dövülmüş bir eşyanın altındaki bileşen listesi
`item_templates[...].name`, yani ham kayıt adını kullanıyordu; bir kılıç
`[Cheap iron long blade] + [Simple wooden short handle]` diye okunuyordu. Envanterin
yuva etiketi `equip_slot` basıyordu; kuşanılmış bir eşya `[weapon]` ya da `[torso]`
diye okunuyordu. Bir kitap `target_item.name` basıyordu ve on kitabın hepsinin, hiçbir
şeyin okumadığı çevrilmiş bir adı zaten vardı. Her biri tek bir site ve her birinin
satırları bekliyordu.

**Yazılan değil döndürülen İngilizce.** `format_money(0)` doğrudan `'nothing'`
döndürüyordu ve iki zaman biçimlendirici `"2 hours"` ile `"25 minutes"`i İngilizce
kelimelerden kuruyordu. Bu oturumda daha önce eklenen DOM kontrolü hiçbirini
göremezdi: DOM'a yazan ifadelere bakıyor, bunlar ise bir çağıranın sonradan bastığı
dönüş değerleri. Bu kontrolün bir eksiği değil, bir sınırı olarak adlandırmaya değer.

O biçimlendiricileri yereli okuyacak hâle getirmek gerçek bir tasarım sorununu ortaya
çıkardı. `misc.js` bir yaprak yardımcı modül ve oraya `translation.js` almak
`main.js`'i, o da `display.js`'i çekiyor; yani yalnızca aritmetik yapan bir modül bir
`document`'a ihtiyaç duymaya başladı ve `misc.js`'i tek başına yükleyen koşum takımı
anında kırıldı. Artık `format_money`'nin yanında, `display.js` içinde yaşıyorlar; zaten
tek çağıranı da oydu.

**Hiç çevrilmemiş olanlar.** Tüccar ve depo panellerinin üstündeki sekiz kategori
filtresinde `data-translation` niteliği yoktu. Dört becerinin altındaki mizah satırı
`skills.js` içinde düz bir İngilizce dizgeydi — ve o dördü gönderme: Warhammer
40.000'e, bu oyunun hayvanıyla koyun saymaya, Gurren Lagann'a ve nefes şakasına; o
yüzden Türkçe kelimeleri değil kaydı taşıyor.

**Çeviriden sağ çıkmayan bir kuruluş.** `Bitir: {v1}` etiket ile değer gibi okunuyor.
Türkçe burada faaliyet adına göre değişen bir belirtme eki isterdi — koşu koşuyu, iş
işi olur — ve bu genel olarak kurulamaz; o yüzden ad öne geçti, fiil arkaya.

**Changelog artık bir liste.** Girdileri geniş bir pencere için elle kırılmıştı ve
`white-space: pre-wrap` onları kapsayıcı genişliğinde bir kez daha kırıyordu; yani her
madde iki kez bölünüp ragged çıkıyordu. Bir `<pre>` bunu düzeltemez: sarılan bir satır
sıfırıncı kolondan yeniden başlar, çünkü maddenin nerede başladığını bilmez. O yüzden
her dosyadaki 885 girdi `<li>` oldu; kaynakta her biri tek satır ve asılı girinti
`::before` ile çiziliyor.

Ve artık cümleler: İngilizcede 857 büyütme ve 863 nokta, Türkçede 800 ve 866. Türkçe
büyütme ASCII değil — `i`, `I` değil `İ` olur — o yüzden o ikisi `upper()` üzerinden
değil açıkça eşlendi. Otuz üç girdi bir `<b>` ya da `<span>` içinde bitiyor ve
noktaları etiketin içine girdi.

**Mesaj günlüğü yeniden yüklemeden sağ çıkıyor.** Saklanan şey bitmiş div'ler değil
`log_message`'ın aldığı argümanlar; yani geri yüklenen bir günlük canlı olanla tam
olarak aynı kodla kuruluyor — sınıflandırma, grup başı üst sınırlar ve budama canlı
yoldan sapamaz. 300 ile sınırlı, çünkü kayıt oyuncunun elle dışa aktardığı bir metin
dosyası. Satırlar hâlâ düştükleri dilde kalıyor; bu, `log_message`'ın kimlik ve
parametre değil kurulmuş metin alması ve değişmedi, zaten kayıtlı.

**Bir geliştirme konsolu; istenmedikçe kapalı.** Tarayıcıda `enable_dev_console()`
yazmak yardımcıları yalın global olarak bağlıyor: istenen
`add_active_effect("Coffee", 1800)`, ayrıca `give()` — `process_rewards` üzerinden bir
ödül nesnesi, yani bir görevin kullandığı yolun aynısı; böylece bu yolla verilen
hiçbir şey içeriğin vermesinden farklı davranmıyor — `goto()`, `add_money`, `add_xp`,
`add_skill_xp`, `set_flag` ve `list_*` fonksiyonları.

Ayrıca alt paneldeki hız düğmelerini ortaya çıkarıyor: 1x, 2x, 5x, 10x. `tickrate`,
`main.js` içindeki her duvar-saati gecikmesinin **ve** her tik-başı muhasebe teriminin
böleni (`total_playtime += 1/tickrate`, `save_period * tickrate`); bu da onu çarpmayı
her şeyi tutarlı hızlandıran ve muhasebeyi doğru bırakan tek değişiklik yapıyor:
saniyede daha çok tik, her biri eskisi kadar değerli. `const`, `let` oldu ve hiçbir
zamanlama kodu değişmedi.

Ne konsol ne hız varsayılan olarak açık ve ikisi de kaydedilmiyor. Yeniden yükleme 1x'e
dönüyor. `is_on_dev()` de kapı değil — dev sürümü de birinin oynadığı bir sürüm ve bir
hız çarpanı her faaliyeti, kitabı ve yolculuğu önemsiz kılıyor.

**Ve upstream ilerlememiş.** Fork'un güncellemesini almak istendi; `upstream` eklendi
ve çekildi. İki dalı var: `master`, `e335643`'te (v0.5.5.30, 23 Haziran) — ki bu bizim
kendi çatallanma noktamız — ve `ghpages`, `fc04780`'de (26 Haziran); ağacı master'ınkiyle
bayt bayt aynı, sonraki commit'ler hiçbir dosyayı değiştirmeyen birleştirmeler.
`upstream/master..master` 67 commit, `master..upstream/master` sıfır. Alınacak bir şey
yoktu ve bunu söylemek tek dürüst sonuç.

### 4. kademe: beyaz demir ve siyah demir

`crafting_component_filling.js`, bu fork'tan önce beri beyaz demir, siyah demir,
beyaz çelik ve siyah çelik için **72 bileşen** üretiyor — silah, zırh ve kalkanın en
üst iki kademesinin tamamı, kademeleri ve istatistikleriyle — ve hiçbir oyuncu
bunlardan birine ulaşamıyordu. Üreticinin kendi başlığı nedenini söylüyor:

> `DOES NOT AUTO-FILL CRAFTING RECIPES, DO IT MANUALLY AND MAKE SURE NAMES MATCH`

Kimse yapmamış. Zincir üç ayrı yerden kopuktu: cevheri hiçbir şey üretmiyordu, hiçbir
eritme tarifi cevheri külçeye çevirmiyordu ve on üç dövme bileşen tarifinin hiçbiri
malzemeleri listelemiyordu.

**Geri kalan her şey zaten oradaydı** — bunu uydurmak yerine yapmaya değer kılan da
bu: cevherler, külçeler ve zincir zırh eşya olarak mevcut, **iki** dilde de `name` ve
`desc item` satırlarıyla; ve `material white iron` / `material name white iron` ile
siyah karşılıkları da yazılmıştı. Biri bütün kademeyi kurmuş ve bir dosya kala
durmuş.

**Yalnızca 4. kademe.** Beyaz çelik ve siyah çelik bekliyor; iki sebeple: bir oyun bir
öğleden sonrada iki kademe kazanmamalı, ve görünen-ad satırları hâlâ eksik olan tek
malzemeler 5. kademenin malzemeleri — `material white` ve `material black`'in iki
yerelde de satırı yok, ki bu da özgün çalışmanın nereye kadar geldiğinin adil bir
işareti.

**Bunlar tek bir metalin iki rengi değil.** Üretici beyaz demire ağırlık 130 ve güç
100, siyah demire ağırlık 80 ve güç 110 veriyor — ağır ve dayanıklıya karşı hafif ve
keskin. Ağırlık saldırı hızını düşürüp silah hasarını ve kalkan bloğunu yükseltiyor;
yani bunlar gerçekten farklı silahlar ve seçim, kimse yapamazken çok önce
tasarlanmış.

**Cevher körfezden geliyor ve bu, aşçının repliğinin gerçekleşmesi.** *"A-ha~! Ta
kuzeyde! Oradan çok baharat, et, metal ve deri gelir! Çok uzaktan!"* Bu ülkede beyaz
ya da siyah demiri kimse kazmıyor ve başka hiçbir yer satmıyor; yani tuz evi tedarikin
tamamı — küçük miktarlar ve %35 şans, çünkü kulübede son teknenin getirdiği ne varsa o
var. Kademe yeni bir odaya ihtiyaç duymadı; iki commit önce kurulmuş bir bölge için
doğru sonuç da bu.

**Ve ocağa oturuyor.** `roll_quality`, `station_tier - component_tier` alıyor; yani 4.
kademe bir parça 1. kademe bir ateşte üç bant eksik atıyor. Bu kademeyi işlemeye değer
kılan şey dağdaki baca — yani bu hafta kurulan iki parça birbirini besliyor: baca
tavanı yükseltti, metal de tavanın tuttuğu şeydi.

**Ve üreticinin başlığının uyardığı hata için bir kontrol.** `npm run check` artık
`crafting_recipes.js` içindeki her `material_id` ve `result_id`'nin, ya items.js'in
bildirdiği ya da üreticinin kurduğu bir eşyayı adlandırmasını istiyor — 450 şablona
karşı 549 ad. O sınırın iki tarafındaki bir yazım hatası aksi hâlde sessiz: tarif
listeleniyor, oyuncunun malzemesi var ve sonuç `undefined`.

Yalnızca tarifler. Bir bileşendeki `shield_name` ve `armor_name`, şablon referansı
değil görünen-ad dizgesi — `Shield.getDisplayName`'in üstündeki yorum bunu söylüyor —
ve onları referans saymak kırk yanlış pozitif üretiyor; bu da bundan önceki maddede
kayda geçen hata.

### Eşya ulaşılabilirliği denetimi, ve kayda geçen bir yanlış dönüş

Bir eşya, ganimet listesi, tüccar, tarif, toplama faaliyeti ya da açık bir ödül
üzerinden gelir. Elle bildirilmiş 272 bileşen-olmayan eşyayı bunların tamamına karşı
denetlemek, hiçbir yerde hiçbir şeyin istemediği 21 tanesini buldu.

**O denetimin ilk denemesi yanlıştı ve kayda değer.** Bir eşyanın gelebileceği
*biçimleri* sayıyordu — `item_name:`, `result_id:`, `material_id:`, `resources:` — ve
bir balık tutma faaliyetindeki `{ name: "Carp", chance: [...] }` biçimini kaçırdı;
çünkü o biçimde süslü parantezden sonra boşluk var ve `ammount` anahtarı yok. Herkesin
tutabildiği bir balığı usulünce bildirdi. İkinci sürüm onun yerine referansları
sayıyor: eşyanın tırnaklı adının `src/` boyunca her geçişi, kendi bildirimine ait olan
ikisi çıkarılarak. Bu yön, kimsenin akletmediği bir geliş biçimiyle aldatılamaz.

**Kedi kafe.** Mekânın ne sattığı sorulduğunda işletmeci hep şöyle cevap veriyordu:

> *"Kahve, elma şarabı, kek ve mutfağın bugün yere düşürmemeyi başardığı her ne
> varsa."*

`Black coffee`, `Cider`, `Apple pie` ve `Carrot cake` hepsi vardı — iki dilde
açıklama, çalışan etkiler, her biri 100 değerinde — ve `Cat cafe` envanter şablonu
ekmek, kvas, midye, çorba, kurbağa bacağı ve balık bifteği tutuyordu. Onun saydığı
dört şeyden üçü rafta yoktu. Artık var. Kek iki eşya, çünkü oyunda iki tane var.

**Sebzeler.** `Carrot`, `Potato` ve iki pişmiş biçimi tamamlanmış ve elde
edilemezdi. Köy dükkânı çiğ olan ikisini satıyor; 1-4 seviyesindeki iki yemek tarifi
de onları pişmiş hâllerine çeviriyor — kızarmış sıçan etinin altında, çünkü patates
haşlamak bu oyunda kimsenin yaptığı en kolay şey. Çiğ patates *Hafif gıda
zehirlenmesi* veriyor ve kendi açıklaması *"Yalnız önce pişirmeyi unutma!"* diye
bitiyor; yani onu çiğ satmak, şakanın çalışması.

**Ve sebzelerin beraberinde götüreceği bir görüntü hatası.**
`item_templates["Cooked potato"]`, `name: "Potato"` taşıyordu. `getDisplayName`,
`name ${this.getName()}` çözüyor; yani pişmiş patates *çiğ* patatesin satırını arayıp
"Patates" diye görünüyordu — oysa `"name Cooked potato": "Pişmiş patates"` iki yerelde
de duruyordu; onu kendi eşyası olarak düşünen biri yazmış ve bir kez bile
okunmamıştı. Düzeltmesi güvenli: `setup_ids`, `item_templates[id].id = id` atamasını
anahtardan yapıyor ve `createInventoryKey` `this.id` kullanıyor; yani `name` alanı
yalnızca görüntü.

O sınıf artık kontrol ediliyor: **bir eşyanın adı, başka bir eşyanın anahtarı
olmamalı.** Anahtarından yalnızca farklı olan bir ad normal ve bilinçli — `Goat meat`
"Mountain goat meat" görünüyor, `Cooked clam` "Boiled clam" — ve bunlardan beş tane
var. Başka bir anahtarın *kendisi* olan bir ad ise iki eşyanın tek bir satıra
çözülmesi demek; ikincinin çevirisine hiç ulaşılamaz.

**Yanlış dönüş.** Yol boyunca bu, kırık bir üretim zinciri gibi göründü: `Shield base`
tarifi `Hickory shield base` üretiyor, `items.js` `shield_name`'i
`Hickory wood shield` olan `Hickory wood shield base`'i bildiriyor ve birleştirilmiş
şablonun adı `Hickory shield` — üç ad, hiçbiri eşleşmiyor. Kırık değil.
`crafting_component_filling.js`, `shield_name`'i `Hickory shield` olan bir
`Hickory shield base` üretiyor ki bu da tam olarak birleştirilmiş şablon; ve
`shield_name` bir şablon referansı değil, bir görüntü dizgesi — `getDisplayName`'in
üstündeki yorum bunu söylüyor. Elle bildirilmiş bileşen, üreticinin yerine geçtiği bir
kopya.

Meseleyi çözen şey, tüketim noktasını okumak oldu; oradan bir kontrol çıkmamasının
sebebi de bu: üretim zinciri boyunca bir ad-bağı kontrolü, 42 bulgu ve 42 yanlış
pozitif olurdu.

**Bilerek kalan.** On eşya, çeliğin üstünde tutarlı bir kademe oluşturuyor — beyaz ve
siyah demir cevheri, külçeleri ve zincir zırhları — ve
`crafting_component_filling.js` onlardan `White iron shield base` ile
`Black iron shield base`'i çoktan üretiyor. Kademe bir kusur değil, kazılacak bir
cevheri bekleyen iskele. Bir de iki artık: `Scraps of wolf rat meat` ve
`Basic spare parts`.

### Üç denetim, ve üçüncüsünün bulduğu hata

Bütün öneriler kapandığına göre yapılacak faydalı iş, henüz hiçbir şeyin kontrol
etmediği kusur sınıflarını denetlemekti. Üçü yapmaya değerdi ve biri, karakter
oluşturma var olduğundan beri oyuncuların gözünün önünde duran bir hata buldu.

**Çeviride kalan İngilizce: temiz.** 2985 Türkçe satırın tamamında İngilizce işlev
sözcüğü taraması hiçbir şey bulmadı. Bu cevaba varmak iki düzeltme aldı ve ikisi de
kayda değer, çünkü bu tür bir taramanın nasıl yanlış gittiğini gösteriyorlar:

- **Yalnızca tam kelimeler.** Küçük harf dizisi eşleşmesi, "Fare" içinde "are"
  buluyor ve değirmen farelerinin söylediği her satırı usulünce bildiriyor.
- **Eşyazımlılar hariç.** "her" Türkçe, "has" *kendine has*ta geçiyor, "not" bir not,
  "his" bir duygu. Bunlar kelime listesinde olduğunda çıktı 94 satır gürültüydü;
  çıkarıldığında üçe düştü ve üçü de "his"ti.

Kontrol artık derlemede ve eşyazımlı listesi açıkça yazılı; böylece bir sonraki kişi
eksiklerin bilinçli olduğunu görebiliyor.

**Hiçbir şeyin istemediği satırlar: bir.** `check_content_text_ids` ileri yönü zaten
yapıyor — kaynağın adını verdiği her kimlik mevcut, yani hiçbir şey "text not found"
basmıyor. Tersini kimse yapmamıştı. Hesaplanan kimlik ailelerinin bir modeli
gerekiyordu — `name ${key}`, `desc item ${item}`, `material ${material}`,
`ui slot ${slot}` ve otuz tanesi daha — çünkü yalnızca sabit arayan bir tarama binlerce
canlı satırı bildiriyor. Onlar çıkarıldığında kalan:
`log received a new quest v1`; `main.js` içindeki tek bir yorumlanmış satırdan
referanslı, oysa işi `log started a new quest` yapıyor. Silindi; biri yorumu kaldırsa
kırılacak olan o çağrı da.

Onunla birlikte dört tane daha gitti: `hit_chance` ve `evasion`, hem yalın hem
` long`. Bunlar `stat_names`'teki takma adlardı — geçen commit'te `misc.js`'ten çıkan
İngilizce tablo — ve hiçbir yerdeki hiçbir `stats: {}` nesnesi ikisini de vermiyor.

**Ve asıl olan.** Denetim `middle-aged`'i de işaretledi; başka bir ölü satır gibi
görünüyordu. Değildi. Kahraman oluşturma panelinin üçüncü yaş düğmesi
`data-age="middle aged"` taşıyor — boşluklu — ve `confirm_hero_creation` o dizgeyi
doğrudan `character.personal.age`'e koyuyor; `fill_character_bio` da onu bir metin
kimliği olarak arıyor. Satır ise tireyle yazılmıştı.

Yani üçüncü yaş seçeneğini seçen her oyuncu, karakteri oluşturduğu andan itibaren
kendi karakter kâğıdında, iki dilde de şunu okuyordu:

> `Age: text not found, id: middle aged`

Öncesi ve sonrası tarayıcıda doğrulandı. Yer değiştiren şey tire, nitelik değil: o
değer kayda giriyor ve kayıt verisinin kuralı, kayıt anahtarlarının izlediği kuralın
aynısı.

**Bu artık ileri yönde de kontrol ediliyor.** Panelin düğmeleri iki dizge taşıyor ve
yalnızca biri bugüne kadar doğrulanıyordu — `data-translation` düğmenin kendi etiketi
ve onu `translateUI` çözüyor; `data-age` ile `data-height` ise sonradan metin kimliği
olan değerler. Altı değer kontrol edildi. Irk bilerek aralarında değil: düğmeleri
`playable_races`'ten kuruluyor, yani değer, elle yazılmış bir niteliğin
kayabileceği gibi kayıttan kayamıyor.

Üçü de kusur ekilerek negatif test edildi.

### Gaze eyleminin ulaşılamayan iki sonu

Orman gölündeki *"Nehrin gittiği yeri takip et"*, yazarın orman kalbi için bıraktığı
bir kışkırtma ve hiç başarılı olmayacak şekilde kurulmuş: `success_chances: [0,0]`,
yani oyuncunun ulaşabileceği tek dal, şöyle biten `random_loss` metni: *"Uzakta uçan
bir kuşa benzeyen şeyin ayrıntılarını çıkarmaya çalışıyorsun. Dört bacağı var...
[tbc]"*.

**Bu olduğu gibi kalıyor.** STORY.md dört bacaklı kuşu bilerek açık bırakılanlar
arasında sayıyor ve PROPOSALS, onun hiçbir bölgeye ait olmadığını ve bir bölgeye
katılmaması gerektiğini söylüyor. Eylemi başarılı kılmak, belgelerin ayakta
bırakılmasını söylediği bir soruyu cevaplamak olurdu; o yüzden yapılmadı.

Giden şey, kimsenin ulaşamadığı iki dal:

- **`success_text`, içeriğinin tamamı `"[TBD]"` olan bir satırı** gösteriyordu; iki
  dilde de. Ulaşılamaz, kimsenin görmemesinin sebebi de bu — ama "ulaşılamaz",
  bugünkü `success_chances`'in bir özelliği, bir taahhüt değil. O satır, bir oyuncunun
  okuduğu metin olmaya bir düzenleme uzaklıktaydı.
- **`conditional_loss` hiç tetiklenemez.** `process_conditions`, boş bir koşul listesi
  için 1 döndürüyor — kendi yorumu *"koşul yoksa başarısız olacak bir şey de yok"*
  diyor — ve gaze'in koşulu yok. Metni de Orman gölü derin dalışından kopyalanmıştı ve
  akciğer kapasitesinden bahsediyordu; nehrin aşağısına bakmakla hiçbir ilgisi yok.

Ve ulaşılabilir olan satırdaki bir tekrar: *"make make out"*. Yazarın sesine bir
müdahale değil, bir yazım hatası olarak düzeltildi.

**İki kontrol; çünkü bunların ikisi de bitmiş iş gibi okunuyor.** Bu sınıfı pahalı
yapan şey de bu: hiçbir şey çökmüyor, hiçbir şey eksik değil ve dosya yazılmış
görünüyor.

- `npm run check` artık yer tutucu bir yerel satırını reddediyor: `[TBD]`,
  `lorem ipsum`, `TODO`, `FIXME`. Nekomimi cafe'nin dokuz `lorem ipsum` metni de aynı
  sınıftandı ve dosya okunarak bulunmuştu; bu, o okumanın her derlemede yapılması. Tek
  kasıtlı `[tbc]`, sebebi yazılarak kimliğiyle muaf tutuluyor.
- Ve alamayacağı bir dalı bildiren bir eylemi de reddediyor: koşulu olmayan bir
  `conditional_loss` metni ya da `success_chances`'i sıfır olan bir başarı metni. Elli
  üç eylem kontrol edildi; gaze tek olanıydı.

İkisi de kusur ekilerek negatif test edildi.

`quests.js` ayrıca Village expansion 7. maddesinde `//tbc, duh` taşıyordu; bir commit
önce doğru olmaktan çıktı.

### Kenar mahalle bir alıcıya kavuşuyor, ve P-11 tamamlandı

`Light in the darkness`, kenar mahallenin *"en azından biraz"* iyileştirilebilir mi
diye soruyor ve tek maddesi *"Çeteyle ilgilen"*di. Kabadayıları kaldırmak bir zararın
kaldırılması, iyileştirme değil; oyun da farkı zaten biliyordu: çete gittikten sonra
odanın açıklaması değişip *"bölgeye biraz güvenlik döndüğü için daha çok kişi
sokakta"* diyor. Güvenlik döndü. Başka bir şey dönmedi.

3. görev bunu çözmek yerine çoktan keskinleştirmişti — o çeteyi yönetmiş adam artık
kasaba meydanında yeşil bir tentenin altında bir komisyoncu; meşru ve iyi durumda,
oysa yönettiği mahalle olduğu gibi. Bu karşıtlığın bu maddeden sağ çıkması
gerekiyordu ve çıkıyor: buradaki hiçbir şey ona dokunmuyor.

**Yaşlı kadının kendi repliği brief'in tamamıydı.** *"Etrafta öyle biten bitkilerden
bahsediyorum. Çoğu insan ne kadar işe yarayabileceklerini fark etmeden yanlarından
geçip gidiyor."* Onları satabilir mi diye sorulduğunda gülüyor — gerçek bir gülüş —
ve kimsenin tahmin edemeyeceği sebebi söylüyor. Sebep fiyat değil, bilgisizlik de
değil; sıradaki kadınların yarısı da onun saydığı aynı üç bitkiyi sayar. Sebep
menşe:

> *"Tezgâhı olan bir adam, kenar mahalleden çıkmış bir sepet istemez; onu neden
> aldığını kimseye açıklamak da istemez."*

**Bu da mubayaacıyı oyundaki tek olası alıcı yapıyor.** İyi kalpli olduğu için değil —
hiçbir şey satmadığı için. Ne geldiğini ve ne ettiğini yazıyor; lonca da ona bir
çuvalın hangi kapıdan çıktığını hiç sormadı. Tek cümlede kabul ediyor, sonra da
yaptığı şeyi yapıyor: fiyatı aşağılayıcı diye adlandırıyor, ketenden de kötü olduğunu
söylüyor ve başka alıcı olmadığını bilip yine de adil bir fiyat söyleyen adamın o
masada kalamayacağını açıklıyor. *"Sonradan kendin hesaplayıp cömert davrandığımı
sanmandansa, tamamını benden duymanı yeğlerim."*

**Ölçü de görevin kendi ölçüsü.** *"En azından biraz"* diye vaat etmişti. Gelen şey
bir sürekli sipariş, dış mahalledekinden daha kısır bir boş arazide bitki toplama ve
odanın açıklaması için üçüncü bir durum: sıranın sonunda içinde terazi olan bir
kulübe ve arabanın geldiği günler önünde bir kuyruk. Kurtarma değil. Yaşlı kadın
sayıyı okuyor, *"bu berbat bir fiyat"* diyor, kâğıdı adamın koyduğu kırım yerinden
katlıyor ve Marta'nın kızlarının kökleri bırakıp bırakmayacağını düşünmeye başlıyor.

Ona iki kez de teşekkür ettirilmiyor: *"Bir şey yaptın, ben de bir kez söyledim; bir
kez de, bir şeyin kaç kez söylenmesi gerekiyorsa o kadar."*

**Bununla, açıklaması birebir `[To be continued]` metni olan iki madde de gitti** ve
P-11 kapandı. Artık `global_flags` üzerinde üç getter ve üç bayrak var; hepsi 4.
bölgeyle gelen kontrolün kapsamında.

### Köy ocağı, ve `Village expansion` artık bitirilebilir

`Village expansion`'ın son maddesi, bataklık daha yokken beri **"[To be continued]"**
yazıyordu. Yazarı, onu tıkayan satırın üstüne talimatını bırakmıştı:

> `"further work"`: *şimdilik kendini kilitlemiyor; nehrin öbür tarafına daha fazla
> şey eklendiğinde kilit, açılış ve farklı metinle güncellenecek*

**"Daha fazla şey"in ne olduğu 4. bölge çıktı.** Yaşlı zanaatkâr, oyuncunun dövdüğü
hiçbir şeyin neden tutmadığını yeni anlatmıştı — *"bu köy bir çukurda kurulu; uyumak
için harika, yakmak için umutsuz"* — ve aynı nefeste bunu düzeltemeyeceğini de
söylemişti: *"Ben seksen bir yaşındayım ve rüzgâr bu vadide değil."* Oyuncu da gidip
onun anlattığı şeyi bir dağın üstünde, iki yüz tuğlayla kurdu. Yani dördüncü iş, onu
geri aşağı getirmek; ve yaşlının *"Henüz yok, ama umarım yakında"* repliği artık
söyleyebileceği son şey olmaktan çıkıyor.

**Dağın cevabını almıyor ve buna da üzülmüyor.** Çukuru, zanaatkâr ona anlattığından
beri biliyor — *"uzun zaman önce; anlattığında senden gençti"* — ve köyün rüzgâr
yerine sahip olduğu şey el: *"Ama eli var. Eli her zaman vardı."* Yani birinin oğlu
ömrünün her günü körüğün başında duruyor, el değiştirdiğinde ateş düşüyor ve köy
istasyonu **2 ve asla 3 değil**. Bu, bir denge kararı değil, zanaatkârın kendi
açıklamasının sayıya dönüşmüş hâli; ve yaşlı da bu konuda doğru şeyi söylüyor:
*"Olmak zorunda da değil. Bir külçeyi bitirecek kadar tutması yeterli."*

**Mekanizma dağınkinden bilerek farklı.** Yukarıda baca bir **beceri** sınavı — o
dağda başka kimse yok ve oyuncu bir bacanın boğazının ne istediğini bilene kadar
kendini boğuyor. Aşağıda bir **tedarik** sınavı: koşul yok, başarısızlık atışı yok,
`success_chances: [1]`, ve dağın 200 tuğlasına karşı 120. Zor kısım tepede çözüldü;
kalan şey bunu ödeyip ödeyemediğin. Değirmen çocukları kimse söylemeden sıraya
diziliyor.

**Ve zanaatkâr asıl istediği şeyi alıyor.** Bacadan sonraki repliği şuydu: *"Bir gün
orada yaptığın bir şeyi bana getir. Kontrol etmek için değil. Sadece bir kez elimde
tutmak isterim."* Onun yerine durabileceği bir yer alıyor; istediğinden fazlası
olduğunu fark ediyor ve bu konuda tam bir cümle boyunca nazik olduktan sonra çocuğa
yanlış üfürdüğünü söylemeye gidiyor.

Artık iki getter var, ikisi de `global_flags` üzerinden ve 4. bölgeyle eklenen kontrol
ikisini de kapsıyor: yanlış yazılmış bir bayrak, iki ocaktan birini sessizce hiç
görünmez yapardı.

### 4. bölge: dağ, ve P-10 tamamlandı

*"Kuzeybatı, yürüyen kayaların ve düşen suyun olduğu yer!"*

PROPOSALS bunu sona bıraktı ve sebebini açıkça yazdı: zaten var. Dağ yolu, Küçük düz
alan, Dağ kampı, Yumuşak dağ yamacı ve Şelale havzası çoktan oradaydı; yani bölgenin
daha fazla zemine değil, orada olmak için bir sebebe ihtiyacı vardı.

**Sebep STORY.md'nin kendi sınır notundaydı.** *"Ekipman tavanı, 5. kademe simya
odunu saplı 3. kademe çelik bir başlık... 3. kademe istasyon olmadığı için 2. kademe
bir istasyonda üretilmiş."* Durum o cümlenin söylediğinden kötü. Oyundaki her zanaat
istasyonunda **dövme ve eritme 1. kademede** — köyde yedi kategorinin hepsi 1'de,
kabile beşini 2'ye çıkardı ve o ikisine dokunmadı — oysa parçalar 5. kademeye kadar
çıkıyor. `roll_quality`, `station_tier - component_tier` alıyor; yani 1. kademe bir
istasyonda dövülen 5. kademe bir parça eksi dört ile atıyor. Oyuncunun bugüne kadar
dövdüğü her şey cezalı dövüldü.

**Çözümü dağa koyan üç şey zaten oyunda vardı.** Kamp oyuncunun kendisinin —
*"daha ileri keşifler için mükemmel bir üs olsun diye senin kurduğun"* — yani kimsenin
onu ona vermesi gerekmiyor. Kampın kendi ortam repliği *"Şiddetli rüzgâr yanından
uğulduyor"* ve bir eritme ocağı hava akımı ister; bu da kampı çekilmez kılan şeyi
ateşi çalıştıran şey yapıyor. Tuğla da demir de hemen aşağıdaki Yakındaki mağaradan
çıkıyor.

**Bunu yaşlı zanaatkâr söylüyor, çünkü öğretisi zaten bu biçimdeydi.** *"Sıçan
derisiyle uğraşarak öğrenebileceklerinin de bir sınırı var, değil mi?"* Adını hiç
koymadığı sınır kendi ocağındaydı: köy bir çukurda, çukurdaki ateşi elle üfürmek
gerekir, el yorulur ve külçe dinlenirken soğur. Anlattığı şeyi kendisi kuramıyor —
*"Ben seksen bir yaşındayım ve rüzgâr bu vadide değil"* — ve bunu kendine acıklı
hâle getirmiyor.

Repliği ona veren şey bir görev işareti değil, kampa varmak: o rüzgârın içinde kendi
kampında dikilmek argümanın tamamı, o yüzden argümanı oda kuruyor.

**Mekanizma bir getter.** `Dağ kampı`nın `crafting.tiers`'ı,
`global_flags.is_mountain_forge_built` okuyan bir `get tiers()` oldu. İki okuyucu da
— üretim anında `main.js` ve kategori düğmelerini yerleştirirken `display.js` —
`current_location.crafting.tiers[category]`'yi canlı okuyor; yani bayrak dışında
kaydedilecek bir şey yok ve `global_flags` zaten kaydedilip yükleniyor. Yanlış
(falsy) bir kademe kategori düğmesini tamamen gizliyor; istenen davranış da bu:
bacadan önce kampta kötü bir ocak değil, hiç ocak yok.

İki değil üç, bilerek. İki, kabileyle eşitlenir ve 4. ile 5. kademe parçaları hâlâ
cezalı atmaya bırakırdı; sınır notunun anlattığı tavanı gerçekten oynatan şey üç.

**Bunun gerektirdiği kontrol.** Bütün bölge tek bir bayrak adına dayanıyor ve bayrak,
sade bir nesnenin dizge anahtarı — `global_flags.is_mountain_forge_buit` undefined'dır,
undefined falsy'dir, yani ocak sessizce hiç görünmez ve hiçbir şey nedenini söylemez.
`npm run check` artık `main.js` dışında adı geçen her bayrağın `global_flags` içinde
tanımlı olmasını istiyor; iki yönde de: özellik olarak okunma ve ödül dizgesi olarak
verilme. İki yönde de negatif test edildi.

**Bununla P-10 kapandı.** Aşçının coğrafya dersinde saydığı dört toprağın tamamı
oyunda: ıslak ormanlar, ovalar, körfez ve dağ. Her biri için söylediği şey, her
birinin ne olduğu çıktı.

### 3. bölge: körfez

*"A-ha~! Ta kuzeyde! Oradan çok baharat, et, metal ve deri gelir! Çok uzaktan! İyi
yerdir gitmek için! Ayrılmak için!"*

PROPOSALS bu bölgenin ayrılmak için bir sebep oluşana kadar beklemesi gerektiğini
söylüyordu; 4. görev o sebebi verdi. Koleksiyoncunun son repliği çıktığı günden beri
cevapsız duruyordu: *"O partide bir parça daha vardı ve geceyi çıkarmadı... o gece
onu almaya gelen kişi pazarlık etmedi."* Körfez, o parçanın gittiği yer.

**Aşçı değil, mubayaacı açıyor.** Aşçı körfezi adlandırıyor ve ne işe yaradığını
söylüyor, ama bir bataklık uzakta ve oraya hiç gitmemiş. Mubayaacı, oyunda işi yol
olan tek kişi - *"Yoldan ne geldiğini ve buraya vardığında ne ettiğini yazıyor"* - ve
ona öbür yönü kimse sormamış. Cevabı bölgenin kendisi: *"Bu masada on bir yıl; kuzeye
boş giden arabaları seyrettim ve içlerinde ne olduğunu yazmam için bir kez bile para
almadım."*

**Yol bir koridor değil, engel.** `Coast road`, Kasaba dışı'na bağlı bir Combat_zone
ve körfezi haritaya koyan şey onu temizlemek. Yeni bir şey değil, dev kurtlar: iyi
yapılmış ama kenarında kimsenin yaşamadığı bir yol tam onların işi ve bölgenin
tehlikesi egzotik olması değil, boş olması olmalı. (Bir Combat_zone'un
`parent_location`'ı ve `leave_text`'i var, kendi seyahat listesi yok; yani ara durak
olamaz - körfez de doğrudan Kasaba dışı'na bağlı.)

**Körfez bir ayrılış olarak kuruldu.** On bir yapı, dokuzu depo; meydan yok, kuyu
yok, sur yok - orada savunulacak bir şey ve buralı bir kimse yok. Sayman,
mubayaacının karşı numarası ve onun ikinci bir kopyası olmaması gerekiyordu:
mubayaacı kendi küçüklüğüyle eğleniyor, sayman kendisinden yorulmuş; ve sayfaya değil
suya bakıyor, çünkü gerçekten saydığı şey orada.

**Tuz evi var, çünkü aşçının repliği bir alışveriş listesi.** *"Çok baharat, et, metal
ve deri"* bir vaat ve onu dürüstçe tutmanın yolu, oyuncunun bugüne kadar yalnızca
yaparak ya da avlayarak edindiği şeylerin durduğu bir raf: külçe hâlinde demir ve
çelik, miktarla deri, çuvalla baharat - hem de 8 kâr marjıyla; bataklıktan da kenar
mahalleden de yüksek. Yeni eşya yok: uzaklık kısmı fiyatta, ganimette değil. Kendi
pazar bölgesi var ve hiçbir yere bağlı değil; çünkü doygunluk oyuncunun tek bir yere
ne kadar yığdığını modelliyor ve körfez, oyundaki diğer bütün pazarlardan bir ay
uzakta.

**Ödül, bir deftere düşülmüş bir satır.** `read the departures`, ovalardaki `read the
ground`'un aynası: merkez odada, Algı'ya bağlı, eşya değil bilgi veren bir eylem.
Verdiği şey **Marrowmoth**: kırk ton, orman yolundan sonraki gece cezirle çıkmış, bir
sandık tartılmamış ve hesap sütununda geri kalan her şeyle aynı elle, üzerinden iki
kez geçilmiş tek bir çizgi. *"Her teknenin bir hesabı olur. Hesap bunun için vardır -
bir şey ters gittiğinde yazılacak bir adam olsun diye."*

Kimin ödediği hâlâ bu oyunda değil. Yeni olan şey, yılda iki kez dönen ve vakti
gelmemiş bir tekne ile geldiğinde sana haber salmayacak bir adam. Bu, kapanmış bir
gizem değil, açılmış bir kanca - ki bu ark tam bunun için var.

**Oyunun kendi doğrulayıcısı, `npm run check`'in yakalamadığını yakaladı.**
`src/verifier.js`, tüccarı olup pazar bölgesi olmayan bir odayı reddediyor ve bunu
`check` çoktan geçtikten sonra, bir tarayıcıda söyledi. Sıra yanlış; o yüzden aynı
iddia artık derlemede de var - odanın kendi girinti düzeyine sabitlenmiş hâlde, çünkü
ilk sürüm Gang hideout'un yinelenen ödülündeki `locks: {traders: [...]}` satırını bir
savaş bölgesindeki dükkân sanıp var olmayan bir kusur bildirdi.

### İngilizcenin kalanı: bakarak değil tarayarak bulundu

Önceki madde, ekran görüntülerinin yanlış alet olduğunu itiraf ederek bitiyor. Bu
da onları değiştirmenin bulduğu şey.

Ekran görüntüsü, o an açık olan paneli gösterir. İki güne yayılan dördü, beş
düzeltme ve beşinci bir bildirim üretti - ve beşinci bildirim haklıydı, çünkü zanaat
penceresi, duruş tablosu, bestiary ve bütün baloncuklar hiçbir ekran görüntüsünde
yer almamıştı. Bu yüzden kaynak tarandı: `innerText`/`innerHTML` atayan ya da
`set_HTML`/`insert_HTML` çağıran her ifadedeki her dizge sabiti, yerel kimlikler,
biçimlendirme ve `material-icons` simge adları çıkarıldıktan sonra.

**Yirmi sekiz yer, iki sınıf.** İlk sınıf beklenen olan - `"Slot:"`, `"Result:"`,
`"Finish"`, `"Sleeping..."`, duruş tablosundaki `"Fav"`/`"Select"`/`"Name"`,
`"Stamina cost:"`, önceki geçişin kaçırdığı iki yerdeki `"Breakdown:"`,
`"(with global: …)"`, `"Materials required:"`.

İkinci sınıf ilginç olanı: **ekrana basmak için biçimlendirilmiş kayıt anahtarları.**
Altı eşya baloncuğu sitesi ve etki baloncuğu, stat etiketlerini anahtardan
`capitalize_first_letter(effect_key).replace("_"," ")` ile kuruyordu; Türkçe oynayan
biri "Attack power" okuyordu. O anahtarları çeviren satırlar - `<stat> long` - ırk
baloncuğu yazıldığından beri vardı; siteler onları hiç kullanmamıştı. Yukarıdaki
maddenin anlattığı boş kuşanma yuvalarının aynı biçimi. Bu sınıfta ayrıca:
baloncuktaki silah türü, bir statın ya da tecrübe bonusunun nereden geldiği
(`skill_milestones`, `light_level`), itibarın hangi bölgeye ait olduğu ve görev
koşulunun üç düzeyinin tamamı.

**İki İngilizce tablo da onunla gitti.** `misc.js` içindeki `stat_names` kendi
kaldırma notunu taşıyordu - *"her şey çevirilere taşındığında kaldırılabilir"* - ve
kaldırılabilirdi: 29 anahtarının hepsinin aynı kısaltmayı tutan bir `"<key>"` yerel
satırı var, yani tablo hiçbir çevirinin ulaşamadığı, varsayılan yerelin ikinci bir
kopyasıydı. `display.js` ve `skills.js` boyunca 15 çağrı noktası vardı; bir kilometre
taşı ödülünün, geri kalanı Türkçe olan bir baloncukta "+3 hp" diye okunmasının sebebi
buydu. `task_type_names` de gitti ve çevrilmemiş olmaktan da kötüydü: görevler beş
tür kullanırken tablo üç girdi tutuyordu, yani görünür bir `reach_skill` görevi
"undefined:" diye çizilecekti. O görevlerin ikisi de gizli, yani kimse görmedi; ama
geri düşüş artık anahtarın adını yazıyor.

**Ve `retranslate_interface`'in kendi boşlukları vardı.** Üç çubuk kendi
güncelleyicileri tarafından çiziliyor ve her biri bir kelime taşıyor; bu yüzden can,
dayanıklılık ve tecrübe eski dilde kalıyordu. Envanter daha kötüydü:
`update_displayed_character_inventory`, hâlihazırda var olan bir satırın yalnızca
adedine, baloncuğuna ve fiyatına dokunuyor; yani eşya adları ve `[use]`/`[equip]`
düğmeleri hiç değişmiyordu. Artık her satırı yerinde değiştiren bir `rebuild`
seçeneği var - `replaceWith` DOM konumunu koruduğu için oyuncunun sıralaması sağ
kalıyor. Duruş listesi `main.js`'ten çağrılıyor, çünkü mevcut duruşu ve favorileri
argüman olarak alıyor.

**Asıl mesele kontrol.** `npm run check` artık taramayı her koşuda yapıyor, yani bu
geri gelemez. Doğru yapmak iki deneme aldı ve iki başarısızlık da kayda değer, çünkü
ikisi de içerik kimliği taramasının başarısızlığının aynısı:

- İlk sürüm `innerText\s*=` ile eşleşiyordu; bu `innerText ===` ile de eşleşir.
  Envanter sıralama karşılaştırıcısındaki `innerText === "[Comp]"` satırını
  işaretledi - bu bir **okuma**. Onu çevirmek, bir sıralama anahtarının içine yerel
  bir dizge sokardı.
- İkinci sürüm satır satır tarıyordu; iki satıra yayılan bir şablon sabiti iki
  dizge olarak bildirildi. `material-icons icon skill_dropdown_icon`'u işaretledi,
  çünkü bu kontrolün doğrulamak için var olduğu düzeltme kapanış `</i>`'sini alt
  satıra taşımıştı. Artık karakterleri yürüyor ve bir sabitin DOM'a ulaşıp
  ulaşmadığına, bulunduğu satırdan değil, içinde durduğu ifadeden karar veriyor.

Üç kusur ekilerek negatif test edildi: düz bir etiket, çok satırlı bir şablonun
içindeki bir etiket ve bir karşılaştırma. İki yazmayı yakaladı, karşılaştırmaya
dokunmadı.

**Tarayıcının bulduğu iki şey daha; taramanın yapısal olarak bulamayacağı türden.**
Eşya baloncuğu `${item.material_type}` basıyordu - bir sabit değil, bir kayıt
*değeri*; ve interpolasyonları sıyırmak, DOM kontrolünün hâlihazırda görünen ad olan
kısımları görmezden gelmesini sağlayan şeyin tam kendisi. Yani o sınıf ters yönde bir
kontrol istiyor: içeriğin bildirdiği değerleri okuyup her biri için satır zorunlu
kılan bir kontrol. `material_type` ve `weapon_type` ona bağlandı ve negatif test
edildi. Yirmi beş malzeme türü satır bekliyordu.

Öteki hiç çeviri hatası değildi: `ui label intuition`'da iki nokta yoktu, oysa bütün
kardeşlerinde var; yani stat paneli İngilizcede de "Dexterity: 10.0" ile "Magic: 0.0"
arasında "Intuition 10.0" okunuyordu. Seviye satırı da yalnızca seviye atlandığında
yazılıyordu, yani `index.html` içindeki sabit `Lvl: 0` oyuncu ilk seviyesini atlayana
kadar duruyordu - İngilizce olarak ve kodun kullandığından farklı kelimelerle. Artık
her seferinde yazılıyor ve biçimlendirme boş.

**Bulunup elle sürülmeyen bir ölü karşılaştırma.** Hiçbir yerde hiçbir şey
`"[Comp]"` ya da `"[Book]"` yazmıyor, yani envanter karşılaştırıcısının o iki dalı
asla eşleşemez. Bu bir çeviri hatasından çok bir üst-akış hatası ve düzeltmek, bir
satırın bileşen olduğunu nasıl duyuracağına karar vermek demek - tahmin etmek yerine
buraya yazıldı.

### 2. bölge: ovalar

*"Güneydoğu! Yılan avlanırdı! Ama yılan bölündü! Ve artık ovalara hiç yılan
gitmiyor!"*

Aşçının dört toprağından ikincisi ve yasının en açık konuştuğu yer. Diğer üç
repliği değişmiş yerleri anlatıyor; bu repliği **terk edilmiş** bir yeri. Yılan
bölündü, yarısı gitti, av sahası da gidenin yanında gitti.

Bu yüzden ovalar bir yokluk olarak kuruldu. Ufka kadar ot, Bataklık tarlaları'nın
güneydoğusu ve içinde avlanan hiçbir şey yok - tehlike olan da bu, güvenlik değil.
Avcısı kalmamış bir av sahasına yerleşen şey **Eski av sahası**: kabilenin bir
zamanlar bastırdığı şeylerin barındığı bir savaş bölgesi.

**Görevin adı onun repliği.** `No Snakes Go to the Plains`, aşçı ovalardan
bahsedince açılıyor ve toprak temizlenince kapanıyor; ödülü de bir eşya değil:
bataklık reisi, yüzüğünü verdiği gün yarıda bıraktığı cümleyi tamamlıyor.
Kasıtlı bırakılmış kanca buydu - adam sözünü ortasında kesiyor ve oyunda hiçbir şey
o cümleye geri dönmüyordu.

**Sürgün kabile bulunmuyor, ve asıl mesele bu.** Ovalar yürünebiliyor, izleri de
orada; ne oldukları bütün bataklığın üstüne kurulduğu soru ve açık kalıyor. Bu
bölge toprağı geri veriyor, insanları değil.

### Dil değiştirmek artık arayüzün tamamını yeniden çiziyor

Bildirilen hata "UI yarı Türkçe yarı İngilizce"ydi; iki güne yayılmış dört ekran
görüntüsüyle. Her ekran görüntüsü düzeltildi ve bir sonraki daha fazlasını buldu -
bu, çözülen değil, peşinden koşulan bir sorunun biçimi.

Sebep yapısal. `translateUI(language)` yalnızca `data-translation` niteliği taşıyan
öğeleri yeniden yazıyor ve `innerText` atıyor - yani ancak içeriğinin tamamı tek bir
etiket olan bir öğeyi sahiplenebiliyor. Oyunun JavaScript'ten çizdiği her şey, ki
oyuncunun baktığı şeylerin çoğu, o an hangi dil geçerliyse o dille bir kez yazılıp
bir daha elden geçirilmiyordu. `option_language` dili değiştiriyor, ekranda hâlihazırda
duran şey için hiçbir şey yapmıyordu.

Cevap `retranslate_interface({location, active_quest_ids})`: saati, parayı,
statları, kuşanılanı, etkileri, itibarı, envanteri, açılmış her yetenek çubuğunu,
bulunduğun konumu ve panelde duran her görevi yeniden çizen tek bir fonksiyon.
`option_language` bunu, `fill_character_bio`, `update_save_load_buttons` ve karakter
oluşturucunun kendi yenilemesiyle birlikte çağırıyor.

Bunu yaparken çıkan üç şey:

- **`fill_character_bio` yeni oyunda hata fırlatıyordu.**
  `playable_races[undefined].name` bir TypeError'dır ve oluşturma ekranında ırk henüz
  seçilmemiştir. Bu fırlatma, yeniden çizim çalışamadan `option_language`'i kesiyordu;
  yani bildirilen "oluşturma ekranında ırk tooltipleri İngilizce kalıyor" hatasının
  **iki** sebebi vardı ve fırlatma ötekini gizliyordu. Artık erken dönüyor.
- **Tarih satırı kaynağında çevrilemezdi.** `game_time.js` sezonu, gün adını ve günün
  vaktini İngilizce döndürüyor ve döndürmeye devam etmek zorunda: `conditions.js`,
  `getSeason()` ile içerikte yazılı `season: {yes: "Summer"}` değerini karşılaştırıyor,
  `toString()` de kaydın `saved_at` damgasını besliyor. Bunları üretildikleri yerde
  çevirmek bir koşulu sessizce bozar ve kayıt verisine Türkçe sokardı. Bu yüzden
  sayılar saatten, kelimeler yerelden geliyor; anahtar da saatin döndürdüğü İngilizce -
  kayıt anahtarlarının zaten kullandığı ayrımın aynısı.
- **Boş kuşanma yuvalarının çevirisi baştan beri vardı.** Her `ui slot <key>` satırı
  mevcuttu; etiket bunun yerine ham kayıt anahtarından kuruluyordu, Türkçe oynayan
  birinin "fishing pole slot" okumasının sebebi bu. Kimlik artık bir değişkene
  hesaplanıyor, ki içerik kimliği taramasının izleyemeyeceği bir şey - bu yüzden
  `npm run check`, yuva listesini `equipment_slots_divs` içinden okuyup 16 yuvanın her
  biri için satır isteyen bir kontrol kazandı.

**Bir şey bilerek İngilizce kalıyor.** Mesaj kaydına düşmüş satırlar, düştükleri dilde
kalıyor. `log_message` kimlik ve parametreleri değil, kurulmuş metni alıyor; yani
kaydı yeniden çevrilebilir yapmak 44 çağrı noktasının ne geçirdiğini değiştirmek
demek. Sessizce yapmak yerine buraya yazıldı.

**Ve ekran görüntüleri yanlış aletti.** Son görüntü de düzeltildikten sonra
`display.js` içinde `innerText`/`set_HTML`'e ulaşan her dizge sabitini tarayan bir
geçiş, hiçbir ekran görüntüsünün denk gelmediği yirmi sekiz yer daha buldu. O geçiş
bir sonraki madde, bu değil.

---

## 2026-08-23

### 1. bölge: ıslak ormanlar

Bataklık aşçısının saydığı dört bölgenin ilki ve şartnamenin tamamı onun repliği:
*"Düşen suyun güneyi! Islak ormanlar! Bizim toplandığımız yer orasıydı! Ama şimdi?!
Sadece yürüyen kayaların evi!"*

Orası **sorarak** bulunuyor. Coğrafya dersinde ormanları adlandıran replik, onları
açan replik; yani ormanları hiç sormayan bir oyuncu bölgeyi hiç almıyor — yalnızca
bir kişinin hafızasında var olan bir yer için doğru sıra bu.

Suyun içinde duran bir orman; kökler dizinizin altında bir yerde, ışık yeşil ve elden
düşme geliyor. Onun yürüyen kayaları taş yengeçler; 700 savunmalarıyla ve dağılmak
yerine dönme alışkanlıklarıyla çoktan vardılar, yani bölge yaratık değil zemin
gerektirdi. Odanın açıklaması Drowned grove'un temizlenme sayısıyla üç aşamada
değişiyor — Waterfall basin'in yengeç üreme alanlarıyla zaten yaptığı gibi. Anahtar
gibi değil, iyileşiyormuş gibi okunan bir bölge.

**Topladıkları şey keten ve bu bir süs değil, bir onarım.** 1. görevdeki lonca
mubayaacısı yirmi Keten kumaş istiyor. Bir kumaş on Flax. O iki yüzün hepsi haritanın
öbür ucundaki tek bir Riverbank herbalism aktivitesinden gelmek zorundaydı; bu da
teslimatı bir arz koşusu değil bir eziyet yapıyordu — 1. görev sahip olmadığı bir arz
zinciriyle yayına çıkmıştı ve bunu, bölgenin kendi kanonu işaret edene kadar fark
etmedim. Toplama alanı Riverbank'in bir-üçüne karşı biçimde iki-altı keten veriyor ve
koru temizlenene kadar kilitli; çünkü burada kimsenin toplamamasının sebebi kayalar.

Aşçı, o derste herhangi bir repliğin bugüne dek aldığı tek cevabı alıyor. Kepçe
tencerenin yarısındayken duruyor, ünlemi deneyip tutturamıyor, ikinci denemede
tutturuyor ve sonra ketenin sıra sıra olduğunu söylüyor — *"Anneannemin anneannesi
onları sıra sıra dikti, su onları korudu, kayalar da üstlerine oturdu"* — ardından
kepçeyi bırakıyor; oyunda bunu bir kez bile yapmamıştı. Sonra, kahkahasız: *"Ruh bugün
biraz daha büyük."*

**Kurarken yakalanan iki şey.** Bölge `aquatic` olarak türlenmişti; o Swimming
eğitiyor, oysa odanın kendi metni yürüyerek geçtiğinizi söylüyor — artık `wet` artı
`narrow`: açık su değil, durgun su ve sık ağaçlar. Ayrıca aşçının repliği Swamp
itibarı verecekti; o ise bir market bölgesi olarak var ve başka hiçbir şey olarak yok:
onu veren de tüketen de yok, yani bir şey gibi görünüp hiçbir şey yapmayan bir ödül
olurdu. Yerine tecrübe veriyor.

Dil başına 2763 anahtar; `check` 1804 içerik id'si, 201 interpolasyon çifti, 269
bildirilmiş textline ve action.

### Sourcemap prodüksiyona gidiyordu

`_site/dist/bundle.js.map` canlıdaydı; 3 MB'ı, isteyen herkese 200 ile
sunuluyordu — çıkarım değil, yayındaki siteye karşı doğrulandı. Yayına çıkma
sebebi `dist`'in `static_dirs` içinde olması ve bütün klasör olarak
kopyalanmasıydı; harita da bundle'la birlikte gitti ve klasörde başka ne olduğuna
kimse bakmadı.

İki bedeli var. Yayımlanan JavaScript yükünü kabaca üçe katlıyordu ve özgün dosya
adlarıyla satır numaralarıyla birlikte tüm minified olmayan kaynağı yayımlıyordu —
ki bütün içerik modeli okunabilir registry anahtarları olan bir oyun için bu,
içeriği de yayımlamak demek.

`dist` artık `static_dirs` dışında ve bundle tek başına kopyalanıyor;
`//# sourceMappingURL=` yorumu da temizleniyor: yorumu bırakmak, her devtools
oturumunu bilerek bulunmayan bir dosyanın peşine gönderirdi ve bu bir karar değil
bozuk bir deploy gibi okunur. Harita hâlâ takip edilmeyen `dist/` içine yazılıyor,
yani yerel hata ayıklama değişmedi. Yayımlanan yük 4,2 MB'dan 1,16 MB'a düşüyor.

`npm run check` artık harita `_site/` içinde görünürse ya da bundle hâlâ bir
haritaya atıfta bulunuyorsa düşüyor. İkisi de negatif test edildi.

### build.js sessizce bozmak yerine reddediyor

Fork öncesi derleyici, bu dokümanlar var olduğundan beri bir tuzak olarak
belgeleniyordu — *"node build.js çalıştırmayın"* — ve bir dosyadaki uyarı, ancak
birinin yıllardır yazdığı komutu yazmadan önce onu okuma olasılığı kadar iyidir.

Tuzağın iki yarısı da güvene dayanarak tekrarlanmak yerine doğrulandı. **Takip
edilen** kök `index.html`'i yerinde yeniden yazıyordu; o dosya geliştirme giriş
noktası ve bilinçli olarak eski bir `style.css` sürümü taşıyor. Bundle sürüm
regex'i olan `/dist\/bundle\.js\?version=[^&"]+/` ise o dosyada tam olarak bir
kez eşleşiyor: canlı etiketin yanında duran *yorum içine alınmış* etiketin
içinde. Yani ölü bir yorumu damgalıyor, oyunun gerçekten yüklediği script'e
dokunmuyor ve üstüne *"Bundle and style versions in .html have been updated!"*
yazdırıyordu.

Silinmedi. Adını ve geçmişini koruyor; gövdesi ise artık bir açıklama ve
`process.exit(1)` — böylece eski talimatları ya da kendi alışkanlığını izleyen biri,
kirlenmiş bir çalışma ağacı yerine gerekçeyi ve çalışan bir alternatifi buluyor.
Dosya, özgün iki kusurunu da kendi başlığında belgeliyor; çünkü ona uzanan birinin
bakacağı tek yer orası.

Sonrasında kontrol edildi: yazdırıyor, 1 ile çıkıyor ve `index.html`'e dokunmuyor;
`npm run build` etkilenmiyor.

Oyuncuya yönelik girdi yok — oyunda hiçbir şey değişmiyor.

### Hiçbir oyuncunun ulaşamadığı içeriği yakalayan bir kontrol

Farenin `who` satırı yazıldığı günden beri erişilemezdi: bir önceki satır onun
yerine `walls`'ı açıyordu, yani oyunda `who`'yu açan hiçbir şey yoktu. Bu, belirtisi
olmayan bir arıza. Hiçbir test fark etmiyor, çünkü içerik sözdizimsel olarak kusursuz
ve her id çözülüyor; hiçbir oyuncu bildirmiyor, çünkü kendisine hiç sunulmamış bir
konuşma dalını bildiremez. Ancak diyaloğun tamamı yorumdayken, geri kazanmak için
satır satır okunduğu için bulundu.

`npm run check` artık açma grafiğini kurup üzerinde yürüyor. `is_unlocked: false`
olarak bildirilen her textline ve action'ı bir şeyin açması, her açmanın da gerçekten
bildirilmiş bir şeyi göstermesi gerekiyor. 268 bildirim, 203'ü kilitli, 230 açma
referansı. **Hepsi erişilebilir, hiçbiri sarkmıyor** — son iki günde kurulan her şey
dahil.

İçeriği açan üç mekanizma var ve üçü de sayılıyor: `rewards.textlines`,
`rewards.actions` ve `.is_unlocked`'ı doğrudan atayan `otherUnlocks` geri çağrıları —
köy muhafızı üçüncü duruş satırını ancak ilk ikisi bitince böyle açıyor.

İlk taslak iki dosya tarıyordu ve köy yaşlısının `more training` satırını ölü olarak
bildirdi. Değil: onu `quests.js` açıyor. Ödüller beş dosyada yaşıyor ve ikisini okuyan
bir erişilebilirlik kontrolü olmayan cesetler uyduruyor. Farenin orijinal hatası geri
konarak negatif test edildi — satırın kendi adını vererek yakalıyor — ve bir açma, var
olmayan bir satıra yöneltilerek.

### CI'da LOCALE_STRICT açık

Eksik çeviri uyarısı, henüz süren bir çeviri için vardı. Türkçe 2739 anahtarın
2739'unda; yani uyarı artık ilk çevrilmemiş anahtarın sessizce yayına çıkma yolu hâline
geldi. CI `LOCALE_STRICT=1` ayarlıyor ve eksik bir anahtar artık hata.

İki yön de sınandı: bir anahtar kaldırıldığında bayraksız çalıştırma uyarıp geçiyor,
bayrakla düşüyor. Tamamlanmamış bir dil eklemek, bunu bilerek yeniden kapatmak demek;
bu, bayrağın okunduğu yerde ve iki AGENTS yarısında da not düşüldü.

Oyuncuya yönelik girdi yok: iki değişiklik de oyunda hiçbir şeyi değiştirmiyor. Bir
sonraki değiştirecek şeyin yayına çıkmadan yakalanması için varlar.

### 1. görev: "Tüccarın Sözü" ve kapının ikinci anahtarı

En son kuruldu ve arkın ilk görevi. Kapı baştan beri iki anahtar sayıyordu —
*"Kasaba şu anda vatandaş ya da tüccar loncası üyesi olmayan herkese kapalı.
İstisnası yok."* — ve yalnızca vatandaş olanı vardı. Tüccar loncası tek bir cümlede
geçen bir isimdi.

**Mubayaacı duvarın dışında oturuyor**; portatif bir masada, bir yazı tahtası, bir
terazi ve kendisine ait olmayan bir arabayla. Bütün tasarım da bu: bir tedarikçinin
satmak için içeri alınmasına gerek yok, içeri alınmaya değer olması gerekiyor. *"Ben
loncadanım; lonca şu duvarın öbür tarafında, ben de bu tarafındayım — bu da loncanın
bir odaya ne kadar para vermek istediğini tam olarak anlatır."*

İstediği şey bir iyilik değil, bir arz meselesi. Çiftlikler tahıl, tepeler yün,
mağara demir gönderiyor; *"hepsi geçen yılın aynısı"*. Hiç gelmeyen şey ise
şelalelerin ötesinden gelen her şey: *"Oradan kimse dönmüyor, yani arz yok, yani
fiyat yok — ve bir şeyin fiyatı olmayan bir lonca, biri sonunda o şeyi getirdiğinde
onunla ne yapacağını bilmiyor."*

Yani: keten, timsah derisi, kurutulmuş et. Üçü de kabile tariflerinden, üçü de
şelalelerin ötesine gitmemiş biri için imkânsız — arkın adını aldığı premis de bu:
kahraman kasabaya **kahraman olarak değil, tedarikçi olarak** giriyor. Yirmi keten,
yirmi deri, otuz kurutulmuş et; ve her seferinde fiyat konusunda dürüst, çünkü
dürüstlük ona hiçbir şeye mal olmuyor: *"Bunu satabileceğin tek kişi benim ve
getirebilecek tek kişi de sensin. İkimiz de bunun tesadüf olduğunu varsayacağız."*

Sonra kâğıt. Lonca binasının içinde hiçbir değeri yok, kapıda ise her şeyi ifade
ediyor: *"çünkü ona vatandaş ya da üye olmayan herkesi geri çevirmesi söylendi ve
bu, loncanın bugüne dek verdiği en ucuz üyelik."*

**Kapının `supplier` satırı `known`'ı birebir yansıtıyor**, çünkü aynı kapı — aynı
lokasyon açılışı, aynı Lost memory adımı, aynı devam satırı. Tek fark hangi
anahtarın getirildiği. Her biri diğerini kilitliyor; böylece Town itibarıyla içeri
girmiş bir oyuncuya artık ihtiyacı olmayan bir kâğıt hiç önerilmiyor. Muhafız onu
iki kez okuyor: *"Portatif masa. Peki. Bunu kimin yazdığını tam olarak biliyorum,
loncanın ona ne ödediğini de biliyorum; yine de seni içeri alacağım, çünkü anahtar
iki tane ve sen birini getirdin."*

### Son iki kontrolle aynı aileden bir kontrol daha

`items_by_id`, bir eylemin oyuncudan mal olarak tahsil etme yolu; oradaki bir yazım
hatası da mümkün olan en kötü biçimde başarısız oluyor: `process_conditions` hiçbir
şeyin taşımadığı bir id arıyor, bulamıyor ve eylem hiç başlatılamıyor — yani oyuncu,
elinde o şeyden dolu bir yığın varken karşılayamadığı bir teslimat görüyor.
`npm run check` artık her gerekli eşya id'sini şablonlara karşı çözüyor; üretilenler
dahil, sadece grep'leyerek değil generator'a sorarak. 18 referans. Harfi ikizleyerek
negatif test edildi.

Bu, iki gün içinde aynı sınıfa yönelen üçüncü kontrol: bir şey yapıyor gibi görünüp
hiçbir şey yapmayan içerik. Diğer ikisi ödül anahtarı doğrulaması ve para koşulu
şekliydi.

### Ark kuruldu

*The Merchant's Word*'ün altı görevinin hepsi var. Kapının iki anahtarı da var, beş
kasaba içinde insanlar var, soygunun kimsenin adını bilmediği bir müşterisi var,
ikinci kapı güçle değil akılla açılıyor ve köy muhafızı sonunda dövüşüyor.

Ve [STORY.TR.md](STORY.TR.md) içindeki "yazılmış ama erişilemez" listesi boş. Town
square, Adventurer's guild, Antique store, Cat cafe, Nekomimi cafe ve Mages guild'in
hepsine ulaşılabiliyor; `cute little rat` diyaloğu, orman gölünün derin dalışı,
`Silver ingot` tarifi ve sahipsiz iki savaş duruşu geri kazanıldı. Dokuz yüksek
değerli yetim, hiçbiri kalmadı.

Açık kalan açık kalıyor: soygunun parasını kimin ödediği, kahramanın o nesneye nasıl
sahip olduğu, muhafızın emekli maceracı olup olmadığı, dört inşa edilmemiş bölge,
sürgün edilmiş kabile ve Sıçan Tanrı.

Dil başına 2739 anahtar; `check` 1783 içerik id'si, 272 ödül nesnesi, 18 gerekli
eşya, 21 dialogue adı, 247 eşya adında; `npm test` 91'de.

### 6. görev: "Senin İçin Fazla Ağır Sıklet"

Onun repliği ve onun yöntemi. Köy muhafızı, köyün bütün oyun olduğu zamandan beri
aynı soruyu savuşturuyor: *"Ohooo, birileri tatlı muhafız ablayı etkilemek mi
istiyor? Kusura bakma ama ben senin için fazla ağır sıkletim`"* — ve ayrıca,
*"Kusura bakma ama olmaz, bu kadarıyla yetineceksin. İnan bana, öğretmen olarak
berbatım; tecrübeyle sabit."*

**Mekanizma çoktan onun içine yazılmıştı.** Oyuncuya ilk üç duruşu veren replik,
`guard teach answ`, nasıl çalıştığını söylüyor: *"İkisi sparring'le kolayca
gösterilebilir, o yüzden onunla başlayalım. Üçüncüsünü anlatmam gerekecek."*
Gösterilebilene dövüş, ancak gösterilemeyene anlatım.

Oyunda hiçbir şeyin vermediği iki duruş — becerileriyle birlikte yazılmış ama
kimsenin ulaşamadığı `Berserker's Stride` ve `Flowing Water` — ancak atlatılarak
öğrenilebilen ikisi. Üçte durmasının sebebi de bu; "öğretmen olarak berbatım"
sözünün alçakgönüllülük değil bir yöntem olmasının sebebi de: elinde sözcüklerin
taşıyabileceği bir şey kalmamış.

Bu yüzden onları öğretmiyor. *"Ders değil — sebebini söyledim ve ciddiydim. Ama
bunlardan iki tane daha var ve ikisi de anlatılamaz… O yüzden durana kadar üstüme
gel; çalmaya değer bir şey görürsen çal. Ben onları böyle edindim. Öğrenmenin
berbat bir yolu."*

**Challenge_zone değil.** "Ben senin için fazla ağır sıkletim" kanon; yani o,
oyuncunun yendiği bir düşman olamaz — kaybettiği bir düello, görevin adını aldığı
repliği yazılmamış hâle getirirdi. Bu, Combat ve Evasion'a bağlı, yinelenebilir bir
spar; ölçtüğü şey çalmaya değer bir şey görecek kadar ayakta kalmak. Başarı metni
iki duruşu da adını anmadan tarif ediyor: iki kez, bulunduğun yerin etrafından
dolanmak yerine içinden geçti, bütün ağırlığını toparlanmasına imkân olmayan bir
vuruşa verdi *"ve toparlandı, çünkü vuruşu savurmadan önce toparlanmayı harcamaya
çoktan karar vermişti"*; iki kez de hiç basmadı, hiç bağlanmadı, *"sanki durmak hiç
listede olmamış gibi"*. Sonra: *"Şimdiden yanlış yapıyorsun. Bir ay boyunca yanlış
yap, o zaman benim değil senin olurlar; daha iyisi de bu."*

**Yanıtlamadığı şey.** Değirmenciler bunu çok önce çözdü ve dokunmamayı seçti: o,
*"sözlü tariflere bakılırsa"*, geri dönmesinden hemen önce emekli olan, kıtanın en
iyi on maceracısından biri. *"Bunu pek önemsemiyor gibi; muhtemelen huzur ve
sessizlik tercih ediyor. Bırakalım öyle olsun."* Öte yandan yaşlı zanaatkâr, soran
herkese onun yetenek yokluğundan başarısız olduğunu anlatıyor.

Sorulduğunda açık açık reddediyor — *"İnsanlar ya istedikleri için ya da mecbur
oldukları için emekli olur; hangisi olduğu bana ait. Sormadın. İyi ettin."* — ve
devriyesine dönerken tek bir şeyi düzeltiyor: *"yaşlı zanaatkâr sana bunun yetenek
eksikliği olduğunu söylediğinde — söyleyecek, herkese söylüyor — bırak söylesin. Ama
yetenek değildi."*

Kahraman seviyesi 25'e bağlı; sınır orası. Çünkü onun tepki verdiği şey, oyuncunun
tetiklediği bir flag değil, oyuncunun ne hâle geldiği.

### P-9'un sıralı işi bitti, Q1 bitmedi

Önerinin tamamlanmış gibi okunmasına izin vermek yerine bunu açıkça söylemek
gerekiyor. P-9'daki uygulama sırası 2. görevi, geri kazanım engellerini, 3. ve 4.
görevleri, 5. ve 6. görevleri kapsıyordu. Beşi de bitti. **1. görev o sıraya hiç
girmemişti ve hiç kurulmadı.**

*The Merchant's Word*, tüccar loncasına ona kabile malı tedarik ederek gövde
kazandıran görev; ve arkın kendi premisi bu — kahraman kasabaya tedarikçi olarak
giriyor. O olmadan kapı yalnızca vatandaş yolundan açıldı: çiftlik sorumlusunun
aşağı yürüyüp kapıya bir isim bırakması. Premisin adını aldığı tedarikçi yolu var
değil ve kapı muhafızının işaret ettiği *"çeşmenin ötesindeki"* lonca mahallesi
hâlâ bir yer değil, bir yön. P-9 bu yüzden `done` değil `active` oluyor.

Dil başına 2711 anahtar; `check` 1769 içerik id'si, 265 ödül nesnesi, 20 dialogue
adı, 247 eşya adında.

### 5. görev: ikinci kapı, gümüşle açıldı

Köyün altındaki salon ne istediğini fork'tan da önce söylüyordu: *"zeminin ortası
kare döşemelerle kaplı; yine de bütün bu karelerin, anlaşılması imkânsız bir
şekilde bir daire yaptığını fark etmemek elde değil… Karşı duvarda bir kapı daha
var, ama onu kaba kuvvetle açamayacağına dair tuhaf bir his taşıyorsun."*

Bu yüzden iki adımda açılıyor ve ikisi de dövüş değil. **Zemini incele** ve hile
dağılıyor: bütününü görmeye çalışmayı bırakıp tek bir kenarı izleyin; kareler
aslında daire değil — gözün ancak daire olarak kabul edeceği kadar basık bir
sarmal. Yani kapı, sarmalın sonu; itilmeyi değil okunmayı bekliyor. Akıma karşı
koymak yerine onu taşıyan ve başka hiçbir işe yaramayacak kadar yumuşak bir şey
gerekiyor.

**Gümüş** — ki o da uydurma değil: `Silver ore` baştan beri *"büyüyü yönlendirme
ya da bozma yeteneğiyle tuhaf"*, `Silver ingot` ise *"silah malzemesi olarak fazla
yumuşak, ama büyülü aletlerde kullanım potansiyeli var"*. Üç külçe bir bulucu
çubuk ediyor. **Sarmalı izle**: çubuk son dönüşte buz gibi oluyor ve kapı
açılmıyor, razı oluyor.

### Gümüş zinciri yazılmış ama iki yerden birden kopmuş

Gümüşün bir işe yaramamasının sebebi buydu ve içerik eksikliğinden değildi.

Orman gölünün ikinci aşama dalışı oyundaki tek gümüş musluğu: temizleyince
`Silver ore` veren `mining` aktivitesi açılıyor. Ödülü
`action: [{location: "Forest lake", action: "mining"}]` diyordu ve bu iki kez
yanlış: tekil `action` bir ödül anahtarı değil, yani `process_rewards` ona hiç
bakmıyordu; `mining` ise bir AKTİVİTE, dolayısıyla doğru `actions` anahtarı altında
bile `.actions` içinde aranıp asla bulunamayacaktı. Dalışın kendisi de kilitliydi;
yazarın notuyla: *"ödülün gerçekten bir işe yaramadığı için kilitli"* — yarısı
doğru, ama kimsenin izini sürmediği bir sebeple.

`Silver ingot` tarifi, seviye aralığı yayındaki demir ve çelik tariflerinin arasına
çoktan doğru oturmuş hâlde, *"gideceği yer bekleniyor"* diye yorumda duruyordu.
İkisi de artık yayında ve aralarında çubuk var: bir kapı için on beş cevher.

**Bu hata sınıfının tamamı için bir kontrol.** `npm run check` artık her `rewards`,
`first_reward` ve `repeatable_reward` bloğundaki her anahtarı `main.js`'in gerçekten
okuduklarına karşı doğruluyor — 263 ödül nesnesi — ve aynısını `locks` için de
yapıyor. Kimsenin okumadığı bir ödül anahtarı doğası gereği sessiz: içerik bir şey
veriyor gibi görünüyor, oyun hiçbir şey vermiyor. Tekil `action:` geri konarak
negatif test edildi; kontrol onu anahtarın adını vererek yakalıyor.

Liste `src/rewards.js`'ten değil `main.js`'ten alındı; çünkü şema dosyasının kendisi
kodun okuduğu dört anahtarı atlıyordu: `skills`, `global_activities`,
`locks.actions` ve `locks.quests`. Artık onlar da belgeli.

### Ratzor Rathai geri kazanıldı

Kapının arkasında küçük, yuvarlak, rahatsız edecek kadar sıcak, işaret
edebileceğiniz hiçbir şeyle aydınlanmayan bir oda ve ortasında bir minder var.
Minderin üstünde de `cute little rat` diyaloğu — bu fork'tan önce bir `/* */`
bloğuna girmiş, yerelleştirme katmanı var olmadan yazıldığı için metni satır içinde
duran yedi textline.

O, Vaat Edilmiş Sıçan Prensi; papası yüce Sıçan Tanrı. Writhing tunnel'ın
doğurduğu soruyu yumuşatmadan yanıtlıyor: duvar OLAN şeylere *"papamın lütfu
verilmiş olur, ama reddetmeye çalışıyor, gerçekten reddedecek kadar güçlü olmuyor,
o yüzden komik görünüyor."* Sadece ruhta, diyor.

İngilizcesi birebir taşındı; *"Infite"* ve *"uppon"* dahil — o onun sesi, tıpkı
`Twist liek a snek`'in yazım hatası değil bir kitap adı olması gibi. Tek düzeltme,
anlatıcının onu tarif ettiği cümledeki `litle`; o anlatım, onun sesi değil.
Türkçesi bataklık kadrosunun zaten kullandığı kaymayı kullanıyor: birinci ya da
ikinci şahıs gerekirken üçüncü şahıs çekimi. Bu, yeni bir icat değil, evin kipi.

**Girişte üç bağlantı hatası onarıldı**, hepsi kopyala-yapıştır. `what`, `who`
yerine `walls`'ı açıyordu; bu da `who`'yu hiçbir şeyin ulaşamadığı bir satır hâline
getiriyordu. `walls` KENDİSİNİ açıyor ve kendisi yerine `monsters`'ı kilitliyordu.
`kill` yine `walls`'ı açıyordu. Ağaç artık hello → what → who → monsters →
{walls, kill, mind}; her biri son durak — ödüllerin açıkça amaçladığı şey buydu.

The Infinite Rat Saga'nın dördüncü adımı, yazıldığından beri *"Daha da derine in
(devam edecek)"* diyordu. Artık *"İkinci kapıyı aç"* diyor ve bitirilebiliyor.

**Tarayıcıda doğrulanmadı.** Playwright hâlâ bağlı değil; bu yüzden iş
`npm run check`'e dayanıyor — ki artık bu görevin tıkandığı hatayı yakalayacak ödül
anahtarı doğrulamasını da içeriyor — artı save denetimine: gerçek bir v0.5.5.30
save'inin her anahtarı yeni içerikle hâlâ çözülüyor.

Dil başına 2695 anahtar; `check` 1760 içerik id'si, 20 dialogue adı, 247 eşya adı,
263 ödül nesnesinde.

### 4. görev: "Üstünde Sadece Pantolon" ve oyunun harcayamadığı para

**Kapı çoktan kapalıydı.** Antique store, koleksiyonunu bu fork'tan da önce
*"çoğu satılık değil, çünkü burası aynı zamanda özel bir müze işlevi görüyor"*
diye tanımlıyordu. Yani antikacının satmaması, bir görev için uydurulmuş bir engel
değil — görevin etrafında kurulmak zorunda olduğu bir olgu; ve daha büyük bir sayı
onun cevabı değil.

İçeri giden yol **menşe**. O nesne değil hikâye alıp satıyor: *"Hikâyesi olmayan bir
nesne mobilyadır."* Komisyoncudan bir parti almış, kıyafetleri satmış — çünkü
kıyafetler ancak kumaş kadar ediyor — ve bir fişe değer tek şeyi saklamış: bir sicim
ve yedi çentikli bir kemik plaka. Onun menşesi kahramanın kendisi ve bu, adamı bir
çekmece açmaya iten tek şey.

Sonrası bedel ve sebebinden hiç utanmıyor: *"Dün bu bir plakaydı. Bugün bu, orman
yolunda bir adamdan alınan ve o adamın bataklıktan yürüyerek dönüp geri istediği
plaka. Bu, satın aldığımdan daha iyi bir nesne ve onu iyileştirmek için ben hiçbir
şey yapmadım. Sen yaptın."* Otuz bin.

**Görevin asıl noktası son repliği.** O partide bir parça daha vardı ve geceyi
çıkarmadı: yassı, avuç kadar, üzerinde dönüp kendi başlangıcına gelen kareler
oyulmuş. Bu kasabayı kırk yıl kataloglamış biri — kilisedeki taş, loncanın beratı,
kuyu — diyor ki *"o, onların eski olduğu gibi eski değildi. O, burada onu yapacak
kimse yokken yapılmıştı ve o gece onu almaya gelen kişi pazarlık etmedi."* Mağaranın
biçimine oraya hiç inmemiş ikinci bir tanık; ve hâlâ isim yok.

### Para koşulu çalışmıyordu

Bu, oyunda para veren değil **alan** ilk şey; ve mekanizması üç ayrı biçimde
belgelenip hiçbiri olarak yazılmıştı.

`src/conditions.js` `money: {number, remove}` diye belgeliyordu. `src/actions.js` iki
kez daha belgeliyordu; biri `{number, remove?}`, öteki
`{Number, remove_on_success?, remove_on_fail?}`. Uygulama ise
`character.money < conditions[0].money` ile çıplak değeri karşılaştırıyordu.
Dolayısıyla belgelendiği gibi yazılan bir fiyat, bir sayıyı bir **nesneyle**
karşılaştırıyordu; bu da asla ondan küçük olmadığı için kapı boş keseyle açılıyordu.
Üstelik ticaret dışında parayı eksilten hiçbir kod yoktu; yani çalışan bir kapı bile
hiçbir şeye mal olmayacaktı.

İçerikte bunu kullanan bir şey yoktu, bu yüzden hiçbiri yüzeye çıkmamıştı:
içerikteki her `money:` bir ödül.

Artık `money_required` tutarı kabul edilen iki biçimden hangisi yazılmışsa ondan
okuyor — çıplak sayı isteyip almıyor, nesne biçimi harcanabiliyor — ve **export
ediliyor**; çünkü main.js, kapının istediğinin tam olarak aynısını tahsil etmek
zorunda. Şeklin iki farklı okuması, bir eylemin bir sayıyla başlayıp başka bir sayı
faturalamasına izin verirdi. Harcama, eşya çıkarmanın zaten durduğu yerde duruyor ve
`add_money_to_character` üzerinden geçiyor ki görünen kese onu izlesin; ayrıca
eşyaların hâlihazırdaki ayrımına uyuyor: `conditions` girdisinde `remove`, bir
eylemin `required`'ında `remove_on_success` / `remove_on_fail`.

Üç yönlü koruma. `npm test` iki şekli, 4. görevin kullandığı tam şekli ve eski
karşılaştırmanın gerçekten boş keseyle geçtiğini doğrulayan bir kontrolü sabitliyor —
yani yenileri boş değil. `npm run check` içerikteki her para *koşulunun*
harcanabilir nesne biçimini, pozitif bir tutarı ve bir çıkarma bayrağını taşıdığını
doğruluyor; oradaki çıplak bir sayı kapıyı doğru tutup hiçbir şeye mal olmazdı, yani
aynı sessiz-geçiş sınıfı. İkisi de negatif test edildi ve kontrol kendi içinde gerçek
bir hata buldu: ilk sürümü `money:`'i ilk virgüle kadar yakalıyordu, dolayısıyla
çıkarma bayrağını hiç görmüyor ve benim kendi fiyatımı bayraksız bildiriyordu.

### Altı eşyanın kendine ait adı yoktu

Plakayı eklerken bulundu: elle yazılan eşyalar bir `name <key>` satırı gerektiriyor
ve o olmadan gösterilen ad İngilizce registry anahtarına düşüyor. Ham kaynak üzerinde
ölçülünce bu **124 eşya** gibi göründü. Yorumlar boşaltılarak ölçülünce — ki mevcut
kontroller bunu yapıyor ve ilk olarak benim de yapmam gerekirdi — sayı **altı**:
diğer 118'i, çalışma anındaki generator'ın yerini aldığı ve yorumlanmış bloklarda
duran elle yazılmış bileşenler.

Altı, uyarmak yerine yazılacak kadar küçük; bu yüzden `Goat meat`, `Cooking herbs`,
`Silica Sand`, `Cooked potato`, `Cooked clam` ve plaka iki dilde de ad sahibi oldu ve
kontrol uyarmak yerine hata veriyor. 246/246.

**Bu kez tarayıcıda doğrulanmadı.** Dil hatasının ikinci nedenini yakalayan Playwright
bağlantısı düştü; dolayısıyla para yolu, satın almayı çalıştırarak değil testleriyle
ve şekil kontrolüyle doğrulandı. Zincirin bağlantı düzeni, uçtan uca sürülmüş olan 3.
görevle aynı şekilde.

Dil başına 2661 anahtar; `check` 1728 içerik id'si, 19 dialogue adı ve 246 eşya
adında; `npm test` 91'de.

### Arkın 3. görevi: "Kasabada Bir Yerde"

Görevin adı, soyguncunun kendi sözleri. Slum'larda yenildiğinde elindeki tek şeyi
veriyor: *"Seni soyan benim grubumdu… Cevap istiyorsan eski patronuma sor. Kasabada
bir yerde."* Bu satır fork'tan da önce oyundaydı ve hiçbir yeri göstermiyordu.

**İki NPC; yazılıp boş bırakılmış iki odada.** Adventurer's guild'in elli civarı
ortam repliği vardı ve konuşacak kimsesi yoktu; Town square'in dokuz repliği vardı
ve aynı durumdaydı. İkisi de bugüne dek hiç dialogue tutmamıştı.

**Lonca kâtibi** adı buluyor. Kuru ve işini bilen biri — aynı anda üç defter açık,
dördüncüsü bir hançerle bastırılmış — ve cevap vermeden önce oyuncunun zaman kipini
düzeltiyor: *"Yönetmiş. Doğru zaman kipi bu ve çoğu insan yanlış kullanıyor."*
Nerede oturduğunu söylemiyor. Tentenin yeşil olduğunu söylüyor.

Yeşil tentenin altındaki **komisyoncu** eski patron; ve çete lideri değil
komisyoncu, çünkü soyguncunun satırı *eski* patron diyor ve bunu kastediyor. Düz
cümlelerle konuşuyor, sesini hiç yükseltmiyor.

**Dönüş noktası: soygun sipariş edilmişti.** Peşin ödenmiş, teslimde yarısı daha.
Adamları o yolu bir hafta tutmuş ve aranacak tek bir şey söylenmiş. Kimseyi soluk
alırken bırakmamaları söylenmemiş — *"o kısma kendileri karar verdi ve benim farklı
yapardım dediğim tek kısım o."*

Vermediği şey kimin ödediği ve bu bilinçli: kanon onu açık tutuyor. Para ona
ulaşmadan önce iki elden geçmiş; insan bir komisyoncuya zaten bunun için para verir.
Temiz sikke olduğunu, kasabada basıldığını ve sayan kişinin bunu daha önce de
yaptığını söyleyebiliyor. İsim yok. *"Olsaydı çoktan satmış olurdum — sana ya da
başkasına."*

**Nesne, iki gizemin arasındaki bağ.** Kese değil, silah değil: avuç büyüklüğünde,
yassı, *"üzerine oyulmuş kareler dönüp başladıkları yere geliyor."* Köyün altındaki
mağarada insan öncesi bir mimari var ve orada *"bütün bu kareler, anlaşılması
imkânsız bir şekilde bir daire yapıyor"* — aynı biçim, aynı sözlerle; hem de oraya
hiç inmemiş ve neyi tarif ettiğini hiç bilmeyen bir adamın ağzından. İki gizem de
cevaba bir adım yaklaşmıyor ve artık fiziksel bir şeyle birbirine bağlı.

Nesne geldiği gece elinden çıkmış, yani 4. görevin geri satın aldığı şey o değil.
Geri kalan her şey tek kalem hâlinde meydanın karşısındaki koleksiyoncuya gitmiş; o
adam *"kötü öder ama hemen öder"* ve **satmaz** — bunu Antique store'un kendi
açıklaması, bunlar yazılmadan yıllar önce zaten söylüyordu: *"çoğu satılık değil,
çünkü burası aynı zamanda özel bir müze işlevi görüyor."* 4. görev, kimse kapıyı
çalmayı akıl etmeden önce kapanmış bir kapıdan başlıyor.

**Bağlantılar ve içindeki tek numara.** Soyguncunun itirafı artık kâtibin sorusunu
da açıyor. O itiraf slum'larda, kahraman on. seviye civarındayken, kasabaya çok
önce gerçekleşiyor — yani satır, oyuncunun henüz görmediği bir tezgâhta bekliyor ve
kendine ait bir flag'e ihtiyaç duymuyor. Üç görev adımı: onu bul, ona yolu sor,
alınanların nereye gittiğini öğren. Kimin ödediği bilinçli olarak aralarında değil.

**Okuyarak değil, tarayıcıda doğrulandı.** Dev sunucu zincirin tamamından geçirildi:
itiraf kâtibin satırını açıyor, kâtip görevi başlatıp yüzleşmeyi açıyor, yüzleşme üç
devam sorusunu açıyor ve son soru görevi bitiriyor. Açıklama üç durumunun hepsinde
Türkçe ilerliyor. `Verify_Game_Objects()` yeni içerikle temiz geçiyor.

### Bildirilen dil hatasının ikinci bir nedeni varmış

Aynı tarayıcı oturumu, önceki düzeltmenin kaçırdığı şeyi buldu. Karakter oluşturma
ekranında dil değiştirmek paneli yeniden çizmeliydi ve yeniden çizme çağrısına hiç
varılmıyordu: `option_language` önce `fill_character_bio`'yu çağırıyor ve yeni bir
oyunda `character.personal.race` henüz atanmamış olduğu için
`playable_races[undefined].name` hata atıp bütün işleyiciyi iptal ediyordu.

O hata bu çalışmadan önce de vardı — bio çağrısı zaten oradaydı ve zaten
düşüyordu — ama görünmezdi, çünkü ardından hiçbir şey gelmiyordu. Oluşturma paneli
yeniden çizimini eklemek ardına bir şey koydu ve istisna onu yedi.
`fill_character_bio` artık kahraman yokken erken dönüyor.

İki yarı da yerine oturunca ve canlı kontrol edilince: onay düğmesi `Onayla`,
ırklar `İnsan`, `Elf`, `Yarı elf`, tooltip Türkçe, üç kategori etiketi Türkçe ve
seçim geçişten sağ çıkıyor. Kodu okumak bunu yakalamazdı. Çalıştırmak yakaladı.

Dil başına 2634 anahtar; `check` 1715 içerik id'si ve 18 dialogue adında.

### NaN uyarıları kapatıldı ve gerçek bir save registry'lere karşı denetlendi

**Tuzak.** `slerp`, toplama sürelerinin, düşen eşya şanslarının ve zanaat başarısının
arkasındaki interpolasyon. Çiftini GEOMETRİK okuyor - `from * (to / from) ** t` - ki
`[30, 10]` bir toplama süresini düz çizgi yerine eğriyle küçülten şey de bu. O biçimin
çift sıfırdan başladığında anlamı yok, çünkü 0'ı yukarı ölçekleyen bir şey yok; iki
uçtan biri negatifken de yok, çünkü negatif bir sayının kesirli kuvveti gerçek değil.
İkisi de `NaN` döndürüyordu ve o `NaN` yol alıyordu: `main.js` içindeki skill xp
korumasına sayısal olmayan bir kazanç olarak varıyordu - işin başında bildirilen konsol
uyarısı da tam olarak buydu.

Artık geometrik biçimin tanımsız olduğu yerde DOĞRUSALA düşüyor. Doğrusal, iki uçta da
geometrikle aynı sonucu veriyor ve arada monoton kalıyor; `[0, n]` yazan bir yazarın
kastettiği şey de bu. `crafting_recipes.js` zanaat başarısı için aynı ifadenin satır
içi bir kopyasını tutuyordu; artık yardımcıyı çağırıyor, yani hatırlanacak iki yer
yerine tek koruma var.

**Hiçbir mevcut sayı kaymadı.** Hiçbir şeye dokunmadan önce ölçüldü: içerikteki 193
interpolasyon çiftinin iki ucu da pozitif, yani düşüş davranışına bugün ulaşılamıyor.
Zaten amaç buydu - bu, tetikleyecek diziyi yazacak kişi için bir tuzak; canlı bir hata
değil.

**Bildirilen üç maddeden biri yeniden üretilemedi.** Market doygunluk bölenine ancak
`sold >= 1e13` iken varılıyor, yani sıfıra bölemez; o yoldaki diğer bölme bir sabite.
İleriye taşınmayı bırakması için çürütülmüş olarak kaydedildi. Bakarken yakındaki iki
işlevsiz çağrı düzeltildi: tek argümanlı `Math.max(sold_by_tier[i] ?? 0)` argümanını
döndürüyor ve hiçbir şeyi sınırlamıyordu.

**Geri dönmemesi için üç koruma.** `npm run check` içerik kaynağındaki her
interpolasyon çiftinin iki ucunun da pozitif olduğunu doğruluyor - 192 çift; 193'üncü
yorumlanmış bir tarifin içinde - ve her push'ta çalışıyor. `npm test` geometrik eğriyi
ve düşüş davranışını sabitliyor; ayrıca ESKİ ifadenin gerçekten `NaN` döndürdüğünü
doğrulayan bir kontrol içeriyor, yani yenileri boş yere geçemiyor. İkisi de negatif
test edildi.

Üçüncü korumanın bir şeyi koruyabilmesi için önce tamir edilmesi gerekti.
`Verify_Game_Objects` toplama kaynaklarını kontrol etmeliydi ve döngüsü
`gained_resources?.length` okuyordu - `undefined`, çünkü `gained_resources` bir
`resources` dizisi tutan nesne. Sıfır tur atıyordu. İçindeki eşya-adı kontrolü hiç
çalışmamıştı. Düzeltildi ve iki ucu pozitif olmayan her çifti bildirecek şekilde
genişletildi.

### `npm run check:save`

Fork'lanan repodan dışa aktarılmış bir savegame analiz için geldi ve projenin en katı
kuralı için elde bulunan en güçlü sınav olduğu ortaya çıktı. Registry anahtarları save
verisidir: eşya id'leri, lokasyon anahtarları, dialogue ve textline anahtarları, skill
id'leri, tarif adları, etkinlik adları. Birini yeniden adlandırmak mevcut her save'i
sessizce bozar ve bütün yerelleştirme çalışması bunu hiç yapmamaya dayanıyordu - hiçbir
şeyin gerçek bir save'e karşı denetlemediği bir iddia. `npm run check` kodu ancak
kendisine karşı doğrulayabiliyor.

Save **v0.5.5.30**, yani yerelleştirme çalışmasının tamamından önce. İçindeki her
anahtar çözülüyor: 61 lokasyon, 14 dialogue, 60 skill, 15 etkinlik, 4 tüccar, 11 görev,
8 kitap, 131 tarif adı ve 90 eşya id'si. Hiçbir şey yeniden adlandırılmamış.

Betiğin öğrenmesi gereken üç şey vardı; her biri önce yanlış bir sonuç üretti:

- **Tarifler skill ve tür başına gruplanıyor** ve aynı ad birden çok skill altında
  meşru biçimde görünüyor. İlk geçiş yalnızca `.items[...]` ile eşleşti ve 44 hayalet
  boşluk bildirdi; çünkü regex'teki `.components` alternatifi grup 2'ye yakalıyordu,
  kod ise grup 1'i okuyordu.
- **Envanter bir JSON dizgisiyle anahtarlanıyor**, id'yle değil: bir yığın hem id'siyle
  hem kalitesiyle tanımlanıyor, parçalardan kurulan ekipman ise hiç id'si olmadan
  bileşenleriyle. Anahtarları id olarak okumak sıfır eşya buldu.
- **203 şablon çalışma anında üretiliyor**; bir materyal ile bir bileşen türünden, yani
  anahtarları hiçbir kaynak sabitinde yok. Üstelik giyilen ekipman, bileşenlerinden
  birleştirilen üçüncü bir ad türü taşıyor. Locale'den materyal ve bileşen adlarını
  çekip eşleştiren bir heuristik doğru göründü ve yanlıştı - parçalar küçük harfle
  saklanıyor, birleştirilen anahtar ise büyük harfli; dolayısıyla üretilen her eşya
  çözülemedi. Betik artık gerçek generator'ı çalıştırıyor.

Sondaki artık `scripts/lib/generated-items.mjs` içinde yaşıyor ve aynı stub'la-çalıştır
işini satır içinde yapan `npm run check` ile paylaşılıyor. Bunun iki kopyası birbirinden
uzaklaşırdı; uzaklaşmış bir kopya da hiçbir şeyi denetlemezken temiz sonuç bildirir.

Save'in kendisi commit'lenmiyor - gerçek karakter verisi - ve `.gitignore`, dışa
aktarmanın öntanımlı dosya adı için bir desen taşıyor; böylece kazayla eklenemiyor.

`npm test` 79 kontrolde; `check` 192 interpolasyon çiftinde.

---

## 2026-08-22

### İşin çoktan yanıtladığı üç öneri kapatıldı

Kayıt tutma işi, ama bırakılırsa yanıltan türden: `PROPOSALS.md`, son haftaların
çözdüğü üç şeyi hâlâ açık olarak anlatıyordu.

**P-9 adım 2** dört geri kazanım engeli sayıyordu. Dördü de kalktı ve bu, güvene
dayanmak yerine kaynağa karşı denetlendi: `inventory_templates["Cat cafe"]`,
`traders.js:517`'de var ve iki kafe tüccarı da onu gösteriyor; Mages guild'in
Nekomimi cafe'nin değil kendi açıklaması var; `src/` ve `locales/` üzerinde
`grep -ric "lorem ipsum"` hiçbir şey döndürmüyor; ve `Location`
`display_conditions`'ı saklarken `display.js` onu çizim anında değerlendiriyor,
yani mofu kapılaması artık push yerinde yapılmak zorunda değil.

**Q-3**, yardım sayfası ile changelog'un Türkçe kapsamında olup olmadığını
soruyor ve Türkçe bir yardım sayfası ile not taşıyan yalnızca İngilizce bir
changelog öneriyordu. İkinci yarısı fazla çekingendi: iki sayfa da Türkçe var ve
oyun içi bağlantılar seçilen dili izliyor. Oyun içi changelog o zamandan beri
geliştirme kaydının parçası oldu; bu da geri kalanı kapatıyor — Türkçe kopyasının
bakımı yapılıyor ve `check` onu şart koşuyor.

**Q-6**, canlı bir dil geçişinin, display modülü bölünmeden var olamayacak bir
"tüm ekranları yenile" giriş noktası gerektirdiğini öngörüyordu. Biçim yanlıştı.
`translateUI`, `data-translation` taşıyan her şeyi hallediyor; geri kalanı paneli
çizilirken `getText` üzerinden çözülüyor. Gerçekten gereken şey, emirsel olarak
kurulup bir daha çizilmeyen iki panel için açık bir yeniden çizim ve o listenin
sessizce büyümesini engelleyen bir kontroldü. Hiçbir şey bölünmedi, yeniden
yükleme de yok.

Bunun için oyuncuya yönelik girdi yok: içindeki, bir oyuncunun fark edeceği her
şey, işi yapan commit'lerden gelen v0.6.0 bloğunda zaten var.

### Kalıntı listesinin kaçırdığı İngilizce metinler için süpürme yapıldı

Önceki girdi, sabit kodlanmış son İngilizcenin bittiğini söylüyordu. Bitmemişti.
Oyuncuya görünen çağrılar içinde İngilizce cümle tutanları arayan bir grep, on altı
yer daha buldu; üçü, aynı geçişin hemen az önce düzelttiği satırın altındaydı.

**Kalanlar.** Üç görev günlük satırı — görevi tamamlamak, adımı tamamlamak, ilerleme
kaydetmek — çevrilmiş olan `Started a new quest:` satırının hemen altında
duruyordu. Zehirli kurbağa ve iki yusufçuk üzerinde altı savaş mesajı;
`on_hit` ile `on_damaged` işleyicilerinin içine
`log_message("The frog's long tongue …")` olarak yazılmışlardı. Yaratıklar
tooltip'inde altı stat etiketi. Ve `ending_text`; oyundaki her konuşmayı kapatan
"Go back" seçeneği.

Altı stat etiketinin ikisi yeni satır gerektirmedi: `Defense:` ve `AP:` için,
karakter panelinden ve eşya tooltip'inden gelen, birebir aynı yazılmış satırlar
zaten vardı. Aynı kelimeleri tutan iki satır, asla birbirinden ayrılmaması gereken
iki satırdır; o yüzden yeniden kullanıldılar.

**Neden saklanabildikleri, düzeltilmeye değer olan kısım.** `npm run check` bildirilen
her içerik id'sinin var olduğunu doğruluyor; ama yalnızca taradığı dosyalarda ve
yalnızca bildiği kalıplarla. `quests.js`, `quest_name`, `quest_description` ve
`task_description` için taranıyordu — parametreli bir günlük satırının ta kendisi
olan `getText` çağrıları için değil. `enemies.js` yalnızca `description` için
taranıyordu. İkisi artık `getText(language, "log …")` ile de eşleşiyor.

`src/dialogues.js` ise taramada hiç yoktu. Depodaki en büyük içerik dosyası. Onu
eklemek kontrolü 1298 bildirilen id'den **1695**'e çıkardı — locale'e karşı hiç
doğrulanmamış 397 textline adı ve metni; hepsi çözülüyor. Kalıp on altı boşluk
girintiye tutunuyor, çünkü bir `Textline`'ın `name`'i metin id'si iken iki seviye
yukarıdaki `Dialogue`'un kendi `name`'i bir registry anahtarı ve ikisini ayıran tek
şey girinti.

Yorumlar önce boşaltılıyor; burada bunun önemi var: yorumlanmış bir diyaloğun
tamamı, ham İngilizce on dört alan tutuyor. Aşağıya bakın.

**Bir saat önce kendi yazdığım kontrolde hata.** Dialogue görünen-ad kontrolü
registry anahtarı üzerinden gidiyordu. `getName` ise `name` *alanını* döndürüyor ve
bir diyaloğun alanı anahtarından farklı: `dialogues["nekomimi proprietress"]`'in
`name: "proprietress"` değeri var. Yani kontrol, hiçbir şeyin ulaşamadığı bir satır
olan `name nekomimi proprietress` üzerinden geçiyordu; kodun gerçekten istediği
satır — `name proprietress` — ise yoktu. Korumak için yazıldığı düğme bir yer
tutucu basıyordu.

Bu, aynı oturumda, aynı sebeple, tüccar kontrolünde az önce düzelttiğim hatanın
aynısı. Alan, anahtara uyacak şekilde yeniden adlandırılamaz: `id` öntanımlı olarak
`name`'den geliyor ve id kayıt verisi. Bu yüzden satır alana uyduruldu, ulaşılamayan
satır silindi ve kontrol, gerekçesi yanına yazılmış hâlde alan üzerinden gidiyor.

**Bulunan ama dokunulmayan erişilemez içerik.** `dialogues["cute little rat"]`
yorumlanmış durumda — yedi textline; Vaat Edilmiş Sıçan Prensi Ratzor Rathai, duvar
gibi şeylerin eskiden insan olduğunu ve kanının papa gücüyle dolu olduğunu
anlatıyor. Bilinçli olarak bozuk bir kipte yazılmış, bataklığın doğurduğu soruları
yanıtlıyor ve bir çeviri boşluğu değil, bir hikâye kancası. Buraya kaydedildi ve
dokunulmadı: onu bağlamak, sıçanın nerede olduğuna ve onu neyin açtığına karar
vermek demek; bu bir içerik kararı.

Bütün bunları bulan süpürme artık hiçbir şey döndürmüyor: `src/` içinde İngilizce
cümle tutan `log_message`, `insert_HTML`, `set_HTML` veya `innerText` yok. Aynı
grep'in hâlâ bildirdiği şey konsol ve `throw` metinleri — "No such recipe as",
"Combat stance cannot target less than 1 enemy!" — ki onlar geliştiriciye yönelik
ve doğru biçimde İngilizce.

Dil başına 2607 anahtar; `check` 1695 içerik id'si, 16 dialogue ve 7 tüccar adında;
`npm test` 70'te.

### Sabit kodlanmış son İngilizce metinler çevrildi, Türkçenin küçük harfle başlaması giderildi

**`src/` ve `index.html` içinde hâlâ beş yer İngilizceydi.** İki `Talk to the X`
kurucusu — `Dialogue` yapıcısının varsayılanı ve "şüpheli adam"ın kendi override'ı
— `Started a new quest:` günlük öneki, yükleme ekranının "sorun yok" satırı ve
sahip olan her lokasyondaki zanaat ile uyku düğmeleri. Son ikisi tuhaf olanlar:
`location.crafting.use_text` ve `location.housing.text_to_sleep` zaten metin id'si
tutuyordu ve düğmeye ham hâlde yerleştiriliyordu; yani oyuncu id'yi okuyordu.
`check`'in içerik id taraması `text_to_sleep`'i kapsayana kadar bekletildiler,
çünkü onlara önce dokunmak, yer tutucu kaldırmak yerine yer tutucu *yaratabilecek*
tek düzenlemeydi.

Yedek kayıt düğmesi altıncısıydı. `update_backup_load_button`, bir otomatik kayıt
varsa metnini parametreli bir id'den yazıyor; ama yedeğin olmadığı dalı dört stil
ayarlayıp dönüyordu. Yani markup'ta kalan İngilizce, otomatik kaydı olmayan bir
oyuncunun okuduğu şeyin tam olarak kendisiydi — kalıcı olarak ve her dilde.

**Önemli bir düzeltme.** `resolveParams`'ın her `getText` parametresini metin id'si
saydığını kaydetmiştim. Saymıyor: `getText` parametreleri doğrudan `fill`'e
geçiriyor, o da onları birebir yerleştiriyor; `resolveParams`'a ise yalnızca
`assembleName` üzerinden ulaşılıyor. Üzerine akıl yürütmek yerine gerçek modülü
çalıştırarak sınandı — çözülmüş bir adı geçirmek işliyor, id geçirmek işlemiyor.

Bu düzeltme canlı bir hata buldu. `main.js`, "You should talk to X" günlük satırını
`{v1: dialogue.getName(...)}` ile kuruyordu; `getName` ise tasarım gereği
*kanonik İngilizce* adı döndürüyor — görünen ad katmanı ayrı bir erişimci. Yani
Türkçe bir oyun, Türkçe bir cümlenin içine "suspicious man" yazıyordu. `display.js`
iki satır ötede aynı çağrıyı `getDisplayName` ile sarmalayarak doğru yapıyor.

**Türkçe bu kalıpların üçünü adla açıyor ve adlar küçük harfle saklanıyor.** 535
`name ...` satırının 489'u büyük harfli, 46'sı değil — ve o 46, tam olarak NPC'ler
ile tüccarlar; İngilizceyle birebir örtüşüyor, çünkü orada büyük harfi kalıbın ilk
kelimesi taşıyor. İngilizce "Talk to the village elder" doğru; Türkçe
"{v1} ile konuş" ise bir düğmede "köy yaşlısı ile konuş" veriyordu.

Bu yüzden üçü `getText` yerine `capitalise` ile `assembleName`'den geçiyor: parçalar
dilin kendi kalıbına yerleşiyor ve *birleştirilmiş* sonuç büyük harfe çekiliyor —
ad başta olduğunda oraya büyük harf koymanın tek yolu bu. İngilizce bundan
etkilenmiyor. Gerçek locale'lerle sınanan sonuçlar: `Köy yaşlısı ile konuş`,
`Köy tüccarı ile ticaret yap`, `Şüpheli adam ile konuşmalısın` — ve mofu-mofu
varyantı için `Enik ile konuş`; onun da kendi `name puppy` satırı var.

Dört `desc component ...` açıklaması aynı kusuru öbür uçtan taşıyordu: `{material}`
ile başlıyorlardı, materyal adları küçük harfli, dolayısıyla Türkçe tooltip
İngilizcesinin "A short blade" ile başladığı yerde cümlenin ortasından başlıyordu.
Gerçek bir kelime öne gelecek şekilde yeniden yazıldı — `Kısa bir bıçak; kaba odun
kullanılarak yapılmış, …` — slot yine eksiz, çünkü Türkçede bir slota ek
getirilemez.

**Üç kontrol ve düzeltilmiş bir test.**

`text_to_sleep` lokasyon taramasına katıldı ve 4 id'sini, ham yerleştirmeyi zaten
yakalayacak olan kontrolün altına aldı. Bir dialogue görünen-ad kontrolü, 15
dialogue'un tamamı artı "şüpheli adam"ın kendi `getName`'inden döndürdüğü iki
varyant için `name <key>` satırı istiyor; o ikisi bir alan olarak bildirilmek yerine
keyfî bir mantıkla seçildiği için. Bir tüccar kontrolü aynısını 7 tüccar için
yapıyor; registry anahtarı değil `display_name` üzerinden: iki tüccar bilinçli
olarak aynı görünen adı paylaşırken ayrı anahtar ve ayrı envanter tutuyor, birinin
`name` alanı ise anahtarından tamamen farklı.

Bu ayrım kayda değer, çünkü önce yanlış yaptım: registry anahtarı üzerinden
tarayınca üç tüccarın Türkçe satırı eksik göründü. Yedisi de çözülüyor.
`suspicious trader 2`, `suspicious trader` olarak görünüyor; `swampland trader 2`,
`swampland trader` olarak; `nekomimi trader`'ın `name` alanı ise
`nekomimi cafe trader` diyor. Yanlış alanı kontrol etmek, olmayan boşluklar
uyduruyor ve gerçek olanı saklıyor.

Mevcut slot-eki testi, Türkçe açıklamanın materyalle `startsWith` olduğunu
doğruluyordu; bu da "slot ek almıyor" ile "slot başta" koşullarını birbirine
karıştırıyordu — dolayısıyla büyük harf düzeltmesi için slot yer değiştirdiği anda
düştü. Kastettiği değişmezi konumdan bağımsız doğrulayacak şekilde yeniden yazıldı
ve bir bileşen açıklaması yeniden `{material}` ile başlarsa düşen yeni bir
değişmezle eşleştirildi. İkisi de, bir açıklama değil dördünün tamamı üzerinde
negatif test edildi. `npm test` 63 kontrolden 70'e çıktı.

Dil başına 2593 anahtar; `check` 1282 içerik id'si, 17 dialogue adı ve 7 tüccar
adında.

### Oyun içi changelog artık kaydın parçası ve yeniden kuruldu

**Yeni kalıcı kural.** Bu dosyadaki her girdi, aynı değişiklik içinde
`changelog.html` ve `changelog.tr.html` dosyalarının ikisine de oyuncuya yönelik
bir girdi olarak işlenir. Hikâye içeriği ve yeni bölgeler, mevcut bir sürümün
içine katlanmak yerine kendi minor sürüm başlığını alır — 0.6.1, 0.6.2. Bu, bu
dosyanın başında duran ve iki kaydı "bilinçli olarak ayrı" ilan eden notu tersine
çeviriyor; ikisi hâlâ *hedef kitle* olarak ayrı — burada geliştirici derinliği,
orada oyuncunun okuduğu anlatım — ama kapsam olarak değil.

`npm run check` bunu kimsenin hatırlamasına güvenmek yerine zorunlu kılıyor: iki
HTML dosyası da sürümü `game_version` ile eşleşen bir başlık taşımak zorunda.
Sürümü yükseltip girdiyi unutan bir yayın, artık kendi changelog'unda kendinden
söz etmeyen bir oyun göndermek yerine derlemede düşüyor.
[AGENTS.TR.md](AGENTS.TR.md) 6. bölümü de aynı sebeple üç yerden dört yere çıktı.

**Sürüm artık `v0.6.0`.** `src/game_version.js` `v0.6` derken `package.json`
`0.6.0` diyordu; ayrıca minor hikâye yükseltmelerinin ihtiyacı da üç parça.
`compare_game_version` kısa tarafı sıfırlarla dolduruyor, yani mevcut bir kayıttaki
`v0.6` hâlâ `v0.6.0` ile eşit karşılaştırılıyor ve ortada bir migration yok.

**İki changelog sayfası da kabuğundan içeri yeniden kuruldu.** Eski markup
`<head>`'i `<body>`'nin *içine* koyuyordu, ne charset ne viewport taşıyordu ve bir
başlığın olması gereken yerde tek satırlık bir talimatla, yalnızca aydınlık bir
sayfa biçimlendiriyordu. 1114 satır girdinin tamamı birebir taşındı — girdi metni
bir yedekle diff'lenerek doğrulandı: 0 kayıp satır, 20 spoiler span'ının hepsi
yerinde — ve yalnızca `v0.6` başlığı yeniden adlandırılıp gövdesi genişletildi.

Yeni olanlar: `<meta charset="utf-8">` taşıyan geçerli bir doküman; güncel sürümü
ve tümünü-aç denetimini içeren gerçek bir başlık; sürüm başına, çizilmiş bir
chevron'lu tek kart; `prefers-color-scheme` üzerinden aydınlık ve karanlık palet;
telefonun yana kaymaması için `pre-wrap`; açılır bloklarda `aria-expanded`; sayfa
açıldığında zaten açık duran en yeni sürüm; ve gösterdiği sürümü açan
`#v0.5.5` tarzı derin bağlantılar. Spoiler'lar artık üzerine gelmenin yanı sıra
tıklamayla da açılıyor, çünkü dokunmatik ekranda "üzerine gelme" diye bir şey yok.

Eksik charset kozmetik bir sorun değildi. `changelog.tr.html`, `help.tr.html` ve
İngilizce karşılıklarının hiçbirinde yoktu. GitHub Pages `charset=utf-8`
gönderdiği için canlı site sorunsuzdu, ama dosyayı yerelden `file://` ile her açış
Türkçeyi bozuk karakterlerle çözüyordu. Dört sayfanın hepsinde artık var.

**İki ölü sürüm göstergesi, düzgün biçimde giderildi.** Changelog'lar
`src/game_version.js`'i modül olarak yüklüyordu ve yardım sayfaları onun
dolduracağı bir `<span class="game_version">` tutuyordu. İkisi de çalışmıyordu:
`src/` deploy edilmiyor, yani o script canlı sitede 404'tü — doğrulandı — ve span'ı
zaten dolduran bir şey yoktu. `scripts/build-site.js` artık span'ı `_site/`
kopyalarında damgalıyor ve sayfa başına tam bir tane bulduğunu doğruluyor;
`npm run check` de damganın yerine oturduğunu kontrol ediyor. Repo kopyaları,
sayfa diskten açıldığında da anlamlı olsun diye okunabilir bir sabit değer
tutuyor. Ölü script etiketi kaldırıldı.

Türkçe changelog'un kendi başlığı hâlâ "Click on blocks to unfold their content"
diyordu — o dosyada önceki çeviri geçişinin kaçırdığı tek metin; çünkü bir girdinin
içinde değil, sayfanın kabuğunda duruyordu.

**Bir düzeltme.** `compare_game_version`'ın gerçek bir hata taşıdığını bildirmiştim:
`if(Number.parseInt(a[i]) && Number.parseInt(b[i]))` koruması bir `"0"` parçası
için falsy oluyor ve karşılaştırmayı string'lere düşürüyor. Bu kadarı doğru ve
yanlış görünüyor. Değil: `"0"`, harf sırasında en küçük rakam dizgisi; dolayısıyla
string dalına ulaşan her vakada bir tarafta sıfır var ve sonuç yine doğru çıkıyor.
Dokunmadan önce `v0.6.0`/`v0.6.10` iki yönde, `v0.6`/`v0.6.0`, `v0.6.9`/`v0.6.10`
ve `v0.10.0`/`v0.9.0` üzerinde sınandı — ve sonra dokunulmadı. Koruma kırık değil,
kırılgan görünüyor.

Bu oturumda toplam üç yeni kontrol, hepsi iki yönde de negatif test edildi:
changelog'un-sürümü-kapsaması çifti, sürüm span'ı damgası ve her sayfanın tam bir
span taşıdığını doğrulayan derleme tarafı doğrulaması.

### Karakter oluşturma panelinin ilk dilinde kalması giderildi

**Oyundan bildirildi.** Karakter oluştururken Türkçeye geçmek onayla düğmesini
çeviriyor, ama ırk adlarını ve tooltip'lerini İngilizce bırakıyordu.

İkisi farklı davranıyor, çünkü onlara farklı yollardan ulaşılıyor. Onayla düğmesi
`data-translation` taşıyan markup; `translateUI` onu yeniden yazıyor. Irk düğmeleri
ise `characterCreator.fill_creation_panel` tarafından JavaScript'te kuruluyor: her
adı ve tooltip'i bir kez `getText` ile çözüp bitmiş DOM'u ekliyor. Sonrasında
hiçbiri id taşımıyor, yani `translateUI`'ın dolaşacağı bir şey yok ve metin hangi
dilde kurulduysa o dilde kalıyor.

Yeni bir oyunda bu her zaman öntanımlı dil demek. `fill_creation_panel` başlangıç
sırasında çalışıyor — oyuncu seçenekler paneline hiç ulaşmamışken — yani panel her
seferinde İngilizce kuruluyor ve bir oyuncunun dilini doğal olarak ayarlayacağı tek
ekran, ayarı yok sayan tek ekran oluyordu.

**Düzeltme yeniden kurmak değil, yeniden çizmek.** `option_language` bu sorunu bir
kez zaten yaşamış ve bio paneli için bir `fill_character_bio()` çağrısı ile,
"başka hiçbir şey onu yeniden çizmiyor" diyen bir yorumla çözmüştü. Oluşturma
paneli de aynı muameleyi gerektiriyordu; `characterCreator.refresh_language()` ona
orada eşlik ediyor.

`fill_creation_panel`'i yeniden çağırmak iki bakımdan yanlış olurdu: ad alanını
`character.name`'den yazıyor, yani oyuncunun yazdığı her şeyi atıyor; ayrıca onay
click dinleyicisini bağlıyor, yani ikinci bir çağrı karakter oluşturmayı iki kez
onaylardı. `refresh_language` yalnızca ırk düğmelerini ve
`config.use_height_bonuses` açıksa boy tooltip'lerini yeniden kuruyor.

Kolayca yanlış yapılabilecek iki ayrıntı. Mevcut seçim `this.race`'ten değil
DOM'dan geri okunuyor; çünkü öntanımlı ırk hiç tıklanmadan aktif işaretli
başlıyor ve oyuncu bir şey seçene kadar `this.race` boş kalıyor — alandan geri
yüklemek, tıklamamış olan herkesin seçimini sessizce sıfırlardı. Sorgular da
doküman geneli değil `hero_creation_panel_race_selection` ile sınırlı: üç kategori
etiketi düğmelerin kardeşi, `data-translation` taşıyorlar ve `translateUI` onları
çoktan halletti.

Tooltip konumlandırması yeniden kurmadan sağ çıkıyor, çünkü `index.html`
`elements_with_restricted_tooltips` içine tek tek düğmeleri değil *kapsayıcıyı*
kaydediyor ve `event.target` üzerinden dağıtıyor — çocukları değiştirmek onun
dayandığı hiçbir şeyi değiştirmiyor.

**İki kontrol, ikisi de negatif test edildi.** `option_language` hem
`translateUI`'ı hem de bir `language_switch_repaints` listesindeki her yeniden
çizimi çağırmak zorunda; emirsel kurulan başka bir panel eklemek, onun yeniden
çizimini oraya eklemek demek. Bu hata biçimi doğası gereği sessiz — panel düzgün
görünüyor, yalnızca yanlış dilde — yani onu başka hiçbir şey yakalamazdı.

`src/races.js` da, daha önce hiç dahil olmadığı içerik id taramasına katıldı.
`name`, `alternative_name`, `description` ve `gameplay_description` alanları
İngilizce değil metin id'si tutuyor ve birindeki bir yazım hatası, karakter
oluşturma tooltip'inin içinde `text not found` yer tutucusu olarak çiziliyor:
oyuncunun bir kez, yalnızca yeni oyunda, yalnızca üzerine gelince gördüğü bir
ekran. 24 id kontrol altına girdi ve sayı 1254'ten 1278'e çıktı. Yirmi dördünün
hepsi iki locale'de de zaten çözülüyordu; yani sorun ırk metninin kendisi hiç
değildi — yeniden çizimdi.

### index.html'deki sabit arayüz etiketleri anahtarlara bağlandı

Arayüzde iki tür metin vardı. `src/display.js`'in bastığı etiketler önceki
geçişlerde `getText`'ten geçmişti ve zaten çeviriliydi. Doğrudan `index.html`'in
içine yazılmış etiketlere ise bunların hiçbiri ulaşmıyordu: onlar yalnızca
`data-translation` niteliği taşıyorsa çevrilir, çünkü `translateUI` tam olarak o
öğeleri dolaşıp `innerText`'i id'den yazıyor. 34 öğe bu niteliği taşıyordu;
geri kalanı, oyuncunun açtığı her ekranda sabit İngilizceydi.

Artık 97 nitelik, 89 ayrı id var. 63 etiket bağlandı: 52'si yeni bir locale satırı
gerektirdi, 11'i ise hâlihazırda var olan bir id'yi gösterebildi — yedi zanaat
kategorisi sekmesi, iki yerde de aynı yazılan `name Tinkering` ve kardeşleri, yani
skill adlarının kendisi; onlara ayrı kopyalar vermek, asla birbirinden ayrılmaması
gereken iki metin yaratmak olurdu. Kapsanan yerler: panel sekmeleri (Savaş,
Görevler, Yaratıklar, Antoloji, Veri), ticaret paneli, zanaat kategori ve alt sayfa
sekmeleri, on stat etiketinin tamamı ve on ipucu, AP etiketi ile ipucu, ekipman
yuvaları, Kaydet / Dışa aktar / İçe aktar, on altı seçenek satırı ve sert
sıfırlama. Dil başına 2537 anahtar 2589'a çıktı.

**`translateUI` `innerText` yazıyor; bir öğenin bağlanabilir olup olmadığını da bu
belirliyor.** Öğenin tüm içeriğini değiştirdiği için, bir öğe niteliği ancak etiket
onun *tamamıysa* taşıyabilir. İki düğme, metninin yanında iç içe bir tooltip div'i
tutuyor; düğmenin kendisini bağlamak ilk dil değişiminde tooltip'i silerdi. Bu
yüzden etiket kendi `<span>`'ini aldı ve nitelik oraya gitti.

**Görünen dört metin bilerek İngilizce bırakıldı.** `Yet Another Idle RPG` oyunun
adı. `Normal stance` ise sabit metin bile değil — `display.js` onu
`stance.getName()` ile eziyor, yani id yalnızca ilk yeniden çizime kadar kazanırdı.
İki kayıt yuvası düğmesi ise ilginç olan: metinleri çalışma anında, sonuna bir
tarih eklenerek yazılıyor; dolayısıyla bir `data-translation` id'si, dil değişiminde
canlı ve tarihli bir değerin yerine bayat bir sabit etiket koyabilirdi. İçe aktarma
düğmesinde markup'taki metin hiç ekranda görünmüyor, çünkü
`update_other_save_load_button` her seferinde üzerine yazıyor. Yedek düğmesi ise
henüz temiz değil: yedeğin olmadığı dalı stilleri ayarlayıp hiç metin yazmadan
dönüyor, yani otomatik kaydı olmayan bir oyuncunun okuduğu şey tam olarak o
İngilizce yer tutucu. Bu gerçek bir kalıntı, sırada o var ve markup'a değil
`display.js`'e ait.

**Yinelenen anahtar kontrolü kendini geri ödedi.** `ui label defense`, item ipucu
için "Defense" değerini zaten tutuyordu ve orada iki nokta kodla ekleniyor; stat
panelinin etiketi ise iki noktası içine gömülü "Defense:". Id'yi yeniden kullanmak
doğru görünüyordu ve ikisinden birini iki dilde de sessizce yanlış yapardı — hiçbir
testin doğrulamadığı, ekranda iki okumanın da makul göründüğü bir biçimde. Panel
etiketi artık `ui stat label defense`.

Adı anılmayı hak eden bir hata, çünkü sessizce başarısız oluyordu. Bağlama betiği
niteliği `open_tag.replace(/>$/, ...)` ile ekliyordu; oysa birkaç etiket sonunda
boşlukla geçiliyordu, yani regex hiç eşleşmedi — etiket metnini siliyor, nitelik
eklemiyordu ve 15 etiketi boşaltmıştı. Son `>`'den önce ekleyerek düzeliyor, ama
asıl ders betiğin hiçbir doğrulaması olmamasıydı: dokunmadığı etiketler için de
başarı bildiriyordu. `index.html` yedekten geri alınıp yeniden çalıştırıldı.

### `dist/` takipten çıkarıldı

**Commit'li bundle'ı okuyan hiçbir şey yoktu.** Deploy workflow'u `_site/`'ı
yüklemeden önce `npm ci && npm run build` çalıştırıyor; yani yayımlanan her bundle
her zaman CI'ın o an derlediğiydi — commit'li kopya hiç sunulmadı. Depo kökü
geliştirme giriş noktası ve `index.html`'i `src/main.js` yüklüyor; dolayısıyla taze
bir klon oyunu build almadan, hiç `dist/` olmadan çalıştırıyor. Ayrıca commit'li
bundle'ı `src/` ile karşılaştıran bir şey de yoktu: `npm run check`, build'in az
önce yazdığı `_site/`'ı doğruluyor; yani yirmi commit boyunca bayat kalmış bir
bundle bütün kontrollerden geçerdi.

Yani ortada, tüketicisi olmayan 4 MB'lık bir artefakt vardı — 1.1 MB bundle artı
2.9 MB sourcemap — ve 121 commit boyunca her içerik değişikliğinde yeniden diff'e
giriyordu. Dahası, duran bir tuzaktı: üretebileceği tek hata biçimi, kaynağı
yeniden derlemeden commit'lemekti; bunu hiçbir kontrol yakalamıyordu ve takipsiz
sürüm onu yapısal olarak imkânsız kılıyor.

**Değişen tek şey takip durumu.** `npm run build`'e dokunulmadı: esbuild hâlâ önce
`dist/bundle.js`'i yazıyor ve `build-site.js` hâlâ `static_dirs` üzerinden `dist/`'i
`_site/` içine kopyalıyor — `_site/dist/bundle.js` oraya böyle geliyor. Kalkan şey,
blob'u diff'lerin ve GitHub dil istatistiklerinin dışında tutan `.gitattributes`
çiftiydi; yol yok sayıldığı anda işlevsiz hâle geliyordu.

Eski düzeni iddia eden ve yalana dönüşecek altı yorum vardı: `.gitignore`,
`.gitattributes`, `build-site.js` başlığı, deploy workflow'unun artifact adımı, iki
README'nin dosya tabloları ve `docs/AGENTS`'ın iki yarısı. Hepsi aynı değişiklikte
düzeltildi. "Commit'lidir, `-diff linguist-generated` işaretlidir" diyen
`docs/AGENTS` maddesi artık tersini söylüyor ve ikinci bir madde kazandı: build'in
`npm run check`'ten önce hâlâ *çalıştırılması* gerekiyor, çünkü check `_site/`'ı
okuyor ve bayat bir `_site/` bir önceki değişikliği doğrulamak demek.

Bu, PROPOSALS Q-5'i kapatıyor. Soru tam da `.gitattributes` ile site derleyicisinin
takipte kalacağı varsayımıyla yazılmış olması yüzünden açık bırakılmıştı. İkisi de
işin kolay yarısıydı; harekete geçme gerekçesi, onu tüketen bir şeyin olmamasıydı.

`build.js` — fork öncesi derleyici; hiçbir npm script'ine bağlı değil ve
`scripts/build-site.js` onun yerini aldı — hâlâ kökte duruyor, aynı çıktı yoluna
yazıyor ve takip edilen kök `index.html`'i yerinde değiştiriyor. İlgisiz bir
değişiklikte sessizce silmek yerine olduğu gibi bırakıldı; artık depoda `dist/`'i
korunması gereken bir şey sayan tek dosya o.

## 2026-08-21

### Başlangıçtaki "text not found" metni giderildi, visitors sayacı kapatıldı

**Hata.** `src/main.js` başlangıç dizisi boyunca oyuncuya görünen metin basıyor -
yükleme ekranı sürüm bloğu, `load()`'un tamamı, yeni oyun kurulumu - ve
`await translationManager.init(language)`'a ancak en sonunda varıyordu. Locale'ler
dinamik `import()` ile getirildiği için bu aramaların hepsinde `translations` boştu ve
`getText` kendi `"text not found, id: X"` yer tutucusunu döndürüyordu. Bildirilen
ekran görüntüsündeki şey buydu.

Ekran görüntüsündeki üç id'den çok daha geniş bir sorundu. Yükleme yolunda init'ten
önce yaklaşık 240 arama tetikleniyordu; yeni bir oyunda kese, Köy açıklaması, Konuş
menüsü, görev paneli ve mesaj günlüğünün ilk satırı hep yer tutucuydu. Yalnızca
Türkçeye özgü de değildi: `language` english olarak başlıyor ve harita english için de
boş. Üstelik kendiliğinden düzelmiyorlardı; çünkü `translateUI` yalnızca
`data-translation` taşıyan öğeleri yeniden yazıyor, `load()` ise yukarıdakilerin
hepsini emirsel olarak basıyor - her panel bir şekilde yeniden çizilene kadar bozuk
kalıyorlardı.

**Düzeltme bir sıralama değişikliği değil, tek bir mekanizma.** `src/translation.js`
artık iki locale'i statik olarak import ediyor ve `translations`'ı modül
değerlendirmesinde dolduruyor. `translation.js`, `main.js`'in gövdesinden önce
değerlendirildiği için init öncesi her arama çözülüyor ve yer tutucu dalı, bir
locale'in içerdiği her id için yapısal olarak erişilemez hâle geliyor. `init()` tam
olduğu yerde kalıyor - paketlenmiş bir locale için artık işlevsiz ve yorumu bunu
söylüyor; çünkü paketlenmemiş gelecek bir locale için hâlâ tek yol ve dil seçici onu
hâlâ çağırıyor.

Başlangıcı yeniden sıralamak değerlendirilip reddedildi. İki locale bellekteyken
düzeltilecek sıralama kalmıyor, ayrıca iki kategori sıralamayla hiç düzelmiyor:
`process_rewards` günlük satırları, çünkü `log_message` yeniden çizecek bir dizi
tutmuyor; ve `load()`'un geçici ilerleme mesajları, çünkü ertelenmiş bir geçiş
çalışamadan üzerlerine yazılıyor.

**Bu arada sağlamlaştırılan üç şey.**

Kaydın `language` okuması `load()`'un ilk ifadesine taşındı. Bugün ondan önce metin
çözen bir şey yoktu, ama yalnızca 3856'ya karşı 3940 payı sayesinde - araya eklenecek
tek bir çizim çağrısı yanlış dilli bir ekranı sessizce geri getirirdi. Ayrıca gizli bir
hatayı da kaldırıyor: okumadan önce hata veren bir `load()`, `language`'ı english'te
bırakıyordu ve kayıt yazıcısı bu düşüşü kalıcı hâle getiriyordu.

Eksik çeviri uyarısı artık dilin gerçekten yüklü olmasına bağlı. `reported_missing`
hiç temizlenmiyor ve uyarı ile hata yolları onu paylaşıyor; yani bir locale yokken
yapılan tek bir arama, o id için gerçek "henüz Türkçeye çevrilmedi" tanısını kalıcı
olarak susturuyordu.

`npm run check` iki doğrulama kazandı: her locale statik olarak import edilmiş ve
`bundled_locales` içinde listelenmiş olmalı; `main.js`'in sunduğu her dil de bunlardan
biri olmalı - aksi hâlde yukarıdaki uyarı kapısı, biri paketlemeden bir dil eklediği
anda sessizce "hep İngilizce" mekanizmasına dönüşürdü. İkisi de iki yönde de sınandı.
`src/main.js` id taraması da `log ` yerine `log |ui ` olacak şekilde genişletildi; bu
da daha önce hiç taranmayan 11 id'yi kontrol altına aldı.

`npm test`, yayındaki kodda düşüp düzeltmeden sonra geçen dört kontrol kazandı -
hiçbir şeye dokunmadan önce hatayı yeniden üretmekte kullanıldılar ve ekran
görüntüsündeki iki id'yi birebir yazdırıyorlar.

**Visitors sayacı kapalı.** Yeni bir `config.show_visitor_counter` arkasına alındı,
öntanımlı false; görsel gizlenmiyor, blok tümüyle atlanıyor. CSS yanlış araçtı:
`<img>`in src'i sayacın kendisi, yani `display: none` her sayfa görüntülemesinin
herkese açık bir sayacı artırmasını ve üçüncü tarafa istek gitmesini sürdürürken
hiçbir şey göstermezdi - gizlemenin tam tersi.

**Kayda geçmesi gereken bir düzeltme.** Bir denetim ajanı, yeni oyun başlangıç
envanterinin hata attığını, çünkü `item_templates["Cheap leather pants"]`in yorumlanmış
bir blokta olduğunu bildirdi; ben de düzgün doğrulamadan bunu tekrarladım. İki kez
yanlış: `dist/bundle.js` minified, dolayısıyla onu `item_templates[...]` için taramak
garantili bir yanlış negatif; ve şablon çalışma anında **üretiliyor** - `cheap leather`
artı `leg armor interior` türü, ki `type_to_name` onu `pants` olarak veriyor. Elle
yazılmış kopya tam da generator onu değiştirdiği için yorumda. Yorumdan çıkarmak,
kayıt verisi olan bir anahtar altında kopya şablon yaratırdı.

Dil başına 2537 anahtar; check 1254 içerik id'sinde; test 63 kontrolde.

### İngilizcenin son kalıntısı da gitti — P-7

**Artık oyuncuya görünen hiçbir metin kodda yazılı değil.** Son tarama,
`display.js` içinde önceki paşlıkların bıraktığı arayüz etiketlerini kapsadı: tek
başına durmak yerine bir değeri saran okumalar, teçhizat yuvası adları,
lokasyon türü temel değerleri ve üretim parçası seçici. Ayrıca `main.js` içindeki
son dördü: iki bayrak açılış mesajı, öntanımlı lokasyon açılış mesajı ve
"Bunu görüyorsan Miktaew bir şeyi eline yüzüne bulaştırmış" diyen mesaj - ki bir
Türk oyuncu onu, tam bir şeyin ters gittiği anda İngilizce görüyordu.

Bitirirken yakalanan iki şey:

- Taşınan iki yer şablon dizgesi değil, düz çift tırnaklı stringdi; yani eklenen
  `${...}` işlevsizdi ve ayrıştırmayı bozdu. Bir interpolasyon ancak backtick
  içinde interpolasyondur.
- `"Unlocked location \"{v1}\""` satırının iç tırnaklarının locale dosyasında
  kaçırılması gerekiyor ve splice script'inin kendi doğrulaması bunu yayına
  çıkmadan yakaladı - her paşlığı koruyan aynı kontrol.

**Sayı nerede durdu.** Dil başına 2536 anahtar; bu iş başladığında 837'ydi.
Kontroller de onunla büyüdü: `npm run check` 1242 içerik id'sinin çözüldüğünü, 203
üretilmiş item'ın hâlâ kendi registry anahtarlarına birleştiğini, hiçbir locale'de
tanınmayan anahtar olmadığını ve site düzeninin dağıtılabilir olduğunu doğruluyor;
`npm test` iki locale değişmeziyle birlikte 59 kontrolde - `%HeroName%` çeviriden
sağ çıkıyor ve her locale referansla aynı `{slot}`ları taşıyor.

[I18N.TR.md](I18N.TR.md) içindeki bilinen boşluklar bölümü yeniden yazıldı: artık
yapılacak iş listelemiyor, yalnızca yapısal olarak sıkıntılı dört yeri ve
sebeplerini anlatıyor.

### 203 üretilmiş item artık adlandırılabiliyor — P-7

**Locale'in hiç görmediği bir item kategorisi.** `src/items.js` oyunun item'larını
tutuyor gibi görünüyor ve önceki paşlık orada bildirilen 245'ini çevirdi. Hepsini
tutmuyor. `src/crafting_component_filling.js` yükleme anında 203 tane daha üretiyor;
her malzeme için her bileşen türünden birer tane — oyundaki her bıçak, sap, kalkan
gövdesi, zırh içi ve zırh dışı. Adları ve açıklamaları string şablonlarından
kuruluyor, dolayısıyla bir locale satırının anahtarlanacağı hiçbir sabit metin yoktu.

Bu aynı zamanda önceki paşlıkta tuhaf görünen bir şeyi de açıklıyor: `items.js`
içinde elle yazılmış bileşenlerden oluşan ~580 satırlık yorumlanmış bir blok ve
yanında birkaç küçüğü daha var. Onlar, generator'ın şimdi ürettiğinin eski hâli.

**Parametreli metin.** `getText` artık isteğe bağlı bir params nesnesi alıyor ve
`{slot}` yer tutucularını yerine koyuyor. Değeri olmayan bir slot boşaltılmıyor,
yazıldığı gibi bırakılıyor — bozuk bir kalıp ekranda görünmeli, sessizce bir kelime
eksiltmemeli. Params her zaman metin id'si; `resolveParams` üzerinden çözülüyor,
böylece tek bir kural var ve hiçbir çağrı yeri yanlışlıkla çevrilmiş bir string
geçiremiyor.

`assembleName` adı parçalardan kuruyor ve parçaları **dilin kendi kalıbına**
yerleştiriyor. Türkçe burada İngilizceyle aynı söz dizimini paylaşıyor, çünkü
malzeme adı eksiz bir niteleyici gibi çalışıyor — ama asıl nokta bu dolaylama:
başka bir sıra gereken bir dil yalnızca `pattern component name` satırını
değiştirir, başka hiçbir şeyi.

**Tam doğru olması gereken iki şey vardı.**

Birincisi, birleştirilmiş İngilizcenin registry anahtarıyla bayt bayt aynı çıkması.
`item_templates` anahtarları kayıt dosyalarına yazılıyor; dolayısıyla bir kalıp
satırına özensiz bir dokunuş, kayıt hâlâ eski anahtarı tutarken item'ları ekranda
yeniden adlandırırdı. `npm run check` artık gerçek generator'ı stub'lanmış item
sınıflarıyla çalıştırıp 196 birleştirilmiş adın ve 98 kuşanılabilir adın tamamını
anahtarlarına karşı doğruluyor. `pattern component name` `{type} {material}` olarak
ters çevrilerek (196 uyuşmazlıkla düşüyor) ve tek bir malzeme satırı silinerek
(8 uyuşmazlıkla düşüyor) sınandı.

İkincisi, bir malzemenin **iki** İngilizce biçimi olması ve bunların birbirinin
yerine geçmemesi. Ad, malzeme bir `name` tanımlıyorsa onu kullanıyor; yani
`rough wood` ekranda `simple wooden` görünüyor. Açıklama ise ham anahtarı kullanıp
"made of rough wood" diyor. Beş malzemede bu ikisi ayrışıyor. Burada hata yapmak
yanlış çeviri değil, item'ı yeniden adlandırmak demek; o yüzden iki biçim ayrı id
alanlarında duruyor — `material name <anahtar>` ve `material <anahtar>` — ve bir
test ikisini de sabitliyor.

**Türkçede bir slot'a ek takılamaz.** İngilizce açıklama "A short blade made of
{material}" diyor. Doğrudan Türkçesi "{material}dan yapılmış" olurdu — ama ayrılma
hâli eki malzemenin son ünlü ve ünsüzüne göre -dan, -den, -tan ya da -ten oluyor:
`demirden` ama `çelikten`, `ketenden`. Bir slot bunu taşıyamaz. Bu yüzden kalıp,
slot'u eksiz bırakacak biçimde kuruldu: "{material} kullanılarak yapılmış kısa bir
bıçak". Bir test slot'un eksiz kaldığını doğruluyor; çünkü bu, sonradan birinin
"iyileştirip" yanlış hâle getireceği türden bir ifade.

Aynı kısıt malzeme adlarının kendisini de biçimlendirdi. İngilizce "iron chainmail"
ile parça sözcüğü "armor"u birleştirip "Iron chainmail armor" yapıyor. Chainmail'in
Türkçesi "zincir zırh"; yani parça sözcüğünü kendi içinde taşıyor. Bu nedenle
malzemenin ad biçimi "demir zincir", açıklama biçimi ise "demir zincir zırh". Aksi
hâlde her zincir zırh "Demir zincir zırh zırh" diye okunacaktı.

**Büyük harfe çevirme locale farkında.** Birleştirilen ad `toLocaleUpperCase` ile
büyütülüyor; çünkü Türkçe noktasız ı'yı I'ya, noktalı i'yi İ'ye çeviriyor. Düz bir
`toUpperCase()` bunlardan yanlışını item adının başına koyardı — yani oyuncunun ilk
okuduğu karaktere.

`custom_names` girdisi olan yedi bileşen — `Wool shirt`, `Linen bandanna` ve
arkadaşları — hiç parça almıyor; çünkü İngilizceleri zaten "<malzeme> <tür>"
biçiminde değil. Onlar kendi `name <İngilizce>` satırlarına düşüyor; o satırları da
önceki paşlık çoktan yazmıştı.

Dil başına 96 yeni locale anahtarı; 203 üretilmiş item'ı, 13 kalkan adını, 85 tam
zırh adını ve üretilebilen her silahı kapsıyor. Türkçe 1459 anahtar üzerinde %100'de
kalıyor, `npm test` ise 56 kontrolde.

### Bataklık kadrosu tamamlandı, Türkçe locale bitti — P-7

**907 anahtarın 907'si.** Kalan son boşluk üç diyalog ağacıydı — aşçı 111, terzi 32,
izci 32 anahtar — ve onlarla birlikte `npm run check` %100,0 kapsam bildiriyor:
eksik yok, tanınmayan anahtar yok.

**"Bozuk konuşma"nın Türkçede neye dönüşmesi gerekiyor.** Kampta bozuk İngilizce
konuşan tek kişi aşçı ve bozukluğu belirli: eksik artikeller, düşürülmüş koşaç
("It good place to go"), telgraf üslubu ünlemler. Türkçede artikel yok ve koşaç
zaten olağan biçimde düşüyor; yani bu işaretleri birebir çevirmek tamamen sıradan
bir Türkçe üretiyor — karakter öylece kaybolur. Karşılığı olan işaretler başkaları:
fiillerde şahıs uyumunun düşürülmesi (cümle `yardım ederim` isterken `yardım eder`)
ve durum eki zorunluyken çıplak isim kullanılması. Satır başına bir iki tane
uygulandı; bir yabancıyı duymaya yeter, okumayı yük hâline getirmeye yetmez.

Bunu tek bir yerde bırakıyor, İngilizcesi de öyle. `whycrabpress answ` içinde
kahkaha kesiliyor ve dilbilgisi birden temizleniyor. Sahnenin bütün derdi bu:
gülmek bir kısıt değil, bir seçim. Türkçesi de orada temiz.

**Kayda geçmeye değer bir çakışma.** Kabilenin motifi "yılanın dişlerini bilemek"
ve doğru fiil `bilemek` — ancak `bile-` artı `-iyor` `biliyor`a çöküyor; yani
*bilmek* fiiline. Konusu, yardım edebilmek için önce kabileyi bilmek olan bir
ağaçta bu masum bir belirsizlik değil. Diğer bütün biçimler güvenli olduğu için
şimdiki zamana ihtiyaç duyan tek satır `bileyip duruyorsun` diyor. Yeniden
keşfedilmek zorunda kalmasın diye [I18N.TR.md](I18N.TR.md) içine yazıldı.

**Terzinin parçaları.** Söylenme döngüsü, her biri iki ucundan da cümlenin ortasında
kesilen sekiz satır — `-boil the linen, he says, as if that'll-`. Türkçe söz dizimi
kesim noktalarına başka malzeme koyuyor; İngilizce parçayı çevirmek ya yanlış yerden
kırılan bir parça ya da beteri, tam bir cümle veriyor. İngilizce yorumlar her
parçanın alındığı tam cümleyi kaydediyor; Türkçesi o cümlenin Türkçesinden kesildi.
Her parça hâlâ düşüncenin ortasında başlayıp ortasında bitiyor; asıl etki buydu.

**İzcinin üç noktaları noktalama değil, nefes.** İngilizcede kasıtlı olarak
tuhaf yerlere düşüyorlar — `the brother... to our last chieftan's bondmate`. Türkçede
söz dizimi kaydığı için onları aynı kelimelerde tutmak mümkün değildi; doğal cümle
duraklarına taşımak mümkündü ve bu, onu sessizce iyileştirmek olurdu. Türkçede
aynı derecede tuhaf düşen noktalara yerleştirildiler.

**Üç ağaç, tek hikâye.** Tabakhaneci birine zırh yapıyor, terzinin bandaj için
ketene ihtiyacı var, izci ise karyolada bir bacağı eksik yatan ve çürüme kokusu
ağırlaşan kişi. Bu ağaçlar günler arayla çevrildi, dolayısıyla terminolojinin
aralarında uzlaştırılması gerekti: `den kin`, şef zaten kendi ağacında öyle dediği
için `in halkı`; şef, İngilizcesi "chief" ile "chieftan" arasında gezinse de baştan
sona `şef`; tabakhanecinin `beş düzine`si ile aşçının `üç kere yirmi`si, karşıtlığın
kendisi karakterizasyon olduğu için ikisi de korundu. Bu, "yukarıdakiyle çelişen bir
şey aşağıda çıkmayacak" kuralının tek ekran değil, bütün bir kamp ölçeğindeki hâli.

**Hitap kipi.** Kahraman terziye `siz`, izciye `sen` diyor. Terzi ne yaşlı ne şef,
ama kahramanın az önce ödünü kopardığı bir yabancı ve Türkçe orada `siz` kullanır;
onun kendi `sen`ine karşı bu asimetri aynı zamanda başta ne kadar kaba olduğunu ve
sonradan özür dilemenin ona neye mal olduğunu taşıyor. İzci ise kahramanın yaşıtı ve
onu müstakbel in halkı olarak anıyor; orada `sen` iki yönlü.

**Yalnızca iş bitmemişken geçen bir test.** Geri düşme kontrolü, çalışma anında
henüz çevrilmemiş ilk id'yi seçiyordu ve üstündeki yorum bunun, daha fazla metin
çevrilmesinin kontrolü bayatlatmaması için olduğunu söylüyordu. Tam tersiymiş: tam
kapsamda çevrilmemiş id kalmıyor, kontrol hiçbir şey bulamadı ve üç doğrulama
düştü. Boşluk artık bulunmuyor, kuruluyor — yalnızca İngilizcede var olan bir
fikstür id'si; böylece kontrol biriken işin boyutunu değil, geri düşmenin kendisini
sınıyor. 48 kontrol geçiyor.

Kapsam %80,7'den **%100,0**'a.

### Düşmanlar, duruşlar ve lokasyon menüsü Türkçe konuşuyor — P-7

31 düşman açıklaması, 32 düşman adı, 2 duruş açıklaması ve 9 lokasyon seçimi
menü etiketi id'lerin arkasına taşındı. Bunları `Enemy.getName()` ve
`Enemy.getDescription()` çözüyor; böylece kayıt verisi olan `enemy_templates`
anahtarları İngilizce kalıyor.

**İki kayıt önce kendi yol açtığım, burada yakaladığım bir regresyon.**
`Stance.getDescription()`, kendi metni olmayan bir duruş için
`skills[this.related_skill].description`a geri düşüyordu. Ham alanı okuyordu ve
skill açıklamaları id'lerin arkasına taşınana kadar bu sorun değildi — taşındıktan
sonra 7 duruşun 5'i ekrana harfi harfine `desc skill Heavy strike` basacaktı. Artık
skill'in kendi `getDescription()`'ını çağırıyor. Nasıl saklandığı da kayda değer:
kendi açıklaması olan iki duruş, gözün ilk düştüğü iki duruş.

Dört düşman kaynakta boş açıklama taşıyor — iki idman muhafızı, şüpheli duvar ve
şüpheli adam. Boş kalıyorlar. Hiçbir şeye çözülen id vermek, ekranda hiçbir karşılığı
olmadan her locale'in kapsam oranına dört kalıcı delik eklemek olurdu.

**Çevirilerine dair.** `Direwolf` → `Ulukurt`: birebir `korkunç kurt` yerine
türetilmiş bir bileşik, çünkü `Kurt`, `Genç kurt` ve `Aç kurt` ile aynı listede
duracak ve bir bakışta onların bir üst basamağı gibi okunacak. `Warthog` →
`Bakla domuzu`, türün gerçek Türkçe adı; ayrıca neredeyse birebir aynı olan
İngilizce açıklamaların kurduğu `Boar` → `Yaban domuzu` eşleşmesindeki `domuz`
bağını koruyor. `Snapping turtle` → `Yılanbaşlı kaplumbağa`, "snapping" üzerinden
bir öyküntü yerine türün gerçek Türkçe adı. MGS3 göndermesi
`Graa~! Yengeç savaşı!` olarak yaşıyor, dev yengecin en büyük-en küçük şakası ise
kelimelerini değil biçimini koruyor.

Kapsam %72,8'den %80,7'ye; referans 907 anahtara çıktı.

---
## 2026-08-19

### Hiçbir şey değiştirilmeden önce iki denetim — P-1

İş, düzenlemekle değil okumakla başladı: mimarinin, içerik katmanının, i18n
hazırlığının ve çataldaki ayrışmanın teknik denetimi; bir de hikâye omurgası, açık
uçlar, öksüz içerik, NPC yayları ve ilerleyiş sistemleri üzerinden bir anlatı keşfi.
İkisi de tek başına bir değişiklik üretmedi. Ürettikleri şey, aşağıdaki her şeyin
çıktığı listeydi: README'nin yeniden yazılması, yerelleştirme, NaN uyarıları ve
hikâyenin sürdürülmesi; hepsi sonradan akla gelen fikirler değil, bu iki taramanın
bulguları.


### Sabit kodlanmış metin envanteri çıkarıldı, skill açıklamaları taşındı — P-7

**Önce kalanın büyüklüğü.** `src/` içinde hâlâ kodda yazılı olan oyuncuya görünen
metin tarandı ve her değerin zaten bir metin id'si olup olmadığına göre sınıflandırıldı:

| Kategori | Adet |
| --- | --- |
| Görünen adlar — item 138, tarif 131, lokasyon 108, düşman 32, activity 15, trader 7 | 431 |
| Açıklamalar — item 196, lokasyon 108, skill 64, efekt 47, activity ~30, diğer ~40 | ~485 |
| Lokasyon eylem metni — starting, success, custom, unlock, leave | ~244 |
| **Kalan** | **~1160** |

Ham grep 1567 alan bildirimi diyor, ama bu fena hâlde fazla sayıyor:
`dialogues.js` içindeki `name:` bildirimlerinin 195'i `"elder hello"` gibi Textline
**id'si**, yani çoktan taşınmış. Yukarıdaki sayı, her değerin locale anahtarlarına
karşı test edilmesinden sonra çıkan sayı — id ile ham metni gerçekten ayıran tek test bu.

Yani bu tek paşlık değil, çok oturumluk bir iş. Artık tahmin değil, ölçülmüş durumda.

**Skill açıklamaları tamam: 64 tanesi, kopyalanmadı taşındı.** `src/skills.js` artık
`description: "desc skill <id>"` taşıyor, İngilizce metin ise `locales/english.js`
içinde. Kopyalamak aynı paragrafı iki dosyada, hiçbir şey onları eş tutmazken
bırakırdı; taşımak tek doğru kaynak demek — istenen de bu.

Id biçimi `"desc <tür> <registry id>"`; `"name <İngilizce>"` isim alanının aksine
İngilizce metinle değil id ile anahtarlanıyor. Bir açıklama paragraftır ve paragraf
kötü bir anahtardır; id ayrıca İngilizce yeniden yazıldığında da sabit kalır.
`Skill.getDescription()` onu çözüyor ve `skill.description` okuyan tek yer artık onu
çağırıyor.

`npm run check` bunları kapsıyor: 108 içerik metin id'si bildirildi, hepsi çözülüyor.
Kasten yazım hatası ekleyip derlemeyi başarısız kıldığı doğrulandı.

**Üç kez çarptığım ve nihayet kapattığım bir hata.** Bir regex'i `\b` ile shell
heredoc üzerinden yazmak onu bozuyor: kaçış dosyaya gerçek bir backspace baytı olarak
iniyor, dolayısıyla desen sessizce bir kontrol karakteri arıyor ve hiçbir şey
bulamıyor. İlk seferinde gerçek zaman kaybettirdi, satırın hex dökümüyle teşhis
edildi ve iki kez daha tekrarladı. Satır başına çapalamak bozulmayı düzeltti ama
`new QuestTask({task_description: "..."})` gibi satır içi bildirimleri kırdı — kontrol
108 yerine 77 id sayınca ortaya çıktı. Desenler artık açık bir
`(?<![A-Za-z0-9_])` lookbehind kullanıyor: uzun uzun yazılmış bir word boundary,
shell'in bozabileceği hiçbir kaçış içermiyor. Düzeltme script'i ayrıca hiçbir kontrol
baytının hayatta kalmadığını da doğruluyor.

**Açıklamaları okurken bulunan iki kaynak hatası**, sessizce düzeltilmek yerine
bildirildi; çünkü açıklama metni uydurmak, özgün metni yeniden yazmama kuralına
aykırı olurdu:

- `Flowing water` ile `Berserker's stride` **birebir aynı** açıklamayı taşıyor —
  kopyala-yapıştır. Akan su "kendi savunmasını tamamen yok sayan" bir stil olarak
  anlatılıyor, ki bu hem adıyla hem stat'larının ima ettiği savunma-hareketlilik
  rolüyle çelişiyor. Türkçe İngilizceye sadık, dolayısıyla tekrar İngilizce yeniden
  yazılana kadar iki dilde de görünür.
- `Gathering mastery` "with enough practice you being to see some commonalities"
  diyor — "being" değil "begin" olmalı. Türkçe amaçlanan anlamı taşıyor.

**Çevirilerine dair.** Bunlar tooltip metinleri: bilgilendirici, ama oyunun alaycı
sesini taşıyorlar ve onu yavanlaştırmak kolay hata olurdu. "Don't look at the sun,
it's bad for your eyes" omuz silkmeye devam ediyor. "Why bother trying to cut someone,
when you can just crack all their bones?" neşesini koruyor. "Making the inedible
edible" → "Yenmeyeni yenilebilir kılmak"; İngilizcesiyle aynı biçimde. Wide swing
açıklamasındaki `<br>` etiketi olduğu gibi korunuyor.

Kapsam %77.4'ten **%79.1**'e; referans, açıklamalar taşındıkça 837 anahtara çıktı.

### Yaşlı tamamlandı ve bataklığın iki ayrı sesi var — P-7

72 id daha: köy yaşlısının kalan 34'ü, bataklık şefinin 20'si, tabakhanecinin 18'i.
Kapsam %68.0'den **%77.4**'e.

**Yaşlı bilinçli olarak önce bitirildi.** Yarı çevrilmiş bir NPC, bir konuşmayı
bırakılabilecek en kötü durumdur; çünkü register ve ses tam ortasında kırılır. Kalan
kısım ağır olanıydı: köy genişleme arkı, yengeç söylentileri, muhafızın geçmişi ve
verdiği muska — `STORY.md`'nin kanon olarak alıntıladığı *"Many leave looking for
better lives and we never hear from them again"* satırı ve kahramanın bu köyde her
zaman bir evi olduğuyla kapanan hayır duası dahil. O ikisi ağırlık taşıyor; yavan bir
aktarım yanlış bir kelimeden pahalıya gelirdi.

**Bataklık kadrosu hakkında yanılıyordum.** Bataklık NPC'lerinin kırık İngilizce
konuştuğunu ve çevirinin bu bozukluğu yeniden üretmesi gerektiğini söylüyordum. Bu
aşçı için doğru. Şef için ise tam tersi: yüksek, tören havalı, savaşçı bir registerde
konuşuyor — *"How bold of you to walk so brashly through our grounds"*, *"no quarter
to give"*, *"pay fealty to our strength"*, *"honored friend"*, *"den kin"*. Onu kırık
konuşmayla çevirmek karakteri yok ederdi. Türkçe, İngilizcenin devrik olduğu yerlerde
devrik, hafifçe arkaik bir register kullanıyor; pastişe kaymadan.

Tabakhaneci ise üçüncü bir ses: yaşlı, yorgun, koruyucu; `shan't`, `need not`,
`I know not how` gibi biçimlerle. Orada iki karar:

- **Hitap olarak `child`, `çocuk` değil `evladım`.** Türkçede bir büyüğün genç birine
  `çocuk` demesi küçümseyicidir; `evladım` ise İngilizcenin taşıdığı
  sevgi-artı-otoriteyi taşıyor.
- **Kadın düzine ile sayıyor, kahraman altmış ile.** O "five dozen alligators" diyor;
  kahraman "the 60 alligator skins" diye yanıtlıyor. Bu özensizlik değil bir register
  işareti, o yüzden Türkçe onda `beş düzine`, kahramanda `60` olarak korunuyor.

### Kendi kip haritama bir düzeltme

`STORY.md` bataklık kadrosunun tamamını samimi hitap grubuna koymuştu. Bu fazla kabaydı
ve tabakhaneciyi çevirmek bunu açığa çıkardı: kadın yaşlı ve oyuncunun ona ilk repliği
*"Excuse me, are you the leatherworker?"* — apaçık saygılı. Resmî gruba taşındı, tablo
da artık öyle diyor.

Bundan çıkan kural yazıya geçirilmeye değer: kip haritası ile kaynak metin
çeliştiğinde kaynak metin kazanır ve harita düzeltilir. Harita, yazının bir özetidir;
onu kısıtlayan bir kural değil.

### Bütün skill adları Türkçe — P-7

30 stance ve NPC adının üstüne 74 skill rütbe adı. Kapsam %64.7'den **%68.0**'e;
İngilizce referans 773 anahtara çıktı, çünkü her ad orada da listeleniyor — böylece
çevrilmiş bir anahtardaki yazım hatası sessizce yedeğe düşmek yerine derlemeyi
başarısız kılıyor.

**Buradaki asıl iş rütbe merdiveni.** Skill'ler farklı seviyelerde farklı ad
gösteriyor — `names: {0: "Beginner gatherer", 10: "Apprentice gatherer", 25: "Adept
gatherer", 35: "Expert gatherer", 50: "Master gatherer"}` — ve aynı sıfatlar başka
skill'lerde de tekrarlıyor, dolayısıyla hepsinin tek bir Türkçe merdivene, sapma
olmadan eşlenmesi gerekiyordu. Seçilen merdiven **Acemi → Çırak → Kalfa → Uzman →
Usta**; yani çevrilmiş sıfatlar dizisi değil, Türkçenin gerçek zanaat hiyerarşisi.
Oyuncu onu bir lonca rütbesi olarak okuyor — ki öyle.

Tekrarlayan diğer terimler de aynı şekilde sabitlendi: üç silah/zanaat/duruş çiftinde
`proficiency` → yetkinliği ve `mastery` → ustalığı; hem Haşere hem Dev ailesinde ayrı
tutulan `killer` → avcısı ile `slayer` → kıyıcısı; hâlihazırda yayınlanmış stat
etiketleriyle uyumlu `resistance` → direnci; `X combat` → X dövüşü, `-manship` →
kullanımı, `casting` → büyücülüğü.

**Kaynağa karşı kendim doğruladığım iki karar** — çünkü ikisi de birebir çevirinin tam
olarak yanlış yaptığı türden:

- **Brawling → "Sokak kavgası"**, "Sokak dövüşü" değil. `skills["Unarmed"]` meğer
  `names: {0: "Unarmed", 10: "Brawling", 20: "Martial arts"}` taşıyor; yani Brawling,
  tepesi Martial arts olan bir merdivenin orta basamağı. Türkçede `dövüş` disiplinli
  kelime — Combat'ın Dövüş, Martial arts'ın Dövüş sanatları olmasının nedeni de bu —
  oysa `kavga` gerçek bir arbedenin adı. `kavga` kullanmak orta basamağı doğru biçimde
  disiplinin *altına* yerleştiriyor ve `dövüş`ün yedinci bir adda görünmesini
  engelliyor.
- **Wooden skin → "Tahta deri"**, "Ahşap deri" değil. Skill aslında
  `skills["Iron skin"]`; `names: {0: "Tough skin", 10: "Wooden skin", 20: "Stone skin",
  30: "Iron skin"}` ve açıklaması kahramanın kendi derisinin tekrarlanan hasarla
  sertleşmesinden bahsediyor. Yani bu bir malzeme değil, sertlik kıyaslaması: `tahta`
  gündelik olan (*tahta gibi sertleşmek*), `ahşap` ise işlenmiş kereste demek — o yüzden
  Woodworking'de doğru, burada yanlış. Ahşap ailesi zorunlu olarak üçe ayrılıyor:
  kesilmiş kütük için `odun`, işlenmiş kereste için `ahşap`, sertlik için `tahta`. Bu
  tutarsızlık değil, doğrusu bu.

İkisi de sağlam çıktı. Merdiven **Sert → Tahta → Taş → Demir deri** olarak okunuyor.

Bir stance'ı gölgeleyen altı skill adı aynı paştan geldi ve mükerrer olarak
düşürülmeden önce dosyada zaten bulunan biçimlerle birebir karşılaştırıldı; böylece
stance butonu ile skill satırı çelişemiyor.

Bir ad istediğimden uzun oldu: Scrambling → "Engebeli arazi hareketi". Açıklamasına
sadık — engebeli veya kaygan zeminde hızlı ve sağlam basarak hareket etmek — ama liste
etiketi için kelimeli. Doğruluk kazandığı için olduğu gibi bırakıldı, oynanışta
rahatsız ederse diye not düşüldü.

### Görünen adlar artık çevrilebiliyor — P-7

Köy muhafızının diyalogunu çevirmek bir uyumsuzluk yaratmıştı: kadın "hızlı adımlar"
diye anlatıyor ama bahsettiği buton hâlâ "Quick Steps" yazıyordu. Bu onu kapatıyor ve
diğer bütün ad türlerine aynı mekanizmayı veriyor.

**Adlar neden yerinde çevrilemezdi.** Bir registry girdisi İngilizce adını kodda
taşıyor ve item'lar için o ad kimlikle de iç içe — `this.id = this.getName()` birkaç
constructor'da çalışıyor ve id, save dosyasının tuttuğu şey. Bu yüzden tasarım
İngilizceyi kanonik bırakıp çeviriyi üstüne koyuyor: `getDisplayName(dil, ingilizce)`
`"name <İngilizce>"` anahtarını arıyor ve girdi yoksa İngilizceyi olduğu gibi geri
veriyor. Hiçbir şey kaybolamıyor ve özelliğin çalışması için hiçbir locale'in bütün
adları listelemesi gerekmiyor.

`getOptionalText` bunun genel biçimi: yalnızca aktif dil, varsayılana düşme yok,
`"text not found"` yer tutucusu yok. Ayrım tam da bu — `getText` her zaman
gösterilebilir bir şey üretmek zorunda, oysa bir görünen adın elinde çoktan gayet iyi
bir İngilizce yedeği var.

**Her ad türü için tek düz isim alanı.** Skill'ler, stance'lar, NPC'ler ve ileride
item'lar hep `"name <birebir İngilizce metin>"` kullanıyor. Üç registry için üç id
şeması, hatırlanacak üç şey olurdu.

Bağlananlar: `Skill.name()` (kanonik biçimi artık `english_name()`, hâlâ rütbe adını
seviyeye göre seçiyor), yeni bir `Stance.getName()` ve onun beş çağrı noktası, ve
konuşmanın üstündeki NPC başlığı.

**Kaydedilmeye değer bir tuzak.** Altı stance adı, aynı adı taşıyan skill'den yalnızca
büyük/küçük harfte ayrılıyor — stance olarak `"Quick Steps"`, skill olarak
`"Quick steps"`. İsim alanı harf duyarlı, yani ikisinin de girdisi olmalı, yoksa buton
ile skill satırı farklı şey gösterir. İkisi de mevcut ve bir test aynı Türkçeye
çözüldüklerini doğruluyor. `src/` içindeki harf kullanımını uyumlulaştırmak bu
tekrarı kaldırır ve güvenlidir — skill adları id değil — ama o ayrı bir değişiklik.

**İngilizce locale de adları listeliyor, bu bilinçli.** Yedek mekanizma o satırları
ekrana basmak için gereksiz kılıyor. Var olma sebepleri, başka bir locale'deki anahtar
yazım hatasının derleme hatasına dönüşmesi: onlar olmasa `"name Quick Stesp"` sessizce
İngilizceye düşer ve kimse fark etmezdi.

**Skill sıralaması locale duyarlı.** Adları `>` ile karşılaştırıyordu; bu kod birimine
göre sıralayıp aksan taşıyan her harfi `z`den sonraya atıyor. Karşılaştırma artık isim
dalının içinden dönüyor, aşağıya düşmüyor — çünkü diğer dallar sayı karşılaştırıyor ve
orada `localeCompare` yanlış olurdu.

Şimdiye kadar 30 ad çevrildi: yedi stance, onları gölgeleyen altı skill adı, on beş
NPC ve şüpheli adamın duruma bağlı iki takma adı. Stance adları, muhafızın diyalogunda
zaten söylediğiyle eşleşecek şekilde seçildi. 49 kontrol.

Bunu bağlarken kayda geçirildi: bir NPC'nin başlangıç metni `"Talk to the "` artı ad
olarak birleştiriliyor, yani parametreli şablona dönüşmeden yerelleştirilemez.

### Köy ve slum'lar Türkçe konuşuyor — P-7

Beş NPC'de 185 diyalog id'si: köy muhafızı, iki değirmenci, şüpheli adam ve
slum'ların yaşlı kadını, yaşlı zanaatkâr ile kapı muhafızı ve kafe işletmecisi, ve
çiftlik sorumlusu. Kapsam %35.4'ten **%63.1**'e çıktı.

Her NPC tek bir bağlam birimi olarak çevrildi, ardından tek görevi taslağı makine
çevirisi sanıp satır satır aksini kanıtlamak olan bir inceleyiciye verildi. O ikinci
paş hakkını verdi. Yakaladıkları:

- **Eksik karşılaştırma eki.** "tarlada çalışmaktan iyi para getirir" ifadesinde
  `daha` yok; bu hâliyle "tarlada çalışmaktan uzakta iyi para getirir" gibi
  ayrışıyor, "daha iyi para öder" gibi değil. Replik bir iş teklifi; karşılaştırmayı
  kaçırmak onu tersine çeviriyor.
- **Sahte dost.** "quick footwork" ifadesi "ayaklarını çabuk tutmakla ilgili" olmuş,
  ama "ayağını çabuk tut" Türkçede *acele et* demek. Muhafızın bir dövüş duruşunu
  anlattığı replik, kahramanı acele etmeye çağırıyor gibi okunuyordu.
- **Bağlam-birimi kırılması, en incesi bu.** "I'm way too strong for you" ifadesi
  "benim gücüm senin boyunu çok aşar" olmuş. Deyim dışı olmasının ötesinde —
  "boyunu aşmak" bir *işle* eşdizimlidir, kişinin gücüyle değil — boyla ilgili birebir
  bir okumayı devreye sokuyor; hem de kahramanın başına uzanamamasına dair bir repliği
  olan tek NPC'de. Şaka yanlış yere düşecekti. Yerine bir Türkçe dövüş deyimi
  kuruldu: "ben senin için fazla ağır sıkletim~".
- **"el idman"** — `el` bir iskambil turu, idman turu değil.
- **"kırılgan düşmanlar"** — Türkçede duygusal kırılganlık okunuyor.
- **Yavanlık.** "I know that from experience" birebir çevrilmiş; oysa Türkçede aynı
  işi yapan iki kelimelik bir deyim var: "tecrübeyle sabit".

Kelime kelime çevirmeme kuralının ne kazandırdığını görmek isteyen, şüpheli adama
bakmalı. Kekemeliği İngilizce metne tirelerle yazılmış — "Y-yes", "b-bad" — ve Türkçe
onu İngilizce harfleri kopyalamak yerine Türkçe kelimeler üzerine yeniden kuruyor:
"S-sen! Sen ölmüştün!", "k-kötü", "ç-çete". "boss" hitabı da "reis" oldu; korkmuş
küçük bir suçlunun gerçekten kullanacağı kelime.

Varsayılmadı, doğrulandı: her anahtar İngilizce tarafla birebir eşleşti, dolayısıyla
`npm run check` hiç bilinmeyen anahtar bildirmedi; hiçbir değer şüphe duyulacak
uzunlukta İngilizcesiyle birebir aynı değil; ve hâlihazırda var olan dört kapı
muhafızı id'si ne çoğaltıldı ne de çelişkiye düşürüldü.

### Çevirinin açığa çıkardığı iki kaynak hatası

**İngilizce metinde konuşmacı etiketi hatası.** `mofu#millers kiss more answ` üçüncü
repliği `[Mouse]`'a veriyor, ama temel varyant onu `[Red]`'e veriyor — ve replik "You
heard him~", yani ancak *az önce konuşmayan* kişinin söyleyebileceği bir şey. Bu
hâliyle fare, kahramana fareyi dinlemesini söylüyor. İngilizce de anlamsız, sadece
çevirisi değil. Kaynakta düzeltildi.

**Mükerrer anahtar kontrolü, çünkü JavaScript size bunu söylemez.** Bir nesne
literal'inde tekrarlanan id hata değildir: sessizce son olan kazanır ve modül import
edildiğinde önceki değer çoktan yok olmuştur. `npm run check` anahtar *kümelerini*
karşılaştırdığı için bunu asla göremezdi. Artık locale kaynak metnini tekrarlanan
bildirimler için tarıyor. Kasten bir tane ekleyip doğrulandı.

### Kısmi yerelleştirmenin açığa çıkardıkları

Açıkça söylemeye değer, çünkü artık teorik değil görünür durumdalar ve
`docs/I18N.md` içinde kayda geçirildiler:

- **Skill ve stance adları `getText`'e hiç uğramıyor.** `src/display.js` doğrudan
  `stances[stance].name` basıyor, `Skill.name()` skill'in kendi literal'inden
  dönüyor; `src/` içinde ikisi için de tek bir `getText` çağrısı yok. Yani muhafız
  artık "hızlı adımlar" diye anlatıyor ama buton hâlâ "Quick Steps" yazıyor. Bundan
  çıkan sonuç: `skills` locale bölümündeki dokuz girdi yalnızca ırksal bonus
  tooltip'lerinde tüketiliyor, oraya daha fazla girdi eklemek ekranda hiçbir şey
  değiştirmiyor.
- **Bir NPC'nin görünen adı yerelleştirilebilir değil.** Bir dialogue'un `name` alanı
  konuşmanın üstündeki başlık; dolayısıyla "kasaba çiftliklerinin sorumlusu" diyen
  çevrilmiş bir replik, `farm supervisor` yazan bir başlığın altında duruyor.
- **Yalnızca sahne yönergesinden oluşan bir oyuncu repliğinin muhatabı yoktur**, o
  yüzden orada resmî kip hiç görünemez. Yaşlı kadının üç oyuncu repliğinin hepsi
  sahne yönergesi; yani `STORY.md`'nin onun için öngördüğü `siz` biçiminin hiçbir
  dilde gösterilecek yeri yok.

### Türkçe çalışmasının açığa çıkardığı üç sıralama ve büyük harf hatası — P-7

Hiçbiri çeviri değil. Metin İngilizce olmaktan çıkınca görünür hâle gelen kusurlar ve
ikisi İngilizcede de zaten hatalıydı.

**İki kez ölü kod olan bir karşılaştırıcı katmanı.** Crafting bileşen sıralaması
`a.item.item_name != b.item.item_name` okuyor — ama item'ların `item_name` diye bir
özelliği yok, yalnızca `getName()` arkasındaki `name` var. Yani koşul `undefined` ile
`undefined`'ı karşılaştırıyor, hiç doğru olmuyor ve isim katmanı hiç çalışmıyordu.
Çalışsaydı bile gövdesi `return b.item.item_name - b.item.item_name`'di; sayılar için
sıfır, bunların gerçekte olduğu string'ler için `NaN`. Bileşenler tier'a göre
sıralanıp doğrudan kaliteye düşüyordu. Artık `getName()`'i `localeCompare` ile
karşılaştırıyor.

**Envanter sıralaması Türkçe için iki ayrı şekilde güvensizdi.** Ekrana basılan item
adını okuyup düz `toLowerCase()` ile küçültüyor ve `>` ile karşılaştırıyordu. Düz
küçültme Türkçe `İ` harfini düz bir `i` yerine `i` + birleşen nokta hâline getiriyor
ve `>` karşılaştırması kod birimine göre sıralayarak aksan taşıyan her harfi `z`den
sonraya atıyor. İkisi de artık locale duyarlı.

**Büyük harf işi düzeltme değil, ayrım gerektirdi.** `capitalize_first_letter` iki
farklı girdi türüne uygulanıyor: dört yerde çevrilmiş metin, yaklaşık on yerde
`attack_power` gibi ham İngilizce stat anahtarları. Baştan sona locale duyarlı yapmak
yanlış olurdu — Türkçe `i` harfini `İ`ye eşliyor, yani ham bir anahtar `İntuition`
olarak görünecekti. Artık açık bir `is_translated` bayrağı alıyor ve yalnızca dört
çevrilmiş çağrı noktası onu geçiyor. Türkçe aktifken `ırk` → `Irk`, `istila` →
`İstila` olurken ham anahtar hâlâ `Intuition` veriyor.

Bunu izlerken not edildi: birkaç ekipman tooltip'i çevrilmiş stat adı yerine alt
çizgisi boşlukla değiştirilmiş ham stat anahtarını gösteriyor, dolayısıyla o satırlar
dil ne olursa olsun İngilizce kalıyor. Onları `stats` locale bölümünden geçirmek
gerçek bir iyileştirme ve ayrı bir değişiklik.

### Quest metni id'lerin arkasına taşındı ve çevrildi — P-7

Quest adları, açıklamaları ve görev metinleri `src/quests.js` içinde satır içi
yazılmıştı; bu da onları çeviri sisteminin tamamen dışında bırakıyordu. Artık metin
id'si oldular ve Türkçe tarafı yazıldı. 62 yeni id; kapsam %26.2'den %35.4'e çıktı.

**Id biçimi `quest <quest_id> [name | desc N | task N]`.** Bunda üç bilinçli tercih
var:

- `<quest_id>` registry anahtarıdır ve save dosyasının tuttuğu şeydir. Asla
  çevrilmez, asla yeniden adlandırılmaz — locale'deki satırı yalnızca tanımlar.
- `desc N` ilerleme sırasına göre numaralı, çünkü on bir quest'in sekizi açıklamasını
  kaç görevin bittiğine göre seçiyor. Quest başına tek id bunu ifade edemezdi.
- `task N` görevin `quest_tasks` içindeki indeksi; böylece bir id ait olduğu görevden
  kopamaz. Gizli görevlerin açıklaması yok, dolayısıyla id'si de yok.

**Erişimciler zaten vardı, bu da değişikliği küçük tuttu.** `getQuestName` ve
`getQuestDescription`, Quest sınıfında override edilebilir seçeneklerdi. İçerik artık
onlardan bir **id** döndürüyor, ince sarmalayıcılar da onu çözüyor; böylece mevcut
dokuz çağıran — quest paneli, sıralama karşılaştırıcısı, dört log mesajı ve ödül
işleyicisinin `source_name`'i — çeviri katmanının varlığından habersiz şekilde
görüntülenebilir metin almaya devam ediyor.

`source_name`'i çevirmeden önce kontrol etmeye değerdi: loglama için olduğu
belgelenmiş ve kimlik için ayrı bir `source_id` var, dolayısıyla orada çevrilmiş bir
değer güvenli.

**Quest sıralaması artık locale duyarlı.** Karşılaştırıcı adlar üzerinde `>`
kullanıyordu; bu kod birimine göre sıralar ve aksan taşıyan her Türkçe harfi "z"den
sonraya atar. Artık yeni bir `language_tags` haritasından gelen etiketle
`localeCompare` kullanıyor; harita dil registry'sinin yanında duruyor, böylece dil
eklemek tek bir yeri düzenlemek anlamına geliyor.

**`rewards.messages` de id alıyor.** Dört içerik metni — üçü `src/locations.js`,
biri `src/quests.js` içinde — bir içerik dosyasından doğrudan loglanan son
oyuncuya görünen metindi. Ödül işleyicisi artık onları çeviriyor.

**Yeni bir CI kontrolü id'lerin varlığını doğruluyor.** Bildirilen bir id'deki yazım
hatası hata fırlatmaz: oyuncunun karşısında "text not found" olarak görünür.
`npm run check` içerik dosyalarındaki `quest_name`, `quest_description`,
`task_description` ve `rewards.messages` alanlarını tarıyor ve herhangi bir id
varsayılan locale'de yoksa başarısız oluyor. Önce blok yorumlarını çıkarıyor;
böylece `src/quests.js` sonundaki belgeli şablon — ki artık satır içi metin yerine id
kuralını gösteriyor — taranmıyor. 44 id bildirildi, hepsi çözülüyor; kasten
eklenen bir yazım hatasında başarısız olduğu doğrulandı.

O kontrolün kendi hatasını bulmak, onu yazmaktan uzun sürdü. Sıfır id taradığını
bildiriyordu, oysa aynı regex izole olarak kırk eşleşme buluyordu. Neden mantıkta
değil dosyadaydı: word-boundary kaçışları gerçek backspace baytı olarak yazılmıştı,
yani desenler `quest_name` öncesinde bir kontrol karakteri arıyordu. Bunu gösteren
şey satırın hex dökümü oldu.

**Çevirinin kendisine dair.** Quest adları, birebir bir geçişin kaybedeceği üç şey
taşıyor. *It won't mill itself* "kendi kendine olmaz" deyimi; Türkçede aynı yapı
bulunduğu için doğrudan aktarılıyor. *Ploughs to swords* "kılıçlardan saban"
göndermesini tersine çeviriyor ve Türkçe aynı göndermeyi taşıdığı için tersine çevirme
aynı şekilde okunuyor. *Giant Enemy Crab* 2006 tarihli bir mem ve bilinçli olarak
birebir.

En zor satır o quest'in ilk açıklaması: kesme işareti yerleşimi üzerine bir şaka
yapıyor — crab nests, a crab's nest, some crabs' nest. Bu, İngilizce iyelik yapısı
üzerine bir şaka ve kelime kelime aktarılamaz. Türkçe iyelik ekleri tam olarak aynı üç
okumayı ürettiği için şaka onların üzerine yeniden kuruldu: dev yengeç yuvaları, dev
yengecin yuvası, dev yengeçlerin yuvası.

### Açılış sahnesi Türkçe ve bundle artık onu kaçırmıyor — P-7

**Köy yaşlısının tüm yayı çevrildi**, 46 id: hafıza kaybı sahnesi, başlangıç silahı
seçimi, kurt sıçanı görevi ve oyuncunun gitmesine izin verilene kadar tuttuğu her
kapı. Yeni bir oyuncunun ilk okuduğu şey bu. Kapsam %21.3'ten %28.8'e çıktı.

Kaydedilmeye değer iki karar, çünkü makine çevirisinin tam da yanlış yaptığı şeyler:

- *"with nothing but pants"* burada pantolon, iç çamaşırı değil. Soyguncular geri
  kalan her şeyi almış; diğer okuma hem yanlış hem saçma olurdu.
- *"Are wolf rats a big issue?" / "Oh yes, quite a big one. Not literally, no"* ciddiyet
  değil **boyut** şakası. Birebir çevrildiğinde cevap anlamsızlaşıyor; Türkçe kurulumu
  koruyup "boyut olarak değil" diye yanıtlıyor, aynı yere düşüyor.

Register STORY.TR.md'deki haritayı izliyor: kahraman yaşlıya sizli hitap ediyor, yaşlı
kahramana senli yanıt veriyor. Bu iki yönün 46 satır boyunca tutarlı kalması gerekti;
çevirinin string bazında değil NPC bazında yürümesinin pratik nedeni de bu.

**esbuild her Türkçe karakteri kaçırıyordu.** Varsayılan charset'i ascii; her ASCII
dışı karakter, UTF-8'in iki bayt kullandığı yerde altı baytlık bir `\uXXXX` kaçışına
dönüşüyordu. Derlenen bundle yalnızca 175 anahtarla 2,3 KB küçüldü ve çıktı yeniden
grep'lenebilir hâle geldi. `charset: "utf8"` açıkça ayarlandı; `index.html` zaten
UTF-8 bildiriyor. Kazanç kalan 432 anahtarla ölçeklenecek.

**Bir test kırıldı, hem de doğru sebeple.** Fallback kontrolü çevrilmemiş id örneği
olarak `"elder hello"`yu adlandırıyordu - ve o id çevrildi. Artık hâlâ eksik olan ilk
id'yi çalışma zamanında seçiyor ve İngilizce tabloyla karşılaştırıyor; böylece daha
fazla çeviri onu bayatlatamıyor. 42 kontrol.

### Türkçe oynanabilir durumda — P-7

Yerelleştirme sıranın başına geçti ve dil artık uçtan uca çalışıyor.

**Kapıyı açan şey bir fallback oldu.** `getText`, aktif dilde bulunmayan her id için
`"text not found, id: X"` döndürüyordu ve yazarın kendi `//todo` notu tam yanında
duruyordu. Bu, kısmi bir locale'i kullanılamaz kılıyor: çeviri ya tamamdır ya da oyun
yer tutucularla kaplanır. `init` artık aktif dil varsayılan değilse varsayılanı da
yüklüyor ve `getText` ona düşüyor, id başına bir kez uyararak. Böylece çevrilmemiş bir
satır sadece İngilizce okunuyor ve çeviri parça parça gelebiliyor.

Arama da dil bazında ayrıldı; bu ırksal metin varyantları için önemli: temel metni
olup `mofu#` varyantı olmayan bir dil artık diğer dilin varyantını ödünç almak yerine
**kendi** temel metniyle yanıt veriyor. Aktif dilde kalmak, varyantı elde etmekten
önemli.

**Dil seçilebilir.** `turkish` `languages` içine kaydedildi; `language_names` haritası
sayesinde her dil kendi adını kendi dilinde söylüyor. Ayarlar panelinde bir seçici
var ve HTML'e gömülmek yerine registry'den inşa ediliyor, dolayısıyla yeni dil
eklemek markup değişikliği gerektirmiyor. Seçim kaydın geri kalanıyla birlikte zaten
saklanıp geri yükleniyordu — o kısım vardı, yalnızca hiç erişilebilir değildi.

Geçiş canlı. `translateUI` sabit arayüzü anında güncelliyor; geri kalan her şey paneli
çizilirken `getText` üzerinden geçtiği için oyuncu dolaştıkça değişiyor.

**607 id'nin 129'u çevrildi**: tüm arayüz, altmış stat etiketinin tamamı, ırk
bonuslarının atıfta bulunduğu skill'ler, künye paneli ve bütün ırk adları ile
açıklamaları. `npm run check` Türkçeyi %21.3 kapsamla uyarı olarak raporluyor; kalan
478 dialogue id'si yazılırken CI yeşil kalıyor.

**Nasıl çevrildiğine dair.** Kalıcı kural: Türkçe, İngilizceden dönüştürülmüş gibi
değil Türkçe okunmalı — makine çevirisi tadı yok, calque yok, çok anlamlı bir
kelimenin anlamı sözlüğün en üstünden değil oyun içi bağlamdan çözülüyor.

İkinci kural, çevirinin **bağlam birimleri** hâlinde yapılması; asla string string
değil, çünkü bir string ekranda üstündeki metnin altında okunuyor. En net örnek stats
bölümü: her stat'ın satırlar için kısa, tooltip için uzun bir biçimi var ve tooltip,
satırın kısalttığı şeyi adlandırmak zorunda — yoksa ekran kendi kendisiyle çelişiyor.
Aynısı etiket ve ardından gelen değer için de geçerli: `"Boy"` ile `"Kısa"` ayrı
id'ler ama tek satır gibi okunmalı.

Her string için yeniden tartışılmasın diye kaydedilen bazı somut kararlar: health
`can`, `sağlık` değil — `sağlık` tıbbi çağrışım yapıyor; stamina `dayanıklılık`,
alıntı kelime değil; dexterity `el becerisi`, arkaik `maharet` değil; Bio paneli
`Künye`, çünkü biyografi değil kimlik kartı; Tools `Aletler`, çünkü `Araçlar` taşıt
çağrıştırıyor. İngilizcenin iki biçimde de açmadığı kısaltmalarda — kaçınma puanı için
`"EP"` — Türkçe uzun biçim açık yazılıyor; bu daha anlaşılır ve yine sadık.

`docs/I18N.md` ve Türkçe eşi yeni: sistem nasıl çalışıyor, katı kurallar, Türkçeye
özgü tuzaklar, sözlük ve metnin çeviri sistemine hiç ulaşamadığı yerlerin dürüst bir
listesi — quest adları ve açıklamaları `src/quests.js` içinde satır içi yazılmış,
`help.html` ile `changelog.html`'in hiç bağlantı noktası yok, item ve lokasyon adları
ise registry anahtarlarının kendisi.

**Testler.** `npm test` bir `src/translation.js` bölümü kazandı: çevrilmiş bir id
Türkçe yanıt veriyor, çevrilmemiş olan yer tutucu yerine İngilizceye düşüyor, hiçbir
yerde olmayan bir id yine kendini bildiriyor, varsayılan olmayan bir dili başlatmak
varsayılanı da getiriyor, varyantı olmayan bir dil kendi temel metnini koruyor ve
varyant, flag'in iki yönünde de var olduğu yerde kazanıyor. Harness artık `locales/`'i
`src/` ile birlikte kopyalıyor, çünkü `translation.js` çalışma zamanında yana doğru
ona uzanıyor. 41 kontrol.

### Kasaba işinden kalan üç açık uç

Yanı sıra kapatıldı; hepsi kod okunarak doğrulandı.

**İki kafe tüccarı da var olmayan bir envanter şablonu adlandırıyordu.**
`"Cafe trader"` tanımlı altı şablondan biri değil; gerçek olanı `"Cat cafe"`.
`get_inventory_from_template` arama sonucunun `.length` değerini korumasız okuyor;
yani bu, o tüccarlardan birini bir lokasyona ilk bağlayacak kişiyi bekleyen bir
TypeError. Bugün uykuda — hiçbir yerden atıf yok — ama iki yerde de düzeltildi, çünkü
birini düzeltmek aynı tuzağı diğerinde bırakırdı.

**Bir quest açıklaması ekrana "undefined" yazabiliyordu.** İki çağrı
`getQuestDescription()` okuyor; biri sonucu `?? ""` ile koruyor, kardeşi korumuyordu.
`innerText = undefined` metin olarak basılır.

**Arkasındaki neden.** `Lost memory`'nin açıklaması 0 ve 1 tamamlanmış görev sayısı
için yanıt veriyor, üstündeki her şey için if-zincirinin sonundan düşüyordu. İkinci
görev gizli ve birinciyle birlikte tamamlanıyor, dolayısıyla sayı 0'dan doğrudan 2'ye
atlıyor — yani `== 1` dalına hiç girilmiyordu ve açıklama, oyuncunun yaşlıyla ilk
konuşmasından beri undefined'dı. Artık aralık kullanıyor ve tüm aşamaları kapsıyor;
soyguncuyu dövmüş olmak ve kasabanın içinde olmak için iki yeni aşama dahil.

### Kasaba açıldı — P-9, "The Merchant's Word" arkının 2. quest'i

Kapı muhafızının repliği v0.4.6'dan beri aynı şeyi söylüyordu: kasaba, yurttaş ya da
tüccar loncası üyesi olmayan herkese kapalı, istisnasız. Artık söyleyecek ikinci bir
şeyi var ve arkasında koca bir kasaba.

**Kapı.** Muhafıza `{reputation: {Town: 150}}` ile kapılanmış yeni bir textline
eklendi. 150, oyunda bugün elde edilebilen Town itibarının tamamı — Gang hideout'u
temizlemek için 50, Bonemeal delivery için 40, Ploughs to swords için 60 — yani kapı,
bölgenin kendi işi bittiğinde açılıyor. Bu, Town itibarına ilk tüketicisini
kazandırıyor; şimdiye kadar üç yerde veriliyor ve hiçbir yerde okunmuyordu.

Muhafız kuralı esnetmiyor. Yazarken önemli olan buydu: "No exceptions" onun
karakteri ve oyuncu iki kez sorduğu için yumuşayan bir muhafız, daha kötü bir
muhafızdır. Bu yüzden kural feragat edilmiyor, karşılanıyor — tarlalarını oyuncunun
kurtardığı ve sabanlarını kılıca dönüştürdüğü çiftlik sorumlusu aşağı inip kapıya
bir isim bırakmış. Bir yurttaşın senin için konuşması, muhafızın en başta söylediği
şeyin diğer yarısı.

Repliğin çözülmesi Town square'i açıyor, `Lost memory` 4. görevini tamamlıyor, artık
doğru olmayan "kasaba kapalı" repliğini kilitliyor ve girişten sonra kısa bir replik
açıyor — böylece muhafız söyleyecek hiçbir şeyi olmadan kalmıyor.

`Lost memory` 4. görev `"Get into the town (tbc)"` ve yanında `//not yet possible`
yorumuyla duruyordu. Artık `"Get into the town"` ve tamamlanabilir.

**Bunun açtığı şey.** Hiçbir oyuncunun görmediği, tamamen yazılmış dört iç mekân —
çeşmesi ve örgütlü güvercinleriyle Town square, Cat café, tanıyamadığın şeylerin özel
müzesiyle Antique store, ve elli civarı ortam repliğiyle Adventurer's guild; o
replikler köy muhafızının hakkında konuşmadığı emekli efsaneyi ve gölgeleri
duvarlardan kopan dört genç dâhiyi sessizce kuruyor. Hiçbiri yazılmayı beklemiyordu.
Bir kapı bekliyordu.

**Nekomimi café ve hiç bağlanmamış bir kapı.** Kafe
`display_conditions: {flags: ["is_mofu_mofu_enabled"]}` bildiriyordu — yazarın,
kafenin yalnızca beastkin kozmolojisinde var olması yönündeki niyeti. `Location`
constructor'ı bu seçeneği hiç kabul etmiyordu, dolayısıyla sessizce düşüyor ve kapı
hiçbir şey yapmıyordu. Kasaba açılınca bu, kedi-halkın savunulması gereken bir ayyaş
hikâyesi olduğu bir dünyaya bir nekomimi kafesi koyacaktı.

`Location` artık `display_conditions` kabul ediyor — `Textline`'ın yaptığı gibi
sarılarak — ve `display.js` içindeki iki seyahat filtresi bunu dikkate alıyor.
Yüklemede değil çizim anında değerlendiriliyor; böylece çalışma zamanındaki mofu
anahtarı yeniden yükleme olmadan etkili oluyor.

`Combat_zone` da aynı alana ihtiyaç duydu ve gerekçesi kaydedilmeye değer: o,
`Location`'ın alt sınıfı değil ayrı bir sınıf, dolayısıyla örneklerinde böyle bir
özellik yok ve `process_conditions` argümanının `.length` değerini okuyor. Bağlı
lokasyonları bunu hesaba katmadan filtrelemek, seyahat listesindeki ilk combat
zone'da hata fırlatacaktı — yani anında. İki seyahat filtresi de artık açık bir
fallback taşıyan tek bir yardımcıdan geçiyor; böylece gelecekteki bir lokasyon
sınıfı bunu yeniden getiremez.

**İşletmecinin dokuz satırı `lorem ipsum`du.** Artık bir sesi var. Kaosla dolu bir
kafede sakin olan kişi o — ki bu, onun da aynı ölçüde saçmalamasından daha komik — ve
tam olarak bir kelime oyunu yapıyor; kapıdaki, çatının parasını ödemiş bir kavanoz
tarafından finanse edilerek. Locale dosyasında hiç `lorem ipsum` kalmadı.

**Mages guild açıklaması Nekomimi café'nin birebir kopyasıydı** ve ortam sesleri boş
bir diziydi. `is_unlocked: false` ve öyle kalıyor — daha sonraki bir quest'e ait —
ama yanlış metni yayınlamak bir flag değişimi uzaklıkta olduğu için artık kendi
açıklaması ve kendi atmosferi var; o quest'in ihtiyaç duyacağı işlenmiş gümüş
ayrıntısı da tohum olarak ekildi.

**Testler.** `npm test` bir `src/conditions.js` bölümü kazandı; çünkü yanlış bir
koşul şekli hata fırlatmıyor — içeriği sessizce açıyor ya da kapıyor. İtibar kapısı
0'da ve 149'da kapalı, tam 150'de ve üzerinde açık olarak kontrol ediliyor;
bildirilmemiş varsayılan ve çıplak dizi fallback'i, ikisi de "koşul yok" anlamına
geldiği (yani "koşul karşılanmadı" değil) doğrulanıyor; flag kapısı iki yönde de
kontrol ediliyor. 33 kontrol.

### Boy ve ırk nihayet bir işe yarıyor — P-8

`getNumericalHeight()` `this.height` ve `this.race` alanlarını okuyordu; ama `Person`
kimliği `this.personal` altında saklıyor, karakter yaratma da öyle. Bu özellikler
örnek üzerinde hiç var olmadığı için iki arama da boşa düşüyor, iki fallback de
tetikleniyor ve fonksiyon her karakter için kalıcı olarak sabit **170** döndürüyordu
— ki bu tam olarak `height_values["average"]` değeri.

Sonuçları, hepsi doğrulandı: `getUniversalHeight()` herkes için `"average"`
diyordu; karakter yaratmadaki kısa/uzun seçimi ve ırk değiştiricileri (dwarf -30 ile
elf +10 arası) hiçbir şeyi etkilemiyordu; ve köy muhafızının kafa okşama sahnesindeki
`"very short"` dalına asla girilemiyordu — dolayısıyla `locales/english.js` içinde
var olan `"guard try answ too short"` satırı erişilemezdi. Bu son madde tam olarak
D-2 kategorisi: yazılmış ve hiç görülmemiş içerik.

Alan okuması düzeltilince 30 ırk-boy kombinasyonundan 7'si artık `"very short"`
ölçüyor — `short/nekomimi` dahil, yani varsayılan beastkin ırkı — böylece ölü satır
normal oyunda erişilebilir hâle geliyor.

`src/conditions.js` içindeki boy koşul bloğu aynı commit'te düzeltildi; çünkü
yalnızca yardımcı fonksiyonu düzeltmek, yazılacak ilk boy koşulunu hatalı bırakırdı.
O blok ölü koddu — hiçbir içerik boy koşulu tanımlamıyor — ve içindeki altı
karşılaştırmanın hepsi yanlıştı: her sınır testi ters çevrilmişti, yani bir
`at_least` karakter minimumdan *daha uzun* olduğunda başarısız oluyordu; göreli
`exactly` dalı `.at_least` ile karşılaştırma yapıyordu; ve evrensel blok
`conditions[0].relative_height.exactly` okuyordu, ki bu `universal_height` tanımlayıp
`relative_height` tanımlamayan her koşulda hata fırlatır. Artık karakterin kendi boyu
her karşılaştırmanın solunda duruyor; yönü apaçık kılan da bu.

`npm test` bir `src/person.js` bölümü kazandı ve bu, harness'ın genelleştirilmesini
gerektirdi: artık yalnızca dairesel grafiğe uzanan import'ları söküyor, gerisini
bırakıyor; böylece hiç import etmeyen `src/races.js` gerçek ırk değiştiricilerini
sağlıyor, stub'lanmış olanları değil. Isırdığı, boy kontrollerinin düzeltme öncesi
kaynağa karşı koşulmasıyla doğrulandı: orada üç boyun hepsi 170 ölçüyor ve her
karakter `"average"` diyor. Toplam 25 kontrol.

### NaN düzeltmesinin devamı: kendi regresyonu ve iki ilgili nokta — P-8

Önceki commit'e yapılan çekişmeli inceleme, o commit'in kendi `is_maxed`
değişikliğinin bir regresyon getirdiğini ve kazanç başına xp sınırının
etkinleştirilmesinin, seviye atlama süresini tahmin eden paneli motorun artık
veremeyeceği bir sayıyı söyler durumda bıraktığını buldu.

**Regresyon.** Düzeltme, `get_total_skill_level(id) == skill.max_level` yerine
`>= skill.max_level` koydu. `get_total_skill_level` `bonus_skill_levels` ekliyor ve
sınırlanmıyor; dolayısıyla `>=`, bir seviyelik yanlış tetiklemeyi N seviyelik hâle
getirdi — N, kuşanılan bonus. `woodcutting` tanımı gereği balta gerektiriyor ve Iron
chopping axe +3 Woodcutting veriyor; yani 57, 58 veya 59. seviyedeki bir skill
`Woodcutting (Maxed out!)` diyordu — yüzdeyi, xp çiftini ve tüm tahmin satırını
düşürerek — hâlbuki yanındaki skill listesi hâlâ `58/60 [+3]` yazıyordu. Giderilen
hatanın tam tersi ve normal oyunda erişilebilir.

Max olma durumu artık skill'in kendisinden okunuyor: `current_xp === "Max" ||
current_level >= max_level`. `get_total_skill_level` her iki karşılaştırma yönünde
de yanlış girdi ve burada artık kullanılmıyor. Üç vakanın hepsine karşı kontrol
edildi: bonuslu gerçek max, ve bonus penceresinin iki ucundaki max olmayan
durumlar. Eski `==` üçün ikisinde, aradaki `>=` de ikisinde yanlıştı; yeni test
üçünde de doğru.

Bunun dayandığı değişmez — `current_xp === "Max"` ile
`current_level >= max_level` her zaman birlikte atanır — artık `npm test` içinde
her skill için doğrulanıyor; böylece görüntü katmanı modelden sessizce
ayrışamıyor.

**Tahmin 10 kata kadar iyimserdi.** Kazanç başına sınırın etkinleştirilmesi
skill'in gerçekten aldığı miktarı sınırladı, ancak "Next level in …" satırı kazancı
elle yeniden hesaplıyor ve üç şeyi atlıyordu: global xp çarpanı, parent skill
çarpanı ve sınırın kendisi. Sınır, seviye başına en az on kazancı garanti ediyor;
yani panel dürüst biçimde ondan az döngü gösteremezdi, ama gösteriyordu.

Formülü doğru biçimde çoğaltmak yerine, artık tek bir export edilmiş fonksiyon var:
`get_effective_skill_xp_gain`, hem `add_xp_to_skill` hem panel tarafından
kullanılıyor. Bu soruna aynı aritmetiğin iki kopyası yol açtı; artık bir kopya var.

**Skill ilerleme çubuğu.** Genişlik ataması `current_xp !== "Max"` if-else'inin
içinde değil sonrasında duruyordu; dolayısıyla max seviyedeki bir skill
`100 * "Max" / Infinity` hesaplayıp `style.width = "NaN%"` yazıyordu. CSSOM
ayrıştırılamayan bir bildirimi sessizce atar, yani çubuk bir seviye önce gösterdiği
orana çakılı kalıyordu — üstünde "Max!" etiketiyle. Artık iki dalın ikisinde de
atanıyor, max olan dalda açıkça `100%` olarak; çünkü `.skill_bar_current` için
stil dosyasında genişlik kuralı yok ve bayat bir satır içi değer aksi hâlde
kalıcı olurdu. Farming ve Literacy'nin ikisi de 10. seviyede tavan yapıyor, yani
bu teorik bir vaka değildi.

### Skill xp panellerindeki NaN görüntüleri giderildi — P-8

Toplama panelinde `Woodcutting (NaN% [NaN / Infinity])` / `Next level in NaN
minutes` olarak bildirildi. Birebir yeniden üretildi, kök nedeni bulundu ve hem
görüntü hem model düzeyinde düzeltildi.

**Görüntü tarafındaki neden.** Max seviyeye ulaşan bir skill, `current_xp` alanını
`"Max"` string'i, `xp_to_next_lvl` alanını `Infinity` olarak saklar — bunlar
amaçlanan sentinel değerlerdir. Aktivite paneli bir skill'in max olup olmadığına
`get_total_skill_level(id) == skill.max_level` ile karar veriyordu; ancak
`get_total_skill_level` `bonus_skill_levels` ekliyor ve sınırlanmıyor, dolayısıyla
bonus seviye veren herhangi bir ekipman veya efekt toplamı `max_level` üzerine
çıkarıyor ve gerçekten max olan bir skill için eşitlik başarısız oluyor. Panel
bunun üzerine "max değil" dalına giriyor ve `10000 * "Max" / Infinity` hesaplıyor;
sonuç `NaN`. İzole olarak yeniden üretildi: 60. seviye bir skill ve +2 bonus ile
eski ifade ekran görüntüsünü birebir basıyor.

`is_maxed` artık sentinel'in kendisini kontrol ediyor ve `==` yerine `>=`
kullanıyor. `else` dalı içindeki üç `is_maxed ? "Max" : …` üçlü ifadesi ölü koddu —
orada `is_maxed` kanıtlanabilir biçimde false — ve kaldırıldı. xp değerleri sayı
olarak okunup kullanılmadan önce doğrulanıyor; böylece saklanan sayıları
kullanılamaz durumda olan bir skill `NaN` yerine `?` ve "an unknown amount of time"
gösteriyor.

**Model tarafındaki neden — daha ciddi olan yarısı.** `Skill.add_xp` girdisini
`xp_to_add == 0` ile koruyordu ve `NaN == 0` false olduğu için `NaN` doğrudan
`total_xp`'ye giriyordu. O noktadan sonra skill kalıcı olarak bozuk: `NaN + x`
`NaN` olduğundan sonraki her meşru kazanç sessizce kayboluyor, seviye atlama dalı
her tick'te 0 seviyesi hesaplıyor ve paneller `NaN` gösteriyor. Çağıranın koruması
`isNaN` kullanıyordu ve bu `Infinity`'yi durdurmuyor; `Infinity` ise daha kötü —
`total_xp_to_next_lvl` taştığında `Infinity >= Infinity` doğru kaldığı için seviye
atlama `while` döngüsü sonlanamıyor ve sekme kilitleniyor.

İki koruma da artık sonlu olmayan her değeri reddediyor ve raporluyor. Döngü ek
olarak `max_level` ile sınırlandı; bu hiçbir şeye mal olmuyor, çünkü max seviyeye
ulaşıldığında alttaki dal her şeyi zaten üzerine yazıyor.

`get_parent_xp_multiplier` bozuk değerin girmesi için en olası yoldu.
`parent_multiplier ** Math.max(0, parent.current_level - this.current_level)`
hesaplıyor; `Math.max(0, NaN)` `NaN`, ve herhangi bir şey `** NaN` yine `NaN`. Bu
çarpan doğrudan `xp_to_add`'a uygulandığı için tek bir bozuk seviye değeri, yalnızca
bir kazancı değil skill'in saklanan xp'sini zehirliyor. Artık 1 döndürüyor ve bozuk
durumu raporluyor. Bu yol yeni: toplama skill'leri parent skill'i ancak `b74b9eb`
commit'inde kazandı.

**Yol üzerinde kapatılan sessiz bir veri kaybı.** `JSON.stringify`, `NaN` ve
`Infinity` değerlerini `null` olarak yazıyor ve kaydet/yükle turu `total_xp > 0`
kontrolü yaptığı için bozulmuş bir skill tek kelime edilmeden atlanıyordu — o
skill'in tüm ilerlemesini silerek. Artık raporlanıyor.

**Bilinçli bir denge değişikliği.** `add_xp_to_skill`, kazanç başına xp sınırını
`typeof skill.xp_to_next_lvl === Number` koşuluna bağlamıştı. `typeof` bir string
döndürür, `Number` ise bir constructor'dır; yani bu koşul hiç doğru olmadı ve sınır
crafting dışı hiçbir skill'e hiç uygulanmadı. Artık `Number.isFinite` kullanıyor.
Skill'ler eskisinden daha yavaş xp kazanacak. Bu yalnızca bir hata düzeltmesi değil,
gerçek bir oynanış değişikliği — istenmiyorsa geri alınması tek satırlık bir
düzenleme.

**Testler.** `npm test` yeni ve CI'da çalışıyor. Yukarıdaki korumaları on dört
kontrolle kapsıyor. `src/skills.js`'i doğrudan `import` edemiyor, çünkü dairesel
import'lar yalnızca tarayıcıda çözülüyor; bu yüzden gerçek kaynağı okuyup `Skill`
sınıfının kullandığı üç fonksiyon için stub koyuyor — test edilen kod, yayınlanan
kodun kendisi, yeniden yazımı değil. Anlamlı olduğu, aynı harness'ın düzeltme
öncesi kaynağa karşı koşulmasıyla doğrulandı: orada kontrollerin yedisi başarısız
oluyor ve çıktı, hata bildirimindeki "calculated level ... was 0" uyarısını yeniden
üretiyor.

### İki dilli doküman seti — P-4, P-5

`docs/` artık dört doküman çifti ve yeniden yazılmış README'yi barındırıyor;
toplam on dosya. Hepsi `doc-version` damgası taşıyan bir `NAME.md` + `NAME.TR.md`
çifti ve Türkçe yarısı, İngilizce dosyayı kanonik ilan eden bir banner ile
açılıyor.

`docs/AGENTS.md` tek kanonik katkıcı ve agent rehberidir; kökteki `AGENTS.md`
kısa bir işaretçi stub'ıdır ve yalnızca araçların kök dosyayı otomatik keşfetmesi
nedeniyle vardır. Türkçe çeviriler büyük referans tablolarını bilinçli olarak
kopyalamıyor — bunun yerine İngilizce anchor'lara link veriyorlar, çünkü hiç
kopyalanmamış bir olgu bayatlayamaz.

`docs/STORY.md` anlatı kanonudur: dünya, protagonist, merkezî gizem, ton,
isimlendirme kuralları ve hikâyenin tam olarak nerede durduğu. Ayrıca repoda var
olup hiçbir oyuncunun erişemediği içeriğin envanterini taşıyor — çekişmeli olarak
doğrulanmış, hiçbiri çürütülmemiş dokuz yüksek değerli orphan. Beş kasaba iç
mekânının tamamının aynı kapalı kapının arkasında olduğu ortaya çıktı; bu da o
kapıyı açmayı elimizdeki en yüksek kaldıraçlı anlatı hamlesi yapıyor. Planlanan
devam arkı orada özetlenip `PROPOSALS.md` içinde ayrıntılandırılıyor.

`docs/PROPOSALS.md` her kalıcı direktifi, numaralı iş listesini ve bekleyen
kararları kayda geçiriyor. Bu kararlardan üçü artık alındı: fork içerik olarak
ayrışıyor, Türkçe görünen adlar dahil tüm içerik katmanını kapsıyor ve Türkçe
hitap kipi NPC bazında karma.

Son madde, kendi önceki çerçevelememe bir düzeltme getirdi. Karma kip, metin
aramasının yeniden yazılmasını gerektiriyor gibi görünüyordu; çünkü `mofu#` varyant
mekanizması tek bir flag ve tek bir ön eke sabittir. Gerektirmiyor: kip yalnızca
çalışma zamanında seçilebilir olacaksa ikinci bir eksene ihtiyaç duyar. NPC bazında
sabit bir kip, o satırın Türkçe metnine yazılır ve her satır zaten ayrı bir string
id'dir — yani bu tamamen bir yazım kuralıdır ve `src/translation.js` dokunulmadan
kalır.

`docs/CHANGELOG.md` bu dosyadır. Oyun içi, oyuncuya yönelik sürüm geçmişi olarak
kalan `changelog.html`'den ayrıdır.

### Upstream deployment referansları kaldırıldı — P-6

Fork hâlâ upstream projeden varlık çekiyor ve kullanıcıları oraya yönlendiriyordu.
Altyapı olan her şey artık bu repo üzerinden çözülüyor; kredi olan her şey
kalıyor ve ne olduğunu açıkça söylüyor.

**Deployment kimliği konfigürasyona taşındı.** `src/config.js` dosyasına
`release_ids` bloğu eklendi; `src/main.js` içindeki `is_on_dev()` / `is_on_main()`
artık iki sabit upstream URL'si yerine bu bloğa karşı karşılaştırma yapıyor.

Bu iş bul-değiştir değil, dikkat gerektiriyordu. `is_on_dev()` on üç yerde
kullanılıyor ve bunlardan biri save dosyasını hangi `localStorage` anahtarının
tuttuğunu seçiyor. Bu deployment'ta şu anda `false` değerlendiği için canlı
oyuncular üretim save anahtarında — ve bunu `true` yapmak mevcut her oyuncuya
sessizce boş bir save yuvası verecekti. Bu yüzden düzeltme `dev` değerini ayrı ve
henüz var olmayan bir deployment yoluna bırakıyor, yalnızca tek bir yerde
kullanılan `main` değerini düzeltiyor.

Tespit yöntemi de değişti. Eski karşılaştırma, protokol ve sondaki eğik çizgi
dahil tam `href` üzerindeydi; siteyi bir query string ile veya sondaki eğik çizgi
olmadan açmak kendi sürümüyle eşleşmiyordu. Artık normalize edilmiş
`host + pathname` karşılaştırılıyor; `/yairp`, `/yairp/` ve `/yairp/?debug` aynı
sürüme çözülüyor.

**Ziyaretçi sayacı düzeltildi.** Artık sabit bir upstream URL'si yerine
`release_ids`'ten türetiliyor. Sabit URL'lerin hiçbiri bu deployment ile
eşleşmediği için sayaç canlı sitede daha önce yer tutucu dalına düşüyordu. `main`
veya `dev` olmayan deployment'lar — yerel sunucu, önizleme derlemesi — hâlâ
izlenmeyen bir yer tutucu alıyor; böylece gerçek sayıları şişiremiyorlar.

**Varlıklar yerel.** Favicon ve Open Graph / yapılandırılmış veri önizleme görseli,
her iki dosya bu repoda bulunmasına rağmen upstream Pages sitesinden çekiliyordu.
Artık yerel olarak çözülüyorlar; ayrıca tamamen eksik olan `og:url` ve
yapılandırılmış veri `url` alanı eklendi.

**Repo bağlantıları buraya işaret ediyor.** Oyun içi repo bağlantısı ile
`help.html` içindeki katkı ve "oyunu destekleme" bölümleri artık bu repoya işaret
ediyor.

**Atıf bilinçli olarak korundu.** MIT lisansı özgün telif bildiriminin
korunmasını gerektiriyor ve özgün yazar, fork'ların özgün projeye kredi verip
bağlantı vermesini açıkça istemiş. Bu yüzden `LICENSE` dosyasına dokunulmadı,
yükleme ekranı hâlâ Miktaew'e kredi veriyor ve altında devam eden çalışmayı
adlandırıyor, açıklamalar oyunun Miktaew tarafından yaratıldığını ve bu fork'ta
devam ettirildiğini söylüyor. Ko-fi bağlantısı özgün yazara ait olduğu için bu
fork'u desteklediği izlenimi vermek yerine bunu söyleyecek şekilde yeniden
etiketlendi — daha önce artık kendisine ait olmayan bir sayfada ipucu metni
"Support me on Ko-fi!" diyordu.

### Repo hijyeni: satır sonları ve binary'ler — P-2

`.gitattributes` mevcut değildi; bu yüzden satır sonu davranışı her katkıcının
yerel `core.autocrlf` ayarına bağlıydı ve her commit'te CRLF uyarısı üretiyordu.

Düzeltmenin içinde bir tuzak vardı. `git show :file` ile yapılan ilk ölçüm, repodaki
her blob'un CRLF ile saklandığını gösteriyordu; bu durumda `* text=auto` takip
edilen her dosyayı yeniden normalize edecekti — devasa bir diff ve senkronizasyon
sorusu hâlâ açıkken her upstream yamasıyla çatışacak bir değişiklik. O ölçüm
hatalıydı: `git show` çalışma kopyası dönüşümünü uyguluyor. Gerçek tabloyu
`git ls-files --eol` verdi — 50 dosya `i/lf w/crlf` durumunda; yani index zaten LF
saklıyor ve yalnızca Windows checkout'ları CRLF, ki bu sağlıklı düzenlemedir.

Dolayısıyla `* text=auto` yalnızca reponun hâlihazırda yaptığı şeyi yazıya
geçiriyor. Commit'ten önce sıfır yeniden normalizasyon ürettiği doğrulandı: her
şeyi stage'lemek yalnızca hedeflenen dokuz dosyaya dokundu. Binary'ler açıkça
işaretlendi, commit'lenmiş bundle ve lockfile `-diff linguist-generated` olarak
işaretlendi — böylece 730 KB'lık minified çıktı diff'lerin ve dil
istatistiklerinin dışında kalıyor — ve devralınan HackTimer kodu
`linguist-vendored` olarak işaretlendi.

`.gitignore` dosyasına `_site/` derleme çıktısı ile log, editör ve işletim sistemi
girdileri eklendi. `package.json` ve `package-lock.json` daha önce **ignore
ediliyordu**, artık takip ediliyor. Upstream'den gelen `.eslintrc.json` ve
`.dependency-cruiser.js` girdileri korundu ama açıklama düşüldü: bunlar yalnızca
yerel konfigürasyonlar ve paylaşılan bir linter konfigürasyonu ekleyecek kişinin
önce ilgili satırı silmesi gerekiyor, aksi hâlde konfigürasyon sessizce
commit edilmeyi reddedecek.

### GitHub Pages deploy hattı — P-2

Verilen örnek workflow gerçek repoya karşı kontrol edildi. Sekiz varsayımından
altısı geçerli değildi:

| Sorun | Çözüm |
| --- | --- |
| `main` üzerinde tetikleniyordu; varsayılan branch `master`, yani hiç çalışmayacaktı | `master` üzerinde tetikleniyor |
| `package.json` yokken `npm ci` — üstelik `.gitignore` onu aktif olarak dışlıyordu | `package.json` eklendi ve ignore'dan çıkarıldı |
| Lockfile yokken `cache: npm`, ki bu setup adımını başarısız kılar | lockfile commit'lendi, cache açıldı |
| `npm run build`, `check` ve `test:browser` — bu script'lerin hiçbiri yoktu | `build` ve `check` yazıldı; `test:browser` kaldırıldı |
| Yorumda `scripts/build-site.js`'e atıf var ama dosya yok | yazıldı |
| Artifact yolu `dist`, ki yalnızca bundle'ı barındırıyor, `index.html` ise kökte — bu, hiç sayfası olmayan bir site deploy edecekti | artifact yolu `_site` |

Örnekteki action sürümleri varsayılmak yerine registry'den doğrulandı:
`checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5` ve
`deploy-pages@v5` hepsi güncelmiş ve dokunulmadı. Yalnızca `setup-node` bir major
sürüm geridedi ve `v7`'ye yükseltildi.

`test:browser` taklit edilmek yerine kaldırıldı. Test altyapısı yok ve repodaki
`Verify_Game_Objects()` bir tarayıcı çalışma zamanı global'i olup DOM gerektiriyor;
dolayısıyla çalıştırmak headless tarayıcı bağımlılığı eklemek demek — ayrı bir
karar, bir deploy düzeltmesine sıkıştırılacak bir şey değil.

CI node sürümü bilinçli olarak 24'te sabitlendi. Bu, aktif LTS; Node 26 güncel
ama henüz LTS değil. `engines.node` değeri `>=22`, ki bu katkıcılar için taban,
CI hedefi değil.

Pages'in manuel olarak etkinleştirilmesi gerekmediği ortaya çıktı:
`configure-pages` ve `deploy-pages` ilk çalıştırmada siteyi kendileri
oluşturdular.

### Derleme ve doğrulama script'leri — P-2, P-3

**`scripts/build-site.js`**, `src/main.js`'i esbuild ile paketliyor ve deploy
edilebilir siteyi `_site/` içinde topluyor; `index.html` kopyasını bundle'ı
yükleyecek şekilde yeniden yazıyor.

Bu ayrım önemli. Repo kökü geliştirme giriş noktasıdır: `index.html` bilinçli
olarak `src/main.js`'i yükler, böylece oyun herhangi bir statik sunucuda derleme
adımı olmadan çalışır. Mevcut `build.js` bu takip edilen dosyayı yerinde yeniden
yazıyor ve her CI çalıştırmasında çalışma ağacını kirletiyor. Yeni derleyici
yazımı `_site/` kopyasına uyguluyor; böylece iki mod bir arada yaşıyor: yerelde
derlemesiz düzenle-ve-yenile, üretimde minified ve sürüm damgalı.

Bu ayrımın çeviriler için doğrudan bir sonucu var. esbuild,
`src/translation.js` içindeki dinamik `import()` ifadesini derleme anında
`locales/` dizinini glob'layarak çözüyor ve eşleşen her dosyayı bundle'a gömüyor;
dolayısıyla yeni eklenen bir dil dosyası bir sonraki derlemeye kadar bundle
modunda görünmez — dev modu ise onu çalışma zamanında getirir ve yeniden
derleme gerektirmez. CI her push'ta yeniden derlediği için bu yalnızca yerel
bundle modu testlerini etkiler.

`index.html` yeniden yazımındaki her ikame assert ediliyor; böylece bu dosyada bir
varsayımı bozan değişiklik, boş bir sayfa yayınlamak yerine derlemeyi gürültülü
biçimde başarısız kılıyor. Bu assert'leri yazmak, yeniden yazımın kendisindeki bir
hatayı hemen yakaladı: bir `[^>]*` kalıbı, yorum içine alınmış script etiketinin
kapanış `-->` işaretine ulaşamıyordu — çünkü etiket gövdesi `>` karakterleri
içeriyor — dolayısıyla yorum hayatta kalıyor ve derleme iki script etiketli bir
sayfa üretecekti.

**`scripts/check-site.js`**, toplanan siteyi ve daha önemlisi locale anahtar
eşliğini doğruluyor — P-7 için zemin çalışması. Bir çeviride bilinmeyen anahtarlar
ve temel anahtarı olmayan varyant anahtarları hata sayılıyor, çünkü ikisi de her
zaman bir hatadır; eksik çeviriler ise kapsam yüzdesi olarak raporlanıyor, böylece
bir çeviri sürerken CI yeşil kalıyor, `LOCALE_STRICT=1` ile ölümcül hâle
getirilebiliyor. Çalıştığı varsayılmak yerine kasıtlı olarak bozulmuş bir locale
ile doğrulandı.

### Araç zinciri güncellendi — P-3

- `engines.node` `>=22`'ye yükseltildi.
- esbuild `^0.28.2`'ye yükseltildi. Başlangıçtaki `^0.25.0` sabitlemesi kendisi bir
  hataydı: caret aralıkları `0.x` sürümlerinde minor'u kilitler, dolayısıyla
  `^0.25.0` en fazla `0.25.x` çözer ve `0.28`'e asla ulaşamazdı.
- **`live-server` tamamen kaldırıldı.** Son sürümü Nisan 2022 ve kurulu 222
  paketin 195'ini o getiriyordu; içinde birkaç deprecated dolaylı bağımlılık da
  vardı. Yerine hiçbir şey konmadı: hâlihazırda bağımlılık olan esbuild bir statik
  sunucu barındırıyor, bu yüzden `npm run serve` artık `--servedir` kullanıyor.
  Kurulu paket sayısı 222'den 27'ye indi.
- Deploy öncesinde derlenmiş `_site/` çıktısını bundle modunda önizlemek için
  `serve:site` eklendi.

MIME tipleri varsayılmak yerine doğrulandı; çünkü yanlış bir `Content-Type`
`<script type="module">`'ü sessizce bozar. esbuild sunucusu hem `src/main.js` hem
`locales/english.js` için `text/javascript` döndürüyor.

---

## Bu fork'tan önce

Oyunun kendi sürüm geçmişi, bu fork'un ayrıldığı noktaya kadar `changelog.html`
içinde ve upstream repoda bulunuyor. Bu dosya, fork'a özgü çalışmanın başladığı
yerden başlar.
