# Yet Another Idle RPG Fork — Story & Gameplay Expansion

Bu repository üzerinde kıdemli bir **game designer + narrative designer + JavaScript engineer** gibi çalış.

Ana hedefin:

**Mevcut hikâyeyi yeniden yazmadan devam ettirmek, mevcut sistemleri birbirine daha güçlü bağlamak ve oyunun RPG/idle gameplay derinliğini artırmak.**

Yeni özellik eklemek uğruna yeni sistem yığma. Öncelikle repository içinde zaten bulunan mekanikleri, bölgeleri, reputation/standing sistemini, crafting'i, combat stance'larını, journal/discoveries sistemini ve açık bırakılmış hikâye kancalarını birbirine bağla.

---

# 1. Çalışmaya başlamadan önce

Önce repository'yi incele.

Şu dosyaları bu sırayla oku:

1. `AGENTS.md`
2. `PROPOSALS.md`
3. `docs/STATUS.md`
4. `docs/I18N.md`
5. `docs/STORY.md`
6. `docs/DEV_CONSOLE.md`
7. `CHANGELOG.md`

Ardından ilgili kaynakları incele:

* `src/data/locations.js`
* `src/data/dialogues.js`
* `src/data/skills.js`
* `src/items.js`
* `src/crafting_recipes.js`
* `src/main.js`
* `src/game_state.js`
* `src/journal_panels.js`
* combat / stance ile ilgili modüller
* reputation / standing kullanan kodlar
* quest tanımları
* Bay / Forest Lake / Town / Slums / Merchant Guild ile ilgili tüm içerikler
* `locales/english.js`
* `locales/turkish.js`

Kod yazmaya başlamadan önce mevcut implementation'ın gerçek davranışını anlamak için mümkün olduğunca çalışan oyunda doğrulama yap.

Kaynak koddan tahmin etmek yerine çalışan oyunu ölç.

---

# 2. Değiştirilemez kurallar

## Hikâye

`STORY.md` kanondur.

**Mevcut hikâyeyi ASLA yeniden yazma. Sadece devam ettir.**

Özellikle aşağıdaki ana gizemleri erken çözme:

* Kahramanı öldürmesi için kimin emir verdiği
* Soygunda neden özellikle kahramanın hedef olduğu
* Kahramandan alınan objenin gerçek kökeni
* Kahramanın objeye neden sahip olduğu
* Köyün altındaki insan-öncesi yapıların gerçek kökeni
* Rat God
* Banished tribe
* Forest Lake ötesindeki four-legged bird

Her yeni hikâye arc'ı ana gizemlerden en fazla **bir katmanı** açmalıdır.

Mystery box'ları tek quest içinde açıklama.

---

# 3. Ton

Oyunun mevcut tonu korunmalı:

**wry-cozy over a grim substrate**

Ön planda:

* hafif absürt mizah
* sıcak karakter etkileşimleri
* kuru anlatıcı mizahı
* karakterlerin gündelik meseleleri

Arka planda:

* karanlık dünya
* kaybolan insanlar
* tehlikeli bölgeler
* eski yapılar
* eldritch / açıklanamayan unsurlar

Horror doğrudan oyuncunun yüzüne bağırmamalı.

Örneğin:

Yanlış:

> An ancient eldritch horror lies beneath the town.

Doğru yaklaşım:

> The stones don't quite line up.
>
> Which would be less worrying if they weren't holding the ceiling.

---

# 4. NPC kuralları

Mevcut naming convention kesinlikle korunmalı.

NPC'lere kişisel isim verme.

NPC adları role-title olmalı:

* `harbour tallyman`
* `guild clerk`
* `square broker`
* `dock worker`

gibi.

Proper noun yalnızca:

* halk
* kabile
* bölge
* materyal
* mitolojik varlık
* gemi

için kullanılabilir.

Species / `mofu#` kurallarına uy.

NPC'nin species'i varsa gerektiğinde hem normal hem `mofu#` localisation varyantını yaz.

---

# 5. Localization

Player-facing text'i `src/` içine yazma.

Dialogue ve content text:

