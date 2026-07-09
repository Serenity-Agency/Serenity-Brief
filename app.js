const budgetOptions = [
  "До 100 000 ₽",
  "100 000–300 000 ₽",
  "300 000–700 000 ₽",
  "700 000–1 500 000 ₽",
  "Более 1 500 000 ₽",
  "Бюджет пока не определён, нужна помощь с оценкой"
];

const primaryBudgetOptions = [
  "Пока не понимаю",
  "До 100 000 ₽",
  "100 000–300 000 ₽",
  "300 000–700 000 ₽",
  "700 000 ₽+",
  "Хочу обсудить"
];

const performanceBudgetOptions = [
  "Пока не знаем",
  "До 300 000 ₽",
  "300 000–700 000 ₽",
  "700 000–1 500 000 ₽",
  "1 500 000 ₽+",
  "Хочу обсудить"
];

const sourceOptions = ["Рекомендация", "Поиск (Google, Яндекс)", "Соцсети", "Реклама", "Уже работали с Serenity", "Мероприятие / публикация", "Другое"];

const primaryDeadlineOptions = [
  "Как можно скорее",
  "В течение месяца",
  "В ближайшие 2–3 месяца",
  "Пока изучаем варианты",
  "Не знаю"
];

const contactMethodOptions = ["Telegram", "Телефон", "Email", "WhatsApp", "Другое"];
const directionOptions = [
  "Пока не знаю — нужна помощь с выбором",
  "Маркетинговая стратегия",
  "Комплексное продвижение",
  "Performance-реклама",
  "SEO",
  "SMM и контент",
  "Сайт или интернет-магазин",
  "Брендинг или нейминг",
  "PR и репутация",
  "Другое"
];

const serviceBudgetHelp = "Это поможет сразу предложить реалистичный формат работы. Можно выбрать предварительный диапазон. Без учёта медиабюджета, производства и других внешних расходов.";
const externalBudgetHelp = "Без учёта услуг Serenity. Можно выбрать предварительный диапазон.";
const performanceBudgetHelp = "Укажите общий ориентир: работы агентства + рекламный бюджет. Если пока не знаете, выберите соответствующий вариант.";
const briefCategories = {
  primary: "Диагностика",
  startup: "Стратегия",
  strategy: "Стратегия",
  complex: "Регулярная работа",
  performance: "Канал продвижения",
  seo: "Канал продвижения",
  smm: "Канал продвижения",
  website: "Проектная работа",
  ecommerce: "Проектная работа",
  branding: "Проектная работа",
  naming: "Проектная работа",
  pr: "Канал продвижения"
};

const commonSections = [
  {
    title: "О вас и компании",
    fields: [
      field("company_name", "Название компании", "text", "Как вас правильно называть?", true),
      field("contact_name", "Как к вам обращаться?", "text", "Имя и должность", true),
      field("contact_email", "Email для связи", "email", "Используем, чтобы связаться по задаче", true),
      field("contact_phone", "Телефон", "tel", "Укажите, если удобно созвониться или написать в мессенджере"),
      field("contact_social", "Мессенджер или соцсеть", "text", "Например: @username в Telegram или ссылка на профиль"),
      field("business", "Что важно знать о вашем бизнесе для этой задачи?", "textarea", "То, чего не видно на сайте")
    ]
  },
  {
    title: "Задача",
    fields: [
      field("request", "С чем вы пришли к Serenity?", "textarea", "Что происходит сейчас и что хочется изменить?", true),
      field("deadline", "Есть ли важная дата или желаемый срок?", "text", "Например: запуск продукта, выставка, начало сезона"),
      singleChoice("budget", "Какой бюджет планируете на услуги Serenity?", budgetOptions, serviceBudgetHelp, true)
    ]
  }
];

const performanceAboutSection = {
  title: "О вас и компании",
  fields: [
    field("company_name", "Название компании", "text", "Как вас правильно называть?", true),
    field("contact_name", "Как к вам обращаться?", "text", "Имя и должность", true),
    field("contact_email", "Email для связи", "email", "Используем, чтобы связаться по задаче", true),
    field("contact_phone", "Телефон", "tel", "Укажите, если удобно созвониться или написать в мессенджере"),
    field("contact_social", "Мессенджер или соцсеть", "text", "Например: @username в Telegram или ссылка на профиль"),
    field("business", "Что важно знать о вашем бизнесе для этой задачи?", "textarea", "Ниша, регион, особенности бизнеса, ограничения, сезонность или другие важные детали.")
  ]
};

const publicConfig = {
  privacyPolicyUrl: "https://serenity.agency/privacy.pdf",
  submissionEndpoint: "/api/submit"
};

const finalSection = section("Ожидаемый результат", [
  field("result", "Какой результат работы вы считаете хорошим?", "textarea", "Какие решения должны стать понятнее и что команда должна суметь сделать после завершения работы?", true)
]);

