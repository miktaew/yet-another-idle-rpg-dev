<!-- doc-source: AGENTS.md  doc-version: 1 -->

# AGENTS

**Kanonik talimatlar: [docs/AGENTS.md](docs/AGENTS.md)** (Türkçesi:
[docs/AGENTS.TR.md](docs/AGENTS.TR.md)). O dosyayı okuyun. Tek doğru kaynak odur;
bu stub ile o dosya çelişirse o dosya geçerlidir. Bu dosya yalnızca araçların
kökteki `AGENTS.md`'yi otomatik keşfetmesi nedeniyle var.

English: [AGENTS.md](AGENTS.md)

---

Bu repo, `miktaew/yet-another-idle-rpg` projesinin bir **devam fork'udur** — saf ES
modülleriyle yazılmış, esbuild ile paketlenen, tarayıcı tabanlı bir metin idle RPG.
Upstream geliştirme durdu; bu fork onu devam ettiriyor.

## Komutlar

```sh
npm install
npm run serve   # :8080 uzerinde dev modu, derleme adimi yok, duzenlemeler canli
npm run build   # bundle -> dist/, deploy edilebilir site -> _site/ (ikisi de takipsiz)
npm run check   # derlenen siteyi ve locale anahtar esligini dogrula
```

Node 22+ gerekir.

## Asla yapılmayacaklar

1. **Bir registry anahtarını asla yeniden adlandırmayın** — item id'leri, lokasyon
   anahtarları, dialogue ve textline anahtarları, skill id'leri, tarif id'leri,
   flag adları, activity adları. Bunlar oyuncu save dosyalarında birebir saklanır;
   birini yeniden adlandırmak kayıtları sessizce bozar. Bu, onları çevirmeyi de
   kapsar.
2. **Oyuncuya görünen metni asla `src/` içine gömmeyin.** Yeri, bir string id
   arkasında `locales/<dil>.js` dosyasıdır. Kod yorumları İngilizcedir.
3. **`npm run build` kullanın, `node build.js` değil.** İkincisi fork öncesi
   geçersiz derleyici; artık takip edilen kök `index.html`'i eskiden yaptığı gibi
   yeniden yazmak yerine reddediyor ve gerekçesini açıklıyor.

## Ayrıca

- Dokümantasyon iki dillidir: her `.md` bir `NAME.md` + `NAME.TR.md` çifti olarak
  yayınlanır, İngilizce kanoniktir, ikisi aynı değişiklikte güncellenir.
- Doğrudan varsayılan branch'e (`master`) push yapın — Pages deploy'u yalnızca
  orada tetiklenir.
- Anlatı içeriği yazmadan önce [docs/STORY.TR.md](docs/STORY.TR.md) okuyun. Kalıcı
  kural: mevcut hikâyeyi devam ettir, asla yeniden yazma.
- Yeni direktifleri [docs/PROPOSALS.TR.md](docs/PROPOSALS.TR.md) içine kaydedin;
  tamamlanan işi [docs/CHANGELOG.TR.md](docs/CHANGELOG.TR.md) içinde yazıya
  geçirin.

Geri kalan her şey — repo yapısı, save migration desenleri, kod stili, dairesel
import ve satır içi handler tuzakları — [docs/AGENTS.TR.md](docs/AGENTS.TR.md)
içinde.
