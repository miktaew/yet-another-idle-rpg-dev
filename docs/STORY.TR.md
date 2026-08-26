<!-- doc-source: docs/STORY.md  doc-version: 5 -->

> **Kanonik dosya: [STORY.md](STORY.md).** Bu çeviri bilgilendirme amaçlıdır.
> Çelişki hâlinde İngilizce dosya geçerlidir.
>
> Oyun içi alıntılar bilinçli olarak **İngilizce özgün hâlleriyle** bırakılmıştır:
> bunlar `locales/english.js` içindeki kanonik metinlerdir ve Türkçeye çevrilmiş
> hâlleri `locales/turkish.js` içinde ayrı birer kayıt olacaktır. Buradaki alıntıyı
> çevirmek, kanonu iki farklı yerde tutmak anlamına gelirdi.

# Hikâye kanonu

Bu fork'un anlatı referansı. Herhangi bir dialogue, quest, lokasyon, item
açıklaması veya atmosfer metni yazmadan önce okuyun.

**Kalıcı kural: hikâyeyi devam ettir, asla yeniden yazma.** 1'den 5'e kadarki
bölümlerin tamamı özgün oyundan devralınan kanondur ve değiştirilemez. 7. bölüm
eklediğimiz şeydir. Buradaki hiçbir şey korpusta zaten var olmayan veya onun
doğrudan uzantısı olmayan bir lore uydurmaz — her iddia `src/` veya `locales/`
içindeki bir dosyaya dayanır.

---

## 1. Dünya

Tek bir kıta, ama yalnızca taşrasından görülüyor.

Kodda dört yerleşim var: dağların eteğindeki bir **köy**, kapısı kapalı, surlu bir
**kasaba**, o surun dışındaki **slum'lar** ve nehrin altı geçit aşağısındaki
bataklıklarda yaşayan **Snake Fang Tribe**.

Dört bölge daha dialogue'larda adı geçiyor ama henüz yok — *"The mountain! The
plains! The woods! The bay!"* — ayrıca büyük nehir havzası ve Forest lake'in
ötesindeki kadim orman.

Uygarlık ince ve hızla inceliyor. Köy yaşlısının deyişiyle: *"Many leave looking
for better lives and we never hear from them again."*

## 2. Protagonist

Ormanda baygın bulunmuş, yaralı, *"with nothing but pants"*, kasabaya giderken
kafasına ağır bir darbe almış, hafızası gitmiş. Oyun bunu üç farklı oyuncu sorusu
üzerinden üç kez birebir söylüyor — premisin taşıyıcı olgusu bu.

Saldıranlardan biri slum'larda hayatta ve kahramanı görür görmez tanıyor:
*"Y-you! You should be dead!"* Dövüldükten sonra oyundaki tek ipucunu veriyor:
*"It was my group that robbed you… If you want answers, ask my ex-boss. **He's
somewhere in the town.**"*

## 3. Merkezî gizem

"Ben kimim" **değil**.

Şu: *yoldaki tek başına bir yolcu neden soyulup öldürülmeye değerdi ve ondan ne
alındı?*

Üç kanon olgu her cevabı kısıtlıyor:

1. Kahraman **her şeyinden soyulmuş**.
2. Eski patron **biliyor** ve mühürlü kasabanın içinde.
3. Kapı kendi iki anahtarını söylüyor: *"The town is currently closed to everyone
   who isn't a citizen or a merchant guild's member. No exceptions."*

Altında daha eski, ikinci bir gizem akıyor. Köyün altındaki mağarada insan öncesi
bir mimari var — *"all these squares make a circle, in some impossible to
understand way"* — ve *"you won't be able to open with brute strength"* denen ikinci
bir kapı; onu *"don't live in the walls, they ARE the walls… An abomination that
cannot exist, and yet it does"* diye tanımlanan şeyler koruyor.

Bu iki gizem omurgadır. İkisini de gelişigüzel çözmeyin.

## 4. Ton

**Alaycı-sıcak bir yüzey, altında sert bir zemin.**

Ön planda kafa okşamaları ve komik öfke: *"good job cutie~ \*[she bends forward and
pats your head]\*"*; *"Not just soldiers and workers, but queens and larvae too!"*

Kenarlarda organ kaybı, sürgün ve eldritch et.

Varsayılan anlatıcı açıklamaz, omuz silker: *"Fangs, tails or pelts, people will
buy them all. **I have no idea what they do with this stuff…**"*

Ahlaki ağırlık her zaman komik bir karakter tarafından sade bir sesle verilir:
*"If I run away, I am not living… And if I die here? Die helping? Die laughing?
Then I die living."*

