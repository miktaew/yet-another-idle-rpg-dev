<!-- doc-source: docs/DEV_CONSOLE.md  doc-version: 1 -->

# Geliştirici konsolu

Oyunun verebildiği her şey, oyunun kendi kod yollarından geçerek. Buradaki hiçbir şey
ikinci bir uygulama değil: `give`, bir görev ödülünün geçtiği `process_rewards`
fonksiyonunun **ta kendisi**. Yani burada verilen her şey, içerik vermiş olsa nasıl
davranacaktıysa öyle davranır.

İngilizce karşılığı: [DEV_CONSOLE.md](DEV_CONSOLE.md).

## Açmak

Oyun sayfasında tarayıcı konsolunu açıp şunu yazın:

```js
enable_dev_console()
```

Bağladığı fonksiyonların listesini yazdırır. Sonrasında hepsi çıplak birer global olur.

**Varsayılan olarak kapalı ve hiç kaydedilmiyor** — sayfayı yenilemek kapatır.
`is_on_dev()` de bilerek kapı olarak kullanılmadı: geliştirme sürümü de birilerinin
oynadığı bir sürüm, ve bu konsol oyundaki her eşyayı verebiliyor, her odaya
girebiliyor. Faydasını sağlayan da bu, başka bir şeye bakmak için devtools açmış bir
oyuncudan tek yazım hatası uzakta olmaması gerektiğinin nedeni de.

Açmak aynı zamanda alt paneldeki hız düğmelerini de görünür kılar.

## Eşyalar

`give` bir **ödül nesnesi** alır — `src/quests.js` ve `src/data/dialogues.js` içinde
yazılan şeklin aynısı. Bir eşya ya çıplak bir addır ya da bir nesne.

```js
give({items: ["Iron sword"]})                              // bir tane, eşyanın kendi kalitesiyle
give({items: [{item: "Iron ore", count: 50}]})             // elli tane
give({items: [{item: "Iron sword", quality: 120}]})        // ender
give({items: [{item: "Steel chainmail armor", quality: 250}, {item: "Stale bread", count: 100}]})
```

`count` verilmezse 1, `quality` verilmezse şablonun taşıdığı değer (genelde 100).

### Kalite

Kalite bir nadirlik adı değil, bir sayı; nadirlik ondan türetilir:

| kalite | nadirlik |
|------:|----------|
| 50'nin altı | döküntü |
| 50–100 | sıradan |
| 101–129 | ender |
| 130–159 | nadir |
| 160–199 | destansı |
| 200–245 | efsanevi |
| 246 ve üstü | mitik |

Silahları, zırhları, kalkanları ve aletleri etkiler — istatistikleri ölçeklenen her şeyi
— ve envanter anahtarının parçasıdır, yani bir eşyanın iki kalitesi iki ayrı envanter
kaydıdır. `Iron ore` gibi bir hammadde de kalite kabul eder.

Adından emin değil misiniz? `list_items()` hepsini sıralı verir.

## `give`'in kabul ettiği diğer her şey

23 ödül anahtarının tamamı, her birinin istediği şekille. Aşağıdaki iç şekiller gerçek
içerikten alındı, uydurulmadı.

```js
give({money: 50000})
give({xp: 1000})                                           // kahraman tecrübesi
give({skill_xp: {Combat: 100, Farming: 500}})

give({locations: ["Coast road"]})                          // yolculuk etmeden kilidini aç
give({move_to: {location: "Eastern mill"}})
give({quests: ["Village expansion"]})
give({quest_progress: [{quest_id: "Lost memory", task_index: 1}]})

give({skills: ["Meditation"]})
give({stances: ["berserk"]})
give({recipes: [{category: "cooking", subcategory: "items", recipe_id: "Alligator jerky"}]})
give({crafting: ["Lake beach"]})                           // bir konumun tezgâhını aç
give({housing: ["Lake beach"]})

give({actions: [{location: "Village", action: "dig canal"}]})
give({activities: [{location: "Village", activity: "weightlifting"}]})
give({global_activities: ["swimming", "climbing"]})
give({traders: [{trader: "village trader"}]})

give({dialogues: ["old craftsman"]})
give({textlines: [{dialogue: "village elder", lines: ["hello", "about"]}]})
give({flags: ["is_gathering_unlocked"]})
give({reputation: {Village: 50}})
give({messages: ["reward msg go up"]})                     // bir metin kimliği, cümle değil

give({locks: {textlines: {"village elder": ["hello"]}}})   // tersi: geri al
```

`locks` şunları kabul eder: `actions`, `dialogues`, `locations`, `quests`, `textlines`,
`traders`.

Anahtarlar serbestçe birleşir; zaten normal kullanım da bu:

```js
give({
    items: [{item: "Iron sword", quality: 140}, {item: "Iron ore", count: 200}],
    money: 25000,
    skill_xp: {Crafting: 2000, Smelting: 2000},
    locations: ["Coast road"],
})
```

## Diğer fonksiyonlar

```js
add_active_effect("Coffee", 1800)      // süre, içerikte olduğu gibi oyun içi dakika
add_money(50000)                       // yeni toplamı döndürür
add_xp(1000)                           // yeni seviyeyi döndürür
add_skill_xp("Farming", 5000)          // becerinin yeni seviyesini döndürür

goto("The bay")                        // önce kilidini açar, sonra oraya yürür
set_flag("is_gathering_unlocked")      // ikinci argüman verilmezse true
set_speed(100)                         // 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000
```

`set_speed` oyundaki her gerçek zamanlı gecikmeyi böler — ana döngü, düşman ve karakter
sayaçları, aksiyon sayaçları — ve her tick başına hesap terimini de aynı sayıya böler,
yani bir tick hâlâ tam olarak eskiden ne ediyorsa onu eder. Kaydedilmez; yenileme 1x'e
döner.

## Adları bulmak

Sıralı hâlde her registry anahtarı. Yukarıdaki fonksiyonların istediği şeyler bunlar.

```js
list_items()        list_skills()      list_locations()
list_quests()       list_dialogues()   list_effects()      list_flags()
```

Anahtarlar İngilizce ve **kayıt verisidir** — oyuncunun gördüğü şey anahtarın
çevirisidir, o yüzden `list_items()` Türkçede de `"Iron sword"` verir.

## Bilmeye değer şeyler

- **Verilen her şey mesaj günlüğüne düşer**, tıpkı bir görev ödülü gibi ve oyuncunun
  dilinde adlandırılmış olarak.
- **Yanlış ad hata fırlatmaz, bildirilir**: `give({items: ["Iron sord"]})` konsola
  `No such item as "Iron sord" - reward skipped.` yazar ve nesnenin geri kalanını verir.
- **`goto` önce kilidi açar.** Kilitli bir yere yürümek bunu yazmanın zaten en yaygın
  nedeni, o yüzden odayı sessizce açar, sonra yolculuk eder.
- **Buradaki hiçbir şey "dev" olarak kaydedilmez.** Bir şeyler verdikten sonra alınan
  kayıt normal bir kayıttır; onu işaretleyen bir bayrak yok.
