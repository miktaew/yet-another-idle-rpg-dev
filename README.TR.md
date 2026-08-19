# Yet Another Idle RPG

Skill seviyelendirme üzerinden ilerlemeye ağırlık veren, metin tabanlı bir idle
RPG. Yalnızca tarayıcıda çalışır, framework kullanmaz: esbuild ile paketlenen saf
ES modülleri.

**Oyna:** <https://kuroiteiken.github.io/yairp/>

English: [README.md](README.md) — çelişki hâlinde İngilizce dosya geçerlidir.

---

## Bu repo hakkında

Bu bir **devam fork'udur**. Oyunun özgün hâli
[Miktaew](https://github.com/miktaew/yet-another-idle-rpg) tarafından yapıldı;
upstream geliştirme durdu ve bu repo işi oradan devralıyor.

Amaç mevcut hikâyeyi değiştirmek değil devam ettirmek — özgün yazarın açık
bıraktığı bağları karşılığa bağlamak, repoda var olup oyun içinde erişilemeyen
içerikleri erişilebilir kılmak ve bir Türkçe dil seçeneği eklemek. Mevcut
karakterler, lore, quest'ler ve item açıklamaları kanon kabul edilir.

Upstream'de kalan işlerin aktarılıp aktarılmayacağı henüz belirsiz; bkz.
[docs/PROPOSALS.TR.md](docs/PROPOSALS.TR.md).

> **Hâlâ geliştirme aşamasında ve denge ayarları devam ediyor.** Oyun içindeki
> **export** özelliğini düzenli olarak kullanın. Kayıt bozan bir hatanın gözden
> kaçma riski her zaman vardır.

---

## Yerelde çalıştırma

Oyun **derleme adımı olmadan** çalışır. `index.html` doğrudan `src/main.js`'i
yükler, dolayısıyla herhangi bir statik dosya sunucusu yeterlidir — tek koşul
dosyayı doğrudan açmak yerine bir sunucu kullanmaktır, çünkü ES modülleri CORS
politikasına tabidir.

```sh
npm install
npm run serve        # http://127.0.0.1:8080
```

`src/` veya `locales/` altında herhangi bir şeyi düzenleyip sayfayı yenileyin.
Yeniden derleme gerekmez.

`npm run serve`, esbuild'in yerleşik statik sunucusunu kullanır; bu projedeki tek
bağımlılık esbuild'in kendisidir.

## Derleme

```sh
npm run build        # bundle -> dist/, deploy edilebilir site -> _site/
npm run check        # derlenen siteyi ve locale anahtar eşliğini doğrula
npm run serve:site   # http://127.0.0.1:8081 - derlenen siteyi önizle
```

`npm run build` iki iş yapar: `src/main.js`'i `dist/bundle.js` içine paketler ve
deploy edilebilir siteyi `_site/` içinde toplar. `_site/` içindeki `index.html`
kopyası, `src/main.js` yerine bundle'ı yükleyecek şekilde yeniden yazılır ve önbellek
kırma için güncel sürümle damgalanır.

Bilinmesi gereken iki sonuç:

- **Kökteki `index.html` geliştirme giriş noktasıdır ve asla yerinde yeniden
  yazılmaz.** İçindeki `style.css?version=…` değeri bilinçli olarak güncel değildir;
  yalnızca `_site/` kopyası damgalanır. Elle "düzeltmeyin".
- **Yeni bir dil dosyasının bundle modunda çalışması için yeniden derleme
  gerekir.** esbuild, `src/translation.js` içindeki dinamik `import()` ifadesini
  derleme anında `locales/` dizinini glob'layarak çözer ve eşleşen her dosyayı
  gömer. Dev modu dil dosyalarını çalışma zamanında getirir ve yeniden derleme
  gerektirmez. CI her push'ta yeniden derlediği için bu yalnızca yerel bundle
  modu testlerini etkiler.

`npm run check` aynı zamanda çevirilerin bekçisidir: varsayılan dilde bulunmayan
anahtarlar derlemeyi başarısız kılar, eksik çeviriler ise kapsam yüzdesi olarak
raporlanır. Eksik çevirileri ölümcül hâle getirmek için `LOCALE_STRICT=1` ile
çalıştırın.

Node **22 veya üzeri** gerektirir.

## Deploy

Varsayılan branch'e push yapmak
[`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
workflow'unu tetikler; bu workflow derler, doğrular ve `_site/` içeriğini GitHub
Pages'e yayınlar. Yalnızca doküman değişen push'lar atlanır. Elle yapılacak bir
şey yoktur.

---

## Repo düzeni

| Yol | Nedir |
| --- | --- |
| `index.html` | Oyun sayfası ve geliştirme giriş noktası. |
| `src/` | Tüm oyun kodu. Sistemler ve içerik registry'leri. |
| `locales/` | Oyuncuya görünen metinler, string id ile anahtarlanmış. |
| `dist/bundle.js` | Commit'lenmiş derleme çıktısı. `npm run build` ile yenilenir. |
| `resources/` | Fontlar, görseller ve devralınan HackTimer. |
| `help.html` | Oyun içi yardım. |
| `changelog.html` | Oyun içi, oyuncuya yönelik sürüm geçmişi. |
| `scripts/` | Derleme ve doğrulama script'leri. |
| `docs/` | Geliştirici ve agent dokümantasyonu. |

## Mod yapımı ve bunu motor olarak kullanma

İçerik `src/` altındaki registry'lerde yaşar — item'lar, lokasyonlar, düşmanlar,
skill'ler, dialogue'lar, quest'ler, tarifler vb. — ve oyuncuya görünen tüm metin
`locales/` içinde durur. İçerik eklemek, registry girdileri artı onların metin
id'lerini eklemek anlamına gelir.

Başlamadan önce bilinmesi gereken iki şey:

- **Registry anahtarları save dosyalarında birebir saklanır.** Bir item id'sini,
  lokasyon anahtarını, skill id'sini veya flag adını yeniden adlandırmak mevcut
  kayıtları sessizce bozar.
- **`Verify_Game_Objects()`** tarayıcı konsolunda kullanılabilir. İçeriğin büyük
  kısmını gezerek özelliklerin kabul edilebilir değerlerde olup olmadığını ve
  nesneler arası referansların çözülüp çözülmediğini denetler. Ne kusursuzdur ne de
  her şeyi kapsar, ama size zaman kazandırır.

Bir mod yayınlarsanız, lütfen bunun özgün bir eser değil bir mod olduğunu belirtin
ve geri bağlantı verin — hem bu repoya hem de
[özgün projeye](https://github.com/miktaew/yet-another-idle-rpg).

## Dokümantasyon

Her doküman bir çifttir: İngilizce dosya kanoniktir, `.TR.md` dosyası onun Türkçe
çevirisidir.

| Doküman | Amaç |
| --- | --- |
| [docs/AGENTS.TR.md](docs/AGENTS.TR.md) · [EN](docs/AGENTS.md) | Geliştiriciler ve yapay zekâ agent'ları için **kanonik** kurallar ve talimatlar. |
| [docs/STORY.TR.md](docs/STORY.TR.md) · [EN](docs/STORY.md) | Anlatı kanonu: dünya, protagonist, ton ve hikâyenin şu an nerede durduğu. |
| [docs/PROPOSALS.TR.md](docs/PROPOSALS.TR.md) · [EN](docs/PROPOSALS.md) | Çalışma listesi, kalıcı direktifler ve bekleyen kararlar. |
| [docs/I18N.TR.md](docs/I18N.TR.md) · [EN](docs/I18N.md) | Çeviri el kitabı: yerelleştirme nasıl çalışıyor, kurallar ve sözlük. |
| [docs/CHANGELOG.TR.md](docs/CHANGELOG.TR.md) · [EN](docs/CHANGELOG.md) | Gerekçeleriyle geliştirme geçmişi. |

## Katkı

Katkılar memnuniyetle karşılanır — iyileştirmeler, daha iyi dialogue'lar, yeni
lokasyonlar, item'lar, düşmanlar veya skill'ler.

Lütfen bir issue veya pull request açın ve ilerlemeye (progression) dokunan her
şey için önce iletişime geçin. Düz metin düzeltmeleri ve benzeri kendinden
açıklamalı değişiklikler doğrudan girebilir. Önce
[docs/AGENTS.TR.md](docs/AGENTS.TR.md) dosyasını okuyun: kurallar için tek doğru
kaynaktır ve kazara bozulması kolay olan save uyumluluğu kurallarını belgeler.

## Krediler ve lisans

**Miktaew** tarafından, Proto23'ten esinlenerek yaratıldı. Bu fork'ta devam
ettiriliyor.

MIT lisansı altında yayınlanmıştır — bkz. [LICENSE](LICENSE). Lisansın gerektirdiği
gibi özgün telif bildirimi korunmuştur.

Devralınan [HackTimer](resources/js/HackTimer/) üçüncü taraf MIT lisanslı koddur ve
kendi lisans dosyasını taşır.

Oyunu yaratan kişiyi desteklemek isterseniz Ko-fi adresi:
<https://ko-fi.com/miktaew>.