const briefTypes = [
  brief(
    "primary",
    "Первичный бриф",
    "Не уверены, какая услуга нужна? Опишите задачу — мы изучим контекст и предложим следующий шаг.",
    "≈ 5 минут",
    [
      section("О вас", [
        field("contact_name", "Ваше имя", "text", "", true),
        field("company_name", "Компания или проект", "text", "", true),
        singleChoice("contact_method", "Где удобнее связаться?", contactMethodOptions, "", true),
        field("contact_value", "Контакт для связи", "text", "Укажите номер, email, username или ссылку", true)
      ]),
      section("Задача", [
        field("request", "Коротко опишите задачу", "textarea", "Достаточно 1–3 предложений", true),
        choice("direction", "Какое направление вас интересует?", directionOptions)
      ]),
      section("Дополнительно", [
        field("business", "Чем занимается компания или проект?", "textarea", "Коротко: что вы предлагаете и кому"),
        field("links", "Сайт или социальные сети", "text", "Добавьте ссылки, если они есть"),
        field("previous_work", "Что уже пробовали? Есть ли текущий подрядчик?", "textarea", "Можно коротко описать опыт и причины поиска нового решения"),
        singleChoice("deadline", "Когда хотите начать?", primaryDeadlineOptions),
        singleChoice("budget", "Есть ли ориентир по бюджету?", primaryBudgetOptions),
        field("additional", "Что ещё важно добавить?", "textarea", "Ссылки, материалы или дополнительный комментарий")
      ])
    ],
    false
  ),
  brief(
    "startup",
    "Стратегия для стартапа",
    "Для проектов от идеи до первых продаж. Оценим гипотезы, экономику и подходящий формат запуска.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Стадия и продукт", [
        choice("startup_stage", "На какой стадии находится проект?", ["Идея", "Прототип", "MVP", "Первые продажи", "Рост", "Pre-seed", "Seed"], true),
        field("problem", "Какую конкретную проблему решает продукт?", "textarea"),
        field("product_state", "В каком виде продукт доступен сейчас?", "textarea", "Что уже можно показать или протестировать?"),
      ]),
      section("Подтверждённые данные", [
        field("interviews", "Проводили ли интервью с потенциальными клиентами?", "textarea", "С кем говорили и что узнали?"),
        field("sales", "Есть ли подтверждённые продажи или активные пользователи?", "textarea"),
        field("economics", "Что уже известно об экономике продукта?", "textarea", "Цена, себестоимость, маржа, LTV, стоимость привлечения")
      ]),
      section("Гипотезы и рост", [
        field("segments", "Какие сегменты аудитории рассматриваете?", "textarea"),
        field("positioning", "Как сформулированы ценность продукта и отличие от альтернатив?", "textarea"),
        field("competitors", "Какие решения клиенты используют вместо вашего продукта?", "textarea", "Прямые конкуренты и другие способы решить задачу"),
        field("tests", "Какие каналы и гипотезы уже тестировали?", "textarea"),
        singleChoice("test_budget", "Какой бюджет доступен на первые тесты?", budgetOptions, externalBudgetHelp, true)
      ]),
      section("Результат стратегии", [
        choice("strategy_output", "Что должно быть в результате?", ["Маркетинговая стратегия", "Growth-стратегия", "Unit-экономика", "Финансовая модель", "Воронка и roadmap тестов", "Материалы для инвесторов"]),
        field("horizon", "На какой горизонт нужен план?", "text", "3, 6 или 12 месяцев"),
        field("metrics", "Какие метрики для проекта ключевые?", "textarea")
      ]),
      section("Дополнительные вводные", [
        field("materials", "Какие исследования и материалы уже можно изучить?", "textarea", "Интервью, исследования рынка, презентации, брендбук"),
        field("additional", "Что ещё важно учесть при оценке задачи?", "textarea")
      ])
    ]
  ),
  brief(
    "strategy",
    "Маркетинговая стратегия",
    "Для плана развития маркетинга на 6–12 месяцев. Оценим цели, приоритеты, каналы и бюджетную рамку.",
    "≈ 15 минут",
    [
      ...commonSections,
      section("Бизнес и цели", [
        field("business_model", "Как компания зарабатывает?", "textarea", "Основные продукты, модель оплаты, средний чек"),
        field("year_goal", "Какие бизнес-цели стоят на год?", "textarea", "Выручка, новые рынки, продукты, доля рынка"),
        field("priority", "Что важнее всего изменить в ближайшие 6–12 месяцев?", "textarea", "", true),
        field("constraints", "Какие ограничения нужно учитывать?", "textarea", "Команда, производство, законодательство, сезонность")
      ]),
      section("Рынок и аудитория", [
        field("markets", "На каких рынках и территориях работаете?", "textarea", "Текущая и желаемая география"),
        field("segments", "Какие сегменты клиентов для вас наиболее ценны?", "textarea", "Кто покупает чаще, больше и дольше остаётся"),
        field("choice", "Как клиент выбирает решение?", "textarea", "Триггеры, критерии, барьеры, участники принятия решения"),
        field("competitors", "Кто формирует правила рынка?", "textarea", "Лидеры, прямые и косвенные конкуренты")
      ]),
      section("Маркетинг и данные", [
        field("channels", "Какие каналы уже используете?", "textarea", "Бюджеты, результаты, выводы"),
        field("funnel", "Как выглядит путь от первого контакта до покупки?", "textarea", "Этапы, конверсии, срок сделки"),
        field("analytics", "Какие данные доступны?", "textarea", "CRM, сквозная аналитика, исследования, отчёты"),
        field("team", "Кто будет реализовывать стратегию?", "textarea", "Внутренняя команда, подрядчики, план найма")
      ]),
      section("Дополнительные вводные", [
        field("positioning", "Как сформулированы ценность компании и отличие от конкурентов?", "textarea"),
        field("materials", "Какие исследования и материалы уже можно изучить?", "textarea", "Исследования, отчёты, маркетинг-кит, брендбук"),
        field("additional", "Что ещё важно учесть при оценке задачи?", "textarea")
      ])
    ]
  ),
  brief(
    "complex",
    "Комплексное продвижение",
    "Для регулярной реализации маркетинга командой. Оценим рекламу, контент, аналитику и работу с заявками.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Продвижение сейчас", [
        field("channels", "Какие каналы работают сейчас?", "textarea", "Реклама, SEO, соцсети, PR, партнёрства"),
        singleChoice("media_budget", "Какой медиабюджет планируете?", budgetOptions, externalBudgetHelp, true),
        field("numbers", "Какие показатели отслеживаете?", "textarea", "Трафик, заявки, продажи, стоимость привлечения"),
        field("past", "Что уже пробовали и к каким выводам пришли?", "textarea"),
        field("team", "Кто сейчас отвечает за маркетинг?", "textarea")
      ]),
      section("Приоритеты", [
        field("product_focus", "Что продвигаем в первую очередь?", "textarea", "Продукт, услуга, направление или бренд"),
        field("audience", "Кого хотим привлечь?", "textarea", "Текущая и новая аудитория"),
        choice("goals", "Какие задачи стоят перед продвижением?", ["Заявки", "Продажи", "Выход на новый рынок", "Узнаваемость", "Повторные покупки", "Другое"]),
        field("seasonality", "Есть ли сезонность и важные периоды?", "textarea")
      ]),
      section("Продажи и аналитика", [
        field("funnel", "Опишите путь клиента до покупки", "textarea"),
        field("sales_team", "Как отдел продаж работает с обращениями?", "textarea"),
        field("crm", "Какие системы аналитики и CRM подключены?", "textarea"),
        field("kpi", "Какие показатели должны измениться?", "textarea")
      ]),
      section("Дополнительные вводные", [
        field("contractor", "Есть ли текущие подрядчики и что важно изменить в работе?", "textarea"),
        field("resources", "Какие ресурсы доступны внутри команды?", "textarea", "Разработчик, контент-менеджер, дизайнер, эксперты"),
        field("materials", "Какие материалы уже готовы?", "textarea", "Фото, видео, креативы, брендбук, исследования"),
        field("additional", "Есть ли другие сайты, продукты или вводные, которые важно учесть?", "textarea")
      ])
    ]
  ),
  brief(
    "performance",
    "Performance-реклама",
    "Для запуска или улучшения платной рекламы. Оценим продукт, экономику и план привлечения клиентов.",
    "≈ 30 минут",
    [
      performanceAboutSection,
      section("Продукт и экономика", [
        field("offer", "Что именно рекламируем?", "textarea", "Продукты, услуги и приоритетные предложения"),
        field("site", "Сайт / ссылка на проект", "text", "Основной сайт, каталог, лендинг или карточка продукта", true),
        field("geo", "Где планируете показывать рекламу?", "textarea", "Страна, регион, город или несколько географий.", true),
        field("average_check", "Какой средний чек?", "text", "Если не знаете точное значение, напишите «не знаю» или примерный диапазон.", true),
        field("sales_cycle", "Как обычно проходит сделка с клиентом?", "textarea", "Например: покупка сразу на сайте, заявка → звонок менеджера, выставление счета, консультация, длинный цикл сделки и т.д."),
        singleChoice("budget", "Какой суммарный бюджет вы рассматриваете на performance-рекламу?", performanceBudgetOptions, performanceBudgetHelp, true),
        field("seasonality", "Есть ли сезонность, акции или ограничения?", "textarea")
      ]),
      section("Реклама сейчас", [
        choice("platforms", "Какие рекламные площадки уже использовали?", ["Яндекс Директ", "Google Ads", "VK Реклама", "Telegram Ads", "myTarget", "Другое", "Не запускали"]),
        choice("placement_types", "Какие типы размещения интересны или уже используются?", ["Поиск", "РСЯ / рекламные сети", "Ретаргетинг", "Медийная реклама", "Товарные кампании", "Видео", "Пока не знаем"]),
        field("results", "Какие результаты получили?", "textarea", "Можно указать бюджет, заявки, продажи, стоимость лида или написать «не считали»."),
        choice("analytics_stack", "Какая аналитика подключена?", ["Яндекс Метрика", "Google Analytics", "Сквозная аналитика", "Коллтрекинг", "Дашборды / BI", "Пока ничего", "Не знаю"]),
        choice("crm_stack", "Какая CRM или система учёта заявок используется?", ["amoCRM", "Битрикс24", "1C", "RetailCRM", "Самописная CRM", "Заявки в почте / мессенджерах", "CRM нет", "Не знаю"]),
        field("landing", "Ссылки на посадочные страницы, которые вы хотите продвигать", "textarea", "Укажите сайт, лендинг, разделы каталога или другие страницы. Если страниц несколько — добавьте все ссылки.", true)
      ]),
      section("Цели теста", [
        choice("goals", "Какие цели у performance-рекламы?", ["Заявки", "Продажи на сайте", "Звонки", "Регистрации", "Продвижение конкретного продукта", "Возврат аудитории", "Тест спроса", "Другое"]),
        choice("target", "Какое целевое действие считаем главным?", ["Покупка", "Заявка", "Звонок", "Регистрация", "Сообщение в мессенджер", "Запись на консультацию", "Пока не знаем"]),
        field("lead_quality", "Какая заявка считается качественной?", "textarea")
      ]),
      section("Дополнительные вводные", [
        field("contractor", "Есть ли текущий подрядчик и почему рассматриваете изменения?", "textarea"),
        choice("resources", "Кто может помогать с оперативными правками?", ["Разработчик", "Дизайнер", "Контент-менеджер", "Маркетолог", "Менеджер продаж", "Пока никто", "Не знаю"]),
        choice("assets", "Какие материалы для рекламы уже готовы?", ["Фото", "Видео", "Креативы", "Тексты", "Товарный фид", "Баннеры", "Ничего пока нет", "Другое"]),
        field("assets_comment", "Комментарий по материалам", "textarea", "Если выбрали «Другое» или нужно пояснить готовность материалов."),
        field("additional_links", "Если есть дополнительные сайты, соцсети или другие площадки — укажите ссылки.", "textarea")
      ])
    ],
    false
  ),
  brief(
    "seo",
    "SEO и органический трафик",
    "Для системного роста сайта в поиске. Оценим текущее состояние и потенциал органического трафика.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Сайт и спрос", [
        field("site", "Какой сайт продвигаем?", "text", "", true),
        field("cms", "На какой CMS работает сайт?", "text"),
        field("directions", "Какие направления приоритетны?", "textarea"),
        field("regions", "Какие регионы важны?", "textarea"),
        field("seasonality", "Есть ли сезонность спроса?", "textarea")
      ]),
      section("История SEO", [
        field("history", "Что уже делали по SEO?", "textarea", "Подрядчики, работы, сроки, результаты"),
        field("problems", "Какие проблемы сайта уже известны?", "textarea"),
        field("contractor", "Если меняете подрядчика, что важно улучшить в работе?", "textarea"),
        field("site_changes", "Планируются ли крупные изменения сайта в ближайшие 6–12 месяцев?", "textarea", "Редизайн, смена CMS, перенос домена, изменение структуры")
      ]),
      section("Контент и конкуренты", [
        field("competitors", "С кем конкурируете в поиске?", "textarea"),
        field("references", "Есть ли сайты или компании, на которые ориентируетесь как на пример?", "textarea"),
        field("content", "Кто может готовить и согласовывать контент?", "textarea"),
        field("developer", "Есть ли разработчик для технических изменений на сайте?", "textarea")
      ]),
      section("Цели и аналитика", [
        choice("analytics", "Какие системы аналитики подключены?", ["Яндекс Метрика", "Яндекс Вебмастер", "Google Analytics", "Google Search Console", "CRM", "Коллтрекинг", "Ничего", "Не знаю"]),
        choice("kpi", "Какой результат SEO важен бизнесу?", ["Увеличение трафика", "Рост заявок", "Увеличение продаж", "Снижение CPL", "Узнаваемость бренда", "Выход на новые рынки"]),
        field("materials", "Какие отчёты, исследования или материалы уже можно изучить?", "textarea")
      ])
    ]
  ),
  brief(
    "smm",
    "SMM и контент",
    "Для регулярной работы с соцсетями и контентом. Оценим площадки, ресурсы команды и формат ведения.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Роль соцсетей", [
        choice("goals", "Для чего бренду соцсети?", ["Продажи", "Узнаваемость", "Имидж", "Комьюнити", "Поддержка клиентов", "Работа с сотрудниками", "Продвижение личного бренда основателя/эксперта/сотрудника"]),
        field("platforms", "Какие площадки ведёте или рассматриваете?", "textarea"),
        field("links", "Укажите ссылки на сайт, соцсети и каналы, которые уже ведёте", "textarea", "Сайт, Instagram, Telegram, VK, YouTube и другие площадки, которые нам важно посмотреть перед подготовкой предложения."),
        field("audience", "С кем хотим общаться?", "textarea"),
        field("tone", "Как бренд должен звучать?", "textarea", "Можно привести примеры близких по тону аккаунтов")
      ]),
      section("Контент", [
        field("topics", "О чём бренд может говорить регулярно?", "textarea"),
        field("experts", "Кто может участвовать в создании контента?", "textarea"),
        { ...choice("brand_face", "Есть ли человек со стороны бренда, который готов участвовать в контенте?", ["Основатель / собственник", "Руководитель / эксперт компании", "Сотрудник / команда", "Амбассадор / лицо бренда", "Пока нет", "Другое"]), help: "Например: записывать короткие ролики, давать комментарии, участвовать в интервью или съёмках." },
        field("assets", "Какие материалы уже есть?", "textarea", "Фото, видео, исследования, кейсы, брендбук"),
        field("restrictions", "Что нельзя публиковать или обсуждать?", "textarea")
      ]),
      section("Процессы и результат", [
        field("current", "Что происходит в соцсетях сейчас?", "textarea"),
        field("approval", "Как устроено согласование?", "textarea"),
        field("moderation", "Нужно ли отвечать на сообщения и комментарии?", "textarea"),
        field("kpi", "Какие показатели важны?", "textarea")
      ])
    ]
  ),
  brief(
    "website",
    "Бриф на сайт",
    "Для запуска или обновления сайта. Оценим задачи, материалы, функциональность и объём разработки.",
    "≈ 5–10 минут",
    [
      ...commonSections,
      section("Задача сайта", [
        singleChoice("site_type", "Тип сайта", [
          "Лендинг — одностраничный сайт",
          "Корпоративный сайт / сайт-каталог — сайт компании, услуг или каталог товаров",
          "Интернет-магазин — сайт для продажи товаров с покупкой онлайн"
        ], "Для интернет-магазина рекомендуем отдельный профильный бриф — он поможет точнее оценить каталог, оплату, доставку и интеграции."),
        field("site_goal", "Какую главную задачу должен решать сайт?", "textarea", "", true),
        field("current_site", "Есть ли текущий сайт?", "text"),
        field("problems", "Что в текущем сайте не устраивает?", "textarea")
      ]),
      section("Аудитория и контент", [
        field("audience", "Кратко опишите целевую аудиторию сайта", "textarea"),
        field("scenarios", "Перечислите основные сценарии конверсий на сайте: покупка, оформление заявки, консультация, подписка, регистрация и т.д.", "textarea"),
        field("structure", "Перечислите разделы и страницы структуры сайта, которые точно нужны", "textarea"),
        field("content", "Какие материалы уже готовы?", "textarea")
      ]),
      section("Функциональность", [
        field("functions", "Какие функции и интеграции нужны?", "textarea", "CRM, оплата, каталог, личный кабинет, калькулятор"),
        field("cms", "Есть ли требования к CMS и технологиям?", "textarea"),
        field("references", "Какие сайты нравятся и почему?", "textarea"),
        field("support", "Требуется ли поддержка сайта после запуска?", "textarea")
      ]),
      section("Дополнительные вводные", [
        field("brand_assets", "Есть ли логотип, фирменный стиль и исходные материалы?", "textarea"),
        field("success", "По каким признакам вы поймёте, что сайт решает задачу?", "textarea"),
        field("additional", "Что ещё важно учесть при оценке сайта?", "textarea")
      ])
    ]
  ),
  brief(
    "ecommerce",
    "Интернет-магазин",
    "Для запуска или развития интернет-магазина. Оценим каталог, путь покупки, интеграции и объём проекта.",
    "≈ 15 минут",
    [
      ...commonSections,
      section("Каталог и продажи", [
        field("catalog", "Что продаём и как устроен каталог?", "textarea", "Категории, глубина вложенности, примерное количество товаров"),
        field("product_data", "Какие данные есть у товара?", "textarea", "Характеристики, варианты, фото, цены, остатки"),
        field("pricing", "Как устроены цены, скидки и программа лояльности?", "textarea")
      ]),
      section("Покупка", [
        field("checkout", "Как должен выглядеть путь от товара до заказа?", "textarea"),
        field("payment", "Какие способы оплаты нужны?", "textarea"),
        field("delivery", "Какие способы и правила доставки нужны?", "textarea")
      ]),
      section("Управление и интеграции", [
        field("integrations", "С какими системами нужно связать магазин?", "textarea", "1С, CRM, склад, службы доставки, платёжные системы"),
        field("orders", "Как команда будет обрабатывать заказы?", "textarea"),
        field("cms", "Есть ли требования к CMS или технологиям?", "textarea")
      ]),
      section("Материалы и запуск", [
        field("content", "Насколько готовы контент и данные каталога?", "textarea"),
        field("analytics", "Какая аналитика и CRM уже подключены?", "textarea"),
        field("support", "Кто будет поддерживать магазин после запуска?", "textarea")
      ])
    ]
  ),
  brief(
    "branding",
    "Брендинг и фирменный стиль",
    "Для нового бренда или обновления стиля. Оценим задачу, аудиторию, носители и объём работы.",
    "≈ 15 минут",
    [
      ...commonSections,
      section("Бренд", [
        choice("branding_task", "Какая задача стоит?", ["Новый бренд", "Ребрендинг", "Обновление стиля", "Логотип", "Гайдлайн", "Пока не знаем"], true),
        field("story", "Какой товар или услугу продвигает бренд и в чём ваше преимущество?", "textarea"),
        field("positioning", "Как бренд позиционируется сейчас?", "textarea"),
        field("changes", "Что должно измениться в восприятии бренда?", "textarea")
      ]),
      section("Аудитория и характер", [
        field("audience", "Для кого создаём бренд?", "textarea"),
        field("character", "Каким человеком мог бы быть бренд?", "textarea"),
        field("associations", "Какие ассоциации важно вызвать и каких избежать?", "textarea"),
        field("competitors", "На фоне каких брендов нужно выделиться?", "textarea")
      ]),
      section("Визуальная система", [
        field("carriers", "Где стиль будет использоваться?", "textarea", "Сайт, соцсети, упаковка, офис, документы"),
        field("legacy", "Что из текущего стиля важно сохранить?", "textarea"),
        field("references", "Какие визуальные решения нравятся или не нравятся?", "textarea"),
        field("technical", "Есть ли технические или юридические ограничения?", "textarea")
      ])
    ]
  ),
  brief(
    "naming",
    "Нейминг",
    "Для компании, продукта или сервиса, которому нужно название. Определим смысл, характер и рамки поиска.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Объект нейминга", [
        field("object", "Для чего создаём название?", "textarea", "Компания, продукт, линейка, сервис, событие"),
        field("essence", "В чём суть продукта или бизнеса?", "textarea", "", true),
        field("geo", "Где будет использоваться название?", "textarea"),
        field("future", "Как проект может развиваться дальше?", "textarea")
      ]),
      section("Смысл и звучание", [
        field("message", "Какую главную мысль должно передавать название?", "textarea"),
        field("associations", "Какие ассоциации нужны и нежелательны?", "textarea"),
        field("language", "На каких языках название должно работать?", "textarea"),
        choice("style", "Какой характер названия ближе?", ["Деловое", "Эмоциональное", "Технологичное", "Необычное", "Описательное", "Без предпочтений"])
      ]),
      section("Ограничения", [
        field("competitors", "Какие названия есть у конкурентов?", "textarea"),
        field("liked", "Какие названия вам нравятся и почему?", "textarea"),
        field("avoid", "Какие слова, темы и приёмы нельзя использовать?", "textarea"),
        field("legal", "Какие проверки и доменные зоны нужны?", "textarea")
      ])
    ]
  ),
  brief(
    "pr",
    "PR и репутация",
    "Для задач по публичности, экспертности и репутации. Оценим инфоповоды, ресурсы и формат PR-работы.",
    "≈ 10 минут",
    [
      ...commonSections,
      section("Публичная задача", [
        choice("pr_goal", "Что должен изменить PR?", ["Узнаваемость", "Доверие", "Репутация", "Поддержка продаж", "Выход на новый рынок", "Экспертность"], true),
        choice("pr_tool", "Какой PR-инструмент нужен?", ["PR: работа с изданиями и СМИ", "PR: работа с лидерами мнений / блогерами", "PR: работа с отзывами и репутацией", "PR: узнаваемость в digital / SERM", "Предложите решение"]),
        choice("audience", "На чьё мнение нужно повлиять?", ["Конечный потребитель", "Общество в целом", "Категория граждан", "Закупщик / дистрибутор", "Производитель", "Представитель профессии", "Родитель", "Другое"], true),
        field("audience_detail", "Уточните аудиторию", "textarea", "Дополнительный комментарий, если выбрали «Другое» или хотите пояснить"),
        field("messages", "Какие мысли аудитория должна запомнить?", "textarea", "", true),
        field("risks", "Есть ли чувствительные темы или репутационные риски?", "textarea")
      ]),
      section("Инфополе", [
        field("media", "Где бренд уже представлен?", "textarea", "СМИ, рейтинги, конференции, соцсети", true),
        field("speakers", "Кто может выступать от лица компании?", "textarea", "", true),
        field("reasons", "Какие инфоповоды ожидаются?", "textarea", "", true),
        field("competitors", "Чью публичность считаете сильной?", "textarea", "", true),
        field("publicity_why", "Что именно нравится в их публичности?", "textarea")
      ]),
      section("Процессы", [
        field("materials", "Какие материалы и исследования доступны?", "textarea"),
        field("approval", "Кто согласовывает публичные материалы?", "textarea"),
        field("reaction", "Как быстро команда может отвечать на запросы?", "textarea"),
        field("kpi", "По каким показателям оценивать работу?", "textarea")
      ])
    ]
  )
];

