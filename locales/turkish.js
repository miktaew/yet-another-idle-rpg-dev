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

//===== village guard =====
    "guard description": "Hafif zırh kuşanmış bir kadın görüyorsun; elinde bir mızrak, kemerinde iki hançer. Yüzünü boydan boya bir yara izi kesiyor.",
    "mofu#guard description": "Hafif zırh kuşanmış, uzun boylu bir kadın görüyorsun; elinde bir mızrak, kemerinde iki hançer. Sivri, tüylü kulakları arada bir duyduğu her yeni sese doğru dönüyor, kabarık kuyruğu ise hiç kıpırdamıyor. Yüzünü boydan boya bir yara izi kesiyor. Seni fark ettiğinde bir an avıymışsın gibi süzüyor, ama sonra ifadesi epeyce yumuşuyor.",
    "guard hello": "Merhaba?",
    "guard hello answ": "Merhaba. Demek sonunda yola koyuluyorsun ha?",
    "guard job": "Bana verebileceğin bir iş var mı acaba?",
    "guard job answ": "Artık dövüşten biraz anlıyorsun; ne dersin, devriyede bana ve çocuklara yardım eder misin? Pek bir şey olmaz, ama tarlada çalışmaktan daha iyi para getirir",
    "guard tips": "Yol için bana birkaç tavsiye verebilir misin?",
    "guard tips answ": "Her şeyden önce: acele etme. Kendini daha iyi hazırlamak için burada biraz daha oyalanmanda hiçbir sakınca yok. Dışarıda şu can sıkıcı sıçanlardan kat kat güçlü bir sürü tehlikeli hayvan var; işin kötüsü, haydutlara bile denk gelebilirsin. Dövüşmek için fazla tehlikeli bir şey görürsen kaçmaya çalış. Hayatta kalıp, şansın daha yüksek olduğu bir gün yeniden dövüşmekte utanılacak bir şey yok - hem senin gibi güzel yüzlü birinin ölmesi yazık olur~",
    "guard teach": "Bana işime yarayacak bir şey öğretebilir misin acaba?",
    "guard teach answ": `Bir bakayım... Evet, işin temelini biliyor gibisin. Düzgün bir teknik biliyor musun? Bilmiyorsun demek. Tahmin etmiştim. En bilinen üç tanesini öğretebilirim. "Normal" dövüşmekten daha yorucu olabilirler, ama doğru anda kullanırsan çok daha etkili olurlar. İkisini biraz idman yaparak kolayca gösterebilirim, o yüzden ondan başlayalım. Üçüncüsünü ise anlatmakla yetineceğim. Ne dersin?`,
    "guard quick": "Şu hızlı duruş meselesi...",
    "guard quick answ": `Genelde ona "hızlı adımlar" derler. Gördüğün gibi, işin özü ayaklarını hızlı kullanmak. Saldırılarının gücünden ödün verirsin, ama çok hızlıdır; daha kolay devrilen düşmanlara karşı biçilmiş kaftan`,
    "guard heavy": "Şu ağır duruş meselesi...",
    "guard heavy answ": `Genelde ona "ezici kuvvet" derler. Gördüğün gibi, işin özü bütün gücünü saldırıya yüklemek. Saldırıların gözle görülür şekilde yavaşlar, ama normal vuruşların işlemediği kadar sert bir düşmanla karşılaşırsan tam da aradığın çözüm olur`,
    "guard wide": "Üçüncü teknik ne?",
    "guard wide answ": `Genelde ona "geniş yay" derler. Tek bir hedefe yoğunlaşmak yerine, olabildiğince çok düşmana vurabilmek için silahını geniş bir yay çizerek savurursun. Zayıf düşman gruplarına karşı çok iyi iş görür, ama saldırılarının gücünü de belirgin biçimde düşürür ve diğer iki duruştan bile daha yorucudur.`,
    "guard hi": "Merhaba, ben yine geldim. Nasıl gidiyor?",
    "guard hi answ": "Selam. Ortalıkta bir sürü işe yardım ettiğini duydum, aferin sana, tatlı şey~\n *[Bunu derken öne eğilip başını birkaç kez, hiç beklemeyeceğin kadar yumuşak bir dokunuşla okşuyor]*",
    "mofu#guard hi answ": "Selam. Ortalıkta bir sürü işe yardım ettiğini duydum, aferin sana, tatlı şey~ \n *[Bunu derken öne eğilip başını birkaç kez, hiç beklemeyeceğin kadar yumuşak bir dokunuşla okşuyor; kuyruğu da hafifçe sallanıyor]*",
    "guard tips 2": "İdman konusunda bana tavsiye verebilir misin?",
    "guard tips 2 answ": "Tek bir yeteneğe kilitlenmek her zaman en iyisi değil; başka alanlarda tecrübe kazanıp yeni şeyler kavradıktan sonra idmana geri dönersen daha çok öğrenebilirsin. Bir de duyduğum kadarıyla alışılmadık çalışma biçimleri var; hiç silah kullanmadan ya da hiç zırh giymeden dövüşmek gibi - ama onu sana önermem, tatlı şey. İkimizden birinin çirkin yara izleriyle kaplı olması yeterli.",
    "guard scars": "Bence yara izin çirkin değil",
    "guard scars answ": "*[Sana cevap vermiyor, sadece başını çeviriyor. Yüzünden, sözlerinin ona iyi geldiği ama onlara pek de inanmadığı okunuyor]*",
    "guard serious": "Daha ciddi bir dövüş deneyebilir miyiz?",
    "guard serious answ": "Ohooo, birileri tatlı muhafız ablayı etkilemek mi istiyor? Kusura bakma ama ben senin için fazla ağır sıkletim~",
    "mofu#guard serious answ": "Ohooo, birileri tatlı, tüylü kurt ablayı etkilemek mi istiyor? Kusura bakma ama ben senin için fazla ağır sıkletim~",
    "guard pats": "[Başımı biraz daha okşamasını iste]",
    "guard pats answ": "[Gülümseyip başını birkaç kez daha okşuyor]",
    "guard try": "[Onun başını okşamayı dene]",
    "guard try answ": "[Yok öyle yağma. Sonuçta okşanan yine senin başın oluyor~~~]",
    "guard try answ too short": "[Boyun yetişmiyor; gerçi çabalarını tatlı bulmuşa benziyor. Sonuçta okşanan yine senin başın oluyor~~~]",
    "guard teach more": "Bana başka bir şey daha öğretebilir misin?",
    "guard teach more answ": "Kusura bakma ama olmaz, bu kadarıyla yetineceksin. İnan bana, öğretmen olarak berbatım; tecrübeyle sabit. Benim yüzünden kötü alışkanlıklar edinmemen senin için daha iyi olur.",