```text
locales/english.js
locales/turkish.js
```

üzerinden ID ile gelmeli.

Türkçeyi İngilizcenin mekanik çevirisi olarak yazma.

Türkçe doğal okunmalı.

Mevcut NPC hitap register'larına uy:

* `siz`
* `sen`
* broken Turkish kullanan swamp karakterleri

konusunda `STORY.md` kurallarını takip et.

---

# 6. Save compatibility

Bu proje için en kritik teknik kurallardan biri:

**Persist edilen hiçbir registry key'i rename etme.**

Özellikle:

* location keys
* item keys
* dialogue keys
* quest keys
* save keys
* skill keys
* recipe keys

mevcut save dosyalarını bozmayacak.

Daha okunabilir isim uğruna eski identifier değiştirme.

Yeni content için yeni key oluştur.

---

# 7. Ana geliştirme yönü

Oyunun bundan sonraki omurgasını şu şekilde tasarla:

```text
The Merchant's Word
        ↓
The Marrowmoth Ledger
        ↓
Beyond the Lake
        ↓
Echoes Beneath
        ↓
River Basin / future arc
```

Ancak tümünü tek commit'te yapmaya çalışma.

Incremental şekilde geliştir.

İlk büyük hedef:

# v0.7 — The Marrowmoth

---

# 8. v0.7 — The Marrowmoth

Bay bölgesindeki mevcut Marrowmoth hook'unu kullan.

Canon:

* Marrowmoth yaklaşık 40 ton
* ebb sırasında açıkta
* kayıtlarında tartılmamış bir sandık bulunuyor
* tallyman kayıt satırını iki kez çizmiş
* gemi yılda iki kez dönüyor
* tallyman oyuncuya haber vermeyecek

Bunu ana continuation arc yap.

Arc yaklaşık **5 quest** içersin.

Önerilen yapı:

---

## Quest 1 — No Word Sent

Tallyman kahramana haber vermez.

Oyuncu geminin döndüğünü doğrudan quest notification ile öğrenmemeli.

Bunun yerine world-state değişikliği kullanılmalı.

Örneğin:

* Bay trader stoğunda white iron / black iron artışı
* harbour ambient dialogue değişikliği
* harbour action değişikliği
* merchant guild söylentisi

Oyuncu:

> Something changed at the bay.

hissini yaşamalı.

Quest discovery üzerinden açılabilir.

---

## Quest 2 — Forty Tons

Oyuncu Marrowmoth yüklerinin boşaltılmasına yardım etsin.

Mevcut action altyapısını mümkün olduğunca kullan.

Basit bir manifest mekanizması oluştur:

```text
Cargo
Weight
Origin
Destination
Seal
Status
```

Normal yüklerin kayıtları tamamdır.

Bir sandık:

```text
Weight: —
Origin: —
Destination: —
Seal: damaged
```

durumunda olsun.

Önemli bilgi:

**Aynı sandık önceki sefer de tartılmamıştır.**

Ancak nedenini açıklama.

---

## Quest 3 — A Stroke Through It

Bu quest investigation ağırlıklı olsun.

Oyuncu bilgi toplamak için mevcut settlement standing değerlerini kullansın.

Örneğin:

```text
Town standing
Slums standing
Merchant/Guild standing
```

çeşitli alternatif yollar açabilir.

Örnek:

```text
Town standing >= X
→ merchant guild records

Slums standing >= Y
→ dock worker testimony

Merchant standing >= Z
→ old cargo manifests
```

Kesin threshold'ları mevcut progression değerlerini analiz ederek balance et.

Hard-code edilmiş anlamsız yüksek rakam koyma.

Ama bütün yollar aynı bilgiye birebir çıkmasın.

Farklı yollar farklı parçalar versin.

---

## Quest 4 — Out on the Ebb

Marrowmoth'u yeni küçük exploration chain olarak aç:

```text
Bay
 ↓
Low-tide flats
 ↓
Marrowmoth anchorage
 ↓
Cargo deck
 ↓
Lower hold
```

Ancak önce mevcut location architecture'ını incele.

Yeni location eklemek gerçekten gerekliyse ekle.