const state = {
  screen: "home",
  briefId: null,
  answers: readStorage("serenityBriefAnswers"),
  submissionIds: readStorage("serenitySubmissionIds"),
  sending: false,
  submission: null,
  error: "",
  formStartedAt: Date.now(),
  sessionUpdatedAt: null,
  sessionStatus: "draft",
  sessionClientName: "",
  sessionError: "",
  createResult: null,
  createError: "",
  createSending: false,
  createManagerName: ""
};

const app = document.querySelector("#app");
const saveStatus = document.querySelector("#save-status");
const requestedBriefId = new URLSearchParams(window.location.search).get("brief");
const sessionToken = new URLSearchParams(window.location.search).get("session");
const adminParam = new URLSearchParams(window.location.search).get("admin");

if (!sessionToken && !adminParam && briefTypes.some((item) => item.id === requestedBriefId)) {
  state.briefId = requestedBriefId;
  state.screen = "brief";
}

if (adminParam && !sessionToken) {
  state.screen = "create";
}

let sessionSaveTimer = null;

function field(id, label, type = "text", help = "", required = false) {
  return { id, label, type, help, required };
}

function choice(id, label, options, required = false) {
  return { id, label, type: "choice", options, required };
}

function singleChoice(id, label, options, help = "", required = false) {
  return { id, label, type: "singleChoice", options, help, required };
}

