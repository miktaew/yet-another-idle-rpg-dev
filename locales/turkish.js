/*
    Turkish locale.

    Translation rules for this file - see docs/I18N.md for the full handbook:

    - Translate meaning and tone, not words. Rewrite the sentence for Turkish
      freely; English word order and punctuation habits are not binding.
    - Translate in context units. A string is read underneath whatever is above it
      on screen, so a player question and the reply that answers it, and a stat's
      short and long form, are translated together and must agree.
    - Resolve every polysemous word against its in-game context. "Spider web" is
      "orumcek agi", never "orumcek interneti".
    - Keys are NEVER translated. They are save data and a lookup id at the same
      time. Only values are translated.
    - A key that is missing here falls back to the English text, so a partial
      locale is safe. Run "npm run check" to see the coverage.
*/

const ui = {
    "ui create": "Kahramanını oluştur",
    "ui cosmetic": "Buradaki her şey yalnızca görünümle ilgili",
    "ui name selection": "İsim (sonradan değiştirilebilir):",
    "ui age selection": "Yaş (ırkın yaşlanma hızına göre):",
    "ui height selection": "Boy (ırkın ortalamasına göre):",
    "ui young": "Genç yetişkin",
    "ui adult": "Yetişkin",
    "ui middle aged": "Orta yaşlı",
    "ui short": "Kısa",
    "ui average height": "Ortalama",
    "ui tall": "Uzun",
    "ui confirm": "Onayla",
    "ui race_default_label": "Varsayılan ırk",
    "ui race_furless_label": "İnsansı ırklar",
    "ui race_kemonomimi_label": "Hayvan kulaklı ırklar",
    "ui sort name": "İsme göre sırala",
    "ui sort value": "Değere göre sırala",
    "ui sort type": "Türe göre sırala",
    "ui show all": "Tümü",
    "ui show equipment": "Ekipman",
    "ui show usable": "Kullanılabilir",
    "ui show other": "Diğer",
    "ui show favs": "Favoriler",
    "ui show stats": "Özellikler",
    "ui show bio": "Künye",
    "ui show tools": "Aletler",
    "ui language": "Dil:",
};

const bio = {
    //Shown as "Boy: Kısa", "Yaş: Yetişkin", "Irk: Nekomimi" - the label and the
    //value are separate ids, so they have to read as one line together.
    "height": "Boy",
    "age": "Yaş",
    "young": "Genç yetişkin",
    "adult": "Yetişkin",
    "middle-aged": "Orta yaşlı",
    "short": "Kısa",
    "average": "Ortalama",
    "tall": "Uzun",
    //Dotless i: the capital of "ırk" is "Irk", not "İrk".
    "race": "Irk",
};

const stats = {
    /*
        Each stat has a short form for the stat rows and a long form for the
        tooltips. They are one context unit: the tooltip has to name the same
        thing the row abbreviates, or the screen contradicts itself.

        Where English left an abbreviation unexpanded ("EP" for both forms), the
        Turkish long form spells it out - that is clearer and still faithful.
    */
    "strength": "güç",
    "strength long": "güç",
    "health": "can",
    "health long": "can",
    "max_health": "can",
    "max_health long": "can",
    "health_regeneration_flat": "can yenileme",
    "health_regeneration_flat long": "can yenilenmesi",
    "health_regeneration_percent": "% can yenileme",
    "health_regeneration_percent long": "yüzdesel can yenilenmesi",
    "health_loss_flat": "can kaybı",
    "health_loss_flat long": "can kaybı",
    "health_loss_percent": "% can kaybı",
    "health_loss_percent long": "yüzdesel can kaybı",
    "stamina_regeneration_flat": "dayanıklılık yenileme",
    "stamina_regeneration_flat long": "dayanıklılık yenilenmesi",
    "stamina_regeneration_percent": "% dayanıklılık yenileme",
    "stamina_regeneration_percent long": "yüzdesel dayanıklılık yenilenmesi",
    "max_stamina": "dayanıklılık",
    "max_stamina long": "dayanıklılık",
    "max_mana": "mana",
    "max_mana long": "mana",
    "agility": "çeviklik",
    "agility long": "çeviklik",
    "dexterity": "el becerisi",
    "dexterity long": "el becerisi",
    "magic": "büyü",
    "magic long": "büyü",
    "attack_speed": "saldırı hızı",
    "attack_speed long": "saldırı hızı",
    "attack_power": "saldırı gücü",
    "attack_power long": "saldırı gücü",
    "crit_rate": "kritik şansı",
    "crit_rate long": "kritik vuruş şansı",
    "crit_multiplier": "kritik hasar",
    "crit_multiplier long": "kritik vuruş hasarı",
    "stamina_efficiency": "dayanıklılık verimi",
    "stamina_efficiency long": "dayanıklılık verimliliği",
    "intuition": "sezgi",
    "intuition long": "sezgi",
    "block_strength": "kalkan gücü",
    "block_strength long": "kalkan gücü",
    "hit_chance": "isabet şansı",
    "hit_chance long": "isabet şansı",
    "evasion": "KP",
    "evasion long": "kaçınma puanı",
    "evasion_points": "KP",
    "evasion_points long": "kaçınma puanı",
    "attack_points": "SP",
    "attack_points long": "saldırı puanı",
    "heat_tolerance": "sıcak direnci",
    "heat_tolerance long": "sıcağa direnç",
    "cold_tolerance": "soğuk direnci",
    "cold_tolerance long": "soğuğa direnç",
    "unarmed_power": "silahsız hasar",
    "unarmed_power long": "silahsız temel hasar",
    "armor_penetration": "zırh delme",
    "armor_penetration long": "zırh delme",
    "defense": "savunma",
    "defense long": "savunma",
};