Mevcut location/action sistemi ile çözmek mümkünse paralel sistem yaratma.

Bu bölüm combat ağırlıklı olmamalı.

Skill/action check ağırlıklı tasarla.

Mümkünse mevcut skill'lerden yararlan:

* perception benzeri mevcut skill
* lockpicking benzeri mevcut skill
* athletics
* crafting knowledge
* trading
* navigation

Repository'de gerçekten var olmayan skill isimlerini doğrudan ekleme.

Önce mevcut skill setini incele ve uygun olanları kullan.

---

## Quest 5 — One Unweighed Crate

Oyuncu sandığa ulaşsın.

Ancak mystery çözülmesin.

Sandığın içindeki şey:

kahramandan çalınan objeyle

veya

köy altındaki ancient architecture ile

**bağlantı kurabilecek bir özellik taşısın.**

Örneğin:

* aynı geometrik motif
* aynı metal işçiliği
* aynı bilinmeyen materyal izi
* aynı sembol düzeni

Ancak aşağıdakilerin hiçbirini açıklama:

```text
Who sent it?
Where does it really come from?
Why is it being moved?
Who paid for the robbery?
Why did the hero have the original object?
```

Quest bitiminde oyuncunun cevap sayısından fazla yeni sorusu olabilir.

Bu bilinçli olmalı.

---

# 9. Marrowmoth için yeni devasa sistem yazma

Yeni bir “investigation UI” oluşturma.

Mevcut:

```text
Journal
Discoveries
Bestiary
Books
Lore
```

sistemini kullan.

`Discoveries` bölümüne investigation tarzı kayıtlar ekle.

Örnek:

```text
MARROWMOTH

• Forty tons.
• Arrives twice each year.
• One crate was not weighed.
• The same entry was crossed out twice.
• The tallyman does not want me asking about it.
```

Yeni clue geldikçe discovery entry güncellensin.

---

# 10. Standing sistemini büyüt

Standing yalnızca sayı olmamalı.

Mevcut settlement action kullanımını devam ettir.

Yeni içerikte standing:

* dialogue
* information
* alternative quest paths
* prices
* special actions
* access

açmalı.

Mümkünse bazı kararların farklı settlement standing değerlerine farklı etkileri olsun.

Örneğin:

```text
Town +X
Slums -Y
```

Ancak oyunu aşırı punitive hale getirme.

Oyuncunun kararları world-state hissi versin.

---

# 11. Money sinks

`Nothing but Pants` ilk büyük money sink'i oluşturdu.

Yeni arc'larda paranın daha fazla anlamı olsun.

Mevcut ekonomiyle uyumlu olarak değerlendir:

* expedition supplies
* cargo investment
* guild commissions
* rare maps
* workshop upgrades
* repairs
* surety
* specialised recipes

Özellikle exploration hazırlığı için para harcama mekanizması değerlendir.

Örnek:

```text
Food
Rope
Torches
Medicine
Guide
```

Ancak repository'deki item sistemini incelemeden yeni eşya spam'i yapma.

Var olan eşyaları kullanabiliyorsan onları kullan.

---

# 12. Combat stance geliştirmesi

Mevcut:

```text
berserk
flowing water
```

stance'larının oyuncuya nasıl verildiğini ve combat içinde nasıl çalıştığını incele.

Bunları yalnızca stat bonusu olarak bırakma.

Enemy design ile stance kararını anlamlı hale getir.

Örneğin konsept olarak:

```text
Berserk
→ high offence
→ risky against counterattacking enemies

Flowing Water
→ defensive / reactive
→ strong against slow heavy hitters
```

Ancak mevcut combat formüllerini kırmadan uygula.

Yeni enemy trait gerekiyorsa minimum reusable abstraction oluştur.

Her düşmana özel spaghetti condition yazma.

---

# 13. Skill checks

Yeni questlerde mümkün olduğunca mevcut skill progression'a değer kazandır.

Örneğin:

```javascript
if (relevant_skill.level >= threshold) {
    // alternate solution
}
```

Ancak failure oyuncuya açıklanmalı.

Kötü:

