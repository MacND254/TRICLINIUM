'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  Camera,
  BellRing,
  DoorClosed,
  ShieldCheck,
  Wifi,
  Zap,
  HelpCircle,
  Banknote,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FAQ {
  id?: string;
  category: string;
  question: string;
  answer: string;
}

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'CCTV & Video Surveillance': Camera,
  'Smart Doorbells & Door Cams': BellRing,
  'Home Alarm Systems': ShieldCheck,
  'Nanny Cams & Indoor Cameras': Camera,
  'Intercoms & Access Control': DoorClosed,
  'Home Networking & Mesh WiFi': Wifi,
  'Perimeter Electric Fencing': Zap,
  'Installation & Warranty': ShieldCheck,
  'Pricing & Quotations': Banknote,
};

export function FaqClient({ faqs }: { faqs: FAQ[] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  // Store open question IDs: e.g. "section-idx"
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'CCTV & Video Surveillance-0': true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Group by category
  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => set.add(f.category || 'General'));
    return Array.from(set);
  }, [faqs]);

  // Filtered faqs
  const filteredFaqs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return faqs.filter((f) => {
      const matchesSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      const matchesCat =
        activeCategory === 'ALL' || f.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [faqs, search, activeCategory]);

  // Group filtered faqs into sections
  const groupedSections = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};
    filteredFaqs.forEach((item) => {
      const cat = item.category || 'General Questions';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredFaqs]);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Search Input & Category Bar */}
      <div className="space-y-4 bg-card p-4 sm:p-6 rounded-2xl border shadow-sm">
        <div className="relative">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by topic, CCTV, alarm, doorbell, warranty, or pricing..."
            className="pl-10 text-sm h-11 rounded-xl"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant={activeCategory === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('ALL')}
            className="text-xs font-semibold rounded-lg shrink-0"
          >
            All Questions ({filteredFaqs.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="text-xs font-semibold rounded-lg shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Sections with Headings */}
      {Object.keys(groupedSections).length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border text-muted-foreground text-sm space-y-2">
          <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">No matching questions found.</p>
          <p className="text-xs">Try a different keyword or contact our security specialists directly.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedSections).map(([categoryName, items]) => {
            const Icon = SECTION_ICONS[categoryName] || HelpCircle;
            return (
              <section key={categoryName} className="space-y-4">
                {/* Section Heading - clean and distinct */}
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {categoryName}
                    </h2>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {items.length} {items.length === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                </div>

                {/* Clean Accordion Items for this Section (NO individual category tag badges!) */}
                <div className="space-y-3">
                  {items.map((item, idx) => {
                    const itemKey = `${categoryName}-${idx}`;
                    const isOpen = !!openItems[itemKey];

                    return (
                      <div
                        key={item.id || itemKey}
                        className="border rounded-xl bg-card overflow-hidden transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(itemKey)}
                          className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50/60 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <span className="pr-4 leading-snug">{item.question}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                              isOpen ? 'rotate-180 text-sky-600' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/30 dark:bg-slate-900/20">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