//===== village millers =====
    "millers description": "Yüzlerinden muziplik akan iki genç görüyorsun. İkisinin de erkek olduğunu ancak bir hayli çabayla anlayabiliyorsun. Birinin saçı kızıl, diğerinin gri.",
    "mofu#millers description": "Yüzlerinden muziplik akan iki genç görüyorsun. Birinin kedi kulakları ve kabarık bir kuyruğu var, diğerinin fare kulakları ve neredeyse hiç tüyü olmayan bir kuyruğu. İkisinin de erkek olduğunu ancak bir hayli çabayla anlayabiliyorsun. Kedinin saçı kızıl, farenin gri.",
    "millers hello": "Selam",
    "millers hello answ": "[Kızıl] Selaam~! \n [Gri] Merhaba",
    "mofu#millers hello answ": "[Kedi] Selaam~! \n [Fare] Merhaba",
    "millers how": "İyi misiniz? Köy yaşlısı nasıl olduğunuza bir bakmamı istedi.",
    "millers how answ": "[Gri] İyiyiz, sayılır. \n [Kızıl] Ambardaki sıçanlar hariç; hem de tam tahıl sevkiyatı gelmek üzereyken. \n [Gri] İri olanlardan, tarlalardaki gibi... \n [Kızıl] Yani onları başımızdan alabilirsen, harika olur!",
    "mofu#millers how answ": "[Fare] İyiyiz, sayılır. \n [Kedi] Ambardaki sıçanlar hariç; hem de tam tahıl sevkiyatı gelmek üzereyken. \n [Fare] İri olanlardan, tarlalardaki gibi... \n [Kedi] Bana kalsa fare olsalardı daha iyi, en azından onlar tatlı. \n [Fare] Kes sesini. \n [Kedi] Yani onları başımızdan alabilirsen, harika olur!",
    "millers young": "Siz ikiniz bu işi çevirmek için biraz fazla genç değil misiniz?",
    "millers young answ": "Yaşlı yine bize çocuk mu dedi? Ama hayır, ikimiz de yetişkiniz - kıl payı da olsa~",
    "millers sure": "Tabii, onları ben hallederim.",
    "millers sure answ": "[Kızıl] Ehehe, sağ ol~ \n [Gri] Karşılığında sonra sana bir ödül ayarlarız. \n [Kızıl] Biraz para, belki bir iki de öpücük~",
    "mofu#millers sure answ": "[Kedi] Ehehe, sağ ol~ \n [Fare] Karşılığında sonra sana bir ödül ayarlarız. \n [Kedi] Biraz para, belki bir iki de öpücük~",
    "millers cleared": "Ambarınızı temizledim",
    "millers cleared answ": "[Kızıl] Helal olsun! \n[Gri] Peki o tahıl nerede kaldı? \n [Kızıl] Ha, doğru, çoktan gelmiş olması gerekiyordu. \n[Gri] Köyde tahıl çuvalı yüklü bir yük arabası arayabilir misin? 'Güya' bize doğru geliyormuş.",
    "mofu#millers cleared answ": "[Kedi] Helal olsun! \n[Fare] Peki o tahıl nerede kaldı? \n [Kedi] Ha, doğru, çoktan gelmiş olması gerekiyordu. \n[Fare] Köyde tahıl çuvalı yüklü bir yük arabası arayabilir misin? 'Güya' bize doğru geliyormuş.",
    "millers delivered": "Sevkiyatınız geldi.",
    "millers delivered answ": "[Kızıl] Eyvallah \n[Gri] Çok teşekkürler! \n[Kızıl] Al bakalım, ödülün de burada.",
    "mofu#millers delivered answ": "[Kedi] Eyvallah \n[Fare] Çok teşekkürler! \n[Kedi] Al bakalım, ödülün de burada.",
    "millers kiss": "Şu söz verdiğiniz öpücük var ya...",
    "millers kiss answ": "[Kızıl] Evet? Hangimizden istersin?",
    "mofu#millers kiss answ": "[Kedi] Evet? Hangimizden istersin?",
    "millers kiss mouse": "Şey... gri saçlı arkadaşından?",
    "millers kiss mouse answ": "*[Gri saçlı genç yandan yavaşça sana yaklaşıyor, yanağına usulca bir öpücük konduruyor, sonra hafif utangaç bir gülümsemeyle bir adım geri çekiliyor]*",
    "mofu#millers kiss mouse answ": "*[Fare kulaklı genç yandan yavaşça sana yaklaşıyor, kuyruğu bacaklarına değerken yanağına usulca bir öpücük konduruyor, sonra hafif utangaç bir gülümsemeyle bir adım geri çekiliyor]*",
    "millers kiss cat": "Şey... senden?",
    "millers kiss cat answ": "*[Kızıl saçlı genç yandan yavaşça sana yaklaşıyor, yanağına usulca bir öpücük konduruyor, sonra muzip bir sırıtışla bir adım geri çekiliyor]*",
    "mofu#millers kiss cat answ": "*[Kedi kulaklı genç yandan yavaşça sana yaklaşıyor, kuyruğu bacaklarına değerken yanağına usulca bir öpücük konduruyor, sonra muzip bir sırıtışla bir adım geri çekiliyor]*",
    "millers kiss both": "Şey... ikinizden?",
    "millers kiss both answ": "*[İkisi iki yandan yavaşça sana yaklaşıyor, aynı anda her iki yanağına usulca birer öpücük konduruyor; ardından ikisi de birer adım geri çekiliyor]*",
    "mofu#millers kiss both answ": "*[İkisi iki yandan yavaşça sana yaklaşıyor, kuyrukları bacaklarına değerken aynı anda her iki yanağına usulca birer öpücük konduruyor; ardından ikisi de birer adım geri çekiliyor]*",
    "millers reject nice": "Teklif için sağ ol, ama ben öyle şeylere meraklı değilim",
    "millers reject nice answ": "[Kızıl] Eh, yazık oldu~",
    "mofu#millers reject nice answ": "[Kedi] Eh, yazık oldu~",
    "millers reject mean": "Iyy, hayır, o fikri kafandan tamamen çıkar",
    "millers reject mean answ": "[Kızıl] Sen nasıl istersen~",
    "mofu#millers reject mean answ": "[Kedi] Sen nasıl istersen~",
    "millers kiss more": "Bir öpücük daha alabilir miyim?",
    "millers kiss more answ": "[Kızıl] Hmmm... verelim mi? \n[Gri] Başka zaman belki. \n[Kızıl] Duydun işte~",
    "mofu#millers kiss more answ": "[Kedi] Hmmm... verelim mi? \n[Fare] Başka zaman belki. \n[Kedi] Duydun işte~",
    "millers how2": "Nasıl gidiyor bakalım?",
    "millers how2 answ": "[Kızıl] Biraz sıkıcı, ama en azından arkadaşım sağlam. \n[Gri] Ne dediyse o.",
    "mofu#millers how2 answ": "[Kedi] Biraz sıkıcı, ama en azından arkadaşım sağlam. \n[Fare] Ne dediyse o.",
    "millers about guard": "Köyü koruyan şu kız hakkında bir şey biliyor musunuz?",
    "millers about guard answ": "[Kızıl] Yok, hiçbir şey. Sadece, anlatılanlara bakılırsa, kıtanın en iyi on maceracısından birine her açıdan tıpatıp benziyor; o maceracı da tam o kız buraya dönmeden hemen önce emekliye ayrılmış, o kadar. \n[Gri] Tamamen tesadüf tabii, değil mi? *[İkisi birbirine manalı bir bakış atıyor]* \n[Kızıl] Şaka bir yana, burada bizden başka kimse bu bağlantıyı kuramadı, cidden çok saçmaaa~ \n[Gri] Ona birebir uyan güçlü bir maceracı olduğunu duyunca hepsi 'tam bir tesadüf, bambaşka biri' deyip geçiyor. \n[Kızıl] Kendisi de pek umursamıyor gibi, muhtemelen sessiz sakin bir hayat istiyor. Bırak öyle olsun; eminim çok şey yaşamış, hem o buradayken kendimizi hiç olmadığı kadar güvende hissediyoruz.",
    "mofu#millers about guard answ": "[Kedi] Yok, hiçbir şey. Sadece, anlatılanlara bakılırsa, kıtanın en iyi on maceracısından birine her açıdan tıpatıp benziyor; o maceracı da tam o kız buraya dönmeden hemen önce emekliye ayrılmış, o kadar. \n[Fare] Tamamen tesadüf tabii, değil mi? Birbiriyle hiç alakası olmayan iki kurt. *[İkisi birbirine manalı bir bakış atıyor]* \n[Kedi] Şaka bir yana, burada bizden başka kimse bu bağlantıyı kuramadı, cidden çok saçmaaa~ \n[Fare] Ona birebir uyan güçlü bir maceracı olduğunu duyunca hepsi 'tam bir tesadüf, bambaşka biri' deyip geçiyor. \n[Kedi] Kendisi de pek umursamıyor gibi, muhtemelen sessiz sakin bir hayat istiyor. Bırak öyle olsun; eminim çok şey yaşamış, hem o buradayken kendimizi hiç olmadığı kadar güvende hissediyoruz.",