```text
You failed.
```

İyi:

```text
You could probably force this lock.

Probably.

Just not with your current idea of lockpicking.
```

Mevcut tone'a uygun feedback ver.

Skill check başarısızlığı quest'i sonsuza kadar kilitlememeli.

Mümkünse:

* daha pahalı alternatif
* daha uzun alternatif
* standing alternatifi
* başka skill alternatifi

sun.

---

# 14. Quest UX

Aktif quest'lerde oyuncu:

> Şimdi ne yapmam gerekiyor?

diye repository okumak zorunda kalmamalı.

Önce mevcut iki hint göstermeyen quest task'ı çalışan oyunda tespit et ve düzelt.

Yeni questlerde mümkün olduğunca:

```text
Current objective
Hint
Region
```

mantığı sağla.

GPS koordinatı verme.

Hint oyuncuyu yönlendirsin fakat cevabı söylemesin.

Örnek:

```text
A Stroke Through It

Someone altered the Marrowmoth's manifest.

Hint:
People who trade for a living tend to keep better records than people who unload ships.
```

---

# 15. Bölge tasarım kuralı

Her bölgenin bir gameplay kimliği var:

```text
Wet woods → gathering / quiet
Plains    → people
Bay       → trade / access
Mountain  → making
```

Bunu devam ettir.

Yeni bölge eklemeden önce:

```text
What is the gameplay verb of this region?
```

sorusunu cevapla.

Önerilen gelecek bölgeler:

```text
Ancient Forest
→ navigation / discovery

River Basin
→ logistics / travel
```

Ama henüz lore uydurma.

Önce mevcut canon hook'larından türet.

---

# 16. v0.8 için hazırlık — Beyond the Lake

v0.7 tamamlandıktan sonra ikinci ana arc olarak Forest Lake sonrası bölgeyi ele al.

Hook:

```text
four-legged bird past the Forest lake
```

Burada:

* Ancient Forest
* navigation
* rare encounters
* tier 5 gathering
* stance-focused combat
* environmental discoveries

odakları değerlendir.

Dört ayaklı kuşu doğrudan boss marker yapma.

Önce izler:

```text
strange tracks
feathers
distant noises
damaged vegetation
```

gibi clue'lar görülsün.

Oyuncu yaratığı görmeden önce onun gerçekten var olup olmadığından emin olmamalı.

---

# 17. Tier 4 / Tier 5 progression

Mevcut white iron ve black iron progression'ını analiz et.

Tier 4 ve Tier 5 material/component zincirlerini tamamen gameplay progression'a bağla.

Ideal loop:

```text
Explore
 ↓
Find material
 ↓
Unlock recipe
 ↓
Craft better gear
 ↓
Reach harder content
 ↓
Discover story
```

Material progression ile story progression birbirinden bağımsız iki spreadsheet gibi durmamalı.

Birbirini açmalı.

Ancak yeni recipe eklemeden önce repository'de bulunan mevcut unused / underused content'i kontrol et.

**Reclamation over invention.**

---

# 18. Dynamic world events

v0.7'nin core scope'unu riske atmıyorsa reusable küçük bir world-event altyapısının mevcut sistemlerle mümkün olup olmadığını incele.

Örnek eventler:

```text
Marrowmoth in port
Heavy rain
Trader caravan
Town festival
Rat migration
Flooded road
Forest bloom
```

Bunlar:

* trader stock
* gathering
* travel time
* enemy pool
* dialogue
* actions

etkileyebilir.

Ancak sıfırdan büyük scheduler framework yazma.

Mevcut game-time sistemi buna uygunsa kullan.

İlk gerçek kullanım:

```text
Marrowmoth in port
```

olabilir.

---

# 19. Teknik refactor yaklaşımı

Refactor yapabilirsin fakat refactor ana hedef olmasın.

Yaklaşık geliştirme önceliği:

```text
60% story / gameplay
20% balancing / existing content integration
10% UX
10% refactor
```

`main.js` veya `display.js` büyük diye sırf küçültmek için özellik geliştirmeyi durdurma.

Refactor yalnızca:

