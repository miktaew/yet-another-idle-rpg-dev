<!-- doc-source: docs/AGENTS.md  doc-version: 8 -->

> **Kanonik dosya: [AGENTS.md](AGENTS.md).** Bu çeviri bilgilendirme amaçlıdır.
> Çelişki hâlinde İngilizce dosya geçerlidir.
>
> Sürüklenmeyi (drift) önlemek için büyük referans tabloları burada tekrar
> edilmez; ilgili bölümler İngilizce dosyanın bağlantısını verir. Gerekçeler ve
> "neden/ne zaman" açıklamaları Türkçedir.

# Agent ve katkıcı rehberi

Bu repoda nasıl çalışılacağının tek doğru kaynağı
[AGENTS.md](AGENTS.md) dosyasıdır. Kökteki [`AGENTS.md`](../AGENTS.md) yalnızca
araçların otomatik keşfettiği bir işaretçi stub'ıdır.

---

## 1. Bu repo nedir

Skill seviyelendirme üzerinden ilerlemeye odaklı, tarayıcı tabanlı metin idle RPG:
"Yet Another Idle RPG". esbuild ile paketlenen saf ES modülleri. Framework yok,
çalışma zamanı bağımlılığı yok.

`miktaew/yet-another-idle-rpg` projesinin bir **devam fork'udur** (upstream'in bir
de `-dev` reposu vardı). Upstream geliştirme durdu. Fork temel commit'i: `e5fba67`.

`HEAD` yayınlanan hattır: `v0.6.0`'dan `v0.6.5`'e kadar hepsi yayına çıktı ve
minor numara araç zinciriyle değil hikâye içeriğiyle ilerliyor.

Neyin değişebileceği ve değişemeyeceği dahil kalıcı proje yönü
[PROPOSALS.TR.md](PROPOSALS.TR.md) içinde. Anlatı kanonu [STORY.TR.md](STORY.TR.md)
içinde.

## 2. Komutlar