//===== suspicious man and the old woman of the slums =====
    "sus description 1": "Üstü başı dökülen, saçları darmadağın bir genç görüyorsun; durmadan etrafı kolaçan ediyor. Sinir tikleri var gibi, ya da belki sadece fena hâlde gergindir. Seni fark edince gözünü dikip bakıyor.",
    "sus description 2": "Üstü başı dökülen, saçları darmadağın bir genç görüyorsun; sakin sakin etrafa bakınıyor. Seni fark ettiği anda daha da sakinleşiyor gibi.",
    "mofu#sus description 1": "Üstü başı dökülen, saçları darmadağın bir genç görüyorsun; durmadan etrafı kolaçan ediyor. Sinir tikleri var gibi, ya da belki sadece fena hâlde gergindir. Hem köpek kulakları hem de kuyruğu düşmüş, hiç kıpırdamıyor. Seni fark edince gözünü dikip bakıyor.",
    "mofu#sus description 2": "Üstü başı dökülen, saçları darmadağın bir genç görüyorsun; sakin sakin etrafa bakınıyor, kulakları dimdik, arada bir yeni seslere doğru dönüyor. Seni fark ettiği anda daha da sakinleşiyor gibi; kuyruğu da yavaşça sallanmaya başlıyor.",
    "sus hello": "Merhaba? Bana neden öyle bakıyorsun?",
    "sus hello answ": "S-sen! Sen ölmüştün! *adam hançer çekiyor*",
    "sus defeated": "Bu da neydi şimdi?",
    "sus defeated answ": "Ben... Biz... Seni soyan benim ekibimdi. Mezarından kalkıp intikamını almaya geldin sandım... Lütfen, ben hiçbir şey bilmiyorum. Cevap istiyorsan eski reisime sor. Kasabanın içinde, bir yerlerde.",
    "sus behave": "Uslu duruyor musun?",
    "sus behave answ": "E-evet, reis! Lütfen bir daha dövme beni!",
    "sus boss": "Bana 'reis' demeyi bırak",
    "sus boss answ": "Emredersin, reis! Kusura bakma, reis!",
    "sus situation": "Bu arada, bu kenar mahallede işler nasıl gidiyor?",
    "sus situation answ": "G-gördüğün ve duyduğun gibi reis, işler epey k-kötü, ama ç-çete temizlenmeden bunun çaresi yok...",
    "sus gang": "Ne çetesi?",
    "sus gang answ": "S-sadece bir çete, kendilerine özel bir isim falan takmıyorlar, reis. İnleri ş-şu tarafta, oradan uzak dursan iyi olur. B-bu mahalledeki neredeyse her k-katil, her haydut onların adamı...",
    "sus gang defeated": "Şu bahsettiğin çete var ya? Hallettim.",
    "sus gang defeated answ": "Biliyorum reis, o gürültüyü hepimiz duyduk! Sen bir harikasın! Sanırım buradaki tüccar onlardan sakladığı teçhizatı çoktan çıkarmış bile, bir göz atsan iyi olur! \n*[Bir an susuyor]* Keşke sana savunma numaralarımı önceden gösterseydim, işini kolaylaştırabilirdi...",
    "sus behave 2": "Uslu duruyor musun?",
    "sus behave 2 answ": "E-evet, geçen seferden beri kötü bir şey yapmadım, reis!",
    "sus behave 3": "Uslu duruyor musun?",
    "sus behave 3 answ": "Elbette, reis!",
    "sus tricks": "Şu savunma numaralarından bahsetmiştin ya? Göster bakalım",
    "sus tricks answ": "Tabii, reis! Yani, olay aslında bacaklarına odaklanmakta: ya daha hızlı yana sıçrayacaksın, ya da kalkanı daha sağlam siper edeceksin, bir de... *[Bir süre anlatmaya devam ediyor]*",
    "sus headpat": "[Başını okşa]",
    "sus headpat answ": "[Küçük bir köpek yavrusu gibi gülümsüyor]",
    "mofu#sus headpat answ": "[Küçük bir köpek yavrusu gibi gülümsüyor, kuyruğu çok daha hızlı sallanmaya başlıyor]",
    "old description 1": "Mahalleye biraz güvenlik geri döndüğü için sokaklarda artık daha çok insan var. İçlerinden yaşlı bir teyze sana bakıyor.",
    "old description 2": "Gözlerinden sıcaklık taşan, yumuşak huylu yaşlı bir teyze görüyorsun",
    "mofu#old description 1": "Mahalleye biraz güvenlik geri döndüğü için sokaklarda artık daha çok insan var. İçlerinden yaşlı bir tanuki teyze sana bakıyor.",
    "mofu#old description 2": "Gözlerinden sıcaklık taşan, yumuşak huylu yaşlı bir tanuki teyze görüyorsun",
    "old hello": "[Yanına gelmesine izin ver.]",
    "old hello answ": "Merhaba, genç savaşçı. Duyduğuma göre bizi o haydutlardan kurtaran sensin. Bugünlerde onların karşısına dikilmeye yüreği olan az, gücü olan daha da az. Helal olsun sana! Böyle bir yiğitlik ödülsüz kalmaz; gördüğün gibi hiçbirimizin verecek pek bir şeyi yok, ama en azından kahramanımızı aç bırakmam. Akşam yemeğini benimle yer misin?",
    "old dinner": "[Teklifi kabul et.]",
    "old dinner answ": "[Teyzenin kulübesinde mütevazı ama insanı doyuran bir yemeğe oturuyorsun. Ana malzemeler basit ama tadı yerinde; üstüne bir de otlar serpilmiş.]",
    "old ingredients": "[Yemeği öv ve malzemeleri nereden bulduğunu sor.]",
    "old ingredients answ": "Şaşırdın mı? Burada yeterince uzun yaşayınca pahalı şeyler olmadan geçinmeyi öğreniyorsun. Hayır, çalmaktan bahsetmiyorum - yoksul olabilirim, ama onurum hâlâ yerinde! Şurada burada kendiliğinden biten otlardan bahsediyorum. Çoğu insan ne kadar işe yarayabileceklerini bilmeden yanlarından geçip gidiyor. Ha! Meğer sana verebileceğim başka bir ödül varmış! İstersen hangi otları arayacağını öğretebilirim.",