function section(title, fields) {
  return { title, fields };
}

function brief(id, title, description, time, sections, includeFinalSection = true) {
  const withSource = sections.map((s, i) => {
    if (i !== sections.length - 1 || s.fields.some(f => f.id === "source")) return s;
    return { ...s, fields: [...s.fields,
      choice("source", "Как вы о нас узнали?", sourceOptions),
      field("source_other", "Уточните источник", "text", "Если выбрали «Другое» или хотите добавить детали")
    ]};
  });
  return { id, title, description, time, sections: includeFinalSection ? [...withSource, finalSection] : withSource };
}

function formatTime(time) {
  return `Заполнение: ${time.replace("≈ ", "около ")}`;
}

function formatCompactTime(time) {
  return time.replace("≈ ", "Около ");
}

function getBriefIntro(briefItem) {
  if (briefItem.id === "primary") return "Коротко опишите задачу — мы предложим следующий шаг.";
  return briefItem.description.match(/^.*?[.!?](?=\s|$)/)?.[0] || briefItem.description;
}

function render() {
  saveStatus.hidden = ["home", "loading", "session_error", "create"].includes(state.screen);
  if (state.screen === "loading") return renderSessionLoading();
  if (state.screen === "session_error") return renderSessionError();
  if (state.screen === "create") return renderCreate();
  if (state.screen === "brief") return renderBrief();
  if (state.screen === "result") return renderResult();
  renderHome();
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <p class="hero-kicker">Брифы Serenity</p>
      <h1>Расскажите о проекте.<br>Мы предложим следующий шаг.</h1>
      <p class="hero-copy">Выберите подходящий бриф.</p>
    </section>
    <button class="catalog-hint" type="button" data-brief="primary">Не знаете, что выбрать? Начните с первичного брифа →</button>
    <section class="catalog">
      ${briefTypes.map((item) => `
        <button class="brief-card" type="button" data-brief="${item.id}">
          <div class="brief-card-top">
            <span class="card-category">${briefCategories[item.id]}</span>
            <span class="time">${formatTime(item.time)}</span>
          </div>
          <h2>${item.title}</h2>
          <div class="brief-card-bottom">
            <p>${item.description}</p>
            <span class="arrow">→</span>
          </div>
        </button>
      `).join("")}
    </section>
  `;
}

function renderBrief() {
  const current = getCurrentBrief();
  const progress = getRequiredProgress();

  app.innerHTML = `
    <div class="brief-shell">
      <aside class="brief-aside">
        ${sessionToken ? "" : `<button class="back-link" type="button" data-action="home">← Все брифы</button>`}
        <h2>${current.title}</h2>
        <p>${getBriefIntro(current)}</p>
        <span class="aside-time">${formatCompactTime(current.time)}</span>
        <div class="progress-label"><span>Обязательные ответы</span><strong>${progress}%</strong></div>
        <div class="progress"><span style="width:${progress}%"></span></div>
        <nav class="section-nav">
          ${current.sections.map((item, index) => `<button type="button" data-scroll="section-${index}">${String(index + 1).padStart(2, "0")} · ${item.title}</button>`).join("")}
        </nav>
      </aside>

      <form class="brief-form" id="brief-form">
        <input class="honeypot" type="text" name="company_site_confirm" tabindex="-1" autocomplete="off">
        <div class="form-head">
          <h1>Расскажите<br>о проекте</h1>
          <p>Можно отвечать коротко. Поля со звездочкой обязательны, остальные можно пропустить.</p>
        </div>
        ${current.sections.map((item, sectionIndex) => `
          <section class="form-section" id="section-${sectionIndex}">
            <div class="section-title">
              <span>${String(sectionIndex + 1).padStart(2, "0")}</span>
              <h2>${item.title}</h2>
            </div>
            ${current.id === "primary" && item.title === "Дополнительно"
              ? `<p class="optional-note">Эти поля можно пропустить, если пока нет ответа.</p>`
              : ""}
            <div class="fields">
              ${item.fields.map(renderField).join("")}
            </div>
          </section>
        `).join("")}
        <label class="consent">
          <input type="checkbox" name="privacy_consent" value="accepted" required>
          <span>
            Я согласен(на) на обработку персональных данных для подготовки предложения.
            ${publicConfig.privacyPolicyUrl
              ? `<a href="${escapeHtml(publicConfig.privacyPolicyUrl)}" target="_blank" rel="noreferrer">Политика обработки данных</a>`
              : `<span class="policy-placeholder">Ссылка на политику будет добавлена после публикации документа.</span>`}
          </span>
        </label>
        <div class="form-actions">
          <button class="button secondary" type="button" data-action="clear">Очистить ответы</button>
          <button class="button" type="submit" ${state.sending ? "disabled" : ""}>${state.sending ? "Отправляем…" : "Отправить бриф →"}</button>
        </div>
        ${state.error ? `<p class="form-error" role="alert">${escapeHtml(state.error)}</p>` : ""}
        <p class="form-note">Данные попадут только в рабочий реестр Serenity и документ с ответами.</p>
      </form>
    </div>
  `;
  fillAnswers();
}

function renderField(item) {
  const required = item.required ? ` <span class="required">*</span>` : "";
  const helpId = `${item.id}-help`;
  const help = item.help ? `<small id="${helpId}">${item.help}</small>` : "";
  const describedBy = item.help ? ` aria-describedby="${helpId}"` : "";
  if (item.type === "choice" || item.type === "singleChoice") {
    const inputType = item.type === "singleChoice" ? "radio" : "checkbox";
    const nativeRequired = item.type === "singleChoice" && item.required ? " required" : "";
    return `
      <fieldset class="field ${item.type === "singleChoice" ? "single-choice" : "multi-choice"}"${item.required ? ' aria-required="true"' : ""}>
        <legend>${item.label}${required}</legend>
        ${help}
        <div class="choice-grid">
          ${item.options.map((option) => `
            <label class="choice">
              <input type="${inputType}" name="${item.id}" value="${escapeHtml(option)}"${describedBy}${nativeRequired} ${item.required ? "data-required-choice" : ""}>
              <span>${option}</span>
            </label>
          `).join("")}
        </div>
        ${item.id === "site_type"
          ? `<div class="brief-recommendation" data-site-recommendation hidden>
              Для интернет-магазина лучше заполнить отдельный профильный бриф.
              <button type="button" data-brief="ecommerce">Перейти к брифу интернет-магазина →</button>
            </div>`
          : ""}
      </fieldset>
    `;
  }
  const autocomplete = {
    company_name: "organization",
    contact_name: "name",
    contact_email: "email",
    contact_phone: "tel",
    contact_value: "on"
  }[item.id];
  const autocompleteAttr = autocomplete ? ` autocomplete="${autocomplete}"` : "";
  const control = item.type === "textarea"
    ? `<textarea id="${item.id}" name="${item.id}"${describedBy} ${item.required ? "required" : ""}></textarea>`
    : `<input id="${item.id}" type="${item.type}" name="${item.id}"${describedBy}${autocompleteAttr} ${item.required ? "required" : ""}>`;
  return `<div class="field"><label for="${item.id}">${item.label}${required}</label>${help}${control}</div>`;
}

function renderResult() {
  const current = getCurrentBrief();
  app.innerHTML = `
    <section class="result">
      <div class="result-card">
        <div class="result-head">
          <div>
            <span class="tag">${current.title}</span>
            <h1>Спасибо,<br>бриф отправлен</h1>
            <p class="result-copy">Ответы сохранились у команды Serenity. Мы изучим задачу и вернёмся к вам по указанному контакту.</p>
          </div>
          <div class="result-actions">
            ${!(sessionToken && state.sessionStatus === "submitted") ? `<button class="button secondary" type="button" data-action="edit">Вернуться к ответам</button>` : ""}
            <button class="button" type="button" data-action="copy">Скопировать ответы</button>
          </div>
        </div>
        ${current.sections.map((sectionItem) => `
          <section class="summary-section">
            <h2>${sectionItem.title}</h2>
            <dl>
              ${sectionItem.fields.map((item) => `
                <div class="summary-item">
                  <dt>${item.label}</dt>
                  <dd class="${hasAnswer(item.id) ? "" : "empty"}">${hasAnswer(item.id) ? escapeHtml(formatAnswer(item.id)) : "Нет ответа"}</dd>
                </div>
              `).join("")}
            </dl>
          </section>
        `).join("")}
      </div>
    </section>
  `;
}

function getCurrentBrief() {
  return briefTypes.find((item) => item.id === state.briefId) || briefTypes[0];
}

function fillAnswers() {
  const form = document.querySelector("#brief-form");
  const answers = state.answers[state.briefId] || {};
  Object.entries(answers).forEach(([name, value]) => {
    const controls = form.elements[name];
    if (!controls) return;
    if (controls instanceof RadioNodeList) {
      [...controls].forEach((control) => {
        control.checked = Array.isArray(value) ? value.includes(control.value) : control.value === value;
      });
    } else if (controls.type === "checkbox") {
      controls.checked = Boolean(value);
    } else {
      controls.value = value;
    }
  });
  updateSiteRecommendation();
}

function saveAnswers() {
  const form = document.querySelector("#brief-form");
  if (!form) return;
  const data = {};
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
    } else {
      data[key] = value;
    }
  }
  state.answers[state.briefId] = data;
  updateProgress();
  if (sessionToken) {
    scheduleSessionSave();
  } else {
    const saved = writeStorage("serenityBriefAnswers", state.answers);
    setSaveStatus(saved ? "Черновик сохранён" : "Черновик только в этой вкладке", saved ? "" : "error");
  }
}

function getRequiredProgress() {
  const requiredFields = getCurrentBrief().sections.flatMap((item) => item.fields).filter((item) => item.required);
  const requiredIds = [...requiredFields.map((item) => item.id), "privacy_consent"];
  const completed = requiredIds.filter(hasAnswer).length;
  return requiredIds.length ? Math.round((completed / requiredIds.length) * 100) : 100;
}

function updateProgress() {
  const progress = getRequiredProgress();
  const value = document.querySelector(".progress-label strong");
  const bar = document.querySelector(".progress span");
  if (value) value.textContent = `${progress}%`;
  if (bar) bar.style.width = `${progress}%`;
}

function updateSiteRecommendation() {
  const recommendation = document.querySelector("[data-site-recommendation]");
  if (!recommendation) return;
  recommendation.hidden = state.answers[state.briefId]?.site_type !== "Интернет-магазин — сайт для продажи товаров с покупкой онлайн";
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function hasAnswer(id) {
  const value = state.answers[state.briefId]?.[id];
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim?.());
}

function formatAnswer(id) {
  const value = state.answers[state.briefId]?.[id];
  return Array.isArray(value) ? value.join(", ") : value;
}

function makeTextSummary() {
  const current = getCurrentBrief();
  const lines = [`Бриф: ${current.title}`, ""];
  current.sections.forEach((sectionItem) => {
    lines.push(sectionItem.title.toUpperCase());
    sectionItem.fields.forEach((item) => {
      lines.push(`${item.label}: ${hasAnswer(item.id) ? formatAnswer(item.id) : "Нет ответа"}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

function makeSubmissionPayload() {
  const current = getCurrentBrief();
  const answers = state.answers[state.briefId] || {};
  const request = current.id === "performance"
    ? (answers.offer || answers.landing || "")
    : (answers.request || "");

  return {
    submissionId: getSubmissionId(),
    briefId: current.id,
    briefTitle: current.title,
    submittedAt: new Date().toISOString(),
    companyName: answers.company_name || "",
    contactName: answers.contact_name || "",
    contactEmail: answers.contact_email || "",
    contactPhone: answers.contact_phone || "",
    contactSocial: answers.contact_social || "",
    contactMethod: answers.contact_method || "",
    contactValue: answers.contact_value || "",
    request,
    budget: answers.budget || "",
    privacyConsent: answers.privacy_consent === "accepted",
    consentAt: answers.privacy_consent === "accepted" ? new Date().toISOString() : "",
    formStartedAt: state.formStartedAt,
    honeypot: answers.company_site_confirm || "",
    sections: current.sections.map((sectionItem) => ({
      title: sectionItem.title,
      answers: sectionItem.fields.map((item) => ({
        question: item.label,
        answer: hasAnswer(item.id) ? formatAnswer(item.id) : ""
      }))
    })),
    summary: makeTextSummary()
  };
}

function getSubmissionId() {
  if (!state.submissionIds[state.briefId]) {
    state.submissionIds[state.briefId] = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    writeStorage("serenitySubmissionIds", state.submissionIds);
  }
  return state.submissionIds[state.briefId];
}

async function submitBrief() {
  const payload = makeSubmissionPayload();

  if (window.google?.script?.run) {
    return new Promise((resolve, reject) => {
      window.google.script.run
        .withSuccessHandler((result) => result?.ok ? resolve(result) : reject(new Error(result?.message || "Не удалось отправить бриф.")))
        .withFailureHandler(() => reject(new Error("Не удалось отправить бриф. Попробуйте ещё раз.")))
        .saveBrief(payload);
    });
  }

  const endpoint = sessionToken
    ? `/api/session/${sessionToken}/submit`
    : publicConfig.submissionEndpoint;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.ok) {
    throw new Error(result?.message || "Не удалось отправить бриф. Попробуйте ещё раз.");
  }
  if (sessionToken) state.sessionStatus = "submitted";
  return result;
}

