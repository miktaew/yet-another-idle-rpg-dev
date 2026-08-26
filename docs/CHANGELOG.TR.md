<!-- doc-source: docs/CHANGELOG.md  doc-version: 33 -->

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

## 2026-08-23

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
gel; aşırmaya değer bir şey görürsen aşır. Ben onları böyle edindim. Öğrenmenin
berbat bir yolu."*

**Challenge_zone değil.** "Ben senin için fazla ağır sıkletim" kanon; yani o,
oyuncunun yendiği bir düşman olamaz — kaybettiği bir düello, görevin adını aldığı
repliği yazılmamış hâle getirirdi. Bu, Combat ve Evasion'a bağlı, yinelenebilir bir
spar; ölçtüğü şey aşırmaya değer bir şey görecek kadar ayakta kalmak. Başarı metni
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