Yazar zaman zaman oyunun üzerinden konuşur ve bu da sesin parçasıdır: bir başarısızlık
mesajı şöyle diyor — *"Turns out you're too weak for this, because of course you
are, what were you even thinking?"*

Yeni içerik bu registerde durmalı. Komedi ağırlığı taşır; korku ortamda ve
altı çizilmeden durur.

## 5. İsimlendirme kuralları — katı

1. **Hiçbir NPC'nin özel adı yoktur.** On dört dialogue'un hepsi rol unvanıdır:
   `village elder`, `village guard`, `old craftsman`, `village millers`,
   `gate guard`, `suspicious man`, `old woman of the slums`, `farm supervisor`,
   bataklık `chief` / `cook` / `tailor` / `tanner` / `scout`,
   `nekomimi proprietress`. Yeni NPC'ler aynı tarzda küçük harfli rol unvanı alır.
2. **Görünen ad duruma göre değişebilir, ama asla özel ada dönüşmez.**
   `suspicious man` önce `"no-longer-suspicious guy"`, sonra `"puppy"` olur.
3. **Özel adlar ayrılmıştır**: halklar (Snake Fang Tribe), yerler (Carya Canyon),
   malzemeler (Atratan, Belmart, Golmoon, Oneberry, Silver thistle) ve mitik
   olanlar (Ratzor Rathai, the Rat God) için. Bir kişiye ad vermeyin; bir taşa,
   bir bitkiye, bir kabileye ya da bir tanrıya verin.
4. **Her NPC'nin bir türü vardır**, kod yorumunda belirtilmiş ve eşleşen bir
   `mofu#` açıklama varyantı bulunur: yaşlı bir koç, zanaatkâr bir porsuk,
   değirmenciler bir kedi ve bir fare, şüpheli adam bir köpek, kapı muhafızı bir
   ayı, çiftlik sorumlusu bir geyik, yaşlı kadın bir tanuki, bataklık kadrosu
   lizardkin.
5. **Kemonomimi bir kaplama değil, bir kozmoloji anahtarıdır.** mofu flag'i
   kapalıyken kedi-halk, savunulması gereken bir ayyaş hikâyesidir — *"I wasn't
   drunk, they had cat tails and cat ears…"*; açıkken hiçbir açıklamaya ihtiyaç
   duymazlar. Yeni varsayılan mod metni beastkin konusunda çekingen konuşur;
   `mofu#` varyantı çekingenliği bırakır.
6. **Oyuncuya görünen metin asla `src/` içinde yaşamaz.** Dialogue yapısı
   `src/dialogues.js` içine, metin ise bir id arkasında `locales/<dil>.js` içine
   girer.

## 6. Türkçe hitap kipi

Türkçe, **NPC bazında karma kip** ile yazılır. Bu bir motor değişikliği
gerektirmez: her satır ayrı bir string id olduğu için kip satırın kendisine
yazılır. Kipi çalışma zamanında seçilebilir yapmaya **çalışmayın** — `mofu#`
mekanizması tek bir flag ve tek bir ön eke sabittir ve ikinci bir eksen ifade
edemez.

**Kahraman NPC'lere nasıl hitap eder:**

| Kip | NPC'ler |
| --- | --- |
| *siz* (resmî) | `village elder`, `old craftsman`, `old woman of the slums`, `gate guard`, `farm supervisor`, bataklık `chief`, bataklık `tanner` ve her lonca görevlisi |
| *sen* (samimi) | `village guard`, `village millers`, `suspicious man`, `nekomimi proprietress`, bataklık `cook` / `tailor` / `scout` |

Bataklık `tanner`'ı çevrilirken samimi gruptan resmî gruba taşındı. Bataklık kadrosunun
tamamını samimi saymak fazla kabaydı: kadın yaşlı ve oyuncunun ona ilk repliği
"Excuse me, are you the leatherworker?" — açıkça saygılı. Bu tablo ile kaynak metin
çeliştiğinde kaynak metin kazanır, tablo düzeltilir.

**NPC'ler kahramana nasıl hitap eder:** neredeyse tamamı *sen* — kadro sıcak ve
samimidir; kafa okşamaları, "cutie" ve "boy" hitapları buna dayanır. İstisna resmî
görevlilerdir — görev başındaki kapı muhafızı, lonca personeli — ve tam olarak
mesafe işaretlediği için *siz* kullanırlar.

Bataklık kadrosu kırık, basitleştirilmiş Türkçe konuşur; özgün metindeki kırık
İngilizceyi yansıtır. Etkiyi koruyun, gramerlerini düzeltmeyin.