Tam tablo: [AGENTS.md § 2](AGENTS.md#2-commands).

| Komut | İşlevi |
| --- | --- |
| `npm install` | Tek bağımlılık olan esbuild'i kurar. |
| `npm run serve` | `127.0.0.1:8080` üzerinde statik sunucu, **dev modu**. Kaynak düzenlemeleri sayfa yenilenince canlı. |
| `npm run build` | `src/main.js`'i `dist/bundle.js` içine paketler, ardından deploy edilebilir siteyi `_site/` içinde toplar. İkisi de takip edilmiyor. |
| `npm run check:save` | Dışa aktarılmış bir savegame'i güncel registry'lere karşı denetler. Save'in yolunu alır. CI'da değil: bir save dosyası gerekiyor. |
| `npm run check` | Toplanan siteyi, locale anahtar eşliğini ve içeriğin erişilebilir olup referanslarının çözüldüğünü doğrular. `LOCALE_STRICT=1` eksik çevirileri ölümcül yapar; **CI bunu açıyor**, çünkü Türkçe tamamlandı. |
| `npm test` | Skill xp modeli için regresyon testleri. |
| `npm run serve:site` | `127.0.0.1:8081` üzerinde `_site/` sunar; derlenen siteyi bundle modunda doğrulamak için. |

Node 22 veya üzeri gerekir. `file://` çalışmaz — ES modülleri sunucu ister.

**`node build.js` çalıştırmayın.** Upstream'den devralınan derleyicidir ve bir
tuzaktır: takip edilen kök `index.html` dosyasını yerinde yeniden yazar ve
bundle sürüm regex'i *yorum içine alınmış* script etiketiyle eşleşir; yani ölü bir
etiketi damgalar ve canlı script'i hiç değiştirmez. Bilinçli olarak npm script'i
olarak sunulmuyor. `npm run build` kullanın.

## 3. Dev modu ile bundle modu

Burada en çok karışıklık yaratan ayrım budur.

- Kök `index.html`, `src/main.js`'i yükler. Bu **geliştirme giriş noktasıdır** ve
  bilinçlidir: oyun herhangi bir statik sunucuda, derleme adımı olmadan çalışır.
- `npm run build` kök `index.html`'i asla değiştirmez. `_site/` içindeki kopyayı
  yeniden yazar, `dist/bundle.js`'e çevirir ve güncel sürümü damgalar.
- Dolayısıyla kök `index.html` içindeki `style.css?version=…` değeri **bilinçli
  olarak güncel değildir.** Elle "düzeltmeyin". Yalnızca `_site/` kopyası damgalanır.

Çeviriler açısından sonucu: esbuild, `src/translation.js` içindeki dinamik
`import()` ifadesini derleme anında `locales/` dizinini glob'layarak çözer ve
eşleşen her dosyayı bundle'a gömer. **Yeni eklenen bir dil dosyası, bir sonraki
derlemeye kadar bundle modunda görünmez.** Dev modu onu çalışma zamanında getirir
ve yeniden derleme gerektirmez. CI her push'ta yeniden derlediği için bu yalnızca
yerel bundle modu testlerini etkiler.

## 4. Repo yapısı

İçerik modül başına registry'lerde yaşar: dosyanın başında tanımlanan bir
`const X = {}`, atama ile doldurulur ve export edilir.

Modül → registry → örnek eşlemesinin tam tablosu:
[AGENTS.md § 4](AGENTS.md#4-repository-shape).

Göründüğü gibi olmayan iki dosya:

- **`src/rewards.js` koddur değil, dokümandır.** Hiç import edilmez ve hiçbir şey
  export etmez. Textline'lar, lokasyonlar, action'lar ve quest'ler tarafından
  kullanılan `rewards` nesnesinin yetkili şemasıdır. Bir ödül yazmadan önce okuyun.
- **`src/mods/glassmaking.js` ölüdür** ve oyuna bağlı değildir.

İçerik yazmadan önce okunmaya değer kapsamlı kod içi doküman blokları da var:
`src/items.js` başındaki kalite-nadirlik tablosu ve silah tasarım felsefesi,
`src/crafting_recipes.js` başındaki kalite-başarı oranı modeli,
`src/locations.js` içindeki `connected_locations` biçimi ve `src/races.js`
başındaki büyük harfli uyarı.

## 5. Save uyumluluğu — katı kurallar

**Registry anahtarları save dosyalarında birebir saklanır.** Item id'leri, lokasyon
anahtarları, dialogue ve textline anahtarları, skill id'leri, tarif id'leri, flag
adları ve activity adları — hepsi oyuncunun kaydına yazılır.

Bunlardan herhangi birini yeniden adlandırmak mevcut kayıtları sessizce bozar. Bu
kod tabanında gerçek hasar vermenin en kolay yolu budur.

Zorlayıcı mekanizmalar, kaçış kapıları ve migration deseni:
[AGENTS.md § 5](AGENTS.md#5-save-compatibility--the-hard-rules).

Anahtarlar aynı zamanda insan tarafından okunabilir görüntü metinleri olduğu için,
bir registry anahtarını çevirmek onu yeniden adlandırmakla aynı işlemdir. Bkz.
bölüm 8.

## 6. Sürüm yükseltme

Dört yer, bu sırayla: `src/game_version.js` (tek doğru kaynak, `v` ön ekiyle ve
üç parçalı — `v0.6.0`; çünkü hikâye çalışması ve yeni bölgeler minor sürüm
yükseltmesi alır), `package.json` (aynı numara, `v` ön eki **olmadan**, elle
senkron), `changelog.html` (`<main class="versions">` başına yeni bir
collapsible, en yenisi üstte) ve `changelog.tr.html` (aynı girdinin Türkçesi).

Dosyalardan biri yayımlanan sürüm için girdi taşımıyorsa `npm run check` hata
verir; yani dördüncüsü isteğe bağlı değil.

Kök `index.html` sürüm değerlerine **dokunulmaz**. Bkz. bölüm 3. Bağımsız
sayfalardaki `<span class="game_version">` değerine de dokunulmaz:
`scripts/build-site.js` `_site/` kopyalarını damgalar; repo kopyasındaki sabit
değer yalnızca sayfa diskten açıldığında doğru okunsun diye orada.

## 7. Kalite kapıları

Linter yok, formatter yok.

- `npm run check` ve `npm test` her push'ta CI'da çalışır.
- `npm test` skill xp modelini kapsar. `src/skills.js`'i doğrudan `import`
  edemez — dairesel import'lar yalnızca tarayıcıda çözülür — bu yüzden gerçek
  kaynağı okur, import ifadelerini `Skill` sınıfının kullandığı üç fonksiyon için
  stub'larla değiştirir ve onu import eder. Test edilen kod, yayınlanan koddur.
  Başka bir modül için test eklerken aynı yaklaşımı izleyin ve harness'ın kaynağa
  dair varsayımları geçersizleşirse hata vermesine izin verin.
- `Verify_Game_Objects()` bir tarayıcı konsolu aracıdır. İçeriğin büyük kısmını
  gezerek özellik değerlerini ve çapraz referansları denetler. **Oyun açıldıktan
  sonra** çağırın — yüklenmiş çeviri tablosuna erişir ve o tablo yalnızca
  `translationManager.init` çalıştıktan sonra vardır. Kendi kapsam boşluklarını
  `src/verifier.js` sonunda belgeler; ne kusursuzdur ne de her şeyi kapsar.

Her içerik değişikliğinden sonra: `npm run check` çalıştırın, sonra oyunu açıp
`Verify_Game_Objects()` çağırın.

## 8. Metin ve çeviriler

**Oyuncuya görünen metni asla `src/` içine gömmeyin.** Tüm anlatı ve arayüz metni,
bir string id arkasında `locales/<dil>.js` içinde durur. Dialogue yapısı
`src/dialogues.js` içinde yaşar; o düğümlerin gösterdiği metin locale dosyasındadır.

Kuralların tamamı: [AGENTS.md § 8](AGENTS.md#8-text-and-translations). Özetle:

- Locale nesnesi **düz, tek isim alanıdır**. `npm run check` buna dayanır.
- Bir çeviride olup `english.js` içinde olmayan anahtar her zaman hatadır.
- `mofu#` ön eki ırksal metin varyantı seçer. Temel anahtarı olmayan bir `mofu#`
  anahtarına asla ulaşılamaz, çünkü arama varyanttan temele düşer, tersi olmaz.
- İçerik dosyaları cümle değil **metin id'si** bildirir. Buna `quest_name`,
  `quest_description`, `task_description` ve her `rewards.messages` girdisi dahil.
  `npm run check` bildirilen her id'nin varsayılan locale'de var olduğunu doğrular;
  böylece yazım hatası, oyuncunun karşısında yer tutucu olarak görünmek yerine
  derlemeyi başarısız kılar.
- **Bir registry anahtarını asla çevirmeyin.** Anahtarlar save'lerde saklanır
  (bölüm 5). Görünen adları çevirmek önce ayrı bir id-ad katmanı gerektirir; bu,
  [PROPOSALS.TR.md](PROPOSALS.TR.md) içinde bekleyen bir karar olarak izleniyor.
- Güncel referans anahtar sayısı için `npm run check` çalıştırın. Sayıyı
  dokümanlara sabitlemeyin; değişir.

**Sözlük ve makine-çevirisi karşıtı kurallar dahil tam çeviri el kitabı:
[I18N.TR.md](I18N.TR.md).** Bir locale dosyasına dokunmadan önce okuyun.

Türkçeye özgü tuzaklar: parça parça
birleştirilerek kurulan cümleler doğru çevrilemez ve parametreli şablona
dönüştürülmeleri gerekir; ayrıca görüntü metni üzerindeki `toUpperCase()` /
`toLowerCase()` çağrıları locale duyarlı olmalıdır, çünkü Türkçedeki noktalı ve
noktasız `i` varsayılan locale'in beklediği gibi eşlenmez.

## 9. Kod stili

Çevresindeki koda uyun. Ampirik olarak: dört boşluk (asla tab), çift tırnak, 1.
satırda `"use strict";`, fonksiyon ve veri alanlarında `snake_case`, sınıflarda
`PascalCase` (`Combat_zone` ve `Challenge_zone` mevcut istisnalar), yalnızca
`getName` / `getDescription` gibi erişimci override'larında `camelCase`. Registry
anahtarları tanımlayıcı değil, insan tarafından okunabilir cümle biçiminde
metinlerdir.

**Kod yorumları İngilizce yazılır** — onları üreten konuşmanın dili ne olursa olsun.

Ayrıntılar: [AGENTS.md § 9](AGENTS.md#9-code-style).

## 10. Tuzaklar

Tam liste: [AGENTS.md § 10](AGENTS.md#10-gotchas). En kritik olanlar:

- **Dairesel import'lar yaygın ve işlevseldir.** On üç modül `main.js`'ten geri
  import eder, `main.js` ise yaklaşık otuz modülü import eder. Gelişigüzel
  "çözmeye" çalışmayın; başlatma sırası buna bağlı.
- **Satır içi HTML handler'ları window global'i ister.** Yaklaşık seksen fonksiyon,
  `index.html` içindeki `onclick` niteliklerinin onları bulabilmesi için
  `main.js`'te `window`'a bağlanır. Yeni bir satır içi handler oraya eklenmelidir.
- **`src/display.js`, `onclick` niteliklerini metin olarak yazar** ve bu metinler
  `index.html` sonundaki satır içi `<script>` içinde tanımlı fonksiyonları
  adlandırır. Onlardan birini yeniden adlandırmak yalnızca oyuncu tıkladığında
  hata verir; yüklemede ve CI'da değil.
- **Deployment kimliği `config.js` içinde yaşar.** `release_ids`, `is_on_dev()` /
  `is_on_main()` fonksiyonlarını sürer. `is_on_dev()` save'in hangi `localStorage`
  anahtarında tutulduğunu seçer; dolayısıyla `dev` değerini canlı bir deployment'a
  yöneltmek mevcut her oyuncuya boş bir save yuvası verir. Bu alanı tehlikeli
  olarak görün.
- **`dist/` takip edilmiyor.** `npm run build`'in her çalıştırmada yazdığı
  esbuild çıktısı; deploy workflow'u da o build'i kendisi çalıştırdığı için
  commit'li bir kopyayı kullanan hiçbir şey yok. Asla elle düzenlemeyin, asla
  commit'lemeyin.
- **`npm run build`'in commit'lenmesi gerekmez, ama çalıştırılması gerekir.**
  `npm run check` yalnızca build'den sonra var olan `_site/`'ı okur; yani bayat
  bir `_site/` üzerinde çalışan check, bir önceki değişikliği doğrulamış olur.

## 11. Çalışma kuralları

- **Dokümantasyon iki dillidir.** Her `.md` bir çift olarak yayınlanır: `NAME.md`
  ve `NAME.TR.md`. İngilizce kanoniktir. İkisini aynı değişiklikte güncelleyin;
  bayat kalan bir yarı, hiç çeviri olmamasından kötüdür.
- **İsimlendirme:** büyük harf temel ad, büyük harf `.TR`, küçük harf `.md`. Deploy
  workflow'unun `paths-ignore` filtresi büyük/küçük harfe duyarlı `**.md` kullanır;
  `.MD` uzantısı bunu etkisiz bırakır ve gereksiz rebuild tetikler.
- **Doğrudan varsayılan branch'e push yapın** (`master`). Pages deploy'u yalnızca
  orada tetiklenir, yan branch deploy'u sessizce atlar.
- **İşi kayda geçirin.** Yeni direktifler [PROPOSALS.TR.md](PROPOSALS.TR.md) içinde
  numaralı öneri olur; tamamlanan iş gerekçesiyle
  [CHANGELOG.TR.md](CHANGELOG.TR.md) içine yazılır.
- **Oyun içi changelog da bu kaydın parçasıdır.** Her
  [CHANGELOG.TR.md](CHANGELOG.TR.md) girdisi, aynı değişiklik içinde repo
  kökündeki `changelog.html` ve `changelog.tr.html` dosyalarının **ikisine** de
  oyuncuya yönelik bir girdi olarak işlenir. Hikâye içeriği ve yeni bölgeler kendi
  minor sürüm başlığını alır. Dosyalardan biri yayımlanan `game_version` için bir
  girdi taşımıyorsa `npm run check` hata verir.

## 12. Hikâye çalışması

Herhangi bir anlatı içeriği yazmadan önce [STORY.TR.md](STORY.TR.md) okuyun.

Kalıcı direktif: **mevcut hikâyeyi devam ettir, asla yeniden yazma.** Mevcut
karakterler, dünya, lore, quest geçmişi, NPC ilişkileri, item açıklamaları,
dialogue hook'ları ve yarım kalmış bölgeler kanondur. Paralel içerik uydurmak
yerine, yazılmış ama erişilemeyen içeriği erişilebilir kılmayı tercih edin. Önce
komşu mevcut içeriği okuyup onun sesine uyun.
