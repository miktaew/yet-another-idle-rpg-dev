<!-- doc-source: docs/PROPOSALS.md  doc-version: 1 -->

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

### P-4 — `README.md`'yi yeniden yaz `active`

Mevcut README bu fork'u değil upstream projeyi anlatıyor ve birkaç iddiası artık
yanlış (`package.json` yokken `npm run build`, artık var olmayan bir bağımlılık
için `live-server` önerisi, upstream branch düzeni). Bu repo için yeniden
yazılacak, Türkçe eşiyle birlikte.

### P-5 — Doküman yapısı `active`

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

### P-6 — Upstream deployment referanslarını kaldır `active`

Varlıklar, repo bağlantıları ve ziyaretçi sayacı upstream yerine bu repo ve bu
deployment üzerinden çözülmeli.

Atıf bilinçli olarak **kaldırılmıyor**: MIT lisansı özgün telif bildiriminin
korunmasını gerektiriyor ve özgün yazar, fork'ların özgün projeye kredi verip
bağlantı vermesini açıkça istemiş. Varlık ve altyapı referansları taşınıyor;
kredi kalıyor ve dürüst biçimde yeniden etiketleniyor.

### P-7 — Oyuna Türkçe dil desteği `blocked`

Oyunun kendisine Türkçe seçeneği eklenecek. Çeviri katmanı hâlihazırda var ancak
şu anda yalnızca dialogue'ları ve arayüzün bir kısmını kapsıyor.

Q-1, Q-2 ve özellikle Q-4 kararlarına bağlı olarak bekliyor; çünkü Türkçe hitap
kipi her NPC satırındaki fiil çekimini değiştirir ve sonradan bul-değiştir ile
uygulanamaz.

Zemin çalışması tamamlandı: `npm run check` locale anahtar eşliğini denetliyor,
böylece ikinci bir dil sessizce senkronizasyondan çıkamaz (P-2).

### P-8 — Bildirilen NaN uyarılarını gider `open`

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

### P-9 — Hikâyeyi devam ettir `open`

P-1'in anlatı analizine ve `docs/STORY.md`'nin var olmasına bağlı. Kapsam: açık
bağları karşılığa bağlamak, erişilemeyen içeriği devreye almak ve quest zincirini
mevcut frontier'dan itibaren uzatmak.

---

## Bekleyen kararlar

Bunların her biri neyin inşa edileceğini değiştirir. Tahmin edilmek yerine burada
kayda geçiriliyorlar.

### Q-1 — Bu fork içerik olarak ayrışacak mı?

"Yalnızca hosting, Türkçe ve konfigürasyon" fork'u upstream'e karşı
fast-forward edilebilir tutar. "Yeni bölgeler, item'lar ve dialogue" ise tam
ayrışma ve senkronizasyonun sonu anlamına gelir. Arada bir seçenek yok, çünkü kod
tabanında bir mod sınırı bulunmuyor. Bu cevap Q-2 ve P-9 için üst sınırı belirler.

### Q-2 — Türkçe nereye kadar?

Arayüz artı hikâye dialogue'ları, tüm içerik katmanını çevirmenin yaklaşık onda
biri kadar iş ve oyuncunun en çok okuduğu kısmı kapsıyor. Item, skill ve lokasyon
adlarını çevirmek ek olarak registry anahtarlarının görünen adlardan ayrılmasını
gerektirir; çünkü anahtarlar şu anda görünen adların kendisi ve aynı zamanda save
dosyalarında birebir saklanıyor. Arayüz ve dialogue'dan sonra durmak yarım
kalmış bir iş değil, savunulabilir bir ürün kararıdır.

### Q-3 — `help.html` ve `changelog.html` Türkçe kapsamında mı?

İkisi birlikte repodaki en büyük İngilizce yüzey ve hiçbirinde i18n bağlantı
noktası, hatta bağlanacak bir kapsayıcı bile yok. Öneri: elle yazılmış bir Türkçe
yardım sayfası ve Türkçe bir not düşülmüş, İngilizce kalan bir changelog.

### Q-4 — Türkçe hitap kipi: senli mi, sizli mi?

Herhangi bir dialogue yazılmadan **önce** karara bağlanmalı. Mevcut metin varyantı
mekanizması, tek bir flag ve tek bir anahtar ön ekine sabitlendiği için hitap
kipini ikinci bir eksen olarak ifade edemez; bunun için arama mantığının
yeniden yazılması gerekir.

### Q-5 — `dist/` takipte kalsın mı?

Takipte kaldığı sürece her upstream senkronizasyonunda garanti bir birleştirilemez
çatışma kaynağı. Takipten çıkarmak artık güvenli, çünkü CI build alıyor ve dev
sunucusu `src/` üzerinden çalışıyor; ancak hem `.gitattributes` hem site
derleyicisi takipte kalacağı varsayımıyla yazıldı.

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
