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

const dialogues = {
    /*
        VILLAGE ELDER

        Register: the hero addresses the elder with "siz", the elder answers the
        hero with "sen" - see docs/STORY.md section 6.

        Two polysemy calls worth recording:
        - "with nothing but pants": the robbers took everything else, so this is
          trousers, not underwear. "pantolon".
        - "Are wolf rats a big issue?" / "quite a big one. Not literally" is a joke
          about size. Turkish keeps it as "büyük bir sorun" answered with "boyut
          olarak değil", which lands the same way.
    */
    "elder description": "Beyaz saçlı, yaşını almış bir adam görüyorsun; ama duruşu hâlâ dinç, gerekirse dövüşmeye hazır gibi. Merakla seni süzüyor.",
    "mofu#elder description": "Kıvırcık beyaz saçlı, kalın ve körelmiş boynuzları olan, yaşını almış bir adam görüyorsun. Yıllarına rağmen dimdik duruyor; köye gelecek her tehdide kafa atmaya hazır. Merakla seni süzüyor.",
    "elder hello": "Merhaba?",
    "elder hello answ": "Merhaba. İyileştiğini görmek güzel",
    "elder head hurts": "Başım ağrıyor... Ne oldu?",
    "elder head hurts answ": "Bizimkilerden birkaçı seni ormanda baygın bulmuş; yaralıymışsın, üzerinde pantolondan başka bir şey yokmuş, köye getirdiler. "
            + "Görünüşe göre yakındaki kasabaya gidiyordun ve biri sana saldırıp kafana çok sert vurdu.",
    "elder where": "Neredeyim?",
    "elder where answ": "Bizimkilerden birkaçı seni ormanda baygın bulmuş; yaralıymışsın, üzerinde pantolondan başka bir şey yokmuş, köye getirdiler. "
            + "Görünüşe göre yakındaki kasabaya gidiyordun ve biri sana saldırıp kafana çok sert vurdu.",
    "elder remember": "Buraya nasıl geldiğimi hatırlamıyorum, ne oldu?",
    "elder remember answ": "Bizimkilerden birkaçı seni ormanda baygın bulmuş; yaralıymışsın, üzerinde pantolondan başka bir şey yokmuş, köye getirdiler. "
            + "Görünüşe göre yakındaki kasabaya gidiyordun ve biri sana saldırıp kafana çok sert vurdu.",
    "elder who": "Siz kimsiniz?",
    "elder who answ": "Bu köyün resmî olmayan lideriyim. Aklına bir soru takılırsa bana gel.",
    "elder leave 1": "Harika... Yardımınız için teşekkürler, ama sanırım oraya gitmem gerek. Belki daha fazlasını hatırlamama yardımı olur.",
    "elder leave 1 answ": "Çevredeki topraklar tehlikeli ve sen hâlâ yola çıkacak kadar güçlü değilsin. Yine pusuya düşmeye mi niyetlisin?",
    "elder need to": "Ama gitmek istiyorum",
    "elder need to answ": "Önce toparlanman lazım; biraz dinlenmen, belki biraz da çalışman - epey cılız görünüyorsun... Aslında, bak ne diyeceğim: birkaç kurt sıçanı öldürmek iyi bir alıştırma olur. "
                    +"Tarlalardan birkaçını onlardan temizlemekte bize yardım edebilirsin, ne dersin? Yedek bir silah bulabilirim sanıyorum",
    "elder starting gear": "Şu yedek silah konusunda...",
    "elder starting gear answ": "Evet? Ne tür olsun? Hançer, kılıç, mızrak? Ya da belki balta veya çekiç? Son ikisi savurmak için biraz fazla yavaş olabilir, ama karar senin.",
    "elder dagger": "Hançer istiyorum; hızlı olmak en iyi seçim gibi görünüyor",
    "elder sword": "Kılıç istiyorum; savurma hızı iyi, hasarı da fena değil",
    "elder spear": "Mızrak istiyorum; ikisi arasında tam denge",
    "elder axe": "Balta istiyorum; her vuruşta sağlam hasar",
    "elder hammer": "Çekiç istiyorum; çok yavaş olsa bile yıkıcı saldırılar",
    "elder none": "Bence silahsız dövüşmeyi tercih ederim",
    "elder weapon answ": "Al bakalım, iyi şanslar! Ve unutma, ömrünün sonuna kadar buna bağlı kalmak zorunda değilsin",
    "elder weapon none answ": "Silah yok mu? Kulağa iyi bir fikir gibi gelmiyor, ama dediğim gibi, karar senin...",
    "elder eq": "Daha iyi bir silahla düzgün kıyafetleri edinmemin bir yolu var mı?",
    "elder eq answ": "Verecek fazlamız kalmadı, ama pazarımıza bir göz atabilirsin. Şuradan git *[bir yönü işaret ediyor]*, sonra sağa dön. Bir kasabada bulacağının yanına yaklaşmaz, ama insanların satacak biraz teçhizatı, yiyeceği ve işe yarar başka şeyleri hep olur. "
                    +"Paraya ihtiyacın varsa sıçan artıklarını orada satmayı dene. Diş, kuyruk, post - hepsini alırlar. Bu şeylerle ne yaptıklarına dair hiçbir fikrim yok...",
    "elder leave 2": "Köyden ayrılabilir miyim?",
    "elder leave 2 answ":  "Bunu konuşmuştuk, hâlâ fazla zayıfsın",
    "elder money": "Para kazanmanın başka yolları var mı?",
    "elder money answ": "Tarla işlerinde bize yardım edebilirsin. Korkarım eli pek yüzü pek bir para değil.",
    "elder rats": "Kurt sıçanları büyük bir sorun mu?",
    "elder rats answ": "Ha evet, hayli büyük. Boyut olarak değil - gerçi normal sıçanlardan çok daha irilerdir... "
                    +"Kurtulması gerçekten zor, aksi bir haşere. Ve sayıları sayesinde cidden ölümcül olabilirler. "
                    +"Ama yalnızca sürü hâlinde; tek bir kurt sıçanı pek de tehdit sayılmaz",
    "elder cleared 1":  "Tarlayı temizledim, tam istediğiniz gibi",
    "elder cleared 1 answ": "Öyle mi? Bu iyi. Daha güçlü bir hedefe ne dersin? Yakındaki mağara bu haşereyle dolu. Önce ön odayı kim tutuyorsa onunla, sonra da daha derin kısımlarla boy ölçüş. "
                    +"Ondan önce biraz uyusan iyi olur belki? Bazıları şuradaki kulübeyi senin için hazırladı. Temiz, kuru ve sana biraz mahremiyet sağlar. "
                    +"Ha, unutmadan: yaşlı zanaatkârımız seninle konuşmak istiyordu.",
    "elder cleared 1 alt":  "Tarlayı temizledim, tam istediğiniz gibi",
    "elder cleared 1 alt answ": "Öyle mi? Bu iyi. Daha güçlü bir hedefe ne dersin? Yakındaki mağara bu haşereyle dolu. Önce ön odayı kim tutuyorsa onunla, sonra da daha derin kısımlarla boy ölçüş. "
                    +"Ondan önce biraz uyusan iyi olur belki? Bazıları şuradaki kulübeyi senin için hazırladı. Temiz, kuru ve sana biraz mahremiyet sağlar. ",
    "elder leave 3": "Köyden ayrılabilir miyim?",
    "elder leave 3 answ":  "Hâlâ daha güçlenmen gerek.",
    "elder room clear": "Mağaradaki sıçanların bir kısmını hallettim, yardım edebileceğim başka bir şey var mı?",
    "elder room clear answ": "Ahh, ilerlediğini duymak güzel. Bir düşüneyim... Doğudaki değirmene bir uğrayabilir misin? Orayı çeviren iki çocuk her şeyin altından kalkabiliyor mu diye biraz endişeleniyorum.",
    "elder cave clear":  "Mağarayı temizledim. En azından çoğunu",
    "elder cave clear answ": `O hâlde artık sana "fazla zayıf" diyemem, değil mi? Canın ne zaman isterse gidebilirsin, ama yine de dikkatli ol. Dışarısı hakkında birkaç tavsiye için muhafıza da sorabilirsin. Bir zamanlar maceracıydı.`,
    "elder leave 4": "Köyden ayrılabilir miyim?",
    "elder leave 4 answ": "Yeterince güçlüsün, istediğin zaman gidip istediğin zaman gelebilirsin.",
};

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

const turkish = {...dialogues, ...racial, ...ui, ...stats, ...skills, ...bio};

export default turkish;