## 7. Hikâye şu anda nerede duruyor

**Frontier.** Yazılmış içeriğin sonundaki oyuncu **hero level 25-30** aralığında,
**Swampland tribe'daki Longhouse**'ta duruyor ve *In Times of Need* görevini yeni
tamamlamış — oyundaki tamamlanabilir son quest. Ekipman tavanı, tier-5 alkimyasal
ahşap sap üzerinde tier-3 çelik başlık ve tier-5 timsah/yılan derisi zırh; tier-3
istasyon olmadığı için tier-2 istasyonda üretilmiş.

**Her NPC tükenmiş durumda.** Yaşlı *"Not yet, but hopefully soon"* üzerinde
duruyor. Muhafız *"that will have to be enough… I'm generally a terrible teacher"*
üzerinde. Tabakhaneci hâlâ hiç teslim edilmeyen bir zırhı bekliyor. İzci için
*"time is the only help for me"*.

**Dört quest görevi bağlanmamış durumda**, her biri kodda "devam edecek" olarak
işaretli: kasabaya girmek, mağarada daha derine inmek, köy genişlemesi ve
karanlıktaki ışık.

Oyuncunun tek yarım işi: **orman yolundan 240 dakika ötede açılmamış bir kapı ve
köyün 120 dakika altında açılamayan bir kapı.**

## 8. Yazılmış ama erişilemeyen

Repoda var olan ve hiçbir oyuncunun göremediği içerik. Çekişmeli olarak
doğrulandı — aşağıdaki her madde, dinamik aramalar, prosedürel havuzlar ve etiket
filtreleri dahil olmak üzere erişilebilir herhangi bir yol için bağımsız olarak
kontrol edildi. Dokuz yüksek değerli orphan doğrulandı, hiçbiri çürütülmedi.

Bunları geri kazanmak yeni içerik uydurmaya göre önceliklidir.

| İçerik | Nedir |
| --- | --- |
| **Town square** | Kasaba merkezi. *"The town's center of life, connected to all the markets, guilds, and other important places"*, yazılmış ortam sesleriyle. |
| **Adventurer's guild** | Tamamen yazılmış bir iç mekân; yaklaşık elli ortam repliği — rütbe sınavları, iş panoları, dedikodular. |
| **Antique store** | *"A private museum. There are paintings, furniture, ancient weapons and armors, as well as some things you cannot even recognize."* |
| **Cat cafe** | Yazılmış lokasyon; tüccarı var ama yanlış adlandırılmış bir envanter şablonuna işaret ediyor. |
| **Nekomimi cafe** | Yazılmış lokasyon, mofu ile kapılı. İşletmecinin dokuz metni hâlâ `lorem ipsum` yer tutucusu ve yayına girmeden önce yazılmalı. |
| **Mages guild** | Bir kabuk; açıklaması Nekomimi café'nin kopyası ve değiştirilmeli. |
| **`cute little rat`** | Tam yedi textline'lık bir dialogue; yorum içinde, yerelleştirme öncesi satır içi tarzda yazılmış. |
| **Forest lake derin dalış** | İkinci aşama keşif action'ı; yazar tarafından "ödülünün henüz bir kullanımı yok" notuyla bilinçli olarak kilitlenmiş — oyunun tek gümüş kaynağı. |
| **`Silver ingot` tarifi** | Yorum içinde, bir kullanım noktası bekliyor. Seviye aralığı zaten canlı demir ve çelik tarifleri arasında doğru yerde. |
| **İki combat stance** | `berserk` ve `flowing water`, skill'leriyle birlikte; bugün hiçbir şey vermiyor. |

**Durum: kapı açık; 3. ve 4. quest yayında.** Adventurer's guild ile Town square artık
NPC tutuyor — lonca kâtibi ve yeşil tentenin altındaki komisyoncu — ki bu, iki
odanın da bugüne dek sahip olduğu ilk içerik. 2. quest onlardan önce tamamlandı;
Town square, Cat cafe, Antique
store ve Adventurer's guild artık erişilebilir ve işletmecinin dokuz yer tutucu metni
yazıldı. Nekomimi cafe yalnızca beastkin flag'i açıkken erişilebilir — yazarının
amaçladığı şey buydu ve artık gerçekten çalışıyor. Mages guild 4. quest için kilitli
kalıyor ama artık Nekomimi cafe'nin açıklamasını taşımıyor.

Hâlâ geri kazanılmayanlar: yorum içindeki `cute little rat` dialogue'u, Forest lake
derin dalışı ve gümüşü, `Silver ingot` tarifi ve iki combat stance. Bunlar 3-6.
quest'lere ait.

