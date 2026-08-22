<!-- doc-source: docs/PROPOSALS.md  doc-version: 10 -->

> **Kanonik dosya: [PROPOSALS.md](PROPOSALS.md).** Bu çeviri bilgilendirme
> amaçlıdır. Çelişki hâlinde İngilizce dosya geçerlidir.

# Öneriler ve İş Listesi

Bu fork'un çalışma listesi. Proje sahibinden gelen her direktif burada
numaralanmış bir öneri olarak kayda geçer, tamamlanana kadar izlenir ve ardından
neyin gerçekten değiştiği açıklanarak [CHANGELOG.TR.md](CHANGELOG.TR.md)
dosyasına aktarılır.

**Durum etiketleri**

| Durum | Anlamı |
| --- | --- |
| `done` | Tamamlandı ve doğrulandı. `CHANGELOG.md` içinde açıklandı. |
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

### D-6 — Doğrudan varsayılan branch'e push

Commit ve push doğrudan varsayılan branch'e yapılır (bugün `master`, ileride
`main` hedefleniyor). İstenmedikçe feature branch veya pull request açılmaz.
Pages deploy'u yalnızca varsayılan branch'te tetiklendiği için yan bir branch
deploy'u sessizce atlar.

---

## Öneriler

### P-1 — Kapsamlı proje analizi `done`

Değiştirmeden önce anlamak: mimari, içerik/veri katmanı, i18n hazırlığı, refactor
adayları, fork ayrışması, doküman durumu.

İki çok-agent'lı analizle teslim edildi — teknik denetim (8 alt sistem okuyucusu,
14 çekişmeli doğrulayıcı, 1 sentezleyici) ve anlatı keşfi (hikâye omurgası, açık
bağlar, erişilemeyen içerik, NPC yayları, coğrafya, ilerleme sistemleri).
Bulgular P-4, P-7, P-8 ve P-9'u besliyor.

### P-2 — GitHub Pages deploy workflow'unu düzelt `done`

Örnek bir `deploy-pages.yml` verildi. Gerçek repo yapısına karşı doğrulanıp
düzeltilecekti. Sekiz varsayımından altısı hatalıydı; kalem kalem listesi
`CHANGELOG.TR.md` içinde.

### P-3 — Araç zincirini güncelle `done`

`engines.node` değeri `>=22`'ye yükseltilecek, geride kalan bağımlılıklar ve
action'lar güncel sürümlere çekilecek.

### P-4 — `README.md`'yi yeniden yaz `done`

Mevcut README bu fork'u değil upstream projeyi anlatıyor ve birkaç iddiası artık
yanlış (`package.json` yokken `npm run build`, artık var olmayan bir bağımlılık
için `live-server` önerisi, upstream branch düzeni). Bu repo için yeniden
yazılacak, Türkçe eşiyle birlikte.

### P-5 — Doküman yapısı `done`

`docs/` klasörü şu çiftlerle oluşturulacak:

| Dosya | Amaç |
| --- | --- |
| `docs/AGENTS.md` | Agent'lar ve geliştiriciler için kanonik talimatlar (D-4). |
| `AGENTS.md` (kök) | İşaretçi stub; araçlar kök dosyayı otomatik keşfettiği için. |
| `docs/STORY.md` | Anlatı kanonu: dünya, protagonist, ton, hikâyenin şu an nerede durduğu. |
| `docs/PROPOSALS.md` | Bu dosya. |
| `docs/CHANGELOG.md` | Açıklamalı geliştirme geçmişi. |

İsimlendirme: büyük harf temel ad, büyük harf `.TR` işareti, küçük harf `.md`
uzantısı (`PROPOSALS.TR.md`). Deploy workflow'unun `paths-ignore` filtresi
büyük/küçük harfe duyarlı `**.md` kalıbı kullanıyor; başıboş bir `.MD` bu filtreyi
etkisiz bırakır ve yalnızca doküman değişen push'larda gereksiz bir rebuild
tetikler.

### P-6 — Upstream deployment referanslarını kaldır `done`

Varlıklar, repo bağlantıları ve ziyaretçi sayacı upstream yerine bu repo ve bu
deployment üzerinden çözülmeli.

Atıf bilinçli olarak **kaldırılmıyor**: MIT lisansı özgün telif bildiriminin
korunmasını gerektiriyor ve özgün yazar, fork'ların özgün projeye kredi verip
bağlantı vermesini açıkça istemiş. Varlık ve altyapı referansları taşınıyor;
kredi kalıyor ve dürüst biçimde yeniden etiketleniyor.