const skills = {
    //Keys are skill ids and must stay as they are; only the shown name changes.
    "Combat": "Dövüş",
    "Evasion": "Kaçınma",
    "Equilibrium": "Denge",
    "Swimming": "Yüzme",
    "Climbing": "Tırmanma",
    "Shield blocking": "Kalkan savunması",
    "Meditation": "Meditasyon",
    "Running": "Koşu",
    "Haggling": "Pazarlık",
};

const racial = {
    "human name": "İnsan",
    "human desc": "En sıradan ve en yaygın ırk; benzersiz bir özelliği olmamasıyla benzersiz. Neredeyse her alanda ortalama, ama bir bütün olarak güçlü.",

    "cat name": "Nekomimi",
    "cat alt name": "Kedi insan",
    "cat desc": "Nekomimi, insan ile kedinin kusursuz bir karışımıdır ve ikisinin de bazı güçlü yanlarını taşır. Olağanüstü bir zarafete ve isabete sahiptirler; "
                +"dengelerini her koşulda korurlar ve kuyrukları bunu daha da pekiştirir, kulakları ise onlara çok keskin bir işitme kazandırır. Ayrıca tırmanmakta "
                +"inanılmaz iyidirler. Öte yandan fiziksel saldırılara karşı pek dayanıklı değillerdir. Nekomimi ayrıca insanlardan biraz daha kısa ve daha incedir. "
                +"Et ve balığa insanlardan daha düşkündürler, ama sebze ve meyveden de keyif alabilirler. "
                +"Bireysel ve keyfine düşkündürler, yine de gerektiğinde bir grup içinde iş görebilirler. "
                +"Genellikle çok gururludurlar; güzelliklerinin ve zarafetlerinin diğer ırkları büyülediğinin gayet farkındadırlar, elfler gibi, ama onların aksine "
                +"gönüllerini almak çok daha kolaydır. En iyi dansçılar, casuslar ve suikastçılar aralarından çıkar.",

    "dog name": "Inumimi",
    "dog alt name": "Köpek insan",
    "dog desc": "Inumimi, insan ile köpeğin kusursuz bir karışımıdır ve ikisinin de bazı güçlü yanlarını taşır. Çeviktirler ve kolay yorulmazlar, "
                +"ama büyü yetenekleri ortalamada oldukça düşüktür. İyi dövüşçü ve harika yüzücüdürler. "
                +"Boy bakımından insanlara benzerler, beslenme alışkanlıkları da öyledir. "
                +"Son derece sosyaldirler, başkalarıyla iş birliği kurmak onlar için hep kolaydır "
                +"ve çabuk bağ kurarlar.",

    "mouse name": "Nezumimi",
    "mouse alt name": "Fare insan",
    "mouse desc": "Nezumimi, insan ile farenin kusursuz bir karışımıdır ve ikisinin de bazı güçlü yanlarını taşır. Ufak tefektirler ve fiziksel olarak çok kırılgandırlar, "
                +"ama bunu zekâ ile ihtiyatı harmanlayarak fazlasıyla telafi ederler; muhteşem koku alma duyuları da ilginç şeyler bulmalarına yardım eder (peynir dahil). "
                +"Yeme alışkanlıkları neredeyse insanlarla aynıdır, peynire duydukları komik denecek sevgi dışında. "
                +"Yaramaz olmakla ünlüdürler. Nezumimi'nin büyü yetenekleri de fena değildir. Sosyal varlıklardır, grup hâlinde iyi çalışırlar.",

    "fox name": "Kitsunemimi",
    "fox alt name": "Tilki insan",
    "fox desc": "Kitsunemimi, insan ile tilkinin kusursuz bir karışımıdır ve ikisinin de bazı güçlü yanlarını taşır. Zeki, kurnaz ve çeviktirler; büyü yetenekleri "
                +"göze çarpacak kadar iyidir, ama fiziksel olarak pek güçlü değillerdir. Boyları insanlara benzer, ancak daha incedirler. Beslenme tercihleri son derece "
                +"sıradandır; kızarmış tofuya duydukları tuhaf hayranlık bir yana. Nekomimi ve elfler gibi çok gururlu olmaya meyillidirler ve güzelliklerini, "
                +"zarafetlerini kullanmayı bilirler.",

    "lizard name": "Kertenkele soylu",
    "lizard desc": "Kertenkele soylular, insan ile kertenkelenin bir karışımıdır. Kocaman kertenkele kuyrukları vardır ve vücutlarında, genellikle yüzlerinde ve/veya "
                + "ellerinin yakınında pul pul bölgeler bulunur (kulak ve kuyrukla sınırlı kalan kemonomimilerin aksine). Ağır kuyrukları duruşlarını çoğu zaman etkiler; "
                + "bu yüzden bacaklarını hafifçe bükerek dururlar. Ana karada ve şehirlerde nadir görülürler; genellikle havanın sıcak, suyun bol olduğu uzak bataklıklarda "
                + "ve kıyılarda, sıkı sıkıya bağlı topluluklar hâlinde yaşarlar. "
                +"İyi yüzücü ve iyi avcıdırlar; yakalayabildikleri ya da bulabildikleri her şeyi yerler.",

    "elf name": "Elf",
    "elf desc": "Uzun ömürlü, ince yapılı ve doğaya düşkün, eski ve gururlu bir ırk. Kendilerini diğer ırklardan üstün görmeye güçlü bir eğilimleri vardır "
                +"ve birçok bakımdan haksız da sayılmazlar. Fiziksel güçleri kayda değer değildir, ama bunu iyi bir çeviklik, hızlı tepki süreleri ve "
                +"kıvrak hareket kabiliyetiyle dengelerler. İnsanlardan uzundurlar, kalabalıkta uzaktan bile kolayca fark edilirler. Elf mutfağı meyve ve sebze "
                +"ağırlıklıdır, arada balıkla; hayatta kalmak için gerekiyorsa sıradan et de yerler, ama tadından pek keyif almazlar.",

    "half-elf name": "Yarı elf",
    "half-elf desc": "İnsan ile elf birleşmelerinden doğan varlıklar; iki ebeveynlerinin güçlü yanlarını taşırlar, ama o kadar belirgin olmadan. Gururlu olmaya meyillidirler, "
                    +"uzun yaşarlar, elflerden güçlü ve insanlardan çeviktirler. Elfler kadar uzun değillerdir ve kulakları da onlar kadar keskin değildir; bu yüzden "
                    +"ilk bakışta tanınmaları zordur. Elflerin aksine ete çok daha sıcak bakarlar, bu da uzun ömürlü atalarının kimi zaman hayal kırıklığına uğramasına yol açar.",

    "dwarf name": "Cüce",
    "dwarf desc": "Bir hayli uzun ömürlü, kısa boylu ve yerin altına büyük bir tutkuyla bağlı; eski, gururlu ve şen bir ırk. Çok kısa, çok güçlü ve çok dayanıklıdırlar. "
                + "Pek çevik olmadıkları için dövüşte ağırlıklı olarak kalkan ve zırha güvenirler; çekiçleri ve baltaları ise ustalıkla dövülmüş olmalarıyla ünlüdür. "
                + "Cüceler her şeyi yer; mağaralarında sağlanabilen o az ışıkla avlayabildikleri ya da yetiştirebildikleri ne varsa - yer altı yaratıkları, kökler, mantarlar. "
                + "Mideleri de bedenleri kadar sağlam olduğu için bu iş onlara kolay gelir; bir insanı hasta edecek şeyleri yiyebilir, şüphe götürecek miktarda "
                + "alkol içebilirler.",

    "half-dwarf name": "Yarı cüce",
    "half-dwarf desc": "İnsan ile cüce birleşmelerinden doğan varlıklar; iki ebeveynlerinin güçlü yanlarını taşırlar, ama o kadar belirgin olmadan. Güçlü ve dayanıklıdırlar, "
                    + "bu da onları harika dövüşçü ve harika işçi yapar. "
                    + "İki ebeveyn ırkı da diğerini çekici bulmadığı için sık sık alay konusu olurlar; bu yüzden çoğunlukla kökenlerini saklarlar, "
                    + "ki bu pek de zor değildir - biraz daha kısa ve biraz daha kıllı, saf kan insanlar olarak rahatça geçinip giderler. "
                    + "Cüceler gibi her şeyi yerler, ama hangi yemeğin iğrenç sayılacağı konusunda insanlara daha yakın bir bakışa sahiptirler.",
};

const turkish = {...racial, ...ui, ...stats, ...skills, ...bio};

export default turkish;