//===== old craftsman, gate guard, nekomimi proprietress =====
    "craftsman description": "Yaşlı bir adam görüyorsun; hayatta çok şey görmüş olduğu her hâlinden belli. Üzerinde el yapımı birkaç takı var. Yaşına rağmen parmakları şaşırtıcı derecede becerikli görünüyor.",
    "mofu#craftsman description": "Orta uzunlukta beyaz kuyruklu yaşlı bir adam görüyorsun; hayatta çok şey görmüş olduğu her hâlinden belli. Saçının bir kısmı siyah, bir kısmı beyaz; siyahı yaşla epeyce solmuş. Üzerinde el yapımı birkaç takı var. Yaşına ve kocaman ellerine rağmen parmakları şaşırtıcı derecede becerikli görünüyor.",
    "craftsman hello": "Merhaba, benimle konuşmak istediğinizi duydum, doğru mu?",
    "craftsman hello answ": "Ahh, seni görmek güzel, gezgin. Senin gibi birinin işine yarayabilecek ufak bir şey geldi aklıma. Bak, şimdiki gençler o güzel eski zanaata metelik vermiyor, her şeyi dükkândan almayı yeğliyorlar; ama içimden bir ses senin farklı olabileceğini söylüyor. Kısa bir ders ister misin?",
    "craftsman learn": "Olur, acelem yok.",
    "craftsman learn answ": "Ahh, harika. Peki o zaman... \n*[Yaşlı adam bir süre boyunca zanaatkârlığın bütün önemli temellerini anlatıyor ve sana püf noktalarını gösteriyor]*\nAhh, unutmadan, al bunları da. Gerekli malzemeleri toplarken işine yarar.",
    "mofu#craftsman learn answ": "Ahh, harika. Peki o zaman... \n*[Yaşlı adam bir süre boyunca zanaatkârlığın bütün önemli temellerini anlatıyor ve sana püf noktalarını gösteriyor; o kocaman parmakları göründüğü kadar becerikli çıkıyor]*\nAhh, unutmadan, al bunları da. Gerekli malzemeleri toplarken işine yarar.",
    "craftsman leave": "İlgilenmiyorum.",
    "craftsman leave answ": "Ahh, anladım. Fikrini değiştirdiğinde belki başka bir vakit, ha?",
    "craftsman remind 1": "Kendime nasıl teçhizat yapacağımı bir daha hatırlatır mısınız?",
    "craftsman remind 1 answ": "Ahh, elbette. Basit bir giysi gibi kolay bir şeyden bahsetmiyorsan, önce sonradan birleştirebileceğin parçaları yapman gerekir. Silahlarda genelde düşmana vurduğun bir parça, bir de elinde tuttuğun bir parça olur. Zırhlarda ise asıl zırhın kendisi, bir de altına giyeceğin daha yumuşak bir şey - yani çoğunlukla bir giysi - gerekir.",
    "craftsman remind 2": "Yaptıklarımı nasıl geliştireceğimi bir daha hatırlatır mısınız?",
    "craftsman remind 2 answ": "Ahh, o kolay, sadece daha çok tecrübe gerek. Yalnızca bu bile emeğinin karşılığını fazlasıyla verir. Teçhizat için işe daha iyi parçalarla başlamak da isteyebilirsin. Ne de olsa en kusursuz birleştirmeyle bile eğrilmiş bir bıçağı efsanevi bir kılıca çeviremezsin.",
    "craftsman remind 3": "Zanaat malzemelerini nasıl bulacağımı bir daha hatırlatır mısınız?",
    "craftsman remind 3 answ": "Ahh, bunun birkaç yolu var. Devirdiğin düşmanlardan alabilirsin, etraftan toplayabilirsin, hatta cebinde biraz fazladan para varsa satın alabilirsin.",
    "craftsman remind 4": "Zanaatkârlıkta nasıl ustalaşırım?",
    "craftsman remind 4 answ": "Ahh, sırrı yok, çalışmaya devam edeceksin, o kadar. Yalnız bütün ömrünü aynı berbat malzemelerle geçirme; kendine güvendiğinde daha sağlam şeylere geçmeyi dene. Sıçan derisiyle uğraşarak öğrenebileceklerinin de bir sınırı var, değil mi?",
    "craftsman about guard": "Peki şu köy muhafızı kızın hikâyesi nedir?",
    "craftsman about guard answ": "Ahhh, bizim küçük savaşçımız... Bir zamanlar maceracı olmak istiyordu, ama sanırım olmadı. Yetenek yoksa ne kadar çalışırsan çalış yetmiyor; alın yazısını değiştirmeye de yetmiyor, korkarım. Yine de iyi kızdır, artık bizi o koruyor.",
    "mofu#craftsman about guard answ": "Ahhh, bizim yırtıcı kurt kızımız... Bir zamanlar maceracı olmak istiyordu, ama sanırım olmadı. Yetenek yoksa ne kadar çalışırsan çalış yetmiyor; alın yazısını değiştirmeye de yetmiyor. Yine de iyi kızdır, artık bizi o koruyor.",
    "g guard description": "Çelik zincir zırh giymiş, iri yarı bir adam görüyorsun; elinde bir mızrak, kemerinde bir kılıç var.",
    "mofu#g guard description": "İri yarı, tüylü bir adam görüyorsun; kulakları yuvarlak, kuyruğu ufacık. Çelik zincir zırh giymiş; elinde bir mızrak, kemerinde bir balta var.",
    "g guard hello": "Merhaba, içeri girebilir miyim?",
    "g guard hello answ": "Kasaba şu anda kapalı. Yurttaş ya da tüccar loncası üyesi olmayan kimse giremez. İstisna yok.",
    "g guard known": "Bir süredir buralarda insanlara iş yapıyorum. Bunun bir hükmü yok mu?",
    "g guard known answ": "Tek başına yok. *[Mızrağı öbür eline alıp ilk kez size adamakıllı bakıyor]*\n\nAma kasaba çiftliklerinin sorumlusu ta buraya kadar yürüyüp geldi ve kapıya bir isim bıraktı. Sizinkini. O isim çıkagelirse geri çevrilmeyecekmiş, kendisi de arkasında duracakmış. Bir yurttaşın sizin için kefil olması istisna değil. Kuralın diğer yarısı.\n\n*[Kenara çekiliyor]* Meydan dümdüz ileride, lonca mahallesi çeşmeyi geçince. Güvercinleri beslemeyin. Örgütlüler.",
    "g guard passed": "Yoğun bir gün mü?",
    "g guard passed answ": "Her gün aynı gün. *[Size bakmıyor]* Artık listedesiniz. Listede kalın.",
    "nekomimi proprietress description": "Lekesiz bir önlük takmış, uzun boylu bir kedi kız görüyorsun; odada kımıldamayan tek kişi. Kuyruğu kıpırdamıyor bile; kendi çalışanlarını, uğraşmaya değmeyeceğine çoktan karar verdiği bir kuşu izleyen bir kedi gibi süzüyor.",
    "proprietress hi": "Merhaba?",
    "proprietress hi answ": "Hoş geldin. *[Acele etmeden seni bir kez süzüyor]* Masa mı, tezgâh mı? Konuşmak istiyorsan tezgâh, şımartılmak istiyorsan masa. İkisi de aynı fiyat.",
    "proprietress offer": "Burada neler yenir içilir?",
    "proprietress offer answ": "Kahve, elma şarabı, kek ve mutfağın bugün yere düşürmemeyi başardığı her ne varsa. *[Arkasında porselen bir şey kıl payı kurtuluyor, üç ses birden zafer çığlığı atıyor]*\n\nMillet buraya çalışanlar için geliyor. Yemek de kendilerine uydurdukları bahane. Bugüne kadar bu düzenden şikâyet eden olmadı.",
    "proprietress special": "Tavsiye ettiğin bir şey var mı?",
    "proprietress special answ": "Elmalı turta. En iyi yaptığımız şey olduğu için değil, gerçi öyle. *[Kulakları hafifçe dönüyor; kımıldayan tek yeri]*\n\nYemesi o kadar uzun sürer ki ikindi vardiyası başladığında hâlâ burada oturuyor olursun. Seyretmeye değer olanlar da onlar.",
    "proprietress puns": "Buradakiler şu kedi esprilerine hiç ara vermiyor mu?",
    "proprietress puns answ": "*[Kuyruğu ilk kez kımıldıyor. Bir kez]* Tamamı kedi insanlardan oluşan bir kafeye girdin, bir de esprilerin bitip bitmediğini soruyorsun.\n\nBitmiyor. Kapının yanında bir kavanoz var - müşterinin ağzından çıkan her 'nya' için bir bakır. Çatının parasını o çıkardı. *[Neredeyse gülümsüyor]* Bence gayet mırakul.",

