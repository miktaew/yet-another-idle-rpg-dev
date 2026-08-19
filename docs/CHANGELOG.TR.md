<!-- doc-source: docs/CHANGELOG.md  doc-version: 1 -->

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