function setSaveStatus(text, type = "") {
  if (!saveStatus) return;
  saveStatus.className = `autosave ${type}`.trim();
  saveStatus.innerHTML = `<i></i> ${escapeHtml(text)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("click", async (event) => {
  const briefButton = event.target.closest("[data-brief]");
  const actionButton = event.target.closest("[data-action]");
  const scrollButton = event.target.closest("[data-scroll]");

  if (briefButton) {
    state.briefId = briefButton.dataset.brief;
    state.screen = "brief";
    updateUrl(state.briefId);
    render();
    window.scrollTo({ top: 0 });
  }

  if (scrollButton) {
    document.querySelector(`#${scrollButton.dataset.scroll}`)?.scrollIntoView({ behavior: "smooth" });
  }

  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === "home") {
    saveAnswers();
    state.screen = "home";
    updateUrl();
    render();
    window.scrollTo({ top: 0 });
  }
  if (action === "clear") {
    if (window.confirm("Очистить ответы в этом брифе?")) {
      state.answers[state.briefId] = {};
      delete state.submissionIds[state.briefId];
      writeStorage("serenityBriefAnswers", state.answers);
      writeStorage("serenitySubmissionIds", state.submissionIds);
      state.formStartedAt = Date.now();
      render();
    }
  }
  if (action === "edit") {
    state.screen = "brief";
    setSaveStatus("Черновик сохранён");
    updateUrl(state.briefId);
    render();
  }
  if (action === "copy") {
    try {
      await navigator.clipboard.writeText(makeTextSummary());
      actionButton.textContent = "Скопировано";
    } catch {
      actionButton.textContent = "Не удалось скопировать";
    }
    setTimeout(() => {
      actionButton.textContent = "Скопировать ответы";
    }, 1800);
  }
  if (action === "copy-link" && state.createResult?.url) {
    try {
      await navigator.clipboard.writeText(state.createResult.url);
      actionButton.textContent = "Скопировано";
    } catch {
      actionButton.textContent = "Не удалось скопировать";
    }
    setTimeout(() => { actionButton.textContent = "Скопировать"; }, 1800);
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.closest("#brief-form")) return;
  saveAnswers();
  updateSiteRecommendation();
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "create-form") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const createdBy = formData.get("createdBy") || "";
    state.createManagerName = createdBy;
    state.createSending = true;
    state.createError = "";
    render();
    try {
      const response = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminSecret: adminParam,
          briefId: formData.get("briefId"),
          clientName: formData.get("clientName"),
          createdBy
        })
      });
      const result = await response.json().catch(() => ({}));
      state.createSending = false;
      if (result?.ok) {
        state.createResult = result;
        state.createError = "";
      } else {
        state.createError = result?.message || "Не удалось создать ссылку.";
      }
    } catch {
      state.createSending = false;
      state.createError = "Не удалось создать ссылку. Проверьте соединение.";
    }
    render();
    return;
  }
  if (event.target.id !== "brief-form") return;
  event.preventDefault();
  saveAnswers();
  const requiredChoices = [...event.target.querySelectorAll("[data-required-choice]")];
  const missingChoice = requiredChoices.find((item) => !event.target.querySelector(`[name="${item.name}"]:checked`));
  if (missingChoice) {
    const missingName = missingChoice.name;
    state.error = "Ответьте, пожалуйста, на обязательные вопросы.";
    render();
    const field = document.querySelector(`[name="${missingName}"]`)?.closest(".field");
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.querySelector("input")?.focus({ preventScroll: true });
    return;
  }
  if (!event.target.reportValidity()) return;
  if (state.answers[state.briefId]?.company_site_confirm) return;

  state.sending = true;
  state.error = "";
  render();
  setSaveStatus("Отправляем бриф", "sending");
  try {
    state.submission = await submitBrief();
    state.sending = false;
    state.screen = "result";
    delete state.submissionIds[state.briefId];
    writeStorage("serenitySubmissionIds", state.submissionIds);
    setSaveStatus("Бриф отправлен", "sent");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    state.sending = false;
    state.error = error.message;
    render();
    setSaveStatus("Черновик сохранён", "error");
    document.querySelector(".form-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

function updateUrl(briefId = "") {
  const url = new URL(window.location.href);
  if (briefId) {
    url.searchParams.set("brief", briefId);
  } else {
    url.searchParams.delete("brief");
  }
  window.history.replaceState({}, "", url);
}

async function loadSession() {
  state.screen = "loading";
  render();
  let data = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`/api/session/${sessionToken}`);
      if (response.status === 404) {
        state.screen = "session_error";
        state.sessionError = "Ссылка недействительна или устарела. Обратитесь к менеджеру Serenity.";
        render();
        return;
      }
      data = await response.json().catch(() => null);
      if (data) break;
    } catch {
      if (attempt === 2) {
        state.screen = "session_error";
        state.sessionError = "Не удалось загрузить бриф. Проверьте соединение и обновите страницу.";
        render();
        return;
      }
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  if (!data?.ok) {
    state.screen = "session_error";
    state.sessionError = data?.message || "Не удалось загрузить бриф.";
    render();
    return;
  }
  state.briefId = data.briefId;
  state.answers = data.answers || {};
  state.sessionUpdatedAt = data.updatedAt;
  state.sessionStatus = data.status;
  state.sessionClientName = data.clientName || "";
  state.screen = data.status === "submitted" ? "result" : "brief";
  render();
}

function scheduleSessionSave() {
  setSaveStatus("Сохранение…", "sending");
  clearTimeout(sessionSaveTimer);
  sessionSaveTimer = setTimeout(doSessionSave, 2000);
}

async function doSessionSave() {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`/api/session/${sessionToken}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: state.answers, clientUpdatedAt: state.sessionUpdatedAt })
      });
      if (response.status === 409) {
        setSaveStatus("Данные обновились в другой вкладке. Обновите страницу.", "error");
        return;
      }
      if (response.status === 423) {
        setSaveStatus("Бриф уже отправлен.", "error");
        return;
      }
      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        state.sessionUpdatedAt = result.updatedAt || state.sessionUpdatedAt;
        const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        setSaveStatus(`Сохранено облачно · ${time}`);
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch {
      if (attempt === 2) {
        setSaveStatus("Не удалось сохранить — проверьте соединение", "error");
        return;
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

function renderSessionLoading() {
  app.innerHTML = `
    <section class="result">
      <div class="result-card">
        <div class="result-head">
          <div><h1>Загружаем бриф…</h1></div>
        </div>
      </div>
    </section>
  `;
}

function renderSessionError() {
  app.innerHTML = `
    <section class="result">
      <div class="result-card">
        <div class="result-head">
          <div>
            <h1>Ссылка недействительна</h1>
            <p class="result-copy">${escapeHtml(state.sessionError || "Эта ссылка устарела или не существует. Обратитесь к менеджеру Serenity.")}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCreate() {
  const briefOptions = briefTypes
    .map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.title)}</option>`)
    .join("");
  app.innerHTML = `
    <section class="result">
      <div class="result-card">
        <div class="result-head">
          <div>
            <span class="tag">Менеджер</span>
            <h1>Создать ссылку на бриф</h1>
          </div>
        </div>
        ${state.createResult ? `
          <div style="margin:1.5rem 0;padding:1rem 1.25rem;background:var(--surface-alt,#f5f5f5);border-radius:8px">
            <p style="margin:0 0 .5rem;font-size:.875rem;opacity:.7">Ссылка создана</p>
            <div style="display:flex;gap:.75rem;align-items:center;flex-wrap:wrap">
              <code style="flex:1;word-break:break-all;font-size:.875rem">${escapeHtml(state.createResult.url)}</code>
              <button class="button" type="button" data-action="copy-link">Скопировать</button>
            </div>
          </div>
        ` : ""}
        <form id="create-form">
          <div class="fields">
            <div class="field">
              <label for="create-brief">Тип брифа</label>
              <select id="create-brief" name="briefId" required style="width:100%;padding:.5rem .75rem;font-size:1rem;border:1px solid currentColor;border-radius:6px;opacity:.8">
                <option value="">Выберите бриф</option>
                ${briefOptions}
              </select>
            </div>
            <div class="field">
              <label for="create-client">Компания / клиент <span class="required">*</span></label>
              <input id="create-client" type="text" name="clientName" required>
            </div>
            <div class="field">
              <label for="create-manager">Создал</label>
              <input id="create-manager" type="text" name="createdBy" value="${escapeHtml(state.createManagerName)}">
            </div>
          </div>
          ${state.createError ? `<p class="form-error" role="alert">${escapeHtml(state.createError)}</p>` : ""}
          <div class="form-actions">
            <button class="button" type="submit"${state.createSending ? " disabled" : ""}>
              ${state.createSending ? "Создаём…" : "Создать ссылку →"}
            </button>
          </div>
        </form>
      </div>
    </section>
  `;
}

async function init() {
  if (sessionToken) {
    await loadSession();
  } else {
    render();
  }
}

init();
