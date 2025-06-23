'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ja';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
    en: {
        // Header (keep brand identity unchanged)
        'app.title': '日本 Journey',
        'app.subtitle': 'Discover the beauty of Japan, tailored to your journey',
        
        // Auth
        'auth.signIn': 'Sign In',
        'auth.signOut': 'Sign Out',
        'auth.myTrips': 'My Trips',
        'auth.settings': 'Settings',
        
        // Profile Settings
        'profile.title': 'Profile Settings',
        'profile.subtitle': 'Update your account information',
        'profile.back': 'Back',
        'profile.accountInfo': 'Account Information',
        'profile.name': 'Name',
        'profile.nameePlaceholder': 'Enter your display name',
        'profile.email': 'Email',
        'profile.emailNote': 'Email cannot be changed here. Contact support if needed.',
        'profile.language': 'Interface Language',
        'profile.saveChanges': 'Save Changes',
        'profile.saving': 'Saving...',
        
        // Form
        'form.continue': 'Continue',
        'form.back': 'Back',
        'form.selectRegions': 'Select your regions',
        'form.orderRegions': 'Order your regions',
        'form.travelStyles': 'Travel styles',
        'form.season': 'Season',
        'form.duration': 'Duration',
        'form.step': 'Step',
        'form.of': 'of',
        'form.totalDays': 'Total days',
        'form.daysInEachRegion': 'How many days in each region?',
        'form.stylesSelected': 'styles selected',
        'form.styleSelected': 'style selected',
        
        // Travel Form Steps
        'form.step1.title': 'Which regions of Japan call to you?',
        'form.step1.subtitle': 'Select one or more regions to explore',
        'form.step2.title': 'How do you prefer to travel?',
        'form.step2.subtitle': 'Choose your travel styles',
        'form.step3.title': 'When will you visit Japan?',
        'form.step3.subtitle': 'Select your preferred season',
        'form.step4.title': 'How long is your journey?',
        'form.step4.subtitle': 'Set your trip duration',
        'form.planJourney': 'Plan My Japan Journey',
        'form.planningJourney': 'Planning Your Journey...',
        
        // Journey Ordering Step
        'form.orderStep.title': 'Choose your journey order',
        'form.orderStep.subtitle': 'Which region would you like to visit first?',
        'form.startHere': 'Start here',
        
        // Summary Step
        'form.summary.title': 'Your Japan Journey',
        'form.summary.subtitle': 'Ready to create your perfect itinerary?',
        'form.summary.regionsAndDuration': 'Regions & Duration',
        'form.summary.travelStyles': 'Travel Styles',
        'form.summary.season': 'Season',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.tryAgain': 'Try Again',
        'common.startOver': 'Start Over',
        'common.days': 'days',
        'common.day': 'day',
        'common.confirmStartOver': 'Are you sure you want to start over? This will clear all your selections.',
        
        // Result Page
        'result.craftingExperience': 'Crafting your perfect Japan experience...',
        'result.consideringDetails': 'Considering local culture, seasonal highlights, and your preferences',
        'result.yourJourney': 'Your Japan Journey',
        'result.readyToCreate': 'Ready to create your perfect itinerary?',
        'result.regionsAndDuration': 'Regions & Duration',
        'result.total': 'total',
        'result.reviewJourney': 'Review Journey',
        'result.back': 'Back',
        'result.chooseOrder': 'Choose your journey order',
        'result.whichFirst': 'Which region would you like to visit first?',
        'result.itineraryReady': 'Your Japan Itinerary is Ready!',
        'result.readyToExplore': 'Ready to explore Japan!',
        'result.journeyDetailsLookPerfect': 'Your journey details look perfect',
    },
    ja: {
        // Header (keep brand identity unchanged)
        'app.title': '日本 Journey',
        'app.subtitle': '日本の美しさを発見',
        
        // Auth
        'auth.signIn': 'サインイン',
        'auth.signOut': 'サインアウト',
        'auth.myTrips': 'マイトリップ',
        'auth.settings': '設定',
        
        // Profile Settings
        'profile.title': 'プロフィール設定',
        'profile.subtitle': 'アカウント情報を更新',
        'profile.back': '戻る',
        'profile.accountInfo': 'アカウント情報',
        'profile.name': '名前',
        'profile.nameePlaceholder': '表示名を入力',
        'profile.email': 'メール',
        'profile.emailNote': 'メールはここでは変更できません。必要な場合はサポートにお問い合わせください。',
        'profile.language': 'インターフェース言語',
        'profile.saveChanges': '変更を保存',
        'profile.saving': '保存中...',
        
        // Form
        'form.continue': '続行',
        'form.back': '戻る',
        'form.selectRegions': '地域を選択',
        'form.orderRegions': '地域の順序',
        'form.travelStyles': '旅行スタイル',
        'form.season': '季節',
        'form.duration': '期間',
        'form.step': 'ステップ',
        'form.of': '/全',
        'form.totalDays': '総日数',
        'form.daysInEachRegion': '各地域での滞在日数は？',
        'form.stylesSelected': 'スタイルが選択されました',
        'form.styleSelected': 'スタイルが選択されました',
        
        // Travel Form Steps
        'form.step1.title': '日本のどの地域があなたを呼んでいますか？',
        'form.step1.subtitle': '探索する地域を一つ以上選択してください',
        'form.step2.title': 'どのような旅行スタイルがお好みですか？',
        'form.step2.subtitle': '旅行スタイルを選択してください',
        'form.step3.title': 'いつ日本を訪れますか？',
        'form.step3.subtitle': 'お好みの季節を選択してください',
        'form.step4.title': '旅の期間はどのくらいですか？',
        'form.step4.subtitle': '旅行期間を設定してください',
        'form.planJourney': '日本の旅を計画する',
        'form.planningJourney': '旅を計画中...',
        
        // Journey Ordering Step
        'form.orderStep.title': '旅の順序を選択',
        'form.orderStep.subtitle': 'どの地域を最初に訪れたいですか？',
        'form.startHere': 'ここから開始',
        
        // Summary Step
        'form.summary.title': 'あなたの日本の旅',
        'form.summary.subtitle': '完璧な旅程を作成する準備はできましたか？',
        'form.summary.regionsAndDuration': '地域と期間',
        'form.summary.travelStyles': '旅行スタイル',
        'form.summary.season': '季節',
        
        // Common
        'common.loading': '読み込み中...',
        'common.error': 'エラー',
        'common.tryAgain': 'もう一度試す',
        'common.startOver': '最初からやり直す',
        'common.days': '日',
        'common.day': '日',
        'common.confirmStartOver': '最初からやり直してもよろしいですか？選択内容がすべてクリアされます。',
        
        // Result Page
        'result.craftingExperience': 'あなたの完璧な日本体験を作成中...',
        'result.consideringDetails': '地域文化、季節のハイライト、お客様のご希望を考慮しています',
        'result.yourJourney': 'あなたの日本の旅',
        'result.readyToCreate': '完璧な旅程を作成する準備はできましたか？',
        'result.regionsAndDuration': '地域と期間',
        'result.total': '合計',
        'result.reviewJourney': '旅程確認',
        'result.back': '戻る',
        'result.chooseOrder': '旅の順序を選択',
        'result.whichFirst': 'どの地域を最初に訪れたいですか？',
        'result.itineraryReady': '日本の旅程が完成しました！',
        'result.readyToExplore': '日本を探索する準備ができました！',
        'result.journeyDetailsLookPerfect': '旅の詳細は完璧です',
    }
};

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('en');

    // Load language from localStorage on mount
    useEffect(() => {
        try {
            const savedLanguage = localStorage.getItem('user-language') as Language;
            if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ja')) {
                setLanguageState(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading language from localStorage:', error);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem('user-language', lang);
        } catch (error) {
            console.error('Error saving language to localStorage:', error);
        }
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations['en']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}