* yeni feature'ı güvenli kılıyorsa
* coupling ciddi problem yaratıyorsa
* test edilebilirliği artırıyorsa
* mevcut PROPOSALS planına uyuyorsa

yapılmalı.

---

# 20. Import / module güvenliği

Bu repository'de import order önemlidir.

Özellikle `main.js` import sırasını sıradan bir style tercihi gibi görme.

Yeni import gerekiyorsa mevcut repository talimatlarına uy.

Circular dependency oluştururken veya mevcut cycle'ı değiştirirken dikkatli ol.

Unresolved identifier'ın esbuild tarafından build sırasında yakalanmayabileceğini unutma.

---

# 21. Feature geliştirme yöntemi

Her feature için şu yöntemi kullan:

```text
1. Existing implementation'ı bul
2. Existing content'i kontrol et
3. Canon ile uyumluluğunu kontrol et
4. Minimum değişiklik tasarla
5. Tests/checks ekle
6. Implementation
7. Localization
8. Runtime verification
9. Save compatibility verification
10. Documentation / changelog
```

---

# 22. Test zorunluluğu

Her anlamlı değişiklikten sonra:

```bash
npm run build
LOCALE_STRICT=1 npm run check
npm test
npm run check:bundle
```

çalıştır.

Ayrıca oyunu boot et ve:

```javascript
Verify_Game_Objects()
```

çalıştır.

Save-related identifier değiştiyse gerçek export save ile:

```bash
npm run check:save "<exported-save>.txt"
```

çalıştır.

Bir bug fix yaptıysan mümkünse bug geri getirildiğinde fail eden regression test ekle.

---

# 23. Definition of Done

Bir feature ancak aşağıdakilerin tamamı doğruysa tamamlanmış kabul edilir:

```text
[ ] Canon ile çelişmiyor
[ ] Existing story rewrite edilmedi
[ ] Save compatibility korunuyor
[ ] Player-facing raw text src içine yazılmadı
[ ] English localization tamam
[ ] Turkish localization tamam
[ ] mofu variant gerekiyorsa tamam
[ ] Quest progression reachable
[ ] Quest dead-end oluşturmuyor
[ ] Failure reason açıklanıyor
[ ] Journal/discovery integration var
[ ] Economy/progression balance kontrol edildi
[ ] npm run build geçiyor
[ ] LOCALE_STRICT=1 npm run check geçiyor
[ ] npm test geçiyor
[ ] npm run check:bundle geçiyor
[ ] Verify_Game_Objects() geçiyor
[ ] CHANGELOG güncel
[ ] PROPOSALS/STATUS/STORY güncellenmesi gerekiyorsa güncellendi
```

---

# 24. Çalışma şeklin

Benden implementation sırasında sürekli onay isteme.

Repository'deki mevcut kurallar yeterliyse kararını ver ve ilerle.

Ancak önce bütün roadmap'i tek seferde kodlamaya çalışma.

İlk hedef:

```text
v0.7 — The Marrowmoth
```

olsun.

Önce mevcut sistemi analiz et.

Sonra implementation planını repository içinde uygun şekilde kaydet.

Ardından küçük, test edilebilir adımlarla uygula.

v0.7 bittikten ve bütün quality gate'ler geçtikten sonra v0.8'e geç.

---

# 25. Tasarım ilkesi

Bu projede hedef:

```text
more content
```

değil.

Hedef:

```text
existing systems
      +
existing mysteries
      +
existing regions
      +
player decisions
      ↓
a more connected RPG
```

olmalı.

Yeni 50 location, 50 skill veya 50 recipe eklemek yerine mevcut sistemlerin birbirini etkilemesini sağla.

Oyuncu yaptığı şeylerin:

* dünyayı
* ekonomiyi
* insanların ona yaklaşımını
* erişebildiği bilgiyi
* kullanabildiği ekipmanı
* takip edebildiği hikâye yollarını

değiştirdiğini hissetsin.

**Öncelik: The Marrowmoth arc'ını oyunun mevcut sistemlerini birbirine bağlayan ilk gerçek continuation arc olarak kaliteli şekilde tamamlamak.**
