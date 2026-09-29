
if (typeof levelsData === 'undefined') var levelsData = {};
if (typeof window.levelsData === 'undefined') window.levelsData = {};
window.levelsData = window.levelsData || {};
var levelsData = window.levelsData;

// Audio - use var and avoid duplicate
var audioPart1_08 = (typeof audioPart1_08 !== 'undefined' ? audioPart1_08 : "audio/8/1.mp3");
var audioPart2_08 = (typeof audioPart2_08 !== 'undefined' ? audioPart2_08 : "audio/8/2.mp3");
var audioPart3_08 = (typeof audioPart3_08 !== 'undefined' ? audioPart3_08 : "audio/8/3.mp3");
var audioPart4_08 = (typeof audioPart4_08 !== 'undefined' ? audioPart4_08 : "audio/8/4.mp3");

// If original file had audio/01 etc, override to audio/8 path
audioPart1_08 = "audio/8/1.mp3";
audioPart2_08 = "audio/8/2.mp3";
audioPart3_08 = "audio/8/3.mp3";
audioPart4_08 = audioPart4_08 || "audio/8/4.mp3";

window.levelsData["8"] = {

reading: [
{ tag: "U1_G", qNum: 1, question: "01 Choose the correct sentence order.", options: ["A Do you usually go to bed late?", "A You do usually go to bed late?", "A Do usually you go to bed late?", "A Go you usually to bed late?"], correct: 0, exp: "سؤال مضارع بسيط: Do + فاعل + ظُرف تكرار (usually) + فعل مصدر." },
    { tag: "U1_G", qNum: 2, question: "02 Choose the correct sentence order.", options: ["A Where are you going on vacation?", "A Where you are going on vacation?", "A Are where you going on vacation?", "A Where going are you on vacation?"], correct: 0, exp: "سؤال مضارع مستمر للخطط: أداة استفهام + are + فاعل + V-ing." },
    { tag: "U1_G", qNum: 3, question: "03 Choose the correct sentence order.", options: ["A How often do you see your friends?", "A How often you see your friends?", "A Do how often you see your friends?", "A How often do see you your friends?"], correct: 0, exp: "How often + do + فاعل + مصدر، للسؤال عن مدى التكرار." },
    { tag: "U1_G", qNum: 4, question: "04 Choose the correct sentence order.", options: ["A What kind of music do you listen to?", "A What kind of music you listen to?", "A Do what kind of music you listen to?", "A What kind do of music you listen to?"], correct: 0, exp: "What kind of... + do + فاعل + مصدر." },
    { tag: "U1_G", qNum: 5, question: "05 Choose the correct sentence order.", options: ["A Is it raining outside right now?", "A It is raining outside right now?", "A Is raining it outside right now?", "A Does it raining outside right now?"], correct: 0, exp: "سؤال هل في المضارع المستمر: Is + فاعل + V-ing." },
    { tag: "U1_G", qNum: 6, question: "06 Choose the correct sentence order.", options: ["A Why did you leave the party early?", "A Why you left the party early?", "A Why did you left the party early?", "A Did why you leave the party early?"], correct: 0, exp: "سؤال ماضي بسيط: Why + did + فاعل + مصدر." },
    { tag: "U1_G", qNum: 7, question: "07 She ـــــــ breakfast every morning at 7 AM.", options: ["A eats", "B is eating", "C eat", "D eating"], correct: 0, exp: "عادة يومية في المضارع البسيط، مع She نضيف s للفعل." },
    { tag: "U1_G", qNum: 8, question: "08 Look! The bus ـــــــ now.", options: ["A comes", "B is coming", "C come", "D coming"], correct: 1, exp: "كلمة Look تدل على المضارع المستمر الآن: is coming." },
    { tag: "U1_G", qNum: 9, question: "09 I don't understand this word. What ـــــــ?", options: ["A does it mean", "B is it meaning", "C it means", "D do it mean"], correct: 0, exp: "mean من أفعال الحالة (stative verbs) ولا يأتي في المستمر، نستخدم المضارع البسيط." },
    { tag: "U1_G", qNum: 10, question: "10 They ـــــــ currently working on a new project.", options: ["A is", "B are", "C am", "D be"], correct: 1, exp: "الجمع They يأخذ are في المضارع المستمر." },
    { tag: "U1_G", qNum: 11, question: "11 Right now, Sarah ـــــــ a book in her room.", options: ["A reads", "B is reading", "C read", "D reading"], correct: 1, exp: "Right now تدل على حدث يحدث الآن: مضارع مستمر is reading." },
    { tag: "U1_G", qNum: 12, question: "12 He usually ـــــــ coffee, but today he is drinking tea.", options: ["A drinks", "B is drinking", "C drink", "D drank"], correct: 0, exp: "عادة في المضارع البسيط مع He نضع drinks." },
    { tag: "U1_G", qNum: 13, question: "13 ـــــــ to the gym on weekends?", options: ["A Do you go", "B Are you going", "C Does you go", "D You go"], correct: 0, exp: "سؤال عن عادة في عطلة نهاية الأسبوع: Do you go." },
    { tag: "U1_G", qNum: 14, question: "14 Why ـــــــ at me like that?", options: ["A do you look", "B are you looking", "C you look", "D you are looking"], correct: 1, exp: "سؤال عن حدث يقع لحظة الكلام: are you looking." },
    { tag: "U1_G", qNum: 15, question: "15 Neither of them ـــــــ ready for the test.", options: ["A is", "B are", "C am", "D be"], correct: 0, exp: "Neither تعامل معاملة المفرد في القواعد الرسمية فتأخذ is." },
    { tag: "U1_G", qNum: 16, question: "16 We ـــــــ any milk left in the fridge.", options: ["A don't have", "B doesn't have", "C aren't having", "D not have"], correct: 0, exp: "نفي حقيقة/ملكية في المضارع البسيط مع We نستخدم don't have." },
    { tag: "U1_G", qNum: 17, question: "17 Where ـــــــ your key?", options: ["A did you lose", "B were you losing", "C you lost", "D did you lost"], correct: 0, exp: "سؤال في الماضي البسيط: did + فاعل + مصدر." },
    { tag: "U1_G", qNum: 18, question: "18 Be quiet! The baby ـــــــ.", options: ["A sleeps", "B is sleeping", "C slept", "D sleep"], correct: 1, exp: "تنبيه لحاجة بتحصل دلوقتي: is sleeping." },
    { tag: "U1_G", qNum: 19, question: "19 They ـــــــ to Paris tomorrow morning.", options: ["A fly", "B are flying", "C flew", "D flies"], correct: 1, exp: "ترتيبات مستقبلية مؤكدة نستخدم فيها المضارع المستمر: are flying." },
    { tag: "U1_G", qNum: 20, question: "20 How long ـــــــ to get to work?", options: ["A does it take", "B is it taking", "C it takes", "D do it take"], correct: 0, exp: "سؤال عن حقيقة/وقت مستغرق كعادة: does it take." },
    { tag: "U1_V", qNum: 1, question: "01 An accessory worn around the neck for warmth: ـــــــ", options: ["A a scarf", "B a belt", "C a ring", "D gloves"], correct: 0, exp: "كوفية/وشاح للرقبة scarf." },
    { tag: "U1_V", qNum: 2, question: "02 Footwear worn for sports and casual running: ـــــــ", options: ["A sneakers", "B boots", "C sandals", "D heels"], correct: 0, exp: "حذاء رياضي sneakers." },
    { tag: "U1_V", qNum: 3, question: "03 A piece of clothing worn on the upper body, usually with a collar and buttons: ـــــــ", options: ["A a shirt", "B shorts", "C a skirt", "D socks"], correct: 0, exp: "قميص بأزرار shirt." },
    { tag: "U1_V", qNum: 4, question: "04 Leather item used to hold pants up: ـــــــ", options: ["A a belt", "B a tie", "C a cap", "D a necklace"], correct: 0, exp: "حزام جلد belt." },
    { tag: "U1_V", qNum: 5, question: "05 Eyewear to protect eyes from strong light: ـــــــ", options: ["A sunglasses", "B glasses", "C goggles", "D contacts"], correct: 0, exp: "نظارة شمسية sunglasses." },
    { tag: "U1_V", qNum: 6, question: "06 Warm garment knitted from wool: ـــــــ", options: ["A a sweater", "B a T-shirt", "C a suit", "D a cap"], correct: 0, exp: "سترة صوفية sweater." },
    { tag: "U1_V", qNum: 7, question: "07 The shop is ـــــــ the bank and the pharmacy.", options: ["A between", "B next", "C opposite", "D under"], correct: 0, exp: "بين شيئين/مكانين between." },
    { tag: "U1_V", qNum: 8, question: "08 There is a clock ـــــــ the wall above the whiteboard.", options: ["A on", "B in", "C at", "D under"], correct: 0, exp: "على الحائط on the wall." },
    { tag: "U1_V", qNum: 9, question: "09 My house is right ـــــــ the corner of the street.", options: ["A at", "B in", "C on", "D under"], correct: 0, exp: "على الناصية at/on the corner." },
    { tag: "U1_V", qNum: 10, question: "10 He lives ـــــــ the third floor.", options: ["A on", "B in", "C at", "D under"], correct: 0, exp: "الطوابق تأخذ حرف الجر on." },
    { tag: "U1_V", qNum: 11, question: "11 The parking lot is ـــــــ the back of the building.", options: ["A at", "B on", "C in", "D under"], correct: 0, exp: "في الخلف at the back of." },
    { tag: "U1_V", qNum: 12, question: "12 The cat is hiding ـــــــ the table.", options: ["A under", "B between", "C on the left", "D behind of"], correct: 0, exp: "تحت الطاولة under." },
    { tag: "U1_V", qNum: 13, question: "13 Someone who likes talking and making new friends is ـــــــ.", options: ["A sociable", "B shy", "C rude", "D lazy"], correct: 0, exp: "اجتماعي sociable." },
    { tag: "U1_V", qNum: 14, question: "14 A person who doesn't like sharing or spending money is ـــــــ.", options: ["A mean", "B generous", "C kind", "D polite"], correct: 0, exp: "بخيل mean." },
    { tag: "U1_V", qNum: 15, question: "15 Someone who shows good manners is ـــــــ.", options: ["A polite", "B impolite", "C arrogant", "D selfish"], correct: 0, exp: "مؤدب polite." },
    { tag: "U1_V", qNum: 16, question: "16 A person who is always happy and smiling is ـــــــ.", options: ["A cheerful", "B moody", "C sad", "D angry"], correct: 0, exp: "مبتهج cheerful." },
    { tag: "U1_V", qNum: 17, question: "17 Someone who only thinks about themselves is ـــــــ.", options: ["A selfish", "B generous", "C patient", "D helpful"], correct: 0, exp: "أناني selfish." },
    { tag: "U1_V", qNum: 18, question: "18 Hair that is not straight or curly, but light waves is ـــــــ.", options: ["A wavy", "B bald", "C blonde", "D short"], correct: 0, exp: "شعر مموج wavy." },
    { tag: "U1_V", qNum: 19, question: "19 A person who works very hard is ـــــــ.", options: ["A hard-working", "B lazy", "C relaxed", "D quiet"], correct: 0, exp: "مجد ومجتهد hard-working." },
    { tag: "U1_V", qNum: 20, question: "20 Someone who gets calm and waits without getting angry is ـــــــ.", options: ["A patient", "B impatient", "C anxious", "D nervous"], correct: 0, exp: "صبور patient." },
    { tag: "U2_G", qNum: 1, question: "01 While I ـــــــ home, I met an old friend.", options: ["A was walking", "B walked", "C am walking", "D walk"], correct: 0, exp: "بينما كنت أمشي (حدث كان مستمراً قطع بحدث آخر) ماضي مستمر was walking." },
    { tag: "U2_G", qNum: 2, question: "02 What ـــــــ when the fire alarm rang?", options: ["A were you doing", "B did you do", "C are you doing", "D was you doing"], correct: 0, exp: "ماذا كنت تفعل وقت إنذار الحريق: were you doing." },
    { tag: "U2_G", qNum: 3, question: "03 They ـــــــ the house because it was too expensive.", options: ["A didn't buy", "B wasn't buying", "C weren't buying", "D don't buy"], correct: 0, exp: "حدث مكتمل في الماضي: didn't buy." },
    { tag: "U2_G", qNum: 4, question: "04 At 8 PM yesterday, we ـــــــ dinner.", options: ["A were having", "B had", "C have", "D was having"], correct: 0, exp: "تحديد وقت محدد في الماضي (الساعة 8 أمس): ماضي مستمر were having." },
    { tag: "U2_G", qNum: 5, question: "05 I ـــــــ my keys while I was running in the park.", options: ["A dropped", "B was dropping", "C drop", "D had dropped"], correct: 0, exp: "حدث قاطع مفاجئ في الماضي البسيط: dropped." },
    { tag: "U2_G", qNum: 6, question: "06 She ـــــــ to Spain twice last summer.", options: ["A traveled", "B was traveling", "C travels", "D is traveling"], correct: 0, exp: "ماضي بسيط لحدث اكتمل في الماضي: traveled." },
    { tag: "U2_G", qNum: 7, question: "07 We ـــــــ any noise during the test.", options: ["A didn't make", "B wasn't making", "C weren't making", "D don't make"], correct: 0, exp: "ماضي بسيط منفي: didn't make." },
    { tag: "U2_G", qNum: 8, question: "08 ـــــــ a suit when you saw him at the conference?", options: ["A Was he wearing", "B Did he wear", "C Is he wearing", "D Were he wearing"], correct: 0, exp: "حدث كان مستمراً لحظة رؤيته: Was he wearing." },
    { tag: "U2_G", qNum: 9, question: "09 Where ـــــــ your summer vacation last year?", options: ["A did you spend", "B were you spending", "C do you spend", "D did you spent"], correct: 0, exp: "سؤال عن حدث ماضي محدد: did you spend." },
    { tag: "U2_G", qNum: 10, question: "10 Who ـــــــ you to the party last Friday?", options: ["A invited", "B did invite", "C was inviting", "D invites"], correct: 0, exp: "سؤال عن الفاعل في الماضي: invited مباشر بدون did." },
    { tag: "U2_G", qNum: 11, question: "11 The electricity went out while I ـــــــ a movie.", options: ["A was watching", "B watched", "C am watching", "D watch"], correct: 0, exp: "حدث مستمر قطعه انقطاع الكهرباء: was watching." },
    { tag: "U2_G", qNum: 12, question: "12 She stood up and ـــــــ the room quietly.", options: ["A left", "B was leaving", "C leaves", "D had left"], correct: 0, exp: "أحداث متتالية في الماضي: left." },
    { tag: "U2_G", qNum: 13, question: "13 What ـــــــ to your car yesterday?", options: ["A happened", "B did happen", "C was happening", "D happens"], correct: 0, exp: "سؤال عن الفاعل: happened." },
    { tag: "U2_G", qNum: 14, question: "14 He was driving fast ـــــــ he was running late.", options: ["A because", "B although", "C so", "D but"], correct: 0, exp: "السبب: because." },
    { tag: "U2_G", qNum: 15, question: "15 ـــــــ it was raining heavily, they went for a walk.", options: ["A Although", "B Because", "C So", "D But"], correct: 0, exp: "بالرغم من (تناقض): Although." },
    { tag: "U2_G", qNum: 16, question: "16 The food was delicious, ـــــــ we ate everything.", options: ["A so", "B because", "C although", "D but"], correct: 0, exp: "النتيجة: so." },
    { tag: "U2_G", qNum: 17, question: "17 She studied hard for the test, ـــــــ she didn't pass.", options: ["A but", "B so", "C because", "D although"], correct: 0, exp: "تناقض بين جملتين: but." },
    { tag: "U2_G", qNum: 18, question: "18 I missed the bus ـــــــ I overslept this morning.", options: ["A because", "B so", "C although", "D but"], correct: 0, exp: "توضيح السبب: because." },
    { tag: "U2_G", qNum: 19, question: "19 It was cold, ـــــــ he put on a jacket.", options: ["A so", "B because", "C although", "D but"], correct: 0, exp: "النتيجة: so." },
    { tag: "U2_G", qNum: 20, question: "20 ـــــــ he is very rich, he is not happy.", options: ["A Although", "B Because", "C So", "D But"], correct: 0, exp: "تناقض بداية الجملة: Although." },
    { tag: "U2_V", qNum: 1, question: "01 We decided to ـــــــ a table at the restaurant in advance.", options: ["A book", "B rent", "C hire", "D spend"], correct: 0, exp: "يحجز طاولة/مكان book." },
    { tag: "U2_V", qNum: 2, question: "02 They want to ـــــــ a car during their stay in Europe.", options: ["A rent", "B book", "C buy", "D spend"], correct: 0, exp: "يشتروا/يستأجروا سيارة rent." },
    { tag: "U2_V", qNum: 3, question: "03 I love to ـــــــ photos of historic places.", options: ["A take", "B make", "C do", "D spend"], correct: 0, exp: "يلتقط صور take photos." },
    { tag: "U2_V", qNum: 4, question: "04 We spent our vacation ـــــــ abroad last summer.", options: ["A going", "B staying", "C doing", "D visiting"], correct: 0, exp: "يسافر للخارج go abroad." },
    { tag: "U2_V", qNum: 5, question: "05 Did you ـــــــ a good time at the party yesterday?", options: ["A have", "B take", "C make", "D spend"], correct: 0, exp: "يقضي وقتاً طيباً have a good time." },
    { tag: "U2_V", qNum: 6, question: "06 He likes to ـــــــ walking in the mountains.", options: ["A go", "B do", "C make", "D have"], correct: 0, exp: "يذهب للمشي go walking." },
    { tag: "U2_V", qNum: 7, question: "07 The weather was terrible; it was cold and ـــــــ.", options: ["A windy", "B sunny", "C clear", "D warm"], correct: 0, exp: "طقس شديد الرياح windy." },
    { tag: "U2_V", qNum: 8, question: "08 The resort was extremely ـــــــ with tourists.", options: ["A crowded", "B empty", "C quiet", "D dirty"], correct: 0, exp: "مزدحم crowded." },
    { tag: "U2_V", qNum: 9, question: "09 The bed in the hotel was very ـــــــ. I slept well.", options: ["A comfortable", "B uncomfortable", "C noisy", "D crowded"], correct: 0, exp: "مريح comfortable." },
    { tag: "U2_V", qNum: 10, question: "10 We bought some nice ـــــــ to remember our trip.", options: ["A souvenirs", "B gifts", "C luggage", "D passports"], correct: 0, exp: "تذكارات رحلة souvenirs." },
    { tag: "U2_V", qNum: 11, question: "11 She likes to ـــــــ time with her family on weekends.", options: ["A spend", "B pay", "C waste", "D do"], correct: 0, exp: "يقضي وقت spend time." },
    { tag: "U2_V", qNum: 12, question: "12 They arrived ـــــــ the airport two hours early.", options: ["A at", "B in", "C on", "D to"], correct: 0, exp: "يصل للمطار/موقع محدد at the airport." },
    { tag: "U2_V", qNum: 13, question: "13 We went on vacation ـــــــ night.", options: ["A at", "B in", "C on", "D for"], correct: 0, exp: "في الليل at night." },
    { tag: "U2_V", qNum: 14, question: "14 He was born ـــــــ 1998.", options: ["A in", "B at", "C on", "D for"], correct: 0, exp: "السنوات تأخذ in." },
    { tag: "U2_V", qNum: 15, question: "15 I will see you ـــــــ Monday morning.", options: ["A on", "B in", "C at", "D for"], correct: 0, exp: "أيام الأسبوع تأخذ on." },
    { tag: "U2_V", qNum: 16, question: "16 The picture is hanging ـــــــ the wall.", options: ["A on", "B in", "C at", "D under"], correct: 0, exp: "على الحائط on." },
    { tag: "U2_V", qNum: 17, question: "17 She is waiting ـــــــ the bus stop.", options: ["A at", "B in", "C on", "D for"], correct: 0, exp: "في محطة الأتوبيس at." },
    { tag: "U2_V", qNum: 18, question: "18 They stayed ـــــــ a small town near the river.", options: ["A in", "B at", "C on", "D to"], correct: 0, exp: "في بلدة صغيرة in." },
    { tag: "U2_V", qNum: 19, question: "19 We met ـــــــ a party last week.", options: ["A at", "B in", "C on", "D for"], correct: 0, exp: "في حفلة at a party." },
    { tag: "U2_V", qNum: 20, question: "20 Don't forget to look ـــــــ the window to see the view.", options: ["A out of", "B on", "C in", "D at"], correct: 0, exp: "ينظر للخارج من الشباك look out of." },
    { tag: "U3_G", qNum: 1, question: "01 Choose the correct sentence order.", options: ["A I'm meeting my doctor tomorrow afternoon.", "B I meet my doctor tomorrow afternoon.", "C I will meet my doctor tomorrow afternoon.", "D I meeting my doctor tomorrow afternoon."], correct: 0, exp: "ترتيب مستقبلي محدد: مضارع مستمر I'm meeting." },
    { tag: "U3_G", qNum: 2, question: "02 Choose the correct sentence order.", options: ["A We aren't flying to London next Monday.", "B We don't fly to London next Monday.", "C We not flying to London next Monday.", "D We aren't fly to London next Monday."], correct: 0, exp: "نفي ترتيب مستقبلي: We aren't flying." },
    { tag: "U3_G", qNum: 3, question: "03 Choose the correct sentence order.", options: ["A She's visiting her grandparents this weekend.", "B She visits her grandparents this weekend.", "C She visiting her grandparents this weekend.", "D She's visit her grandparents this weekend."], correct: 0, exp: "ترتيب مستقبلي: She's visiting." },
    { tag: "U3_G", qNum: 4, question: "04 Choose the correct question order.", options: ["A What time are you leaving for the station?", "B What time you are leaving for the station?", "C What time do you leaving for the station?", "D What time are you leave for the station?"], correct: 0, exp: "سؤال مضارع مستمر للمستقبل: What time are you leaving...?" },
    { tag: "U3_G", qNum: 5, question: "05 Choose the correct sentence order.", options: ["A He isn't playing tennis tonight.", "B He doesn't play tennis tonight.", "C He not playing tennis tonight.", "D He isn't play tennis tonight."], correct: 0, exp: "نفي مستقبلي مؤكد: He isn't playing." },
    { tag: "U3_G", qNum: 6, question: "06 Choose the correct question order.", options: ["A Where are they staying in Rome?", "B Where they are staying in Rome?", "C Where do they staying in Rome?", "D Where are they stay in Rome?"], correct: 0, exp: "سؤال عن خطة/ترتيب: Where are they staying...?" },
    { tag: "U3_G", qNum: 7, question: "07 A barista is a person ـــــــ makes and serves coffee.", options: ["A who", "B where", "C which", "D when"], correct: 0, exp: "ضمير موصول للشخص العاقل: who." },
    { tag: "U3_G", qNum: 8, question: "08 A library is a place ـــــــ you can borrow books.", options: ["A where", "B that", "C who", "D when"], correct: 0, exp: "ضمير موصول للمكان: where." },
    { tag: "U3_G", qNum: 9, question: "09 A laptop is something ـــــــ you use for working remotely.", options: ["A that", "B where", "C who", "D when"], correct: 0, exp: "ضمير موصول للشيء غير العاقل: that." },
    { tag: "U3_G", qNum: 10, question: "10 The teacher ـــــــ taught us last year has moved away.", options: ["A who / that", "B where", "C that / where", "D which / where"], correct: 0, exp: "عاقل: who أو that." },
    { tag: "U3_G", qNum: 11, question: "11 That is the hotel ـــــــ we stayed during our trip.", options: ["A where", "B who", "C that", "D when"], correct: 0, exp: "مكان الإقامة: where." },
    { tag: "U3_G", qNum: 12, question: "12 I bought a camera ـــــــ takes high-quality pictures.", options: ["A that / which", "B where", "C who", "D when"], correct: 0, exp: "غير عاقل: that أو which." },
    { tag: "U3_G", qNum: 13, question: "13 Look at those dark clouds! It ـــــــ rain.", options: ["A is going to", "B will going to", "C is going", "D going to"], correct: 0, exp: "تنبؤ بدليل في المستقبل: is going to." },
    { tag: "U3_G", qNum: 14, question: "14 What ـــــــ study at university next year?", options: ["A are you going to", "B is you going to", "C do you going to", "D are you going"], correct: 0, exp: "سؤال عن النية في المستقبل: are you going to." },
    { tag: "U3_G", qNum: 15, question: "15 We ـــــــ buy a new house because we don't have enough money.", options: ["A aren't going to", "B not going to", "C won't going to", "D aren't going"], correct: 0, exp: "نفي الخطة المستقبلية: aren't going to." },
    { tag: "U3_G", qNum: 16, question: "16 I think he ـــــــ win the match today.", options: ["A is going to", "B are going to", "C going to", "D is going"], correct: 0, exp: "توقع/نية مستقبلية: is going to." },
    { tag: "U3_G", qNum: 17, question: "17 Be careful! You ـــــــ spill your coffee.", options: ["A are going to", "B going to", "C are going", "D will going to"], correct: 0, exp: "تحذير من حدث قريب الوقوع: are going to." },
    { tag: "U3_G", qNum: 18, question: "18 I'm tired. I ـــــــ stay up late tonight.", options: ["A 'm not going to", "B not going to", "C am not going", "D won't going to"], correct: 0, exp: "نية نفي الفعل: I'm not going to." },
    { tag: "U3_G", qNum: 19, question: "19 She ـــــــ start her new job next month.", options: ["A is going to", "B are going to", "C going to", "D is going"], correct: 0, exp: "خطة مؤكدة للفاعل المفرد: is going to." },
    { tag: "U3_G", qNum: 20, question: "20 How ـــــــ travel to your office tomorrow?", options: ["A are you going to", "B is you going to", "C do you going to", "D you are going to"], correct: 0, exp: "تركيب سؤال النية: are you going to." },
    { tag: "U3_V", qNum: 1, question: "01 You need to show your boarding ـــــــ before getting on the plane.", options: ["A pass", "B gate", "C ticket", "D card"], correct: 0, exp: "بطاقة الصعود للائرة boarding pass." },
    { tag: "U3_V", qNum: 2, question: "02 Please put your bags on the luggage ـــــــ.", options: ["A scale", "B passenger", "C flight", "D control"], correct: 0, exp: "ميزان الأمتعة luggage scale." },
    { tag: "U3_V", qNum: 3, question: "03 You must check in your ـــــــ at the desk.", options: ["A baggage", "B ticket", "C terminal", "D seat"], correct: 0, exp: "حقائب السفر baggage." },
    { tag: "U3_V", qNum: 4, question: "04 Keep your passport in a safe ـــــــ.", options: ["A place", "B kind", "C item", "D thing"], correct: 0, exp: "مكان آمن place." },
    { tag: "U3_V", qNum: 5, question: "05 An apartment is a ـــــــ of accommodation.", options: ["A kind", "B place", "C detail", "D format"], correct: 0, exp: "نوع من الإقامة kind of accommodation." },
    { tag: "U3_V", qNum: 6, question: "06 Fast is the ـــــــ of slow.", options: ["A opposite", "B same", "C similar", "D example"], correct: 0, exp: "العكس opposite." },
    { tag: "U3_V", qNum: 7, question: "07 There are many fruit options; ـــــــ, apples, bananas, and oranges.", options: ["A for example", "B such like", "C opposite", "D kind"], correct: 0, exp: "على سبيل المثال for example." },
    { tag: "U3_V", qNum: 8, question: "08 A key is ـــــــ you use to unlock a door.", options: ["A something", "B someone", "C somewhere", "D somehow"], correct: 0, exp: "شيء ما something." },
    { tag: "U3_V", qNum: 9, question: "09 A hospital is a ـــــــ where doctors care for sick people.", options: ["A place", "B kind", "C thing", "D opposite"], correct: 0, exp: "مكان place." },
    { tag: "U3_V", qNum: 10, question: "10 A dentist is ـــــــ who looks after your teeth.", options: ["A someone", "B something", "C somewhere", "D anything"], correct: 0, exp: "شخص ما someone." },
    { tag: "U3_V", qNum: 11, question: "11 Huge and massive have a ـــــــ meaning.", options: ["A similar", "B opposite", "C kind", "D different"], correct: 0, exp: "معنى متشابه similar." },
    { tag: "U3_V", qNum: 12, question: "12 Are you listening ـــــــ what I am saying?", options: ["A to", "B for", "C at", "D about"], correct: 0, exp: "يستمع إلى listen to." },
    { tag: "U3_V", qNum: 13, question: "13 Don't worry ـــــــ the results, you did your best.", options: ["A about", "B for", "C with", "D to"], correct: 0, exp: "يقلق بشأن worry about." },
    { tag: "U3_V", qNum: 14, question: "14 We are waiting ـــــــ the manager to arrive.", options: ["A for", "B to", "C on", "D about"], correct: 0, exp: "ينتظر شخصاً wait for." },
    { tag: "U3_V", qNum: 15, question: "15 She arrived ـــــــ London yesterday morning.", options: ["A in", "B at", "C on", "D to"], correct: 0, exp: "يصل إلى دولة/مدينة كبيرة arrive in." },
    { tag: "U3_V", qNum: 16, question: "16 He spent a lot of money ـــــــ his new car.", options: ["A on", "B for", "C about", "D in"], correct: 0, exp: "ينفق على spend on." },
    { tag: "U3_V", qNum: 17, question: "17 I need to speak ـــــــ my boss about the promotion.", options: ["A to", "B for", "C on", "D in"], correct: 0, exp: "يتحدث إلى speak to." },
    { tag: "U3_V", qNum: 18, question: "18 I agree ـــــــ you completely on this idea.", options: ["A with", "B for", "C about", "D to"], correct: 0, exp: "يتفق مع agree with." },
    { tag: "U3_V", qNum: 19, question: "19 She fell in love ـــــــ painting during college.", options: ["A with", "B for", "C in", "D about"], correct: 0, exp: "وقع في حب الشيء fall in love with." },
    { tag: "U3_V", qNum: 20, question: "20 Who paid ـــــــ the tickets?", options: ["A for", "B on", "C to", "D with"], correct: 0, exp: "يدفع مقابل الشيء pay for." } ],
listening: {
A: [
   
{ qNum: 1, tag: "P1", partName: "Part 1 - Locations - Where are people? (نموذج A)", audioSrc: audioPart1_08, speaker: "1", startTime: 4, endTime: 25, question: "1. Conversation 1: Where are the people?", options: ["A) at the movies", "B) in class", "C) in a restaurant", "D) on a train"], correct: 0 },
{ qNum: 2, tag: "P1", partName: "Part 1 - Locations - Where are people? (نموذج A)", audioSrc: audioPart1_08, speaker: "2", startTime: 26, endTime: 48, question: "2. Conversation 2: Where are the people?", options: ["A) at home", "B) on a train", "C) in a shop", "D) at work"], correct: 2 },
{ qNum: 3, tag: "P1", partName: "Part 1 - Locations - Where are people? (نموذج A)", audioSrc: audioPart1_08, speaker: "3", startTime: 49, endTime: 74, question: "3. Conversation 3: Where are the people?", options: ["A) in a restaurant", "B) at work", "C) in a shop", "D) on a train"], correct: 3 },
{ qNum: 4, tag: "P1", partName: "Part 1 - Locations - Where are people? (نموذج A)", audioSrc: audioPart1_08, speaker: "4", startTime: 75, endTime: 94, question: "4. Conversation 4: Where are the people?", options: ["A) at home", "B) on a train", "C) at work", "D) in class"], correct: 3 },
{ qNum: 5, tag: "P1", partName: "Part 1 - Locations - Where are people? (نموذج A)", audioSrc: audioPart1_08, speaker: "5", startTime: 95, endTime: 124, question: "5. Conversation 5: Where are the people?", options: ["A) in a restaurant", "B) on a train", "C) at the movies", "D) at work"], correct: 3 },
{ qNum: 6, tag: "P2", partName: "Part 2 - Life Story - Ages (نموذج A)", audioSrc: audioPart2_08, speaker: "6", startTime: 4, endTime: 23, question: "6. At the age of 14, what happened?", options: ["A) she went to Italy with her class at school", "B) she was unhappy because her brother was leaving", "C) she stayed at a luxurious hotel in Paris", "D) she spent her free time on the beach in Australia"], correct: 0 },
{ qNum: 7, tag: "P2", partName: "Part 2 - Life Story - Ages (نموذج A)", audioSrc: audioPart2_08, speaker: "7", startTime: 24, endTime: 45, question: "7. At the age of 15, what happened?", options: ["A) she was unhappy because her brother was leaving", "B) she had a fantastic vacation in Spain with her family", "C) she spent her free time on the beach in Australia", "D) she stayed at a luxurious hotel in Paris"], correct: 1 },
{ qNum: 8, tag: "P2", partName: "Part 2 - Life Story - Ages (نموذج A)", audioSrc: audioPart2_08, speaker: "8", startTime: 46, endTime: 65, question: "8. At the age of 24, what happened?", options: ["A) she was unhappy because her brother was leaving", "B) she went to Italy with her class at school", "C) she spent her free time on the beach in Australia", "D) she stayed at a luxurious hotel in Paris"], correct: 2 },
{ qNum: 9, tag: "P2", partName: "Part 2 - Life Story - Ages (نموذج A)", audioSrc: audioPart2_08, speaker: "9", startTime: 67, endTime: 81, question: "9. At the age of 25, what happened?", options: ["A) she stayed at a luxurious hotel in Paris", "B) she spent her free time on the beach in Australia", "C) she went to Italy with her class at school", "D) she was unhappy because her brother was leaving"], correct: 3 },
{ qNum: 10, tag: "P2", partName: "Part 2 - Life Story - Ages (نموذج A)", audioSrc: audioPart2_08, speaker: "10", startTime: 82, endTime: 102, question: "10. At the age of 28, what happened?", options: ["A) she stayed at a luxurious hotel in Paris", "B) she had a fantastic vacation in Spain with her family", "C) she went to Italy with her class at school", "D) she spent her free time on the beach in Australia"], correct: 0 },
{ qNum: 11, tag: "P3", partName: "Part 3 - Plans - What are they planning? (نموذج A)", audioSrc: audioPart3_08, speaker: "11", startTime: 4, endTime: 18, question: "11. Conversation 1: What are they planning to do?", options: ["A) to go to a conference", "B) to cook dinner", "C) to teach English", "D) to go to the airport"], correct: 3 },
{ qNum: 12, tag: "P3", partName: "Part 3 - Plans - What are they planning? (نموذج A)", audioSrc: audioPart3_08, speaker: "12", startTime: 19, endTime: 34, question: "12. Conversation 2: What are they planning to do?", options: ["A) to cook dinner", "B) to go biking", "C) to go to a conference", "D) to go to the airport"], correct: 2 },
{ qNum: 13, tag: "P3", partName: "Part 3 - Plans - What are they planning? (نموذج A)", audioSrc: audioPart3_08, speaker: "13", startTime: 35, endTime: 49, question: "13. Conversation 3: What are they planning to do?", options: ["A) to go to the airport", "B) to teach English", "C) to go biking", "D) to cook dinner"], correct: 1 },
{ qNum: 14, tag: "P3", partName: "Part 3 - Plans - What are they planning? (نموذج A)", audioSrc: audioPart3_08, speaker: "14", startTime: 50, endTime: 70, question: "14. Conversation 4: What are they planning to do?", options: ["A) to teach English", "B) to go biking", "C) to go to the airport", "D) to cook dinner"], correct: 1 },
{ qNum: 15, tag: "P3", partName: "Part 3 - Plans - What are they planning? (نموذج A)", audioSrc: audioPart3_08, speaker: "15", startTime: 71, endTime: 89, question: "15. Conversation 5: What are they planning to do?", options: ["A) to go biking", "B) to go to a conference", "C) to cook dinner", "D) to go to the airport"], correct: 2 },],


}};


// Compatibility for both "8" and "08"
window.levelsData["08"] = window.levelsData["8"];
levelsData["8"] = window.levelsData["8"];
levelsData["08"] = window.levelsData["8"];