//===== farm supervisor =====
    "sup hello": "Merhaba",
    "sup hello answ": "Merhaba yabancı",
    "sup work": "Doğru düzgün para veren bir işiniz var mı?",
    "sup work answ": "Fazladan bir el hiç fena olmaz. Vaktin olduğunda gel, tarlalarda çocuklarıma yardım et; çekinmeye gerek yok!",
    "sup anything": "Size yardımcı olabileceğim bir şey var mı?",
    "sup anything answ": "Sanmıyorum, olağan işlerin dışında bir şey yok... Aslında bir şey var. Acilen 50 paket kemik ununa ihtiyacımız var, üstüne bir de tedarikçimizi kaybettik; o yüzden üç kat fiyat ödemeye hazırım. Kötü haber şu ki, 50 paketin tamamını tek seferde getirmen gerekecek.",
    "sup bonemeal": "Daha fazla kemik unu mu dediniz?",
    "sup bonemeal answ": "Kesinlikle! Fiyatın artık daha düşük olması pek cazip gelmiyor olabilir, biliyorum; ama piyasanın aksine en azından sabit, hem bazen hiçbir tüccarın veremeyeceği kadar iyi oluyor.",
    "sup animals": "Satılık bir şeyiniz var mı?",
    "sup animals answ": "Kusura bakma, buna yetkim yok. Ama bir şey üretmemize yardım edersen, çıkanın bir kısmını almana göz yumabilirim. Bak, tam da koyunlarımızın kırkılma vakti; bedava yün ilgini çekerse tabii.",
    "sup fight0": "Biraz eski usul şiddet gerektiren bir işiniz var mı?",
    "sup fight0 answ": "Var sayılır, ama bunun için yeterince güçlü görünmüyorsun. Kusura bakma.",
    "sup fight": "Biraz eski usul şiddet gerektiren bir işiniz var mı?",
    "sup fight answ": "Aslında var. Şu baş belası yaban domuzu sürüsü tarlalarımızın altını üstüne getirip duruyor. "
        + "Ciddi bir sorun çıkaracak kadar zarar vermiyorlar, ama biri onları halletse içim çok daha rahat ederdi. "
        + "Ormana git, kuzeyde bir açıklık ara; ekinlerimizi yemekle meşgul olmadıkları zaman genelde orada dolaşırlar. "
        + "Karşılığını tabii ki ödeyeceğim. En fazla 4 gümüş sikke verebilirim, sıkı bir bütçeyle idare ediyorum burada.",
    "sup things": "Buralarda işler nasıl?",
    "sup things answ": "Şikâyet edecek bir şey yok. Bela az, para iyi, toprak da karım kadar bereketli!",
    "sup defeated boars": "Şu yaban domuzlarını hallettim",
    "sup defeated boars answ": "Öyle mi? Bu harika! Al bakalım, bu senin.",
    "sup troubled unavailable": "Başka yardıma ihtiyacınız var mı?",
    "sup troubled unavailable answ": "Kış bittikten sonra sana verecek bir işim olabilir",
    "sup troubled": "Bir derdiniz var gibi",
    "sup troubled answ": "Dert mi? Küplere biniyorum, çıldıracağım burada! Şu lanet olası karıncalar, ekinlerimizin köklerini kemirip kemirip hepsini telef ediyorlar!"
        + " Elimde olsa her şeyi bırakır, bir kılıçla bir kürek kapıp o lanet yuvalarını bulur, sonra hepsini son ferdine kadar kılıçtan geçirirdim! Sadece askerlerle işçileri değil; kraliçeleri, larvaları da!"
        + " Yuvalarını benim için yok et, minnettarlığımı kazanırsın; hatta ücretini kendi cebimden öderim!... Ha, bir de: kendi küreğin yoksa çiftlikten bir tane ödünç alabilirsin.",
    "sup eliminated": "Karıncalar temizlendi, gerçi ormana doğru giden birkaç iz var",
    "sup eliminated answ": "Bu... valla ne diyeceğimi bilmiyorum, teşekkür ederim, çok teşekkür ederim! Al, bunu hak ettin! Orman meselesi hiç umurumda değil, yeter ki geri gelmesinler.",
    "sup deliver": "[Kemik ununu teslim et]",
    "sup deliver answ": "Çok teşekkür ederim, işte paran! Bu çapta teslimatlar getirmeye devam etmek istersen memnuniyetle alırız, ama bundan sonra normal fiyattan olacak",
    "sup deliver not": "Kusura bakma ama bu kadarı yetmez",
    "sup deliver 2": "[Kemik ununu teslim et]",
    "sup deliver 2 answ": "Çok teşekkür ederim, işte paran! Ne zaman elinde olursa daha fazlasını memnuniyetle alırız!",
    "sup deliver 2 not": "Kusura bakma ama bu kadarı yetmez",
    "sup description": "Kemerinde bir defter, başında bir şapka olan, iyi giyimli bir adam görüyorsun. Kâtibe benzese de kaslı ve güneşten yanmış.",
    "mofu#sup description": "Kemerinde bir defter, başında da boynuzlarının arasına tuhaf bir şekilde oturtulmuş bir şapka olan, iyi giyimli bir adam görüyorsun."
            + " Kâtibe benzese de kaslı ve güneşten yanmış.",
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