## 9. Devam arkı — "The Merchant's Word"

Altı quest, tam olarak frontier'dan başlıyor. Quest başına tetikleyici, görev,
flag ve ödül detayları [PROPOSALS.TR.md](PROPOSALS.TR.md) içinde izleniyor.

**Premis, tamamen kanondan türetilmiş.** Kapı iki anahtar sayıyor: yurttaşlık ya
da tüccar loncası üyeliği. Bataklıktan sonra, loncaya şelalelerin ötesinden mal
tedarik edebilecek tek yaşayan kişi kahramandır — keten, timsah derisi ve kurutulmuş
et; üçü de kabile tarifleriyle öğrenilmiş. Aşçı ticareti çıkış yolu olarak zaten
çerçevelemişti: *"Many spice and meat and metal and leather come from there! From
very far away! It good place to go!"*

Yani kahraman kasabaya **kahraman olarak değil, tedarikçi olarak** girer. Bu oyun
için doğru register budur.

| # | Quest | Ne yapar |
| --- | --- | --- |
| 1 | *The Merchant's Word* | Kabile mallarını tedarik ederek lonca itibarı kazandırır. Bir kez adı geçip hiçbir yerde var olmayan tüccar loncasına gövde verir. |
| 2 | *No Exceptions* | Kapıyı açar — tedarikçi ya da yurttaş yolundan. Beş kasaba iç mekânını aydınlatır ve v0.4.6'dan beri ölü olan bir quest görevini tamamlar. Town itibarına oyundaki ilk tüketicisini kazandırır. |
| 3 | *Somewhere in the Town* | Eski patronun izini sürer. Dönüm noktası: soygun **sipariş edilmişti.** Biri o yolcunun durdurulması ve belirli bir nesnenin alınması için ödeme yapmış. |
| 4 | *Nothing but Pants* | Alınan şeyi meydandaki koleksiyoncudan geri satın alır. Oyunun ilk gerçek para gideri. Nesne iki gizemi de çözmeden birbirine bağlar. |
| 5 | *All These Squares Make a Circle* | Köyün altındaki ikinci kapıyı açar — odanın kendisinin ısrar ettiği gibi kuvvetle değil, zihinle. Fare questline'ını kapatır ve park edilmiş gümüş zincirini devreye alır. |
| 6 | *Way Too Strong for You* | Köy muhafızının on yıllık savuşturmasını karşılığa bağlar. Öğretmez, gösterir — böylece öğretmeyi reddedişine saygı gösterir. |

**Bilinçli olarak açık kalanlar:** soygunun parasını kimin ödediği; kahramanın o
nesneye nasıl sahip olduğu; aşçının coğrafya dersindeki dört bölge; güneydoğu
ovalarındaki sürgün kabile; ve Rat God'ın kendisi. Ark iki çıkmazı da açar,
hiçbir gizemi kapatmaz.

## 10. Yazım kuralları

- **Önce komşuları okuyun.** Bir NPC için satır yazmadan önce onun mevcut tüm
  satırlarını okuyup sese uyun. Bir item açıklaması yazmadan önce `src/items.js`
  içinde çevresindekileri okuyun.
- **Uydurmak yerine geri kazanmayı tercih edin.** Yazılmış içerik o beat'i zaten
  kapsıyorsa, paralel bir sürüm yazmak yerine onu devreye alın.
- **Her satır bir id'dir.** Yapı `src/dialogues.js`, metin `locales/english.js`,
  Türkçesi `locales/turkish.js`; iki anahtar kümesi de `npm run check` ile
  doğrulanır.
- **Sahne tür içeriyorsa `mofu#` varyantını yazın.** Temel anahtarı olmayan bir
  `mofu#` anahtarına asla ulaşılamaz.
- **Daha iyi okunsun diye bir registry anahtarını asla yeniden adlandırmayın.**
  Anahtarlar save dosyalarında saklanır; birini yeniden adlandırmak mevcut
  kayıtları bozar. Bkz.
  [AGENTS.TR.md](AGENTS.TR.md#5-save-uyumlulu%C4%9Fu--kat%C4%B1-kurallar).
- **Özgün yazarın açık bıraktığı bir gizemi çözmeyin** — 9. bölümdeki plan
  söylemiyorsa; söylüyorsa da yalnızca bir tur kadar.
- Her içerik değişikliğinden sonra `npm run check` çalıştırın, sonra oyunu açıp
  konsolda `Verify_Game_Objects()` çağırın.
