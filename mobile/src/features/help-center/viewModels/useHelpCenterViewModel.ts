import { useMemo, useState } from 'react';
import { AppRole } from '../../../navigation/types';
import {
  customerHelpCategories,
  customerHelpFaqs,
  providerHelpCategories,
  providerHelpFaqs,
} from '../../../constants/appContent';

type HelpFaq = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

type HelpFaqView = HelpFaq & {
  iconKind: 'payment' | 'safety' | 'payout' | 'profile' | 'booking' | 'account';
};

function faqIconKind(role: AppRole, category: string): HelpFaqView['iconKind'] {
  if (category === 'Payments & Refunds') {
    return 'payment';
  }
  if (category === 'Safety & Trust') {
    return 'safety';
  }
  if (category === 'Payouts') {
    return 'payout';
  }
  if (category === 'Profile and Services') {
    return 'profile';
  }
  if (category === 'Account') {
    return 'account';
  }
  return role === 'provider' ? 'booking' : 'booking';
}

export function useHelpCenterViewModel({ role }: { role: AppRole }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const data = useMemo(() => {
    const faqs = role === 'provider' ? providerHelpFaqs : customerHelpFaqs;
    const categories = role === 'provider' ? providerHelpCategories : customerHelpCategories;
    const normalizedQuery = query.trim().toLowerCase();
    const filteredFaq = faqs
      .filter((item) => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch =
          !normalizedQuery ||
          item.question.toLowerCase().includes(normalizedQuery) ||
          item.answer.toLowerCase().includes(normalizedQuery);
        return matchesCategory && matchesSearch;
      })
      .map((item) => ({
        ...item,
        iconKind: faqIconKind(role, item.category),
      }));

    return {
      categories,
      filteredFaq,
      query,
      selectedCategory,
      searchPlaceholder: role === 'provider' ? 'Search provider help...' : 'Search help articles...',
      isEmpty: filteredFaq.length === 0,
    };
  }, [query, role, selectedCategory]);

  return {
    data,
    isLoading: false,
    error: null,
    setQuery,
    setSelectedCategory,
  };
}