const quests = {
    /*
        Quest text. Ids and their shape are documented in locales/english.js.

        Translation notes worth keeping:
        - "It won't mill itself" is the "it won't do itself" idiom. Turkish has the
          same construction, so the joke survives directly.
        - "Ploughs to swords" inverts the swords-into-ploughshares allusion. Turkish
          carries the same allusion, so the inversion reads the same way.
        - "Giant Enemy Crab" is a 2006 meme and is deliberately literal.
        - The apostrophe joke in that quest's first description - crab nests / a
          crab's nest / some crabs' nest - is a joke about English possessives and
          cannot be carried word for word. Turkish possessive suffixes produce the
          same three readings, so the joke is rebuilt on those instead.
    */

    //LOST MEMORY
    "quest Lost memory": "Kayıp hafıza",
    "quest Lost memory desc 1": "Bir köyde gözlerini açtın ve buraya nasıl geldiğine, kim olduğuna dair hiçbir fikrin yok. Ne olmuş olabilir ki?",
    "quest Lost memory desc 2": "Kimliği bilinmeyen saldırganların saldırısından sonra hafızanı yitirdin ve köylüler seni kurtardı. Kimin, neden yaptığını, mümkünse hafızanı nasıl geri kazanacağını bulman gerek.",
    "quest Lost memory desc 3": "Seni soyan adamlardan biri hayatta ve konuştu. Onun çetesiydi, seni ölüme terk ettiler ve emri verenin kasabada bir yerde olduğunu söyledi - yalnızca yurttaşlara ve tüccarlara açılan bir kapının ardında.",
    "quest Lost memory desc 4": "Kasabanın içindesin; o çetenin hesap verdiği adam da. Onu bulmak, yoldaki o gecenin cevabına şimdiye kadar en çok yaklaştığın nokta.",
    "quest Lost memory task 0": "Ne olduğunu öğren",
    "quest Lost memory task 2": "Kurt sıçanı istilasına karşı yardım et",
    "quest Lost memory task 3": "Aramayı sürdür",
    "quest Lost memory task 4": "Kasabaya gir",

    //THE INFINITE RAT SAGA
    "quest The Infinite Rat Saga": "Bitmeyen Sıçan Destanı",
    "quest The Infinite Rat Saga desc 1": "Mağaralarda daha çok sıçan buldun. Madem öyle, bu işin dibine kadar gitmeyi denesen iyi olur.",
    "quest The Infinite Rat Saga task 0": "Daha derine in",
    "quest The Infinite Rat Saga task 1": "Gizemli kapıyı aç",
    "quest The Infinite Rat Saga task 2": "Bozulmuş tünelden geç",
    "quest The Infinite Rat Saga task 3": "Daha da derine in (devam edecek)",

    //IT WON'T MILL ITSELF
    "quest It won't mill itself": "Kendi kendine öğütmez",
    "quest It won't mill itself desc 1": `Köy yaşlısı, doğudaki değirmeni çeviren "çocukların" nasıl olduğuna bir bakmanı istedi`,
    "quest It won't mill itself desc 2": "Doğudaki değirmeni çeviren oğlanların yardımına ihtiyacı var",
    "quest It won't mill itself task 0": "Doğudaki değirmene uğra",
    "quest It won't mill itself task 1": "İstila edilmiş ambarı temizle",
    "quest It won't mill itself task 2": "Kaybolan tahıl sevkiyatını bul ve değirmene götür",

    //VILLAGE EXPANSION
    "quest Village expansion": "Köyün genişlemesi",
    "quest Village expansion desc 1": "Köy yaşlısının sana verecek birkaç işi var",
    "quest Village expansion task 0": "Islah kanalını kaz",
    "quest Village expansion task 3": "Malzeme topla (Wood log x100, Stone brick x500) ve sonra yeni köprünün yapımına yardım et",
    "quest Village expansion task 6": "Dev yusufçukları temizle ve sonra haber ver",
    "quest Village expansion task 7": "[Devam edecek]",

    //BONEMEAL DELIVERY
    "quest Bonemeal delivery": "Kemik unu teslimatı",
    "quest Bonemeal delivery desc 1": "Çiftlik sorumlusunun acilen 50 paket kemik ununa ihtiyacı var ve siparişin tamamının tek seferde teslim edilmesini istiyor.",
    "quest Bonemeal delivery task 0": "50 paket kemik unu getir",

    //LIGHT IN THE DARKNESS
    "quest Light in the darkness": "Karanlıkta bir ışık",
    "quest Light in the darkness desc 1": "Slum'ların insanları acı ve korku içinde yaşıyor. Belki durumlarını bir nebze iyileştirebilirsin?",
    "quest Light in the darkness task 1": "Çeteyi hallet",
    "quest Light in the darkness task 2": "[Devam edecek]",

    //PLOUGHS TO SWORDS
    "quest Ploughs to swords": "Sabanlardan kılıç",
    "quest Ploughs to swords desc 1": "Kasaba çiftliklerinin sorumlusunda ilginç işler var gibi görünüyor, ama önce bunun için yeterince güçlü olmanı istiyor.",
    "quest Ploughs to swords desc 2": "Kasaba çiftliklerinin sorumlusunun yetenekli bir dövüşçüye ihtiyacı var",
    "quest Ploughs to swords task 0": "Gücünü kanıtla",
    "quest Ploughs to swords task 1": "Yaban domuzlarını hallet ve sonra haber ver",
    "quest Ploughs to swords task 3": "Çiftliğin altındaki kızıl karıncaları temizle ve sonra haber ver",

    //GIANT ENEMY CRAB
    "quest Giant Enemy Crab": "Dev Düşman Yengeç",
    "quest Giant Enemy Crab desc 1": "Yaşlı, nehrin aşağısında bir yerdeki dev yengeç yuvalarına dair söylentileri araştırman için sana izin verdi. Yoksa dev yengecin yuvası mıydı? Belki dev yengeçlerin yuvası? Her hâlükârda, yola çıkmadan önce hazırlanmanı hatırlattı",
    "quest Giant Enemy Crab desc 2": "Dev yengeci kaçırmayı başardın, ama işini yakında bitirmezsen gidip başka bir yere yuva kurar ve sonra bir başkasının sorunu olur. Hem biri onu bulsa bile, yenecek kadar güçlü olur mu? En iyisi şimdi kendin halletmek",
    "quest Giant Enemy Crab desc 3": "Göl kıyısında yuva kuran dev yengeci öldürdün. Görev tamamlandığına göre, madem buradasın, bölgeyi biraz daha keşfetsen iyi olur.",
    "quest Giant Enemy Crab task 0": "Nehrin aşağısını araştır",
    "quest Giant Enemy Crab task 1": "Dev yengecin izini sür",

    //IN TIMES OF NEED
    "quest In Times of Need": "Zor Zamanlarda",
    "quest In Times of Need desc 1": "Burada kim yetkiliyse kendini ona tanıtman gerek",
    "quest In Times of Need desc 2": `Şefin, kabileye nasıl yardım edebileceğini görmek için etrafa sorman yönündeki "ricasını" kabul ettin`,
    "quest In Times of Need desc 3": "Snake Fang kabilesine zor zamanlarında yardım ettin",
    "quest In Times of Need task 1": "Etrafa sor ve nasıl yardım edebileceğini gör",
    "quest In Times of Need task 2": "Aşçıya 60 parça taze yengeç eti getir",
    "quest In Times of Need task 4": "Terziyle konuş ve nasıl yardım edebileceğini gör",
    "quest In Times of Need task 5": "Terziye 200 demet taze keten getir",
    "quest In Times of Need task 6": "Tabakhaneciyle konuş ve nasıl yardım edebileceğini gör",
    "quest In Times of Need task 7": "Tabakhaneciye 60 parça timsah derisi getir",
    "quest In Times of Need task 9": "Tabakhaneciye 60 parça dev yılan derisi getir",
    "quest In Times of Need task 10": "Şefe haber ver",
};

