import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ylfaprsqkzcgzeizpmsc.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'sb_secret_v0ck2wz6f7jH5_DIHOTR5Q_M3SPwBPO'
);

const ALL_ITEMS = [
  // БЛЮДА С МАНГАЛА
  {name:'Баранина корейка',description:'Нежная баранья корейка на мангале',price:800,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:true,weight:'200г',sort_order:10},
  {name:'Баранина мякоть',description:'Сочная мякоть баранины на мангале',price:750,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:11},
  {name:'Баранина яблочка',description:'Баранья яблочка на углях',price:750,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:12},
  {name:'Баранина рёбрышки',description:'Сочные бараньи рёбрышки на мангале',price:650,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:13},
  {name:'Люля-кебаб из баранины',description:'Классический люля-кебаб из рублёной баранины',price:600,image_url:'/images/mangal.jpg',category:'mangal',type:'food',is_featured:true,weight:'200г',sort_order:14},
  {name:'Люля по-турецки',description:'Люля-кебаб по турецкому рецепту с восточными специями',price:700,image_url:'/images/mangal.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:15},
  {name:'Говядина баранья стейк',description:'Стейк из говядины на мангале с соусом',price:800,image_url:'/images/dish-3.jpg',category:'mangal',type:'food',is_featured:false,weight:'250г',sort_order:16},
  {name:'Говядина корейка бастурма',description:'Говяжья корейка бастурма — ароматная и сочная',price:1000,image_url:'/images/dish-3.jpg',category:'mangal',type:'food',is_featured:true,weight:'300г',sort_order:17},
  {name:'Говядина люля',description:'Люля-кебаб из рублёной говядины',price:600,image_url:'/images/mangal.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:18},
  {name:'Свиная шейка',description:'Сочная свиная шейка на мангале, маринованная в луке',price:650,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:true,weight:'200г',sort_order:19},
  {name:'Свиные рёбрышки',description:'Хрустящие свиные рёбрышки на углях',price:600,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:20},
  {name:'Свинина люля',description:'Люля-кебаб из свинины с зеленью',price:550,image_url:'/images/mangal.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:21},
  {name:'Куриное бедро',description:'Сочное куриное бедро на мангале',price:400,image_url:'/images/dish-1.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:22},
  {name:'Куриное филе',description:'Нежное куриное филе в маринаде',price:450,image_url:'/images/dish-1.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:23},
  {name:'Куриный люля',description:'Люля-кебаб из куриного фарша с зеленью',price:500,image_url:'/images/mangal.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:24},
  {name:'Перепёлка на мангале',description:'Целая перепёлка, запечённая на мангале',price:350,image_url:'/images/dish-1.jpg',category:'mangal',type:'food',is_featured:true,weight:'1шт',sort_order:25},
  {name:'Шашлык из индейки',description:'Нежное филе индейки на шампуре',price:700,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:26},
  {name:'Шашлык из гуся',description:'Шашлык из гуся — редкий деликатес',price:600,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:27},
  {name:'Шашлык из утки',description:'Сочный шашлык из утки на углях',price:600,image_url:'/images/shashlik.jpg',category:'mangal',type:'food',is_featured:false,weight:'200г',sort_order:28},
  // ШАШЛЫК НА КОСТЯХ
  {name:'Баранина 1кг',description:'Шашлык из баранины на костях, 1кг',price:1800,image_url:'/images/shashlik.jpg',category:'shashlik_bones',type:'food',is_featured:true,weight:'1кг',sort_order:30},
  {name:'Ассорти из баранины',description:'Корейка, рёбрышки, мякоть, яблочко, люля, печень, перец, баклажан',price:5000,image_url:'/images/shashlik.jpg',category:'shashlik_bones',type:'food',is_featured:true,weight:'1кг',sort_order:31},
  {name:'Ассорти из курицы',description:'Бедро, крылышки, филе, люля, картошка',price:4000,image_url:'/images/dish-1.jpg',category:'shashlik_bones',type:'food',is_featured:true,weight:'1кг',sort_order:32},
  {name:'Ассорти микс',description:'Баранина корейка, баранина люля, говядина бастурма, куриное филе, куриные бёдра, свиная шея, картошка, грибы, помидор, перец, баклажан',price:4500,image_url:'/images/shashlik.jpg',category:'shashlik_bones',type:'food',is_featured:true,weight:'1кг',sort_order:33},
  {name:'Шашлык баранина печень',description:'Баранья печень на мангале',price:450,image_url:'/images/shashlik.jpg',category:'shashlik_bones',type:'food',is_featured:false,weight:'200г',sort_order:34},
  {name:'Шашлык баранина почка',description:'Баранья почка на мангале',price:400,image_url:'/images/shashlik.jpg',category:'shashlik_bones',type:'food',is_featured:false,weight:'200г',sort_order:35},
  {name:'Шашлык баранина сердце',description:'Баранье сердце на мангале',price:350,image_url:'/images/shashlik.jpg',category:'shashlik_bones',type:'food',is_featured:false,weight:'200г',sort_order:36},
  // ОВОЩИ НА МАНГАЛЕ
  {name:'Молодая картошка',description:'Молодая картошка на мангале',price:250,image_url:'/images/garnir.jpg',category:'vegetables_mangal',type:'food',is_featured:false,weight:'200г',sort_order:40},
  {name:'Баклажан',description:'Баклажан на мангале',price:200,image_url:'/images/vegetables.jpg',category:'vegetables_mangal',type:'food',is_featured:false,weight:'1шт',sort_order:41},
  {name:'Перец на мангале',description:'Сочный перец на мангале',price:150,image_url:'/images/vegetables.jpg',category:'vegetables_mangal',type:'food',is_featured:false,weight:'1шт',sort_order:42},
  {name:'Помидор на мангале',description:'Сочный помидор на мангале',price:150,image_url:'/images/vegetables.jpg',category:'vegetables_mangal',type:'food',is_featured:false,weight:'1шт',sort_order:43},
  {name:'Грибы на мангале',description:'Ароматные грибы на мангале',price:300,image_url:'/images/vegetables.jpg',category:'vegetables_mangal',type:'food',is_featured:false,weight:'200г',sort_order:44},
  // РЫБА НА МАНГАЛЕ
  {name:'Дорадо',description:'Дорадо на мангале с лимоном',price:1000,image_url:'/images/fish.jpg',category:'fish_mangal',type:'food',is_featured:true,weight:'1шт',sort_order:50},
  {name:'Сибас',description:'Сибас на мангале',price:900,image_url:'/images/fish.jpg',category:'fish_mangal',type:'food',is_featured:true,weight:'1шт',sort_order:51},
  {name:'Форель',description:'Форель на мангале',price:900,image_url:'/images/fish.jpg',category:'fish_mangal',type:'food',is_featured:false,weight:'1шт',sort_order:52},
  {name:'Сёмга на мангале',description:'Сёмга на мангале — нежная и ароматная',price:1100,image_url:'/images/fish.jpg',category:'fish_mangal',type:'food',is_featured:true,weight:'1шт',sort_order:53},
  {name:'Осетрина',description:'Царская осетрина на мангале',price:1400,image_url:'/images/fish.jpg',category:'fish_mangal',type:'food',is_featured:true,weight:'1шт',sort_order:54},
  {name:'Карп',description:'Карп на мангале',price:550,image_url:'/images/fish.jpg',category:'fish_mangal',type:'food',is_featured:false,weight:'1шт',sort_order:55},
  // САДЖ
  {name:'Садж баранина',description:'Сочная баранина в садже с овощами',price:3000,image_url:'/images/sadj.jpg',category:'sadj',type:'food',is_featured:true,weight:'1кг',sort_order:60},
  {name:'Садж говядина',description:'Нежная говядина в садже',price:2500,image_url:'/images/sadj.jpg',category:'sadj',type:'food',is_featured:false,weight:'1кг',sort_order:61},
  {name:'Садж свинина',description:'Сочная свинина в садже',price:2500,image_url:'/images/sadj.jpg',category:'sadj',type:'food',is_featured:false,weight:'1кг',sort_order:62},
  {name:'Садж куриный',description:'Нежная курица в садже с овощами',price:2000,image_url:'/images/sadj.jpg',category:'sadj',type:'food',is_featured:false,weight:'1кг',sort_order:63},
  // СУПЫ
  {name:'Борщ',description:'Традиционный борщ со сметаной',price:480,image_url:'/images/soup.jpg',category:'soups',type:'food',is_featured:false,weight:'350г',sort_order:70},
  {name:'Харчо',description:'Острый грузинский суп с рисом',price:500,image_url:'/images/soup.jpg',category:'soups',type:'food',is_featured:true,weight:'350г',sort_order:71},
  {name:'Лапша куриная',description:'Домашняя куриная лапша с овощами',price:400,image_url:'/images/soup.jpg',category:'soups',type:'food',is_featured:false,weight:'350г',sort_order:72},
  {name:'Хаш говядина',description:'Наваристый хаш из говядины',price:550,image_url:'/images/soup.jpg',category:'soups',type:'food',is_featured:false,weight:'350г',sort_order:73},
  {name:'Хаш баранина',description:'Традиционный хаш из баранины',price:600,image_url:'/images/soup.jpg',category:'soups',type:'food',is_featured:false,weight:'350г',sort_order:74},
  {name:'Пити',description:'Азербайджанский суп пити с бараниной и нутом',price:550,image_url:'/images/soup.jpg',category:'soups',type:'food',is_featured:true,weight:'350г',sort_order:75},
  // ГОРЯЧИЕ БЛЮДА
  {name:'Баранина по-бакински',description:'Баранина с овощами по бакинскому рецепту',price:1000,image_url:'/images/grill.jpg',category:'hot',type:'food',is_featured:true,weight:'400г',sort_order:80},
  {name:'Цыплёнок табака',description:'Цыплёнок табака по-грузински, хрустящая корочка',price:650,image_url:'/images/dish-1.jpg',category:'hot',type:'food',is_featured:true,weight:'1шт',sort_order:81},
  {name:'Баранина по-домашнему',description:'Баранина с овощами',price:650,image_url:'/images/grill.jpg',category:'hot',type:'food',is_featured:false,weight:'300г',sort_order:82},
  {name:'Свинина по-домашнему',description:'Свинина с овощами',price:550,image_url:'/images/grill.jpg',category:'hot',type:'food',is_featured:false,weight:'300г',sort_order:83},
  {name:'Курица по-домашнему',description:'Курица с овощами',price:520,image_url:'/images/dish-1.jpg',category:'hot',type:'food',is_featured:false,weight:'300г',sort_order:84},
  {name:'Долма',description:'Виноградные листья с мясным фаршем в томатном соусе',price:550,image_url:'/images/dish-4.jpg',category:'hot',type:'food',is_featured:true,weight:'200г',sort_order:85},
  {name:'Блинчики с мясом',description:'Домашние блинчики с мясной начинкой',price:325,image_url:'/images/dish-4.jpg',category:'hot',type:'food',is_featured:false,weight:'2шт',sort_order:86},
  {name:'Ассорти жареных закусок',description:'Ассорти жареных закусок',price:980,image_url:'/images/zakuski.jpg',category:'hot',type:'food',is_featured:false,weight:'250г',sort_order:87},
  {name:'Мини пельмени жареные',description:'Мини пельмени во фритюре',price:480,image_url:'/images/dish-4.jpg',category:'hot',type:'food',is_featured:false,weight:'120г',sort_order:88},
  // ШАХ-ПЛОВ
  {name:'Шах-плов баранина',description:'Торжественный шах-плов с бараниной',price:3000,image_url:'/images/plov.jpg',category:'plov',type:'food',is_featured:true,weight:'1кг',sort_order:90},
  {name:'Шах-плов говядина',description:'Торжественный шах-плов с говядиной',price:2500,image_url:'/images/plov.jpg',category:'plov',type:'food',is_featured:false,weight:'1кг',sort_order:91},
  {name:'Шах-плов курица',description:'Торжественный шах-плов с курицей',price:2000,image_url:'/images/plov.jpg',category:'plov',type:'food',is_featured:false,weight:'1кг',sort_order:92},
  // ПАСТА
  {name:'Карбонара',description:'Паста карбонара с беконом и сливочным соусом',price:650,image_url:'/images/dish-4.jpg',category:'pasta',type:'food',is_featured:true,weight:'300г',sort_order:95},
  {name:'Фарфарелли',description:'Паста фарфарелли с авторским соусом',price:600,image_url:'/images/dish-4.jpg',category:'pasta',type:'food',is_featured:false,weight:'300г',sort_order:96},
  // ГАРНИРЫ
  {name:'Картофель по-домашнему',description:'Жареный картофель по-домашнему с луком',price:280,image_url:'/images/garnir.jpg',category:'sides',type:'food',is_featured:false,weight:'200г',sort_order:100},
  {name:'Картофель фри',description:'Хрустящий картофель фри с соусом',price:300,image_url:'/images/garnir.jpg',category:'sides',type:'food',is_featured:false,weight:'200г',sort_order:101},
  {name:'Картофель айдахо',description:'Картофель айдахо с приправами',price:250,image_url:'/images/garnir.jpg',category:'sides',type:'food',is_featured:false,weight:'150г',sort_order:102},
  {name:'Рис отварной',description:'Рассыпчатый отварной рис',price:230,image_url:'/images/plov.jpg',category:'sides',type:'food',is_featured:false,weight:'200г',sort_order:103},
  {name:'Гречка',description:'Рассыпчатая гречка с маслом',price:230,image_url:'/images/garnir.jpg',category:'sides',type:'food',is_featured:false,weight:'200г',sort_order:104},
  {name:'Наггетсы',description:'Куриные наггетсы, 6 штук',price:210,image_url:'/images/dish-1.jpg',category:'sides',type:'food',is_featured:false,weight:'6шт',sort_order:105},
  // ЗАКУСКИ К ПИВУ
  {name:'Кольца кальмара',description:'Хрустящие кольца кальмара во фритюре',price:400,image_url:'/images/zakuski.jpg',category:'beer_snacks',type:'food',is_featured:true,weight:'100г',sort_order:110},
  {name:'Куриные кольца',description:'Куриные кольца во фритюре',price:300,image_url:'/images/dish-1.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'100г',sort_order:111},
  {name:'Креветки жареные',description:'Жареные креветки, 12 штук',price:620,image_url:'/images/fish.jpg',category:'beer_snacks',type:'food',is_featured:true,weight:'12шт',sort_order:112},
  {name:'Чечил жареный',description:'Жареный сыр чечил',price:300,image_url:'/images/zakuski.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'100г',sort_order:113},
  {name:'Хачапури по-мегрельски',description:'Хачапури по-мегрельски с сыром',price:550,image_url:'/images/dish-4.jpg',category:'beer_snacks',type:'food',is_featured:true,weight:'350г',sort_order:114},
  {name:'Хачапури по-аджарски',description:'Хачапури по-аджарски с яйцом',price:570,image_url:'/images/dish-4.jpg',category:'beer_snacks',type:'food',is_featured:true,weight:'350г',sort_order:115},
  {name:'Лепёшка',description:'Свежая лепёшка',price:100,image_url:'/images/mangal.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'1шт',sort_order:116},
  {name:'Лаваш тонкий',description:'Тонкий лаваш',price:80,image_url:'/images/mangal.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'1шт',sort_order:117},
  {name:'Довга 1л',description:'Довга — кисломолочный суп-напиток, 1 литр',price:720,image_url:'/images/drink.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'1л',sort_order:118},
  {name:'Довга 200мл',description:'Довга — кисломолочный суп-напиток, 200мл',price:215,image_url:'/images/drink.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'200мл',sort_order:119},
  {name:'Мацони',description:'Традиционный грузинский мацони',price:210,image_url:'/images/drink.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'200мл',sort_order:120},
  {name:'Пицца пепперони',description:'Пицца пепперони 30см',price:450,image_url:'/images/dish-4.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'30см',sort_order:121},
  {name:'Пицца маргарита',description:'Пицца маргарита 30см',price:420,image_url:'/images/dish-4.jpg',category:'beer_snacks',type:'food',is_featured:false,weight:'30см',sort_order:122},
  // СОУСЫ
  {name:'Аджика',description:'Острая домашняя аджика',price:100,image_url:'/images/vegetables.jpg',category:'sauces',type:'food',is_featured:false,weight:'80г',sort_order:130},
  {name:'Наршараб',description:'Гранатовый соус наршараб',price:100,image_url:'/images/vegetables.jpg',category:'sauces',type:'food',is_featured:false,weight:'80г',sort_order:131},
  {name:'Сметана',description:'Домашняя сметана',price:100,image_url:'/images/dish-2.jpg',category:'sauces',type:'food',is_featured:false,weight:'80г',sort_order:132},
  {name:'Тар-тар',description:'Сливочный соус тар-тар',price:100,image_url:'/images/dish-2.jpg',category:'sauces',type:'food',is_featured:false,weight:'80г',sort_order:133},
  {name:'Чесночный соус',description:'Ароматный чесночный соус',price:100,image_url:'/images/dish-2.jpg',category:'sauces',type:'food',is_featured:false,weight:'80г',sort_order:134},
  // ХОЛОДНЫЕ ЗАКУСКИ
  {name:'Бакинский букет',description:'Свежая овощная нарезка — ассорти свежих овощей',price:950,image_url:'/images/vegetables.jpg',category:'cold_appetizers',type:'food',is_featured:true,weight:'500г',sort_order:140},
  {name:'Зелень в ассортименте',description:'Свежая зелень: кинза, петрушка, укроп, рейхан',price:320,image_url:'/images/vegetables.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'100г',sort_order:141},
  {name:'Овощная нарезка',description:'Ассорти свежих овощей',price:450,image_url:'/images/vegetables.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'250г',sort_order:142},
  {name:'Мясное ассорти',description:'Ассорти мясных деликатесов',price:1250,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:true,weight:'300г',sort_order:143},
  {name:'Рыбное ассорти',description:'Ассорти рыбных деликатесов',price:1950,image_url:'/images/fish.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'250г',sort_order:144},
  {name:'Русский разносол',description:'Традиционная русская закуска',price:480,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'300г',sort_order:145},
  {name:'Ассорти Кавказа',description:'Кавказские деликатесы: сыры, овощи, зелень',price:720,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'250г',sort_order:146},
  {name:'Европейское ассорти',description:'Европейское ассорти',price:875,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'250г',sort_order:147},
  {name:'Рулетики из баклажанов',description:'Запечённые баклажаны с греческими орехами и чесноком',price:450,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:true,weight:'150г',sort_order:148},
  {name:'Вина в тарталетках',description:'Красная икра в хрустящих тарталетках',price:520,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'6шт',sort_order:149},
  {name:'Селёдка',description:'Нежная слабосолёная сельдь',price:410,image_url:'/images/fish.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'200г',sort_order:150},
  {name:'Сёмга слабосолёная',description:'Нежная слабосолёная сёмга',price:655,image_url:'/images/fish.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'100г',sort_order:151},
  {name:'Язык отварной',description:'Нежный отварной язык',price:375,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'100г',sort_order:152},
  {name:'Маслины/Оливки',description:'Маринованные маслины или оливки',price:275,image_url:'/images/vegetables.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'150г',sort_order:153},
  {name:'Лимон',description:'Свежий лимон, нарезанный',price:120,image_url:'/images/drink.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'80г',sort_order:154},
  {name:'Рулетики Филадельфия',description:'Рулетики с лососем Филадельфия',price:680,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'200г',sort_order:155},
  {name:'Сыр чанах',description:'Традиционный кавказский сыр чанах',price:385,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'100г',sort_order:156},
  {name:'Сыр чечил',description:'Традиционный кавказский сыр чечил',price:345,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'100г',sort_order:157},
  {name:'Сюзма Азербайджан',description:'Азербайджанский национальный сыр сюзма',price:385,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'100г',sort_order:158},
  {name:'Винная тарелка',description:'Ассорти сыров и фруктов к вину',price:950,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'350г',sort_order:159},
  {name:'Вишнёвый салат',description:'Лёгкий салат с вишней',price:500,image_url:'/images/salad.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'200г',sort_order:160},
  {name:'Пивная тарелка',description:'Ассорти закусок к пиву',price:750,image_url:'/images/zakuski.jpg',category:'cold_appetizers',type:'food',is_featured:false,weight:'250г',sort_order:161},
  // САЛАТЫ
  {name:'Столичный',description:'Классический салат столичный с курицей',price:450,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:170},
  {name:'Гнездо глухаря',description:'Оригинальный салат гнездо глухаря',price:480,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:171},
  {name:'Хрустящий баклажан',description:'Салат с хрустящим баклажаном',price:550,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:172},
  {name:'Мангаловый салат',description:'Свежий салат с мясом с мангала',price:425,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:true,weight:'200г',sort_order:173},
  {name:'Чобан салат',description:'Традиционный турецкий салат чобан',price:480,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'250г',sort_order:174},
  {name:'Цезарь куриный',description:'Классический цезарь с куриным филе',price:550,image_url:'/images/dish-2.jpg',category:'salads',type:'food',is_featured:true,weight:'230г',sort_order:175},
  {name:'Цезарь с сёмгой',description:'Классический цезарь с нежной сёмгой',price:670,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'230г',sort_order:176},
  {name:'Цезарь с креветками',description:'Классический цезарь с сочными креветками',price:630,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'230г',sort_order:177},
  {name:'Греческий салат',description:'Свежие овощи, оливки, фета с оливковым маслом',price:490,image_url:'/images/dish-2.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:178},
  {name:'Руккола с креветками',description:'Свежая руккола с морепродуктами и лимонной заправкой',price:590,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:179},
  {name:'Грибной',description:'Салат с грибами',price:500,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:180},
  {name:'Тиффани',description:'Лёгкий салат тиффани',price:350,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:181},
  {name:'С языком',description:'Салат с отварным языком',price:600,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'220г',sort_order:182},
  {name:'Острица',description:'Острый салат',price:550,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'250г',sort_order:183},
  {name:'Гурмэ',description:'Изысканный салат гурмэ',price:580,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'250г',sort_order:184},
  {name:'Селёдка под шубой',description:'Классическая селёдка под шубой',price:600,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:185},
  {name:'Морковь по-корейски',description:'Острая морковь по-корейски',price:480,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:186},
  {name:'Помидоры по-гречески',description:'Помидоры по-гречески с сыром',price:480,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'200г',sort_order:187},
  {name:'Тёплый салат',description:'Тёплый салат с мясом',price:800,image_url:'/images/salad.jpg',category:'salads',type:'food',is_featured:false,weight:'250г',sort_order:188},
  // НАПИТКИ
  {name:'Чай ассорти',description:'Огромный выбор чая',price:170,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'1000мл',sort_order:200},
  {name:'Кофе эспрессо',description:'Насыщенный эспрессо',price:170,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'50мл',sort_order:201},
  {name:'Американо',description:'Мягкий американо',price:170,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'200мл',sort_order:202},
  {name:'Капучино',description:'Нежный капучино',price:280,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'200мл',sort_order:203},
  {name:'Вода без газа',description:'Чистая питьевая вода без газа',price:200,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'250мл',sort_order:204},
  {name:'Вода с газом',description:'Газированная питьевая вода',price:260,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'250мл',sort_order:205},
  {name:'Кока-Кола',description:'Кока-Кола 0.33л',price:250,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'0.33л',sort_order:206},
  {name:'Фанта',description:'Фанта 0.33л',price:250,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'0.33л',sort_order:207},
  {name:'Тархун',description:'Освежающий тархун 0.5л',price:280,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'0.5л',sort_order:208},
  {name:'Лимонад',description:'Домашний лимонад 0.5л',price:280,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'0.5л',sort_order:209},
  {name:'Натахтари',description:'Грузинская минеральная вода Натахтари 0.5л',price:280,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'0.5л',sort_order:210},
  {name:'Borjomi',description:'Минеральная вода Borjomi 0.5л',price:320,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'0.5л',sort_order:211},
  {name:'Pulpy',description:'Сокосодержащий напиток Pulpy 0.5л',price:300,image_url:'/images/drinks.jpg',category:'drinks',type:'food',is_featured:false,weight:'0.5л',sort_order:212},
  {name:'Морс домашний',description:'Домашний морс из свежих ягод',price:600,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:true,weight:'1л',sort_order:213},
  {name:'Компот айва',description:'Домашний компот из айвы',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:214},
  {name:'Компот кизил',description:'Домашний компот из кизила',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:215},
  {name:'Компот вишня',description:'Домашний компот из вишни',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:216},
  {name:'Сок яблочный',description:'Натуральный яблочный сок 1л',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:217},
  {name:'Сок мультифрукт',description:'Мультифруктовый сок 1л',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:218},
  {name:'Сок персик',description:'Натуральный персиковый сок 1л',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:219},
  {name:'Сок томатный',description:'Свежий томатный сок 1л',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:220},
  {name:'Сок сады придонья',description:'Сок сады придонья 1л',price:500,image_url:'/images/drink.jpg',category:'drinks',type:'food',is_featured:false,weight:'1л',sort_order:221},
  // АВТОРСКИЕ ЧАИ
  {name:'Чай с мёдом',description:'Ароматный чай с мёдом',price:650,image_url:'/images/drink.jpg',category:'author_tea',type:'food',is_featured:false,weight:'1л',sort_order:230},
  {name:'Чай с ромашкой',description:'Успокаивающий чай с ромашкой',price:500,image_url:'/images/drink.jpg',category:'author_tea',type:'food',is_featured:false,weight:'1л',sort_order:231},
  {name:'Чай каркаде апельсин грейпфрут',description:'Освежающий чай каркаде с цитрусами',price:600,image_url:'/images/drink.jpg',category:'author_tea',type:'food',is_featured:true,weight:'1л',sort_order:232},
  {name:'Чай с облепихой',description:'Витаминный чай с облепихой',price:800,image_url:'/images/drink.jpg',category:'author_tea',type:'food',is_featured:false,weight:'1л',sort_order:233},
  {name:'Чай с клубникой и мятой',description:'Освежающий чай с клубникой и мятой',price:950,image_url:'/images/drink.jpg',category:'author_tea',type:'food',is_featured:true,weight:'1л',sort_order:234},
  {name:'Чай ягодный микс',description:'Насыщенный чай из ягодного микса',price:950,image_url:'/images/drink.jpg',category:'author_tea',type:'food',is_featured:false,weight:'1л',sort_order:235},
  // МОРОЖЕНОЕ
  {name:'Мороженое ванильное',description:'Нежное ванильное мороженое, 1 шарик',price:80,image_url:'/images/icecream.jpg',category:'ice_cream',type:'food',is_featured:false,weight:'1шар',sort_order:240},
  {name:'Мороженое шоколадное',description:'Богатое шоколадное мороженое, 1 шарик',price:80,image_url:'/images/icecream.jpg',category:'ice_cream',type:'food',is_featured:false,weight:'1шар',sort_order:241},
  {name:'Мороженое клубничное',description:'Свежее клубничное мороженое, 1 шарик',price:80,image_url:'/images/icecream.jpg',category:'ice_cream',type:'food',is_featured:false,weight:'1шар',sort_order:242},
  // ДЕСЕРТЫ
  {name:'Чизкейк три шоколада',description:'Нежный чизкейк с тремя видами шоколада',price:285,image_url:'/images/cheesecake.jpg',category:'desserts',type:'food',is_featured:true,weight:'1шт',sort_order:250},
  {name:'Чизкейк Нью-Йорк',description:'Классический нью-йоркский чизкейк',price:285,image_url:'/images/cheesecake.jpg',category:'desserts',type:'food',is_featured:false,weight:'1шт',sort_order:251},
  {name:'Чизкейк карамель',description:'Нежный чизкейк с карамельным соусом',price:285,image_url:'/images/cheesecake.jpg',category:'desserts',type:'food',is_featured:false,weight:'1шт',sort_order:252},
  {name:'Тирамису',description:'Классический итальянский тирамису',price:285,image_url:'/images/dish-5.jpg',category:'desserts',type:'food',is_featured:true,weight:'1шт',sort_order:253},
  {name:'Фруктовая ваза',description:'Большая ваза с сезонными фруктами',price:2000,image_url:'/images/dish-5.jpg',category:'desserts',type:'food',is_featured:true,weight:'1.5кг',sort_order:254},
  {name:'Нарезка фруктовая',description:'Ассорти свежих фруктов',price:1000,image_url:'/images/dish-5.jpg',category:'desserts',type:'food',is_featured:false,weight:'700г',sort_order:255},
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = req.headers['x-seed-secret'];
  if (secret !== 'seed-sol-i-perec-2025') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // Удаляем все существующие
    await supabase.from('menu_items').delete().gte('id', 0);

    // Вставляем порциями по 20
    const chunkSize = 20;
    let inserted = 0;
    for (let i = 0; i < ALL_ITEMS.length; i += chunkSize) {
      const chunk = ALL_ITEMS.slice(i, i + chunkSize);
      const { error } = await supabase.from('menu_items').insert(chunk);
      if (error) throw error;
      inserted += chunk.length;
    }

    return res.status(200).json({ ok: true, inserted });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