### P-7 — Oyuna Türkçe dil desteği `done`

Oyunun kendisine Türkçe seçeneği eklenecek. Çeviri katmanı hâlihazırda var ancak
şu anda yalnızca dialogue'ları ve arayüzün bir kısmını kapsıyor.

Engel kalktı: Q-1, Q-2 ve Q-4 karara bağlandı. Kapsam **tüm içerik katmanı** —
item, skill ve lokasyon görünen adları dahil.

Bu kapsamın tek katı ön koşulu var: **registry anahtarları şu anda görünen adların
kendisidir ve save dosyalarında birebir saklanır.** Dolayısıyla önce bir görünen-ad
dolaylama katmanı gelmeli — her registry girdisi İngilizce anahtarını kalıcı olarak
korur ve gösterilen adı için bir metin id'si kazanır. Anahtar yeniden adlandırmak
hiçbir zaman seçenek değildir. Bu, listedeki en büyük tek iş parçasıdır ve kendi
refactor ön koşulu olarak izlenir.

Hitap kipi bir motor özelliği değil, **NPC bazında yazım kuralıdır** — bkz.
[STORY.TR.md](STORY.TR.md#6-t%C3%BCrk%C3%A7e-hitap-kipi). `src/translation.js`
içindeki arama mantığında değişiklik gerekmez, çünkü her satır zaten ayrı bir
string id'dir.

**Tamamlanan** — dil uçtan uca çalışıyor. `getText` artık çevrilmemiş her id için
varsayılan dile düşüyor; kısmi bir locale'i güvenli kılan şey bu. `turkish` kayıtlı;
`locales/turkish.js` arayüz, stat, skill, ırk ve künye bölümlerini taşıyor; ayarlar
paneline `languages` registry'sinden inşa edilen ve canlı geçiş yapan bir seçici
eklendi. `npm run check` kapsamı raporluyor, `npm test` arama ve fallback davranışını
kapsıyor. Çevirmen el kitabı ve sözlük [I18N.TR.md](I18N.TR.md) içinde.

**Tamamlandı.** Oyunda oyuncuya görünen İngilizce metin kalmadı. Dil başına 2536
anahtar; diyalogları, quest'leri, item'ları, lokasyonları, düşmanları, becerileri,
duruşları, efektleri, etkinlikleri, tarifleri, tüccarları, günlük mesajlarını ve
arayüzü kapsıyor. Oyunun bildirmek yerine ürettiği 203 item, parametreli ad
kalıplarıyla kapsanıyor; `help.html` ve `changelog.html`'in ise düğmelerin geçtiği
Türkçe karşılıkları var. Geriye kalanlar [I18N.TR.md](I18N.TR.md) bilinen boşluklar
bölümünde yapısal notlar olarak yazılı: init öncesi iki yükleme mesajı, bağımsız
sayfaların ayrışma riski ve İngilizcenin kendisinin bir sayıyı tekrarladığı birkaç
yer.

### P-8 — Bildirilen NaN uyarılarını gider `active`

Analizden gelen çerçeve düzeltmesi: çekişmeli doğrulama, *ekrana basılan* `NaN`
metni için öne sürülen tüm adayları çürüttü. Var olan şey bir konsol
**uyarısı** — ki özgün talepteki ifade de buydu — ve `src/main.js` içindeki
guard, bir skill'e sayısal olmayan xp eklendiğinde bunu yazıyor.

Analiz, 11 maddelik sıralı bir düzeltme listesi artı yan temizlikler üretti. En
kritik ikisi:

- Skill xp'sinin yazılmasından önceki son kapı `xp_to_add == 0` karşılaştırması
  yapıyor; bu hem `NaN`'ı hem `Infinity`'yi geçiriyor. `Infinity`, seviye atlama
  döngüsünü sonlanmaz hâle getiriyor ve tarayıcı sekmesini kilitliyor.
- Bir `typeof x === Number` karşılaştırması koşulsuz olarak false; çünkü `typeof`
  bir string döndürür, `Number` ise bir constructor'dır. Koruduğu kazanç başına
  xp sınırı bu yüzden hiç uygulanmamış. Düzeltmek canlı bir denge değişikliği
  olduğu için kendi changelog satırını gerektiriyor.

Ayrıca D-2 açısından daha ilginç bir bulgu: boy/ırk yardımcı fonksiyonu
alanlarını yanlış nesneden okuyor, dolayısıyla boy ve ırk seçiminin şu anda
oynanışa **hiçbir etkisi yok** ve bir dialogue varyantı kalıcı olarak
erişilemez durumda.

**Tamamlanan** - canlı oyundan bildirilen skill xp paneli görüntüsü ve arkasındaki
model hataları; ilk düzeltmenin getirdiği bir regresyon; skill ilerleme çubuğu
genişliği; yeni etkinleşen xp sınırının iyimser hâle getirdiği seviye atlama
tahmini; ve boy/ırk fonksiyonu ile birlikte boy koşul bloğu. Hepsi
[CHANGELOG.TR.md](CHANGELOG.TR.md) içinde yazılı ve `npm test` ile kapsanıyor.

**İncelenip elenen** - yeniden gündeme gelmemesi için buraya kaydedildi. Her biri
çekişmeli olarak "düzeltmeye değmez" diye doğrulandı:

- *Max seviyedeki crafting skill xp aritmetiği* (`main.js`, dört nokta). `NaN`
  üretiyor, ama değer yalnızca `accumulated_xp >= needed_xp` karşılaştırmasında
  kullanılıyor ve `x >= NaN` ile `x >= Infinity` ikisi de false. Önerilen
  `|| Infinity` koruması hiçbir şeyi değiştirmiyor. Korumayı taşıyan kardeş nokta
  ona ihtiyaç duyuyor çünkü o dal değer üzerinde aritmetik yapıyor — kullanımda bir
  asimetri, gözden kaçırma değil.
- *Boş savaş bölenleri* (`main.js`, stance xp ve hayatta kalan sayısı üsleri).
  `is_alive = false` tek bir yerde yazılıyor ve o yer ilgili düşmanın zamanlayıcısını
  hemen temizliyor; öldürme-yeniden doldurma yolu ise ara vermeyen tek bir senkron
  callback — yani hiçbir şey tamamı ölü bir düşman listesini gözlemleyemiyor.
  Gözlemleyebilse bile giriş koruması değeri hatayla reddediyor ve değer hiç
  saklanmıyor.
- *Düşman panelindeki isabet ve kaçınma oranları* sıfır hayatta kalanla. Sıfır
  durumu erişilebilir, ancak `get_hit_chance` sonunda `else { result = 0 }` ile
  `NaN`'ı dönüştürüyor ve düzeltici yeniden çizim aynı senkron görev içinde
  gerçekleşiyor; arada hiçbir kare çizilmiyor. O son dal işlevsel ve belgesiz —
  savunulabilir tek aksiyon bir yorum eklemek.
- *Karakter xp giriş koruması* (`character.js`). Dört çağrı noktasının hepsi
  kanıtlanabilir biçimde sonlu, `total_xp` 0'dan başlıyor ve yalnızca artırılıyor,
  yükleme yolunun girdisi ise diğer üçünün yazdığı bir kayıttan geliyor. En iyi
  hâlde derinlemesine savunma.

**Hâlâ açık** - interpolasyon yardımcıları (`slerp` ve tarif eşdeğeri) ile
market doygunluğu böleni. Bunlar canlı hata değil, uykuda duran yazım tuzakları: bir
içerik dizisi 0'dan başladığında bozuluyorlar ve şu anda hiçbiri başlamıyor. Birisi
tetikleyecek diziyi yazmadan önce düzeltmeye değer; ayrıca verifier'a sayısal
çiftlerin pozitif olduğunu doğrulamayı öğretmeye değer — şu anda yalnızca kaynak
adlarının çözülüp çözülmediğini kontrol ediyor.

### P-9 — Hikâyeyi devam ettir `open`

Kanon, frontier, orphan envanteri ve planlanan ark artık
[STORY.TR.md](STORY.TR.md) içinde yazılı. Q-1 tam ayrışma yönünde karara
bağlandığı için yeni içerik kapsam dahilinde.

Ark **"The Merchant's Word"**; frontier'dan tam olarak başlayan altı quest.
Premisi tamamen kanondan türetildi: kasaba kapısı tek iki anahtar olarak
yurttaşlığı veya tüccar loncası üyeliğini sayıyor ve bataklıktan sonra loncaya
şelalelerin ötesinden tedarik yapabilecek tek yaşayan kişi kahramandır. Kahraman
kasabaya kahraman olarak değil, tedarikçi olarak girer.

Uygulama sırası, en yüksek kaldıraç önce:

1. **Q2 — TAMAMLANDI.** Kapı açıldı, Town itibarının tamamı olan 150'ye
   kapılandı ve böylece o itibar ilk tüketicisini kazandı. Town square, Cat cafe,
   Antique store ve Adventurer's guild erişilebilir; `Location` artık
   `display_conditions`'ı dikkate aldığı için Nekomimi cafe doğru şekilde
   beastkin ile kapılı; v0.4.6'dan beri ölü olan Lost memory görevi
   tamamlanabilir. [CHANGELOG.TR.md](CHANGELOG.TR.md) içinde yazılı.
2. Orphan'larla birlikte bulunan geri kazanım engellerini düzelt: cat cafe tüccarı
   yanlış adlandırılmış bir envanter şablonuna işaret ediyor; Mages guild
   açıklaması Nekomimi cafe'nin kopyası; Nekomimi işletmecisinin dokuz
   `lorem ipsum` metni duruyor; `Location` constructor'ı `display_conditions`'ı
   sessizce düşürüyor, dolayısıyla mofu kapılaması push noktasında yapılmalı.
3. Q3 ve Q4 merkezî gizemi tam bir tur ilerletiyor — soygun sipariş edilmişti — ve
   oyuncuya iki çıkmaz arasında fiziksel bir bağ veriyor.
4. Q5 fare questline'ını kapatıyor, ikinci mağara kapısını odanın kendisinin ısrar
   ettiği gibi kuvvetle değil zihinle açıyor ve park edilmiş gümüş zincirine
   nihayet bir kullanım noktası veriyor.
5. Q6 köy muhafızının on yıllık savuşturmasını karşılığa bağlıyor.

Açık kalması gerekenler: soygunun parasını kimin ödediği, kahramanın o nesneye
nasıl sahip olduğu, inşa edilmemiş dört bölge, sürgün kabile ve Rat God.

---

## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar.

### Q-1 — Bu fork içerik olarak ayrışacak mı? **KARAR: tam ayrışma**

Yeni bölgeler, item'lar ve dialogue kapsam dahilinde. Upstream senkronizasyonu
artık bir hedef değil. Refactor'ların upstream ile merge-dostu kalması gerekmiyor
ve Q-5 (`dist/` takipten çıkarma) o zamandan beri takipten çıkarma yönünde
karara bağlandı.

### Q-2 — Türkçe nereye kadar? **KARAR: her şey**

Arayüz, dialogue ve item / skill / lokasyon görünen adları.

Sonucu, P-7'de anlatılan görünen-ad dolaylama katmanıdır. Registry anahtarları
kalıcı olarak İngilizce kalır, çünkü onlar save verisidir; çevrilen şey, girdi
başına ayrı bir gösterilen-ad metin id'sidir. Bunun hiçbir kısmı anahtar yeniden
adlandırmaya izin vermez.

### Q-3 — `help.html` ve `changelog.html` Türkçe kapsamında mı?

İkisi birlikte repodaki en büyük İngilizce yüzey ve hiçbirinde i18n bağlantı
noktası, hatta bağlanacak bir kapsayıcı bile yok. Öneri: elle yazılmış bir Türkçe
yardım sayfası ve Türkçe bir not düşülmüş, İngilizce kalan bir changelog.

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

### Q-6 — Dil değiştirme: yeniden yükleme mi, canlı mı?

Kaydet-sonra-yeniden-yükle yaklaşımı birkaç satır ve senkronizasyondan çıkması
imkânsız. Gerçek bir canlı geçiş, display modülü bölünmeden var olmayan bir "tüm
ekranları yenile" giriş noktası gerektiriyor.

---

## Bu dosyanın kuralları

- Her direktif için bir öneri; numaralandırılır ve asla yeniden numaralandırılmaz.
- Bir öneri `done` durumuna geldiğinde açıklaması
  [CHANGELOG.TR.md](CHANGELOG.TR.md) dosyasına yazılır, öneri kayıt olarak burada
  kalır.
- Kararlar [Bekleyen kararlar](#bekleyen-kararlar) bölümünden onları tüketen
  öneriye taşınır ve cevap kayda geçirilir.
