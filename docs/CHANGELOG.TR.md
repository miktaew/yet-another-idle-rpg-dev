<!-- doc-source: docs/CHANGELOG.md  doc-version: 10 -->

> **Kanonik dosya: [CHANGELOG.md](CHANGELOG.md).** Bu çeviri bilgilendirme
> amaçlıdır. Çelişki hâlinde İngilizce dosya geçerlidir.

# Değişiklik Geçmişi

Bu fork'un geliştirme geçmişi ve her değişikliğin arkasındaki gerekçe. Bir iş,
[PROPOSALS.TR.md](PROPOSALS.TR.md) içindeki karşılık gelen öneri `done` durumuna
geldiğinde buraya girer.

> **Bu, oyun içi changelog değildir.** Repo kökündeki `changelog.html`, oyunun
> içinde gösterilen ve oyuncuya yönelik sürüm geçmişidir; elle bakılan HTML olarak
> upstream'den devralınmıştır. Buradaki dosya ise geliştiriciye yönelik kayıttır:
> araç zinciri, altyapı, refactor'lar ve bunların gerekçeleri. İkisi bilinçli
> olarak ayrıdır ve biri diğerinin yerini almaz.

---

## 2026-08-19

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
