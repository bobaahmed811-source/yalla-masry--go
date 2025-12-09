
'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function RoyalDashboard() {
  
  useEffect(() => {
    let currentLang = 'ar';
    let currentPharaonicAlias = "تحتمس القوي";

    const lang: Record<string, Record<string, string>> = {
      ar: {
          title: "لوحة التحكم الملكية", alias_label: "اسمك الفرعوني المستعار:", alias_placeholder: "اكتب اسمك الفرعوني هنا...", alias_button: "تحديث الاسم",
          library_button: "مكتبة الدروس المُتقنة", review_button: "كلمات تحتاج إلى مراجعة", level_label: "المستوى الحالي:", level_name: "تلميذ النيل", metrics_title: "إحصائيات التقدم والموارد",
          words_mastered_label: "كلمات مُتقنة", nile_points_label: "نقاط النيل", streak_days_label: "أيام متواصلة", total_time_label: "إجمالي الوقت (س)",
          challenges_title: "تحدياتك القادمة", current_challenge_title: "القصة المصورة: في السوق", current_challenge_desc: "تدريب على حوارات الشراء والبيع.",
          start_button_text: "ابدأ التحدي التالي", progress_title: "تقدم المستوى", level_progress_text: "متبقي لكاتب البردي",
          leaderboard_title: "لوحة صدارة الأهرامات",
          completed_label: "مُكتمل", locked_label: "مُغلق",
          user_id_label: "User ID:",
          leaderboard_1: "الملكة حتشبسوت", leaderboard_2: "امنحتب الحكيم", leaderboard_4: "نفرتيتي الرشيقة",
          comic_studio_button: "استوديو القصص المصورة",
      },
      en: {
          title: "Royal Control Panel", alias_label: "Your Pharaonic Alias:", alias_placeholder: "Enter your Pharaonic name here...", alias_button: "Update Alias",
          library_button: "Mastered Lessons Library", review_button: "Words Needing Review", level_label: "Current Level:", level_name: "Disciple of the Nile", metrics_title: "Progress & Resources Statistics",
          words_mastered_label: "Words Mastered", nile_points_label: "Nile Points", streak_days_label: "Consecutive Days", total_time_label: "Total Time (h)",
          challenges_title: "Your Upcoming Challenges", current_challenge_title: "Illustrated Story: In the Market", current_challenge_desc: "Dialogue practice for buying and selling.",
          start_button_text: "Start Next Challenge", progress_title: "Level Progress", level_progress_text: "Remaining for Scribe of the Papyrus",
          leaderboard_title: "Pharaohs' Leaderboard",
          completed_label: "Completed", locked_label: "Locked",
          user_id_label: "User ID:",
          leaderboard_1: "Queen Hatshepsut", leaderboard_2: "Amenhotep the Wise", leaderboard_4: "Nefertiti the Graceful",
          comic_studio_button: "Comic Studio",
      },
      fr: {
          title: "Panneau de Contrôle Royal", alias_label: "Votre Alias Pharaonique:", alias_placeholder: "Entrez votre nom pharaonique ici...", alias_button: "Mettre à Jour",
          library_button: "Bibliothèque des Leçons Maîtrisées", review_button: "Mots à Réviser", level_label: "Niveau Actuel:", level_name: "Disciple du Nil", metrics_title: "Statistiques de Progression et Ressources",
          words_mastered_label: "Mots Maîtrisés", nile_points_label: "Points du Nil", streak_days_label: "Jours Consécutifs", total_time_label: "Temps Total (h)",
          challenges_title: "Vos Défis à Venir", current_challenge_title: "Histoire Illustrée: Au Marché", current_challenge_desc: "Pratique de dialogue pour l'achat et la vente.",
          start_button_text: "Commencer le Prochain Défi", progress_title: "Progression du Niveau", level_progress_text: "Restant pour Scribe du Papyrus",
          leaderboard_title: "Classement des Pharaons",
          completed_label: "Terminé", locked_label: "Verrouillé",
          user_id_label: "ID Utilisateur:",
          leaderboard_1: "Reine Hatchepsout", leaderboard_2: "Amenhotep le Sage", leaderboard_4: "Néfertiti la Gracieuse",
          comic_studio_button: "Studio de BD",
      },
      es: { 
          title: "Panel de Control Real", alias_label: "Tu Alias Faraónico:", alias_placeholder: "Introduce tu nombre faraónico aquí...", alias_button: "Actualizar Alias",
          library_button: "Biblioteca de Lecciones Dominadas", review_button: "Palabras a Revisar", level_label: "Nivel Actual:", level_name: "Discípulo del Nilo", metrics_title: "Estadísticas de Progreso y Recursos",
          words_mastered_label: "Palabras Dominadas", nile_points_label: "Puntos del Nilo", streak_days_label: "Días Seguidos", total_time_label: "Tiempo Total (h)",
          challenges_title: "Tus Próximos Desafíos", current_challenge_title: "Historia Ilustrada: En el Mercado", current_challenge_desc: "Práctica de diálogo de compra y venta.",
          start_button_text: "Comenzar Siguiente Desafío", progress_title: "Progreso de Nivel", level_progress_text: "Restante para Escriba del Papiro",
          leaderboard_title: "Clasificación de Faraones",
          completed_label: "Completado", locked_label: "Bloqueado",
          user_id_label: "ID de Usuario:",
          leaderboard_1: "Reina Hatshepsut", leaderboard_2: "Amenhotep el Sabio", leaderboard_4: "Nefertiti la Grácil",
          comic_studio_button: "Estudio de Cómics",
      },
      zh: { 
          title: "皇家控制面板", alias_label: "您的法老别名:", alias_placeholder: "在此输入您的法老名字...", alias_button: "更新别名",
          library_button: "已掌握课程库", review_button: "需要复习的单词", level_label: "当前等级:", level_name: "尼罗河弟子", metrics_title: "进度和资源统计",
          words_mastered_label: "掌握的单词", nile_points_label: "尼罗河点数", streak_days_label: "连续天数", total_time_label: "总时间 (小时)",
          challenges_title: "您的下一个挑战", current_challenge_title: "图文故事：在市场", current_challenge_desc: "买卖对话练习。",
          start_button_text: "开始下一个挑战", progress_title: "等级进度", level_progress_text: "距离莎草纸书记剩余",
          leaderboard_title: "法老排行榜",
          completed_label: "已完成", locked_label: "已锁定",
          user_id_label: "用户 ID:",
          leaderboard_1: "哈特谢普苏特女王", leaderboard_2: "阿蒙霍特普智者", leaderboard_4: "美丽者纳芙蒂蒂",
          comic_studio_button: "漫画工作室",
      },
      it: { 
          title: "Pannello di Controllo Reale", alias_label: "Il Tuo Alias Faraonico:", alias_placeholder: "Inserisci qui il tuo nome faraonico...", alias_button: "Aggiorna Alias",
          library_button: "Libreria Lezioni Padroneggiate", review_button: "Parole da Rivedere", level_label: "Livello Attuale:", level_name: "Discepolo del Nilo", metrics_title: "Statistiche Progressi e Risorse",
          words_mastered_label: "Parole Padroneggiate", nile_points_label: "Punti Nilo", streak_days_label: "Giorni Consecutivi", total_time_label: "Tempo Totale (ore)",
          challenges_title: "Le Tue Prossime Sfide", current_challenge_title: "Storia Illustrata: Al Mercato", current_challenge_desc: "Pratica di dialogo per l'acquisto e la vendita.",
          start_button_text: "Inizia la Prossima Sfida", progress_title: "Progresso Livello", level_progress_text: "Rimanente per Scriba del Papiro",
          leaderboard_title: "Classifica dei Faraoni",
          completed_label: "Completato", locked_label: "Bloccato",
          user_id_label: "ID Utente:",
          leaderboard_1: "Regina Hatshepsut", leaderboard_2: "Amenhotep il Saggio", leaderboard_4: "Nefertiti la Graziosa",
          comic_studio_button: "Studio di Fumetti",
      },
      nl: { 
          title: "Koninklijk Controlepaneel", alias_label: "Uw Faraonische Alias:", alias_placeholder: "Voer hier uw faraonische naam in...", alias_button: "Alias Updaten",
          library_button: "Bibliotheek Beheerste Lessen", review_button: "Te Herhalen Woorden", level_label: "Huidig Niveau:", level_name: "Leerling van de Nijl", metrics_title: "Voortgang & Hulpmiddelen Statistieken",
          words_mastered_label: "Beheerste Woorden", nile_points_label: "Nijl Punten", streak_days_label: "Opeenvolgende Dagen", total_time_label: "Totale Tijd (uur)",
          challenges_title: "Uw Aankomende Uitdagingen", current_challenge_title: "Geïllustreerd Verhaal: Op de Markt", current_challenge_desc: "Dialoog oefening voor kopen en verkopen.",
          start_button_text: "Start Volgende Uitdaging", progress_title: "Niveau Voortgang", level_progress_text: "Resterend voor Papyrusschrijver",
          leaderboard_title: "Farao's Klassement",
          completed_label: "Voltooid", locked_label: "Vergrendeld",
          user_id_label: "Gebruiker ID:",
          leaderboard_1: "Koningin Hatsjepsoet", leaderboard_2: "Amenhotep de Wijze", leaderboard_4: "Nefertiti de Sierlijke",
          comic_studio_button: "Stripstudio",
      },
      de: { 
          title: "Königliches Bedienfeld", alias_label: "Ihr Pharaonischer Alias:", alias_placeholder: "Geben Sie hier Ihren Pharaonischen Namen ein...", alias_button: "Alias Aktualisieren",
          library_button: "Bibliothek der Beherrschten Lektionen", review_button: "Zu Wiederholende Wörter", level_label: "Aktuelles Level:", level_name: "Schüler des Nils", metrics_title: "Fortschritts- & Ressourcenstatistiken",
          words_mastered_label: "Beherrschte Wörter", nile_points_label: "Nil-Punkte", streak_days_label: "Konsekutive Tage", total_time_label: "Gesamtzeit (Std.)",
          challenges_title: "Ihre Bevorstehenden Herausforderungen", current_challenge_title: "Illustrierte Geschichte: Auf dem Markt", current_challenge_desc: "Dialogübung zum Kaufen und Verkaufen.",
          start_button_text: "Nächste Herausforderung starten", progress_title: "Level-Fortschritt", level_progress_text: "Verbleibend für Papyrus-Schreiber",
          leaderboard_title: "Pharaonen-Bestenliste",
          completed_label: "Abgeschlossen", locked_label: "Gesperrt",
          user_id_label: "Benutzer ID:",
          leaderboard_1: "Königin Hatschepsut", leaderboard_2: "Amenhotep der Weise", leaderboard_4: "Nofretete die Anmutige",
          comic_studio_button: "Comic-Studio",
      }
    };
  
    function updateAlias() {
      const aliasInput = document.getElementById('alias-input') as HTMLInputElement;
      const newAlias = aliasInput.value.trim();
      if (newAlias) {
        currentPharaonicAlias = newAlias;
        (document.getElementById('current-user-rank') as HTMLElement).textContent = currentPharaonicAlias;
        setLanguage(currentLang);
        alert(`Alias updated to: ${currentPharaonicAlias}. (Saving to database in real app)`);
      } else {
        alert(currentLang === 'ar' ? 'الرجاء إدخال اسم فرعوني صحيح.' : 'Please enter a valid Pharaonic alias.');
      }
    }
  
    function setLanguage(langCode: string) {
      currentLang = langCode;
      const texts = lang[currentLang];
      const isRtl = currentLang === 'ar';
  
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = currentLang;
  
      const querySelector = (selector: string) => document.querySelector(selector) as HTMLElement;
      const querySelectorAll = (selector: string) => document.querySelectorAll(selector);

      querySelector('#main-title').textContent = texts.title;
      querySelector('#alias-label').textContent = texts.alias_label;
      (querySelector('#alias-input') as HTMLInputElement).placeholder = texts.alias_placeholder;
      querySelector('#update-alias-button').textContent = texts.alias_button;
      querySelector('#current-user-rank').textContent = currentPharaonicAlias;
  
      querySelector('#library-button-text').textContent = texts.library_button;
      querySelector('#review-button-text').textContent = texts.review_button;
      querySelector('#comic-studio-button-text').textContent = texts.comic_studio_button;
  
      const libraryIcon = querySelector('#library-button i');
      if (libraryIcon) libraryIcon.className = `fas fa-archive text-xl ${isRtl ? 'ml-3' : 'mr-3'}`;
      const reviewIcon = querySelector('#review-button i');
      if (reviewIcon) reviewIcon.className = `fas fa-redo-alt text-xl ${isRtl ? 'ml-3' : 'mr-3'}`;
       const comicStudioIcon = querySelector('#comic-studio-button i');
      if (comicStudioIcon) comicStudioIcon.className = `fas fa-paint-brush text-xl ${isRtl ? 'ml-3' : 'mr-3'}`;
      
      const reviewCount = querySelector('#review-count');
      if (reviewCount) {
        reviewCount.classList.toggle('mr-2', isRtl);
        reviewCount.classList.toggle('ml-2', !isRtl);
      }
      
      const levelDisplay = querySelector('#level-display');
      if (levelDisplay) levelDisplay.innerHTML = `${texts.level_label} <span class="text-sand-ochre">${texts.level_name}</span>`;
  
      querySelector('#metrics-title').textContent = texts.metrics_title;
      querySelector('#words-mastered-label').textContent = texts.words_mastered_label;
      querySelector('#nile-points-label').textContent = texts.nile_points_label;
      querySelector('#streak-days-label').textContent = texts.streak_days_label;
      querySelector('#total-time-label').textContent = texts.total_time_label;
      
      querySelector('#challenges-title').textContent = texts.challenges_title;
      querySelector('#current-challenge-title').textContent = texts.current_challenge_title;
      querySelector('#current-challenge-desc').textContent = texts.current_challenge_desc;
  
      querySelector('#start-button-text').textContent = texts.start_button_text;
      querySelector('#progress-title').textContent = texts.progress_title;
      querySelector('#level-progress-text').textContent = texts.level_progress_text;
  
      querySelector('#leaderboard-title').textContent = texts.leaderboard_title;
  
      const leaderboardContainer = querySelector('#leaderboard-title')?.parentNode as HTMLElement;
      if (leaderboardContainer) {
          const leaderboardElements = leaderboardContainer.querySelectorAll('.leaderboard-card > div');
          if (leaderboardElements.length > 3) {
            (leaderboardElements[0].querySelector('span:last-of-type') as HTMLElement).previousElementSibling!.textContent = texts.leaderboard_1;
            (leaderboardElements[1].querySelector('span:last-of-type') as HTMLElement).previousElementSibling!.textContent = texts.leaderboard_2;
            (leaderboardElements[3].querySelector('span:last-of-type') as HTMLElement).previousElementSibling!.textContent = texts.leaderboard_4;
          }
      }
  
      querySelector('#completed-label').textContent = texts.completed_label;
      querySelector('#locked-label').innerHTML = `<i class="fas fa-lock ${isRtl ? 'ml-1' : 'mr-1'}"></i> ${texts.locked_label}`;
      
      const userIdSpan = querySelector('#user-id-display span');
      const userIdText = userIdSpan ? userIdSpan.textContent : 'MOCK-USER-A4B7D9E0F2';
      querySelector('#user-id-display').innerHTML = `<i class="fas fa-user-circle ${isRtl ? 'ml-1' : 'mr-1'}"></i> ${texts.user_id_label} <span>${userIdText}</span>`;
  
      const startButtonIcon = querySelector('#start-challenge-button i');
      if (startButtonIcon) startButtonIcon.className = `fas ${isRtl ? 'fa-chevron-left mr-1' : 'fa-chevron-right ml-1'}`;

      querySelectorAll('#challenges-list .challenge-item').forEach(item => {
        const htmlItem = item as HTMLElement;
        htmlItem.style.textAlign = isRtl ? 'right' : 'left';
        const flexContainer = htmlItem.querySelector('.flex') as HTMLElement;
        if (flexContainer) {
            flexContainer.classList.toggle('flex-row-reverse', !isRtl);
            flexContainer.classList.toggle('flex-row', isRtl);
        }
        const icon = htmlItem.querySelector('i');
        if (icon) {
            icon.classList.toggle('ml-3', isRtl);
            icon.classList.toggle('mr-3', !isRtl);
        }
      });
  
      const aliasInput = querySelector('#alias-input') as HTMLElement;
      if(aliasInput) aliasInput.style.textAlign = isRtl ? 'right' : 'left';
    }

    function handleLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
      setLanguage(e.target.value);
    }
    
    // Make functions available globally for inline event handlers
    // In a real React app, we'd use onClick={...} directly.
    (window as any).setLanguage = setLanguage;
    (window as any).updateAlias = updateAlias;

    // Initial setup
    setLanguage('ar');

    // Attach event listeners
    const updateAliasBtn = document.getElementById('update-alias-button');
    if (updateAliasBtn) updateAliasBtn.addEventListener('click', updateAlias);
    
    const startChallengeBtn = document.getElementById('start-challenge-button');
    if(startChallengeBtn) startChallengeBtn.addEventListener('click', () => alert('Starting next challenge...'));

    const libraryBtn = document.getElementById('library-button');
    if(libraryBtn) libraryBtn.addEventListener('click', () => alert('Accessing Mastered Lessons Library...'));
    
    const reviewBtn = document.getElementById('review-button');
    if(reviewBtn) reviewBtn.addEventListener('click', () => alert('Starting Personal Review Session...'));

    return () => {
      // Cleanup listeners
      if (updateAliasBtn) updateAliasBtn.removeEventListener('click', updateAlias);
      if(startChallengeBtn) startChallengeBtn.removeEventListener('click', () => alert('Starting next challenge...'));
      if(libraryBtn) libraryBtn.removeEventListener('click', () => alert('Accessing Mastered Lessons Library...'));
      if(reviewBtn) reviewBtn.removeEventListener('click', () => alert('Starting Personal Review Session...'));
    };

  }, []);
  
  return (
    <div className="antialiased min-h-screen bg-nile-dark p-6 md:p-12">
        <select id="language-select" onChange={(e) => (window as any).setLanguage(e.target.value)} defaultValue="ar">
            <option value="ar">العربية (AR)</option>
            <option value="en">English (EN)</option>
            <option value="fr">Français (FR)</option>
            <option value="es">Español (ES)</option>
            <option value="zh">中文 (ZH)</option>
            <option value="it">Italiano (IT)</option>
            <option value="nl">Nederlands (NL)</option>
            <option value="de">Deutsch (DE)</option>
        </select>

        <div className="max-w-6xl mx-auto w-full">
            <header className="text-center mb-6 pb-4 border-b-4 border-gold-accent">
                <h1 id="main-title" className="text-5xl md:text-6xl royal-title mb-2">لوحة التحكم الملكية</h1>
                <p id="level-display" className="text-xl text-gray-300 font-bold">
                    المستوى الحالي: <span className="text-sand-ochre">تلميذ النيل</span>
                </p>
                <p id="user-id-display" className="text-sm text-gray-500 mt-2">
                    <i className="fas fa-user-circle ml-1"></i> <span>User ID: MOCK-USER-A4B7D9E0F2</span>
                </p>
            </header>

            <div className="alias-management-card p-4 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
                <label htmlFor="alias-input" id="alias-label" className="text-lg font-bold text-sand-ochre whitespace-nowrap">اسمك الفرعوني المستعار:</label>
                <input type="text" id="alias-input" className="w-full md:w-auto flex-grow focus:ring-2 focus:ring-gold-accent focus:outline-none" placeholder="اكتب اسمك الفرعوني هنا..." defaultValue="تحتمس القوي" />
                <button id="update-alias-button" className="cta-button px-6 py-2 rounded-full w-full md:w-auto">
                    تحديث الاسم
                </button>
            </div>

            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                <button id="library-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center">
                    <i className="fas fa-archive text-xl ml-3"></i> 
                    <span id="library-button-text">مكتبة الدروس المُتقنة</span>
                </button>
                <button id="review-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-red-400 text-red-400">
                    <i className="fas fa-redo-alt text-xl ml-3"></i> 
                    <span id="review-button-text">كلمات تحتاج إلى مراجعة</span>
                    <span id="review-count" className="bg-red-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-full mr-2">12</span>
                </button>
                 <Link href="/comic-studio" id="comic-studio-button" className="utility-button px-6 py-3 text-lg font-bold rounded-full flex items-center justify-center border-amber-400 text-amber-400">
                    <i className="fas fa-paint-brush text-xl ml-3"></i>
                    <span id="comic-studio-button-text">استوديو القصص المصورة</span>
                </Link>
            </div>

            <div className="dashboard-card p-6 md:p-10 rounded-2xl">
                <div id="metrics-title" className="text-2xl royal-title mb-6 text-center">
                    إحصائيات التقدم والموارد
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-book-open text-2xl icon-symbol mb-2"></i>
                        <p id="words-mastered-count" className="text-3xl font-bold text-white">45</p>
                        <p id="words-mastered-label" className="text-sm text-gray-400">كلمات مُتقنة</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-gem text-2xl icon-symbol mb-2"></i>
                        <p id="nile-points-count" className="text-3xl font-bold text-white">1200</p>
                        <p id="nile-points-label" className="text-sm text-gray-400">نقاط النيل</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-calendar-alt text-2xl icon-symbol mb-2"></i>
                        <p id="streak-days-count" className="text-3xl font-bold text-white">7</p>
                        <p id="streak-days-label" className="text-sm text-gray-400">أيام متواصلة</p>
                    </div>
                    <div className="stat-card p-4 rounded-lg text-center">
                        <i className="fas fa-clock text-2xl icon-symbol mb-2"></i>
                        <p id="total-time-count" className="text-3xl font-bold text-white">3.5</p>
                        <p id="total-time-label" className="text-sm text-gray-400">إجمالي الوقت (س)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 id="challenges-title" className="text-2xl royal-title mb-4 text-white pb-2 border-b-2 border-sand-ochre">تحدياتك القادمة</h2>
                        <div id="challenges-list" className="space-y-3">
                            <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white opacity-60">
                                <div className="flex items-center">
                                    <i className="fas fa-check-circle text-lg text-green-400 ml-3"></i>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">تحدي النطق الملكي</p>
                                        <p className="text-sm text-gray-300">صباح الخير، أنا كويس.</p>
                                    </div>
                                </div>
                                <span id="completed-label" className="text-sm text-green-400 font-bold">مُكتمل</span>
                            </div>
                            <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white bg-nile border-gold-accent shadow-xl border-r-4">
                                <div className="flex items-center">
                                    <i className="fas fa-comments text-lg icon-symbol ml-3"></i>
                                    <div className="text-right">
                                        <p id="current-challenge-title" className="font-bold text-lg">القصة المصورة: في السوق</p>
                                        <p id="current-challenge-desc" className="text-sm text-gray-300">تدريب على حوارات الشراء والبيع.</p>
                                    </div>
                                </div>
                                <button id="start-challenge-button" className="cta-button px-4 py-2 text-sm rounded-full flex items-center">
                                    <span id="start-button-text">ابدأ التحدي التالي</span> <i className="fas fa-chevron-left mr-1"></i>
                                </button>
                            </div>
                             <div className="challenge-item p-4 rounded-lg flex items-center justify-between text-white opacity-80">
                                <div className="flex items-center">
                                    <i className="fas fa-lightbulb text-lg icon-symbol ml-3"></i>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">مفردات: الأطعمة والمشروبات</p>
                                        <p className="text-sm text-gray-300">تحدي الذاكرة للمفردات اليومية.</p>
                                    </div>
                                </div>
                                <span id="locked-label" className="text-sm text-sand-ochre font-bold"><i className="fas fa-lock ml-1"></i> مُغلق</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <h2 id="progress-title" className="text-2xl royal-title mb-4 text-white pb-2 border-b-2 border-sand-ochre">تقدم المستوى</h2>
                        <div className="progress-bar-royal mb-6">
                            <div id="progress-fill" className="progress-fill-royal" style={{width: '40%'}}></div>
                        </div>
                        <p id="level-progress-percent" className="text-2xl font-bold text-white text-center mb-1">40%</p>
                        <p id="level-progress-text" className="text-sm text-gray-400 text-center mb-6">متبقي لكاتب البردي</p>
                        
                        <h3 id="leaderboard-title" className="text-xl font-bold text-sand-ochre mb-3 text-center">لوحة صدارة الأهرامات</h3>
                        <div className="leaderboard-card p-4 rounded-lg text-white space-y-3">
                            <div className="flex items-center justify-between font-bold text-lg text-gold-accent">
                                <div className="flex items-center"><i className="fas fa-trophy mr-2 text-xl"></i><span>1. الملكة حتشبسوت</span></div>
                                <span>1500 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg text-gray-300">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">2.</span><span>امنحتب الحكيم</span></div>
                                <span>1350 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-extrabold text-white bg-[#0b4e8d] p-2 rounded-md border-r-4 border-gold-accent">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">3.</span><span id="current-user-rank" className="user-alias">تحتمس القوي</span></div>
                                <span id="current-user-points">1200 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                            <div className="flex items-center justify-between text-lg text-gray-300">
                                <div className="flex items-center"><span className="ml-2 w-5 text-center">4.</span><span>نفرتيتي الرشيقة</span></div>
                                <span>980 <i className="fas fa-gem text-sm ml-1"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