const reward_messages = {
    "reward msg go up": "Gitgide daha derine indikçe aklına ani bir düşünce takılıyor: ya bunun yerine yukarı çıkmayı denesen?",
    "reward msg rushing water": "Dövüşler arasındaki bir sessizlik anında, uzaklardan gelen hafif bir su sesi duyabiliyorsun",
    "reward msg through the water": "Bir su duvarına varıyor ve içinden geçip ilerliyorsun",
    "reward msg swimming tempting": "Şimdiye kadar yaptığın bütün çalışmadan sonra, yakındaki sulara dalma fikri cidden cazip geliyor",
};

const names = {
    /*
        Görünen adlar. Anahtar biçimi ve neden İngilizce tarafın da bu satırları
        taşıdığı locales/english.js içinde açıklanıyor.

        Altı stance adı, aynı adı taşıyan skill'den yalnızca büyük/küçük harfte
        ayrılıyor ve bu isim alanı harf duyarlı; o yüzden ikisi de aynı Türkçe
        değeri almak zorunda, yoksa stance butonu ile skill satırı farklı metin
        gösterir.

        Kip notu: NPC adları küçük harfle yazılır. Başlık, ekranda
        capitalize_first_letter üzerinden geçtiği için ilk harfi kendisi büyütür -
        ve o fonksiyon Türkçe için locale duyarlı olduğundan "ırk" gibi bir kelime
        "Irk" olur, "İrk" olmaz.
    */

    //DÖVÜŞ DURUŞLARI
    //Muhafızın diyalogundaki adlandırmalarla birebir aynı olmak zorunda:
    //"hızlı adımlar", "ezici kuvvet", "geniş yay" onun repliklerinde geçiyor.
    "name Normal Stance": "Normal duruş",
    "name Quick Steps": "Hızlı adımlar",
    "name Crushing Force": "Ezici kuvvet",
    "name Defensive Measures": "Savunma önlemleri",
    "name Broad Arc": "Geniş yay",
    //"Berserker" oyun jargonunda alıntı olarak da geçer, ama "cinnet" hem Türkçe
    //hem de duruşun yaptığı şeyi - kendini koruma pahasına saldırmayı - anlatıyor.
    "name Berserker's Stride": "Cinnet yürüyüşü",
    "name Flowing Water": "Akan su",

    //Aynı adı taşıyan skill'ler; yalnızca harf farkı var, değer aynı olmalı.
    "name Quick steps": "Hızlı adımlar",
    "name Crushing force": "Ezici kuvvet",
    "name Defensive measures": "Savunma önlemleri",
    "name Broad arc": "Geniş yay",
    "name Berserker's stride": "Cinnet yürüyüşü",
    "name Flowing water": "Akan su",

    //NPC'LER - konuşmanın üstündeki başlık. Rol unvanı, asla özel ad değil.
    "name village elder": "köy yaşlısı",
    "name old craftsman": "yaşlı zanaatkâr",
    "name village guard": "köy muhafızı",
    "name village millers": "köy değirmencileri",
    "name gate guard": "kapı muhafızı",
    "name suspicious man": "şüpheli adam",
    "name old woman of the slums": "slum'ların yaşlı kadını",
    "name farm supervisor": "çiftlik sorumlusu",
    "name nekomimi proprietress": "nekomimi işletmecisi",
    "name swampland chief": "bataklık şefi",
    "name swampland cook": "bataklık aşçısı",
    "name swampland tailor": "bataklık terzisi",
    "name swampland tanner": "bataklık tabakhanecisi",
    "name swampland scout": "bataklık izcisi",
    "name cute little rat": "sevimli küçük sıçan",

    //Şüpheli adamın adı, dövülüp başı okşandıktan sonra değişiyor. İngilizcesi
    //bilerek hantal ve komik; hantallığı korumak doğru olan.
    "name no-longer-suspicious guy": "artık şüpheli olmayan adam",
    //Mofu modunda köpek olduğu için. "Enik" gerçek Türkçe, sevecen ve küçültme
    //tonu İngilizcedeki "puppy" ile aynı yere düşüyor.
    "name puppy": "enik",

    //SKILL ADLARI - rütbe merdiveni: Acemi -> Çırak -> Kalfa -> Uzman -> Usta,
    //Türkçenin gerçek lonca hiyerarşisi. Stance ile ayni adi taşıyan altı skill
    //yukarıdaki stance bölümünde duruyor, açıklaması orada.
    "name Adept gatherer": "Kalfa toplayıcı",
    "name Alchemy": "Simya",
    "name Animal handling": "Hayvan bakımı",
    "name Apprentice gatherer": "Çırak toplayıcı",
    "name Axe combat": "Balta dövüşü",
    "name Beginner gatherer": "Acemi toplayıcı",
    "name Brawling": "Sokak kavgası",
    "name Breathing": "Nefes alma",
    "name Butchering": "Kasaplık",
    "name Climbing": "Tırmanma",
    "name Cold resistance": "Soğuk direnci",
    "name Combat": "Dövüş",
    "name Cooking": "Aşçılık",
    "name Crafting mastery": "Zanaat ustalığı",
    "name Crafting proficiency": "Zanaat yetkinliği",
    "name Dagger combat": "Hançer dövüşü",
    "name Dazzle resistance": "Kamaşma direnci",
    "name Digging": "Kazı",
    "name Equilibrium": "Denge",
    "name Evasion": "Kaçınma",
    "name Expert gatherer": "Uzman toplayıcı",
    "name Farming": "Çiftçilik",
    "name Fishing": "Balıkçılık",
    "name Forging": "Demircilik",
    "name Fortitude": "Metanet",
    "name Giant killer": "Dev avcısı",
    "name Giant slayer": "Dev kıyıcısı",
    "name Gluttony": "Oburluk",
    "name Haggling": "Pazarlık",
    "name Hammer combat": "Çekiç dövüşü",
    "name Heart of steel": "Çelik yürek",
    "name Heat resistance": "Sıcak direnci",
    "name Herbalism": "Bitki bilgisi",
    "name Iron skin": "Demir deri",
    "name Iron will": "Demir irade",
    "name Literacy": "Okuryazarlık",
    "name Martial arts": "Dövüş sanatları",
    "name Master gatherer": "Usta toplayıcı",
    "name Medicine": "Hekimlik",
    "name Meditation": "Meditasyon",
    "name Mining": "Madencilik",
    "name Night vision": "Gece görüşü",
    "name Perception": "Algı",
    "name Persistence": "Azim",
    "name Pest killer": "Haşere avcısı",
    "name Pest slayer": "Haşere kıyıcısı",
    "name Poison resistance": "Zehir direnci",
    "name Presence sensing": "Varlık sezme",
    "name Regeneration": "Yenilenme",
    "name Running": "Koşu",
    "name Scrambling": "Engebeli arazi hareketi",
    "name Shield blocking": "Kalkan savunması",
    "name Sleeping": "Uyku",
    "name Smelting": "Cevher eritme",
    "name Spatial awareness": "Mekân algısı",
    "name Spearmanship": "Mızrak kullanımı",
    "name Staff casting": "Asa büyücülüğü",
    "name Stance mastery": "Duruş ustalığı",
    "name Stance proficiency": "Duruş yetkinliği",
    "name Stone skin": "Taş deri",
    "name Strength of mind": "Zihin gücü",
    "name Swimming": "Yüzme",
    "name Swordsmanship": "Kılıç kullanımı",
    "name Tight maneuvers": "Dar alan manevraları",
    "name Tinkering": "El işçiliği",
    "name Tough skin": "Sert deri",
    "name Unarmed": "Silahsız dövüş",
    "name Wand casting": "Değnek büyücülüğü",
    "name Weapon mastery": "Silah ustalığı",
    "name Weapon proficiency": "Silah yetkinliği",
    "name Weightlifting": "Ağırlık kaldırma",
    "name Woodcutting": "Odunculuk",
    "name Wooden skin": "Tahta deri",
    "name Woodworking": "Ahşap işçiliği",
};

const turkish = {...dialogues, ...racial, ...ui, ...stats, ...skills, ...bio, ...quests, ...reward_messages, ...names};

export default turkish;
